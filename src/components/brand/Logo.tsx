import { cn } from "@/lib/utils";

const SRC_DARK = "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VB_qf9hpa.png";
const SRC_LIGHT =
  "https://res.cloudinary.com/dxkxiy900/image/upload/v1784391979/LOGO_VW_eczfrh.png";

function optimizeCloudinaryLogo(url: string, height: number): string {
  if (!url.includes("res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  const prefix = url.slice(0, index + marker.length);
  const remainder = url.slice(index + marker.length);
  if (/^(?:f_[^/]+,)?(?:q_[^/]+,)?w_\d+\//.test(remainder)) return url;
  const width = Math.max(160, Math.round(height * 6));
  return `${prefix}f_auto,q_auto,w_${width}/${remainder}`;
}

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
  const optimizedSrc = optimizeCloudinaryLogo(src, height);
  return (
    <img
      src={optimizedSrc}
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
