import { Heart, Search, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { getCategoryNavLinks } from "@/config/nav";
import { useFavorites } from "@/hooks/useFavorites";
import { getCartTotalQuantity, reconcileCart, useCart, useCartDrawer } from "@/lib/cart-store";
import { useCatalogCategories, useCatalogProducts } from "@/lib/catalog-products";
import { SearchPanel } from "./SearchPanel";
import { MobileMenu } from "./MobileMenu";
import { useSiteSettings } from "@/lib/site-settings";

type IconLinkProps = {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  if (href)
    return (
      <a href={href} aria-label={label} className={cls}>
        {content}
      </a>
    );
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {content}
    </button>
  );
}

function DesktopNav({ links }: { links: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Navigation principale">
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 xl:gap-x-7">
        {links.map((l) => (
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
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const { items, hydrated } = useCart();
  const { openDrawer } = useCartDrawer();
  const products = useCatalogProducts();
  useEffect(() => {
    // Do not wipe a cart while the catalog request is still unavailable. Once
    // products are present, remove lines that are no longer purchasable.
    if (!hydrated || products.length === 0) return;
    reconcileCart(products);
  }, [hydrated, products]);
  const cartCount = getCartTotalQuantity(items, products);
  const { ids: favoriteIds } = useFavorites();
  const favoriteCount = favoriteIds.length;
  const { identity } = useSiteSettings();
  const categories = useCatalogCategories();
  const navLinks = getCategoryNavLinks(categories);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    returnFocusRef.current = event.currentTarget;
    setMenuOpen(true);
  };
  const openSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
    returnFocusRef.current = event.currentTarget;
    setSearchOpen(true);
  };
  const restoreFocus = () => returnFocusRef.current?.focus();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-background)]/80">
        {/* Mobile + tablette (< lg) */}
        <div className="container-page grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={openMenu}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] hover:bg-[color:var(--color-surface-cream)]"
          >
            <MenuIcon />
          </button>
          <a
            href="/"
            aria-label="La Maison des Montres — Accueil"
            className="inline-flex min-w-0 items-center justify-center"
          >
            <Logo variant="dark" height={26} priority src={identity.logoUrl} alt={identity.name} />
          </a>
          <div className="flex shrink-0 items-center">
            <IconAction label="Rechercher" onClick={openSearch}>
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </IconAction>
            <IconAction label="Ouvrir mon panier" onClick={() => openDrawer()} badge={cartCount}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            </IconAction>
          </div>
        </div>

        {/* Desktop compact (lg → xl) : deux niveaux */}
        <div className="container-page hidden lg:block xl:hidden">
          <div className="flex h-16 items-center justify-between gap-4">
            <a
              href="/"
              aria-label="La Maison des Montres — Accueil"
              className="inline-flex shrink-0"
            >
              <Logo
                variant="dark"
                height={32}
                priority
                src={identity.logoUrl}
                alt={identity.name}
              />
            </a>
            <div className="flex shrink-0 items-center gap-1">
              <IconAction label="Rechercher" onClick={openSearch}>
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Favoris" href="/favoris" badge={favoriteCount}>
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Suivre ma commande" href="/suivi-commande">
                <Truck className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Ouvrir mon panier" onClick={() => openDrawer()} badge={cartCount}>
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
            </div>
          </div>
          <div className="border-t border-[color:var(--color-border)] py-2">
            <DesktopNav links={navLinks} />
          </div>
        </div>

        {/* Desktop premium (≥ xl) : une seule ligne */}
        <div className="container-page hidden xl:block">
          <div className="flex h-16 items-center justify-between gap-4">
            <a
              href="/"
              aria-label="La Maison des Montres — Accueil"
              className="inline-flex shrink-0"
            >
              <Logo
                variant="dark"
                height={36}
                priority
                src={identity.logoUrl}
                alt={identity.name}
              />
            </a>
            <div className="min-w-0 flex-1">
              <DesktopNav links={navLinks} />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <IconAction label="Rechercher" onClick={openSearch}>
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Favoris" href="/favoris" badge={favoriteCount}>
                <Heart className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Suivre ma commande" href="/suivi-commande">
                <Truck className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
              <IconAction label="Ouvrir mon panier" onClick={() => openDrawer()} badge={cartCount}>
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              </IconAction>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        restoreFocus={restoreFocus}
        links={navLinks}
      />
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        restoreFocus={restoreFocus}
      />
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
