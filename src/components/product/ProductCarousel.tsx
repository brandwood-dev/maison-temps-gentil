import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  className?: string;
  onAddToCart?: (product: Product, quantity: number) => void;
};

/**
 * Lightweight, keyboard-friendly product carousel for the homepage.
 * The parent limits the input to eight products; this component only handles
 * horizontal navigation and never duplicates cards in the DOM.
 */
export function ProductCarousel({ products, className, onAddToCart }: Props) {
  const viewportRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const scroll = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const firstCard = viewport.querySelector<HTMLElement>("li");
    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap || "0") || 0;
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth;
    viewport.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (products.length < 2 || paused || reducedMotion) return;

    const timer = window.setInterval(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
      if (atEnd) {
        viewport.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll(1);
      }
    }, 5_500);

    return () => window.clearInterval(timer);
  }, [paused, products.length, reducedMotion, scroll]);

  if (products.length === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <ul
        ref={viewportRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Produits mis en avant"
      >
        {products.map((product, index) => (
          <li
            key={product.id}
            className="flex min-w-0 shrink-0 basis-full snap-start sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)]"
          >
            <ProductCard
              product={product}
              href={`/montres/${product.slug}`}
              onAddToCart={onAddToCart}
              imagePriority={index === 0}
              imageSizes="(max-width: 640px) 85vw, (max-width: 1024px) 48vw, 25vw"
              className="w-full"
            />
          </li>
        ))}
      </ul>

      {products.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-between px-2 md:flex">
          <button
            type="button"
            aria-label="Produits précédents"
            onClick={() => scroll(-1)}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]/95 text-[color:var(--color-foreground)] shadow-sm transition hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Produits suivants"
            onClick={() => scroll(1)}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]/95 text-[color:var(--color-foreground)] shadow-sm transition hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
