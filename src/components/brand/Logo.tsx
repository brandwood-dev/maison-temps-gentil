import { cn } from "@/lib/utils";

const SRC_DARK =
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VB_qf9hpa.png";
const SRC_LIGHT =
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VW_eczfrh.png";

type LogoProps = {
  variant?: "auto" | "dark" | "light";
  className?: string;
  /** rendered image height in px (width auto via object-contain) */
  height?: number;
  priority?: boolean;
};

/**
 * La Maison des Montres — Logo
 * variant="dark"  → logo sombre (fonds clairs)
 * variant="light" → logo clair (fonds sombres)
 * variant="auto"  → clair sur `.on-dark`, sinon sombre
 */
export function Logo({
  variant = "dark",
  className,
  height = 40,
  priority = false,
}: LogoProps) {
  if (variant === "auto") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <img
          src={SRC_DARK}
          alt="La Maison des Montres"
          height={height}
          width={height * 3}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="block h-[var(--logo-h)] w-auto object-contain on-dark:hidden"
          style={{ ["--logo-h" as string]: `${height}px` }}
        />
        <img
          src={SRC_LIGHT}
          alt="La Maison des Montres"
          height={height}
          width={height * 3}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="hidden h-[var(--logo-h)] w-auto object-contain on-dark:block"
          style={{ ["--logo-h" as string]: `${height}px` }}
        />
      </span>
    );
  }

  const src = variant === "light" ? SRC_LIGHT : SRC_DARK;
  return (
    <img
      src={src}
      alt="La Maison des Montres"
      height={height}
      width={height * 3}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("block w-auto object-contain", className)}
      style={{ height: `${height}px` }}
    />
  );
}
