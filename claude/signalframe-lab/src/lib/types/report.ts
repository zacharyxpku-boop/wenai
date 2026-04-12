export type FocusArea =
  | "first-impression"
  | "onboarding"
  | "activation"
  | "trust"
  | "pricing";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "high" | "medium" | "directional";
export type MetricImpact = "activation" | "trust" | "retention";
export type Verdict = "drop" | "hesitant" | "proceed" | "champion";

export interface ProductInput {
  target: string;
  focus?: FocusArea;
  audience?: string;
  notes?: string;
}

export interface AnalysisStage {
  id: string;
  label: string;
  detail: string;
}

export interface AnalysisJob {
  id: string;
  input: ProductInput;
  status: "queued" | "running" | "complete";
  createdAt: string;
  stages: AnalysisStage[];
}

export interface ScoreMetric {
  label: string;
  value: number;
  hint: string;
  tone: "positive" | "caution" | "risk";
}

export interface Persona {
  id: string;
  name: string;
  archetype: string;
  background: string;
  goal: string;
  riskTolerance: "low" | "medium" | "high";
  patienceThreshold: "low" | "medium" | "high";
  focusPoints: string[];
}

export interface JourneyPoint {
  step: string;
  title: string;
  observation: string;
  trust: number;
  value: number;
}

export interface PersonaSimulation {
  personaId: string;
  firstImpression: string;
  experiencePath: string[];
  confusionPoints: string[];
  trustDelta: number;
  valueDelta: number;
  keyMoment: string;
  abandonmentRisk?: string;
  successMoment?: string;
  verdict: Verdict;
  journey: JourneyPoint[];
}

export interface Finding {
  id: string;
  title: string;
  category:
    | "Findability"
    | "Comprehension"
    | "Workflow friction"
    | "Trust / Privacy / Risk"
    | "Value communication"
    | "Pricing / ROI clarity"
    | "Migration cost / switching anxiety"
    | "Activation gap"
    | "Retention gap";
  description: string;
  affectedPersonas: string[];
  severity: RiskLevel;
  whyItMatters: string;
  metricImpact: MetricImpact;
  recommendationDirection: string;
}

export interface CrossPersonaFinding {
  id: string;
  title: string;
  summary: string;
  affectedPersonas: string[];
  impact: MetricImpact;
  severity: RiskLevel;
}

export interface ProblemCluster {
  category: Finding["category"];
  summary: string;
  severity: RiskLevel;
  affectedPersonas: string[];
  whyItMatters: string;
  fixDirection: string;
}

export interface Recommendation {
  id: string;
  priority: "P0" | "P1" | "P2";
  title: string;
  solves: string;
  affectedPersonas: string[];
  rationale: string;
  metricImpact: MetricImpact;
  actions: string[];
}

export interface ReportEvidence {
  label: string;
  detail: string;
  confidence: ConfidenceLevel;
}

export interface RecentReportSummary {
  id: string;
  target: string;
  productName: string;
  readinessScore: number;
  readinessLabel: string;
  focus?: FocusArea;
  createdAt: string;
  href: string;
}

export interface Report {
  id: string;
  createdAt: string;
  input: ProductInput;
  productName: string;
  productType: string;
  productUrl: string;
  promise: string;
  targetUsers: string[];
  overallConclusion: string;
  readinessLabel: string;
  readinessScore: number;
  executiveSummary: string;
  biggestRisks: string[];
  topFixes: string[];
  firstValueMoment: string;
  jobsToBeDone: string[];
  metrics: ScoreMetric[];
  analysisJob: AnalysisJob;
  personas: Persona[];
  simulations: PersonaSimulation[];
  crossPersonaFindings: CrossPersonaFinding[];
  findings: Finding[];
  problemClusters: ProblemCluster[];
  recommendations: Recommendation[];
  evidence: ReportEvidence[];
  assumptions: string[];
  validationNeeds: string[];
}
