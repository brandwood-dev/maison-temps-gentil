# Bandeau promotionnel animé (haut du site)

## Objectif
Le bandeau noir en haut du site n'affiche qu'un seul message. Il doit faire défiler en boucle plusieurs messages promotionnels, avec une animation fluide, mobile first, sans décalage de mise en page.

## Messages proposés (modifiables)
1. Livraison rapide partout en Tunisie sous 2 à 3 jours
2. Paiement à la livraison disponible
3. Garantie sur toutes nos montres
4. Nouveautés chaque semaine — découvrez la collection
5. Une équipe à votre écoute du lundi au samedi

## Comportement
- **Mobile (< 768px)** : défilement horizontal continu (marquee) des messages séparés par un petit séparateur doré, vitesse lente et régulière, boucle sans coupure visible.
- **Tablette / desktop (≥ 768px)** : messages centrés qui se succèdent par fondu enchaîné vertical léger (~4 s par message), pour garder un rendu sobre et premium.
- Hauteur du bandeau fixe (identique à l'actuelle) : aucun layout shift, aucun impact CLS.
- Pause de l'animation au survol, au toucher et au focus clavier.
- `prefers-reduced-motion` : pas d'animation, le bandeau devient une bande lisible/scrollable manuellement.
- Accessibilité : une seule liste réelle exposée aux lecteurs d'écran, la copie de boucle en `aria-hidden`, zone non annoncée en continu (pas d'`aria-live`).

## Détails techniques
- `src/config/nav.ts` : remplacer `ANNOUNCEMENT_TEXT` par `ANNOUNCEMENT_MESSAGES` (tableau), en gardant un export de compatibilité si nécessaire.
- `src/components/layout/AnnouncementBar.tsx` : accepte `messages?: string[]`, rend la piste dupliquée en dessous de `md` et la rotation en fondu à partir de `md`. Aucune nouvelle dépendance.
- `src/styles.css` : réutiliser les keyframes marquee existants (`lmm-marquee`) et ajouter des utilitaires dédiés au bandeau (durée plus courte, séparateur, fondu) sans toucher au comportement du `TrustStrip`.
- Vérification : lint, build, contrôle visuel à 375 / 768 / 1440 px.
