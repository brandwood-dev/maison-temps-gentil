/**
 * 24 gouvernorats de Tunisie.
 * Ordre alphabétique en français.
 */
export const TUNISIA_GOVERNORATES = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
] as const;

export type TunisiaGovernorate = (typeof TUNISIA_GOVERNORATES)[number];

export function isTunisiaGovernorate(v: unknown): v is TunisiaGovernorate {
  return typeof v === "string" && (TUNISIA_GOVERNORATES as readonly string[]).includes(v);
}

/**
 * Numéro de téléphone tunisien : 8 chiffres commençant par 2, 3, 4, 5, 7 ou 9.
 * Accepte préfixe +216 / 00216 et séparateurs (espaces, tirets, points).
 */
export function normalizeTunisiaPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-.()]/g, "");
  const m = cleaned.match(/^(?:\+216|00216)?(\d{8})$/);
  if (!m) return null;
  const local = m[1];
  if (!/^[234579]/.test(local)) return null;
  return `+216${local}`;
}

export function isTunisiaPhone(raw: string): boolean {
  return normalizeTunisiaPhone(raw) !== null;
}
