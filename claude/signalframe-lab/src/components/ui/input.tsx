import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm text-[var(--foreground)] shadow-xs outline-none transition-colors duration-200 ease-out placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
}
