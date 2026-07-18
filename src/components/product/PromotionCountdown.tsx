import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getRemainingTime } from "@/lib/product-pricing";
import { useNow } from "@/lib/now-store";

type Props = {
  endsAt: string;
  className?: string;
  onExpire?: () => void;
  /** Compact: "Offre valable encore 6j 04h 18m". Detailed: also shows seconds. */
  variant?: "compact" | "detailed";
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function PromotionCountdown({ endsAt, className, onExpire, variant = "compact" }: Props) {
  const nowTs = useNow();
  const firedRef = useRef(false);

  // Reset the guard when the target date changes.
  useEffect(() => {
    firedRef.current = false;
  }, [endsAt]);

  // Stable, non-time-sensitive placeholder before hydration to avoid mismatch.
  if (nowTs === 0) {
    return (
      <p
        className={cn("text-xs text-[color:var(--color-muted-foreground)] tabular-nums", className)}
      >
        Offre à durée limitée
      </p>
    );
  }

  const remaining = getRemainingTime(endsAt, new Date(nowTs));

  if (remaining.expired) {
    if (!firedRef.current) {
      firedRef.current = true;
      // Defer to avoid setState-in-render inside a parent.
      if (onExpire) queueMicrotask(onExpire);
    }
    return null;
  }

  const label =
    variant === "detailed"
      ? `Offre valable encore ${remaining.days}j ${pad(remaining.hours)}h ${pad(remaining.minutes)}m ${pad(remaining.seconds)}s`
      : `Offre valable encore ${remaining.days}j ${pad(remaining.hours)}h ${pad(remaining.minutes)}m`;

  return (
    <p className={cn("text-xs text-[color:var(--color-muted-foreground)] tabular-nums", className)}>
      {label}
    </p>
  );
}
