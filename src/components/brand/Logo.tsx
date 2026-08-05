import { cn } from "@/lib/utils";

const SRC_DARK = "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VB_qf9hpa.png";
const SRC_LIGHT =
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VW_eczfrh.png";

type LogoProps = {
  /** "dark" pour fond clair, "light" pour fond sombre */
  variant?: "dark" | "light";
  className?: string;
  height?: number;
  priority?: boolean;
  src?: string;
  alt?: string;
};

export function Logo({
  variant = "dark",
  className,
  height = 40,
  priority = false,
  src: customSrc,
  alt = "La Maison des Montres",
}: LogoProps) {
  const src = customSrc ?? (variant === "light" ? SRC_LIGHT : SRC_DARK);
  return (
    <img
      src={src}
      alt={alt}
      height={height}
      width={height * 3}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn("block w-auto object-contain", className)}
      style={{ height: `${height}px` }}
    />
  );
}
