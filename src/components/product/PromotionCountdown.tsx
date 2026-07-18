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

  // Reset the "already fired" guard whenever the target date changes.
  useEffect(() => {
    firedRef.current = false;
  }, [endsAt]);

  const remaining = getRemainingTime(endsAt, new Date(nowTs));

  // Fire onExpire exactly once, after render, when the promo becomes expired.
  useEffect(() => {
    if (remaining.expired && !firedRef.current) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [remaining.expired, onExpire]);

  if (remaining.expired) return null;

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
