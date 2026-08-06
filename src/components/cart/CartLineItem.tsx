import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { formatPriceTND, getCurrentPriceMillimes, isPromotionActive } from "@/lib/product-pricing";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  quantity: number;
  now: Date;
  highlighted?: boolean;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
  onNavigate?: () => void;
};

export function CartLineItem({
  product,
  quantity,
  now,
  highlighted = false,
  onRemove,
  onQuantityChange,
  onNavigate,
}: Props) {
  const image = product.images.find((i) => i.position === 1) ?? product.images[0];
  const promoActive = isPromotionActive(product.promotion, now);
  const unitMillimes = getCurrentPriceMillimes(product, now);
  const unavailable = product.availability === "unavailable";

  return (
    <article
      className={cn(
        "flex gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-3 transition-colors",
        highlighted && "border-[color:var(--color-gold)]",
        unavailable && "opacity-90",
      )}
    >
      <Link
        to="/montres/$slug"
        params={{ slug: product.slug }}
        onClick={onNavigate}
        aria-label={product.name}
        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-white"
      >
        {image ? (
          <img
            src={image.optimizedUrl ?? image.url}
            srcSet={image.srcSet}
            sizes="80px"
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-1.5"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
              {product.brand}
            </p>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-[color:var(--color-foreground)]">
              <Link
                to="/montres/$slug"
                params={{ slug: product.slug }}
                onClick={onNavigate}
                className="hover:text-[color:var(--color-gold)]"
              >
                {product.name}
              </Link>
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                {formatPriceTND(unitMillimes)}
              </span>
              {promoActive && product.promotion ? (
                <span className="text-[11px] text-[color:var(--color-muted-foreground)] line-through">
                  {formatPriceTND(product.promotion.regularPriceMillimes)}
                </span>
              ) : null}
            </div>
            {unavailable ? (
              <p className="mt-1 text-[11px] font-medium text-[color:var(--color-muted-foreground)]">
                Actuellement indisponible
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${product.name} du panier`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] hover:text-[color:var(--color-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div
          className="inline-flex w-fit items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)]"
          role="group"
          aria-label={`Quantité pour ${product.name}`}
        >
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label={`Diminuer la quantité de ${product.name}`}
            className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[color:var(--color-surface-cream)] disabled:cursor-not-allowed disabled:text-[color:var(--color-muted-foreground)]"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </button>
          <span className="inline-flex min-w-[2rem] items-center justify-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label={`Augmenter la quantité de ${product.name}`}
            className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[color:var(--color-surface-cream)]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
