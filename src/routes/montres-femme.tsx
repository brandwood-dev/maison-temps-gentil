import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/montres-femme");
const TITLE = "Montres Femme | La Maison des Montres";
const DESC =
  "Notre sélection de montres pour femme : lignes délicates, matériaux précieux et cadrans lumineux.";

export const Route = createFileRoute("/montres-femme")({
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
  component: MontresFemmePage,
});

function MontresFemmePage() {
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/montres-femme"
      title="Montres Femme"
      intro="Des montres féminines choisies pour leur élégance et leur finition."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Femme" },
      ]}
      products={PRODUCTS}
      fixedCategory="women"
      query={query}
    />
  );
}
