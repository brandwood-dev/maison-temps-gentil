import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const TODO = "[À compléter avant publication]";

export function Todo({ label }: { label?: string }) {
  return (
    <span className="inline-block rounded-sm bg-[color:var(--color-surface-cream)] px-1.5 py-0.5 font-mono text-[0.85em] text-[color:var(--color-muted-foreground)]">
      {label ?? TODO}
    </span>
  );
}

export type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalLayout({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated?: string;
  sections: readonly LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="t-h1 text-[color:var(--color-foreground)]">{title}</h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-[color:var(--color-muted-foreground)]">
            {intro}
          </p>
          {updated && (
            <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">{updated}</p>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside aria-label="Table des matières" className="lg:sticky lg:top-24 lg:self-start">
              <nav>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-foreground)]">
                  Sommaire
                </p>
                <ol className="flex flex-col gap-1.5 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="rounded-sm text-[color:var(--color-muted-foreground)] transition-colors hover:text-[color:var(--color-gold)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                      >
                        {i + 1}. {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <article className="max-w-[70ch] text-[15px] leading-relaxed text-[color:var(--color-foreground)]">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-24 border-t border-[color:var(--color-border)] py-6 first:border-t-0 first:pt-0"
                >
                  <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)] md:text-xl">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="space-y-3">{s.content}</div>
                </section>
              ))}

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  Nous contacter
                </a>
                <a
                  href="/montres"
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface-cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
                >
                  Découvrir les montres
                </a>
              </div>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
