import { normalizeTunisianPhone, validateCheckoutDraft } from "../src/lib/checkout";

let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string) {
  if (condition) {
    passed++;
    console.log(`  PASS ${message}`);
  } else {
    failed++;
    console.error(`  FAIL ${message}`);
  }
}

const validDraft = {
  fullName: "  Amira   Ben Salah ",
  phone: "22 123 456",
  email: " AMIRA@EXAMPLE.COM ",
  governorate: " Tunis ",
  city: " La Marsa ",
  addressLine: " 12 rue des Jasmins ",
  note: " Appeler avant la livraison ",
  acceptedTerms: true,
  items: [{ productId: " product-1 ", quantity: 2 }],
};

console.log("\n== Tunisian phone normalization ==");
assert(normalizeTunisianPhone("22 123 456") === "+21622123456", "local number");
assert(normalizeTunisianPhone("+216 22 123 456") === "+21622123456", "+216 number");
assert(normalizeTunisianPhone("00216-22-123-456") === "+21622123456", "00216 number");
assert(normalizeTunisianPhone("123") === null, "invalid length rejected");
assert(normalizeTunisianPhone("22ABC456") === null, "letters rejected");

console.log("\n== valid checkout request ==");
{
  const result = validateCheckoutDraft(validDraft);
  assert(result.ok, "valid draft accepted");
  if (result.ok) {
    assert(result.request.customer.fullName === "Amira Ben Salah", "name normalized");
    assert(result.request.customer.phone === "+21622123456", "phone canonicalized");
    assert(result.request.customer.email === "amira@example.com", "email normalized");
    assert(result.request.deliveryAddress.governorate === "Tunis", "governorate normalized");
    assert(result.request.deliveryAddress.city === "La Marsa", "city normalized");
    assert(result.request.items[0]?.productId === "product-1", "product id normalized");
    assert(result.request.items[0]?.quantity === 2, "quantity retained");
    assert(result.request.acceptedTerms === true, "terms recorded");
    assert(!("price" in result.request.items[0]!), "client line contains no price");
    assert(!("subtotalMillimes" in result.request), "client request contains no subtotal");
  }
}

console.log("\n== optional fields ==");
{
  const result = validateCheckoutDraft({ ...validDraft, email: "", note: "" });
  assert(result.ok, "empty optional fields accepted");
  if (result.ok) {
    assert(!("email" in result.request.customer), "empty email omitted");
    assert(!("note" in result.request), "empty note omitted");
  }
}

console.log("\n== required fields and cart integrity ==");
{
  const result = validateCheckoutDraft({
    ...validDraft,
    fullName: "",
    phone: "123",
    governorate: "",
    city: "",
    addressLine: "x",
    acceptedTerms: false,
    items: [
      { productId: "", quantity: 1 },
      { productId: "product-1", quantity: 0 },
    ],
  });
  assert(!result.ok, "invalid draft rejected");
  if (!result.ok) {
    assert(Boolean(result.errors.fullName), "name error returned");
    assert(Boolean(result.errors.phone), "phone error returned");
    assert(Boolean(result.errors.governorate), "governorate error returned");
    assert(Boolean(result.errors.city), "city error returned");
    assert(Boolean(result.errors.addressLine), "address error returned");
    assert(Boolean(result.errors.acceptedTerms), "terms error returned");
    assert(Boolean(result.errors.items), "empty sanitized cart rejected");
  }
}

console.log("\n== limits and malformed values ==");
{
  const badEmail = validateCheckoutDraft({ ...validDraft, email: "not-an-email" });
  assert(!badEmail.ok && Boolean(badEmail.errors.email), "invalid optional email rejected");

  const badNote = validateCheckoutDraft({ ...validDraft, note: "x".repeat(501) });
  assert(!badNote.ok && Boolean(badNote.errors.note), "oversized note rejected");

  const unsafeQuantity = validateCheckoutDraft({
    ...validDraft,
    items: [{ productId: "product-1", quantity: Number.MAX_SAFE_INTEGER + 1 }],
  });
  assert(!unsafeQuantity.ok && Boolean(unsafeQuantity.errors.items), "unsafe quantity rejected");
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
