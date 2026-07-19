import { createFileRoute } from "@tanstack/react-router";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/conditions-generales-vente")({
  head: () => ({
    meta: [
      { title: "Conditions générales de vente | La Maison des Montres" },
      {
        name: "description",
        content:
          "Document provisoire des conditions générales de vente de La Maison des Montres.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: TermsPage,
});

const TODO = "[À compléter avant publication]";

type Section = { id: string; title: string };

const SECTIONS: Section[] = [
  { id: "identite", title: "Identité du vendeur" },
  { id: "champ", title: "Champ d’application" },
  { id: "produits", title: "Produits" },
  { id: "prix", title: "Prix" },
  { id: "promotions", title: "Promotions" },
  { id: "commande", title: "Commande" },
  { id: "confirmation", title: "Confirmation par téléphone" },
  { id: "paiement", title: "Paiement" },
  { id: "livraison", title: "Livraison" },
  { id: "reception", title: "Réception et refus du colis" },
  { id: "retours", title: "Retours et échanges" },
  { id: "garanties", title: "Garanties" },
  { id: "donnees", title: "Données personnelles" },
  { id: "responsabilite", title: "Responsabilité" },
  { id: "droit", title: "Droit applicable et règlement des différends" },
  { id: "contact", title: "Contact" },
];

function Todo({ label }: { label?: string }) {
  return (
    <span className="inline-block rounded-sm bg-[color:var(--color-surface-cream)] px-1.5 py-0.5 font-mono text-[0.85em] text-[color:var(--color-muted-foreground)]">
      {label ?? TODO}
    </span>
  );
}

function TermsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="t-h1 text-[color:var(--color-foreground)]">
            Conditions générales de vente
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
            Date de mise à jour : <Todo label="[Date de mise à jour à compléter]" />
          </p>

          <div
            role="note"
            className="mt-6 rounded-[var(--radius-md)] border border-[color:var(--color-gold)] bg-[color:var(--color-surface-cream)] p-4 text-sm text-[color:var(--color-foreground)]"
          >
            <strong className="font-semibold">Document provisoire</strong> — informations
            juridiques à compléter et à valider avant publication commerciale.
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
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
              <Section id="identite" title="1. Identité du vendeur">
                <ul className="ml-5 list-disc space-y-1">
                  <li>Raison sociale : <Todo /></li>
                  <li>Forme juridique : <Todo /></li>
                  <li>Adresse : <Todo /></li>
                  <li>Matricule fiscal : <Todo /></li>
                  <li>Registre national des entreprises : <Todo /></li>
                  <li>Téléphone : <Todo /></li>
                  <li>E-mail : <Todo /></li>
                </ul>
              </Section>

              <Section id="champ" title="2. Champ d’application">
                <p>
                  Les présentes conditions régissent les ventes conclues sur le site La Maison des
                  Montres avec des clients situés en Tunisie. Toute commande implique l’acceptation
                  sans réserve des présentes conditions.
                </p>
              </Section>

              <Section id="produits" title="3. Produits">
                <p>
                  Les produits proposés sont des montres présentées avec leurs caractéristiques
                  essentielles. Les visuels sont fournis à titre indicatif et peuvent présenter de
                  légères variations liées à l’affichage.
                </p>
              </Section>

              <Section id="prix" title="4. Prix">
                <p>
                  Les prix sont affichés en dinars tunisiens (TND) et sont indiqués toutes taxes
                  comprises (TTC). Les frais de livraison éventuels sont indiqués séparément avant
                  la validation de la commande.
                </p>
              </Section>

              <Section id="promotions" title="5. Promotions">
                <p>
                  Certaines montres peuvent être proposées à un prix promotionnel pendant une
                  période définie par une date de début et une date de fin. À l’expiration de la
                  promotion, le prix revient automatiquement au prix normal.
                </p>
              </Section>

              <Section id="commande" title="6. Commande">
                <p>
                  Le client sélectionne les produits, renseigne ses coordonnées de livraison et
                  valide sa commande. Le client ne peut pas annuler lui-même sa commande depuis le
                  site. Toute demande de modification ou d’annulation doit être formulée lors de
                  l’appel de confirmation. <Todo />
                </p>
              </Section>

              <Section id="confirmation" title="7. Confirmation par téléphone">
                <p>
                  Chaque commande fait l’objet d’un appel téléphonique afin de confirmer les
                  produits, l’adresse de livraison et les coordonnées du client. La commande n’est
                  considérée comme confirmée qu’après cet échange.
                </p>
              </Section>

              <Section id="paiement" title="8. Paiement">
                <p>
                  Le paiement s’effectue à la livraison, en espèces auprès du transporteur, au
                  moment de la remise du colis.
                </p>
              </Section>

              <Section id="livraison" title="9. Livraison">
                <p>
                  La livraison est assurée dans les 24 gouvernorats de Tunisie. Le délai estimé est
                  de 2 à 3 jours ouvrés à compter de la confirmation téléphonique. Les frais de
                  livraison sont identiques pour tous les gouvernorats et sont configurables ; un
                  seuil de livraison gratuite peut être appliqué. Les montants en vigueur sont
                  affichés avant la validation de la commande.
                </p>
              </Section>

              <Section id="reception" title="10. Réception et refus du colis">
                <p>
                  Le client est invité à vérifier l’état du colis à la réception. Les modalités
                  précises de refus du colis sont à compléter : <Todo />
                </p>
              </Section>

              <Section id="retours" title="11. Retours et échanges">
                <ul className="ml-5 list-disc space-y-1">
                  <li>Droit et délai de rétractation : <Todo /></li>
                  <li>Procédure de retour : <Todo /></li>
                  <li>Frais de retour : <Todo /></li>
                  <li>Procédure d’échange : <Todo /></li>
                </ul>
              </Section>

              <Section id="garanties" title="12. Garanties">
                <p>Politique de garantie générale : <Todo /></p>
              </Section>

              <Section id="donnees" title="13. Données personnelles">
                <p>
                  Les données collectées sont utilisées pour le traitement des commandes et la
                  livraison. Les modalités détaillées seront précisées dans la politique de
                  confidentialité : <Todo />
                </p>
              </Section>

              <Section id="responsabilite" title="14. Responsabilité">
                <p>Responsabilités précises : <Todo /></p>
              </Section>

              <Section id="droit" title="15. Droit applicable et règlement des différends">
                <ul className="ml-5 list-disc space-y-1">
                  <li>Juridiction compétente : <Todo /></li>
                  <li>Médiation : <Todo /></li>
                </ul>
              </Section>

              <Section id="contact" title="16. Contact">
                <p>
                  Pour toute question relative aux présentes conditions, le formulaire de contact
                  du site est disponible sur la page{" "}
                  <a
                    href="/contact"
                    className="underline decoration-[color:var(--color-gold)] underline-offset-4 hover:text-[color:var(--color-gold)]"
                  >
                    Contact
                  </a>
                  .
                </p>
              </Section>

              <p className="mt-10">
                <a
                  href="#content"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  Retour en haut
                </a>
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
    <section id={id} className="scroll-mt-24 border-t border-[color:var(--color-border)] py-6 first:border-t-0 first:pt-0">
      <h2 className="t-h3 mb-3 text-[color:var(--color-foreground)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
