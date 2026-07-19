import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

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
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ref = orderReference.trim();
    const tel = phone.trim();
    if (!ref || !tel) {
      setNotice(null);
      setError("Veuillez renseigner la référence de commande et le numéro de téléphone.");
      return;
    }
    setError(null);
    setNotice("Le service de suivi sera connecté lors de l’intégration du backend.");
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
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
            >
              Suivre ma commande
            </button>
          </form>

          <div aria-live="polite" className="mt-4 min-h-[1.5rem]">
            {notice ? (
              <p className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                {notice}
              </p>
            ) : null}
          </div>

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
