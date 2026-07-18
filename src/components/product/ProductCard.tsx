import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { isPromotionActive } from "@/lib/product-pricing";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductPrice } from "./ProductPrice";
import { PromotionCountdown } from "./PromotionCountdown";

type Props = {
  product: Product;
  /** Optional link to the future product page. Omit until product pages exist. */
  href?: string;
  className?: string;
};

export function ProductCard({ product, href, className }: Props) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const [imgHover, setImgHover] = useState(false);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [mainError, setMainError] = useState(false);

  const primary = product.images.find((i) => i.position === 1) ?? product.images[0];
  const secondary = product.images.find((i) => i.position === 2) ?? null;

  const promoActive = isPromotionActive(product.promotion);
  const unavailable = product.availability === "unavailable";

  const fav = hydrated && isFavorite(product.id);
  const favLabel = fav
    ? `Retirer ${product.name} des favoris`
    : `Ajouter ${product.name} aux favoris`;

  // Badges: max 2 visible, priority promo > bestseller > new
  const badges: { key: string; label: string; tone: "promo" | "best" | "new" }[] = [];
  if (promoActive) badges.push({ key: "promo", label: "Promo", tone: "promo" });
  if (product.isBestSeller) badges.push({ key: "best", label: "Meilleure vente", tone: "best" });
  if (product.isNew && badges.length < 2)
    badges.push({ key: "new", label: "Nouveauté", tone: "new" });
  const visibleBadges = badges.slice(0, 2);

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
          loading="eager"
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
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 hidden h-full w-full object-contain p-4 opacity-0 transition-opacity duration-300 md:block",
            imgHover ? "opacity-100" : "",
          )}
          aria-hidden={!imgHover}
        />
      ) : null}

      {/* Badges */}
      {visibleBadges.length > 0 ? (
        <ul className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {visibleBadges.map((b) => (
            <li
              key={b.key}
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

      {/* Favorite button */}
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

  return (
    <article
      className={cn(
        "group flex flex-col rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)]",
        unavailable && "opacity-90",
        className,
      )}
    >
      {href ? (
        <a href={href} className="block" aria-label={product.name}>
          {Media}
        </a>
      ) : (
        Media
      )}

      <div className="flex flex-1 flex-col gap-1.5 p-3 md:p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--color-foreground)]">
          {product.name}
        </h3>

        <div className="mt-1">
          <ProductPrice product={product} mode="compact" />
        </div>

        <div className="mt-1 min-h-[1rem]">
          {unavailable ? (
            <p className="text-xs font-medium text-[color:var(--color-muted-foreground)]">
              Indisponible
            </p>
          ) : promoActive && product.promotion ? (
            <PromotionCountdown endsAt={product.promotion.endsAt} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
