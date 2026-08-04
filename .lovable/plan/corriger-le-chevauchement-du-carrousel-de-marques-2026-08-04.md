# Corriger le chevauchement du carrousel de marques

## Diagnostic confirmé

Le conteneur animé mesure actuellement moins que la largeur de l’écran sur desktop, alors que ses logos débordent largement. Les deux groupes dupliqués sont des enfants flexibles avec le comportement de rétrécissement par défaut : le second groupe commence donc avant la fin du premier, ce qui provoque la superposition visible entre Swatch et Calvin Klein.

## Mise en œuvre

1. Rendre les deux groupes de logos strictement incompressibles avec `shrink-0`, tout en conservant leur largeur basée sur leur contenu.
2. Stabiliser chaque emplacement de logo avec des dimensions mobile-first adaptées, sans fond ni bordure, afin que les PNG de proportions différentes gardent un espacement régulier.
3. Conserver une seule séparation cohérente entre les deux pistes et aligner cette valeur avec le calcul CSS de translation pour obtenir une boucle continue sans saut.
4. Préserver l’accessibilité existante : liens nommés, copie décorative masquée aux technologies d’assistance, pause au survol/focus et désactivation de l’animation si l’utilisateur préfère réduire les mouvements.

## Vérification responsive

- Contrôler visuellement et mesurer les rectangles des logos à 320, 375, 430, 768, 1024 et 1440 px.
- Vérifier qu’aucune paire de logos ne se chevauche pendant plusieurs instants de l’animation.
- Vérifier l’absence de débordement horizontal de la page et la continuité de la boucle.
- Exécuter les contrôles automatiques du projet sur les fichiers modifiés.