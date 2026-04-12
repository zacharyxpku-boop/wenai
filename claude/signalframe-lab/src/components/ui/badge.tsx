import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "accent" | "risk" | "warning" | "success";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tone === "neutral" && "border-[var(--line)] bg-[var(--surface)] text-[var(--muted-foreground)]",
        tone === "accent" && "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        tone === "risk" && "border-[#ebc7c3] bg-[#fbefed] text-[#9d4d44]",
        tone === "warning" && "border-[#ead8b6] bg-[#fcf5e7] text-[#9c6b19]",
        tone === "success" && "border-[#cfe5d8] bg-[#eff8f2] text-[#2b6f4b]",
        className,
      )}
    >
      {children}
    </span>
  );
}
