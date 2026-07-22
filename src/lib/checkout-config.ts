/**
 * Configuration centralisée du checkout.
 * ⚠️ Valeurs temporaires — à valider avec le métier avant mise en production.
 * Les frais et délais définitifs seront fournis par le futur backend NestJS.
 */

/** Frais de livraison forfaitaires, en millimes (temporaire). */
export const SHIPPING_FEE_MILLIMES = 8_000; // 8 DT — à confirmer

/** Seuil de livraison gratuite en millimes (temporaire). */
export const FREE_SHIPPING_THRESHOLD_MILLIMES = 500_000; // 500 DT — à confirmer

/** Délai de livraison affiché (jours ouvrés). */
export const SHIPPING_DELAY_LABEL = "2 à 3 jours ouvrés";

/** Mode de paiement unique pour l'instant. */
export const PAYMENT_METHOD_LABEL = "Paiement à la livraison (espèces)";
