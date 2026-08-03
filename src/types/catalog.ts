import type { Product, ProductCategory } from "@/types/product";

/**
 * Frontend catalog contract for La Maison des Montres.
 * Designed to map 1-to-1 to the future NestJS REST endpoint
 * (e.g. GET /api/catalog?category=men&page=1&sort=price-asc).
 * Prices are integer millimes (1 DT = 1000 millimes).
 */

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "newest" | "discount-desc";

export interface CatalogQuery {
  page: number;
  pageSize: number;
  sort: CatalogSort;
  brands: string[];
  dialColors: string[];
  attributes: Record<string, string[]>;
  minPriceMillimes?: number;
  maxPriceMillimes?: number;
  promotionOnly: boolean;
}

export interface CatalogFacetOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogPriceRange {
  minMillimes: number;
  maxMillimes: number;
}

export interface CatalogAttributeFilter {
  id: string;
  code: string;
  label: string;
  type: "select" | "multiselect" | "color" | "boolean" | "text" | "number";
  options: CatalogFacetOption[];
}

export interface CatalogResult {
  items: Product[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableFilters: {
    brands: CatalogFacetOption[];
    dialColors: CatalogFacetOption[];
    attributes: CatalogAttributeFilter[];
    priceRange: CatalogPriceRange | null;
  };
}

export interface CatalogScope {
  fixedCategory?: ProductCategory;
  attributes?: import("@/types/product").ProductAttribute[];
  /**
   * Reserved for the future backend: filters products belonging to a named
   * collection (e.g. "gift-boxes"). Products do not carry collection metadata
   * yet, so a scope that sets this currently yields an empty catalog by design.
   */
  fixedCollection?: string;
  now?: Date;
}
