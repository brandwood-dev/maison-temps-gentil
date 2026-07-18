import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { isPromotionActive } from "@/lib/product-pricing";
import { useNow } from "@/lib/now-store";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductPrice } from "@/components/product/ProductPrice";
import { PromotionCountdown } from "@/components/product/PromotionCountdown";

type Props = {
  product: Product;
  /** Optional callback. When absent, the "Ajouter au panier" button is disabled. */
  onAddToCart?: (product: Product) => void;
};

/**
 * Product summary block: brand, name, reference, description, price,
 * countdown, favorite + add-to-cart actions.
 *
 * Cart button contract:
 * - No callback OR product unavailable → disabled (aria-disabled), no onClick fires.
 * - Callback + available → enabled, exactly one call per click.
 */
export function ProductSummary({ product, onAddToCart }: Props) {
  const nowTs = useNow();
  const promoActive = isPromotionActive(product.promotion, new Date(nowTs));
  const { isFavorite, toggle, hydrated } = useFavorites();

  const unavailable = product.availability === "unavailable";
  const cartEnabled = Boolean(onAddToCart) && !unavailable;
  const fav = hydrated && isFavorite(product.id);
  const favLabel = fav
    ? `Retirer ${product.name} des favoris`
    : `Ajouter ${product.name} aux favoris`;

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
      </header>

      <div>
        <ProductPrice product={product} mode="detailed" />
      </div>

      {promoActive && product.promotion ? (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
            Offre à durée limitée
          </p>
          <PromotionCountdown endsAt={product.promotion.endsAt} />
        </div>
      ) : null}

      {product.shortDescription ? (
        <p className="text-sm leading-relaxed text-[color:var(--color-muted-foreground)] md:text-base">
          {product.shortDescription}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={() => {
            if (cartEnabled && onAddToCart) onAddToCart(product);
          }}
          disabled={!cartEnabled}
          aria-disabled={!cartEnabled}
          aria-label={
            unavailable
              ? `Produit indisponible : ${product.name}`
              : `Ajouter ${product.name} au panier`
          }
          title={
            unavailable
              ? "Produit indisponible"
              : !onAddToCart
                ? "Le panier n'est pas encore disponible"
                : undefined
          }
          className={cn(
            "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
            cartEnabled
              ? "bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
              : "bg-[color:var(--color-surface-cream)] text-[color:var(--color-muted-foreground)] cursor-not-allowed",
          )}
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          <span>{unavailable ? "Indisponible" : "Ajouter au panier"}</span>
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
          <span className="hidden sm:inline">{fav ? "Dans vos favoris" : "Ajouter aux favoris"}</span>
        </button>
      </div>

      <ul className="mt-2 grid list-none gap-3 border-t border-[color:var(--color-border)] pt-5 sm:grid-cols-2">
        <Reassurance
          icon={<Truck className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
          label="Livraison rapide en Tunisie"
          hint="Sous 2 à 3 jours ouvrés"
        />
        <Reassurance
          icon={<RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
          label="Retour sous 14 jours"
          hint="Satisfait ou remboursé"
        />
        <Reassurance
          icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
          label={
            product.warrantyMonths
              ? `Garantie ${product.warrantyMonths} mois`
              : "Garantie officielle"
          }
          hint="Produits 100 % authentiques"
        />
        {product.giftBoxIncluded ? (
          <Reassurance
            icon={<Gift className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
            label="Coffret cadeau inclus"
            hint="Emballage soigné offert"
          />
        ) : null}
      </ul>
    </div>
  );
}

function Reassurance({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-surface-cream)] text-[color:var(--color-foreground)]">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-[color:var(--color-foreground)]">{label}</span>
        <span className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</span>
      </span>
    </li>
  );
}
