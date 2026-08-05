import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
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

/* ---------------- page ---------------- */

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

/* ---------------- shared class helpers ---------------- */

const primaryBtn =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)] sm:w-auto";

const ghostBtn =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-6 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)] sm:w-auto";

const sectionTitle =
  "text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-foreground)]";

/* ---------------- empty state ---------------- */

function NoOrder() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <span
        aria-hidden
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] text-[color:var(--color-muted-foreground)]"
      >
        <Package className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h1 className="t-h1 mt-6 text-[color:var(--color-foreground)]">Aucune commande à afficher</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--color-muted-foreground)]">
        Cette page n’est accessible qu’à la suite d’une commande validée dans ce navigateur.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/montres" search={{}} className={primaryBtn}>
          Découvrir les montres
        </Link>
        <Link to="/suivi-commande" className={ghostBtn}>
          Suivre une commande
        </Link>
      </div>
    </div>
  );
}

/* ---------------- confirmed ---------------- */

function Confirmed({ order }: { order: OrderConfirmation }) {
  const items = order.items ?? [];
  const shipping = order.shipping ?? null;
  const firstName = shipping?.firstName?.trim() || null;

  return (
    <div className="mx-auto max-w-4xl">
      <ThankYouHero firstName={firstName} itemCount={order.totals.itemCount} />
      <OrderReferenceCard reference={order.reference} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/suivi-commande" className={primaryBtn}>
          Suivre ma commande
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
        <Link to="/montres" search={{}} className={ghostBtn}>
          Continuer mes achats
        </Link>
      </div>

      <TrackingCallout />
      <TrackingSteps />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <OrderRecap order={order} items={items} />
        <DeliveryInfo order={order} />
      </div>
    </div>
  );
}

function ThankYouHero({ firstName, itemCount }: { firstName: string | null; itemCount: number }) {
  return (
    <section className="text-center">
      <span
        aria-hidden
        className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-gold)]/12 text-[color:var(--color-gold)]"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)]">
          <Check className="h-6 w-6" strokeWidth={2.25} />
        </span>
      </span>
      <h1 className="t-h1 mt-6 text-balance text-[color:var(--color-foreground)]">
        {firstName ? `Merci ${firstName}\u00A0!` : "Merci pour votre commande\u00A0!"}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-[color:var(--color-muted-foreground)] sm:text-base">
        Votre commande de {itemCount} article{itemCount > 1 ? "s" : ""} est enregistrée. Notre
        équipe vous appelle très prochainement pour confirmer les détails de la livraison.
      </p>
    </section>
  );
}

function OrderReferenceCard({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      const el = document.createElement("textarea");
      el.value = reference;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(el);
      }
    }
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <section
      aria-label="Référence de commande"
      className="mx-auto mt-8 max-w-xl rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-surface-cream)] p-5 text-center sm:p-6"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
        Référence de commande
      </p>
      <p className="mt-2 break-all text-2xl font-semibold tabular-nums tracking-[0.04em] text-[color:var(--color-foreground)] sm:text-3xl">
        {reference}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-4 inline-flex h-11 min-w-0 max-w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
      >
        {copied ? (
          <Check className="h-4 w-4 text-[color:var(--color-gold)]" strokeWidth={2} aria-hidden />
        ) : (
          <Copy className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
        {copied ? "Référence copiée" : "Copier la référence"}
      </button>
      <p aria-live="polite" className="sr-only">
        {copied ? "Référence de commande copiée dans le presse-papiers." : ""}
      </p>
      <p className="mt-4 text-xs leading-relaxed text-[color:var(--color-muted-foreground)] sm:text-sm">
        Conservez précieusement cette référence&nbsp;: elle est indispensable pour suivre votre
        commande.
      </p>
    </section>
  );
}

function TrackingCallout() {
  return (
    <section
      aria-label="Suivi de commande"
      className="mx-auto mt-10 max-w-2xl border-t border-[color:var(--color-border)] pt-8 text-center"
    >
      <h2 className={sectionTitle}>Suivre votre commande</h2>
      <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
        Rendez-vous à tout moment dans notre espace{" "}
        <Link
          to="/suivi-commande"
          className="font-semibold text-[color:var(--color-foreground)] underline decoration-[color:var(--color-gold)] decoration-2 underline-offset-4"
        >
          Suivi de commande
        </Link>{" "}
        avec votre référence et le numéro de téléphone indiqué lors de la commande.
      </p>
    </section>
  );
}

const TRACK_STEPS = [
  { key: "confirmed", label: "Confirmée", Icon: Check },
  { key: "preparing", label: "Préparation", Icon: Package },
  { key: "shipped", label: "Expédition", Icon: Truck },
] as const;

function TrackingSteps() {
  const activeIndex = 0;
  return (
    <ol
      aria-label="Étapes de la commande"
      className="mx-auto mt-8 flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
    >
      {TRACK_STEPS.map((step, i) => {
        const state: "done" | "current" | "todo" =
          i < activeIndex ? "done" : i === activeIndex ? "current" : "todo";
        const Icon = step.Icon;
        return (
          <li
            key={step.key}
            aria-current={state === "current" ? "step" : undefined}
            className="flex min-w-0 items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center"
          >
            <span
              aria-hidden
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                state === "done" &&
                  "border-[color:var(--color-foreground)] bg-[color:var(--color-foreground)] text-[color:var(--color-primary-foreground)]",
                state === "current" &&
                  "border-[color:var(--color-gold)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)]",
                state === "todo" &&
                  "border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] text-[color:var(--color-muted-foreground)]",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span
              className={cn(
                "min-w-0 text-sm font-semibold",
                state === "todo"
                  ? "text-[color:var(--color-muted-foreground)]"
                  : "text-[color:var(--color-foreground)]",
              )}
            >
              {step.label}
              {state === "current" ? (
                <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-gold)] sm:ml-0 sm:block">
                  En cours
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderRecap({
  order,
  items,
}: {
  order: OrderConfirmation;
  items: NonNullable<OrderConfirmation["items"]>;
}) {
  return (
    <section
      aria-label="Récapitulatif de la commande"
      className="min-w-0 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 sm:p-6"
    >
      <h2 className={sectionTitle}>Récapitulatif</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[color:var(--color-muted-foreground)]">
          Détail des articles indisponible pour cette commande.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[color:var(--color-border)]">
          {items.map((it) => (
            <li key={it.productId} className="flex min-w-0 gap-4 py-4 first:pt-0 last:pb-0">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)]">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]">
                  {it.brand}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-[color:var(--color-foreground)]">
                  {it.name}
                </p>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 pt-2">
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">
                    Qté&nbsp;
                    <span className="font-semibold text-[color:var(--color-foreground)]">
                      {it.quantity}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-[color:var(--color-foreground)]">
                    {formatPriceTND(it.lineMillimes)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-6 space-y-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[color:var(--color-muted-foreground)]">Sous-total</dt>
          <dd className="tabular-nums text-[color:var(--color-foreground)]">
            {formatPriceTND(order.totals.subtotalMillimes)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[color:var(--color-muted-foreground)]">Livraison</dt>
          <dd className="tabular-nums text-[color:var(--color-foreground)]">
            {order.totals.shippingMillimes === 0
              ? "Offerte"
              : formatPriceTND(order.totals.shippingMillimes)}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-[color:var(--color-border)] pt-3">
          <dt className="text-sm font-semibold text-[color:var(--color-foreground)]">
            Total à payer à la livraison
          </dt>
          <dd className="text-lg font-semibold tabular-nums text-[color:var(--color-foreground)]">
            {formatPriceTND(order.totals.totalMillimes)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function DeliveryInfo({ order }: { order: OrderConfirmation }) {
  const shipping = order.shipping ?? null;
  const fullName = shipping ? `${shipping.firstName} ${shipping.lastName}`.trim() : null;

  return (
    <aside className="flex min-w-0 flex-col gap-6">
      <section
        aria-label="Adresse de livraison"
        className="min-w-0 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <MapPin
            className="h-4 w-4 shrink-0 text-[color:var(--color-gold)]"
            strokeWidth={1.75}
            aria-hidden
          />
          <h2 className={sectionTitle}>Livraison</h2>
        </div>
        {shipping ? (
          <address className="mt-3 not-italic text-sm leading-relaxed text-[color:var(--color-foreground)]">
            {fullName ? <p className="font-semibold">{fullName}</p> : null}
            <p className="break-words">{shipping.address}</p>
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
        className="min-w-0 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5 sm:p-6"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-background)] text-[color:var(--color-gold)]"
          >
            <Truck className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
              Délai estimé
            </p>
            <p className="mt-0.5 text-sm text-[color:var(--color-muted-foreground)]">
              {SHIPPING_DELAY_LABEL}
            </p>
          </div>
        </div>
        <div className="mt-4 flex min-w-0 items-start gap-3 border-t border-[color:var(--color-border)] pt-4">
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
              Réglez en espèces à la réception de votre montre.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
