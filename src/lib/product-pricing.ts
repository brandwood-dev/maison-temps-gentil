import type { Product, ProductPromotion } from "@/types/product";

/** Convert millimes to whole dinars (rounded). Data always stays in millimes. */
export function formatPriceTND(millimes: number): string {
  const dinars = Math.round(millimes / 1000);
  // French thin space grouping: "1 879 DT"
  const grouped = dinars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return `${grouped} DT`;
}

export function isPromotionActive(
  promotion: ProductPromotion | null,
  now: Date = new Date(),
): boolean {
  if (!promotion) return false;
  if (promotion.salePriceMillimes >= promotion.regularPriceMillimes) return false;
  const nowTs = now.getTime();
  const endTs = new Date(promotion.endsAt).getTime();
  if (Number.isNaN(endTs) || nowTs >= endTs) return false;
  if (promotion.startsAt) {
    const startTs = new Date(promotion.startsAt).getTime();
    if (!Number.isNaN(startTs) && nowTs < startTs) return false;
  }
  return true;
}

export function getCurrentPriceMillimes(product: Product, now: Date = new Date()): number {
  if (isPromotionActive(product.promotion, now)) {
    return product.promotion!.salePriceMillimes;
  }
  return product.regularPriceMillimes;
}

export function getSavingsMillimes(product: Product, now: Date = new Date()): number {
  if (!isPromotionActive(product.promotion, now)) return 0;
  return product.promotion!.regularPriceMillimes - product.promotion!.salePriceMillimes;
}

export function getDiscountPercent(product: Product, now: Date = new Date()): number {
  if (!isPromotionActive(product.promotion, now)) return 0;
  const p = product.promotion!;
  return Math.round(((p.regularPriceMillimes - p.salePriceMillimes) / p.regularPriceMillimes) * 100);
}

export type Remaining = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function getRemainingTime(endsAt: string, now: Date = new Date()): Remaining {
  const endTs = new Date(endsAt).getTime();
  const diff = endTs - now.getTime();
  if (Number.isNaN(endTs) || diff <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { totalMs: diff, days, hours, minutes, seconds, expired: false };
}
