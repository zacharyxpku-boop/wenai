export type PocReportDecision = 'push-contract' | 'expand-sku' | 'iterate' | 'needs-input';
export type PocBenchmarkPresetId = 'catalog-launch' | 'feed-ops' | 'creative-test' | 'market-qa';
export type PocCommercialMotion = 'close-now' | 'paid-expansion' | 'fix-and-rescore' | 'hold';

export interface PocReportInput {
  category?: string;
  benchmarkPreset?: PocBenchmarkPresetId | '';
  skuPlanned: number;
  skuDelivered: number;
  finalReviewPassRate: number;
  benchmarkCoverage: number;
  riskCount: number;
  missingAssetCount: number;
  reworkCount: number;
  contentTestReady: boolean;
  ownerReady: boolean;
  contractIntent: boolean;
}

export interface PocCategoryThreshold {
  finalReviewPassRate: number;
  benchmarkCoverage: number;
  maxRiskCount: number;
  maxMissingAssetCount: number;
  maxReworkCount: number;
}

export interface PocBenchmarkPreset {
  id: PocBenchmarkPresetId;
  label: string;
  inspiredBy: string;
  target: string;
  acceptanceFocus: string[];
  contractFraming: string;
}

export interface PocBenchmarkLane {
  id: PocBenchmarkPresetId;
  label: string;
  competitorPattern: string;
  customerQuestion: string;
  wenaiMoat: string;
  proofToCollect: string[];
  acceptanceSignals: string[];
}

export interface PocScoreRubric {
  scoreWeights: Array<{ label: string; weight: string; note: string }>;
  penalties: Array<{ label: string; maxPenalty: string; note: string }>;
  outcomeBands: Array<{ label: string; condition: string; commercialMeaning: string }>;
  requiredInputs: string[];
}

export interface PocBenchmarkRecommendation {
  preset: PocBenchmarkPreset;
  confidence: number;
  reasons: string[];
  nextInput: string;
}

export interface PocCategoryPlaybook {
  key: string;
  label: string;
  operatorLens: string;
  benchmarkSignals: string[];
  riskChecks: string[];
  proposalAngles: string[];
}

export interface PocAdvisorAnswers {
  goal: 'launch-catalog' | 'fix-feed' | 'test-creative' | 'reduce-risk';
  category: string;
  skuScope: 'small' | 'poc' | 'large';
  materialState: 'ready' | 'partial' | 'missing';
  benchmarkState: 'strong' | 'some' | 'none';
  riskLevel: 'low' | 'medium' | 'high';
  contractIntent: boolean;
}

export interface PocAdvisorResult {
  input: PocReportInput;
  summary: string;
  assumptions: string[];
}

export interface PocAdvisorPreset {
  key: string;
  label: string;
  answers: PocAdvisorAnswers;
  rationale: string;
}

export interface PocDemoScenario {
  key: string;
  label: string;
  segment: string;
  input: PocReportInput;
  note: string;
}

export interface PocReportEvaluation {
  acceptanceScore: number;
  decision: PocReportDecision;
  label: string;
  nextStep: string;
  blockers: string[];
  strengths: string[];
  reportMarkdown: string;
  handoffMarkdown: string;
  contractStatus: 'ready' | 'warm' | 'blocked' | 'not-ready';
  sla: {
    nextAction: string;
    dueDays: number;
    severity: 'normal' | 'urgent' | 'blocked';
  };
  commercial: PocCommercialBriefing;
  playbook: PocCategoryPlaybook;
}

export interface PocCommercialBriefing {
  commercialScore: number;
  motion: PocCommercialMotion;
  label: string;
  executiveSummary: string;
  packageRecommendation: string;
  priceSignal: 'premium-retainer' | 'paid-pilot' | 'repair-sprint' | 'not-ready';
  ownerMessage: string;
  proofPoints: string[];
  conversionRisks: string[];
  nextActions: string[];
  proposalChecklist: string[];
  closePlan: Array<{ day: string; action: string; owner: string }>;
  buyerFollowupMarkdown: string;
  salesPackMarkdown: string;
  boardMarkdown: string;
}

export const DEFAULT_POC_REPORT_INPUT: PocReportInput = {
  category: '',
  benchmarkPreset: '',
  skuPlanned: 10,
  skuDelivered: 8,
  finalReviewPassRate: 72,
  benchmarkCoverage: 68,
  riskCount: 2,
  missingAssetCount: 1,
  reworkCount: 2,
  contentTestReady: true,
  ownerReady: true,
  contractIntent: false,
};

const DEFAULT_PLAYBOOK: PocCategoryPlaybook = {
  key: 'generic',
  label: 'Generic ecommerce lane',
  operatorLens: 'Prove the team can turn incomplete SKU facts into reviewable assets without hiding missing inputs.',
  benchmarkSignals: ['Competitive listing structure', 'Asset completeness', 'Review pass rate'],
  riskChecks: ['Missing attributes', 'Unclear buyer promise', 'No review owner'],
  proposalAngles: ['Pilot a repeatable SKU lane', 'Reduce operator back-and-forth', 'Standardize acceptance evidence'],
};

const DEFAULT_THRESHOLDS: PocCategoryThreshold = {
  finalReviewPassRate: 80,
  benchmarkCoverage: 75,
  maxRiskCount: 1,
  maxMissingAssetCount: 1,
  maxReworkCount: 2,
};

const CATEGORY_THRESHOLDS: Record<string, PocCategoryThreshold> = {
  home: { finalReviewPassRate: 78, benchmarkCoverage: 72, maxRiskCount: 1, maxMissingAssetCount: 1, maxReworkCount: 2 },
  living: { finalReviewPassRate: 78, benchmarkCoverage: 72, maxRiskCount: 1, maxMissingAssetCount: 1, maxReworkCount: 2 },
  digital: { finalReviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, maxMissingAssetCount: 0, maxReworkCount: 1 },
  auto: { finalReviewPassRate: 86, benchmarkCoverage: 82, maxRiskCount: 0, maxMissingAssetCount: 0, maxReworkCount: 1 },
  tool: { finalReviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, maxMissingAssetCount: 0, maxReworkCount: 1 },
  beauty: { finalReviewPassRate: 86, benchmarkCoverage: 82, maxRiskCount: 0, maxMissingAssetCount: 0, maxReworkCount: 1 },
  apparel: { finalReviewPassRate: 82, benchmarkCoverage: 78, maxRiskCount: 1, maxMissingAssetCount: 1, maxReworkCount: 2 },
  pet: { finalReviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, maxMissingAssetCount: 0, maxReworkCount: 1 },
  outdoor: { finalReviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, maxMissingAssetCount: 0, maxReworkCount: 1 },
  supplement: { finalReviewPassRate: 88, benchmarkCoverage: 84, maxRiskCount: 0, maxMissingAssetCount: 0, maxReworkCount: 1 },
  mixed: { finalReviewPassRate: 82, benchmarkCoverage: 78, maxRiskCount: 1, maxMissingAssetCount: 1, maxReworkCount: 2 },
  other: DEFAULT_THRESHOLDS,
};

const CATEGORY_PLAYBOOKS: Record<string, PocCategoryPlaybook> = {
  home: {
    key: 'home',
    label: 'Home / living playbook',
    operatorLens: 'Winning home listings need scene clarity, storage/use-case storytelling, and realistic dimensions that reduce returns.',
    benchmarkSignals: ['Lifestyle image direction', 'Dimension/spec clarity', 'Material and finish proof'],
    riskChecks: ['False material claims', 'Scene mismatch vs actual size', 'Assembly or care instructions missing'],
    proposalAngles: ['Reduce listing ambiguity before scale', 'Turn scene-led content into repeatable launch assets', 'Support cross-channel merchandising quality'],
  },
  living: {
    key: 'living',
    label: 'Home / living playbook',
    operatorLens: 'Winning home listings need scene clarity, storage/use-case storytelling, and realistic dimensions that reduce returns.',
    benchmarkSignals: ['Lifestyle image direction', 'Dimension/spec clarity', 'Material and finish proof'],
    riskChecks: ['False material claims', 'Scene mismatch vs actual size', 'Assembly or care instructions missing'],
    proposalAngles: ['Reduce listing ambiguity before scale', 'Turn scene-led content into repeatable launch assets', 'Support cross-channel merchandising quality'],
  },
  digital: {
    key: 'digital',
    label: 'Digital electronics playbook',
    operatorLens: 'Electronics POCs should prove compatibility, spec accuracy, and safe promise framing before creative scale.',
    benchmarkSignals: ['Compatibility claims', 'Feature-to-benefit mapping', 'Benchmark-backed hook clarity'],
    riskChecks: ['Overstated performance', 'Unsupported compatibility promise', 'Accessory/package omissions'],
    proposalAngles: ['Improve trust before paid traffic', 'Cut support tickets through clearer compatibility framing', 'Translate specs into conversion-ready content'],
  },
  auto: {
    key: 'auto',
    label: 'Auto accessory playbook',
    operatorLens: 'Auto listings win when fitment, installation, and safety boundaries are explicit enough to avoid the wrong buyer.',
    benchmarkSignals: ['Vehicle fitment evidence', 'Install guidance quality', 'Safety/compliance note coverage'],
    riskChecks: ['Fitment ambiguity', 'Unsafe claim language', 'Missing installation visuals'],
    proposalAngles: ['Protect the brand from return-heavy traffic', 'Use fitment clarity as the commercial story', 'Position the service as a controlled launch lane'],
  },
  tool: {
    key: 'tool',
    label: 'Tool / hardware playbook',
    operatorLens: 'Tool POCs need performance proof, material/spec accuracy, and a sober safety voice that survives human review.',
    benchmarkSignals: ['Load/performance framing', 'Material/spec precision', 'Operator-ready feature comparison'],
    riskChecks: ['Unsafe usage implications', 'Unsupported durability claim', 'Spec inconsistency across assets'],
    proposalAngles: ['Raise trust with sharper operator detail', 'Reduce review friction for higher-risk hardware', 'Turn technical specs into scalable launch SOP'],
  },
  beauty: {
    key: 'beauty',
    label: 'Beauty / personal care playbook',
    operatorLens: 'Beauty POCs need ingredient clarity, shade/use-case framing, and careful claim language before a listing can scale.',
    benchmarkSignals: ['Ingredient and texture proof', 'Shade or routine context', 'Before/after claim restraint'],
    riskChecks: ['Unsupported efficacy claim', 'Missing ingredient/allergen note', 'Misleading skin result framing'],
    proposalAngles: ['Protect trust with claim-safe beauty copy', 'Turn routine-led content into reusable assets', 'Prepare the SKU for creator and paid-social testing'],
  },
  apparel: {
    key: 'apparel',
    label: 'Apparel / fashion playbook',
    operatorLens: 'Apparel POCs should prove fit, size, material, and model/context clarity so the buyer can trust the SKU before traffic scales.',
    benchmarkSignals: ['Size and fit guide', 'Fabric/material proof', 'On-model or styling context'],
    riskChecks: ['Size chart ambiguity', 'Color/material mismatch', 'Care instruction missing'],
    proposalAngles: ['Reduce return risk with clearer fit evidence', 'Package styling angles for content testing', 'Standardize variant-heavy SKU launches'],
  },
  pet: {
    key: 'pet',
    label: 'Pet supply playbook',
    operatorLens: 'Pet listings need species, size, safety, and usage boundaries that reassure owners without overpromising outcomes.',
    benchmarkSignals: ['Species/size compatibility', 'Safety and material notes', 'Use-case proof for owner trust'],
    riskChecks: ['Unsafe usage implication', 'Unclear pet size compatibility', 'Unsupported health or behavior claim'],
    proposalAngles: ['Build trust with compatibility-first listing structure', 'Reduce support friction around size and use', 'Create owner-friendly proof for social testing'],
  },
  outdoor: {
    key: 'outdoor',
    label: 'Outdoor / sports playbook',
    operatorLens: 'Outdoor POCs need durability, weather/context fit, and safety boundaries that stand up to comparison-heavy buyers.',
    benchmarkSignals: ['Durability and material framing', 'Use-environment context', 'Packability or installation proof'],
    riskChecks: ['Overstated weatherproof claim', 'Missing load/safety boundary', 'No real-use context'],
    proposalAngles: ['Turn technical specs into trust signals', 'Clarify use scenarios before campaign spend', 'Package outdoor proof into repeatable launch assets'],
  },
  supplement: {
    key: 'supplement',
    label: 'Supplement / wellness playbook',
    operatorLens: 'Supplement POCs are high-risk: claims, ingredients, dosage, and disclaimers must be clear before any commercial push.',
    benchmarkSignals: ['Ingredient and dosage clarity', 'Claim-safe benefit framing', 'Disclaimer and restriction coverage'],
    riskChecks: ['Medical or disease claim', 'Missing dosage or ingredient note', 'No compliance review owner'],
    proposalAngles: ['Sell this as a claim-safety and review-control lane', 'Protect the brand before traffic or creator scale', 'Separate compliant education from prohibited promises'],
  },
  mixed: {
    key: 'mixed',
    label: 'Mixed-category playbook',
    operatorLens: 'Mixed-category POCs should prove the workflow can normalize inconsistent SKU inputs across multiple operator contexts.',
    benchmarkSignals: ['Cross-category consistency', 'Shared acceptance structure', 'Reusable review evidence'],
    riskChecks: ['One-size-fits-all copy tone', 'Inconsistent attribute depth', 'No category-specific review note'],
    proposalAngles: ['Sell workflow consistency, not only content output', 'Use POC to prove handoff hygiene across teams', 'Position the service as a repeatable operating layer'],
  },
  other: DEFAULT_PLAYBOOK,
};

const ADVISOR_PRESET_BY_CATEGORY: Record<string, PocAdvisorPreset> = {
  home: {
    key: 'home',
    label: 'Home launch quick-start',
    answers: { goal: 'launch-catalog', category: 'home', skuScope: 'poc', materialState: 'partial', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Start with catalog launch plus asset/compliance review because home categories often fail on dimensions, scene fit, and materials.',
  },
  living: {
    key: 'living',
    label: 'Living launch quick-start',
    answers: { goal: 'launch-catalog', category: 'living', skuScope: 'poc', materialState: 'partial', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Use a scene-led catalog POC and verify dimensions, material claims, and care details before scale.',
  },
  digital: {
    key: 'digital',
    label: 'Electronics QA quick-start',
    answers: { goal: 'reduce-risk', category: 'digital', skuScope: 'poc', materialState: 'ready', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Start with market QA because specs, compatibility, and performance claims need stronger review before creative testing.',
  },
  auto: {
    key: 'auto',
    label: 'Auto fitment quick-start',
    answers: { goal: 'reduce-risk', category: 'auto', skuScope: 'poc', materialState: 'partial', benchmarkState: 'some', riskLevel: 'high', contractIntent: false },
    rationale: 'Auto accessories should begin with fitment, installation, and safety review before any contract push.',
  },
  tool: {
    key: 'tool',
    label: 'Hardware proof quick-start',
    answers: { goal: 'reduce-risk', category: 'tool', skuScope: 'poc', materialState: 'ready', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Tool and hardware POCs need proof-led specs and safety framing before expansion.',
  },
  beauty: {
    key: 'beauty',
    label: 'Beauty claim-safe quick-start',
    answers: { goal: 'reduce-risk', category: 'beauty', skuScope: 'poc', materialState: 'partial', benchmarkState: 'some', riskLevel: 'high', contractIntent: false },
    rationale: 'Beauty should start with claim-safe content, ingredient clarity, and routine context before UGC or paid testing.',
  },
  apparel: {
    key: 'apparel',
    label: 'Apparel fit quick-start',
    answers: { goal: 'launch-catalog', category: 'apparel', skuScope: 'large', materialState: 'partial', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Apparel benefits from a larger variant-aware launch lane with fit, size, material, and styling proof.',
  },
  pet: {
    key: 'pet',
    label: 'Pet safety quick-start',
    answers: { goal: 'reduce-risk', category: 'pet', skuScope: 'poc', materialState: 'ready', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Pet supplies should validate compatibility, safety, and owner trust signals before scaling.',
  },
  outdoor: {
    key: 'outdoor',
    label: 'Outdoor proof quick-start',
    answers: { goal: 'launch-catalog', category: 'outdoor', skuScope: 'poc', materialState: 'ready', benchmarkState: 'strong', riskLevel: 'medium', contractIntent: false },
    rationale: 'Outdoor SKUs need durability, weather/context fit, and use-case evidence before campaign spend.',
  },
  supplement: {
    key: 'supplement',
    label: 'Supplement compliance quick-start',
    answers: { goal: 'reduce-risk', category: 'supplement', skuScope: 'small', materialState: 'partial', benchmarkState: 'some', riskLevel: 'high', contractIntent: false },
    rationale: 'Supplement POCs must start with claim safety, ingredient/dosage clarity, and compliance owner review.',
  },
  mixed: {
    key: 'mixed',
    label: 'Mixed-category ops quick-start',
    answers: { goal: 'fix-feed', category: 'mixed', skuScope: 'poc', materialState: 'partial', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Mixed-category work should prove input normalization, feed/listing hygiene, and review consistency.',
  },
  other: {
    key: 'other',
    label: 'Generic ecommerce quick-start',
    answers: { goal: 'launch-catalog', category: 'other', skuScope: 'poc', materialState: 'partial', benchmarkState: 'some', riskLevel: 'medium', contractIntent: false },
    rationale: 'Use a conservative launch POC until a more specific category playbook exists.',
  },
};

export const POC_DEMO_SCENARIOS: PocDemoScenario[] = [
  {
    key: 'home-ready',
    label: 'Home launch ready',
    segment: 'Home / living',
    note: 'A strong 10 SKU home batch with enough review evidence to push toward contract.',
    input: {
      category: 'home',
      benchmarkPreset: 'catalog-launch',
      skuPlanned: 10,
      skuDelivered: 10,
      finalReviewPassRate: 90,
      benchmarkCoverage: 86,
      riskCount: 0,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
    },
  },
  {
    key: 'beauty-claim-risk',
    label: 'Beauty claim risk',
    segment: 'Beauty',
    note: 'A beauty POC with useful content signals but claim and ingredient risk blocking a contract push.',
    input: {
      category: 'beauty',
      benchmarkPreset: 'market-qa',
      skuPlanned: 10,
      skuDelivered: 8,
      finalReviewPassRate: 76,
      benchmarkCoverage: 74,
      riskCount: 2,
      missingAssetCount: 1,
      reworkCount: 2,
      contentTestReady: false,
      ownerReady: true,
      contractIntent: false,
    },
  },
  {
    key: 'apparel-expansion',
    label: 'Apparel expansion',
    segment: 'Apparel',
    note: 'A variant-heavy apparel batch that is good enough for paid expansion but not a full retainer yet.',
    input: {
      category: 'apparel',
      benchmarkPreset: 'catalog-launch',
      skuPlanned: 20,
      skuDelivered: 18,
      finalReviewPassRate: 82,
      benchmarkCoverage: 79,
      riskCount: 1,
      missingAssetCount: 1,
      reworkCount: 2,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: false,
    },
  },
  {
    key: 'supplement-hold',
    label: 'Supplement hold',
    segment: 'Supplement',
    note: 'A high-risk supplement POC where claim safety and compliance review should come before sales pressure.',
    input: {
      category: 'supplement',
      benchmarkPreset: 'market-qa',
      skuPlanned: 5,
      skuDelivered: 4,
      finalReviewPassRate: 68,
      benchmarkCoverage: 66,
      riskCount: 3,
      missingAssetCount: 1,
      reworkCount: 3,
      contentTestReady: false,
      ownerReady: false,
      contractIntent: false,
    },
  },
];

export function getPocDemoScenario(key: string): PocDemoScenario | undefined {
  return POC_DEMO_SCENARIOS.find(item => item.key === key);
}

export const POC_BENCHMARK_PRESETS: Record<PocBenchmarkPresetId, PocBenchmarkPreset> = {
  'catalog-launch': {
    id: 'catalog-launch',
    label: 'Catalog launch pack',
    inspiredBy: 'Hypotenuse-style bulk content generation and PIM workflows',
    target: 'Turn SKU facts into platform-ready titles, bullets, descriptions, compliance notes, and reviewable launch assets.',
    acceptanceFocus: ['SKU attribute completeness', 'brand voice consistency', 'bulk export readiness', 'human review pass rate'],
    contractFraming: 'Sell this as a repeatable catalog launch lane for teams with frequent SKU drops.',
  },
  'feed-ops': {
    id: 'feed-ops',
    label: 'Marketplace feed ops',
    inspiredBy: 'Feedonomics-style feed optimization, channel QA, and error monitoring',
    target: 'Prepare cross-channel listing quality, missing data checks, marketplace constraints, and operational follow-up.',
    acceptanceFocus: ['channel field coverage', 'listing error reduction', 'asset missing-rate', 'SLA follow-up hygiene'],
    contractFraming: 'Sell this as an operations layer that reduces feed/listing rework before scale.',
  },
  'creative-test': {
    id: 'creative-test',
    label: 'Creative test pack',
    inspiredBy: 'ConversionStudio / POPJAM / CreaBoost-style angle generation and creative testing',
    target: 'Convert SKU insights into hooks, image/video angles, UGC directions, and a testable creative matrix.',
    acceptanceFocus: ['hook diversity', 'benchmark-backed angles', 'content test readiness', 'next-batch learning loop'],
    contractFraming: 'Sell this as the bridge from launch assets to paid/social creative testing.',
  },
  'market-qa': {
    id: 'market-qa',
    label: 'Market QA pack',
    inspiredBy: 'AI listing QA and marketplace readiness workflows',
    target: 'Stress-test claims, compliance, benchmark fit, buyer objections, and review-owner decisions before handoff.',
    acceptanceFocus: ['risk count', 'claim safety', 'benchmark evidence', 'review owner clarity'],
    contractFraming: 'Sell this as a safety and governance layer before moving POC output into the main commercial workflow.',
  },
};

export const POC_BENCHMARK_LANES: PocBenchmarkLane[] = [
  {
    id: 'catalog-launch',
    label: 'Catalog launch lane',
    competitorPattern: 'Bulk content and PIM-style workflows prove speed, brand voice, formatting, and export readiness.',
    customerQuestion: 'Can wenai turn real SKU facts into publishable launch assets without creating review chaos?',
    wenaiMoat: 'Connects catalog generation to acceptance scoring, category thresholds, recap packs, and contract handoff.',
    proofToCollect: ['SKU attribute table', 'brand voice examples', 'export format', 'final reviewer'],
    acceptanceSignals: ['10 SKU coverage', 'brand voice consistency', 'bulk export readiness', 'human review pass rate'],
  },
  {
    id: 'feed-ops',
    label: 'Feed ops lane',
    competitorPattern: 'Feed platforms win through channel coverage, data transformations, governance rules, and operator support.',
    customerQuestion: 'Are missing fields, channel requirements, and listing errors controlled enough to scale?',
    wenaiMoat: 'Turns feed/listing hygiene into a repairable POC with SLA, missing-asset owners, and rescore actions.',
    proofToCollect: ['channel field requirements', 'error examples', 'missing asset list', 'marketplace constraints'],
    acceptanceSignals: ['channel field coverage', 'listing error reduction', 'asset missing-rate', 'SLA follow-up hygiene'],
  },
  {
    id: 'creative-test',
    label: 'Creative test lane',
    competitorPattern: 'Creative AI tools package hooks, angles, UGC directions, and test plans from product inputs.',
    customerQuestion: 'Can the SKU output become testable content angles instead of static listing copy?',
    wenaiMoat: 'Bridges launch assets into a repeatable creative matrix with next-batch learning and sales follow-up.',
    proofToCollect: ['benchmark links', 'hook hypotheses', 'creative formats', 'test success thresholds'],
    acceptanceSignals: ['hook diversity', 'benchmark-backed angles', 'content test readiness', 'next-batch learning loop'],
  },
  {
    id: 'market-qa',
    label: 'Market QA lane',
    competitorPattern: 'Marketplace readiness tools reduce risk by checking claims, buyer objections, and policy boundaries.',
    customerQuestion: 'Should this POC be sold now, repaired first, or blocked until a review owner exists?',
    wenaiMoat: 'Makes commercial restraint visible: claim safety, compliance owner, blockers, and repair sprint are all explicit.',
    proofToCollect: ['restricted claims', 'compliance constraints', 'buyer objections', 'final review owner'],
    acceptanceSignals: ['risk count', 'claim safety', 'benchmark evidence', 'review owner clarity'],
  },
];

export const POC_SCORE_RUBRIC: PocScoreRubric = {
  scoreWeights: [
    { label: 'Delivery coverage', weight: '24%', note: 'Delivered SKU divided by planned SKU; proves whether the batch is representative.' },
    { label: 'Final review pass rate', weight: '24%', note: 'Human review quality gate; category thresholds can be stricter than the global score.' },
    { label: 'Benchmark coverage', weight: '18%', note: 'How much market evidence supports the output instead of internal opinion.' },
    { label: 'Content test readiness', weight: '+14 pts', note: 'Adds growth readiness when hooks, assets, and test shape are ready.' },
    { label: 'Review owner assigned', weight: '+12 pts', note: 'Prevents the handoff from stalling after the report is shared.' },
    { label: 'Contract intent', weight: '+8 pts', note: 'Recognizes buyer intent without letting intent override delivery quality.' },
  ],
  penalties: [
    { label: 'Rework count', maxPenalty: '-20 pts', note: 'Each rework point reduces confidence that the process can scale.' },
    { label: 'Risk count', maxPenalty: '-25 pts', note: 'Compliance, claim, fitment, or product-risk items block aggressive selling.' },
    { label: 'Missing assets', maxPenalty: '-20 pts', note: 'Missing images, specs, or benchmark inputs weaken the delivery story.' },
  ],
  outcomeBands: [
    { label: 'Push contract', condition: 'Score >= 82, contract intent exists, owner assigned, no blockers', commercialMeaning: 'Move to main-site contract or payment flow.' },
    { label: 'Expand SKU batch', condition: 'Score >= 70 but not fully contract-ready', commercialMeaning: 'Sell a paid expansion or next SKU batch with the same rubric.' },
    { label: 'Iterate POC', condition: 'Score < 70 with enough input to repair', commercialMeaning: 'Fix quality/risk gaps and rescore before a larger ask.' },
    { label: 'Collect inputs first', condition: '4+ blockers or zero delivered SKU', commercialMeaning: 'Do not sell yet; collect materials, benchmark proof, and owner sign-off.' },
  ],
  requiredInputs: [
    'planned SKU count',
    'delivered SKU count',
    'final review pass rate',
    'benchmark coverage',
    'risk count',
    'missing asset count',
    'rework count',
    'content-test readiness',
    'review owner',
    'contract intent',
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function percent(value: number, base: number): number {
  if (base <= 0) return 0;
  return Math.round((value / base) * 100);
}

export function getPocCategoryThreshold(category?: string): PocCategoryThreshold {
  return CATEGORY_THRESHOLDS[(category || '').trim()] || DEFAULT_THRESHOLDS;
}

export function getPocCategoryPlaybook(category?: string): PocCategoryPlaybook {
  return CATEGORY_PLAYBOOKS[(category || '').trim()] || DEFAULT_PLAYBOOK;
}

export function getPocAdvisorPreset(category?: string): PocAdvisorPreset {
  return ADVISOR_PRESET_BY_CATEGORY[(category || '').trim()] || ADVISOR_PRESET_BY_CATEGORY.other;
}

export function getPocBenchmarkPreset(id?: string): PocBenchmarkPreset {
  return POC_BENCHMARK_PRESETS[(id || '').trim() as PocBenchmarkPresetId] || POC_BENCHMARK_PRESETS['catalog-launch'];
}

export function getPocBenchmarkLane(id?: string): PocBenchmarkLane {
  return POC_BENCHMARK_LANES.find(item => item.id === (id || '').trim()) || POC_BENCHMARK_LANES[0];
}

export function recommendPocBenchmarkPreset(input: PocReportInput): PocBenchmarkRecommendation {
  const scores: Record<PocBenchmarkPresetId, number> = {
    'catalog-launch': 42,
    'feed-ops': 34,
    'creative-test': 32,
    'market-qa': 30,
  };
  const reasons: Record<PocBenchmarkPresetId, string[]> = {
    'catalog-launch': [],
    'feed-ops': [],
    'creative-test': [],
    'market-qa': [],
  };

  if (input.skuPlanned >= 10) {
    scores['catalog-launch'] += 18;
    reasons['catalog-launch'].push('10+ SKU scope needs a repeatable catalog launch lane.');
  }
  if (input.missingAssetCount > 0 || input.skuDelivered < input.skuPlanned) {
    scores['feed-ops'] += 20;
    reasons['feed-ops'].push('Missing assets or incomplete delivery point to feed/listing ops gaps.');
  }
  if (input.contentTestReady) {
    scores['creative-test'] += 20;
    reasons['creative-test'].push('Content testing is ready, so creative-angle validation can carry the next step.');
  }
  if (input.benchmarkCoverage >= 75) {
    scores['creative-test'] += 8;
    reasons['creative-test'].push('Benchmark coverage is strong enough to support creative angle testing.');
  }
  if (input.riskCount > 0 || input.finalReviewPassRate < 80 || ['auto', 'digital', 'tool'].includes(input.category || '')) {
    scores['market-qa'] += 22;
    reasons['market-qa'].push('Risk, category sensitivity, or low review pass rate needs market QA before contract motion.');
  }
  if (input.finalReviewPassRate >= 82 && input.missingAssetCount === 0 && input.reworkCount <= 1) {
    scores['catalog-launch'] += 10;
    reasons['catalog-launch'].push('Review quality and asset completeness support a scalable launch SOP.');
  }

  const winnerId = (Object.entries(scores) as Array<[PocBenchmarkPresetId, number]>)
    .sort((a, b) => b[1] - a[1])[0][0];
  const scoreValues = Object.values(scores);
  const confidence = Math.min(96, Math.max(55, scores[winnerId] + Math.round((scores[winnerId] - Math.max(...scoreValues.filter(v => v !== scores[winnerId]))) / 2)));
  const preset = getPocBenchmarkPreset(winnerId);
  const nextInput =
    winnerId === 'catalog-launch'
      ? 'Prepare SKU attribute table, brand voice examples, and export format requirements.'
      : winnerId === 'feed-ops'
        ? 'Prepare channel field requirements, error examples, missing asset list, and marketplace constraints.'
        : winnerId === 'creative-test'
          ? 'Prepare benchmark links, hook hypotheses, creative formats, and test success thresholds.'
          : 'Prepare restricted claims, compliance constraints, buyer objections, and final review owner.';

  return {
    preset,
    confidence,
    reasons: reasons[winnerId].length > 0 ? reasons[winnerId] : ['Default catalog launch lane is the safest starting point for a SKU POC.'],
    nextInput,
  };
}

export function buildPocReportInputFromAdvisor(answers: PocAdvisorAnswers): PocAdvisorResult {
  const skuPlanned = answers.skuScope === 'large' ? 20 : answers.skuScope === 'poc' ? 10 : 5;
  const materialReady = answers.materialState === 'ready';
  const benchmarkStrong = answers.benchmarkState === 'strong';
  const riskHigh = answers.riskLevel === 'high';
  const riskMedium = answers.riskLevel === 'medium';
  const goalPreset: Record<PocAdvisorAnswers['goal'], PocBenchmarkPresetId> = {
    'launch-catalog': 'catalog-launch',
    'fix-feed': 'feed-ops',
    'test-creative': 'creative-test',
    'reduce-risk': 'market-qa',
  };
  const missingAssetCount = answers.materialState === 'ready' ? 0 : answers.materialState === 'partial' ? 1 : 3;
  const riskCount = riskHigh ? 3 : riskMedium ? 1 : 0;
  const finalReviewPassRate = clamp(
    (materialReady ? 84 : answers.materialState === 'partial' ? 74 : 58) -
      (riskHigh ? 8 : riskMedium ? 3 : 0),
    35,
    96,
  );
  const benchmarkCoverage = answers.benchmarkState === 'strong' ? 86 : answers.benchmarkState === 'some' ? 68 : 42;
  const skuDelivered = Math.max(
    0,
    skuPlanned - (answers.materialState === 'missing' ? Math.ceil(skuPlanned * 0.35) : answers.materialState === 'partial' ? Math.ceil(skuPlanned * 0.12) : 0),
  );
  const input: PocReportInput = {
    category: answers.category,
    benchmarkPreset: goalPreset[answers.goal],
    skuPlanned,
    skuDelivered,
    finalReviewPassRate,
    benchmarkCoverage,
    riskCount,
    missingAssetCount,
    reworkCount: answers.materialState === 'ready' && !riskHigh ? 1 : riskHigh ? 3 : 2,
    contentTestReady: answers.goal === 'test-creative' && benchmarkStrong && !riskHigh,
    ownerReady: true,
    contractIntent: answers.contractIntent,
  };
  const preset = getPocBenchmarkPreset(input.benchmarkPreset);

  return {
    input,
    summary: `${preset.label} for ${skuPlanned} SKU / ${answers.materialState} materials / ${answers.benchmarkState} benchmark / ${answers.riskLevel} risk`,
    assumptions: [
      `SKU scope inferred as ${skuPlanned} planned items.`,
      `Material state translated into ${missingAssetCount} missing asset blocker(s).`,
      `Benchmark state translated into ${benchmarkCoverage}% coverage.`,
      `Risk level translated into ${riskCount} risk item(s).`,
    ],
  };
}

function buildPocCommercialBriefing({
  input,
  preset,
  acceptanceScore,
  contractStatus,
  label,
  nextStep,
  blockers,
  strengths,
}: {
  input: PocReportInput;
  preset: PocBenchmarkPreset;
  acceptanceScore: number;
  contractStatus: PocReportEvaluation['contractStatus'];
  label: string;
  nextStep: string;
  blockers: string[];
  strengths: string[];
}): PocCommercialBriefing {
  const deliveryCoverage = percent(input.skuDelivered, input.skuPlanned);
  const proofPoints = [
    deliveryCoverage >= 90 ? `${deliveryCoverage}% SKU delivery coverage proves the workflow can handle the planned batch.` : '',
    input.finalReviewPassRate >= 82 ? `${input.finalReviewPassRate}% final review pass rate supports a quality-led sales story.` : '',
    input.benchmarkCoverage >= 75 ? `${input.benchmarkCoverage}% benchmark coverage gives the customer enough evidence to compare against market standards.` : '',
    input.contentTestReady ? 'Content test readiness connects the POC to growth and creative testing, not only listing production.' : '',
    input.contractIntent ? 'Customer contract intent is already present, so sales should remove friction instead of re-educating the account.' : '',
  ].filter(Boolean);
  const conversionRisks = [
    input.skuDelivered < input.skuPlanned ? 'Incomplete SKU coverage can make the buyer question whether the system scales beyond the demo batch.' : '',
    input.finalReviewPassRate < 80 ? 'Review quality is still below a comfortable commercial threshold.' : '',
    input.benchmarkCoverage < 70 ? 'Benchmark proof is thin; buyer may perceive the report as internal opinion instead of market evidence.' : '',
    input.riskCount > 1 ? 'Visible product or compliance risk should be resolved before asking for a larger commitment.' : '',
    input.missingAssetCount > 0 ? 'Missing assets may shift blame from execution quality to input readiness unless clearly framed.' : '',
    !input.ownerReady ? 'No review owner means the sales motion can stall after the report is shared.' : '',
  ].filter(Boolean);
  const commercialScore = clamp(
    Math.round(
      acceptanceScore * 0.72 +
      (input.contractIntent ? 10 : 0) +
      (input.ownerReady ? 8 : 0) +
      (input.contentTestReady ? 6 : 0) +
      (proofPoints.length * 2) -
      (conversionRisks.length * 3)
    ),
    0,
    100,
  );
  const motion: PocCommercialMotion =
    contractStatus === 'ready' && commercialScore >= 84
      ? 'close-now'
      : contractStatus === 'warm' || commercialScore >= 68
        ? 'paid-expansion'
        : contractStatus === 'blocked'
          ? 'fix-and-rescore'
          : 'hold';
  const priceSignal =
    motion === 'close-now'
      ? 'premium-retainer'
      : motion === 'paid-expansion'
        ? 'paid-pilot'
        : motion === 'fix-and-rescore'
          ? 'repair-sprint'
          : 'not-ready';
  const packageRecommendation =
    motion === 'close-now'
      ? `Move ${preset.label} into the main-site contract as a recurring SKU launch lane.`
      : motion === 'paid-expansion'
        ? `Sell a paid expansion batch using ${preset.label}, with the same acceptance evidence and a larger SKU scope.`
        : motion === 'fix-and-rescore'
          ? `Run a focused repair sprint before pitching a broader ${preset.label} contract.`
          : `Keep this as a learning POC until the buyer can see enough proof for ${preset.label}.`;
  const ownerMessage =
    motion === 'close-now'
      ? 'The POC has enough evidence for a decision meeting. Lead with proof, timeline, and contract next step.'
      : motion === 'paid-expansion'
        ? 'The buyer has seen value, but the safer close is a paid expansion rather than a full retainer.'
        : motion === 'fix-and-rescore'
          ? 'Do not push price yet. Remove the visible blockers, then rescore with the same rubric.'
          : 'Hold the commercial ask. Use the report to collect better inputs and reset the next milestone.';
  const nextActions =
    motion === 'close-now'
      ? ['Share the boss page with the decision maker.', 'Book a contract review call within 24 hours.', 'Attach the handoff memo to the main-site payment or proposal flow.']
      : motion === 'paid-expansion'
        ? ['Propose the next SKU batch as a paid pilot.', 'Lock the acceptance rubric before production starts.', 'Ask for benchmark links and asset ownership before kickoff.']
        : motion === 'fix-and-rescore'
          ? ['Collect missing assets and restricted-claim notes.', 'Resolve the top two blockers before another review.', 'Rerun the POC report after the repair sprint.']
          : ['Clarify the buyer goal and category owner.', 'Collect a complete SKU input sheet.', 'Run the advisor plan again before spending delivery effort.'];
  const proposalChecklist =
    motion === 'close-now'
      ? ['Decision maker has boss page link', 'Contract scope maps to recurring SKU lane', 'Payment path is ready on main site', 'Launch owner and SLA are named']
      : motion === 'paid-expansion'
        ? ['Next SKU batch size is defined', 'Acceptance rubric is locked before kickoff', 'Benchmark/source materials are owned by buyer', 'Expansion price and review date are stated']
        : motion === 'fix-and-rescore'
          ? ['Missing assets list is acknowledged', 'Restricted claims are rewritten or removed', 'Top blockers have owners', 'Rescore date is scheduled']
          : ['Buyer goal is clarified', 'Complete SKU input sheet is collected', 'Review owner is assigned', 'POC advisor plan is rerun before delivery'];
  const closePlan =
    motion === 'close-now'
      ? [
          { day: 'Day 0', action: 'Send boss page and buyer follow-up.', owner: 'Sales owner' },
          { day: 'Day 1', action: 'Run contract review call and confirm recurring SKU lane.', owner: 'Decision maker' },
          { day: 'Day 3', action: 'Move accepted scope into payment/proposal flow.', owner: 'Commercial owner' },
        ]
      : motion === 'paid-expansion'
        ? [
            { day: 'Day 0', action: 'Send paid expansion proposal with SKU batch size.', owner: 'Sales owner' },
            { day: 'Day 2', action: 'Collect benchmark links and missing source materials.', owner: 'Buyer operator' },
            { day: 'Day 5', action: 'Start expansion batch with locked acceptance rubric.', owner: 'Delivery owner' },
          ]
        : motion === 'fix-and-rescore'
          ? [
              { day: 'Day 0', action: 'Send blocker list and repair checklist.', owner: 'Delivery owner' },
              { day: 'Day 2', action: 'Collect missing assets and restricted-claim corrections.', owner: 'Buyer operator' },
              { day: 'Day 7', action: 'Rerun report and decide expansion or contract path.', owner: 'Sales owner' },
            ]
          : [
              { day: 'Day 0', action: 'Clarify buyer goal and category scope.', owner: 'Sales owner' },
              { day: 'Day 3', action: 'Collect complete SKU input sheet and review owner.', owner: 'Buyer operator' },
              { day: 'Day 7', action: 'Rerun advisor plan before delivery effort.', owner: 'Delivery owner' },
            ];
  const labelMap: Record<PocCommercialMotion, string> = {
    'close-now': 'Close now',
    'paid-expansion': 'Paid expansion',
    'fix-and-rescore': 'Fix and rescore',
    hold: 'Hold commercial ask',
  };
  const boardLines = [
    '# wenai commercial briefing',
    '',
    `- Commercial score: ${commercialScore}/100`,
    `- Motion: ${labelMap[motion]}`,
    `- Acceptance decision: ${label}`,
    `- Price signal: ${priceSignal}`,
    `- Package: ${packageRecommendation}`,
    `- Owner message: ${ownerMessage}`,
    `- Next step: ${nextStep}`,
    '',
    '## Executive summary',
    `${labelMap[motion]} for ${input.category || 'unspecified category'} with ${input.skuDelivered}/${input.skuPlanned} SKU delivered. ${preset.contractFraming}`,
    '',
    '## Proof points',
  ];

  (proofPoints.length > 0 ? proofPoints : strengths.length > 0 ? strengths : ['No decisive commercial proof point yet.'])
    .forEach(item => boardLines.push(`- ${item}`));
  boardLines.push('', '## Conversion risks');
  (conversionRisks.length > 0 ? conversionRisks : blockers.length > 0 ? blockers : ['No major conversion risk detected.'])
    .forEach(item => boardLines.push(`- ${item}`));
  boardLines.push('', '## Next actions');
  nextActions.forEach(item => boardLines.push(`- ${item}`));
  boardLines.push('', '## Proposal checklist');
  proposalChecklist.forEach(item => boardLines.push(`- ${item}`));
  boardLines.push('', '## Close plan');
  closePlan.forEach(item => boardLines.push(`- ${item.day}: ${item.action} (${item.owner})`));

  const buyerFollowupLines = [
    `Subject: ${labelMap[motion]} next step for ${preset.label}`,
    '',
    `Hi, here is the POC decision recap for ${input.category || 'your category'}:`,
    '',
    `- Current motion: ${labelMap[motion]}`,
    `- Commercial score: ${commercialScore}/100`,
    `- Recommended package: ${packageRecommendation}`,
    `- Why now: ${(proofPoints[0] || strengths[0] || preset.contractFraming).replace(/\.$/, '')}.`,
    `- Watch item: ${(conversionRisks[0] || blockers[0] || 'No major conversion risk detected.').replace(/\.$/, '')}.`,
    '',
    'Suggested next step:',
    `- ${nextActions[0]}`,
    '',
    'Before we proceed, please confirm:',
    ...proposalChecklist.slice(0, 3).map(item => `- ${item}`),
  ];
  const salesPackLines = [
    '# wenai POC sales pack',
    '',
    '## Board brief',
    ...boardLines,
    '',
    '## Buyer follow-up',
    ...buyerFollowupLines,
  ];

  return {
    commercialScore,
    motion,
    label: labelMap[motion],
    executiveSummary: `${labelMap[motion]} for ${input.category || 'unspecified category'} with ${input.skuDelivered}/${input.skuPlanned} SKU delivered.`,
    packageRecommendation,
    priceSignal,
    ownerMessage,
    proofPoints,
    conversionRisks,
    nextActions,
    proposalChecklist,
    closePlan,
    buyerFollowupMarkdown: buyerFollowupLines.join('\n').trim(),
    salesPackMarkdown: salesPackLines.join('\n').trim(),
    boardMarkdown: boardLines.join('\n').trim(),
  };
}

export function evaluatePocReport(input: PocReportInput): PocReportEvaluation {
  const threshold = getPocCategoryThreshold(input.category);
  const playbook = getPocCategoryPlaybook(input.category);
  const recommendedPreset = recommendPocBenchmarkPreset(input);
  const preset = input.benchmarkPreset ? getPocBenchmarkPreset(input.benchmarkPreset) : recommendedPreset.preset;
  const deliveryCoverage = percent(input.skuDelivered, input.skuPlanned);
  const reworkPenalty = clamp(input.reworkCount * 4, 0, 20);
  const riskPenalty = clamp(input.riskCount * 5, 0, 25);
  const missingPenalty = clamp(input.missingAssetCount * 4, 0, 20);

  const acceptanceScore = clamp(
    Math.round(
      deliveryCoverage * 0.24 +
      input.finalReviewPassRate * 0.24 +
      input.benchmarkCoverage * 0.18 +
      (input.contentTestReady ? 14 : 0) +
      (input.ownerReady ? 12 : 0) +
      (input.contractIntent ? 8 : 0) -
      reworkPenalty -
      riskPenalty -
      missingPenalty
    ),
    0,
    100,
  );

  const blockers = [
    deliveryCoverage < 80 ? 'Delivery coverage is below a representative POC threshold.' : '',
    input.finalReviewPassRate < threshold.finalReviewPassRate ? 'Final review pass rate is below this category threshold.' : '',
    input.benchmarkCoverage < threshold.benchmarkCoverage ? 'Benchmark evidence is not strong enough for this category.' : '',
    input.riskCount > threshold.maxRiskCount ? 'Risk count is above the contract-ready threshold.' : '',
    input.missingAssetCount > threshold.maxMissingAssetCount ? 'Missing assets are still blocking a stable delivery handoff.' : '',
    input.reworkCount > threshold.maxReworkCount ? 'Rework count is too high for a contract push.' : '',
    !input.contentTestReady ? 'Content test readiness is still missing.' : '',
    !input.ownerReady ? 'No review owner is assigned yet.' : '',
  ].filter(Boolean);

  const strengths = [
    deliveryCoverage >= 100 ? 'Delivery fully covers the planned SKU scope.' : '',
    input.finalReviewPassRate >= threshold.finalReviewPassRate ? 'Final review quality meets the category threshold.' : '',
    input.benchmarkCoverage >= threshold.benchmarkCoverage ? 'Benchmark evidence is strong enough to support the recap.' : '',
    input.riskCount <= threshold.maxRiskCount ? 'Risk level is within the category safety band.' : '',
    input.missingAssetCount <= threshold.maxMissingAssetCount ? 'Asset completeness is within the category threshold.' : '',
    input.contentTestReady ? 'Content testing is ready for the next growth step.' : '',
    input.contractIntent ? 'The customer already shows contract intent.' : '',
  ].filter(Boolean);

  const decision: PocReportDecision =
    blockers.length >= 4 || input.skuDelivered === 0
      ? 'needs-input'
      : acceptanceScore >= 82 && input.contractIntent && input.ownerReady && blockers.length === 0
        ? 'push-contract'
        : acceptanceScore >= 70
          ? 'expand-sku'
          : 'iterate';

  const label =
    decision === 'push-contract'
      ? 'Push main-site contract'
      : decision === 'expand-sku'
        ? 'Expand next SKU batch'
        : decision === 'iterate'
          ? 'Iterate current POC'
          : 'Collect missing inputs first';

  const nextStep =
    decision === 'push-contract'
      ? 'Prepare the final review recap and hand this POC to the main-site contract and payment flow.'
      : decision === 'expand-sku'
        ? 'Scale the winning structure to the next SKU batch while preserving review evidence and risk notes.'
        : decision === 'iterate'
          ? 'Fix rework points, reduce risk, and run one more acceptance review before contract motion.'
          : 'Collect missing SKU assets, benchmark proof, and a clear review owner before another run.';

  const contractStatus =
    decision === 'push-contract'
      ? 'ready'
      : decision === 'expand-sku'
        ? 'warm'
        : decision === 'needs-input'
          ? 'blocked'
          : 'not-ready';

  const sla =
    contractStatus === 'ready'
      ? { nextAction: 'Book final review call and prepare contract handoff', dueDays: 1, severity: 'urgent' as const }
      : contractStatus === 'warm'
        ? { nextAction: 'Run the next SKU expansion batch with the same evidence structure', dueDays: 2, severity: 'normal' as const }
        : contractStatus === 'blocked'
          ? { nextAction: 'Collect missing assets, benchmark proof, and owner sign-off', dueDays: 1, severity: 'blocked' as const }
          : { nextAction: 'Fix delivery quality gaps and rerun acceptance review', dueDays: 3, severity: 'normal' as const };
  const commercial = buildPocCommercialBriefing({
    input,
    preset,
    acceptanceScore,
    contractStatus,
    label,
    nextStep,
    blockers,
    strengths,
  });

  const lines = [
    '# wenai 10 SKU POC acceptance report',
    '',
    `- Acceptance score: ${acceptanceScore}/100`,
    `- Decision: ${label}`,
    `- Contract status: ${contractStatus}`,
    `- Commercial score: ${commercial.commercialScore}/100`,
    `- Commercial motion: ${commercial.label}`,
    `- Next step: ${nextStep}`,
    `- SLA: ${sla.nextAction} / ${sla.dueDays} day(s)`,
    '',
    '## Input snapshot',
    `- Category: ${input.category || 'not specified'}`,
    `- Planned SKU: ${input.skuPlanned}`,
    `- Delivered SKU: ${input.skuDelivered}`,
    `- Final review pass rate: ${input.finalReviewPassRate}%`,
    `- Benchmark coverage: ${input.benchmarkCoverage}%`,
    `- Risk count: ${input.riskCount}`,
    `- Missing assets: ${input.missingAssetCount}`,
    `- Rework count: ${input.reworkCount}`,
    `- Content test ready: ${input.contentTestReady ? 'yes' : 'no'}`,
    `- Review owner assigned: ${input.ownerReady ? 'yes' : 'no'}`,
    `- Contract intent: ${input.contractIntent ? 'yes' : 'no'}`,
    '',
    '## Benchmark preset',
    `- Preset: ${preset.label}`,
    `- Inspired by: ${preset.inspiredBy}`,
    `- Target: ${preset.target}`,
    `- Contract framing: ${preset.contractFraming}`,
    `- Recommended preset: ${recommendedPreset.preset.label} (${recommendedPreset.confidence}% confidence)`,
    '',
    '## Category playbook',
    `- Playbook: ${playbook.label}`,
    `- Operator lens: ${playbook.operatorLens}`,
    '',
    '## Commercial briefing',
    `- Package recommendation: ${commercial.packageRecommendation}`,
    `- Price signal: ${commercial.priceSignal}`,
    `- Owner message: ${commercial.ownerMessage}`,
    '',
    '## Category thresholds',
    `- Final review >= ${threshold.finalReviewPassRate}%`,
    `- Benchmark coverage >= ${threshold.benchmarkCoverage}%`,
    `- Risk count <= ${threshold.maxRiskCount}`,
    `- Missing assets <= ${threshold.maxMissingAssetCount}`,
    `- Rework count <= ${threshold.maxReworkCount}`,
    '',
    '## Strengths',
  ];

  (strengths.length > 0 ? strengths : ['No clear scale signal yet.']).forEach(item => lines.push(`- ${item}`));

  lines.push('', '## Blockers');
  (blockers.length > 0 ? blockers : ['No critical blocker detected.']).forEach(item => lines.push(`- ${item}`));
  lines.push('', '## Category benchmark signals');
  playbook.benchmarkSignals.forEach(item => lines.push(`- ${item}`));
  lines.push('', '## Category risk checks');
  playbook.riskChecks.forEach(item => lines.push(`- ${item}`));
  lines.push('', '## Commercial next actions');
  commercial.nextActions.forEach(item => lines.push(`- ${item}`));

  const handoffLines = [
    '# wenai POC contract handoff memo',
    '',
    `- Decision: ${label}`,
    `- Contract status: ${contractStatus}`,
    `- Acceptance score: ${acceptanceScore}/100`,
    `- Commercial score: ${commercial.commercialScore}/100`,
    `- Commercial motion: ${commercial.label}`,
    `- Price signal: ${commercial.priceSignal}`,
    `- Category: ${input.category || 'not specified'}`,
    `- Benchmark preset: ${preset.label}`,
    `- Category playbook: ${playbook.label}`,
    `- Planned / delivered SKU: ${input.skuPlanned} / ${input.skuDelivered}`,
    `- Final review pass rate: ${input.finalReviewPassRate}%`,
    `- Benchmark coverage: ${input.benchmarkCoverage}%`,
    `- Next step: ${nextStep}`,
    `- SLA owner action: ${sla.nextAction}`,
    `- SLA due: ${sla.dueDays} day(s)`,
    `- Commercial framing: ${preset.contractFraming}`,
    `- Package recommendation: ${commercial.packageRecommendation}`,
    `- Owner message: ${commercial.ownerMessage}`,
    `- Recommended preset: ${recommendedPreset.preset.label} (${recommendedPreset.confidence}% confidence)`,
    '',
    '## Strengths to carry into contract',
  ];

  (strengths.length > 0 ? strengths : ['No clear contract-ready strengths yet.']).forEach(item => handoffLines.push(`- ${item}`));
  handoffLines.push('', '## Risks to keep visible');
  (blockers.length > 0 ? blockers : ['No critical blocker detected.']).forEach(item => handoffLines.push(`- ${item}`));
  handoffLines.push('', '## Preset acceptance focus');
  preset.acceptanceFocus.forEach(item => handoffLines.push(`- ${item}`));
  handoffLines.push('', '## Category proposal angles');
  playbook.proposalAngles.forEach(item => handoffLines.push(`- ${item}`));
  handoffLines.push('', '## Suggested commercial framing');
  handoffLines.push(`- Recommended motion: ${contractStatus === 'ready' ? 'move to main-site contract' : contractStatus === 'warm' ? 'expand paid pilot scope' : 'hold contract and fix delivery gaps first'}`);
  handoffLines.push(`- Review owner required: ${input.ownerReady ? 'already assigned' : 'assign before the next call'}`);
  handoffLines.push(`- Content test status: ${input.contentTestReady ? 'ready to use in the pitch' : 'do not oversell before tests are ready'}`);
  handoffLines.push('', '## Commercial next actions');
  commercial.nextActions.forEach(item => handoffLines.push(`- ${item}`));
  handoffLines.push('', '## Proposal checklist');
  commercial.proposalChecklist.forEach(item => handoffLines.push(`- ${item}`));
  handoffLines.push('', '## Close plan');
  commercial.closePlan.forEach(item => handoffLines.push(`- ${item.day}: ${item.action} (${item.owner})`));

  return {
    acceptanceScore,
    decision,
    label,
    nextStep,
    blockers,
    strengths,
    reportMarkdown: lines.join('\n').trim(),
    handoffMarkdown: handoffLines.join('\n').trim(),
    contractStatus,
    sla,
    commercial,
    playbook,
  };
}
