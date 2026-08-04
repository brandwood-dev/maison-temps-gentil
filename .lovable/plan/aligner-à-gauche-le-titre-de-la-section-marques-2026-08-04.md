# Aligner à gauche le titre de la section « Marques »

## Problème confirmé

Le bloc titre de la section « Marques » est centré alors que tous les autres blocs titres de la page d'accueil sont alignés à gauche.

Mesures relevées sur la page d'accueil (position gauche en px, écran 1478px) :

```text
Collections / L'élégance intemporelle   ->  122
Sélection / Nos montres                 ->  122
Marques / Nos marques à la une          ->  426   (décalé)
```

Cause : dans le composant du carrousel de marques, la classe de conteneur (marges automatiques + largeur maximale de page) est appliquée sur le même élément qu'une largeur réduite de 672px. Les marges automatiques centrent donc ce bloc étroit. Dans les autres sections, le conteneur et la largeur réduite sont sur deux éléments distincts, ce qui laisse le texte collé à gauche.

Aucune autre section du site ne combine ces deux classes sur le même élément (vérifié par recherche globale) : le correctif est donc localisé.

## Correctif

Dans `src/components/home/BrandLogosMarquee.tsx`, séparer le conteneur de page et la largeur du bloc titre :

- élément externe : conteneur de page seul (largeur pleine, gouttières identiques aux autres sections) ;
- élément interne : bloc titre limité en largeur, aligné à gauche, portant les marges basses actuelles.

Le tagline « Marques » et le titre « Nos marques à la une » s'alignent alors exactement sur « Collections » et « Sélection », sans toucher au carrousel lui-même (pleine largeur, animation et respect de `prefers-reduced-motion` inchangés).

## Vérification

Après modification, remesurer la position gauche des taglines et titres de sections sur la page d'accueil en mobile (375px) et desktop (1440px) : les trois sections doivent renvoyer la même valeur.
