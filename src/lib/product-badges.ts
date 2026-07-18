import type { Product } from "@/types/product";
import { isPromotionActive } from "@/lib/product-pricing";

export type BadgeTone = "promo" | "best" | "new";
export type ProductBadge = { id: string; label: string; tone: BadgeTone };

/**
 * Shared badge priority for cards AND detail summary.
 * Priority (max 2): active promotion → best seller → new.
 * The promo badge is time-aware (uses `nowTs`) so it disappears in the same
 * render pass as the promo price, discount, savings and countdown.
 */
export function getProductBadges(product: Product, nowTs: number): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (isPromotionActive(product.promotion, new Date(nowTs))) {
    badges.push({ id: "promo", label: "Promo", tone: "promo" });
  }
  if (product.isBestSeller) {
    badges.push({ id: "best", label: "Meilleure vente", tone: "best" });
  }
  if (product.isNew && badges.length < 2) {
    badges.push({ id: "new", label: "Nouveauté", tone: "new" });
  }
  return badges.slice(0, 2);
}
