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

export function TrustStrip({ items = ITEMS }: { items?: Item[] }) {
  return (
    <section aria-label="Nos engagements" className="bg-[color:var(--color-surface-cream)]">
      <div className="container-page py-6 md:py-8">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
          {items.map((it) => (
            <li key={it.title} className="flex items-start gap-3">
              <it.icon
                className="mt-0.5 h-6 w-6 shrink-0 text-[color:var(--color-gold)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-tight">{it.title}</p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
