import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const TITLE = "FAQ — Questions fréquentes | La Maison des Montres";
const DESC =
  "Réponses aux questions les plus fréquentes : commande, paiement à la livraison, délais en Tunisie, suivi, garantie, retours et authenticité des montres.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: FaqPage,
});

type Item = { q: string; a: string };
type Group = { id: string; title: string; items: readonly Item[] };

const GROUPS: readonly Group[] = [
  {
    id: "commande",
    title: "Commande",
    items: [
      {
        q: "Comment passer une commande ?",
        a: "Ajoutez la montre au panier, puis renseignez vos coordonnées et votre adresse de livraison lors du checkout. Aucun compte n’est nécessaire.",
      },
      {
        q: "Ma commande est-elle confirmée immédiatement ?",
        a: "Nous vous appelons systématiquement pour confirmer les produits, l’adresse et vos coordonnées avant la préparation du colis.",
      },
      {
        q: "Puis-je modifier ou annuler ma commande ?",
        a: "Oui, tant que le colis n’a pas été remis au transporteur. Contactez-nous rapidement via la page Contact.",
      },
    ],
  },
  {
    id: "paiement",
    title: "Paiement",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Le paiement à la livraison en espèces est disponible partout en Tunisie. Vous réglez au livreur au moment de la remise du colis.",
      },
      {
        q: "Les prix affichés sont-ils en dinars ?",
        a: "Oui, tous les prix sont affichés en dinars tunisiens (TND), taxes comprises. Les frais de livraison sont indiqués avant validation.",
      },
    ],
  },
  {
    id: "livraison",
    title: "Livraison",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Le délai estimé est de 2 à 3 jours après la confirmation téléphonique, dans les 24 gouvernorats.",
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Depuis la page « Suivre ma commande », avec votre numéro de commande et votre téléphone.",
      },
    ],
  },
  {
    id: "produits",
    title: "Produits et garantie",
    items: [
      {
        q: "Vos montres sont-elles authentiques ?",
        a: "Oui. Chaque montre est neuve et livrée dans son emballage d’origine avec les documents fournis par la marque.",
      },
      {
        q: "Quelle garantie s’applique ?",
        a: "La durée de garantie est indiquée sur la fiche de chaque produit. Les détails figurent sur la page Garantie.",
      },
      {
        q: "Puis-je retourner une montre ?",
        a: "Les modalités de retour et d’échange sont détaillées sur la page Livraison et retours.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="t-h1 text-[color:var(--color-foreground)]">Questions fréquentes</h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-[color:var(--color-muted-foreground)]">
            Commande, paiement à la livraison, délais, garantie : retrouvez ici l’essentiel. Si vous
            ne trouvez pas votre réponse, notre équipe reste joignable.
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside aria-label="Table des matières" className="lg:sticky lg:top-24 lg:self-start">
              <nav>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
                  Rubriques
                </p>
                <ol className="flex flex-col gap-1.5 text-sm">
                  {GROUPS.map((g, i) => (
                    <li key={g.id}>
                      <a
                        href={`#${g.id}`}
                        className="rounded-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                      >
                        {i + 1}. {g.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="max-w-[70ch]">
              {GROUPS.map((g) => (
                <section
                  key={g.id}
                  id={g.id}
                  className="scroll-mt-24 border-t border-[color:var(--color-border)] py-6 first:border-t-0 first:pt-0"
                >
                  <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)] md:text-xl">
                    {g.title}
                  </h2>
                  <div className="divide-y divide-[color:var(--color-border)]">
                    {g.items.map((it) => (
                      <details key={it.q} className="group py-3">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[color:var(--color-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]">
                          {it.q}
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-[color:var(--color-muted-foreground)] transition-transform group-open:rotate-180"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </summary>
                        <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-muted-foreground)]">
                          {it.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              ))}

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  Poser une question
                </a>
                <a
                  href="/suivi-commande"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  Suivre ma commande
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
