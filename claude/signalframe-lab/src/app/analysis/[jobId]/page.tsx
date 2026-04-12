import { AppHeader } from "@/components/shared/app-header";
import { createAnalysisArtifacts, inputFromSearchParams } from "@/lib/analysis/engine";
import { ProgressTracker } from "@/features/analysis/components/progress-tracker";

export default async function AnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ jobId }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { input, job } = createAnalysisArtifacts(inputFromSearchParams(resolvedSearchParams));
  const reportParams = new URLSearchParams();

  reportParams.set("target", input.target);

  if (input.focus) {
    reportParams.set("focus", input.focus);
  }

  if (input.audience) {
    reportParams.set("audience", input.audience);
  }

  if (input.notes) {
    reportParams.set("notes", input.notes);
  }

  const reportHref = `/reports/${jobId}?${reportParams.toString()}`;

  return (
    <main className="min-h-dvh pb-12">
      <AppHeader subtle />
      <section className="mx-auto max-w-7xl px-5 py-4 md:px-8 md:py-6">
        <ProgressTracker input={input} stages={job.stages} reportHref={reportHref} />
      </section>
    </main>
  );
}
