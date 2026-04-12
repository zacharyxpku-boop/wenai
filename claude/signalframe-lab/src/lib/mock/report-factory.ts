import { metricTone } from "@/lib/scoring/report";
import type {
  AnalysisJob,
  AnalysisStage,
  Persona,
  PersonaSimulation,
  ProductInput,
  Report,
} from "@/lib/types/report";
import { slugify, titleCase } from "@/lib/utils";

interface ProductProfile {
  key: string;
  name: string;
  productType: string;
  url: string;
  promise: string;
  targetUsers: string[];
  executiveSummary: string;
  overallConclusion: string;
  readinessLabel: string;
  readinessScore: number;
  firstValueMoment: string;
  jobsToBeDone: string[];
  biggestRisks: string[];
  topFixes: string[];
  metrics: Array<{ label: string; value: number; hint: string }>;
  stageDetails: string[];
  evidence: Array<{
    label: string;
    detail: string;
    confidence: "high" | "medium" | "directional";
  }>;
}

const PRODUCT_PROFILES: ProductProfile[] = [
  {
    key: "linear",
    name: "Linear",
    productType: "product delivery platform",
    url: "https://linear.app",
    promise:
      "Help software teams plan, build, and ship with more clarity and less operational drag.",
    targetUsers: ["product teams", "engineering leads", "cross-functional startup teams"],
    executiveSummary:
      "The product looks credible, focused, and well-crafted, but the first-time experience still assumes too much category familiarity. Power users see promise quickly; broader stakeholders need clearer proof of why this workflow is worth switching to.",
    overallConclusion:
      "Strong product signals are present, but activation depends on the user already understanding the operating model. The main UX risk is not visual polish but delayed clarity and under-explained switching cost.",
    readinessLabel: "Conditional readiness",
    readinessScore: 68,
    firstValueMoment:
      "When the user can see one live planning workflow, linked issue state, and team cadence in the same view without needing a full setup.",
    jobsToBeDone: [
      "Bring roadmap, issue tracking, and execution into one coherent rhythm.",
      "Help a new team understand how work moves from planning to shipping.",
      "Reduce coordination overhead without adding process heaviness.",
    ],
    biggestRisks: [
      "The product promise lands after the interface style, not before it.",
      "Security and migration reassurance appear too late for cautious buyers.",
      "The first success path assumes a team-level setup before individual value is proven.",
    ],
    topFixes: [
      "Show one concrete first-run workflow before asking users to configure a workspace.",
      "Move migration, integration, and security proof into the earliest decision layer.",
      "Translate product language into clearer outcome language for non-expert evaluators.",
    ],
    metrics: [
      {
        label: "Clarity score",
        value: 62,
        hint: "Sharp product feel, but promise still needs plainer framing.",
      },
      {
        label: "Trust resilience",
        value: 49,
        hint: "Strong craft helps, yet security and risk proof arrive late.",
      },
      {
        label: "Activation strength",
        value: 58,
        hint: "Capable once configured, but setup asks for confidence early.",
      },
      {
        label: "Return likelihood",
        value: 64,
        hint: "Users who cross the setup threshold are likely to stay.",
      },
    ],
    stageDetails: [
      "Reading homepage structure and primary positioning language.",
      "Mapping the first-run path from promise to visible workflow value.",
      "Stress-testing the experience through skeptical and time-constrained personas.",
      "Separating craft quality from actual comprehension and trust signals.",
      "Synthesizing recurring risks into activation, trust, and retention recommendations.",
    ],
    evidence: [
      {
        label: "Homepage positioning",
        detail: "Strong product vocabulary and high craft signal a mature workflow tool.",
        confidence: "high",
      },
      {
        label: "Information architecture",
        detail: "Navigation suggests depth, but first-time users need a faster path to concrete proof.",
        confidence: "medium",
      },
      {
        label: "Trust evidence",
        detail: "Security, integrations, and migration confidence cues exist but are not dominant early on.",
        confidence: "medium",
      },
      {
        label: "Inference layer",
        detail: "Some stakeholder and activation assumptions are inferred from public-facing messaging rather than observed product usage.",
        confidence: "directional",
      },
    ],
  },
  {
    key: "figma",
    name: "Figma",
    productType: "collaborative design platform",
    url: "https://figma.com",
    promise:
      "Bring design, prototyping, feedback, and handoff into one shared collaborative workspace.",
    targetUsers: ["design teams", "product builders", "collaborative organizations"],
    executiveSummary:
      "The product is immediately credible and category-leading, but the surface area is broad enough that first-time evaluators can still struggle to identify the fastest proof of value.",
    overallConclusion:
      "Trust is high on brand strength and product maturity, yet activation can fragment when the user does not know whether to start from design, whiteboarding, slides, or dev handoff.",
    readinessLabel: "High potential, broad surface",
    readinessScore: 74,
    firstValueMoment:
      "When a user edits, comments, and shares a live collaborative artifact without needing to understand the full ecosystem.",
    jobsToBeDone: [
      "Collaborate around a live product artifact instead of static deliverables.",
      "Move from ideation to design to handoff in one system.",
      "Reduce file friction and version confusion across teams.",
    ],
    biggestRisks: [
      "Breadth can dilute the clearest first-run starting point.",
      "Non-design stakeholders may understand collaboration value before they understand the workflow model.",
      "Advanced capability can make simple entry scenarios feel underspecified.",
    ],
    topFixes: [
      "Guide users into role-based first-run paths instead of product-wide exploration.",
      "Make the fastest collaborative proof moment impossible to miss.",
      "Explain how the product fits different team shapes before exposing all surface areas.",
    ],
    metrics: [
      {
        label: "Clarity score",
        value: 71,
        hint: "Brand and familiarity help, but breadth still creates choice friction.",
      },
      {
        label: "Trust resilience",
        value: 78,
        hint: "Maturity and social proof carry strong confidence from the start.",
      },
      {
        label: "Activation strength",
        value: 63,
        hint: "Users find value, but the shortest path can still be unclear.",
      },
      {
        label: "Return likelihood",
        value: 77,
        hint: "Once a shared artifact exists, repeat usage feels natural.",
      },
    ],
    stageDetails: [
      "Reading homepage language to identify the primary promise and proof structure.",
      "Comparing the product breadth against the clarity of the first user entry point.",
      "Running first-time simulations for designers, PMs, founders, and cautious buyers.",
      "Tracking where credibility comes from brand strength versus explicit explanation.",
      "Packaging the most fixable gaps into a structured report.",
    ],
    evidence: [
      {
        label: "Homepage language",
        detail: "Messaging clearly communicates collaboration and ecosystem breadth.",
        confidence: "high",
      },
      {
        label: "Navigation breadth",
        detail: "Multiple product surfaces create choice complexity for first-time users.",
        confidence: "high",
      },
      {
        label: "Social proof",
        detail: "Credibility is supported by market maturity and familiar category anchors.",
        confidence: "high",
      },
      {
        label: "Inference layer",
        detail: "Role-specific drop-off risk is inferred from information density, not observed sessions.",
        confidence: "directional",
      },
    ],
  },
];

const BASE_PERSONAS: Persona[] = [
  {
    id: "maya",
    name: "Maya Chen",
    archetype: "Time-starved product manager",
    background: "Runs product ops for a growing software team and evaluates tools between meetings.",
    goal: "Understand within minutes whether this product will reduce coordination drag.",
    riskTolerance: "medium",
    patienceThreshold: "low",
    focusPoints: ["time to value", "workflow fit", "team adoption risk"],
  },
  {
    id: "andre",
    name: "Andre Silva",
    archetype: "Skeptical engineering lead",
    background: "Owns delivery quality and resists tools that add process or migration debt.",
    goal: "Verify whether the product improves execution without bloating the workflow.",
    riskTolerance: "low",
    patienceThreshold: "medium",
    focusPoints: ["migration friction", "system fit", "operational overhead"],
  },
  {
    id: "sofia",
    name: "Sofia Patel",
    archetype: "Ops generalist",
    background: "Supports cross-functional teams and often becomes the default system configurator.",
    goal: "Figure out how quickly she can turn the product into a working operating system.",
    riskTolerance: "medium",
    patienceThreshold: "high",
    focusPoints: ["setup clarity", "role mapping", "handoff quality"],
  },
  {
    id: "kevin",
    name: "Kevin Hart",
    archetype: "Founder in a hurry",
    background: "Evaluates products at high speed and wants a fast signal before involving the team.",
    goal: "See a compelling before-and-after outcome without reading deep documentation.",
    riskTolerance: "high",
    patienceThreshold: "low",
    focusPoints: ["signal density", "proof speed", "strategic leverage"],
  },
  {
    id: "priya",
    name: "Priya Narayanan",
    archetype: "Security-conscious buyer",
    background: "Represents IT and procurement concerns in later-stage evaluations.",
    goal: "Find enough trust evidence early to avoid wasting stakeholder time.",
    riskTolerance: "low",
    patienceThreshold: "medium",
    focusPoints: ["security proof", "privacy language", "vendor reliability"],
  },
  {
    id: "elena",
    name: "Elena Rossi",
    archetype: "Detail-oriented designer",
    background: "Sensitive to product craft and notices gaps between promise, flow, and actual usability.",
    goal: "Judge whether the product feels coherent and worth daily interaction.",
    riskTolerance: "medium",
    patienceThreshold: "medium",
    focusPoints: ["interaction quality", "mental model clarity", "daily usability"],
  },
];

function inferProfile(target: string): ProductProfile {
  const normalized = target.trim().toLowerCase();
  const matched = PRODUCT_PROFILES.find((profile) => normalized.includes(profile.key));

  if (matched) {
    return matched;
  }

  return {
    key: "generic",
    name: titleCase(normalized.replace(/^https?:\/\//, "").split("/")[0] || "Product"),
    productType: "software product",
    url:
      normalized.startsWith("http") ?
        target.trim()
      : `https://${slugify(target) || "product"}.com`,
    promise:
      "Help teams get from scattered evaluation to a more confident, repeatable workflow.",
    targetUsers: ["product teams", "design leads", "founders and operators"],
    executiveSummary:
      "The product appears credible enough to invite exploration, but the first-run experience still asks users to bridge important gaps on their own. Most friction comes from unclear proof, not from lack of capability.",
    overallConclusion:
      "The likely risk is a value gap in the first session: users can sense there may be power here, but too many will leave before the product makes its case in concrete terms.",
    readinessLabel: "Promising but under-explained",
    readinessScore: 61,
    firstValueMoment:
      "When the user sees one specific workflow or outcome that directly maps to the problem they came in with.",
    jobsToBeDone: [
      "Understand what the product does without needing deep category context.",
      "See whether the workflow fits an existing team habit or replaces it cleanly.",
      "Judge the speed of time-to-value before committing to setup.",
    ],
    biggestRisks: [
      "The promise is broader than the proof in the first few minutes.",
      "High-intent evaluators still need better reassurance around trust and change cost.",
      "The interface suggests capability faster than it explains the payoff.",
    ],
    topFixes: [
      "Show the shortest concrete success path before configuration details.",
      "Move proof, trust, and switching-cost answers higher in the experience.",
      "Translate category language into clearer, outcome-based language.",
    ],
    metrics: [
      {
        label: "Clarity score",
        value: 57,
        hint: "Users can infer value, but the framing is still too indirect.",
      },
      {
        label: "Trust resilience",
        value: 46,
        hint: "Trust cues exist, though they are not yet decisive for cautious buyers.",
      },
      {
        label: "Activation strength",
        value: 54,
        hint: "The experience points toward value but asks too much setup confidence early.",
      },
      {
        label: "Return likelihood",
        value: 52,
        hint: "Return intent depends on whether the first workflow feels immediately relevant.",
      },
    ],
    stageDetails: [
      "Reading top-level positioning and extracting the likely user promise.",
      "Mapping where a first-time visitor expects proof versus where the page actually offers it.",
      "Simulating different urgency levels, trust thresholds, and workflow expectations.",
      "Separating perceived product quality from actual clarity and activation support.",
      "Summarizing what should be fixed first before live user testing.",
    ],
    evidence: [
      {
        label: "Public-facing copy",
        detail: "Conclusions are based on outward-facing messaging, structure, and inferred workflow cues.",
        confidence: "medium",
      },
      {
        label: "Trust layer",
        detail: "Trust analysis focuses on visible reassurance patterns, not a full compliance audit.",
        confidence: "directional",
      },
      {
        label: "Role inference",
        detail: "Target-user assumptions are inferred from problem framing and UI language.",
        confidence: "directional",
      },
      {
        label: "First-run path",
        detail: "The evaluation estimates first-time experience rather than measuring real completion data.",
        confidence: "medium",
      },
    ],
  };
}

function createStages(profile: ProductProfile): AnalysisStage[] {
  return [
    { id: "understand", label: "Understand product", detail: profile.stageDetails[0] },
    { id: "map-flow", label: "Map critical journey", detail: profile.stageDetails[1] },
    { id: "simulate", label: "Generate personas", detail: profile.stageDetails[2] },
    { id: "stress-test", label: "Simulate first use", detail: profile.stageDetails[3] },
    { id: "synthesize", label: "Assemble report", detail: profile.stageDetails[4] },
  ];
}

function createPersonas(input: ProductInput) {
  return BASE_PERSONAS.map((persona) => {
    if (persona.id !== "maya") {
      return persona;
    }

    return {
      ...persona,
      goal:
        input.focus === "pricing" ?
          "Decide whether the product earns a deeper pricing conversation."
        : persona.goal,
      focusPoints:
        input.audience && input.audience.length > 0 ?
          [...persona.focusPoints, `fit for ${input.audience}`]
        : persona.focusPoints,
    };
  });
}

function createSimulations(): PersonaSimulation[] {
  return [
    {
      personaId: "maya",
      firstImpression:
        "The product feels mature immediately, but Maya needs a faster explanation of what outcome improves before she invests more attention.",
      experiencePath: ["Homepage", "Primary value block", "Product tour", "Sign-up entry"],
      confusionPoints: [
        "The core workflow is implied before it is plainly shown.",
        "It is not obvious what the first successful five minutes should look like.",
      ],
      trustDelta: 8,
      valueDelta: 16,
      keyMoment: "Interest rises when the workflow becomes concrete instead of conceptual.",
      abandonmentRisk:
        "If setup asks for team context too early, she leaves and promises herself to revisit later.",
      verdict: "hesitant",
      journey: [
        {
          step: "01",
          title: "Scans the promise",
          observation: "She sees polish and ambition, but still needs a crisp sentence on what changes in her day.",
          trust: 56,
          value: 42,
        },
        {
          step: "02",
          title: "Looks for a fast proof",
          observation: "A concrete workflow example increases confidence more than abstract category language.",
          trust: 60,
          value: 58,
        },
        {
          step: "03",
          title: "Evaluates team cost",
          observation: "Her confidence plateaus when she cannot easily estimate rollout effort.",
          trust: 57,
          value: 60,
        },
      ],
    },
    {
      personaId: "andre",
      firstImpression:
        "Andre respects the product discipline, but interprets any ambiguity as hidden operational cost.",
      experiencePath: ["Homepage", "Feature scan", "Integration trust checks", "Migration questions"],
      confusionPoints: [
        "The product tells him it is powerful before showing how it fits his existing stack.",
        "Migration risk is not answered quickly enough for a skeptical evaluator.",
      ],
      trustDelta: -6,
      valueDelta: 11,
      keyMoment: "He leans in only when the workflow appears opinionated instead of bloated.",
      abandonmentRisk:
        "Without early proof of interoperability and migration safety, he assumes the tool will create process debt.",
      verdict: "drop",
      journey: [
        {
          step: "01",
          title: "Tests credibility",
          observation: "Craft quality earns attention, but not trust on its own.",
          trust: 50,
          value: 38,
        },
        {
          step: "02",
          title: "Searches for system fit",
          observation: "He wants APIs, integrations, or migration cues earlier in the narrative.",
          trust: 44,
          value: 48,
        },
        {
          step: "03",
          title: "Assesses rollout burden",
          observation: "The product still feels plausible, but not yet safe to champion internally.",
          trust: 41,
          value: 49,
        },
      ],
    },
    {
      personaId: "sofia",
      firstImpression:
        "Sofia sees a useful operational backbone, especially when the product hints at cross-functional structure rather than single-role utility.",
      experiencePath: ["Homepage", "Use-case pattern", "Workflow details", "Team setup mental model"],
      confusionPoints: [
        "The fastest configuration path is not explicit enough.",
        "Role-specific setup guidance could be clearer for the person doing the implementation work.",
      ],
      trustDelta: 10,
      valueDelta: 22,
      keyMoment: "Her conviction rises once she can imagine how teams, artifacts, and handoffs map into one system.",
      successMoment:
        "She becomes an internal sponsor when the product shows repeatable operational leverage rather than one isolated feature.",
      verdict: "proceed",
      journey: [
        {
          step: "01",
          title: "Maps the operating model",
          observation: "She tries to infer how the system will organize roles, rituals, and artifacts.",
          trust: 58,
          value: 50,
        },
        {
          step: "02",
          title: "Finds structural value",
          observation: "A visible workflow arc makes the tool feel more practical than aspirational.",
          trust: 64,
          value: 66,
        },
        {
          step: "03",
          title: "Estimates setup effort",
          observation: "She would proceed, but wants a clearer starter blueprint for faster rollout.",
          trust: 68,
          value: 72,
        },
      ],
    },
    {
      personaId: "kevin",
      firstImpression:
        "Kevin wants a sharp strategic signal and gets impatient when the product makes him decode category language.",
      experiencePath: ["Hero message", "Proof scan", "Pricing cues", "Decision shortcut"],
      confusionPoints: [
        "The product speaks well, but not always in concrete founder language.",
        "It takes too long to answer whether the tool creates leverage this week.",
      ],
      trustDelta: 6,
      valueDelta: 14,
      keyMoment: "A single vivid use case does more for him than a full capability list.",
      abandonmentRisk:
        "If he cannot summarize the value to his team in one sentence, he moves on to the next option.",
      verdict: "hesitant",
      journey: [
        {
          step: "01",
          title: "Judges signal density",
          observation: "He responds to focus and sharpness, not feature volume.",
          trust: 55,
          value: 44,
        },
        {
          step: "02",
          title: "Looks for strategic payoff",
          observation: "He wants obvious before-and-after outcomes earlier on the page.",
          trust: 58,
          value: 55,
        },
        {
          step: "03",
          title: "Makes a provisional call",
          observation: "He keeps the product in consideration, but not yet at the top of the stack.",
          trust: 61,
          value: 58,
        },
      ],
    },
    {
      personaId: "priya",
      firstImpression:
        "Priya sees a polished vendor surface, but she actively searches for proof that the product will not create security review pain.",
      experiencePath: ["Homepage", "Security and trust scan", "Vendor credibility", "Data handling questions"],
      confusionPoints: [
        "Trust language is present, but not surfaced at the moment she needs it.",
        "She cannot quickly answer what data or organizational risk the product introduces.",
      ],
      trustDelta: -18,
      valueDelta: 8,
      keyMoment: "Trust only recovers if risk, permissions, and governance are explained in plain language.",
      abandonmentRisk:
        "She will block or postpone the evaluation if early compliance and risk questions stay implicit.",
      verdict: "drop",
      journey: [
        {
          step: "01",
          title: "Scans for assurance",
          observation: "She looks for security proof before she looks for product delight.",
          trust: 47,
          value: 34,
        },
        {
          step: "02",
          title: "Questions visibility",
          observation: "Hidden or delayed trust detail makes the vendor feel harder to approve.",
          trust: 35,
          value: 40,
        },
        {
          step: "03",
          title: "Protects review bandwidth",
          observation: "She leaves with a note to revisit only if the business team pushes hard.",
          trust: 29,
          value: 42,
        },
      ],
    },
    {
      personaId: "elena",
      firstImpression:
        "Elena appreciates the restraint and quality of the interface, but still judges the product on how cleanly the mental model unfolds.",
      experiencePath: ["Homepage", "Visual structure", "Workflow examples", "Daily-use imagination"],
      confusionPoints: [
        "The product is visually coherent, yet some of the conceptual hierarchy still asks the user to infer too much.",
        "The first daily-use scenario could be more concrete for individual contributors.",
      ],
      trustDelta: 12,
      valueDelta: 18,
      keyMoment: "She becomes positive when the narrative connects interface craft to actual working rhythm.",
      successMoment:
        "Strong craft plus one believable daily loop makes her confident the product is worth returning to.",
      verdict: "proceed",
      journey: [
        {
          step: "01",
          title: "Reads the interaction tone",
          observation: "Quality and restraint create a strong baseline of credibility.",
          trust: 62,
          value: 46,
        },
        {
          step: "02",
          title: "Tests mental-model clarity",
          observation: "She wants the information architecture to teach the workflow, not just decorate it.",
          trust: 67,
          value: 59,
        },
        {
          step: "03",
          title: "Imagines repeated use",
          observation: "She sees enough coherence to continue, provided onboarding sharpens the first loop.",
          trust: 74,
          value: 64,
        },
      ],
    },
  ];
}

export function createAnalysisJob(input: ProductInput): AnalysisJob {
  const profile = inferProfile(input.target);

  return {
    id: `job-${slugify(profile.name)}-${slugify(input.target || profile.key)}`,
    input,
    status: "running",
    createdAt: new Date().toISOString(),
    stages: createStages(profile),
  };
}

export function buildMockReport(input: ProductInput): Report {
  const safeInput = input.target.trim().length > 0 ? input : { ...input, target: "Linear" };
  const profile = inferProfile(safeInput.target);
  const personas = createPersonas(safeInput);
  const simulations = createSimulations();
  const analysisJob = createAnalysisJob(safeInput);

  return {
    id: `report-${slugify(profile.name)}-${slugify(safeInput.target) || "sample"}`,
    createdAt: new Date().toISOString(),
    input: safeInput,
    productName: profile.name,
    productType: profile.productType,
    productUrl: profile.url,
    promise: profile.promise,
    targetUsers: profile.targetUsers,
    overallConclusion: profile.overallConclusion,
    readinessLabel: profile.readinessLabel,
    readinessScore: profile.readinessScore,
    executiveSummary: profile.executiveSummary,
    biggestRisks: profile.biggestRisks,
    topFixes: profile.topFixes,
    firstValueMoment: profile.firstValueMoment,
    jobsToBeDone: profile.jobsToBeDone,
    metrics: profile.metrics.map((metric) => ({
      ...metric,
      tone: metricTone(metric.value),
    })),
    analysisJob,
    personas,
    simulations,
    crossPersonaFindings: [
      {
        id: "cpf-1",
        title: "Promise clarity trails behind product polish",
        summary:
          "Multiple personas notice quality and seriousness quickly, but still need a clearer sentence for what changes for them on day one.",
        affectedPersonas: ["maya", "kevin", "elena"],
        impact: "activation",
        severity: "high",
      },
      {
        id: "cpf-2",
        title: "Trust proof arrives after interest has already cooled",
        summary:
          "Cautious buyers and technical evaluators need earlier reassurance around risk, governance, and migration before they will recommend further review.",
        affectedPersonas: ["andre", "priya"],
        impact: "trust",
        severity: "critical",
      },
      {
        id: "cpf-3",
        title: "The first-run path assumes too much self-configuration",
        summary:
          "High-intent users can imagine the value, but still want the product to lead them into a narrower success path rather than asking them to design it themselves.",
        affectedPersonas: ["maya", "sofia", "kevin"],
        impact: "activation",
        severity: "high",
      },
      {
        id: "cpf-4",
        title: "Retention upside exists, but only after the first useful loop is visible",
        summary:
          "Users who can picture the recurring working rhythm are likely to stay, yet too many need stronger early scaffolding to reach that moment.",
        affectedPersonas: ["sofia", "elena", "maya"],
        impact: "retention",
        severity: "medium",
      },
    ],
    findings: [
      {
        id: "finding-1",
        title: "The product is visually credible before it is verbally clear",
        category: "Comprehension",
        description:
          "Users infer that the product is serious, but still need a plainer explanation of the problem it solves and for whom.",
        affectedPersonas: ["maya", "kevin", "elena"],
        severity: "high",
        whyItMatters:
          "When clarity trails behind polish, evaluators delay commitment and treat the product as interesting rather than urgent.",
        metricImpact: "activation",
        recommendationDirection:
          "Tighten the hero and first proof block around one crisp outcome statement and one concrete example.",
      },
      {
        id: "finding-2",
        title: "Users must infer the first successful workflow instead of being shown it",
        category: "Activation gap",
        description:
          "The experience asks users to imagine how the product becomes useful instead of staging that success path explicitly.",
        affectedPersonas: ["maya", "sofia", "kevin"],
        severity: "critical",
        whyItMatters:
          "Activation suffers when users cannot see what a successful first session should feel like.",
        metricImpact: "activation",
        recommendationDirection:
          "Create a role-based first-run preview that demonstrates the product in motion before full setup.",
      },
      {
        id: "finding-3",
        title: "Security and risk reassurance is too easy to miss",
        category: "Trust / Privacy / Risk",
        description:
          "Trust signals may exist, but they are not surfaced strongly enough for buyers who screen for governance early.",
        affectedPersonas: ["andre", "priya"],
        severity: "critical",
        whyItMatters:
          "If trust concerns are unresolved, internal champions stop advancing the product regardless of its functional merit.",
        metricImpact: "trust",
        recommendationDirection:
          "Promote security, compliance, and data-handling clarity into the early evaluation layer.",
      },
      {
        id: "finding-4",
        title: "Migration cost is present as anxiety, not as answered evidence",
        category: "Migration cost / switching anxiety",
        description:
          "Technical and operational personas want help estimating adoption effort, but the product leaves too much of that mental load on them.",
        affectedPersonas: ["andre", "sofia", "maya"],
        severity: "high",
        whyItMatters:
          "Users hesitate when they cannot assess the cost of switching relative to the expected gain.",
        metricImpact: "activation",
        recommendationDirection:
          "Provide explicit migration stories, starter templates, and compatibility framing where evaluation begins.",
      },
      {
        id: "finding-5",
        title: "Value communication is stronger for experts than for adjacent stakeholders",
        category: "Value communication",
        description:
          "Users familiar with the category can decode the promise faster than founders, buyers, or cross-functional stakeholders with less domain context.",
        affectedPersonas: ["kevin", "priya", "maya"],
        severity: "medium",
        whyItMatters:
          "Cross-functional buying committees need shared language, not just specialist language, to align quickly.",
        metricImpact: "trust",
        recommendationDirection:
          "Translate product vocabulary into plain-language benefits and stakeholder-specific outcomes.",
      },
      {
        id: "finding-6",
        title: "The path from interest to routine use is implied but not scaffolded",
        category: "Retention gap",
        description:
          "Users can believe the product might become sticky, yet the experience does not fully teach the recurring loop that would make return behavior obvious.",
        affectedPersonas: ["sofia", "elena", "maya"],
        severity: "medium",
        whyItMatters:
          "Return likelihood improves when the product teaches the daily or weekly rhythm it supports.",
        metricImpact: "retention",
        recommendationDirection:
          "Make the repeatable habit explicit with example workflows, check-ins, or template loops.",
      },
      {
        id: "finding-7",
        title: "Pricing and ROI implications remain mostly inferred",
        category: "Pricing / ROI clarity",
        description:
          "Evaluators can sense the product is premium, but not always why that cost is justified at the exact moment they ask the question.",
        affectedPersonas: ["kevin", "maya"],
        severity: "medium",
        whyItMatters:
          "If value proof is not paired with economic framing, founder and PM buyers postpone action.",
        metricImpact: "activation",
        recommendationDirection:
          "Connect pricing to concrete team efficiency or coordination gains instead of leaving ROI abstract.",
      },
      {
        id: "finding-8",
        title: "Important information is findable only if the user is willing to hunt",
        category: "Findability",
        description:
          "The surface has depth, but users under time pressure do not always find the next decisive piece of information fast enough.",
        affectedPersonas: ["kevin", "priya", "andre"],
        severity: "medium",
        whyItMatters:
          "When evaluators must search for critical proof, confidence drops and bounce risk rises.",
        metricImpact: "trust",
        recommendationDirection:
          "Reorder the page so the most decision-making information is surfaced earlier and grouped more tightly.",
      },
    ],
    problemClusters: [
      {
        category: "Findability",
        summary: "Key proof points exist, but time-constrained users do not reach them quickly enough.",
        severity: "medium",
        affectedPersonas: ["kevin", "priya", "andre"],
        whyItMatters: "Critical evaluators bounce when high-signal content is buried below broader narrative layers.",
        fixDirection: "Surface trust, migration, and first-run proof earlier in the scan path.",
      },
      {
        category: "Comprehension",
        summary: "The product sounds intelligent and polished, but the plain-language payoff is still slower than it should be.",
        severity: "high",
        affectedPersonas: ["maya", "kevin", "elena"],
        whyItMatters: "Users delay commitment when they must translate category language into personal relevance on their own.",
        fixDirection: "Rewrite the opening narrative around one crisp outcome and one explicit ideal user.",
      },
      {
        category: "Workflow friction",
        summary: "The flow implies capability depth, but leaves too much self-assembly to the evaluator.",
        severity: "high",
        affectedPersonas: ["maya", "sofia"],
        whyItMatters: "Operational buyers need the system to teach them how to start, not just what exists.",
        fixDirection: "Introduce guided role-based entry paths and narrower starter flows.",
      },
      {
        category: "Trust / Privacy / Risk",
        summary: "Trust is supported by craft, yet craft does not replace early reassurance for cautious stakeholders.",
        severity: "critical",
        affectedPersonas: ["andre", "priya"],
        whyItMatters: "Trust blockers can stop evaluation entirely, even when product appeal is otherwise strong.",
        fixDirection: "Bring security, governance, and vendor maturity proof into the earliest decision layer.",
      },
      {
        category: "Value communication",
        summary: "Expert users can decode the promise faster than adjacent decision-makers.",
        severity: "medium",
        affectedPersonas: ["kevin", "maya", "priya"],
        whyItMatters: "Cross-functional buying becomes fragile when the product cannot be re-explained clearly inside the team.",
        fixDirection: "Create stakeholder-specific language blocks and before-and-after examples.",
      },
      {
        category: "Pricing / ROI clarity",
        summary: "The cost-quality impression is premium, but ROI proof is not explicit enough in the early journey.",
        severity: "medium",
        affectedPersonas: ["kevin", "maya"],
        whyItMatters: "Buyers hesitate when pricing questions arrive before value has been concretely quantified.",
        fixDirection: "Tie price to role-specific efficiency and coordination outcomes.",
      },
      {
        category: "Migration cost / switching anxiety",
        summary: "Users expect some switching effort, but the product does not yet help them estimate or de-risk it.",
        severity: "high",
        affectedPersonas: ["andre", "sofia", "maya"],
        whyItMatters: "Adoption stalls when migration feels like a hidden second project.",
        fixDirection: "Add migration stories, import clarity, and implementation blueprints early.",
      },
      {
        category: "Activation gap",
        summary: "The first moment of obvious value is real, but it shows up too late and too indirectly.",
        severity: "critical",
        affectedPersonas: ["maya", "kevin", "sofia"],
        whyItMatters: "Activation drops when users must imagine the aha moment instead of experiencing a credible preview of it.",
        fixDirection: "Show the smallest complete workflow before asking for organizational context.",
      },
      {
        category: "Retention gap",
        summary: "The recurring habit is plausible, but not yet taught clearly enough during evaluation.",
        severity: "medium",
        affectedPersonas: ["maya", "sofia", "elena"],
        whyItMatters: "Users return when they can see the rhythm they will live in, not just the features they could use.",
        fixDirection: "Teach the weekly or daily loop with examples, templates, and recurring value cues.",
      },
    ],
    recommendations: [
      {
        id: "rec-1",
        priority: "P0",
        title: "Lead with one role-based first-run proof path",
        solves: "Activation gap and comprehension delay in the first five minutes.",
        affectedPersonas: ["maya", "kevin", "sofia"],
        rationale:
          "Users need one narrow path that demonstrates the workflow outcome before they are asked to configure a system.",
        metricImpact: "activation",
        actions: [
          "Show a live or staged sample workflow directly beneath the hero.",
          "Offer a small set of role-based entry routes such as PM, founder, or operator.",
          "Frame the first session around a concrete task, not a broad product tour.",
        ],
      },
      {
        id: "rec-2",
        priority: "P0",
        title: "Move trust and governance proof into the top decision layer",
        solves: "Early trust collapse for cautious buyers and technical evaluators.",
        affectedPersonas: ["andre", "priya"],
        rationale:
          "Security and risk questions are not side concerns; for some users, they determine whether the evaluation continues at all.",
        metricImpact: "trust",
        actions: [
          "Surface security, permissions, and vendor maturity cues near the first CTA.",
          "Explain data handling in plain language, not only through documentation links.",
          "Use short trust modules that can be scanned without leaving the core page.",
        ],
      },
      {
        id: "rec-3",
        priority: "P1",
        title: "Rewrite the opening narrative around outcomes instead of category fluency",
        solves: "Value communication gaps for founders, PMs, and adjacent stakeholders.",
        affectedPersonas: ["maya", "kevin", "priya"],
        rationale:
          "The product speaks clearly to insiders, but wider evaluation depends on language that is easy to repeat inside a buying group.",
        metricImpact: "activation",
        actions: [
          "Tighten the headline and subheading to one explicit problem-outcome pair.",
          "Replace abstract language with before-and-after operational changes.",
          "Add stakeholder-specific microcopy that explains relevance by role.",
        ],
      },
      {
        id: "rec-4",
        priority: "P1",
        title: "Reduce switching anxiety with concrete migration evidence",
        solves: "Hidden adoption-cost concerns during evaluation.",
        affectedPersonas: ["andre", "sofia", "maya"],
        rationale:
          "Users need migration to feel bounded and well-supported before they will invest time in deeper setup.",
        metricImpact: "activation",
        actions: [
          "Show import paths, migration stories, and implementation examples.",
          "Explain what users can keep versus what they must change.",
          "Turn setup into a staged path with visible scope and expected effort.",
        ],
      },
      {
        id: "rec-5",
        priority: "P2",
        title: "Teach the repeatable habit earlier in the evaluation narrative",
        solves: "Retention gaps caused by an under-explained ongoing workflow loop.",
        affectedPersonas: ["maya", "sofia", "elena"],
        rationale:
          "Users return when they can picture the rhythm the product will support every week.",
        metricImpact: "retention",
        actions: [
          "Use a simple weekly loop or operating cadence illustration.",
          "Highlight recurring checkpoints, reviews, or workflows the product improves.",
          "Show how the first setup evolves into day-two and week-two value.",
        ],
      },
      {
        id: "rec-6",
        priority: "P2",
        title: "Connect pricing to concrete leverage instead of perceived premium",
        solves: "ROI ambiguity when users begin evaluating commercial fit.",
        affectedPersonas: ["kevin", "maya"],
        rationale:
          "Premium products still need explicit economic framing if they want fast evaluation momentum.",
        metricImpact: "activation",
        actions: [
          "Pair pricing cues with saved coordination time or reduced process overhead.",
          "Add role-specific ROI examples instead of generic premium signaling.",
          "Clarify which team size or workflow complexity makes the product worth adopting.",
        ],
      },
    ],
    evidence: profile.evidence,
    assumptions: [
      "The analysis is based on public-facing product framing and inferred first-run flow, not authenticated usage.",
      "Persona behavior models assume first-time evaluation context rather than a deeply motivated enterprise procurement process.",
      "Some trust and migration conclusions depend on what is emphasized publicly, not on the full underlying product capability.",
      safeInput.notes ?
        `User notes were treated as context: ${safeInput.notes}`
      : "No extra user notes were provided, so audience nuance is inferred from the product surface.",
    ],
    validationNeeds: [
      "Confirm whether real first-time users can describe the product promise in one sentence after the first screen.",
      "Run live interviews with one skeptical technical evaluator and one cautious buyer to verify the trust-risk pattern.",
      "Measure whether a narrower first-run path improves demo requests, sign-up conversion, or activation completion.",
      "Test whether outcome-based copy reduces the need for users to decode category-specific language.",
    ],
  };
}

export function buildExampleReports() {
  return [
    buildMockReport({ target: "Linear", focus: "activation" }),
    buildMockReport({ target: "Figma", focus: "first-impression" }),
    buildMockReport({ target: "Atlas Board", focus: "trust" }),
  ];
}
