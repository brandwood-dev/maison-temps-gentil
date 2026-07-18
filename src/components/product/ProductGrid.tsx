import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  className?: string;
  onAddToCart?: (product: Product) => void;
};

export function ProductGrid({ products, className, onAddToCart }: Props) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard
            product={p}
            onAddToCart={onAddToCart}
            imagePriority={i === 0}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
