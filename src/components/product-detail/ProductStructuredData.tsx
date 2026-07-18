import type { Product } from "@/types/product";
import { isPromotionActive } from "@/lib/product-pricing";
import { formatSchemaPriceTND, getCategoryLabel } from "@/lib/products";
import { useNow } from "@/lib/now-store";

type Props = {
  product: Product;
  /** Absolute canonical URL of the product page. */
  url: string;
};

/**
 * Emits a schema.org/Product JSON-LD block synchronized with the visual UI
 * via the shared clock (`useNow`). When a promotion expires, `price` falls
 * back to the regular price in the same render pass as `<ProductPrice />`.
 *
 * Prices are formatted with `formatSchemaPriceTND` (3 decimal digits, no
 * rounding to the whole dinar) so 450 000 millimes → "450.000".
 */
export function ProductStructuredData({ product, url }: Props) {
  const nowTs = useNow();
  const promoActive = isPromotionActive(product.promotion, new Date(nowTs));
  const priceMillimes =
    promoActive && product.promotion
      ? product.promotion.salePriceMillimes
      : product.regularPriceMillimes;

  const availability =
    product.availability === "available"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const images = product.images
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((i) => i.url);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.reference,
    mpn: product.reference,
    category: getCategoryLabel(product.category),
    brand: { "@type": "Brand", name: product.brand },
    description: product.shortDescription || undefined,
    image: images.length > 0 ? images : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TND",
      price: formatSchemaPriceTND(priceMillimes),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      ...(promoActive && product.promotion
        ? { priceValidUntil: product.promotion.endsAt.slice(0, 10) }
        : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes closing tags safely for JSON-LD.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
