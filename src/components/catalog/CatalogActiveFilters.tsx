import { X } from "lucide-react";
import type { CatalogQuery } from "@/types/catalog";
import { hasActiveFilters, millimesToDinars } from "@/lib/catalog";

type Chip = { key: string; label: string; onRemove: () => void };

type Props = {
  query: CatalogQuery;
  onChange: (patch: Partial<CatalogQuery>) => void;
  onReset: () => void;
  /** Hide the "En promotion" chip (e.g. on the /promotions page). */
  hidePromoChip?: boolean;
};

export function CatalogActiveFilters({ query, onChange, onReset, hidePromoChip }: Props) {
  const chips: Chip[] = [];

  if (query.promotionOnly && !hidePromoChip) {
    chips.push({
      key: "promo",
      label: "En promotion",
      onRemove: () => onChange({ promotionOnly: false, page: 1 }),
    });
  }
  query.brands.forEach((b) => {
    chips.push({
      key: `brand-${b}`,
      label: `Marque : ${b}`,
      onRemove: () => onChange({ brands: query.brands.filter((x) => x !== b), page: 1 }),
    });
  });
  query.dialColors.forEach((c) => {
    chips.push({
      key: `color-${c}`,
      label: `Cadran : ${c}`,
      onRemove: () => onChange({ dialColors: query.dialColors.filter((x) => x !== c), page: 1 }),
    });
  });
  if (query.minPriceMillimes != null) {
    chips.push({
      key: "minPrice",
      label: `Prix min. : ${millimesToDinars(query.minPriceMillimes)} DT`,
      onRemove: () => onChange({ minPriceMillimes: undefined, page: 1 }),
    });
  }
  if (query.maxPriceMillimes != null) {
    chips.push({
      key: "maxPrice",
      label: `Prix max. : ${millimesToDinars(query.maxPriceMillimes)} DT`,
      onRemove: () => onChange({ maxPriceMillimes: undefined, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="sr-only">Filtres actifs :</span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          aria-label={`Retirer le filtre ${c.label}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-xs font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]"
        >
          <span>{c.label}</span>
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      ))}
      {hasActiveFilters(query) ? (
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[color:var(--color-muted-foreground)] underline underline-offset-4 hover:text-[color:var(--color-foreground)]"
        >
          Tout effacer
        </button>
      ) : null}
    </div>
  );
}
