# Hero pleine largeur avec image de fond

## Objectif
Supprimer définitivement la carte « Emplacement visuel » de la hero de la page d'accueil et la remplacer par une hero full-width avec image de fond + overlay garantissant la lisibilité du tag, du titre, du sous-titre et des boutons.

## Ce qui change
- **Suppression** du bloc visuel placeholder (icône horloge + textes « Emplacement visuel ») et de la grille 2 colonnes de la hero.
- **Nouvelle hero** : section pleine largeur, image de fond (Cloudinary fournie), contenu aligné à gauche dans le conteneur, hauteur fluide (mobile compact, plus généreuse à partir de `md`).
- **Overlay** : dégradé sombre (noir de la charte) plus dense à gauche/bas, garantissant un contraste AA sur le texte quelle que soit la zone de l'image ; textes passés en variantes claires via tokens du design system.
- **Boutons** : CTA principal doré/clair et CTA secondaire en style « outline clair » lisible sur photo, empilés pleine largeur sur mobile, en ligne dès `sm`.
- **Mobile first** : art direction par `object-position` pour garder le cadran de la montre visible sur petits écrans, aucun texte tronqué à 320px.

## Performance (Lighthouse)
- Image de fond rendue par une balise `<img>` en couche absolue (pas `background-image`) pour bénéficier de `fetchpriority="high"`, `decoding="async"`, `sizes` responsive et des transformations Cloudinary (`f_auto,q_auto`, largeurs multiples via `srcset`).
- `preconnect` + `preload` de l'image LCP dans le `head()` de la route d'accueil.
- Couleur de fond de secours sur la section pour éviter tout flash/CLS ; dimensions réservées par ratio afin d'éviter le layout shift.
- Aucune nouvelle dépendance, aucun changement de logique métier.

## Détails techniques
- Fichiers touchés : `src/routes/index.tsx` (hero + `head()` preload), `src/styles.css` uniquement si un token d'overlay/texte « on-image » doit être ajouté.
- Les couleurs de l'overlay et du texte sur image utilisent des tokens sémantiques (aucun `text-white`/`bg-black` en dur).
- Vérification : `lint`, tests existants et build de production, plus contrôle visuel à 320/375/768/1024/1440 px.
