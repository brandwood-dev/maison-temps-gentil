export type Testimonial = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  message: string;
  fullName: string;
  governorate: string;
  productSlug: string;
};

/**
 * Avis clients de démonstration — à remplacer par le backend NestJS.
 * `productSlug` doit correspondre à un slug de `src/fixtures/products.ts`.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    rating: 5,
    message:
      "Commande reçue en deux jours à Tunis, emballage impeccable. La montre est encore plus belle en vrai, le cadran vert est magnifique.",
    fullName: "Ines Ben Salah",
    governorate: "Tunis",
    productSlug: "calvin-klein-forme-25100188",
  },
  {
    id: "t-2",
    rating: 5,
    message:
      "Le paiement à la livraison m'a rassuré pour un premier achat en ligne. Service client très réactif sur WhatsApp.",
    fullName: "Mohamed Amine Trabelsi",
    governorate: "Sfax",
    productSlug: "tissot-classic-dream-automatic-40mm",
  },
  {
    id: "t-3",
    rating: 4,
    message:
      "Très bon rapport qualité-prix, la finition du bracelet acier est soignée. J'aurais aimé un coffret un peu plus grand.",
    fullName: "Sarra Gharbi",
    governorate: "Sousse",
    productSlug: "calvin-klein-forme-25100188",
  },
  {
    id: "t-4",
    rating: 5,
    message:
      "Achetée pour mon fils, il ne la quitte plus. Les couleurs sont fidèles aux photos et la livraison a été rapide.",
    fullName: "Karim Bouazizi",
    governorate: "Nabeul",
    productSlug: "swatch-the-gold-within-you-le108",
  },
  {
    id: "t-5",
    rating: 5,
    message:
      "Montre automatique authentique avec garantie, exactement ce que je cherchais. Conseils au téléphone très professionnels.",
    fullName: "Yassine Hammami",
    governorate: "Monastir",
    productSlug: "tissot-classic-dream-automatic-40mm",
  },
  {
    id: "t-6",
    rating: 5,
    message:
      "Livraison jusqu'à Bizerte sans souci, montre conforme et facture fournie. Je recommande la maison sans hésiter.",
    fullName: "Nadia Kefi",
    governorate: "Bizerte",
    productSlug: "swatch-the-gold-within-you-le108",
  },
];
