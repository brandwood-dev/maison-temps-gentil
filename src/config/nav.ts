import type { PublicCategory } from "@/lib/catalog-api";

export const NAV_LINKS = [
  { label: "Montres", href: "/montres" },
  { label: "Homme", href: "/montres-homme" },
  { label: "Femme", href: "/montres-femme" },
  { label: "Enfant", href: "/montres-enfant" },
  { label: "Couple", href: "/montres-couple" },
  { label: "Connectées", href: "/montres-connectees" },
  { label: "Coffrets cadeaux", href: "/collections/coffrets-cadeaux" },
  { label: "Promotions", href: "/promotions" },
  { label: "Marques", href: "/marques" },
] as const;

export type NavLink = { label: string; href: string };

/** Build storefront navigation from active API categories, with static links as fallback. */
export function getCategoryNavLinks(categories: readonly PublicCategory[]): NavLink[] {
  const active = categories
    .filter((category) => category.active && !category.parentId)
    .slice()
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "fr"));
  if (active.length === 0) return NAV_LINKS.map((link) => ({ ...link }));

  return [
    { label: "Montres", href: "/montres" },
    ...active.map((category) => ({
      label: category.name,
      href: `/categories/${encodeURIComponent(category.slug)}`,
    })),
    { label: "Promotions", href: "/promotions" },
    { label: "Marques", href: "/marques" },
  ];
}

export function getFooterShopLinks(categories: readonly PublicCategory[]): NavLink[] {
  return getCategoryNavLinks(categories);
}

export const SECONDARY_LINKS = [
  { label: "Mes favoris", href: "/favoris" },
  { label: "Suivre ma commande", href: "/suivi-commande" },
  { label: "Livraison et retours", href: "/livraison-retours" },
  { label: "Garantie", href: "/garantie" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_SHOP_LINKS = [
  { label: "Toutes les montres", href: "/montres" },
  { label: "Homme", href: "/montres-homme" },
  { label: "Femme", href: "/montres-femme" },
  { label: "Enfant", href: "/montres-enfant" },
  { label: "Couple", href: "/montres-couple" },
  { label: "Montres connectées", href: "/montres-connectees" },
  { label: "Coffrets cadeaux", href: "/collections/coffrets-cadeaux" },
  { label: "Promotions", href: "/promotions" },
  { label: "Marques", href: "/marques" },
] as const;

export const FOOTER_HELP_LINKS = [
  { label: "Suivre ma commande", href: "/suivi-commande" },
  { label: "Livraison et retours", href: "/livraison-retours" },
  { label: "Garantie", href: "/garantie" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_INFO_LINKS = [
  { label: "À propos", href: "/a-propos" },
  { label: "Conditions générales de vente", href: "/conditions-generales-vente" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Politique de cookies", href: "/politique-cookies" },
  { label: "Mentions légales", href: "/mentions-legales" },
] as const;

export const ANNOUNCEMENT_TEXT = "Livraison rapide partout en Tunisie sous 2 à 3 jours";
