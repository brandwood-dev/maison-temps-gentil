import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lmm:favorites:v1";

type StoredShape = { ids: string[] };

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as StoredShape).ids)) {
      return (parsed as StoredShape).ids.filter((x) => typeof x === "string");
    }
    return [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids }));
  } catch {
    /* quota / privacy mode — silently ignore */
  }
}

/* ---------- module-scope store (single source of truth) ---------- */

const EMPTY: string[] = [];
let ids: string[] = EMPTY;
let hydrated = false;
let attached = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  ids = readStorage();
  emit();
}

function ensureAttached() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  ids = readStorage();
  hydrated = true;
  window.addEventListener("storage", onStorage);
}

function subscribe(fn: () => void) {
  ensureAttached();
  listeners.add(fn);
  // Notify the fresh subscriber so its hydrated snapshot flushes immediately.
  fn();
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): string[] {
  return ids;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

/* ---------- imperative actions (stable references) ---------- */

function setIds(next: string[]) {
  ids = next;
  writeStorage(next);
  emit();
}

function addId(id: string) {
  if (ids.includes(id)) return;
  setIds([...ids, id]);
}

function removeId(id: string) {
  if (!ids.includes(id)) return;
  setIds(ids.filter((x) => x !== id));
}

function toggleId(id: string) {
  if (ids.includes(id)) removeId(id);
  else addId(id);
}

/**
 * Local favorites — single shared store backed by localStorage.
 * All ProductCards read from the same in-memory list; one global `storage`
 * listener syncs across tabs. Later, ids can be merged into a customer
 * account when auth is added.
 */
export function useFavorites() {
  const currentIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback((id: string) => currentIds.includes(id), [currentIds]);

  return {
    ids: currentIds,
    isFavorite,
    add: addId,
    remove: removeId,
    toggle: toggleId,
    hydrated: currentIds !== EMPTY || hydrated,
  };
}
