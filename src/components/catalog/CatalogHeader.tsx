import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type Crumb = { label: string; href?: string };

type Props = {
  crumbs: Crumb[];
  title: string;
  intro?: string;
  totalItems: number;
  /** Image de bannière (Cloudinary). Sans image, fond uni de repli. */
  imageSrc?: string;
  imageSrcSet?: string;
};

function resultsLabel(total: number): string {
  if (total <= 0) return "0 montre";
  if (total === 1) return "1 montre";
  return `${total} montres`;
}

export function CatalogHeader({
  crumbs,
  title,
  intro,
  totalItems,
  imageSrc,
  imageSrcSet,
}: Props) {
  return (
    <header className="relative isolate overflow-hidden border-b border-[color:var(--color-border)] bg-[color:var(--color-noir,#0d0d0d)]">
      {imageSrc ? (
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="100vw"
          width={1600}
          height={480}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Overlay : voile uni + dégradé pour un contraste AA sur tout le texte */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/70 via-black/50 to-black/75"
      />

      <div className="container-page relative flex min-h-[13rem] flex-col items-center justify-center py-10 text-center md:min-h-[17rem] md:py-14 lg:min-h-[20rem]">
        <nav aria-label="Fil d’Ariane" className="mb-4">
          <ol className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-white/80">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
                  {c.href && !isLast ? (
                    <Link to={c.href} className="underline-offset-4 hover:text-white hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "font-medium text-white" : undefined}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                  {!isLast ? <ChevronRight className="h-3 w-3 text-white/60" aria-hidden /> : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <h1 className="t-h1 text-balance text-white">{title}</h1>

        {intro ? (
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-white/85 md:text-base">
            {intro}
          </p>
        ) : null}

        <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-white/80">
          {resultsLabel(totalItems)}
        </p>
      </div>
    </header>
  );
}
