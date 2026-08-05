# Section « Avis Clients » sur la page d'accueil

## Objectif
Ajouter une section de témoignages clients sur la page d'accueil, en carrousel horizontal fluide et automatique, mise en pause au survol/toucher. Mobile first, cohérente avec le design system (crème, or, Manrope).

## Contenu de la section
- Tagline : « Avis Clients » (style `eyebrow`, aligné à gauche comme les autres sections)
- Titre : « Ils nous font confiance » (`t-h1`)
- Cartes témoignage, chacune avec :
  - Note en étoiles (1 à 5, étoiles dorées, note lisible aussi par lecteur d'écran)
  - Message du témoignage (2 à 4 lignes)
  - Nom complet du client
  - Gouvernorat (repris de la liste tunisienne existante)
  - Titre du produit acheté, en lien vers sa fiche `/montres/<slug>`

## Comportement
- **Carrousel** : défilement horizontal continu et fluide (même technique CSS que le carrousel de marques : piste dupliquée, animation `transform`, aucun JS).
- **Pause** au survol souris, au toucher et au focus clavier — les liens produit restent atteignables au clavier.
- **Mobile (< 640px)** : cartes d'environ 80 % de la largeur d'écran, une carte visible + amorce de la suivante ; léger fondu sur les bords.
- **Desktop** : cartes à largeur fixe, 3 à 4 visibles selon la largeur.
- **Accessibilité** : la liste réelle est unique pour les lecteurs d'écran, la copie de boucle est `aria-hidden`. Si « réduire les animations » est actif, pas d'animation : bande scrollable manuellement (ou grille statique), comme pour les marques.

## Données
6 avis de démonstration en fixtures frontend (`src/fixtures/testimonials.ts`), rattachés par `productSlug` aux 3 produits existants (Calvin Klein, Tissot, Swatch). Aucun backend, aucune modification des fixtures produits.

## Détails techniques
- Nouveau `src/fixtures/testimonials.ts` : type `Testimonial` (id, rating, message, fullName, governorate, productSlug).
- Nouveau `src/components/home/TestimonialsMarquee.tsx` : réutilise `usePrefersReducedMotion`, résout le produit via `src/lib/products.ts` pour le titre et le lien.
- `src/styles.css` : petit utilitaire de piste/masque dédié aux avis, réutilisant le keyframe `lmm-marquee` existant, avec pause hover/focus et gestion `prefers-reduced-motion`.
- `src/routes/index.tsx` : insertion de la section après `BrandLogosMarquee`, avant `FeaturedProducts`.
- Lighthouse : aucune image, animation en `transform` seul (GPU), hauteur de section stable donc pas de CLS, aucune nouvelle dépendance.
- Vérification : lint, build, tests, et contrôle visuel à 320 / 375 / 768 / 1440 px.
