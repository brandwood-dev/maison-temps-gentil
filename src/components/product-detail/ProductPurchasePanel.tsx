import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { isPromotionActive } from "@/lib/product-pricing";
import { useNow } from "@/lib/now-store";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductPrice } from "@/components/product/ProductPrice";
import { PromotionCountdown } from "@/components/product/PromotionCountdown";
import { ProductReassurance } from "./ProductReassurance";

type Props = {
  product: Product;
  /**
   * Cart hook-in. Absent on the public site until the cart is wired.
   * Contract kept stable for the backend integration.
   */
  onAddToCart?: (product: Product, quantity: number) => void;
};

/**
 * Purchase panel: price + countdown + quantity selector + cart + favorite.
 * Cart button rules:
 *  - callback absent → disabled, label "Fonction d'achat en cours de connexion".
 *  - product `unavailable` or `hidden` → disabled.
 *  - callback present + product `available` → enabled; a click fires
 *    exactly once `onAddToCart(product, quantity)`.
 * No notification, no persistence, no cart-count side effect.
 */
export function ProductPurchasePanel({ product, onAddToCart }: Props) {
  const nowTs = useNow();
  const promoActive = isPromotionActive(product.promotion, new Date(nowTs));
  const { isFavorite, toggle, hydrated } = useFavorites();

  const [quantity, setQuantity] = useState<number>(1);

  const purchasable = product.availability === "available";
  const cartEnabled = Boolean(onAddToCart) && purchasable;
  const noCallback = !onAddToCart;

  const fav = hydrated && isFavorite(product.id);
  const favLabel = fav
    ? `Retirer ${product.name} des favoris`
    : `Ajouter ${product.name} aux favoris`;

  const cartText = noCallback
    ? "Fonction d'achat en cours de connexion"
    : purchasable
      ? "Ajouter au panier"
      : "Indisponible";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <ProductPrice product={product} mode="detailed" />
      </div>

      {promoActive && product.promotion ? (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
            Offre à durée limitée
          </p>
          <PromotionCountdown endsAt={product.promotion.endsAt} variant="detailed" />
        </div>
      ) : null}

      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span
          id={`qty-label-${product.id}`}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]"
        >
          Quantité
        </span>
        <div
          className="inline-flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]"
          role="group"
          aria-labelledby={`qty-label-${product.id}`}
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label={`Diminuer la quantité de ${product.name}`}
            className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] disabled:cursor-not-allowed disabled:text-[color:var(--color-muted-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          >
            <Minus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
          <span
            aria-live="polite"
            aria-label={`Quantité pour ${product.name}`}
            className="inline-flex min-w-[2.5rem] items-center justify-center px-2 text-sm font-semibold tabular-nums text-[color:var(--color-foreground)]"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label={`Augmenter la quantité de ${product.name}`}
            className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={() => {
            if (cartEnabled && onAddToCart) onAddToCart(product, quantity);
          }}
          disabled={!cartEnabled}
          aria-disabled={!cartEnabled}
          aria-label={
            noCallback
              ? `Fonction d'achat en cours de connexion pour ${product.name}`
              : purchasable
                ? `Ajouter ${product.name} au panier (quantité ${quantity})`
                : `Produit indisponible : ${product.name}`
          }
          className={cn(
            "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
            cartEnabled
              ? "bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
              : "bg-[color:var(--color-surface-cream)] text-[color:var(--color-muted-foreground)] cursor-not-allowed",
          )}
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          <span>{cartText}</span>
        </button>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={favLabel}
          aria-pressed={fav}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)] sm:w-auto"
        >
          <Heart
            className={cn("h-5 w-5", fav ? "fill-[color:var(--color-foreground)]" : "")}
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="hidden sm:inline">
            {fav ? "Dans vos favoris" : "Ajouter aux favoris"}
          </span>
        </button>
      </div>

      <ProductReassurance product={product} />
    </div>
  );
}
