import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { CatalogQuery, CatalogResult } from "@/types/catalog";
import { CatalogFilters } from "./CatalogFilters";

type Props = {
  open: boolean;
  onClose: () => void;
  query: CatalogQuery;
  availableFilters: CatalogResult["availableFilters"];
  totalItems: number;
  onChange: (patch: Partial<CatalogQuery>) => void;
  onReset: () => void;
};

export function CatalogMobileFilters({
  open,
  onClose,
  query,
  availableFilters,
  totalItems,
  onChange,
  onReset,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="left"
        className="flex w-[92%] max-w-md flex-col gap-0 bg-[color:var(--color-background)] p-0"
      >
        <div className="border-b border-[color:var(--color-border)] px-5 py-4">
          <SheetTitle className="text-base font-semibold">Filtrer</SheetTitle>
          <SheetDescription className="sr-only">
            Affiner les résultats par marque, couleur, prix et promotion.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <CatalogFilters
            idPrefix="mobile"
            query={query}
            availableFilters={availableFilters}
            onChange={onChange}
          />
        </div>

        <div className="flex items-center gap-2 border-t border-[color:var(--color-border)] px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-3 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
          >
            Voir {totalItems} résultat{totalItems > 1 ? "s" : ""}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
