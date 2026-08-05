# Centrer les titres des sections Marques et Avis Clients

## Objectif
Rendre les titres des sections full-bleed (Marques et Avis Clients) centrés pour un meilleur équilibre visuel, tout en conservant l'alignement à gauche des sections contenues (Collections, Sélection produits).

## Changements prévus

### 1. SectionHeading — ajout d'une option de centrage
Ajouter une prop optionnelle `align?: 'left' | 'center'` au composant `src/components/brand/SectionHeading.tsx`.
- Valeur par défaut : `'left'` (comportement actuel).
- En mode `'center'` : le bloc titre passe en `text-center` et est centré horizontalement (`mx-auto`).
- La largeur max reste identique (`max-w-2xl`) pour éviter les lignes trop longues.

### 2. Marques
Dans `src/components/home/BrandLogosMarquee.tsx`, passer `align="center"` à `<SectionHeading />`.

### 3. Avis Clients
Dans `src/components/home/TestimonialsMarquee.tsx`, passer `align="center"` à `<SectionHeading />`.

### 4. Vérification responsive
- S'assurer que le centrage reste lisible de 320 px à 1440 px.
- Vérifier que les titres ne chevauchent pas les rails défilants.
- Confirmer que Collections et Sélection restent alignées à gauche.

### 5. Qualité
- Lancer le build et le lint pour valider la modification.
- Aucun changement de contenu, de fixtures, ni de logique métier.
