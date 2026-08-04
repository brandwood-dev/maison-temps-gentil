import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Todo, type LegalSection } from "@/components/legal/LegalLayout";

const TITLE = "Politique de confidentialité | La Maison des Montres";
const DESC =
  "Données collectées lors de vos commandes, finalités, durées de conservation, destinataires et vos droits sur vos informations personnelles.";

export const Route = createFileRoute("/politique-confidentialite")({
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
  component: PrivacyPage,
});

const SECTIONS: readonly LegalSection[] = [
  {
    id: "responsable",
    title: "Responsable du traitement",
    content: (
      <p>
        La Maison des Montres est responsable du traitement des données collectées sur ce site.
        Identité juridique, adresse et coordonnées de contact : <Todo />
      </p>
    ),
  },
  {
    id: "donnees",
    title: "Données collectées",
    content: (
      <>
        <p>Nous collectons uniquement les données nécessaires au traitement de vos commandes :</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Identité : nom et prénom.</li>
          <li>Coordonnées : numéro de téléphone, adresse de livraison, gouvernorat, e-mail.</li>
          <li>Commande : produits, quantités, montants, mode de paiement à la livraison.</li>
          <li>Données techniques : informations de navigation strictement nécessaires au site.</li>
        </ul>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Finalités du traitement",
    content: (
      <ul className="ml-5 list-disc space-y-1">
        <li>Traiter, confirmer par téléphone et livrer vos commandes.</li>
        <li>Assurer le service client, le suivi de commande et la garantie.</li>
        <li>Vous envoyer nos actualités si vous vous êtes inscrit à la newsletter.</li>
        <li>Améliorer le fonctionnement et la sécurité du site.</li>
      </ul>
    ),
  },
  {
    id: "conservation",
    title: "Durée de conservation",
    content: (
      <p>
        Les données de commande sont conservées le temps nécessaire à l’exécution du contrat, au
        service après-vente et aux obligations légales applicables. Durées précises retenues :{" "}
        <Todo />
      </p>
    ),
  },
  {
    id: "destinataires",
    title: "Destinataires et sous-traitants",
    content: (
      <p>
        Vos données peuvent être transmises au transporteur chargé de la livraison et aux
        prestataires techniques nécessaires au fonctionnement du site. Elles ne sont jamais vendues.
        Liste des prestataires : <Todo />
      </p>
    ),
  },
  {
    id: "droits",
    title: "Vos droits",
    content: (
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos
        données. Pour l’exercer, écrivez-nous via la page Contact. Adresse dédiée aux demandes :{" "}
        <Todo />
      </p>
    ),
  },
  {
    id: "securite",
    title: "Sécurité",
    content: (
      <p>
        Nous mettons en œuvre des mesures raisonnables pour protéger vos données contre l’accès non
        autorisé, la perte ou la divulgation. Aucune transmission sur Internet ne peut toutefois
        être garantie comme totalement sûre.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <p>
        L’usage des cookies est détaillé dans notre{" "}
        <a
          href="/politique-cookies"
          className="underline decoration-[color:var(--color-gold)] underline-offset-4 hover:text-[color:var(--color-gold)]"
        >
          politique de cookies
        </a>
        .
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Nous traitons vos informations personnelles avec le même soin que nos montres : uniquement ce qui est nécessaire pour préparer, confirmer et livrer votre commande."
      updated="Document provisoire — dernière mise à jour à confirmer avant publication."
      sections={SECTIONS}
    />
  );
}
