import { Link } from "@tanstack/react-router";
import { ShoppingBag, Truck } from "lucide-react";
import { useMemo } from "react";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart, useCartDrawer } from "@/lib/cart-store";
import { useCatalogProducts } from "@/lib/catalog-products";
import { useNow } from "@/lib/now-store";
import { formatPriceTND, getCurrentPriceMillimes } from "@/lib/product-pricing";
import type { Product } from "@/types/product";

export function CartDrawer() {
  const { open, focusProductId, closeDrawer } = useCartDrawer();
  const { items, removeItem, setQuantity } = useCart();
  const products = useCatalogProducts();
  const nowTs = useNow();
  const now = useMemo(() => new Date(nowTs), [nowTs]);

  const lines = items
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product:
        (products.find(
          (product) => product.id === item.productId && product.availability === "available",
        ) as Product | undefined) ?? null,
    }))
    .filter((line): line is { productId: string; quantity: number; product: Product } =>
      Boolean(line.product),
    );

  const orderedLines = focusProductId
    ? [
        ...lines.filter((line) => line.productId === focusProductId),
        ...lines.filter((line) => line.productId !== focusProductId),
      ]
    : lines;
  const subtotalMillimes = orderedLines
    .filter((line) => line.product.availability === "available")
    .reduce((sum, line) => sum + getCurrentPriceMillimes(line.product, now) * line.quantity, 0);
  const totalQuantity = orderedLines.reduce((sum, line) => sum + line.quantity, 0);
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
                      highlighted={line.productId === focusProductId}
                      onRemove={() => removeItem(line.productId)}
                      onQuantityChange={(quantity) => setQuantity(line.productId, quantity)}
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
