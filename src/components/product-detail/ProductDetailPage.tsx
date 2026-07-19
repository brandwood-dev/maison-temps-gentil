import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

import type { Product } from "@/types/product";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategoryLabel, getCategoryRoute, getRelatedProducts } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { ProductGallery } from "./ProductGallery";
import { ProductSummary } from "./ProductSummary";
import { ProductSpecifications } from "./ProductSpecifications";
import { ProductStructuredData } from "./ProductStructuredData";

type Props = {
  product: Product;
  allProducts: Product[];
  canonicalUrl: string;
};

/**
 * Orchestrates the product detail page. No `NowProvider` — consumes the
 * root provider so the whole app shares one clock singleton.
 */
export function ProductDetailPage({ product, allProducts, canonicalUrl }: Props) {
  const categoryRoute = getCategoryRoute(product.category);
  const categoryLabel = getCategoryLabel(product.category);
  const related = getRelatedProducts(allProducts, product, 4);
  const { addItem } = useCart();
  const handleAddToCart = (p: Product, quantity: number) => addItem(p.id, quantity);

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />

      <main id="content">
        <div className="container-page py-4 md:py-6">
          <nav aria-label="Fil d'Ariane">
            <ol className="flex list-none flex-wrap items-center gap-1 text-xs text-[color:var(--color-muted-foreground)]">
              <li className="flex items-center gap-1">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 hover:text-[color:var(--color-foreground)]"
                >
                  <Home className="h-3.5 w-3.5" aria-hidden />
                  <span className="sr-only sm:not-sr-only">Accueil</span>
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link
                  to="/montres"
                  search={{}}
                  className="hover:text-[color:var(--color-foreground)]"
                >
                  Montres
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link to={categoryRoute} className="hover:text-[color:var(--color-foreground)]">
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="font-medium text-[color:var(--color-foreground)]">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>

        <section className="container-page pb-10 md:pb-16">
          <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
            <ProductGallery product={product} />
            <ProductSummary product={product} onAddToCart={handleAddToCart} />
          </div>

          <ProductSpecifications product={product} />
        </section>

        {related.length > 0 ? (
          <section className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)]">
            <div className="container-page py-10 md:py-14">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Vous aimerez aussi</p>
                  <h2 className="t-h2 mt-2 text-[color:var(--color-foreground)]">
                    Nos autres montres
                  </h2>
                </div>
                <Link
                  to={categoryRoute}
                  className="text-sm font-semibold text-[color:var(--color-foreground)] underline underline-offset-4 hover:text-[color:var(--color-gold)]"
                >
                  Voir la catégorie
                </Link>
              </div>
              <ProductGrid products={related} onAddToCart={handleAddToCart} />
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />

      <ProductStructuredData product={product} url={canonicalUrl} />
    </div>
  );
}
