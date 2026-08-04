import { createFileRoute } from "@tanstack/react-router";
import { Truck, MapPin, Banknote, Phone, PackageCheck, RotateCcw } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/livraison-retours")({
  head: () => ({
    meta: [
      { title: "Livraison et retours | La Maison des Montres" },
      {
        name: "description",
        content:
          "Délais, frais et zones de livraison partout en Tunisie, paiement à la livraison, réception du colis et modalités de retour ou d’échange.",
      },
      { property: "og:title", content: "Livraison et retours | La Maison des Montres" },
      {
        property: "og:description",
        content:
          "Livraison dans les 24 gouvernorats sous 2 à 3 jours, paiement à la livraison et modalités de retour.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: ShippingReturnsPage,
});

const TODO = "[À compléter avant publication]";

function Todo({ label }: { label?: string }) {
  return (
    <span className="inline-block rounded-sm bg-[color:var(--color-surface-cream)] px-1.5 py-0.5 font-mono text-[0.85em] text-[color:var(--color-muted-foreground)]">
      {label ?? TODO}
    </span>
  );
}

const HIGHLIGHTS = [
  {
    icon: Truck,
    title: "Délai estimé 2 à 3 jours",
    text: "À compter de la confirmation téléphonique de votre commande.",
  },
  {
    icon: MapPin,
    title: "24 gouvernorats",
    text: "Livraison assurée partout en Tunisie par notre transporteur partenaire.",
  },
  {
    icon: Banknote,
    title: "Paiement à la livraison",
    text: "Vous réglez en espèces au moment de la remise du colis.",
  },
] as const;

const SECTIONS = [
  { id: "zones", title: "Zones et délais de livraison" },
  { id: "frais", title: "Frais de livraison" },
  { id: "suivi", title: "Confirmation et suivi de commande" },
  { id: "reception", title: "Réception du colis" },
  { id: "retours", title: "Retours et échanges" },
  { id: "garantie", title: "Garantie" },
] as const;

function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="t-h1 text-[color:var(--color-foreground)]">Livraison et retours</h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-[color:var(--color-muted-foreground)]">
            Toutes les informations utiles pour recevoir votre montre en toute sérénité : zones
            desservies, délais, frais, paiement à la livraison et modalités de retour.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
                  <h.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-3 text-sm font-semibold text-[color:var(--color-foreground)]">
                  {h.title}
                </p>
                <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{h.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside aria-label="Table des matières" className="lg:sticky lg:top-24 lg:self-start">
              <nav>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
                  Sommaire
                </p>
                <ol className="flex flex-col gap-1.5 text-sm">
                  {SECTIONS.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="rounded-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                      >
                        {i + 1}. {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <article className="max-w-[70ch] text-[15px] leading-relaxed text-[color:var(--color-foreground)]">
              <Section id="zones" title="1. Zones et délais de livraison">
                <p>
                  Nous livrons dans les 24 gouvernorats de Tunisie. Le délai estimé est de 2 à 3
                  jours à compter de la confirmation téléphonique de votre commande. Ce délai est
                  indicatif et peut varier selon la zone de livraison et la disponibilité du
                  transporteur.
                </p>
              </Section>

              <Section id="frais" title="2. Frais de livraison">
                <p>
                  Les frais de livraison sont identiques pour tous les gouvernorats et sont affichés
                  clairement avant la validation de la commande, dans le récapitulatif du panier et
                  du checkout.
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    Un seuil de livraison gratuite peut s’appliquer sur les commandes éligibles.
                  </li>
                  <li>
                    Montant exact des frais et seuil en vigueur : <Todo />
                  </li>
                </ul>
              </Section>

              <Section id="suivi" title="3. Confirmation et suivi de commande">
                <p>
                  Chaque commande fait l’objet d’un appel téléphonique afin de confirmer les
                  produits, l’adresse et vos coordonnées. La préparation démarre uniquement après
                  cet échange.
                </p>
                <p>
                  Vous pouvez consulter l’avancement de votre commande depuis la page{" "}
                  <a
                    href="/suivi-commande"
                    className="underline decoration-[color:var(--color-gold)] underline-offset-4 hover:text-[color:var(--color-gold)]"
                  >
                    Suivre ma commande
                  </a>
                  .
                </p>
              </Section>

              <Section id="reception" title="4. Réception du colis">
                <p>
                  Le paiement s’effectue à la livraison, en espèces, auprès du transporteur au
                  moment de la remise du colis. Nous vous invitons à vérifier l’état extérieur du
                  colis en présence du livreur.
                </p>
                <p>
                  Modalités précises de refus du colis à la réception : <Todo />
                </p>
              </Section>

              <Section id="retours" title="5. Retours et échanges">
                <p>
                  Les conditions de retour et d’échange sont en cours de validation. Elles seront
                  publiées ici dès leur confirmation définitive.
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    Délai de retour : <Todo />
                  </li>
                  <li>
                    Procédure de retour : <Todo />
                  </li>
                  <li>
                    Frais de retour : <Todo />
                  </li>
                  <li>
                    Procédure d’échange : <Todo />
                  </li>
                  <li>
                    Modalités de remboursement : <Todo />
                  </li>
                </ul>
              </Section>

              <Section id="garantie" title="6. Garantie">
                <p>
                  Lorsque la garantie est applicable, sa durée est indiquée sur la fiche du produit
                  concerné. Détails de la politique de garantie générale : <Todo />
                </p>
              </Section>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/montres"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  <PackageCheck className="mr-2 h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Découvrir les montres
                </a>
                <a
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  <Phone className="mr-2 h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Nous contacter
                </a>
              </div>

              <p className="mt-6 flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                Informations susceptibles d’évoluer, les conditions applicables sont celles en
                vigueur au moment de la commande.
              </p>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-[color:var(--color-border)] py-6 first:border-t-0 first:pt-0"
    >
      <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)] md:text-xl">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
