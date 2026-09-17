import { getCurrentPriceMillimes } from "@/lib/product-pricing";
import type { OrderConfirmation } from "@/lib/checkout";
import type { Product } from "@/types/product";

export const META_PIXEL_ID = "1659246991836575";
const META_API_URL = "https://la-maison-des-montres-api.onrender.com";
const META_RELAYABLE_EVENTS = new Set(["PageView", "ViewContent", "AddToCart", "InitiateCheckout"]);
const META_SITE_HOSTS = new Set(["lamaisondesmontres.com", "www.lamaisondesmontres.com"]);

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: FbqFunction;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __lmmMetaPixelInitialized?: boolean;
    __lmmMetaPixelLastPageView?: string;
  }
}

const trackedPurchases = new Set<string>();

function getFbq(): FbqFunction | null {
  if (typeof window === "undefined") return null;

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        (fbq.queue ??= []).push(args);
      }
    }) as FbqFunction;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  return window.fbq;
}

/**
 * Initializes Meta Pixel only in the browser. The queue stub makes events
 * safe to send before the remote script has finished loading.
 */
export function initMetaPixel(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  persistFbcFromFbclid();

  const fbq = getFbq();
  if (!fbq) return;

  if (!window.__lmmMetaPixelInitialized) {
    fbq("init", META_PIXEL_ID);
    window.__lmmMetaPixelInitialized = true;
  }

  if (!document.getElementById("lmm-meta-pixel-script")) {
    const script = document.createElement("script");
    script.id = "lmm-meta-pixel-script";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
}

/**
 * Meta normally creates `_fbc` itself after a click-id is present in the URL.
 * Persisting the value first-party makes attribution resilient when the user
 * navigates before the Pixel script has finished loading or when consent/CDN
 * timing delays the cookie write.
 */
function persistFbcFromFbclid(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (readCookie("_fbc")) return;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid")?.trim();
  if (!fbclid || fbclid.length > 200) return;
  document.cookie = `_fbc=${encodeURIComponent(
    `fb.1.${Math.floor(Date.now() / 1_000)}.${fbclid}`,
  )}; Max-Age=7776000; Path=/; SameSite=Lax`;
}

function track(eventName: string, params: Record<string, unknown> = {}, eventId?: string): void {
  if (typeof window === "undefined") return;
  initMetaPixel();
  const fbq = getFbq();
  if (!fbq) return;

  const resolvedEventId = eventId ?? createEventId(eventName);
  // Every browser event receives an eventID. For non-purchase events the same
  // ID is relayed server-side to Meta CAPI, which prevents double counting.
  fbq("track", eventName, params, { eventID: resolvedEventId });
  if (eventName !== "Purchase") {
    void relayToConversionsApi(eventName, resolvedEventId, params);
  }
}

function createEventId(eventName: string): string {
  const random = globalThis.crypto?.randomUUID?.();
  return `lmm-${eventName.toLowerCase()}-${random ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Relays browser events through the backend. The Meta access token remains
 * server-only; failures are intentionally ignored so analytics never blocks
 * navigation, cart actions, or checkout.
 */
async function relayToConversionsApi(
  eventName: string,
  eventId: string,
  params: Record<string, unknown>,
): Promise<void> {
  // Never send staging, preview, localhost, or an untrusted host to the
  // production Conversions API. Browser Pixel tracking remains available on
  // those environments for local QA without polluting production analytics.
  if (
    typeof window === "undefined" ||
    !META_RELAYABLE_EVENTS.has(eventName) ||
    !META_SITE_HOSTS.has(window.location.hostname)
  ) {
    return;
  }

  const contentIds = Array.isArray(params.content_ids)
    ? params.content_ids.filter((value): value is string => typeof value === "string")
    : undefined;
  const rawContents = Array.isArray(params.contents) ? params.contents : undefined;
  const contents = rawContents
    ?.map((content) => {
      if (!content || typeof content !== "object") return null;
      const item = content as { id?: unknown; quantity?: unknown; item_price?: unknown };
      if (typeof item.id !== "string" || typeof item.quantity !== "number") return null;
      return {
        id: item.id,
        quantity: item.quantity,
        ...(typeof item.item_price === "number" ? { itemPrice: item.item_price } : {}),
      };
    })
    .filter(
      (value): value is { id: string; quantity: number; itemPrice?: number } => value !== null,
    );

  const body = {
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    ...(typeof params.content_name === "string" ? { contentName: params.content_name } : {}),
    ...(typeof params.content_type === "string" ? { contentType: params.content_type } : {}),
    ...(contentIds?.length ? { contentIds } : {}),
    ...(contents?.length ? { contents } : {}),
    ...(typeof params.value === "number" ? { value: params.value } : {}),
    ...(params.currency === "TND" ? { currency: "TND" as const } : {}),
    ...(typeof params.num_items === "number" ? { numItems: params.num_items } : {}),
    ...(readCookie("_fbp") ? { fbp: readCookie("_fbp") } : {}),
    ...(readCookie("_fbc") ? { fbc: readCookie("_fbc") } : {}),
  };

  try {
    await fetch(`${META_API_URL}/api/v1/meta/events`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
      keepalive: true,
    });
  } catch {
    // CAPI is an enhancement over the browser Pixel and must stay fail-open.
  }
}

/** The Meta catalog feed uses the stable product UUID as its item id. */
function metaCatalogId(product: Pick<Product, "id">): string {
  return product.id;
}

export function trackPageView(pageKey?: string): void {
  if (typeof window === "undefined") return;
  if (pageKey && window.__lmmMetaPixelLastPageView === pageKey) return;
  track("PageView");
  if (pageKey) window.__lmmMetaPixelLastPageView = pageKey;
}

export function trackViewContent(product: Product): void {
  track("ViewContent", {
    content_ids: [metaCatalogId(product)],
    content_name: product.name,
    content_type: "product",
    value: getCurrentPriceMillimes(product) / 1000,
    currency: "TND",
  });
}

export function trackAddToCart(product: Product, quantity: number): void {
  if (quantity <= 0) return;
  track("AddToCart", {
    content_ids: [metaCatalogId(product)],
    content_name: product.name,
    content_type: "product",
    value: (getCurrentPriceMillimes(product) * quantity) / 1000,
    currency: "TND",
    quantity,
  });
}

export function trackInitiateCheckout(
  totalMillimes: number,
  items: Array<{ productId: string; quantity: number; catalogId?: string }>,
): void {
  const catalogIds = items.map((item) => item.catalogId ?? item.productId);
  track("InitiateCheckout", {
    content_ids: catalogIds,
    contents: items.map((item, index) => ({ id: catalogIds[index], quantity: item.quantity })),
    content_type: "product",
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value: totalMillimes / 1000,
    currency: "TND",
  });
}

function purchaseWasTracked(reference: string): boolean {
  if (trackedPurchases.has(reference)) return true;
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(`lmm:meta-pixel:purchase:${reference}`) === "1";
  } catch {
    return false;
  }
}

function markPurchaseTracked(reference: string): void {
  trackedPurchases.add(reference);
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`lmm:meta-pixel:purchase:${reference}`, "1");
  } catch {
    /* Ignore storage restrictions; the in-memory guard still applies. */
  }
}

/** Sends Purchase once per order reference, even if the confirmation is refreshed. */
export function trackPurchase(order: OrderConfirmation): void {
  if (typeof window === "undefined" || !order.reference || purchaseWasTracked(order.reference)) {
    return;
  }

  const items = order.items ?? [];
  track(
    "Purchase",
    {
      content_ids: items.map((item) => item.productId),
      contents: items.map((item) => ({ id: item.productId, quantity: item.quantity })),
      content_type: "product",
      num_items: order.totals.itemCount,
      value: order.totals.totalMillimes / 1000,
      currency: "TND",
      order_id: order.reference,
    },
    order.reference,
  );
  markPurchaseTracked(order.reference);
}
