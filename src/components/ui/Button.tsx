import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

const VARIANTS = {
  primary: "bg-lime text-ink hover:bg-lime-deep",
  violet: "bg-violet text-white hover:bg-violet-deep",
  coral: "bg-coral text-white hover:brightness-95",
  ghost: "bg-white text-ink hover:bg-paper-dim",
  dark: "bg-ink text-white hover:bg-black",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-8 py-4 text-base",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`brutal-btn ${VARIANTS[variant]} ${SIZES[size]} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:shadow-hard-sm ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`brutal-btn ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </Link>
  );
}
