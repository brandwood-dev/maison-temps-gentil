/**
 * Local cart store — SSR-safe, no dependency, backed by localStorage.
 * Only stores `{ productId, quantity }` pairs. Prices, product data and
 * promotions are never persisted; they are resolved at render time from
 * `PRODUCTS` and the shared `useNow()` clock.
 */
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lmm:cart:v1";
const STORAGE_VERSION = 1 as const;

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartStorage = Pick<Storage, "getItem" | "setItem">;

type StoredCartV1 = {
  version: typeof STORAGE_VERSION;
  items: CartItem[];
};

export type DecodedCart = {
  items: CartItem[];
  shouldRewrite: boolean;
};

function normalizeProductId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const productId = value.trim();
  return productId ? productId : null;
}

function normalizeQuantity(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    return null;
  }
  return value;
}

function mergeQuantities(current: number, added: number): number | null {
  return normalizeQuantity(current + added);
}

/** Normalize, trim and merge cart lines without mutating the input. */
export function sanitizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  const items: CartItem[] = [];
  const indexByProductId = new Map<string, number>();

  for (const value of raw) {
    if (!value || typeof value !== "object") continue;
    const productId = normalizeProductId((value as Partial<CartItem>).productId);
    const quantity = normalizeQuantity((value as Partial<CartItem>).quantity);
    if (!productId || quantity === null) continue;

    const existingIndex = indexByProductId.get(productId);
    if (existingIndex === undefined) {
      indexByProductId.set(productId, items.length);
      items.push({ productId, quantity });
      continue;
    }

    const existing = items[existingIndex];
    const merged = mergeQuantities(existing.quantity, quantity);
    if (merged !== null) {
      items[existingIndex] = { ...existing, quantity: merged };
    }
  }

  return items;
}

export function serializeCartItems(raw: unknown): string {
  const payload: StoredCartV1 = {
    version: STORAGE_VERSION,
    items: sanitizeCartItems(raw),
  };
  return JSON.stringify(payload);
}

/** Decode both the canonical v1 payload and the legacy unversioned `{ items }` shape. */
export function decodeCartStorage(raw: string | null): DecodedCart {
  if (!raw) return { items: [], shouldRewrite: false };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { items: [], shouldRewrite: true };
    }

    const value = parsed as { version?: unknown; items?: unknown };
    if (value.version !== undefined && value.version !== STORAGE_VERSION) {
      return { items: [], shouldRewrite: false };
    }

    const items = sanitizeCartItems(value.items);
    const canonical = serializeCartItems(items);
    return {
      items,
      shouldRewrite: value.version !== STORAGE_VERSION || raw !== canonical,
    };
  } catch {
    return { items: [], shouldRewrite: false };
  }
}

export function readCartStorage(storage: CartStorage | null): CartItem[] {
  if (!storage) return [];
  try {
    const decoded = decodeCartStorage(storage.getItem(STORAGE_KEY));
    if (decoded.shouldRewrite) {
      try {
        storage.setItem(STORAGE_KEY, serializeCartItems(decoded.items));
      } catch {
        /* quota / privacy — keep the valid in-memory cart */
      }
    }
    return decoded.items;
  } catch {
    return [];
  }
}

export function writeCartStorage(storage: CartStorage | null, raw: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, serializeCartItems(raw));
  } catch {
    /* quota / privacy — ignore */
  }
}

export function addCartItem(
  current: readonly CartItem[],
  productIdValue: unknown,
  quantityValue: unknown = 1,
): CartItem[] {
  const productId = normalizeProductId(productIdValue);
  const quantity = normalizeQuantity(quantityValue);
  if (!productId || quantity === null) return current as CartItem[];

  const existing = current.find((item) => item.productId === productId);
  if (!existing) return [...current, { productId, quantity }];

  const merged = mergeQuantities(existing.quantity, quantity);
  if (merged === null) return current as CartItem[];
  return current.map((item) =>
    item.productId === productId ? { ...item, quantity: merged } : item,
  );
}

export function setCartItemQuantity(
  current: readonly CartItem[],
  productIdValue: unknown,
  quantityValue: unknown,
): CartItem[] {
  const productId = normalizeProductId(productIdValue);
  const quantity = normalizeQuantity(quantityValue);
  if (!productId || quantity === null || !current.some((item) => item.productId === productId)) {
    return current as CartItem[];
  }
  return current.map((item) => (item.productId === productId ? { ...item, quantity } : item));
}

export function removeCartItem(current: readonly CartItem[], productIdValue: unknown): CartItem[] {
  const productId = normalizeProductId(productIdValue);
  if (!productId || !current.some((item) => item.productId === productId)) {
    return current as CartItem[];
  }
  return current.filter((item) => item.productId !== productId);
}

function getBrowserStorage(): CartStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

/* ---------- module-scope store (single source of truth) ---------- */

const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let hydrated = false;
let attached = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  items = readCartStorage(getBrowserStorage());
  emit();
}

function ensureAttached() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  items = readCartStorage(getBrowserStorage());
  hydrated = true;
  window.addEventListener("storage", onStorage);
}

function subscribe(listener: () => void) {
  ensureAttached();
  listeners.add(listener);
  listener();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartItem[] {
  return items;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

/* ---------- imperative actions ---------- */

function setItems(next: CartItem[]) {
  items = next;
  writeCartStorage(getBrowserStorage(), next);
  emit();
}

export function addItem(productId: string, quantity = 1) {
  const next = addCartItem(items, productId, quantity);
  if (next !== items) setItems(next);
}

export function setQuantity(productId: string, quantity: number) {
  const next = setCartItemQuantity(items, productId, quantity);
  if (next !== items) setItems(next);
}

export function removeItem(productId: string) {
  const next = removeCartItem(items, productId);
  if (next !== items) setItems(next);
}

export function clearCart() {
  if (items.length === 0) return;
  setItems([]);
}

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const totalQuantity = current.reduce((sum, item) => sum + item.quantity, 0);
  const isHydrated = current !== EMPTY || hydrated;
  const add = useCallback((productId: string, quantity = 1) => addItem(productId, quantity), []);
  const set = useCallback(
    (productId: string, quantity: number) => setQuantity(productId, quantity),
    [],
  );
  const remove = useCallback((productId: string) => removeItem(productId), []);
  const clear = useCallback(() => clearCart(), []);
  return {
    items: current,
    totalQuantity,
    hydrated: isHydrated,
    addItem: add,
    setQuantity: set,
    removeItem: remove,
    clearCart: clear,
  };
}
