import { SlidersHorizontal } from "lucide-react";
import { CATALOG_SORT_UI_OPTIONS } from "@/lib/catalog";
import type { CatalogSort } from "@/types/catalog";

type Props = {
  totalItems: number;
  sort: CatalogSort;
  onSortChange: (s: CatalogSort) => void;
  onOpenMobileFilters: () => void;
  activeFilterCount: number;
};

function resultsLabel(total: number): string {
  if (total <= 0) return "0 résultat";
  if (total === 1) return "1 résultat";
  return `${total} résultats`;
}

export function CatalogToolbar({
  totalItems,
  sort,
  onSortChange,
  onOpenMobileFilters,
  activeFilterCount,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] py-4">
      <p
        className="text-sm text-[color:var(--color-muted-foreground)]"
        aria-live="polite"
        role="status"
      >
        {resultsLabel(totalItems)}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)] lg:hidden"
          aria-haspopup="dialog"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Filtrer
          {activeFilterCount > 0 ? (
            <span
              className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--color-foreground)] px-1 text-[11px] font-semibold text-[color:var(--color-primary-foreground)]"
              aria-label={`${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""} actif${activeFilterCount > 1 ? "s" : ""}`}
            >
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <label className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]">
          <span className="hidden sm:inline">Trier par</span>
          <span className="sr-only sm:hidden">Trier par</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CatalogSort)}
            className="h-11 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm font-medium text-[color:var(--color-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          >
            {CATALOG_SORT_UI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
