import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { useCatalogProducts } from "@/lib/catalog-products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/collections/coffrets-cadeaux");
const TITLE = "Coffrets cadeaux | La Maison des Montres";
const DESC = "Nos coffrets cadeaux : montres livrées dans un écrin, prêtes à offrir.";

export const Route = createFileRoute("/collections/coffrets-cadeaux")({
  validateSearch: (raw) => parseCatalogSearch(raw as Record<string, unknown>),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: CoffretsCadeauxPage,
});

function CoffretsCadeauxPage() {
  const products = useCatalogProducts();
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/collections/coffrets-cadeaux"
      title="Coffrets cadeaux"
      intro="Une sélection dédiée aux montres livrées en coffret, à offrir."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Collections" },
        { label: "Coffrets cadeaux" },
      ]}
      products={products}
      fixedCollection="gift-boxes"
      query={query}
    />
  );
}
