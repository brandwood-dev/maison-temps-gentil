/**
 * Etats vides du catalogue : catégorie sans produit ou filtres sans résultat.
 */
import { PackageSearch } from "lucide-react";

type Variant =
  | { kind: "empty-category"; browseAllHref?: string }
  | { kind: "no-results"; onReset: () => void };

export function CatalogEmptyState({ variant }: { variant: Variant }) {
  if (variant.kind === "empty-category") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-cream)] px-6 py-16 text-center">
        <PackageSearch
          className="h-8 w-8 text-[color:var(--color-muted-foreground)]"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="max-w-md text-sm text-[color:var(--color-foreground)]">
          Aucune montre disponible dans cette catégorie pour le moment.
        </p>
        <a
          href={variant.browseAllHref ?? "/montres"}
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-4 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-background)] hover:underline"
        >
          Découvrir toutes les montres
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-cream)] px-6 py-16 text-center">
      <PackageSearch
        className="h-8 w-8 text-[color:var(--color-muted-foreground)]"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="max-w-md text-sm text-[color:var(--color-foreground)]">
        Aucun résultat ne correspond à vos filtres.
      </p>
      <button
        type="button"
        onClick={variant.onReset}
        className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-4 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
