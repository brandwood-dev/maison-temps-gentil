import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { isPromotionActive } from "@/lib/product-pricing";
import { useFavorites } from "@/hooks/useFavorites";
import { useNow } from "@/lib/now-store";
import { getProductBadges } from "@/lib/product-badges";
import { ProductPrice } from "./ProductPrice";
import { PromotionCountdown } from "./PromotionCountdown";

type Props = {
  product: Product;
  /** Optional link to the future product page. Omit until product pages exist. */
  href?: string;
  /** Optional add-to-cart callback. Omit until cart is implemented. */
  onAddToCart?: (product: Product, quantity: number) => void;
  /** Prioritize main image loading (LCP). Only the first card in a grid should set this. */
  imagePriority?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  href,
  onAddToCart,
  imagePriority = false,
  className,
}: Props) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const nowTs = useNow();
  const [imgHover, setImgHover] = useState(false);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [mainError, setMainError] = useState(false);

  const primary = product.images.find((i) => i.position === 1) ?? product.images[0];
  const secondary = product.images.find((i) => i.position === 2) ?? null;

  // Shared per-request clock: SSR and first client render agree on `nowTs`,
  // so `promoActive` matches the HTML sent by the server. After hydration the
  // ticker re-evaluates every second — badge, price and countdown drop
  // together in the same render pass when the promo expires.
  const promoActive = isPromotionActive(product.promotion, new Date(nowTs));

  const unavailable = product.availability === "unavailable";

  const fav = hydrated && isFavorite(product.id);
  const favLabel = fav
    ? `Retirer ${product.name} des favoris`
    : `Ajouter ${product.name} aux favoris`;

  const viewEnabled = Boolean(href) && !unavailable ? true : Boolean(href);
  const cartEnabled = Boolean(onAddToCart) && !unavailable;
  const cartLabel = unavailable
    ? `Produit indisponible : ${product.name}`
    : `Ajouter ${product.name} au panier`;

  const visibleBadges = getProductBadges(product, nowTs);

  const mainLoading = imagePriority ? "eager" : "lazy";
  const mainFetchPriority: "high" | "auto" = imagePriority ? "high" : "auto";

  const Media = (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden bg-white"
      onMouseEnter={() => setImgHover(true)}
      onMouseLeave={() => setImgHover(false)}
    >
      {primary && !mainError ? (
        <img
          src={primary.url}
          alt={primary.alt}
          width={800}
          height={1000}
          loading={mainLoading}
          fetchPriority={mainFetchPriority}
          decoding="async"
          onLoad={() => setMainLoaded(true)}
          onError={() => setMainError(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-300",
            mainLoaded ? "opacity-100" : "opacity-0",
            imgHover && secondary ? "md:opacity-0" : "",
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[color:var(--color-muted-foreground)]">
          Image indisponible
        </div>
      )}
      {secondary ? (
        <img
          src={secondary.url}
          alt={secondary.alt}
          width={800}
          height={1000}
          loading="lazy"
          fetchPriority="auto"
          decoding="async"
          className={cn(
            "absolute inset-0 hidden h-full w-full object-contain p-4 opacity-0 transition-opacity duration-300 md:block",
            imgHover ? "opacity-100" : "",
          )}
          aria-hidden={!imgHover}
        />
      ) : null}

      {visibleBadges.length > 0 ? (
        <ul className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {visibleBadges.map((b) => (
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

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(product.id);
        }}
        aria-label={favLabel}
        aria-pressed={fav}
        className="absolute right-1.5 top-1.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
      >
        <Heart
          className={cn("h-5 w-5", fav ? "fill-[color:var(--color-foreground)]" : "")}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
    </div>
  );

  // View action: real anchor when enabled, disabled span otherwise.
  const viewBaseClasses =
    "inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-3 text-xs font-semibold sm:text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]";
  const viewEnabledClasses =
    "border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]";
  const viewDisabledClasses =
    "border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] text-[color:var(--color-muted-foreground)] cursor-not-allowed";

  const viewLabelShort = "Voir";
  const viewLabelLong = "Voir le produit";

  const ViewAction =
    viewEnabled && href ? (
      <Link
        to={href}
        aria-label={`${viewLabelLong} ${product.name}`}
        className={cn(viewBaseClasses, viewEnabledClasses)}
      >
        <span className="sm:hidden">{viewLabelShort}</span>
        <span className="hidden sm:inline">{viewLabelLong}</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </Link>
    ) : (
      <span
        role="link"
        aria-disabled="true"
        aria-label={`${viewLabelLong} ${product.name} (bientôt disponible)`}
        className={cn(viewBaseClasses, viewDisabledClasses)}
      >
        <span className="sm:hidden">{viewLabelShort}</span>
        <span className="hidden sm:inline">{viewLabelLong}</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </span>
    );

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)]",
        unavailable && "opacity-90",
        className,
      )}
    >
      {href && !unavailable ? (
        <Link to={href} className="block shrink-0" aria-label={product.name}>
          {Media}
        </Link>
      ) : (
        Media
      )}

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <p className="flex min-h-[1.125rem] items-center text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
          {product.brand}
        </p>

        {/* Fixed two-line title box keeps every card's price row on the same baseline. */}
        <div className="mt-1 min-h-[2.5rem]">
          {href && !unavailable ? (
            <Link
              to={href}
              className="block text-sm font-semibold leading-snug text-[color:var(--color-foreground)] hover:text-[color:var(--color-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
            >
              <h3 className="line-clamp-2">{product.name}</h3>
            </Link>
          ) : (
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--color-foreground)]">
              {product.name}
            </h3>
          )}
        </div>

        <div className="mt-2 flex min-h-[2.25rem] items-center">
          <ProductPrice product={product} mode="compact" />
        </div>

        <div className="mt-1 flex min-h-[1.25rem] items-center">
          {unavailable ? (
            <p className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
              Indisponible
            </p>
          ) : promoActive && product.promotion ? (
            <PromotionCountdown endsAt={product.promotion.endsAt} />
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-stretch gap-2 pt-3">
          {ViewAction}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (cartEnabled && onAddToCart) onAddToCart(product, 1);
            }}
            disabled={!cartEnabled}
            aria-label={cartLabel}
            aria-disabled={!cartEnabled}
            title={unavailable ? "Produit indisponible" : undefined}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
              cartEnabled
                ? "bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
                : "bg-[color:var(--color-surface-cream)] text-[color:var(--color-muted-foreground)] cursor-not-allowed",
            )}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
