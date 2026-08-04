import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { NowProvider } from "../lib/now-store";
import {
  getPublicAttributes,
  getPublicBrands,
  getPublicCategories,
  getPublicProducts,
} from "../lib/catalog-api";
import { initMetaPixel, trackPageView } from "../lib/meta-pixel";
import { CartDrawer } from "../components/cart/CartDrawer";
import { ScrollToTop } from "../components/layout/ScrollToTop";

const SITE_TITLE = "La Maison des Montres | Montres élégantes en Tunisie";
const SITE_DESCRIPTION =
  "Découvrez notre sélection de montres pour homme, femme, enfant et couple : marques soigneusement choisies, prix en TND, paiement à la livraison et livraison partout en Tunisie.";
const SOCIAL_IMAGE =
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1785864404/LOGO_LA_MAISON_DES_MONTRES_BLANC_ibf5xs.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La page que vous recherchez n’existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Impossible de charger cette page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue de notre côté. Vous pouvez réessayer ou revenir à l’accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Retour à l’accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    const [products, brands, categories, attributes] = await Promise.all([
      getPublicProducts(),
      getPublicBrands().catch(() => []),
      getPublicCategories().catch(() => []),
      getPublicAttributes().catch(() => []),
    ]);
    return { initialNow: Date.now(), products, brands, categories, attributes };
  },

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:site_name", content: "La Maison des Montres" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_TN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: SOCIAL_IMAGE },
      { property: "og:image:alt", content: "Logo La Maison des Montres" },
      { name: "twitter:image", content: SOCIAL_IMAGE },
      { name: "twitter:image:alt", content: "Logo La Maison des Montres" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico?v=20260804", type: "image/x-icon" },
      { rel: "shortcut icon", href: "/favicon.ico?v=20260804", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.svg?v=20260804", type: "image/svg+xml" },
      {
        rel: "icon",
        href: "/favicon-96x96.png?v=20260804",
        type: "image/png",
        sizes: "96x96",
      },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { initialNow } = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      <NowProvider initialNow={initialNow}>
        <MetaPixelTracker />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CartDrawer />
        <ScrollToTop />
      </NowProvider>
    </QueryClientProvider>
  );
}

function MetaPixelTracker() {
  const pageKey = useRouterState({
    // Keep the selector serializable during SSR. `location.search` is a
    // router-owned object and cannot be interpolated safely on the server.
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    initMetaPixel();
    trackPageView(pageKey);
  }, [pageKey]);

  return null;
}
