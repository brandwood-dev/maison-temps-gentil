import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/montres-enfant");
const TITLE = "Montres Enfant | La Maison des Montres";
const DESC = "Des montres colorées et robustes pour les enfants, faciles à lire et à porter.";

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
  component: MontresEnfantPage,
});

function MontresEnfantPage() {
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/montres-enfant"
      title="Montres Enfant"
      intro="Des modèles colorés et pratiques pour les plus jeunes."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Enfant" },
      ]}
      products={PRODUCTS}
      fixedCategory="children"
      query={query}
    />
  );
}
