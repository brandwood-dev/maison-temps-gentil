import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PRODUCTS } from "@/fixtures/products";
import { TESTIMONIALS, type Testimonial } from "@/fixtures/testimonials";
import { getPublicProductBySlug } from "@/lib/products";
import { SectionHeading } from "@/components/brand/SectionHeading";

function Rating({ rating }: { rating: number }) {
  return (
    <p className="flex items-center gap-1" aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          strokeWidth={1.5}
          className={
            i <= rating
              ? "h-4 w-4 fill-[color:var(--color-gold)] text-[color:var(--color-gold)]"
              : "h-4 w-4 text-[color:var(--color-border-strong)]"
          }
        />
      ))}
    </p>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const product = getPublicProductBySlug(PRODUCTS, testimonial.productSlug);

  return (
    <article className="flex h-full w-[78vw] max-w-[340px] shrink-0 flex-col justify-between gap-5 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 sm:w-[340px] sm:p-6">
      <div className="space-y-3">
        <Rating rating={testimonial.rating} />
        <blockquote className="text-sm leading-relaxed text-[color:var(--color-foreground)]">
          « {testimonial.message} »
        </blockquote>
      </div>

      <footer className="space-y-1 border-t border-[color:var(--color-border)] pt-4">
        <p className="text-sm font-semibold">{testimonial.fullName}</p>
        <p className="text-xs text-[color:var(--color-muted-foreground)]">
          {testimonial.governorate}, Tunisie
        </p>
        {product ? (
          <Link
            to="/montres/$slug"
            params={{ slug: product.slug }}
            className="mt-1 inline-block text-xs font-semibold tracking-[0.06em] text-[color:var(--color-gold)] underline decoration-[color:var(--color-gold)]/40 underline-offset-4 hover:decoration-[color:var(--color-gold)]"
          >
            {product.name}
          </Link>
        ) : null}
      </footer>
    </article>
  );
}

export function TestimonialsMarquee() {
  const prefersReducedMotion = usePrefersReducedMotion();
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section
      aria-labelledby="testimonials-title"
      className="section-deferred overflow-hidden bg-[color:var(--color-surface-cream)] py-12 md:py-16 lg:py-20"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Avis Clients"
          title="Ils nous font confiance"
          titleId="testimonials-title"
          align="center"
        />
      </div>

      <div className="reviews-marquee-mask rail-bleed relative">
        <div className="reviews-marquee-track marquee-track flex items-stretch gap-4 sm:gap-6">
          <ul className="reviews-marquee-group flex items-stretch gap-4 sm:gap-6">
            {TESTIMONIALS.map((t) => (
              <li key={t.id} className="flex">
                <TestimonialCard testimonial={t} />
              </li>
            ))}
          </ul>
          {!prefersReducedMotion ? (
            <ul
              aria-hidden="true"
              className="reviews-marquee-group flex items-stretch gap-4 sm:gap-6"
            >
              {TESTIMONIALS.map((t) => (
                <li key={`dup-${t.id}`} className="flex">
                  <TestimonialCard testimonial={t} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
