import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Todo, type LegalSection } from "@/components/legal/LegalLayout";

const TITLE = "Politique de cookies | La Maison des Montres";
const DESC =
  "Types de cookies et stockage local utilisés sur le site, finalités, durées et moyens de contrôler vos préférences depuis votre navigateur.";

export const Route = createFileRoute("/politique-cookies")({
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
  component: CookiesPage,
});

const SECTIONS: readonly LegalSection[] = [
  {
    id: "definition",
    title: "Qu’est-ce qu’un cookie ?",
    content: (
      <p>
        Un cookie est un petit fichier déposé sur votre appareil lors de la visite d’un site. Nous
        utilisons également le stockage local du navigateur, qui remplit un rôle comparable pour
        mémoriser certaines préférences.
      </p>
    ),
  },
  {
    id: "necessaires",
    title: "Cookies et stockage strictement nécessaires",
    content: (
      <>
        <p>Ils sont indispensables au fonctionnement du site et ne peuvent pas être désactivés :</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Mémorisation du contenu de votre panier.</li>
          <li>Mémorisation de vos favoris sur cet appareil.</li>
          <li>Sécurité et bon affichage des pages.</li>
        </ul>
      </>
    ),
  },
  {
    id: "mesure",
    title: "Mesure d’audience",
    content: (
      <p>
        Si un outil de mesure d’audience est activé, il sert uniquement à comprendre l’usage du site
        de façon agrégée. Outil utilisé et durée de conservation : <Todo />
      </p>
    ),
  },
  {
    id: "marketing",
    title: "Cookies marketing",
    content: (
      <p>
        Aucun cookie publicitaire n’est déposé sans votre accord préalable. Traceurs marketing
        éventuellement utilisés : <Todo />
      </p>
    ),
  },
  {
    id: "gestion",
    title: "Gérer vos préférences",
    content: (
      <p>
        Vous pouvez à tout moment supprimer les cookies et le stockage local depuis les réglages de
        votre navigateur. La suppression peut entraîner la perte de votre panier et de vos favoris
        enregistrés sur cet appareil.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Questions",
    content: (
      <p>
        Pour toute question relative aux cookies, contactez-nous via la page Contact. Voir aussi
        notre{" "}
        <a
          href="/politique-confidentialite"
          className="underline decoration-[color:var(--color-gold)] underline-offset-4 hover:text-[color:var(--color-gold)]"
        >
          politique de confidentialité
        </a>
        .
      </p>
    ),
  },
];

function CookiesPage() {
  return (
    <LegalLayout
      title="Politique de cookies"
      intro="Nous limitons les traceurs au strict nécessaire : panier, favoris et bon fonctionnement du site."
      updated="Document provisoire — dernière mise à jour à confirmer avant publication."
      sections={SECTIONS}
    />
  );
}
