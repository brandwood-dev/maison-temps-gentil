import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { Product, ProductCategory } from "@/types/product";
import type { CatalogQuery } from "@/types/catalog";
import { useNow } from "@/lib/now-store";
import { useCart } from "@/lib/cart-store";
import { catalogQueryToSearch, getCatalogResult, hasActiveFilters } from "@/lib/catalog";

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
  query: CatalogQuery;
  fixedCategory?: ProductCategory;
  fixedCollection?: string;
};

export function CatalogPage({
  basePath,
  title,
  intro,
  crumbs,
  products,
  query,
  fixedCategory,
  fixedCollection,
}: Props) {
  const navigate = useNavigate();
  const nowTs = useNow();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    if (!("page" in patch)) merged.page = 1;
    navigate({
      to: basePath,
      search: catalogQueryToSearch(merged),
    });
  };

  // Reset filters but preserve the current sort — sort is not a filter.
  const resetFilters = () => {
    navigate({
      to: basePath,
      search: catalogQueryToSearch({ sort: query.sort, page: 1 }),
    });
  };

  const showNoResults = !isCategoryEmpty && result.totalItems === 0;

  const baseSearchForPagination = useMemo(() => {
    const { page: _page, ...rest } = catalogQueryToSearch(query);
    void _page;
    return rest;
  }, [query]);

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />

      <main id="content">
        <CatalogHeader crumbs={crumbs} title={title} intro={intro} totalItems={result.totalItems} />

        <div className="container-page py-6 md:py-8">
          {isCategoryEmpty ? (
            <CatalogEmptyState variant={{ kind: "empty-category" }} />
          ) : (
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
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

                <CatalogActiveFilters query={query} onChange={applyPatch} onReset={resetFilters} />

                {showNoResults ? (
                  <div className="pt-4">
                    <CatalogEmptyState variant={{ kind: "no-results", onReset: resetFilters }} />
                  </div>
                ) : (
                  <>
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
      </main>

      <SiteFooter />

      <CatalogMobileFilters
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        query={query}
        availableFilters={result.availableFilters}
        totalItems={result.totalItems}
        onChange={applyPatch}
        onReset={resetFilters}
      />
    </div>
  );
}
