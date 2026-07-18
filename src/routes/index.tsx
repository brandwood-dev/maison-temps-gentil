import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { LmmButton } from "@/components/brand/LmmButton";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PRODUCTS } from "@/fixtures/products";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader cartCount={0} />

      <main id="content">
        <Hero />
        <TrustStrip />
        <FeaturedProducts />
        <SystemPreview />
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

function SystemPreview() {
  return (
    <section className="container-page py-14 md:py-20">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow">Design system</p>
        <h2 className="t-h1 mt-2">Fondations visuelles</h2>
        <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
          Aperçu des tokens de base — provisoire, réservé à la validation interne.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="eyebrow mb-3">Couleurs</p>
          <div className="grid grid-cols-4 gap-2">
            <Swatch color="#1c1b1b" label="Noir" />
            <Swatch color="#FEFFFF" label="Blanc" bordered />
            <Swatch color="#f4f3ed" label="Crème" bordered />
            <Swatch color="#c89d54" label="Or" />
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Typographie</p>
          <div className="space-y-2">
            <p className="text-3xl font-semibold tracking-tight">Manrope 600</p>
            <p className="text-lg font-medium">Manrope 500 — Navigation</p>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Manrope 400 — Texte courant. Lisible, moderne, mobile-first.
            </p>
            <p className="text-base font-bold">Manrope 700 — 1 299 TND</p>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Boutons</p>
          <div className="flex flex-wrap gap-2">
            <LmmButton size="sm">Primary</LmmButton>
            <LmmButton size="sm" variant="secondary">
              Secondary
            </LmmButton>
            <LmmButton size="sm" variant="gold">
              Or
            </LmmButton>
            <LmmButton size="sm" variant="ghost">
              Ghost
            </LmmButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function Swatch({
  color,
  label,
  bordered = false,
}: {
  color: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div>
      <div
        className={`aspect-square w-full rounded-[var(--radius-md)] ${bordered ? "border border-[color:var(--color-border-strong)]" : ""}`}
        style={{ backgroundColor: color }}
      />
      <p className="mt-1.5 text-[11px] text-[color:var(--color-muted-foreground)]">{label}</p>
    </div>
  );
}
