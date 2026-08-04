# Bouton flottant Scroll-to-Top

## Objectif
Ajouter un bouton flottant permettant de remonter en haut de page, disponible sur toutes les routes, sans jamais masquer le contenu du footer ou d'autres éléments fixes.

## Décisions UX / UI
- **Position** : coin inférieur droit, avec une marge suffisante pour ne pas chevaucher le footer ni les contenus en bordure.
- **Apparition** : le bouton s'affiche uniquement après avoir scrollé d'environ 300-400 px, afin de ne pas polluer l'écran d'accueil.
- **Comportement** : au clic, remontée fluide (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
- **Accessibilité** : label `aria-label="Retour en haut de la page"`, focus visible conforme au design system, gestion de `prefers-reduced-motion`.
- **Mobile-first** : taille tactile confortable (44 px minimum), placement adapté aux petits écrans.
- **Style** : bouton circulaire compact, couleur primaire ou or selon le design system, ombre subtile, hover/active clairs.

## Implémentation technique

1. **Nouveau composant** : `src/components/layout/ScrollToTop.tsx`
   - Écoute du scroll via un effet React.
   - Seuil d'affichage configurable (défaut 350 px).
   - Bouton conditionnellement rendu, avec animation d'entrée/sortie simple (opacity + translateY).
   - Gestion du réduit mouvement via media query CSS.

2. **Intégration globale** : ajouter `<ScrollToTop />` dans `src/routes/__root.tsx`, juste avant `<CartDrawer />` ou après `<Outlet />`, pour qu'il soit présent sur toutes les pages.

3. **Éviter le chevauchement du footer** :
   - Marges fixes côté viewport (`right-4 bottom-4 md:right-6 md:bottom-6`).
   - Le footer étant en flux normal, le bouton flotte au-dessus du contenu sans le recouvrir tant qu'il reste dans la marge de sécurité.
   - Pas de positionnement basé sur la hauteur du footer ; on garde une marge constante.

4. **Pas de régression** :
   - Le composant est client-only ; aucun impact SSR.
   - Aucune dépendance supplémentaire (utilise Lucide `ArrowUp` déjà présent).

## Vérification
- Captures Playwright aux largeurs 375, 430, 768, 1024, 1440 px.
- Vérifier que le bouton n'apparaît pas en haut de page.
- Vérifier qu'il ne masque pas le texte de copyright du footer.
- Vérifier le clic et la remontée fluide.
