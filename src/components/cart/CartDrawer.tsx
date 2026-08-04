import { Link } from "@tanstack/react-router";
import { ShoppingBag, Truck } from "lucide-react";
import { useMemo } from "react";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PRODUCTS } from "@/fixtures/products";
import { useCart, useCartDrawer } from "@/lib/cart-store";
import { useNow } from "@/lib/now-store";
import { formatPriceTND, getCurrentPriceMillimes } from "@/lib/product-pricing";
import type { Product } from "@/types/product";

export function CartDrawer() {
  const { open, lastAddedProductId, addCount, closeDrawer } = useCartDrawer();
  const { items, removeItem, setQuantity } = useCart();
  const nowTs = useNow();
  const now = useMemo(() => new Date(nowTs), [nowTs]);

  const lines = items
    .map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      product:
        (PRODUCTS.find(
          (p) => p.id === it.productId && p.availability !== "hidden",
        ) as Product | undefined) ?? null,
    }))
    .filter((l): l is { productId: string; quantity: number; product: Product } =>
      Boolean(l.product),
    );

  // La ligne qui vient d'être ajoutée apparaît en premier.
  const orderedLines = lastAddedProductId
    ? [
        ...lines.filter((l) => l.productId === lastAddedProductId),
        ...lines.filter((l) => l.productId !== lastAddedProductId),
      ]
    : lines;

  const subtotalMillimes = orderedLines
    .filter((l) => l.product.availability === "available")
    .reduce((sum, l) => sum + getCurrentPriceMillimes(l.product, now) * l.quantity, 0);

  const totalQuantity = orderedLines.reduce((sum, l) => sum + l.quantity, 0);
  const isEmpty = orderedLines.length === 0;

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : closeDrawer())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-[color:var(--color-border)] bg-[color:var(--color-background)] p-0 sm:max-w-[420px]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold text-[color:var(--color-foreground)]">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Mon panier
            {totalQuantity > 0 ? (
              <span className="text-sm font-normal text-[color:var(--color-muted-foreground)]">
                ({totalQuantity})
              </span>
            ) : null}
          </SheetTitle>
        </div>

        <p aria-live="polite" className="sr-only">
          {addCount > 0 && lastAddedProductId ? "Produit ajouté au panier." : ""}
        </p>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag
              className="h-8 w-8 text-[color:var(--color-muted-foreground)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="text-sm text-[color:var(--color-foreground)]">Votre panier est vide.</p>
            <Link
              to="/montres"
              search={{}}
              onClick={closeDrawer}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:opacity-90"
            >
              Découvrir les montres
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="flex list-none flex-col gap-3">
                {orderedLines.map((line) => (
                  <li key={line.productId}>
                    <CartLineItem
                      product={line.product}
                      quantity={line.quantity}
                      now={now}
                      highlighted={line.productId === lastAddedProductId}
                      onRemove={() => removeItem(line.productId)}
                      onQuantityChange={(q) => setQuantity(line.productId, q)}
                      onNavigate={closeDrawer}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-4 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[color:var(--color-muted-foreground)]">
                  Sous-total
                </span>
                <span className="text-lg font-semibold text-[color:var(--color-foreground)]">
                  {formatPriceTND(subtotalMillimes)}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
                <Truck className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Paiement à la livraison partout en Tunisie.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/commande"
                  onClick={closeDrawer}
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-opacity hover:opacity-90"
                >
                  Commander
                </Link>
                <Link
                  to="/panier"
                  onClick={closeDrawer}
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-6 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-background)]"
                >
                  Voir mon panier
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
