import { Link } from "@tanstack/react-router";

import { catalogQueryToSearch } from "@/lib/catalog";
import { getBrandSummaries } from "@/lib/brands";

function BrandTile({ name }: { name: string }) {
  return (
    <Link
      to="/montres"
      search={catalogQueryToSearch({ brands: [name] })}
      aria-label={`Voir les montres ${name}`}
      className="flex h-16 w-[9.5rem] shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-4 transition-all duration-300 hover:border-[color:var(--color-gold)] focus-visible:border-[color:var(--color-gold)] motion-reduce:transition-none sm:h-20 sm:w-[12rem]"
    >
      <span className="text-center text-[13px] leading-tight font-semibold tracking-[0.18em] text-[color:var(--color-foreground)] uppercase sm:text-sm">
        {name}
      </span>
    </Link>
  );
}

export function BrandLogosMarquee() {
  const brands = getBrandSummaries();
  if (brands.length === 0) return null;

  const track = brands.length < 6 ? [...brands, ...brands, ...brands] : brands;

  return (
    <section aria-labelledby="brands-featured" className="py-12 md:py-16">
      <div className="container-page mb-6 max-w-2xl md:mb-10">
        <p className="eyebrow">Marques</p>
        <h2 id="brands-featured" className="t-h1 mt-2">
          Nos marques à la une
        </h2>
      </div>

      <div className="marquee-mask relative">
        <div className="marquee-track flex w-max items-center gap-6">
          <div className="flex w-max items-center gap-6">
            {track.map((b, i) => (
              <BrandTile key={`a-${b.name}-${i}`} name={b.name} />
            ))}
          </div>
          <div aria-hidden className="flex w-max items-center gap-6">
            {track.map((b, i) => (
              <BrandTile key={`b-${b.name}-${i}`} name={b.name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
