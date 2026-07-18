import { useRef } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";


type Props = { open: boolean; onClose: () => void };

export function SearchPanel({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-label="Recherche"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
        className="left-0 right-0 top-0 z-50 grid max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)] p-0 shadow-[var(--shadow-soft)] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top sm:rounded-none"
      >
        <div className="sr-only">
          <DialogTitle>Rechercher</DialogTitle>
          <DialogDescription>
            Rechercher une montre ou une marque sur La Maison des Montres
          </DialogDescription>
        </div>

        <div className="container-page py-4">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 pr-12"
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
          </form>

          <div className="mt-6 min-h-[120px] pb-6">
            <p className="eyebrow mb-3">Suggestions</p>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Commencez à taper pour voir des résultats. Les suggestions apparaîtront ici
              prochainement.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
