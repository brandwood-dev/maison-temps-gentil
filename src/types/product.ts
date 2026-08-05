/**
 * Frontend product contract for La Maison des Montres.
 * Anticipates the future NestJS backend without duplicating its full schema.
 * Prices are always stored in integer millimes (1 TND = 1000 millimes).
 */

export type Currency = "TND";

export type ProductCategory = "men" | "women" | "children" | "couple" | "connected";

export type ProductAvailability = "available" | "unavailable" | "hidden";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
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

export type ProductDialColor = {
  label: string;
  hex: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  reference: string;
  category: ProductCategory;
  currency: Currency;
  regularPriceMillimes: number;
  promotion: ProductPromotion | null;
  availability: ProductAvailability;
  images: ProductImage[];
  /** Dynamic attributes configured in the Admin catalogue. */
  attributes?: ProductAttribute[];
  shortDescription: string;
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
