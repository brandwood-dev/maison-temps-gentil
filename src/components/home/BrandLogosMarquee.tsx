import { Link } from "@tanstack/react-router";

import { catalogQueryToSearch } from "@/lib/catalog";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getBrandSummaries } from "@/lib/brands";
import { SectionHeading } from "@/components/brand/SectionHeading";

function BrandLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  return (
    <Link
      to="/montres"
      search={catalogQueryToSearch({ brands: [name] })}
      aria-label={`Voir les montres ${name}`}
      className="group flex h-20 w-44 shrink-0 items-center justify-center px-4 transition-opacity duration-300 hover:opacity-60 focus-visible:opacity-60 motion-reduce:transition-none sm:h-24 sm:w-60 sm:px-6"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          width={180}
          height={56}
          loading="lazy"
          className="h-7 w-full max-w-40 object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100 sm:h-9 sm:max-w-48"
        />
      ) : (
        <span className="text-center text-[13px] leading-tight font-semibold tracking-[0.18em] text-[color:var(--color-foreground)] uppercase sm:text-sm">
          {name}
        </span>
      )}
    </Link>
  );
}

export function BrandLogosMarquee() {
  const brands = getBrandSummaries();
  const prefersReducedMotion = usePrefersReducedMotion();
  if (brands.length === 0) return null;

  // Triple the track on small catalogs so the loop feels continuous.
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
      </div>

      <div className="brand-marquee-mask rail-bleed relative">
        <div className="brand-marquee-track marquee-track inline-flex items-center gap-8 sm:gap-12">
          <div className="brand-marquee-group inline-flex items-center gap-8 sm:gap-12">
            {track.map((b, i) => (
              <BrandLogo key={`a-${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
            ))}
          </div>
          {!prefersReducedMotion ? (
            <div
              aria-hidden="true"
              className="brand-marquee-group inline-flex items-center gap-8 sm:gap-12"
            >
              {track.map((b, i) => (
                <BrandLogo key={`b-${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
