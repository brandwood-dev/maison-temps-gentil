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
  const r = getCatalogResult(
    TEST_FIXTURES,
    { ...DEFAULT_CATALOG_QUERY, promotionOnly: true },
    { now },
  );
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
  const lastIds = r.items
    .slice(2)
    .map((p) => p.id)
    .sort();
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

console.log("\n== URL raw params normalize into typed CatalogQuery ==");
{
  const q1 = parseCatalogSearch({ promo: "true" });
  assert(q1.promotionOnly === true, "?promo=true → promotionOnly === true");
  const q2 = parseCatalogSearch({ minPrice: "500000" });
  assert(q2.minPriceMillimes === 500_000, "?minPrice=500000 → minPriceMillimes === 500000");
  const q3 = parseCatalogSearch({ maxPrice: "500000" });
  assert(q3.maxPriceMillimes === 500_000, "?maxPrice=500000 → maxPriceMillimes === 500000");
}

console.log("\n== idempotence: parse(serialize(parse(raw))) === parse(raw) ==");
{
  const raw = {
    brands: "BrandA,BrandB",
    minPrice: "300000",
    maxPrice: "1500000",
    promo: "true",
    sort: "price-asc",
    page: "2",
  };
  const once = parseCatalogSearch(raw);
  const twice = parseCatalogSearch(catalogQueryToSearch(once) as Record<string, unknown>);
  assert(JSON.stringify(once) === JSON.stringify(twice), "no info loss on round-trip");
  assert(twice.promotionOnly === true, "promotionOnly preserved");
  assert(twice.minPriceMillimes === 300_000, "minPriceMillimes preserved");
  assert(twice.maxPriceMillimes === 1_500_000, "maxPriceMillimes preserved");
  assert(twice.sort === "price-asc", "sort preserved");
  assert(JSON.stringify(twice.brands) === JSON.stringify(["BrandA", "BrandB"]), "brands preserved");
}

console.log("\n== combined URL: brand + minPrice + maxPrice + promo + sort ==");
{
  const raw = {
    brands: "BrandA",
    minPrice: "100000",
    maxPrice: "1000000",
    promo: "true",
    sort: "price-desc",
  };
  const q = parseCatalogSearch(raw);
  assert(q.brands.length === 1 && q.brands[0] === "BrandA", "brand filter kept");
  assert(q.minPriceMillimes === 100_000 && q.maxPriceMillimes === 1_000_000, "price range kept");
  assert(q.promotionOnly === true, "promo kept");
  assert(q.sort === "price-desc", "sort kept");
  const r = getCatalogResult(TEST_FIXTURES, q, { now });
  // only BrandA with active promo in [100000, 1000000]: b (600000, promo actif)
  assert(
    r.totalItems === 1 && r.items[0].id === "b",
    "combined filters return only matching product",
  );
}

console.log("\n== static guard on CatalogPage.tsx ==");
{
  const fs = await import("node:fs");
  const path = await import("node:path");
  const url = await import("node:url");
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const src = fs.readFileSync(
    path.join(here, "..", "src", "components", "catalog", "CatalogPage.tsx"),
    "utf8",
  );
  assert(
    !/\bparseCatalogSearch\b/.test(src),
    "CatalogPage.tsx must not reference parseCatalogSearch",
  );
  assert(!/\buseSearch\b/.test(src), "CatalogPage.tsx must not use useSearch from TanStack");
  assert(
    !/as\s+Record<string,\s*unknown>/.test(src),
    "CatalogPage.tsx must not cast as Record<string, unknown>",
  );
  assert(!/as\s+CatalogQuery\b/.test(src), "CatalogPage.tsx must not cast as CatalogQuery");
  assert(
    /\bquery\s*:\s*CatalogQuery\b/.test(src),
    "CatalogPage.tsx must declare prop `query: CatalogQuery`",
  );
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
