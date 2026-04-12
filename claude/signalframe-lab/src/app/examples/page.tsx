import Link from "next/link";

import { AppHeader } from "@/components/shared/app-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { buildExampleReports } from "@/lib/mock/report-factory";

const reports = buildExampleReports();

export default function ExamplesPage() {
  return (
    <main className="min-h-dvh pb-12">
      <AppHeader subtle />
      <section className="mx-auto max-w-6xl px-5 py-6 md:px-8">
        <div className="space-y-4">
          <Badge tone="accent">Examples</Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold text-[var(--foreground)]">
            Example reports
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-8 text-[var(--muted-foreground)]">
            A few sample outputs that show the structure, tone, and decision quality this MVP is designed to produce.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {reports.map((report) => (
            <article key={report.id} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone="neutral">{report.productType}</Badge>
                <Badge tone="accent">{report.readinessScore}/100</Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">{report.productName}</h2>
              <p className="mt-3 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                {report.executiveSummary}
              </p>
              <Link
                href={`/reports/example?target=${encodeURIComponent(report.productName)}`}
                className={buttonStyles({ variant: "secondary", size: "default", className: "mt-6 w-full" })}
              >
                Open report
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
