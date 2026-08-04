# Grille catalogue : 3 cartes par ligne

## Objectif
Dans les pages catalogue (toutes catégories, `/montres`, `/promotions`), afficher au maximum 3 cartes produit par ligne au lieu de 4, pour laisser respirer les cartes à côté du sidebar de filtres.

## Ce qui change
- La grille produit accepte une densité « catalogue » : 1 colonne sur très petit écran, 2 colonnes dès 380px, 3 colonnes à partir de 1024px — et plus jamais 4.
- La page d'accueil et les autres grilles sans sidebar gardent la densité actuelle (jusqu'à 4 colonnes) : rien ne change visuellement là-bas.
- Espacements légèrement élargis dans la grille catalogue pour un rendu premium moins serré.

## Détails techniques
- `src/components/product/ProductGrid.tsx` : ajouter une prop optionnelle `density?: "default" | "catalog"` (par défaut `default`). En `catalog`, classes `grid-cols-1 xs:grid-cols-2 lg:grid-cols-3` (sans `md:grid-cols-3 lg:grid-cols-4`) avec `gap` un peu plus généreux.
- `src/components/catalog/CatalogPage.tsx` : passer `density="catalog"` au `ProductGrid` du catalogue (donc aussi pour `/promotions` et les pages catégorie qui réutilisent ce composant).
- Aucune modification de la logique de filtres, tri, pagination ni des fixtures.

## Vérification
Contrôle visuel via Playwright sur `/montres` et `/promotions` en 375, 768, 1024, 1440px : max 3 cartes par ligne, aucun débordement ni chevauchement du sidebar.
