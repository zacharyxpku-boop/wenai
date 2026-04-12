import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] shadow-xs outline-none transition-colors duration-200 ease-out placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
}
