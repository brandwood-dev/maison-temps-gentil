import { Link } from "@tanstack/react-router";

import { catalogQueryToSearch } from "@/lib/catalog";
import { getBrandSummaries } from "@/lib/brands";

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
  if (brands.length === 0) return null;

  // Triple the track on small catalogs so the loop feels continuous.
  const track = brands.length < 6 ? [...brands, ...brands, ...brands] : brands;

  return (
    <section aria-labelledby="brands-featured" className="overflow-hidden py-12 md:py-16">
      <div className="container-page mb-6 max-w-2xl md:mb-10">
        <p className="eyebrow">Marques</p>
        <h2 id="brands-featured" className="t-h1 mt-2">
          Nos marques à la une
        </h2>
      </div>

      <div className="brand-marquee-mask relative">
        <div className="brand-marquee-track marquee-track inline-flex items-center gap-8 sm:gap-12">
          <div className="brand-marquee-group inline-flex items-center gap-8 sm:gap-12">
            {track.map((b, i) => (
              <BrandLogo key={`a-${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
            ))}
          </div>
          <div aria-hidden className="brand-marquee-group inline-flex items-center gap-8 sm:gap-12">
            {track.map((b, i) => (
              <BrandLogo key={`b-${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
