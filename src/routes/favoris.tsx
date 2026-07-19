import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PRODUCTS } from "@/fixtures/products";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/favoris")({
  head: () => ({
    meta: [
      { title: "Mes favoris | La Maison des Montres" },
      {
        name: "description",
        content: "Retrouvez les montres que vous avez ajoutées à vos favoris.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { ids, hydrated } = useFavorites();
  const { addItem } = useCart();

  const products = useMemo<Product[]>(() => {
    if (!hydrated) return [];
    const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is Product => Boolean(p) && p!.availability !== "hidden");
  }, [ids, hydrated]);

  const count = products.length;
  const countLabel = count <= 1 ? "1 montre favorite" : `${count} montres favorites`;

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <h1 className="t-h1 text-[color:var(--color-foreground)]">Mes favoris</h1>

        {!hydrated ? (
          <p className="mt-6 text-sm text-[color:var(--color-muted-foreground)]">Chargement…</p>
        ) : count === 0 ? (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-6 py-12 text-center">
            <p className="text-base text-[color:var(--color-foreground)]">
              Vous n’avez pas encore ajouté de montre à vos favoris.
            </p>
            <Link
              to="/montres"
              search={{}}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928]"
            >
              Découvrir les montres
            </Link>
          </div>
        ) : (
          <>
            <p
              className="mt-2 text-sm text-[color:var(--color-muted-foreground)]"
              aria-live="polite"
            >
              {countLabel}
            </p>
            <div className="mt-8">
              <ProductGrid products={products} onAddToCart={(p, q) => addItem(p.id, q)} />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
