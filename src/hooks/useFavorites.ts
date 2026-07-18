import { useCallback, useEffect, useState } from "react";

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

/**
 * Local favorites (localStorage). SSR-safe: starts empty, syncs on mount.
 * Sync across tabs via `storage` event. Later, ids can be merged into a
 * customer account when auth is added.
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readStorage());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter((x) => x !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeStorage(next);
      return next;
    });
  }, []);

  return { ids, isFavorite, add, remove, toggle, hydrated };
}
