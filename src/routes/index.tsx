import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { LmmButton } from "@/components/brand/LmmButton";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCatalogProducts } from "@/lib/catalog-products";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types/product";
import { absoluteUrl } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ property: "og:url", content: absoluteUrl() }],
    links: [{ rel: "canonical", href: absoluteUrl() }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />

      <main id="content">
        <Hero />
        <TrustStrip />
        <FeaturedProducts />
      </main>

      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-[color:var(--color-surface-cream)]">
      <div className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-20 lg:py-24">
        <div className="max-w-xl">
          <p className="eyebrow">La Maison des Montres</p>
          <h1 className="t-display mt-3 text-[color:var(--color-foreground)]">
            Le temps, avec <em className="not-italic text-[color:var(--color-gold)]">élégance</em>.
          </h1>
          <p className="mt-5 max-w-md text-base text-[color:var(--color-muted-foreground)] md:text-lg">
            Découvrez une sélection de montres pour chaque style et chaque occasion.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LmmButton size="lg" rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}>
              Découvrir la collection
            </LmmButton>
            <LmmButton size="lg" variant="secondary">
              Voir les promotions
            </LmmButton>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)]"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <Clock className="h-10 w-10 text-[color:var(--color-gold)]" strokeWidth={1.25} />
              <p className="text-xs font-medium tracking-[0.2em] text-[color:var(--color-muted-foreground)] uppercase">
                Emplacement visuel
              </p>
              <p className="max-w-[220px] text-xs text-[color:var(--color-muted-foreground)]">
                Photo de montre à renseigner ultérieurement.
              </p>
            </div>
            <div className="absolute inset-x-6 bottom-6 h-px bg-[color:var(--color-border)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const products = useCatalogProducts();
  const { addItem } = useCart();
  const handleAddToCart = (p: Product, quantity: number) => addItem(p.id, quantity);
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-6 max-w-2xl md:mb-8">
        <p className="eyebrow">Sélection</p>
        <h2 className="t-h1 mt-2">Nos montres</h2>
      </div>
      <ProductGrid products={products} onAddToCart={handleAddToCart} />
    </section>
  );
}
