import { Heart, Search, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { NAV_LINKS } from "@/config/nav";
import { SearchPanel } from "./SearchPanel";
import { MobileMenu } from "./MobileMenu";

type IconLinkProps = {
  label: string;
  onClick?: () => void;
  href?: string;
  badge?: number;
  children: React.ReactNode;
};

function IconAction({ label, onClick, href, badge, children }: IconLinkProps) {
  const cls =
    "relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)]";
  const content = (
    <>
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-[color:var(--color-gold)] px-1 text-center text-[10px] font-semibold leading-[18px] text-[color:var(--color-gold-foreground)]"
        >
          {badge}
        </span>
      )}
      <span className="sr-only">
        {label}
        {typeof badge === "number" && badge > 0 ? `, ${badge} article(s)` : ""}
      </span>
    </>
  );
  if (href) return <a href={href} aria-label={label} className={cls}>{content}</a>;
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {content}
    </button>
  );
}

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-background)]/80">
      {/* Mobile + tablette (< lg) */}
      <div className="container-page grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] hover:bg-[color:var(--color-surface-cream)]"
        >
          <MenuIcon />
        </button>
        <a
          href="/"
          aria-label="La Maison des Montres — Accueil"
          className="inline-flex min-w-0 items-center justify-center"
        >
          <Logo variant="dark" height={26} priority />
        </a>
        <div className="flex shrink-0 items-center">
          <IconAction label="Rechercher" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </IconAction>
          <IconAction label="Panier" href="/panier" badge={cartCount}>
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
          </IconAction>
        </div>
      </div>

      {/* Desktop (≥ lg) */}
      <div className="container-page hidden lg:block">
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="/" aria-label="La Maison des Montres — Accueil" className="inline-flex shrink-0">
            <Logo variant="dark" height={36} priority />
          </a>
          <nav aria-label="Navigation principale" className="min-w-0 flex-1">
            <ul className="flex items-center justify-center gap-3 lg:gap-5 xl:gap-7">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="whitespace-nowrap text-[13px] font-medium tracking-wide text-[color:var(--color-foreground)] transition-colors hover:text-[color:var(--color-gold)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <IconAction label="Rechercher" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </IconAction>
            <div className="flex items-center gap-1">
              <IconAction label="Favoris" href="/favoris">
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Suivre ma commande" href="/suivi">
                <Truck className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
            </div>
            <IconAction label="Panier" href="/panier" badge={cartCount}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            </IconAction>
          </div>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
