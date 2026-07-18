## Corrections au commit catalogue 8991d0c

Périmètre strictement limité. Aucun nouveau produit, backend, panier, checkout, compte ou fiche produit.

### 1. Lint Prettier — `src/components/catalog/CatalogEmptyState.tsx`
- Lancer `npm run lint`, appliquer le formatage exact demandé sur ce seul fichier.
- Objectif : 0 erreur, 6 warnings Fast Refresh shadcn préexistants.

### 2. Supprimer la double normalisation — `CatalogPage` reçoit `query` en prop
Cause : `validateSearch: parseCatalogSearch` normalise déjà l'URL en `CatalogQuery`, mais `CatalogPage` refait `parseCatalogSearch(rawSearch)` — les champs déjà typés (`minPriceMillimes`, `maxPriceMillimes`, `promotionOnly`) sont réencodés depuis un objet qui n'a plus `minPrice`/`maxPrice`/`promo`, donc perdus.

Architecture :
- **Chaque fichier de route** définit un composant de page qui appelle directement et inconditionnellement `const query = Route.useSearch()`, puis transmet `query={query}` à `<CatalogPage>`.
- **`CatalogPage`** reçoit une prop `query: CatalogQuery`. Il **n'importe** ni `useSearch` de TanStack, ni `parseCatalogSearch`, et n'effectue **aucun** cast ou nouvelle normalisation.

Chaîne finale :
`URL brute → validateSearch(parseCatalogSearch) → Route.useSearch() → query: CatalogQuery → CatalogPage`.

### 3. Bouton « Réinitialiser » — conserver le tri
`resetFilters` remet actuellement la recherche à `{}` (perd le tri). Nouveau comportement :
- vide `brands`, `dialColors`, `minPriceMillimes`, `maxPriceMillimes`, `promotionOnly` ;
- remet `page` à 1 ;
- conserve `sort` courant ;
- la catégorie imposée reste dans la route.

Appliqué au bouton desktop, au bouton mobile du Sheet, et au bouton « Réinitialiser les filtres » de l'état « Aucun résultat ».

### 4. Script de tests reproductible + lockfile
- Ajouter `tsx` en `devDependencies` via `npm install --save-dev tsx` afin que **`package-lock.json`** (lockfile réellement utilisé par le projet — pas de bun.lockb, pas de yarn.lock) soit mis à jour et versionné.
- Ajouter dans `package.json` : `"test:catalog": "tsx tests/catalog.test.ts"`.
- Preuve d'installation propre : `rm -rf node_modules && npm ci && npm run test:catalog` passe sans téléchargement implicite.
- Étendre `tests/catalog.test.ts` :
  1. `parseCatalogSearch({ promo: "true" })` → `promotionOnly === true` ;
  2. `parseCatalogSearch({ minPrice: "500000" })` → `minPriceMillimes === 500000` ;
  3. `parseCatalogSearch({ maxPrice: "500000" })` → `maxPriceMillimes === 500000` ;
  4. round-trip idempotent sur `parseCatalogSearch(catalogQueryToSearch(...))` ;
  5. combinaison `brands + minPrice + maxPrice + promo + sort` — tous les champs conservés + `getCatalogResult` cohérent.
- **Garde statique** dans le même script (lit `src/components/catalog/CatalogPage.tsx` via `fs.readFileSync`) — sortie non nulle si l'une des règles échoue :
  - absence de `parseCatalogSearch` ;
  - absence de `useSearch` ;
  - absence des casts `as Record<string, unknown>` et `as CatalogQuery` ;
  - présence de la prop `query: CatalogQuery`.

### 5. Vérifications Playwright (6 largeurs × 7 routes)
Script dans `/tmp/browser/catalog/` :
- Routes : `/montres`, `/montres-homme`, `/montres-femme`, `/montres-enfant`, `/montres-couple`, `/montres-connectees`, `/collections/coffrets-cadeaux`.
- Largeurs : 375, 430, 768, 1024, 1280, 1440 px.
- Vérifs : 4 colonnes ≥ 1024 px, pas de scroll horizontal, ouverture/fermeture du Sheet mobile + restauration du focus sur le trigger, aucun warning React (console).
- URL directes sur `/montres` : `?promo=true`, `?minPrice=500000`, `?maxPrice=500000`, combinaison `?brands=Tissot&minPrice=100000&maxPrice=2000000&promo=true&sort=price-asc` — vérification après reload, back, forward, suppression d'une puce, changement de tri (retour page 1).
- États : catégorie vide (couple, connectees, coffrets-cadeaux) vs zéro résultat (filtres impossibles sur `/montres`).
- Bouton Réinitialiser : desktop, mobile, état « Aucun résultat » — le tri courant survit.

### 6. Validation finale — ordre exact
1. `npm run lint`
2. `rm -rf node_modules && npm ci`
3. `npm run test:catalog`
4. `npm run build`
5. Script Playwright

Rapport final = sorties réelles, nombre exact de tests exécutés, preuve grep sur `CatalogPage.tsx` (absence de `parseCatalogSearch`/`useSearch`/casts, présence de `query: CatalogQuery`), résultats promo/minPrice/maxPrice/combinaison, résultats par largeur, liste des fichiers modifiés, confirmation périmètre non élargi.

### Fichiers touchés (prévision)
- `src/components/catalog/CatalogEmptyState.tsx` (formatage)
- `src/components/catalog/CatalogPage.tsx` (prop `query: CatalogQuery`, suppression `useSearch`/`parseCatalogSearch`/casts, reset conserve `sort`)
- `src/routes/montres.tsx`, `montres-homme.tsx`, `montres-femme.tsx`, `montres-enfant.tsx`, `montres-couple.tsx`, `montres-connectees.tsx`, `collections.coffrets-cadeaux.tsx` (composant de page appelant `Route.useSearch()` et passant `query={query}`)
- `package.json` + `package-lock.json` (ajout `tsx`, script `test:catalog`, lockfile versionné)
- `tests/catalog.test.ts` (nouveaux cas + garde statique)
