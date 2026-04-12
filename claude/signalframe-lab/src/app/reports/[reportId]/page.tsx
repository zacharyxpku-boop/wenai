import Link from "next/link";

import { AppHeader } from "@/components/shared/app-header";
import { ReportHistorySync } from "@/components/shared/report-history-sync";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { ReportShell } from "@/features/reports/components/report-shell";
import { createAnalysisArtifacts, inputFromSearchParams } from "@/lib/analysis/engine";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ reportId }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const inferredInput =
    resolvedSearchParams.target ? inputFromSearchParams(resolvedSearchParams) : { target: reportId === "example" ? "Linear" : "Product" };
  const { report } = createAnalysisArtifacts(inferredInput);
  const currentHref = `/reports/${reportId}?${new URLSearchParams(
    Object.entries({
      target: report.input.target,
      focus: report.input.focus,
      audience: report.input.audience,
      notes: report.input.notes,
    }).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString()}`;
  const jsonHref = `/api/reports?${new URLSearchParams(
    Object.entries({
      target: report.input.target,
      focus: report.input.focus,
      audience: report.input.audience,
      notes: report.input.notes,
      download: "1",
    }).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString()}`;

  return (
    <main className="min-h-dvh pb-12">
      <AppHeader subtle />
      <section className="mx-auto max-w-7xl px-5 py-4 md:px-8 md:py-6">
        <ReportHistorySync report={report} href={currentHref} />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">Source: {report.input.target}</Badge>
            <Badge tone="accent">{report.productName}</Badge>
          </div>
          <Link href="/" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            Start a new analysis
          </Link>
        </div>
        <ReportShell report={report} jsonHref={jsonHref} />
      </section>
    </main>
  );
}
