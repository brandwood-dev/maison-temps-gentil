import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  className?: string;
  onAddToCart?: (product: Product) => void;
  /**
   * Override the default per-product link. Return `null` or `undefined` to
   * render the card without a link. When omitted, cards link to
   * `/montres/{slug}` (the product detail page).
   */
  getHref?: (product: Product) => string | null | undefined;
};

const defaultHref = (p: Product) => `/montres/${p.slug}`;

export function ProductGrid({ products, className, onAddToCart, getHref = defaultHref }: Props) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => {
        const href = getHref(p) ?? undefined;
        return (
          <li key={p.id} className="flex">
            <ProductCard
              product={p}
              href={href}
              onAddToCart={onAddToCart}
              imagePriority={i === 0}
              className="w-full"
            />
          </li>
        );
      })}
    </ul>
  );
}
