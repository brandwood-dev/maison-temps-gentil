import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { PublicStoreSettings } from "@/lib/catalog-api";

export const DEFAULT_SITE_SETTINGS: PublicStoreSettings = {
  identity: {
    name: "La Maison des Montres",
    tagline: "L'horlogerie de caractère",
    logoLightUrl:
      "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VW_eczfrh.png",
    currency: "TND",
  },
  support: {
    email: "",
    phone: "",
    whatsapp: "",
  },
  shipping: {
    feeMillimes: 8_000,
    freeShippingEnabled: false,
    freeShippingThresholdMillimes: 500_000,
  },
  cod: { enabled: true },
  seo: {
    defaultTitle: "La Maison des Montres | Montres élégantes en Tunisie",
    defaultDescription:
      "Découvrez notre sélection de montres pour homme, femme, enfant et couple : marques soigneusement choisies, prix en TND, paiement à la livraison et livraison partout en Tunisie.",
  },
  updatedAt: "",
};

const SiteSettingsContext = createContext<PublicStoreSettings>(DEFAULT_SITE_SETTINGS);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings?: PublicStoreSettings | null;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings ?? DEFAULT_SITE_SETTINGS}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
