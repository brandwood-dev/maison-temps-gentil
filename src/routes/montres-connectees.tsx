import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { useCatalogProducts } from "@/lib/catalog-products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/montres-connectees");
const TITLE = "Montres Connectées | La Maison des Montres";
const DESC =
  "Notre sélection de montres connectées, pour allier technologie et style au quotidien.";

export const Route = createFileRoute("/montres-connectees")({
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
  component: MontresConnecteesPage,
});

function MontresConnecteesPage() {
  const products = useCatalogProducts();
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/montres-connectees"
      title="Montres Connectées"
      intro="Montres connectées pour le suivi d’activité, les notifications et bien plus."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Connectées" },
      ]}
      products={products}
      fixedCategory="connected"
      query={query}
    />
  );
}
