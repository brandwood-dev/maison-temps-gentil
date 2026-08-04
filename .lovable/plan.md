# Prompt pour Codex — Remplacement du favicon Lovable par le logo de La Maison des Montres

## Contexte
Le site « La Maison des Montres » est un e-commerce tunisien de montres, hébergé sur Lovable (TanStack Start + React + Tailwind v4). Actuellement, le favicon affiché dans les résultats Google est toujours le favicon par défaut de Lovable. Le logo de la marque existe déjà sous forme d’images PNG hébergées sur Cloudinary.

## État actuel à vérifier
- `public/favicon.ico` : favicon par défaut de Lovable (20 Ko), à supprimer.
- `src/routes/__root.tsx` : contient actuellement `{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" }` dans `head().links`.
- Logo de la marque (variante dark, adaptée aux fonds clairs comme Google) :
  `https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VB_qf9hpa.png`
- Logo variante light (fond sombre) :
  `https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VW_eczfrh.png`

## Objectif
Remplacer le favicon Lovable par un favicon dérivé du logo de la marque, de sorte que Google finisse par afficher le logo de La Maison des Montres à côté du site dans les résultats de recherche.

## Instructions précises

1. **Télécharger le logo source**
   - Télécharger l’image dark (`LOGO_VB_qf9hpa.png`) depuis Cloudinary.

2. **Générer le favicon**
   - Convertir le logo en une image carrée de 64×64 px avec padding transparent pour conserver les proportions.
   - Utiliser ImageMagick avec une commande équivalente à :
     ```bash
     magick LOGO_VB_qf9hpa.png -resize 64x64 -background none -gravity center -extent 64x64 public/favicon.png
     ```
   - Sauvegarder le résultat dans `public/favicon.png`.
   - Vérifier visuellement que le logo reste lisible à 16×16, 32×32 et 64×64 px.

3. **Mettre à jour `src/routes/__root.tsx`**
   - Dans `head().links`, remplacer :
     ```tsx
     { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }
     ```
     par :
     ```tsx
     { rel: "icon", type: "image/png", href: "/favicon.png" }
     ```
   - Ne modifier que cette ligne ; ne pas toucher aux autres balises `meta`, `links`, `scripts`.

4. **Supprimer l’ancien favicon**
   - Supprimer `public/favicon.ico` pour éviter qu’il ne reste servi par certains navigateurs ou crawlers.

5. **Vérifier le rendu**
   - Lancer le serveur de développement (`bun run dev`).
   - Vérifier que `http://localhost:8080/favicon.png` s’affiche correctement.
   - Vérifier dans l’inspecteur que le `<link rel="icon">` pointe bien sur `/favicon.png`.
   - S’assurer qu’il n’y a pas d’erreur de build (`bun run build` ou `bun run typecheck`).

## Contraintes et bonnes pratiques
- Ne pas embarquer d’image binaire dans `src/assets` ; le favicon doit être un vrai fichier dans `public/`.
- Ne pas utiliser `lovable-assets` pour le favicon (exception connue : le favicon doit être un fichier réel dans `public/`).
- Préserver le reste du code inchangé.
- Mobile-first et responsive : le favicon étant une icône unique, sa taille 64×64 px suffit pour tous les appareils.

## Livrables attendus
- `public/favicon.png` (logo de la marque, 64×64 px, fond transparent si pertinent)
- `src/routes/__root.tsx` avec le `<link rel="icon">` mis à jour
- Suppression de `public/favicon.ico`

## Note importante pour l’utilisateur
Google met plusieurs jours à plusieurs semaines à répercuter un changement de favicon dans les résultats de recherche. Une fois le favicon publié, il est recommandé de demander une réindexation de la page d’accueil via Google Search Console. Aucune connexion Search Console n’est actuellement liée au projet Lovable.
