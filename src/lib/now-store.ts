/**
 * Per-request now-store for La Maison des Montres.
 *
 * SSR safety: no timestamp state lives at module scope. Each React tree owns
 * its own `NowStore` instance (created by `NowProvider` via `useRef`), so
 * concurrent SSR requests never share a mutable clock.
 *
 * Consistency: `initialNow` comes from the root loader and is serialized by
 * TanStack Start, so SSR and the first client render observe the exact same
 * timestamp — no hydration mismatch. The ticker starts only on the client,
 * inside a `useEffect`, and is cleared on unmount.
 */
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Listener = () => void;

export type NowStore = {
  subscribe: (fn: Listener) => () => void;
  getSnapshot: () => number;
  getServerSnapshot: () => number;
  /** Internal — exposed for the provider's client-only ticker. */
  _set: (ts: number) => void;
};

export function createNowStore(initialNow: number): NowStore {
  let currentTs = initialNow;
  const listeners = new Set<Listener>();
  const initial = initialNow;

  const subscribe = (fn: Listener) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };

  const getSnapshot = () => currentTs;
  const getServerSnapshot = () => initial;
  const _set = (ts: number) => {
    if (ts === currentTs) return;
    currentTs = ts;
    listeners.forEach((l) => l());
  };

  return { subscribe, getSnapshot, getServerSnapshot, _set };
}

const NowContext = createContext<NowStore | null>(null);

export function NowProvider({ initialNow, children }: { initialNow: number; children: ReactNode }) {
  const storeRef = useRef<NowStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createNowStore(initialNow);
  }
  const store = storeRef.current;

  useEffect(() => {
    // Client-only ticker; one interval per NowProvider mount.
    store._set(Date.now());
    const id = setInterval(() => store._set(Date.now()), 1000);
    return () => clearInterval(id);
  }, [store]);

  return createElement(NowContext.Provider, { value: store }, children);
}

/** Returns a millisecond timestamp. Same value on SSR and first client render. */
export function useNow(): number {
  const store = useContext(NowContext);
  if (!store) {
    throw new Error("useNow() must be used inside <NowProvider>.");
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
