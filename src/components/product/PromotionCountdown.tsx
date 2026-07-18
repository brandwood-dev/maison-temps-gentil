import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getRemainingTime, type Remaining } from "@/lib/product-pricing";

type Props = {
  endsAt: string;
  className?: string;
  onExpire?: () => void;
  /** Compact: "Offre valable encore 6j 04h 18m". Detailed: also shows seconds. */
  variant?: "compact" | "detailed";
};

// Shared ticker so N cards don't spawn N timers.
type Listener = () => void;
const listeners = new Set<Listener>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(fn: Listener) {
  listeners.add(fn);
  if (intervalId === null && typeof window !== "undefined") {
    intervalId = setInterval(() => {
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function PromotionCountdown({
  endsAt,
  className,
  onExpire,
  variant = "compact",
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [remaining, setRemaining] = useState<Remaining>(() => getRemainingTime(endsAt));

  useEffect(() => {
    setHydrated(true);
    setRemaining(getRemainingTime(endsAt));
    const unsub = subscribe(() => {
      const r = getRemainingTime(endsAt);
      setRemaining(r);
      if (r.expired) {
        onExpire?.();
      }
    });
    return unsub;
  }, [endsAt, onExpire]);

  // Stable, non-time-sensitive placeholder before hydration to avoid mismatch.
  if (!hydrated) {
    return (
      <p
        className={cn(
          "text-xs text-[color:var(--color-muted-foreground)] tabular-nums",
          className,
        )}
      >
        Offre à durée limitée
      </p>
    );
  }

  if (remaining.expired) return null;

  const label =
    variant === "detailed"
      ? `Offre valable encore ${remaining.days}j ${pad(remaining.hours)}h ${pad(remaining.minutes)}m ${pad(remaining.seconds)}s`
      : `Offre valable encore ${remaining.days}j ${pad(remaining.hours)}h ${pad(remaining.minutes)}m`;

  return (
    <p
      className={cn(
        "text-xs text-[color:var(--color-muted-foreground)] tabular-nums",
        className,
      )}
    >
      {label}
    </p>
  );
}
