/**
 * Standalone tests for the pure product helpers.
 * Run with: `npm run test:product` (tsx tests/product.test.ts).
 */
import {
  formatSchemaPriceTND,
  formatSpecifications,
  getProductBySlug,
  getPublicProductBySlug,
  getRelatedProducts,
} from "../src/lib/products";
import { getProductBadges } from "../src/lib/product-badges";
import type { Product } from "../src/types/product";

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

const FIXTURES: Product[] = [
  make({ id: "a", slug: "alpha", category: "men" }),
  make({ id: "b", slug: "bravo", category: "men" }),
  make({ id: "c", slug: "charlie", category: "women" }),
  make({ id: "d", slug: "delta", category: "children", availability: "hidden" }),
  make({ id: "e", slug: "echo", category: "connected" }),
];

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

console.log("\n== getProductBySlug ==");
{
  assert(getProductBySlug(FIXTURES, "alpha")?.id === "a", "found");
  assert(getProductBySlug(FIXTURES, "nope") === null, "unknown → null");
  assert(getProductBySlug(FIXTURES, "delta")?.id === "d", "hidden returned as-is (raw helper)");
}

console.log("\n== getPublicProductBySlug ==");
{
  const snapshot = JSON.stringify(FIXTURES);
  assert(getPublicProductBySlug(FIXTURES, "alpha")?.id === "a", "visible → returned");
  assert(getPublicProductBySlug(FIXTURES, "nope") === null, "unknown → null");
  assert(getPublicProductBySlug(FIXTURES, "delta") === null, "hidden → null");
  assert(JSON.stringify(FIXTURES) === snapshot, "no mutation of the input array");
}

console.log("\n== getRelatedProducts ==");
{
  const snapshot = JSON.stringify(FIXTURES);
  const current = FIXTURES[0]; // a, men
  const related = getRelatedProducts(FIXTURES, current, 4);
  const ids = related.map((p) => p.id);
  assert(!ids.includes("a"), "excludes current");
  assert(!ids.includes("d"), "excludes hidden");
  assert(ids[0] === "b", "same-category first (b before women/connected)");
  assert(new Set(ids).size === ids.length, "no duplicates");
  const limited = getRelatedProducts(FIXTURES, current, 2);
  assert(limited.length === 2, "respects limit");
  assert(JSON.stringify(FIXTURES) === snapshot, "no mutation");
}

console.log("\n== formatSpecifications ==");
{
  const p = make({
    id: "spec",
    brand: "BrandZ",
    reference: "R-1",
    category: "men",
    movementType: "Quartz",
    displayType: null,
    diameterMm: 40,
    dialColor: { label: "Noir", hex: "#000" },
    braceletMaterial: null,
    braceletColor: "",
    glassType: "Saphir",
    waterResistance: null,
    warrantyMonths: 24,
    giftBoxIncluded: true,
  });
  const rows = formatSpecifications(p);
  const keys = rows.map((r) => r.key);
  assert(!keys.includes("displayType"), "null field omitted");
  assert(!keys.includes("braceletMaterial"), "null field omitted");
  assert(!keys.includes("braceletColor"), "empty string omitted");
  assert(!keys.includes("waterResistance"), "null field omitted");
  const diameter = rows.find((r) => r.key === "diameterMm");
  assert(diameter?.value === "40 mm", "diameter suffixed with mm");
  assert(keys.indexOf("brand") < keys.indexOf("reference"), "brand before reference");
  assert(keys.indexOf("movementType") < keys.indexOf("diameterMm"), "movement before diameter");
  const withoutDiameter = formatSpecifications(make({ diameterMm: null }));
  assert(!withoutDiameter.some((r) => r.key === "diameterMm"), "diameter absent when not numeric");
}

console.log("\n== formatSchemaPriceTND ==");
{
  assert(formatSchemaPriceTND(450_000) === "450.000", "450000 → '450.000'");
  assert(formatSchemaPriceTND(450_500) === "450.500", "450500 → '450.500'");
  assert(formatSchemaPriceTND(1_879_000) === "1879.000", "1879000 → '1879.000'");
}

console.log("\n== getProductBadges (shared priority) ==");
{
  const now = Date.now();
  const promoPast = make({
    id: "p1",
    isBestSeller: true,
    isNew: true,
    promotion: {
      regularPriceMillimes: 100_000,
      salePriceMillimes: 80_000,
      startsAt: null,
      endsAt: "2020-01-01T00:00:00Z",
    },
  });
  const badges = getProductBadges(promoPast, now);
  assert(!badges.some((b) => b.id === "promo"), "expired promo → no promo badge");
  assert(badges.length <= 2, "max 2 badges");
  assert(badges[0].id === "best", "best before new");
}

console.log("\n== static guards ==");
{
  const fs = await import("node:fs");
  const path = await import("node:path");
  const url = await import("node:url");
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const root = path.join(here, "..");

  const routeSrc = fs.readFileSync(path.join(root, "src", "routes", "montres.$slug.tsx"), "utf8");
  assert(!/NowProvider/.test(routeSrc), "dynamic route: no NowProvider");
  assert(!/Date\.now\s*\(/.test(routeSrc), "dynamic route: no Date.now(");
  assert(!/new\s+Date\s*\(/.test(routeSrc), "dynamic route: no new Date(");

  // exactly one mounted <NowProvider in src/
  function walk(dir: string, acc: string[]) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, acc);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) acc.push(full);
    }
  }
  const files: string[] = [];
  walk(path.join(root, "src"), files);
  let mountCount = 0;
  for (const f of files) {
    const c = fs.readFileSync(f, "utf8");
    const m = c.match(/<NowProvider\s/g);
    if (m) mountCount += m.length;
  }
  assert(mountCount === 1, `exactly one <NowProvider mount in src/ (found ${mountCount})`);

  const panelSrc = fs.readFileSync(
    path.join(root, "src", "components", "product-detail", "ProductPurchasePanel.tsx"),
    "utf8",
  );
  assert(
    /onAddToCart\?:\s*\(product:\s*Product,\s*quantity:\s*number\)\s*=>\s*void/.test(panelSrc),
    "ProductPurchasePanel declares onAddToCart?: (product: Product, quantity: number) => void",
  );
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
