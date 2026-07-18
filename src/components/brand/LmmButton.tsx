import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[#2a2928] active:bg-black",
        secondary:
          "bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] border border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-cream)]",
        gold: "bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:brightness-95 active:brightness-90",
        ghost:
          "bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]",
        link: "bg-transparent text-[color:var(--color-foreground)] underline-offset-4 hover:underline decoration-[color:var(--color-gold)] px-0",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm md:text-[15px]",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type LmmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

export const LmmButton = forwardRef<HTMLButtonElement, LmmButtonProps>(function LmmButton(
  { className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading ? rightIcon : null}
    </button>
  );
});
