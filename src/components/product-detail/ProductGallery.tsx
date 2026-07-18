import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product, ProductImage } from "@/types/product";

type Props = {
  product: Product;
};

/**
 * Simple, accessible gallery: main image + thumbnail strip.
 * Only the main image gets `fetchpriority="high"` (LCP).
 * If no image exists, renders a labelled placeholder.
 */
export function ProductGallery({ product }: Props) {
  const images =
    product.images.length > 0 ? [...product.images].sort((a, b) => a.position - b.position) : [];
  const [activeId, setActiveId] = useState<string | null>(images[0]?.id ?? null);
  const active: ProductImage | undefined = images.find((i) => i.id === activeId) ?? images[0];

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white md:aspect-[4/5]">
        {active ? (
          <img
            key={active.id}
            src={active.url}
            alt={active.alt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-6 md:p-10"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[color:var(--color-muted-foreground)]">
            Image indisponible
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <ul className="flex list-none flex-wrap gap-2">
          {images.map((img) => {
            const isActive = img.id === active?.id;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(img.id)}
                  aria-label={`Voir l'image : ${img.alt}`}
                  aria-current={isActive}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-[var(--radius-sm)] border bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)] md:h-20 md:w-20",
                    isActive
                      ? "border-[color:var(--color-foreground)]"
                      : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]",
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-1.5"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
