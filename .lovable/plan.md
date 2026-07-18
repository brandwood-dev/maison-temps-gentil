# Corrections fiches produit — écarts commit b608b4f

Périmètre strict : corriger les 10 points listés. Zéro backend, zéro panier fonctionnel, zéro fixture modifiée, zéro dépendance ajoutée.

## 1. Loader `montres.$slug.tsx` — rejeter `hidden` via helper pur

Ajouter dans `src/lib/products.ts` :
```ts
export function getPublicProductBySlug(
  products: Product[],
  slug: string,
): Product | null {
  const product = getProductBySlug(products, slug);
  return product?.availability === "hidden" ? null : product;
}
```

Loader :
```ts
const product = getPublicProductBySlug(PRODUCTS, params.slug);
if (!product) throw notFound();
```

Tests unitaires (dans `tests/product.test.ts`) sur `getPublicProductBySlug` :
- produit visible → renvoyé
- slug inconnu → `null`
- produit `hidden` → `null`
- pas de mutation

Aucun test statique fragile sur le contenu du loader pour ce point.

## 2. Purger `head()` de toute logique temporelle

Réécriture de `head()` dans `src/routes/montres.$slug.tsx` :
- `title` = `{name} — {brand} | La Maison des Montres`
- `description` = `shortDescription` si présent, sinon composition factuelle `{name} — {brand} (réf. {reference})`, sans prix ni argument commercial ; omise si aucune valeur factuelle utilisable
- `og:title`, `og:description`, `og:type=product`, `og:url`, `og:image` (+ alt), `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `canonical` (leaf uniquement)

Supprimés : `product:price:amount`, `product:price:currency`, `product:availability`, `isPromotionActive`, tout `new Date()`.

Garde statique ajoutée dans `tests/product.test.ts` : `src/routes/montres.$slug.tsx` ne contient ni `NowProvider`, ni `Date.now`, ni `new Date(`. Cette garde reste utile car elle vise l'absence d'horloge, pas la présence d'une ligne métier.

Le prix reste dans `ProductStructuredData` via `useNow()` (inchangé).

## 3. `ProductReassurance` — supprimer toute promesse non validée

Nouveau composant `src/components/product-detail/ProductReassurance.tsx` monté par `ProductPurchasePanel`. Contenu autorisé, dans l'ordre :
1. « Paiement à la livraison »
2. « Livraison partout en Tunisie » + « Délai estimé : 2 à 3 jours »
3. « Confirmation de la commande par téléphone »
4. « Garantie {warrantyMonths} mois » — uniquement si `warrantyMonths > 0`
5. « Coffret cadeau inclus » — uniquement si `giftBoxIncluded === true`

Suppression complète des mentions : « Retour sous 14 jours », « Satisfait ou remboursé », « 100 % authentiques », « Emballage soigné offert », « Garantie officielle » (fallback), « jours ouvrés ». Ligne masquée si donnée absente.

## 4. Sélecteur de quantité + bouton panier conforme

Nouveau `src/components/product-detail/ProductPurchasePanel.tsx` (extrait de `ProductSummary`) :
- `useState<number>(1)`, min = 1, pas de max
- Bouton `−` 44×44, `aria-label="Diminuer la quantité de {name}"`, désactivé à 1
- Valeur numérique avec `aria-live="polite"` + `aria-label="Quantité pour {name}"`
- Bouton `+` 44×44, `aria-label="Augmenter la quantité de {name}"`
- Contrat exact : `onAddToCart?: (product: Product, quantity: number) => void`
- Bouton « Ajouter au panier » :
  - callback absent → désactivé, texte « Fonction d'achat en cours de connexion »
  - `available` + callback → activé, un unique appel `onAddToCart(product, quantity)`
  - `unavailable` ou `hidden` → désactivé
  - aucune notif, persistance ni compteur panier
- Favori (`useFavorites`) et `ProductPrice` + `PromotionCountdown` regroupés ici

## 5. Badges dans le résumé — priorité partagée

Nouveau helper pur `src/lib/product-badges.ts` :
```ts
export function getProductBadges(product, nowTs): Array<{ id, label, tone }>
```
Ordre de priorité (max 2) : `promotion active` → `bestseller` → `new`. Consommé par :
- `ProductCard.tsx` (remplace la logique inline)
- `ProductSummary.tsx` (nouveau rendu badges)

Le badge promo utilise `useNow()` → disparaît en même temps que prix barré, %, économies, countdown et prix promo JSON-LD.

## 6. Galerie — Dialog Radix agrandissement

Étendre `ProductGallery.tsx` avec le `Dialog` shadcn/Radix existant :
- Image principale enveloppée d'un `<button>` déclencheur + bouton loupe dédié 44×44 en overlay
- `DialogTitle` visuellement caché : « Agrandir l'image de {name} »
- Contenu : image active en `object-contain`, fond neutre
- Bouton fermer 44×44, focus trap Radix natif, `Esc` ferme, focus restauré au déclencheur
- Fallback « Image indisponible » conservé
- Aucune nouvelle dépendance

## 7. Nom cliquable dans `ProductCard`

Ajouter un `<Link to={href}>` autour du `<h3>` du nom lorsque `href` commence par `/`. Contraintes :
- image reste dans son propre `Link` séparé (pas de lien imbriqué — le nom est hors du lien image)
- favori et panier restent des `<button>` frères, `stopPropagation` conservé
- pas de reload (Link TanStack)

## 8. Tests produit réels

Créer `tests/product.test.ts` (tsx runner, style catalogue). Cas :
- `getProductBySlug` : trouvé / inconnu / hidden retourné tel quel (helper brut)
- **`getPublicProductBySlug`** : visible OK, inconnu `null`, hidden `null`, pas de mutation
- `getRelatedProducts` : exclusion courant, exclusion `hidden`, priorité même catégorie, limite, dédup, non-mutation (freeze input)
- `formatSpecifications` : valeurs nulles/vides omises, ordre attendu, diamètre `NN mm` uniquement si numérique
- `formatSchemaPriceTND(450000) === "450.000"`, `formatSchemaPriceTND(450500) === "450.500"`
- Garde statique route dynamique : pas de `NowProvider`, `Date.now`, `new Date(` dans `src/routes/montres.$slug.tsx`
- Garde statique globale : exactement une occurrence de `<NowProvider` dans `src/` (root)
- Garde statique contrat : `onAddToCart?: (product: Product, quantity: number) => void` présent dans `ProductPurchasePanel.tsx`

Ajouter dans `package.json` :
```json
"test:product": "tsx tests/product.test.ts"
```

## 9. Playwright — 3 fiches + slug inconnu + produit hidden

Scénarios sur CK, Tissot, Swatch aux largeurs 375/430/768/1024/1280/1440 :
- SSR H1 / marque / référence / prix visible
- Changement miniature (aria-current)
- Dialog open/close via bouton loupe + `Esc`, focus restauré
- Quantité initiale = 1, `−` désactivé à 1, `+` incrémente
- Bouton panier désactivé (site public sans callback) + texte « Fonction d'achat en cours de connexion »
- Favori synchronisé avec la carte d'accueil
- Badges : max 2, ordre correct
- Expiration promo simultanée (horloge virtuelle) : badge, prix barré, %, économies, countdown, `price` JSON-LD
- Coffret présent Tissot + Swatch, absent CK
- Aucune chaîne interdite : « 14 jours », « Satisfait », « 100 % authentiques », « Emballage soigné », « Garantie officielle » (hors valeur dynamique), « jours ouvrés »
- Navigation carte via image, nom, bouton « Voir le produit » (pas de full reload)
- Produit `hidden` (slug d'une fixture hidden si disponible, sinon vérifier via un slug hidden monté en test unitaire) → 404 FR ; slug inconnu → 404 FR
- Aucun overflow horizontal aux 6 largeurs
- Zéro warning React (console clean)

## 10. Validation finale

Séquence exécutée :
```
bun install --frozen-lockfile
npm run lint
npm run test:catalog
npm run test:product
npm run build
python3 /tmp/browser/pdp/run.py
```

Rapport final incluant :
- Sorties exactes de chaque commande
- **Deux compteurs séparés** : `test:catalog` (N) et `test:product` (M) — plus jamais « 42/42 » pour valider les fiches
- Liste exacte des fichiers modifiés / créés

## Fichiers touchés

Créés :
- `src/components/product-detail/ProductPurchasePanel.tsx`
- `src/components/product-detail/ProductReassurance.tsx`
- `src/lib/product-badges.ts`
- `tests/product.test.ts`

Modifiés :
- `src/lib/products.ts` (ajout `getPublicProductBySlug`)
- `src/routes/montres.$slug.tsx` (loader via helper, head sans horloge)
- `src/components/product-detail/ProductSummary.tsx` (badges + délégation panneau achat + reassurance)
- `src/components/product-detail/ProductGallery.tsx` (Dialog zoom)
- `src/components/product/ProductCard.tsx` (nom cliquable, badges via helper)
- `package.json` (script `test:product`)

Aucune fixture, dépendance, backend, panier fonctionnel, checkout, compte, avis ni engagement commercial ajouté.
