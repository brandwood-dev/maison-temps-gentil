import type { Product, ProductCategory } from "@/types/product";

/**
 * Pure product resolution helpers — no side effects, no data mutation.
 * Designed to be swapped for `GET /api/products/:slug` from the future
 * NestJS backend without changing consumer components.
 */

/** Exact-match resolution. Returns null when the slug does not exist. */
export function getProductBySlug(products: Product[], slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}

/**
 * Public-facing resolver: same as `getProductBySlug` but rejects `hidden`
 * products. Used by the product detail route so hidden products always 404.
 */
export function getPublicProductBySlug(products: Product[], slug: string): Product | null {
  const product = getProductBySlug(products, slug);
  return product?.availability === "hidden" ? null : product;
}

/**
 * Related products, prioritising the same category, then completing with
 * other available products. Excludes the current product and any `hidden`
 * product. No duplicates, no mutation of inputs.
 */
export function getRelatedProducts(
  products: Product[],
  currentProduct: Product,
  limit = 4,
): Product[] {
  const pool = products.filter((p) => p.id !== currentProduct.id && p.availability !== "hidden");
  const sameCategory = pool.filter((p) => p.category === currentProduct.category);
  const others = pool.filter((p) => p.category !== currentProduct.category);

  const result: Product[] = [];
  const seen = new Set<string>();
  for (const p of [...sameCategory, ...others]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    result.push(p);
    if (result.length >= limit) break;
  }
  return result;
}

/** Map internal category values → real French catalog routes. */
export function getCategoryRoute(category: ProductCategory): string {
  switch (category) {
    case "men":
      return "/montres-homme";
    case "women":
      return "/montres-femme";
    case "children":
      return "/montres-enfant";
    case "couple":
      return "/montres-couple";
    case "connected":
      return "/montres-connectees";
  }
}

/** French display label for a category. */
export function getCategoryLabel(category: ProductCategory): string {
  switch (category) {
    case "men":
      return "Montres homme";
    case "women":
      return "Montres femme";
    case "children":
      return "Montres enfant";
    case "couple":
      return "Montres couple";
    case "connected":
      return "Montres connectées";
  }
}

export type Specification = { key: string; label: string; value: string };

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

/**
 * Build the ordered list of specifications to render.
 * Any missing / null / empty field is omitted — never rendered as "N/A".
 */
export function formatSpecifications(product: Product): Specification[] {
  const rows: Specification[] = [];
  const push = (key: string, label: string, value: string | null | undefined) => {
    if (isFilled(value)) rows.push({ key, label, value: String(value) });
  };

  push("brand", "Marque", product.brand);
  push("reference", "Référence", product.reference);
  push("category", "Catégorie", getCategoryLabel(product.category));
  for (const attribute of product.attributes ?? []) {
    const value = attribute.values.map((item) => item.label).join(", ");
    push(`attribute:${attribute.id}`, attribute.label, value);
  }
  push("movementType", "Mouvement", product.movementType);
  push("displayType", "Affichage", product.displayType);
  if (typeof product.diameterMm === "number" && Number.isFinite(product.diameterMm)) {
    rows.push({ key: "diameterMm", label: "Diamètre", value: `${product.diameterMm} mm` });
  }
  push("dialColor", "Couleur du cadran", product.dialColor?.label ?? null);
  push("braceletMaterial", "Matière du bracelet", product.braceletMaterial);
  push("braceletColor", "Couleur du bracelet", product.braceletColor);
  push("glassType", "Verre", product.glassType);
  push("waterResistance", "Étanchéité", product.waterResistance);
  if (typeof product.warrantyMonths === "number" && product.warrantyMonths > 0) {
    rows.push({
      key: "warrantyMonths",
      label: "Garantie",
      value: `${product.warrantyMonths} mois`,
    });
  }
  if (product.giftBoxIncluded) {
    rows.push({ key: "giftBoxIncluded", label: "Coffret cadeau", value: "Inclus" });
  }
  return rows;
}

/**
 * Schema.org price formatter — always 3 decimal digits, dot separator.
 * Never rounds to the whole dinar. Input is millimes (1 TND = 1000 millimes).
 * Examples:
 *   450000 → "450.000"
 *   450500 → "450.500"
 */
export function formatSchemaPriceTND(millimes: number): string {
  return (millimes / 1000).toFixed(3);
}
