import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { useNow } from "@/lib/now-store";
import { getProductBadges } from "@/lib/product-badges";
import { ProductPurchasePanel } from "./ProductPurchasePanel";

type Props = {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
};

/**
 * Product summary header + purchase panel. Badges use the shared
 * `getProductBadges` helper so the priority stays identical to `ProductCard`.
 */
export function ProductSummary({ product, onAddToCart }: Props) {
  const nowTs = useNow();
  const badges = getProductBadges(product, nowTs);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
          {product.brand}
        </p>
        <h1 className="t-h1 text-[color:var(--color-foreground)]">{product.name}</h1>
        <p className="text-xs text-[color:var(--color-muted-foreground)]">
          Référence&nbsp;: <span className="font-medium">{product.reference}</span>
        </p>
        {badges.length > 0 ? (
          <ul className="mt-1 flex list-none flex-wrap gap-1.5">
            {badges.map((b) => (
              <li
                key={b.id}
                className={cn(
                  "rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  b.tone === "promo" &&
                    "bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)]",
                  b.tone === "best" &&
                    "bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)]",
                  b.tone === "new" &&
                    "border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]",
                )}
              >
                {b.label}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {product.shortDescription ? (
        <p className="text-sm leading-relaxed text-[color:var(--color-muted-foreground)] md:text-base">
          {product.shortDescription}
        </p>
      ) : null}

      <ProductPurchasePanel product={product} onAddToCart={onAddToCart} />
    </div>
  );
}
