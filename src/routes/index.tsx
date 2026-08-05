import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { BrandLogosMarquee } from "@/components/home/BrandLogosMarquee";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCatalogProducts } from "@/lib/catalog-products";
import { useCart } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/meta-pixel";
import type { Product } from "@/types/product";
import { absoluteUrl } from "@/config/site";
import { getPublicHeroSlides, type PublicHeroSlide } from "@/lib/catalog-api";

export const Route = createFileRoute("/")({
  loader: async () => ({ heroSlides: await getPublicHeroSlides().catch(() => []) }),
  head: () => ({
    meta: [{ property: "og:url", content: absoluteUrl() }],
    links: [
      { rel: "canonical", href: absoluteUrl() },
      { rel: "preconnect", href: "https://res.cloudinary.com" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { heroSlides } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />

      <main id="content">
        <Hero slides={heroSlides} />
        <TrustStrip />
        <CollectionsShowcase />
        <BrandLogosMarquee />
        <FeaturedProducts />
      </main>

      <SiteFooter />
    </div>
  );
}

const fallbackHero: PublicHeroSlide = {
  id: "fallback",
  tagline: "La Maison des Montres",
  title: "Le temps, avec élégance.",
  subtitle: "Découvrez une sélection de montres pour chaque style et chaque occasion.",
  ctaPrimaryLabel: "Découvrir la collection",
  ctaPrimaryHref: "/montres",
  ctaSecondaryLabel: "Voir les promotions",
  ctaSecondaryHref: "/promotions",
  imageUrl: "https://res.cloudinary.com/dxkxiy900/image/upload/f_auto,q_auto,c_fill,g_auto/v1785813483/laurenz-heymann-al6s6JpnZis-unsplash_eemoes.jpg",
  sortOrder: 1,
  active: true,
};

function Hero({ slides }: { slides: PublicHeroSlide[] }) {
  const allSlides = slides.length ? slides.slice(0, 5) : [fallbackHero];
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = allSlides[activeIndex] ?? allSlides[0];

  useEffect(() => {
    if (paused || allSlides.length <= 1) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % allSlides.length), 6000);
    return () => window.clearInterval(timer);
  }, [allSlides.length, paused]);

  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--color-primary)]" aria-roledescription="carousel" aria-label="Présentation de la boutique" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <img
        key={slide.id}
        src={slide.imageUrl}
        sizes="100vw"
        alt={slide.imageAlt ?? slide.title}
        width={1600}
        height={900}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500"
      />
      <div aria-hidden className="absolute inset-0 bg-[image:var(--hero-overlay)]" />
      <div className="container-page relative flex min-h-[520px] flex-col justify-end py-14 sm:min-h-[560px] md:min-h-[620px] md:justify-center md:py-24 lg:min-h-[680px]">
        <div className="max-w-xl">
          <p className="eyebrow text-[color:var(--color-gold)]">{slide.tagline}</p>
          <h1 className="t-display mt-3 text-[color:var(--color-on-image)]">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-md text-base text-[color:var(--color-on-image-muted)] md:text-lg">
            {slide.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <a href={slide.ctaPrimaryHref} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-gold)] px-6 text-base font-semibold text-[color:var(--color-gold-foreground)] transition-colors hover:brightness-95 sm:w-auto">{slide.ctaPrimaryLabel}<ArrowRight className="h-4 w-4" strokeWidth={1.75} /></a>
            <a href={slide.ctaSecondaryHref} className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-on-image-border)] bg-[color:var(--color-on-image-surface)] px-6 text-base font-semibold text-[color:var(--color-on-image)] backdrop-blur-sm hover:bg-[color:var(--color-on-image-border)] sm:w-auto">{slide.ctaSecondaryLabel}</a>
          </div>
        </div>
      </div>
      {allSlides.length > 1 && <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2"><button type="button" aria-label="Slide précédente" className="rounded-full border border-white/40 p-2 text-white" onClick={() => setActiveIndex((index) => (index - 1 + allSlides.length) % allSlides.length)}><ArrowLeft className="h-4 w-4" /></button>{allSlides.map((item, index) => <button key={item.id} type="button" aria-label={`Afficher la slide ${index + 1}`} aria-current={index === activeIndex} className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-7 bg-white" : "w-2 bg-white/50"}`} onClick={() => setActiveIndex(index)} />)}<button type="button" aria-label="Slide suivante" className="rounded-full border border-white/40 p-2 text-white" onClick={() => setActiveIndex((index) => (index + 1) % allSlides.length)}><ArrowRight className="h-4 w-4" /></button></div>}
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
