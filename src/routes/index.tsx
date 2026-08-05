import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { BrandLogosMarquee } from "@/components/home/BrandLogosMarquee";
import { TestimonialsMarquee } from "@/components/home/TestimonialsMarquee";
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
        <TestimonialsMarquee />
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

const HERO_AUTOPLAY_MS = 6500;
const HERO_TRANSITION_MS = 700;
type HeroDirection = 1 | -1;

function Hero({ slides }: { slides: PublicHeroSlide[] }) {
  const allSlides = slides.length > 5 ? slides.slice(0, 5) : slides.length ? slides : [fallbackHero];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [incomingReady, setIncomingReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<HeroDirection>(1);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const slide = allSlides[currentIndex] ?? allSlides[0];
  const incomingSlide = incomingIndex === null ? null : allSlides[incomingIndex];

  const goToSlide = useCallback(
    (nextIndex: number, direction: HeroDirection = nextIndex >= currentIndex ? 1 : -1) => {
      const safeIndex = (nextIndex + allSlides.length) % allSlides.length;
      if (safeIndex === currentIndex || incomingIndex !== null) return;

      if (reducedMotion) {
        setCurrentIndex(safeIndex);
        return;
      }

      setIncomingReady(false);
      setTransitionDirection(direction);
      setIncomingIndex(safeIndex);
    },
    [allSlides.length, currentIndex, incomingIndex, reducedMotion],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (incomingIndex === null || !incomingReady) return;
    const frame = window.requestAnimationFrame(() => setIsTransitioning(true));
    let cleanupFrame: number | null = null;
    const timer = window.setTimeout(() => {
      setCurrentIndex(incomingIndex);
      // Keep the already decoded incoming image visible while the hidden
      // layer receives the new src. Reveal that layer on the next frame so
      // React never exposes a blank image during reconciliation.
      cleanupFrame = window.requestAnimationFrame(() => {
        setIncomingIndex(null);
        setIncomingReady(false);
        setIsTransitioning(false);
      });
    }, HERO_TRANSITION_MS);
    return () => {
      window.cancelAnimationFrame(frame);
      if (cleanupFrame !== null) window.cancelAnimationFrame(cleanupFrame);
      window.clearTimeout(timer);
    };
  }, [incomingIndex, incomingReady]);

  useEffect(() => {
    if (allSlides.length <= 1 || paused || reducedMotion || incomingIndex !== null) return;
    const timer = window.setInterval(() => {
      goToSlide(currentIndex + 1, 1);
    }, HERO_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [allSlides.length, currentIndex, goToSlide, incomingIndex, paused, reducedMotion]);

  useEffect(() => {
    if (allSlides.length <= 1 || typeof window === "undefined") return;
    const nextSlide = allSlides[(currentIndex + 1) % allSlides.length];
    if (!nextSlide?.imageUrl) return;
    const image = new Image();
    image.decoding = "async";
    image.src = nextSlide.imageUrl;
  }, [allSlides, currentIndex]);

  const activeDotIndex = incomingIndex ?? currentIndex;
  const imageTransition = isTransitioning ? "transition-transform duration-700 ease-out" : "transition-none";
  const currentImageTransform = isTransitioning
    ? transitionDirection === 1
      ? "-translate-x-full"
      : "translate-x-full"
    : "translate-x-0";
  const incomingImageTransform = isTransitioning
    ? "translate-x-0"
    : transitionDirection === 1
      ? "translate-x-full"
      : "-translate-x-full";

  return (
    <section
      id="hero-carousel"
      className="relative isolate overflow-hidden bg-[color:var(--color-primary)]"
      aria-roledescription="carousel"
      aria-label="Présentation de la boutique"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="absolute inset-0" aria-live={paused ? "polite" : "off"}>
        <img
          src={slide.imageUrl}
          sizes="100vw"
          alt={slide.imageAlt ?? slide.title}
          width={1600}
          height={900}
          loading="eager"
          fetchPriority={currentIndex === 0 ? "high" : "low"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover object-center will-change-transform ${imageTransition} ${currentImageTransform}`}
        />
        {incomingSlide && (
          <img
            src={incomingSlide.imageUrl}
            sizes="100vw"
            alt={incomingSlide.imageAlt ?? incomingSlide.title}
            width={1600}
            height={900}
            loading="eager"
            fetchPriority="low"
            decoding="async"
            aria-hidden
            onLoad={(event) => {
              const image = event.currentTarget;
              if (typeof image.decode !== "function") {
                setIncomingReady(true);
                return;
              }
              void image.decode().catch(() => undefined).finally(() => setIncomingReady(true));
            }}
            onError={() => {
              setIncomingIndex(null);
              setIncomingReady(false);
              setIsTransitioning(false);
            }}
            className={`absolute inset-0 h-full w-full object-cover object-center will-change-transform ${imageTransition} ${incomingImageTransform}`}
          />
        )}
      </div>
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
      {allSlides.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-1.5" role="group" aria-label="Contrôles du carrousel">
          <button
            type="button"
            aria-label="Slide précédente"
            aria-controls="hero-carousel"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15 md:inline-flex"
            onClick={() => goToSlide(currentIndex - 1, -1)}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          {allSlides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Afficher la slide ${index + 1}`}
              aria-current={index === activeDotIndex ? "true" : undefined}
              aria-controls="hero-carousel"
              className="group relative flex h-11 w-11 items-center justify-center"
              onClick={() => goToSlide(index)}
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${index === activeDotIndex ? "w-7 bg-white" : "w-1.5 bg-white/50 group-hover:bg-white/80"}`} />
            </button>
          ))}
          <button
            type="button"
            aria-label="Slide suivante"
            aria-controls="hero-carousel"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15 md:inline-flex"
            onClick={() => goToSlide(currentIndex + 1, 1)}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
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
