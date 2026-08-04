import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Todo, type LegalSection } from "@/components/legal/LegalLayout";

const TITLE = "Garantie | La Maison des Montres";
const DESC =
  "Étendue de la garantie de nos montres, durée indiquée par produit, exclusions, pièces d’usure et procédure à suivre pour une prise en charge.";

export const Route = createFileRoute("/garantie")({
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
  component: WarrantyPage,
});

const SECTIONS: readonly LegalSection[] = [
  {
    id: "etendue",
    title: "Étendue de la garantie",
    content: (
      <p>
        Nos montres sont garanties contre les défauts de fabrication affectant le mouvement et les
        composants d’origine. La garantie s’applique dans le cadre d’un usage normal, conforme aux
        recommandations du fabricant.
      </p>
    ),
  },
  {
    id: "duree",
    title: "Durée",
    content: (
      <p>
        La durée de garantie applicable est indiquée sur la fiche de chaque produit. Durée standard
        retenue par La Maison des Montres : <Todo />
      </p>
    ),
  },
  {
    id: "exclusions",
    title: "Ce qui n’est pas couvert",
    content: (
      <ul className="ml-5 list-disc space-y-1">
        <li>Rayures, chocs, écrasements et usure normale du boîtier et du bracelet.</li>
        <li>
          Dommages liés à l’eau lorsque l’étanchéité du modèle n’est pas prévue pour cet usage.
        </li>
        <li>Interventions réalisées par un tiers non agréé.</li>
        <li>Pièces d’usure : bracelet, verre, pile, joints.</li>
      </ul>
    ),
  },
  {
    id: "pile",
    title: "Pile et entretien",
    content: (
      <p>
        Le remplacement de la pile et l’entretien courant restent à votre charge. Recommandations
        d’entretien détaillées : <Todo />
      </p>
    ),
  },
  {
    id: "procedure",
    title: "Faire jouer la garantie",
    content: (
      <>
        <ol className="ml-5 list-decimal space-y-1">
          <li>Contactez-nous via la page Contact en indiquant votre numéro de commande.</li>
          <li>Décrivez le défaut constaté et joignez si possible des photos.</li>
          <li>Nous vous indiquons la marche à suivre pour l’envoi ou la remise de la montre.</li>
          <li>Après diagnostic, la montre est réparée, échangée ou remboursée selon le cas.</li>
        </ol>
        <p>
          Délai moyen de traitement et adresse de retour : <Todo />
        </p>
      </>
    ),
  },
  {
    id: "liens",
    title: "Informations liées",
    content: (
      <p>
        Consultez également la page{" "}
        <a
          href="/livraison-retours"
          className="underline decoration-[color:var(--color-gold)] underline-offset-4 hover:text-[color:var(--color-gold)]"
        >
          Livraison et retours
        </a>{" "}
        et les{" "}
        <a
          href="/conditions-generales-vente"
          className="underline decoration-[color:var(--color-gold)] underline-offset-4 hover:text-[color:var(--color-gold)]"
        >
          conditions générales de vente
        </a>
        .
      </p>
    ),
  },
];

function WarrantyPage() {
  return (
    <LegalLayout
      title="Garantie"
      intro="Chaque montre vendue par La Maison des Montres bénéficie d’une garantie contre les défauts de fabrication, dont la durée est précisée sur la fiche produit."
      sections={SECTIONS}
    />
  );
}
