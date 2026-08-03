import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import type { Product, ProductCategory } from "@/types/product";
import type { CatalogQuery } from "@/types/catalog";
import { useNow } from "@/lib/now-store";
import { useCatalogAttributes } from "@/lib/catalog-products";
import { useCart } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/meta-pixel";
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

type EmptyOverride = {
  title: string;
  description: string;
};

type Props = {
  basePath: string;
  title: string;
  intro?: string;
  crumbs: Crumb[];
  products: Product[];
  query: CatalogQuery;
  fixedCategory?: ProductCategory;
  fixedCollection?: string;
  /** When true: force `promotionOnly` server-side, hide the promo filter/chip. */
  forcePromotionOnly?: boolean;
  /** Custom empty state when no filters are active but the base scope is empty. */
  emptyOverride?: EmptyOverride;
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
  forcePromotionOnly = false,
  emptyOverride,
}: Props) {
  const navigate = useNavigate();
  const nowTs = useNow();
  const catalogAttributes = useCatalogAttributes();
  const { addItem } = useCart();
  const handleAddToCart = (p: Product, quantity: number) => {
    addItem(p.id, quantity);
    trackAddToCart(p, quantity);
  };
  const [mobileOpen, setMobileOpen] = useState(false);

  const result = useMemo(() => {
    const effectiveQuery: CatalogQuery = forcePromotionOnly
      ? { ...query, promotionOnly: true }
      : query;
    return getCatalogResult(products, effectiveQuery, {
      fixedCategory,
      fixedCollection,
      attributes: catalogAttributes,
      now: new Date(nowTs),
    });
  }, [
    products,
    query,
    forcePromotionOnly,
    fixedCategory,
    fixedCollection,
    catalogAttributes,
    nowTs,
  ]);

  const isCategoryEmpty = result.availableFilters.priceRange === null;
  const filtersActive = hasActiveFilters(query);
  const activeFilterCount =
    query.brands.length +
    query.dialColors.length +
    Object.values(query.attributes).reduce((count, values) => count + values.length, 0) +
    (query.minPriceMillimes != null ? 1 : 0) +
    (query.maxPriceMillimes != null ? 1 : 0) +
    (!forcePromotionOnly && query.promotionOnly ? 1 : 0);

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
  // On the promotions page, an empty result with no user filters means every
  // promotion has expired — show a dedicated CTA instead of the reset one.
  const showEmptyOverride = Boolean(emptyOverride) && showNoResults && !filtersActive;

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
                  hidePromoFilter={forcePromotionOnly}
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
                  availableFilters={result.availableFilters}
                  hidePromoChip={forcePromotionOnly}
                />

                {showEmptyOverride ? (
                  <div className="pt-4">
                    <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-cream)] px-6 py-16 text-center">
                      <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                        {emptyOverride!.title}
                      </h2>
                      <p className="max-w-md text-sm text-[color:var(--color-muted-foreground)]">
                        {emptyOverride!.description}
                      </p>
                      <Link
                        to="/montres"
                        className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-4 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
                      >
                        Voir toutes les montres
                      </Link>
                    </div>
                  </div>
                ) : showNoResults ? (
                  <div className="pt-4">
                    <CatalogEmptyState variant={{ kind: "no-results", onReset: resetFilters }} />
                  </div>
                ) : (
                  <>
                    <div className="pt-4">
                      <ProductGrid products={result.items} onAddToCart={handleAddToCart} />
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
        hidePromoFilter={forcePromotionOnly}
      />
    </div>
  );
}
