import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

export function buttonStyles({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "h-9 px-4",
    size === "default" && "h-11 px-5",
    size === "lg" && "h-12 px-6",
    variant === "primary" &&
      "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
    variant === "secondary" &&
      "border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]",
    variant === "ghost" &&
      "border-transparent bg-transparent text-[var(--muted-foreground)] hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
