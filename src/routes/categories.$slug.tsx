import { createFileRoute, notFound } from "@tanstack/react-router";

import { CatalogPage } from "@/components/catalog/CatalogPage";
import { getPublicCategories, getPublicProductsByCategory } from "@/lib/catalog-api";
import { parseCatalogSearch } from "@/lib/catalog";
import { absoluteUrl } from "@/config/site";

export const Route = createFileRoute("/categories/$slug")({
  validateSearch: (raw) => parseCatalogSearch(raw as Record<string, unknown>),
  loader: async ({ params }) => {
    const categories = await getPublicCategories();
    const category = categories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    const products = await getPublicProductsByCategory({ data: { categoryId: category.id } });
    return { category, products };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Catégorie introuvable | La Maison des Montres" }] };
    }
    const title = `${loaderData.category.name} | La Maison des Montres`;
    const description =
      loaderData.category.description ?? `Découvrez la sélection ${loaderData.category.name}.`;
    const canonical = absoluteUrl(`/categories/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath={`/categories/${encodeURIComponent(category.slug)}`}
      title={category.name}
      intro={category.description}
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: category.name },
      ]}
      products={products}
      query={query}
    />
  );
}
