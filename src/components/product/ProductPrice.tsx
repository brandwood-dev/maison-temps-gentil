import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import {
  formatPriceTND,
  getDiscountPercent,
  getSavingsMillimes,
  isPromotionActive,
} from "@/lib/product-pricing";
import { useNow } from "@/lib/now-store";

type Props = {
  product: Product;
  mode?: "compact" | "detailed";
  className?: string;
};

/**
 * SSR: `useNow()` returns 0 → we trust the fixture (promo exists and
 * sale < regular). Client after hydration: we re-check `isPromotionActive`
 * against the shared clock, so an expiring promo flips back to the regular
 * price at the tick following expiration without any reload.
 */
export function ProductPrice({ product, mode = "compact", className }: Props) {
  const nowTs = useNow();
  const promo = product.promotion;

  let active: boolean;
  let evalDate: Date;
  if (nowTs === 0) {
    evalDate = new Date(0);
    active = !!promo && promo.salePriceMillimes < promo.regularPriceMillimes;
  } else {
    evalDate = new Date(nowTs);
    active = isPromotionActive(promo, evalDate);
  }

  if (!active || !promo) {
    return (
      <p className={cn("text-base font-bold text-[color:var(--color-foreground)]", className)}>
        {formatPriceTND(product.regularPriceMillimes)}
      </p>
    );
  }

  const discount =
    nowTs === 0
      ? Math.round(
          ((promo.regularPriceMillimes - promo.salePriceMillimes) / promo.regularPriceMillimes) *
            100,
        )
      : getDiscountPercent(product, evalDate);
  const savings =
    nowTs === 0
      ? promo.regularPriceMillimes - promo.salePriceMillimes
      : getSavingsMillimes(product, evalDate);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className="text-base font-bold text-[color:var(--color-foreground)]">
        {formatPriceTND(promo.salePriceMillimes)}
      </span>
      <span className="text-sm font-medium text-[color:var(--color-muted-foreground)] line-through">
        {formatPriceTND(promo.regularPriceMillimes)}
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
