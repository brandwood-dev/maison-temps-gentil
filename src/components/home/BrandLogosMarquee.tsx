import { Link } from "@tanstack/react-router";

import { catalogQueryToSearch } from "@/lib/catalog";
import { getBrandSummaries } from "@/lib/brands";

function BrandLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  return (
    <Link
      to="/montres"
      search={catalogQueryToSearch({ brands: [name] })}
      aria-label={`Voir les montres ${name}`}
      className="group flex h-16 shrink-0 items-center justify-center px-6 transition-opacity duration-300 hover:opacity-70 focus-visible:opacity-70 motion-reduce:transition-none sm:h-20 sm:px-8"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          width={160}
          height={48}
          loading="lazy"
          className="h-6 w-auto max-w-[9rem] object-contain grayscale transition-all duration-300 group-hover:grayscale-0 sm:h-7 sm:max-w-[10rem]"
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
    <section aria-labelledby="brands-featured" className="section-padding overflow-hidden">
      <div className="container-page mb-6 max-w-2xl md:mb-10">
        <p className="eyebrow">Marques</p>
        <h2 id="brands-featured" className="t-h1 mt-2">
          Nos marques à la une
        </h2>
      </div>

      <div className="marquee-mask relative">
        <div className="marquee-track flex w-max items-center gap-8 sm:gap-12">
          <div className="flex w-max items-center gap-8 sm:gap-12">
            {track.map((b, i) => (
              <BrandLogo key={`a-${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
            ))}
          </div>
          <div aria-hidden className="flex w-max items-center gap-8 sm:gap-12">
            {track.map((b, i) => (
              <BrandLogo key={`b-${b.name}-${i}`} name={b.name} logoUrl={b.logoUrl} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
