/**
 * Local cart store — SSR-safe, no dependency, backed by localStorage.
 * Only stores `{ productId, quantity }` pairs. Prices, product data and
 * promotions are never persisted; they are resolved at render time from
 * `PRODUCTS` and the shared `useNow()` clock.
 */
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lmm:cart:v1";

export type CartItem = {
  productId: string;
  quantity: number;
};

type StoredShape = { items: CartItem[] };

function sanitize(raw: unknown): CartItem[] {
  if (!raw || typeof raw !== "object") return [];
  const arr = (raw as StoredShape).items;
  if (!Array.isArray(arr)) return [];
  const out: CartItem[] = [];
  const seen = new Set<string>();
  for (const it of arr) {
    if (!it || typeof it !== "object") continue;
    const pid = (it as CartItem).productId;
    const qty = (it as CartItem).quantity;
    if (typeof pid !== "string" || !pid) continue;
    if (typeof qty !== "number" || !Number.isFinite(qty)) continue;
    const q = Math.max(1, Math.floor(qty));
    if (seen.has(pid)) continue;
    seen.add(pid);
    out.push({ productId: pid, quantity: q });
  }
  return out;
}

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitize(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  } catch {
    /* quota / privacy — ignore */
  }
}

/* ---------- module-scope store (single source of truth) ---------- */

const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let hydrated = false;
let attached = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  items = readStorage();
  emit();
}

function ensureAttached() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  items = readStorage();
  hydrated = true;
  window.addEventListener("storage", onStorage);
}

function subscribe(fn: () => void) {
  ensureAttached();
  listeners.add(fn);
  fn();
  return () => {
    listeners.delete(fn);
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
  writeStorage(next);
  emit();
}

export function addItem(productId: string, quantity = 1) {
  const qty = Math.max(1, Math.floor(quantity));
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    setItems(
      items.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + qty } : i,
      ),
    );
  } else {
    setItems([...items, { productId, quantity: qty }]);
  }
}

export function setQuantity(productId: string, quantity: number) {
  const qty = Math.max(1, Math.floor(quantity));
  if (!items.some((i) => i.productId === productId)) return;
  setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
}

export function removeItem(productId: string) {
  if (!items.some((i) => i.productId === productId)) return;
  setItems(items.filter((i) => i.productId !== productId));
}

export function clearCart() {
  if (items.length === 0) return;
  setItems([]);
}

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const totalQuantity = current.reduce((sum, i) => sum + i.quantity, 0);
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
