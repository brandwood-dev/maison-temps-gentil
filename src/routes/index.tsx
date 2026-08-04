import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { BrandLogosMarquee } from "@/components/home/BrandLogosMarquee";
import { LmmButton } from "@/components/brand/LmmButton";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCatalogProducts } from "@/lib/catalog-products";
import { useCart } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/meta-pixel";
import type { Product } from "@/types/product";
import { absoluteUrl } from "@/config/site";

const HERO_BASE = "https://res.cloudinary.com/dxkxiy900/image/upload/f_auto,q_auto,c_fill,g_auto";
const HERO_ASSET = "v1785813483/laurenz-heymann-al6s6JpnZis-unsplash_eemoes.jpg";

const heroSrc = (width: number, height: number) =>
  `${HERO_BASE},w_${width},h_${height}/${HERO_ASSET}`;
const HERO_SRC = heroSrc(1600, 900);
const HERO_SRCSET = [
  `${heroSrc(640, 800)} 640w`,
  `${heroSrc(960, 900)} 960w`,
  `${heroSrc(1280, 720)} 1280w`,
  `${heroSrc(1920, 900)} 1920w`,
].join(", ");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ property: "og:url", content: absoluteUrl() }],
    links: [
      { rel: "canonical", href: absoluteUrl() },
      { rel: "preconnect", href: "https://res.cloudinary.com" },
      {
        rel: "preload",
        as: "image",
        href: HERO_SRC,
        imageSrcSet: HERO_SRCSET,
        imageSizes: "100vw",
        fetchPriority: "high",
      },
    ],
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
        <BrandLogosMarquee />
      </main>

      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--color-primary)]">
      <img
        src={HERO_SRC}
        srcSet={HERO_SRCSET}
        sizes="100vw"
        alt="Montre-bracelet élégante"
        width={1600}
        height={900}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[68%_center] md:object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-[image:var(--hero-overlay)]" />
      <div className="container-page relative flex min-h-[520px] flex-col justify-end py-14 sm:min-h-[560px] md:min-h-[620px] md:justify-center md:py-24 lg:min-h-[680px]">
        <div className="max-w-xl">
          <p className="eyebrow text-[color:var(--color-gold)]">La Maison des Montres</p>
          <h1 className="t-display mt-3 text-[color:var(--color-on-image)]">
            Le temps, avec <em className="not-italic text-[color:var(--color-gold)]">élégance</em>.
          </h1>
          <p className="mt-5 max-w-md text-base text-[color:var(--color-on-image-muted)] md:text-lg">
            Découvrez une sélection de montres pour chaque style et chaque occasion.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <LmmButton
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
              className="w-full sm:w-auto"
            >
              Découvrir la collection
            </LmmButton>
            <LmmButton
              size="lg"
              variant="ghost"
              className="w-full border border-[color:var(--color-on-image-border)] bg-[color:var(--color-on-image-surface)] text-[color:var(--color-on-image)] backdrop-blur-sm hover:bg-[color:var(--color-on-image-border)] sm:w-auto"
            >
              Voir les promotions
            </LmmButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const products = useCatalogProducts();
  const { addItem } = useCart();
  const handleAddToCart = (p: Product, quantity: number) => {
    addItem(p.id, quantity);
    trackAddToCart(p, quantity);
  };
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
