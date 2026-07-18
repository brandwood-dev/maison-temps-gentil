import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProductDetailPage } from "@/components/product-detail/ProductDetailPage";
import { PRODUCTS } from "@/fixtures/products";
import { formatPriceTND, isPromotionActive } from "@/lib/product-pricing";
import { getProductBySlug } from "@/lib/products";

const SITE = "https://maison-temps-gentil.lovable.app";

export const Route = createFileRoute("/montres/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(PRODUCTS, params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Montre introuvable | La Maison des Montres" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const canonical = `${SITE}/montres/${params.slug}`;
    const promoActive = isPromotionActive(product.promotion, new Date());
    const price =
      promoActive && product.promotion
        ? product.promotion.salePriceMillimes
        : product.regularPriceMillimes;

    const title = `${product.name} — ${product.brand} | La Maison des Montres`;
    const description =
      product.shortDescription ||
      `${product.name} — ${product.brand}. Découvrez ce modèle sur La Maison des Montres, au prix de ${formatPriceTND(price)}.`;

    const primaryImage = product.images.find((i) => i.position === 1) ?? product.images[0];

    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "product" },
      { property: "product:brand", content: product.brand },
      { property: "product:price:amount", content: (price / 1000).toFixed(3) },
      { property: "product:price:currency", content: "TND" },
      {
        property: "product:availability",
        content: product.availability === "available" ? "in stock" : "out of stock",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (primaryImage) {
      meta.push({ property: "og:image", content: primaryImage.url });
      meta.push({ property: "og:image:alt", content: primaryImage.alt });
      meta.push({ name: "twitter:image", content: primaryImage.url });
    }

    return {
      meta,
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: ProductDetailRoute,
  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
});

function ProductDetailRoute() {
  const { product } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const canonicalUrl = `${SITE}/montres/${slug}`;
  return <ProductDetailPage product={product} allProducts={PRODUCTS} canonicalUrl={canonicalUrl} />;
}

function ProductNotFound() {
  return (
    <div className="container-page py-20 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="t-h1 mt-3">Cette montre est introuvable</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-[color:var(--color-muted-foreground)]">
        Le produit que vous cherchez n’existe pas ou n’est plus référencé. Retournez à la sélection
        pour découvrir nos modèles disponibles.
      </p>
      <a
        href="/montres"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
      >
        Voir toutes les montres
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
