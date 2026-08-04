# Hero bannière centré pour les pages catégorie

Remplacer le bandeau crème actuel des pages catégorie par un hero image plein largeur, avec overlay garantissant la lisibilité, et contenu centré (fil d'Ariane, titre, sous-titre, nombre d'articles).

## Rendu visé

```text
┌──────────────────────────────────────────┐
│      image de fond + overlay sombre      │
│        Accueil › Montres › Homme         │
│            Montres Homme                 │
│   Une sélection pensée pour un style…    │
│               12 montres                 │
└──────────────────────────────────────────┘
```

- Mobile d'abord : hauteur compacte (min-h ~13rem), padding vertical généreux, texte centré, fil d'Ariane sur une ligne repliable.
- Tablette / desktop : hauteur croissante (~17rem / ~20rem), largeur de texte limitée et centrée.
- Overlay : dégradé sombre + voile uni pour garantir un contraste AA sur tout le texte, quelle que soit l'image.
- Texte en tokens de couleur clairs déjà définis dans le design system (aucune couleur codée en dur).

## Pages concernées

Toutes les pages qui utilisent le catalogue : Montres (index), Homme, Femme, Enfant, Connectées, Couple, Promotions, Coffrets cadeaux.

## Images

Une image par catégorie. Comme les URLs Cloudinary définitives ne sont pas encore disponibles, chaque page reçoit pour l'instant l'image du hero d'accueil comme valeur par défaut, via une table centralisée `CATEGORY_HERO_IMAGES` (une clé par page). Quand vous fournirez les URLs, il suffira de remplacer les valeurs dans cette table — aucun autre fichier à toucher.

## Détails techniques

- `src/config/category-hero.ts` (nouveau) : table `CATEGORY_HERO_IMAGES` associant chaque `basePath` à `{ src, alt }`.
- `src/components/catalog/CatalogHeader.tsx` : réécrit en hero — `<img>` de fond en `absolute inset-0 object-cover`, overlay en pseudo-couche, contenu centré (`text-center`, `mx-auto`), fil d'Ariane centré et `flex-wrap justify-center`. Nouvelles props optionnelles `imageSrc` / `imageAlt` ; sans image, on garde un fond de repli en token crème/noir.
- `src/components/catalog/CatalogPage.tsx` : passe `imageSrc`/`imageAlt` au header, résolus depuis `basePath`.
- Aucune modification des routes, du filtrage, du tri, de la pagination ni des fixtures.

## Performance / accessibilité (Lighthouse)

- Image de hero décorative : `alt=""` + `aria-hidden`, donc pas de bruit lecteur d'écran ; le sens reste porté par le `h1`.
- `width`/`height` explicites et `object-cover` pour éviter tout CLS ; `fetchpriority="high"` + `loading="eager"` + `decoding="async"` sur ce hero (candidat LCP de la page catégorie).
- `srcset`/`sizes` sur les largeurs 640/1024/1600 via les paramètres de transformation Cloudinary, comme sur la page d'accueil.
- Contraste vérifié sur le texte le plus petit (nombre d'articles) après overlay.
