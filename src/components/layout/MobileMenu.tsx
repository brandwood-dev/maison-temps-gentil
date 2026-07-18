import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NAV_LINKS, SECONDARY_LINKS } from "@/config/nav";

type Props = { open: boolean; onClose: () => void };

export function MobileMenu({ open, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 xl:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-[color:var(--color-background)] shadow-[var(--shadow-soft)] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--color-border)] px-4">
          <Logo variant="dark" height={26} />
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-[color:var(--color-surface-cream)]"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
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
      </aside>
    </div>
  );
}
