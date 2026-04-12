import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? <Badge tone="accent">{eyebrow}</Badge> : null}
      <div className="space-y-2">
        <h2 className="max-w-3xl text-balance text-2xl font-semibold text-[var(--foreground)] md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-pretty text-sm leading-7 text-[var(--muted-foreground)] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
