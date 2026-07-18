/**
 * Standalone test for the pure catalog functions.
 * Run with: `bunx tsx tests/catalog.test.ts` (or `node --loader tsx tests/catalog.test.ts`).
 * Uses local, test-only fixtures — production fixtures are never mutated.
 */
import {
  DEFAULT_CATALOG_QUERY,
  catalogQueryToSearch,
  getCatalogResult,
  parseCatalogSearch,
} from "../src/lib/catalog";
import type { Product } from "../src/types/product";
import type { CatalogQuery } from "../src/types/catalog";

const now = new Date("2026-07-18T12:00:00Z");
const past = "2020-01-01T00:00:00Z";
const future = "2030-01-01T00:00:00Z";

function make(overrides: Partial<Product>): Product {
  return {
    id: "x",
    slug: "x",
    name: "X",
    brand: "BrandA",
    reference: "R",
    category: "men",
    currency: "TND",
    regularPriceMillimes: 500_000,
    promotion: null,
    availability: "available",
    images: [],
    shortDescription: "",
    dialColor: null,
    braceletMaterial: null,
    braceletColor: null,
    movementType: null,
    displayType: null,
    diameterMm: null,
    glassType: null,
    waterResistance: null,
    warrantyMonths: null,
    giftBoxIncluded: false,
    isNew: false,
    isBestSeller: false,
    ...overrides,
  };
}

const TEST_FIXTURES: Product[] = [
  make({
    id: "a",
    brand: "BrandA",
    category: "men",
    regularPriceMillimes: 300_000,
    dialColor: { label: "Noir", hex: "#000" },
  }),
  make({
    id: "b",
    brand: "BrandA",
    category: "women",
    regularPriceMillimes: 800_000,
    dialColor: { label: "Blanc", hex: "#fff" },
    promotion: {
      regularPriceMillimes: 800_000,
      salePriceMillimes: 600_000,
      startsAt: null,
      endsAt: future,
    },
  }),
  make({
    id: "c",
    brand: "BrandB",
    category: "men",
    regularPriceMillimes: 1_500_000,
    dialColor: { label: "Noir", hex: "#000" },
    promotion: {
      regularPriceMillimes: 1_500_000,
      salePriceMillimes: 1_000_000,
      startsAt: null,
      endsAt: past,
    },
  }),
  make({
    id: "d",
    brand: "BrandC",
    category: "men",
    regularPriceMillimes: 2_000_000,
    dialColor: { label: "Or", hex: "#c89d54" },
    promotion: {
      regularPriceMillimes: 2_000_000,
      salePriceMillimes: 1_200_000,
      startsAt: null,
      endsAt: future,
    },
  }),
];

// Extend to enable pagination tests
const PAGED: Product[] = Array.from({ length: 25 }, (_, i) =>
  make({ id: `p${i}`, regularPriceMillimes: 100_000 + i * 10_000 }),
);

let passed = 0;
let failed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log("\n== filtering / scope ==");
{
  const r = getCatalogResult(TEST_FIXTURES, DEFAULT_CATALOG_QUERY, {
    fixedCategory: "men",
    now,
  });
  assert(r.totalItems === 3, "fixedCategory=men restricts to 3 items");
  assert(
    r.items.every((p) => p.category === "men"),
    "all returned items match category",
  );
}

console.log("\n== multi-brand filter ==");
{
  const r = getCatalogResult(
    TEST_FIXTURES,
    { ...DEFAULT_CATALOG_QUERY, brands: ["BrandA", "BrandB"] },
    { now },
  );
  assert(r.totalItems === 3, "brands=[A,B] yields 3 items");
}

console.log("\n== active vs expired promotion ==");
{
  const r = getCatalogResult(TEST_FIXTURES, { ...DEFAULT_CATALOG_QUERY, promotionOnly: true }, { now });
  const ids = r.items.map((p) => p.id).sort();
  assert(
    JSON.stringify(ids) === JSON.stringify(["b", "d"]),
    "promotionOnly keeps only b and d (c expired)",
  );
}

console.log("\n== price sort ==");
{
  const asc = getCatalogResult(
    TEST_FIXTURES,
    { ...DEFAULT_CATALOG_QUERY, sort: "price-asc" },
    { now },
  );
  const desc = getCatalogResult(
    TEST_FIXTURES,
    { ...DEFAULT_CATALOG_QUERY, sort: "price-desc" },
    { now },
  );
  // effective prices: a=300, b=600(promo), c=1500(no promo), d=1200(promo)
  assert(
    JSON.stringify(asc.items.map((p) => p.id)) === JSON.stringify(["a", "b", "d", "c"]),
    "price-asc uses effective prices",
  );
  assert(
    JSON.stringify(desc.items.map((p) => p.id)) === JSON.stringify(["c", "d", "b", "a"]),
    "price-desc uses effective prices",
  );
}

console.log("\n== discount sort places non-promo last ==");
{
  const r = getCatalogResult(
    TEST_FIXTURES,
    { ...DEFAULT_CATALOG_QUERY, sort: "discount-desc" },
    { now },
  );
  // active discounts: d=40%, b=25%; a and c have no active promo
  const first = r.items.slice(0, 2).map((p) => p.id);
  assert(
    JSON.stringify(first) === JSON.stringify(["d", "b"]),
    "discount-desc puts active promos first, in order",
  );
  const lastIds = r.items.slice(2).map((p) => p.id).sort();
  assert(
    JSON.stringify(lastIds) === JSON.stringify(["a", "c"]),
    "non-promo items are placed after active promos",
  );
}

console.log("\n== pagination ==");
{
  const p1 = getCatalogResult(PAGED, { ...DEFAULT_CATALOG_QUERY, page: 1 }, { now });
  const p2 = getCatalogResult(PAGED, { ...DEFAULT_CATALOG_QUERY, page: 2 }, { now });
  const p3 = getCatalogResult(PAGED, { ...DEFAULT_CATALOG_QUERY, page: 3 }, { now });
  assert(p1.totalPages === 3, "25 items / 12 = 3 pages");
  assert(p1.items.length === 12, "page 1 has 12 items");
  assert(p2.items.length === 12, "page 2 has 12 items");
  assert(p3.items.length === 1, "page 3 has 1 item");
  const overflow = getCatalogResult(PAGED, { ...DEFAULT_CATALOG_QUERY, page: 999 }, { now });
  assert(overflow.page === 3, "overflow page clamps to last page");
}

console.log("\n== invalid URL never crashes ==");
{
  const q = parseCatalogSearch({
    page: "not-a-number",
    sort: "bogus",
    brands: "",
    minPrice: "-99",
    maxPrice: "abc",
    promo: "maybe",
  });
  assert(q.page === 1, "invalid page → 1");
  assert(q.sort === "featured", "invalid sort → featured");
  assert(q.brands.length === 0, "empty brands → []");
  assert(q.minPriceMillimes === undefined, "negative minPrice → undefined");
  assert(q.promotionOnly === false, "non-'true' promo → false");
}

console.log("\n== min>max swap ==");
{
  const q = parseCatalogSearch({ minPrice: "1000000", maxPrice: "100000" });
  assert(q.minPriceMillimes === 100_000, "swapped min");
  assert(q.maxPriceMillimes === 1_000_000, "swapped max");
}

console.log("\n== serialize drops defaults ==");
{
  const q: CatalogQuery = { ...DEFAULT_CATALOG_QUERY };
  const s = catalogQueryToSearch(q);
  assert(Object.keys(s).length === 0, "default query serializes to empty object");
  const s2 = catalogQueryToSearch({ ...q, page: 2, sort: "price-asc", promotionOnly: true });
  assert(s2.page === "2" && s2.sort === "price-asc" && s2.promo === "true", "non-defaults kept");
}

console.log("\n== no mutation ==");
{
  const snapshot = JSON.stringify(TEST_FIXTURES);
  getCatalogResult(
    TEST_FIXTURES,
    { ...DEFAULT_CATALOG_QUERY, sort: "price-desc", brands: ["BrandA"] },
    { fixedCategory: "men", now },
  );
  assert(JSON.stringify(TEST_FIXTURES) === snapshot, "input array + products untouched");
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
