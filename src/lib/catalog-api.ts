import { createServerFn } from "@tanstack/react-start";

import type { Product, ProductAttribute } from "@/types/product";
import type { OrderConfirmation, OrderSubmission } from "@/lib/checkout";

type ProductPage = {
  data: Product[];
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

const DEFAULT_API_URL = "https://la-maison-des-montres-api.vercel.app";

function apiUrl(path: string): string {
  const base = (process.env.PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  return `${base}${path}`;
}

function apiHeaders(): HeadersInit {
  const headers = new Headers({ accept: "application/json" });
  const bypassSecret = process.env.API_PREVIEW_BYPASS_SECRET;
  if (bypassSecret) {
    headers.set("x-vercel-protection-bypass", bypassSecret);
  }
  return headers;
}

async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: apiHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Catalogue API indisponible (${response.status})`);
  }
  return (await response.json()) as T;
}

export const getPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const page = await apiRequest<ProductPage>(
    "/api/v1/public/products?page=1&pageSize=100&sortBy=createdAt&sortOrder=desc",
  );
  return page.data;
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

/** Load products for one public category without trusting client-provided prices or status. */
export const getPublicProductsByCategory = createServerFn({ method: "GET" })
  .validator((input: { categoryId: string }) => input)
  .handler(async ({ data }) => {
    const page = await apiRequest<ProductPage>(
      `/api/v1/public/products?page=1&pageSize=100&sortBy=createdAt&sortOrder=desc&categoryId=${encodeURIComponent(data.categoryId)}`,
    );
    return page.data;
  });

export const getPublicProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const slug = encodeURIComponent(data.slug);
    const response = await fetch(apiUrl(`/api/v1/public/products/${slug}`), {
      headers: apiHeaders(),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Catalogue API indisponible (${response.status})`);
    }
    return (await response.json()) as Product;
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
