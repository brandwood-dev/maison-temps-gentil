import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/brand/SectionHeading";
import femmeImage from "@/assets/collection-femme.jpg";
import hommeImage from "@/assets/collection-homme.jpg";
import { DEFAULT_CATALOG_QUERY } from "@/lib/catalog";

type CollectionCardProps = {
  to: "/montres-femme" | "/montres-homme";
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
};

const COLLECTIONS: CollectionCardProps[] = [
  {
    to: "/montres-femme",
    badge: "Pour elle",
    title: "Collection Femme",
    subtitle: "Beauté, élégance et raffinement au quotidien.",
    image: femmeImage,
    alt: "Femme portant une montre dorée, lumière chaude",
  },
  {
    to: "/montres-homme",
    badge: "Pour lui",
    title: "Collection Homme",
    subtitle: "L'art du style, du soin et de la prestance.",
    image: hommeImage,
    alt: "Homme ajustant une montre acier à son poignet",
  },
];

function CollectionCard({ to, badge, title, subtitle, image, alt }: CollectionCardProps) {
  return (
    <Link
      to={to}
      search={DEFAULT_CATALOG_QUERY}
      className="group relative block min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)]"
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/11] lg:aspect-[4/3]">
        <img
          src={image}
          alt={alt}
          width={1280}
          height={960}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div aria-hidden className="absolute inset-0 bg-[image:var(--brand-card-overlay)]" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9">
          <span className="inline-block bg-[color:var(--color-gold)] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[color:var(--color-primary)] uppercase">
            {badge}
          </span>
          <h3 className="t-h2 mt-4 text-[color:var(--color-on-image)]">{title}</h3>
          <p className="mt-2 max-w-sm text-sm text-[color:var(--color-on-image-muted)] sm:text-base">
            {subtitle}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-gold)] uppercase">
            Voir la collection
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CollectionsShowcase() {
  return (
    <section aria-labelledby="collections-title" className="container-page py-12 md:py-16 lg:py-20">
      <SectionHeading
        eyebrow="Collections"
        title="L'élégance intemporelle"
        titleId="collections-title"
      />
      <div className="hidden">
        <p className="eyebrow">Collections</p>
        <h2 className="t-h1 mt-2">L&apos;élégance intemporelle</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {COLLECTIONS.map((collection) => (
          <CollectionCard key={collection.to} {...collection} />
        ))}
      </div>
    </section>
  );
}
