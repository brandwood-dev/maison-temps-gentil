/**
 * Frontend product contract for La Maison des Montres.
 * Anticipates the future NestJS backend without duplicating its full schema.
 * Prices are always stored in integer millimes (1 TND = 1000 millimes).
 */

export type Currency = "TND";

export type ProductCategory = "men" | "women" | "children" | "couple" | "connected";

/**
 * The public API keeps the legacy `category` family for compatibility with
 * existing watch-only filters, and exposes the real catalogue category below.
 * Slugs are data-driven so new categories do not require a frontend release.
 */
export type ProductCategoryRef = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  order?: number;
};

export type ProductAvailability = "available" | "unavailable" | "hidden";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
  /** Supabase Image Transformation URL (WebP when supported). */
  optimizedUrl?: string;
  srcSet?: string;
  sizes?: string;
  /** Canonical 4/5 crop used by catalogue cards. */
  cardUrl?: string;
  cardSrcSet?: string;
  cardSizes?: string;
  /** Square crop used by product-gallery thumbnails. */
  thumbnailUrl?: string;
  thumbnailSrcSet?: string;
  thumbnailSizes?: string;
};

export type ProductAttributeValue = {
  id: string;
  label: string;
  slug?: string;
  swatch?: string;
  imageUrl?: string;
};

export type ProductAttribute = {
  id: string;
  code: string;
  label: string;
  type: "select" | "multiselect" | "color" | "boolean" | "text" | "number";
  visibleInFilters?: boolean;
  /** Explicit category scope; empty means the attribute is global. */
  categoryIds?: string[];
  values: ProductAttributeValue[];
};

export type ProductPromotion = {
  regularPriceMillimes: number;
  salePriceMillimes: number;
  /** ISO 8601 with timezone. If null, promotion is considered started. */
  startsAt: string | null;
  /** ISO 8601 with timezone. Required. */
  endsAt: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  oldPrice?: number;
  stock: number;
  active: boolean;
  available: boolean;
  order: number;
};

export type ProductDialColor = {
  label: string;
  hex: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandLogoUrl?: string;
  reference: string;
  category: ProductCategory;
  /** Primary category used for URLs, breadcrumbs and related products. */
  primaryCategory?: ProductCategoryRef;
  /** All active categories assigned to the product. */
  categories?: ProductCategoryRef[];
  currency: Currency;
  regularPriceMillimes: number;
  promotion: ProductPromotion | null;
  availability: ProductAvailability;
  images: ProductImage[];
  /** Optional sellable variants (for example perfume bottle sizes). */
  variants?: ProductVariant[];
  /** Dynamic attributes configured in the Admin catalogue. */
  attributes?: ProductAttribute[];
  shortDescription: string;
  /** Full product description shown in the dedicated description section. */
  description?: string;
  dialColor: ProductDialColor | null;
  braceletMaterial: string | null;
  braceletColor: string | null;
  movementType: string | null;
  displayType: string | null;
  diameterMm: number | null;
  glassType: string | null;
  waterResistance: string | null;
  warrantyMonths: number | null;
  giftBoxIncluded: boolean;
  isNew: boolean;
  isBestSeller: boolean;
};
