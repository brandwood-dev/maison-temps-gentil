import type { Product } from "@/types/product";
import type {
  CatalogFacetOption,
  CatalogQuery,
  CatalogResult,
  CatalogScope,
  CatalogSort,
} from "@/types/catalog";
import { isPromotionActive } from "@/lib/product-pricing";

export const CATALOG_PAGE_SIZE = 12;

export const CATALOG_SORT_VALUES: readonly CatalogSort[] = [
  "featured",
  "price-asc",
  "price-desc",
  "newest",
  "discount-desc",
] as const;

/** Sort options exposed in the UI. `newest` is intentionally hidden until the
 *  backend provides a real creation timestamp. */
export const CATALOG_SORT_UI_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "featured", label: "Sélection" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "discount-desc", label: "Meilleures réductions" },
];

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  page: 1,
  pageSize: CATALOG_PAGE_SIZE,
  sort: "featured",
  brands: [],
  dialColors: [],
  attributes: {},
  minPriceMillimes: undefined,
  maxPriceMillimes: undefined,
  promotionOnly: false,
};

function effectivePriceMillimes(p: Product, now: Date): number {
  return isPromotionActive(p.promotion, now)
    ? p.promotion!.salePriceMillimes
    : p.regularPriceMillimes;
}

function discountRatio(p: Product, now: Date): number {
  if (!isPromotionActive(p.promotion, now)) return -1;
  const promo = p.promotion!;
  return (promo.regularPriceMillimes - promo.salePriceMillimes) / promo.regularPriceMillimes;
}

/**
 * Pure function — never mutates its inputs. Applies the fixed scope
 * (category/collection), user filters, sort and pagination in one pass and
 * returns the paginated slice plus facet counts.
 */
export function getCatalogResult(
  products: Product[],
  query: CatalogQuery,
  scope: CatalogScope = {},
): CatalogResult {
  const now = scope.now ?? new Date();

  // Base scope: hide unavailable-hidden products and apply fixed category/collection.
  let scoped = products.filter((p) => p.availability !== "hidden");
  if (scope.fixedCategory) {
    scoped = scoped.filter((p) => p.category === scope.fixedCategory);
  }
  if (scope.fixedCollection) {
    // Products do not carry a `collections` field yet — future backend will
    // populate it; today this yields an empty scope, matching the spec.
    const collection = scope.fixedCollection;
    scoped = scoped.filter((p) => {
      const collections = (p as Product & { collections?: string[] }).collections;
      return Array.isArray(collections) && collections.includes(collection);
    });
  }

  // Predicate builder used for both filtering and facet-count computation.
  const matches = (
    p: Product,
    opts: {
      ignoreBrand?: boolean;
      ignoreColor?: boolean;
      ignoreAttribute?: string;
      ignorePromotion?: boolean;
    } = {},
  ): boolean => {
    if (!opts.ignoreBrand && query.brands.length && !query.brands.includes(p.brand)) return false;
    if (
      !opts.ignoreColor &&
      query.dialColors.length &&
      !(p.dialColor && query.dialColors.includes(p.dialColor.label))
    )
      return false;
    for (const [code, selected] of Object.entries(query.attributes)) {
      if (selected.length === 0 || opts.ignoreAttribute === code) continue;
      const productAttribute = p.attributes?.find((attribute) => attribute.code === code);
      if (
        !productAttribute ||
        !productAttribute.values.some((value) => selected.includes(value.id))
      ) {
        return false;
      }
    }
    const eff = effectivePriceMillimes(p, now);
    if (query.minPriceMillimes != null && eff < query.minPriceMillimes) return false;
    if (query.maxPriceMillimes != null && eff > query.maxPriceMillimes) return false;
    if (!opts.ignorePromotion && query.promotionOnly && !isPromotionActive(p.promotion, now))
      return false;
    return true;
  };

  const filtered = scoped.filter((p) => matches(p));

  // Sort — never mutate `filtered`.
  const sorted = filtered.slice().sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return effectivePriceMillimes(a, now) - effectivePriceMillimes(b, now);
      case "price-desc":
        return effectivePriceMillimes(b, now) - effectivePriceMillimes(a, now);
      case "discount-desc":
        return discountRatio(b, now) - discountRatio(a, now);
      case "newest":
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      case "featured":
      default:
        return 0;
    }
  });

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));
  const page = Math.max(1, Math.min(query.page, totalPages));
  const start = (page - 1) * query.pageSize;
  const items = sorted.slice(start, start + query.pageSize);

  // Facets — always computed on the fixed scope, not on `filtered`.
  const uniqueBrands = Array.from(new Set([...scoped.map((p) => p.brand), ...query.brands])).sort(
    (a, b) => a.localeCompare(b, "fr"),
  );
  const brands: CatalogFacetOption[] = uniqueBrands
    .map((brand) => ({
      value: brand,
      label: brand,
      count: scoped.filter((p) => p.brand === brand && matches(p, { ignoreBrand: true })).length,
    }))
    .filter((option) => option.count > 0 || query.brands.includes(option.value));

  const uniqueColors = Array.from(
    new Set([
      ...scoped.map((p) => p.dialColor?.label).filter((x): x is string => Boolean(x)),
      ...query.dialColors,
    ]),
  ).sort((a, b) => a.localeCompare(b, "fr"));
  const dialColors: CatalogFacetOption[] = uniqueColors
    .map((label) => ({
      value: label,
      label,
      count: scoped.filter((p) => p.dialColor?.label === label && matches(p, { ignoreColor: true }))
        .length,
    }))
    .filter((option) => option.count > 0 || query.dialColors.includes(option.value));

  const attributes = (scope.attributes ?? [])
    .filter((attribute) => attribute.visibleInFilters !== false && attribute.values.length > 0)
    .map((attribute) => {
      const selected = query.attributes[attribute.code] ?? [];
      return {
        id: attribute.id,
        code: attribute.code,
        label: attribute.label,
        type: attribute.type,
        options: attribute.values
          .map((value) => ({
            value: value.id,
            label: value.label,
            count: scoped.filter((product) => {
              const assigned = product.attributes?.find((item) => item.code === attribute.code);
              return Boolean(
                assigned?.values.some((assignedValue) => assignedValue.id === value.id) &&
                matches(product, { ignoreAttribute: attribute.code }),
              );
            }).length,
          }))
          .filter((option) => option.count > 0 || selected.includes(option.value)),
      };
    })
    .filter((attribute) => attribute.options.length > 0);

  const promotionCount = scoped.filter(
    (product) =>
      isPromotionActive(product.promotion, now) && matches(product, { ignorePromotion: true }),
  ).length;

  let priceRange: CatalogResult["availableFilters"]["priceRange"] = null;
  if (scoped.length > 0) {
    let min = Infinity;
    let max = -Infinity;
    for (const p of scoped) {
      const eff = effectivePriceMillimes(p, now);
      if (eff < min) min = eff;
      if (eff > max) max = eff;
    }
    if (Number.isFinite(min) && Number.isFinite(max)) {
      priceRange = { minMillimes: min, maxMillimes: max };
    }
  }

  return {
    items,
    totalItems,
    page,
    pageSize: query.pageSize,
    totalPages,
    availableFilters: { brands, dialColors, attributes, priceRange, promotionCount },
  };
}

// -------- URL <-> query serialization --------

const SORT_SET = new Set<CatalogSort>(CATALOG_SORT_VALUES);

function toPositiveInt(v: unknown): number | undefined {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string" && v.trim() !== ""
        ? Number.parseInt(v, 10)
        : NaN;
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.floor(n);
}

function toList(v: unknown): string[] {
  if (Array.isArray(v))
    return v
      .map((x) => String(x).trim())
      .filter(Boolean)
      .slice(0, 32);
  if (typeof v === "string" && v.trim() !== "")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 32);
  return [];
}

function toAttributeFilters(raw: Record<string, unknown>): Record<string, string[]> {
  const attributes: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith("attr_")) continue;
    const code = key.slice(5);
    if (!code) continue;
    const values = toList(value);
    if (values.length > 0) attributes[code] = values;
  }
  return attributes;
}

/** Parse raw URL search into a normalized, valid CatalogQuery. Never throws. */
export function parseCatalogSearch(raw: Record<string, unknown>): CatalogQuery {
  const page = Math.max(1, toPositiveInt(raw.page) ?? 1);
  const sortRaw = typeof raw.sort === "string" ? (raw.sort as CatalogSort) : "featured";
  const sort: CatalogSort = SORT_SET.has(sortRaw) ? sortRaw : "featured";
  const brands = toList(raw.brands);
  const dialColors = toList(raw.dialColors);
  const attributes = toAttributeFilters(raw);
  let minPriceMillimes = toPositiveInt(raw.minPrice);
  let maxPriceMillimes = toPositiveInt(raw.maxPrice);
  if (
    minPriceMillimes !== undefined &&
    maxPriceMillimes !== undefined &&
    minPriceMillimes > maxPriceMillimes
  ) {
    const tmp = minPriceMillimes;
    minPriceMillimes = maxPriceMillimes;
    maxPriceMillimes = tmp;
  }
  const promotionOnly = raw.promo === true || raw.promo === "true";
  return {
    page,
    pageSize: CATALOG_PAGE_SIZE,
    sort,
    brands,
    dialColors,
    attributes,
    minPriceMillimes,
    maxPriceMillimes,
    promotionOnly,
  };
}

/** Serialize a query into a URL search object, dropping default values. */
export function catalogQueryToSearch(q: Partial<CatalogQuery>): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  if (q.page && q.page > 1) out.page = String(q.page);
  if (q.sort && q.sort !== "featured") out.sort = q.sort;
  if (q.brands && q.brands.length) out.brands = q.brands.join(",");
  if (q.dialColors && q.dialColors.length) out.dialColors = q.dialColors.join(",");
  Object.entries(q.attributes ?? {}).forEach(([code, values]) => {
    if (values.length > 0) out[`attr_${code}`] = values.join(",");
  });
  if (q.minPriceMillimes != null) out.minPrice = String(q.minPriceMillimes);
  if (q.maxPriceMillimes != null) out.maxPrice = String(q.maxPriceMillimes);
  if (q.promotionOnly) out.promo = "true";
  return out;
}

/** Convenience: has the user set at least one optional filter (not the fixed category). */
export function hasActiveFilters(q: CatalogQuery): boolean {
  return (
    q.brands.length > 0 ||
    q.dialColors.length > 0 ||
    Object.values(q.attributes ?? {}).some((values) => values.length > 0) ||
    q.minPriceMillimes != null ||
    q.maxPriceMillimes != null ||
    q.promotionOnly
  );
}

/** DT → millimes helper for user-facing inputs. */
export function dinarsToMillimes(dt: number | string | null | undefined): number | undefined {
  if (dt === null || dt === undefined || dt === "") return undefined;
  const n = typeof dt === "number" ? dt : Number.parseFloat(String(dt).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 1000);
}

export function millimesToDinars(m: number | undefined): string {
  if (m == null) return "";
  return String(Math.round(m / 1000));
}
