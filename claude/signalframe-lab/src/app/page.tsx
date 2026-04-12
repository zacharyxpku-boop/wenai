import Link from "next/link";
import { ArrowRight, Eye, LayoutPanelLeft, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/shared/app-header";
import { RecentAnalyses } from "@/components/shared/recent-analyses";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnalysisForm } from "@/features/analysis/components/analysis-form";
import { createAnalysisArtifacts } from "@/lib/analysis/engine";

const { report: exampleReport } = createAnalysisArtifacts({
  target: "Linear",
  focus: "activation",
});

export default function Home() {
  return (
    <main className="min-h-dvh pb-16">
      <AppHeader />

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-4 md:px-8 md:pt-6">
        <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <Badge tone="accent">Synthetic UX Lab</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance font-serif text-5xl leading-none text-[var(--foreground)] md:text-7xl">
                See how different users actually experience your product.
              </h1>
              <p className="max-w-2xl text-pretty text-lg leading-8 text-[var(--muted-foreground)]">
                Paste a product link, demo URL, or product name. SignalFrame infers the product promise, simulates first-time user journeys, and returns a structured UX report your team can actually discuss.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Input</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">URL, demo, or product name</p>
                <p className="mt-2 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  Minimal input, optional focus, and strong defaults.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Engine</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">Synthetic persona simulation</p>
                <p className="mt-2 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  Understands confusion, trust gaps, and activation risk before live research.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Output</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">Executive-ready report</p>
                <p className="mt-2 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  Summary, persona simulations, risk map, and prioritized fixes.
                </p>
              </div>
            </div>
          </div>

          <AnalysisForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Eye className="size-5" />
              </div>
              <p className="text-lg font-semibold text-[var(--foreground)]">What users notice first</p>
            </div>
            <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
              Detect whether the promise lands, what feels confusing, and where trust drops before meaningful value is visible.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <LayoutPanelLeft className="size-5" />
              </div>
              <p className="text-lg font-semibold text-[var(--foreground)]">Where the flow breaks</p>
            </div>
            <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
              Separate findability, comprehension, trust, workflow, activation, and retention issues into a usable problem map.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Sparkles className="size-5" />
              </div>
              <p className="text-lg font-semibold text-[var(--foreground)]">What to fix first</p>
            </div>
            <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
              Turn synthetic feedback into action with prioritized changes to copy, flow, trust cues, and value presentation.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionHeading
          eyebrow="Recent work"
          title="Recent analyses"
          description="Each completed report is kept locally so you can reopen it quickly while refining positioning, onboarding, or trust cues."
        />

        <div className="mt-6">
          <RecentAnalyses />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <SectionHeading
          eyebrow="Example output"
          title="A report layout designed for real team review"
          description="The core report is structured to be scannable at the top, evidence-rich in the middle, and practical at the bottom."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge tone="accent">Executive summary</Badge>
                <h2 className="mt-4 text-3xl font-semibold text-[var(--foreground)]">
                  {exampleReport.productName} first-use experience report
                </h2>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-5 py-4">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Readiness</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--foreground)]">
                  {exampleReport.readinessScore}
                  <span className="text-base text-[var(--muted-foreground)]">/100</span>
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
              {exampleReport.executiveSummary}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {exampleReport.metrics.slice(0, 2).map((metric) => (
                <div key={metric.label} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums text-[var(--foreground)]">{metric.value}</p>
                  <p className="mt-2 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">What teams get</p>
              <ul className="mt-4 space-y-4">
                <li className="text-sm leading-7 text-[var(--foreground)]">
                  A clear statement of what the product seems to solve, for whom, and where the first value moment lives.
                </li>
                <li className="text-sm leading-7 text-[var(--foreground)]">
                  Six persona cards with expandable first-use simulations and verdicts.
                </li>
                <li className="text-sm leading-7 text-[var(--foreground)]">
                  A prioritized fix list split by activation, trust, and retention impact.
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Sample priority fixes</p>
              <div className="mt-4 space-y-3">
                {exampleReport.recommendations.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={item.priority === "P0" ? "risk" : item.priority === "P1" ? "warning" : "neutral"}>
                        {item.priority}
                      </Badge>
                      <Badge tone="accent">{item.metricImpact}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/reports/example?target=Linear" className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}>
              Open the full sample report
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
