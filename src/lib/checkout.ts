import { sanitizeCartItems, type CartItem } from "./cart-store";
import type { CreateOrderRequest } from "../types/order";

export type CheckoutDraft = {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  addressLine: string;
  note: string;
  acceptedTerms: boolean;
  items: CartItem[];
};

export type CheckoutField =
  | "fullName"
  | "phone"
  | "email"
  | "governorate"
  | "city"
  | "addressLine"
  | "note"
  | "acceptedTerms"
  | "items";

export type CheckoutValidationResult =
  | { ok: true; request: CreateOrderRequest }
  | { ok: false; errors: Partial<Record<CheckoutField, string>> };

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeTunisianPhone(value: string): string | null {
  let compact = value.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("00216")) compact = compact.slice(5);
  else if (compact.startsWith("+216")) compact = compact.slice(4);

  if (!/^\d{8}$/.test(compact)) return null;
  return `+216${compact}`;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateCheckoutDraft(draft: CheckoutDraft): CheckoutValidationResult {
  const errors: Partial<Record<CheckoutField, string>> = {};
  const fullName = clean(draft.fullName);
  const phone = normalizeTunisianPhone(draft.phone);
  const email = draft.email.trim().toLowerCase();
  const governorate = clean(draft.governorate);
  const city = clean(draft.city);
  const addressLine = clean(draft.addressLine);
  const note = clean(draft.note);
  const items = sanitizeCartItems(draft.items);

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Renseignez un nom complet valide.";
  }
  if (!phone) errors.phone = "Renseignez un numéro tunisien à 8 chiffres.";
  if (email && (email.length > 254 || !isEmail(email))) {
    errors.email = "Renseignez une adresse e-mail valide ou laissez ce champ vide.";
  }
  if (!governorate || governorate.length > 80) {
    errors.governorate = "Renseignez le gouvernorat.";
  }
  if (!city || city.length > 120) errors.city = "Renseignez la ville ou délégation.";
  if (addressLine.length < 5 || addressLine.length > 300) {
    errors.addressLine = "Renseignez une adresse complète.";
  }
  if (note.length > 500) errors.note = "La note ne doit pas dépasser 500 caractères.";
  if (!draft.acceptedTerms) errors.acceptedTerms = "L’acceptation des CGV est obligatoire.";
  if (items.length === 0) errors.items = "Le panier ne contient aucun article valide.";

  if (Object.keys(errors).length > 0 || !phone) return { ok: false, errors };

  return {
    ok: true,
    request: {
      customer: {
        fullName,
        phone,
        ...(email ? { email } : {}),
      },
      deliveryAddress: { governorate, city, addressLine },
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      ...(note ? { note } : {}),
      acceptedTerms: true,
    },
  };
}
