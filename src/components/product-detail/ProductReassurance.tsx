import { Truck, Phone, ShieldCheck, Gift, Banknote } from "lucide-react";
import type { Product } from "@/types/product";

type Props = { product: Product };

/**
 * Reassurance list — only rules validated by the client are shown.
 * No return policy, no "authentique", no "jours ouvrés", no fallback
 * "Garantie officielle". Conditional lines are hidden when data is missing.
 */
export function ProductReassurance({ product }: Props) {
  return (
    <ul className="mt-2 grid list-none gap-3 border-t border-[color:var(--color-border)] pt-5 sm:grid-cols-2">
      <Item
        icon={<Banknote className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
        label="Paiement à la livraison"
      />
      <Item
        icon={<Truck className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
        label="Livraison partout en Tunisie"
        hint="Délai estimé : 2 à 3 jours"
      />
      <Item
        icon={<Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
        label="Confirmation de la commande par téléphone"
      />
      {typeof product.warrantyMonths === "number" && product.warrantyMonths > 0 ? (
        <Item
          icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
          label={`Garantie ${product.warrantyMonths} mois`}
        />
      ) : null}
      {product.giftBoxIncluded ? (
        <Item
          icon={<Gift className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
          label="Coffret cadeau inclus"
        />
      ) : null}
    </ul>
  );
}

function Item({ icon, label, hint }: { icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-surface-cream)] text-[color:var(--color-foreground)]">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-[color:var(--color-foreground)]">{label}</span>
        {hint ? (
          <span className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</span>
        ) : null}
      </span>
    </li>
  );
}
