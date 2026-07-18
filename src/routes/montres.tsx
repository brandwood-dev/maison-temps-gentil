import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { PRODUCTS } from "@/fixtures/products";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = "https://maison-temps-gentil.lovable.app/montres";
const TITLE = "Montres | La Maison des Montres";
const DESC =
  "Toute la sélection de montres La Maison des Montres : homme, femme, enfant, couple, connectées et coffrets cadeaux.";

export const Route = createFileRoute("/montres")({
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
  component: MontresPage,
});

function MontresPage() {
  return (
    <CatalogPage
      basePath="/montres"
      title="Toutes les montres"
      intro="Découvrez l’intégralité de notre sélection, toutes catégories confondues."
      crumbs={[{ label: "Accueil", href: "/" }, { label: "Montres" }]}
      products={PRODUCTS}
    />
  );
}
