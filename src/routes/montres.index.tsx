import { createFileRoute, type SearchSchemaInput } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/montres");
const TITLE = "Montres | La Maison des Montres";
const DESC =
  "Toute la sélection de montres La Maison des Montres : homme, femme, enfant, couple, connectées et coffrets cadeaux.";

type CatalogSearchInput = SearchSchemaInput & Record<string, unknown>;

export const Route = createFileRoute("/montres/")({
  validateSearch: (raw: CatalogSearchInput) => parseCatalogSearch(raw),
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
  component: MontresPage,
});

function MontresPage() {
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/montres"
      title="Toutes les montres"
      intro="Découvrez l’intégralité de notre sélection, toutes catégories confondues."
      crumbs={[{ label: "Accueil", href: "/" }, { label: "Montres" }]}
      products={PRODUCTS}
      query={query}
    />
  );
}
