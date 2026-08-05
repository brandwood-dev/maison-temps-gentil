# Audit UX/UI & harmonisation des largeurs de sections

## Réponse à la remarque

Mélanger des sections « pleine largeur » (marques, avis clients, bandeau engagements) et des sections contenues (`container-page`, max 1232 px) n'est **pas un défaut en soi** — c'est même une bonne pratique éditoriale premium, **à une condition** : le rythme doit être intentionnel et les **titres de toutes les sections doivent partager exactement la même gouttière gauche**.

Aujourd'hui, le site respecte à moitié cette règle :
- Les titres sont bien dans `container-page` partout (aligné à 122 px vérifié précédemment).
- Mais les **rails défilants** (marques, avis) démarrent au bord absolu de l'écran, sans lien visuel avec la gouttière du titre : la piste semble « détachée » du bloc titre, surtout en desktop large où l'écart devient très visible.
- Les zones pleine largeur n'ont pas de traitement de fond différencié cohérent : `TrustStrip` a un fond crème, les deux marquees sont sur fond blanc — donc ils lisent comme des sections contenues cassées, pas comme des sections full-bleed volontaires.

## Principe d'harmonisation retenu

Adopter un système à **deux types de sections seulement**, appliqué partout :

1. **Section contenue** — contenu dans `container-page` (hero, collections, sélection produits, catalogue).
2. **Section full-bleed rythmée** — fond pleine largeur + contenu dont le **premier élément démarre à la gouttière `container-page`**, avec débordement à droite uniquement (pattern « edge-to-edge rail »).

En mobile, aucune différence perceptible (la gouttière est de 1 rem) : le mobile-first reste intact.

## Changements prévus

### 1. Rails alignés sur la gouttière (marques + avis)
- Ajouter un utilitaire `rail-bleed` dans `src/styles.css` : `padding-inline-start` calculé sur la même formule que `container-page` (1 rem mobile / 2 rem ≥768 px, plus la marge auto au-delà de 1232 px), pour que la première carte/le premier logo commence exactement sous le « N » du titre.
- Appliquer à `BrandLogosMarquee` et `TestimonialsMarquee` sans casser l'animation (le padding vit sur le masque, pas sur la piste).

### 2. Rythme de fonds cohérent
- Alterner volontairement : `TrustStrip` (crème) → Collections (blanc) → **Marques (crème, full-bleed)** → Sélection (blanc) → **Avis clients (crème, full-bleed)**. Les zones pleine largeur deviennent lisibles comme un choix, plus comme un accident.

### 3. Espacement vertical unifié
- Un seul rythme : `py-12 md:py-16 lg:py-20` sur toutes les sections home et catalogue (aujourd'hui plusieurs valeurs coexistent), plus `mb-6 md:mb-10` uniforme sous les blocs titre.

### 4. Bloc titre standardisé
- Extraire un petit composant `SectionHeading` (eyebrow + h2 + sous-titre optionnel) et l'utiliser dans Collections, Marques, Sélection, Avis — même largeur max, même alignement gauche, même hiérarchie typographique. Supprime toute dérive future d'alignement.

### 5. Accessibilité et hiérarchie
- Vérifier un seul `h1` par page et une suite `h2` cohérente pour chaque section home.
- Ajouter `aria-labelledby` manquant sur les sections qui n'en ont pas (Collections, Sélection).

### 6. Performance Lighthouse
- `content-visibility: auto` + `contain-intrinsic-size` sur les sections sous la ligne de flottaison (marques, avis) pour réduire le coût de layout/paint initial.
- Vérifier `width`/`height` explicites et `loading="lazy"` sur toutes les images de collections/logos/produits hors hero (le hero reste en `fetchPriority="high"`).
- Confirmer que les marquees n'animent que `transform` (déjà le cas) et retirer `will-change` permanent au profit d'un usage ciblé, pour éviter des couches GPU inutiles sur mobile.

### 7. Vérification
- Audit Playwright automatisé à 320 / 375 / 430 / 768 / 1024 / 1440 px : zéro débordement horizontal, mesure de la position gauche de chaque titre **et** du premier élément de chaque rail (doivent être identiques), captures avant/après.

## Hors périmètre
Aucun changement de contenu, de fixtures, de logique panier/catalogue ni de palette. Uniquement mise en page, tokens d'espacement et performance de rendu.
