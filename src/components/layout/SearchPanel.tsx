import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCatalogProducts } from "@/lib/catalog-products";
import type { Product } from "@/types/product";

type Props = { open: boolean; onClose: () => void; restoreFocus: () => void };

export function SearchPanel({ open, onClose, restoreFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const products = useCatalogProducts();
  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return [];

    return products
      .filter((product) => product.availability !== "hidden")
      .filter((product) => {
        const searchable = normalizeSearch(`${product.name} ${product.brand} ${product.reference}`);
        return searchable.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [products, query]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        aria-label="Recherche"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus();
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
            onSubmit={(event) => event.preventDefault()}
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
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </form>

          <div className="mt-6 min-h-[120px] pb-6">
            <p className="eyebrow mb-3">Suggestions</p>
            {!query.trim() ? (
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Commencez à taper pour rechercher une montre, une marque ou une référence.
              </p>
            ) : suggestions.length > 0 ? (
              <ul role="listbox" aria-label="Suggestions de produits" className="grid gap-1">
                {suggestions.map((product) => (
                  <Suggestion product={product} onSelect={onClose} key={product.id} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Aucun produit ne correspond à votre recherche.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Suggestion({ product, onSelect }: { product: Product; onSelect: () => void }) {
  const image = product.images[0];
  const [optimizedFailed, setOptimizedFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setOptimizedFailed(false);
  }, [image?.optimizedUrl, image?.url]);

  return (
    <li role="option">
      <a
        href={`/montres/${encodeURIComponent(product.slug)}`}
        onClick={onSelect}
        className="flex items-center gap-3 rounded-[var(--radius-md)] border border-transparent px-2 py-2 text-left transition-colors hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-cream)] focus-visible:border-[color:var(--color-gold)] focus-visible:outline-none"
      >
        {image ? (
          <img
            ref={imageRef}
            src={optimizedFailed ? image.url : (image.optimizedUrl ?? image.url)}
            srcSet={optimizedFailed ? undefined : image.srcSet}
            sizes="48px"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] object-cover"
            onError={() => {
              if (image.optimizedUrl && !optimizedFailed) {
                setOptimizedFailed(true);
              }
            }}
          />
        ) : (
          <span
            aria-hidden
            className="h-12 w-12 shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)]"
          />
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[color:var(--color-foreground)]">
            {product.name}
          </span>
          <span className="block truncate text-xs text-[color:var(--color-muted-foreground)]">
            {product.brand} · {product.reference}
          </span>
        </span>
      </a>
    </li>
  );
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
