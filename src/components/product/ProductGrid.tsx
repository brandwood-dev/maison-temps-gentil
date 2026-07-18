import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  className?: string;
};

export function ProductGrid({ products, className }: Props) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-3 [@media(min-width:380px)]:grid-cols-2 md:grid-cols-3 md:gap-5 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((p) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
