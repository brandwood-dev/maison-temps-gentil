/**
 * Shared client clock. A single setInterval ticks once per second while at
 * least one subscriber is mounted. Consumers use `useNow()` to re-render in
 * lockstep whenever the tick advances.
 *
 * SSR / hydration:
 *  - `getServerSnapshot` returns a stable sentinel (0) so server render and
 *    the first client render agree on the timestamp — no hydration mismatch.
 *  - Consumers that need time-sensitive evaluation must treat `now === 0`
 *    as "not hydrated yet" and fall back to trusting the fixture data.
 */
import { useSyncExternalStore } from "react";

type Listener = () => void;

const listeners = new Set<Listener>();
let currentTs = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  currentTs = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(fn: Listener) {
  listeners.add(fn);
  if (intervalId === null && typeof window !== "undefined") {
    // Prime on first subscriber so `useNow()` returns a real value on mount.
    currentTs = Date.now();
    intervalId = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return currentTs;
}

function getServerSnapshot() {
  return 0;
}

/** Returns a millisecond timestamp. `0` means SSR / pre-hydration. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
