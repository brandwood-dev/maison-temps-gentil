import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

type Props = {
  crumbs: Crumb[];
  title: string;
  intro?: string;
  totalItems: number;
};

function resultsLabel(total: number): string {
  if (total <= 0) return "0 montre";
  if (total === 1) return "1 montre";
  return `${total} montres`;
}

export function CatalogHeader({ crumbs, title, intro, totalItems }: Props) {
  return (
    <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)]">
      <div className="container-page py-8 md:py-10">
        <nav aria-label="Fil d’Ariane" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-[color:var(--color-muted-foreground)]">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
                  {c.href && !isLast ? (
                    <a
                      href={c.href}
                      className="hover:text-[color:var(--color-foreground)] hover:underline"
                    >
                      {c.label}
                    </a>
                  ) : (
                    <span
                      className={isLast ? "text-[color:var(--color-foreground)]" : undefined}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                  {!isLast ? (
                    <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="t-h1">{title}</h1>
        {intro ? (
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-muted-foreground)] md:text-base">
            {intro}
          </p>
        ) : null}
        <p className="mt-3 text-xs font-medium tracking-wide text-[color:var(--color-muted-foreground)]">
          {resultsLabel(totalItems)}
        </p>
      </div>
    </header>
  );
}
