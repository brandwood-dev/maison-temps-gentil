import { ANNOUNCEMENT_TEXT } from "@/config/nav";

export function AnnouncementBar({ text = ANNOUNCEMENT_TEXT }: { text?: string }) {
  return (
    <div
      role="region"
      aria-label="Annonce"
      className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
    >
      <div className="container-page flex min-h-8 items-center justify-center py-1.5 text-center text-[11px] font-medium tracking-[0.08em] sm:text-xs">
        {text}
      </div>
    </div>
  );
}
