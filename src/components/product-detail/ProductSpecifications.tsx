import type { Product } from "@/types/product";
import { formatSpecifications } from "@/lib/products";

type Props = {
  product: Product;
};

/**
 * Renders only filled specifications. Missing fields are simply omitted,
 * never rendered as "N/A" or "—".
 */
export function ProductSpecifications({ product }: Props) {
  const rows = formatSpecifications(product);
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="specs-heading" className="mt-12 md:mt-16">
      <h2
        id="specs-heading"
        className="t-h2 mb-5 text-[color:var(--color-foreground)] md:mb-6"
      >
        Caractéristiques
      </h2>
      <dl className="grid gap-x-8 gap-y-3 border-t border-[color:var(--color-border)] pt-5 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-col gap-0.5 border-b border-[color:var(--color-border)] pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-right">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
