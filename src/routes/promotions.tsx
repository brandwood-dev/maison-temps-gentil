import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { useCatalogProducts } from "@/lib/catalog-products";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/promotions");
const TITLE = "Promotions | La Maison des Montres";
const DESC =
  "Découvrez toutes nos montres actuellement en promotion : offres à durée limitée sur notre sélection.";

export const Route = createFileRoute("/promotions")({
  validateSearch: (raw) => parseCatalogSearch(raw as Record<string, unknown>),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const products = useCatalogProducts();
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/promotions"
      title="Promotions"
      intro="Toutes les montres actuellement en promotion. Les offres disparaissent automatiquement à leur expiration."
      crumbs={[{ label: "Accueil", href: "/" }, { label: "Promotions" }]}
      products={products}
      query={query}
      forcePromotionOnly
      emptyOverride={{
        title: "Aucune promotion en cours",
        description:
          "Toutes les promotions sont terminées. Revenez prochainement découvrir nos nouvelles offres.",
      }}
    />
  );
}
