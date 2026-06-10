"use client";

import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "info" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-warm-500 text-white shadow-warm active:bg-warm-600",
  secondary: "bg-white text-concrete-900 border border-concrete-200 active:bg-concrete-50",
  info: "bg-ink-600 text-white active:bg-ink-700",
  danger: "bg-coral-500 text-white active:bg-coral-600",
  ghost: "bg-transparent text-concrete-700 active:bg-concrete-100",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const BASE = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-soft transition disabled:opacity-40 disabled:cursor-not-allowed";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  external?: boolean;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  full = false,
  external = false,
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  const cls = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
