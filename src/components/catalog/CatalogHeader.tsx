import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

type Props = {
  crumbs: Crumb[];
  title: string;
  intro?: string;
  totalItems: number;
  imageSrc?: string;
  imageSrcSet?: string;
};

function resultsLabel(total: number): string {
  if (total <= 0) return "0 montre";
  if (total === 1) return "1 montre";
  return `${total} montres`;
}

export function CatalogHeader({ crumbs, title, intro, totalItems, imageSrc, imageSrcSet }: Props) {
  return (
    <header className="relative isolate overflow-hidden bg-[color:var(--color-primary)]">
      {imageSrc ? (
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="100vw"
          alt=""
          aria-hidden
          width={1600}
          height={560}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-[image:var(--hero-overlay)]" />
      <div className="container-page relative py-12 text-center md:py-16">
        <nav aria-label="Fil d’Ariane" className="mb-5">
          <ol className="flex flex-wrap items-center justify-center gap-1 text-xs text-[color:var(--color-on-image-muted)]">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
                  {c.href && !isLast ? (
                    <Link
                      to={c.href}
                      className="hover:text-[color:var(--color-on-image)] hover:underline"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "text-[color:var(--color-on-image)]" : undefined}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                  {!isLast ? <ChevronRight className="h-3 w-3 opacity-60" aria-hidden /> : null}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="t-h1 text-[color:var(--color-on-image)]">{title}</h1>
        {intro ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[color:var(--color-on-image-muted)] md:text-base">
            {intro}
          </p>
        ) : null}
        <p className="mt-3 text-xs font-medium tracking-wide text-[color:var(--color-on-image-muted)]">
          {resultsLabel(totalItems)}
        </p>
      </div>
    </header>
  );
}
