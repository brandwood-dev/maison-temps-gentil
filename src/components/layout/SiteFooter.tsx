import { ChevronDown, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import {
  FOOTER_HELP_LINKS,
  FOOTER_INFO_LINKS,
  getFooterShopLinks,
} from "@/config/nav";
import { useCatalogCategories } from "@/lib/catalog-products";
import { useSiteSettings } from "@/lib/site-settings";

type Col = { title: string; links: readonly { readonly label: string; readonly href: string }[] };

function LinkList({ links }: { links: Col["links"] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="text-sm text-white/70 transition-colors hover:text-[color:var(--color-gold)]"
          >
            {link.label}
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
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-white"
      >
        {col.title}
        <ChevronDown
          className={open ? "h-4 w-4 rotate-180 transition-transform" : "h-4 w-4 transition-transform"}
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
  const { identity, support } = useSiteSettings();
  const cols: Col[] = [
    { title: "Boutique", links: getFooterShopLinks(categories) },
    { title: "Aide", links: FOOTER_HELP_LINKS },
    { title: "Informations", links: FOOTER_INFO_LINKS },
  ];
  const tagline =
    identity.tagline || "Une sélection soignée pour chaque style et chaque occasion.";

  return (
    <footer className="on-dark bg-[color:var(--color-primary)] text-white">
      <div className="container-page py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2.4fr_1.4fr] md:gap-12">
          <div>
            <Logo variant="light" height={36} src={identity.logoUrl} alt={identity.name} />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              {identity.name} — {tagline}
              <br />
              Livraison partout en Tunisie.
            </p>
            {(support.email || support.phone || support.whatsapp) && (
              <div className="mt-4 space-y-1 text-xs text-white/60">
                {support.email && (
                  <a className="block hover:text-white" href={"mailto:" + support.email}>
                    {support.email}
                  </a>
                )}
                {support.phone && (
                  <a className="block hover:text-white" href={"tel:" + support.phone}>
                    {support.phone}
                  </a>
                )}
                {support.whatsapp && (
                  <a
                    className="block hover:text-white"
                    href={"https://wa.me/" + support.whatsapp.replace(/[^0-9]/g, "")}
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            )}
            <div className="mt-5 flex items-center gap-2">
              <span className="sr-only">Réseaux sociaux</span>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/15 text-white/80 transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/15 text-white/80 transition-colors hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          <div className="hidden grid-cols-3 gap-8 md:grid">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-sm font-semibold text-white">{col.title}</p>
                <LinkList links={col.links} />
              </div>
            ))}
          </div>

          <div className="md:hidden">
            {cols.map((col) => (
              <MobileCol key={col.title} col={col} />
            ))}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Newsletter</p>
            <p className="mb-4 text-sm text-white/70">
              Recevez les nouveautés et offres de {identity.name}.
            </p>
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-2 sm:flex-row" noValidate>
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
                S'inscrire
              </button>
            </form>
            <p className="mt-2 text-[11px] leading-relaxed text-white/50">
              En vous inscrivant, vous acceptez de recevoir nos communications.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {identity.name}. Tous droits réservés.</p>
          <p>
            Developed by{" "}
            <a
              href="https://www.brandwoodandco.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-[color:var(--color-gold)]"
            >
              Brandwood &amp; Co
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
