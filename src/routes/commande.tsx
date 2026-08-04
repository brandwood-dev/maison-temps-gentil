import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useCart } from "@/lib/cart-store";
import { useNow } from "@/lib/now-store";
import { formatPriceTND } from "@/lib/product-pricing";
import {
  buildOrderSubmission,
  computeCheckoutTotals,
  saveConfirmation,
  submitOrderMock,
  validateShipping,
  type ShippingErrors,
  type ShippingInput,
} from "@/lib/checkout";
import { TUNISIA_GOVERNORATES } from "@/lib/tunisia";
import { PAYMENT_METHOD_LABEL, SHIPPING_DELAY_LABEL } from "@/lib/checkout-config";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title: "Finaliser ma commande | La Maison des Montres" },
      {
        name: "description",
        content:
          "Renseignez vos coordonnées de livraison pour finaliser votre commande. Paiement à la livraison, partout en Tunisie.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const EMPTY_INPUT: ShippingInput = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  governorate: "",
  city: "",
  address: "",
  postalCode: "",
  note: "",
};

function CheckoutPage() {
  const { items, hydrated, clearCart } = useCart();
  const nowTs = useNow();
  const now = useMemo(() => new Date(nowTs), [nowTs]);
  const totals = useMemo(() => computeCheckoutTotals(items, now), [items, now]);
  const navigate = useNavigate();

  const [values, setValues] = useState<ShippingInput>(EMPTY_INPUT);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = <K extends keyof ShippingInput>(k: K, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const isEmpty = hydrated && totals.lines.length === 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const nextErrors = validateShipping(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setServerError(null);
      return;
    }
    const submission = buildOrderSubmission(items, values);
    if (!submission) {
      setServerError("Coordonnées invalides.");
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      const confirmation = await submitOrderMock(submission, totals);
      saveConfirmation(confirmation);
      clearCart();
      await navigate({ to: "/commande/confirmation" });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <h1 className="t-h1 text-[color:var(--color-foreground)]">Finaliser ma commande</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Commande en tant qu’invité — {PAYMENT_METHOD_LABEL.toLowerCase()}, livraison{" "}
          {SHIPPING_DELAY_LABEL} partout en Tunisie.
        </p>

        {!hydrated ? (
          <p className="mt-8 text-sm text-[color:var(--color-muted-foreground)]">Chargement…</p>
        ) : isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-10">
            <ShippingForm
              values={values}
              errors={errors}
              submitting={submitting}
              serverError={serverError}
              onChange={set}
              onSubmit={handleSubmit}
            />
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <OrderSummary totals={totals} />
            </aside>
          </div>

        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] px-6 py-12 text-center">
      <p className="text-base text-[color:var(--color-foreground)]">
        Votre panier est vide. Ajoutez au moins un article avant de passer commande.
      </p>
      <Link
        to="/montres"
        search={{}}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928]"
      >
        Découvrir les montres
      </Link>
    </div>
  );
}

const inputClass =
  "h-12 w-full min-w-0 max-w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm text-[color:var(--color-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)] aria-[invalid=true]:border-[color:var(--color-foreground)]";

const labelClass = "text-sm font-medium text-[color:var(--color-foreground)]";
const errClass = "text-xs font-medium text-[color:var(--color-foreground)]";

function ShippingForm({
  values,
  errors,
  submitting,
  serverError,
  onChange,
  onSubmit,
}: {
  values: ShippingInput;
  errors: ShippingErrors;
  submitting: boolean;
  serverError: string | null;
  onChange: <K extends keyof ShippingInput>(k: K, v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const ids = {
    firstName: useId(),
    lastName: useId(),
    phone: useId(),
    email: useId(),
    governorate: useId(),
    city: useId(),
    address: useId(),
    postalCode: useId(),
    note: useId(),
    error: useId(),
  };

  const field = (
    key: keyof ShippingInput,
    label: string,
    opts: {
      required?: boolean;
      type?: string;
      autoComplete?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
      placeholder?: string;
    } = {},
  ) => {
    const id = ids[key as keyof typeof ids];
    const err = errors[key];
    return (
      <div className="flex min-w-0 flex-col gap-2">

        <label htmlFor={id} className={labelClass}>
          {label} {opts.required ? <span aria-hidden>*</span> : null}
        </label>
        <input
          id={id}
          type={opts.type ?? "text"}
          required={opts.required}
          autoComplete={opts.autoComplete}
          inputMode={opts.inputMode}
          placeholder={opts.placeholder}
          value={values[key]}
          onChange={(e) => onChange(key, e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-err` : undefined}
          className={inputClass}
        />
        {err ? (
          <p id={`${id}-err`} role="alert" className={errClass}>
            {err}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-w-0 flex-col gap-6 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-4 sm:p-5 md:p-6"
    >
      <fieldset className="flex min-w-0 flex-col gap-4">
        <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
          Coordonnées
        </legend>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">

          {field("firstName", "Prénom", { required: true, autoComplete: "given-name" })}
          {field("lastName", "Nom", { required: true, autoComplete: "family-name" })}
        </div>
        {field("phone", "Téléphone", {
          required: true,
          type: "tel",
          autoComplete: "tel",
          inputMode: "tel",
          placeholder: "20 123 456",
        })}
        {field("email", "E-mail (facultatif)", {
          type: "email",
          autoComplete: "email",
          inputMode: "email",
        })}
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-4">
        <legend className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
          Adresse de livraison
        </legend>
        <div className="flex min-w-0 flex-col gap-2">

          <label htmlFor={ids.governorate} className={labelClass}>
            Gouvernorat <span aria-hidden>*</span>
          </label>
          <select
            id={ids.governorate}
            required
            value={values.governorate}
            onChange={(e) => onChange("governorate", e.target.value)}
            aria-invalid={errors.governorate ? true : undefined}
            aria-describedby={errors.governorate ? `${ids.governorate}-err` : undefined}
            className={inputClass}
          >
            <option value="">Sélectionner…</option>
            {TUNISIA_GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.governorate ? (
            <p id={`${ids.governorate}-err`} role="alert" className={errClass}>
              {errors.governorate}
            </p>
          ) : null}
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,140px)]">
          {field("city", "Ville / Délégation", {
            required: true,
            autoComplete: "address-level2",
          })}
          {field("postalCode", "Code postal", {
            autoComplete: "postal-code",
            inputMode: "numeric",
            placeholder: "1000",
          })}
        </div>
        {field("address", "Adresse", { required: true, autoComplete: "street-address" })}
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.note} className={labelClass}>
            Note de livraison (facultatif)
          </label>
          <textarea
            id={ids.note}
            rows={3}
            value={values.note}
            maxLength={500}
            onChange={(e) => onChange("note", e.target.value)}
            aria-invalid={errors.note ? true : undefined}
            aria-describedby={errors.note ? `${ids.note}-err` : undefined}
            className={`${inputClass} h-auto py-2`}
          />
          {errors.note ? (
            <p id={`${ids.note}-err`} role="alert" className={errClass}>
              {errors.note}
            </p>
          ) : null}
        </div>
      </fieldset>

      <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-4 text-sm text-[color:var(--color-foreground)]">
        <p className="font-medium">{PAYMENT_METHOD_LABEL}</p>
        <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          Vous réglez votre commande en espèces auprès du livreur.
        </p>
      </div>

      {serverError ? (
        <p
          id={ids.error}
          role="alert"
          aria-live="polite"
          className="rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] p-3 text-sm font-medium text-[color:var(--color-foreground)]"
        >
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Envoi en cours…" : "Confirmer la commande"}
      </button>
    </form>
  );
}

function OrderSummary({ totals }: { totals: ReturnType<typeof computeCheckoutTotals> }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
        Récapitulatif
      </h2>
      <ul className="mt-4 flex list-none flex-col gap-3">
        {totals.lines.map((l) => (
          <li key={l.productId} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[color:var(--color-foreground)]">
                {l.product.name}
              </p>
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                Quantité : {l.quantity}
                {l.promotionActive ? " · Promotion active" : ""}
              </p>
            </div>
            <p className="whitespace-nowrap text-sm font-semibold text-[color:var(--color-foreground)]">
              {formatPriceTND(l.lineMillimes)}
            </p>
          </li>
        ))}
      </ul>
      <dl className="mt-5 flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-[color:var(--color-muted-foreground)]">Sous-total</dt>
          <dd className="font-medium text-[color:var(--color-foreground)]">
            {formatPriceTND(totals.subtotalMillimes)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-[color:var(--color-muted-foreground)]">Livraison</dt>
          <dd className="font-medium text-[color:var(--color-foreground)]">
            {totals.freeShipping ? "Offerte" : formatPriceTND(totals.shippingMillimes)}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-[color:var(--color-border)] pt-3">
          <dt className="text-base font-semibold text-[color:var(--color-foreground)]">Total</dt>
          <dd className="text-base font-semibold text-[color:var(--color-foreground)]">
            {formatPriceTND(totals.totalMillimes)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-[color:var(--color-muted-foreground)]">
        Montants indicatifs — recalculés à la validation par notre équipe.
      </p>
    </div>
  );
}
