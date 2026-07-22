import { Check, Package, Truck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

export type OrderTrackingStatus = OrderStatus;

type MainStep = {
  key: Extract<OrderTrackingStatus, "new" | "to_confirm" | "confirmed" | "shipped" | "delivered">;
  label: string;
};

const MAIN_STEPS: MainStep[] = [
  { key: "new", label: "Commande reçue" },
  { key: "to_confirm", label: "À confirmer" },
  { key: "confirmed", label: "Confirmée" },
  { key: "shipped", label: "Expédiée" },
  { key: "delivered", label: "Livrée" },
];

const BRANCH_LABEL: Record<
  Extract<OrderTrackingStatus, "cancelled" | "refused" | "returned" | "exchange_requested">,
  string
> = {
  cancelled: "Annulée",
  refused: "Refusée à la livraison",
  returned: "Retournée",
  exchange_requested: "Échange demandé",
};

function isBranch(
  s: OrderTrackingStatus,
): s is "cancelled" | "refused" | "returned" | "exchange_requested" {
  return s === "cancelled" || s === "refused" || s === "returned" || s === "exchange_requested";
}

export function OrderStatusTimeline({ status }: { status: OrderTrackingStatus }) {
  const branch = isBranch(status) ? status : null;
  const activeIndex = branch ? -1 : MAIN_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 md:p-6">
      <ol className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-2">
        {MAIN_STEPS.map((step, i) => {
          const done = activeIndex >= 0 && i < activeIndex;
          const current = activeIndex === i;
          const state: "done" | "current" | "todo" = done ? "done" : current ? "current" : "todo";
          return (
            <li
              key={step.key}
              className="flex items-center gap-3 md:flex-1 md:flex-col md:items-center md:gap-2 md:text-center"
              aria-current={current ? "step" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  state === "done" &&
                    "border-[color:var(--color-foreground)] bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)]",
                  state === "current" &&
                    "border-[color:var(--color-gold)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)]",
                  state === "todo" &&
                    "border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-muted-foreground)]",
                )}
              >
                {state === "done" ? (
                  <Check className="h-4 w-4" strokeWidth={2} />
                ) : step.key === "shipped" ? (
                  <Truck className="h-4 w-4" strokeWidth={1.75} />
                ) : step.key === "delivered" ? (
                  <Package className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  state === "todo"
                    ? "text-[color:var(--color-muted-foreground)]"
                    : "text-[color:var(--color-foreground)]",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {branch ? (
        <div className="mt-5 flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-cream)] px-4 py-3">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-medium text-[color:var(--color-foreground)]">
            Statut : {BRANCH_LABEL[branch]}
          </p>
        </div>
      ) : null}
    </div>
  );
}
