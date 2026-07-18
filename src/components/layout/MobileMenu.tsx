import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { NAV_LINKS, SECONDARY_LINKS } from "@/config/nav";


type Props = { open: boolean; onClose: () => void };

export function MobileMenu({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="left"
        aria-label="Menu principal"
        className="flex w-[86%] max-w-sm flex-col gap-0 border-r-0 bg-[color:var(--color-background)] p-0 shadow-[var(--shadow-soft)]"
      >
        <div className="sr-only">
          <SheetTitle>Menu principal</SheetTitle>
          <SheetDescription>
            Navigation par catégories de La Maison des Montres
          </SheetDescription>
        </div>

        <div className="flex h-14 items-center border-b border-[color:var(--color-border)] px-4">
          <Logo variant="dark" height={26} />
        </div>

        <nav aria-label="Catégories" className="flex-1 overflow-y-auto px-2 py-3">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={onClose}
                  className="block rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-[color:var(--color-border)]" />
          <ul>
            {SECONDARY_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={onClose}
                  className="block rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-surface-cream)] hover:text-[color:var(--color-foreground)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
