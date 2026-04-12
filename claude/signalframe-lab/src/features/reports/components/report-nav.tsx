import { Badge } from "@/components/ui/badge";
import type { Report } from "@/lib/types/report";
import { formatDate } from "@/lib/utils";

export const REPORT_SECTIONS = [
  { id: "executive-summary", label: "Executive summary" },
  { id: "promise", label: "Promise & JTBD" },
  { id: "personas", label: "Persona overview" },
  { id: "simulations", label: "Persona simulations" },
  { id: "cross-findings", label: "Cross-persona findings" },
  { id: "problem-breakdown", label: "Problem breakdown" },
  { id: "prioritized-fixes", label: "Prioritized fixes" },
  { id: "confidence", label: "Confidence & assumptions" },
];

export function ReportNav({ report }: { report: Report }) {
  return (
    <aside className="sticky top-6 space-y-4 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <Badge tone="accent">{report.readinessLabel}</Badge>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{report.productName}</h2>
        <p className="text-sm leading-7 text-[var(--muted-foreground)]">
          Generated {formatDate(report.createdAt)}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Readiness</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--foreground)]">
          {report.readinessScore}
          <span className="text-base text-[var(--muted-foreground)]">/100</span>
        </p>
      </div>

      <nav aria-label="Report sections">
        <ul className="space-y-2">
          {REPORT_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center rounded-2xl px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors duration-200 ease-out hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function ReportQuickNav() {
  return (
    <div className="xl:hidden">
      <div className="flex gap-2 overflow-x-auto rounded-[1.5rem] border border-[var(--line)] bg-white p-2 shadow-sm">
        {REPORT_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors duration-200 ease-out hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            {section.label}
          </a>
        ))}
      </div>
    </div>
  );
}
