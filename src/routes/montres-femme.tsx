import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = "https://maison-temps-gentil.lovable.app/montres-femme";
const TITLE = "Montres Femme | La Maison des Montres";
const DESC =
  "Notre sélection de montres pour femme : lignes épurées, finitions raffinées et pièces à porter au quotidien.";

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
  component: () => (
    <CatalogPage
      basePath="/montres-femme"
      title="Montres Femme"
      intro="Des montres féminines à l’élégance discrète, pour toutes les occasions."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Femme" },
      ]}
      products={PRODUCTS}
      fixedCategory="women"
    />
  ),
});
