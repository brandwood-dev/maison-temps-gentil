# Correction du débordement horizontal sur mobile (/commande) + audit responsive du site

## Diagnostic confirmé
Sur `/commande` en 393 px, la page peut défiler horizontalement de ~35 px (bande blanche à droite). Mesures en direct dans l'aperçu :

- La colonne de la grille de commande mesure 342 px, mais le `<form>` de livraison mesure 393 px et dépasse.
- Cause : les champs natifs (`<select>` des 24 gouvernorats, `<textarea>`, `<input>`) imposent une largeur minimale intrinsèque, et les éléments de grille/flex ont `min-width: auto` par défaut. Le formulaire refuse donc de se rétrécir sous la largeur de l'écran, ce qui étire toute la page.
- Aucun autre débordement de document n'a été détecté sur les autres pages testées (accueil, catalogue, panier, promotions, favoris, contact, suivi, FAQ, livraison, marques, CGV, confirmation) en 320 et 375 px, mais l'audit sera refait après correction pour vérifier aussi les états remplis (panier non vide, filtres actifs, menus ouverts).

## Ce qui va changer

### 1. Page /commande (cause du bug)
- Autoriser la colonne et le formulaire à se rétrécir (largeur minimale nulle) au lieu de suivre la largeur intrinsèque des champs.
- Forcer tous les champs (`input`, `select`, `textarea`) à occuper 100 % de la largeur disponible sans largeur intrinsèque minimale.
- Adapter la sous-grille « Ville / Code postal » pour qu'elle reste en une colonne sur petit écran et ne fixe pas une largeur rigide.
- Vérifier que le bloc récapitulatif (noms de produits longs, prix) reste tronqué proprement.

### 2. Filet de sécurité global
- Empêcher tout défilement horizontal accidentel du document sur l'ensemble du site, sans casser les carrousels internes (bandeau d'annonces, bandeau d'engagements) qui gardent leur propre défilement masqué.
- Vérifier que les images, titres longs et champs de formulaire des autres pages (contact, suivi de commande, newsletter du footer, recherche) respectent la même règle de rétrécissement.

### 3. Audit responsive complet
- Passage automatisé de toutes les routes publiques aux largeurs 320 / 360 / 375 / 393 / 430 px, dans deux états : panier vide et panier rempli.
- Contrôle pour chaque page : aucun défilement horizontal, aucun texte coupé, cibles tactiles ≥ 44 px, lisibilité des titres.
- Correction ciblée de chaque écart trouvé, sans modification du design ni des fonctionnalités.

### 4. Bonus quiet fix
Une erreur d'hydratation apparaît sur `/commande` (l'état « chargement » du panier diffère entre serveur et navigateur). Elle sera corrigée en même temps pour éviter un scintillement au chargement.

## Détails techniques
- `src/routes/commande.tsx` : ajout de `min-w-0` sur la colonne de grille et le formulaire, `w-full min-w-0` sur `inputClass`, adaptation de `sm:grid-cols-[minmax(0,1fr)_140px]` en `minmax(0,140px)`, `min-w-0`/`truncate` sur le récapitulatif.
- `src/styles.css` : `html, body { overflow-x: clip; max-width: 100%; }` (clip plutôt que hidden pour préserver `position: sticky`).
- Hydratation : rendu initial serveur/client aligné sur l'état non hydraté du panier.
- Vérification : script Playwright multi-largeurs, `bun run lint` et build.

## Hors périmètre
Aucun changement de contenu, de design visuel, de logique de prix ou de tunnel de commande.
