import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MapPin, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { formatPriceTND } from "@/lib/product-pricing";
import { readConfirmation, type OrderConfirmation } from "@/lib/checkout";
import { PAYMENT_METHOD_LABEL, SHIPPING_DELAY_LABEL } from "@/lib/checkout-config";
import { cn } from "@/lib/utils";

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
      <main id="content" className="container-page py-8 md:py-14">
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
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

const TRACK_STEPS = [
  { key: "confirmed", label: "Confirmée", Icon: Check },
  { key: "preparing", label: "En cours de préparation", Icon: Package },
  { key: "shipped", label: "Expédition", Icon: Truck },
] as const;

function Confirmed({ order }: { order: OrderConfirmation }) {
  const items = order.items ?? [];
  const shipping = order.shipping ?? null;
  const fullName = shipping ? `${shipping.firstName} ${shipping.lastName}`.trim() : null;
  // Étape active : commande confirmée par le client (l'expédition suivra).
  const activeIndex = 0;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-6 py-10 text-center sm:px-10 sm:py-14">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-48 rounded-full bg-[color:var(--color-gold)]/15 blur-3xl"
        />
        <span
          aria-hidden
          className="relative mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-gold)]/40 bg-[color:var(--color-background)] text-[color:var(--color-gold)] shadow-sm"
        >
          <Check className="h-8 w-8" strokeWidth={2} />
        </span>
        <h1 className="t-h1 mt-6 text-[color:var(--color-foreground)]">
          Merci pour votre commande&nbsp;!
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--color-muted-foreground)] sm:text-base">
          Votre commande a bien été enregistrée. Notre équipe vous contactera très prochainement
          pour confirmer les détails de la livraison.
        </p>

        <div className="mx-auto mt-6 inline-flex flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-5 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-muted-foreground)]">
            Numéro de commande
          </span>
          <span className="text-lg font-semibold tabular-nums text-[color:var(--color-foreground)] sm:text-xl">
            {order.reference}
          </span>
        </div>
      </section>

      {/* Suivi */}
      <section
        aria-label="Suivi de votre commande"
        className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 sm:p-8"
      >
        <ol className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          {TRACK_STEPS.map((step, i) => {
            const state: "done" | "current" | "todo" =
              i < activeIndex ? "done" : i === activeIndex ? "current" : "todo";
            const Icon = step.Icon;
            return (
              <li
                key={step.key}
                aria-current={state === "current" ? "step" : undefined}
                className="flex items-center gap-4 sm:flex-1 sm:flex-col sm:text-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
                    state === "done" &&
                      "border-[color:var(--color-foreground)] bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)]",
                    state === "current" &&
                      "border-[color:var(--color-gold)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)]",
                    state === "todo" &&
                      "border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-muted-foreground)]",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col sm:items-center">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      state === "todo"
                        ? "text-[color:var(--color-muted-foreground)]"
                        : "text-[color:var(--color-foreground)]",
                    )}
                  >
                    {step.label}
                  </span>
                  {state === "current" ? (
                    <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-gold)]">
                      En cours
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Contenu principal : récap + infos */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Récapitulatif — d'abord sur mobile */}
        <section
          aria-label="Récapitulatif de la commande"
          className="order-1 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2">
            <Sparkles
              className="h-4 w-4 text-[color:var(--color-gold)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <h2 className="text-base font-semibold text-[color:var(--color-foreground)]">
              Votre sélection
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--color-muted-foreground)]">
              Détail des articles indisponible pour cette commande.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[color:var(--color-border)]">
              {items.map((it) => (
                <li key={it.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] sm:h-24 sm:w-24">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.imageAlt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                      {it.brand}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[color:var(--color-foreground)] sm:text-base">
                      {it.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[color:var(--color-muted-foreground)]">
                      Réf. {it.reference}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                      <span className="text-xs text-[color:var(--color-muted-foreground)]">
                        Quantité&nbsp;:{" "}
                        <span className="font-semibold text-[color:var(--color-foreground)]">
                          {it.quantity}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-[color:var(--color-foreground)] sm:text-base">
                        {formatPriceTND(it.lineMillimes)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Totaux */}
          <dl className="mt-6 space-y-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[color:var(--color-muted-foreground)]">Sous-total</dt>
              <dd className="tabular-nums text-[color:var(--color-foreground)]">
                {formatPriceTND(order.totals.subtotalMillimes)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[color:var(--color-muted-foreground)]">Livraison</dt>
              <dd className="tabular-nums text-[color:var(--color-foreground)]">
                {order.totals.shippingMillimes === 0
                  ? "Offerte"
                  : formatPriceTND(order.totals.shippingMillimes)}
              </dd>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
              <dt className="text-base font-semibold text-[color:var(--color-foreground)]">
                Total payé
              </dt>
              <dd className="text-lg font-semibold tabular-nums text-[color:var(--color-foreground)]">
                {formatPriceTND(order.totals.totalMillimes)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Infos livraison / paiement */}
        <aside className="order-2 flex flex-col gap-6">
          <section
            aria-label="Adresse de livraison"
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <MapPin
                className="h-4 w-4 text-[color:var(--color-gold)]"
                strokeWidth={1.75}
                aria-hidden
              />
              <h2 className="text-base font-semibold text-[color:var(--color-foreground)]">
                Adresse de livraison
              </h2>
            </div>
            {shipping ? (
              <address className="mt-3 not-italic text-sm leading-relaxed text-[color:var(--color-foreground)]">
                {fullName ? <p className="font-semibold">{fullName}</p> : null}
                <p>{shipping.address}</p>
                <p>
                  {shipping.postalCode ? `${shipping.postalCode} ` : ""}
                  {shipping.city}
                </p>
                <p className="text-[color:var(--color-muted-foreground)]">{shipping.governorate}</p>
                <p className="mt-2 tabular-nums text-[color:var(--color-muted-foreground)]">
                  {shipping.phone}
                </p>
              </address>
            ) : (
              <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
                {order.shippingLabel}
              </p>
            )}
          </section>

          <section
            aria-label="Livraison et paiement"
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-background)] text-[color:var(--color-gold)]"
              >
                <Truck className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  Livraison standard
                </p>
                <p className="mt-0.5 text-sm text-[color:var(--color-muted-foreground)]">
                  Délai estimé&nbsp;: {SHIPPING_DELAY_LABEL}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3 border-t border-[color:var(--color-border)] pt-4">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-background)] text-[color:var(--color-gold)]"
              >
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {PAYMENT_METHOD_LABEL}
                </p>
                <p className="mt-0.5 text-sm text-[color:var(--color-muted-foreground)]">
                  Réglez en toute simplicité à la réception de votre montre.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/montres"
          search={{}}
          className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-6 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)] sm:w-auto"
        >
          Continuer mes achats
        </Link>
        <Link
          to="/suivi-commande"
          className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928] sm:w-auto"
        >
          Suivre ma commande
        </Link>
      </div>
    </div>
  );
}
