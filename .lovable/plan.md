# Plan : Remplacement du favicon Lovable par le logo de La Maison des Montres

## Problème constaté
Le site utilise toujours le favicon par défaut de Lovable (`public/favicon.ico`, 20 Ko). Google affiche donc ce favicon générique à côté de `lamaisondesmontres.com` dans les résultats de recherche. Le logo de la marque existe déjà sous forme d’assets Cloudinary (variantes dark/light dans `src/components/brand/Logo.tsx`), mais il n’a jamais été décliné en favicon.

## Objectif
Générer un favicon propre au logo de La Maison des Montres, le déployer dans `public/`, mettre à jour la référence dans `src/routes/__root.tsx`, et supprimer l’ancien favicon Lovable.

## Étapes d’implémentation

1. **Télécharger l’asset logo le plus adapté**
   - Utiliser la variante **dark** (`LOGO_VB_qf9hpa.png`) car elle est conçue pour les fonds clairs, ce qui correspond au contexte d’affichage de Google.
   - Télécharger l’image depuis Cloudinary vers `/tmp/logo-source.png`.

2. **Générer un favicon carré et lisible**
   - Redimensionner le logo en 64×64 px avec padding pour conserver les proportions (`magick -resize 64x64 -background none -gravity center -extent 64x64`).
   - Sauvegarder le résultat en `public/favicon.png`.
   - Vérifier visuellement le rendu à 16×16, 32×32 et 64×64 px pour s’assurer que le logo reste identifiable.

3. **Mettre à jour la référence dans `src/routes/__root.tsx`**
   - Remplacer l’entrée :
     ```tsx
     { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }
     ```
     par :
     ```tsx
     { rel: "icon", type: "image/png", href: "/favicon.png" }
     ```

4. **Supprimer l’ancien favicon Lovable**
   - Supprimer `public/favicon.ico` pour éviter qu’il ne continue à être servi par certains crawlers ou navigateurs.

5. **Vérification locale**
   - Lancer un build de développement (`bun run dev` ou équivalent) et vérifier que `http://localhost:8080/favicon.png` répond correctement.
   - Vérifier dans l’onglet Réseau/Éléments du navigateur que le `<link rel="icon">` pointe bien sur `/favicon.png`.

## Limites importantes
- Google met du temps à répercuter le changement de favicon dans les résultats de recherche (généralement quelques jours à quelques semaines). Le plan ci-dessus corrige la source technique, mais il n’est pas possible de forcer la mise à jour côté Google depuis Lovable.
- Une fois le favicon publié, il est recommandé de demander une réindexation de la page d’accueil via Google Search Console si une propriété est configurée. Actuellement, aucune connexion Search Console n’est liée au projet.

## Livrables
- `public/favicon.png` (logo de la marque, 64×64 px)
- `src/routes/__root.tsx` mis à jour avec le nouveau `<link rel="icon">`
- Suppression de `public/favicon.ico`
