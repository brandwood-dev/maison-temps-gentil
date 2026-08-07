import { createServerFn } from "@tanstack/react-start";

import type { Product, ProductAttribute } from "@/types/product";
import type { OrderConfirmation, OrderSubmission } from "@/lib/checkout";

type ProductPage = {
  data: Product[];
  page: number;
  pageSize: number;
  total: number;
};

export type PublicBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  active: boolean;
  order: number;
};

type BrandPage = {
  data: PublicBrand[];
  page: number;
  pageSize: number;
  total: number;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  order: number;
  active: boolean;
  productsCount?: number;
};

type CategoryPage = {
  data: PublicCategory[];
  page: number;
  pageSize: number;
  total: number;
};

type AttributePage = {
  data: ProductAttribute[];
  page: number;
  pageSize: number;
  total: number;
};

export type PublicHeroSlide = {
  id: string;
  tagline?: string;
  title: string;
  subtitle?: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  imageUrl: string;
  imageAlt?: string;
  sortOrder: number;
  active: boolean;
};

type HeroPage = { data: PublicHeroSlide[]; page: number; pageSize: number; total: number };

export type PublicPromoMessage = {
  id: string;
  message: string;
  sortOrder: number;
  active: boolean;
};

export type PublicTestimonial = {
  id: string;
  fullName: string;
  message: string;
  governorate: string;
  rating: number;
  productId?: string;
  productTitle?: string;
  productSlug?: string;
  published: boolean;
  sortOrder: number;
};

export type PublicStoreSettings = {
  identity: {
    name: string;
    tagline?: string;
    logoUrl?: string;
    logoLightUrl?: string;
    currency: "TND";
  };
  support: {
    email: string;
    phone: string;
    whatsapp: string;
    address?: string;
  };
  shipping: {
    feeMillimes: number;
    freeShippingEnabled: boolean;
    freeShippingThresholdMillimes?: number;
  };
  cod: { enabled: true };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
  };
  updatedAt: string;
};

type TestimonialPage = {
  data: PublicTestimonial[];
  page: number;
  pageSize: number;
  total: number;
};

type PromoMessagePage = {
  data: PublicPromoMessage[];
  page: number;
  pageSize: number;
  total: number;
};

export type PublicOrderTracking = {
  id: string;
  reference: string;
  createdAt: string;
  status:
    | "new"
    | "to_confirm"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentMethod: "cod";
  currency: "TND";
  shippingLabel: string;
  items: Array<{
    productId: string;
    name: string;
    brand: string;
    reference: string;
    slug: string;
    imageUrl: string | null;
    imageAlt: string;
    quantity: number;
    unitMillimes: number;
    lineMillimes: number;
  }>;
  totals: {
    subtotalMillimes: number;
    shippingMillimes: number;
    totalMillimes: number;
    itemCount: number;
  };
};

const DEFAULT_API_URL = "https://la-maison-des-montres-api.vercel.app";
const PUBLIC_API_TIMEOUT_MS = 8_000;
const PUBLIC_CACHE_TTL_MS = 60_000;
/** Hard upper bound for one public catalogue response. */
export const PUBLIC_PRODUCT_PAGE_SIZE = 48;

type RuntimeEnv = {
  PUBLIC_API_URL?: string;
  API_PREVIEW_BYPASS_SECRET?: string;
};

/**
 * Nitro's Cloudflare module exposes Worker bindings on globalThis.__env__.
 * Keep process.env as the Node/Vercel fallback for local and Vercel SSR.
 */
function getRuntimeEnv(): RuntimeEnv {
  const cloudflareEnv = (globalThis as typeof globalThis & { __env__?: RuntimeEnv }).__env__;
  if (cloudflareEnv && typeof cloudflareEnv === "object") return cloudflareEnv;

  if (typeof process !== "undefined" && process.env) return process.env;
  return {};
}

type PublicCacheEntry = { expiresAt: number; value: unknown };

// Public catalog reads are shared by the root loader and route loaders. Keep
// a very short server-side cache and deduplicate concurrent requests so a
// navigation burst does not fan out into identical API calls.
const publicResponseCache = new Map<string, PublicCacheEntry>();
const publicRequestCache = new Map<string, Promise<unknown>>();

function apiUrl(path: string): string {
  const base = (getRuntimeEnv().PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  return `${base}${path}`;
}

function apiHeaders(): HeadersInit {
  const headers = new Headers({ accept: "application/json" });
  const bypassSecret = getRuntimeEnv().API_PREVIEW_BYPASS_SECRET;
  if (bypassSecret) {
    headers.set("x-vercel-protection-bypass", bypassSecret);
  }
  return headers;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function apiRequest<T>(path: string, options: { allowNotFound?: boolean } = {}): Promise<T> {
  const now = Date.now();
  const cached = publicResponseCache.get(path);
  if (cached && cached.expiresAt > now) return cached.value as T;

  const pending = publicRequestCache.get(path);
  if (pending) return (await pending) as T;

  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PUBLIC_API_TIMEOUT_MS);
    try {
      const response = await fetch(apiUrl(path), {
        headers: apiHeaders(),
        signal: controller.signal,
      });
      if (response.status === 404 && options.allowNotFound) {
        publicResponseCache.set(path, { value: null, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS });
        return null as T;
      }
      if (!response.ok) {
        throw new Error(`Catalogue API indisponible (${response.status})`);
      }
      const value = (await response.json()) as T;
      publicResponseCache.set(path, { value, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS });
      return value;
    } finally {
      clearTimeout(timeout);
    }
  })();

  publicRequestCache.set(path, request);
  try {
    return await request;
  } finally {
    publicRequestCache.delete(path);
  }
}

export const getPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<ProductPage>(
    `/api/v1/public/products?page=1&pageSize=${PUBLIC_PRODUCT_PAGE_SIZE}&sortBy=createdAt&sortOrder=desc`,
  );
  return page.data;
});

/** Public featured-brand data is managed from the Admin catalogue. */
export const getPublicBrands = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<BrandPage>(
    "/api/v1/public/brands?page=1&pageSize=100&sortBy=order&sortOrder=asc",
  );
  return page.data.filter((brand) => brand.active);
});

/** Public categories are resolved server-side so the storefront never talks directly to PostgreSQL. */
export const getPublicCategories = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<CategoryPage>(
    "/api/v1/public/categories?page=1&pageSize=100&sortBy=order&sortOrder=asc",
  );
  return page.data.filter((category) => category.active);
});

/** Public filter definitions; only active attributes marked for storefront filters are returned. */
export const getPublicAttributes = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<AttributePage>(
    "/api/v1/public/attributes?page=1&pageSize=100&sortBy=order&sortOrder=asc",
  );
  return page.data;
});

export const getPublicHeroSlides = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<HeroPage>("/api/v1/public/hero-slides");
  return page.data.filter((slide) => slide.active).slice(0, 5);
});

/** Public announcement messages are managed in the Admin and returned active-only by the API. */
export const getPublicPromoMessages = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<PromoMessagePage>("/api/v1/public/promo-banner-messages");
  return page.data
    .filter((message) => message.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((message) => message.message);
});

/** Curated testimonials are public read-only content; drafts never leave the API. */
export const getPublicTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<TestimonialPage>("/api/v1/public/testimonials");
  return page.data.filter((item) => item.published).slice(0, 12);
});

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequest<PublicStoreSettings>("/api/v1/public/settings");
});

/** Load products for one public category without trusting client-provided prices or status. */
export const getPublicProductsByCategory = createServerFn({ method: "GET" })
  .validator((input: { categoryId: string }) => input)
  .handler(async ({ data }) => {
    const page = await apiRequest<ProductPage>(
      `/api/v1/public/products?page=1&pageSize=${PUBLIC_PRODUCT_PAGE_SIZE}&sortBy=createdAt&sortOrder=desc&categoryId=${encodeURIComponent(data.categoryId)}`,
    );
    return page.data;
  });

export const getPublicProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const slug = encodeURIComponent(data.slug);
    try {
      return await apiRequest<Product | null>(`/api/v1/public/products/${slug}`, {
        allowNotFound: true,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw new Error("La fiche produit met trop de temps à répondre. Veuillez réessayer.");
      }
      throw error;
    }
  });

export const createPublicOrder = createServerFn({ method: "POST" })
  .validator((input: OrderSubmission) => input)
  .handler(async ({ data }) => {
    const headers = new Headers(apiHeaders());
    headers.set("content-type", "application/json");
    headers.set("idempotency-key", data.idempotencyKey);
    const response = await fetch(apiUrl("/api/v1/orders"), {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(body?.message ?? `Commande impossible (${response.status})`);
    }
    return (await response.json()) as OrderConfirmation;
  });

/** Look up one order without exposing address, email or other customer PII. */
export const getPublicOrderTracking = createServerFn({ method: "GET" })
  .validator((input: { reference: string; phone: string }) => input)
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      reference: data.reference.trim(),
      phone: data.phone.trim(),
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(apiUrl(`/api/v1/orders/track?${params.toString()}`), {
        headers: apiHeaders(),
        signal: controller.signal,
      });
      if (response.status === 404) return null;
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Suivi indisponible (${response.status})`);
      }
      return (await response.json()) as PublicOrderTracking;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Le suivi prend trop de temps. Veuillez réessayer.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  });
