import { Link } from "@tanstack/react-router";

import { catalogQueryToSearch } from "@/lib/catalog";
import type { BrandSummary } from "@/lib/brands";

function countLabel(n: number): string {
  return n <= 1 ? "1 modèle" : `${n} modèles`;
}

export function BrandCard({
  brand,
  priority = false,
}: {
  brand: BrandSummary;
  priority?: boolean;
}) {
  return (
    <Link
      to="/montres"
      search={catalogQueryToSearch({ brands: [brand.name] })}
      aria-label={`Voir les montres ${brand.name}`}
      className="group relative block aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)]"
    >
      <img
        src={brand.imageUrl}
        alt={brand.imageAlt}
        width={800}
        height={800}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[image:var(--brand-card-overlay)] transition-opacity duration-500 group-hover:opacity-90"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <span className="t-h2 text-[color:var(--color-on-image)] uppercase [text-shadow:0_1px_10px_rgb(16_15_15/0.55)]">
          {brand.name}
        </span>
        <span className="mt-2 text-xs tracking-[0.14em] text-[color:var(--color-on-image-muted)] uppercase">
          {countLabel(brand.productCount)}
        </span>
      </div>
    </Link>
  );
}
