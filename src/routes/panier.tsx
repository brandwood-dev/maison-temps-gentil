import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useCart } from "@/lib/cart-store";
import { useCatalogProducts } from "@/lib/catalog-products";
import { useNow } from "@/lib/now-store";
import { formatPriceTND, getCurrentPriceMillimes, isPromotionActive } from "@/lib/product-pricing";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Votre panier | La Maison des Montres" },
      {
        name: "description",
        content: "Consultez et modifiez les articles de votre panier avant de passer commande.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

type LineData = {
  productId: string;
  quantity: number;
  product: Product | null;
};

function CartPage() {
  const { items, removeItem, setQuantity, hydrated } = useCart();
  const products = useCatalogProducts();
  const nowTs = useNow();
  const now = useMemo(() => new Date(nowTs), [nowTs]);

  const lines: LineData[] = items.map((it) => ({
    productId: it.productId,
    quantity: it.quantity,
    product: products.find((p) => p.id === it.productId && p.availability !== "hidden") ?? null,
  }));

  const purchasableLines = lines.filter((l) => l.product && l.product.availability === "available");
  const subtotalMillimes = purchasableLines.reduce(
    (sum, l) => sum + getCurrentPriceMillimes(l.product!, now) * l.quantity,
    0,
  );

  const isEmpty = hydrated && lines.length === 0;

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <h1 className="t-h1 text-[color:var(--color-foreground)]">Votre panier</h1>

        {!hydrated ? (
          <p className="mt-6 text-sm text-[color:var(--color-muted-foreground)]">Chargement…</p>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <ul className="flex list-none flex-col gap-4">
              {lines.map((line) => (
                <li key={line.productId}>
                  <CartLine
                    line={line}
                    now={now}
                    onRemove={() => removeItem(line.productId)}
                    onQuantityChange={(q) => setQuantity(line.productId, q)}
                  />
                </li>
              ))}
            </ul>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Summary subtotalMillimes={subtotalMillimes} />
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-6 py-12 text-center">
      <ShoppingBag
        className="mx-auto h-8 w-8 text-[color:var(--color-muted-foreground)]"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="mt-4 text-base text-[color:var(--color-foreground)]">Votre panier est vide.</p>
      <Link
        to="/montres"
        search={{}}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928]"
      >
        Découvrir les montres
      </Link>
    </div>
  );
}

function CartLine({
  line,
  now,
  onRemove,
  onQuantityChange,
}: {
  line: LineData;
  now: Date;
  onRemove: () => void;
  onQuantityChange: (q: number) => void;
}) {
  const { product, quantity } = line;

  if (!product) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-4">
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Article non disponible.
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Retirer du panier"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-surface-cream)]"
        >
          <Trash2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    );
  }

  const image = product.images.find((i) => i.position === 1) ?? product.images[0];
  const promoActive = isPromotionActive(product.promotion, now);
  const unitMillimes = getCurrentPriceMillimes(product, now);
  const lineTotalMillimes = unitMillimes * quantity;
  const unavailable = product.availability === "unavailable";

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-3 sm:flex-row sm:p-4",
        unavailable && "opacity-90",
      )}
    >
      <Link
        to="/montres/$slug"
        params={{ slug: product.slug }}
        className="relative block h-24 w-24 shrink-0 self-start overflow-hidden rounded-[var(--radius-sm)] bg-white sm:h-28 sm:w-28"
        aria-label={product.name}
      >
        {image ? (
          <img
            src={image.optimizedUrl ?? image.url}
            srcSet={image.srcSet}
            sizes="112px"
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[color:var(--color-muted-foreground)]">
            Image
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
              {product.brand}
            </p>
            <h2 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--color-foreground)]">
              <Link
                to="/montres/$slug"
                params={{ slug: product.slug }}
                className="hover:text-[color:var(--color-gold)]"
              >
                {product.name}
              </Link>
            </h2>
            <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
              Réf.&nbsp;: {product.reference}
            </p>
            {unavailable ? (
              <p className="mt-1 text-xs font-medium text-[color:var(--color-muted-foreground)]">
                Actuellement indisponible
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${product.name} du panier`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-muted-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] hover:text-[color:var(--color-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          >
            <Trash2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[color:var(--color-foreground)]">
              {formatPriceTND(unitMillimes)}
            </span>
            {promoActive && product.promotion ? (
              <span className="text-xs text-[color:var(--color-muted-foreground)] line-through">
                {formatPriceTND(product.promotion.regularPriceMillimes)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <div
              className="inline-flex items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)]"
              role="group"
              aria-label={`Quantité pour ${product.name}`}
            >
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label={`Diminuer la quantité de ${product.name}`}
                className="inline-flex h-11 w-11 items-center justify-center transition-colors hover:bg-[color:var(--color-surface-cream)] disabled:cursor-not-allowed disabled:text-[color:var(--color-muted-foreground)]"
              >
                <Minus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
              <span
                aria-live="polite"
                className="inline-flex min-w-[2.5rem] items-center justify-center px-2 text-sm font-semibold tabular-nums"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(quantity + 1)}
                aria-label={`Augmenter la quantité de ${product.name}`}
                className="inline-flex h-11 w-11 items-center justify-center transition-colors hover:bg-[color:var(--color-surface-cream)]"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                Total ligne
              </p>
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                {formatPriceTND(lineTotalMillimes)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Summary({ subtotalMillimes }: { subtotalMillimes: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
        Résumé
      </h2>
      <dl className="mt-4 flex items-baseline justify-between">
        <dt className="text-sm text-[color:var(--color-muted-foreground)]">Sous-total</dt>
        <dd className="text-base font-semibold text-[color:var(--color-foreground)]">
          {formatPriceTND(subtotalMillimes)}
        </dd>
      </dl>
      <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
        Livraison calculée lors de la commande.
      </p>
      <Link
        to="/commande"
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928]"
      >
        Passer la commande
      </Link>
      <p className="mt-3 text-xs text-[color:var(--color-muted-foreground)]">
        Paiement à la livraison, partout en Tunisie.
      </p>
    </div>
  );
}
