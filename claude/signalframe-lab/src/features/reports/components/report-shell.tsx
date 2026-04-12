import { ChevronRight, CircleAlert, MoveRight, ShieldCheck, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { confidenceLabel, riskLabel, verdictLabel } from "@/lib/scoring/report";
import type {
  CrossPersonaFinding,
  Persona,
  PersonaSimulation,
  ProblemCluster,
  Recommendation,
  Report,
} from "@/lib/types/report";
import { cn, formatDate } from "@/lib/utils";

import { ReportActions } from "./report-actions";
import { ReportNav, ReportQuickNav } from "./report-nav";

function severityTone(level: ProblemCluster["severity"] | CrossPersonaFinding["severity"]) {
  if (level === "critical" || level === "high") {
    return "risk";
  }

  if (level === "medium") {
    return "warning";
  }

  return "neutral";
}

function metricToneClass(tone: Report["metrics"][number]["tone"]) {
  if (tone === "positive") {
    return "bg-[#2b6f4b]";
  }

  if (tone === "caution") {
    return "bg-[#9c6b19]";
  }

  return "bg-[#9d4d44]";
}

function priorityTone(priority: Recommendation["priority"]) {
  if (priority === "P0") {
    return "risk";
  }

  if (priority === "P1") {
    return "warning";
  }

  return "neutral";
}

function personaName(personas: Persona[], id: string) {
  return personas.find((persona) => persona.id === id)?.name ?? id;
}

function MetricCard({
  label,
  value,
  hint,
  tone,
}: Report["metrics"][number]) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
      <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-4 text-4xl font-semibold tabular-nums text-[var(--foreground)]">{value}</p>
      <div className="mt-4 h-2 rounded-full bg-[var(--surface)]">
        <div className={cn("h-2 rounded-full", metricToneClass(tone))} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">{hint}</p>
    </div>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-[var(--foreground)]">{persona.name}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{persona.archetype}</p>
        </div>
        <Badge tone="neutral">{persona.patienceThreshold} patience</Badge>
      </div>

      <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
        {persona.background}
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Goal</p>
          <p className="mt-2 text-sm text-[var(--foreground)]">{persona.goal}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Focus</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {persona.focusPoints.map((item) => (
              <Badge key={item} tone="accent">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function SimulationCard({
  simulation,
  personas,
}: {
  simulation: PersonaSimulation;
  personas: Persona[];
}) {
  const persona = personas.find((item) => item.id === simulation.personaId);

  if (!persona) {
    return null;
  }

  return (
    <details className="group rounded-[1.75rem] border border-[var(--line)] bg-white p-5 open:shadow-sm">
      <summary className="list-none cursor-pointer">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-[var(--foreground)]">{persona.name}</p>
              <Badge tone="neutral">{persona.archetype}</Badge>
              <Badge tone={simulation.verdict === "drop" ? "risk" : simulation.verdict === "hesitant" ? "warning" : "success"}>
                {verdictLabel(simulation.verdict)}
              </Badge>
            </div>
            <p className="max-w-3xl text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
              {simulation.firstImpression}
            </p>
          </div>

          <div className="grid min-w-full gap-3 md:min-w-72 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Trust shift</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                {simulation.trustDelta > 0 ? "+" : ""}
                {simulation.trustDelta}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Value shift</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                {simulation.valueDelta > 0 ? "+" : ""}
                {simulation.valueDelta}
              </p>
            </div>
          </div>
        </div>
      </summary>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Experience path</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--foreground)]">
              {simulation.experiencePath.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">{step}</span>
                  {index < simulation.experiencePath.length - 1 ? <ChevronRight className="size-4 text-[var(--muted-foreground)]" /> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Key moment</p>
            <p className="mt-3 text-pretty text-sm leading-7 text-[var(--foreground)]">{simulation.keyMoment}</p>
            {simulation.abandonmentRisk ? (
              <div className="mt-4 rounded-2xl border border-[#ebc7c3] bg-[#fbefed] p-4">
                <p className="text-xs font-medium uppercase text-[#9d4d44]">Abandonment risk</p>
                <p className="mt-2 text-pretty text-sm leading-7 text-[#7a4038]">{simulation.abandonmentRisk}</p>
              </div>
            ) : null}
            {simulation.successMoment ? (
              <div className="mt-4 rounded-2xl border border-[#cfe5d8] bg-[#eff8f2] p-4">
                <p className="text-xs font-medium uppercase text-[#2b6f4b]">Success signal</p>
                <p className="mt-2 text-pretty text-sm leading-7 text-[#2b6f4b]">{simulation.successMoment}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Confusion points</p>
            <ul className="mt-3 space-y-3">
              {simulation.confusionPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]">
                  <CircleAlert className="mt-1 size-4 text-[#9d4d44]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Journey trace</p>
          <div className="mt-4 space-y-4">
            {simulation.journey.map((point) => (
              <div key={point.step} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Step {point.step}</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{point.title}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs tabular-nums text-[var(--muted-foreground)]">
                    <span>Trust {point.trust}</span>
                    <span>Value {point.value}</span>
                  </div>
                </div>
                <p className="mt-3 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  {point.observation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

function ProblemCard({
  problem,
  personas,
}: {
  problem: ProblemCluster;
  personas: Persona[];
}) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold text-[var(--foreground)]">{problem.category}</p>
        <Badge tone={severityTone(problem.severity)}>{riskLabel(problem.severity)}</Badge>
      </div>
      <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">{problem.summary}</p>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Who it hurts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {problem.affectedPersonas.map((item) => (
              <Badge key={item} tone="neutral">
                {personaName(personas, item)}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Why it matters</p>
          <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{problem.whyItMatters}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Fix direction</p>
          <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{problem.fixDirection}</p>
        </div>
      </div>
    </article>
  );
}

function RecommendationCard({
  recommendation,
  personas,
}: {
  recommendation: Recommendation;
  personas: Persona[];
}) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Badge tone={priorityTone(recommendation.priority)}>{recommendation.priority}</Badge>
          <h3 className="text-xl font-semibold text-[var(--foreground)]">{recommendation.title}</h3>
        </div>
        <Badge tone="accent">{recommendation.metricImpact}</Badge>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Solves</p>
            <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{recommendation.solves}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Why this priority</p>
            <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{recommendation.rationale}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Affected personas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recommendation.affectedPersonas.map((item) => (
                <Badge key={item} tone="neutral">
                  {personaName(personas, item)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Concrete changes</p>
          <ul className="mt-3 space-y-3">
            {recommendation.actions.map((action) => (
              <li key={action} className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]">
                <MoveRight className="mt-1 size-4 text-[var(--accent)]" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function ReportShell({
  report,
  jsonHref,
}: {
  report: Report;
  jsonHref: string;
}) {
  return (
    <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="hidden xl:block">
        <ReportNav report={report} />
      </div>

      <div className="space-y-8">
        <ReportQuickNav />

        <section id="executive-summary" className="space-y-5">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <Badge tone="accent">Synthetic UX report</Badge>
                <div className="space-y-3">
                  <h1 className="max-w-4xl text-balance text-3xl font-semibold text-[var(--foreground)] md:text-5xl">
                    {report.productName} first-use experience report
                  </h1>
                  <p className="max-w-3xl text-pretty text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
                    {report.executiveSummary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="neutral">{report.productType}</Badge>
                  <Badge tone="neutral">{formatDate(report.createdAt)}</Badge>
                  {report.input.focus ? <Badge tone="accent">{report.input.focus.replace("-", " ")}</Badge> : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                  <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Readiness</p>
                  <p className="mt-2 text-4xl font-semibold tabular-nums text-[var(--foreground)]">
                    {report.readinessScore}
                    <span className="text-base text-[var(--muted-foreground)]">/100</span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{report.readinessLabel}</p>
                </div>
                <ReportActions jsonHref={jsonHref} />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Overall conclusion</p>
                <p className="mt-3 text-pretty text-sm leading-7 text-[var(--foreground)]">{report.overallConclusion}</p>
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Product promise</p>
                <p className="mt-3 text-pretty text-sm leading-7 text-[var(--foreground)]">{report.promise}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <div className="flex items-center gap-3">
                  <Target className="size-5 text-[var(--accent)]" />
                  <p className="text-sm font-semibold text-[var(--foreground)]">Likely target users</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.targetUsers.map((user) => (
                    <Badge key={user} tone="neutral">
                      {user}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <div className="flex items-center gap-3">
                  <CircleAlert className="size-5 text-[#9d4d44]" />
                  <p className="text-sm font-semibold text-[var(--foreground)]">Highest risk</p>
                </div>
                <ul className="mt-4 space-y-3">
                  {report.biggestRisks.slice(0, 2).map((risk) => (
                    <li key={risk} className="text-sm leading-7 text-[var(--foreground)]">
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-[var(--accent)]" />
                  <p className="text-sm font-semibold text-[var(--foreground)]">Fix first</p>
                </div>
                <ul className="mt-4 space-y-3">
                  {report.topFixes.slice(0, 2).map((fix) => (
                    <li key={fix} className="text-sm leading-7 text-[var(--foreground)]">
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {report.crossPersonaFindings.slice(0, 3).map((finding) => (
              <article key={finding.id} className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={severityTone(finding.severity)}>{riskLabel(finding.severity)}</Badge>
                  <Badge tone="accent">{finding.impact}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{finding.title}</h3>
                <p className="mt-3 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  {finding.summary}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section id="promise" className="space-y-5">
          <SectionHeading
            eyebrow="Research summary"
            title="Product promise, JTBD, and the first value moment"
            description="This section captures what the product appears to promise, who it is likely speaking to, and where the first believable value signal should appear."
          />
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Product promise</p>
              <p className="mt-3 text-pretty text-sm leading-7 text-[var(--foreground)]">{report.promise}</p>
              <p className="mt-6 text-xs font-medium uppercase text-[var(--muted-foreground)]">First value moment</p>
              <p className="mt-3 text-pretty text-sm leading-7 text-[var(--foreground)]">{report.firstValueMoment}</p>
            </div>
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
              <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Jobs to be done</p>
              <ul className="mt-3 space-y-3">
                {report.jobsToBeDone.map((job) => (
                  <li key={job} className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]">
                    <MoveRight className="mt-1 size-4 text-[var(--accent)]" />
                    {job}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="personas" className="space-y-5">
          <SectionHeading
            eyebrow="Synthetic cohort"
            title="Persona overview"
            description="Six first-time evaluators with different patience, risk tolerance, and proof expectations were used to stress-test the product narrative."
          />
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {report.personas.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </div>
        </section>

        <section id="simulations" className="space-y-5">
          <SectionHeading
            eyebrow="Journey detail"
            title="Persona simulations"
            description="Each simulation summarizes a first impression, the likely experience path, moments of doubt, and the final verdict."
          />
          <div className="space-y-4">
            {report.simulations.map((simulation) => (
              <SimulationCard key={simulation.personaId} simulation={simulation} personas={report.personas} />
            ))}
          </div>
        </section>

        <section id="cross-findings" className="space-y-5">
          <SectionHeading
            eyebrow="Pattern synthesis"
            title="Cross-persona findings"
            description="These findings surfaced repeatedly across multiple personas and most directly shape activation, trust, or return likelihood."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {report.crossPersonaFindings.map((finding) => (
              <article key={finding.id} className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-[var(--foreground)]">{finding.title}</p>
                  <Badge tone={severityTone(finding.severity)}>{riskLabel(finding.severity)}</Badge>
                </div>
                <p className="mt-4 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                  {finding.summary}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{finding.impact}</Badge>
                  {finding.affectedPersonas.map((item) => (
                    <Badge key={item} tone="neutral">
                      {personaName(report.personas, item)}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="problem-breakdown" className="space-y-5">
          <SectionHeading
            eyebrow="Risk map"
            title="Problem breakdown"
            description="Problems are grouped by the type of UX risk they create, who they affect, and why they matter commercially."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {report.problemClusters.map((problem) => (
              <ProblemCard key={problem.category} problem={problem} personas={report.personas} />
            ))}
          </div>
        </section>

        <section id="prioritized-fixes" className="space-y-5">
          <SectionHeading
            eyebrow="Action plan"
            title="Prioritized fixes"
            description="Recommendations are ordered by what most improves first-run clarity, trust, and activation momentum."
          />
          <div className="space-y-4">
            {report.recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                personas={report.personas}
              />
            ))}
          </div>
        </section>

        <section id="confidence" className="space-y-5">
          <SectionHeading
            eyebrow="Confidence layer"
            title="Report quality, confidence, and assumptions"
            description="This report is intentionally explicit about what is observed from public material, what is inferred, and what should be validated with real users."
          />
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Evidence used</p>
                <div className="mt-4 space-y-3">
                  {report.evidence.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                        <Badge tone="neutral">{confidenceLabel(item.confidence)}</Badge>
                      </div>
                      <p className="mt-3 text-pretty text-sm leading-7 text-[var(--muted-foreground)]">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">Assumptions</p>
                <ul className="mt-4 space-y-3">
                  {report.assumptions.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]">
                      <CircleAlert className="mt-1 size-4 text-[#9c6b19]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5">
                <p className="text-xs font-medium uppercase text-[var(--muted-foreground)]">What to validate next</p>
                <ul className="mt-4 space-y-3">
                  {report.validationNeeds.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]">
                      <MoveRight className="mt-1 size-4 text-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
