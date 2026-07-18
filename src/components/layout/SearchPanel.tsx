import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export function SearchPanel({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        className={`absolute inset-x-0 top-0 bg-[color:var(--color-background)] shadow-[var(--shadow-soft)] transition-transform duration-200 ${open ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="container-page py-4">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <label htmlFor="site-search" className="sr-only">
              Rechercher un produit
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 focus-within:border-[color:var(--color-gold)]">
              <Search
                className="h-5 w-5 shrink-0 text-[color:var(--color-muted-foreground)]"
                strokeWidth={1.75}
              />
              <input
                id="site-search"
                ref={inputRef}
                type="search"
                autoComplete="off"
                placeholder="Rechercher une montre, une marque..."
                className="h-11 w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-[color:var(--color-muted-foreground)]"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la recherche"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-[color:var(--color-surface-cream)]"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </form>

          <div className="mt-6 min-h-[120px] pb-6">
            <p className="eyebrow mb-3">Suggestions</p>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Commencez à taper pour voir des résultats. Les suggestions apparaîtront ici
              prochainement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
