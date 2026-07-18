import type { Product } from "@/types/product";

/**
 * Temporary product fixtures — to be replaced by the NestJS backend.
 * Do NOT duplicate this data in components; always import from here.
 * Prices are expressed in millimes (1 DT = 1000 millimes).
 */

const PROMO_END = "2026-07-25T23:59:59+01:00";

export const PRODUCTS: Product[] = [
  {
    id: "calvin-klein-25100188",
    slug: "calvin-klein-forme-25100188",
    name: "CALVIN KLEIN FORME",
    brand: "Calvin Klein",
    reference: "25100188",
    category: "women",
    currency: "TND",
    regularPriceMillimes: 610_000,
    promotion: {
      regularPriceMillimes: 610_000,
      salePriceMillimes: 450_000,
      startsAt: null,
      endsAt: PROMO_END,
    },
    availability: "available",
    images: [
      {
        id: "ck-1",
        url: "https://res.cloudinary.com/dxkxiy900/image/upload/v1784405583/forme_yiggo6.jpg",
        alt: "Montre Calvin Klein Forme 25100188, cadran vert profond, bracelet acier bicolore",
        position: 1,
      },
      {
        id: "ck-2",
        url: "https://res.cloudinary.com/dxkxiy900/image/upload/v1784405773/forme_1_kdo6ll.jpg",
        alt: "Calvin Klein Forme 25100188 vue de profil, bracelet argent et or",
        position: 2,
      },
    ],
    shortDescription:
      "La Calvin Klein Forme 25100188 est une montre femme qui associe un design minimaliste à une touche de couleur raffinée. Son cadran vert profond, son boîtier rond de 26 mm en acier inoxydable et son bracelet bicolore argent et or offrent une élégance contemporaine, idéale pour le quotidien comme pour les occasions spéciales.",
    dialColor: { label: "Vert profond", hex: "#2F5C3F" },
    braceletMaterial: "Acier inoxydable 316L",
    braceletColor: "Bicolore argenté et doré",
    movementType: "Quartz",
    displayType: null,
    diameterMm: 26,
    glassType: null,
    waterResistance: "3 bar",
    warrantyMonths: 24,
    giftBoxIncluded: false,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "tissot-t1584071105100",
    slug: "tissot-classic-dream-automatic-40mm",
    name: "TISSOT CLASSIC DREAM AUTOMATIC 40 MM",
    brand: "Tissot",
    reference: "T158.407.11.051.00",
    category: "men",
    currency: "TND",
    regularPriceMillimes: 1_879_000,
    promotion: {
      regularPriceMillimes: 1_879_000,
      salePriceMillimes: 1_450_000,
      startsAt: null,
      endsAt: PROMO_END,
    },
    availability: "available",
    images: [
      {
        id: "tissot-1",
        url: "https://res.cloudinary.com/dxkxiy900/image/upload/v1784406097/tissot-classic-dream-automatic-40mm_svizoi.jpg",
        alt: "Tissot Classic Dream Automatic 40 mm, cadran noir avec index, boîtier acier",
        position: 1,
      },
      {
        id: "tissot-2",
        url: "https://res.cloudinary.com/dxkxiy900/image/upload/v1784406147/tissot-classic-dream-automatic-40mm_1_yoscu9.jpg",
        alt: "Tissot Classic Dream 40 mm vue de profil, bracelet acier bicolore",
        position: 2,
      },
    ],
    shortDescription:
      "La Tissot Classic Dream 40 mm Powermatic 80 T1584071105100 réinterprète un grand classique de l’horlogerie suisse avec un mouvement automatique moderne. Son cadran noir épuré, son boîtier en acier inoxydable 316L de 40 mm et son bracelet en acier avec système de changement rapide offrent un style intemporel adapté à toutes les occasions.",
    dialColor: { label: "Noir avec index", hex: "#170D04" },
    braceletMaterial: "Acier inoxydable 316L",
    braceletColor: "Bicolore argenté et doré",
    movementType: "Automatique — réserve de marche jusqu’à 80 heures",
    displayType: "Affichage de la date",
    diameterMm: 40,
    glassType: "Saphir inrayable",
    waterResistance: "5 bar — 50 m",
    warrantyMonths: 24,
    giftBoxIncluded: true,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "swatch-le108",
    slug: "swatch-the-gold-within-you-le108",
    name: "THE GOLD WITHIN YOU",
    brand: "Swatch",
    reference: "LE108",
    category: "children",
    currency: "TND",
    regularPriceMillimes: 250_000,
    promotion: {
      regularPriceMillimes: 250_000,
      salePriceMillimes: 180_000,
      startsAt: null,
      endsAt: PROMO_END,
    },
    availability: "available",
    images: [
      {
        id: "swatch-1",
        url: "https://res.cloudinary.com/dxkxiy900/image/upload/v1784406756/the-gold-within-you_sooqcf.jpg",
        alt: "Swatch The Gold Within You LE108, cadran bleu ciel, aiguilles orange, boîtier transparent",
        position: 1,
      },
      {
        id: "swatch-2",
        url: "https://res.cloudinary.com/dxkxiy900/image/upload/v1784406756/the-gold-within-you_1_g21tqy.jpg",
        alt: "Swatch The Gold Within You LE108 vue de dos, bracelet silicone blanc et orange",
        position: 2,
      },
    ],
    shortDescription:
      "Cette montre pleine d’humour présente un cadran bleu, des chiffres imprimés blancs et des aiguilles des heures et des minutes orange dans un boîtier transparent. Son bracelet est blanc et orange au dos.",
    dialColor: { label: "Bleu ciel", hex: "#8CD0F0" },
    braceletMaterial: "Silicone",
    braceletColor: "Blanc et orange",
    movementType: "Quartz",
    displayType: null,
    diameterMm: 28,
    glassType: "Plastique",
    waterResistance: "3 bar",
    warrantyMonths: 24,
    giftBoxIncluded: true,
    isNew: true,
    isBestSeller: true,
  },
];
