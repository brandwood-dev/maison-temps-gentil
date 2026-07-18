import { useState } from "react";
import { Expand } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import type { Product, ProductImage } from "@/types/product";

type Props = { product: Product };

/**
 * Accessible gallery: main image + thumbnails + Radix Dialog zoom.
 * Focus is trapped by Radix and restored to the trigger on close.
 */
export function ProductGallery({ product }: Props) {
  const images =
    product.images.length > 0 ? [...product.images].sort((a, b) => a.position - b.position) : [];
  const [activeId, setActiveId] = useState<string | null>(images[0]?.id ?? null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const active: ProductImage | undefined = images.find((i) => i.id === activeId) ?? images[0];

  const zoomLabel = `Agrandir l'image de ${product.name}`;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-white md:aspect-[4/5]">
        {active ? (
          <img
            key={active.id}
            src={active.url}
            alt={active.alt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-6 md:p-10"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[color:var(--color-muted-foreground)]">
            Image indisponible
          </div>
        )}

        {active ? (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label={zoomLabel}
            className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/90 text-[color:var(--color-foreground)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          >
            <Expand className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="flex list-none flex-wrap gap-2">
          {images.map((img) => {
            const isActive = img.id === active?.id;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(img.id)}
                  aria-label={`Voir l'image : ${img.alt}`}
                  aria-current={isActive}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-[var(--radius-sm)] border bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)] md:h-20 md:w-20",
                    isActive
                      ? "border-[color:var(--color-foreground)]"
                      : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]",
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-1.5"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <DialogPrimitive.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col p-4 md:p-8 focus:outline-none">
            <DialogPrimitive.Title className="sr-only">{zoomLabel}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {active?.alt ?? "Image du produit"}
            </DialogPrimitive.Description>
            <div className="flex justify-end">
              <DialogPrimitive.Close
                aria-label="Fermer l'aperçu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
              >
                <span aria-hidden className="text-2xl leading-none">
                  ×
                </span>
              </DialogPrimitive.Close>
            </div>
            <div className="mt-2 flex flex-1 items-center justify-center">
              {active ? (
                <img
                  src={active.url}
                  alt={active.alt}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="text-white">Image indisponible</p>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
