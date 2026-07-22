import {
  buildOrderSubmission,
  computeCheckoutTotals,
  submitOrderMock,
  validateShipping,
  type ShippingInput,
} from "../src/lib/checkout";
import { PRODUCTS } from "../src/fixtures/products";
import {
  FREE_SHIPPING_THRESHOLD_MILLIMES,
  SHIPPING_FEE_MILLIMES,
} from "../src/lib/checkout-config";
import { isTunisiaPhone, normalizeTunisiaPhone } from "../src/lib/tunisia";

let passed = 0;
let failed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) {
    passed++;
    console.log(`  PASS ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL ${msg}`);
  }
}

const validInput: ShippingInput = {
  firstName: "Ali",
  lastName: "Ben Salah",
  phone: "20 123 456",
  email: "",
  governorate: "Tunis",
  city: "Tunis",
  address: "12 rue de la République",
  postalCode: "",
  note: "",
};

/* ---------------- Tunisian phone ---------------- */
console.log("→ Téléphone tunisien");
assert(isTunisiaPhone("20123456"), "8 chiffres commençant par 2");
assert(isTunisiaPhone("+216 22 123 456"), "avec préfixe +216 et espaces");
assert(isTunisiaPhone("00216-95-123-456"), "avec préfixe 00216 et tirets");
assert(!isTunisiaPhone("10123456"), "refuse préfixe 1");
assert(!isTunisiaPhone("2012345"), "refuse 7 chiffres");
assert(!isTunisiaPhone("201234567"), "refuse 9 chiffres");
assert(!isTunisiaPhone("abcdefgh"), "refuse lettres");
assert(normalizeTunisiaPhone("20 123 456") === "+21620123456", "normalise au format +216");

/* ---------------- Validation ---------------- */
console.log("→ Validation");
{
  const errs = validateShipping({ ...validInput });
  assert(Object.keys(errs).length === 0, "input valide n'a aucune erreur");
}
{
  const errs = validateShipping({
    ...validInput,
    firstName: "",
    lastName: "",
    phone: "",
    governorate: "",
    city: "",
    address: "",
  });
  assert(
    errs.firstName && errs.lastName && errs.phone && errs.governorate && errs.city && errs.address
      ? true
      : false,
    "champs obligatoires détectés",
  );
}
{
  const errs = validateShipping({ ...validInput, phone: "12345" });
  assert(errs.phone !== undefined, "téléphone invalide détecté");
}
{
  const errs = validateShipping({ ...validInput, email: "not-an-email" });
  assert(errs.email !== undefined, "e-mail invalide détecté");
}
{
  const errs = validateShipping({ ...validInput, email: "user@example.com" });
  assert(errs.email === undefined, "e-mail valide accepté");
}
{
  const errs = validateShipping({ ...validInput, governorate: "Paris" });
  assert(errs.governorate !== undefined, "gouvernorat hors liste refusé");
}
{
  const errs = validateShipping({ ...validInput, postalCode: "12" });
  assert(errs.postalCode !== undefined, "code postal invalide détecté");
}
{
  const errs = validateShipping({ ...validInput, postalCode: "1000" });
  assert(errs.postalCode === undefined, "code postal 4 chiffres accepté");
}
{
  const errs = validateShipping({ ...validInput, note: "a".repeat(600) });
  assert(errs.note !== undefined, "note trop longue refusée");
}

/* ---------------- Totaux ---------------- */
console.log("→ Calculs");
const productA = PRODUCTS[0]!;
const productB = PRODUCTS[1]!;

{
  const empty = computeCheckoutTotals([]);
  assert(empty.subtotalMillimes === 0, "panier vide → sous-total 0");
  assert(empty.shippingMillimes === 0, "panier vide → pas de livraison");
  assert(empty.totalMillimes === 0, "panier vide → total 0");
  assert(empty.itemCount === 0, "panier vide → itemCount 0");
}

// Promotion expirée
{
  const future = new Date("2100-01-01T00:00:00Z");
  const totals = computeCheckoutTotals([{ productId: productA.id, quantity: 1 }], future);
  assert(
    totals.lines[0]?.unitMillimes === productA.regularPriceMillimes,
    "promotion expirée → prix régulier utilisé",
  );
  assert(totals.lines[0]?.promotionActive === false, "promotion expirée → promotionActive false");
}

// Promotion active
{
  const promoDate = new Date("2026-07-01T00:00:00Z");
  const totals = computeCheckoutTotals([{ productId: productA.id, quantity: 2 }], promoDate);
  const expectedUnit = productA.promotion!.salePriceMillimes;
  assert(totals.lines[0]?.unitMillimes === expectedUnit, "promotion active → prix promo appliqué");
  assert(totals.subtotalMillimes === expectedUnit * 2, "sous-total = prix promo × 2");
}

// Livraison offerte au-delà du seuil
{
  const promoDate = new Date("2026-07-01T00:00:00Z");
  const totals = computeCheckoutTotals([{ productId: productB.id, quantity: 1 }], promoDate);
  assert(totals.subtotalMillimes >= FREE_SHIPPING_THRESHOLD_MILLIMES, "sous-total ≥ seuil");
  assert(totals.freeShipping === true, "livraison offerte au-delà du seuil");
  assert(totals.shippingMillimes === 0, "shipping = 0 quand offerte");
}

// Livraison payante en-deça du seuil
{
  const cheap = PRODUCTS.find((p) => p.regularPriceMillimes < FREE_SHIPPING_THRESHOLD_MILLIMES);
  if (cheap) {
    const future = new Date("2100-01-01T00:00:00Z");
    const totals = computeCheckoutTotals([{ productId: cheap.id, quantity: 1 }], future);
    assert(totals.shippingMillimes === SHIPPING_FEE_MILLIMES, "shipping appliqué sous seuil");
    assert(
      totals.totalMillimes === totals.subtotalMillimes + SHIPPING_FEE_MILLIMES,
      "total = sous-total + livraison",
    );
  }
}

/* ---------------- Soumission ---------------- */
console.log("→ Soumission mock");
async function run() {
  {
    const items = [{ productId: productA.id, quantity: 1 }];
    const totals = computeCheckoutTotals(items);
    const submission = buildOrderSubmission(items, validInput);
    assert(submission !== null, "soumission construite pour input valide");
    assert(submission!.shipping.phone === "+21620123456", "téléphone normalisé dans soumission");
    assert(submission!.shipping.email === null, "e-mail vide → null");
    const confirm = await submitOrderMock(submission!, totals, {
      now: () => Date.parse("2026-07-15T10:00:00Z"),
      random: () => 0.5,
    });
    assert(/^LMM-20260715-[A-Z0-9]{5}$/.test(confirm.reference), "référence LMM- attendue");
    assert(confirm.paymentMethod === "cod", "paiement cod");
    assert(confirm.totals.totalMillimes === totals.totalMillimes, "totaux reportés");
    assert(
      confirm.shippingLabel === "Tunis — Tunis",
      "shippingLabel = Gouvernorat — Ville (pas de PII)",
    );
  }
  {
    const items = [{ productId: productA.id, quantity: 1 }];
    const totals = computeCheckoutTotals(items);
    const submission = buildOrderSubmission(items, validInput)!;
    let threw = false;
    try {
      await submitOrderMock(submission, totals, { simulateFailure: true });
    } catch {
      threw = true;
    }
    assert(threw, "erreur simulée levée");
  }
  {
    const submission = buildOrderSubmission([], validInput);
    assert(submission !== null, "soumission construite même avec panier vide");
    let threw = false;
    try {
      await submitOrderMock(submission!, computeCheckoutTotals([]));
    } catch {
      threw = true;
    }
    assert(threw, "panier vide → erreur");
  }
  {
    const s = buildOrderSubmission([{ productId: productA.id, quantity: 1 }], {
      ...validInput,
      phone: "12345",
    });
    assert(s === null, "buildOrderSubmission refuse téléphone invalide");
  }

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
