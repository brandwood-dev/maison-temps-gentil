import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Todo, type LegalSection } from "@/components/legal/LegalLayout";

const TITLE = "Mentions légales | La Maison des Montres";
const DESC =
  "Éditeur du site, coordonnées, hébergement, propriété intellectuelle, responsabilité et droit applicable pour La Maison des Montres en Tunisie.";

export const Route = createFileRoute("/mentions-legales")({
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
  component: LegalNoticePage,
});

const SECTIONS: readonly LegalSection[] = [
  {
    id: "editeur",
    title: "Éditeur du site",
    content: (
      <ul className="ml-5 list-disc space-y-1">
        <li>
          Dénomination : <Todo />
        </li>
        <li>
          Forme juridique et capital : <Todo />
        </li>
        <li>
          Siège social : <Todo />
        </li>
        <li>
          Identifiant fiscal / registre : <Todo />
        </li>
        <li>
          Responsable de la publication : <Todo />
        </li>
      </ul>
    ),
  },
  {
    id: "contact",
    title: "Coordonnées",
    content: (
      <p>
        Téléphone, e-mail et horaires de contact : <Todo />. Vous pouvez également utiliser le
        formulaire de la page Contact.
      </p>
    ),
  },
  {
    id: "hebergement",
    title: "Hébergement",
    content: (
      <p>
        Le site est hébergé par un prestataire d’infrastructure cloud. Nom et coordonnées de
        l’hébergeur : <Todo />
      </p>
    ),
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    content: (
      <p>
        L’ensemble des éléments du site (textes, mise en page, identité visuelle, photographies)
        est protégé. Les marques et visuels des fabricants restent la propriété de leurs titulaires
        respectifs. Toute reproduction sans autorisation écrite est interdite.
      </p>
    ),
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    content: (
      <p>
        Nous apportons le plus grand soin aux informations produits publiées. Des erreurs ou des
        écarts de rendu des couleurs à l’écran peuvent néanmoins subsister ; ils n’engagent pas
        notre responsabilité au-delà des conditions prévues par les conditions générales de vente.
      </p>
    ),
  },
  {
    id: "droit",
    title: "Droit applicable",
    content: (
      <p>
        Le site et les commandes qui y sont passées sont régis par le droit tunisien. Juridiction
        compétente en cas de litige : <Todo />
      </p>
    ),
  },
];

function LegalNoticePage() {
  return (
    <LegalLayout
      title="Mentions légales"
      intro="Informations légales relatives à l’édition, l’hébergement et l’exploitation du site La Maison des Montres."
      updated="Document provisoire — informations d’identification à compléter avant publication."
      sections={SECTIONS}
    />
  );
}
