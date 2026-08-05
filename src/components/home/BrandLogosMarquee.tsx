import { Link } from "@tanstack/react-router";

import { catalogQueryToSearch } from "@/lib/catalog";
import { SectionHeading } from "@/components/brand/SectionHeading";
import type { PublicBrand } from "@/lib/catalog-api";
import { useCatalogBrands } from "@/lib/catalog-products";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function BrandLogo({ brand }: { brand: PublicBrand }) {
  return (
    <Link
      to="/montres"
      search={catalogQueryToSearch({ brands: [brand.name] })}
      aria-label={`Voir les montres ${brand.name}`}
      className="group flex h-20 w-44 shrink-0 items-center justify-center px-4 transition-opacity duration-300 hover:opacity-60 focus-visible:opacity-60 motion-reduce:transition-none sm:h-24 sm:w-60 sm:px-6"
    >
      <span className="brand-logo-slot" aria-label={brand.logoUrl ? undefined : brand.name}>
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={`Logo ${brand.name}`}
            width={220}
            height={64}
            loading="lazy"
            decoding="async"
            className="brand-logo-image grayscale opacity-90 contrast-125 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : (
          <span className="text-center text-[13px] leading-tight font-semibold tracking-[0.18em] text-[color:var(--color-foreground)] uppercase sm:text-sm">
            {brand.name}
          </span>
        )}
      </span>
    </Link>
  );
}

export function BrandLogosMarquee() {
  const brands = useCatalogBrands();
  const prefersReducedMotion = usePrefersReducedMotion();
  if (brands.length === 0) return null;

  // Repeat short catalogues so the moving row stays visually continuous.
  const track =
    prefersReducedMotion || brands.length >= 6 ? brands : [...brands, ...brands, ...brands];

  return (
    <section
      aria-labelledby="brands-featured"
      className="section-deferred overflow-hidden bg-[color:var(--color-surface-cream)] py-12 md:py-16 lg:py-20"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Marques"
          title="Nos marques à la une"
          titleId="brands-featured"
          align="center"
        />
        <div className="hidden">
          <p className="eyebrow">Marques</p>
          <h2 id="brands-featured" className="t-h1 mt-2">
            Nos marques à la une
          </h2>
        </div>
      </div>

      <div className="brand-marquee-mask rail-bleed relative">
        <div className="brand-marquee-track marquee-track inline-flex items-center gap-8 sm:gap-12">
          <div className="brand-marquee-group inline-flex items-center gap-8 sm:gap-12">
            {track.map((brand, index) => (
              <BrandLogo key={`primary-${brand.name}-${index}`} brand={brand} />
            ))}
          </div>
          {!prefersReducedMotion ? (
            <div
              aria-hidden="true"
              className="brand-marquee-group inline-flex items-center gap-8 sm:gap-12"
            >
              {track.map((brand, index) => (
                <BrandLogo key={`duplicate-${brand.name}-${index}`} brand={brand} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
