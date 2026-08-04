import logoCalvinKlein from "@/assets/logo-calvin-klein.png";
import logoSwatch from "@/assets/logo-swatch.png";
import logoTissot from "@/assets/logo-tissot.png";

import { PRODUCTS } from "@/fixtures/products";
import type { Product } from "@/types/product";

export type BrandSummary = {
  name: string;
  productCount: number;
  imageUrl: string;
  imageAlt: string;
  logoUrl: string;
};

const BRAND_LOGOS: Record<string, string> = {
  "Calvin Klein": logoCalvinKlein,
  Tissot: logoTissot,
  Swatch: logoSwatch,
};

/** Derive the brand list (name, cover image, count, logo) from public products. */
export function getBrandSummaries(products: Product[] = PRODUCTS): BrandSummary[] {
  const map = new Map<string, BrandSummary>();

  for (const p of products) {
    if (p.availability === "hidden") continue;
    const cover = [...p.images].sort((a, b) => a.position - b.position)[0];
    const existing = map.get(p.brand);
    if (existing) {
      existing.productCount += 1;
      continue;
    }
    map.set(p.brand, {
      name: p.brand,
      productCount: 1,
      imageUrl: cover?.url ?? "",
      imageAlt: cover?.alt ?? `Montre ${p.brand}`,
      logoUrl: BRAND_LOGOS[p.brand] ?? "",
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
