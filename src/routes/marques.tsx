import { createFileRoute, Link } from "@tanstack/react-router";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BrandCard } from "@/components/brand/BrandCard";
import { getBrandSummaries } from "@/lib/brands";
import { useCatalogProducts } from "@/lib/catalog-products";
import { absoluteUrl } from "@/config/site";

const CANONICAL = absoluteUrl("/marques");
const TITLE = "Nos marques de montres | La Maison des Montres";
const DESC =
  "Découvrez les marques disponibles chez La Maison des Montres : Calvin Klein, Tissot, Swatch et plus encore, livrées partout en Tunisie.";

export const Route = createFileRoute("/marques")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const products = useCatalogProducts();
  const brands = getBrandSummaries(products);

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />

      <main id="content">
        <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)]">
          <div className="container-page py-8 md:py-10">
            <nav aria-label="Fil d’Ariane" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-[color:var(--color-muted-foreground)]">
                <li>
                  <Link
                    to="/"
                    className="hover:text-[color:var(--color-foreground)] hover:underline"
                  >
                    Accueil
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-[color:var(--color-foreground)]">
                  Marques
                </li>
              </ol>
            </nav>
            <p className="eyebrow">Sélection</p>
            <h1 className="t-h1 mt-2">Nos marques</h1>
            <p className="mt-3 max-w-xl text-sm text-[color:var(--color-muted-foreground)] md:text-base">
              Choisissez une marque pour découvrir directement toutes ses montres disponibles.
            </p>
          </div>
        </header>

        <section aria-label="Liste des marques" className="container-page py-8 md:py-12">
          <ul className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {brands.map((brand, i) => (
              <li key={brand.name}>
                <BrandCard brand={brand} priority={i === 0} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
