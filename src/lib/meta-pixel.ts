import { getCurrentPriceMillimes } from "@/lib/product-pricing";
import type { OrderConfirmation } from "@/lib/checkout";
import type { Product } from "@/types/product";

export const META_PIXEL_ID = "1659246991836575";

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

function track(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string,
): void {
  if (typeof window === "undefined") return;
  initMetaPixel();
  const fbq = getFbq();
  if (!fbq) return;

  if (eventId) {
    fbq("track", eventName, params, { eventID: eventId });
  } else {
    fbq("track", eventName, params);
  }
}

export function trackPageView(pageKey?: string): void {
  if (typeof window === "undefined") return;
  if (pageKey && window.__lmmMetaPixelLastPageView === pageKey) return;
  track("PageView");
  if (pageKey) window.__lmmMetaPixelLastPageView = pageKey;
}

export function trackViewContent(product: Product): void {
  track("ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: getCurrentPriceMillimes(product) / 1000,
    currency: "TND",
  });
}

export function trackAddToCart(product: Product, quantity: number): void {
  if (quantity <= 0) return;
  track("AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: (getCurrentPriceMillimes(product) * quantity) / 1000,
    currency: "TND",
    quantity,
  });
}

export function trackInitiateCheckout(
  totalMillimes: number,
  items: Array<{ productId: string; quantity: number }>,
): void {
  track("InitiateCheckout", {
    content_ids: items.map((item) => item.productId),
    contents: items.map((item) => ({ id: item.productId, quantity: item.quantity })),
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
    },
    order.reference,
  );
  markPurchaseTracked(order.reference);
}
