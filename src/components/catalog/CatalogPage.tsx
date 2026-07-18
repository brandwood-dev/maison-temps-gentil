import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import type { Product, ProductCategory } from "@/types/product";
import type { CatalogQuery } from "@/types/catalog";
import { useNow } from "@/lib/now-store";
import {
  catalogQueryToSearch,
  getCatalogResult,
  hasActiveFilters,
  parseCatalogSearch,
} from "@/lib/catalog";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CatalogHeader, type Crumb } from "./CatalogHeader";
import { CatalogToolbar } from "./CatalogToolbar";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogMobileFilters } from "./CatalogMobileFilters";
import { CatalogActiveFilters } from "./CatalogActiveFilters";
import { CatalogPagination } from "./CatalogPagination";
import { CatalogEmptyState } from "./CatalogEmptyState";

type Props = {
  basePath: string;
  title: string;
  intro?: string;
  crumbs: Crumb[];
  products: Product[];
  fixedCategory?: ProductCategory;
  fixedCollection?: string;
};

export function CatalogPage({
  basePath,
  title,
  intro,
  crumbs,
  products,
  fixedCategory,
  fixedCollection,
}: Props) {
  const rawSearch = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();
  const nowTs = useNow();
  const [mobileOpen, setMobileOpen] = useState(false);

  const query = useMemo<CatalogQuery>(() => parseCatalogSearch(rawSearch), [rawSearch]);

  const result = useMemo(
    () =>
      getCatalogResult(products, query, {
        fixedCategory,
        fixedCollection,
        now: new Date(nowTs),
      }),
    [products, query, fixedCategory, fixedCollection, nowTs],
  );

  const isCategoryEmpty = result.availableFilters.priceRange === null;
  const filtersActive = hasActiveFilters(query);
  const activeFilterCount =
    query.brands.length +
    query.dialColors.length +
    (query.minPriceMillimes != null ? 1 : 0) +
    (query.maxPriceMillimes != null ? 1 : 0) +
    (query.promotionOnly ? 1 : 0);

  const applyPatch = (patch: Partial<CatalogQuery>) => {
    const merged: CatalogQuery = { ...query, ...patch };
    // Any filter change (except explicit page change) resets to page 1.
    if (!("page" in patch)) merged.page = 1;
    navigate({
      to: basePath,
      search: catalogQueryToSearch(merged),
    });
  };

  const resetFilters = () => {
    navigate({ to: basePath, search: {} });
  };

  const showEmptyCategory = isCategoryEmpty;
  const showNoResults = !isCategoryEmpty && result.totalItems === 0;

  const baseSearchForPagination = useMemo(() => {
    const { page: _p, ...rest } = catalogQueryToSearch(query);
    void _p;
    return rest;
  }, [query]);

  return (
    <>
      <CatalogHeader crumbs={crumbs} title={title} intro={intro} totalItems={result.totalItems} />

      <div className="container-page py-6 md:py-8">
        {isCategoryEmpty ? (
          <CatalogEmptyState variant={{ kind: "empty-category" }} />
        ) : (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            {/* Desktop filters column */}
            <aside className="hidden lg:block">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                Filtres
              </h2>
              <CatalogFilters
                idPrefix="desk"
                query={query}
                availableFilters={result.availableFilters}
                onChange={applyPatch}
              />
              {filtersActive ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 text-xs font-semibold text-[color:var(--color-muted-foreground)] underline underline-offset-4 hover:text-[color:var(--color-foreground)]"
                >
                  Réinitialiser
                </button>
              ) : null}
            </aside>

            <div className="min-w-0">
              <CatalogToolbar
                totalItems={result.totalItems}
                sort={query.sort}
                onSortChange={(s) => applyPatch({ sort: s })}
                onOpenMobileFilters={() => setMobileOpen(true)}
                activeFilterCount={activeFilterCount}
              />

              <CatalogActiveFilters
                query={query}
                onChange={applyPatch}
                onReset={resetFilters}
              />

              {showNoResults ? (
                <div className="pt-4">
                  <CatalogEmptyState variant={{ kind: "no-results", onReset: resetFilters }} />
                </div>
              ) : (
                <>
                  {/* Grid alignment: `justify-start` keeps 3-card rows anchored left
                      instead of stretching each card to fill 4 columns. */}
                  <div className="pt-4">
                    <ProductGrid products={result.items} />
                  </div>
                  <CatalogPagination
                    page={result.page}
                    totalPages={result.totalPages}
                    basePath={basePath}
                    baseSearch={baseSearchForPagination}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <CatalogMobileFilters
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        query={query}
        availableFilters={result.availableFilters}
        totalItems={result.totalItems}
        onChange={applyPatch}
        onReset={resetFilters}
      />
    </>
  );
}

// Prevent unused-var lint on the intentional key discard above.
void DEFAULT_CATALOG_QUERY;
