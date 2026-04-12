import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader({
  subtle = false,
  className,
}: {
  subtle?: boolean;
  className?: string;
}) {
  return (
    <header className={cn("w-full", className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
            <span className="font-serif text-lg font-semibold text-[var(--foreground)]">S</span>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[var(--foreground)]">SignalFrame</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {subtle ? "Synthetic UX report" : "Synthetic UX Lab"}
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Badge tone="neutral">MVP</Badge>
          <Link href="/reports/example?target=Linear" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            Example report
          </Link>
        </div>
      </div>
    </header>
  );
}
