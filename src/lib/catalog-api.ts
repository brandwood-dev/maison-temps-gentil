import { createServerFn } from "@tanstack/react-start";

import type { Product } from "@/types/product";

type ProductPage = {
  data: Product[];
  page: number;
  pageSize: number;
  total: number;
};

const DEFAULT_API_URL = "https://la-maison-des-montres-api.vercel.app";

function apiUrl(path: string): string {
  const base = (process.env.PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  return `${base}${path}`;
}

async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: { accept: "application/json" },
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

export const getPublicProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const slug = encodeURIComponent(data.slug);
    const response = await fetch(apiUrl(`/api/v1/public/products/${slug}`), {
      headers: { accept: "application/json" },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Catalogue API indisponible (${response.status})`);
    }
    return (await response.json()) as Product;
  });
