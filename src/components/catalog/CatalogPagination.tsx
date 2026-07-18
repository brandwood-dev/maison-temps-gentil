import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  /** Current URL search, minus `page`. Used to preserve filters on nav. */
  baseSearch: Record<string, string | undefined>;
};

/** Build a compact page window: 1 … n-1 n n+1 … total. */
function buildRange(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, page, page - 1, page + 1]);
  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("ellipsis");
  }
  return out;
}

export function CatalogPagination({ page, totalPages, basePath, baseSearch }: Props) {
  if (totalPages <= 1) return null;

  const searchFor = (target: number): Record<string, string | undefined> => {
    const s = { ...baseSearch };
    if (target > 1) s.page = String(target);
    else delete s.page;
    return s;
  };

  const range = buildRange(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const linkCls =
    "inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]";
  const activeCls =
    "bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-foreground)]";
  const disabledCls =
    "cursor-not-allowed border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] text-[color:var(--color-muted-foreground)]";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 py-8">
      {prevDisabled ? (
        <span aria-disabled="true" className={cn(linkCls, disabledCls)}>
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Page précédente</span>
        </span>
      ) : (
        <Link
          to={basePath}
          search={searchFor(page - 1)}
          className={linkCls}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
      )}

      {range.map((r, i) =>
        r === "ellipsis" ? (
          <span
            key={`e-${i}`}
            aria-hidden
            className="inline-flex h-11 min-w-8 items-center justify-center text-sm text-[color:var(--color-muted-foreground)]"
          >
            …
          </span>
        ) : r === page ? (
          <span key={r} aria-current="page" className={cn(linkCls, activeCls)}>
            {r}
          </span>
        ) : (
          <Link
            key={r}
            to={basePath}
            search={searchFor(r)}
            className={linkCls}
            aria-label={`Aller à la page ${r}`}
          >
            {r}
          </Link>
        ),
      )}

      {nextDisabled ? (
        <span aria-disabled="true" className={cn(linkCls, disabledCls)}>
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Page suivante</span>
        </span>
      ) : (
        <Link
          to={basePath}
          search={searchFor(page + 1)}
          className={linkCls}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
      )}
    </nav>
  );
}
