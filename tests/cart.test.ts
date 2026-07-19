import {
  addCartItem,
  decodeCartStorage,
  readCartStorage,
  removeCartItem,
  sanitizeCartItems,
  serializeCartItems,
  setCartItemQuantity,
  writeCartStorage,
  type CartStorage,
} from "../src/lib/cart-store";

const STORAGE_KEY = "lmm:cart:v1";

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

function json(value: unknown) {
  return JSON.stringify(value);
}

function createMemoryStorage(initial: string | null = null) {
  let value = initial;
  const writes: string[] = [];
  const storage: CartStorage = {
    getItem(key) {
      return key === STORAGE_KEY ? value : null;
    },
    setItem(key, next) {
      if (key !== STORAGE_KEY) return;
      value = next;
      writes.push(next);
    },
  };
  return {
    storage,
    writes,
    get value() {
      return value;
    },
  };
}

console.log("\n== canonical payload ==");
{
  const raw = '{"version":1,"items":[{"productId":"watch-1","quantity":2}]}';
  const decoded = decodeCartStorage(raw);
  assert(
    json(decoded.items) === json([{ productId: "watch-1", quantity: 2 }]),
    "v1 payload is read",
  );
  assert(decoded.shouldRewrite === false, "canonical v1 payload needs no rewrite");
}

console.log("\n== legacy migration ==");
{
  const memory = createMemoryStorage(
    json({
      items: [
        { productId: " watch-1 ", quantity: 2 },
        { productId: "watch-1", quantity: 3 },
        { productId: "", quantity: 4 },
      ],
    }),
  );
  const items = readCartStorage(memory.storage);
  assert(
    json(items) === json([{ productId: "watch-1", quantity: 5 }]),
    "legacy items are sanitized and merged",
  );
  assert(memory.writes.length === 1, "legacy payload is rewritten once");
  assert(
    memory.value === '{"version":1,"items":[{"productId":"watch-1","quantity":5}]}',
    "legacy payload is rewritten in canonical v1 form",
  );

  const blockedStorage: CartStorage = {
    getItem: () => '{"items":[{"productId":"watch-2","quantity":2}]}',
    setItem: () => {
      throw new Error("storage blocked");
    },
  };
  assert(
    readCartStorage(blockedStorage)[0]?.productId === "watch-2",
    "failed migration write does not discard the valid in-memory cart",
  );
}

console.log("\n== corrupt and unknown payloads ==");
{
  const corrupt = decodeCartStorage("{not-json");
  assert(corrupt.items.length === 0, "invalid JSON returns an empty cart");
  assert(corrupt.shouldRewrite === false, "invalid JSON is not rewritten during decoding");

  const unknown = decodeCartStorage('{"version":2,"items":[{"productId":"watch-1","quantity":1}]}');
  assert(unknown.items.length === 0, "unknown storage version is rejected");
  assert(
    unknown.shouldRewrite === false,
    "unknown storage version is preserved for forward compatibility",
  );
}

console.log("\n== product id validation ==");
{
  const items = sanitizeCartItems([
    { productId: "  watch-1  ", quantity: 1 },
    { productId: "   ", quantity: 1 },
    { productId: 123, quantity: 1 },
  ]);
  assert(items.length === 1, "empty and non-string product ids are rejected");
  assert(items[0]?.productId === "watch-1", "valid product id is trimmed");
}

console.log("\n== quantity validation ==");
{
  const invalidQuantities: unknown[] = [NaN, Infinity, -Infinity, 0, -1, 1.5, "2", {}];
  for (const quantity of invalidQuantities) {
    const items = sanitizeCartItems([{ productId: "watch-1", quantity }]);
    assert(items.length === 0, `invalid quantity ${String(quantity)} is rejected`);
  }
  const unbounded = sanitizeCartItems([
    { productId: "watch-1", quantity: Number.MAX_SAFE_INTEGER },
  ]);
  assert(
    unbounded[0]?.quantity === Number.MAX_SAFE_INTEGER,
    "large finite integer has no arbitrary frontend cap",
  );
  assert(
    sanitizeCartItems([{ productId: "watch-1", quantity: Number.MAX_SAFE_INTEGER + 1 }]).length ===
      0,
    "integer above Number.MAX_SAFE_INTEGER is rejected",
  );
}

console.log("\n== deduplication and safe merge ==");
{
  const merged = sanitizeCartItems([
    { productId: "watch-1", quantity: 2 },
    { productId: "watch-2", quantity: 1 },
    { productId: "watch-1", quantity: 3 },
  ]);
  assert(merged.length === 2, "duplicate product lines are deduplicated");
  assert(merged[0]?.quantity === 5, "duplicate quantities are merged");

  const overflow = sanitizeCartItems([
    { productId: "watch-1", quantity: Number.MAX_SAFE_INTEGER },
    { productId: "watch-1", quantity: 1 },
  ]);
  assert(overflow.length === 1, "overflowing duplicate remains a single line");
  assert(
    overflow[0]?.quantity === Number.MAX_SAFE_INTEGER &&
      Number.isSafeInteger(overflow[0]?.quantity),
    "overflowing merge never creates an imprecise quantity",
  );
}

console.log("\n== immutable cart operations ==");
{
  const empty: { productId: string; quantity: number }[] = [];
  const added = addCartItem(empty, " watch-1 ", 2);
  assert(json(added) === json([{ productId: "watch-1", quantity: 2 }]), "valid product is added");
  assert(empty.length === 0, "add does not mutate its input");

  const incremented = addCartItem(added, "watch-1", 3);
  assert(incremented[0]?.quantity === 5, "existing product quantity is incremented");
  assert(added[0]?.quantity === 2, "increment does not mutate previous items");

  const updated = setCartItemQuantity(incremented, "watch-1", 7);
  assert(updated[0]?.quantity === 7, "quantity is updated");
  assert(incremented[0]?.quantity === 5, "quantity update does not mutate previous items");
  assert(
    setCartItemQuantity(updated, "watch-1", 1.5) === updated,
    "invalid quantity update is a no-op",
  );

  const invalidSnapshot = json(updated);
  const invalidAdd = addCartItem(updated, "watch-1", Number.MAX_SAFE_INTEGER + 1);
  assert(invalidAdd === updated, "invalid add preserves the same array reference");
  assert(json(updated) === invalidSnapshot, "invalid add does not mutate the cart");

  const removed = removeCartItem(updated, " watch-1 ");
  assert(removed.length === 0, "product is removed using its normalized id");
  assert(updated.length === 1, "remove does not mutate previous items");
}

console.log("\n== canonical serialization ==");
{
  const input = [
    { productId: "watch-1", quantity: 2 },
    { productId: "watch-2", quantity: NaN },
    { productId: "watch-3", quantity: Infinity },
  ];
  const snapshot = input.map((item) => ({ ...item }));
  const serialized = serializeCartItems(input);
  const parsed = JSON.parse(serialized) as { version: unknown; items: unknown[] };
  assert(parsed.version === 1, "serialized payload carries version 1");
  assert(parsed.items.length === 1, "serialization keeps only valid lines");
  assert(
    !serialized.includes("null"),
    "serialization never substitutes null for a non-finite quantity",
  );
  assert(
    Object.is(input[1]?.quantity, snapshot[1]?.quantity),
    "serialization does not mutate supplied entries",
  );

  const frozenEntry = Object.freeze({ productId: " frozen-watch ", quantity: 2 });
  const frozenInput = Object.freeze([frozenEntry]);
  assert(
    serializeCartItems(frozenInput) ===
      '{"version":1,"items":[{"productId":"frozen-watch","quantity":2}]}',
    "serialization accepts and normalizes a frozen input",
  );
  assert(
    frozenEntry.productId === " frozen-watch ",
    "normalization does not mutate a frozen entry",
  );
}

console.log("\n== storage write and SSR safety ==");
{
  const memory = createMemoryStorage();
  writeCartStorage(memory.storage, [{ productId: "watch-1", quantity: 4 }]);
  assert(memory.writes.length === 1, "valid cart is written once");
  assert(
    memory.value === '{"version":1,"items":[{"productId":"watch-1","quantity":4}]}',
    "storage write uses canonical v1 payload",
  );
  assert(
    readCartStorage(null).length === 0,
    "SSR read without window/localStorage returns an empty cart",
  );
  writeCartStorage(null, [{ productId: "watch-1", quantity: 1 }]);
  assert(true, "SSR write without window/localStorage is a safe no-op");
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
