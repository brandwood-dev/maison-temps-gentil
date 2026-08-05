import { PRODUCTS } from "@/fixtures/products";
import type { CartItem } from "@/lib/cart-store";
import { getCurrentPriceMillimes, isPromotionActive } from "@/lib/product-pricing";
import type { Product } from "@/types/product";
import { FREE_SHIPPING_THRESHOLD_MILLIMES, SHIPPING_FEE_MILLIMES } from "@/lib/checkout-config";
import { isTunisiaGovernorate, normalizeTunisiaPhone } from "@/lib/tunisia";

export type CheckoutLine = {
  productId: string;
  quantity: number;
  product: Product;
  unitMillimes: number;
  lineMillimes: number;
  promotionActive: boolean;
};

export type CheckoutTotals = {
  lines: CheckoutLine[];
  subtotalMillimes: number;
  shippingMillimes: number;
  totalMillimes: number;
  freeShipping: boolean;
  itemCount: number;
};

/**
 * Calcule les totaux côté client à titre indicatif uniquement.
 * La future API NestJS recalculera prix, promotions et livraison.
 */
export function computeCheckoutTotals(
  items: CartItem[],
  now: Date = new Date(),
  products: Product[] = PRODUCTS,
): CheckoutTotals {
  const lines: CheckoutLine[] = [];
  for (const it of items) {
    const product = products.find((p) => p.id === it.productId && p.availability === "available");
    if (!product) continue;
    const unit = getCurrentPriceMillimes(product, now);
    lines.push({
      productId: it.productId,
      quantity: it.quantity,
      product,
      unitMillimes: unit,
      lineMillimes: unit * it.quantity,
      promotionActive: isPromotionActive(product.promotion, now),
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineMillimes, 0);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD_MILLIMES;
  const shipping = subtotal > 0 && !freeShipping ? SHIPPING_FEE_MILLIMES : 0;
  return {
    lines,
    subtotalMillimes: subtotal,
    shippingMillimes: shipping,
    totalMillimes: subtotal + shipping,
    freeShipping,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  };
}

/* ---------------- Validation ---------------- */

export type ShippingInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  address: string;
  postalCode: string;
  note: string;
};

export type ShippingErrors = Partial<Record<keyof ShippingInput, string>>;

export function validateShipping(input: ShippingInput): ShippingErrors {
  const e: ShippingErrors = {};
  if (!input.firstName.trim()) e.firstName = "Veuillez indiquer votre prénom.";
  if (!input.lastName.trim()) e.lastName = "Veuillez indiquer votre nom.";
  if (!input.phone.trim()) {
    e.phone = "Veuillez indiquer votre numéro de téléphone.";
  } else if (!normalizeTunisiaPhone(input.phone)) {
    e.phone = "Numéro tunisien invalide (8 chiffres, commence par 2, 3, 4, 5, 7 ou 9).";
  }
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    e.email = "Adresse e-mail invalide.";
  }
  if (!input.governorate.trim()) {
    e.governorate = "Veuillez sélectionner un gouvernorat.";
  } else if (!isTunisiaGovernorate(input.governorate)) {
    e.governorate = "Gouvernorat invalide.";
  }
  if (!input.city.trim()) e.city = "Veuillez indiquer votre ville ou délégation.";
  if (!input.address.trim()) e.address = "Veuillez indiquer votre adresse.";
  if (input.postalCode.trim() && !/^\d{4}$/.test(input.postalCode.trim())) {
    e.postalCode = "Le code postal doit contenir 4 chiffres.";
  }
  if (input.note.length > 500) e.note = "La note ne doit pas dépasser 500 caractères.";
  return e;
}

/* ---------------- Mock service ---------------- */

export type OrderSubmission = {
  idempotencyKey: string;
  items: { productId: string; quantity: number }[];
  shipping: {
    firstName: string;
    lastName: string;
    phone: string; // normalisé
    email: string | null;
    governorate: string;
    city: string;
    address: string;
    postalCode: string | null;
    note: string | null;
  };
  paymentMethod: "cod";
};

export type OrderConfirmationItem = {
  productId: string;
  name: string;
  brand: string;
  reference: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string;
  quantity: number;
  unitMillimes: number;
  lineMillimes: number;
};

export type OrderConfirmationShipping = {
  firstName: string;
  lastName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  postalCode: string | null;
};

export type OrderConfirmation = {
  reference: string;
  createdAt: string;
  paymentMethod: "cod";
  shippingLabel: string; // "Gouvernorat — Ville" (sans PII sensible)
  shipping?: OrderConfirmationShipping;
  items?: OrderConfirmationItem[];
  totals: {
    subtotalMillimes: number;
    shippingMillimes: number;
    totalMillimes: number;
    itemCount: number;
  };
};

export type SubmitOrderDeps = {
  now?: () => number;
  random?: () => number;
  /** Force un échec simulé (utile pour les tests). */
  simulateFailure?: boolean;
};

function generateReference(now: number, random: number): string {
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const suffix = Math.floor(random * 1_000_000)
    .toString(36)
    .toUpperCase()
    .padStart(5, "0")
    .slice(0, 5);
  return `LMM-${y}${m}${day}-${suffix}`;
}

/**
 * Service mocké de soumission de commande.
 * Ne persiste aucune donnée personnelle et ne les journalise pas.
 * Le vrai backend recalculera les totaux à partir des identifiants produits.
 */
export async function submitOrderMock(
  submission: OrderSubmission,
  totals: CheckoutTotals,
  deps: SubmitOrderDeps = {},
): Promise<OrderConfirmation> {
  const now = deps.now ? deps.now() : Date.now();
  const random = deps.random ? deps.random() : Math.random();
  await new Promise((r) => setTimeout(r, 0));
  if (deps.simulateFailure) {
    throw new Error("Erreur temporaire — veuillez réessayer.");
  }
  if (submission.items.length === 0) {
    throw new Error("Le panier est vide.");
  }
  return {
    reference: generateReference(now, random),
    createdAt: new Date(now).toISOString(),
    paymentMethod: "cod",
    shippingLabel: `${submission.shipping.governorate} — ${submission.shipping.city}`,
    shipping: {
      firstName: submission.shipping.firstName,
      lastName: submission.shipping.lastName,
      phone: submission.shipping.phone,
      governorate: submission.shipping.governorate,
      city: submission.shipping.city,
      address: submission.shipping.address,
      postalCode: submission.shipping.postalCode,
    },
    items: totals.lines.map((l) => {
      const img = l.product.images[0] ?? null;
      return {
        productId: l.productId,
        name: l.product.name,
        brand: l.product.brand,
        reference: l.product.reference,
        slug: l.product.slug,
        imageUrl: img?.url ?? null,
        imageAlt: img?.alt ?? l.product.name,
        quantity: l.quantity,
        unitMillimes: l.unitMillimes,
        lineMillimes: l.lineMillimes,
      };
    }),
    totals: {
      subtotalMillimes: totals.subtotalMillimes,
      shippingMillimes: totals.shippingMillimes,
      totalMillimes: totals.totalMillimes,
      itemCount: totals.itemCount,
    },
  };
}

/**
 * Construit un OrderSubmission à partir d'un input validé.
 * ⚠️ N'envoie que les identifiants + coordonnées de livraison.
 */
export function buildOrderSubmission(
  items: CartItem[],
  input: ShippingInput,
  idempotencyKey = "local-idempotency-key",
): OrderSubmission | null {
  const phone = normalizeTunisiaPhone(input.phone);
  if (!phone) return null;
  return {
    idempotencyKey,
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    shipping: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone,
      email: input.email.trim() || null,
      governorate: input.governorate.trim(),
      city: input.city.trim(),
      address: input.address.trim(),
      postalCode: input.postalCode.trim() || null,
      note: input.note.trim() || null,
    },
    paymentMethod: "cod",
  };
}

/* ---------- Persistance éphémère de la confirmation ---------- */

const CONFIRMATION_KEY = "lmm:last-order:v1";

export function saveConfirmation(c: OrderConfirmation): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function readConfirmation(): OrderConfirmation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CONFIRMATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderConfirmation;
    if (!parsed || typeof parsed.reference !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearConfirmation(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(CONFIRMATION_KEY);
  } catch {
    /* ignore */
  }
}
