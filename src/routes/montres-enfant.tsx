import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = "https://maison-temps-gentil.lovable.app/montres-enfant";
const TITLE = "Montres Enfant | La Maison des Montres";
const DESC = "Des montres colorées, robustes et faciles à lire, pensées pour les enfants.";

export const Route = createFileRoute("/montres-enfant")({
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
      basePath="/montres-enfant"
      title="Montres Enfant"
      intro="Des modèles ludiques et confortables pour accompagner les plus jeunes."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Enfant" },
      ]}
      products={PRODUCTS}
      fixedCategory="children"
    />
  ),
});
