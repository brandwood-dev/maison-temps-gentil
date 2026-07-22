import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { formatPriceTND } from "@/lib/product-pricing";
import { readConfirmation, type OrderConfirmation } from "@/lib/checkout";
import { PAYMENT_METHOD_LABEL, SHIPPING_DELAY_LABEL } from "@/lib/checkout-config";

export const Route = createFileRoute("/commande/confirmation")({
  head: () => ({
    meta: [
      { title: "Commande confirmée | La Maison des Montres" },
      {
        name: "description",
        content: "Votre commande a bien été enregistrée. Paiement à la livraison.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; order: OrderConfirmation } | { status: "empty" }
  >({ status: "loading" });

  useEffect(() => {
    const order = readConfirmation();
    setState(order ? { status: "ready", order } : { status: "empty" });
  }, []);

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        {state.status === "loading" ? (
          <p className="text-sm text-[color:var(--color-muted-foreground)]">Chargement…</p>
        ) : state.status === "empty" ? (
          <NoOrder />
        ) : (
          <Confirmed order={state.order} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function NoOrder() {
  return (
    <div className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-6 py-12 text-center">
      <h1 className="t-h1 text-[color:var(--color-foreground)]">Aucune commande à afficher</h1>
      <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
        Cette page n’est accessible qu’à la suite d’une commande validée dans ce navigateur.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/montres"
          search={{}}
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
        >
          Découvrir les montres
        </Link>
        <Link
          to="/suivi-commande"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-6 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]"
        >
          Suivre une commande
        </Link>
      </div>
    </div>
  );
}

function Confirmed({ order }: { order: OrderConfirmation }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-gold)]/15 text-[color:var(--color-gold)]"
        >
          <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
        </span>
        <h1 className="t-h1 mt-4 text-[color:var(--color-foreground)]">
          Merci pour votre commande
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Votre commande a bien été enregistrée. Nous vous contactons rapidement pour la confirmer.
        </p>
      </div>

      <dl className="mt-8 grid gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
            Référence
          </dt>
          <dd className="mt-1 text-base font-semibold tabular-nums text-[color:var(--color-foreground)]">
            {order.reference}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
            Total
          </dt>
          <dd className="mt-1 text-base font-semibold text-[color:var(--color-foreground)]">
            {formatPriceTND(order.totals.totalMillimes)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
            Paiement
          </dt>
          <dd className="mt-1 text-sm text-[color:var(--color-foreground)]">
            {PAYMENT_METHOD_LABEL}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
            Livraison
          </dt>
          <dd className="mt-1 text-sm text-[color:var(--color-foreground)]">
            {order.shippingLabel} · {SHIPPING_DELAY_LABEL}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/suivi-commande"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928]"
        >
          Suivre ma commande
        </Link>
        <Link
          to="/montres"
          search={{}}
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-6 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
