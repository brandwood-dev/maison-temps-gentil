# Refonte UI — page de confirmation de commande

Objectif : transformer `/commande/confirmation` en une page de remerciement moderne, minimaliste et mobile-first, centrée sur trois messages clairs : merci, voici votre référence (à conserver), voici comment suivre votre commande.

## Nouvelle structure de la page (mobile d'abord)

```text
┌───────────────────────────────┐
│  ✓  Merci, {Prénom} !         │  bloc remerciement
│  Votre commande est enregistrée│
├───────────────────────────────┤
│  RÉFÉRENCE DE COMMANDE        │  carte mise en avant (or)
│  LMM-2026-0001   [Copier]     │  + rappel « conservez-la »
├───────────────────────────────┤
│  Suivre ma commande  →        │  CTA principal vers /suivi-commande
│  Continuer mes achats         │  CTA secondaire
├───────────────────────────────┤
│  Étapes : Confirmée · Prépa · │  suivi simplifié, plus léger
│  Expédition                    │
├───────────────────────────────┤
│  Récapitulatif (articles,     │
│  sous-total, livraison, total)│
├───────────────────────────────┤
│  Livraison & paiement à la    │
│  livraison + adresse           │
└───────────────────────────────┘
```

Sur desktop : remerciement + référence en pleine largeur, puis deux colonnes (récapitulatif à gauche, adresse/livraison à droite), CTA remontés sous la carte référence.

## Améliorations concrètes

- **Remerciement personnalisé** : « Merci {Prénom} ! » quand l'adresse est disponible, sinon « Merci pour votre commande ! », avec une sous-phrase courte annonçant l'appel de confirmation.
- **Carte référence renforcée** : référence en grand, monospace/tabulaire, bouton « Copier la référence » (retour visuel « Copié ! », `aria-live`), et mention explicite : conservez cette référence, elle est nécessaire pour suivre la commande.
- **Bloc suivi** : encart dédié expliquant que le suivi se fait dans l'espace `/suivi-commande` avec la référence + le numéro de téléphone utilisé à la commande, avec le CTA principal.
- **Hiérarchie allégée** : moins de bordures/cartes empilées, plus d'air, séparateurs fins, une seule couleur d'accent (or) réservée à la référence et à l'étape en cours.
- **Récapitulatif plus lisible** : miniatures produits, nom sur 2 lignes maximum, quantité et total alignés, ligne « Total à payer à la livraison » mise en valeur.
- **Mobile-first** : boutons pleine largeur ≥48 px, aucun débordement horizontal, typographie fluide, timeline verticale sur mobile et horizontale à partir de `sm`.
- **États annexes** : version « aucune commande » redessinée dans le même langage visuel.

## Détails techniques

- Fichier modifié : `src/routes/commande.confirmation.tsx` (présentation uniquement).
- Découpage en sous-composants locaux : `ThankYouHero`, `OrderReferenceCard`, `TrackingCallout`, `OrderRecap`, `DeliveryInfo`.
- Données inchangées : lecture via `readConfirmation()`, montants formatés avec `formatPriceTND`, libellés depuis `checkout-config`.
- Uniquement des tokens sémantiques du design system (`--color-foreground`, `--color-surface-cream`, `--color-gold`, `--radius-*`) — aucune couleur codée en dur.
- Copie de la référence via `navigator.clipboard` avec repli `document.execCommand` et message accessible.
- Le lien de suivi reste `/suivi-commande` (pas de nouveau paramètre d'URL, la page ne gère pas encore de pré-remplissage).
- Vérification Playwright en 320/375/393/768/1440 px : pas de scroll horizontal, contraste et hauteurs de cible respectés.

Aucune modification du panier, du checkout ou des données.
