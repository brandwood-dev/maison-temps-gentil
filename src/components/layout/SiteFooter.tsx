import { ChevronDown, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import {
  FOOTER_SHOP_LINKS,
  FOOTER_HELP_LINKS,
  FOOTER_INFO_LINKS,
  getFooterShopLinks,
} from "@/config/nav";
import { useCatalogCategories } from "@/lib/catalog-products";

type Col = { title: string; links: readonly { readonly label: string; readonly href: string }[] };

const COLS: Col[] = [
  { title: "Boutique", links: FOOTER_SHOP_LINKS },
  { title: "Aide", links: FOOTER_HELP_LINKS },
  { title: "Informations", links: FOOTER_INFO_LINKS },
];

function LinkList({ links }: { links: Col["links"] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            className="text-sm text-white/70 transition-colors hover:text-[color:var(--color-gold)]"
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
function MobileCol({ col }: { col: Col }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-white"
      >
        {col.title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="pb-4">
          <LinkList links={col.links} />
        </div>
      )}
    </div>
  );
}

export function SiteFooter() {
  const categories = useCatalogCategories();
  const cols: Col[] = [
    { title: "Boutique", links: getFooterShopLinks(categories) },
    ...COLS.slice(1),
  ];

  return (
    <footer className="on-dark bg-[color:var(--color-primary)] text-white">
      <div className="container-page py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2.4fr_1.4fr] md:gap-12">
          <div>
            <Logo variant="light" height={36} />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              La Maison des Montres ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â une
              sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©lection soignÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©e pour chaque style et chaque
              occasion. Livraison partout en Tunisie.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="sr-only">RÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©seaux sociaux</span>
              <a
                href="#"
                aria-label="Instagram (ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â  renseigner)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/15 text-white/80 transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a
                href="#"
                aria-label="Facebook (ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â  renseigner)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/15 text-white/80 transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* Desktop columns */}
          <div className="hidden grid-cols-3 gap-8 md:grid">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="mb-4 text-sm font-semibold text-white">{c.title}</p>
                <LinkList links={c.links} />
              </div>
            ))}
          </div>

          {/* Mobile accordions */}
          <div className="md:hidden">
            {cols.map((c) => (
              <MobileCol key={c.title} col={c} />
            ))}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Newsletter</p>
            <p className="mb-4 text-sm text-white/70">
              Recevez les nouveautÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s et offres de La Maison des Montres.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2 sm:flex-row"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Votre e-mail"
                className="h-12 min-w-0 flex-1 rounded-[var(--radius-md)] border border-white/15 bg-white/5 px-4 py-3 text-sm leading-normal text-white placeholder:text-white/40 focus:border-[color:var(--color-gold)] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-gold)] px-5 text-sm font-semibold text-[color:var(--color-gold-foreground)] hover:brightness-95"
              >
                SÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢inscrire
              </button>
            </form>
            <p className="mt-2 text-[11px] leading-relaxed text-white/50">
              En vous inscrivant, vous acceptez de recevoir nos communications. Vous pouvez vous En
              vous inscrivant, vous acceptez de recevoir nos communications. Vous pouvez vous
              désinscrire à tout moment.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>
            ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© {new Date().getFullYear()} La Maison des Montres. Tous droits
            rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©servÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©s.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://www.brandwoodandco.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-[color:var(--color-gold)]"
            >
              Brandwood & Co
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
