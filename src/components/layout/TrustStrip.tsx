import { Truck, PackageCheck, Wallet, ShieldCheck, Headset } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type Item = { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; text: string };

const ITEMS: Item[] = [
  { icon: Truck, title: "Livraison Tunisie", text: "Partout dans le pays" },
  { icon: PackageCheck, title: "Sous 2 à 3 jours", text: "Expédition rapide" },
  { icon: Wallet, title: "Paiement livraison", text: "Payez à réception" },
  { icon: ShieldCheck, title: "Garantie", text: "Sur toutes les montres" },
  { icon: Headset, title: "Assistance", text: "Une équipe à l’écoute" },
];

function TrustItem({ item }: { item: Item }) {
  return (
    <>
      <item.icon
        className="h-5 w-5 shrink-0 text-[color:var(--color-gold)] md:mt-0.5 md:h-6 md:w-6"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[13px] leading-tight font-semibold whitespace-nowrap md:whitespace-normal">
          {item.title}
        </p>
        <p className="text-xs whitespace-nowrap text-[color:var(--color-muted-foreground)] md:whitespace-normal">
          {item.text}
        </p>
      </div>
    </>
  );
}

export function TrustStrip({ items = ITEMS }: { items?: Item[] }) {
  return (
    <section aria-label="Nos engagements" className="bg-[color:var(--color-surface-cream)]">
      {/* Mobile : carrousel horizontal automatique */}
      <div className="marquee-mask relative py-5 md:hidden">
        <div className="marquee-track flex w-max gap-6 pl-4">
          <ul className="flex shrink-0 items-center gap-6">
            {items.map((it) => (
              <li key={it.title} className="flex items-center gap-3">
                <TrustItem item={it} />
              </li>
            ))}
          </ul>
          <ul aria-hidden className="flex shrink-0 items-center gap-6">
            {items.map((it) => (
              <li key={`dup-${it.title}`} className="flex items-center gap-3">
                <TrustItem item={it} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tablette / desktop : grille */}
      <div className="container-page hidden py-6 md:block md:py-8">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
          {items.map((it) => (
            <li key={it.title} className="flex items-start gap-3">
              <TrustItem item={it} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
