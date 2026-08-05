type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  titleId?: string;
  align?: "left" | "center";
  className?: string;
};

/** Shared section heading block for the storefront. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  titleId,
  align = "left",
  className,
}: SectionHeadingProps) {
  const alignmentClasses = align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`mb-6 max-w-2xl md:mb-10 ${alignmentClasses} ${className ?? ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={titleId} className="t-h1 mt-2">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)] md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
