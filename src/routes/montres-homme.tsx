import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { useCatalogProducts } from "@/lib/catalog-products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/montres-homme");
const TITLE = "Montres Homme | La Maison des Montres";
const DESC =
  "Notre sélection de montres pour homme : élégance intemporelle, mouvements soignés et bracelets premium.";

export const Route = createFileRoute("/montres-homme")({
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
  component: MontresHommePage,
});

function MontresHommePage() {
  const products = useCatalogProducts();
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/montres-homme"
      title="Montres Homme"
      intro="Une sélection de montres pensées pour un style masculin, du classique au contemporain."
      crumbs={[
        { label: "Accueil", href: "/" },
        { label: "Montres", href: "/montres" },
        { label: "Homme" },
      ]}
      products={products}
      fixedCategory="men"
      query={query}
    />
  );
}
