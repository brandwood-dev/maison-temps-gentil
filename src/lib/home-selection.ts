import type { Product } from "@/types/product";

const DEFAULT_LIMIT = 8;
const MAX_PER_BRAND = 2;
const MAX_PER_CATEGORY = 3;

/**
 * Returns a deterministic daily rotation for the homepage selection.
 *
 * The seed is deliberately supplied by the root loader so SSR and the first
 * client render see the same cards. Using a deterministic hash keeps the
 * selection stable during a day (and cache-friendly) while changing it on the
 * next rotation key.
 */
export function getRotatingHomeSelection(
  products: readonly Product[],
  rotationKey: string,
  limit = DEFAULT_LIMIT,
): Product[] {
  if (limit <= 0) return [];

  const candidates = products.filter(
    (product) =>
      product.availability === "available" &&
      product.images.some((image) => Boolean(image.url || image.optimizedUrl)),
  );
  const ranked = candidates
    .map((product) => ({
      product,
      rank: stableHash(`${rotationKey}:${product.id}`),
    }))
    .sort((a, b) => a.rank - b.rank || a.product.id.localeCompare(b.product.id));

  const selected: Product[] = [];
  const brandCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  // First pass favours one product per category/brand whenever the catalogue
  // is large enough. The second pass fills the remaining slots with the same
  // deterministic order while respecting reasonable repetition caps.
  const selectedIds = new Set<string>();
  for (const strictPass of [true, false]) {
    for (const { product } of ranked) {
      if (selected.length >= limit) break;
      if (selectedIds.has(product.id)) continue;
      const brandCount = brandCounts.get(product.brand) ?? 0;
      const categoryCount = categoryCounts.get(product.category) ?? 0;
      if (brandCount >= MAX_PER_BRAND || categoryCount >= MAX_PER_CATEGORY) continue;
      if (strictPass && (brandCount > 0 || categoryCount > 0)) continue;

      selected.push(product);
      selectedIds.add(product.id);
      brandCounts.set(product.brand, brandCount + 1);
      categoryCounts.set(product.category, categoryCount + 1);
    }
  }

  return selected;
}

/** Format a stable rotation key in the shop's Tunisia timezone. */
export function getHomeRotationKey(timestamp: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
