# Bandeau d'engagements en carrousel automatique sur mobile

## Objectif
Sous la hero, remplacer la grille 2 colonnes des 5 badges (Livraison Tunisie, Sous 2 à 3 jours, Paiement livraison, Garantie, Assistance) par un défilement horizontal automatique en continu sur mobile, afin d'alléger l'écran. Le rendu desktop reste inchangé.

## Ce qui change
- **Mobile (< 768px)** : une seule ligne, défilement horizontal fluide et infini (type marquee), vitesse lente et régulière, badges séparés par un léger espacement. Le bandeau garde sa hauteur fixe, donc aucun décalage de mise en page.
- **Tablette/desktop (≥ 768px)** : grille 5 colonnes actuelle, sans animation.
- **Confort de lecture** : l'animation se met en pause au toucher/survol et au focus clavier ; un léger fondu sur les bords gauche/droite indique que le contenu continue.
- **Accessibilité** : la liste réelle reste unique pour les lecteurs d'écran, la copie servant à la boucle est masquée (`aria-hidden`). Si l'utilisateur a activé « réduire les animations », le défilement est désactivé et remplacé par une bande scrollable manuellement.

## Détails techniques
- `src/components/layout/TrustStrip.tsx` : ajout d'une piste dupliquée (2x la liste) visible uniquement en dessous de `md`, la grille existante restant en `md:`.
- `src/styles.css` : keyframes de translation (-50%) + utilitaire d'animation, pause au hover/focus, désactivation sous `prefers-reduced-motion` (déjà géré globalement, complété par un fallback `overflow-x-auto`).
- Animation en `transform` uniquement (composée par le GPU), aucun JS, aucune nouvelle dépendance : pas d'impact sur les scores Lighthouse ni de CLS.
- Vérification : lint, build, et contrôle visuel à 375 / 768 / 1440 px.
