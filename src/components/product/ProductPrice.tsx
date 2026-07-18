import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import {
  formatPriceTND,
  getDiscountPercent,
  getSavingsMillimes,
  isPromotionActive,
} from "@/lib/product-pricing";

type Props = {
  product: Product;
  mode?: "compact" | "detailed";
  className?: string;
};

export function ProductPrice({ product, mode = "compact", className }: Props) {
  // Render server-side using the stored data (may show promo). Re-evaluate on
  // client to hide any promo that expired between SSR and hydration.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const evalDate = now ?? new Date(product.promotion?.endsAt ?? Date.now());
  // For SSR, trust the fixture data — assume promo is active if it exists and is well-formed.
  const active = now
    ? isPromotionActive(product.promotion, now)
    : !!product.promotion &&
      product.promotion.salePriceMillimes < product.promotion.regularPriceMillimes;

  if (!active || !product.promotion) {
    return (
      <p className={cn("text-base font-bold text-[color:var(--color-foreground)]", className)}>
        {formatPriceTND(product.regularPriceMillimes)}
      </p>
    );
  }

  const discount = getDiscountPercent(product, evalDate);
  const savings = getSavingsMillimes(product, evalDate);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className="text-base font-bold text-[color:var(--color-foreground)]">
        {formatPriceTND(product.promotion.salePriceMillimes)}
      </span>
      <span className="text-sm font-medium text-[color:var(--color-muted-foreground)] line-through">
        {formatPriceTND(product.promotion.regularPriceMillimes)}
      </span>
      <span
        className="rounded-[var(--radius-sm)] bg-[color:var(--color-foreground)] px-1.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-primary-foreground)]"
        aria-label={`Réduction de ${discount} pour cent`}
      >
        -{discount}&nbsp;%
      </span>
      {mode === "detailed" ? (
        <span className="mt-1 block w-full text-xs text-[color:var(--color-success,#2f7a4d)]">
          Vous économisez {formatPriceTND(savings)}
        </span>
      ) : null}
    </div>
  );
}
