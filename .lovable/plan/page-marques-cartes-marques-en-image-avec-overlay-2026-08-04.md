# Page /marques — cartes marques en image avec overlay

## Objectif
Créer la page « Marques » : une grille de cartes plein format, chaque carte affichant une photo de montre, un voile sombre (overlay) et le nom de la marque en grand, centré et parfaitement lisible. Au survol, l'image zoome légèrement ; au clic, redirection vers `/montres` avec le filtre de la marque déjà appliqué.

## Contenu
Marques issues du catalogue existant : Calvin Klein, Tissot, Swatch. La liste est générée automatiquement depuis les produits, donc toute nouvelle marque apparaîtra sans modification de la page. L'image de chaque carte est la photo principale du produit le plus représentatif de la marque.

## Comportement
- Grille : 1 colonne sur très petits écrans, 2 colonnes dès 380px, 3 colonnes dès 1024px ; cartes en format carré, espacement régulier.
- Carte entière cliquable (lien), nom de la marque en majuscules espacées sur fond assombri en dégradé pour un contraste AA garanti.
- Survol / focus : zoom doux de l'image (~1.06) et léger renforcement du voile ; transition fluide, désactivée si « réduire les animations » est activé.
- Clic : navigation vers `/montres` avec le filtre marque présélectionné, les autres filtres restant à leur valeur par défaut. Les filtres actifs du catalogue affichent alors la marque, supprimable comme d'habitude.
- Compteur discret du nombre de modèles par marque sous le nom.
- En-tête de page : fil d'Ariane, H1 « Nos marques », courte introduction. Header/footer existants réutilisés.

## Détails techniques
- Nouveau `src/routes/marques.tsx` (route déjà présente dans le menu et le footer) avec `head()` dédié : title, description, og:title, og:description, og:url, canonical, og:type.
- Nouveau composant `src/components/brand/BrandCard.tsx` : `Link` TanStack vers `/montres` avec `search` construit via les utilitaires existants de `src/lib/catalog.ts` (aucune duplication de la logique de filtres, pas d'URL écrite à la main).
- Dérivation des marques dans un petit helper (nom, slug, image, nombre de produits) à partir de `PRODUCTS`, en excluant les produits `hidden`.
- Images : réutilisation des URL Cloudinary déjà présentes dans les fixtures, avec `loading="lazy"`, `decoding="async"`, dimensions explicites (pas de CLS) et `alt` descriptif.
- Uniquement des tokens du design system (crème, noir, or, `--on-image*`) ; aucune couleur codée en dur, aucune dépendance ajoutée.
- Vérification : lint, build, contrôle visuel à 375 / 768 / 1440 px et test du clic vers `/montres` filtré.
