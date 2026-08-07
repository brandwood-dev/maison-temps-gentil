import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const DEFAULT_API_URL = "https://la-maison-des-montres-api.vercel.app";
const SITEMAP_PATH = "/sitemap.xml";

type RuntimeEnv = { PUBLIC_API_URL?: string };

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
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
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
