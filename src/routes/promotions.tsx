import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { getPublicPromotionProducts } from "@/lib/catalog-api";
import { absoluteUrl } from "@/config/site";
import { parseCatalogSearch } from "@/lib/catalog";

const CANONICAL = absoluteUrl("/promotions");
const TITLE = "Promotions | La Maison des Montres";
const DESC =
  "Découvrez tous nos produits actuellement en promotion : offres à durée limitée sur notre sélection.";

export const Route = createFileRoute("/promotions")({
  validateSearch: (raw) => {
    const query = parseCatalogSearch(raw as Record<string, unknown>);
    const attributes: Record<string, string[]> = query.attributes.genre
      ? { genre: query.attributes.genre }
      : {};
    // Promotions intentionally expose only brand, genre and price filters.
    // Drop hidden filter values as well, so a copied URL cannot silently apply
    // a colour, attribute or merchandising filter that the page does not show.
    return {
      ...query,
      dialColors: [],
      attributes,
      bestSellerOnly: false,
      featuredOnly: false,
    };
  },
  loader: async () => ({ products: await getPublicPromotionProducts().catch(() => []) }),
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
  const { products } = Route.useLoaderData();
  const query = Route.useSearch();
  return (
    <CatalogPage
      basePath="/promotions"
      title="Promotions"
      intro="Tous les produits actuellement en promotion. Les offres disparaissent automatiquement à leur expiration."
      crumbs={[{ label: "Accueil", href: "/" }, { label: "Promotions" }]}
      products={products}
      query={query}
      forcePromotionOnly
      filterVisibility={{ brands: true, dialColors: false, attributes: ["genre"], price: true }}
      emptyOverride={{
        title: "Aucune promotion en cours",
        description:
          "Toutes les promotions sont terminées. Revenez prochainement découvrir nos nouvelles offres.",
      }}
    />
  );
}
