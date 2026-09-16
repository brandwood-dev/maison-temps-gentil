import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProductDetailPage } from "@/components/product-detail/ProductDetailPage";
import { useCatalogProducts } from "@/lib/catalog-products";
import { getPublicProduct } from "@/lib/catalog-api";
import { SITE_URL } from "@/config/site";

const SITE = SITE_URL;

/** Canonical product route shared by watches, perfumes and accessories. */
export const Route = createFileRoute("/produits/$slug")({
  loader: async ({ params }) => {
    const product = await getPublicProduct({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produit introuvable | La Maison des Montres" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const canonical = `${SITE}/produits/${params.slug}`;
    const title = `${product.name} — ${product.brand} | La Maison des Montres`;
    const factualDescription = product.shortDescription
      ? product.shortDescription
      : `${product.name} — ${product.brand} (réf. ${product.reference}).`;
    const primaryImage = product.images.find((i) => i.position === 1) ?? product.images[0];
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: factualDescription },
      { property: "og:title", content: title },
      { property: "og:description", content: factualDescription },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: factualDescription },
    ];
    if (primaryImage) {
      meta.push({ property: "og:image", content: primaryImage.url });
      meta.push({ property: "og:image:alt", content: primaryImage.alt });
      meta.push({ name: "twitter:image", content: primaryImage.url });
    }
    return { meta, links: [{ rel: "canonical", href: canonical }] };
  },
  component: ProductRoute,
  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
});

function ProductRoute() {
  const { product } = Route.useLoaderData();
  const products = useCatalogProducts();
  const { slug } = Route.useParams();
  const canonicalUrl = `${SITE}/produits/${slug}`;
  return <ProductDetailPage product={product} allProducts={products} canonicalUrl={canonicalUrl} />;
}

function ProductNotFound() {
  return (
    <div className="container-page py-20 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="t-h1 mt-3">Ce produit est introuvable</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-[color:var(--color-muted-foreground)]">
        Le produit que vous cherchez n’existe pas ou n’est plus référencé. Découvrez les articles
        actuellement disponibles dans notre catalogue.
      </p>
      <a
        href="/montres"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
      >
        Voir le catalogue
      </a>
    </div>
  );
}

function ProductError() {
  return (
    <div className="container-page py-20 text-center">
      <p className="eyebrow">Une erreur est survenue</p>
      <h1 className="t-h1 mt-3">Impossible d’afficher ce produit</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-[color:var(--color-muted-foreground)]">
        Merci de réessayer dans quelques instants.
      </p>
    </div>
  );
}
