/**
 * Bannières hero des pages catégorie.
 *
 * Une image par catégorie, indexée par `basePath` du CatalogPage.
 * Les URLs définitives peuvent être remplacées ici sans toucher aux composants.
 */

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/dxkxiy900/image/upload/f_auto,q_auto,c_fill,g_auto";

/** Image de repli (celle du hero d'accueil) tant que les visuels dédiés ne sont pas fournis. */
const DEFAULT_ASSET = "v1785813483/laurenz-heymann-al6s6JpnZis-unsplash_eemoes.jpg";

export type CategoryHero = {
  /** Chemin Cloudinary (version + nom de fichier), sans transformations. */
  asset: string;
};

export const CATEGORY_HERO_IMAGES: Record<string, CategoryHero> = {
  "/montres": { asset: DEFAULT_ASSET },
  "/montres-homme": { asset: DEFAULT_ASSET },
  "/montres-femme": { asset: DEFAULT_ASSET },
  "/montres-enfant": { asset: DEFAULT_ASSET },
  "/montres-connectees": { asset: DEFAULT_ASSET },
  "/montres-couple": { asset: DEFAULT_ASSET },
  "/promotions": { asset: DEFAULT_ASSET },
  "/collections/coffrets-cadeaux": { asset: DEFAULT_ASSET },
};

function transformed(asset: string, width: number, height: number): string {
  return `${CLOUDINARY_BASE},w_${width},h_${height}/${asset}`;
}

export type CategoryHeroImage = {
  src: string;
  srcSet: string;
};

/** Résout l'image de bannière (src + srcset responsive) pour un basePath donné. */
export function getCategoryHeroImage(basePath: string): CategoryHeroImage {
  const asset = CATEGORY_HERO_IMAGES[basePath]?.asset ?? DEFAULT_ASSET;
  return {
    src: transformed(asset, 1600, 480),
    srcSet: [
      `${transformed(asset, 640, 420)} 640w`,
      `${transformed(asset, 1024, 440)} 1024w`,
      `${transformed(asset, 1600, 480)} 1600w`,
    ].join(", "),
  };
}
