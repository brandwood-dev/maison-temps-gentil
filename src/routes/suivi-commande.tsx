import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import { getPublicOrderTracking, type PublicOrderTracking } from "@/lib/catalog-api";
import { formatPriceTND } from "@/lib/product-pricing";

export type OrderTrackingRequest = {
  orderReference: string;
  phone: string;
};

export const Route = createFileRoute("/suivi-commande")({
  head: () => ({
    meta: [
      { title: "Suivre ma commande | La Maison des Montres" },
      {
        name: "description",
        content:
          "Suivez l’état de votre commande à l’aide de votre référence et de votre numéro de téléphone.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const refId = useId();
  const phoneId = useId();
  const errorId = useId();

  const [orderReference, setOrderReference] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicOrderTracking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ref = orderReference.trim();
    const tel = phone.trim();
    if (!ref || !tel) {
      setOrder(null);
      setNotFound(false);
      setError("Veuillez renseigner la référence de commande et le numéro de téléphone.");
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    setNotFound(false);
    try {
      const result = await getPublicOrderTracking({ data: { reference: ref, phone: tel } });
      if (!result) {
        setNotFound(true);
      } else {
        setOrder(result);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Le suivi est momentanément indisponible. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-xl">
          <h1 className="t-h1 text-[color:var(--color-foreground)]">Suivre ma commande</h1>
          <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
            Renseignez votre référence de commande et votre numéro de téléphone pour consulter
            l’état d’avancement.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5 md:p-6"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor={refId}
                className="text-sm font-medium text-[color:var(--color-foreground)]"
              >
                Référence de commande
              </label>
              <input
                id={refId}
                type="text"
                required
                autoComplete="off"
                inputMode="text"
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="h-12 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm text-[color:var(--color-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={phoneId}
                className="text-sm font-medium text-[color:var(--color-foreground)]"
              >
                Numéro de téléphone
              </label>
              <input
                id={phoneId}
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="h-12 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm text-[color:var(--color-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
              />
            </div>

            {error ? (
              <p
                id={errorId}
                role="alert"
                className="text-sm font-medium text-[color:var(--color-foreground)]"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
            >
              {loading ? "Recherche en cours…" : "Suivre ma commande"}
            </button>
          </form>

          <div aria-live="polite" className="mt-8">
            {error ? (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-cream)] px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                <p role="alert">{error}</p>
                <button
                  type="button"
                  onClick={() =>
                    void handleSubmit(
                      new Event("submit") as unknown as React.FormEvent<HTMLFormElement>,
                    )
                  }
                  className="mt-3 text-sm font-semibold underline underline-offset-4"
                >
                  Réessayer
                </button>
              </div>
            ) : null}
            {notFound ? (
              <p className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                Aucune commande ne correspond à cette référence et ce numéro de téléphone.
              </p>
            ) : null}
          </div>

          {order ? <TrackedOrder order={order} /> : null}

          <section className="mt-8 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
              À savoir
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-[color:var(--color-muted-foreground)]">
              <li>La référence vous est communiquée après la commande.</li>
              <li>La commande est confirmée par téléphone.</li>
              <li>Le statut est mis à jour par l’administration.</li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const STATUS_LABELS: Record<PublicOrderTracking["status"], string> = {
  new: "Commande reçue",
  to_confirm: "À confirmer",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  returned: "Retournée",
};

function TrackedOrder({ order }: { order: PublicOrderTracking }) {
  const date = new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(order.createdAt));

  return (
    <section className="mt-8 flex flex-col gap-5" aria-label="Résultat du suivi">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
              Commande
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[color:var(--color-foreground)]">
              {order.reference}
            </h2>
          </div>
          <span className="rounded-full border border-[color:var(--color-border-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--color-foreground)]">
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
          Enregistrée le {date} · Livraison à {order.shippingLabel}
        </p>
      </div>

      <OrderStatusTimeline status={order.status} />

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
          Articles
        </h2>
        <ul className="mt-4 divide-y divide-[color:var(--color-border)]">
          {order.items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[color:var(--color-foreground)]">
                  {item.name}
                </p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">
                  Quantité : {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[color:var(--color-foreground)]">
                {formatPriceTND(item.lineMillimes)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted-foreground)]">Sous-total</dt>
            <dd className="font-medium">{formatPriceTND(order.totals.subtotalMillimes)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted-foreground)]">Livraison</dt>
            <dd className="font-medium">
              {order.totals.shippingMillimes === 0
                ? "Offerte"
                : formatPriceTND(order.totals.shippingMillimes)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[color:var(--color-border)] pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPriceTND(order.totals.totalMillimes)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
