import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = "https://maison-temps-gentil.lovable.app/montres-couple";
const TITLE = "Montres Couple | La Maison des Montres";
const DESC = "Des duos de montres coordonnés, pensés pour s’offrir à deux.";

export const Route = createFileRoute("/montres-couple")({
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
  component: () => (
    <CatalogPage
      basePath="/montres-couple"
      title="Montres Couple"
      intro="Une sélection de modèles à porter en duo."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Couple" },
      ]}
      products={PRODUCTS}
      fixedCategory="couple"
    />
  ),
});
