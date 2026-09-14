import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const DEFAULT_API_URL = "https://la-maison-des-montres-api.vercel.app";
const SITEMAP_PATH = "/sitemap.xml";

type RuntimeEnv = { PUBLIC_API_URL?: string; PUBLIC_API_PROXY_URL?: string };
type ScheduledExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};
type EdgeCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function withPublicHtmlCache(request: Request, response: Response): Response {
  if (request.method !== "GET" || response.status !== 200) return response;
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;
  if (response.headers.has("set-cookie")) return response;

  const path = new URL(request.url).pathname;
  const privatePaths = [
    "/panier",
    "/commande",
    "/favoris",
    "/commande/confirmation",
    "/suivi-commande",
  ];
  if (
    privatePaths.some((privatePath) => path === privatePath || path.startsWith(`${privatePath}/`))
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=120");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function getRuntimeEnv(env: unknown): RuntimeEnv {
  if (env && typeof env === "object") return env as RuntimeEnv;
  const cloudflareEnv = (globalThis as typeof globalThis & { __env__?: RuntimeEnv }).__env__;
  return cloudflareEnv ?? {};
}

const PUBLIC_API_PATH_PREFIX = "/api/v1/public/";

/**
 * Proxy only public catalogue reads through the storefront Worker so the
 * Cloudflare edge cache can absorb repeated SSR navigations. Private API
 * calls (orders, admin, tracking) continue to use the Render origin.
 */
async function proxyPublicApi(
  request: Request,
  env: unknown,
): Promise<Response | null> {
  if (request.method !== "GET") return null;

  const requestUrl = new URL(request.url);
  if (!requestUrl.pathname.startsWith(PUBLIC_API_PATH_PREFIX)) return null;

  const runtime = getRuntimeEnv(env);
  if (!runtime.PUBLIC_API_PROXY_URL) return null;

  const cache =
    typeof caches === "undefined"
      ? null
      : ((caches as unknown as { default?: EdgeCache }).default ?? null);
  const cacheKey = new Request(requestUrl.toString(), { method: "GET" });
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("X-Storefront-API-Cache", "HIT");
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      });
    }
  }

  const upstreamBase = (runtime.PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  const upstreamUrl = `${upstreamBase}${requestUrl.pathname}${requestUrl.search}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { accept: "application/json", "cache-control": "no-cache" },
      signal: controller.signal,
    });
    const headers = new Headers(upstream.headers);
    headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    headers.set("CDN-Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    headers.set("X-Storefront-API-Cache", "MISS");
    const response = new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });

    if (cache && response.status === 200) {
      try {
        await cache.put(cacheKey, response.clone());
      } catch (error: unknown) {
        console.warn(
          `API edge cache write failed: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
    }
    return response;
  } catch (error) {
    console.warn(`Public API proxy failed: ${error instanceof Error ? error.message : "request failed"}`);
    return new Response(JSON.stringify({ message: "Catalogue API indisponible" }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Keep the free Render API instance warm with a real database-backed request.
 * The cron runs from this already-deployed Worker, so no paid monitoring
 * service or secret is required. Only the public settings payload is touched.
 */
async function warmProductionApi(env: unknown): Promise<void> {
  const baseUrl = (getRuntimeEnv(env).PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch(`${baseUrl}/api/v1/public/settings`, {
      headers: {
        accept: "application/json",
        "cache-control": "no-cache",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(`API warm-up returned ${response.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "request failed";
    console.warn(`API warm-up failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

function xmlEscape(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ??
      character,
  );
}

async function renderSitemap(env: unknown): Promise<Response> {
  const baseUrl = (getRuntimeEnv(env).PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  const productUrls: string[] = [];
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/public/products?page=1&pageSize=48&sortBy=createdAt&sortOrder=desc`,
      { headers: { accept: "application/json" } },
    );
    if (response.ok) {
      const payload = (await response.json()) as { data?: Array<{ slug?: string }> };
      for (const product of payload.data ?? []) {
        if (product.slug)
          productUrls.push(`https://lamaisondesmontres.com/montres/${product.slug}`);
      }
    }
  } catch {
    // Keep the sitemap useful for crawlers even if the catalogue API is briefly unavailable.
  }

  const staticPaths = [
    "/",
    "/montres",
    "/promotions",
    "/marques",
    "/montres-homme",
    "/montres-femme",
    "/montres-enfant",
    "/montres-connectees",
    "/montres-couple",
    "/collections/coffrets-cadeaux",
    "/contact",
    "/faq",
    "/livraison-retours",
    "/garantie",
    "/mentions-legales",
    "/politique-confidentialite",
    "/politique-cookies",
    "/conditions-generales-vente",
  ];
  const urls = [
    ...staticPaths.map((path) => `https://lamaisondesmontres.com${path}`),
    ...productUrls,
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map((url) => `<url><loc>${xmlEscape(url)}</loc></url>`)
    .join("")}\n</urlset>`;
  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

export default {
  scheduled(_controller: unknown, env: unknown, ctx: ScheduledExecutionContext) {
    ctx.waitUntil(warmProductionApi(env));
  },

  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Make Worker bindings available to server functions executed by
      // TanStack Start during SSR (catalog-api reads this global).
      if (env && typeof env === "object") {
        (globalThis as typeof globalThis & { __env__?: RuntimeEnv }).__env__ =
          env as RuntimeEnv;
      }
      const proxiedApiResponse = await proxyPublicApi(request, env);
      if (proxiedApiResponse) return proxiedApiResponse;
      if (new URL(request.url).pathname === SITEMAP_PATH && request.method === "GET") {
        return await renderSitemap(env);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withPublicHtmlCache(request, normalized);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
