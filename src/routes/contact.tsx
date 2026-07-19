import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | La Maison des Montres" },
      {
        name: "description",
        content:
          "Contactez La Maison des Montres pour toute question sur nos montres, commandes ou livraisons.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Contact | La Maison des Montres" },
      {
        property: "og:description",
        content:
          "Contactez La Maison des Montres pour toute question sur nos montres, commandes ou livraisons.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://maison-temps-gentil.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://maison-temps-gentil.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const subjectId = useId();
  const messageId = useId();
  const errorSummaryId = useId();

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  const set = <K extends keyof typeof values>(key: K, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!values.name.trim()) e.name = "Veuillez indiquer votre nom.";
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      e.email = "Adresse e-mail invalide.";
    }
    if (!values.phone.trim()) e.phone = "Veuillez indiquer votre numéro de téléphone.";
    if (!values.subject.trim()) e.subject = "Veuillez indiquer un sujet.";
    if (!values.message.trim()) e.message = "Veuillez rédiger votre message.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice(null);
      return;
    }
    setNotice("Le formulaire sera connecté lors de l’intégration du backend.");
  };

  const inputClass =
    "h-12 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm text-[color:var(--color-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]";
  const labelClass = "text-sm font-medium text-[color:var(--color-foreground)]";
  const errClass = "text-sm font-medium text-[color:var(--color-foreground)]";

  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <AnnouncementBar />
      <SiteHeader />
      <main id="content" className="container-page py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="t-h1 text-[color:var(--color-foreground)]">Nous contacter</h1>
          <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
            Une question sur une montre, une commande ou une livraison ? Écrivez-nous via le
            formulaire ci-dessous.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-cream)] p-5 md:p-6"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor={nameId} className={labelClass}>
                Nom <span aria-hidden>*</span>
              </label>
              <input
                id={nameId}
                type="text"
                required
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${nameId}-err` : undefined}
                className={inputClass}
              />
              {errors.name ? (
                <p id={`${nameId}-err`} role="alert" className={errClass}>
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={emailId} className={labelClass}>
                E-mail{" "}
                <span className="text-[color:var(--color-muted-foreground)]">(facultatif)</span>
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${emailId}-err` : undefined}
                className={inputClass}
              />
              {errors.email ? (
                <p id={`${emailId}-err`} role="alert" className={errClass}>
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={phoneId} className={labelClass}>
                Téléphone <span aria-hidden>*</span>
              </label>
              <input
                id={phoneId}
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? `${phoneId}-err` : undefined}
                className={inputClass}
              />
              {errors.phone ? (
                <p id={`${phoneId}-err`} role="alert" className={errClass}>
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={subjectId} className={labelClass}>
                Sujet <span aria-hidden>*</span>
              </label>
              <input
                id={subjectId}
                type="text"
                required
                value={values.subject}
                onChange={(e) => set("subject", e.target.value)}
                aria-invalid={errors.subject ? true : undefined}
                aria-describedby={errors.subject ? `${subjectId}-err` : undefined}
                className={inputClass}
              />
              {errors.subject ? (
                <p id={`${subjectId}-err`} role="alert" className={errClass}>
                  {errors.subject}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={messageId} className={labelClass}>
                Message <span aria-hidden>*</span>
              </label>
              <textarea
                id={messageId}
                required
                rows={6}
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? `${messageId}-err` : undefined}
                className="min-h-[144px] rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 py-3 text-sm text-[color:var(--color-foreground)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
              />
              {errors.message ? (
                <p id={`${messageId}-err`} role="alert" className={errClass}>
                  {errors.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-foreground)] px-6 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition-colors hover:bg-[#2a2928] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
            >
              Envoyer le message
            </button>
          </form>

          <div id={errorSummaryId} aria-live="polite" className="mt-4 min-h-[1.5rem]">
            {notice ? (
              <p className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                {notice}
              </p>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
