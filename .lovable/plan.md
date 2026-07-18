# Plan final — Fiches produit `/montres/$slug`

## Contraintes horloge (unique)

- Aucun `NowProvider`, `initialNow` ou `Date.now()` dans `src/routes/montres.$slug.tsx`.
- L'unique `NowProvider` reste celui de `src/routes/__root.tsx`.
- `ProductPrice`, `PromotionCountdown` et `ProductStructuredData` consomment tous `useNow()` → SSR et hydratation cohérents, expiration promo simultanée sur prix visible **et** JSON-LD.

## Fichiers créés

- `src/lib/products.ts` :
  - `getProductBySlug(products, slug): Product | null` — exact match, non mutant, expose aussi `hidden` (filtrage public dans le loader).
  - `getRelatedProducts(products, current, limit = 4): Product[]` — exclut courant + `hidden`, priorité même catégorie, dédup, non mutant.
  - `formatSpecifications(product)` — paires `{ label, value }` FR, valeurs vides/nulles omises, ordre spécifié, diamètre suffixé `mm` uniquement si numérique.
  - `getCategoryRoute(category)` — map vers routes catalogue réelles.
  - `formatSchemaPriceTND(millimes: number): string` → `(millimes / 1000).toFixed(3)` (point décimal, jamais d'arrondi au dinar).
- `src/routes/montres.$slug.tsx` :
  - `loader` résout depuis fixtures ; `throw notFound()` si absent ou `hidden`.
  - `head()` : title, description (`shortDescription`), OG title/description/image (première image), `og:type=product`, canonical `https://maison-temps-gentil.lovable.app/montres/{slug}`.
  - `notFoundComponent` réutilise la vraie 404 FR.
  - **N'importe ni `NowProvider` ni `Date.now`**.
- `src/components/product-detail/`
  - `ProductDetailPage.tsx` — orchestrateur (breadcrumb + 2 colonnes ≥ lg, ordre mobile spécifié).
  - `ProductBreadcrumb.tsx` — Accueil › Montres › catégorie (lien) › nom (aria-current).
  - `ProductGallery.tsx` — image principale + miniatures + Dialog Radix plein écran ("Agrandir l'image de …"), `aria-current` sur miniature active, fallback "Image indisponible", masque miniatures si 1 seule image.
  - `ProductSummary.tsx` — marque, H1, référence, courte description, ≤ 2 badges (mêmes priorités que la carte).
  - `ProductPurchasePanel.tsx` — `ProductPrice` mode `detailed`, `PromotionCountdown`, disponibilité, favori (`useFavorites`), sélecteur quantité (min 1, ±, 44 px, libellés incluant nom produit).
    - Bouton "Ajouter au panier" :
      - **sans `onAddToCart`** → désactivé + texte "Fonction d'achat en cours de connexion".
      - **avec `onAddToCart` + `available`** → activé, un seul appel `onAddToCart(product, quantity)`.
      - **produit `unavailable`** → toujours désactivé.
      - Aucune notification, persistance, ni compteur panier.
    - Contrat : `onAddToCart?: (product: Product, quantity: number) => void`.
  - `ProductSpecifications.tsx` — `<dl>` accessible via `formatSpecifications`.
  - `ProductReassurance.tsx` — paiement livraison, livraison Tunisie 2-3 j, confirmation téléphone ; garantie conditionnelle à `warrantyMonths` ; coffret conditionnel à `giftBoxIncluded`.
  - `RelatedProducts.tsx` — `getRelatedProducts` + `ProductGrid`/`ProductCard`, rendu conditionnel.
  - `ProductStructuredData.tsx` — client component :
    - lit `useNow()` pour choisir prix promo (si réellement active) ou prix normal.
    - `price` via `formatSchemaPriceTND` (jamais arrondi au dinar).
    - `priceCurrency: "TND"`, availability dérivée de `product.availability`, `sku` = `reference`, brand, image, description, url canonique.
    - `priceValidUntil` uniquement si promo active.
    - Aucun avis, note, livraison gratuite, stock numérique.

## Fichiers modifiés

- `src/components/product/ProductGrid.tsx` — **injecte par défaut** `href={`/montres/${product.slug}`}` sur chaque `ProductCard`. Aucune duplication d'URL dans l'accueil, `CatalogPage`, `RelatedProducts`.
- `src/components/product/ProductCard.tsx` — si `href` commence par `/`, utilise `Link` TanStack au lieu de `<a>` (favori conserve `stopPropagation`, panier reste `disabled`).
- `package.json` — script `test:product` → `tsx tests/product.test.ts`.

## Tests (`tests/product.test.ts`)

- `getProductBySlug` : trouvé / inexistant / hidden (fonction pure).
- `getRelatedProducts` : exclusion courant, exclusion `hidden`, priorité catégorie, limite, dédup, non-mutation.
- `formatSpecifications` : valeurs nulles omises, ordre, formatage diamètre.
- `formatSchemaPriceTND` : `450000 → "450.000"`, `450500 → "450.500"`, séparateur point.
- Garde statique : `src/routes/montres.$slug.tsx` ne contient ni `NowProvider` ni `Date.now` ; un seul `<NowProvider` dans `src/`.

## Playwright (375/430/768/1024/1280/1440)

3 routes réelles (CK, Tissot, Swatch) : SSR H1/marque/référence/prix, changement miniature, Dialog open/close + focus restore, favori sync avec carte accueil, countdown actif, **expiration promo simultanée** (badge, barré, %, économies, countdown, `price` du JSON-LD) via horloge virtuelle, bouton panier `disabled`, coffret Tissot+Swatch / absent CK, specs nulles masquées, related sans doublon, navigation via `Link` TanStack (pas de full reload), slug inconnu → 404 FR, zéro warning React, zéro overflow horizontal.

## Validation

`bun install --frozen-lockfile` → `npm run lint` → `npm run test:catalog` → `npm run test:product` → `npm run build` → Playwright → rapport final complet.

## Périmètre exclu

Pas de backend, Supabase, DB, auth, checkout, paiement, avis, panier fonctionnel, notification, produit/attribut inventé, variante, stock numérique, nouvelle dépendance, modification des 3 fixtures, ni de package-lock.json.
