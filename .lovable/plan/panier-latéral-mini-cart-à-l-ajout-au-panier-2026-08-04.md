# Panier latéral (mini-cart) à l'ajout au panier

Objectif : quand un client ajoute un produit au panier depuis n'importe quelle page (accueil, catalogue, promotions, favoris, fiche produit), un panneau latéral s'ouvre automatiquement pour montrer le contenu du panier, avec accès direct au panier complet et à la commande.

## Comportement

- Ouverture automatique du panneau juste après un ajout, avec la ligne ajoutée visible en haut.
- Panneau glissant depuis la droite sur desktop, plein écran mobile-first sur petits écrans (fermeture par croix, touche Échap, clic sur le fond).
- Contenu : liste des articles (image, marque, modèle, prix unitaire promo/barré, quantité +/-, suppression), sous-total en TND, rappel « paiement à la livraison », boutons « Voir mon panier » (/panier) et « Commander » (/commande).
- État vide : message court + bouton « Découvrir les montres » vers /montres.
- L'icône panier de l'en-tête ouvre aussi ce panneau (le lien /panier reste accessible depuis le panneau).
- Navigation depuis le panneau (clic sur un produit ou un CTA) le referme.
- Aucune ouverture automatique lors des changements de quantité dans /panier ou /commande, ni lors d'une synchronisation entre onglets.

## Accessibilité et qualité

- Panneau en dialogue modal (Radix Sheet déjà présent) : focus piégé, focus restitué au bouton d'origine, titre lisible par lecteur d'écran, `aria-live` pour annoncer « Produit ajouté au panier ».
- Respect de `prefers-reduced-motion` pour l'animation d'ouverture.
- Textes 100 % français, tokens du design system (noir/crème/or), aucune couleur codée en dur.

## Détails techniques

- `src/lib/cart-store.ts` : ajouter un petit store d'UI (`openCartDrawer`, `closeCartDrawer`, `useCartDrawer`) basé sur `useSyncExternalStore`, plus un compteur/`lastAddedProductId`. `addItem` déclenche l'ouverture ; `setQuantity`/`removeItem`/`clearCart` et l'événement `storage` ne l'ouvrent pas.
- Nouveau `src/components/cart/CartDrawer.tsx` : rendu via `Sheet`, résolution des produits depuis `PRODUCTS` et prix via les utilitaires existants (`product-pricing`) et l'horloge partagée `useNow()`.
- Nouveau `src/components/cart/CartLineItem.tsx` pour une ligne (réutilisable, présentational).
- Montage unique du drawer dans `src/routes/__root.tsx` (à l'intérieur du `NowProvider`, à côté du header/footer) — SSR-safe, fermé par défaut, aucun accès à `localStorage` au rendu.
- `src/components/layout/SiteHeader.tsx` : le bouton panier ouvre le drawer au lieu de naviguer (garde un fallback lien accessible).
- Aucune modification des fixtures, ni de la logique de prix/checkout.
