export type EngineRiskLevel = 'low' | 'medium' | 'high';

export type GeneratedBriefStatus =
  | 'draft'
  | 'pending_review'
  | 'in_task_queue'
  | 'in_poc_report'
  | 'archived';

export type FactoryTaskStatus =
  | 'pending_generation'
  | 'pending_brand_review'
  | 'deliverable'
  | 'in_report'
  | 'archived';

export type WorkflowStepId =
  | 'ingest'
  | 'rules'
  | 'guardrails'
  | 'generate_briefs'
  | 'quality_review'
  | 'task_queue'
  | 'calendar'
  | 'report'
  | 'delivery_package'
  | 'export';

export type WorkflowStepStatus = 'pending' | 'ready' | 'completed' | 'blocked';

export interface ListingProject {
  id: string;
  productName: string;
  category: string;
  targetPlatforms: string[];
  priceBand: string;
  sellingPoints: string[];
  targetAudience: string;
  contentGoal: string;
  brandGuardrails: string[];
  categoryRules: string[];
  competitorNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingProjectInput {
  productName: string;
  category: string;
  targetPlatforms: string[];
  priceBand: string;
  sellingPoints: string[] | string;
  targetAudience: string;
  contentGoal: string;
  brandGuardrails: string[] | string;
  categoryRules: string[] | string;
  competitorNotes?: string;
}

export interface BriefQualityScore {
  hookSpecificity: number;
  hookCompleteness: number;
  platformFit: number;
  audienceFit: number;
  visualClarity: number;
  brandSafety: number;
  ctaClarity: number;
  reusability: number;
  overallScore: number;
  overall: number;
}

export interface GeneratedBrief {
  id: string;
  projectId: string;
  platform: string;
  contentType: string;
  hook: string;
  visualDirection: string;
  voiceoverDirection: string;
  cta: string;
  riskLevel: EngineRiskLevel;
  riskNotes: string[];
  reusableStructure: string;
  status: GeneratedBriefStatus;
  qualityScore: BriefQualityScore;
}

export interface ReferenceCreative {
  id: string;
  title: string;
  platform: string;
  category: string;
  rawText: string;
  observedHook: string;
  observedStructure: string;
  audience: string;
  sellingPoint: string;
  riskNotes: string[];
  sourceType: 'manual_input' | 'demo_reference';
}

export interface CreativeDeconstruction {
  referenceId: string;
  hookPattern: string;
  painPoint: string;
  productReveal: string;
  proofPoint: string;
  objectionHandling: string;
  ctaPattern: string;
  reusableStructure: string;
  riskWarnings: string[];
  suitableBriefTypes: string[];
}

export interface Scene {
  id: string;
  timestamp: string;
  visual: string;
  voiceoverLine: string;
  onScreenText: string;
  assetNeed: string;
  riskNote: string;
}

export interface GeneratedScript {
  id: string;
  briefId: string;
  projectId: string;
  platform: string;
  title: string;
  duration: string;
  openingHook: string;
  scenes: Scene[];
  voiceover: string;
  onScreenText: string[];
  cta: string;
  riskNotes: string[];
  qualityScore: BriefQualityScore;
}

export interface Shot {
  id: string;
  order: number;
  shotType: string;
  cameraDirection: string;
  visualDescription: string;
  requiredAssets: string[];
  subtitle: string;
  estimatedSeconds: number;
  productionNote: string;
}

export interface Storyboard {
  scriptId: string;
  projectId: string;
  shots: Shot[];
}

export interface AssetPlan {
  projectId: string;
  requiredImages: string[];
  requiredVideos: string[];
  requiredTextOverlays: string[];
  requiredVoiceover: string[];
  optionalAssets: string[];
  missingAssets: string[];
  productionPriority: string[];
}

export interface VariantDimension {
  name: 'hook' | 'audience' | 'platform' | 'cta' | 'proof' | 'visual_angle';
  options: string[];
}

export interface ContentVariant {
  id: string;
  briefId: string;
  platform: string;
  hook: string;
  angle: string;
  cta: string;
  audience: string;
  riskLevel: EngineRiskLevel;
  reusableStructure: string;
  derivedScriptId: string;
  qualityScore: BriefQualityScore;
}

export interface VariantMatrix {
  projectId: string;
  baseBriefId: string;
  dimensions: VariantDimension[];
  variants: ContentVariant[];
}

export interface ProductionAssetsStatus {
  references: number;
  scripts: number;
  storyboards: number;
  requiredAssets: number;
  missingAssets: number;
  variants: number;
  ready: boolean;
}

export interface AssetTag {
  id: string;
  label: string;
  type:
    | 'product'
    | 'lifestyle'
    | 'proof'
    | 'tutorial'
    | 'testimonial'
    | 'packaging'
    | 'voiceover'
    | 'subtitle'
    | 'background'
    | 'reference';
}

export interface LocalAsset {
  id: string;
  projectId: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'text' | 'reference';
  source: 'local_upload' | 'manual_entry' | 'demo_asset';
  fileName: string;
  mimeType: string;
  sizeLabel: string;
  durationLabel: string;
  tags: AssetTag[];
  category: string;
  platformFit: string[];
  riskNotes: string[];
  usableForShots: string[];
  createdAt: string;
  previewUrl?: string;
  hasSessionFile?: boolean;
  sessionOnlyNote?: string;
}

export interface GoldenListingFactoryProject {
  id: string;
  label: string;
  projectInput: ListingProjectInput;
  referenceCreatives: GoldenReferenceCreativeInput[];
  manualAssets: GoldenManualAssetInput[];
  expectedContentGoals: string[];
  expectedDeliveryNotes: string[];
}

export interface GoldenReferenceCreativeInput {
  title: string;
  platform: string;
  rawText: string;
  observedHook?: string;
  observedStructure?: string;
  audience?: string;
  sellingPoint?: string;
  riskNotes?: string[];
}

export interface GoldenManualAssetInput {
  name: string;
  type: LocalAsset['type'];
  description?: string;
  tags?: string[];
  platformFit?: string[];
  riskNotes?: string[];
}

export interface ShotAssetMatch {
  shotId: string;
  assetIds: string[];
  matchScore: number;
  missingRequirements: string[];
  recommendation: string;
}

export interface ProductionReadiness {
  ready: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
  missingAssets: string[];
  recommendedNextStep: string;
}

export interface AssemblyItem {
  id: string;
  scriptId: string;
  storyboardId: string;
  shotId: string;
  variantId: string;
  platform: string;
  assetIds: string[];
  subtitle: string;
  voiceoverLine: string;
  estimatedSeconds: number;
  productionNote: string;
  status: 'planned' | 'missing_assets' | 'ready_for_edit' | 'exported_manifest';
}

export interface AssemblyPlan {
  projectId: string;
  items: AssemblyItem[];
}

export type ProductionBatchQaStatus =
  | 'draft'
  | 'needs_assets'
  | 'needs_review'
  | 'ready_for_edit'
  | 'ready_for_delivery';

export interface ProductionBatchItem {
  id: string;
  projectId: string;
  batchId: string;
  briefId: string;
  scriptId: string;
  storyboardId: string;
  variantId: string;
  platform: string;
  title: string;
  hook: string;
  contentType: string;
  duration: string;
  assetCoverageScore: number;
  qaStatus: ProductionBatchQaStatus;
  assignedAssets: string[];
  missingAssets: string[];
  editPackId: string;
  riskLevel: EngineRiskLevel;
  productionNote: string;
}

export interface BatchQaSummary {
  passed: boolean;
  score: number;
  readyCount: number;
  needsAssetCount: number;
  needsReviewCount: number;
  highRiskCount: number;
  blockers: string[];
  warnings: string[];
  recommendedNextStep: string;
}

export interface ProductionBatch {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  platforms: string[];
  sourceBriefIds: string[];
  sourceVariantIds: string[];
  batchItems: ProductionBatchItem[];
  qaSummary: BatchQaSummary;
  deliveryStatus: ProductionBatchQaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EditPackShot {
  order: number;
  startSecond: number;
  endSecond: number;
  visualDescription: string;
  assetIds: string[];
  subtitle: string;
  voiceoverLine: string;
  transitionNote: string;
  productionNote: string;
}

export interface EditPackAssetManifestItem {
  shotOrder: number;
  assetId: string;
  fileName: string;
  usage: string;
  missing: boolean;
}

export interface EditPack {
  id: string;
  batchItemId: string;
  projectId: string;
  platform: string;
  title: string;
  duration: string;
  shotList: EditPackShot[];
  subtitles: string[];
  voiceoverScript: string;
  assetManifest: EditPackAssetManifestItem[];
  editInstructions: string[];
  riskChecklist: string[];
  exportNames: {
    srt: string;
    voiceover: string;
    edl: string;
    assetManifest: string;
    markdown: string;
  };
}

export type VideoAssemblyMode = 'storyboard_preview' | 'image_to_video' | 'text_to_video' | 'asset_assembly';

export type VideoAssemblyStatus =
  | 'draft'
  | 'queued'
  | 'preparing'
  | 'blocked_missing_assets'
  | 'ready_for_provider'
  | 'provider_unavailable'
  | 'completed_mock'
  | 'failed';

export interface RenderScene {
  order: number;
  durationSeconds: number;
  visualPrompt: string;
  assetIds: string[];
  subtitle: string;
  voiceoverLine: string;
  transition: string;
  productionNote: string;
}

export interface RenderPlan {
  jobId: string;
  duration: number;
  aspectRatio: string;
  scenes: RenderScene[];
  subtitles: string[];
  voiceoverScript: string;
  assetManifest: EditPackAssetManifestItem[];
  generationPrompts: string[];
  providerPayloadPreview: VideoProviderPayloadPreview | Record<string, unknown>;
  riskNotes: string[];
}

export interface VideoOutputArtifact {
  id: string;
  jobId: string;
  type: 'storyboard_preview' | 'prompt_pack' | 'provider_payload' | 'mock_video_placeholder' | 'qa_report';
  name: string;
  format: 'markdown' | 'json' | 'csv' | 'srt' | 'placeholder';
  content: string;
  sessionOnlyUrl?: string;
  note: string;
}

export interface VideoQaResult {
  passed: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
  checks: string[];
  recommendedNextStep: string;
}

export interface VideoProviderAuditEntry {
  providerId: string;
  mode: 'local_mock' | 'external_placeholder';
  usedFallback: boolean;
  operation: 'build_payload' | 'submit_job' | 'status' | 'normalize_result';
  status: 'success' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

export interface VideoAssemblyJob {
  id: string;
  projectId: string;
  batchId: string;
  editPackId: string;
  platform: string;
  title: string;
  mode: VideoAssemblyMode;
  providerId: string;
  status: VideoAssemblyStatus;
  inputSummary: string;
  renderPlan: RenderPlan;
  outputArtifacts: VideoOutputArtifact[];
  qaResult: VideoQaResult;
  missingRequirements: string[];
  providerAudit: VideoProviderAuditEntry;
  createdAt: string;
  updatedAt: string;
}

export interface VideoGenerationProvider {
  id: string;
  name: string;
  mode: 'local_mock' | 'external_placeholder';
  available: () => boolean;
  buildPayload: (job: VideoAssemblyJob, run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>) => VideoProviderPayloadPreview;
  submitJob: (job: VideoAssemblyJob, run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>, config?: unknown) => VideoOutputArtifact[];
  getJobStatus: (jobId: string) => VideoAssemblyStatus;
  normalizeResult: (result: unknown) => VideoOutputArtifact[];
}

export interface VideoProviderPayloadPreview {
  providerId: string;
  mode: VideoAssemblyMode;
  platform: string;
  title: string;
  renderPlan: {
    aspectRatio: string;
    duration: number;
    scenes: Array<{
      order: number;
      durationSeconds: number;
      prompt: string;
      assetIds: string[];
      subtitle: string;
      voiceoverLine: string;
      transition: string;
    }>;
    subtitles: string[];
    assetManifest: Array<{
      shotOrder: number;
      assetId: string;
      fileName: string;
      usage: string;
      missing: boolean;
    }>;
  };
  boundary: string;
}

export interface ContentPerformanceRecord {
  id: string;
  projectId: string;
  experimentId?: string;
  cellId?: string;
  contentId?: string;
  trackingCode?: string;
  batchItemId?: string;
  briefId?: string;
  editPackId?: string;
  platform: string;
  contentType: string;
  hook: string;
  publishDate?: string;
  impressions: number;
  views: number;
  clicks: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  ctr: number;
  engagementRate: number;
  conversionRate?: number;
  revenue?: number;
  cost?: number;
  roas?: number;
  source: 'manual_entry' | 'csv_import' | 'demo_performance';
  notes: string;
}

export interface PerformanceImportResult {
  records: ContentPerformanceRecord[];
  errors: string[];
  warnings: string[];
  importedAt: string;
}

export interface PerformanceInsight {
  id: string;
  type: 'winning_pattern' | 'weak_pattern' | 'platform_signal' | 'audience_signal' | 'creative_risk' | 'next_test';
  title: string;
  summary: string;
  evidence: string[];
  recommendedAction: string;
  linkedBriefIds: string[];
  linkedBatchItemIds: string[];
}

export interface RegenerationPlan {
  projectId: string;
  basedOnPerformanceRecordIds: string[];
  winningPatterns: string[];
  avoidPatterns: string[];
  nextBriefAngles: string[];
  nextPlatforms: string[];
  recommendedVariants: string[];
  riskNotes: string[];
  suggestedGenerationInstruction: string;
}

export interface PerformanceSummary {
  totalRecords: number;
  totalImpressions: number;
  totalViews: number;
  totalClicks: number;
  averageCtr: number;
  averageEngagementRate: number;
  averageRoas?: number;
  topPlatform: string;
  topContentType: string;
}

export interface PerformanceFeedbackReport {
  summary: PerformanceSummary;
  topPerformers: ContentPerformanceRecord[];
  weakPerformers: ContentPerformanceRecord[];
  platformInsights: PerformanceInsight[];
  contentTypeInsights: PerformanceInsight[];
  nextRoundPlan: RegenerationPlan;
  clientSummary: string;
  markdown: string;
  csv: string;
}

export interface SuccessMetric {
  name: 'ctr' | 'engagementRate' | 'conversionRate' | 'roas' | 'saves' | 'comments';
  targetDirection: 'higher' | 'lower';
  benchmarkValue?: number;
  priority: 'primary' | 'secondary';
}

export interface ExperimentCell {
  id: string;
  name: string;
  variableType: 'hook' | 'audience' | 'visual_angle' | 'cta' | 'proof_point' | 'platform' | 'content_type';
  controlValue: string;
  testValue: string;
  assignedBriefIds: string[];
  assignedVariantIds: string[];
  assignedBatchItemIds: string[];
  expectedLearning: string;
}

export interface TrackingPlan {
  namingConvention: string;
  trackingCodes: string[];
  csvTemplate: string;
  manualEntryFields: string[];
}

export interface ProductionAssignment {
  id: string;
  experimentCellId: string;
  platform: string;
  contentType: string;
  briefId: string;
  variantId?: string;
  batchItemId?: string;
  editPackId?: string;
  suggestedPublishDate: string;
  ownerRole: string;
  status: 'planned' | 'in_production' | 'ready_to_publish' | 'data_pending' | 'completed';
}

export interface ExperimentPlan {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  hypothesis: string;
  basedOnInsightIds: string[];
  targetPlatforms: string[];
  successMetrics: SuccessMetric[];
  testWindow: string;
  experimentCells: ExperimentCell[];
  trackingPlan: TrackingPlan;
  productionAssignments: ProductionAssignment[];
  status: 'draft' | 'ready' | 'running_manual' | 'completed_manual';
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentVariantMatrixRow {
  experimentId: string;
  cellId: string;
  variableType: ExperimentCell['variableType'];
  control: string;
  variantA: string;
  variantB: string;
  variantC: string;
  briefIds: string[];
  variantIds: string[];
  batchItemIds: string[];
  riskNotes: string[];
  expectedLearning: string;
}

export interface ExperimentVariantMatrix {
  experimentId: string;
  projectId: string;
  rows: ExperimentVariantMatrixRow[];
  markdown: string;
  csv: string;
}

export interface ExperimentMetricDelta {
  cellId: string;
  metric: SuccessMetric['name'];
  controlValue: number;
  testValue: number;
  delta: number;
  relativeLift: number;
  conclusion: 'winner' | 'loser' | 'inconclusive';
}

export type ExperimentConfidenceLevel = 'low' | 'directional' | 'moderate' | 'strong';

export type ExperimentConfidenceConclusion =
  | 'needs_more_data'
  | 'directional_signal'
  | 'candidate_winner'
  | 'inconclusive'
  | 'candidate_loser';

export type ExperimentConfidenceRecommendedAction =
  | 'continue_collecting_data'
  | 'run_another_test'
  | 'scale_candidate_winner'
  | 'retire_weak_variant'
  | 'refine_hypothesis';

export interface ExperimentConfidenceGuardrails {
  minImpressionsPerCell: number;
  minClicksPerCell: number;
  minOrdersPerCell?: number;
  minRelativeLiftForCandidate: number;
  closeResultRelativeLift: number;
}

export interface ExperimentCellConfidence {
  cellId: string;
  metric: SuccessMetric['name'];
  confidenceLevel: ExperimentConfidenceLevel;
  conclusion: ExperimentConfidenceConclusion;
  recommendedAction: ExperimentConfidenceRecommendedAction;
  sampleSufficient: boolean;
  sampleGuardrail: string;
  missingGuardrails: string[];
  controlRecords: number;
  testRecords: number;
  controlImpressions: number;
  testImpressions: number;
  controlClicks: number;
  testClicks: number;
  controlEstimatedOrders?: number;
  testEstimatedOrders?: number;
  controlValue: number;
  testValue: number;
  delta: number;
  relativeLift: number;
  explanation: string;
}

export interface ExperimentConfidenceSummary {
  experimentId: string;
  confidenceLevel: ExperimentConfidenceLevel;
  conclusion: ExperimentConfidenceConclusion;
  recommendedAction: ExperimentConfidenceRecommendedAction;
  sampleGuardrail: string;
  sufficientCellCount: number;
  directionalCellCount: number;
  candidateWinnerCount: number;
  candidateLoserCount: number;
  inconclusiveCellCount: number;
  needsMoreDataCellCount: number;
  briefExplanation: string;
}

export interface ExperimentReport {
  experimentId: string;
  winningCells: string[];
  losingCells: string[];
  inconclusiveCells: string[];
  metricDeltas: ExperimentMetricDelta[];
  cellConfidence: ExperimentCellConfidence[];
  confidenceSummary: ExperimentConfidenceSummary;
  learningSummary: string;
  nextAction: string;
  markdown: string;
}

export type ExperimentMemoryVariableType =
  | 'hook'
  | 'angle'
  | 'audience'
  | 'offer'
  | 'cta'
  | 'format'
  | 'asset'
  | 'price_message'
  | 'platform';

export interface ExperimentMemoryEntry {
  id: string;
  experimentId: string;
  experimentCellId: string;
  testedHypothesis: string;
  testedVariableType: ExperimentMemoryVariableType;
  testedVariableLabel: string;
  controlCellId: string;
  testCellId: string;
  winningCellId?: string;
  losingCellId?: string;
  confidenceLevel: ExperimentConfidenceLevel;
  conclusion: ExperimentConfidenceConclusion;
  recommendedAction: ExperimentConfidenceRecommendedAction;
  keyMetric: SuccessMetric['name'];
  relativeLift: number;
  sampleSufficient: boolean;
  reusableLearning: string;
  avoidRepeatingReason: string;
  sourcePlanName: string;
  createdAt: string;
}

export interface ExperimentLearningPattern {
  id: string;
  sourceEntryId: string;
  variableType: ExperimentMemoryVariableType;
  title: string;
  patternType: 'reusable' | 'watchlist' | 'avoid';
  confidenceLevel: ExperimentConfidenceLevel;
  keyMetric: SuccessMetric['name'];
  relativeLift: number;
  guidance: string;
}

export interface ExperimentMemorySummary {
  projectId: string;
  generatedAt: string;
  entries: ExperimentMemoryEntry[];
  reusablePatterns: ExperimentLearningPattern[];
  watchlistPatterns: ExperimentLearningPattern[];
  avoidPatterns: ExperimentLearningPattern[];
  topReusableLearning?: string;
  topWatchlistLearning?: string;
  topAvoidLearning?: string;
  briefSummary: string;
}

export interface PrioritizedExperimentCandidate {
  id: string;
  experimentId: string;
  cellId: string;
  candidateName: string;
  hypothesis: string;
  variableType: ExperimentMemoryVariableType;
  duplicateRisk: 'low' | 'medium' | 'high';
  priorityScore: number;
  priorityBand: 'high' | 'medium' | 'low';
  reason: string;
  nextRecommendedTest: string;
  supportingMemoryEntryIds: string[];
}

export interface ExperimentPriorityQueue {
  projectId: string;
  generatedAt: string;
  candidates: PrioritizedExperimentCandidate[];
  briefSummary: string;
}

export type ExperimentLearningStatus = 'learned' | 'directional' | 'unknown' | 'inconclusive' | 'avoid_or_rework';

export interface ExperimentLearningGap {
  variableType: ExperimentMemoryVariableType;
  status: ExperimentLearningStatus;
  evidenceCount: number;
  strongestLearning: string;
  unresolvedQuestion: string;
  recommendedNextMove: string;
  riskNote: string;
}

export interface ExperimentLearningGapMap {
  projectId: string;
  generatedAt: string;
  gaps: ExperimentLearningGap[];
  summary: string;
}

export interface ExperimentSequenceStep {
  stepNumber: number;
  primaryVariableType: ExperimentMemoryVariableType;
  hypothesis: string;
  whyNow: string;
  controlGuidance: string;
  testGuidance: string;
  expectedLearning: string;
  dependency: string;
  stopOrContinueRule: string;
  duplicateRisk: 'low' | 'medium' | 'high';
  priorityBand: 'high' | 'medium' | 'low';
}

export interface ExperimentSequencingPlan {
  projectId: string;
  generatedAt: string;
  topUnresolvedQuestion: string;
  steps: ExperimentSequenceStep[];
  summary: string;
}

export type ExperimentValidationDecision =
  | 'validate_more'
  | 'small_rollout'
  | 'scale_candidate'
  | 'stop_variant'
  | 'rework_hypothesis'
  | 'do_not_decide';

export type ExperimentRolloutRisk = 'low' | 'medium' | 'high';

export interface ExperimentValidationRule {
  id: string;
  experimentId: string;
  cellId: string;
  targetVariableType: ExperimentMemoryVariableType;
  confidenceLevel: ExperimentConfidenceLevel;
  conclusion: ExperimentConfidenceConclusion;
  decision: ExperimentValidationDecision;
  riskLevel: ExperimentRolloutRisk;
  duplicateRisk: PrioritizedExperimentCandidate['duplicateRisk'];
  sampleSufficient: boolean;
  reason: string;
  requiredGuardrail: string;
  nextCheckMetric: SuccessMetric['name'];
  stopCondition: string;
  userFacingExplanation: string;
}

export interface ExperimentRolloutRule {
  decision: ExperimentValidationDecision;
  targetVariableType: ExperimentMemoryVariableType;
  allowedAction: string;
  riskLevel: ExperimentRolloutRisk;
  whyAllowed: string;
  requiredGuardrail: string;
  nextCheckMetric: SuccessMetric['name'];
  stopCondition: string;
  userFacingExplanation: string;
}

export interface ExperimentStopRule {
  variantOrVariable: string;
  stopReason: string;
  metricTrigger: string;
  confidenceRequirement: string;
  suggestedReplacement: string;
  userFacingExplanation: string;
}

export interface ExperimentValidationPolicy {
  projectId: string;
  generatedAt: string;
  topDecision: ExperimentValidationDecision;
  rules: ExperimentValidationRule[];
  rolloutRules: ExperimentRolloutRule[];
  stopRules: ExperimentStopRule[];
  noDecisionYet: string[];
  validationBacklog: string[];
  summary: string;
}

export interface ExperimentDecisionSummary {
  projectId: string;
  generatedAt: string;
  topDecision: ExperimentValidationDecision;
  riskLevel: ExperimentRolloutRisk;
  whyThisDecision: string;
  nextCheckMetric: string;
  stopCondition: string;
  canRollout: string[];
  mustValidate: string[];
  stopNow: string[];
  noDecisionYet: string[];
  summary: string;
}

export type ExperimentExecutionStage =
  | 'prepare'
  | 'produce'
  | 'launch'
  | 'monitor'
  | 'decide'
  | 'archive';

export interface ExperimentExecutionTask {
  id: string;
  stage: ExperimentExecutionStage;
  group: string;
  title: string;
  description: string;
  required: boolean;
  relatedMetric?: SuccessMetric['name'];
  riskIfSkipped: string;
  userFacingNote: string;
}

export interface ExperimentCadenceRule {
  id: string;
  stage: ExperimentExecutionStage;
  triggerDecision: ExperimentValidationDecision;
  timing: string;
  action: string;
  checkpoint: string;
  relatedMetric?: SuccessMetric['name'];
  rationale: string;
}

export interface ExperimentCadencePlan {
  projectId: string;
  generatedAt: string;
  currentDecision: ExperimentValidationDecision;
  monitoringCadence: string;
  nextCheckpoint: string;
  stopCondition: string;
  rules: ExperimentCadenceRule[];
  summary: string;
}

export interface ExperimentOperatorChecklist {
  projectId: string;
  generatedAt: string;
  currentDecision: ExperimentValidationDecision;
  requiredCount: number;
  sections: Array<{
    title: string;
    items: ExperimentExecutionTask[];
  }>;
  summary: string;
}

export interface ExperimentExecutionPlaybook {
  projectId: string;
  generatedAt: string;
  currentDecision: ExperimentValidationDecision;
  experimentObjective: string;
  primaryVariableType: ExperimentMemoryVariableType;
  requiredMaterials: string[];
  productionTasks: ExperimentExecutionTask[];
  trackingNamingReminders: string[];
  launchChecklist: string[];
  monitoringCadence: string;
  decisionCheckpoint: string;
  stopCondition: string;
  archiveRequirement: string;
  nextActionAfterResult: string;
  summary: string;
}

export interface ExperimentExecutionSummary {
  projectId: string;
  generatedAt: string;
  currentDecision: ExperimentValidationDecision;
  nextTasks: string[];
  monitoringCadence: string;
  stopCondition: string;
  requiredChecklistCount: number;
  summary: string;
}

export type ExperimentWorkbenchStatus =
  | 'collecting_data'
  | 'validating'
  | 'ready_to_rollout'
  | 'stop_required'
  | 'archive_ready';

export type ExperimentArchiveStatus = 'active' | 'archived';

export interface ListingFactoryRunHistoryItem {
  runId: string;
  createdAt: string;
  merchantName?: string;
  brandName?: string;
  skuCount: number;
  primaryProductName: string;
  currentDecision: ExperimentValidationDecision;
  confidenceLevel: ExperimentConfidenceLevel;
  topLearning: string;
  nextRecommendedAction: string;
  openChecklistCount: number;
  deliveryPackageAvailable: boolean;
  archiveStatus: ExperimentArchiveStatus;
}

export interface ListingFactoryRunHistorySummary {
  items: ListingFactoryRunHistoryItem[];
  totalRuns: number;
  activeRuns: number;
  archivedRuns: number;
  latestRunId?: string;
  summary: string;
}

export interface ExperimentWorkbenchAction {
  id: string;
  runId: string;
  status: ExperimentWorkbenchStatus;
  title: string;
  description: string;
  priority: 'p0' | 'p1' | 'p2';
  currentDecision: ExperimentValidationDecision;
  confidenceLevel: ExperimentConfidenceLevel;
  nextCheckMetric?: string;
  openChecklistCount: number;
}

export interface ExperimentWorkbenchBoard {
  projectId: string;
  generatedAt: string;
  currentStatus: ExperimentWorkbenchStatus;
  highestPriorityAction: ExperimentWorkbenchAction;
  nextActionQueue: ExperimentWorkbenchAction[];
  pendingDataActions: ExperimentWorkbenchAction[];
  validationActions: ExperimentWorkbenchAction[];
  rolloutActions: ExperimentWorkbenchAction[];
  stopActions: ExperimentWorkbenchAction[];
  archiveActions: ExperimentWorkbenchAction[];
  recentRuns: ListingFactoryRunHistoryItem[];
  summary: string;
}

export interface ExperimentArchiveRecord {
  runId: string;
  archivedAt: string;
  currentDecision: ExperimentValidationDecision;
  confidenceLevel: ExperimentConfidenceLevel;
  learningSummary: string;
  nextAction: string;
  deliveryPackageAvailable: boolean;
  archiveStatus: ExperimentArchiveStatus;
}

export type CrossRunLearningSourceType = 'confidence' | 'memory' | 'gap_map' | 'decision' | 'archive';

export interface CrossRunLearningRecord {
  runId: string;
  createdAt: string;
  merchantName?: string;
  brandName?: string;
  primaryProductName: string;
  variableType: ExperimentMemoryVariableType;
  hypothesis: string;
  conclusion: ExperimentConfidenceConclusion;
  confidenceLevel: ExperimentConfidenceLevel;
  decision: ExperimentValidationDecision;
  relativeLift?: number;
  reusableLearning: string;
  riskNote: string;
  nextRecommendedAction: string;
  sourceType: CrossRunLearningSourceType;
}

export interface CrossRunVariableSummary {
  variableType: ExperimentMemoryVariableType;
  totalTests: number;
  learnedCount: number;
  directionalCount: number;
  inconclusiveCount: number;
  stoppedCount: number;
  strongestLearning: string;
  repeatedPattern: string;
  unresolvedQuestion: string;
  nextBestMove: string;
}

export interface CrossRunComparisonResult {
  generatedAt: string;
  records: CrossRunLearningRecord[];
  variableSummaries: CrossRunVariableSummary[];
  strongestReusableLearning: string;
  unresolvedQuestion: string;
  nextBestMove: string;
  summary: string;
}

export interface LearningSearchFilter {
  variableType?: ExperimentMemoryVariableType;
  conclusion?: ExperimentConfidenceConclusion;
  confidenceLevel?: ExperimentConfidenceLevel;
  decision?: ExperimentValidationDecision;
  keyword?: string;
  productName?: string;
  timeRange?: 'all' | 'last_7_days' | 'last_30_days' | 'last_90_days';
}

export interface LearningSearchResult {
  filter: LearningSearchFilter;
  records: CrossRunLearningRecord[];
  totalMatches: number;
  topLearning: string;
  summary: string;
}

export interface LearningTimelineItem {
  date: string;
  runId: string;
  title: string;
  keyLearning: string;
  decision: ExperimentValidationDecision;
  confidenceLevel: ExperimentConfidenceLevel;
  nextAction: string;
}

export interface MerchantLearningArchive {
  generatedAt: string;
  comparison: CrossRunComparisonResult;
  searchIndex: CrossRunLearningRecord[];
  defaultSearchResult: LearningSearchResult;
  timeline: LearningTimelineItem[];
  reusableMerchantLearningSummary: string;
  strongestReusableLearning: string;
  unresolvedQuestion: string;
  nextBestMove: string;
  markdown: string;
}

export type ContentTraceSourceType =
  | 'brief'
  | 'script'
  | 'storyboard'
  | 'asset'
  | 'batch_variant'
  | 'experiment_cell'
  | 'metric_window'
  | 'decision'
  | 'learning';

export interface ContentTraceNode {
  id: string;
  type: ContentTraceSourceType;
  title: string;
  summary: string;
  runId: string;
  createdAt?: string;
  relatedSkuId?: string;
  productName?: string;
  variableType?: ExperimentMemoryVariableType;
  sourceRef: string;
}

export interface ContentTraceEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  confidence: 'direct' | 'inferred' | 'partial';
  note: string;
}

export interface AssetLineageRecord {
  assetId: string;
  assetType: LocalAsset['type'] | 'unknown';
  sourceScriptId?: string;
  sourceStoryboardId?: string;
  sourceVariantId?: string;
  usedInExperimentCellIds: string[];
  relatedVariableType?: ExperimentMemoryVariableType;
  relatedHook?: string;
  relatedAngle?: string;
  relatedOffer?: string;
  relatedCta?: string;
  performanceSignal: string;
  reusableNote: string;
  riskNote: string;
}

export interface ExperimentMetricWindow {
  metricWindowId: string;
  experimentCellId: string;
  metricName: SuccessMetric['name'];
  impressions: number;
  clicks: number;
  orders?: number;
  revenue?: number;
  cost?: number;
  recalculatedCtr?: number;
  engagementRate?: number;
  roas?: number;
  sampleSufficient: boolean;
  confidenceLevel: ExperimentConfidenceLevel;
  windowNote: string;
}

export type ExperimentEvidenceStrength = 'weak' | 'directional' | 'usable' | 'strong';

export interface ExperimentEvidenceTrace {
  experimentId: string;
  planId: string;
  hypothesis: string;
  controlCellId: string;
  testCellId: string;
  comparedMetric: SuccessMetric['name'];
  relativeLift: number;
  confidenceLevel: ExperimentConfidenceLevel;
  conclusion: ExperimentConfidenceConclusion;
  decision: ExperimentValidationDecision;
  evidenceStrength: ExperimentEvidenceStrength;
  evidenceLimitations: string[];
}

export interface LearningEvidenceLink {
  learningRecordId: string;
  sourceExperimentId: string;
  sourceCellIds: string[];
  sourceAssetIds: string[];
  sourceMetricWindowIds: string[];
  learningStatement: string;
  whatThisSupports: string;
  whatThisDoesNotProve: string;
}

export interface ContentExperimentTraceGraph {
  runId: string;
  generatedAt: string;
  nodes: ContentTraceNode[];
  edges: ContentTraceEdge[];
  assetLineageRecords: AssetLineageRecord[];
  metricWindows: ExperimentMetricWindow[];
  evidenceTraces: ExperimentEvidenceTrace[];
  learningEvidenceLinks: LearningEvidenceLink[];
  unlinkedNodeIds: string[];
  summary: string;
}

export interface TraceabilitySummary {
  runId: string;
  generatedAt: string;
  strongestTraceableLearning: string;
  relatedContentArtifact: string;
  relatedExperimentCell: string;
  metricWindowSummary: string;
  evidenceStrength: ExperimentEvidenceStrength;
  limitationNote: string;
  unlinkedArtifactCount: number;
  summary: string;
}

export type PlatformDataSourceType = 'manual_csv' | 'manual_entry' | 'future_api_placeholder';

export type PlatformChannel =
  | 'tiktok'
  | 'xiaohongshu'
  | 'amazon'
  | 'shopify'
  | 'meta_ads'
  | 'google_ads'
  | 'other';

export interface PlatformMetricField {
  name: string;
  required: boolean;
  aliases: string[];
  metricType: 'identifier' | 'dimension' | 'date' | 'count' | 'currency' | 'ratio' | 'text';
  expectedFormat: string;
  descriptionZh: string;
  exampleValue: string;
  validationRule: string;
}

export interface PlatformDataContract {
  version: string;
  sourceTypes: PlatformDataSourceType[];
  channels: PlatformChannel[];
  requiredFields: PlatformMetricField[];
  optionalFields: PlatformMetricField[];
  boundaryNote: string;
}

export interface PlatformImportTemplate {
  header: string[];
  csv: string;
  descriptionMarkdown: string;
}

export interface PlatformFieldMapping {
  sourceType: PlatformDataSourceType;
  mappedFields: Record<string, string>;
  missingRequiredFields: string[];
  unknownFields: string[];
}

export interface PlatformImportValidationIssue {
  rowIndex: number;
  field?: string;
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

export interface PlatformImportQualityReport {
  generatedAt: string;
  rowCount: number;
  validRowCount: number;
  errorCount: number;
  warningCount: number;
  errors: PlatformImportValidationIssue[];
  warnings: PlatformImportValidationIssue[];
  readyForExperimentReview: boolean;
  summary: string;
}

export interface NormalizedPlatformMetricRecord {
  recordId: string;
  channel: PlatformChannel;
  campaignName: string;
  contentName: string;
  creativeName?: string;
  trackingCode?: string;
  experimentCellId?: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  revenue: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  addToCart?: number;
  conversionRate?: number;
  ctr?: number;
  roas?: number;
  productName?: string;
  skuId?: string;
  platformContentId?: string;
  note?: string;
  sourceType: PlatformDataSourceType;
}

export interface PlatformDataReadinessSummary {
  generatedAt: string;
  requiredFieldCount: number;
  optionalFieldCount: number;
  normalizedRecordCount: number;
  errorCount: number;
  warningCount: number;
  readyForExperimentReview: boolean;
  cannotConcludeReasons: string[];
  reviewReadyData: string[];
  summary: string;
}

export interface PlatformCsvHeaderAlias {
  normalizedField: string;
  aliases: string[];
  descriptionZh: string;
}

export interface PlatformCsvAdapterPreset {
  platform: PlatformChannel;
  label: string;
  aliases: PlatformCsvHeaderAlias[];
  note: string;
}

export interface PlatformCsvMappingCandidate {
  originalHeader: string;
  normalizedField?: string;
  confidence: 'exact' | 'alias' | 'manual_needed';
  source: 'contract' | 'preset' | 'synonym' | 'unknown';
}

export interface PlatformCsvMappingIssue {
  severity: 'error' | 'warning';
  type: 'missing_required' | 'unknown_field' | 'conflict_field' | 'secret_like';
  field?: string;
  header?: string;
  message: string;
}

export interface PlatformCsvMappingPreview {
  detectedChannel: PlatformChannel;
  totalHeaders: number;
  candidates: PlatformCsvMappingCandidate[];
  mappedFields: PlatformCsvMappingCandidate[];
  missingRequiredFields: string[];
  unknownFields: string[];
  conflictFields: string[];
  warnings: PlatformCsvMappingIssue[];
  errors: PlatformCsvMappingIssue[];
  estimatedImportReady: boolean;
  recommendedFixes: string[];
}

export interface PlatformCsvImportPreviewSummary {
  generatedAt: string;
  mappingPreview: PlatformCsvMappingPreview;
  importQualityReport: PlatformImportQualityReport;
  normalizedRecordCount: number;
  estimatedImportReady: boolean;
  recommendedFixes: string[];
  summary: string;
}

export interface PlatformCsvMappingPresetExport {
  platform: PlatformChannel;
  generatedAt: string;
  mappings: Array<{
    originalHeader: string;
    normalizedField?: string;
    confidence: 'exact' | 'alias' | 'manual_needed';
  }>;
  warnings: string[];
  localOnlyNote: string;
}

export interface PlatformExportVersion {
  platform: PlatformChannel;
  versionId: string;
  versionLabel: string;
  detectedByHeaders: string[];
  requiredHeaderAliases: string[];
  optionalHeaderAliases: string[];
  knownMissingFields: string[];
  knownAmbiguousFields: string[];
  recommendedMappingNotes: string[];
  userFacingDescription: string;
}

export interface PlatformExportVersionRegistry {
  generatedAt: string;
  versions: PlatformExportVersion[];
  boundaryNote: string;
}

export type PlatformCsvFixtureRow = Record<string, string | number | undefined>;

export interface PlatformCsvFixture {
  fixtureId: string;
  platform: PlatformChannel;
  versionId: string;
  label: string;
  fixtureType: 'clean' | 'dirty';
  headers: string[];
  rows: PlatformCsvFixtureRow[];
  expectedNotes: string[];
}

export interface PlatformCsvRehearsalIssue {
  fixtureId: string;
  severity: 'error' | 'warning';
  type: 'version_detection' | 'mapping_preview' | 'quality_validation' | 'normalization';
  message: string;
}

export interface PlatformCsvRehearsalResult {
  fixtureId: string;
  platform: PlatformChannel;
  versionId: string;
  versionLabel: string;
  needsManualConfirmation: boolean;
  mappingPreview: PlatformCsvMappingPreview;
  importQualityReport: PlatformImportQualityReport;
  normalizedRecordCount: number;
  normalizedRecords: NormalizedPlatformMetricRecord[];
  issues: PlatformCsvRehearsalIssue[];
  importReady: boolean;
  summary: string;
}

export interface PlatformCsvRehearsalSummary {
  generatedAt: string;
  resultCount: number;
  passedFixtures: number;
  failedFixtures: number;
  warningCount: number;
  errorCount: number;
  fieldsMostLikelyToNeedManualMapping: string[];
  recommendedFixes: string[];
  results: PlatformCsvRehearsalResult[];
  summary: string;
}

export interface PlatformCsvRegressionSnapshot {
  generatedAt: string;
  snapshots: Array<{
    platform: PlatformChannel;
    versionId: string;
    mappedFieldCount: number;
    missingRequiredCount: number;
    unknownFieldCount: number;
    conflictCount: number;
    validationErrorCount: number;
    validationWarningCount: number;
    importReady: boolean;
  }>;
  jsonSafe: boolean;
  localOnlyNote: string;
}

export interface FactoryOperatingReviewCapability {
  id: string;
  label: string;
  status: 'shipped' | 'partial' | 'missing';
  evidence: string[];
  nextStep: string;
}

export interface FactoryOperatingReviewPriority {
  id: string;
  title: string;
  rationale: string;
  implementationHint: string;
  verification: string;
}

export interface FactoryOperatingReview {
  projectId: string;
  productShape: string;
  maturityScore: number;
  capabilitySummary: FactoryOperatingReviewCapability[];
  currentStrengths: string[];
  gaps: string[];
  nextDevelopmentPlan: FactoryOperatingReviewPriority[];
  operatingBoundary: string;
  markdown: string;
}

export interface MerchantContextCard {
  id: string;
  projectId: string;
  productName: string;
  category: string;
  targetPlatforms: string[];
  priceBand: string;
  brandVoice: string;
  audienceSummary: string;
  reusableSellingPoints: string[];
  brandGuardrails: string[];
  categoryRules: string[];
  assetMemory: {
    totalAssets: number;
    reusableAssetNames: string[];
    sessionOnlyAssetNames: string[];
    missingAssetNeeds: string[];
  };
  performanceMemory: {
    winningPatterns: string[];
    weakPatterns: string[];
    nextTestIdeas: string[];
  };
  generationDefaults: ListingProjectInput;
  createdAt: string;
  updatedAt: string;
  markdown: string;
}

export interface FactoryTask {
  id: string;
  projectId: string;
  briefId: string;
  title: string;
  platform: string;
  status: FactoryTaskStatus;
  riskLevel: EngineRiskLevel;
  nextAction: string;
}

export interface ContentCalendarItem {
  id: string;
  taskId: string;
  projectId: string;
  briefId: string;
  date: string;
  platform: string;
  title: string;
  status: 'planned' | 'pending_review' | 'in_report' | 'archived';
  riskLevel: EngineRiskLevel;
}

export interface PocReport {
  projectId: string;
  summary: string;
  conclusion: string;
  categoryRuleSummary: string;
  brandGuardrailSummary: string;
  briefCount: number;
  highRiskCount: number;
  recommendedContentAngles: string[];
  priorityContentTypes: string[];
  notRecommendedToScale: string[];
  highRiskExpressionSummary: string;
  qualityScoreRange: string;
  firstRoundProductionCount: number;
  executionPriority: string[];
  clientSummary: string;
  pricingRecommendation: 'Starter' | 'Growth' | 'Enterprise';
}

export interface DeliveryPackage {
  executiveSummary: string;
  projectSummary: string;
  briefTable: Array<{
    platform: string;
    contentType: string;
    hook: string;
    status: GeneratedBriefStatus;
    score: number;
  }>;
  riskReview: string[];
  qualityGateSummary: string;
  markdown: string;
  briefCsv: string;
  projectJson: string;
  scriptsMarkdown: string;
  storyboardMarkdown: string;
  assetPlanMarkdown: string;
  variantMatrixCsv: string;
  productionChecklistMarkdown: string;
  assetLibraryMarkdown: string;
  productionReadinessMarkdown: string;
  assemblyManifestMarkdown: string;
  assemblyManifestCsv: string;
  missingAssetsChecklistMarkdown: string;
  batchProductionMarkdown: string;
  editPackMarkdown: string;
  subtitleSrtSample: string;
  editDecisionListCsv: string;
  assetManifestCsv: string;
  batchQaSummaryMarkdown: string;
  videoAssemblyMarkdown: string;
  renderPlanMarkdown: string;
  providerPayloadJson: string;
  videoQaMarkdown: string;
  mockVideoOutputPlaceholderMarkdown: string;
  performanceFeedbackMarkdown: string;
  performanceRecordsCsv: string;
  regenerationPlanMarkdown: string;
  experimentPlanMarkdown: string;
  experimentCsvTemplate: string;
  trackingPlanMarkdown: string;
  manualResultEntryTemplateCsv: string;
  experimentReportMarkdown: string;
  experimentConfidenceMarkdown: string;
  experimentMemoryMarkdown: string;
  experimentPriorityQueueMarkdown: string;
  experimentLearningGapMapMarkdown: string;
  experimentSequencingPlanMarkdown: string;
  experimentValidationPolicyMarkdown: string;
  experimentDecisionSummaryMarkdown: string;
  experimentExecutionPlaybookMarkdown: string;
  experimentCadencePlanMarkdown: string;
  experimentOperatorChecklistMarkdown: string;
  experimentWorkbenchMarkdown: string;
  crossRunComparisonMarkdown: string;
  merchantLearningArchiveMarkdown: string;
  contentExperimentTraceMarkdown: string;
  traceabilitySummaryMarkdown: string;
  platformDataContractMarkdown: string;
  platformImportTemplateCsv: string;
  platformImportQualityMarkdown: string;
  platformDataReadinessMarkdown: string;
  platformCsvMappingPreviewMarkdown: string;
  platformCsvImportPreviewMarkdown: string;
  platformCsvMappingPresetJson: string;
  platformExportVersionRegistryMarkdown: string;
  platformCsvRehearsalMarkdown: string;
  platformCsvRegressionSnapshotMarkdown: string;
  operatingReviewMarkdown: string;
  merchantContextMarkdown: string;
  assetMetadataJson: string;
  assetRelinkGuideMarkdown: string;
  sessionAssetWarningMarkdown: string;
  clientMessageDraft: string;
  ready: boolean;
}

export interface ActivityLogItem {
  id: string;
  time: string;
  action: string;
  detail: string;
}

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: WorkflowStepStatus;
  summary: string;
  nextAction: string;
}

export interface QualityGateResult {
  passed: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
  requiredFixes: string[];
  recommendedNextStep: string;
}

export interface DeliveryPackageQualityResult {
  passed: boolean;
  score: number;
  missingSections: string[];
  warnings: string[];
  recommendedFixes: string[];
}

export interface ListingFactoryRun {
  id: string;
  project: ListingProject;
  briefs: GeneratedBrief[];
  tasks: FactoryTask[];
  calendarItems: ContentCalendarItem[];
  report: PocReport;
  deliveryPackage: DeliveryPackage;
  references: ReferenceCreative[];
  deconstructions: CreativeDeconstruction[];
  scripts: GeneratedScript[];
  storyboards: Storyboard[];
  assetPlan: AssetPlan;
  variantMatrices: VariantMatrix[];
  productionAssetsStatus: ProductionAssetsStatus;
  assets: LocalAsset[];
  shotAssetMatches: ShotAssetMatch[];
  productionReadiness: ProductionReadiness;
  assemblyPlan: AssemblyPlan;
  productionBatches: ProductionBatch[];
  editPacks: EditPack[];
  batchQaSummary: BatchQaSummary;
  videoAssemblyJobs: VideoAssemblyJob[];
  videoQaSummary: VideoQaResult;
  videoProviderAudit: VideoProviderAuditEntry[];
  performanceRecords: ContentPerformanceRecord[];
  performanceInsights: PerformanceInsight[];
  regenerationPlan: RegenerationPlan;
  performanceFeedbackReport: PerformanceFeedbackReport;
  experimentPlans: ExperimentPlan[];
  experimentVariantMatrices: ExperimentVariantMatrix[];
  experimentReports: ExperimentReport[];
  experimentMemorySummary: ExperimentMemorySummary;
  experimentPriorityQueue: ExperimentPriorityQueue;
  experimentLearningGapMap: ExperimentLearningGapMap;
  experimentSequencingPlan: ExperimentSequencingPlan;
  experimentValidationPolicy: ExperimentValidationPolicy;
  experimentDecisionSummary: ExperimentDecisionSummary;
  experimentExecutionPlaybook: ExperimentExecutionPlaybook;
  experimentCadencePlan: ExperimentCadencePlan;
  experimentOperatorChecklist: ExperimentOperatorChecklist;
  experimentExecutionSummary: ExperimentExecutionSummary;
  runHistoryItem: ListingFactoryRunHistoryItem;
  runHistorySummary: ListingFactoryRunHistorySummary;
  experimentWorkbenchBoard: ExperimentWorkbenchBoard;
  experimentArchiveRecord: ExperimentArchiveRecord;
  crossRunComparison: CrossRunComparisonResult;
  merchantLearningArchive: MerchantLearningArchive;
  contentExperimentTraceGraph: ContentExperimentTraceGraph;
  traceabilitySummary: TraceabilitySummary;
  platformDataContract: PlatformDataContract;
  platformImportTemplate: PlatformImportTemplate;
  platformFieldMapping: PlatformFieldMapping;
  platformImportQualityReport: PlatformImportQualityReport;
  normalizedPlatformMetricRecords: NormalizedPlatformMetricRecord[];
  platformDataReadinessSummary: PlatformDataReadinessSummary;
  platformCsvAdapterPresets: PlatformCsvAdapterPreset[];
  platformCsvMappingPreview: PlatformCsvMappingPreview;
  platformCsvImportPreviewSummary: PlatformCsvImportPreviewSummary;
  platformCsvMappingPresetExport: PlatformCsvMappingPresetExport;
  platformExportVersionRegistry: PlatformExportVersionRegistry;
  platformCsvRehearsalSummary: PlatformCsvRehearsalSummary;
  platformCsvRegressionSnapshot: PlatformCsvRegressionSnapshot;
  operatingReview: FactoryOperatingReview;
  merchantContextCard: MerchantContextCard;
  activityLog: ActivityLogItem[];
  qualityGate: QualityGateResult;
  currentStep: WorkflowStepId;
  steps: WorkflowStep[];
  updatedAt: string;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface ListingFactoryLocalSnapshot {
  project: ListingProject | null;
  briefs: GeneratedBrief[];
  tasks: FactoryTask[];
  report: PocReport | null;
  run?: ListingFactoryRun | null;
  runHistorySummary?: ListingFactoryRunHistorySummary;
  archiveRecords?: ExperimentArchiveRecord[];
}

export interface BriefGenerationProvider {
  id: string;
  label: string;
  generate: (project: ListingProject, options?: { count?: number }) => GeneratedBrief[];
}

const PROJECTS_KEY = 'wenai_listing_factory_projects';
const BRIEFS_KEY = 'wenai_listing_factory_briefs';
const TASKS_KEY = 'wenai_listing_factory_tasks';
const REPORTS_KEY = 'wenai_listing_factory_reports';
const RUNS_KEY = 'wenai_listing_factory_runs';
const RUN_HISTORY_KEY = 'wenai_listing_factory_run_history';
const ARCHIVES_KEY = 'wenai_listing_factory_archives';

const memoryStorage = new Map<string, string>();

const DEFAULT_PLATFORMS = ['TikTok', 'Instagram', '小红书', 'Amazon', 'Shopify'];
const DEFAULT_GOAL = '上新转化';
export const DEFAULT_EXPERIMENT_CONFIDENCE_GUARDRAILS: ExperimentConfidenceGuardrails = {
  minImpressionsPerCell: 500,
  minClicksPerCell: 20,
  minOrdersPerCell: 2,
  minRelativeLiftForCandidate: 0.1,
  closeResultRelativeLift: 0.03,
};
const EXPERIMENT_LEARNING_VARIABLE_TYPES: ExperimentMemoryVariableType[] = [
  'hook',
  'angle',
  'audience',
  'offer',
  'cta',
  'format',
  'asset',
  'price_message',
];
const CROSS_RUN_VARIABLE_TYPES: ExperimentMemoryVariableType[] = EXPERIMENT_LEARNING_VARIABLE_TYPES;

const ABSOLUTE_CLAIM_WORDS = ['保证', '必然', '100%', '百分百', '最强', '第一', '永久', '无限', '根治'];
const MEDICAL_CLAIM_WORDS = ['治疗', '治愈', '医疗', '药效', '临床保证', '疗效', '兽医替代', '修复疾病'];
const COMPETITOR_CLAIM_WORDS = ['吊打', '碾压', '秒杀竞品', '秒杀所有竞品', '完胜竞品', '贬低竞品'];
const DISCOUNT_CLAIM_WORDS = ['虚假折扣', '全网最低', '最后一天', '错过永远没有', '亏本甩卖'];
const OUTCOME_CLAIM_WORDS = ['立刻见效', '一天改变', '马上瘦', '保证爆单'];

const contentTemplates = [
  {
    contentType: '痛点转化',
    structure: '真实场景痛点 -> 错误做法 -> 轻量解决步骤 -> 购买前核对',
    cta: '先保存这份上新清单，再确认自己的使用场景。',
  },
  {
    contentType: '对比测评',
    structure: '三栏对比 -> 适合谁 -> 不适合谁 -> 购买前提醒',
    cta: '评论你的使用场景，先看是否适配。',
  },
  {
    contentType: 'FAQ 回应',
    structure: '购买前疑问 -> 自查步骤 -> 边界说明 -> 保存清单',
    cta: '截图这张自查表，下单前核对一次。',
  },
  {
    contentType: '达人种草',
    structure: '第一人称困扰 -> 试用过程 -> 适合人群 -> 风险提醒',
    cta: '先看评论区的场景建议，不确定就从入门款开始。',
  },
  {
    contentType: '评论区回应',
    structure: '高频评论 -> 解释边界 -> 给出选择建议 -> 引导继续提问',
    cta: '把你的尺寸 / 场景发出来，先帮你判断是否适合。',
  },
  {
    contentType: '清单型上新',
    structure: '上新理由 -> 使用条件 -> 素材建议 -> 团队执行清单',
    cta: '把这条加入首轮内容测试清单。',
  },
];

const platformProfiles: Record<string, { hookStyle: string; visualStyle: string; voiceStyle: string; ctaStyle: string; fit: number }> = {
  TikTok: {
    hookStyle: '短节奏反问，前三秒说出具体困扰',
    visualStyle: '3 个快切镜头：问题现场、产品介入、使用后状态',
    voiceStyle: '口语化，像达人边用边解释，不堆参数',
    ctaStyle: '评论你的使用场景，先判断是否适合',
    fit: 91,
  },
  Instagram: {
    hookStyle: 'lifestyle 场景切入，强调画面和使用氛围',
    visualStyle: '干净桌面 / 浴室 / 厨房等生活方式场景，突出前后秩序感',
    voiceStyle: '更克制，少喊卖点，多讲为什么适合这个场景',
    ctaStyle: '保存这组场景搭配，购买前核对尺寸和需求',
    fit: 89,
  },
  小红书: {
    hookStyle: '真实体验 + 避坑提醒，像用户笔记标题',
    visualStyle: '封面给出场景痛点，内页拆成测评、避坑和清单',
    voiceStyle: '第一人称体验，明确适合谁和不适合谁',
    ctaStyle: '先收藏避坑清单，再看自己是不是同类情况',
    fit: 92,
  },
  Amazon: {
    hookStyle: '功能点和购买疑问优先，少情绪化表达',
    visualStyle: '主图式功能拆解，尺寸、材质、使用步骤要清楚',
    voiceStyle: 'FAQ 口吻，回答购买前最常见疑问',
    ctaStyle: 'Check size, material and use case before purchase',
    fit: 88,
  },
  Shopify: {
    hookStyle: '品牌落地页风格，讲使用场景和套装价值',
    visualStyle: '首屏场景图 + 模块化卖点 + FAQ 区块',
    voiceStyle: '品牌语气更完整，适合承接广告或达人流量',
    ctaStyle: '从入门组合开始，先解决一个具体场景',
    fit: 87,
  },
  视频号: {
    hookStyle: '家庭决策场景切入，表达更稳一点',
    visualStyle: '真人讲解 + 案例板书 + 家长可复述的总结页',
    voiceStyle: '顾问式说明，不制造焦虑',
    ctaStyle: '先做一次体验诊断，再判断是否适合继续',
    fit: 85,
  },
};

const categoryProfiles = [
  {
    match: /美妆|个护|护肤|洗发|精华/,
    pain: '每天洗护都担心状态不稳定',
    scene: '浴室洗护、梳头、成分表和使用频次',
    caution: '把表达收束到日常护理体验，不讲治疗或药效',
  },
  {
    match: /宠物|猫|犬|狗/,
    pain: '宠物日常护理执行起来很难坚持',
    scene: '拌粮、清洁、外出和宠物接受度',
    caution: '不能替代兽医建议，严重问题要就医',
  },
  {
    match: /家居|台灯|收纳|生活/,
    pain: '家里的一个小角落总是反复变乱',
    scene: '书桌、厨房、浴室、抽屉和真实尺寸',
    caution: '避免夸大效果，必须补充尺寸和不适用边界',
  },
  {
    match: /食品|饮料|咖啡|燕麦|低糖/,
    pain: '想减少负担，但又不想牺牲口味和便利',
    scene: '办公室、下午茶、健身后和配料表',
    caution: '不能承诺减肥、控糖或健康疗效',
  },
  {
    match: /3C|充电|耳机|数码|配件/,
    pain: '设备很多，但真正影响体验的是兼容和稳定',
    scene: '通勤、出差、桌面充电、兼容机型展示',
    caution: '不能夸大容量、安全性或兼容范围',
  },
  {
    match: /教育|学习|志愿|课程/,
    pain: '家长想知道问题结构，但不想被焦虑话术推着走',
    scene: '学习路线、错因分析、家庭沟通和复盘表',
    caution: '不能承诺提分、保过或替代学校老师',
  },
  {
    match: /厨房|Amazon|跨境/,
    pain: '购买前最怕尺寸、清洗和安全边界没说清',
    scene: '备餐、清洗、收纳、尺寸对比和 Amazon FAQ',
    caution: '不能暗示完全安全，必须说明使用边界',
  },
  {
    match: /TikTok Shop|小家电|榨汁/,
    pain: '看起来很方便，但用户会担心容量、清洗和限制',
    scene: '办公室、健身后、外带、清洗和充电',
    caution: '不能承诺减脂、爆单或夸大续航',
  },
];

function normalizeList(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map(item => item.trim()).filter(Boolean);
  }

  return (value || '')
    .split(/\n|,|，|；|;/)
    .map(item => item.trim())
    .filter(Boolean);
}

function slugify(input: string) {
  const ascii = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii || Array.from(input).slice(0, 8).join('').replace(/\s+/g, '-');
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return Math.round(values.reduce((sum, item) => sum + item, 0) / Math.max(values.length, 1));
}

function clampScore(value: number) {
  return Math.max(40, Math.min(100, Math.round(value)));
}

function metricLabel(metric: SuccessMetric['name'] | string) {
  const labels: Record<string, string> = {
    ctr: '点击率',
    engagementRate: '互动率',
    conversionRate: '转化率',
    roas: 'ROAS',
    views: '播放量',
    clicks: '点击量',
    saves: '收藏量',
    comments: '评论量',
  };
  return labels[metric] || String(metric);
}

function experimentVariableTypeLabel(variableType: string) {
  const labels: Record<string, string> = {
    hook: '开头钩子',
    angle: '内容角度',
    visual_angle: '视觉角度',
    audience: '目标人群',
    offer: '利益点',
    proof_point: '证明点',
    cta: '行动指令',
    format: '内容形式',
    content_type: '内容形式',
    asset: '素材',
    price_message: '价格话术',
    platform: '平台',
  };
  return labels[variableType] || variableType;
}

function experimentConfidenceLevelLabel(level: ExperimentConfidenceLevel | string) {
  const labels: Record<string, string> = {
    low: '低',
    directional: '方向性',
    moderate: '中等',
    strong: '强',
  };
  return labels[level] || String(level);
}

function experimentConclusionLabel(conclusion: ExperimentConfidenceConclusion | string) {
  const labels: Record<string, string> = {
    needs_more_data: '需要更多数据',
    directional_signal: '方向性信号',
    candidate_winner: '候选胜出方案',
    inconclusive: '结论不充分',
    candidate_loser: '候选弱势方案',
  };
  return labels[conclusion] || String(conclusion);
}

function experimentRecommendedActionLabel(action: ExperimentConfidenceRecommendedAction | string) {
  const labels: Record<string, string> = {
    continue_collecting_data: '继续收集数据',
    run_another_test: '补做下一轮测试',
    scale_candidate_winner: '放大候选胜出方案',
    retire_weak_variant: '淘汰弱势变体',
    refine_hypothesis: '收紧并重写假设',
  };
  return labels[action] || String(action);
}

function experimentPriorityBandLabel(band: PrioritizedExperimentCandidate['priorityBand'] | string) {
  const labels: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  };
  return labels[band] || String(band);
}

function experimentDuplicateRiskLabel(risk: PrioritizedExperimentCandidate['duplicateRisk'] | string) {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return labels[risk] || String(risk);
}

function experimentLearningStatusLabel(status: ExperimentLearningStatus | string) {
  const labels: Record<string, string> = {
    learned: '已形成可复用学习',
    directional: '方向性信号',
    unknown: '尚未验证',
    inconclusive: '结论不充分',
    avoid_or_rework: '避免直接复用，需重做',
  };
  return labels[status] || String(status);
}

function experimentValidationDecisionLabel(decision: ExperimentValidationDecision | string) {
  const labels: Record<string, string> = {
    validate_more: '继续验证',
    small_rollout: '小范围放大',
    scale_candidate: '放大候选方案',
    stop_variant: '停止当前方案',
    rework_hypothesis: '重做实验假设',
    do_not_decide: '暂不下结论',
  };
  return labels[decision] || String(decision);
}

function experimentRolloutRiskLabel(risk: ExperimentRolloutRisk | string) {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return labels[risk] || String(risk);
}

function experimentExecutionStageLabel(stage: ExperimentExecutionStage | string) {
  const labels: Record<string, string> = {
    prepare: '准备',
    produce: '生产',
    launch: '发布',
    monitor: '观察',
    decide: '决策',
    archive: '归档',
  };
  return labels[stage] || String(stage);
}

function factoryCapabilityStatusLabel(status: FactoryOperatingReviewCapability['status'] | string) {
  const labels: Record<string, string> = {
    shipped: '已完成',
    partial: '部分完成',
    missing: '待补齐',
  };
  return labels[status] || String(status);
}

function getPlatformProfile(platform: string) {
  return platformProfiles[platform] || platformProfiles.TikTok;
}

function getCategoryProfile(category: string) {
  return categoryProfiles.find(profile => profile.match.test(category)) || {
    pain: '用户需要先判断这个产品是否适合自己的具体场景',
    scene: '真实使用场景、关键卖点和购买前核对',
    caution: '避免夸大承诺，补充使用条件和不适用边界',
  };
}

function getGoalFrame(goal: string) {
  if (/清库存|库存|优惠/.test(goal)) {
    return {
      contentType: '清库存转化',
      hookAngle: '先讲适合谁，再解释活动边界',
      structure: '适合人群 -> 使用场景 -> 活动边界 -> 理性下单',
      cta: '先确认规格和适用场景，再看活动价格。',
    };
  }
  if (/FAQ|问题|回应/.test(goal)) {
    return {
      contentType: 'FAQ 回应',
      hookAngle: '把购买前最常见问题直接摊开',
      structure: '高频问题 -> 判断条件 -> 不适用提醒 -> 下一步',
      cta: '把你的具体场景发出来，先判断是否适合。',
    };
  }
  if (/达人|合作|种草/.test(goal)) {
    return {
      contentType: '达人合作',
      hookAngle: '用自然口播讲一个真实使用瞬间',
      structure: '第一人称场景 -> 试用过程 -> 适合谁 -> 边界提醒',
      cta: '先收藏这个使用场景，再决定要不要入门款。',
    };
  }
  if (/转化/.test(goal)) {
    return {
      contentType: '痛点转化',
      hookAngle: '痛点到解决方案要更直接',
      structure: '痛点 -> 解决方案 -> 证据 -> CTA',
      cta: '先从一个最常见场景试起。',
    };
  }
  if (/种草/.test(goal)) {
    return {
      contentType: '生活方式种草',
      hookAngle: '从体验感和生活方式切入',
      structure: '生活场景 -> 使用体验 -> 适合人群 -> 保存清单',
      cta: '保存这组场景，购买前核对自己是否同类需求。',
    };
  }
  return {
    contentType: '新品发现',
    hookAngle: '新品发现和具体使用场景并重',
    structure: '新品场景 -> 核心卖点 -> 使用条件 -> 下一步',
    cta: '把这条加入第一轮上新测试清单。',
  };
}

function getStorage(storage?: StorageLike): StorageLike {
  if (storage) return storage;

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return {
    getItem: key => memoryStorage.get(key) ?? null,
    setItem: (key, value) => {
      memoryStorage.set(key, value);
    },
    removeItem: key => {
      memoryStorage.delete(key);
    },
  };
}

function readJson<T>(key: string, fallback: T, storage?: StorageLike): T {
  try {
    const raw = getStorage(storage).getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T, storage?: StorageLike) {
  try {
    getStorage(storage).setItem(key, JSON.stringify(value));
  } catch {
    memoryStorage.set(key, JSON.stringify(value));
  }
}

export function createListingProject(input: ListingProjectInput, now = new Date()): ListingProject {
  const createdAt = now.toISOString();
  const productName = input.productName.trim();
  const platforms = normalizeList(input.targetPlatforms).length > 0
    ? normalizeList(input.targetPlatforms)
    : DEFAULT_PLATFORMS.slice(0, 2);

  return {
    id: `project-${slugify(productName)}-${now.getTime().toString(36)}`,
    productName,
    category: input.category.trim() || '未指定类目',
    targetPlatforms: unique(platforms),
    priceBand: input.priceBand.trim() || '待确认',
    sellingPoints: normalizeList(input.sellingPoints),
    targetAudience: input.targetAudience.trim() || '待确认目标人群',
    contentGoal: input.contentGoal.trim() || DEFAULT_GOAL,
    brandGuardrails: normalizeList(input.brandGuardrails),
    categoryRules: normalizeList(input.categoryRules),
    competitorNotes: input.competitorNotes?.trim() || '暂无竞品备注',
    createdAt,
    updatedAt: createdAt,
  };
}

export function detectRestrictedClaims(text: string, guardrails: string[] = []): string[] {
  const candidates: Array<[string, string[]]> = [
    ['绝对化承诺', ABSOLUTE_CLAIM_WORDS],
    ['医疗或治疗功效', MEDICAL_CLAIM_WORDS],
    ['贬低竞品', COMPETITOR_CLAIM_WORDS],
    ['虚假折扣', DISCOUNT_CLAIM_WORDS],
    ['夸张收益', OUTCOME_CLAIM_WORDS],
  ];
  const guardrailText = guardrails.join(' ');

  return candidates
    .filter(([label, words]) => {
      const guardrailMatched =
        guardrailText.includes(label.slice(0, 2)) ||
        (label === '医疗或治疗功效' && /医疗|治疗|功效/.test(guardrailText)) ||
        (label === '贬低竞品' && /竞品|贬低/.test(guardrailText)) ||
        (label === '虚假折扣' && /折扣|价格|优惠/.test(guardrailText)) ||
        (label === '夸张收益' && /收益|见效|减脂|瘦|爆单/.test(guardrailText));
      return guardrailMatched && words.some(word => text.includes(word));
    })
    .map(([label]) => label);
}

export function sanitizeRiskyCopy(text: string, guardrails: string[] = []): string {
  let sanitized = text;
  const replacements: Array<[RegExp, string]> = [
    [/保证|必然|一定|100%|百分百/g, '建议'],
    [/立刻见效|一天改变|马上瘦|保证爆单/g, '逐步看到变化'],
    [/最强|第一|全网最低|最后一天|错过永远没有|永久|无限|根治/g, '更适合具体场景'],
    [/治疗|治愈|医疗|药效|临床保证|疗效|修复疾病/g, '日常护理辅助'],
    [/吊打|碾压|秒杀竞品|秒杀所有竞品|完胜竞品/g, '适合不同场景'],
    [/虚假折扣|亏本甩卖/g, '活动信息以页面为准'],
  ];

  for (const [pattern, replacement] of replacements) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  if (detectRestrictedClaims(sanitized, guardrails).length > 0) {
    return sanitized.replace(/竞品/g, '同类产品');
  }

  return sanitized;
}

export function scoreBrandSafety(text: string, guardrails: string[] = []) {
  const hits = detectRestrictedClaims(text, guardrails);
  const score = Math.max(40, 96 - hits.length * 18);
  return {
    score,
    hits,
    notes: hits.length > 0 ? hits.map(hit => `需要避开${hit}表达`) : ['未发现明显品牌禁区表达'],
  };
}

export function summarizeGuardrailImpact(project: ListingProject) {
  if (project.brandGuardrails.length === 0 && project.categoryRules.length === 0) {
    return '当前项目未填写品牌禁区或类目规则，Brief 将按保守表达生成。';
  }

  const guardrails = project.brandGuardrails.length > 0
    ? `品牌禁区：${project.brandGuardrails.join('、')}`
    : '品牌禁区：按保守表达处理';
  const rules = project.categoryRules.length > 0
    ? `类目规则：${project.categoryRules.join('、')}`
    : '类目规则：待补充';

  return `${guardrails}。${rules}。这些约束会影响 Hook、口播方向、CTA 和风险提示。`;
}

function riskLevelFromScore(score: number): EngineRiskLevel {
  if (score >= 86) return 'low';
  if (score >= 70) return 'medium';
  return 'high';
}

function buildRiskNotes(project: ListingProject, text: string) {
  const safety = scoreBrandSafety(text, project.brandGuardrails);
  const notes = [
    ...safety.notes,
    ...project.categoryRules.slice(0, 2).map(rule => `类目规则约束：${rule}`),
  ];

  if (project.brandGuardrails.some(item => /绝对|立刻|保证/.test(item))) {
    notes.push('避免绝对化承诺，使用可验证场景和条件表达。');
  }
  if (project.brandGuardrails.some(item => /医疗|治疗|功效/.test(item))) {
    notes.push('避免医疗或治疗功效，把表达收束到日常使用体验。');
  }
  if (project.brandGuardrails.some(item => /竞品|贬低/.test(item))) {
    notes.push('不点名或贬低竞品，只做场景、材质、参数和使用边界对比。');
  }
  if (project.brandGuardrails.some(item => /折扣|全网最低|最后一天|虚假/.test(item))) {
    notes.push('避免虚假折扣或稀缺性话术，活动信息必须以页面实际规则为准。');
  }
  if (project.brandGuardrails.some(item => /见效|一天|马上|瘦|爆单|收益/.test(item))) {
    notes.push('避免夸张收益或即时结果，把表达改成阶段性体验和使用条件。');
  }

  return unique(notes).slice(0, 5);
}

export function evaluateBriefQuality(brief: Omit<GeneratedBrief, 'qualityScore'> & { qualityScore?: BriefQualityScore }, project: ListingProject): BriefQualityScore {
  const safety = scoreBrandSafety(`${brief.hook} ${brief.cta}`, project.brandGuardrails).score;
  const platformProfile = getPlatformProfile(brief.platform);
  const hookSpecificity = clampScore(brief.hook.length > 24 ? 88 : 72);
  const hookCompleteness = clampScore(78 + Math.min(project.sellingPoints.length, 4) * 4);
  const platformFit = clampScore(platformProfile.fit + (project.targetPlatforms.includes(brief.platform) ? 4 : -4));
  const audienceFit = clampScore(brief.hook.includes(project.targetAudience.slice(0, 4)) || brief.voiceoverDirection.includes(project.targetAudience.slice(0, 4)) ? 90 : 78);
  const visualClarity = clampScore(/镜头|展示|封面|主图|场景|画面|步骤/.test(brief.visualDirection) ? 88 : 70);
  const ctaClarity = clampScore(brief.cta.length >= 8 && /先|保存|评论|确认|Check|加入/.test(brief.cta) ? 90 : 74);
  const reusability = clampScore(brief.reusableStructure.split('->').length >= 3 ? 90 : 76);
  const overallScore = average([hookSpecificity, platformFit, audienceFit, visualClarity, ctaClarity, safety, reusability]);

  return {
    hookSpecificity,
    hookCompleteness,
    platformFit,
    audienceFit,
    visualClarity,
    brandSafety: safety,
    ctaClarity,
    reusability,
    overallScore,
    overall: overallScore,
  };
}

function buildQualityScore(project: ListingProject, platform: string, text: string, contentType: string): BriefQualityScore {
  const safety = scoreBrandSafety(text, project.brandGuardrails).score;
  const hookCompleteness = Math.min(96, 76 + project.sellingPoints.length * 4);
  const platformFit = getPlatformProfile(platform).fit;
  const ctaClarity = contentType.includes('FAQ') ? 91 : 86;
  const reusability = project.categoryRules.length > 0 ? 88 : 78;
  const hookSpecificity = 86;
  const audienceFit = project.targetAudience.length > 6 ? 88 : 76;
  const visualClarity = 88;
  const overallScore = average([hookSpecificity, platformFit, audienceFit, visualClarity, safety, ctaClarity, reusability]);

  return {
    hookSpecificity,
    hookCompleteness,
    platformFit,
    audienceFit,
    visualClarity,
    brandSafety: safety,
    ctaClarity,
    reusability,
    overallScore,
    overall: overallScore,
  };
}

function generateLocalDeterministicBriefs(project: ListingProject, options: { count?: number } = {}): GeneratedBrief[] {
  const count = Math.max(6, Math.min(options.count ?? 8, 12));
  const sellingPoint = project.sellingPoints[0] || '核心卖点';
  const audience = project.targetAudience || '目标用户';
  const platforms = project.targetPlatforms.length > 0 ? project.targetPlatforms : DEFAULT_PLATFORMS.slice(0, 2);
  const categoryProfile = getCategoryProfile(project.category);
  const goalFrame = getGoalFrame(project.contentGoal);

  return Array.from({ length: count }, (_, index) => {
    const template = contentTemplates[index % contentTemplates.length];
    const platform = platforms[index % platforms.length];
    const platformProfile = getPlatformProfile(platform);
    const contentType = index === 0 ? goalFrame.contentType : template.contentType;
    const hookAngles = [
      `${categoryProfile.pain}？先看${project.productName}的${sellingPoint}是否适合${audience.slice(0, 18)}。`,
      `${project.productName}不是给所有人准备的，先确认${project.categoryRules[0] || categoryProfile.caution}。`,
      `${platformProfile.hookStyle}：${project.sellingPoints[index % project.sellingPoints.length] || sellingPoint}要放进真实场景里看。`,
      `${goalFrame.hookAngle}，先从${categoryProfile.scene.split('、')[0]}这个场景开始。`,
      `${audience.slice(0, 14)}最容易忽略的，不是价格，而是${project.categoryRules[1] || '使用边界'}。`,
      `${contentType}别急着放大，先把${project.brandGuardrails[0] || '品牌禁区'}讲清楚。`,
    ];
    const rawHook = hookAngles[index % hookAngles.length];
    const hook = sanitizeRiskyCopy(rawHook, project.brandGuardrails);
    const cta = sanitizeRiskyCopy(index === 0 ? goalFrame.cta : platformProfile.ctaStyle || template.cta, project.brandGuardrails);
    const textForRisk = `${hook} ${cta}`;
    const baseScore = buildQualityScore(project, platform, textForRisk, contentType);
    const riskLevel = riskLevelFromScore(baseScore.brandSafety);
    const briefWithoutScore: Omit<GeneratedBrief, 'qualityScore'> = {
      id: `brief-${project.id}-${index + 1}`,
      projectId: project.id,
      platform,
      contentType,
      hook,
      visualDirection: `${platformProfile.visualStyle}；围绕${categoryProfile.scene}拍摄，展示${project.productName}如何解决“${sellingPoint}”相关问题，并补充不适用边界。`,
      voiceoverDirection: `${platformProfile.voiceStyle}。先说${categoryProfile.pain}，再解释${project.sellingPoints.slice(0, 3).join('、') || sellingPoint}，最后提醒${project.categoryRules[0] || categoryProfile.caution}。`,
      cta,
      riskLevel,
      riskNotes: buildRiskNotes(project, textForRisk),
      reusableStructure: index === 0 ? goalFrame.structure : template.structure,
      status: riskLevel === 'high' ? 'pending_review' : 'draft',
    };

    return {
      ...briefWithoutScore,
      qualityScore: evaluateBriefQuality(briefWithoutScore, project),
    };
  });
}

export const localDeterministicProvider: BriefGenerationProvider = {
  id: 'local-deterministic',
  label: '本地确定性生成器',
  generate: generateLocalDeterministicBriefs,
};

export const futureLLMProvider: Omit<BriefGenerationProvider, 'generate'> & {
  generate?: BriefGenerationProvider['generate'];
  status: 'placeholder';
} = {
  id: 'future-llm',
  label: '未来 LLM Provider 占位',
  status: 'placeholder',
};

export function generateBriefs(project: ListingProject, options: { count?: number; provider?: BriefGenerationProvider } = {}): GeneratedBrief[] {
  return (options.provider || localDeterministicProvider).generate(project, options);
}

export function reScoreBrief(brief: GeneratedBrief, project: ListingProject): GeneratedBrief {
  const withoutScore: Omit<GeneratedBrief, 'qualityScore'> = {
    id: brief.id,
    projectId: brief.projectId,
    platform: brief.platform,
    contentType: brief.contentType,
    hook: sanitizeRiskyCopy(brief.hook, project.brandGuardrails),
    visualDirection: brief.visualDirection,
    voiceoverDirection: brief.voiceoverDirection,
    cta: sanitizeRiskyCopy(brief.cta, project.brandGuardrails),
    riskLevel: brief.riskLevel,
    riskNotes: buildRiskNotes(project, `${brief.hook} ${brief.cta}`),
    reusableStructure: brief.reusableStructure,
    status: brief.status,
  };
  const qualityScore = evaluateBriefQuality(withoutScore, project);
  return {
    ...withoutScore,
    riskLevel: riskLevelFromScore(qualityScore.brandSafety),
    qualityScore,
  };
}

export function regenerateBriefVariant(project: ListingProject, originalBrief: GeneratedBrief, variantSeed: string): GeneratedBrief {
  const seedScore = Array.from(variantSeed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const generated = generateBriefs(project, { count: 12 });
  const candidate = generated[(seedScore + originalBrief.contentType.length) % generated.length];
  const hook = sanitizeRiskyCopy(
    `${candidate.hook.replace(/。$/, '')}（${originalBrief.contentType}变体 ${Math.abs(seedScore % 9) + 1}）`,
    project.brandGuardrails,
  );
  return reScoreBrief({
    ...candidate,
    id: `${originalBrief.id}-variant-${slugify(variantSeed) || 'local'}`,
    contentType: originalBrief.contentType,
    hook,
    reusableStructure: originalBrief.reusableStructure,
    status: 'draft',
  }, project);
}

export function regenerateBriefSet(project: ListingProject, contentType: string): GeneratedBrief[] {
  const base = generateBriefs(project, { count: 12 }).find(brief => brief.contentType === contentType) || generateBriefs(project, { count: 6 })[0];
  return ['a', 'b', 'c'].map(seed => regenerateBriefVariant(project, { ...base, contentType }, `${contentType}-${seed}`));
}

export function buildFactoryTasks(project: ListingProject, briefs: GeneratedBrief[]): FactoryTask[] {
  return buildTasksFromBriefs(project, briefs);
}

export function buildTasksFromBriefs(project: ListingProject, briefs: GeneratedBrief[]): FactoryTask[] {
  return briefs.map(brief => ({
    id: `task-${brief.id}`,
    projectId: project.id,
    briefId: brief.id,
    title: `${brief.contentType}：${brief.hook}`,
    platform: brief.platform,
    status: brief.riskLevel === 'high' ? 'pending_brand_review' : 'pending_generation',
    riskLevel: brief.riskLevel,
    nextAction: brief.riskLevel === 'high' ? '先做品牌安全审核' : '推进到内容任务队列',
  }));
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildCalendarFromTasks(tasks: FactoryTask[], startDate = new Date()): ContentCalendarItem[] {
  const items = tasks.map((task, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + (index % 7));
    return {
      id: `calendar-${task.id}`,
      taskId: task.id,
      projectId: task.projectId,
      briefId: task.briefId,
      date: toDateString(date),
      platform: task.platform,
      title: task.title,
      status: task.status === 'pending_brand_review' ? 'pending_review' : 'planned',
      riskLevel: task.riskLevel,
    } satisfies ContentCalendarItem;
  });

  while (items.length > 0 && items.length < 7) {
    const base = items[items.length % tasks.length];
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + items.length);
    items.push({
      ...base,
      id: `${base.id}-extra-${items.length}`,
      date: toDateString(date),
    });
  }

  return items;
}

export function advanceTaskStatus(task: FactoryTask): FactoryTask {
  const flow: FactoryTaskStatus[] = ['pending_generation', 'pending_brand_review', 'deliverable', 'in_report', 'archived'];
  const currentIndex = Math.max(0, flow.indexOf(task.status));
  const nextStatus = flow[Math.min(currentIndex + 1, flow.length - 1)];
  return {
    ...task,
    status: nextStatus,
    nextAction: nextStatus === 'archived' ? '已归档到交付包' : `下一步推进到 ${nextStatus}`,
  };
}

export function moveCalendarItem(item: ContentCalendarItem, days: number): ContentCalendarItem {
  const date = new Date(`${item.date}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return { ...item, date: toDateString(date) };
}

export function buildPocReport(project: ListingProject, briefs: GeneratedBrief[]): PocReport {
  const highRiskCount = briefs.filter(brief => brief.riskLevel === 'high').length;
  const mediumRiskCount = briefs.filter(brief => brief.riskLevel === 'medium').length;
  const angles = unique(briefs.map(brief => brief.contentType)).slice(0, 5);
  const scoreValues = briefs.map(brief => brief.qualityScore.overallScore ?? brief.qualityScore.overall);
  const minScore = Math.min(...scoreValues);
  const maxScore = Math.max(...scoreValues);
  const priorityContentTypes = briefs
    .filter(brief => brief.riskLevel !== 'high')
    .sort((a, b) => (b.qualityScore.overallScore ?? b.qualityScore.overall) - (a.qualityScore.overallScore ?? a.qualityScore.overall))
    .map(brief => brief.contentType);
  const notRecommendedToScale = unique(briefs.filter(brief => brief.riskLevel === 'high').map(brief => brief.contentType)).slice(0, 3);
  const riskSummary = unique(briefs.flatMap(brief => brief.riskNotes.map(safeRiskLabel))).slice(0, 4).join('；') || '未发现高风险表达，但仍建议正式生产前人工复核。';
  const pricingRecommendation = briefs.length >= 10 || project.targetPlatforms.length >= 4
    ? 'Enterprise'
    : briefs.length >= 6 || mediumRiskCount >= 2
      ? 'Growth'
      : 'Starter';
  const firstRoundProductionCount = Math.max(6, Math.min(24, priorityContentTypes.length * 4 || briefs.length));
  const guardrailFocus = project.brandGuardrails.slice(0, 2).map(safeRiskLabel).join('、') || '品牌禁区';
  const conclusion = `${project.productName} 适合进入第一轮内容试跑，优先测试 ${unique(priorityContentTypes).slice(0, 2).join('、') || angles.slice(0, 2).join('、')}，同时把${guardrailFocus}作为审核重点。`;

  return {
    projectId: project.id,
    summary: `${project.productName} 已完成本地上新试跑，生成 ${briefs.length} 条受类目规则和品牌禁区约束的内容 Brief。${conclusion}`,
    conclusion,
    categoryRuleSummary: project.categoryRules.length > 0
      ? `本轮类目规则重点是：${project.categoryRules.map(safeRiskLabel).join('；')}。`
      : '本轮按保守类目规则生成，建议正式生产前补充平台限制。',
    brandGuardrailSummary: summarizeGuardrailImpact(project),
    briefCount: briefs.length,
    highRiskCount,
    recommendedContentAngles: angles,
    priorityContentTypes: unique(priorityContentTypes).slice(0, 3),
    notRecommendedToScale: notRecommendedToScale.length > 0 ? notRecommendedToScale : ['高风险表达较少，暂不建议跳过人工审核直接放大。'],
    highRiskExpressionSummary: riskSummary,
    qualityScoreRange: `${minScore}-${maxScore}`,
    firstRoundProductionCount,
    executionPriority: [
      `P0：先审核 ${mediumRiskCount + highRiskCount} 条中高风险 Brief，确认品牌安全表达。`,
      `P1：优先测试 ${unique(priorityContentTypes).slice(0, 2).join('、') || '痛点转化'} 两类内容，建议首轮生产 ${firstRoundProductionCount} 条变体。`,
      `P2：暂不建议立即放大 ${notRecommendedToScale.join('、') || '高风险内容'}，先补素材和审核口径。`,
      'P3：素材方向确认后，将可交付 Brief 归档到客户交付包。',
    ],
    clientSummary: `本轮已为 ${project.productName} 完成本地试跑：结合 ${project.category} 类目规则、品牌禁区和 ${project.targetPlatforms.join(' / ')} 平台目标，生成 ${briefs.length} 条 Brief，质量评分区间为 ${minScore}-${maxScore}。建议第一轮先生产 ${firstRoundProductionCount} 条内容变体，优先验证 ${unique(priorityContentTypes).slice(0, 2).join('、') || '痛点转化'}，并在正式放量前完成品牌安全复核。`,
    pricingRecommendation,
  };
}

function firstSentence(text: string) {
  return text.split(/[。！？.!?\n]/).map(item => item.trim()).find(Boolean) || text.slice(0, 36);
}

function findTextSegment(text: string, patterns: RegExp[], fallback: string) {
  const parts = text.split(/[。！？.!?\n]/).map(item => item.trim()).filter(Boolean);
  return parts.find(part => patterns.some(pattern => pattern.test(part))) || fallback;
}

function categoryAssetHints(category: string) {
  if (/美妆|个护|洗发|精华|护肤/.test(category)) {
    return {
      visuals: ['使用前后对比图', '质地特写', '浴室或梳妆台场景', '手部试用镜头'],
      note: '美妆个护素材要拍质地、使用动作和真实场景，避免功效承诺。',
    };
  }
  if (/宠物|猫|狗|牙粉|猫砂/.test(category)) {
    return {
      visuals: ['宠物日常反应', '喂食或护理场景', '主人手部操作特写', '清洁前后环境'],
      note: '宠物素材优先拍宠物反应、主人操作和日常场景，不替代兽医建议。',
    };
  }
  if (/3C|耳机|充电|配件|数码/.test(category)) {
    return {
      visuals: ['功能演示', '手持特写', '接口或按键近景', '通勤或桌面场景'],
      note: '3C 素材要拍清功能路径、兼容边界和手持特写。',
    };
  }
  if (/食品|饮料|咖啡|燕麦|低糖/.test(category)) {
    return {
      visuals: ['开袋或开瓶镜头', '食用场景', '成分表特写', '早餐或办公室场景'],
      note: '食品饮料素材要拍开袋、食用和成分信息，避免健康功效承诺。',
    };
  }
  if (/教育|学习|规划|志愿/.test(category)) {
    return {
      visuals: ['家长沟通场景', '学生学习桌面', '规划表或报告页', '老师讲解镜头'],
      note: '教育产品素材要呈现家长、学生和规划过程，避免保证结果。',
    };
  }
  return {
    visuals: ['产品正面图', '使用场景图', '细节特写', '包装和规格图'],
    note: '通用素材要覆盖产品、场景、细节和购买前核对信息。',
  };
}

function platformDuration(platform: string) {
  if (/TikTok/.test(platform)) return '15 秒';
  if (/Instagram/.test(platform)) return '20 秒';
  if (/Amazon/.test(platform)) return '30 秒';
  if (/Shopify/.test(platform)) return '25 秒';
  return '25 秒';
}

function platformScriptTone(platform: string) {
  if (/TikTok/.test(platform)) return '快节奏口语开场，3 秒内抛出具体场景';
  if (/Instagram/.test(platform)) return 'lifestyle 画面优先，突出生活方式和质感';
  if (/小红书/.test(platform)) return '真实体验和避坑语气，先说适合谁';
  if (/Amazon/.test(platform)) return 'FAQ 和功能解释优先，突出购买前核对';
  if (/Shopify/.test(platform)) return '品牌故事和落地页转化，强调下一步行动';
  return '真实场景开场，清楚解释使用边界';
}

export function deconstructReferenceCreative(reference: ReferenceCreative, project: ListingProject): CreativeDeconstruction {
  const rawText = reference.rawText || [reference.observedHook, reference.observedStructure].join(' ');
  const categoryProfile = getCategoryProfile(reference.category || project.category);
  const hookPattern = reference.observedHook || firstSentence(rawText);
  const painPoint = findTextSegment(rawText, [/怕|担心|麻烦|味道|乱|掉|不知|问题|痛点/], categoryProfile.pain);
  const productReveal = findTextSegment(rawText, [/用|换成|选择|这个|产品|工具|方案/], project.sellingPoints[0] || project.productName);
  const proofPoint = findTextSegment(rawText, [/因为|对比|实测|成分|材质|步骤|数据|规格/], project.sellingPoints.slice(0, 2).join(' / ') || '用可拍摄细节做证明');
  const objectionHandling = findTextSegment(rawText, [/不是|不一定|先别|适合|不适合|边界|注意/], project.categoryRules[0] || categoryProfile.caution);
  const ctaPattern = findTextSegment(rawText, [/评论|保存|私信|下单|查看|领取|咨询/], '保存清单或评论具体使用场景');
  const riskWarnings = unique([
    ...detectRestrictedClaims(rawText, project.brandGuardrails),
    ...project.brandGuardrails.slice(0, 2),
    categoryProfile.caution,
  ]).filter(Boolean);
  const suitableBriefTypes = unique([
    /问题|疑问|FAQ|吗|如何/.test(rawText) ? 'FAQ 回应' : '痛点转化',
    /对比|实测|规格/.test(rawText) ? '对比测评' : '达人种草',
    project.contentGoal || '上新',
  ]).slice(0, 4);

  return {
    referenceId: reference.id,
    hookPattern,
    painPoint,
    productReveal,
    proofPoint,
    objectionHandling,
    ctaPattern,
    reusableStructure: `${hookPattern} -> ${painPoint} -> ${productReveal} -> ${proofPoint} -> ${ctaPattern}`,
    riskWarnings,
    suitableBriefTypes,
  };
}

export function buildScriptFromBrief(project: ListingProject, brief: GeneratedBrief): GeneratedScript {
  const assetHints = categoryAssetHints(project.category);
  const duration = platformDuration(brief.platform);
  const tone = platformScriptTone(brief.platform);
  const hook = sanitizeRiskyCopy(brief.hook, project.brandGuardrails);
  const cta = sanitizeRiskyCopy(brief.cta, project.brandGuardrails);
  const scenes: Scene[] = [
    {
      id: `scene-${brief.id}-1`,
      timestamp: '0-3s',
      visual: `${assetHints.visuals[0]}，画面直接进入真实使用场景`,
      voiceoverLine: sanitizeRiskyCopy(`${hook} ${tone}。`, project.brandGuardrails),
      onScreenText: hook.slice(0, 28),
      assetNeed: assetHints.visuals[0],
      riskNote: brief.riskNotes[0] || assetHints.note,
    },
    {
      id: `scene-${brief.id}-2`,
      timestamp: '3-8s',
      visual: `${assetHints.visuals[1]}，展示 ${project.sellingPoints[0] || project.productName}`,
      voiceoverLine: sanitizeRiskyCopy(`先看 ${project.sellingPoints[0] || project.productName} 是否符合你的场景。`, project.brandGuardrails),
      onScreenText: project.sellingPoints[0] || project.productName,
      assetNeed: assetHints.visuals[1],
      riskNote: project.categoryRules[0] || assetHints.note,
    },
    {
      id: `scene-${brief.id}-3`,
      timestamp: '8-16s',
      visual: `${assetHints.visuals[2]}，补充使用步骤和边界`,
      voiceoverLine: sanitizeRiskyCopy(brief.voiceoverDirection, project.brandGuardrails),
      onScreenText: brief.contentType,
      assetNeed: assetHints.visuals[2],
      riskNote: brief.riskNotes[1] || '保留适用条件，不做绝对承诺。',
    },
    {
      id: `scene-${brief.id}-4`,
      timestamp: '16-25s',
      visual: `${assetHints.visuals[3]}，收束到购买前核对或评论区互动`,
      voiceoverLine: cta,
      onScreenText: cta.slice(0, 24),
      assetNeed: assetHints.visuals[3],
      riskNote: 'CTA 避免虚假稀缺、绝对收益和平台外承诺。',
    },
  ];
  const withoutScore = {
    id: `script-${brief.id}`,
    briefId: brief.id,
    projectId: project.id,
    platform: brief.platform,
    title: `${brief.contentType}脚本：${project.productName}`,
    duration,
    openingHook: hook,
    scenes,
    voiceover: scenes.map(scene => scene.voiceoverLine).join('\n'),
    onScreenText: scenes.map(scene => scene.onScreenText),
    cta,
    riskNotes: unique([...brief.riskNotes, ...scenes.map(scene => scene.riskNote)]).slice(0, 8),
  };

  return {
    ...withoutScore,
    qualityScore: evaluateBriefQuality({
      id: brief.id,
      projectId: project.id,
      platform: brief.platform,
      contentType: brief.contentType,
      hook,
      visualDirection: scenes.map(scene => scene.visual).join('；'),
      voiceoverDirection: withoutScore.voiceover,
      cta,
      riskLevel: brief.riskLevel,
      riskNotes: withoutScore.riskNotes,
      reusableStructure: brief.reusableStructure,
      status: brief.status,
    }, project),
  };
}

export function buildStoryboardFromScript(project: ListingProject, script: GeneratedScript): Storyboard {
  const hints = categoryAssetHints(project.category);
  const shots = script.scenes.map((scene, index) => ({
    id: `shot-${script.id}-${index + 1}`,
    order: index + 1,
    shotType: index === 0 ? '开场特写' : index === script.scenes.length - 1 ? '收束 CTA' : '过程演示',
    cameraDirection: index % 2 === 0 ? '手持近景，保留真实环境声音' : '固定机位，中近景展示动作路径',
    visualDescription: scene.visual,
    requiredAssets: unique([scene.assetNeed, hints.visuals[index % hints.visuals.length], project.productName]),
    subtitle: scene.onScreenText,
    estimatedSeconds: Math.max(3, Math.round(25 / script.scenes.length)),
    productionNote: `${hints.note} ${scene.riskNote}`,
  }));

  return {
    scriptId: script.id,
    projectId: project.id,
    shots,
  };
}

export function buildAssetPlan(project: ListingProject, scripts: GeneratedScript[], storyboards: Storyboard[]): AssetPlan {
  const assets = unique(storyboards.flatMap(storyboard => storyboard.shots.flatMap(shot => shot.requiredAssets)));
  const overlays = unique(scripts.flatMap(script => script.onScreenText)).slice(0, 12);
  const voiceover = scripts.map(script => `${script.title}：${script.duration}`);
  const requiredImages = assets.filter((_, index) => index % 3 === 0);
  const requiredVideos = assets.filter((_, index) => index % 3 !== 0);
  const missingAssets = unique([
    ...requiredVideos.slice(0, 4).map(item => `待拍摄视频：${item}`),
    ...requiredImages.slice(0, 3).map(item => `待补充图片：${item}`),
  ]);

  return {
    projectId: project.id,
    requiredImages,
    requiredVideos,
    requiredTextOverlays: overlays,
    requiredVoiceover: voiceover,
    optionalAssets: ['包装开箱镜头', '评论区问题截图', '品牌色背景图'].filter(item => !assets.includes(item)),
    missingAssets,
    productionPriority: [
      `先拍 ${project.productName} 的真实使用场景`,
      `补齐 ${project.category} 的关键细节和边界说明`,
      '再录制口播与字幕版本，进入批量变体生产',
    ],
  };
}

function assetTypeFromMime(mimeType = '', fileName = ''): LocalAsset['type'] {
  const value = `${mimeType} ${fileName}`.toLowerCase();
  if (/video|\.mp4|\.mov|\.webm/.test(value)) return 'video';
  if (/audio|\.mp3|\.wav|\.m4a/.test(value)) return 'audio';
  if (/text|\.txt|\.md|\.csv/.test(value)) return 'text';
  if (/reference|url|link/.test(value)) return 'reference';
  return 'image';
}

function formatSizeLabel(size?: number) {
  if (!size || size <= 0) return '未记录';
  if (size >= 1024 * 1024) return `${Math.round((size / 1024 / 1024) * 10) / 10} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function makeAssetTag(label: string): AssetTag {
  const lower = label.toLowerCase();
  const type: AssetTag['type'] =
    /产品|product|主图|特写/.test(label) ? 'product'
      : /生活|场景|lifestyle/.test(label) ? 'lifestyle'
        : /证明|评价|review|proof|成分|规格/.test(label) ? 'proof'
          : /教程|步骤|tutorial|操作/.test(label) ? 'tutorial'
            : /口播|voice/.test(label) ? 'voiceover'
              : /字幕|subtitle|text/.test(label) ? 'subtitle'
                : /包装|pack/.test(label) ? 'packaging'
                  : /背景|background/.test(label) ? 'background'
                    : /testimonial|用户/.test(lower) ? 'testimonial'
                      : 'reference';
  return { id: `tag-${slugify(label)}`, label, type };
}

export function inferAssetTags(asset: Pick<LocalAsset, 'name' | 'type' | 'fileName' | 'tags'>, project?: ListingProject): AssetTag[] {
  const text = `${asset.name} ${asset.fileName} ${project?.category || ''}`.toLowerCase();
  const labels = [
    ...asset.tags.map(tag => tag.label),
    asset.type === 'video' ? '视频' : '',
    asset.type === 'image' ? '图片' : '',
    asset.type === 'audio' ? '口播' : '',
    asset.type === 'text' ? '字幕' : '',
    /product|main|主图|产品|closeup|特写|handheld/.test(text) ? '产品' : '',
    /lifestyle|scene|场景|生活|daily/.test(text) ? '生活方式' : '',
    /pack|包装|box/.test(text) ? '包装' : '',
    /review|评价|proof|成分|ingredient|规格/.test(text) ? '证明' : '',
    /tutorial|howto|step|教程|步骤/.test(text) ? '教程' : '',
    /background|背景/.test(text) ? '背景' : '',
    /reference|参考|竞品/.test(text) ? '参考' : '',
  ].filter(Boolean);
  return unique(labels).map(makeAssetTag);
}

export function createLocalAssetFromFileMeta(
  projectId: string,
  fileMeta: { name: string; type?: string; size?: number; durationLabel?: string; previewUrl?: string; hasSessionFile?: boolean },
  project?: ListingProject,
): LocalAsset {
  const type = assetTypeFromMime(fileMeta.type, fileMeta.name);
  const hasSessionFile = Boolean(fileMeta.hasSessionFile || fileMeta.previewUrl);
  const baseAsset: LocalAsset = {
    id: `asset-${projectId}-${slugify(fileMeta.name)}-${Date.parse(project?.createdAt || '') || fileMeta.name.length}`,
    projectId,
    name: fileMeta.name.replace(/\.[^.]+$/, ''),
    type,
    source: 'local_upload',
    fileName: fileMeta.name,
    mimeType: fileMeta.type || '',
    sizeLabel: formatSizeLabel(fileMeta.size),
    durationLabel: fileMeta.durationLabel || '',
    tags: [],
    category: project?.category || '',
    platformFit: project?.targetPlatforms || [],
    riskNotes: project?.brandGuardrails.slice(0, 2) || [],
    usableForShots: [],
    createdAt: new Date(0).toISOString(),
    previewUrl: fileMeta.previewUrl,
    hasSessionFile,
    sessionOnlyNote: hasSessionFile
      ? '文件只在当前浏览器会话中预览，不会上传云端；导出 JSON 仅保留 metadata。'
      : '仅保存素材 metadata；刷新或导入后需要重新关联本地文件才能恢复预览。',
  };
  const tags = inferAssetTags(baseAsset, project);
  return {
    ...baseAsset,
    tags,
    usableForShots: tags.map(tag => tag.label),
  };
}

export function createManualAsset(
  projectId: string,
  input: {
    name: string;
    type: LocalAsset['type'];
    description?: string;
    tags?: string[];
    platformFit?: string[];
    riskNotes?: string[];
  },
  project?: ListingProject,
): LocalAsset {
  const baseAsset: LocalAsset = {
    id: `asset-${projectId}-${slugify(input.name)}-manual`,
    projectId,
    name: input.name,
    type: input.type,
    source: 'manual_entry',
    fileName: input.name,
    mimeType: input.type === 'text' ? 'text/plain' : input.type,
    sizeLabel: '手动登记',
    durationLabel: '',
    tags: (input.tags || []).map(makeAssetTag),
    category: project?.category || '',
    platformFit: input.platformFit || project?.targetPlatforms || [],
    riskNotes: input.riskNotes || project?.brandGuardrails.slice(0, 2) || [],
    usableForShots: input.description ? [input.description] : [],
    createdAt: new Date(0).toISOString(),
  };
  const tags = inferAssetTags(baseAsset, project);
  return {
    ...baseAsset,
    tags,
    usableForShots: unique([...baseAsset.usableForShots, ...tags.map(tag => tag.label)]),
  };
}

export function tagAsset(asset: LocalAsset, tags: string[]): LocalAsset {
  const nextTags = unique([...asset.tags.map(tag => tag.label), ...tags]).map(makeAssetTag);
  return {
    ...asset,
    tags: nextTags,
    usableForShots: unique([...asset.usableForShots, ...nextTags.map(tag => tag.label)]),
  };
}

export function summarizeAssetLibrary(assets: LocalAsset[]) {
  const byType = assets.reduce<Record<LocalAsset['type'], number>>((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, { image: 0, video: 0, audio: 0, text: 0, reference: 0 });
  const tagLabels = unique(assets.flatMap(asset => asset.tags.map(tag => tag.label)));
  return {
    total: assets.length,
    byType,
    tagLabels,
    productAssets: assets.filter(asset => asset.tags.some(tag => tag.type === 'product')).length,
    videoAssets: byType.video,
    riskNotes: unique(assets.flatMap(asset => asset.riskNotes)).slice(0, 6),
  };
}

function assetMatchesRequirement(asset: LocalAsset, requirement: string) {
  const haystack = `${asset.name} ${asset.fileName} ${asset.tags.map(tag => tag.label).join(' ')} ${asset.usableForShots.join(' ')}`.toLowerCase();
  const req = requirement.toLowerCase();
  if (req.includes(asset.type)) return true;
  if (/产品|product|特写|主图/.test(requirement) && asset.tags.some(tag => tag.type === 'product')) return true;
  if (/场景|生活|lifestyle|日常/.test(requirement) && asset.tags.some(tag => tag.type === 'lifestyle')) return true;
  if (/包装|pack/.test(requirement) && asset.tags.some(tag => tag.type === 'packaging')) return true;
  if (/字幕|文案|text/.test(requirement) && asset.tags.some(tag => tag.type === 'subtitle')) return true;
  if (/口播|voice/.test(requirement) && asset.tags.some(tag => tag.type === 'voiceover')) return true;
  return requirement
    .split(/\s|\/|、|，|,|：|:/)
    .map(word => word.trim())
    .filter(word => word.length > 1)
    .some(word => haystack.includes(word.toLowerCase()));
}

export function matchAssetsToStoryboard(project: ListingProject, storyboard: Storyboard, assets: LocalAsset[]): ShotAssetMatch[] {
  return storyboard.shots.map(shot => {
    const matchedAssets = assets.filter(asset => shot.requiredAssets.some(requirement => assetMatchesRequirement(asset, requirement)));
    const missingRequirements = shot.requiredAssets.filter(requirement => !matchedAssets.some(asset => assetMatchesRequirement(asset, requirement)));
    const matchScore = clampScore(Math.round((matchedAssets.length / Math.max(shot.requiredAssets.length, 1)) * 100));
    const recommendation = missingRequirements.length > 0
      ? `缺少 ${missingRequirements[0]}，建议补拍 3 秒竖屏和横屏各一条，适配 ${project.targetPlatforms[0] || '主平台'}。`
      : `已有素材可支持 ${shot.shotType}，进入剪辑前复核字幕和品牌禁区。`;
    return {
      shotId: shot.id,
      assetIds: matchedAssets.map(asset => asset.id),
      matchScore,
      missingRequirements,
      recommendation,
    };
  });
}

export function evaluateProductionReadiness(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'storyboards' | 'scripts' | 'variantMatrices'>): ProductionReadiness {
  const assets = run.assets || [];
  const matches = run.shotAssetMatches && run.shotAssetMatches.length > 0
    ? run.shotAssetMatches
    : run.storyboards.flatMap(storyboard => matchAssetsToStoryboard(run.project, storyboard, assets));
  const summary = summarizeAssetLibrary(assets);
  const blockers: string[] = [];
  const warnings: string[] = [];
  const missingAssets = unique(matches.flatMap(match => match.missingRequirements));
  const sessionAssets = assets.filter(asset => asset.hasSessionFile);
  const metadataOnlyAssets = assets.filter(asset => !asset.hasSessionFile);
  const matchedAssetIds = new Set(matches.flatMap(match => match.assetIds));
  const unmatchedSessionAssets = sessionAssets.filter(asset => !matchedAssetIds.has(asset.id));

  if (summary.productAssets === 0) blockers.push('缺少产品主图或产品特写素材');
  if (summary.videoAssets === 0) warnings.push('缺少可用于短视频剪辑的视频素材');
  if (!summary.tagLabels.some(label => /生活|场景/.test(label))) warnings.push('缺少生活方式图 / 场景图');
  if (!summary.tagLabels.some(label => /口播/.test(label)) && run.scripts.length === 0) blockers.push('缺少口播或脚本文案');
  if (!summary.tagLabels.some(label => /字幕/.test(label)) && run.scripts.length === 0) warnings.push('缺少字幕文案素材');
  if (matches.filter(match => match.matchScore >= 70).length < Math.min(3, matches.length)) warnings.push('关键 shot 素材覆盖不足');
  if (assets.some(asset => asset.riskNotes.length > 2)) warnings.push('部分素材带有较多风险备注，需要人工复核');
  if (metadataOnlyAssets.length > 0) warnings.push('部分素材仅有 metadata，刷新或导入后需要重新关联本地文件恢复预览。');
  if (sessionAssets.length === 0 && assets.length > 0) warnings.push('当前没有可预览的真实会话文件，不能伪装为完整素材就绪。');
  if (unmatchedSessionAssets.length > 0) warnings.push(`${unmatchedSessionAssets.length} 个可预览素材尚未匹配到关键 shot。`);
  const variantCount = run.variantMatrices.reduce((sum, matrix) => sum + matrix.variants.length, 0);
  if (variantCount < 3) blockers.push('不足以支持至少 3 条内容变体');

  const score = clampScore(
    82
    - blockers.length * 18
    - warnings.length * 6
    - Math.min(missingAssets.length, 8) * 3
    + Math.min(summary.total, 8) * 2
    + Math.min(sessionAssets.length, 6) * 4,
  );
  return {
    ready: blockers.length === 0 && score >= 72,
    score,
    blockers,
    warnings,
    missingAssets: missingAssets.slice(0, 12),
    recommendedNextStep: blockers.length > 0
      ? `还有 ${blockers.length} 个生产阻塞项，先补齐产品图、特写或口播素材。`
      : sessionAssets.length > 0
        ? '可生成 Assembly Manifest；交付剪辑前请连同真实素材文件一起打包。'
        : '可先用 metadata 规划剪辑清单，但交付剪辑前需要重新关联本地素材文件。',
  };
}

export function buildAssemblyPlan(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'storyboards' | 'scripts' | 'variantMatrices'>): AssemblyPlan {
  const assets = run.assets || [];
  const matchesByShot = new Map(
    (run.shotAssetMatches && run.shotAssetMatches.length > 0
      ? run.shotAssetMatches
      : run.storyboards.flatMap(storyboard => matchAssetsToStoryboard(run.project, storyboard, assets)))
      .map(match => [match.shotId, match]),
  );
  const items = run.storyboards.flatMap(storyboard => {
    const script = run.scripts.find(item => item.id === storyboard.scriptId);
    const matrix = run.variantMatrices.find(item => item.variants.some(variant => variant.derivedScriptId === storyboard.scriptId)) || run.variantMatrices[0];
    const variant = matrix?.variants[0];
    return storyboard.shots.map(shot => {
      const match = matchesByShot.get(shot.id);
      const status: AssemblyItem['status'] = match && match.missingRequirements.length === 0
        ? 'ready_for_edit'
        : match && match.assetIds.length > 0
          ? 'planned'
          : 'missing_assets';
      return {
        id: `assembly-${shot.id}`,
        scriptId: storyboard.scriptId,
        storyboardId: storyboard.scriptId,
        shotId: shot.id,
        variantId: variant?.id || '',
        platform: script?.platform || variant?.platform || run.project.targetPlatforms[0] || 'TikTok',
        assetIds: match?.assetIds || [],
        subtitle: shot.subtitle,
        voiceoverLine: script?.scenes.find(scene => scene.id.replace('scene', 'shot') === shot.id)?.voiceoverLine || shot.subtitle,
        estimatedSeconds: shot.estimatedSeconds,
        productionNote: match?.recommendation || shot.productionNote,
        status,
      };
    });
  });

  return { projectId: run.project.id, items };
}

export function buildAssemblyManifestMarkdown(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'storyboards' | 'scripts' | 'variantMatrices'>) {
  const plan = run.assemblyPlan || buildAssemblyPlan(run);
  return [
    '# Assembly Manifest',
    '',
    `SKU：${run.project.productName}`,
    `类目：${run.project.category}`,
    '',
    ...plan.items.slice(0, 40).map(item => [
      `## ${item.platform} · ${item.shotId}`,
      `- 状态：${item.status}`,
      `- 素材：${item.assetIds.length > 0 ? item.assetIds.join(' / ') : '缺失素材'}`,
      `- 字幕：${item.subtitle}`,
      `- 口播：${item.voiceoverLine}`,
      `- 秒数：${item.estimatedSeconds}`,
      `- 生产备注：${item.productionNote}`,
    ].join('\n')),
  ].join('\n');
}

export function buildAssemblyManifestCsv(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'storyboards' | 'scripts' | 'variantMatrices'>) {
  const plan = run.assemblyPlan || buildAssemblyPlan(run);
  const header = ['id', 'scriptId', 'shotId', 'variantId', 'platform', 'assetIds', 'subtitle', 'voiceoverLine', 'estimatedSeconds', 'status'];
  const rows = plan.items.map(item => [
    item.id,
    item.scriptId,
    item.shotId,
    item.variantId,
    item.platform,
    item.assetIds.join('|'),
    item.subtitle,
    item.voiceoverLine,
    item.estimatedSeconds,
    item.status,
  ]);
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

function secondsToSrtTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((safeSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (safeSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs},000`;
}

function batchStatusFromItem(assetCoverageScore: number, missingAssets: string[], riskLevel: EngineRiskLevel): ProductionBatchQaStatus {
  if (riskLevel === 'high') return 'needs_review';
  if (missingAssets.length > 0 || assetCoverageScore < 55) return 'needs_assets';
  if (assetCoverageScore >= 82) return 'ready_for_delivery';
  if (assetCoverageScore >= 65) return 'ready_for_edit';
  return 'draft';
}

function deliveryStatusFromBatch(items: ProductionBatchItem[]): ProductionBatchQaStatus {
  if (items.length === 0) return 'draft';
  if (items.some(item => item.qaStatus === 'needs_review')) return 'needs_review';
  if (items.some(item => item.qaStatus === 'needs_assets')) return 'needs_assets';
  if (items.every(item => item.qaStatus === 'ready_for_delivery')) return 'ready_for_delivery';
  return 'ready_for_edit';
}

function riskAllowed(riskLevel: EngineRiskLevel, riskTolerance: 'low' | 'medium' | 'high') {
  if (riskTolerance === 'high') return true;
  if (riskTolerance === 'medium') return riskLevel !== 'high';
  return riskLevel === 'low';
}

type BatchBuildRun = Pick<
  ListingFactoryRun,
  'id' | 'project' | 'briefs' | 'scripts' | 'storyboards' | 'variantMatrices' | 'assets' | 'shotAssetMatches' | 'assemblyPlan'
> & Partial<ListingFactoryRun>;

export function buildProductionBatch(
  run: BatchBuildRun,
  options: {
    name?: string;
    goal?: string;
    platforms?: string[];
    maxItems?: number;
    contentTypes?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
    includeVariants?: boolean;
  } = {},
): ProductionBatch {
  const maxItems = Math.max(6, options.maxItems ?? 8);
  const riskTolerance = options.riskTolerance ?? 'medium';
  const platformFilter = options.platforms?.filter(Boolean) || [];
  const contentTypeFilter = options.contentTypes?.filter(Boolean) || [];
  const scripts = run.scripts.length > 0 ? run.scripts : run.briefs.slice(0, maxItems).map(brief => buildScriptFromBrief(run.project, brief));
  const storyboards = run.storyboards.length > 0 ? run.storyboards : scripts.map(script => buildStoryboardFromScript(run.project, script));
  const matchesByShot = new Map(run.shotAssetMatches.map(match => [match.shotId, match]));
  const briefCandidates = run.briefs.map(brief => ({
    brief,
    variant: undefined as ContentVariant | undefined,
    score: brief.qualityScore.overallScore,
  }));
  const variantCandidates = options.includeVariants === false
    ? []
    : run.variantMatrices.flatMap(matrix => matrix.variants.map(variant => {
        const brief = run.briefs.find(item => item.id === variant.briefId);
        if (!brief) return null;
        return { brief, variant, score: variant.qualityScore.overallScore + 2 };
      }).filter((item): item is { brief: GeneratedBrief; variant: ContentVariant; score: number } => Boolean(item)));
  const candidates = [...briefCandidates, ...variantCandidates]
    .filter(candidate => platformFilter.length === 0 || platformFilter.includes(candidate.variant?.platform || candidate.brief.platform))
    .filter(candidate => contentTypeFilter.length === 0 || contentTypeFilter.includes(candidate.brief.contentType))
    .filter(candidate => riskAllowed(candidate.variant?.riskLevel || candidate.brief.riskLevel, riskTolerance))
    .sort((a, b) => b.score - a.score);
  const selected = candidates.slice(0, maxItems);
  const now = new Date().toISOString();
  const batchId = `batch-${run.project.id}-${slugify(options.name || 'local-batch')}`;

  const batchItems = selected.map((candidate, index): ProductionBatchItem => {
    const brief = candidate.brief;
    const variant = candidate.variant;
    const script = scripts.find(item => item.briefId === brief.id) || buildScriptFromBrief(run.project, brief);
    const storyboard = storyboards.find(item => item.scriptId === script.id) || buildStoryboardFromScript(run.project, script);
    const shotMatches = storyboard.shots.map(shot => matchesByShot.get(shot.id)).filter((match): match is ShotAssetMatch => Boolean(match));
    const missingAssets = unique([
      ...shotMatches.flatMap(match => match.missingRequirements),
      ...storyboard.shots
        .filter(shot => !shotMatches.some(match => match.shotId === shot.id))
        .flatMap(shot => shot.requiredAssets),
    ]).slice(0, 8);
    const assignedAssets = unique(shotMatches.flatMap(match => match.assetIds));
    const assetCoverageScore = shotMatches.length > 0
      ? average(shotMatches.map(match => match.matchScore))
      : 0;
    const riskLevel = variant?.riskLevel || brief.riskLevel;
    const qaStatus = batchStatusFromItem(assetCoverageScore, missingAssets, riskLevel);
    const hook = sanitizeRiskyCopy(variant?.hook || brief.hook, run.project.brandGuardrails);

    return {
      id: `${batchId}-item-${index + 1}`,
      projectId: run.project.id,
      batchId,
      briefId: brief.id,
      scriptId: script.id,
      storyboardId: storyboard.scriptId,
      variantId: variant?.id || '',
      platform: variant?.platform || script.platform || brief.platform,
      title: sanitizeRiskyCopy(`${brief.contentType}｜${run.project.productName}｜${index + 1}`, run.project.brandGuardrails),
      hook,
      contentType: brief.contentType,
      duration: script.duration,
      assetCoverageScore,
      qaStatus,
      assignedAssets,
      missingAssets,
      editPackId: `edit-pack-${slugify(`${batchId}-${brief.id}-${variant?.id || index + 1}`)}`,
      riskLevel,
      productionNote: missingAssets.length > 0
        ? `先补齐 ${missingAssets[0]}，再进入剪辑。`
        : '素材覆盖可进入剪辑排期，导出前复核字幕和品牌禁区。',
    };
  });

  const batchWithoutQa = {
    id: batchId,
    projectId: run.project.id,
    name: options.name || '本地批量生产批次',
    goal: options.goal || '把高分 Brief、变体、分镜和素材匹配组织成可交付编辑包',
    platforms: unique(batchItems.map(item => item.platform)),
    sourceBriefIds: unique(batchItems.map(item => item.briefId)),
    sourceVariantIds: unique(batchItems.map(item => item.variantId).filter(Boolean)),
    batchItems,
    qaSummary: {
      passed: false,
      score: 40,
      readyCount: 0,
      needsAssetCount: 0,
      needsReviewCount: 0,
      highRiskCount: 0,
      blockers: [],
      warnings: [],
      recommendedNextStep: '等待 QA 评估',
    },
    deliveryStatus: deliveryStatusFromBatch(batchItems),
    createdAt: now,
    updatedAt: now,
  };
  const editPacks = batchItems.map(item => buildEditPack(run, item));
  const qaSummary = evaluateBatchQa(batchWithoutQa, editPacks, run);
  return { ...batchWithoutQa, qaSummary, deliveryStatus: qaSummary.passed ? 'ready_for_delivery' : batchWithoutQa.deliveryStatus };
}

export function buildEditPack(run: BatchBuildRun, batchItem: ProductionBatchItem): EditPack {
  const brief = run.briefs.find(item => item.id === batchItem.briefId) || run.briefs[0];
  const script = run.scripts.find(item => item.id === batchItem.scriptId || item.briefId === batchItem.briefId) || buildScriptFromBrief(run.project, brief);
  const storyboard = run.storyboards.find(item => item.scriptId === script.id) || buildStoryboardFromScript(run.project, script);
  const assetById = new Map(run.assets.map(asset => [asset.id, asset]));
  let cursor = 0;
  const shotList = storyboard.shots.map((shot): EditPackShot => {
    const assemblyItem = run.assemblyPlan.items.find(item => item.shotId === shot.id);
    const match = run.shotAssetMatches.find(item => item.shotId === shot.id);
    const seconds = assemblyItem?.estimatedSeconds || shot.estimatedSeconds;
    const startSecond = cursor;
    const endSecond = cursor + seconds;
    cursor = endSecond;
    return {
      order: shot.order,
      startSecond,
      endSecond,
      visualDescription: shot.visualDescription,
      assetIds: assemblyItem?.assetIds || match?.assetIds || [],
      subtitle: sanitizeRiskyCopy(assemblyItem?.subtitle || shot.subtitle, run.project.brandGuardrails),
      voiceoverLine: sanitizeRiskyCopy(assemblyItem?.voiceoverLine || script.scenes[shot.order - 1]?.voiceoverLine || shot.subtitle, run.project.brandGuardrails),
      transitionNote: shot.order === 1 ? '硬切进入 Hook，前 3 秒避免铺垫。' : '按动作或字幕节奏切换，保持信息密度。',
      productionNote: assemblyItem?.productionNote || shot.productionNote,
    };
  });
  const assetManifest = shotList.flatMap(shot => {
    const assigned = shot.assetIds.length > 0
      ? shot.assetIds.map(assetId => {
          const asset = assetById.get(assetId);
          return {
            shotOrder: shot.order,
            assetId,
            fileName: asset?.fileName || assetId,
            usage: shot.visualDescription,
            missing: false,
          };
        })
      : [{
          shotOrder: shot.order,
          assetId: '',
          fileName: `missing-shot-${shot.order}`,
          usage: shot.visualDescription,
          missing: true,
        }];
    return assigned;
  });
  const baseName = safeDownloadFilename(`${run.project.productName}-${batchItem.platform}-${batchItem.id}`, 'md').replace(/\.md$/, '');

  return {
    id: batchItem.editPackId,
    batchItemId: batchItem.id,
    projectId: run.project.id,
    platform: batchItem.platform,
    title: sanitizeRiskyCopy(batchItem.title, run.project.brandGuardrails),
    duration: script.duration,
    shotList,
    subtitles: shotList.map(shot => shot.subtitle),
    voiceoverScript: `${run.project.productName}｜${batchItem.platform}\n${shotList.map(shot => `${shot.order}. ${shot.voiceoverLine}`).join('\n')}`,
    assetManifest,
    editInstructions: [
      `平台：${batchItem.platform}，时长：${script.duration}`,
      '先按 SRT 和口播稿完成粗剪，再根据素材 Manifest 补齐缺口。',
      '导出前复核品牌禁区、字幕截断和平台画幅。',
    ],
    riskChecklist: unique([
      ...script.riskNotes,
      ...batchItem.missingAssets.map(item => `缺失素材：${item}`),
      ...run.project.brandGuardrails.slice(0, 3),
    ]).slice(0, 8),
    exportNames: {
      srt: `${baseName}.srt`,
      voiceover: `${baseName}-voiceover.md`,
      edl: `${baseName}-edl.csv`,
      assetManifest: `${baseName}-assets.csv`,
      markdown: `${baseName}-edit-pack.md`,
    },
  };
}

export function buildSubtitleSrt(editPack: EditPack) {
  return editPack.shotList.map((shot, index) => [
    String(index + 1),
    `${secondsToSrtTime(shot.startSecond)} --> ${secondsToSrtTime(shot.endSecond)}`,
    shot.subtitle,
  ].join('\n')).join('\n\n');
}

export function buildVoiceoverScriptMarkdown(editPack: EditPack) {
  return [
    `# 口播稿｜${editPack.title}`,
    '',
    `- 平台：${editPack.platform}`,
    `- 时长：${editPack.duration}`,
    '',
    editPack.voiceoverScript,
  ].join('\n');
}

export function buildEditDecisionListCsv(editPack: EditPack) {
  const header = ['order', 'startSecond', 'endSecond', 'assetIds', 'subtitle', 'voiceover', 'transitionNote', 'productionNote'];
  const rows = editPack.shotList.map(shot => [
    shot.order,
    shot.startSecond,
    shot.endSecond,
    shot.assetIds.join('|') || 'missing',
    shot.subtitle,
    shot.voiceoverLine,
    shot.transitionNote,
    shot.productionNote,
  ]);
  return [header, ...rows].map(row => row.map(plainCsvCell).join(',')).join('\n');
}

export function buildAssetManifestCsv(editPack: EditPack) {
  const header = ['shotOrder', 'assetId', 'fileName', 'usage', 'missing'];
  const rows = editPack.assetManifest.map(item => [
    item.shotOrder,
    item.assetId,
    item.fileName,
    item.usage,
    item.missing ? 'true' : 'false',
  ]);
  return [header, ...rows].map(row => row.map(plainCsvCell).join(',')).join('\n');
}

function buildEditPackMarkdown(editPack?: EditPack) {
  if (!editPack) return '# Edit Pack\n\n暂无编辑包。';
  return [
    `# Edit Pack｜${editPack.title}`,
    '',
    `- 平台：${editPack.platform}`,
    `- 时长：${editPack.duration}`,
    `- SRT：${editPack.exportNames.srt}`,
    `- EDL：${editPack.exportNames.edl}`,
    '',
    '## Shot List',
    ...editPack.shotList.map(shot => `- ${shot.order}. ${shot.startSecond}-${shot.endSecond}s｜${shot.visualDescription}｜字幕：${shot.subtitle}｜素材：${shot.assetIds.join(' / ') || 'missing'}`),
    '',
    '## 风险 Checklist',
    ...editPack.riskChecklist.map(item => `- ${safeRiskLabel(item)}`),
  ].join('\n');
}

function aspectRatioForPlatform(platform: string) {
  if (/TikTok|小红书|灏忕孩涔?|Reels|Instagram/i.test(platform)) return '9:16';
  if (/Amazon/i.test(platform)) return '1:1';
  if (/Shopify/i.test(platform)) return '16:9';
  return '9:16';
}

function videoDurationFromEditPack(editPack: EditPack) {
  const last = editPack.shotList[editPack.shotList.length - 1];
  return Math.max(1, Math.round(last?.endSecond || 0));
}

function redactVideoPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactVideoPayload);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      key === 'sessionOnlyUrl' || key === 'previewUrl' ? '[session-only-url-redacted]' : redactVideoPayload(item),
    ]));
  }
  if (typeof value === 'string') {
    return value.replace(/blob:[^\s"']+/g, '[session-only-url-redacted]').replace(/data:[^\s"']+/g, '[inline-data-redacted]');
  }
  return value;
}

export function buildVideoScenePrompt(project: ListingProject, renderScene: RenderScene, platform: string) {
  return sanitizeRiskyCopy([
    `Product: ${project.productName}`,
    `Category: ${project.category}`,
    `Platform: ${platform}`,
    `Duration: ${renderScene.durationSeconds}s`,
    `Scene: ${renderScene.visualPrompt}`,
    `Subtitle: ${renderScene.subtitle}`,
    `Voiceover: ${renderScene.voiceoverLine}`,
    `Assets: ${renderScene.assetIds.join(' / ') || 'metadata only; no file upload'}`,
    `Brand guardrails: ${project.brandGuardrails.join(' / ')}`,
    'Avoid absolute claims, medical claims, competitor attacks, fake discounts, and exaggerated outcomes.',
    'Create a readable provider-ready video prompt. Do not promise viral performance.',
  ].join('\n'), project.brandGuardrails);
}

export function buildImageToVideoPrompt(project: ListingProject, shot: EditPackShot, asset?: LocalAsset) {
  return sanitizeRiskyCopy([
    `Image-to-video prompt for ${project.productName}`,
    `Shot ${shot.order}: ${shot.visualDescription}`,
    `Asset metadata: ${asset?.fileName || shot.assetIds.join(' / ') || 'missing asset'}`,
    `Subtitle: ${shot.subtitle}`,
    `Voiceover: ${shot.voiceoverLine}`,
    `Duration: ${Math.max(1, shot.endSecond - shot.startSecond)}s`,
    `Guardrails: ${project.brandGuardrails.join(' / ')}`,
  ].join('\n'), project.brandGuardrails);
}

export function buildTextToVideoPrompt(project: ListingProject, script: GeneratedScript, scene: Scene) {
  return sanitizeRiskyCopy([
    `Text-to-video prompt for ${project.productName}`,
    `Platform: ${script.platform}`,
    `Scene visual: ${scene.visual}`,
    `On-screen text: ${scene.onScreenText}`,
    `Voiceover: ${scene.voiceoverLine}`,
    `Asset need: ${scene.assetNeed}`,
    `Guardrails: ${project.brandGuardrails.join(' / ')}`,
  ].join('\n'), project.brandGuardrails);
}

export const localMockVideoProvider: VideoGenerationProvider = {
  id: 'local-mock-video',
  name: 'Local mock video assembly provider',
  mode: 'local_mock',
  available: () => true,
  buildPayload: job => buildProviderPayloadPreview(job, localMockVideoProvider),
  submitJob: job => buildMockVideoArtifacts(job),
  getJobStatus: () => 'completed_mock',
  normalizeResult: result => Array.isArray(result) ? result as VideoOutputArtifact[] : [],
};

export const externalVideoProvider: VideoGenerationProvider = {
  id: 'external-video',
  name: 'External video provider placeholder',
  mode: 'external_placeholder',
  available: () => false,
  buildPayload: job => buildProviderPayloadPreview(job, externalVideoProvider),
  submitJob: () => {
    throw new Error('External video provider is not configured.');
  },
  getJobStatus: () => 'provider_unavailable',
  normalizeResult: () => [],
};

function getVideoProvider(providerId?: string): VideoGenerationProvider {
  if (providerId === externalVideoProvider.id) return externalVideoProvider;
  return localMockVideoProvider;
}

export function buildProviderPayloadPreview(job: VideoAssemblyJob, provider: VideoGenerationProvider = localMockVideoProvider): VideoProviderPayloadPreview {
  return redactVideoPayload({
    providerId: provider.id,
    mode: job.mode,
    platform: job.platform,
    title: job.title,
    renderPlan: {
      aspectRatio: job.renderPlan.aspectRatio,
      duration: job.renderPlan.duration,
      scenes: job.renderPlan.scenes.map(scene => ({
        order: scene.order,
        durationSeconds: scene.durationSeconds,
        prompt: scene.visualPrompt,
        assetIds: scene.assetIds,
        subtitle: scene.subtitle,
        voiceoverLine: scene.voiceoverLine,
        transition: scene.transition,
      })),
      subtitles: job.renderPlan.subtitles,
      assetManifest: job.renderPlan.assetManifest.map(item => ({
        shotOrder: item.shotOrder,
        assetId: item.assetId,
        fileName: item.fileName,
        usage: item.usage,
        missing: item.missing,
      })),
    },
    boundary: 'No real video rendering, no file upload, metadata only.',
  }) as VideoProviderPayloadPreview;
}

function buildMockVideoArtifacts(job: VideoAssemblyJob): VideoOutputArtifact[] {
  const payload = buildProviderPayloadPreview(job, localMockVideoProvider);
  return [
    {
      id: `artifact-${job.id}-storyboard`,
      jobId: job.id,
      type: 'storyboard_preview',
      name: `${job.title}-storyboard-preview.md`,
      format: 'markdown',
      content: buildRenderPlanMarkdown(job),
      note: 'Storyboard preview only; no real video file generated.',
    },
    {
      id: `artifact-${job.id}-payload`,
      jobId: job.id,
      type: 'provider_payload',
      name: `${job.title}-provider-payload.json`,
      format: 'json',
      content: JSON.stringify(payload, null, 2),
      note: 'Provider payload preview for future video APIs.',
    },
    {
      id: `artifact-${job.id}-mock-output`,
      jobId: job.id,
      type: 'mock_video_placeholder',
      name: `${job.title}-mock-output.placeholder`,
      format: 'placeholder',
      content: `Mock video placeholder for ${job.title}. 不生成真实视频；请使用 Render Plan / Payload 交给剪辑师或视频生成工具。`,
      note: 'Placeholder only; no video blob or rendered media.',
    },
  ];
}

export function evaluateVideoAssemblyQa(job: VideoAssemblyJob, run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>): VideoQaResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const checks: string[] = [];
  const duration = job.renderPlan.duration;
  const hasEditPack = Boolean(job.editPackId);
  const hasShots = job.renderPlan.scenes.length > 0;
  const hasSubtitles = job.renderPlan.subtitles.length > 0 && job.renderPlan.subtitles.every(Boolean);
  const hasVoiceover = job.renderPlan.voiceoverScript.trim().length > 0;
  const hasManifest = job.renderPlan.assetManifest.length > 0;
  const missingCritical = job.missingRequirements.length > 0;
  const payloadReady = Object.keys(job.renderPlan.providerPayloadPreview || {}).length > 0;
  const aspectExpected = aspectRatioForPlatform(job.platform);
  const combinedText = [
    job.title,
    ...job.renderPlan.generationPrompts,
    ...job.renderPlan.subtitles,
    job.renderPlan.voiceoverScript,
  ].join(' ');
  const safety = scoreBrandSafety(combinedText, run.project.brandGuardrails);

  if (!hasEditPack) blockers.push('Missing edit pack');
  if (!hasShots) blockers.push('Missing shot list');
  if (!hasSubtitles) blockers.push('Missing subtitles');
  if (!hasVoiceover) blockers.push('Missing voiceover script');
  if (!hasManifest) blockers.push('Missing asset manifest');
  if (missingCritical) blockers.push('Missing critical assets');
  if (safety.score < 80) warnings.push('Risk expressions need review before provider handoff');
  if (job.renderPlan.aspectRatio !== aspectExpected) warnings.push(`Aspect ratio should be ${aspectExpected} for ${job.platform}`);
  if (duration < 10 || duration > 60) warnings.push('Duration should stay in a short-form production range');
  if (!payloadReady) blockers.push('Missing provider payload preview');

  if (hasEditPack) checks.push('edit pack present');
  if (hasShots) checks.push('shot list present');
  if (hasSubtitles) checks.push('subtitles present');
  if (hasVoiceover) checks.push('voiceover present');
  if (hasManifest) checks.push('asset manifest present');
  if (payloadReady) checks.push('provider payload preview present');

  const score = clampScore(100 - blockers.length * 12 - warnings.length * 5 - Math.max(0, job.missingRequirements.length - 1) * 4);
  return {
    passed: blockers.length === 0 && score >= 70,
    score,
    blockers: unique(blockers),
    warnings: unique(warnings),
    checks,
    recommendedNextStep: blockers.length > 0
      ? `Resolve ${blockers.length} video assembly blocker(s) before provider handoff.`
      : 'Render plan can be handed to an editor or future video provider; no real video has been generated.',
  };
}

export function buildVideoAssemblyJob(
  run: Pick<ListingFactoryRun, 'project' | 'assets'> & Partial<ListingFactoryRun>,
  editPack: EditPack,
  options: {
    mode?: VideoAssemblyMode;
    providerId?: string;
    aspectRatio?: string;
    targetPlatform?: string;
    includeSubtitles?: boolean;
    includeVoiceover?: boolean;
    includeAssets?: boolean;
    fallbackToMock?: boolean;
  } = {},
): VideoAssemblyJob {
  const platform = options.targetPlatform || editPack.platform;
  const provider = getVideoProvider(options.providerId);
  const providerAvailable = provider.available();
  const usedFallback = !providerAvailable && options.fallbackToMock !== false;
  const selectedProvider = providerAvailable ? provider : usedFallback ? localMockVideoProvider : provider;
  const mode = options.mode || 'storyboard_preview';
  const jobId = `video-job-${editPack.id}-${slugify(mode)}-${slugify(platform)}`;
  const assetById = new Map((run.assets || []).map(asset => [asset.id, asset]));
  const includeAssets = options.includeAssets !== false;
  const missingRequirements = includeAssets
    ? unique(editPack.assetManifest.filter(item => item.missing || !item.assetId || !assetById.has(item.assetId)).map(item => item.usage || `Shot ${item.shotOrder} asset`))
    : [];
  const scenes: RenderScene[] = editPack.shotList.map(shot => {
    const durationSeconds = Math.max(1, Math.round(shot.endSecond - shot.startSecond));
    const assetIds = includeAssets ? shot.assetIds.filter(assetId => assetById.has(assetId)) : [];
    const subtitle = options.includeSubtitles === false ? '' : sanitizeRiskyCopy(shot.subtitle, run.project.brandGuardrails);
    const voiceoverLine = options.includeVoiceover === false ? '' : sanitizeRiskyCopy(shot.voiceoverLine, run.project.brandGuardrails);
    return {
      order: shot.order,
      durationSeconds,
      visualPrompt: sanitizeRiskyCopy(`${shot.visualDescription}. ${shot.productionNote}`, run.project.brandGuardrails),
      assetIds,
      subtitle,
      voiceoverLine,
      transition: shot.transitionNote,
      productionNote: shot.productionNote,
    };
  });
  const renderPlan: RenderPlan = {
    jobId,
    duration: videoDurationFromEditPack(editPack),
    aspectRatio: options.aspectRatio || aspectRatioForPlatform(platform),
    scenes,
    subtitles: scenes.map(scene => scene.subtitle).filter(Boolean),
    voiceoverScript: options.includeVoiceover === false ? '' : sanitizeRiskyCopy(editPack.voiceoverScript, run.project.brandGuardrails),
    assetManifest: editPack.assetManifest.map(item => ({ ...item, fileName: item.fileName.replace(/blob:[^\s]+/g, '[session-only-url-redacted]') })),
    generationPrompts: scenes.map(scene => buildVideoScenePrompt(run.project, scene, platform)),
    providerPayloadPreview: {},
    riskNotes: editPack.riskChecklist.map(safeRiskLabel),
  };
  const baseJob: VideoAssemblyJob = {
    id: jobId,
    projectId: run.project.id,
    batchId: editPack.batchItemId.split('-item-')[0] || 'batch-local',
    editPackId: editPack.id,
    platform,
    title: sanitizeRiskyCopy(editPack.title, run.project.brandGuardrails),
    mode,
    providerId: selectedProvider.id,
    status: missingRequirements.length > 0
      ? 'blocked_missing_assets'
      : selectedProvider.id === localMockVideoProvider.id
        ? 'completed_mock'
        : providerAvailable
          ? 'ready_for_provider'
          : 'provider_unavailable',
    inputSummary: `${editPack.shotList.length} shots / ${renderPlan.duration}s / ${renderPlan.aspectRatio} / no real video rendering`,
    renderPlan,
    outputArtifacts: [],
    qaResult: { passed: false, score: 40, blockers: [], warnings: [], checks: [], recommendedNextStep: 'Pending video QA.' },
    missingRequirements,
    providerAudit: {
      providerId: selectedProvider.id,
      mode: selectedProvider.mode,
      usedFallback,
      operation: 'build_payload',
      status: selectedProvider.available() ? 'success' : usedFallback ? 'success' : 'failed',
      errorMessage: providerAvailable || usedFallback ? undefined : 'Video provider unavailable.',
      timestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const payload = buildProviderPayloadPreview(baseJob, selectedProvider);
  const jobWithPayload = {
    ...baseJob,
    renderPlan: {
      ...baseJob.renderPlan,
      providerPayloadPreview: payload,
    },
  };
  const qaResult = evaluateVideoAssemblyQa(jobWithPayload, run);
  return {
    ...jobWithPayload,
    outputArtifacts: selectedProvider.id === localMockVideoProvider.id ? buildMockVideoArtifacts(jobWithPayload) : [{
      id: `artifact-${jobId}-payload`,
      jobId,
      type: 'provider_payload',
      name: `${jobWithPayload.title}-provider-payload.json`,
      format: 'json',
      content: JSON.stringify(payload, null, 2),
      note: 'Provider payload preview only; no external request submitted.',
    }],
    qaResult,
  };
}

function buildRenderPlanMarkdown(job?: VideoAssemblyJob) {
  if (!job) return '# 视频渲染计划\n\n当前还没有视频组装任务。本阶段不生成真实视频。';
  return [
    `# 视频渲染计划 - ${job.title}`,
    '',
    `- 平台：${job.platform}`,
    `- 模式：${job.mode}`,
    `- 画幅比例：${job.renderPlan.aspectRatio}`,
    `- 时长：${job.renderPlan.duration}s`,
    '',
    '## 场景列表',
    ...job.renderPlan.scenes.map(scene => `- ${scene.order}. ${scene.durationSeconds}s | ${scene.visualPrompt} | 字幕：${scene.subtitle || '暂无'} | 素材：${scene.assetIds.join(' / ') || '仅有缺失位 / 元数据'}`),
  ].join('\n');
}

function buildVideoAssemblyMarkdown(jobs: VideoAssemblyJob[] = []) {
  return [
    '# 视频组装任务',
    '',
    '当前不会生成真实视频；这里只组织视频渲染计划、Provider Payload 预览、视频 QA 和 mock 输出占位。',
    '',
    ...(jobs.length > 0
      ? jobs.map(job => `- ${job.title} | ${job.platform} | ${job.mode} | ${job.status} | QA ${job.qaResult.score}`)
      : ['- 当前还没有视频组装任务。']),
  ].join('\n');
}

function buildVideoQaMarkdown(qa?: VideoQaResult) {
  if (!qa) return '# 视频 QA\n\n当前还没有视频 QA。';
  return [
    '# 视频 QA',
    '',
    `- 是否通过：${qa.passed}`,
    `- 分数：${qa.score}`,
    `- 下一步：${qa.recommendedNextStep}`,
    '',
    '## 阻塞项',
    ...(qa.blockers.length > 0 ? qa.blockers.map(item => `- ${item}`) : ['- 当前没有']),
    '',
    '## 预警项',
    ...(qa.warnings.length > 0 ? qa.warnings.map(item => `- ${item}`) : ['- 当前没有']),
  ].join('\n');
}

function buildMockVideoOutputPlaceholderMarkdown(job?: VideoAssemblyJob) {
  return [
    '# Mock 视频输出占位',
    '',
    '不生成真实视频，不调用 FFmpeg，不上传素材，也不保存视频文件。',
    '',
    job
      ? `- 占位任务：${job.title}（${job.status}）`
      : '- 当前还没有视频任务。',
    '- 请把视频渲染计划 / Provider Payload 预览交给剪辑师、AI 视频工具或未来的 provider 适配层。',
  ].join('\n');
}

function safeRiskLabel(text: string) {
  if (/治疗|疗效|药效|临床|医生|兽医/.test(text)) return '医疗化表达边界';
  if (/吊打|碾压|秒杀|贬低|竞品/.test(text)) return '竞品比较表达边界';
  if (/保证|必然|100%|百分百|最强|第一|永久|无限|根治|绝对/.test(text)) return '绝对化承诺边界';
  if (/虚假折扣|全网最低|最后一天|错过永远没有|亏本甩卖/.test(text)) return '价格承诺边界';
  if (/立刻见效|一天改变|马上瘦|爆单|减肥|减脂|提分|保分|包过/.test(text)) return '结果承诺边界';
  return text;
}

export function buildBatchProductionMarkdown(batch: ProductionBatch, editPacks: EditPack[]) {
  return [
    `# 批量生产批次｜${batch.name}`,
    '',
    `- 目标：${batch.goal}`,
    `- 平台：${batch.platforms.join(' / ')}`,
    `- 内容数：${batch.batchItems.length}`,
    `- QA：${batch.qaSummary.score}/100`,
    `- 状态：${batch.deliveryStatus}`,
    '',
    '## Batch Items',
    ...batch.batchItems.map(item => `- ${item.title}｜${item.platform}｜${item.contentType}｜${item.qaStatus}｜素材覆盖 ${item.assetCoverageScore}`),
    '',
    '## Edit Pack 样例',
    ...editPacks.slice(0, 2).map(pack => `- ${pack.title}｜${pack.exportNames.srt}｜${pack.exportNames.edl}`),
  ].join('\n');
}

export function evaluateBatchQa(batch: ProductionBatch, editPacks: EditPack[], run: BatchBuildRun): BatchQaSummary {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const readyCount = batch.batchItems.filter(item => item.qaStatus === 'ready_for_delivery' || item.qaStatus === 'ready_for_edit').length;
  const needsAssetCount = batch.batchItems.filter(item => item.qaStatus === 'needs_assets').length;
  const needsReviewCount = batch.batchItems.filter(item => item.qaStatus === 'needs_review').length;
  const highRiskCount = batch.batchItems.filter(item => item.riskLevel === 'high').length;
  const scriptIds = new Set(run.scripts.map(script => script.id));
  const storyboardIds = new Set(run.storyboards.map(storyboard => storyboard.scriptId));

  if (batch.batchItems.length === 0) blockers.push('批次内没有可生产内容');
  if (batch.batchItems.some(item => !scriptIds.has(item.scriptId))) blockers.push('部分内容缺少脚本');
  if (batch.batchItems.some(item => !storyboardIds.has(item.storyboardId))) blockers.push('部分内容缺少分镜');
  if (editPacks.some(pack => pack.subtitles.length === 0)) blockers.push('部分编辑包缺少字幕');
  if (editPacks.some(pack => !pack.voiceoverScript.trim())) blockers.push('部分编辑包缺少口播稿');
  if (needsAssetCount > 0) warnings.push(`${needsAssetCount} 条内容缺关键素材`);
  if (highRiskCount > 0) warnings.push(`${highRiskCount} 条内容需要品牌安全复核`);
  if (batch.batchItems.some(item => item.assetCoverageScore < 40)) warnings.push('部分内容素材覆盖低于 40，需要先补拍');
  if (batch.batchItems.some(item => !run.project.targetPlatforms.includes(item.platform))) warnings.push('部分内容平台不在项目目标平台内');

  const avgCoverage = average(batch.batchItems.map(item => item.assetCoverageScore));
  const score = clampScore(avgCoverage + readyCount * 3 - blockers.length * 15 - warnings.length * 5);
  const passed = blockers.length === 0 && readyCount >= Math.min(3, batch.batchItems.length) && score >= 70;

  return {
    passed,
    score,
    readyCount,
    needsAssetCount,
    needsReviewCount,
    highRiskCount,
    blockers,
    warnings,
    recommendedNextStep: passed
      ? '当前批次可进入编辑交付包，导出 SRT、EDL 和 Asset Manifest 后交给剪辑或 AI 视频工具。'
      : `还有 ${blockers.length + warnings.length} 个批量生产问题需要处理，优先补素材和复核高风险表达。`,
  };
}

function buildBatchQaSummaryMarkdown(qa?: BatchQaSummary) {
  if (!qa) return '## Batch QA\n- 暂无批次 QA';
  return [
    '## Batch QA',
    '',
    `- 评分：${qa.score}/100`,
    `- 可编辑 / 可交付：${qa.readyCount}`,
    `- 缺素材：${qa.needsAssetCount}`,
    `- 待审核：${qa.needsReviewCount}`,
    `- 高风险：${qa.highRiskCount}`,
    `- 下一步：${qa.recommendedNextStep}`,
    '',
    '### Blockers',
    ...(qa.blockers.length > 0 ? qa.blockers.map(item => `- ${item}`) : ['- 无阻塞项']),
    '',
    '### Warnings',
    ...(qa.warnings.length > 0 ? qa.warnings.map(item => `- ${item}`) : ['- 无明显风险提醒']),
  ].join('\n');
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseMetric(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const parsed = Number(raw.replace(/,/g, '').replace(/%$/, ''));
  if (!Number.isFinite(parsed)) return 0;
  return raw.endsWith('%') ? parsed / 100 : parsed;
}

function performanceCompositeScore(record: ContentPerformanceRecord) {
  const ctrScore = Math.min(record.ctr * 1000, 35);
  const engagementScore = Math.min(record.engagementRate * 500, 35);
  const conversionScore = Math.min((record.conversionRate || 0) * 300, 15);
  const roasScore = Math.min((record.roas || 0) * 4, 15);
  return clampScore(40 + ctrScore + engagementScore + conversionScore + roasScore);
}

export function calculatePerformanceMetrics(record: ContentPerformanceRecord): ContentPerformanceRecord {
  const impressions = Math.max(0, Math.round(parseMetric(record.impressions)));
  const views = Math.max(0, Math.round(parseMetric(record.views)));
  const clicks = Math.max(0, Math.round(parseMetric(record.clicks)));
  const likes = Math.max(0, Math.round(parseMetric(record.likes)));
  const comments = Math.max(0, Math.round(parseMetric(record.comments)));
  const saves = Math.max(0, Math.round(parseMetric(record.saves)));
  const shares = Math.max(0, Math.round(parseMetric(record.shares)));
  const revenue = record.revenue === undefined ? undefined : parseMetric(record.revenue);
  const cost = record.cost === undefined ? undefined : parseMetric(record.cost);
  const conversionRate = record.conversionRate === undefined ? undefined : parseMetric(record.conversionRate);
  return {
    ...record,
    impressions,
    views,
    clicks,
    likes,
    comments,
    saves,
    shares,
    conversionRate,
    revenue,
    cost,
    ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
    engagementRate: views > 0 ? Number(((likes + comments + saves + shares) / views).toFixed(4)) : 0,
    roas: revenue !== undefined && cost !== undefined && cost > 0 ? Number((revenue / cost).toFixed(2)) : record.roas,
  };
}

export function parsePerformanceCsv(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map(header => header.trim());
  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? '';
      return row;
    }, {});
  });
}

function normalizedCsvKey(value: string) {
  return value
    .trim()
    .replace(/（[^）]*）|\([^)]*\)/g, '')
    .replace(/[()\[\]{}]/g, '')
    .replace(/[\s_-]+/g, '')
    .toLowerCase();
}

function rowValue(row: Record<string, unknown>, aliases: string[]) {
  const exact = aliases.find(alias => row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '');
  if (exact) return row[exact];
  const normalizedAliases = new Set(aliases.map(normalizedCsvKey));
  const key = Object.keys(row).find(item => normalizedAliases.has(normalizedCsvKey(item)));
  return key ? row[key] : undefined;
}

export function normalizePerformanceRecord(row: Record<string, unknown>, run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>): ContentPerformanceRecord {
  const project = run.project;
  const hook = sanitizeRiskyCopy(String(rowValue(row, ['hook', 'Hook', 'contentName', 'Content name', 'Ad name', 'ad_name', 'Creative name', 'Video name', 'Product title', 'Advertised SKU', 'keyword', 'ad_group_name', 'ad_group', 'adset_name', '内容名称', '创意名称']) || project.productName), project.brandGuardrails);
  const platform = String(rowValue(row, ['platform', 'Platform', 'channel', 'Channel', 'source', 'utm_source', '平台']) || project.targetPlatforms[0] || 'TikTok').trim();
  const contentType = String(rowValue(row, ['contentType', 'content_type', 'type', 'Content type', 'Format', '内容类型']) || 'short_video').trim();
  const linkedBatchItem = run.productionBatches
    ?.flatMap(batch => batch.batchItems)
    .find(item => item.hook === hook || item.title === hook || item.platform === platform);
  const linkedBrief = run.briefs?.find(brief => brief.hook === hook || (brief.platform === platform && brief.contentType === contentType));
  const clicks = parseMetric(rowValue(row, ['clicks', 'Clicks', 'click', 'Link clicks', 'sessions', 'Sessions', '点击']));
  const orders = parseMetric(rowValue(row, ['orders', 'Orders', 'purchases', 'Purchases', 'conversions', 'Conversions', '订单', '成交']));
  const importedConversionRate = rowValue(row, ['conversionRate', 'conversion_rate', 'CVR', 'Conversion rate', '转化率']);
  const base: ContentPerformanceRecord = {
    id: String(rowValue(row, ['id', 'recordId', 'Record ID']) || `perf-${project.id}-${slugify(`${platform}-${contentType}-${hook}`).slice(0, 24)}-${Date.now().toString(36)}`),
    projectId: project.id,
    experimentId: String(rowValue(row, ['experimentId', 'experiment_id', 'Experiment ID']) || '').trim() || undefined,
    cellId: String(rowValue(row, ['cellId', 'cell_id', 'experimentCellId', 'experiment_cell_id', 'Cell ID', 'Experiment cell', '实验单元']) || '').trim() || undefined,
    contentId: String(rowValue(row, ['contentId', 'content_id', 'platformContentId', 'Ad ID', 'Creative ID', 'Video ID', '内容ID']) || '').trim() || undefined,
    trackingCode: String(rowValue(row, ['trackingCode', 'tracking_code', 'Tracking code', 'utm_content', 'utm_campaign', '追踪码']) || '').trim() || undefined,
    batchItemId: String(row.batchItemId || linkedBatchItem?.id || '') || undefined,
    briefId: String(row.briefId || linkedBrief?.id || linkedBatchItem?.briefId || '') || undefined,
    editPackId: String(row.editPackId || linkedBatchItem?.editPackId || '') || undefined,
    platform,
    contentType,
    hook,
    publishDate: String(rowValue(row, ['publishDate', 'date', 'Date', 'Day', 'Report date', '日期']) || '').trim() || undefined,
    impressions: parseMetric(rowValue(row, ['impressions', 'Impressions', 'impr', 'shows', 'sessions', 'Sessions', '曝光', '展现'])),
    views: parseMetric(rowValue(row, ['views', 'Views', 'video views', 'sessions', 'Sessions', '播放', '观看'])) || parseMetric(rowValue(row, ['impressions', 'Impressions', 'sessions', 'Sessions', '曝光', '展现'])),
    clicks,
    likes: parseMetric(rowValue(row, ['likes', 'Likes', '点赞'])),
    comments: parseMetric(rowValue(row, ['comments', 'Comments', '评论'])),
    saves: parseMetric(rowValue(row, ['saves', 'Saves', 'favorites', '收藏'])),
    shares: parseMetric(rowValue(row, ['shares', 'Shares', '分享'])),
    ctr: 0,
    engagementRate: 0,
    conversionRate: importedConversionRate === undefined || importedConversionRate === '' ? (clicks > 0 && orders > 0 ? Number((orders / clicks).toFixed(4)) : undefined) : parseMetric(importedConversionRate),
    revenue: parseMetric(rowValue(row, ['revenue', 'Revenue', 'sales', 'Sales', 'Net sales', 'Total sales', 'total_sales', 'conversion_value', 'Conversion value', 'purchase_roas', 'Purchase ROAS', 'GMV', '收入', '销售额'])),
    cost: parseMetric(rowValue(row, ['cost', 'Cost', 'spend', 'Spend', 'Amount spent', 'cost_per_result', 'cost_per_conversion', '花费', '消耗'])),
    source: row.source === 'manual_entry' || row.source === 'demo_performance' ? row.source : 'csv_import',
    notes: sanitizeRiskyCopy(String(rowValue(row, ['notes', 'note', 'Note', 'Remark', '备注']) || ''), project.brandGuardrails),
  };
  return calculatePerformanceMetrics(base);
}

export function importPerformanceCsv(run: ListingFactoryRun, csvText: string, now = new Date()): PerformanceImportResult {
  const rows = parsePerformanceCsv(csvText);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (rows.length === 0) errors.push('CSV is empty or missing data rows.');
  rows.forEach((row, index) => {
    const missing = [
      ['platform', ['platform', 'Platform', 'channel', 'utm_source', '平台']],
      ['hook/contentName', ['hook', 'Hook', 'contentName', 'Ad name', 'ad_name', 'Creative name', 'Product title', 'Advertised SKU', 'keyword', 'ad_group_name', 'ad_group', 'adset_name', '内容名称']],
      ['impressions', ['impressions', 'Impressions', 'sessions', 'Sessions', '曝光', '展现']],
      ['clicks', ['clicks', 'Clicks', 'sessions', 'Sessions', '点击']],
      ['spend/cost', ['spend', 'Spend', 'cost', 'Cost', 'Amount spent', 'cost_per_result', 'cost_per_conversion', '花费', '消耗']],
    ].filter(([, aliases]) => {
      const value = rowValue(row, aliases as string[]);
      return value === undefined || !String(value).trim();
    }).map(([field]) => field as string);
    if (missing.length > 0) warnings.push(`Row ${index + 2} missing fields: ${missing.join(', ')}`);
  });
  const records = rows.map(row => normalizePerformanceRecord({ ...row, source: 'csv_import' }, run));
  return { records, errors, warnings: unique(warnings), importedAt: now.toISOString() };
}

export function rankPerformanceRecords(records: ContentPerformanceRecord[]) {
  return [...records.map(calculatePerformanceMetrics)].sort((a, b) => performanceCompositeScore(b) - performanceCompositeScore(a));
}

function bestPerformanceGroup(records: ContentPerformanceRecord[], field: 'platform' | 'contentType') {
  const groups = new Map<string, ContentPerformanceRecord[]>();
  for (const record of records) {
    const key = record[field] || 'unknown';
    groups.set(key, [...(groups.get(key) || []), record]);
  }
  return [...groups.entries()]
    .map(([label, items]) => ({ label, score: average(items.map(performanceCompositeScore)), items }))
    .sort((a, b) => b.score - a.score)[0];
}

export function summarizePerformance(records: ContentPerformanceRecord[]): PerformanceSummary {
  const normalized = records.map(calculatePerformanceMetrics);
  const roasValues = normalized.map(record => record.roas).filter((value): value is number => typeof value === 'number');
  return {
    totalRecords: normalized.length,
    totalImpressions: normalized.reduce((sum, record) => sum + record.impressions, 0),
    totalViews: normalized.reduce((sum, record) => sum + record.views, 0),
    totalClicks: normalized.reduce((sum, record) => sum + record.clicks, 0),
    averageCtr: Number((normalized.reduce((sum, record) => sum + record.ctr, 0) / Math.max(normalized.length, 1)).toFixed(4)),
    averageEngagementRate: Number((normalized.reduce((sum, record) => sum + record.engagementRate, 0) / Math.max(normalized.length, 1)).toFixed(4)),
    averageRoas: roasValues.length > 0 ? Number((roasValues.reduce((sum, item) => sum + item, 0) / roasValues.length).toFixed(2)) : undefined,
    topPlatform: bestPerformanceGroup(normalized, 'platform')?.label || 'manual data needed',
    topContentType: bestPerformanceGroup(normalized, 'contentType')?.label || 'manual data needed',
  };
}

function hookPattern(hook: string) {
  if (/FAQ|how|why|what|闂|疑问|\?/.test(hook)) return 'FAQ / question-led hook';
  if (/before|after|对比|瀵规瘮|compare/.test(hook)) return 'comparison hook';
  if (/avoid|mistake|避坑|閬垮潙|坑/.test(hook)) return 'avoidance hook';
  if (/day|routine|daily|日常/.test(hook)) return 'routine scene hook';
  return firstSentence(hook).slice(0, 48) || 'direct product hook';
}

export function analyzePerformancePatterns(run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>, records: ContentPerformanceRecord[]): PerformanceInsight[] {
  const ranked = rankPerformanceRecords(records);
  if (ranked.length === 0) {
    return [{
      id: `insight-${run.project.id}-need-data`,
      type: 'next_test',
      title: '需要手动录入或 CSV 表现数据',
      summary: '当前这次运行还没有接入平台数据。请先补充手动记录或粘贴 CSV 导出，再进行归因分析。',
      evidence: ['当前不连接真实平台 API；反馈链路保持本地优先。'],
      recommendedAction: '至少导入 3 条包含曝光、播放和点击的内容记录。',
      linkedBriefIds: [],
      linkedBatchItemIds: [],
    }];
  }
  const insights: PerformanceInsight[] = [];
  const top = ranked[0];
  const weak = ranked[ranked.length - 1];
  const topPlatform = bestPerformanceGroup(ranked, 'platform');
  const topContentType = bestPerformanceGroup(ranked, 'contentType');
  insights.push({
    id: `insight-${run.project.id}-winning`,
    type: 'winning_pattern',
    title: `胜出模式：${hookPattern(top.hook)}`,
    summary: `${top.platform} ${top.contentType} 当前综合分最高（${performanceCompositeScore(top)}）。`,
    evidence: [`CTR ${top.ctr}`, `Engagement ${top.engagementRate}`, `Hook: ${top.hook}`],
    recommendedAction: `把 ${hookPattern(top.hook)} 结构放大到下一轮变体批次。`,
    linkedBriefIds: top.briefId ? [top.briefId] : [],
    linkedBatchItemIds: top.batchItemId ? [top.batchItemId] : [],
  });
  insights.push({
    id: `insight-${run.project.id}-weak`,
    type: 'weak_pattern',
    title: `弱势模式：${hookPattern(weak.hook)}`,
    summary: `${weak.platform} ${weak.contentType} 当前综合分最低（${performanceCompositeScore(weak)}）。`,
    evidence: [`CTR ${weak.ctr}`, `Engagement ${weak.engagementRate}`, `Hook: ${weak.hook}`],
    recommendedAction: '在继续生成更多变体前，先重写开头钩子和证明点。',
    linkedBriefIds: weak.briefId ? [weak.briefId] : [],
    linkedBatchItemIds: weak.batchItemId ? [weak.batchItemId] : [],
  });
  if (topPlatform) {
    insights.push({
      id: `insight-${run.project.id}-platform`,
      type: 'platform_signal',
      title: `平台信号：${topPlatform.label}`,
      summary: `${topPlatform.label} 当前平均分最高（${topPlatform.score}）。`,
      evidence: topPlatform.items.slice(0, 3).map(item => `${item.contentType}: ${performanceCompositeScore(item)}`),
      recommendedAction: `在下一轮再生成计划里优先安排 ${topPlatform.label}。`,
      linkedBriefIds: unique(topPlatform.items.map(item => item.briefId).filter((id): id is string => Boolean(id))),
      linkedBatchItemIds: unique(topPlatform.items.map(item => item.batchItemId).filter((id): id is string => Boolean(id))),
    });
  }
  if (topContentType) {
    insights.push({
      id: `insight-${run.project.id}-content-type`,
      type: 'audience_signal',
      title: `内容形式信号：${topContentType.label}`,
      summary: `${topContentType.label} 当前是表现最好的内容形式。`,
      evidence: topContentType.items.slice(0, 3).map(item => `${item.platform}: CTR ${item.ctr}`),
      recommendedAction: `围绕 ${topContentType.label} 继续生成更多 Brief，并补充新的证明点与视觉角度。`,
      linkedBriefIds: unique(topContentType.items.map(item => item.briefId).filter((id): id is string => Boolean(id))),
      linkedBatchItemIds: unique(topContentType.items.map(item => item.batchItemId).filter((id): id is string => Boolean(id))),
    });
  }
  insights.push({
    id: `insight-${run.project.id}-next-test`,
    type: 'next_test',
    title: '下一轮测试建议',
    summary: '把当前最强的平台和内容形式作为 control，再测试新的钩子和证明角度。',
    evidence: [`Top platform: ${topPlatform?.label || top.platform}`, `Top content type: ${topContentType?.label || top.contentType}`],
    recommendedAction: '生成 6 个下一轮变体：3 个放大胜出方案、2 个重写弱势钩子、1 个新平台测试。',
    linkedBriefIds: unique(ranked.slice(0, 3).map(item => item.briefId).filter((id): id is string => Boolean(id))),
    linkedBatchItemIds: unique(ranked.slice(0, 3).map(item => item.batchItemId).filter((id): id is string => Boolean(id))),
  });
  return insights;
}

export function buildRegenerationPlan(run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>, insights: PerformanceInsight[]): RegenerationPlan {
  const winning = insights.filter(item => item.type === 'winning_pattern' || item.type === 'platform_signal' || item.type === 'audience_signal');
  const weak = insights.filter(item => item.type === 'weak_pattern' || item.type === 'creative_risk');
  const nextPlatforms = unique([
    ...insights.filter(item => item.type === 'platform_signal').map(item => item.title.replace(/^平台信号：\s*/, '')),
    ...run.project.targetPlatforms,
  ]).slice(0, 3);
  return {
    projectId: run.project.id,
    basedOnPerformanceRecordIds: unique((run.performanceRecords || []).map(record => record.id)),
    winningPatterns: winning.map(item => item.title),
    avoidPatterns: weak.map(item => item.title),
    nextBriefAngles: unique([
      ...winning.map(item => item.recommendedAction),
      '先把前 3 秒的问题场景讲得更强，再进入产品展示。',
      '把弱势钩子改写成买家清单或 FAQ 结构。',
    ]).slice(0, 5),
    nextPlatforms,
    recommendedVariants: [
      '3 个变体：放大胜出钩子模式，但换不同证明点。',
      '2 个变体：重写最弱钩子，并补足更清晰的买家语境。',
      '1 个平台专项测试：在次级渠道上复用当前最优内容形式。',
    ],
    riskNotes: ['反馈数据仅来自手动录入或 CSV，不连接真实平台 API。'],
    suggestedGenerationInstruction: sanitizeRiskyCopy(`放大胜出结构（${winning.map(item => item.title).join(' / ') || '当前本地最佳记录'}），避开弱势模式（${weak.map(item => item.title).join(' / ') || '清晰度不足的开头钩子'}），并为 ${nextPlatforms.join(' / ')} 生成下一轮带有可衡量 CTA 和清晰证明的 Brief。`, run.project.brandGuardrails),
  };
}

export function buildPerformanceRecordsCsv(records: ContentPerformanceRecord[]) {
  const header = ['id', 'projectId', 'batchItemId', 'briefId', 'editPackId', 'platform', 'contentType', 'hook', 'publishDate', 'impressions', 'views', 'clicks', 'likes', 'comments', 'saves', 'shares', 'ctr', 'engagementRate', 'conversionRate', 'revenue', 'cost', 'roas', 'source', 'notes'];
  const rows = records.map(record => [
    record.id, record.projectId, record.batchItemId || '', record.briefId || '', record.editPackId || '',
    record.platform, record.contentType, record.hook, record.publishDate || '', record.impressions, record.views,
    record.clicks, record.likes, record.comments, record.saves, record.shares, record.ctr, record.engagementRate,
    record.conversionRate ?? '', record.revenue ?? '', record.cost ?? '', record.roas ?? '', record.source, record.notes,
  ]);
  return [header, ...rows].map(row => row.map(value => csvCell(value as string | number)).join(',')).join('\n');
}

export function buildRegenerationPlanMarkdown(plan?: RegenerationPlan) {
  if (!plan) return '# 再生成计划\n\n当前还没有表现记录，请先导入手动数据或 CSV。';
  return [
    '# 再生成计划',
    '',
    '当前反馈来源仅支持手动录入或 CSV 导入，不连接真实平台 API。',
    '',
    '## 胜出模式',
    ...(plan.winningPatterns.length ? plan.winningPatterns.map(item => `- ${item}`) : ['- 请先补充表现数据，才能识别胜出模式。']),
    '',
    '## 避免模式',
    ...(plan.avoidPatterns.length ? plan.avoidPatterns.map(item => `- ${item}`) : ['- 当前还没有识别出弱势模式。']),
    '',
    '## 下一轮 Brief 角度',
    ...plan.nextBriefAngles.map(item => `- ${item}`),
    '',
    `## 下一轮平台\n${plan.nextPlatforms.join(' / ') || '需要更多数据'}`,
    '',
    '## 推荐变体',
    ...plan.recommendedVariants.map(item => `- ${item}`),
    '',
    '## 建议生成指令',
    plan.suggestedGenerationInstruction,
    '',
    '## 风险提示',
    ...plan.riskNotes.map(item => `- ${item}`),
  ].join('\n');
}

export function buildPerformanceFeedbackReport(run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>): PerformanceFeedbackReport {
  const records = (run.performanceRecords || []).map(calculatePerformanceMetrics);
  const summary = summarizePerformance(records);
  const ranked = rankPerformanceRecords(records);
  const insights = run.performanceInsights && run.performanceInsights.length > 0 ? run.performanceInsights : analyzePerformancePatterns(run, records);
  const nextRoundPlan = run.regenerationPlan || buildRegenerationPlan({ ...run, performanceRecords: records }, insights);
  const topPerformers = ranked.slice(0, 3);
  const weakPerformers = ranked.slice(-3).reverse();
  const clientSummary = records.length > 0
    ? `已导入 ${records.length} 条本地表现记录。当前最强平台是 ${summary.topPlatform}；下一轮建议放大胜出内容，并重写偏弱钩子。`
    : '当前未连接真实平台 API。请补充手动录入或 CSV 导出，先建立本地反馈闭环。';
  const markdown = [
    '# 表现反馈报告',
    '',
    '当前支持手动录入或 CSV 导入表现数据，未连接真实平台 API。',
    '',
    `SKU: ${run.project.productName}`,
    `记录数：${summary.totalRecords}`,
    `曝光：${summary.totalImpressions}`,
    `播放：${summary.totalViews}`,
    `点击：${summary.totalClicks}`,
    `平均点击率：${summary.averageCtr}`,
    `平均互动率：${summary.averageEngagementRate}`,
    summary.averageRoas !== undefined ? `平均 ROAS：${summary.averageRoas}` : '',
    '',
    '## 表现最强内容',
    ...(topPerformers.length ? topPerformers.map(record => `- ${record.platform} / ${record.contentType}: ${record.hook}（综合分 ${performanceCompositeScore(record)}）`) : ['- 当前还没有表现记录。']),
    '',
    '## 表现偏弱内容',
    ...(weakPerformers.length ? weakPerformers.map(record => `- ${record.platform} / ${record.contentType}: ${record.hook}（综合分 ${performanceCompositeScore(record)}）`) : ['- 先导入数据后，才能识别弱势模式。']),
    '',
    '## 关键洞察',
    ...insights.map(insight => `- ${insight.title}: ${insight.recommendedAction}`),
    '',
    buildRegenerationPlanMarkdown(nextRoundPlan),
  ].filter(Boolean).join('\n');
  return {
    summary,
    topPerformers,
    weakPerformers,
    platformInsights: insights.filter(item => item.type === 'platform_signal'),
    contentTypeInsights: insights.filter(item => item.type === 'audience_signal'),
    nextRoundPlan,
    clientSummary,
    markdown: scrubDeliveryText(markdown),
    csv: buildPerformanceRecordsCsv(records),
  };
}

function metricValue(record: ContentPerformanceRecord, metric: SuccessMetric['name']) {
  const normalized = calculatePerformanceMetrics(record);
  if (metric === 'ctr') return normalized.ctr;
  if (metric === 'engagementRate') return normalized.engagementRate;
  if (metric === 'conversionRate') return normalized.conversionRate ?? 0;
  if (metric === 'roas') return normalized.roas ?? 0;
  if (metric === 'saves') return normalized.saves;
  return normalized.comments;
}

function roundMetric(value: number, decimals = 4) {
  return Number(value.toFixed(decimals));
}

function experimentEstimatedOrders(record: ContentPerformanceRecord) {
  const normalized = calculatePerformanceMetrics(record);
  return roundMetric((normalized.conversionRate ?? 0) * normalized.clicks, 2);
}

function buildExperimentSampleGuardrailText(metric: SuccessMetric['name'], guardrails: ExperimentConfidenceGuardrails) {
  const base = `每个 control / test 单元至少需要 ${guardrails.minImpressionsPerCell} 次曝光和 ${guardrails.minClicksPerCell} 次点击`;
  if ((metric === 'conversionRate' || metric === 'roas') && guardrails.minOrdersPerCell !== undefined) {
    return `${base}，并且针对${metricLabel(metric)}，每个单元还需要约 ${guardrails.minOrdersPerCell} 个预估订单。`;
  }
  return `${base}。`;
}

function aggregateExperimentRecords(records: ContentPerformanceRecord[], fallback: Pick<ContentPerformanceRecord, 'projectId' | 'platform' | 'contentType' | 'hook' | 'source'>, cellId: string, variantLabel: string): ContentPerformanceRecord {
  const totals = records.reduce((sum, record) => {
    const normalized = calculatePerformanceMetrics(record);
    return {
      impressions: sum.impressions + normalized.impressions,
      views: sum.views + normalized.views,
      clicks: sum.clicks + normalized.clicks,
      likes: sum.likes + normalized.likes,
      comments: sum.comments + normalized.comments,
      saves: sum.saves + normalized.saves,
      shares: sum.shares + normalized.shares,
      revenue: sum.revenue + (normalized.revenue ?? 0),
      cost: sum.cost + (normalized.cost ?? 0),
      estimatedOrders: sum.estimatedOrders + experimentEstimatedOrders(normalized),
    };
  }, { impressions: 0, views: 0, clicks: 0, likes: 0, comments: 0, saves: 0, shares: 0, revenue: 0, cost: 0, estimatedOrders: 0 });
  return calculatePerformanceMetrics({
    id: `${cellId}-${variantLabel}-aggregate`,
    projectId: fallback.projectId,
    cellId,
    trackingCode: `${variantLabel.toUpperCase()}-${cellId}`,
    platform: fallback.platform,
    contentType: fallback.contentType,
    hook: fallback.hook,
    impressions: totals.impressions,
    views: totals.views,
    clicks: totals.clicks,
    likes: totals.likes,
    comments: totals.comments,
    saves: totals.saves,
    shares: totals.shares,
    ctr: 0,
    engagementRate: 0,
    conversionRate: totals.clicks > 0 ? totals.estimatedOrders / totals.clicks : 0,
    revenue: totals.revenue,
    cost: totals.cost,
    roas: 0,
    source: fallback.source,
    notes: `${variantLabel} aggregate`,
  });
}

function classifyExperimentRecordRole(record: ContentPerformanceRecord) {
  const roleText = `${record.notes || ''} ${record.trackingCode || ''}`.toLowerCase();
  if (/\bcontrol\b/.test(roleText)) return 'control' as const;
  if (/\btest\b/.test(roleText) || /\bvariant\b/.test(roleText)) return 'test' as const;
  return 'unknown' as const;
}

function summarizeExperimentCellConfidence(experimentId: string, cellConfidence: ExperimentCellConfidence[], guardrailText: string): ExperimentConfidenceSummary {
  const candidateWinnerCount = cellConfidence.filter(item => item.conclusion === 'candidate_winner').length;
  const candidateLoserCount = cellConfidence.filter(item => item.conclusion === 'candidate_loser').length;
  const directionalCellCount = cellConfidence.filter(item => item.conclusion === 'directional_signal').length;
  const inconclusiveCellCount = cellConfidence.filter(item => item.conclusion === 'inconclusive').length;
  const needsMoreDataCellCount = cellConfidence.filter(item => item.conclusion === 'needs_more_data').length;
  const sufficientCellCount = cellConfidence.filter(item => item.sampleSufficient).length;
  let confidenceLevel: ExperimentConfidenceLevel = 'low';
  let conclusion: ExperimentConfidenceConclusion = 'needs_more_data';
  let recommendedAction: ExperimentConfidenceRecommendedAction = 'continue_collecting_data';
  let briefExplanation = '当前数据不足以支持高置信度结论。请继续补充手动录入或 CSV 结果，再决定是否放大。';
  if (candidateWinnerCount > 0) {
    confidenceLevel = cellConfidence.some(item => item.conclusion === 'candidate_winner' && item.confidenceLevel === 'strong') ? 'strong' : 'moderate';
    conclusion = 'candidate_winner';
    recommendedAction = 'scale_candidate_winner';
    briefExplanation = `至少有 ${candidateWinnerCount} 个实验单元在样本达标后明显跑赢。下一步只放大候选胜出方案，其他变量保持稳定。`;
  } else if (candidateLoserCount > 0 && sufficientCellCount > 0 && directionalCellCount === 0) {
    confidenceLevel = cellConfidence.some(item => item.conclusion === 'candidate_loser' && item.confidenceLevel === 'strong') ? 'strong' : 'moderate';
    conclusion = 'candidate_loser';
    recommendedAction = 'retire_weak_variant';
    briefExplanation = `至少有 ${candidateLoserCount} 个实验单元在样本达标后明显落后。应淘汰弱势变体，并复用稳定 control。`;
  } else if (directionalCellCount > 0) {
    confidenceLevel = 'directional';
    conclusion = 'directional_signal';
    recommendedAction = 'continue_collecting_data';
    briefExplanation = `目前有 ${directionalCellCount} 个方向性信号，但都还没有跨过样本门槛。先继续收集数据，再判断是否真的胜出。`;
  } else if (inconclusiveCellCount > 0 && sufficientCellCount > 0) {
    confidenceLevel = 'moderate';
    conclusion = 'inconclusive';
    recommendedAction = 'refine_hypothesis';
    briefExplanation = `当前有 ${sufficientCellCount} 个实验单元样本已达标，但提升幅度过小或信号混杂，暂时无法定论。建议收紧假设，重新做一轮更干净的单变量测试。`;
  }
  return {
    experimentId,
    confidenceLevel,
    conclusion,
    recommendedAction,
    sampleGuardrail: guardrailText,
    sufficientCellCount,
    directionalCellCount,
    candidateWinnerCount,
    candidateLoserCount,
    inconclusiveCellCount,
    needsMoreDataCellCount,
    briefExplanation,
  };
}

function experimentMemoryVariableType(variableType: ExperimentCell['variableType']): ExperimentMemoryVariableType {
  if (variableType === 'visual_angle') return 'angle';
  if (variableType === 'proof_point') return 'offer';
  if (variableType === 'content_type') return 'format';
  return variableType;
}

function experimentTextTokens(text: string) {
  return unique(slugify(text).split('-').filter(token => token.length > 2));
}

function experimentTokenOverlap(left: string, right: string) {
  const leftTokens = experimentTextTokens(left);
  const rightTokens = experimentTextTokens(right);
  if (leftTokens.length === 0 || rightTokens.length === 0) return 0;
  const intersection = leftTokens.filter(token => rightTokens.includes(token)).length;
  return intersection / Math.max(Math.min(leftTokens.length, rightTokens.length), 1);
}

function experimentDuplicateRisk(candidate: { variableType: ExperimentMemoryVariableType; hypothesis: string; controlValue: string; testValue: string }, entry: ExperimentMemoryEntry) {
  if (candidate.variableType !== entry.testedVariableType) return 'low' as const;
  const candidatePair = `${candidate.controlValue} ${candidate.testValue}`;
  const entryPair = `${entry.reusableLearning} ${entry.testedVariableLabel}`;
  const pairOverlap = experimentTokenOverlap(candidatePair, entryPair);
  const hypothesisOverlap = experimentTokenOverlap(candidate.hypothesis, entry.testedHypothesis);
  const exactValueMatch = slugify(candidate.testValue) !== '' && slugify(candidate.testValue) === slugify(entry.testedVariableLabel);
  if (exactValueMatch || pairOverlap >= 0.7 || hypothesisOverlap >= 0.8) return 'high' as const;
  if (pairOverlap >= 0.35 || hypothesisOverlap >= 0.4) return 'medium' as const;
  return 'low' as const;
}

function experimentPriorityBand(score: number): PrioritizedExperimentCandidate['priorityBand'] {
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function experimentConfidenceWeight(level: ExperimentConfidenceLevel) {
  if (level === 'strong') return 20;
  if (level === 'moderate') return 14;
  if (level === 'directional') return 7;
  return 0;
}

function experimentRelativeLiftWeight(relativeLift: number) {
  return Math.min(Math.round(Math.abs(relativeLift) * 100), 20);
}

function experimentFreshnessDays(timestamp: string, baseline: string) {
  const left = Date.parse(baseline);
  const right = Date.parse(timestamp);
  if (Number.isNaN(left) || Number.isNaN(right)) return Number.POSITIVE_INFINITY;
  return Math.abs(left - right) / (1000 * 60 * 60 * 24);
}

function experimentMemoryGuidance(entry: ExperimentMemoryEntry) {
  if (entry.conclusion === 'candidate_winner') {
    return `可以把“${entry.testedVariableLabel}”作为${experimentVariableTypeLabel(entry.testedVariableType)}的起点，但要放到新的受众或平台切片里验证。`;
  }
  if (entry.conclusion === 'directional_signal') {
    return `“${entry.testedVariableLabel}”可以先列入观察名单，但在把它当成结论之前，需要更干净、更充足的样本。`;
  }
  if (entry.conclusion === 'candidate_loser') {
    return `不要原样重复“${entry.testedVariableLabel}”。先重做角度、人群或证明方式，再消耗下一次测试机会。`;
  }
  return `在再次测试“${entry.testedVariableLabel}”之前，先收紧假设，把变量隔离得更干净。`;
}

export function buildExperimentMemorySummary(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentMemorySummary {
  const merchantContext = run.merchantContextCard;
  const experimentPlans = Array.isArray(run.experimentPlans) ? run.experimentPlans : [];
  const experimentReports = Array.isArray(run.experimentReports) ? run.experimentReports : [];
  const entries = experimentPlans.flatMap((plan, planIndex) => {
    const report = experimentReports[planIndex];
    if (!report) return [];
    return plan.experimentCells.map(cell => {
      const confidence = report.cellConfidence.find(item => item.cellId === cell.id);
      const metricDelta = report.metricDeltas.find(item => item.cellId === cell.id);
      const variableType = experimentMemoryVariableType(cell.variableType);
      const relativeLift = confidence?.relativeLift ?? metricDelta?.relativeLift ?? 0;
      const entryCreatedAt = plan.updatedAt || plan.createdAt || run.updatedAt || now.toISOString();
      const controlCellId = `${cell.id}:control`;
      const testCellId = `${cell.id}:test`;
      const winningCellId = confidence?.conclusion === 'candidate_winner'
        ? testCellId
        : confidence?.conclusion === 'candidate_loser'
          ? controlCellId
          : undefined;
      const losingCellId = confidence?.conclusion === 'candidate_winner'
        ? controlCellId
        : confidence?.conclusion === 'candidate_loser'
          ? testCellId
          : undefined;
      const reusableLearning = confidence?.conclusion === 'candidate_winner'
        ? `${cell.testValue} 相比 ${cell.controlValue} 在${metricLabel(metricDelta?.metric || confidence?.metric || 'ctr')}上取得了 ${Math.round(relativeLift * 100)}% 的相对提升。`
        : confidence?.conclusion === 'directional_signal'
          ? `${cell.testValue} 相比 ${cell.controlValue} 出现了方向性变化，但当前样本仍偏薄。`
          : confidence?.conclusion === 'candidate_loser'
            ? `${cell.testValue} 在${metricLabel(metricDelta?.metric || confidence?.metric || 'ctr')}上落后于 ${cell.controlValue}。`
            : `${cell.testValue} 与 ${cell.controlValue} 之间还没有拉开足够干净的差异。`;
      const avoidRepeatingReason = confidence?.conclusion === 'candidate_winner'
        ? `不要在不更换人群、平台或创意包装的前提下，原样重跑这组${experimentVariableTypeLabel(variableType)}测试。`
        : confidence?.conclusion === 'directional_signal'
          ? '在样本门槛达标之前，不要把方向性信号直接当成最终结论。'
          : confidence?.conclusion === 'candidate_loser'
            ? `不要原样重复 ${cell.testValue}，因为它已经在与 ${cell.controlValue} 的对比中落后。`
            : '不要混着多个变量直接重跑；先收紧假设，再投入下一次实验机会。';
      return {
        id: `experiment-memory-${plan.id}-${cell.id}`,
        experimentId: plan.id,
        experimentCellId: cell.id,
        testedHypothesis: plan.hypothesis,
        testedVariableType: variableType,
        testedVariableLabel: cell.testValue,
        controlCellId,
        testCellId,
        winningCellId,
        losingCellId,
        confidenceLevel: confidence?.confidenceLevel || 'low',
        conclusion: confidence?.conclusion || 'needs_more_data',
        recommendedAction: confidence?.recommendedAction || 'continue_collecting_data',
        keyMetric: metricDelta?.metric || confidence?.metric || 'ctr',
        relativeLift: roundMetric(relativeLift),
        sampleSufficient: confidence?.sampleSufficient || false,
        reusableLearning,
        avoidRepeatingReason,
        sourcePlanName: plan.name,
        createdAt: entryCreatedAt,
      } satisfies ExperimentMemoryEntry;
    });
  }).sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const reusablePatterns = entries
    .filter(entry => entry.conclusion === 'candidate_winner' && (entry.confidenceLevel === 'moderate' || entry.confidenceLevel === 'strong'))
    .sort((left, right) => Math.abs(right.relativeLift) - Math.abs(left.relativeLift))
    .map(entry => ({
      id: `pattern-reusable-${entry.id}`,
      sourceEntryId: entry.id,
      variableType: entry.testedVariableType,
      title: `${experimentVariableTypeLabel(entry.testedVariableType)}：${entry.testedVariableLabel}`,
      patternType: 'reusable' as const,
      confidenceLevel: entry.confidenceLevel,
      keyMetric: entry.keyMetric,
      relativeLift: entry.relativeLift,
      guidance: experimentMemoryGuidance(entry),
    }));
  const watchlistPatterns = entries
    .filter(entry => entry.conclusion === 'directional_signal')
    .sort((left, right) => Math.abs(right.relativeLift) - Math.abs(left.relativeLift))
    .map(entry => ({
      id: `pattern-watch-${entry.id}`,
      sourceEntryId: entry.id,
      variableType: entry.testedVariableType,
      title: `${experimentVariableTypeLabel(entry.testedVariableType)}：${entry.testedVariableLabel}`,
      patternType: 'watchlist' as const,
      confidenceLevel: entry.confidenceLevel,
      keyMetric: entry.keyMetric,
      relativeLift: entry.relativeLift,
      guidance: experimentMemoryGuidance(entry),
    }));
  const avoidPatterns = entries
    .filter(entry => entry.conclusion === 'candidate_loser' || entry.conclusion === 'inconclusive')
    .sort((left, right) => Math.abs(right.relativeLift) - Math.abs(left.relativeLift))
    .map(entry => ({
      id: `pattern-avoid-${entry.id}`,
      sourceEntryId: entry.id,
      variableType: entry.testedVariableType,
      title: `${experimentVariableTypeLabel(entry.testedVariableType)}：${entry.testedVariableLabel}`,
      patternType: 'avoid' as const,
      confidenceLevel: entry.confidenceLevel,
      keyMetric: entry.keyMetric,
      relativeLift: entry.relativeLift,
      guidance: experimentMemoryGuidance(entry),
    }));
  const topReusableLearning = reusablePatterns[0]?.guidance;
  const topWatchlistLearning = watchlistPatterns[0]?.guidance;
  const topAvoidLearning = avoidPatterns[0]?.guidance;
  const contextHint = merchantContext?.performanceMemory.nextTestIdeas[0] || merchantContext?.performanceMemory.winningPatterns[0];
  const briefSummary = entries.length === 0
    ? '当前还没有实验记忆。请先完成至少一轮本地实验复盘，再去排下一轮优先级。'
    : `当前累计 ${reusablePatterns.length} 条可复用学习、${watchlistPatterns.length} 条方向性观察信号、${avoidPatterns.length} 条避免或重做提示。${contextHint ? ` 商家上下文当前聚焦：${contextHint}。` : ''}`;
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    entries,
    reusablePatterns,
    watchlistPatterns,
    avoidPatterns,
    topReusableLearning,
    topWatchlistLearning,
    topAvoidLearning,
    briefSummary,
  };
}

export function buildExperimentPriorityQueue(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  memorySummary?: ExperimentMemorySummary,
  merchantContextCard?: MerchantContextCard,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentPriorityQueue {
  const experimentPlans = Array.isArray(run.experimentPlans) ? run.experimentPlans : [];
  const performanceInsights = Array.isArray(run.performanceInsights) ? run.performanceInsights : [];
  const primaryPlan = experimentPlans[0];
  const memory = memorySummary || buildExperimentMemorySummary(run, now);
  const merchantContext = merchantContextCard || run.merchantContextCard;
  if (!primaryPlan) {
    return {
      projectId: run.project.id,
      generatedAt: run.updatedAt || now.toISOString(),
      candidates: [],
      briefSummary: '当前还没有实验计划。请先生成下一轮实验计划，再建立优先队列。',
    };
  }
  const candidates = primaryPlan.experimentCells.map(cell => {
    const variableType = experimentMemoryVariableType(cell.variableType);
    const comparableEntries = memory.entries.filter(entry => !(entry.experimentId === primaryPlan.id && entry.experimentCellId === cell.id));
    const sameVariableEntries = comparableEntries.filter(entry => entry.testedVariableType === variableType);
    const duplicateSignals = sameVariableEntries.map(entry => experimentDuplicateRisk({
      variableType,
      hypothesis: primaryPlan.hypothesis,
      controlValue: cell.controlValue,
      testValue: cell.testValue,
    }, entry));
    const duplicateRisk = duplicateSignals.includes('high')
      ? 'high'
      : duplicateSignals.includes('medium')
        ? 'medium'
        : 'low';
    const bestReusable = sameVariableEntries
      .filter(entry => entry.conclusion === 'candidate_winner')
      .sort((left, right) => Math.abs(right.relativeLift) - Math.abs(left.relativeLift))[0];
    const bestWatch = sameVariableEntries
      .filter(entry => entry.conclusion === 'directional_signal')
      .sort((left, right) => Math.abs(right.relativeLift) - Math.abs(left.relativeLift))[0];
    const bestAvoid = sameVariableEntries
      .filter(entry => entry.conclusion === 'candidate_loser' || entry.conclusion === 'inconclusive')
      .sort((left, right) => Math.abs(right.relativeLift) - Math.abs(left.relativeLift))[0];
    const freshestEntry = sameVariableEntries
      .slice()
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];
    const reasons: string[] = [];
    let priorityScore = 40;
    if (bestReusable) {
      priorityScore += experimentConfidenceWeight(bestReusable.confidenceLevel);
      priorityScore += experimentRelativeLiftWeight(bestReusable.relativeLift);
      if (bestReusable.sampleSufficient) priorityScore += 8;
      reasons.push(`历史上已有${experimentVariableTypeLabel(variableType)}胜出案例，且置信度为${experimentConfidenceLevelLabel(bestReusable.confidenceLevel)}`);
    } else if (bestWatch) {
      priorityScore += experimentConfidenceWeight(bestWatch.confidenceLevel);
      reasons.push('已经出现方向性信号，但还需要更干净的数据');
    } else {
      priorityScore += 8;
      reasons.push('这是尚未被强结论覆盖的新变量');
    }
    if (bestAvoid && duplicateRisk !== 'low') {
      priorityScore -= 10;
      reasons.push('相似测试之前已经得到弱结论或不充分结论');
    }
    if (!freshestEntry) {
      priorityScore += 10;
      reasons.push('近期没有重复测试');
    } else {
      const freshnessDays = experimentFreshnessDays(freshestEntry.createdAt, primaryPlan.updatedAt || primaryPlan.createdAt || now.toISOString());
      if (freshnessDays > 21) {
        priorityScore += 8;
        reasons.push('距离上一次相似测试已经过去足够久');
      } else if (freshnessDays > 7) {
        priorityScore += 3;
      } else {
        priorityScore -= 8;
        reasons.push('最近刚测过，优先级应下调');
      }
    }
    const merchantSignals = [
      ...(merchantContext?.performanceMemory.nextTestIdeas || []),
      ...(merchantContext?.performanceMemory.winningPatterns || []),
      ...performanceInsights.map(item => `${item.title} ${item.recommendedAction}`),
      merchantContext?.audienceSummary || '',
      ...(merchantContext?.reusableSellingPoints || []),
    ].join(' ');
    if (experimentTokenOverlap(`${primaryPlan.hypothesis} ${cell.expectedLearning} ${cell.testValue}`, merchantSignals) >= 0.2) {
      priorityScore += 10;
      reasons.push('与商家上下文和已有下一轮想法高度相关');
    } else if (variableType === 'audience' && merchantContext?.audienceSummary) {
      priorityScore += 6;
      reasons.push('与已沉淀的人群上下文高度相关');
    }
    if (duplicateRisk === 'high') {
      priorityScore -= 25;
      reasons.push('重复测试风险高');
    } else if (duplicateRisk === 'medium') {
      priorityScore -= 12;
      reasons.push('重复测试风险中等');
    }
    priorityScore = Math.max(0, Math.min(100, priorityScore));
    const priorityBand = experimentPriorityBand(priorityScore);
    const nextRecommendedTest = duplicateRisk === 'high'
      ? `不要原样重跑“${cell.testValue}”。保留${experimentVariableTypeLabel(variableType)}假设，但先换人群、创意角度或包装方式。`
      : bestReusable
        ? `可以把“${cell.testValue}”作为下一轮受控${experimentVariableTypeLabel(variableType)}测试，但请放到新的受众或平台切片里。`
        : bestAvoid
          ? `在再次测试“${cell.testValue}”前，请先重做${experimentVariableTypeLabel(variableType)}假设，换角度并隔离出更干净的单一变量。`
          : bestWatch
            ? `把“${cell.testValue}”先留在观察名单里，等有机会达到样本门槛时再补测。`
            : `把“${cell.testValue}”作为一轮干净的单变量${experimentVariableTypeLabel(variableType)}测试，在稳定 control 条件下执行。`;
    return {
      id: `priority-${primaryPlan.id}-${cell.id}`,
      experimentId: primaryPlan.id,
      cellId: cell.id,
      candidateName: cell.name,
      hypothesis: primaryPlan.hypothesis,
      variableType,
      duplicateRisk,
      priorityScore,
      priorityBand,
      reason: reasons.join('; '),
      nextRecommendedTest,
      supportingMemoryEntryIds: unique([bestReusable?.id, bestWatch?.id, bestAvoid?.id].filter((value): value is string => Boolean(value))),
    } satisfies PrioritizedExperimentCandidate;
  }).sort((left, right) => right.priorityScore - left.priorityScore);
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    candidates,
    briefSummary: candidates.length === 0
      ? '当前还没有优先队列。'
      : `当前排在最前的是 ${candidates[0].candidateName}（${experimentPriorityBandLabel(candidates[0].priorityBand)}，分数 ${candidates[0].priorityScore}）。`,
  };
}

function experimentUniqueEvidence(entries: ExperimentMemoryEntry[]) {
  const selected: ExperimentMemoryEntry[] = [];
  const duplicates: ExperimentMemoryEntry[] = [];
  for (const entry of entries) {
    const isDuplicate = selected.some(existing => experimentDuplicateRisk({
      variableType: entry.testedVariableType,
      hypothesis: scrubDeliveryText(entry.testedHypothesis),
      controlValue: entry.controlCellId,
      testValue: entry.testedVariableLabel,
    }, existing) === 'high');
    if (isDuplicate) duplicates.push(entry);
    else selected.push(entry);
  }
  return { selected, duplicates };
}

function experimentLearningStatusForEntries(entries: ExperimentMemoryEntry[], evidenceCount: number): ExperimentLearningStatus {
  if (entries.length === 0 || evidenceCount === 0) return 'unknown';
  const strongest = entries[0];
  if (strongest.conclusion === 'candidate_winner' && (strongest.confidenceLevel === 'moderate' || strongest.confidenceLevel === 'strong')) return 'learned';
  if (strongest.conclusion === 'directional_signal') return 'directional';
  if (strongest.conclusion === 'candidate_loser') return 'avoid_or_rework';
  if (strongest.conclusion === 'inconclusive') return 'inconclusive';
  return 'unknown';
}

function experimentVariableImpactScore(variableType: ExperimentMemoryVariableType) {
  const weights: Record<ExperimentMemoryVariableType, number> = {
    hook: 18,
    angle: 16,
    audience: 17,
    offer: 15,
    cta: 12,
    format: 11,
    asset: 10,
    price_message: 13,
    platform: 9,
  };
  return weights[variableType] || 8;
}

function experimentGenericQuestion(variableType: ExperimentMemoryVariableType, merchantContextCard?: MerchantContextCard) {
  if (variableType === 'hook') return `${merchantContextCard?.productName || '当前 SKU'} 最能拿到第一击点击的开头钩子是哪一种？`;
  if (variableType === 'audience') return `对于 ${merchantContextCard?.audienceSummary || '当前目标买家'}，哪一类人群语境反馈最好？`;
  if (variableType === 'angle') return '哪种内容角度最能激发明确购买动机？';
  if (variableType === 'offer') return '哪种利益点或证明方式最能最快降低买家犹豫？';
  if (variableType === 'cta') return '哪种 CTA 能在不过度承诺的前提下，推动最清晰的下一步动作？';
  if (variableType === 'format') return '哪种内容形式最有效率地把这个 SKU 讲清楚？';
  if (variableType === 'asset') return '哪种素材风格最能支撑当前最有希望的叙事？';
  return '哪种价格表达既能讲清价值，又不会显得过度促销？';
}

function experimentGapRecommendation(status: ExperimentLearningStatus, variableType: ExperimentMemoryVariableType, strongest?: ExperimentMemoryEntry) {
  if (status === 'learned') return `先把当前胜出的${experimentVariableTypeLabel(variableType)}放到新的受众或平台切片里验证，再决定是否扩大。`;
  if (status === 'directional') return `围绕当前${experimentVariableTypeLabel(variableType)}信号补做一轮验证测试，并把样本收集得更干净。`;
  if (status === 'inconclusive') return `针对${experimentVariableTypeLabel(variableType)}重测一轮，变量更单一、control 更稳定。`;
  if (status === 'avoid_or_rework') return `在投入下一次测试前，先重做${experimentVariableTypeLabel(variableType)}假设。${strongest ? `不要原样重复“${strongest.testedVariableLabel}”。` : ''}`;
  return `补上一轮干净的${experimentVariableTypeLabel(variableType)}首轮测试，先把这个学习缺口补齐。`;
}

export function buildExperimentLearningGapMap(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  memorySummary?: ExperimentMemorySummary,
  priorityQueue?: ExperimentPriorityQueue,
  merchantContextCard?: MerchantContextCard,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentLearningGapMap {
  const memory = memorySummary || buildExperimentMemorySummary(run, now);
  const queue = priorityQueue || buildExperimentPriorityQueue(run, memory, merchantContextCard, now);
  const merchantContext = merchantContextCard || run.merchantContextCard;
  const gaps = EXPERIMENT_LEARNING_VARIABLE_TYPES.map(variableType => {
    const variableEntries = memory.entries
      .filter(entry => entry.testedVariableType === variableType)
      .sort((left, right) => {
        const score = (entry: ExperimentMemoryEntry) => {
          if (entry.conclusion === 'candidate_winner') return 5;
          if (entry.conclusion === 'directional_signal') return 4;
          if (entry.conclusion === 'inconclusive') return 3;
          if (entry.conclusion === 'candidate_loser') return 2;
          return 1;
        };
        return score(right) - score(left) || Math.abs(right.relativeLift) - Math.abs(left.relativeLift);
      });
    const { selected, duplicates } = experimentUniqueEvidence(variableEntries);
    const strongest = variableEntries[0];
    const evidenceCount = selected.length;
    const status = experimentLearningStatusForEntries(variableEntries, evidenceCount);
    const topCandidate = queue.candidates.find(item => item.variableType === variableType);
    const strongestLearning = strongest
      ? strongest.reusableLearning
      : `当前还没有沉淀出关于${experimentVariableTypeLabel(variableType)}的本地学习。`;
    const unresolvedQuestion = status === 'learned'
      ? `当前胜出的${experimentVariableTypeLabel(variableType)}，放到新的上下文里验证后还能成立吗？`
      : status === 'directional'
        ? `当前${experimentVariableTypeLabel(variableType)}的方向性信号，在跨过样本门槛后还能成立吗？`
        : status === 'inconclusive'
          ? `怎样重构测试，才能在不混入其他变量的前提下把${experimentVariableTypeLabel(variableType)}单独测清楚？`
          : status === 'avoid_or_rework'
            ? `应该怎样重做${experimentVariableTypeLabel(variableType)}，才能避免重复之前的失败模式？`
            : experimentGenericQuestion(variableType, merchantContext);
    const riskNotes = [
      duplicates.length > 0 ? `有 ${duplicates.length} 条高重复证据已被降权处理。` : '',
      topCandidate?.duplicateRisk === 'high' ? '当前下一轮候选项存在较高重复测试风险。' : '',
      status === 'avoid_or_rework' ? '历史失败证据不能被直接当成永久真理，必须先重做后再判断。' : '',
    ].filter(Boolean);
    return {
      variableType,
      status,
      evidenceCount,
      strongestLearning,
      unresolvedQuestion,
      recommendedNextMove: experimentGapRecommendation(status, variableType, strongest),
      riskNote: riskNotes.join(' ') || '当前没有发现异常证据风险。',
    } satisfies ExperimentLearningGap;
  });
  const learnedCount = gaps.filter(item => item.status === 'learned').length;
  const directionalCount = gaps.filter(item => item.status === 'directional').length;
  const unknownCount = gaps.filter(item => item.status === 'unknown').length;
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    gaps,
    summary: `当前已有 ${learnedCount} 个变量形成可复用学习，${directionalCount} 个变量停留在方向性信号阶段，仍有 ${unknownCount} 个变量处于未知状态。`,
  };
}

export function buildExperimentSequencingPlan(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  gapMap?: ExperimentLearningGapMap,
  priorityQueue?: ExperimentPriorityQueue,
  memorySummary?: ExperimentMemorySummary,
  merchantContextCard?: MerchantContextCard,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentSequencingPlan {
  const memory = memorySummary || buildExperimentMemorySummary(run, now);
  const queue = priorityQueue || buildExperimentPriorityQueue(run, memory, merchantContextCard, now);
  const gaps = gapMap || buildExperimentLearningGapMap(run, memory, queue, merchantContextCard, now);
  const merchantContext = merchantContextCard || run.merchantContextCard;
  const ranked = gaps.gaps
    .map(gap => {
      const candidate = queue.candidates.find(item => item.variableType === gap.variableType);
      const statusBonus =
        gap.status === 'unknown' ? 24 :
          gap.status === 'directional' ? 18 :
            gap.status === 'inconclusive' ? 15 :
              gap.status === 'learned' ? 10 :
                4;
      const duplicatePenalty = candidate?.duplicateRisk === 'high' ? 18 : candidate?.duplicateRisk === 'medium' ? 8 : 0;
      const candidateScore = candidate?.priorityScore || 35;
      const learnedPenalty = gap.status === 'learned' && candidate?.duplicateRisk === 'high' ? 6 : 0;
      const sequencingScore = experimentVariableImpactScore(gap.variableType) + statusBonus + candidateScore - duplicatePenalty - learnedPenalty;
      return { gap, candidate, sequencingScore };
    })
    .sort((left, right) => right.sequencingScore - left.sequencingScore);
  const steps = ranked.map((item, index) => {
    const { gap, candidate } = item;
    const previous = index > 0 ? ranked[index - 1].gap.variableType : null;
    const hypothesis = candidate?.hypothesis
      || (gap.status === 'unknown'
        ? `只改变${experimentVariableTypeLabel(gap.variableType)}，应该能为 ${merchantContext?.productName || run.project.productName} 带来第一轮清晰信号。`
        : gap.status === 'directional'
          ? `一轮更干净的${experimentVariableTypeLabel(gap.variableType)}验证测试，应该能确认这个方向性信号是否真实存在。`
          : gap.status === 'learned'
            ? `当前胜出的${experimentVariableTypeLabel(gap.variableType)}，在新的上下文里验证时仍应成立。`
            : gap.status === 'avoid_or_rework'
              ? `重做${experimentVariableTypeLabel(gap.variableType)}，应能避开之前的失败模式，并重新打开学习空间。`
              : `一轮更干净的${experimentVariableTypeLabel(gap.variableType)}复测，应能把真实信号和噪音区分开。`);
    const whyNow = gap.status === 'unknown'
      ? `${experimentVariableTypeLabel(gap.variableType)}属于高影响变量，但目前还未知，所以应该优先学清楚。`
      : gap.status === 'directional'
        ? `它排在前面，是因为${experimentVariableTypeLabel(gap.variableType)}已经出现变化迹象，成本最低的下一步就是验证。`
        : gap.status === 'inconclusive'
          ? `它现在要跟上，是因为${experimentVariableTypeLabel(gap.variableType)}已经有部分证据，但还缺一轮更干净的判断。`
          : gap.status === 'learned'
            ? `这是“验证后再放大”的一步，用来确认已经学到的${experimentVariableTypeLabel(gap.variableType)}在原始场景之外是否仍然成立。`
            : `这一步被下调优先级，并按“重做”处理，因为上一版${experimentVariableTypeLabel(gap.variableType)}表现偏弱。`;
    const controlGuidance = gap.status === 'learned'
      ? `保持当前胜出的${experimentVariableTypeLabel(gap.variableType)} control 稳定，继续复用已验证过的基线。`
      : candidate
        ? `为 ${candidate.candidateName} 选择当前最干净的 control，其余变量不要动。`
        : `把除${experimentVariableTypeLabel(gap.variableType)}之外的所有元素都固定住，让这一步只学到一件事。`;
    const testGuidance = candidate?.nextRecommendedTest
      || (gap.status === 'directional'
        ? `围绕当前${experimentVariableTypeLabel(gap.variableType)}方向再测一轮，并把样本收集得更完整。`
        : gap.status === 'learned'
          ? `把已经学到的${experimentVariableTypeLabel(gap.variableType)}放到新人群、新平台或新包装语境里验证。`
          : gap.status === 'avoid_or_rework'
            ? `不要重复旧的失败变体，改做一个全新的${experimentVariableTypeLabel(gap.variableType)}版本。`
            : `只引入一个新的${experimentVariableTypeLabel(gap.variableType)}测试变体。`);
    const expectedLearning = gap.status === 'learned'
      ? `确认已经学到的${experimentVariableTypeLabel(gap.variableType)}能否从原始胜出切片泛化出去。`
      : gap.status === 'directional'
        ? `确认当前${experimentVariableTypeLabel(gap.variableType)}的方向性信号，是否能升级为可复用模式。`
        : gap.status === 'inconclusive'
          ? `在测试更干净之后，判断${experimentVariableTypeLabel(gap.variableType)}到底是不是真的重要。`
          : gap.status === 'avoid_or_rework'
            ? `学清楚一个更安全、更靠谱的${experimentVariableTypeLabel(gap.variableType)}重做版本应该长什么样。`
            : `为${experimentVariableTypeLabel(gap.variableType)}补上第一轮基础证据。`;
    const priorityBand = candidate?.priorityBand || experimentPriorityBand(item.sequencingScore);
    return {
      stepNumber: index + 1,
      primaryVariableType: gap.variableType,
      hypothesis,
      whyNow,
      controlGuidance,
      testGuidance,
      expectedLearning,
      dependency: previous ? `更适合放在第 ${index} 步（${experimentVariableTypeLabel(previous)}）稳定基线之后执行。` : '从这里开始即可，当前没有前置依赖。',
      stopOrContinueRule: gap.status === 'learned'
        ? '如果验证结果偏弱就先停；只有当这个已学到的模式在新切片里依然成立时，才继续放大。'
        : gap.status === 'directional'
          ? '只有当验证测试跨过样本门槛时，才继续往下推进。'
          : gap.status === 'inconclusive'
            ? '如果连续几轮更干净的复测仍然很接近，就先停；只有出现真正拉开的差异时再继续。'
            : gap.status === 'avoid_or_rework'
              ? '不要继续沿用旧变体；只有当重做后的测试已经明显改变原始假设时，才继续投入。'
              : '一旦出现第一轮干净信号就继续；否则先保持未知状态，转去补下一个缺口。',
      duplicateRisk: candidate?.duplicateRisk || 'low',
      priorityBand,
    } satisfies ExperimentSequenceStep;
  });
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    topUnresolvedQuestion: ranked[0]?.gap.unresolvedQuestion || '当前没有待解问题。',
    steps,
    summary: steps.length === 0
      ? '当前还没有实验路线图。'
      : `路线图优先从${experimentVariableTypeLabel(steps[0].primaryVariableType)}开始，接着推进 ${steps.slice(1, 3).map(step => experimentVariableTypeLabel(step.primaryVariableType)).join(' / ') || '后续步骤待补充'}。`,
  };
}

function experimentValidationPriority(decision: ExperimentValidationDecision) {
  const order: Record<ExperimentValidationDecision, number> = {
    scale_candidate: 6,
    small_rollout: 5,
    stop_variant: 4,
    validate_more: 3,
    rework_hypothesis: 2,
    do_not_decide: 1,
  };
  return order[decision] || 0;
}

function experimentValidationRisk(
  decision: ExperimentValidationDecision,
  confidenceLevel: ExperimentConfidenceLevel,
  duplicateRisk: PrioritizedExperimentCandidate['duplicateRisk'],
  sampleSufficient: boolean,
): ExperimentRolloutRisk {
  if (decision === 'scale_candidate' && confidenceLevel === 'strong' && duplicateRisk === 'low' && sampleSufficient) return 'low';
  if (decision === 'small_rollout' || decision === 'stop_variant') return confidenceLevel === 'strong' ? 'low' : 'medium';
  if (decision === 'validate_more' || decision === 'rework_hypothesis') return duplicateRisk === 'high' ? 'high' : 'medium';
  return sampleSufficient ? 'medium' : 'high';
}

function experimentValidationReason(
  decision: ExperimentValidationDecision,
  duplicateRisk: PrioritizedExperimentCandidate['duplicateRisk'],
  gap?: ExperimentLearningGap,
) {
  if (decision === 'scale_candidate') return '样本已达标，胜出幅度清晰，且当前重复测试风险较低。';
  if (decision === 'small_rollout') return '已经出现胜出信号并跨过样本门槛，但更适合先做小范围验证放大。';
  if (decision === 'stop_variant') return '在样本充足前提下持续落后，继续投入的学习价值已经很低。';
  if (decision === 'rework_hypothesis') return '结果接近或变量不够干净，需要先重写假设再测。';
  if (decision === 'validate_more') {
    if (duplicateRisk === 'high') return '虽然已有一定信号，但重复测试风险偏高，先验证是否真是新学习。';
    if (gap?.status === 'unknown') return '这是高影响但尚未学清楚的变量，现阶段更适合先验证。';
    return '目前只有方向性信号，样本或上下文还不够支持直接放大。';
  }
  return '当前样本不足，暂时不应根据这轮结果做出放大或停止决策。';
}

function experimentValidationExplanation(
  cellName: string,
  decision: ExperimentValidationDecision,
  metric: SuccessMetric['name'],
) {
  if (decision === 'scale_candidate') return `${cellName} 在 ${metricLabel(metric)} 上已经形成足够清晰的本地胜出信号，可以进入放大候选。`;
  if (decision === 'small_rollout') return `${cellName} 已有可用信号，但更稳妥的做法是先小范围放大，再继续盯关键指标。`;
  if (decision === 'stop_variant') return `${cellName} 在样本达标后仍然落后，建议停止当前方案并替换测试变量。`;
  if (decision === 'rework_hypothesis') return `${cellName} 现在更像是实验设计问题，而不是放大或停止问题，先把变量洗干净。`;
  if (decision === 'validate_more') return `${cellName} 目前只够支持继续验证，不能直接当成已证实结论。`;
  return `${cellName} 当前还不具备做决策的样本基础，先继续收集数据。`;
}

function experimentValidationStopCondition(
  decision: ExperimentValidationDecision,
  confidence: ExperimentCellConfidence,
  metric: SuccessMetric['name'],
) {
  if (decision === 'scale_candidate' || decision === 'small_rollout') {
    return `如果后续 ${metricLabel(metric)} 回落到接近 control，或样本补齐后相对提升低于 10%，就暂停继续放大。`;
  }
  if (decision === 'stop_variant') {
    return `如果替代方案在 ${metricLabel(metric)} 上仍然无法拉开差距，就不要沿用当前变体。`;
  }
  if (decision === 'rework_hypothesis') {
    return `如果下一轮单变量重测后 ${metricLabel(metric)} 仍然贴近 control，就停止这条假设。`;
  }
  if (confidence.sampleSufficient) {
    return `只有在新增样本后 ${metricLabel(metric)} 明显拉开差距时，才升级判断。`;
  }
  return `在样本未达标前，不要依据当前 ${metricLabel(metric)} 结果做放大或停止。`;
}

function experimentValidationAllowedAction(decision: ExperimentValidationDecision, variableType: ExperimentMemoryVariableType) {
  if (decision === 'scale_candidate') return `把 ${experimentVariableTypeLabel(variableType)} 的胜出做法放到下一轮更多切片里验证。`;
  if (decision === 'small_rollout') return `仅在小范围内复用 ${experimentVariableTypeLabel(variableType)} 胜出做法。`;
  return `继续围绕 ${experimentVariableTypeLabel(variableType)} 收集验证信号。`;
}

export function buildExperimentValidationPolicy(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  confidenceSummary?: ExperimentConfidenceSummary,
  memorySummary?: ExperimentMemorySummary,
  priorityQueue?: ExperimentPriorityQueue,
  gapMap?: ExperimentLearningGapMap,
  sequencingPlan?: ExperimentSequencingPlan,
  merchantContextCard?: MerchantContextCard,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentValidationPolicy {
  const report = Array.isArray(run.experimentReports) && run.experimentReports.length > 0 ? run.experimentReports[0] : undefined;
  const plan = Array.isArray(run.experimentPlans) && run.experimentPlans.length > 0 ? run.experimentPlans[0] : undefined;
  const summary = confidenceSummary || report?.confidenceSummary;
  const memory = memorySummary || buildExperimentMemorySummary(run, now);
  const queue = priorityQueue || buildExperimentPriorityQueue(run, memory, merchantContextCard, now);
  const gaps = gapMap || buildExperimentLearningGapMap(run, memory, queue, merchantContextCard, now);
  const sequence = sequencingPlan || buildExperimentSequencingPlan(run, gaps, queue, memory, merchantContextCard, now);

  const rules = (report?.cellConfidence || []).map((confidence, index) => {
    const cell = plan?.experimentCells.find(item => item.id === confidence.cellId);
    const targetVariableType = cell ? experimentMemoryVariableType(cell.variableType) : 'hook';
    const candidate = queue.candidates.find(item => item.cellId === confidence.cellId)
      || queue.candidates.find(item => item.variableType === targetVariableType);
    const gap = gaps.gaps.find(item => item.variableType === targetVariableType);
    const duplicateRisk = candidate?.experimentId === report?.experimentId
      ? 'low'
      : candidate?.duplicateRisk || sequence.steps.find(item => item.primaryVariableType === targetVariableType)?.duplicateRisk || 'low';
    const unknownHighImpact = gap?.status === 'unknown' && experimentVariableImpactScore(targetVariableType) >= 15;
    let decision: ExperimentValidationDecision;

    if (confidence.conclusion === 'directional_signal') decision = 'validate_more';
    else if (!confidence.sampleSufficient) decision = confidence.relativeLift > 0 ? 'validate_more' : 'do_not_decide';
    else if (confidence.conclusion === 'candidate_loser') decision = 'stop_variant';
    else if (confidence.conclusion === 'inconclusive') decision = 'rework_hypothesis';
    else if (confidence.conclusion === 'candidate_winner' && confidence.confidenceLevel === 'strong' && duplicateRisk === 'low') decision = 'scale_candidate';
    else if (confidence.conclusion === 'candidate_winner' && duplicateRisk === 'high') decision = 'validate_more';
    else if (confidence.conclusion === 'candidate_winner' && (confidence.confidenceLevel === 'moderate' || confidence.confidenceLevel === 'strong')) decision = 'small_rollout';
    else if (unknownHighImpact) decision = 'validate_more';
    else decision = 'do_not_decide';

    const riskLevel = experimentValidationRisk(decision, confidence.confidenceLevel, duplicateRisk, confidence.sampleSufficient);
    const metric = confidence.metric;
    const cellName = cell?.name || confidence.cellId;
    const reason = experimentValidationReason(decision, duplicateRisk, gap);
    return {
      id: `validation-${report?.experimentId || run.project.id}-${index + 1}`,
      experimentId: report?.experimentId || run.project.id,
      cellId: confidence.cellId,
      targetVariableType,
      confidenceLevel: confidence.confidenceLevel,
      conclusion: confidence.conclusion,
      decision,
      riskLevel,
      duplicateRisk,
      sampleSufficient: confidence.sampleSufficient,
      reason,
      requiredGuardrail: confidence.sampleGuardrail,
      nextCheckMetric: metric,
      stopCondition: experimentValidationStopCondition(decision, confidence, metric),
      userFacingExplanation: experimentValidationExplanation(cellName, decision, metric),
    } satisfies ExperimentValidationRule;
  }).sort((left, right) =>
    experimentValidationPriority(right.decision) - experimentValidationPriority(left.decision)
    || Number(right.sampleSufficient) - Number(left.sampleSufficient)
    || right.cellId.localeCompare(left.cellId)
  );

  const rolloutRules = rules
    .filter(rule => rule.decision === 'small_rollout' || rule.decision === 'scale_candidate')
    .map(rule => ({
      decision: rule.decision,
      targetVariableType: rule.targetVariableType,
      allowedAction: experimentValidationAllowedAction(rule.decision, rule.targetVariableType),
      riskLevel: rule.riskLevel,
      whyAllowed: rule.reason,
      requiredGuardrail: rule.requiredGuardrail,
      nextCheckMetric: rule.nextCheckMetric,
      stopCondition: rule.stopCondition,
      userFacingExplanation: rule.userFacingExplanation,
    } satisfies ExperimentRolloutRule));

  const stopRules = rules
    .filter(rule => rule.decision === 'stop_variant')
    .map(rule => ({
      variantOrVariable: `${experimentVariableTypeLabel(rule.targetVariableType)} / ${rule.cellId}`,
      stopReason: rule.reason,
      metricTrigger: `${metricLabel(rule.nextCheckMetric)} 在样本达标后仍明显落后`,
      confidenceRequirement: `${experimentConfidenceLevelLabel(rule.confidenceLevel)} + 样本达标`,
      suggestedReplacement: sequence.steps.find(item => item.primaryVariableType !== rule.targetVariableType)?.hypothesis || `改测新的${experimentVariableTypeLabel(rule.targetVariableType)}假设`,
      userFacingExplanation: rule.userFacingExplanation,
    } satisfies ExperimentStopRule));

  const noDecisionYet = rules
    .filter(rule => rule.decision === 'do_not_decide')
    .map(rule => `${rule.cellId}：${rule.requiredGuardrail}`);
  const validationBacklog = unique([
    ...rules
      .filter(rule => rule.decision === 'validate_more' || rule.decision === 'rework_hypothesis')
      .map(rule => `${rule.cellId}：${rule.reason}`),
    ...gaps.gaps
      .filter(gap => gap.status === 'unknown' || gap.status === 'directional' || gap.status === 'inconclusive')
      .slice(0, 3)
      .map(gap => `${experimentVariableTypeLabel(gap.variableType)}：${gap.recommendedNextMove}`),
  ]);
  const topDecision = rules[0]?.decision || (summary?.conclusion === 'candidate_winner' ? 'small_rollout' : 'validate_more');

  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    topDecision,
    rules,
    rolloutRules,
    stopRules,
    noDecisionYet,
    validationBacklog,
    summary: rules.length === 0
      ? '当前还没有可用于实验决策的结果，先补一轮本地实验数据。'
      : `当前主决策是“${experimentValidationDecisionLabel(topDecision)}”。${rolloutRules.length} 个项目可进入放大判断，${validationBacklog.length} 个项目仍需继续验证。`,
  };
}

export function buildExperimentDecisionSummary(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  validationPolicy?: ExperimentValidationPolicy,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentDecisionSummary {
  const policy = validationPolicy || buildExperimentValidationPolicy(
    run,
    undefined,
    run.experimentMemorySummary,
    run.experimentPriorityQueue,
    run.experimentLearningGapMap,
    run.experimentSequencingPlan,
    run.merchantContextCard,
    now,
  );
  const topRule = policy.rules[0];
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    topDecision: topRule?.decision || policy.topDecision,
    riskLevel: topRule?.riskLevel || 'high',
    whyThisDecision: topRule?.reason || '当前还没有足够样本支持任何放大或停止结论。',
    nextCheckMetric: topRule ? metricLabel(topRule.nextCheckMetric) : '点击率',
    stopCondition: topRule?.stopCondition || '在样本未达标前，先不要做放大或停止判断。',
    canRollout: policy.rolloutRules.map(rule => `${experimentVariableTypeLabel(rule.targetVariableType)}：${rule.allowedAction}`),
    mustValidate: policy.validationBacklog,
    stopNow: policy.stopRules.map(rule => `${rule.variantOrVariable}：${rule.stopReason}`),
    noDecisionYet: policy.noDecisionYet,
    summary: topRule
      ? `${experimentValidationDecisionLabel(topRule.decision)} / 风险${experimentRolloutRiskLabel(topRule.riskLevel)}：${topRule.userFacingExplanation}`
      : '当前没有明确实验决策，先完成一轮样本达标的本地复盘。',
  };
}

function createExperimentExecutionTask(input: {
  id: string;
  stage: ExperimentExecutionStage;
  group: string;
  title: string;
  description: string;
  required?: boolean;
  relatedMetric?: SuccessMetric['name'];
  riskIfSkipped: string;
  userFacingNote: string;
}): ExperimentExecutionTask {
  return {
    ...input,
    required: input.required ?? true,
  };
}

export function buildExperimentCadencePlan(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  validationPolicy?: ExperimentValidationPolicy,
  decisionSummary?: ExperimentDecisionSummary,
  sequencingPlan?: ExperimentSequencingPlan,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentCadencePlan {
  const policy = validationPolicy || buildExperimentValidationPolicy(
    run,
    undefined,
    run.experimentMemorySummary,
    run.experimentPriorityQueue,
    run.experimentLearningGapMap,
    run.experimentSequencingPlan,
    run.merchantContextCard,
    now,
  );
  const summary = decisionSummary || buildExperimentDecisionSummary(run, policy, now);
  const sequence = sequencingPlan || run.experimentSequencingPlan || buildExperimentSequencingPlan(
    run,
    run.experimentLearningGapMap,
    run.experimentPriorityQueue,
    run.experimentMemorySummary,
    run.merchantContextCard,
    now,
  );
  const topRule = policy.rules[0];
  const decision = summary.topDecision;
  const metric = topRule?.nextCheckMetric || 'ctr';
  const primaryVariable = topRule?.targetVariableType || sequence.steps[0]?.primaryVariableType || 'hook';

  let monitoringCadence = '每 24 小时补一次数据，先补齐样本门槛。';
  let nextCheckpoint = `先把每个实验单元的 ${metricLabel(metric)} 数据补齐，再做下一次判断。`;
  let summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“继续观察”节奏。`;

  if (decision === 'small_rollout') {
    monitoringCadence = '小范围放大后每 12 小时检查一次，连续观察 2 到 3 个检查点。';
    nextCheckpoint = `确认 ${metricLabel(metric)} 在小范围放大后没有明显回落，再决定是否继续扩量。`;
    summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“小范围放大”节奏。`;
  } else if (decision === 'scale_candidate') {
    monitoringCadence = '进入放大候选后每 6 小时复查一次，优先盯住主指标和回落风险。';
    nextCheckpoint = `放大后的第一个复查点必须先看 ${metricLabel(metric)} 是否仍然领先 control。`;
    summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“放大候选”节奏。`;
  } else if (decision === 'stop_variant') {
    monitoringCadence = '立即停止，不继续等待新数据；当天完成归档和替代方案登记。';
    nextCheckpoint = '停止后只保留归档检查点，不再继续投放或发布同一变体。';
    summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“立即停止并归档”节奏。`;
  } else if (decision === 'rework_hypothesis') {
    monitoringCadence = '先不进入发布节奏；先重写假设、重做素材，再安排下一次 launch。';
    nextCheckpoint = '新的一版 control / test 文案和变量定义写清楚后，才允许重新排期。';
    summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“重写假设后再启动”节奏。`;
  } else if (decision === 'do_not_decide') {
    monitoringCadence = '暂不做结论，每 24 小时检查一次缺失字段和新增样本。';
    nextCheckpoint = '先补齐缺失数据，再判断是否值得继续。';
    summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“先补缺数据”节奏。`;
  } else if (topRule?.conclusion === 'directional_signal') {
    monitoringCadence = '方向性信号阶段每 24 小时复查一次，不做放大量级动作。';
    nextCheckpoint = `先验证 ${metricLabel(metric)} 是否跨过样本门槛，再考虑升级判断。`;
    summaryText = `当前围绕${experimentVariableTypeLabel(primaryVariable)}进入“方向性验证”节奏。`;
  }

  const rules: ExperimentCadenceRule[] = [
    {
      id: `cadence-prepare-${run.project.id}`,
      stage: 'prepare',
      triggerDecision: decision,
      timing: decision === 'rework_hypothesis' ? '立即开始' : '发布前当天',
      action: decision === 'rework_hypothesis' ? '先重写变量假设与 control / test 定义' : '确认实验变量、命名规则和结果回收模板',
      checkpoint: decision === 'rework_hypothesis' ? '假设文档写清楚再继续' : '确保 tracking code 与 cell 一一对应',
      relatedMetric: metric,
      rationale: '先把实验边界写清楚，后面的观察节奏才有意义。',
    },
    {
      id: `cadence-launch-${run.project.id}`,
      stage: decision === 'stop_variant' ? 'archive' : 'launch',
      triggerDecision: decision,
      timing: decision === 'stop_variant' ? '立即停止' : decision === 'small_rollout' ? '小范围上线当天' : decision === 'scale_candidate' ? '放大当天' : '开始采样当天',
      action: decision === 'stop_variant' ? '停止当前变体并冻结重复发布' : decision === 'small_rollout' ? '只在受控切片里发布，不扩散到全部场景' : decision === 'scale_candidate' ? '按候选胜出方案进入更多切片' : '保持 control / test 同步上线',
      checkpoint: decision === 'stop_variant' ? '确认旧变体不再继续使用' : '不要在同一轮里混入第二个主变量',
      relatedMetric: metric,
      rationale: decision === 'stop_variant' ? '停止动作本身就是这一轮的执行重点。' : '发布阶段最怕同时改太多变量，导致结果失真。',
    },
    {
      id: `cadence-monitor-${run.project.id}`,
      stage: 'monitor',
      triggerDecision: decision,
      timing: monitoringCadence,
      action: `回收 ${metricLabel(metric)}、点击、曝光及必要的成本/收入字段`,
      checkpoint: nextCheckpoint,
      relatedMetric: metric,
      rationale: '监控节奏决定了这轮实验是继续观察、放大还是停止。',
    },
    {
      id: `cadence-decide-${run.project.id}`,
      stage: decision === 'stop_variant' ? 'archive' : 'decide',
      triggerDecision: decision,
      timing: decision === 'stop_variant' ? '停止后当天' : '达到检查点后立即执行',
      action: decision === 'small_rollout' ? '判断是否从小范围放大升级到放大候选' : decision === 'scale_candidate' ? '判断是否继续保持领先或暂停回撤' : decision === 'rework_hypothesis' ? '决定新的创意改写方向' : '根据样本和差异更新下一轮决策',
      checkpoint: summary.stopCondition,
      relatedMetric: metric,
      rationale: '决策点必须和停止条件绑定，避免靠感觉继续跑。',
    },
  ];

  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    currentDecision: decision,
    monitoringCadence,
    nextCheckpoint,
    stopCondition: summary.stopCondition,
    rules,
    summary: summaryText,
  };
}

export function buildExperimentOperatorChecklist(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  validationPolicy?: ExperimentValidationPolicy,
  decisionSummary?: ExperimentDecisionSummary,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentOperatorChecklist {
  const policy = validationPolicy || buildExperimentValidationPolicy(
    run,
    undefined,
    run.experimentMemorySummary,
    run.experimentPriorityQueue,
    run.experimentLearningGapMap,
    run.experimentSequencingPlan,
    run.merchantContextCard,
    now,
  );
  const summary = decisionSummary || buildExperimentDecisionSummary(run, policy, now);
  const topRule = policy.rules[0];
  const metric = topRule?.nextCheckMetric || 'ctr';
  const decision = summary.topDecision;

  const sections = [
    {
      title: '发布前检查',
      items: [
        createExperimentExecutionTask({
          id: `check-prepare-window-${run.project.id}`,
          stage: 'prepare',
          group: '发布前检查',
          title: '确认 control / test 在同一观察窗口内',
          description: '保证两个版本在相近时间、相近场景下进入观察，避免天然流量差。',
          relatedMetric: metric,
          riskIfSkipped: '样本不具可比性，后续判断会失真。',
          userFacingNote: '不要让 control 昨天发、test 今天发，还拿来直接比。',
        }),
        createExperimentExecutionTask({
          id: `check-launch-material-${run.project.id}`,
          stage: 'launch',
          group: '发布前检查',
          title: '确认素材、文案、标题已对应到正确实验单元',
          description: '每个实验单元都要明确谁是 control、谁是 test。',
          riskIfSkipped: '会把错误素材归到错误结果上。',
          userFacingNote: '发布前最后再核一次 cellId 和素材版本。',
        }),
      ],
    },
    {
      title: '内容变量检查',
      items: [
        createExperimentExecutionTask({
          id: `check-variable-single-${run.project.id}`,
          stage: 'prepare',
          group: '内容变量检查',
          title: '确认这一轮只改一个主变量',
          description: '保持 hook / angle / audience / cta 中只有一个主变量发生改变。',
          riskIfSkipped: '结果会变成混合信号，无法复用。',
          userFacingNote: '这轮测 hook，就不要顺手把 CTA 和人群也一起改掉。',
        }),
        createExperimentExecutionTask({
          id: `check-hypothesis-${run.project.id}`,
          stage: decision === 'rework_hypothesis' ? 'produce' : 'prepare',
          group: '内容变量检查',
          title: decision === 'rework_hypothesis' ? '重写创意假设后再进入生产' : '确认假设和变量定义已写清楚',
          description: '把“为什么测、测什么、什么结果算有效”写成一句清晰判断。',
          riskIfSkipped: '执行团队会在中途改口径。',
          userFacingNote: decision === 'rework_hypothesis' ? '先改写创意，不要直接重发旧版本。' : '假设写不清楚，复盘也很难写清楚。',
        }),
      ],
    },
    {
      title: '命名与追踪检查',
      items: [
        createExperimentExecutionTask({
          id: `check-tracking-name-${run.project.id}`,
          stage: 'prepare',
          group: '命名与追踪检查',
          title: '确认 tracking code 与实验单元一一对应',
          description: '每个 cell 的 tracking 命名都要能回指 control / test。',
          relatedMetric: metric,
          riskIfSkipped: '后续导入 CSV 时会无法分辨是哪一个版本。',
          userFacingNote: '命名错一次，后面整轮数据都可能用不了。',
        }),
        createExperimentExecutionTask({
          id: `check-tracking-field-${run.project.id}`,
          stage: 'launch',
          group: '命名与追踪检查',
          title: '确认发布记录里保留平台、内容类型、cellId 与 trackingCode',
          description: '最少要保留可归因的四个核心字段。',
          riskIfSkipped: '后面即使拿到数据，也无法准确回写到实验层。',
          userFacingNote: '发布记录不一定复杂，但字段不能丢。',
        }),
      ],
    },
    {
      title: '数据回收检查',
      items: [
        createExperimentExecutionTask({
          id: `check-data-collect-${run.project.id}`,
          stage: 'monitor',
          group: '数据回收检查',
          title: '按固定节奏回收曝光、点击和主指标数据',
          description: '至少按既定 cadence 回收曝光、点击、主指标和备注。',
          relatedMetric: metric,
          riskIfSkipped: '会错过最佳决策点，或者形成缺口数据。',
          userFacingNote: '先保证数据连续，再谈分析是否高级。',
        }),
        createExperimentExecutionTask({
          id: `check-data-note-${run.project.id}`,
          stage: 'monitor',
          group: '数据回收检查',
          title: '记录异常背景说明',
          description: '如果有节假日、平台波动、临时改文案等情况，需要补充说明。',
          required: false,
          riskIfSkipped: '容易把环境噪音误当成内容信号。',
          userFacingNote: '备注不是装饰，它决定这轮学习能不能复用。',
        }),
      ],
    },
    {
      title: '放大前检查',
      items: [
        createExperimentExecutionTask({
          id: `check-scale-gate-${run.project.id}`,
          stage: 'decide',
          group: '放大前检查',
          title: '确认已跨过样本门槛且未触发重复测试风险',
          description: '只有样本达标且不是重复旧实验，才允许进入小范围放大或放大候选。',
          required: decision === 'small_rollout' || decision === 'scale_candidate',
          relatedMetric: metric,
          riskIfSkipped: '会把偶然胜出误当成可复制结论。',
          userFacingNote: '放大前先问自己：这是真的新学习，还是旧测试换了个壳？',
        }),
      ],
    },
    {
      title: '停止前检查',
      items: [
        createExperimentExecutionTask({
          id: `check-stop-gate-${run.project.id}`,
          stage: 'decide',
          group: '停止前检查',
          title: '确认停止原因对应到明确指标和停止条件',
          description: '停止动作必须能说清楚是因为什么落后、在哪个指标上落后。',
          required: decision === 'stop_variant' || decision === 'rework_hypothesis',
          relatedMetric: metric,
          riskIfSkipped: '容易过早砍掉有潜力的变量，或者留下模糊失败结论。',
          userFacingNote: '停止不是情绪动作，要能回到规则里解释。',
        }),
      ],
    },
    {
      title: '复盘归档检查',
      items: [
        createExperimentExecutionTask({
          id: `check-archive-memory-${run.project.id}`,
          stage: 'archive',
          group: '复盘归档检查',
          title: '把结果写回实验记忆、优先队列和交付包',
          description: '无论胜出、继续观察还是停止，都要更新本地实验记忆。',
          relatedMetric: metric,
          riskIfSkipped: '下一轮会重复踩同样的坑，实验无法形成复利。',
          userFacingNote: '这一步决定 Wenai 是不是会越跑越聪明。',
        }),
      ],
    },
  ];

  const requiredCount = sections.reduce((sum, section) => sum + section.items.filter(item => item.required).length, 0);
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    currentDecision: decision,
    requiredCount,
    sections,
    summary: `当前检查表共有 ${requiredCount} 项必做项，覆盖发布、追踪、数据回收、放大/停止和归档。`,
  };
}

function buildExperimentExecutionSummary(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  playbook: ExperimentExecutionPlaybook,
  cadencePlan: ExperimentCadencePlan,
  checklist: ExperimentOperatorChecklist,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentExecutionSummary {
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    currentDecision: playbook.currentDecision,
    nextTasks: playbook.productionTasks.slice(0, 3).map(task => `${experimentExecutionStageLabel(task.stage)}：${task.title}`),
    monitoringCadence: cadencePlan.monitoringCadence,
    stopCondition: playbook.stopCondition,
    requiredChecklistCount: checklist.requiredCount,
    summary: `${experimentValidationDecisionLabel(playbook.currentDecision)}：先做 ${playbook.productionTasks[0]?.title || '数据准备'}，并按“${cadencePlan.monitoringCadence}”执行。`,
  };
}

export function buildExperimentExecutionPlaybook(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  validationPolicy?: ExperimentValidationPolicy,
  decisionSummary?: ExperimentDecisionSummary,
  sequencingPlan?: ExperimentSequencingPlan,
  priorityQueue?: ExperimentPriorityQueue,
  gapMap?: ExperimentLearningGapMap,
  confidenceSummary?: ExperimentConfidenceSummary,
  merchantContextCard?: MerchantContextCard,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentExecutionPlaybook {
  const policy = validationPolicy || buildExperimentValidationPolicy(
    run,
    confidenceSummary,
    run.experimentMemorySummary,
    priorityQueue || run.experimentPriorityQueue,
    gapMap || run.experimentLearningGapMap,
    sequencingPlan || run.experimentSequencingPlan,
    merchantContextCard || run.merchantContextCard,
    now,
  );
  const summary = decisionSummary || buildExperimentDecisionSummary(run, policy, now);
  const sequence = sequencingPlan || run.experimentSequencingPlan || buildExperimentSequencingPlan(
    run,
    gapMap || run.experimentLearningGapMap,
    priorityQueue || run.experimentPriorityQueue,
    run.experimentMemorySummary,
    merchantContextCard || run.merchantContextCard,
    now,
  );
  const plan = Array.isArray(run.experimentPlans) && run.experimentPlans.length > 0 ? run.experimentPlans[0] : undefined;
  const topRule = policy.rules[0];
  const merchantContext = merchantContextCard || run.merchantContextCard;
  const primaryVariableType = topRule?.targetVariableType || sequence.steps[0]?.primaryVariableType || 'hook';
  const metric = topRule?.nextCheckMetric || 'ctr';
  const decision = summary.topDecision;
  const experimentObjective = sequence.steps[0]?.expectedLearning || plan?.goal || `围绕${experimentVariableTypeLabel(primaryVariableType)}完成一轮本地可归因实验。`;
  const requiredMaterials = unique([
    `${run.project.productName} 的 control / test 内容版本`,
    merchantContext?.assetMemory.reusableAssetNames[0],
    merchantContext?.assetMemory.reusableAssetNames[1],
    merchantContext?.assetMemory.missingAssetNeeds[0],
    '实验计划与追踪命名规则',
    '结果回收 CSV 模板',
  ].filter((value): value is string => Boolean(value)));
  const trackingNamingReminders = unique([
    plan?.trackingPlan.namingConvention || 'WENAI_{category}_{platform}_{contentType}_{variableType}_{cellId}_{date}',
    plan?.trackingPlan.trackingCodes[0],
    '发布记录里必须同时保留 cellId、trackingCode、platform、contentType。',
  ].filter((value): value is string => Boolean(value)));
  const launchChecklist = [
    '确认 control / test 在同一观察窗口内发布',
    '确认这一轮只改一个主变量',
    '确认 tracking code 与实验单元一一对应',
  ];

  const productionTasks: ExperimentExecutionTask[] = [
    createExperimentExecutionTask({
      id: `playbook-prepare-${run.project.id}`,
      stage: decision === 'rework_hypothesis' ? 'produce' : 'prepare',
      group: '实验执行手册',
      title: decision === 'rework_hypothesis' ? '先重写创意假设与实验变量定义' : '整理本轮实验素材与变量定义',
      description: decision === 'rework_hypothesis'
        ? `围绕${experimentVariableTypeLabel(primaryVariableType)}重新写出一版更干净的 control / test。`
        : `把${experimentVariableTypeLabel(primaryVariableType)}的 control / test 素材、标题、脚本和 tracking code 整理齐。`,
      relatedMetric: metric,
      riskIfSkipped: '后续发布、回收和复盘会失去统一口径。',
      userFacingNote: decision === 'rework_hypothesis' ? '先改写，再开跑。' : '先把边界写清楚，再进入发布。',
    }),
    createExperimentExecutionTask({
      id: `playbook-launch-${run.project.id}`,
      stage: decision === 'stop_variant' ? 'archive' : 'launch',
      group: '实验执行手册',
      title: decision === 'small_rollout'
        ? '在受控切片内小范围发布'
        : decision === 'scale_candidate'
          ? '把候选胜出方案扩到更多切片'
          : decision === 'stop_variant'
            ? '停止当前变体并冻结重复发布'
            : '按 control / test 节奏同步发布',
      description: decision === 'stop_variant'
        ? '停止当前弱势方案，不再继续发同一变体。'
        : '发布时不要混入第二个主变量，也不要临时改 tracking 命名。',
      relatedMetric: metric,
      riskIfSkipped: decision === 'stop_variant' ? '会让已判定弱势的变体继续消耗注意力。' : '会让实验结果变脏，后续无法解释。',
      userFacingNote: decision === 'scale_candidate' ? '放大不是失控扩散，仍然要保留观察切片。' : '发布动作必须服从实验边界。',
    }),
    createExperimentExecutionTask({
      id: `playbook-monitor-${run.project.id}`,
      stage: 'monitor',
      group: '实验执行手册',
      title: '按节奏回收实验数据',
      description: `持续回收 ${metricLabel(metric)}、曝光、点击和必要备注，并保持 control / test 对照。`,
      relatedMetric: metric,
      riskIfSkipped: '可能会错过最佳判断时间，或者无法解释突发波动。',
      userFacingNote: '先保证数据连续，再谈结论升级。',
    }),
    createExperimentExecutionTask({
      id: `playbook-decide-${run.project.id}`,
      stage: decision === 'stop_variant' ? 'archive' : 'decide',
      group: '实验执行手册',
      title: '到检查点后执行放大 / 停止 / 重写判断',
      description: summary.whyThisDecision,
      relatedMetric: metric,
      riskIfSkipped: '会让实验停在半路，既没有形成学习，也没有明确停止。',
      userFacingNote: '所有判断都要回到样本、差异和停止条件。',
    }),
  ];

  let nextActionAfterResult = '把结果写回实验记忆，再决定下一轮路线。';
  if (decision === 'validate_more' || decision === 'do_not_decide') nextActionAfterResult = '补齐样本后，重新运行实验决策规则。';
  if (decision === 'small_rollout') nextActionAfterResult = '小范围放大后，如果主指标稳定，再考虑升级到放大候选。';
  if (decision === 'scale_candidate') nextActionAfterResult = '放大后继续高频复查，一旦回落就暂停并回到验证。';
  if (decision === 'stop_variant') nextActionAfterResult = '停止并归档当前弱势方案，然后切到新的变量假设。';
  if (decision === 'rework_hypothesis') nextActionAfterResult = '先重写创意，再用更干净的变量重新启动实验。';
  const cadencePlan = buildExperimentCadencePlan(run, policy, summary, sequence, now);

  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    currentDecision: decision,
    experimentObjective,
    primaryVariableType,
    requiredMaterials,
    productionTasks,
    trackingNamingReminders,
    launchChecklist,
    monitoringCadence: cadencePlan.monitoringCadence,
    decisionCheckpoint: cadencePlan.nextCheckpoint,
    stopCondition: summary.stopCondition,
    archiveRequirement: '把结论、样本门槛状态、下一步动作和是否可复用，写回实验记忆、优先队列和交付包。',
    nextActionAfterResult,
    summary: `当前主决策为“${experimentValidationDecisionLabel(decision)}”，围绕${experimentVariableTypeLabel(primaryVariableType)}执行。`,
  };
}

function workbenchStatusLabel(status: ExperimentWorkbenchStatus) {
  if (status === 'collecting_data') return '待补数据';
  if (status === 'validating') return '待验证实验';
  if (status === 'ready_to_rollout') return '可小范围放大';
  if (status === 'stop_required') return '应停止方案';
  return '待归档复盘';
}

function experimentArchiveStatusLabel(status: ExperimentArchiveStatus) {
  return status === 'archived' ? '已归档' : '未归档';
}

function deriveWorkbenchStatus(decision: ExperimentValidationDecision): ExperimentWorkbenchStatus {
  if (decision === 'validate_more' || decision === 'do_not_decide') return 'collecting_data';
  if (decision === 'stop_variant') return 'stop_required';
  if (decision === 'small_rollout' || decision === 'scale_candidate') return 'ready_to_rollout';
  if (decision === 'rework_hypothesis') return 'validating';
  return 'archive_ready';
}

function uniqueWorkbenchActions(actions: ExperimentWorkbenchAction[]) {
  const seen = new Set<string>();
  return actions.filter(action => {
    if (seen.has(action.id)) return false;
    seen.add(action.id);
    return true;
  });
}

function createWorkbenchAction(input: ExperimentWorkbenchAction): ExperimentWorkbenchAction {
  return input;
}

export function buildExperimentArchiveRecord(
  run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>,
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentArchiveRecord {
  const decisionSummary = run.experimentDecisionSummary || buildExperimentDecisionSummary(run, run.experimentValidationPolicy, now);
  const report = Array.isArray(run.experimentReports) && run.experimentReports.length > 0 ? run.experimentReports[0] : undefined;
  const memory = run.experimentMemorySummary || buildExperimentMemorySummary(run, now);
  const topLearning = memory.topReusableLearning || memory.topAvoidLearning || memory.topWatchlistLearning || report?.learningSummary || '本轮实验已完成本地复盘。';
  return {
    runId: run.id,
    archivedAt: run.updatedAt || now.toISOString(),
    currentDecision: decisionSummary.topDecision,
    confidenceLevel: report?.confidenceSummary.confidenceLevel || 'low',
    learningSummary: scrubDeliveryText(topLearning),
    nextAction: scrubDeliveryText(decisionSummary.canRollout[0] || decisionSummary.mustValidate[0] || decisionSummary.stopNow[0] || decisionSummary.summary),
    deliveryPackageAvailable: Boolean(run.deliveryPackage?.ready),
    archiveStatus: run.experimentArchiveRecord?.archiveStatus || 'active',
  };
}

export function buildListingFactoryRunHistoryItem(
  run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>,
  archiveRecord?: ExperimentArchiveRecord,
  now = new Date('2026-05-12T09:00:00Z'),
): ListingFactoryRunHistoryItem {
  const report = Array.isArray(run.experimentReports) && run.experimentReports.length > 0 ? run.experimentReports[0] : undefined;
  const decisionSummary = run.experimentDecisionSummary || buildExperimentDecisionSummary(run, run.experimentValidationPolicy, now);
  const checklist = run.experimentOperatorChecklist || buildExperimentOperatorChecklist(run, run.experimentValidationPolicy, decisionSummary, now);
  const memory = run.experimentMemorySummary || buildExperimentMemorySummary(run, now);
  return {
    runId: run.id,
    createdAt: run.updatedAt || now.toISOString(),
    merchantName: run.merchantContextCard?.productName || run.project.productName,
    brandName: run.merchantContextCard?.productName || run.project.productName,
    skuCount: 1,
    primaryProductName: run.project.productName,
    currentDecision: decisionSummary.topDecision,
    confidenceLevel: report?.confidenceSummary.confidenceLevel || 'low',
    topLearning: scrubDeliveryText(memory.topReusableLearning || memory.topAvoidLearning || memory.topWatchlistLearning || decisionSummary.summary),
    nextRecommendedAction: scrubDeliveryText(decisionSummary.canRollout[0] || decisionSummary.mustValidate[0] || decisionSummary.stopNow[0] || decisionSummary.summary),
    openChecklistCount: checklist.requiredCount,
    deliveryPackageAvailable: Boolean(run.deliveryPackage?.ready),
    archiveStatus: archiveRecord?.archiveStatus || 'active',
  };
}

export function buildListingFactoryRunHistorySummary(
  runs: Array<Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>>,
  archiveRecords: ExperimentArchiveRecord[] = [],
  now = new Date('2026-05-12T09:00:00Z'),
): ListingFactoryRunHistorySummary {
  const archiveMap = new Map(archiveRecords.map(record => [record.runId, record]));
  const items = runs
    .map(run => buildListingFactoryRunHistoryItem(run, archiveMap.get(run.id), now))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const activeRuns = items.filter(item => item.archiveStatus === 'active').length;
  const archivedRuns = items.filter(item => item.archiveStatus === 'archived').length;
  return {
    items,
    totalRuns: items.length,
    activeRuns,
    archivedRuns,
    latestRunId: items[0]?.runId,
    summary: items.length === 0
      ? '当前还没有本地运行记录。'
      : `最近共有 ${items.length} 条本地运行记录，其中 ${activeRuns} 条未归档，${archivedRuns} 条已归档。`,
  };
}

export function buildExperimentWorkbenchBoard(
  run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>,
  runHistorySummary?: ListingFactoryRunHistorySummary,
  archiveRecords: ExperimentArchiveRecord[] = [],
  now = new Date('2026-05-12T09:00:00Z'),
): ExperimentWorkbenchBoard {
  const decisionSummary = run.experimentDecisionSummary || buildExperimentDecisionSummary(run, run.experimentValidationPolicy, now);
  const report = Array.isArray(run.experimentReports) && run.experimentReports.length > 0 ? run.experimentReports[0] : undefined;
  const checklist = run.experimentOperatorChecklist || buildExperimentOperatorChecklist(run, run.experimentValidationPolicy, decisionSummary, now);
  const validationPolicy = run.experimentValidationPolicy || buildExperimentValidationPolicy(run, report?.confidenceSummary, run.experimentMemorySummary, run.experimentPriorityQueue, run.experimentLearningGapMap, run.experimentSequencingPlan, run.merchantContextCard, now);
  const history = runHistorySummary || buildListingFactoryRunHistorySummary([run], archiveRecords, now);
  const confidenceLevel = report?.confidenceSummary.confidenceLevel || 'low';
  const nextCheckMetric = validationPolicy.rules[0]?.nextCheckMetric;
  const status = deriveWorkbenchStatus(decisionSummary.topDecision);
  const actions: ExperimentWorkbenchAction[] = [];

  if (decisionSummary.topDecision === 'validate_more' || decisionSummary.topDecision === 'do_not_decide') {
    actions.push(createWorkbenchAction({
      id: `workbench-data-${run.id}`,
      runId: run.id,
      status: 'collecting_data',
      title: '待补数据',
      description: decisionSummary.mustValidate[0] || decisionSummary.noDecisionYet[0] || decisionSummary.summary,
      priority: 'p0',
      currentDecision: decisionSummary.topDecision,
      confidenceLevel,
      nextCheckMetric,
      openChecklistCount: checklist.requiredCount,
    }));
  }
  if (decisionSummary.topDecision === 'rework_hypothesis') {
    actions.push(createWorkbenchAction({
      id: `workbench-validate-${run.id}`,
      runId: run.id,
      status: 'validating',
      title: '待验证实验',
      description: decisionSummary.mustValidate[0] || decisionSummary.summary,
      priority: 'p0',
      currentDecision: decisionSummary.topDecision,
      confidenceLevel,
      nextCheckMetric,
      openChecklistCount: checklist.requiredCount,
    }));
  }
  if (decisionSummary.topDecision === 'small_rollout' || decisionSummary.topDecision === 'scale_candidate') {
    actions.push(createWorkbenchAction({
      id: `workbench-rollout-${run.id}`,
      runId: run.id,
      status: 'ready_to_rollout',
      title: '可放大但需监控',
      description: decisionSummary.canRollout[0] || decisionSummary.summary,
      priority: 'p0',
      currentDecision: decisionSummary.topDecision,
      confidenceLevel,
      nextCheckMetric,
      openChecklistCount: checklist.requiredCount,
    }));
  }
  if (decisionSummary.topDecision === 'stop_variant') {
    actions.push(createWorkbenchAction({
      id: `workbench-stop-${run.id}`,
      runId: run.id,
      status: 'stop_required',
      title: '应停止方案',
      description: decisionSummary.stopNow[0] || decisionSummary.summary,
      priority: 'p0',
      currentDecision: decisionSummary.topDecision,
      confidenceLevel,
      nextCheckMetric,
      openChecklistCount: checklist.requiredCount,
    }));
  }
  actions.push(createWorkbenchAction({
    id: `workbench-archive-${run.id}`,
    runId: run.id,
    status: 'archive_ready',
    title: '待归档复盘',
    description: checklist.summary,
    priority: actions.length === 0 ? 'p0' : 'p1',
    currentDecision: decisionSummary.topDecision,
    confidenceLevel,
    nextCheckMetric,
    openChecklistCount: checklist.requiredCount,
  }));

  const nextActionQueue = uniqueWorkbenchActions(actions).sort((left, right) => left.priority.localeCompare(right.priority) || left.title.localeCompare(right.title));
  const highestPriorityAction = nextActionQueue[0];
  return {
    projectId: run.project.id,
    generatedAt: run.updatedAt || now.toISOString(),
    currentStatus: status,
    highestPriorityAction,
    nextActionQueue,
    pendingDataActions: nextActionQueue.filter(action => action.status === 'collecting_data'),
    validationActions: nextActionQueue.filter(action => action.status === 'validating'),
    rolloutActions: nextActionQueue.filter(action => action.status === 'ready_to_rollout'),
    stopActions: nextActionQueue.filter(action => action.status === 'stop_required'),
    archiveActions: nextActionQueue.filter(action => action.status === 'archive_ready'),
    recentRuns: history.items.slice(0, 3),
    summary: `${workbenchStatusLabel(status)}：${highestPriorityAction?.description || '当前还没有待处理动作。'}`,
  };
}

function normalizeLearningSearchText(value?: string) {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function crossRunConclusionFromDecision(decision: ExperimentValidationDecision): ExperimentConfidenceConclusion {
  if (decision === 'scale_candidate' || decision === 'small_rollout') return 'candidate_winner';
  if (decision === 'stop_variant') return 'candidate_loser';
  if (decision === 'rework_hypothesis') return 'inconclusive';
  return 'needs_more_data';
}

function crossRunVariableFromText(text: string): ExperimentMemoryVariableType {
  const normalized = normalizeLearningSearchText(text);
  if (normalized.includes('audience') || normalized.includes('人群')) return 'audience';
  if (normalized.includes('cta') || normalized.includes('行动')) return 'cta';
  if (normalized.includes('asset') || normalized.includes('素材')) return 'asset';
  if (normalized.includes('price') || normalized.includes('价格')) return 'price_message';
  if (normalized.includes('format') || normalized.includes('形式')) return 'format';
  if (normalized.includes('offer') || normalized.includes('利益')) return 'offer';
  if (normalized.includes('angle') || normalized.includes('角度')) return 'angle';
  return 'hook';
}

function uniqueCrossRunRecords(records: CrossRunLearningRecord[]) {
  const seen = new Set<string>();
  return records.filter(record => {
    const key = [record.runId, record.sourceType, record.variableType, record.hypothesis, record.reusableLearning].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function crossRunRecordSort(left: CrossRunLearningRecord, right: CrossRunLearningRecord) {
  return right.createdAt.localeCompare(left.createdAt) || left.variableType.localeCompare(right.variableType);
}

export function buildCrossRunLearningRecords(
  run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>,
  runHistorySummary?: ListingFactoryRunHistorySummary,
  archiveRecords: ExperimentArchiveRecord[] = [],
  now = new Date('2026-05-12T09:00:00Z'),
): CrossRunLearningRecord[] {
  const history = runHistorySummary || run.runHistorySummary || buildListingFactoryRunHistorySummary([run], archiveRecords, now);
  const decisionSummary = run.experimentDecisionSummary || buildExperimentDecisionSummary(run, run.experimentValidationPolicy, now);
  const report = Array.isArray(run.experimentReports) && run.experimentReports.length > 0 ? run.experimentReports[0] : undefined;
  const base = {
    runId: run.id,
    createdAt: run.updatedAt || now.toISOString(),
    merchantName: run.merchantContextCard?.productName || run.project.productName,
    brandName: run.merchantContextCard?.productName || run.project.productName,
    primaryProductName: run.project.productName,
    decision: decisionSummary.topDecision,
  };
  const records: CrossRunLearningRecord[] = [];

  for (const entry of run.experimentMemorySummary?.entries || []) {
    records.push({
      ...base,
      variableType: entry.testedVariableType,
      hypothesis: entry.testedHypothesis,
      conclusion: entry.conclusion,
      confidenceLevel: entry.confidenceLevel,
      relativeLift: entry.relativeLift,
      reusableLearning: scrubDeliveryText(entry.reusableLearning),
      riskNote: scrubDeliveryText(entry.avoidRepeatingReason || '继续避免重复测试同一个变量。'),
      nextRecommendedAction: scrubDeliveryText(decisionSummary.canRollout[0] || decisionSummary.mustValidate[0] || decisionSummary.summary),
      sourceType: 'memory',
    });
  }

  for (const cell of report?.cellConfidence || []) {
    const plan = (run.experimentPlans || []).find(item => item.id === report?.experimentId);
    const experimentCell = plan?.experimentCells.find(item => item.id === cell.cellId);
    records.push({
      ...base,
      variableType: experimentCell ? experimentMemoryVariableType(experimentCell.variableType) : 'hook',
      hypothesis: scrubDeliveryText(plan?.hypothesis || '本轮实验置信度复盘'),
      conclusion: cell.conclusion,
      confidenceLevel: cell.confidenceLevel,
      relativeLift: cell.relativeLift,
      reusableLearning: scrubDeliveryText(cell.explanation || report?.learningSummary || '本轮实验已形成置信度记录。'),
      riskNote: scrubDeliveryText(cell.sampleGuardrail),
      nextRecommendedAction: scrubDeliveryText(report?.nextAction || decisionSummary.summary),
      sourceType: 'confidence',
    });
  }

  for (const gap of run.experimentLearningGapMap?.gaps || []) {
    if (gap.status === 'unknown') continue;
    records.push({
      ...base,
      variableType: gap.variableType,
      hypothesis: scrubDeliveryText(gap.unresolvedQuestion),
      conclusion: gap.status === 'learned' ? 'candidate_winner' : gap.status === 'avoid_or_rework' ? 'candidate_loser' : gap.status === 'directional' ? 'directional_signal' : 'inconclusive',
      confidenceLevel: gap.status === 'learned' ? 'moderate' : gap.status === 'directional' ? 'directional' : 'low',
      reusableLearning: scrubDeliveryText(gap.strongestLearning || gap.recommendedNextMove),
      riskNote: scrubDeliveryText(gap.riskNote),
      nextRecommendedAction: scrubDeliveryText(gap.recommendedNextMove),
      sourceType: 'gap_map',
    });
  }

  records.push({
    ...base,
    variableType: crossRunVariableFromText(decisionSummary.summary),
    hypothesis: scrubDeliveryText(decisionSummary.summary),
    conclusion: crossRunConclusionFromDecision(decisionSummary.topDecision),
    confidenceLevel: report?.confidenceSummary.confidenceLevel || 'low',
    reusableLearning: scrubDeliveryText(decisionSummary.whyThisDecision || decisionSummary.summary),
    riskNote: scrubDeliveryText(decisionSummary.stopCondition),
    nextRecommendedAction: scrubDeliveryText(decisionSummary.canRollout[0] || decisionSummary.mustValidate[0] || decisionSummary.stopNow[0] || decisionSummary.summary),
    sourceType: 'decision',
  });

  for (const archive of archiveRecords) {
    const historyItem = history.items.find(item => item.runId === archive.runId);
    records.push({
      runId: archive.runId,
      createdAt: archive.archivedAt,
      merchantName: historyItem?.merchantName || base.merchantName,
      brandName: historyItem?.brandName || base.brandName,
      primaryProductName: historyItem?.primaryProductName || base.primaryProductName,
      variableType: crossRunVariableFromText(`${archive.learningSummary} ${archive.nextAction}`),
      hypothesis: scrubDeliveryText(archive.learningSummary),
      conclusion: crossRunConclusionFromDecision(archive.currentDecision),
      confidenceLevel: archive.confidenceLevel,
      decision: archive.currentDecision,
      reusableLearning: scrubDeliveryText(archive.learningSummary),
      riskNote: archive.archiveStatus === 'archived' ? '已归档为本地学习记录。' : '仍需完成本地复盘归档。',
      nextRecommendedAction: scrubDeliveryText(archive.nextAction),
      sourceType: 'archive',
    });
  }

  if (records.length === 0) {
    for (const item of history.items) {
      records.push({
        runId: item.runId,
        createdAt: item.createdAt,
        merchantName: item.merchantName,
        brandName: item.brandName,
        primaryProductName: item.primaryProductName,
        variableType: crossRunVariableFromText(`${item.topLearning} ${item.nextRecommendedAction}`),
        hypothesis: scrubDeliveryText(item.topLearning),
        conclusion: crossRunConclusionFromDecision(item.currentDecision),
        confidenceLevel: item.confidenceLevel,
        decision: item.currentDecision,
        reusableLearning: scrubDeliveryText(item.topLearning),
        riskNote: item.archiveStatus === 'archived' ? '已归档。' : '尚未完成归档复盘。',
        nextRecommendedAction: scrubDeliveryText(item.nextRecommendedAction),
        sourceType: 'archive',
      });
    }
  }

  return uniqueCrossRunRecords(records).sort(crossRunRecordSort);
}

export function buildCrossRunVariableSummary(records: CrossRunLearningRecord[]): CrossRunVariableSummary[] {
  return CROSS_RUN_VARIABLE_TYPES.map(variableType => {
    const bucket = records.filter(record => record.variableType === variableType);
    const learned = bucket.filter(record => record.conclusion === 'candidate_winner' || record.decision === 'scale_candidate' || record.decision === 'small_rollout');
    const directional = bucket.filter(record => record.conclusion === 'directional_signal');
    const inconclusive = bucket.filter(record => record.conclusion === 'inconclusive' || record.conclusion === 'needs_more_data' || record.decision === 'do_not_decide' || record.decision === 'rework_hypothesis');
    const stopped = bucket.filter(record => record.conclusion === 'candidate_loser' || record.decision === 'stop_variant');
    const strongest = [...bucket].sort((left, right) => (right.relativeLift || 0) - (left.relativeLift || 0))[0] || learned[0] || directional[0] || bucket[0];
    const repeatedPattern = bucket.length > 1
      ? `${experimentVariableTypeLabel(variableType)} 已出现 ${bucket.length} 条学习记录，需要避免重复验证同一角度。`
      : bucket.length === 1
        ? `${experimentVariableTypeLabel(variableType)} 已有 1 条学习记录。`
        : `${experimentVariableTypeLabel(variableType)} 还没有跨运行学习记录。`;
    return {
      variableType,
      totalTests: bucket.length,
      learnedCount: learned.length,
      directionalCount: directional.length,
      inconclusiveCount: inconclusive.length,
      stoppedCount: stopped.length,
      strongestLearning: scrubDeliveryText(strongest?.reusableLearning || `暂未沉淀 ${experimentVariableTypeLabel(variableType)} 的胜出学习。`),
      repeatedPattern,
      unresolvedQuestion: bucket.length === 0
        ? `还不知道 ${experimentVariableTypeLabel(variableType)} 对当前商家的影响。`
        : scrubDeliveryText(inconclusive[0]?.hypothesis || directional[0]?.hypothesis || `下一轮需要验证 ${experimentVariableTypeLabel(variableType)} 是否稳定。`),
      nextBestMove: stopped[0]
        ? scrubDeliveryText(stopped[0].nextRecommendedAction)
        : directional[0]
          ? `把 ${experimentVariableTypeLabel(variableType)} 的方向性信号做成验证实验。`
          : bucket.length === 0
            ? `补一轮干净的 ${experimentVariableTypeLabel(variableType)} 单变量实验。`
            : scrubDeliveryText(strongest?.nextRecommendedAction || `继续沉淀 ${experimentVariableTypeLabel(variableType)} 学习。`),
    };
  });
}

function matchesLearningFilter(record: CrossRunLearningRecord, filter: LearningSearchFilter, now = new Date('2026-05-12T09:00:00Z')) {
  if (filter.variableType && record.variableType !== filter.variableType) return false;
  if (filter.conclusion && record.conclusion !== filter.conclusion) return false;
  if (filter.confidenceLevel && record.confidenceLevel !== filter.confidenceLevel) return false;
  if (filter.decision && record.decision !== filter.decision) return false;
  if (filter.productName && !normalizeLearningSearchText(record.primaryProductName).includes(normalizeLearningSearchText(filter.productName))) return false;
  if (filter.keyword) {
    const haystack = normalizeLearningSearchText([record.hypothesis, record.reusableLearning, record.primaryProductName, record.riskNote, record.nextRecommendedAction].join(' '));
    if (!haystack.includes(normalizeLearningSearchText(filter.keyword))) return false;
  }
  if (filter.timeRange && filter.timeRange !== 'all') {
    const days = filter.timeRange === 'last_7_days' ? 7 : filter.timeRange === 'last_30_days' ? 30 : 90;
    const created = new Date(record.createdAt).getTime();
    const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
    if (Number.isFinite(created) && created < cutoff) return false;
  }
  return true;
}

export function searchMerchantLearningArchive(records: CrossRunLearningRecord[], filter: LearningSearchFilter = {}, now = new Date('2026-05-12T09:00:00Z')): LearningSearchResult {
  const matches = records.filter(record => matchesLearningFilter(record, filter, now)).sort(crossRunRecordSort);
  return {
    filter,
    records: matches,
    totalMatches: matches.length,
    topLearning: matches[0]?.reusableLearning || '当前检索条件下还没有匹配的本地学习记录。',
    summary: matches.length > 0 ? `找到 ${matches.length} 条本地增长学习记录。` : '没有找到匹配的本地增长学习记录。',
  };
}

export function buildLearningTimeline(records: CrossRunLearningRecord[]): LearningTimelineItem[] {
  return records
    .map(record => ({
      date: record.createdAt,
      runId: record.runId,
      title: `${record.primaryProductName} / ${experimentVariableTypeLabel(record.variableType)}`,
      keyLearning: scrubDeliveryText(record.reusableLearning),
      decision: record.decision,
      confidenceLevel: record.confidenceLevel,
      nextAction: scrubDeliveryText(record.nextRecommendedAction),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function buildCrossRunComparisonResult(
  run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>,
  runHistorySummary?: ListingFactoryRunHistorySummary,
  archiveRecords: ExperimentArchiveRecord[] = [],
  now = new Date('2026-05-12T09:00:00Z'),
): CrossRunComparisonResult {
  const records = buildCrossRunLearningRecords(run, runHistorySummary, archiveRecords, now);
  const variableSummaries = buildCrossRunVariableSummary(records);
  const strongestSummary = variableSummaries.find(item => item.learnedCount > 0)?.strongestLearning || records[0]?.reusableLearning || '还没有可复用的跨运行学习。';
  const unresolved = variableSummaries.find(item => item.totalTests === 0)?.unresolvedQuestion || variableSummaries.find(item => item.inconclusiveCount > 0)?.unresolvedQuestion || '当前没有明显未解变量。';
  const nextMove = variableSummaries.find(item => item.totalTests === 0)?.nextBestMove || variableSummaries.find(item => item.directionalCount > 0)?.nextBestMove || records[0]?.nextRecommendedAction || '继续完成下一轮本地实验并归档。';
  return {
    generatedAt: run.updatedAt || now.toISOString(),
    records,
    variableSummaries,
    strongestReusableLearning: scrubDeliveryText(strongestSummary),
    unresolvedQuestion: scrubDeliveryText(unresolved),
    nextBestMove: scrubDeliveryText(nextMove),
    summary: `跨运行学习档案当前包含 ${records.length} 条记录，覆盖 ${variableSummaries.filter(item => item.totalTests > 0).length} 类变量。`,
  };
}

export function buildCrossRunComparisonMarkdown(comparison?: CrossRunComparisonResult) {
  if (!comparison) return '# 跨运行学习对比\n\n当前还没有跨运行学习记录。';
  return scrubDeliveryText([
    '# 跨运行学习对比',
    '',
    comparison.summary,
    '',
    `- 最强可复用学习：${comparison.strongestReusableLearning}`,
    `- 未解问题：${comparison.unresolvedQuestion}`,
    `- 下一步最佳动作：${comparison.nextBestMove}`,
    '',
    '## 变量学习沉淀',
    ...comparison.variableSummaries.map(item => `- ${experimentVariableTypeLabel(item.variableType)}：测试 ${item.totalTests} 次，已学到 ${item.learnedCount}，方向性 ${item.directionalCount}，结论不充分 ${item.inconclusiveCount}，已停止 ${item.stoppedCount}。下一步：${item.nextBestMove}`),
    '',
    '## Top 学习记录',
    ...(comparison.records.length > 0
      ? comparison.records.slice(0, 5).map(record => `- ${record.primaryProductName} / ${experimentVariableTypeLabel(record.variableType)} / ${experimentConfidenceLevelLabel(record.confidenceLevel)}：${record.reusableLearning}`)
      : ['- 当前还没有可展示的学习记录。']),
  ].join('\n'));
}

export function buildMerchantLearningArchive(
  run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>,
  runHistorySummary?: ListingFactoryRunHistorySummary,
  archiveRecords: ExperimentArchiveRecord[] = [],
  now = new Date('2026-05-12T09:00:00Z'),
): MerchantLearningArchive {
  const comparison = buildCrossRunComparisonResult(run, runHistorySummary, archiveRecords, now);
  const timeline = buildLearningTimeline(comparison.records);
  const defaultSearchResult = searchMerchantLearningArchive(comparison.records, {}, now);
  const reusableMerchantLearningSummary = [comparison.strongestReusableLearning, comparison.nextBestMove].filter(Boolean).join(' ');
  const archive: Omit<MerchantLearningArchive, 'markdown'> = {
    generatedAt: comparison.generatedAt,
    comparison,
    searchIndex: comparison.records,
    defaultSearchResult,
    timeline,
    reusableMerchantLearningSummary: scrubDeliveryText(reusableMerchantLearningSummary || '当前商家还没有足够跨运行学习。'),
    strongestReusableLearning: comparison.strongestReusableLearning,
    unresolvedQuestion: comparison.unresolvedQuestion,
    nextBestMove: comparison.nextBestMove,
  };
  return {
    ...archive,
    markdown: buildMerchantLearningArchiveMarkdown(archive),
  };
}

export function buildMerchantLearningArchiveMarkdown(archive?: Omit<MerchantLearningArchive, 'markdown'> | MerchantLearningArchive) {
  if (!archive) return '# 商家增长学习档案\n\n当前还没有商家增长学习档案。';
  return scrubDeliveryText([
    '# 商家增长学习档案',
    '',
    `- 可复用商家学习摘要：${archive.reusableMerchantLearningSummary}`,
    `- 最强可复用学习：${archive.strongestReusableLearning}`,
    `- 未解问题：${archive.unresolvedQuestion}`,
    `- 下一步最佳动作：${archive.nextBestMove}`,
    '',
    '## 增长学习检索',
    archive.defaultSearchResult.summary,
    ...archive.defaultSearchResult.records.slice(0, 5).map(record => `- ${record.primaryProductName} / ${experimentVariableTypeLabel(record.variableType)}：${record.reusableLearning}`),
    '',
    '## 学习时间线',
    ...(archive.timeline.length > 0
      ? archive.timeline.slice(-5).map(item => `- ${item.date} / ${item.title} / ${experimentValidationDecisionLabel(item.decision)}：${item.keyLearning}；下一步：${item.nextAction}`)
      : ['- 当前还没有学习时间线。']),
    '',
    '## 变量学习沉淀',
    ...archive.comparison.variableSummaries.map(item => `- ${experimentVariableTypeLabel(item.variableType)}：${item.strongestLearning}；未解问题：${item.unresolvedQuestion}`),
  ].join('\n'));
}

function traceNodeId(type: ContentTraceSourceType, id?: string, fallback = 'missing') {
  return `trace-${type}-${slugify(id || fallback)}`;
}

function traceEdge(fromNodeId: string, toNodeId: string, relation: string, confidence: ContentTraceEdge['confidence'], note: string): ContentTraceEdge {
  return {
    id: `edge-${slugify(fromNodeId)}-${slugify(toNodeId)}-${slugify(relation)}`,
    fromNodeId,
    toNodeId,
    relation,
    confidence,
    note,
  };
}

function traceEvidenceStrength(confidenceLevel: ExperimentConfidenceLevel, conclusion: ExperimentConfidenceConclusion, sampleSufficient: boolean): ExperimentEvidenceStrength {
  if (confidenceLevel === 'strong' && sampleSufficient && conclusion === 'candidate_winner') return 'strong';
  if ((confidenceLevel === 'moderate' || confidenceLevel === 'strong') && sampleSufficient) return 'usable';
  if (confidenceLevel === 'directional' || conclusion === 'directional_signal') return 'directional';
  return 'weak';
}

export function buildContentTraceNodes(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): ContentTraceNode[] {
  const createdAt = run.updatedAt;
  const base = {
    runId: run.id,
    createdAt,
    relatedSkuId: run.project.id,
    productName: run.project.productName,
  };
  const nodes: ContentTraceNode[] = [];

  for (const brief of run.briefs || []) {
    nodes.push({
      ...base,
      id: traceNodeId('brief', brief.id),
      type: 'brief',
      title: brief.hook || '未命名 Brief',
      summary: scrubDeliveryText(`${brief.platform} / ${brief.contentType} / ${brief.cta}`),
      sourceRef: brief.id,
    });
  }
  for (const script of run.scripts || []) {
    nodes.push({
      ...base,
      id: traceNodeId('script', script.id),
      type: 'script',
      title: script.title,
      summary: scrubDeliveryText(`${script.platform} / ${script.duration} / ${script.openingHook}`),
      sourceRef: script.id,
    });
  }
  for (const storyboard of run.storyboards || []) {
    nodes.push({
      ...base,
      id: traceNodeId('storyboard', storyboard.scriptId),
      type: 'storyboard',
      title: `分镜 ${storyboard.scriptId}`,
      summary: scrubDeliveryText(`共 ${storyboard.shots.length} 个镜头，素材需求 ${unique(storyboard.shots.flatMap(shot => shot.requiredAssets)).join(' / ') || '未完全关联'}`),
      sourceRef: storyboard.scriptId,
    });
  }
  for (const asset of run.assets || []) {
    nodes.push({
      ...base,
      id: traceNodeId('asset', asset.id),
      type: 'asset',
      title: asset.name || asset.fileName,
      summary: scrubDeliveryText(`${asset.type} / ${asset.source} / ${asset.tags.map(tag => tag.label).join(' / ') || '未完全关联'}`),
      sourceRef: asset.id,
    });
  }
  for (const item of (run.productionBatches || []).flatMap(batch => batch.batchItems)) {
    nodes.push({
      ...base,
      id: traceNodeId('batch_variant', item.id),
      type: 'batch_variant',
      title: item.title,
      summary: scrubDeliveryText(`${item.platform} / ${item.contentType} / ${item.hook}`),
      sourceRef: item.id,
    });
  }
  for (const cell of (run.experimentPlans || []).flatMap(plan => plan.experimentCells)) {
    nodes.push({
      ...base,
      id: traceNodeId('experiment_cell', cell.id),
      type: 'experiment_cell',
      title: cell.name,
      summary: scrubDeliveryText(`${cell.controlValue} → ${cell.testValue}`),
      variableType: experimentMemoryVariableType(cell.variableType),
      sourceRef: cell.id,
    });
  }
  for (const window of buildExperimentMetricWindows(run)) {
    nodes.push({
      ...base,
      id: traceNodeId('metric_window', window.metricWindowId),
      type: 'metric_window',
      title: `指标窗口 ${window.experimentCellId}`,
      summary: scrubDeliveryText(`${metricLabel(window.metricName)} / 展现 ${window.impressions} / 点击 ${window.clicks} / CTR ${window.recalculatedCtr ?? 0}`),
      sourceRef: window.metricWindowId,
    });
  }
  const decision = run.experimentDecisionSummary;
  if (decision) {
    nodes.push({
      ...base,
      id: traceNodeId('decision', `${run.id}-${decision.topDecision}`),
      type: 'decision',
      title: experimentValidationDecisionLabel(decision.topDecision),
      summary: scrubDeliveryText(decision.whyThisDecision || decision.summary),
      sourceRef: decision.topDecision,
    });
  }
  for (const record of run.merchantLearningArchive?.searchIndex || buildCrossRunLearningRecords(run)) {
    nodes.push({
      ...base,
      id: traceNodeId('learning', `${record.runId}-${record.sourceType}-${record.variableType}-${record.createdAt}`),
      type: 'learning',
      title: `${experimentVariableTypeLabel(record.variableType)} 学习记录`,
      summary: scrubDeliveryText(record.reusableLearning),
      variableType: record.variableType,
      sourceRef: `${record.runId}:${record.sourceType}`,
    });
  }

  return uniqueBy(nodes, node => node.id);
}

export function buildExperimentMetricWindows(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): ExperimentMetricWindow[] {
  const records = (run.performanceRecords || []).map(calculatePerformanceMetrics);
  const windows: ExperimentMetricWindow[] = [];
  for (const plan of run.experimentPlans || []) {
    const metricName = plan.successMetrics.find(metric => metric.priority === 'primary')?.name || 'ctr';
    const report = (run.experimentReports || []).find(item => item.experimentId === plan.id);
    for (const cell of plan.experimentCells) {
      const cellRecords = records.filter(record => record.experimentId === plan.id && record.cellId === cell.id);
      const fallback = cellRecords[0] || records.find(record => cell.assignedBriefIds.includes(record.briefId || '') || cell.assignedBatchItemIds.includes(record.batchItemId || ''));
      const sourceRecords = cellRecords.length > 0 ? cellRecords : fallback ? [fallback] : [];
      const impressions = sum(sourceRecords.map(record => record.impressions));
      const clicks = sum(sourceRecords.map(record => record.clicks));
      const views = sum(sourceRecords.map(record => record.views));
      const revenue = sum(sourceRecords.map(record => record.revenue || 0));
      const cost = sum(sourceRecords.map(record => record.cost || 0));
      const orders = sum(sourceRecords.map(record => Math.round((record.conversionRate || 0) * record.clicks)));
      const confidence = report?.cellConfidence.find(item => item.cellId === cell.id);
      windows.push({
        metricWindowId: `metric-window-${plan.id}-${cell.id}`,
        experimentCellId: cell.id,
        metricName,
        impressions,
        clicks,
        orders,
        revenue: revenue || undefined,
        cost: cost || undefined,
        recalculatedCtr: impressions > 0 ? roundMetric(clicks / impressions) : 0,
        engagementRate: views > 0 ? roundMetric(sum(sourceRecords.map(record => record.likes + record.comments + record.saves + record.shares)) / views) : 0,
        roas: cost > 0 ? roundMetric(revenue / cost) : undefined,
        sampleSufficient: Boolean(confidence?.sampleSufficient),
        confidenceLevel: confidence?.confidenceLevel || 'low',
        windowNote: sourceRecords.length > 0 ? '来自本地手动或 CSV 表现记录，指标已按原始记录重新计算。' : '未完全关联：当前没有该实验单元的本地表现记录。',
      });
    }
  }
  return windows;
}

export function buildAssetLineageRecords(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): AssetLineageRecord[] {
  const batchItems = (run.productionBatches || []).flatMap(batch => batch.batchItems);
  const allCells = (run.experimentPlans || []).flatMap(plan => plan.experimentCells);
  const records: AssetLineageRecord[] = [];
  const assets = run.assets && run.assets.length > 0
    ? run.assets
    : [{ id: `unlinked-asset-${run.project.id}`, type: 'reference' as const, name: '未完全关联的素材', fileName: 'unlinked', riskNotes: ['未完全关联'], tags: [], projectId: run.project.id, source: 'manual_entry' as const, mimeType: '', sizeLabel: '', durationLabel: '', category: run.project.category, platformFit: run.project.targetPlatforms, usableForShots: [], createdAt: run.updatedAt || new Date('2026-05-12T09:00:00Z').toISOString() }];

  for (const asset of assets) {
    const matches = (run.shotAssetMatches || []).filter(match => match.assetIds.includes(asset.id));
    const storyboard = (run.storyboards || []).find(item => item.shots.some(shot => matches.some(match => match.shotId === shot.id)));
    const script = storyboard ? (run.scripts || []).find(item => item.id === storyboard.scriptId) : undefined;
    const relatedBatchItems = batchItems.filter(item => item.assignedAssets.includes(asset.id) || item.scriptId === script?.id || item.storyboardId === storyboard?.scriptId);
    const usedCells = allCells.filter(cell => relatedBatchItems.some(item => cell.assignedBatchItemIds.includes(item.id) || cell.assignedBriefIds.includes(item.briefId)));
    const firstCell = usedCells[0];
    const relatedVariableType = firstCell ? experimentMemoryVariableType(firstCell.variableType) : undefined;
    records.push({
      assetId: asset.id || `asset-fallback-${slugify(asset.fileName || asset.name)}`,
      assetType: asset.type || 'unknown',
      sourceScriptId: script?.id,
      sourceStoryboardId: storyboard?.scriptId,
      sourceVariantId: relatedBatchItems[0]?.variantId,
      usedInExperimentCellIds: usedCells.map(cell => cell.id),
      relatedVariableType,
      relatedHook: firstCell?.testValue || relatedBatchItems[0]?.hook,
      relatedAngle: relatedVariableType === 'angle' ? firstCell?.testValue : undefined,
      relatedOffer: relatedVariableType === 'offer' ? firstCell?.testValue : undefined,
      relatedCta: relatedVariableType === 'cta' ? firstCell?.testValue : undefined,
      performanceSignal: usedCells.length > 0 ? '已关联到实验单元，可作为来源记录查看。' : '未完全关联：尚未连接到实验单元。',
      reusableNote: scrubDeliveryText(firstCell?.expectedLearning || relatedBatchItems[0]?.productionNote || '作为本地素材来源记录保留。'),
      riskNote: scrubDeliveryText(asset.riskNotes.join(' / ') || (usedCells.length > 0 ? '需要人工复核素材版权和平台规则。' : '未完全关联，不能用于因果判断。')),
    });
  }
  return records;
}

export function buildExperimentEvidenceTraces(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): ExperimentEvidenceTrace[] {
  const decision = run.experimentDecisionSummary || buildExperimentDecisionSummary(run, run.experimentValidationPolicy);
  return (run.experimentReports || []).flatMap(report => {
    const plan = (run.experimentPlans || []).find(item => item.id === report.experimentId);
    return report.cellConfidence.map(confidence => {
      const delta = report.metricDeltas.find(item => item.cellId === confidence.cellId);
      const cell = plan?.experimentCells.find(item => item.id === confidence.cellId);
      return {
        experimentId: report.experimentId,
        planId: plan?.id || report.experimentId,
        hypothesis: scrubDeliveryText(plan?.hypothesis || '本地实验复盘'),
        controlCellId: cell?.id || confidence.cellId,
        testCellId: confidence.cellId,
        comparedMetric: confidence.metric,
        relativeLift: delta?.relativeLift ?? confidence.relativeLift,
        confidenceLevel: confidence.confidenceLevel,
        conclusion: confidence.conclusion,
        decision: decision.topDecision,
        evidenceStrength: traceEvidenceStrength(confidence.confidenceLevel, confidence.conclusion, confidence.sampleSufficient),
        evidenceLimitations: [
          confidence.sampleSufficient ? '样本门槛已记录，但仍只代表本地回收数据。' : '样本不足，只能作为方向性或待补数据来源。',
          '这是可追溯证据链，只能作为关联证据，不能当作因果归因结论或真实平台归因。',
        ],
      } satisfies ExperimentEvidenceTrace;
    });
  });
}

export function buildLearningEvidenceLinks(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): LearningEvidenceLink[] {
  const records = run.merchantLearningArchive?.searchIndex || buildCrossRunLearningRecords(run);
  const traces = buildExperimentEvidenceTraces(run);
  const lineage = buildAssetLineageRecords(run);
  const metricWindows = buildExperimentMetricWindows(run);
  return records.map((record, index) => {
    const trace = traces.find(item => item.experimentId === record.runId || item.conclusion === record.conclusion) || traces[0];
    const sourceCellIds = unique([trace?.controlCellId, trace?.testCellId].filter((id): id is string => Boolean(id)));
    const sourceAssetIds = lineage.filter(item => item.usedInExperimentCellIds.some(cellId => sourceCellIds.includes(cellId))).map(item => item.assetId);
    const sourceMetricWindowIds = metricWindows.filter(window => sourceCellIds.includes(window.experimentCellId)).map(window => window.metricWindowId);
    return {
      learningRecordId: `learning-link-${record.runId}-${record.sourceType}-${index + 1}`,
      sourceExperimentId: trace?.experimentId || record.runId,
      sourceCellIds,
      sourceAssetIds,
      sourceMetricWindowIds,
      learningStatement: scrubDeliveryText(record.reusableLearning),
      whatThisSupports: '支持商家回看这条学习来自哪些本地内容、实验单元和指标窗口。',
      whatThisDoesNotProve: '目前还不能当作因果归因结论，也不能把转化变化归因到某个单一素材。',
    };
  });
}

export function buildContentTraceEdges(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): ContentTraceEdge[] {
  const edges: ContentTraceEdge[] = [];
  const scripts = run.scripts || [];
  const storyboards = run.storyboards || [];
  const batchItems = (run.productionBatches || []).flatMap(batch => batch.batchItems);
  const metricWindows = buildExperimentMetricWindows(run);
  const learningLinks = buildLearningEvidenceLinks(run);
  const decisionNodeId = run.experimentDecisionSummary ? traceNodeId('decision', `${run.id}-${run.experimentDecisionSummary.topDecision}`) : undefined;

  for (const script of scripts) {
    edges.push(traceEdge(traceNodeId('brief', script.briefId), traceNodeId('script', script.id), 'brief_to_script', 'direct', 'Brief 生成脚本。'));
  }
  for (const storyboard of storyboards) {
    edges.push(traceEdge(traceNodeId('script', storyboard.scriptId), traceNodeId('storyboard', storyboard.scriptId), 'script_to_storyboard', 'direct', '脚本生成分镜。'));
    for (const match of run.shotAssetMatches || []) {
      if (storyboard.shots.some(shot => shot.id === match.shotId)) {
        for (const assetId of match.assetIds) {
          edges.push(traceEdge(traceNodeId('storyboard', storyboard.scriptId), traceNodeId('asset', assetId), 'storyboard_to_asset', 'inferred', '分镜镜头与素材匹配。'));
        }
      }
    }
  }
  for (const item of batchItems) {
    edges.push(traceEdge(traceNodeId('storyboard', item.storyboardId), traceNodeId('batch_variant', item.id), 'storyboard_to_batch_variant', 'direct', '分镜进入批量生产变体。'));
    for (const assetId of item.assignedAssets) {
      edges.push(traceEdge(traceNodeId('asset', assetId), traceNodeId('batch_variant', item.id), 'asset_to_batch_variant', 'direct', '素材用于批量生产变体。'));
    }
  }
  for (const plan of run.experimentPlans || []) {
    for (const cell of plan.experimentCells) {
      for (const batchItemId of cell.assignedBatchItemIds) {
        edges.push(traceEdge(traceNodeId('batch_variant', batchItemId), traceNodeId('experiment_cell', cell.id), 'batch_variant_to_experiment_cell', 'direct', '生产变体进入实验单元。'));
      }
      for (const briefId of cell.assignedBriefIds) {
        edges.push(traceEdge(traceNodeId('brief', briefId), traceNodeId('experiment_cell', cell.id), 'brief_to_experiment_cell', 'partial', 'Brief 直接关联到实验单元。'));
      }
    }
  }
  for (const window of metricWindows) {
    edges.push(traceEdge(traceNodeId('experiment_cell', window.experimentCellId), traceNodeId('metric_window', window.metricWindowId), 'experiment_cell_to_metric_window', window.impressions > 0 ? 'direct' : 'partial', window.windowNote));
    if (decisionNodeId) {
      edges.push(traceEdge(traceNodeId('metric_window', window.metricWindowId), decisionNodeId, 'metric_window_to_decision', 'inferred', '指标窗口参与置信度和决策复盘。'));
    }
  }
  for (const link of learningLinks) {
    const learningNodeId = traceNodeId('learning', link.learningRecordId);
    if (decisionNodeId) {
      edges.push(traceEdge(decisionNodeId, learningNodeId, 'decision_to_learning', 'inferred', '决策摘要沉淀为学习记录。'));
    }
    for (const windowId of link.sourceMetricWindowIds) {
      edges.push(traceEdge(traceNodeId('metric_window', windowId), learningNodeId, 'metric_window_to_learning', 'inferred', '指标窗口作为学习来源记录。'));
    }
  }
  return uniqueBy(edges, edge => edge.id);
}

export function buildContentExperimentTraceGraph(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>): ContentExperimentTraceGraph {
  const assetLineageRecords = buildAssetLineageRecords(run);
  const metricWindows = buildExperimentMetricWindows(run);
  const evidenceTraces = buildExperimentEvidenceTraces(run);
  const learningEvidenceLinks = buildLearningEvidenceLinks(run);
  const learningLinkNodes: ContentTraceNode[] = learningEvidenceLinks.map(link => ({
    id: traceNodeId('learning', link.learningRecordId),
    type: 'learning',
    title: '学习证据来源',
    summary: scrubDeliveryText(link.learningStatement),
    runId: run.id,
    createdAt: run.updatedAt,
    relatedSkuId: run.project.id,
    productName: run.project.productName,
    sourceRef: link.learningRecordId,
  }));
  const nodes = uniqueBy([...buildContentTraceNodes(run), ...learningLinkNodes], node => node.id);
  const edges = buildContentTraceEdges(run);
  const linkedNodeIds = new Set(edges.flatMap(edge => [edge.fromNodeId, edge.toNodeId]));
  const unlinkedNodeIds = nodes.filter(node => !linkedNodeIds.has(node.id)).map(node => node.id);
  return {
    runId: run.id,
    generatedAt: run.updatedAt || new Date('2026-05-12T09:00:00Z').toISOString(),
    nodes,
    edges,
    assetLineageRecords,
    metricWindows,
    evidenceTraces,
    learningEvidenceLinks,
    unlinkedNodeIds,
    summary: `内容实验追踪链包含 ${nodes.length} 个来源节点、${edges.length} 条关联证据，${unlinkedNodeIds.length} 个节点未完全关联。`,
  };
}

export function buildTraceabilitySummary(run: Pick<ListingFactoryRun, 'id' | 'project'> & Partial<ListingFactoryRun>, graph = buildContentExperimentTraceGraph(run)): TraceabilitySummary {
  const strongest = graph.evidenceTraces.find(trace => trace.evidenceStrength === 'strong') || graph.evidenceTraces.find(trace => trace.evidenceStrength === 'usable') || graph.evidenceTraces[0];
  const link = graph.learningEvidenceLinks[0];
  const lineage = graph.assetLineageRecords.find(item => link?.sourceAssetIds.includes(item.assetId)) || graph.assetLineageRecords[0];
  const metricWindow = graph.metricWindows.find(item => link?.sourceMetricWindowIds.includes(item.metricWindowId)) || graph.metricWindows[0];
  return {
    runId: run.id,
    generatedAt: graph.generatedAt,
    strongestTraceableLearning: scrubDeliveryText(link?.learningStatement || run.merchantLearningArchive?.strongestReusableLearning || '当前还没有强关联学习。'),
    relatedContentArtifact: lineage ? `${lineage.assetId} / ${lineage.assetType}` : '未完全关联的素材',
    relatedExperimentCell: strongest?.testCellId || metricWindow?.experimentCellId || '未完全关联',
    metricWindowSummary: metricWindow ? `${metricLabel(metricWindow.metricName)}：展现 ${metricWindow.impressions}，点击 ${metricWindow.clicks}，CTR ${metricWindow.recalculatedCtr ?? 0}` : '未完全关联：暂无指标窗口。',
    evidenceStrength: strongest?.evidenceStrength || 'weak',
    limitationNote: strongest?.evidenceLimitations.join(' ') || '这是可追溯证据链，不能当作因果归因结论。',
    unlinkedArtifactCount: graph.unlinkedNodeIds.length,
    summary: `最强可追溯学习来自 ${strongest?.testCellId || '未完全关联实验单元'}，证据强度为 ${strongest?.evidenceStrength || 'weak'}。`,
  };
}

export function buildContentExperimentTraceMarkdown(graph?: ContentExperimentTraceGraph) {
  if (!graph) return '# 内容实验追踪链\n\n当前还没有可追溯证据链。';
  return scrubDeliveryText([
    '# 内容实验追踪链',
    '',
    graph.summary,
    '',
    '## 这条结论来自哪里',
    ...(graph.learningEvidenceLinks.length > 0
      ? graph.learningEvidenceLinks.slice(0, 5).map(link => `- ${link.learningStatement}：实验 ${link.sourceExperimentId}，单元 ${link.sourceCellIds.join(' / ') || '未完全关联'}，指标窗口 ${link.sourceMetricWindowIds.join(' / ') || '未完全关联'}`)
      : ['- 当前还没有学习证据来源。']),
    '',
    '## 素材来源记录',
    ...(graph.assetLineageRecords.length > 0
      ? graph.assetLineageRecords.slice(0, 6).map(item => `- ${item.assetId} / ${item.assetType}：${item.performanceSignal}；${item.reusableNote}`)
      : ['- 未完全关联的素材：当前没有素材来源记录。']),
    '',
    '## 目前能支持什么',
    ...graph.learningEvidenceLinks.slice(0, 5).map(link => `- ${link.whatThisSupports}`),
    '',
    '## 目前还不能证明什么',
    ...unique(graph.learningEvidenceLinks.map(link => link.whatThisDoesNotProve)).map(item => `- ${item}`),
    '',
    '## 未完全关联的素材',
    ...(graph.unlinkedNodeIds.length > 0 ? graph.unlinkedNodeIds.slice(0, 10).map(id => `- ${id}`) : ['- 当前没有未完全关联节点。']),
  ].join('\n'));
}

export function buildTraceabilitySummaryMarkdown(summary?: TraceabilitySummary) {
  if (!summary) return '# 可追溯证据链摘要\n\n当前还没有追踪链摘要。';
  return scrubDeliveryText([
    '# 可追溯证据链摘要',
    '',
    summary.summary,
    '',
    `- 最强可追溯学习：${summary.strongestTraceableLearning}`,
    `- 关联内容资产：${summary.relatedContentArtifact}`,
    `- 关联实验单元：${summary.relatedExperimentCell}`,
    `- 指标窗口：${summary.metricWindowSummary}`,
    `- 证据强度：${summary.evidenceStrength}`,
    `- 限制说明：${summary.limitationNote}`,
    `- 未完全关联节点：${summary.unlinkedArtifactCount}`,
  ].join('\n'));
}

const PLATFORM_IMPORT_HEADER = [
  'channel',
  'campaignName',
  'contentName',
  'trackingCode',
  'experimentCellId',
  'date',
  'impressions',
  'clicks',
  'spend',
  'orders',
  'revenue',
  'likes',
  'comments',
  'shares',
  'saves',
  'addToCart',
  'productName',
  'skuId',
  'note',
];

function platformMetricField(
  name: string,
  required: boolean,
  aliases: string[],
  metricType: PlatformMetricField['metricType'],
  expectedFormat: string,
  descriptionZh: string,
  exampleValue: string,
  validationRule?: string,
): PlatformMetricField {
  const descriptions: Record<string, string> = {
    recordId: '本地记录唯一 ID',
    channel: '平台或渠道',
    campaignName: '活动名称',
    contentName: '内容或创意名称',
    trackingCode: '追踪命名编码',
    experimentCellId: '实验单元 ID',
    date: '数据日期',
    impressions: '曝光数',
    clicks: '点击数',
    spend: '花费',
    orders: '订单数',
    revenue: '收入',
    likes: '点赞数',
    comments: '评论数',
    shares: '分享数',
    saves: '收藏数',
    addToCart: '加购数',
    conversionRate: '转化率',
    ctr: '点击率',
    roas: '广告支出回报',
    productName: '商品名称',
    skuId: 'SKU ID',
    platformContentId: '平台内容 ID',
    note: '备注',
  };
  return validationRule === undefined
    ? { name, required, aliases, metricType, expectedFormat, descriptionZh: descriptions[name] || name, exampleValue: descriptionZh, validationRule: exampleValue }
    : { name, required, aliases, metricType, expectedFormat, descriptionZh, exampleValue, validationRule };
}

export function buildPlatformDataContract(): PlatformDataContract {
  const requiredFields = [
    platformMetricField('recordId', true, ['id', 'record_id', 'rowId'], 'identifier', '稳定字符串', 'tt-20260512-001', '不能为空；重复时给出警告'),
    platformMetricField('channel', true, ['platform', 'sourceChannel'], 'dimension', 'tiktok/xiaohongshu/amazon/shopify/meta_ads/google_ads/other', 'tiktok', '未知渠道给出警告'),
    platformMetricField('campaignName', true, ['campaign', 'campaign_name'], 'dimension', '文本', '春季新品测试', '不能为空'),
    platformMetricField('contentName', true, ['creativeName', 'content', 'hook', 'creative_name'], 'dimension', '文本', '三秒痛点开场', 'contentName 或 creativeName 至少有一个'),
    platformMetricField('trackingCode', true, ['tracking_code', 'utmContent', 'utm_content'], 'identifier', '文本', 'wenai_hook_cell_1', '缺失给出警告，未来接真实平台前建议补齐'),
    platformMetricField('experimentCellId', true, ['cellId', 'cell_id', 'experiment_cell_id'], 'identifier', '文本', 'cell-1', '缺失给出警告，仍可保存为平台表现记录'),
    platformMetricField('date', true, ['publishDate', 'day', 'reportedDate'], 'date', 'YYYY-MM-DD', '2026-05-12', '必须是有效日期'),
    platformMetricField('impressions', true, ['views_impressions', 'show'], 'count', '非负数字', '1200', '不能为负'),
    platformMetricField('clicks', true, ['click', 'linkClicks'], 'count', '非负数字', '72', '不能为负，且不能大于 impressions'),
    platformMetricField('spend', true, ['cost', 'adSpend'], 'currency', '非负数字', '120.5', '不能为负'),
    platformMetricField('orders', true, ['purchases', 'conversions'], 'count', '非负数字', '4', '不能为负；大于 clicks 时给出警告'),
    platformMetricField('revenue', true, ['sales', 'gmv'], 'currency', '非负数字', '420', '不能为负'),
  ];
  const optionalFields = [
    platformMetricField('likes', false, ['like'], 'count', '非负数字', '90', '不能为负'),
    platformMetricField('comments', false, ['comment'], 'count', '非负数字', '12', '不能为负'),
    platformMetricField('shares', false, ['share'], 'count', '非负数字', '14', '不能为负'),
    platformMetricField('saves', false, ['save'], 'count', '非负数字', '24', '不能为负'),
    platformMetricField('addToCart', false, ['add_to_cart', 'cartAdds'], 'count', '非负数字', '8', '不能为负'),
    platformMetricField('conversionRate', false, ['cvr', 'conversion_rate'], 'ratio', '数字或百分比', '5%', '导入值只保留参考，复盘时会从 orders/clicks 重算'),
    platformMetricField('ctr', false, ['clickThroughRate', 'click_through_rate'], 'ratio', '数字或百分比', '6%', '导入值会被忽略，并从 clicks/impressions 重算'),
    platformMetricField('roas', false, ['returnOnAdSpend'], 'ratio', '数字', '3.5', '导入值会被忽略，并从 revenue/spend 重算'),
    platformMetricField('productName', false, ['product', 'skuName'], 'text', '文本', '便携咖啡杯', '用于本地检索，不参与指标计算'),
    platformMetricField('skuId', false, ['sku', 'productId'], 'identifier', '文本', 'sku-001', '用于本地关联，不参与指标计算'),
    platformMetricField('platformContentId', false, ['contentId', 'creativeId', 'postId'], 'identifier', '文本', '7123456789', '用于未来平台回连，不参与指标计算'),
    platformMetricField('note', false, ['notes', 'remark'], 'text', '文本', '首轮测试备注', '会进行敏感信息清理'),
  ];
  return {
    version: 'p8-local-platform-data-contract-v1',
    sourceTypes: ['manual_csv', 'manual_entry', 'future_api_placeholder'],
    channels: ['tiktok', 'xiaohongshu', 'amazon', 'shopify', 'meta_ads', 'google_ads', 'other'],
    requiredFields,
    optionalFields,
    boundaryNote: '当前仅定义本地导入契约，不连接真实平台 API，不抓取平台数据，也不做真实归因。',
  };
}

export function buildPlatformImportTemplate(contract = buildPlatformDataContract()): PlatformImportTemplate {
  const descriptionRow = PLATFORM_IMPORT_HEADER.map(field => {
    const definition = [...contract.requiredFields, ...contract.optionalFields].find(item => item.name === field);
    return definition?.descriptionZh || field;
  });
  const exampleRow = PLATFORM_IMPORT_HEADER.map(field => {
    const definition = [...contract.requiredFields, ...contract.optionalFields].find(item => item.name === field);
    return definition?.exampleValue || '';
  });
  return {
    header: PLATFORM_IMPORT_HEADER,
    csv: [
      PLATFORM_IMPORT_HEADER.join(','),
      descriptionRow.map(csvCell).join(','),
      exampleRow.map(csvCell).join(','),
    ].join('\n'),
    descriptionMarkdown: buildPlatformDataContractMarkdown(contract),
  };
}

function normalizePlatformHeader(value: string) {
  return value
    .trim()
    .replace(/（[^）]*）|\([^)]*\)/g, '')
    .replace(/[()\[\]{}]/g, '')
    .replace(/[\s_-]+/g, '')
    .toLowerCase();
}

function looksSecretLike(value: string) {
  return /\bsk-[A-Za-z0-9_-]+\b|\b(api[-_ ]?key|token|auth|providerToken|accessToken|refreshToken)\b/i.test(value);
}

export function buildPlatformFieldMapping(
  rows: Array<Record<string, unknown>> = [],
  contract = buildPlatformDataContract(),
  sourceType: PlatformDataSourceType = 'manual_csv',
): PlatformFieldMapping {
  const fields = [...contract.requiredFields, ...contract.optionalFields];
  const headers = unique(rows.flatMap(row => Object.keys(row)));
  const aliasToName = new Map<string, string>();
  for (const field of fields) {
    for (const alias of [field.name, ...field.aliases]) {
      aliasToName.set(normalizePlatformHeader(alias), field.name);
    }
  }
  const mappedFields: Record<string, string> = {};
  for (const header of headers) {
    const normalized = aliasToName.get(normalizePlatformHeader(header));
    if (normalized && !mappedFields[normalized]) mappedFields[normalized] = header;
  }
  return {
    sourceType,
    mappedFields,
    missingRequiredFields: contract.requiredFields.filter(field => !mappedFields[field.name]).map(field => field.name),
    unknownFields: headers.filter(header => !aliasToName.has(normalizePlatformHeader(header))),
  };
}

function platformRowValue(row: Record<string, unknown>, mapping: PlatformFieldMapping, field: string) {
  const sourceKey = mapping.mappedFields[field] || field;
  return row[sourceKey];
}

function parsePlatformNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return 0;
  return parseMetric(value);
}

function normalizePlatformChannel(value: unknown): PlatformChannel {
  const raw = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (raw === 'xhs' || raw === 'red' || raw === 'little_red_book') return 'xiaohongshu';
  if (raw === 'facebook' || raw === 'instagram' || raw === 'meta') return 'meta_ads';
  if (raw === 'google' || raw === 'googleads') return 'google_ads';
  if (['tiktok', 'xiaohongshu', 'amazon', 'shopify', 'meta_ads', 'google_ads', 'other'].includes(raw)) return raw as PlatformChannel;
  return 'other';
}

function platformDateLooksValid(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  const time = Date.parse(raw);
  return Number.isFinite(time);
}

function platformIsoDate(value: unknown) {
  const raw = String(value || '').trim();
  const date = new Date(raw);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : raw;
}

function platformIssue(rowIndex: number, field: string | undefined, severity: PlatformImportValidationIssue['severity'], code: string, message: string): PlatformImportValidationIssue {
  return { rowIndex, field, severity, code, message };
}

export function validatePlatformImportRows(
  rows: Array<Record<string, unknown>>,
  contract = buildPlatformDataContract(),
  mapping = buildPlatformFieldMapping(rows, contract),
): PlatformImportValidationIssue[] {
  const issues: PlatformImportValidationIssue[] = [];
  const seenRecordIds = new Set<string>();
  const metricFields = ['impressions', 'clicks', 'spend', 'orders', 'revenue', 'likes', 'comments', 'shares', 'saves', 'addToCart'];
  if (rows.length === 0) {
    issues.push(platformIssue(0, undefined, 'error', 'empty_import', '导入内容为空，至少需要一行平台数据。'));
  }
  rows.forEach((row, index) => {
    const rowIndex = index + 2;
    for (const field of contract.requiredFields) {
      const value = platformRowValue(row, mapping, field.name);
      if (value === undefined || value === null || String(value).trim() === '') {
        const severity = field.name === 'trackingCode' || field.name === 'experimentCellId' ? 'warning' : 'error';
        issues.push(platformIssue(rowIndex, field.name, severity, `missing_${field.name}`, `${field.descriptionZh}缺失。`));
      }
    }
    const recordId = String(platformRowValue(row, mapping, 'recordId') || '').trim();
    if (recordId) {
      if (seenRecordIds.has(recordId)) {
        issues.push(platformIssue(rowIndex, 'recordId', 'warning', 'duplicate_record_id', `recordId ${recordId} 重复。`));
      }
      seenRecordIds.add(recordId);
    }
    const channelRaw = String(platformRowValue(row, mapping, 'channel') || '').trim();
    const channel = normalizePlatformChannel(channelRaw);
    if (channelRaw && channel === 'other' && !['other'].includes(channelRaw.toLowerCase())) {
      issues.push(platformIssue(rowIndex, 'channel', 'warning', 'unknown_channel', `渠道 ${channelRaw} 未在契约中识别，已按 other 处理。`));
    }
    if (!platformDateLooksValid(platformRowValue(row, mapping, 'date'))) {
      issues.push(platformIssue(rowIndex, 'date', 'error', 'invalid_date', 'date 必须是有效日期。'));
    }
    for (const field of metricFields) {
      const raw = platformRowValue(row, mapping, field);
      if (raw !== undefined && raw !== null && String(raw).trim() !== '' && parsePlatformNumber(raw) < 0) {
        issues.push(platformIssue(rowIndex, field, 'error', `negative_${field}`, `${field} 不能为负数。`));
      }
    }
    const impressions = parsePlatformNumber(platformRowValue(row, mapping, 'impressions'));
    const clicks = parsePlatformNumber(platformRowValue(row, mapping, 'clicks'));
    const spend = parsePlatformNumber(platformRowValue(row, mapping, 'spend'));
    const orders = parsePlatformNumber(platformRowValue(row, mapping, 'orders'));
    const revenue = parsePlatformNumber(platformRowValue(row, mapping, 'revenue'));
    if (clicks > impressions) {
      issues.push(platformIssue(rowIndex, 'clicks', 'error', 'clicks_gt_impressions', 'clicks 不能大于 impressions。'));
    }
    if (clicks > 0 && orders > clicks) {
      issues.push(platformIssue(rowIndex, 'orders', 'warning', 'orders_gt_clicks', 'orders 大于 clicks，请确认口径是否为跨渠道归因或平台去重口径。'));
    }
    if (revenue > 0 && orders === 0) {
      issues.push(platformIssue(rowIndex, 'revenue', 'warning', 'revenue_without_orders', 'revenue 大于 0 但 orders 为 0，请确认收入口径。'));
    }
    if (spend > 0 && impressions === 0) {
      issues.push(platformIssue(rowIndex, 'spend', 'warning', 'spend_without_impressions', 'spend 大于 0 但 impressions 为 0，请确认投放数据是否完整。'));
    }
  });
  return issues;
}

export function normalizePlatformMetricRecords(
  rows: Array<Record<string, unknown>>,
  mapping = buildPlatformFieldMapping(rows),
  sourceType: PlatformDataSourceType = mapping.sourceType,
): NormalizedPlatformMetricRecord[] {
  return rows.map((row, index) => {
    const impressions = Math.max(0, Math.round(parsePlatformNumber(platformRowValue(row, mapping, 'impressions'))));
    const clicks = Math.max(0, Math.round(parsePlatformNumber(platformRowValue(row, mapping, 'clicks'))));
    const spend = Math.max(0, parsePlatformNumber(platformRowValue(row, mapping, 'spend')));
    const orders = Math.max(0, Math.round(parsePlatformNumber(platformRowValue(row, mapping, 'orders'))));
    const revenue = Math.max(0, parsePlatformNumber(platformRowValue(row, mapping, 'revenue')));
    const contentName = String(platformRowValue(row, mapping, 'contentName') || platformRowValue(row, mapping, 'creativeName') || '').trim();
    const note = scrubDeliveryText(String(platformRowValue(row, mapping, 'note') || '').trim());
    return {
      recordId: String(platformRowValue(row, mapping, 'recordId') || `platform-record-${index + 1}`).trim(),
      channel: normalizePlatformChannel(platformRowValue(row, mapping, 'channel')),
      campaignName: scrubDeliveryText(String(platformRowValue(row, mapping, 'campaignName') || '').trim()),
      contentName: scrubDeliveryText(contentName),
      creativeName: scrubDeliveryText(String(platformRowValue(row, mapping, 'creativeName') || contentName).trim()) || undefined,
      trackingCode: scrubDeliveryText(String(platformRowValue(row, mapping, 'trackingCode') || '').trim()) || undefined,
      experimentCellId: scrubDeliveryText(String(platformRowValue(row, mapping, 'experimentCellId') || '').trim()) || undefined,
      date: platformIsoDate(platformRowValue(row, mapping, 'date')),
      impressions,
      clicks,
      spend,
      orders,
      revenue,
      likes: parsePlatformNumber(platformRowValue(row, mapping, 'likes')) || undefined,
      comments: parsePlatformNumber(platformRowValue(row, mapping, 'comments')) || undefined,
      shares: parsePlatformNumber(platformRowValue(row, mapping, 'shares')) || undefined,
      saves: parsePlatformNumber(platformRowValue(row, mapping, 'saves')) || undefined,
      addToCart: parsePlatformNumber(platformRowValue(row, mapping, 'addToCart')) || undefined,
      conversionRate: clicks > 0 ? roundMetric(orders / clicks) : undefined,
      ctr: impressions > 0 ? roundMetric(clicks / impressions) : undefined,
      roas: spend > 0 ? roundMetric(revenue / spend) : undefined,
      productName: scrubDeliveryText(String(platformRowValue(row, mapping, 'productName') || '').trim()) || undefined,
      skuId: scrubDeliveryText(String(platformRowValue(row, mapping, 'skuId') || '').trim()) || undefined,
      platformContentId: scrubDeliveryText(String(platformRowValue(row, mapping, 'platformContentId') || '').trim()) || undefined,
      note: note || undefined,
      sourceType,
    };
  });
}

export function buildPlatformImportQualityReport(
  rows: Array<Record<string, unknown>>,
  contract = buildPlatformDataContract(),
  mapping = buildPlatformFieldMapping(rows, contract),
  now = new Date('2026-05-12T09:00:00Z'),
): PlatformImportQualityReport {
  const issues = validatePlatformImportRows(rows, contract, mapping);
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  const rowsWithErrors = new Set(errors.map(issue => issue.rowIndex));
  const validRowCount = rows.filter((_, index) => !rowsWithErrors.has(index + 2)).length;
  return {
    generatedAt: now.toISOString(),
    rowCount: rows.length,
    validRowCount,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
    readyForExperimentReview: rows.length > 0 && errors.length === 0,
    summary: errors.length > 0
      ? `导入质量检查发现 ${errors.length} 个错误，暂不建议进入实验复盘。`
      : warnings.length > 0
        ? `导入质量检查通过，但有 ${warnings.length} 个警告需要人工确认。`
        : `导入质量检查通过，${rows.length} 行数据可以进入复盘。`,
  };
}

export function buildPlatformDataReadinessSummary(
  contract = buildPlatformDataContract(),
  qualityReport = buildPlatformImportQualityReport([]),
  normalizedRecords: NormalizedPlatformMetricRecord[] = [],
): PlatformDataReadinessSummary {
  const cannotConcludeReasons = [
    ...(qualityReport.errorCount > 0 ? ['存在必填字段、日期或指标口径错误。'] : []),
    ...(qualityReport.warningCount > 0 ? ['存在缺少 trackingCode、experimentCellId 或口径异常的警告，需要人工确认。'] : []),
    ...(normalizedRecords.length === 0 ? ['当前没有可用于复盘的本地平台数据。'] : []),
  ];
  const reviewReadyData = normalizedRecords.length > 0
    ? [
      `已归一化 ${normalizedRecords.length} 行平台指标。`,
      `总曝光 ${sum(normalizedRecords.map(record => record.impressions))}，总点击 ${sum(normalizedRecords.map(record => record.clicks))}。`,
      `可用渠道：${unique(normalizedRecords.map(record => record.channel)).join(' / ') || '暂无'}`,
    ]
    : ['当前还没有可以进入复盘的数据。'];
  return {
    generatedAt: qualityReport.generatedAt,
    requiredFieldCount: contract.requiredFields.length,
    optionalFieldCount: contract.optionalFields.length,
    normalizedRecordCount: normalizedRecords.length,
    errorCount: qualityReport.errorCount,
    warningCount: qualityReport.warningCount,
    readyForExperimentReview: qualityReport.readyForExperimentReview && normalizedRecords.length > 0,
    cannotConcludeReasons: cannotConcludeReasons.length > 0 ? cannotConcludeReasons : ['当前数据仅能支持本地复盘准备，不能当作真实平台归因结论。'],
    reviewReadyData,
    summary: qualityReport.readyForExperimentReview && normalizedRecords.length > 0
      ? '平台数据契约已满足本地复盘准备要求，仍需人工确认追踪命名和实验单元关联。'
      : '平台数据接入准备度不足，请先补齐导入字段和质量检查问题。',
  };
}

export function buildPlatformDataContractMarkdown(contract = buildPlatformDataContract()) {
  return scrubDeliveryText([
    '# 平台数据契约',
    '',
    contract.boundaryNote,
    '',
    '## 必填字段',
    ...contract.requiredFields.map(field => `- ${field.name}：${field.descriptionZh}。格式：${field.expectedFormat}。示例：${field.exampleValue}。规则：${field.validationRule}`),
    '',
    '## 可选字段',
    ...contract.optionalFields.map(field => `- ${field.name}：${field.descriptionZh}。格式：${field.expectedFormat}。示例：${field.exampleValue}。规则：${field.validationRule}`),
    '',
    '当前仅支持本地导入，不连接真实平台 API。',
  ].join('\n'));
}

export function buildPlatformImportQualityMarkdown(report?: PlatformImportQualityReport) {
  if (!report) return '# 导入质量检查\n\n当前还没有平台数据导入质量报告。';
  return scrubDeliveryText([
    '# 导入质量检查',
    '',
    report.summary,
    '',
    `- 导入行数：${report.rowCount}`,
    `- 可用行数：${report.validRowCount}`,
    `- 错误：${report.errorCount}`,
    `- 警告：${report.warningCount}`,
    `- 是否可以进入复盘：${report.readyForExperimentReview ? '可以进入人工复核后的本地复盘' : '暂不建议进入复盘'}`,
    '',
    '## 错误',
    ...(report.errors.length > 0 ? report.errors.map(issue => `- 第 ${issue.rowIndex} 行 / ${issue.field || '整行'}：${issue.message}`) : ['- 当前没有错误。']),
    '',
    '## 警告',
    ...(report.warnings.length > 0 ? report.warnings.map(issue => `- 第 ${issue.rowIndex} 行 / ${issue.field || '整行'}：${issue.message}`) : ['- 当前没有警告。']),
  ].join('\n'));
}

export function buildPlatformDataReadinessMarkdown(summary?: PlatformDataReadinessSummary) {
  if (!summary) return '# 数据接入准备度\n\n当前还没有平台数据接入准备度摘要。';
  return scrubDeliveryText([
    '# 数据接入准备度',
    '',
    summary.summary,
    '',
    `- 必填字段：${summary.requiredFieldCount}`,
    `- 可选字段：${summary.optionalFieldCount}`,
    `- 已归一化记录：${summary.normalizedRecordCount}`,
    `- 错误 / 警告：${summary.errorCount} / ${summary.warningCount}`,
    `- 是否可进入复盘：${summary.readyForExperimentReview ? '可以进入复盘' : '暂不建议进入复盘'}`,
    '',
    '## 不能直接下结论的原因',
    ...summary.cannotConcludeReasons.map(item => `- ${item}`),
    '',
    '## 可以进入复盘的数据',
    ...summary.reviewReadyData.map(item => `- ${item}`),
    '',
    '当前仅支持本地导入，不连接真实平台 API。',
  ].join('\n'));
}

function platformAlias(normalizedField: string, aliases: string[], descriptionZh: string): PlatformCsvHeaderAlias {
  return { normalizedField, aliases, descriptionZh };
}

const COMMON_PLATFORM_ALIASES: PlatformCsvHeaderAlias[] = [
  platformAlias('channel', ['platform', 'source', 'channel'], '平台渠道'),
  platformAlias('campaignName', ['campaign', 'campaign name', 'campaign_name', 'ad campaign', 'promotion name', 'utm_campaign'], '活动名称'),
  platformAlias('contentName', ['content', 'content name', 'creative', 'creative name', 'ad name', 'post title', 'listing title', 'keyword', 'ad_group_name', 'ad group name', 'adset_name', 'adset name', 'ad_group', 'ad group'], '内容或创意名称'),
  platformAlias('trackingCode', ['tracking code', 'tracking_code', 'utm content', 'utm_content', 'utm term'], '追踪编码'),
  platformAlias('experimentCellId', ['cell id', 'cell_id', 'experiment cell', 'experiment_cell_id'], '实验单元 ID'),
  platformAlias('date', ['date', 'day', 'report date', 'time period'], '日期'),
  platformAlias('impressions', ['impressions', 'impr', 'shows', 'display count', '曝光', '展现'], '曝光'),
  platformAlias('clicks', ['clicks', 'click', 'link clicks', '点击'], '点击'),
  platformAlias('spend', ['spend', 'cost', 'amount spent', 'ad spend', 'cost_per_result', 'cost per result', 'cost_per_conversion', 'cost per conversion', '花费', '消耗'], '花费'),
  platformAlias('orders', ['orders', 'purchases', 'conversions', 'purchase', 'purchases conversion value', '订单', '成交'], '订单'),
  platformAlias('revenue', ['revenue', 'sales', 'total_sales', 'total sales', 'gmv', 'conversion value', 'conversion_value', 'purchase_roas', 'purchase roas', '收入', '销售额'], '收入'),
  platformAlias('likes', ['likes', 'like count', '点赞'], '点赞'),
  platformAlias('comments', ['comments', 'comment count', '评论'], '评论'),
  platformAlias('shares', ['shares', 'share count', '分享'], '分享'),
  platformAlias('saves', ['saves', 'favorites', '收藏'], '收藏'),
  platformAlias('addToCart', ['add to cart', 'add_to_cart', 'cart adds', '加购'], '加购'),
  platformAlias('productName', ['product', 'product name', 'item name', '商品名称'], '商品名'),
  platformAlias('skuId', ['sku', 'sku id', 'sku_id', 'seller sku', 'asin'], 'SKU'),
  platformAlias('platformContentId', ['content id', 'creative id', 'post id', 'item id', 'ad id'], '平台内容 ID'),
  platformAlias('note', ['note', 'notes', 'remark', '备注'], '备注'),
];

const CLEAN_PLATFORM_ALIASES: PlatformCsvHeaderAlias[] = [
  platformAlias('channel', ['平台', '渠道', '来源', 'Platform', 'Channel'], '平台渠道'),
  platformAlias('campaignName', ['计划名称', '活动名称', '广告系列', 'Campaign name', 'Campaign Name'], '活动名称'),
  platformAlias('contentName', ['内容名称', '创意名称', '广告名称', '视频名称', '商品标题', 'Ad name', 'Creative name', 'Video name', 'Product title'], '内容或创意名称'),
  platformAlias('trackingCode', ['追踪码', '跟踪码', 'Tracking code', 'UTM content'], '追踪编码'),
  platformAlias('experimentCellId', ['实验单元', '实验单元ID', 'Cell ID', 'Experiment cell'], '实验单元 ID'),
  platformAlias('date', ['日期', '时间', 'Date', 'Day', 'Report date'], '日期'),
  platformAlias('impressions', ['曝光', '展现', '展示次数', 'Impressions', 'Impr'], '曝光'),
  platformAlias('clicks', ['点击', '点击次数', 'Clicks', 'Link clicks'], '点击'),
  platformAlias('spend', ['花费', '消耗', '广告花费', 'Spend', 'Cost', 'Amount spent'], '花费'),
  platformAlias('orders', ['订单', '成交', '购买', 'Orders', 'Purchases', 'Conversions'], '订单'),
  platformAlias('revenue', ['收入', '销售额', '成交金额', 'Revenue', 'Sales', 'Net sales', 'Total sales', 'GMV'], '收入'),
  platformAlias('likes', ['点赞', 'Likes'], '点赞'),
  platformAlias('comments', ['评论', 'Comments'], '评论'),
  platformAlias('shares', ['分享', 'Shares'], '分享'),
  platformAlias('saves', ['收藏', 'Saves', 'Favorites'], '收藏'),
  platformAlias('addToCart', ['加购', '加入购物车', 'Added to cart', 'Add to cart'], '加购'),
  platformAlias('productName', ['商品名称', '产品名称', 'Product title', 'Product name'], '商品名称'),
  platformAlias('skuId', ['SKU', 'Seller SKU', 'Variant SKU'], 'SKU'),
  platformAlias('platformContentId', ['内容ID', '广告ID', '视频ID', 'Ad ID', 'Creative ID', 'Video ID'], '平台内容 ID'),
  platformAlias('note', ['备注', '说明', 'Note', 'Notes', 'Remark'], '备注'),
];

export function buildPlatformCsvAdapterPresets(): PlatformCsvAdapterPreset[] {
  const withCommon = (platform: PlatformChannel, label: string, aliases: PlatformCsvHeaderAlias[], note: string): PlatformCsvAdapterPreset => ({
    platform,
    label,
    aliases: [...COMMON_PLATFORM_ALIASES, ...CLEAN_PLATFORM_ALIASES, ...aliases],
    note,
  });
  return [
    withCommon('tiktok', 'TikTok CSV 字段适配', [
      platformAlias('campaignName', ['Campaign name', 'Campaign Name'], 'TikTok 活动名称'),
      platformAlias('contentName', ['Ad name', 'Video name', 'Creative name'], 'TikTok 广告或视频名称'),
      platformAlias('platformContentId', ['Ad ID', 'Video ID', 'Creative ID'], 'TikTok 内容 ID'),
      platformAlias('spend', ['Cost', 'Spend'], 'TikTok 花费'),
    ], '仅做本地 TikTok CSV 字段映射，不连接 TikTok API。'),
    withCommon('xiaohongshu', '小红书 CSV 字段适配', [
      platformAlias('campaignName', ['计划名称', '推广计划', 'campaign'], '小红书计划名称'),
      platformAlias('contentName', ['笔记名称', '创意名称', '内容标题'], '小红书笔记或创意名称'),
      platformAlias('platformContentId', ['笔记ID', '创意ID', '内容ID'], '小红书内容 ID'),
      platformAlias('spend', ['消耗', '花费'], '小红书消耗'),
    ], '仅做本地小红书 CSV 字段映射，不抓取平台数据。'),
    withCommon('amazon', 'Amazon CSV 字段适配', [
      platformAlias('campaignName', ['campaign_name', 'Campaign Name', 'Campaign'], 'Amazon 活动名称'),
      platformAlias('contentName', ['keyword', 'ad_group_name', 'Advertised SKU', 'Product title', 'ASIN'], 'Amazon 关键词、广告组或商品'),
      platformAlias('skuId', ['Advertised SKU', 'Seller SKU', 'SKU', 'ASIN'], 'Amazon SKU'),
      platformAlias('spend', ['Spend', 'Cost'], 'Amazon 广告花费'),
      platformAlias('orders', ['orders', 'Orders', 'Purchases', 'Units Ordered'], 'Amazon 订单'),
      platformAlias('revenue', ['sales', 'Sales', 'Total sales'], 'Amazon 销售额'),
      platformAlias('acos', ['acos', 'ACOS', 'Advertising cost of sales'], 'Amazon ACOS'),
    ], '仅做本地 Amazon CSV 字段映射，不连接 Amazon API。'),
    withCommon('shopify', 'Shopify CSV 字段适配', [
      platformAlias('campaignName', ['utm_campaign', 'Discount Code', 'Marketing event', 'Traffic source'], 'Shopify 活动或来源'),
      platformAlias('contentName', ['utm_source', 'Product title', 'Product name', 'Landing page'], 'Shopify 来源、商品或落地页'),
      platformAlias('skuId', ['SKU', 'Variant SKU'], 'Shopify SKU'),
      platformAlias('clicks', ['sessions', 'Sessions'], 'Shopify 访问会话'),
      platformAlias('orders', ['orders', 'Orders', 'Net orders'], 'Shopify 订单'),
      platformAlias('revenue', ['total_sales', 'Net sales', 'Gross sales', 'Total sales'], 'Shopify 销售额'),
      platformAlias('conversionRate', ['conversion_rate', 'Conversion rate'], 'Shopify 转化率'),
      platformAlias('aov', ['aov', 'AOV', 'Average order value'], 'Shopify 客单价'),
      platformAlias('addToCart', ['Added to cart', 'Add to carts'], 'Shopify 加购'),
    ], '仅做本地 Shopify CSV 字段映射，不连接 Shopify API。'),
    withCommon('meta_ads', 'Meta Ads CSV 字段适配', [
      platformAlias('campaignName', ['campaign_name', 'Campaign name'], 'Meta Campaign'),
      platformAlias('contentName', ['ad_name', 'adset_name', 'Ad name', 'Ad set name', 'Creative name'], 'Meta 广告名称'),
      platformAlias('platformContentId', ['Ad ID', 'Creative ID'], 'Meta 广告 ID'),
      platformAlias('spend', ['spend', 'Amount spent (USD)', 'Amount spent'], 'Meta 花费'),
      platformAlias('orders', ['purchases', 'Purchases', 'Website purchases'], 'Meta 购买'),
      platformAlias('revenue', ['purchase_roas', 'Purchase conversion value', 'Website purchase conversion value'], 'Meta 转化价值'),
      platformAlias('costPerResult', ['cost_per_result', 'Cost per result'], 'Meta 单次结果成本'),
    ], '仅做本地 Meta Ads CSV 字段映射，不连接 Meta API。'),
    withCommon('google_ads', 'Google Ads CSV 字段适配', [
      platformAlias('campaignName', ['campaign', 'Campaign', 'Campaign name'], 'Google Ads Campaign'),
      platformAlias('contentName', ['ad_group', 'keyword', 'Ad group', 'Ad name', 'Asset'], 'Google Ads 广告组、关键词或资产'),
      platformAlias('spend', ['cost', 'Cost', 'Cost micros'], 'Google Ads 花费'),
      platformAlias('orders', ['conversions', 'Conversions', 'Purchases'], 'Google Ads 转化'),
      platformAlias('revenue', ['conversion_value', 'Conversion value', 'Conv. value'], 'Google Ads 转化价值'),
      platformAlias('costPerConversion', ['cost_per_conversion', 'Cost per conversion'], 'Google Ads 单次转化成本'),
    ], '仅做本地 Google Ads CSV 字段映射，不连接 Google API。'),
    withCommon('other', '通用 CSV 字段适配', [], '仅做本地通用 CSV 字段映射。'),
  ];
}

function presetForPlatform(platform: PlatformChannel, presets = buildPlatformCsvAdapterPresets()) {
  return presets.find(preset => preset.platform === platform) || presets.find(preset => preset.platform === 'other') || presets[0];
}

function headersFromRows(rows: Array<Record<string, unknown>>) {
  return unique(rows.flatMap(row => Object.keys(row)));
}

function detectPlatformFromHeaders(headers: string[], requested?: PlatformChannel): PlatformChannel {
  if (requested) return requested;
  const text = headers.join(' ').toLowerCase();
  const normalized = headers.map(normalizePlatformHeader).join(' ');
  if (/tiktok|video id|ad id/.test(text) || /tiktok|videoid|adid/.test(normalized)) return 'tiktok';
  if (/小红书|笔记/.test(text)) return 'xiaohongshu';
  if (/asin|advertised sku|seller sku|acos/.test(text) || /advertisedsku|sellersku|acos/.test(normalized)) return 'amazon';
  if (/shopify|variant sku|net sales|gross sales|total_sales|sessions|aov/.test(text) || /variantsku|netsales|grosssales|totalsales|sessions|aov/.test(normalized)) return 'shopify';
  if (/meta|facebook|amount spent|ad set|adset_name|purchase_roas|cost_per_result/.test(text) || /amountspent|adset|adsetname|purchaseroas|costperresult/.test(normalized)) return 'meta_ads';
  if (/google|conv\.|cost micros|ad group|ad_group|conversion_value|cost_per_conversion/.test(text) || /costmicros|adgroup|conversionvalue|costperconversion/.test(normalized)) return 'google_ads';
  if (/tiktok|video id|ad id/.test(text)) return 'tiktok';
  if (/小红书|笔记|消耗/.test(text)) return 'xiaohongshu';
  if (/asin|advertised sku|seller sku|acos/.test(text)) return 'amazon';
  if (/shopify|variant sku|net sales|gross sales|total_sales|sessions|aov/.test(text)) return 'shopify';
  if (/meta|facebook|amount spent|ad set|adset_name|purchase_roas|cost_per_result/.test(text)) return 'meta_ads';
  if (/google|conv\.|cost micros|ad group|ad_group|conversion_value|cost_per_conversion/.test(text)) return 'google_ads';
  return 'other';
}

export function inferPlatformCsvFieldMapping(
  headers: string[],
  platform?: PlatformChannel,
  contract = buildPlatformDataContract(),
  presets = buildPlatformCsvAdapterPresets(),
): PlatformCsvMappingCandidate[] {
  const detected = detectPlatformFromHeaders(headers, platform);
  const preset = presetForPlatform(detected, presets);
  const contractFields = [...contract.requiredFields, ...contract.optionalFields];
  const exactMap = new Map<string, string>();
  const aliasMap = new Map<string, string>();
  for (const field of contractFields) {
    exactMap.set(normalizePlatformHeader(field.name), field.name);
    for (const alias of field.aliases) aliasMap.set(normalizePlatformHeader(alias), field.name);
  }
  for (const alias of preset.aliases) {
    for (const value of alias.aliases) aliasMap.set(normalizePlatformHeader(value), alias.normalizedField);
  }
  return headers.map(header => {
    const normalized = normalizePlatformHeader(header);
    const exact = exactMap.get(normalized);
    if (exact) return { originalHeader: scrubDeliveryText(header), normalizedField: exact, confidence: 'exact', source: 'contract' };
    const alias = aliasMap.get(normalized);
    if (alias) return { originalHeader: scrubDeliveryText(header), normalizedField: alias, confidence: 'alias', source: 'preset' };
    return { originalHeader: scrubDeliveryText(header), confidence: 'manual_needed', source: 'unknown' };
  });
}

function mappingFromCandidates(candidates: PlatformCsvMappingCandidate[], sourceType: PlatformDataSourceType = 'manual_csv'): PlatformFieldMapping {
  const mappedFields: Record<string, string> = {};
  const conflicts = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate.normalizedField) continue;
    if (mappedFields[candidate.normalizedField]) conflicts.add(candidate.normalizedField);
    if (!mappedFields[candidate.normalizedField]) mappedFields[candidate.normalizedField] = candidate.originalHeader;
  }
  return {
    sourceType,
    mappedFields,
    missingRequiredFields: [],
    unknownFields: candidates.filter(candidate => !candidate.normalizedField).map(candidate => candidate.originalHeader),
  };
}

export function buildPlatformCsvMappingPreview(
  rowsOrHeaders: Array<Record<string, unknown>> | string[],
  platform?: PlatformChannel,
  contract = buildPlatformDataContract(),
  presets = buildPlatformCsvAdapterPresets(),
): PlatformCsvMappingPreview {
  const headers = Array.isArray(rowsOrHeaders) && typeof rowsOrHeaders[0] === 'string'
    ? rowsOrHeaders as string[]
    : headersFromRows(rowsOrHeaders as Array<Record<string, unknown>>);
  const detectedChannel = detectPlatformFromHeaders(headers, platform);
  const candidates = inferPlatformCsvFieldMapping(headers, detectedChannel, contract, presets);
  const mappedFields = candidates.filter(candidate => candidate.normalizedField);
  const fieldCounts = mappedFields.reduce<Record<string, number>>((acc, candidate) => {
    if (candidate.normalizedField) acc[candidate.normalizedField] = (acc[candidate.normalizedField] || 0) + 1;
    return acc;
  }, {});
  const missingRequiredFields = contract.requiredFields
    .filter(field => !fieldCounts[field.name])
    .map(field => field.name);
  const unknownFields = candidates.filter(candidate => !candidate.normalizedField).map(candidate => candidate.originalHeader);
  const conflictFields = Object.entries(fieldCounts).filter(([, count]) => count > 1).map(([field]) => field);
  const warnings: PlatformCsvMappingIssue[] = [
    ...unknownFields.map(header => ({ severity: 'warning' as const, type: 'unknown_field' as const, header, message: `未识别字段：${scrubDeliveryText(header)}，不会静默丢弃，请人工确认是否需要映射。` })),
    ...headers.filter(looksSecretLike).map(header => ({ severity: 'warning' as const, type: 'secret_like' as const, header: scrubDeliveryText(header), message: `字段名疑似包含敏感信息，已清理显示：${scrubDeliveryText(header)}` })),
  ];
  const errors: PlatformCsvMappingIssue[] = [
    ...missingRequiredFields.map(field => ({ severity: 'error' as const, type: 'missing_required' as const, field, message: `缺失必填字段：${field}` })),
    ...conflictFields.map(field => ({ severity: 'error' as const, type: 'conflict_field' as const, field, message: `字段冲突：多个 CSV 表头映射到 ${field}` })),
  ];
  const recommendedFixes = [
    ...(missingRequiredFields.length > 0 ? [`补齐必填字段：${missingRequiredFields.join(' / ')}`] : []),
    ...(unknownFields.length > 0 ? ['为未识别字段选择映射，或确认它们只作为备注保留。'] : []),
    ...(conflictFields.length > 0 ? [`处理字段冲突：${conflictFields.join(' / ')}`] : []),
    '当前仅支持本地 CSV 映射，不连接真实平台 API。',
  ];
  return {
    detectedChannel,
    totalHeaders: headers.length,
    candidates,
    mappedFields,
    missingRequiredFields,
    unknownFields,
    conflictFields,
    warnings,
    errors,
    estimatedImportReady: errors.length === 0,
    recommendedFixes,
  };
}

export function buildPlatformCsvImportPreviewSummary(
  rows: Array<Record<string, unknown>>,
  platform?: PlatformChannel,
  contract = buildPlatformDataContract(),
  now = new Date('2026-05-12T09:00:00Z'),
): PlatformCsvImportPreviewSummary {
  const mappingPreview = buildPlatformCsvMappingPreview(rows, platform, contract);
  const fieldMapping = mappingFromCandidates(mappingPreview.candidates);
  const importQualityReport = buildPlatformImportQualityReport(rows, contract, fieldMapping, now);
  const normalizedRecords = normalizePlatformMetricRecords(rows, fieldMapping, 'manual_csv');
  return {
    generatedAt: now.toISOString(),
    mappingPreview,
    importQualityReport,
    normalizedRecordCount: normalizedRecords.length,
    estimatedImportReady: mappingPreview.estimatedImportReady && importQualityReport.readyForExperimentReview,
    recommendedFixes: unique([...mappingPreview.recommendedFixes, ...(importQualityReport.readyForExperimentReview ? [] : ['先修复导入质量检查里的错误，再进入实验复盘。'])]),
    summary: mappingPreview.estimatedImportReady && importQualityReport.readyForExperimentReview
      ? `导入前预览通过，${normalizedRecords.length} 行数据可进入 P8 归一化复盘。`
      : `导入前预览发现 ${mappingPreview.errors.length + importQualityReport.errorCount} 个阻塞问题，需要先修复。`,
  };
}

export function exportPlatformCsvMappingPreset(preview: PlatformCsvMappingPreview, now = new Date('2026-05-12T09:00:00Z')): PlatformCsvMappingPresetExport {
  return {
    platform: preview.detectedChannel,
    generatedAt: now.toISOString(),
    mappings: preview.candidates.map(candidate => ({
      originalHeader: scrubDeliveryText(candidate.originalHeader),
      normalizedField: candidate.normalizedField,
      confidence: candidate.confidence,
    })),
    warnings: preview.warnings.map(issue => scrubDeliveryText(issue.message)),
    localOnlyNote: '该字段映射预设仅用于本地 CSV 导入预览，不会上传，也不连接真实平台 API。',
  };
}

export function buildPlatformCsvMappingPreviewMarkdown(preview?: PlatformCsvMappingPreview) {
  if (!preview) return '# 导入前映射预览\n\n当前还没有平台字段映射预览。';
  return scrubDeliveryText([
    '# 平台字段适配',
    '',
    '当前仅支持本地 CSV 映射，不连接真实平台 API。',
    '',
    '## 导入前映射预览',
    `- 检测平台：${preview.detectedChannel}`,
    `- CSV 表头数：${preview.totalHeaders}`,
    `- 已识别字段：${preview.mappedFields.length}`,
    `- 缺失必填字段：${preview.missingRequiredFields.length}`,
    `- 未识别字段：${preview.unknownFields.length}`,
    `- 字段冲突：${preview.conflictFields.length}`,
    `- 是否预计可导入：${preview.estimatedImportReady ? '可以' : '暂不可以'}`,
    '',
    '## 已识别字段',
    ...(preview.mappedFields.length > 0 ? preview.mappedFields.map(item => `- ${item.originalHeader} → ${item.normalizedField}（${item.confidence}）`) : ['- 当前没有已识别字段。']),
    '',
    '## 缺失必填字段',
    ...(preview.missingRequiredFields.length > 0 ? preview.missingRequiredFields.map(field => `- ${field}`) : ['- 当前没有缺失必填字段。']),
    '',
    '## 未识别字段',
    ...(preview.unknownFields.length > 0 ? preview.unknownFields.map(field => `- ${field}`) : ['- 当前没有未识别字段。']),
    '',
    '## 字段冲突',
    ...(preview.conflictFields.length > 0 ? preview.conflictFields.map(field => `- ${field}`) : ['- 当前没有字段冲突。']),
    '',
    '## 建议修复',
    ...preview.recommendedFixes.map(item => `- ${item}`),
  ].join('\n'));
}

export function buildPlatformCsvImportPreviewMarkdown(summary?: PlatformCsvImportPreviewSummary) {
  if (!summary) return '# 导入前 QA 摘要\n\n当前还没有导入前 QA 摘要。';
  return scrubDeliveryText([
    '# 导入前 QA 摘要',
    '',
    summary.summary,
    '',
    `- 检测平台：${summary.mappingPreview.detectedChannel}`,
    `- 已识别字段：${summary.mappingPreview.mappedFields.length}`,
    `- 缺失必填字段：${summary.mappingPreview.missingRequiredFields.length}`,
    `- 未识别字段：${summary.mappingPreview.unknownFields.length}`,
    `- 字段冲突：${summary.mappingPreview.conflictFields.length}`,
    `- P8 质量检查错误 / 警告：${summary.importQualityReport.errorCount} / ${summary.importQualityReport.warningCount}`,
    `- 归一化记录数：${summary.normalizedRecordCount}`,
    `- 是否预计可导入：${summary.estimatedImportReady ? '可以' : '暂不可以'}`,
    '',
    '## 建议修复',
    ...summary.recommendedFixes.map(item => `- ${item}`),
    '',
    '当前仅支持本地 CSV 映射，不连接真实平台 API。',
  ].join('\n'));
}

function platformExportVersion(
  platform: PlatformChannel,
  versionId: string,
  versionLabel: string,
  detectedByHeaders: string[],
  requiredHeaderAliases: string[],
  optionalHeaderAliases: string[],
  knownMissingFields: string[] = [],
  knownAmbiguousFields: string[] = [],
  recommendedMappingNotes: string[] = [],
): PlatformExportVersion {
  return {
    platform,
    versionId,
    versionLabel,
    detectedByHeaders,
    requiredHeaderAliases,
    optionalHeaderAliases,
    knownMissingFields,
    knownAmbiguousFields,
    recommendedMappingNotes,
    userFacingDescription: `${versionLabel}：本地适配预设，不代表平台官方接口。`,
  };
}

function manualPlatformExportVersion(platform: PlatformChannel = 'other'): PlatformExportVersion {
  return platformExportVersion(
    platform,
    'manual_confirmation',
    '需要手动确认',
    [],
    [],
    [],
    ['recordId', 'trackingCode', 'experimentCellId'],
    [],
    ['表头重叠不足，先人工确认平台导出版本，再进入导入演练。'],
  );
}

export function buildPlatformExportVersionRegistry(now = new Date('2026-05-12T09:00:00Z')): PlatformExportVersionRegistry {
  return {
    generatedAt: now.toISOString(),
    boundaryNote: '本地适配预设，不代表平台官方接口。当前仅做本地 CSV 演练，不连接真实平台 API。',
    versions: [
      platformExportVersion('tiktok', 'tiktok-local-ads-v1', 'TikTok 本地广告导出样例 v1', ['Campaign Name', 'Ad name', 'Ad ID', 'Cost', 'Purchases'], ['recordId', 'channel', 'Campaign Name', 'Ad name', 'UTM Content', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Cost', 'Purchases', 'Sales'], ['Video ID', 'Likes', 'Comments', 'Shares', 'CTR', 'ROAS'], [], ['Ad name / Creative name'], ['优先确认 trackingCode 与 experimentCellId 是否来自本地命名规则。']),
      platformExportVersion('xiaohongshu', 'xiaohongshu-local-note-v1', '小红书本地笔记导出样例 v1', ['计划名称', '笔记名称', '笔记ID', '消费'], ['recordId', 'channel', '计划名称', '笔记名称', 'trackingCode', 'experimentCellId', 'date', '曝光', '点击', '消费', '订单', '收入'], ['点赞', '评论', '分享', '收藏'], ['trackingCode', 'experimentCellId'], ['笔记名称 / 创意名称'], ['中文表头先按本地 alias 映射，无法识别时保留为未识别字段。']),
      platformExportVersion('amazon', 'amazon-local-sponsored-v1', 'Amazon 本地广告导出样例 v1', ['Campaign Name', 'Advertised SKU', 'Spend', 'Units Ordered'], ['recordId', 'channel', 'Campaign Name', 'Advertised SKU', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Spend', 'Orders', 'Sales'], ['ASIN', 'Seller SKU', 'Total sales'], ['trackingCode', 'experimentCellId'], ['Advertised SKU 同时可能代表 contentName 与 skuId'], ['SKU 字段需人工确认映射到内容名称还是商品 SKU。']),
      platformExportVersion('shopify', 'shopify-local-sales-v1', 'Shopify 本地销售导出样例 v1', ['Product title', 'Variant SKU', 'Net sales', 'Added to cart'], ['recordId', 'channel', 'Marketing event', 'Product title', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Spend', 'Orders', 'Net sales'], ['Variant SKU', 'Added to cart', 'Gross sales'], ['trackingCode', 'experimentCellId'], ['Traffic source / Marketing event'], ['Shopify 销售数据通常需要补齐本地实验命名字段。']),
      platformExportVersion('meta_ads', 'meta-ads-local-v1', 'Meta Ads 本地广告导出样例 v1', ['Campaign name', 'Ad name', 'Amount spent', 'Website purchases'], ['recordId', 'channel', 'Campaign name', 'Ad name', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Amount spent', 'Website purchases', 'Purchase conversion value'], ['Ad ID', 'Ad set name', 'Creative name'], ['trackingCode', 'experimentCellId'], ['Ad name / Ad set name / Creative name'], ['先确认层级字段，不把广告组名误当素材名。']),
      platformExportVersion('google_ads', 'google-ads-local-v1', 'Google Ads 本地广告导出样例 v1', ['Campaign', 'Ad group', 'Cost', 'Conversions'], ['recordId', 'channel', 'Campaign', 'Ad group', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'Conversion value'], ['Asset', 'Conv. value', 'Cost micros'], ['trackingCode', 'experimentCellId'], ['Ad group / Asset'], ['Cost micros 需要在导入前确认单位，当前演练只处理普通 cost 数值。']),
      platformExportVersion('other', 'other-local-generic-v1', '通用本地 CSV 样例 v1', ['campaignName', 'contentName', 'impressions', 'clicks'], ['recordId', 'channel', 'campaignName', 'contentName', 'trackingCode', 'experimentCellId', 'date', 'impressions', 'clicks', 'spend', 'orders', 'revenue'], ['likes', 'comments', 'shares', 'saves', 'addToCart'], ['trackingCode', 'experimentCellId'], [], ['通用版本只作为兜底，本地演练后仍建议人工确认字段含义。']),
    ],
  };
}

export function detectPlatformExportVersion(
  rowsOrHeaders: Array<Record<string, unknown>> | string[],
  platform?: PlatformChannel,
  registry = buildPlatformExportVersionRegistry(),
): PlatformExportVersion {
  const headers = Array.isArray(rowsOrHeaders) && typeof rowsOrHeaders[0] === 'string'
    ? rowsOrHeaders as string[]
    : headersFromRows(rowsOrHeaders as Array<Record<string, unknown>>);
  const detectedPlatform = detectPlatformFromHeaders(headers, platform);
  const normalizedHeaders = new Set(headers.map(normalizePlatformHeader));
  const candidates = registry.versions
    .filter(version => !platform || version.platform === platform)
    .map(version => {
      const requiredHits = version.requiredHeaderAliases.filter(header => normalizedHeaders.has(normalizePlatformHeader(header))).length;
      const detectedHits = version.detectedByHeaders.filter(header => normalizedHeaders.has(normalizePlatformHeader(header))).length;
      const optionalHits = version.optionalHeaderAliases.filter(header => normalizedHeaders.has(normalizePlatformHeader(header))).length;
      const platformBoost = version.platform === detectedPlatform ? 2 : 0;
      return { version, score: requiredHits * 2 + detectedHits * 3 + optionalHits + platformBoost, requiredHits, detectedHits };
    })
    .sort((a, b) => b.score - a.score || b.requiredHits - a.requiredHits || a.version.versionId.localeCompare(b.version.versionId));
  const best = candidates[0];
  const second = candidates[1];
  if (!best || best.score < 8 || best.detectedHits === 0 || (second && best.score - second.score < 3 && best.version.platform !== second.version.platform)) {
    return manualPlatformExportVersion(platform || detectedPlatform);
  }
  return best.version;
}

function fixtureRows(headers: string[], rows: PlatformCsvFixtureRow[]): PlatformCsvFixtureRow[] {
  return rows.map(row => headers.reduce<PlatformCsvFixtureRow>((acc, header) => {
    acc[header] = row[header];
    return acc;
  }, {}));
}

export function buildPlatformCsvFixtures(): PlatformCsvFixture[] {
  const cleanHeaders = ['recordId', 'channel', 'Campaign Name', 'Ad name', 'UTM Content', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Cost', 'Purchases', 'Sales', 'Likes', 'Comments', 'Shares'];
  const fixtureFor = (platform: PlatformChannel, versionId: string, label: string, headers: string[], row: PlatformCsvFixtureRow): PlatformCsvFixture => ({
    fixtureId: `${versionId}-clean`,
    platform,
    versionId,
    label,
    fixtureType: 'clean',
    headers,
    rows: fixtureRows(headers, [row]),
    expectedNotes: ['干净样例应完成字段映射、P8 QA 和归一化。'],
  });
  const fixtures: PlatformCsvFixture[] = [
    fixtureFor('tiktok', 'tiktok-local-ads-v1', 'TikTok 干净导出样例', cleanHeaders, { recordId: 'tt-clean-1', channel: 'tiktok', 'Campaign Name': '春季新品测试', 'Ad name': '痛点开场短视频', 'UTM Content': 'wenai_tt_cell_1', experimentCellId: 'cell-1', Date: '2026-05-12', Impressions: 1000, Clicks: 80, Cost: 40, Purchases: 8, Sales: 240, Likes: 90, Comments: 8, Shares: 5 }),
    fixtureFor('xiaohongshu', 'xiaohongshu-local-note-v1', '小红书干净导出样例', ['recordId', 'channel', '计划名称', '笔记名称', 'trackingCode', 'experimentCellId', 'date', '曝光', '点击', '消费', '订单', '收入', '点赞', '收藏'], { recordId: 'xhs-clean-1', channel: 'xiaohongshu', '计划名称': '春季种草', '笔记名称': '通勤杯痛点笔记', trackingCode: 'wenai_xhs_cell_1', experimentCellId: 'cell-1', date: '2026-05-12', '曝光': 900, '点击': 54, '消费': 32, '订单': 4, '收入': 160, '点赞': 36, '收藏': 12 }),
    fixtureFor('amazon', 'amazon-local-sponsored-v1', 'Amazon 干净导出样例', ['recordId', 'channel', 'Campaign Name', 'Advertised SKU', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Spend', 'Orders', 'Sales'], { recordId: 'az-clean-1', channel: 'amazon', 'Campaign Name': 'Sponsored test', 'Advertised SKU': 'SKU-001', trackingCode: 'wenai_az_cell_1', experimentCellId: 'cell-1', Date: '2026-05-12', Impressions: 1200, Clicks: 60, Spend: 45, Orders: 6, Sales: 300 }),
    fixtureFor('shopify', 'shopify-local-sales-v1', 'Shopify 干净导出样例', ['recordId', 'channel', 'Marketing event', 'Product title', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Spend', 'Orders', 'Net sales', 'Added to cart'], { recordId: 'shop-clean-1', channel: 'shopify', 'Marketing event': 'Email test', 'Product title': 'Portable coffee cup', trackingCode: 'wenai_shop_cell_1', experimentCellId: 'cell-1', Date: '2026-05-12', Impressions: 800, Clicks: 80, Spend: 0, Orders: 12, 'Net sales': 420, 'Added to cart': 35 }),
    fixtureFor('meta_ads', 'meta-ads-local-v1', 'Meta Ads 干净导出样例', ['recordId', 'channel', 'Campaign name', 'Ad name', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Amount spent', 'Website purchases', 'Purchase conversion value'], { recordId: 'meta-clean-1', channel: 'meta_ads', 'Campaign name': 'Meta hook test', 'Ad name': 'UGC angle A', trackingCode: 'wenai_meta_cell_1', experimentCellId: 'cell-1', Date: '2026-05-12', Impressions: 1100, Clicks: 77, 'Amount spent': 55, 'Website purchases': 7, 'Purchase conversion value': 280 }),
    fixtureFor('google_ads', 'google-ads-local-v1', 'Google Ads 干净导出样例', ['recordId', 'channel', 'Campaign', 'Ad group', 'trackingCode', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'Conversion value'], { recordId: 'gg-clean-1', channel: 'google_ads', Campaign: 'Search test', 'Ad group': 'Pain point keywords', trackingCode: 'wenai_google_cell_1', experimentCellId: 'cell-1', Date: '2026-05-12', Impressions: 700, Clicks: 70, Cost: 35, Conversions: 5, 'Conversion value': 210 }),
    fixtureFor('other', 'other-local-generic-v1', '通用干净导出样例', PLATFORM_IMPORT_HEADER, { recordId: 'other-clean-1', channel: 'other', campaignName: 'Local test', contentName: 'Generic creative', trackingCode: 'wenai_other_cell_1', experimentCellId: 'cell-1', date: '2026-05-12', impressions: 600, clicks: 30, spend: 10, orders: 3, revenue: 90, likes: 10, comments: 2, shares: 1 }),
  ];
  const dirtyHeaders = ['recordId', 'channel', 'Campaign Name', 'campaign_name', 'Ad name', 'Date', 'Impressions', 'Clicks', 'Cost', 'Purchases', 'Sales', 'CTR', 'ROAS', 'Mystery Header'];
  fixtures.push({
    fixtureId: 'tiktok-local-ads-v1-dirty',
    platform: 'tiktok',
    versionId: 'tiktok-local-ads-v1',
    label: 'TikTok 脏数据导出样例',
    fixtureType: 'dirty',
    headers: dirtyHeaders,
    rows: fixtureRows(dirtyHeaders, [{ recordId: 'tt-dirty-1', channel: 'tiktok', 'Campaign Name': '春季新品测试', campaign_name: '重复活动名', 'Ad name': '痛点开场短视频', Date: 'not-a-date', Impressions: -10, Clicks: 20, Cost: 30, Purchases: 2, Sales: 100, CTR: 0.99, ROAS: 99, 'Mystery Header': '需要人工确认' }]),
    expectedNotes: ['脏样例包含缺失 trackingCode、缺失 experimentCellId、未知字段、字段冲突、无效日期、负数指标和陈旧 ctr/roas。'],
  });
  return fixtures;
}

export function runPlatformCsvRehearsal(
  fixture: PlatformCsvFixture,
  registry = buildPlatformExportVersionRegistry(),
  contract = buildPlatformDataContract(),
  now = new Date('2026-05-12T09:00:00Z'),
): PlatformCsvRehearsalResult {
  const version = detectPlatformExportVersion(fixture.headers, fixture.platform, registry);
  const mappingPreview = buildPlatformCsvMappingPreview(fixture.rows as Array<Record<string, unknown>>, fixture.platform, contract);
  const fieldMapping = mappingFromCandidates(mappingPreview.candidates);
  const importQualityReport = buildPlatformImportQualityReport(fixture.rows as Array<Record<string, unknown>>, contract, fieldMapping, now);
  const normalizedRecords = normalizePlatformMetricRecords(fixture.rows as Array<Record<string, unknown>>, fieldMapping, 'manual_csv').map(scrubNormalizedPlatformRecord);
  const issues: PlatformCsvRehearsalIssue[] = [
    ...(version.versionId === 'manual_confirmation' ? [{ fixtureId: fixture.fixtureId, severity: 'warning' as const, type: 'version_detection' as const, message: '需要手动确认平台导出版本。' }] : []),
    ...mappingPreview.errors.map(issue => ({ fixtureId: fixture.fixtureId, severity: 'error' as const, type: 'mapping_preview' as const, message: issue.message })),
    ...mappingPreview.warnings.map(issue => ({ fixtureId: fixture.fixtureId, severity: 'warning' as const, type: 'mapping_preview' as const, message: issue.message })),
    ...importQualityReport.errors.map(issue => ({ fixtureId: fixture.fixtureId, severity: 'error' as const, type: 'quality_validation' as const, message: issue.message })),
    ...importQualityReport.warnings.map(issue => ({ fixtureId: fixture.fixtureId, severity: 'warning' as const, type: 'quality_validation' as const, message: issue.message })),
  ].map(issue => ({ ...issue, message: scrubDeliveryText(issue.message) }));
  const importReady = version.versionId !== 'manual_confirmation' && mappingPreview.estimatedImportReady && importQualityReport.readyForExperimentReview;
  return {
    fixtureId: fixture.fixtureId,
    platform: fixture.platform,
    versionId: version.versionId,
    versionLabel: version.versionLabel,
    needsManualConfirmation: version.versionId === 'manual_confirmation',
    mappingPreview,
    importQualityReport,
    normalizedRecordCount: normalizedRecords.length,
    normalizedRecords,
    issues,
    importReady,
    summary: importReady
      ? `${fixture.label} 演练通过，可进入本地导入复盘。`
      : `${fixture.label} 演练发现 ${issues.filter(issue => issue.severity === 'error').length} 个错误和 ${issues.filter(issue => issue.severity === 'warning').length} 个警告。`,
  };
}

export function buildPlatformCsvRehearsalSummary(
  fixtures = buildPlatformCsvFixtures(),
  registry = buildPlatformExportVersionRegistry(),
  contract = buildPlatformDataContract(),
  now = new Date('2026-05-12T09:00:00Z'),
): PlatformCsvRehearsalSummary {
  const results = fixtures.map(fixture => runPlatformCsvRehearsal(fixture, registry, contract, now));
  const errors = results.flatMap(result => result.issues.filter(issue => issue.severity === 'error'));
  const warnings = results.flatMap(result => result.issues.filter(issue => issue.severity === 'warning'));
  const fieldsMostLikelyToNeedManualMapping = unique(results.flatMap(result => [
    ...result.mappingPreview.unknownFields,
    ...result.mappingPreview.missingRequiredFields,
    ...result.mappingPreview.conflictFields,
  ])).slice(0, 12);
  const recommendedFixes = unique([
    ...(fieldsMostLikelyToNeedManualMapping.length > 0 ? [`优先确认字段：${fieldsMostLikelyToNeedManualMapping.join(' / ')}`] : []),
    ...(errors.length > 0 ? ['先修复演练中的错误样例，再把映射用于真实本地导入。'] : []),
    '本地适配预设，不代表平台官方接口。',
    '当前仅做本地 CSV 演练，不连接真实平台 API。',
  ]);
  return {
    generatedAt: now.toISOString(),
    resultCount: results.length,
    passedFixtures: results.filter(result => result.importReady).length,
    failedFixtures: results.filter(result => !result.importReady).length,
    warningCount: warnings.length,
    errorCount: errors.length,
    fieldsMostLikelyToNeedManualMapping,
    recommendedFixes,
    results,
    summary: `CSV 导入演练完成：${results.filter(result => result.importReady).length} 个通过，${results.filter(result => !result.importReady).length} 个需要修复。`,
  };
}

export function buildPlatformCsvRegressionSnapshot(
  summary = buildPlatformCsvRehearsalSummary(),
  now = new Date('2026-05-12T09:00:00Z'),
): PlatformCsvRegressionSnapshot {
  return {
    generatedAt: now.toISOString(),
    snapshots: summary.results.map(result => ({
      platform: result.platform,
      versionId: result.versionId,
      mappedFieldCount: result.mappingPreview.mappedFields.length,
      missingRequiredCount: result.mappingPreview.missingRequiredFields.length,
      unknownFieldCount: result.mappingPreview.unknownFields.length,
      conflictCount: result.mappingPreview.conflictFields.length,
      validationErrorCount: result.importQualityReport.errorCount,
      validationWarningCount: result.importQualityReport.warningCount,
      importReady: result.importReady,
    })).sort((a, b) => `${a.platform}-${a.versionId}`.localeCompare(`${b.platform}-${b.versionId}`)),
    jsonSafe: true,
    localOnlyNote: '字段回归快照只保存确定性汇总，不包含原始敏感字段；本地适配预设，不代表平台官方接口。',
  };
}

export function buildPlatformExportVersionRegistryMarkdown(registry = buildPlatformExportVersionRegistry()) {
  return scrubDeliveryText([
    '# 平台导出版本库',
    '',
    '本地适配预设，不代表平台官方接口。',
    '当前仅做本地 CSV 演练，不连接真实平台 API。',
    '',
    '## 本地适配预设',
    ...registry.versions.map(version => [
      `### ${version.versionLabel}`,
      `- 平台：${version.platform}`,
      `- 版本：${version.versionId}`,
      `- 识别表头：${version.detectedByHeaders.join(' / ') || '需要手动确认'}`,
      `- 可能缺失的字段：${version.knownMissingFields.join(' / ') || '无'}`,
      `- 可能冲突的字段：${version.knownAmbiguousFields.join(' / ') || '无'}`,
      `- 说明：${version.userFacingDescription}`,
    ].join('\n')),
  ].join('\n'));
}

export function buildPlatformCsvRehearsalMarkdown(summary = buildPlatformCsvRehearsalSummary()) {
  return scrubDeliveryText([
    '# CSV 导入演练',
    '',
    '当前仅做本地 CSV 演练，不连接真实平台 API。',
    '本地适配预设，不代表平台官方接口。',
    '',
    summary.summary,
    '',
    `- 通过样例：${summary.passedFixtures}`,
    `- 失败样例：${summary.failedFixtures}`,
    `- 警告 / 错误：${summary.warningCount} / ${summary.errorCount}`,
    '',
    '## 可能缺失的字段',
    ...(summary.fieldsMostLikelyToNeedManualMapping.length > 0 ? summary.fieldsMostLikelyToNeedManualMapping.map(field => `- ${field}`) : ['- 暂无']),
    '',
    '## 建议修复',
    ...summary.recommendedFixes.map(item => `- ${item}`),
    '',
    '## 演练结果',
    ...summary.results.map(result => `- ${result.fixtureId}：${result.importReady ? '通过' : '需要修复'} / ${result.versionLabel} / ${result.summary}`),
  ].join('\n'));
}

export function buildPlatformCsvRegressionSnapshotMarkdown(snapshot = buildPlatformCsvRegressionSnapshot()) {
  return scrubDeliveryText([
    '# 字段回归快照',
    '',
    '本地适配预设，不代表平台官方接口。',
    '当前仅做本地 CSV 演练，不连接真实平台 API。',
    '',
    ...snapshot.snapshots.map(item => `- ${item.platform} / ${item.versionId}：映射 ${item.mappedFieldCount}，缺失 ${item.missingRequiredCount}，未知 ${item.unknownFieldCount}，冲突 ${item.conflictCount}，QA 错误 / 警告 ${item.validationErrorCount} / ${item.validationWarningCount}，${item.importReady ? '可导入' : '需修复'}`),
    '',
    `- JSON 安全：${snapshot.jsonSafe ? '是' : '否'}`,
    `- 说明：${snapshot.localOnlyNote}`,
  ].join('\n'));
}

function platformRowsFromRun(run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>): Array<Record<string, unknown>> {
  return (run.performanceRecords || []).map((record, index) => {
    const normalized = calculatePerformanceMetrics(record);
    return {
      recordId: normalized.id || `perf-${index + 1}`,
      channel: normalized.platform,
      campaignName: run.project.productName,
      contentName: normalized.hook,
      trackingCode: normalized.trackingCode || '',
      experimentCellId: normalized.cellId || '',
      date: normalized.publishDate || run.updatedAt || '2026-05-12',
      impressions: normalized.impressions,
      clicks: normalized.clicks,
      spend: normalized.cost || 0,
      orders: normalized.conversionRate !== undefined ? Math.round(normalized.conversionRate * normalized.clicks) : 0,
      revenue: normalized.revenue || 0,
      likes: normalized.likes,
      comments: normalized.comments,
      shares: normalized.shares,
      saves: normalized.saves,
      productName: run.project.productName,
      skuId: run.project.id,
      note: normalized.notes || '',
    };
  });
}

function scrubNormalizedPlatformRecord(record: NormalizedPlatformMetricRecord): NormalizedPlatformMetricRecord {
  return {
    ...record,
    campaignName: scrubDeliveryText(record.campaignName),
    contentName: scrubDeliveryText(record.contentName),
    creativeName: record.creativeName ? scrubDeliveryText(record.creativeName) : record.creativeName,
    trackingCode: record.trackingCode ? scrubDeliveryText(record.trackingCode) : record.trackingCode,
    experimentCellId: record.experimentCellId ? scrubDeliveryText(record.experimentCellId) : record.experimentCellId,
    productName: record.productName ? scrubDeliveryText(record.productName) : record.productName,
    skuId: record.skuId ? scrubDeliveryText(record.skuId) : record.skuId,
    platformContentId: record.platformContentId ? scrubDeliveryText(record.platformContentId) : record.platformContentId,
    note: record.note ? scrubDeliveryText(record.note) : record.note,
  };
}

function buildPlatformDataLayer(run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>) {
  const platformDataContract = run.platformDataContract || buildPlatformDataContract();
  const platformImportTemplate = run.platformImportTemplate || buildPlatformImportTemplate(platformDataContract);
  const rows = platformRowsFromRun(run);
  const platformFieldMapping = run.platformFieldMapping || buildPlatformFieldMapping(rows, platformDataContract, 'manual_csv');
  const platformImportQualityReport = run.platformImportQualityReport || buildPlatformImportQualityReport(rows, platformDataContract, platformFieldMapping);
  const normalizedPlatformMetricRecords = Array.isArray(run.normalizedPlatformMetricRecords) && run.normalizedPlatformMetricRecords.length > 0
    ? run.normalizedPlatformMetricRecords.map(scrubNormalizedPlatformRecord)
    : normalizePlatformMetricRecords(rows, platformFieldMapping, 'manual_csv').map(scrubNormalizedPlatformRecord);
  const platformDataReadinessSummary = run.platformDataReadinessSummary || buildPlatformDataReadinessSummary(platformDataContract, platformImportQualityReport, normalizedPlatformMetricRecords);
  const platformCsvAdapterPresets = run.platformCsvAdapterPresets || buildPlatformCsvAdapterPresets();
  const platformCsvMappingPreview = run.platformCsvMappingPreview || buildPlatformCsvMappingPreview(rows.length > 0 ? rows : PLATFORM_IMPORT_HEADER, undefined, platformDataContract, platformCsvAdapterPresets);
  const platformCsvImportPreviewSummary = run.platformCsvImportPreviewSummary || buildPlatformCsvImportPreviewSummary(rows, platformCsvMappingPreview.detectedChannel, platformDataContract);
  const platformCsvMappingPresetExport = run.platformCsvMappingPresetExport || exportPlatformCsvMappingPreset(platformCsvMappingPreview);
  const platformExportVersionRegistry = run.platformExportVersionRegistry || buildPlatformExportVersionRegistry();
  const platformCsvRehearsalSummary = run.platformCsvRehearsalSummary || buildPlatformCsvRehearsalSummary(buildPlatformCsvFixtures(), platformExportVersionRegistry, platformDataContract);
  const platformCsvRegressionSnapshot = run.platformCsvRegressionSnapshot || buildPlatformCsvRegressionSnapshot(platformCsvRehearsalSummary);
  return {
    platformDataContract,
    platformImportTemplate,
    platformFieldMapping,
    platformImportQualityReport,
    normalizedPlatformMetricRecords,
    platformDataReadinessSummary,
    platformCsvAdapterPresets,
    platformCsvMappingPreview,
    platformCsvImportPreviewSummary,
    platformCsvMappingPresetExport,
    platformExportVersionRegistry,
    platformCsvRehearsalSummary,
    platformCsvRegressionSnapshot,
  };
}

function addUtcDays(start: Date, days: number) {
  const date = new Date(start);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function isoDateOnly(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function experimentVariableFromInsight(insight: PerformanceInsight): ExperimentCell['variableType'] {
  const text = `${insight.title} ${insight.summary} ${insight.recommendedAction}`.toLowerCase();
  if (text.includes('platform')) return 'platform';
  if (text.includes('content type') || text.includes('contenttype')) return 'content_type';
  if (text.includes('proof')) return 'proof_point';
  if (text.includes('cta')) return 'cta';
  if (text.includes('audience')) return 'audience';
  if (text.includes('visual')) return 'visual_angle';
  return 'hook';
}

function experimentSafeValue(value: string, fallback: string, project: ListingProject) {
  return sanitizeRiskyCopy(value.trim() || fallback, project.brandGuardrails);
}

export function buildTrackingNamingConvention(project: ListingProject, experimentPlan: Pick<ExperimentPlan, 'id' | 'experimentCells' | 'productionAssignments'>) {
  const convention = 'WENAI_{category}_{platform}_{contentType}_{variableType}_{cellId}_{date}';
  const codes = experimentPlan.productionAssignments.length > 0
    ? experimentPlan.productionAssignments.map(assignment => {
      const cell = experimentPlan.experimentCells.find(item => item.id === assignment.experimentCellId);
      return [
        'WENAI',
        slugify(project.category).toUpperCase(),
        slugify(assignment.platform).toUpperCase(),
        slugify(assignment.contentType).toUpperCase(),
        slugify(cell?.variableType || 'test').toUpperCase(),
        assignment.experimentCellId.toUpperCase(),
        isoDateOnly(new Date(assignment.suggestedPublishDate)),
      ].join('_');
    })
    : experimentPlan.experimentCells.map(cell => ['WENAI', slugify(project.category).toUpperCase(), 'PLATFORM', 'CONTENT', slugify(cell.variableType).toUpperCase(), cell.id.toUpperCase(), 'YYYYMMDD'].join('_'));
  return {
    namingConvention: convention,
    trackingCodes: unique(codes),
  };
}

export function buildExperimentCsvTemplate(experimentPlan: Pick<ExperimentPlan, 'id' | 'experimentCells' | 'trackingPlan' | 'productionAssignments'>) {
  const header = ['experimentId', 'cellId', 'contentId', 'platform', 'contentType', 'variableType', 'trackingCode', 'impressions', 'views', 'clicks', 'likes', 'comments', 'saves', 'shares', 'conversionRate', 'revenue', 'cost', 'notes'];
  const rows = experimentPlan.productionAssignments.map((assignment, index) => {
    const cell = experimentPlan.experimentCells.find(item => item.id === assignment.experimentCellId);
    return [
      experimentPlan.id,
      assignment.experimentCellId,
      assignment.batchItemId || assignment.briefId,
      assignment.platform,
      assignment.contentType,
      cell?.variableType || 'hook',
      experimentPlan.trackingPlan?.trackingCodes[index] || '',
      '', '', '', '', '', '', '', '', '', '',
      cell?.expectedLearning || '',
    ];
  });
  return [header.join(','), ...rows.map(row => row.map(value => csvCell(String(value))).join(','))].join('\n');
}

export function buildManualResultEntryTemplate(experimentPlan: Pick<ExperimentPlan, 'id' | 'experimentCells' | 'trackingPlan' | 'productionAssignments'>) {
  return buildExperimentCsvTemplate(experimentPlan);
}

export function buildExperimentPlanFromInsights(
  run: Pick<ListingFactoryRun, 'project' | 'briefs'> & Partial<ListingFactoryRun>,
  insights: PerformanceInsight[] = [],
  options: {
    goal?: string;
    targetPlatforms?: string[];
    maxCells?: number;
    primaryMetric?: SuccessMetric['name'];
    testWindowDays?: number;
    riskTolerance?: 'low' | 'medium' | 'high';
    now?: Date;
  } = {},
): ExperimentPlan {
  const now = options.now || new Date('2026-05-12T09:00:00Z');
  const project = run.project;
  const targetPlatforms = unique(options.targetPlatforms?.length ? options.targetPlatforms : [
    ...(run.regenerationPlan?.nextPlatforms || []),
    ...project.targetPlatforms,
  ]).slice(0, 3);
  const maxCells = Math.min(Math.max(options.maxCells ?? 3, 2), 4);
  const sourceInsights = insights.length > 0 ? insights : analyzePerformancePatterns(run, run.performanceRecords || []);
  const rankedInsights = [
    ...sourceInsights.filter(item => item.type === 'winning_pattern'),
    ...sourceInsights.filter(item => item.type === 'weak_pattern'),
    ...sourceInsights.filter(item => item.type === 'platform_signal' || item.type === 'audience_signal' || item.type === 'next_test'),
  ];
  const fallbackBriefs = run.briefs || [];
  const fallbackInsights = fallbackBriefs.slice(0, maxCells).map((brief, index): PerformanceInsight => ({
    id: `fallback-insight-${brief.id}`,
    type: index === 0 ? 'winning_pattern' : 'next_test',
    title: `${brief.contentType} local experiment`,
    summary: brief.hook,
    evidence: [`Brief score ${brief.qualityScore.overallScore}`],
    recommendedAction: `Test a sharper ${brief.contentType} hook against the current control.`,
    linkedBriefIds: [brief.id],
    linkedBatchItemIds: [],
  }));
  const picked = (rankedInsights.length ? rankedInsights : fallbackInsights).slice(0, maxCells);
  const primaryMetric = options.primaryMetric || 'ctr';
  const experimentId = `exp-${project.id}-${now.getTime().toString(36)}`;
  const cells: ExperimentCell[] = picked.map((insight, index) => {
    const variableType = experimentVariableFromInsight(insight);
    const brief = fallbackBriefs.find(item => insight.linkedBriefIds.includes(item.id)) || fallbackBriefs[index % Math.max(fallbackBriefs.length, 1)];
    const variants = (run.variantMatrices || []).flatMap(matrix => matrix.variants).filter(variant => !brief || variant.briefId === brief.id);
    const batchItems = (run.productionBatches || []).flatMap(batch => batch.batchItems).filter(item => insight.linkedBatchItemIds.includes(item.id) || (brief && item.briefId === brief.id));
    const controlValue = experimentSafeValue(
      variableType === 'platform' ? (brief?.platform || targetPlatforms[0] || project.targetPlatforms[0] || 'TikTok')
        : variableType === 'content_type' ? (brief?.contentType || batchItems[0]?.contentType || 'content_test')
          : brief?.hook || insight.summary,
      project.productName,
      project,
    );
    const testValue = experimentSafeValue(
      insight.type === 'weak_pattern'
        ? `Rewrite weak ${variableType} with clearer buyer context and proof.`
        : insight.recommendedAction,
      `Scale ${variableType} with a sharper scene-specific version.`,
      project,
    );
    return {
      id: `cell-${index + 1}`,
      name: `${variableType} test ${index + 1}`,
      variableType,
      controlValue,
      testValue,
      assignedBriefIds: unique([...(insight.linkedBriefIds || []), brief?.id].filter((id): id is string => Boolean(id))).slice(0, 3),
      assignedVariantIds: variants.slice(0, 3).map(variant => variant.id),
      assignedBatchItemIds: unique([...(insight.linkedBatchItemIds || []), ...batchItems.slice(0, 2).map(item => item.id)]).slice(0, 3),
      expectedLearning: insight.type === 'weak_pattern'
        ? `Learn whether fixing ${variableType} clarity improves ${primaryMetric} without changing other variables.`
        : `Learn whether scaling this ${variableType} pattern improves ${primaryMetric} versus the control.`,
    };
  });
  const successMetrics: SuccessMetric[] = [
    { name: primaryMetric, targetDirection: 'higher', benchmarkValue: summarizePerformance(run.performanceRecords || []).averageCtr || undefined, priority: 'primary' },
    { name: 'engagementRate', targetDirection: 'higher', benchmarkValue: summarizePerformance(run.performanceRecords || []).averageEngagementRate || undefined, priority: 'secondary' },
    { name: 'saves', targetDirection: 'higher', priority: 'secondary' },
  ];
  const assignments: ProductionAssignment[] = cells.flatMap((cell, cellIndex) => {
    const briefIds = cell.assignedBriefIds.length > 0 ? cell.assignedBriefIds : fallbackBriefs.slice(cellIndex, cellIndex + 1).map(brief => brief.id);
    return briefIds.slice(0, 2).map((briefId, assignmentIndex) => {
      const brief = fallbackBriefs.find(item => item.id === briefId);
      const batchItem = (run.productionBatches || []).flatMap(batch => batch.batchItems).find(item => item.briefId === briefId || cell.assignedBatchItemIds.includes(item.id));
      return {
        id: `assign-${cell.id}-${assignmentIndex + 1}`,
        experimentCellId: cell.id,
        platform: targetPlatforms[(cellIndex + assignmentIndex) % Math.max(targetPlatforms.length, 1)] || brief?.platform || project.targetPlatforms[0] || 'TikTok',
        contentType: brief?.contentType || batchItem?.contentType || 'content_test',
        briefId,
        variantId: cell.assignedVariantIds[assignmentIndex],
        batchItemId: batchItem?.id || cell.assignedBatchItemIds[assignmentIndex],
        editPackId: batchItem?.editPackId,
        suggestedPublishDate: addUtcDays(now, cellIndex * 2 + assignmentIndex + 1).toISOString(),
        ownerRole: 'content operator',
        status: 'planned' as const,
      };
    });
  });
  const shellPlan = {
    id: experimentId,
    experimentCells: cells,
    productionAssignments: assignments,
  };
  const trackingNaming = buildTrackingNamingConvention(project, shellPlan);
  const trackingPlan: TrackingPlan = {
    ...trackingNaming,
    csvTemplate: '',
    manualEntryFields: ['platform', 'contentType', 'hook', 'trackingCode', 'impressions', 'views', 'clicks', 'likes', 'comments', 'saves', 'shares', 'conversionRate', 'revenue', 'cost', 'notes'],
  };
  const planWithoutCsv: ExperimentPlan = {
    id: experimentId,
    projectId: project.id,
    name: `${project.productName} next-round local experiment`,
    goal: options.goal || 'Turn performance feedback into a controlled next-round content test.',
    hypothesis: sanitizeRiskyCopy(
      cells[0]
        ? `Keep the current control structure, change only ${cells[0].variableType}, and expect ${primaryMetric} to improve versus broad unfocused versions.`
        : 'Import more performance data before making a strong experiment hypothesis.',
      project.brandGuardrails,
    ),
    basedOnInsightIds: picked.map(item => item.id),
    targetPlatforms,
    successMetrics,
    testWindow: `${now.toISOString().slice(0, 10)} to ${addUtcDays(now, options.testWindowDays ?? 14).toISOString().slice(0, 10)}`,
    experimentCells: cells,
    trackingPlan,
    productionAssignments: assignments,
    status: cells.length > 0 && assignments.length > 0 ? 'ready' : 'draft',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const csvTemplate = buildExperimentCsvTemplate(planWithoutCsv);
  return {
    ...planWithoutCsv,
    trackingPlan: {
      ...planWithoutCsv.trackingPlan,
      csvTemplate,
    },
  };
}

export function buildExperimentVariantMatrix(run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>, experimentPlan: ExperimentPlan): ExperimentVariantMatrix {
  const rows: ExperimentVariantMatrixRow[] = experimentPlan.experimentCells.map(cell => {
    const variantPool = (run.variantMatrices || []).flatMap(matrix => matrix.variants).filter(variant => cell.assignedVariantIds.includes(variant.id));
    const batchItems = (run.productionBatches || []).flatMap(batch => batch.batchItems).filter(item => cell.assignedBatchItemIds.includes(item.id));
    const variants = [
      cell.testValue,
      variantPool[0]?.hook || batchItems[0]?.hook || `${cell.testValue} with proof-point framing`,
      variantPool[1]?.hook || `${cell.testValue} with audience-specific opening`,
    ].map(value => experimentSafeValue(value, cell.testValue, run.project));
    return {
      experimentId: experimentPlan.id,
      cellId: cell.id,
      variableType: cell.variableType,
      control: cell.controlValue,
      variantA: variants[0],
      variantB: variants[1],
      variantC: variants[2],
      briefIds: cell.assignedBriefIds,
      variantIds: cell.assignedVariantIds,
      batchItemIds: cell.assignedBatchItemIds,
      riskNotes: ['Change only the main variable for this cell; keep platform, budget, publish window and CTA stable unless the cell variable is that field.'],
      expectedLearning: cell.expectedLearning,
    };
  });
  const header = ['experimentId', 'cellId', 'variableType', 'control', 'variantA', 'variantB', 'variantC', 'briefIds', 'variantIds', 'batchItemIds', 'expectedLearning'];
  const csvRows = rows.map(row => [
    row.experimentId,
    row.cellId,
    row.variableType,
    row.control,
    row.variantA,
    row.variantB,
    row.variantC,
    row.briefIds.join('|'),
    row.variantIds.join('|'),
    row.batchItemIds.join('|'),
    row.expectedLearning,
  ]);
  const csv = [header.join(','), ...csvRows.map(row => row.map(value => csvCell(String(value))).join(','))].join('\n');
  const markdown = [
    '# Experiment Variant Matrix',
    '',
    'Each cell changes one main variable only. No real platform API or ad delivery is connected.',
    '',
    ...rows.flatMap(row => [
      `## ${row.cellId}: ${row.variableType}`,
      `- Control: ${row.control}`,
      `- Variant A: ${row.variantA}`,
      `- Variant B: ${row.variantB}`,
      `- Variant C: ${row.variantC}`,
      `- Learning: ${row.expectedLearning}`,
      '',
    ]),
  ].join('\n');
  return { experimentId: experimentPlan.id, projectId: run.project.id, rows, markdown: scrubDeliveryText(markdown), csv };
}

export function analyzeExperimentResults(experimentPlan: ExperimentPlan, performanceRecords: ContentPerformanceRecord[]): ExperimentReport {
  const metric = experimentPlan.successMetrics.find(item => item.priority === 'primary') || experimentPlan.successMetrics[0] || { name: 'ctr', targetDirection: 'higher' as const, priority: 'primary' as const };
  const normalizedRecords = performanceRecords.map(calculatePerformanceMetrics);
  const guardrails = DEFAULT_EXPERIMENT_CONFIDENCE_GUARDRAILS;
  const guardrailText = buildExperimentSampleGuardrailText(metric.name, guardrails);
  const cellConfidence: ExperimentCellConfidence[] = experimentPlan.experimentCells.map(cell => {
    const records = normalizedRecords.filter(record =>
      record.cellId === cell.id ||
      (record.trackingCode || '').includes(cell.id.toUpperCase()) ||
      (record.trackingCode || '').includes(cell.id),
    );
    const controlRecords = records.filter(record => classifyExperimentRecordRole(record) === 'control');
    const taggedTestRecords = records.filter(record => classifyExperimentRecordRole(record) === 'test');
    const fallbackControlRecords = controlRecords.length > 0 ? controlRecords : records.slice(0, 1);
    const fallbackTestRecords = taggedTestRecords.length > 0
      ? taggedTestRecords
      : records.filter(record => !fallbackControlRecords.includes(record));
    const fallback = records[0] || normalizedRecords[0] || calculatePerformanceMetrics({
      id: `${cell.id}-fallback`,
      projectId: experimentPlan.projectId,
      cellId: cell.id,
      platform: experimentPlan.targetPlatforms[0] || 'TikTok',
      contentType: 'experiment',
      hook: cell.name,
      impressions: 0,
      views: 0,
      clicks: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      ctr: 0,
      engagementRate: 0,
      conversionRate: 0,
      revenue: 0,
      cost: 0,
      roas: 0,
      source: 'manual_entry',
      notes: '',
    });
    const controlAggregate = aggregateExperimentRecords(fallbackControlRecords, fallback, cell.id, 'control');
    const testAggregate = aggregateExperimentRecords(fallbackTestRecords, fallback, cell.id, 'test');
    const controlValue = metricValue(controlAggregate, metric.name);
    const testValue = metricValue(testAggregate, metric.name);
    const rawDelta = testValue - controlValue;
    const baseline = Math.max(Math.abs(controlValue), metric.name === 'saves' || metric.name === 'comments' ? 1 : 0.0001);
    const relativeLift = metric.targetDirection === 'higher'
      ? rawDelta / baseline
      : (controlValue - testValue) / baseline;
    const controlEstimatedOrders = experimentEstimatedOrders(controlAggregate);
    const testEstimatedOrders = experimentEstimatedOrders(testAggregate);
    const missingGuardrails: string[] = [];
    if (fallbackControlRecords.length === 0) missingGuardrails.push('缺少 control 记录');
    if (fallbackTestRecords.length === 0) missingGuardrails.push('缺少 test 记录');
    if (controlAggregate.impressions < guardrails.minImpressionsPerCell) missingGuardrails.push(`control 曝光 < ${guardrails.minImpressionsPerCell}`);
    if (testAggregate.impressions < guardrails.minImpressionsPerCell) missingGuardrails.push(`test 曝光 < ${guardrails.minImpressionsPerCell}`);
    if (controlAggregate.clicks < guardrails.minClicksPerCell) missingGuardrails.push(`control 点击 < ${guardrails.minClicksPerCell}`);
    if (testAggregate.clicks < guardrails.minClicksPerCell) missingGuardrails.push(`test 点击 < ${guardrails.minClicksPerCell}`);
    if ((metric.name === 'conversionRate' || metric.name === 'roas') && guardrails.minOrdersPerCell !== undefined) {
      if (controlEstimatedOrders < guardrails.minOrdersPerCell) missingGuardrails.push(`control 预估订单 < ${guardrails.minOrdersPerCell}`);
      if (testEstimatedOrders < guardrails.minOrdersPerCell) missingGuardrails.push(`test 预估订单 < ${guardrails.minOrdersPerCell}`);
    }
    const sampleSufficient = missingGuardrails.length === 0;
    const absoluteLift = Math.abs(relativeLift);
    let confidenceLevel: ExperimentConfidenceLevel = 'low';
    let conclusion: ExperimentConfidenceConclusion = 'needs_more_data';
    let recommendedAction: ExperimentConfidenceRecommendedAction = 'continue_collecting_data';
    let explanation = `当前还不能对这轮${experimentVariableTypeLabel(cell.variableType)}测试下结论。请继续补数。${guardrailText}`;
    if (fallbackControlRecords.length === 0 || fallbackTestRecords.length === 0) {
      explanation = `这个实验单元必须同时具备 control 和 test 记录后才能复盘。${guardrailText}`;
    } else if (!sampleSufficient && absoluteLift >= guardrails.minRelativeLiftForCandidate) {
      confidenceLevel = 'directional';
      conclusion = 'directional_signal';
      recommendedAction = 'continue_collecting_data';
      explanation = `这轮测试已经出现${relativeLift > 0 ? '正向' : '负向'}趋势，但还没有跨过样本门槛。在决定放大或淘汰之前，先继续收集数据。`;
    } else if (sampleSufficient && absoluteLift < guardrails.closeResultRelativeLift) {
      confidenceLevel = 'moderate';
      conclusion = 'inconclusive';
      recommendedAction = 'run_another_test';
      explanation = `在样本门槛达标后，当前提升仍落在 control 的 ${Math.round(guardrails.closeResultRelativeLift * 100)}% 以内，差异太近，暂时无法定论。`;
    } else if (sampleSufficient && relativeLift >= guardrails.minRelativeLiftForCandidate) {
      const hasStrongHeadroom =
        controlAggregate.impressions >= guardrails.minImpressionsPerCell * 2 &&
        testAggregate.impressions >= guardrails.minImpressionsPerCell * 2 &&
        controlAggregate.clicks >= guardrails.minClicksPerCell * 2 &&
        testAggregate.clicks >= guardrails.minClicksPerCell * 2 &&
        absoluteLift >= guardrails.minRelativeLiftForCandidate * 2;
      confidenceLevel = hasStrongHeadroom ? 'strong' : 'moderate';
      conclusion = 'candidate_winner';
      recommendedAction = 'scale_candidate_winner';
      explanation = `在跨过样本门槛后，test 在${metricLabel(metric.name)}上比 control 高出 ${Math.round(relativeLift * 100)}%。可以把它视作候选胜出方案，其余变量继续保持稳定。`;
    } else if (sampleSufficient && relativeLift <= -guardrails.minRelativeLiftForCandidate) {
      const hasStrongHeadroom =
        controlAggregate.impressions >= guardrails.minImpressionsPerCell * 2 &&
        testAggregate.impressions >= guardrails.minImpressionsPerCell * 2 &&
        controlAggregate.clicks >= guardrails.minClicksPerCell * 2 &&
        testAggregate.clicks >= guardrails.minClicksPerCell * 2 &&
        absoluteLift >= guardrails.minRelativeLiftForCandidate * 2;
      confidenceLevel = hasStrongHeadroom ? 'strong' : 'moderate';
      conclusion = 'candidate_loser';
      recommendedAction = 'retire_weak_variant';
      explanation = `在样本达标后，test 在${metricLabel(metric.name)}上比 control 低了 ${Math.round(absoluteLift * 100)}%。建议淘汰弱势变体，并继续复用稳定 control。`;
    } else if (sampleSufficient) {
      confidenceLevel = 'moderate';
      conclusion = 'inconclusive';
      recommendedAction = 'refine_hypothesis';
      explanation = `虽然这个实验单元已经跨过样本门槛，但提升仍低于 ${Math.round(guardrails.minRelativeLiftForCandidate * 100)}% 的高置信度阈值，因此还不能给出明确判断。`;
    }
    return {
      cellId: cell.id,
      metric: metric.name,
      confidenceLevel,
      conclusion,
      recommendedAction,
      sampleSufficient,
      sampleGuardrail: guardrailText,
      missingGuardrails,
      controlRecords: fallbackControlRecords.length,
      testRecords: fallbackTestRecords.length,
      controlImpressions: controlAggregate.impressions,
      testImpressions: testAggregate.impressions,
      controlClicks: controlAggregate.clicks,
      testClicks: testAggregate.clicks,
      controlEstimatedOrders: metric.name === 'conversionRate' || metric.name === 'roas' ? controlEstimatedOrders : undefined,
      testEstimatedOrders: metric.name === 'conversionRate' || metric.name === 'roas' ? testEstimatedOrders : undefined,
      controlValue: roundMetric(controlValue),
      testValue: roundMetric(testValue),
      delta: roundMetric(rawDelta),
      relativeLift: roundMetric(relativeLift),
      explanation,
    };
  });
  const deltas: ExperimentMetricDelta[] = cellConfidence.map(item => ({
    cellId: item.cellId,
    metric: item.metric,
    controlValue: item.controlValue,
    testValue: item.testValue,
    delta: item.delta,
    relativeLift: item.relativeLift,
    conclusion: item.conclusion === 'candidate_winner' ? 'winner' : item.conclusion === 'candidate_loser' ? 'loser' : 'inconclusive',
  }));
  const winningCells = cellConfidence.filter(item => item.conclusion === 'candidate_winner').map(item => item.cellId);
  const losingCells = cellConfidence.filter(item => item.conclusion === 'candidate_loser').map(item => item.cellId);
  const inconclusiveCells = cellConfidence.filter(item => item.conclusion !== 'candidate_winner' && item.conclusion !== 'candidate_loser').map(item => item.cellId);
  const confidenceSummary = summarizeExperimentCellConfidence(experimentPlan.id, cellConfidence, guardrailText);
  const learningSummary = confidenceSummary.conclusion === 'needs_more_data'
    ? '当前数据不足以支持高置信度结论。请继续补充手动录入或 CSV 结果，再决定是否放大。'
    : confidenceSummary.briefExplanation;
  const nextAction = confidenceSummary.recommendedAction === 'scale_candidate_winner'
    ? '把候选胜出方案带入下一轮生产批次，同时保持其他变量稳定。'
    : confidenceSummary.recommendedAction === 'retire_weak_variant'
      ? '下一轮先淘汰弱势变体，继续复用稳定的 control。'
      : confidenceSummary.recommendedAction === 'refine_hypothesis'
        ? '先收紧假设，再补做一轮更干净的单变量测试。'
        : '先不要放大，继续补充手动录入或 CSV 结果后再做判断。';
  const markdown = [
    '# 实验复盘报告',
    '',
    `实验名称：${experimentPlan.name}`,
    `主指标：${metricLabel(metric.name)}`,
    '',
    '## 结果概览',
    `- 胜出单元：${winningCells.join(' / ') || '暂无'}`,
    `- 弱势单元：${losingCells.join(' / ') || '暂无'}`,
    `- 结论不充分单元：${inconclusiveCells.join(' / ') || '暂无'}`,
    '',
    '## 实验置信度复盘',
    `- 置信等级：${experimentConfidenceLevelLabel(confidenceSummary.confidenceLevel)}`,
    `- 当前结论：${experimentConclusionLabel(confidenceSummary.conclusion)}`,
    `- 建议动作：${experimentRecommendedActionLabel(confidenceSummary.recommendedAction)}`,
    `- 样本门槛：${confidenceSummary.sampleGuardrail}`,
    '',
    '## 指标差异',
    ...deltas.map(item => `- ${item.cellId}：${metricLabel(item.metric)}，control ${item.controlValue}，test ${item.testValue}，差值 ${item.delta}，相对提升 ${item.relativeLift}，${item.conclusion === 'winner' ? '胜出' : item.conclusion === 'loser' ? '偏弱' : '结论不充分'}`),
    '',
    '## 单元判断',
    ...cellConfidence.map(item => `- ${item.cellId}：${experimentConfidenceLevelLabel(item.confidenceLevel)} / ${experimentConclusionLabel(item.conclusion)} / ${experimentRecommendedActionLabel(item.recommendedAction)}。${item.explanation}`),
    '',
    `当前学习：${learningSummary}`,
    `下一步动作：${nextAction}`,
    '',
    '边界说明：当前只使用手动录入或 CSV 表现数据，不连接真实平台 API。',
  ].join('\n');
  return {
    experimentId: experimentPlan.id,
    winningCells,
    losingCells,
    inconclusiveCells,
    metricDeltas: deltas,
    cellConfidence,
    confidenceSummary,
    learningSummary,
    nextAction,
    markdown: scrubDeliveryText(markdown),
  };
}

export function buildExperimentPlanMarkdown(plan?: ExperimentPlan) {
  if (!plan) return '# 实验计划\n\n当前还没有实验计划，请先根据表现洞察生成。';
  return scrubDeliveryText([
    '# 实验计划',
    '',
    '当前仅提供本地优先的实验编排，不连接真实平台 API、不做真实投放，也不做爬取。',
    '',
    `计划名称：${plan.name}`,
    `实验目标：${plan.goal}`,
    `实验假设：${plan.hypothesis}`,
    `状态：${plan.status}`,
    `测试窗口：${plan.testWindow}`,
    `目标平台：${plan.targetPlatforms.join(' / ')}`,
    '',
    '## 成功指标',
    ...plan.successMetrics.map(metric => `- ${metric.priority === 'primary' ? '主指标' : '次指标'}：${metricLabel(metric.name)}，目标方向为${metric.targetDirection === 'higher' ? '更高' : '更低'}${metric.benchmarkValue !== undefined ? `，参考阈值 ${metric.benchmarkValue}` : ''}`),
    '',
    '## 实验单元',
    ...plan.experimentCells.flatMap(cell => [
      `### ${cell.id}：${cell.name}`,
      `- 变量类型：${experimentVariableTypeLabel(cell.variableType)}`,
      `- Control：${cell.controlValue}`,
      `- Test：${cell.testValue}`,
      `- 预期学习：${cell.expectedLearning}`,
    ]),
    '',
    '## 生产分配',
    ...plan.productionAssignments.map(item => `- ${item.id}：${item.platform} / ${item.contentType} / ${item.status} / ${item.suggestedPublishDate.slice(0, 10)}`),
  ].join('\n'));
}

export function buildTrackingPlanMarkdown(plan?: ExperimentPlan) {
  if (!plan) return '# 追踪命名规则\n\n当前还没有追踪命名规则。';
  return [
    '# 追踪命名规则',
    '',
    `命名规范：${plan.trackingPlan.namingConvention}`,
    '',
    '## 追踪编码',
    ...plan.trackingPlan.trackingCodes.map(code => `- ${code}`),
    '',
    '## 手动录入字段',
    plan.trackingPlan.manualEntryFields.join(', '),
  ].join('\n');
}

export function buildExperimentConfidenceMarkdown(plan?: ExperimentPlan, report?: ExperimentReport) {
  if (!plan || !report) return '# 实验置信度\n\n当前还没有实验置信度复盘。';
  const summary = report.confidenceSummary;
  const directionalNotes = report.cellConfidence
    .filter(item => item.conclusion === 'directional_signal' || item.conclusion === 'needs_more_data')
    .map(item => `${item.cellId}: ${item.explanation}`);
  const safeNotes = directionalNotes.length > 0 ? directionalNotes : ['当前没有被样本门槛卡住的实验单元。'];
  return scrubDeliveryText([
    '# 实验置信度',
    '',
    `实验名称：${plan.name}`,
    `主指标：${metricLabel(plan.successMetrics.find(item => item.priority === 'primary')?.name || plan.successMetrics[0]?.name || 'ctr')}`,
    '',
    '## 置信等级',
    `- 置信等级：${experimentConfidenceLevelLabel(summary.confidenceLevel)}`,
    `- 当前结论：${experimentConclusionLabel(summary.conclusion)}`,
    '',
    '## 样本门槛',
    `- ${summary.sampleGuardrail}`,
    `- 样本达标单元：${summary.sufficientCellCount}/${plan.experimentCells.length}`,
    `- 仅停留在方向性信号的单元：${summary.directionalCellCount}`,
    '',
    '## 目前可以判断什么',
    `- ${summary.briefExplanation}`,
    ...report.cellConfidence.map(item => `- ${item.cellId}：${experimentConfidenceLevelLabel(item.confidenceLevel)} / ${experimentConclusionLabel(item.conclusion)} / ${experimentRecommendedActionLabel(item.recommendedAction)}`),
    '',
    '## 目前还不能判断什么',
    ...safeNotes.map(item => `- ${item}`),
    '',
    '## 下一步建议',
    `- ${experimentRecommendedActionLabel(summary.recommendedAction)}`,
    `- ${report.nextAction}`,
    '',
    '边界说明：当前只使用手动录入或 CSV 表现数据，不连接真实平台 API。',
  ].join('\n'));
}

export function buildExperimentMemoryMarkdown(summary?: ExperimentMemorySummary) {
  if (!summary) return '# 实验记忆\n\n当前还没有实验记忆。';
  return scrubDeliveryText([
    '# 实验记忆',
    '',
    summary.briefSummary,
    '',
    '## 可复用学习',
    ...(summary.reusablePatterns.length > 0
      ? summary.reusablePatterns.map(item => `- ${item.title}: ${item.guidance}`)
      : ['- 当前还没有可复用的胜出模式。']),
    '',
    '## 方向性观察信号',
    ...(summary.watchlistPatterns.length > 0
      ? summary.watchlistPatterns.map(item => `- ${item.title}: ${item.guidance}`)
      : ['- 当前还没有方向性观察信号。']),
    '',
    '## 避免直接复用 / 需要重做',
    ...(summary.avoidPatterns.length > 0
      ? summary.avoidPatterns.map(item => `- ${item.title}: ${item.guidance}`)
      : ['- 当前还没有需要避免或重做的模式。']),
    '',
    '边界说明：这里只记录本地实验记忆，不假设存在广告账户历史或真实平台 API 数据。',
  ].join('\n'));
}

export function buildExperimentPriorityQueueMarkdown(queue?: ExperimentPriorityQueue) {
  if (!queue) return '# 下一轮实验优先队列\n\n当前还没有优先队列。';
  return scrubDeliveryText([
    '# 下一轮实验优先队列',
    '',
    queue.briefSummary,
    '',
    '## 优先候选项',
    ...(queue.candidates.length > 0
      ? queue.candidates.map(item => `- ${item.candidateName}：${experimentPriorityBandLabel(item.priorityBand)}（${item.priorityScore} 分）/ 重复测试风险${experimentDuplicateRiskLabel(item.duplicateRisk)} / ${item.reason}。下一步：${item.nextRecommendedTest}`)
      : ['- 当前还没有候选项。']),
    '',
    '边界说明：这里只做确定性的本地优先级排序，不连接预算分配器、投放自动化或真实竞价系统。',
  ].join('\n'));
}

export function buildExperimentLearningGapMapMarkdown(gapMap?: ExperimentLearningGapMap) {
  if (!gapMap) return '# 内容增长学习地图\n\n当前还没有学习缺口地图。';
  return scrubDeliveryText([
    '# 内容增长学习地图',
    '',
    gapMap.summary,
    '',
    '## 变量覆盖情况',
    ...gapMap.gaps.map(gap => `- ${experimentVariableTypeLabel(gap.variableType)}：${experimentLearningStatusLabel(gap.status)} / 证据数 ${gap.evidenceCount}。${gap.strongestLearning}`),
    '',
    '## 仍待回答的问题',
    ...gapMap.gaps.map(gap => `- ${experimentVariableTypeLabel(gap.variableType)}：${gap.unresolvedQuestion}`),
    '',
    '## 下一步建议',
    ...gapMap.gaps.map(gap => `- ${experimentVariableTypeLabel(gap.variableType)}：${gap.recommendedNextMove}（${gap.riskNote}）`),
    '',
    '边界说明：这里只构建本地学习地图，不假设存在跨账户实验历史或真实平台 API。',
  ].join('\n'));
}

export function buildExperimentSequencingPlanMarkdown(plan?: ExperimentSequencingPlan) {
  if (!plan) return '# 下一轮实验路线图\n\n当前还没有实验路线图。';
  return scrubDeliveryText([
    '# 下一轮实验路线图',
    '',
    plan.summary,
    '',
    `当前最重要的待解问题：${plan.topUnresolvedQuestion}`,
    '',
    '## 路线步骤',
    ...plan.steps.flatMap(step => [
      `### 第 ${step.stepNumber} 步：${experimentVariableTypeLabel(step.primaryVariableType)}`,
      `- 优先级：${experimentPriorityBandLabel(step.priorityBand)}`,
      `- 重复测试风险：${experimentDuplicateRiskLabel(step.duplicateRisk)}`,
      `- 假设：${step.hypothesis}`,
      `- 为什么现在做：${step.whyNow}`,
      `- Control 指引：${step.controlGuidance}`,
      `- Test 指引：${step.testGuidance}`,
      `- 预期学习：${step.expectedLearning}`,
      `- 依赖关系：${step.dependency}`,
      `- 停止 / 继续规则：${step.stopOrContinueRule}`,
      '',
    ]),
    '边界说明：这里只做确定性的本地实验排序，不连接实时流量自动化或预算分配器。',
  ].join('\n'));
}

export function buildExperimentValidationPolicyMarkdown(policy?: ExperimentValidationPolicy) {
  if (!policy) return '# 实验验证策略\n\n当前还没有实验验证策略。';
  return scrubDeliveryText([
    '# 实验验证策略',
    '',
    policy.summary,
    '',
    '## 放大规则',
    ...(policy.rolloutRules.length > 0
      ? policy.rolloutRules.map(rule => `- ${experimentVariableTypeLabel(rule.targetVariableType)} / ${experimentValidationDecisionLabel(rule.decision)} / 风险${experimentRolloutRiskLabel(rule.riskLevel)}：${rule.whyAllowed}。下一步检查指标：${metricLabel(rule.nextCheckMetric)}。停止条件：${rule.stopCondition}`)
      : ['- 当前没有适合直接放大的实验项。']),
    '',
    '## 停止规则',
    ...(policy.stopRules.length > 0
      ? policy.stopRules.map(rule => `- ${rule.variantOrVariable}：${rule.stopReason}。触发条件：${rule.metricTrigger}。替代建议：${rule.suggestedReplacement}`)
      : ['- 当前没有需要立即停止的实验项。']),
    '',
    '## 暂不应下结论',
    ...(policy.noDecisionYet.length > 0
      ? policy.noDecisionYet.map(item => `- ${item}`)
      : ['- 当前没有被样本门槛卡住的实验项。']),
    '',
    '## 必须继续验证的内容',
    ...(policy.validationBacklog.length > 0
      ? policy.validationBacklog.map(item => `- ${item}`)
      : ['- 当前没有额外的验证积压项。']),
    '',
    '边界说明：这里只输出本地确定性实验决策规则，不连接真实广告平台、预算系统或自动投放。',
  ].join('\n'));
}

export function buildExperimentDecisionSummaryMarkdown(summary?: ExperimentDecisionSummary) {
  if (!summary) return '# 实验决策摘要\n\n当前还没有实验决策摘要。';
  return scrubDeliveryText([
    '# 实验决策摘要',
    '',
    `- 当前主决策：${experimentValidationDecisionLabel(summary.topDecision)}`,
    `- 风险等级：${experimentRolloutRiskLabel(summary.riskLevel)}`,
    `- 为什么这样判断：${summary.whyThisDecision}`,
    `- 下一步检查指标：${summary.nextCheckMetric}`,
    `- 停止条件：${summary.stopCondition}`,
    '',
    '## 可以小范围放大的内容',
    ...(summary.canRollout.length > 0
      ? summary.canRollout.map(item => `- ${item}`)
      : ['- 当前没有适合小范围放大的实验项。']),
    '',
    '## 必须继续验证的内容',
    ...(summary.mustValidate.length > 0
      ? summary.mustValidate.map(item => `- ${item}`)
      : ['- 当前没有额外待验证项。']),
    '',
    '## 放大 / 停止建议',
    ...(summary.stopNow.length > 0
      ? summary.stopNow.map(item => `- ${item}`)
      : ['- 当前没有需要立即停止的实验项。']),
    '',
    '## 暂不应下结论',
    ...(summary.noDecisionYet.length > 0
      ? summary.noDecisionYet.map(item => `- ${item}`)
      : ['- 当前没有被样本门槛卡住的实验项。']),
  ].join('\n'));
}

export function buildExperimentExecutionPlaybookMarkdown(playbook?: ExperimentExecutionPlaybook) {
  if (!playbook) return '# 实验执行手册\n\n当前还没有实验执行手册。';
  return scrubDeliveryText([
    '# 实验执行手册',
    '',
    playbook.summary,
    '',
    `- 当前决策：${experimentValidationDecisionLabel(playbook.currentDecision)}`,
    `- 实验目标：${playbook.experimentObjective}`,
    `- 主变量：${experimentVariableTypeLabel(playbook.primaryVariableType)}`,
    '',
    '## 所需材料',
    ...playbook.requiredMaterials.map(item => `- ${item}`),
    '',
    '## 生产任务',
    ...playbook.productionTasks.map(task => `- [${experimentExecutionStageLabel(task.stage)}] ${task.title}：${task.description}`),
    '',
    '## 发布前必须确认',
    ...playbook.launchChecklist.map(item => `- ${item}`),
    '',
    '## 命名与追踪提醒',
    ...playbook.trackingNamingReminders.map(item => `- ${item}`),
    '',
    '## 数据回收节奏',
    `- ${playbook.monitoringCadence}`,
    `- 决策检查点：${playbook.decisionCheckpoint}`,
    '',
    '## 何时停止方案',
    `- ${playbook.stopCondition}`,
    '',
    '## 复盘归档要求',
    `- ${playbook.archiveRequirement}`,
    '',
    '## 结果后的下一步',
    `- ${playbook.nextActionAfterResult}`,
  ].join('\n'));
}

export function buildExperimentCadencePlanMarkdown(plan?: ExperimentCadencePlan) {
  if (!plan) return '# 实验节奏安排\n\n当前还没有实验节奏安排。';
  return scrubDeliveryText([
    '# 实验节奏安排',
    '',
    plan.summary,
    '',
    `- 当前决策：${experimentValidationDecisionLabel(plan.currentDecision)}`,
    `- 数据回收节奏：${plan.monitoringCadence}`,
    `- 下一步检查指标：${plan.nextCheckpoint}`,
    `- 停止条件：${plan.stopCondition}`,
    '',
    '## 何时继续观察',
    ...plan.rules.filter(rule => rule.triggerDecision === 'validate_more' || rule.triggerDecision === 'do_not_decide').map(rule => `- ${rule.timing}：${rule.action}（${rule.checkpoint}）`),
    '',
    '## 何时小范围放大',
    ...plan.rules.filter(rule => rule.triggerDecision === 'small_rollout' || rule.triggerDecision === 'scale_candidate').map(rule => `- ${rule.timing}：${rule.action}（${rule.checkpoint}）`),
    '',
    '## 何时停止方案',
    ...plan.rules.filter(rule => rule.triggerDecision === 'stop_variant' || rule.triggerDecision === 'rework_hypothesis').map(rule => `- ${rule.timing}：${rule.action}（${rule.checkpoint}）`),
  ].join('\n'));
}

export function buildExperimentOperatorChecklistMarkdown(checklist?: ExperimentOperatorChecklist) {
  if (!checklist) return '# 操作检查表\n\n当前还没有操作检查表。';
  return scrubDeliveryText([
    '# 操作检查表',
    '',
    checklist.summary,
    '',
    ...checklist.sections.flatMap(section => [
      `## ${section.title}`,
      ...section.items.map(item => `- ${item.required ? '[必做]' : '[建议]'} ${item.title}：${item.description}。跳过风险：${item.riskIfSkipped}。备注：${item.userFacingNote}`),
      '',
    ]),
  ].join('\n').trim());
}

export function buildExperimentWorkbenchMarkdown(
  board?: ExperimentWorkbenchBoard,
  historySummary?: ListingFactoryRunHistorySummary,
  archiveRecord?: ExperimentArchiveRecord,
) {
  if (!board) return '# 本地实验操作台\n\n当前还没有本地实验操作台摘要。';
  const history = historySummary || {
    items: board.recentRuns,
    totalRuns: board.recentRuns.length,
    activeRuns: board.recentRuns.filter(item => item.archiveStatus === 'active').length,
    archivedRuns: board.recentRuns.filter(item => item.archiveStatus === 'archived').length,
    latestRunId: board.recentRuns[0]?.runId,
    summary: board.recentRuns.length > 0 ? `最近共有 ${board.recentRuns.length} 条本地运行记录。` : '当前还没有本地运行记录。',
  };
  const archive = archiveRecord || (board.recentRuns[0] ? {
    runId: board.recentRuns[0].runId,
    archivedAt: board.generatedAt,
    currentDecision: board.recentRuns[0].currentDecision,
    confidenceLevel: board.recentRuns[0].confidenceLevel,
    learningSummary: board.recentRuns[0].topLearning,
    nextAction: board.recentRuns[0].nextRecommendedAction,
    deliveryPackageAvailable: board.recentRuns[0].deliveryPackageAvailable,
    archiveStatus: board.recentRuns[0].archiveStatus,
  } satisfies ExperimentArchiveRecord : undefined);
  return scrubDeliveryText([
    '# 本地实验操作台',
    '',
    board.summary,
    '',
    '## 当前运行状态',
    `- ${workbenchStatusLabel(board.currentStatus)}`,
    `- 最高优先级动作：${board.highestPriorityAction.title}`,
    `- 决策状态：${experimentValidationDecisionLabel(board.highestPriorityAction.currentDecision)}`,
    `- 置信等级：${experimentConfidenceLevelLabel(board.highestPriorityAction.confidenceLevel)}`,
    `- 下一步检查指标：${board.highestPriorityAction.nextCheckMetric ? metricLabel(board.highestPriorityAction.nextCheckMetric) : '当前未指定'}`,
    `- 待处理检查项：${board.highestPriorityAction.openChecklistCount}`,
    '',
    '## 下一步动作',
    ...board.nextActionQueue.map(action => `- ${action.title}：${action.description}`),
    '',
    '## 待补数据',
    ...(board.pendingDataActions.length > 0 ? board.pendingDataActions.map(action => `- ${action.description}`) : ['- 当前没有待补数据动作。']),
    '',
    '## 待验证实验',
    ...(board.validationActions.length > 0 ? board.validationActions.map(action => `- ${action.description}`) : ['- 当前没有待验证实验动作。']),
    '',
    '## 可小范围放大',
    ...(board.rolloutActions.length > 0 ? board.rolloutActions.map(action => `- ${action.description}`) : ['- 当前没有可放大但需监控的动作。']),
    '',
    '## 应停止方案',
    ...(board.stopActions.length > 0 ? board.stopActions.map(action => `- ${action.description}`) : ['- 当前没有应停止方案。']),
    '',
    '## 待归档复盘',
    ...(board.archiveActions.length > 0 ? board.archiveActions.map(action => `- ${action.description}`) : ['- 当前没有待归档动作。']),
    '',
    '## 最近运行记录',
    ...(history.items.length > 0
      ? history.items.slice(0, 3).map(item => `- ${item.primaryProductName} / ${experimentValidationDecisionLabel(item.currentDecision)} / ${experimentConfidenceLevelLabel(item.confidenceLevel)} / ${experimentArchiveStatusLabel(item.archiveStatus)}`)
      : ['- 当前还没有本地运行记录。']),
    '',
    '## 本地归档',
    ...(archive ? [
      `- 学习摘要：${archive.learningSummary}`,
      `- 下一步建议：${archive.nextAction}`,
      `- 交付包：${archive.deliveryPackageAvailable ? '已生成' : '未生成'}`,
      `- 归档状态：${experimentArchiveStatusLabel(archive.archiveStatus)}`,
    ] : ['- 当前还没有归档记录。']),
  ].join('\n'));
}

export function buildFactoryOperatingReview(run: Pick<ListingFactoryRun, 'project' | 'briefs' | 'tasks' | 'calendarItems' | 'report'> & Partial<ListingFactoryRun>): FactoryOperatingReview {
  const hasProductionAssets = (run.scripts?.length || 0) > 0 && (run.storyboards?.length || 0) > 0 && Boolean(run.assetPlan);
  const hasBatchLayer = (run.productionBatches?.length || 0) > 0 && (run.editPacks?.length || 0) > 0;
  const hasVideoLayer = (run.videoAssemblyJobs?.length || 0) > 0;
  const hasPerformanceData = (run.performanceRecords?.length || 0) > 0;
  const hasPerformanceLayer = Boolean(run.performanceFeedbackReport) && (run.performanceInsights?.length || 0) > 0;
  const hasExperimentLayer = (run.experimentPlans?.length || 0) > 0 && (run.experimentVariantMatrices?.length || 0) > 0;
  const hasDeliveryPackage = Boolean(run.deliveryPackage?.markdown || run.report?.clientSummary);
  const hasLocalPersistence = hasDeliveryPackage && Boolean(run.deliveryPackage?.projectJson);
  const capabilities: FactoryOperatingReviewCapability[] = [
    {
      id: 'sku-to-brief',
      label: 'SKU to Brief pipeline',
      status: run.briefs.length >= 6 && run.tasks.length > 0 ? 'shipped' : 'partial',
      evidence: [`${run.briefs.length} briefs`, `${run.tasks.length} tasks`, `${run.calendarItems.length} calendar items`],
      nextStep: 'Keep tightening category rules, brand guardrails and brief quality scoring.',
    },
    {
      id: 'production-assets',
      label: 'Production asset layer',
      status: hasProductionAssets ? 'shipped' : 'partial',
      evidence: [`${run.scripts?.length || 0} scripts`, `${run.storyboards?.length || 0} storyboards`, `${run.assets?.length || 0} local assets`],
      nextStep: 'Add stronger asset relink and brand-material reuse before real cloud storage.',
    },
    {
      id: 'batch-edit-pack',
      label: 'Batch production and edit pack',
      status: hasBatchLayer ? 'shipped' : 'partial',
      evidence: [`${run.productionBatches?.length || 0} batches`, `${run.editPacks?.length || 0} edit packs`],
      nextStep: 'Expose clearer operator ownership, publish windows and QA gates per batch item.',
    },
    {
      id: 'video-assembly',
      label: '视频组装适配层',
      status: hasVideoLayer ? 'partial' : 'missing',
      evidence: [`${run.videoAssemblyJobs?.length || 0} 个本地 mock 任务`, run.videoQaSummary ? `QA ${run.videoQaSummary.score}` : '当前没有视频 QA'],
      nextStep: '在明确选定真实渲染提供方之前，继续把 provider 边界保持为 mock。',
    },
    {
      id: 'performance-feedback',
      label: '表现反馈闭环',
      status: hasPerformanceData ? 'shipped' : hasPerformanceLayer ? 'partial' : 'missing',
      evidence: [`${run.performanceRecords?.length || 0} 条手动 / CSV 记录`, `${run.performanceInsights?.length || 0} 条洞察`],
      nextStep: '继续强化手动导入质量、置信标签和前后对比学习备注。',
    },
    {
      id: 'experiment-orchestration',
      label: '实验编排层',
      status: hasExperimentLayer ? 'partial' : 'missing',
      evidence: [`${run.experimentPlans?.length || 0} 份计划`, `${run.experimentReports?.length || 0} 份复盘报告`],
      nextStep: '在连接真实广告数据前，先把样本量指引和单变量门槛补齐。',
    },
    {
      id: 'delivery-package',
      label: '交付包',
      status: hasDeliveryPackage ? 'shipped' : 'partial',
      evidence: [run.deliveryPackage?.ready ? '交付包已标记 ready' : '交付包已在本地生成', run.deliveryPackage?.projectJson ? '已包含 JSON 导出' : 'JSON 导出待补充'],
      nextStep: '把工厂运营评估纳入每次客户交接和内部 QA 的固定环节。',
    },
    {
      id: 'merchant-context',
      label: '商家上下文记忆',
      status: hasLocalPersistence ? 'partial' : 'missing',
      evidence: ['当前仅支持本地浏览器存储和 JSON 导出', '这一阶段不做账号、团队工作区或云端记忆'],
      nextStep: '在云端协作之前，先把本地品牌上下文卡和可复用 SKU 记忆补齐。',
    },
  ];
  const maturityScore = clampScore(Math.round(capabilities.reduce((sum, item) => {
    if (item.status === 'shipped') return sum + 12;
    if (item.status === 'partial') return sum + 7;
    return sum;
  }, 0) + (run.qualityGate?.score || 70) * 0.08));
  const currentStrengths = [
    '这个产品已经更像一台本地优先的电商内容生产工厂，而不是单次提示词工具。',
    '当前交付链路已经覆盖 Brief、脚本、分镜、素材需求、批量生产、编辑包、视频组装 mock 和反馈规划。',
    '引擎具备确定性的本地 fallback，核心 demo 不会被模型 key 卡死。',
    '表现反馈和实验编排已经能基于手动录入或 CSV 数据，形成下一轮运行闭环。',
  ];
  const gaps = [
    '除了浏览器存储和 JSON 导出之外，当前还没有更耐久的商家上下文层。',
    '当前实验层还没有连接真实平台数据和真实投放边界，这一阶段是有意保持本地化的。',
    '还没有团队工作流、复核分配或云端协作模型。',
    '还没有真实客户证明闭环，所以对外业务表达仍应保持为运营假设。',
  ];
  const nextDevelopmentPlan: FactoryOperatingReviewPriority[] = [
    {
      id: 'p0-context-cards',
      title: '本地商家上下文记忆卡',
      rationale: 'Wenai 需要把 SKU、品牌语气、边界条件和素材记忆沉淀下来，让每次运行都能在上一轮基础上累积，而不是重新冷启动。',
      implementationHint: '补齐本地 BrandContext 模型、JSON 导出，以及一个能反哺 Listing Factory 默认生成参数的小型 UI 面板。',
      verification: '用单测覆盖上下文往返导入导出，并验证生成的 Brief 能在无云存储情况下继承品牌边界。',
    },
    {
      id: 'p0-experiment-confidence',
      title: '实验置信度与样本门槛',
      rationale: '在真实平台集成尚未接入前，实验层必须先避免因为薄样本而过度下结论。',
      implementationHint: '给 ExperimentReport 补上置信标签、最小曝光校验和下一步收数建议。',
      verification: '通过聚焦测试覆盖薄样本、平衡 control/test 数据，以及胜出 / 弱势结论。',
    },
    {
      id: 'p1-operator-workflow',
      title: '运营执行角色与动作分配',
      rationale: '这条工厂链路已经能产出很多资产，但在内容、编辑、复核、交付之间“下一步谁来做什么”仍然偏弱。',
      implementationHint: '在不新增大页面的前提下，给批次、编辑包和实验面板补上角色分配、时间窗口和 QA 状态。',
      verification: '跑一遍 UI smoke build，再用单测覆盖 assignment 序列化。',
    },
    {
      id: 'p1-demo-proof-pack',
      title: '五个黄金项目的 demo 证明包',
      rationale: '产品还需要一层买家看得懂的证明材料，在不依赖真实客户的情况下展示更具体的前后对比产物。',
      implementationHint: '生成一份紧凑的黄金项目复盘导出，包含能力覆盖、风险边界和下一步销售表达。',
      verification: '通过 Production RC 测试确认每个黄金项目 run 都有非空 proof pack。',
    },
  ];
  const markdown = [
    '# 工厂运营评估',
    '',
    `项目：${run.project.productName}`,
    '产品形态：本地优先的电商内容协作员与生产工厂。',
    `成熟度评分：${maturityScore}`,
    '',
    '## 当前优势',
    ...currentStrengths.map(item => `- ${item}`),
    '',
    '## 能力地图',
    ...capabilities.map(item => `- ${item.label}：${factoryCapabilityStatusLabel(item.status)}。证据：${item.evidence.join(' / ')}。下一步：${item.nextStep}`),
    '',
    '## 当前不足',
    ...gaps.map(item => `- ${item}`),
    '',
    '## 下一步开发计划',
    ...nextDevelopmentPlan.map(item => `- ${item.id}：${item.title}。${item.rationale} 实现建议：${item.implementationHint} 验证方式：${item.verification}`),
    '',
    '边界说明：当前只做本地优先评估，不假设账号系统、订阅、Stripe、真实平台 API、爬取能力或真实投放链路。',
  ].join('\n');
  return {
    projectId: run.project.id,
    productShape: '本地优先的电商内容协作员与生产工厂',
    maturityScore,
    capabilitySummary: capabilities,
    currentStrengths,
    gaps,
    nextDevelopmentPlan,
    operatingBoundary: '当前只做本地优先评估，不依赖真实用户、API key、平台 API、爬取、订阅或投放链路。',
    markdown: scrubDeliveryText(markdown),
  };
}

export function buildFactoryOperatingReviewMarkdown(review?: FactoryOperatingReview) {
  return review?.markdown || '# 工厂运营评估\n\n当前还没有生成运营评估。';
}

export function buildMerchantContextCard(
  run: Pick<ListingFactoryRun, 'project'> & Partial<ListingFactoryRun>,
  now = new Date('2026-05-12T09:00:00Z'),
): MerchantContextCard {
  const project = run.project;
  const topBriefs = (run.briefs || [])
    .slice()
    .sort((a, b) => b.qualityScore.overallScore - a.qualityScore.overallScore)
    .slice(0, 3);
  const assets = run.assets || [];
  const reusableAssets = assets.filter(asset => !asset.hasSessionFile).slice(0, 8).map(asset => asset.name);
  const sessionAssets = assets.filter(asset => asset.hasSessionFile).slice(0, 8).map(asset => asset.name);
  const winningPatterns = (run.performanceInsights || [])
    .filter(insight => insight.type === 'winning_pattern')
    .map(insight => insight.title)
    .slice(0, 5);
  const weakPatterns = (run.performanceInsights || [])
    .filter(insight => insight.type === 'weak_pattern' || insight.type === 'creative_risk')
    .map(insight => insight.title)
    .slice(0, 5);
  const nextTestIdeas = [
    ...(run.regenerationPlan?.nextBriefAngles || []),
    ...((run.experimentPlans || [])[0]?.experimentCells || []).map(cell => `${cell.variableType}: ${cell.expectedLearning}`),
  ].slice(0, 6);
  const reusableSellingPoints = unique([
    ...project.sellingPoints,
    ...topBriefs.flatMap(brief => [brief.contentType, brief.reusableStructure]),
  ].filter(Boolean)).slice(0, 8);
  const brandVoice = sanitizeRiskyCopy(
    topBriefs[0]?.voiceoverDirection || `Practical, buyer-facing ecommerce copy for ${project.category}.`,
    project.brandGuardrails,
  );
  const audienceSummary = sanitizeRiskyCopy(
    project.targetAudience || topBriefs[0]?.hook || 'Target buyer needs to be confirmed.',
    project.brandGuardrails,
  );
  const generationDefaults: ListingProjectInput = {
    productName: project.productName,
    category: project.category,
    targetPlatforms: project.targetPlatforms,
    priceBand: project.priceBand,
    sellingPoints: reusableSellingPoints.length > 0 ? reusableSellingPoints : project.sellingPoints,
    targetAudience: audienceSummary,
    contentGoal: project.contentGoal,
    brandGuardrails: project.brandGuardrails,
    categoryRules: project.categoryRules,
    competitorNotes: project.competitorNotes,
  };
  const cardWithoutMarkdown = {
    id: `merchant-context-${project.id}`,
    projectId: project.id,
    productName: project.productName,
    category: project.category,
    targetPlatforms: project.targetPlatforms,
    priceBand: project.priceBand,
    brandVoice,
    audienceSummary,
    reusableSellingPoints,
    brandGuardrails: project.brandGuardrails,
    categoryRules: project.categoryRules,
    assetMemory: {
      totalAssets: assets.length,
      reusableAssetNames: reusableAssets,
      sessionOnlyAssetNames: sessionAssets,
      missingAssetNeeds: (run.assetPlan?.missingAssets || []).slice(0, 8),
    },
    performanceMemory: {
      winningPatterns,
      weakPatterns,
      nextTestIdeas,
    },
    generationDefaults,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const markdown = [
    '# 商家上下文记忆卡',
    '',
    `项目：${project.productName}`,
    `类目：${project.category}`,
    `目标平台：${project.targetPlatforms.join(' / ')}`,
    `价格带：${project.priceBand}`,
    '',
    '## 品牌语气',
    brandVoice,
    '',
    '## 目标人群',
    audienceSummary,
    '',
    '## 可复用卖点',
    ...(reusableSellingPoints.length ? reusableSellingPoints.map(item => `- ${item}`) : ['- 下一轮生成前，请先补充卖点。']),
    '',
    '## 品牌边界',
    ...(project.brandGuardrails.length ? project.brandGuardrails.map(item => `- ${item}`) : ['- 当前还没有沉淀品牌边界。']),
    '',
    '## 类目规则',
    ...(project.categoryRules.length ? project.categoryRules.map(item => `- ${item}`) : ['- 当前还没有沉淀类目规则。']),
    '',
    '## 素材记忆',
    `- 素材总数：${assets.length}`,
    `- 可复用元数据素材：${reusableAssets.join(' / ') || '当前没有'}`,
    `- 仅会话可见素材：${sessionAssets.join(' / ') || '当前没有'}`,
    `- 缺失素材需求：${cardWithoutMarkdown.assetMemory.missingAssetNeeds.join(' / ') || '当前没有'}`,
    '',
    '## 表现记忆',
    `- 胜出模式：${winningPatterns.join(' / ') || '需要先导入手动或 CSV 数据'}`,
    `- 弱势模式：${weakPatterns.join(' / ') || '需要先导入手动或 CSV 数据'}`,
    `- 下一轮测试想法：${nextTestIdeas.join(' / ') || '请先完成反馈复盘后生成实验计划'}`,
    '',
    '边界说明：这里只记录本地上下文。这张卡可以导出并复用，但不假设存在云端账号、团队记忆或真实平台 API。',
  ].join('\n');
  return {
    ...cardWithoutMarkdown,
    markdown: scrubDeliveryText(markdown),
  };
}

export function buildMerchantContextMarkdown(card?: MerchantContextCard) {
  return card?.markdown || '# 商家上下文记忆卡\n\n当前还没有生成商家上下文记忆卡。';
}

export function applyMerchantContextToProjectInput(context: MerchantContextCard, input: Partial<ListingProjectInput> = {}): ListingProjectInput {
  return {
    productName: String(input.productName || context.productName).trim(),
    category: String(input.category || context.category).trim(),
    targetPlatforms: unique(normalizeList(input.targetPlatforms || context.targetPlatforms)),
    priceBand: String(input.priceBand || context.priceBand).trim(),
    sellingPoints: unique([
      ...normalizeList(context.reusableSellingPoints),
      ...normalizeList(input.sellingPoints),
    ]),
    targetAudience: String(input.targetAudience || context.audienceSummary).trim(),
    contentGoal: String(input.contentGoal || context.generationDefaults.contentGoal).trim(),
    brandGuardrails: unique([
      ...normalizeList(context.brandGuardrails),
      ...normalizeList(input.brandGuardrails),
    ]),
    categoryRules: unique([
      ...normalizeList(context.categoryRules),
      ...normalizeList(input.categoryRules),
    ]),
    competitorNotes: String(input.competitorNotes || context.generationDefaults.competitorNotes || '').trim(),
  };
}

export function evaluateDeliveryPackageQuality(run: Pick<ListingFactoryRun, 'project' | 'report' | 'deliveryPackage'> & Partial<ListingFactoryRun>): DeliveryPackageQualityResult {
  const deliveryPackage = run.deliveryPackage;
  const strings = [
    deliveryPackage?.markdown,
    deliveryPackage?.briefCsv,
    deliveryPackage?.scriptsMarkdown,
    deliveryPackage?.storyboardMarkdown,
    deliveryPackage?.assetPlanMarkdown,
    deliveryPackage?.variantMatrixCsv,
    deliveryPackage?.productionChecklistMarkdown,
    deliveryPackage?.assetLibraryMarkdown,
    deliveryPackage?.productionReadinessMarkdown,
    deliveryPackage?.assemblyManifestMarkdown,
    deliveryPackage?.assemblyManifestCsv,
    deliveryPackage?.missingAssetsChecklistMarkdown,
    deliveryPackage?.batchProductionMarkdown,
    deliveryPackage?.editPackMarkdown,
    deliveryPackage?.subtitleSrtSample,
    deliveryPackage?.editDecisionListCsv,
    deliveryPackage?.assetManifestCsv,
    deliveryPackage?.batchQaSummaryMarkdown,
    deliveryPackage?.performanceFeedbackMarkdown,
    deliveryPackage?.performanceRecordsCsv,
    deliveryPackage?.regenerationPlanMarkdown,
    deliveryPackage?.experimentPlanMarkdown,
    deliveryPackage?.experimentCsvTemplate,
    deliveryPackage?.trackingPlanMarkdown,
    deliveryPackage?.manualResultEntryTemplateCsv,
    deliveryPackage?.experimentReportMarkdown,
    deliveryPackage?.experimentConfidenceMarkdown,
    deliveryPackage?.experimentMemoryMarkdown,
    deliveryPackage?.experimentPriorityQueueMarkdown,
    deliveryPackage?.experimentLearningGapMapMarkdown,
    deliveryPackage?.experimentSequencingPlanMarkdown,
    deliveryPackage?.experimentValidationPolicyMarkdown,
    deliveryPackage?.experimentDecisionSummaryMarkdown,
    deliveryPackage?.experimentExecutionPlaybookMarkdown,
    deliveryPackage?.experimentCadencePlanMarkdown,
    deliveryPackage?.experimentOperatorChecklistMarkdown,
    deliveryPackage?.experimentWorkbenchMarkdown,
    deliveryPackage?.crossRunComparisonMarkdown,
    deliveryPackage?.merchantLearningArchiveMarkdown,
    deliveryPackage?.contentExperimentTraceMarkdown,
    deliveryPackage?.traceabilitySummaryMarkdown,
    deliveryPackage?.platformDataContractMarkdown,
    deliveryPackage?.platformImportTemplateCsv,
    deliveryPackage?.platformImportQualityMarkdown,
    deliveryPackage?.platformDataReadinessMarkdown,
    deliveryPackage?.platformCsvMappingPreviewMarkdown,
    deliveryPackage?.platformCsvImportPreviewMarkdown,
    deliveryPackage?.platformCsvMappingPresetJson,
    deliveryPackage?.platformExportVersionRegistryMarkdown,
    deliveryPackage?.platformCsvRehearsalMarkdown,
    deliveryPackage?.platformCsvRegressionSnapshotMarkdown,
    deliveryPackage?.operatingReviewMarkdown,
    deliveryPackage?.merchantContextMarkdown,
    deliveryPackage?.clientMessageDraft,
    deliveryPackage?.qualityGateSummary,
    deliveryPackage?.projectSummary,
    deliveryPackage?.executiveSummary,
    deliveryPackage?.riskReview?.map(safeRiskLabel).join(' / '),
  ].filter((value): value is string => typeof value === 'string');
  const missingSections: string[] = [];
  const warnings: string[] = [];
  const recommendedFixes: string[] = [];
  const requiredFields: Array<[keyof DeliveryPackage, string]> = [
    ['markdown', 'POC report'],
    ['briefCsv', 'Brief CSV'],
    ['scriptsMarkdown', '脚本 Markdown'],
    ['storyboardMarkdown', '分镜 Markdown'],
    ['assetPlanMarkdown', '素材清单'],
    ['missingAssetsChecklistMarkdown', '缺失素材 checklist'],
    ['assemblyManifestMarkdown', 'assembly manifest'],
    ['batchProductionMarkdown', 'batch production markdown'],
    ['editPackMarkdown', 'edit pack'],
    ['subtitleSrtSample', 'SRT'],
    ['editDecisionListCsv', 'EDL CSV'],
    ['assetManifestCsv', 'Asset Manifest CSV'],
    ['performanceFeedbackMarkdown', '表现反馈报告'],
    ['performanceRecordsCsv', '表现数据 CSV'],
    ['regenerationPlanMarkdown', '再生成计划'],
    ['experimentPlanMarkdown', '实验计划'],
    ['experimentCsvTemplate', '实验结果 CSV 模板'],
    ['trackingPlanMarkdown', '追踪命名规则'],
    ['manualResultEntryTemplateCsv', '手动录入结果模板'],
    ['experimentReportMarkdown', '实验复盘报告'],
    ['experimentConfidenceMarkdown', '实验置信度'],
    ['experimentMemoryMarkdown', '实验记忆'],
    ['experimentPriorityQueueMarkdown', '下一轮实验优先队列'],
    ['experimentLearningGapMapMarkdown', '内容增长学习地图'],
    ['experimentSequencingPlanMarkdown', '下一轮实验路线图'],
    ['experimentValidationPolicyMarkdown', '实验验证策略'],
    ['experimentDecisionSummaryMarkdown', '实验决策摘要'],
    ['experimentExecutionPlaybookMarkdown', '实验执行手册'],
    ['experimentCadencePlanMarkdown', '实验节奏安排'],
    ['experimentOperatorChecklistMarkdown', '操作检查表'],
    ['experimentWorkbenchMarkdown', '本地实验操作台'],
    ['crossRunComparisonMarkdown', '跨运行学习对比'],
    ['merchantLearningArchiveMarkdown', '商家增长学习档案'],
    ['contentExperimentTraceMarkdown', '内容实验追踪链'],
    ['traceabilitySummaryMarkdown', '可追溯证据链摘要'],
    ['platformDataContractMarkdown', '平台数据契约'],
    ['platformImportTemplateCsv', '平台数据导入模板'],
    ['platformImportQualityMarkdown', '导入质量检查'],
    ['platformDataReadinessMarkdown', '数据接入准备度'],
    ['platformCsvMappingPreviewMarkdown', '平台字段适配'],
    ['platformCsvImportPreviewMarkdown', '导入前 QA 摘要'],
    ['platformCsvMappingPresetJson', '平台字段映射预设'],
    ['platformExportVersionRegistryMarkdown', '平台导出版本库'],
    ['platformCsvRehearsalMarkdown', 'CSV 导入演练'],
    ['platformCsvRegressionSnapshotMarkdown', '字段回归快照'],
    ['operatingReviewMarkdown', '工厂运营评估'],
    ['merchantContextMarkdown', '商家上下文记忆卡'],
    ['clientMessageDraft', '客户消息草稿'],
    ['batchQaSummaryMarkdown', 'QA summary'],
  ];

  for (const [field, label] of requiredFields) {
    const value = deliveryPackage?.[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      missingSections.push(label);
      recommendedFixes.push(`补齐 ${label}`);
    }
  }

  const placeholderFlags = strings.filter(text =>
    /undefined|null|\[object Object\]|placeholder|TODO|等待生成|暂无批次|暂无编辑包/.test(text),
  );
  if (placeholderFlags.length > 0) {
    warnings.push('交付包中存在 placeholder 或空字段提示');
    recommendedFixes.push('替换 placeholder / 暂无 / 等待生成 文案');
  }

  const unsafeRiskWords = ['保证', '100%', '根治', '治疗', '吊打', '全网最低', '立刻见效', '马上瘦'];
  const unsafeMatches = strings.filter(text => unsafeRiskWords.some(word => text.includes(word)));
  if (unsafeMatches.length > 0) {
    warnings.push('交付包中存在可直接读到的风险词');
    recommendedFixes.push('把风险词收束为业务边界标签或审核提示');
  }

  if (!run.report?.clientSummary) {
    missingSections.push('POC report');
    recommendedFixes.push('补齐客户汇报摘要');
  }

  const score = clampScore(100 - unique(missingSections).length * 10 - unique(warnings).length * 8 - placeholderFlags.length * 4 - unsafeMatches.length * 10);
  return {
    passed: unique(missingSections).length === 0 && unsafeMatches.length === 0 && placeholderFlags.length === 0 && score >= 80,
    score,
    missingSections: unique(missingSections),
    warnings: unique(warnings),
    recommendedFixes: unique(recommendedFixes),
  };
}

function buildBatchLayer(run: BatchBuildRun) {
  const productionBatches = Array.isArray(run.productionBatches) && run.productionBatches.length > 0
    ? run.productionBatches
    : [buildProductionBatch(run, { name: '首轮本地批量生产批次', maxItems: 8, includeVariants: true })];
  const editPacks = Array.isArray(run.editPacks) && run.editPacks.length > 0
    ? run.editPacks
    : productionBatches.flatMap(batch => batch.batchItems.map(item => buildEditPack(run, item)));
  const batchQaSummary = run.batchQaSummary || evaluateBatchQa(productionBatches[0], editPacks.filter(pack => productionBatches[0].batchItems.some(item => item.id === pack.batchItemId)), run);
  const hydratedBatches = productionBatches.map((batch, index) => index === 0 ? { ...batch, qaSummary: batchQaSummary } : batch);
  return { productionBatches: hydratedBatches, editPacks, batchQaSummary };
}

function buildDemoAssets(project: ListingProject): LocalAsset[] {
  return [
    createManualAsset(project.id, {
      name: `${project.productName} 产品主图`,
      type: 'image',
      description: '产品主图和手持特写，可用于开场和购买前核对',
      tags: ['产品'],
    }, project),
    createManualAsset(project.id, {
      name: `${project.category} 字幕和口播文案`,
      type: 'text',
      description: '本地脚本生成的字幕和口播文本',
      tags: ['字幕', '口播'],
    }, project),
  ].map(asset => ({ ...asset, source: 'demo_asset' as const }));
}

function buildAssetLayer(project: ListingProject, scripts: GeneratedScript[], storyboards: Storyboard[], variantMatrices: VariantMatrix[], assetsInput?: LocalAsset[]) {
  const assets = assetsInput ?? buildDemoAssets(project);
  const shotAssetMatches = storyboards.flatMap(storyboard => matchAssetsToStoryboard(project, storyboard, assets));
  const productionReadiness = evaluateProductionReadiness({ project, scripts, storyboards, variantMatrices, assets, shotAssetMatches });
  const assemblyPlan = buildAssemblyPlan({ project, scripts, storyboards, variantMatrices, assets, shotAssetMatches, productionReadiness });
  return { assets, shotAssetMatches, productionReadiness, assemblyPlan };
}

function variantQualityScore(project: ListingProject, brief: GeneratedBrief, variant: Omit<ContentVariant, 'qualityScore'>): BriefQualityScore {
  return evaluateBriefQuality({
    ...brief,
    platform: variant.platform,
    hook: variant.hook,
    cta: variant.cta,
    visualDirection: variant.angle,
    voiceoverDirection: `${variant.audience}：${variant.angle}`,
    riskLevel: variant.riskLevel,
    reusableStructure: variant.reusableStructure,
  }, project);
}

export function generateContentVariants(project: ListingProject, brief: GeneratedBrief, options: { count?: number } = {}): ContentVariant[] {
  const count = Math.max(6, options.count ?? 6);
  const proofOptions = [
    project.sellingPoints[0] || '核心卖点',
    project.sellingPoints[1] || '使用步骤',
    project.categoryRules[0] || '购买前核对',
  ];
  const audienceOptions = unique([
    project.targetAudience,
    `${project.category} 新用户`,
    '正在对比同类产品的人',
    '需要快速判断是否适合的人',
  ]);
  const visualOptions = unique([
    brief.visualDirection,
    ...categoryAssetHints(project.category).visuals,
    '评论区问题回应画面',
  ]);
  const ctaOptions = unique([brief.cta, '保存这条购买前核对清单。', '评论你的使用场景，先判断是否适配。']);

  return Array.from({ length: count }).map((_, index) => {
    const platform = project.targetPlatforms[index % project.targetPlatforms.length] || brief.platform;
    const proof = proofOptions[index % proofOptions.length];
    const audience = audienceOptions[index % audienceOptions.length];
    const angle = visualOptions[index % visualOptions.length];
    const hook = sanitizeRiskyCopy(`${firstSentence(brief.hook)} ${audience}先看${proof}，再决定要不要进入下一步。`, project.brandGuardrails);
    const cta = sanitizeRiskyCopy(ctaOptions[index % ctaOptions.length], project.brandGuardrails);
    const safety = scoreBrandSafety([hook, cta, angle].join(' '), project.brandGuardrails);
    const base = {
      id: `variant-${brief.id}-${index + 1}`,
      briefId: brief.id,
      platform,
      hook,
      angle,
      cta,
      audience,
      riskLevel: riskLevelFromScore(safety.score),
      reusableStructure: `${brief.contentType} -> ${audience} -> ${proof} -> ${angle} -> ${cta}`,
      derivedScriptId: `script-${brief.id}-${index + 1}`,
    };
    return {
      ...base,
      qualityScore: variantQualityScore(project, brief, base),
    };
  });
}

export function buildVariantMatrix(project: ListingProject, brief: GeneratedBrief): VariantMatrix {
  const dimensions: VariantDimension[] = [
    { name: 'hook', options: ['场景痛点', '购买前避坑', '评论区问题'] },
    { name: 'audience', options: unique([project.targetAudience, `${project.category} 新用户`, '正在对比同类产品的人']).slice(0, 3) },
    { name: 'platform', options: project.targetPlatforms },
    { name: 'cta', options: ['保存清单', '评论场景', '进入购买前核对'] },
    { name: 'proof', options: project.sellingPoints.slice(0, 3).length > 0 ? project.sellingPoints.slice(0, 3) : ['功能细节', '场景证明'] },
    { name: 'visual_angle', options: categoryAssetHints(project.category).visuals.slice(0, 4) },
  ];

  return {
    projectId: project.id,
    baseBriefId: brief.id,
    dimensions,
    variants: generateContentVariants(project, brief, { count: 8 }),
  };
}

function buildDefaultReferences(project: ListingProject): ReferenceCreative[] {
  return [{
    id: `ref-${project.id}-demo`,
    title: `${project.category} 参考结构`,
    platform: project.targetPlatforms[0] || 'TikTok',
    category: project.category,
    rawText: `${project.targetAudience} 最担心 ${getCategoryProfile(project.category).pain}。先看 ${project.sellingPoints[0] || project.productName}，再补充使用边界，最后评论具体场景。`,
    observedHook: '',
    observedStructure: '',
    audience: project.targetAudience,
    sellingPoint: project.sellingPoints[0] || project.productName,
    riskNotes: project.brandGuardrails.slice(0, 2),
    sourceType: 'demo_reference',
  }];
}

function buildProductionAssets(project: ListingProject, briefs: GeneratedBrief[]) {
  const references = buildDefaultReferences(project);
  const deconstructions = references.map(reference => deconstructReferenceCreative(reference, project));
  const scripts = briefs.slice(0, 6).map(brief => buildScriptFromBrief(project, brief));
  const storyboards = scripts.map(script => buildStoryboardFromScript(project, script));
  const assetPlan = buildAssetPlan(project, scripts, storyboards);
  const variantMatrices = briefs.slice(0, 2).map(brief => buildVariantMatrix(project, brief));
  const assetLayer = buildAssetLayer(project, scripts, storyboards, variantMatrices);
  const productionAssetsStatus = {
    references: references.length,
    scripts: scripts.length,
    storyboards: storyboards.length,
    requiredAssets: assetPlan.requiredImages.length + assetPlan.requiredVideos.length,
    missingAssets: assetPlan.missingAssets.length,
    variants: variantMatrices.reduce((sum, matrix) => sum + matrix.variants.length, 0),
    ready: scripts.length > 0 && storyboards.length > 0 && assetPlan.missingAssets.length >= 0,
  };

  return { references, deconstructions, scripts, storyboards, assetPlan, variantMatrices, productionAssetsStatus, ...assetLayer };
}

export function exportMarkdownReport(project: ListingProject, report: PocReport, briefs: GeneratedBrief[]) {
  const briefLines = briefs
    .map((brief, index) => `${index + 1}. ${brief.platform} / ${brief.contentType}：${brief.hook}（风险：${brief.riskLevel}）`)
    .join('\n');

  return [
    '# POC 试跑交付报告',
    '',
    `## SKU 摘要`,
    `- 商品：${project.productName}`,
    `- 类目：${project.category}`,
    `- 平台：${project.targetPlatforms.join(' / ')}`,
    `- 价格带：${project.priceBand}`,
    '',
    '## 一句话结论',
    report.summary,
    '',
    '## 类目规则判断',
    report.categoryRuleSummary,
    '',
    '## 品牌禁区总结',
    report.brandGuardrailSummary,
    '',
    '## Brief 样例',
    briefLines,
    '',
    '## 执行优先级',
    report.executionPriority.map(item => `- ${item}`).join('\n'),
    '',
    '## 客户汇报摘要',
    report.clientSummary,
    '',
    `## 推荐 Pricing`,
    report.pricingRecommendation,
    '',
  ].join('\n');
}

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportBriefsCsv(briefs: GeneratedBrief[]) {
  const header = [
    'id',
    'projectId',
    'platform',
    'contentType',
    'hook',
    'cta',
    'riskLevel',
    'status',
    'qualityScore',
  ];
  const rows = briefs.map(brief => [
    brief.id,
    brief.projectId,
    brief.platform,
    brief.contentType,
    brief.hook,
    brief.cta,
    brief.riskLevel,
    brief.status,
    brief.qualityScore.overall,
  ]);

  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

export function exportProjectJson(project: ListingProject) {
  return JSON.stringify(project, null, 2);
}

function exportScriptsMarkdown(scripts: GeneratedScript[]) {
  return [
    '## 脚本样例',
    ...scripts.slice(0, 3).flatMap(script => [
      '',
      `### ${script.title}`,
      `- 平台：${script.platform}`,
      `- 时长：${script.duration}`,
      `- 开场：${script.openingHook}`,
      `- CTA：${script.cta}`,
      '',
      ...script.scenes.map(scene => `- ${scene.timestamp}｜${scene.visual}｜${scene.voiceoverLine}`),
    ]),
  ].join('\n');
}

function exportStoryboardMarkdown(storyboards: Storyboard[]) {
  return [
    '## 分镜清单',
    ...storyboards.slice(0, 3).flatMap(storyboard => [
      '',
      `### ${storyboard.scriptId}`,
      ...storyboard.shots.map(shot => `- Shot ${shot.order}：${shot.shotType}｜${shot.visualDescription}｜素材：${shot.requiredAssets.join(' / ')}｜字幕：${shot.subtitle}`),
    ]),
  ].join('\n');
}

function exportAssetPlanMarkdown(assetPlan?: AssetPlan) {
  if (!assetPlan) return '## 素材需求清单\n- 暂无素材计划';
  return [
    '## 素材需求清单',
    '',
    '### 必须图片',
    ...assetPlan.requiredImages.map(item => `- ${item}`),
    '',
    '### 必须视频',
    ...assetPlan.requiredVideos.map(item => `- ${item}`),
    '',
    '### 缺失素材',
    ...assetPlan.missingAssets.map(item => `- ${item}`),
    '',
    '### 拍摄优先级',
    ...assetPlan.productionPriority.map(item => `- ${item}`),
  ].join('\n');
}

function exportVariantMatrixCsv(matrices: VariantMatrix[]) {
  const header = ['id', 'briefId', 'platform', 'hook', 'angle', 'cta', 'audience', 'riskLevel', 'qualityScore'];
  const rows = matrices.flatMap(matrix => matrix.variants.map(variant => [
    variant.id,
    variant.briefId,
    variant.platform,
    variant.hook,
    variant.angle,
    variant.cta,
    variant.audience,
    variant.riskLevel,
    variant.qualityScore.overallScore,
  ]));
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
}

function plainCsvCell(value: string | number | boolean) {
  return String(value).replace(/\r?\n/g, ' ').replace(/,/g, '，');
}

function exportProductionChecklistMarkdown(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'briefs'>) {
  const status = run.productionAssetsStatus;
  return [
    '## 生产检查清单',
    `- SKU：${run.project.productName}`,
    `- Brief：${run.briefs.length} 条`,
    `- 脚本：${status?.scripts ?? run.scripts?.length ?? 0} 条`,
    `- 分镜：${status?.storyboards ?? run.storyboards?.length ?? 0} 组`,
    `- 变体：${status?.variants ?? run.variantMatrices?.reduce((sum, matrix) => sum + matrix.variants.length, 0) ?? 0} 条`,
    `- 缺失素材：${status?.missingAssets ?? run.assetPlan?.missingAssets.length ?? 0} 项`,
    '- 正式生产前仍需人工审核品牌禁区、平台规则和素材版权。',
  ].join('\n');
}

function scrubDeliveryText(text: string) {
  return sanitizeRiskyCopy(text, [
    '绝对化承诺',
    '医疗或治疗功效',
    '贬低竞品',
    '虚假折扣',
    '夸张收益',
  ])
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, '[已隐藏凭据]')
    .replace(/\b(api[-_ ]?key|token|auth|providerToken|accessToken|refreshToken)\s*[:=]\s*([^\s,;]+)/gi, '$1=[已隐藏]')
    .replace(/保证/g, '建议')
    .replace(/治疗/g, '日常护理')
    .replace(/根治/g, '改善体验')
    .replace(/吊打/g, '对比不同场景')
    .replace(/全网最低/g, '活动信息以页面为准')
    .replace(/立刻见效/g, '逐步观察')
    .replace(/马上瘦/g, '结合自身情况');
}

function scrubDeliveryPackage(deliveryPackage: DeliveryPackage): DeliveryPackage {
  const scrub = (value: string) => scrubDeliveryText(value);
  return {
    ...deliveryPackage,
    executiveSummary: scrub(deliveryPackage.executiveSummary),
    projectSummary: scrub(deliveryPackage.projectSummary),
    riskReview: deliveryPackage.riskReview.map(safeRiskLabel),
    qualityGateSummary: scrub(deliveryPackage.qualityGateSummary),
    markdown: scrub(deliveryPackage.markdown),
    scriptsMarkdown: scrub(deliveryPackage.scriptsMarkdown),
    storyboardMarkdown: scrub(deliveryPackage.storyboardMarkdown),
    assetPlanMarkdown: scrub(deliveryPackage.assetPlanMarkdown),
    productionChecklistMarkdown: scrub(deliveryPackage.productionChecklistMarkdown),
    assetLibraryMarkdown: scrub(deliveryPackage.assetLibraryMarkdown),
    productionReadinessMarkdown: scrub(deliveryPackage.productionReadinessMarkdown),
    assemblyManifestMarkdown: scrub(deliveryPackage.assemblyManifestMarkdown),
    missingAssetsChecklistMarkdown: scrub(deliveryPackage.missingAssetsChecklistMarkdown),
    batchProductionMarkdown: scrub(deliveryPackage.batchProductionMarkdown),
    editPackMarkdown: scrub(deliveryPackage.editPackMarkdown),
    subtitleSrtSample: scrub(deliveryPackage.subtitleSrtSample),
    batchQaSummaryMarkdown: scrub(deliveryPackage.batchQaSummaryMarkdown),
    videoAssemblyMarkdown: scrub(deliveryPackage.videoAssemblyMarkdown),
    renderPlanMarkdown: scrub(deliveryPackage.renderPlanMarkdown),
    providerPayloadJson: scrub(deliveryPackage.providerPayloadJson),
    videoQaMarkdown: scrub(deliveryPackage.videoQaMarkdown),
    mockVideoOutputPlaceholderMarkdown: scrub(deliveryPackage.mockVideoOutputPlaceholderMarkdown),
    performanceFeedbackMarkdown: scrub(deliveryPackage.performanceFeedbackMarkdown),
    performanceRecordsCsv: scrub(deliveryPackage.performanceRecordsCsv),
    regenerationPlanMarkdown: scrub(deliveryPackage.regenerationPlanMarkdown),
    experimentPlanMarkdown: scrub(deliveryPackage.experimentPlanMarkdown),
    experimentCsvTemplate: scrub(deliveryPackage.experimentCsvTemplate),
    trackingPlanMarkdown: scrub(deliveryPackage.trackingPlanMarkdown),
    manualResultEntryTemplateCsv: scrub(deliveryPackage.manualResultEntryTemplateCsv),
    experimentReportMarkdown: scrub(deliveryPackage.experimentReportMarkdown),
    experimentConfidenceMarkdown: scrub(deliveryPackage.experimentConfidenceMarkdown),
    experimentMemoryMarkdown: scrub(deliveryPackage.experimentMemoryMarkdown),
    experimentPriorityQueueMarkdown: scrub(deliveryPackage.experimentPriorityQueueMarkdown),
    experimentLearningGapMapMarkdown: scrub(deliveryPackage.experimentLearningGapMapMarkdown),
    experimentSequencingPlanMarkdown: scrub(deliveryPackage.experimentSequencingPlanMarkdown),
    experimentValidationPolicyMarkdown: scrub(deliveryPackage.experimentValidationPolicyMarkdown),
    experimentDecisionSummaryMarkdown: scrub(deliveryPackage.experimentDecisionSummaryMarkdown),
    experimentExecutionPlaybookMarkdown: scrub(deliveryPackage.experimentExecutionPlaybookMarkdown),
    experimentCadencePlanMarkdown: scrub(deliveryPackage.experimentCadencePlanMarkdown),
    experimentOperatorChecklistMarkdown: scrub(deliveryPackage.experimentOperatorChecklistMarkdown),
    experimentWorkbenchMarkdown: scrub(deliveryPackage.experimentWorkbenchMarkdown),
    crossRunComparisonMarkdown: scrub(deliveryPackage.crossRunComparisonMarkdown),
    merchantLearningArchiveMarkdown: scrub(deliveryPackage.merchantLearningArchiveMarkdown),
    contentExperimentTraceMarkdown: scrub(deliveryPackage.contentExperimentTraceMarkdown),
    traceabilitySummaryMarkdown: scrub(deliveryPackage.traceabilitySummaryMarkdown),
    platformDataContractMarkdown: scrub(deliveryPackage.platformDataContractMarkdown),
    platformImportTemplateCsv: scrub(deliveryPackage.platformImportTemplateCsv),
    platformImportQualityMarkdown: scrub(deliveryPackage.platformImportQualityMarkdown),
    platformDataReadinessMarkdown: scrub(deliveryPackage.platformDataReadinessMarkdown),
    platformCsvMappingPreviewMarkdown: scrub(deliveryPackage.platformCsvMappingPreviewMarkdown),
    platformCsvImportPreviewMarkdown: scrub(deliveryPackage.platformCsvImportPreviewMarkdown),
    platformCsvMappingPresetJson: scrub(deliveryPackage.platformCsvMappingPresetJson),
    platformExportVersionRegistryMarkdown: scrub(deliveryPackage.platformExportVersionRegistryMarkdown),
    platformCsvRehearsalMarkdown: scrub(deliveryPackage.platformCsvRehearsalMarkdown),
    platformCsvRegressionSnapshotMarkdown: scrub(deliveryPackage.platformCsvRegressionSnapshotMarkdown),
    operatingReviewMarkdown: scrub(deliveryPackage.operatingReviewMarkdown),
    merchantContextMarkdown: scrub(deliveryPackage.merchantContextMarkdown),
    clientMessageDraft: scrub(deliveryPackage.clientMessageDraft),
  };
}

function reportHasConfidence(report?: Partial<ExperimentReport>): report is ExperimentReport {
  return Boolean(report && Array.isArray(report.cellConfidence) && report.confidenceSummary);
}

function memorySummaryLooksValid(summary?: Partial<ExperimentMemorySummary>): summary is ExperimentMemorySummary {
  return Boolean(summary && Array.isArray(summary.entries) && Array.isArray(summary.reusablePatterns) && Array.isArray(summary.watchlistPatterns) && Array.isArray(summary.avoidPatterns));
}

function priorityQueueLooksValid(queue?: Partial<ExperimentPriorityQueue>): queue is ExperimentPriorityQueue {
  return Boolean(queue && Array.isArray(queue.candidates) && typeof queue.briefSummary === 'string');
}

function learningGapMapLooksValid(gapMap?: Partial<ExperimentLearningGapMap>): gapMap is ExperimentLearningGapMap {
  return Boolean(gapMap && Array.isArray(gapMap.gaps) && typeof gapMap.summary === 'string');
}

function sequencingPlanLooksValid(plan?: Partial<ExperimentSequencingPlan>): plan is ExperimentSequencingPlan {
  return Boolean(plan && Array.isArray(plan.steps) && typeof plan.topUnresolvedQuestion === 'string' && typeof plan.summary === 'string');
}

function validationPolicyLooksValid(policy?: Partial<ExperimentValidationPolicy>): policy is ExperimentValidationPolicy {
  return Boolean(policy && Array.isArray(policy.rules) && Array.isArray(policy.rolloutRules) && Array.isArray(policy.stopRules) && typeof policy.summary === 'string');
}

function decisionSummaryLooksValid(summary?: Partial<ExperimentDecisionSummary>): summary is ExperimentDecisionSummary {
  return Boolean(summary && typeof summary.topDecision === 'string' && typeof summary.whyThisDecision === 'string' && Array.isArray(summary.canRollout));
}

function executionPlaybookLooksValid(playbook?: Partial<ExperimentExecutionPlaybook>): playbook is ExperimentExecutionPlaybook {
  return Boolean(playbook && typeof playbook.experimentObjective === 'string' && Array.isArray(playbook.productionTasks) && typeof playbook.stopCondition === 'string');
}

function cadencePlanLooksValid(plan?: Partial<ExperimentCadencePlan>): plan is ExperimentCadencePlan {
  return Boolean(plan && typeof plan.currentDecision === 'string' && Array.isArray(plan.rules) && typeof plan.monitoringCadence === 'string');
}

function operatorChecklistLooksValid(checklist?: Partial<ExperimentOperatorChecklist>): checklist is ExperimentOperatorChecklist {
  return Boolean(checklist && typeof checklist.currentDecision === 'string' && Array.isArray(checklist.sections) && typeof checklist.requiredCount === 'number');
}

function executionSummaryLooksValid(summary?: Partial<ExperimentExecutionSummary>): summary is ExperimentExecutionSummary {
  return Boolean(summary && typeof summary.currentDecision === 'string' && Array.isArray(summary.nextTasks) && typeof summary.monitoringCadence === 'string');
}

function runHistoryItemLooksValid(item?: Partial<ListingFactoryRunHistoryItem>): item is ListingFactoryRunHistoryItem {
  return Boolean(item && typeof item.runId === 'string' && typeof item.createdAt === 'string' && typeof item.primaryProductName === 'string');
}

function runHistorySummaryLooksValid(summary?: Partial<ListingFactoryRunHistorySummary>): summary is ListingFactoryRunHistorySummary {
  return Boolean(summary && Array.isArray(summary.items) && typeof summary.totalRuns === 'number' && typeof summary.summary === 'string');
}

function workbenchActionLooksValid(action?: Partial<ExperimentWorkbenchAction>): action is ExperimentWorkbenchAction {
  return Boolean(action && typeof action.id === 'string' && typeof action.runId === 'string' && typeof action.status === 'string' && typeof action.title === 'string');
}

function workbenchBoardLooksValid(board?: Partial<ExperimentWorkbenchBoard>): board is ExperimentWorkbenchBoard {
  return Boolean(board && typeof board.projectId === 'string' && workbenchActionLooksValid(board.highestPriorityAction) && Array.isArray(board.nextActionQueue));
}

function archiveRecordLooksValid(record?: Partial<ExperimentArchiveRecord>): record is ExperimentArchiveRecord {
  return Boolean(record && typeof record.runId === 'string' && typeof record.archivedAt === 'string' && typeof record.learningSummary === 'string');
}

function exportAssetLibraryMarkdown(assets: LocalAsset[] = []) {
  const summary = summarizeAssetLibrary(assets);
  return [
    '## 素材库摘要',
    '',
    `- 素材总数：${summary.total}`,
    `- 图片：${summary.byType.image}`,
    `- 视频：${summary.byType.video}`,
    `- 音频：${summary.byType.audio}`,
    `- 文本 / 字幕：${summary.byType.text}`,
    `- 产品素材：${summary.productAssets}`,
    `- 标签：${summary.tagLabels.join(' / ') || '暂无标签'}`,
    '',
    '### 素材明细',
    ...(assets.length > 0
      ? assets.map(asset => `- ${asset.name}｜${asset.type}｜${asset.source}｜${asset.tags.map(tag => tag.label).join(' / ') || '未标注'}｜${asset.sizeLabel}`)
      : ['- 暂无本地素材 metadata']),
  ].join('\n');
}

function exportProductionReadinessMarkdown(readiness?: ProductionReadiness) {
  if (!readiness) return '## 生产就绪评分\n- 暂无生产就绪评估';
  return [
    '## 生产就绪评分',
    '',
    `- 评分：${readiness.score}/100`,
    `- 状态：${readiness.ready ? 'ready_for_edit' : 'missing_assets'}`,
    `- 下一步：${readiness.recommendedNextStep}`,
    '',
    '### 阻塞项',
    ...(readiness.blockers.length > 0 ? readiness.blockers.map(item => `- ${item}`) : ['- 无阻塞项']),
    '',
    '### 风险提醒',
    ...(readiness.warnings.length > 0 ? readiness.warnings.map(item => `- ${item}`) : ['- 无明显风险提醒']),
  ].join('\n');
}

function exportMissingAssetsChecklistMarkdown(readiness?: ProductionReadiness) {
  return [
    '## 缺失素材 Checklist',
    '',
    ...(readiness?.missingAssets.length
      ? readiness.missingAssets.map(item => `- [ ] ${item}`)
      : ['- [x] 当前素材缺口已覆盖到可进入剪辑排期的程度']),
    '',
    readiness?.recommendedNextStep ? `下一步：${readiness.recommendedNextStep}` : '',
  ].filter(Boolean).join('\n');
}

function stripSessionAssetFields(asset: LocalAsset): LocalAsset {
  const metadata = { ...asset };
  delete metadata.previewUrl;
  delete metadata.hasSessionFile;
  delete metadata.sessionOnlyNote;
  return metadata;
}

function stripRunSessionAssetFields<T extends Partial<ListingFactoryRun>>(run: T): T {
  const scrubWorkbenchAction = (action?: ExperimentWorkbenchAction) => action
    ? {
      ...action,
      title: scrubDeliveryText(action.title),
      description: scrubDeliveryText(action.description),
      nextCheckMetric: scrubDeliveryText(action.nextCheckMetric || ''),
    }
    : action;
  return {
    ...run,
    assets: Array.isArray(run.assets) ? run.assets.map(stripSessionAssetFields) : run.assets,
    runHistoryItem: run.runHistoryItem ? {
      ...run.runHistoryItem,
      merchantName: scrubDeliveryText(run.runHistoryItem.merchantName || ''),
      brandName: scrubDeliveryText(run.runHistoryItem.brandName || ''),
      primaryProductName: scrubDeliveryText(run.runHistoryItem.primaryProductName || ''),
      topLearning: scrubDeliveryText(run.runHistoryItem.topLearning || ''),
      nextRecommendedAction: scrubDeliveryText(run.runHistoryItem.nextRecommendedAction || ''),
    } : run.runHistoryItem,
    runHistorySummary: run.runHistorySummary ? {
      ...run.runHistorySummary,
      items: run.runHistorySummary.items.map(item => ({
        ...item,
        merchantName: scrubDeliveryText(item.merchantName || ''),
        brandName: scrubDeliveryText(item.brandName || ''),
        primaryProductName: scrubDeliveryText(item.primaryProductName || ''),
        topLearning: scrubDeliveryText(item.topLearning || ''),
        nextRecommendedAction: scrubDeliveryText(item.nextRecommendedAction || ''),
      })),
      summary: scrubDeliveryText(run.runHistorySummary.summary),
    } : run.runHistorySummary,
    experimentWorkbenchBoard: run.experimentWorkbenchBoard ? {
      ...run.experimentWorkbenchBoard,
      summary: scrubDeliveryText(run.experimentWorkbenchBoard.summary),
      highestPriorityAction: scrubWorkbenchAction(run.experimentWorkbenchBoard.highestPriorityAction),
      recentRuns: run.experimentWorkbenchBoard.recentRuns.map(item => ({
        ...item,
        merchantName: scrubDeliveryText(item.merchantName || ''),
        brandName: scrubDeliveryText(item.brandName || ''),
        primaryProductName: scrubDeliveryText(item.primaryProductName || ''),
        topLearning: scrubDeliveryText(item.topLearning || ''),
        nextRecommendedAction: scrubDeliveryText(item.nextRecommendedAction || ''),
      })),
      nextActionQueue: run.experimentWorkbenchBoard.nextActionQueue.map(item => scrubWorkbenchAction(item) as ExperimentWorkbenchAction),
      pendingDataActions: run.experimentWorkbenchBoard.pendingDataActions.map(item => scrubWorkbenchAction(item) as ExperimentWorkbenchAction),
      validationActions: run.experimentWorkbenchBoard.validationActions.map(item => scrubWorkbenchAction(item) as ExperimentWorkbenchAction),
      rolloutActions: run.experimentWorkbenchBoard.rolloutActions.map(item => scrubWorkbenchAction(item) as ExperimentWorkbenchAction),
      stopActions: run.experimentWorkbenchBoard.stopActions.map(item => scrubWorkbenchAction(item) as ExperimentWorkbenchAction),
      archiveActions: run.experimentWorkbenchBoard.archiveActions.map(item => scrubWorkbenchAction(item) as ExperimentWorkbenchAction),
    } : run.experimentWorkbenchBoard,
    experimentArchiveRecord: run.experimentArchiveRecord ? {
      ...run.experimentArchiveRecord,
      learningSummary: scrubDeliveryText(run.experimentArchiveRecord.learningSummary),
      nextAction: scrubDeliveryText(run.experimentArchiveRecord.nextAction),
    } : run.experimentArchiveRecord,
    crossRunComparison: run.crossRunComparison ? {
      ...run.crossRunComparison,
      records: run.crossRunComparison.records.map(record => ({
        ...record,
        hypothesis: scrubDeliveryText(record.hypothesis),
        reusableLearning: scrubDeliveryText(record.reusableLearning),
        riskNote: scrubDeliveryText(record.riskNote),
        nextRecommendedAction: scrubDeliveryText(record.nextRecommendedAction),
      })),
      variableSummaries: run.crossRunComparison.variableSummaries.map(summary => ({
        ...summary,
        strongestLearning: scrubDeliveryText(summary.strongestLearning),
        repeatedPattern: scrubDeliveryText(summary.repeatedPattern),
        unresolvedQuestion: scrubDeliveryText(summary.unresolvedQuestion),
        nextBestMove: scrubDeliveryText(summary.nextBestMove),
      })),
      strongestReusableLearning: scrubDeliveryText(run.crossRunComparison.strongestReusableLearning),
      unresolvedQuestion: scrubDeliveryText(run.crossRunComparison.unresolvedQuestion),
      nextBestMove: scrubDeliveryText(run.crossRunComparison.nextBestMove),
      summary: scrubDeliveryText(run.crossRunComparison.summary),
    } : run.crossRunComparison,
    merchantLearningArchive: run.merchantLearningArchive ? {
      ...run.merchantLearningArchive,
      reusableMerchantLearningSummary: scrubDeliveryText(run.merchantLearningArchive.reusableMerchantLearningSummary),
      strongestReusableLearning: scrubDeliveryText(run.merchantLearningArchive.strongestReusableLearning),
      unresolvedQuestion: scrubDeliveryText(run.merchantLearningArchive.unresolvedQuestion),
      nextBestMove: scrubDeliveryText(run.merchantLearningArchive.nextBestMove),
      markdown: scrubDeliveryText(run.merchantLearningArchive.markdown),
    } : run.merchantLearningArchive,
    contentExperimentTraceGraph: run.contentExperimentTraceGraph ? {
      ...run.contentExperimentTraceGraph,
      nodes: run.contentExperimentTraceGraph.nodes.map(node => ({
        ...node,
        title: scrubDeliveryText(node.title),
        summary: scrubDeliveryText(node.summary),
      })),
      edges: run.contentExperimentTraceGraph.edges.map(edge => ({
        ...edge,
        note: scrubDeliveryText(edge.note),
      })),
      assetLineageRecords: run.contentExperimentTraceGraph.assetLineageRecords.map(record => ({
        ...record,
        performanceSignal: scrubDeliveryText(record.performanceSignal),
        reusableNote: scrubDeliveryText(record.reusableNote),
        riskNote: scrubDeliveryText(record.riskNote),
      })),
      evidenceTraces: run.contentExperimentTraceGraph.evidenceTraces.map(trace => ({
        ...trace,
        hypothesis: scrubDeliveryText(trace.hypothesis),
        evidenceLimitations: trace.evidenceLimitations.map(scrubDeliveryText),
      })),
      learningEvidenceLinks: run.contentExperimentTraceGraph.learningEvidenceLinks.map(link => ({
        ...link,
        learningStatement: scrubDeliveryText(link.learningStatement),
        whatThisSupports: scrubDeliveryText(link.whatThisSupports),
        whatThisDoesNotProve: scrubDeliveryText(link.whatThisDoesNotProve),
      })),
      summary: scrubDeliveryText(run.contentExperimentTraceGraph.summary),
    } : run.contentExperimentTraceGraph,
    traceabilitySummary: run.traceabilitySummary ? {
      ...run.traceabilitySummary,
      strongestTraceableLearning: scrubDeliveryText(run.traceabilitySummary.strongestTraceableLearning),
      relatedContentArtifact: scrubDeliveryText(run.traceabilitySummary.relatedContentArtifact),
      relatedExperimentCell: scrubDeliveryText(run.traceabilitySummary.relatedExperimentCell),
      metricWindowSummary: scrubDeliveryText(run.traceabilitySummary.metricWindowSummary),
      limitationNote: scrubDeliveryText(run.traceabilitySummary.limitationNote),
      summary: scrubDeliveryText(run.traceabilitySummary.summary),
    } : run.traceabilitySummary,
    normalizedPlatformMetricRecords: Array.isArray(run.normalizedPlatformMetricRecords)
      ? run.normalizedPlatformMetricRecords.map(record => ({
        ...record,
        campaignName: scrubDeliveryText(record.campaignName),
        contentName: scrubDeliveryText(record.contentName),
        creativeName: record.creativeName ? scrubDeliveryText(record.creativeName) : record.creativeName,
        trackingCode: record.trackingCode ? scrubDeliveryText(record.trackingCode) : record.trackingCode,
        experimentCellId: record.experimentCellId ? scrubDeliveryText(record.experimentCellId) : record.experimentCellId,
        productName: record.productName ? scrubDeliveryText(record.productName) : record.productName,
        skuId: record.skuId ? scrubDeliveryText(record.skuId) : record.skuId,
        platformContentId: record.platformContentId ? scrubDeliveryText(record.platformContentId) : record.platformContentId,
        note: record.note ? scrubDeliveryText(record.note) : record.note,
      }))
      : run.normalizedPlatformMetricRecords,
    platformImportQualityReport: run.platformImportQualityReport ? {
      ...run.platformImportQualityReport,
      errors: run.platformImportQualityReport.errors.map(issue => ({ ...issue, message: scrubDeliveryText(issue.message) })),
      warnings: run.platformImportQualityReport.warnings.map(issue => ({ ...issue, message: scrubDeliveryText(issue.message) })),
      summary: scrubDeliveryText(run.platformImportQualityReport.summary),
    } : run.platformImportQualityReport,
    platformDataReadinessSummary: run.platformDataReadinessSummary ? {
      ...run.platformDataReadinessSummary,
      cannotConcludeReasons: run.platformDataReadinessSummary.cannotConcludeReasons.map(scrubDeliveryText),
      reviewReadyData: run.platformDataReadinessSummary.reviewReadyData.map(scrubDeliveryText),
      summary: scrubDeliveryText(run.platformDataReadinessSummary.summary),
    } : run.platformDataReadinessSummary,
    platformCsvMappingPreview: run.platformCsvMappingPreview ? {
      ...run.platformCsvMappingPreview,
      candidates: run.platformCsvMappingPreview.candidates.map(candidate => ({ ...candidate, originalHeader: scrubDeliveryText(candidate.originalHeader) })),
      mappedFields: run.platformCsvMappingPreview.mappedFields.map(candidate => ({ ...candidate, originalHeader: scrubDeliveryText(candidate.originalHeader) })),
      unknownFields: run.platformCsvMappingPreview.unknownFields.map(scrubDeliveryText),
      warnings: run.platformCsvMappingPreview.warnings.map(issue => ({ ...issue, header: issue.header ? scrubDeliveryText(issue.header) : issue.header, message: scrubDeliveryText(issue.message) })),
      errors: run.platformCsvMappingPreview.errors.map(issue => ({ ...issue, header: issue.header ? scrubDeliveryText(issue.header) : issue.header, message: scrubDeliveryText(issue.message) })),
      recommendedFixes: run.platformCsvMappingPreview.recommendedFixes.map(scrubDeliveryText),
    } : run.platformCsvMappingPreview,
    platformCsvImportPreviewSummary: run.platformCsvImportPreviewSummary ? {
      ...run.platformCsvImportPreviewSummary,
      recommendedFixes: run.platformCsvImportPreviewSummary.recommendedFixes.map(scrubDeliveryText),
      summary: scrubDeliveryText(run.platformCsvImportPreviewSummary.summary),
    } : run.platformCsvImportPreviewSummary,
    platformCsvMappingPresetExport: run.platformCsvMappingPresetExport ? {
      ...run.platformCsvMappingPresetExport,
      mappings: run.platformCsvMappingPresetExport.mappings.map(mapping => ({ ...mapping, originalHeader: scrubDeliveryText(mapping.originalHeader) })),
      warnings: run.platformCsvMappingPresetExport.warnings.map(scrubDeliveryText),
      localOnlyNote: scrubDeliveryText(run.platformCsvMappingPresetExport.localOnlyNote),
    } : run.platformCsvMappingPresetExport,
    platformExportVersionRegistry: run.platformExportVersionRegistry ? {
      ...run.platformExportVersionRegistry,
      boundaryNote: scrubDeliveryText(run.platformExportVersionRegistry.boundaryNote),
      versions: run.platformExportVersionRegistry.versions.map(version => ({
        ...version,
        detectedByHeaders: version.detectedByHeaders.map(scrubDeliveryText),
        requiredHeaderAliases: version.requiredHeaderAliases.map(scrubDeliveryText),
        optionalHeaderAliases: version.optionalHeaderAliases.map(scrubDeliveryText),
        knownMissingFields: version.knownMissingFields.map(scrubDeliveryText),
        knownAmbiguousFields: version.knownAmbiguousFields.map(scrubDeliveryText),
        recommendedMappingNotes: version.recommendedMappingNotes.map(scrubDeliveryText),
        userFacingDescription: scrubDeliveryText(version.userFacingDescription),
      })),
    } : run.platformExportVersionRegistry,
    platformCsvRehearsalSummary: run.platformCsvRehearsalSummary ? {
      ...run.platformCsvRehearsalSummary,
      fieldsMostLikelyToNeedManualMapping: run.platformCsvRehearsalSummary.fieldsMostLikelyToNeedManualMapping.map(scrubDeliveryText),
      recommendedFixes: run.platformCsvRehearsalSummary.recommendedFixes.map(scrubDeliveryText),
      summary: scrubDeliveryText(run.platformCsvRehearsalSummary.summary),
      results: run.platformCsvRehearsalSummary.results.map(result => ({
        ...result,
        summary: scrubDeliveryText(result.summary),
        issues: result.issues.map(issue => ({ ...issue, message: scrubDeliveryText(issue.message) })),
        normalizedRecords: result.normalizedRecords.map(scrubNormalizedPlatformRecord),
      })),
    } : run.platformCsvRehearsalSummary,
    platformCsvRegressionSnapshot: run.platformCsvRegressionSnapshot ? {
      ...run.platformCsvRegressionSnapshot,
      localOnlyNote: scrubDeliveryText(run.platformCsvRegressionSnapshot.localOnlyNote),
    } : run.platformCsvRegressionSnapshot,
  };
}

function exportAssetMetadataJson(assets: LocalAsset[]) {
  return JSON.stringify({
    type: 'listing-factory-asset-metadata',
    boundary: 'metadata only; no file blob, no inline data, no session preview URL',
    assets: assets.map(stripSessionAssetFields),
  }, null, 2);
}

function exportAssetRelinkGuideMarkdown(assets: LocalAsset[]) {
  const metadataOnly = assets.filter(asset => !asset.hasSessionFile).length;
  const sessionFiles = assets.filter(asset => asset.hasSessionFile).length;
  return [
    '## 本地素材重关联说明',
    '',
    '当前支持本地素材试跑：文件只在当前浏览器会话中预览，不会上传云端；导出的项目 JSON 仅包含素材 metadata，不包含真实文件。',
    '',
    `- 当前会话可预览素材：${sessionFiles} 个`,
    `- metadata-only 素材：${metadataOnly} 个`,
    '- 刷新页面或导入项目 JSON 后，会话预览链接会失效，需要重新关联本地图片 / 视频 / 音频文件。',
    '- 如果交给剪辑师，需要把真实素材文件和 Assembly / Asset Manifest 一起打包。',
  ].join('\n');
}

function exportSessionAssetWarningMarkdown(assets: LocalAsset[]) {
  const hasSessionFiles = assets.some(asset => asset.hasSessionFile);
  return [
    '## Session Asset Boundary',
    '',
    '当前支持本地素材试跑：文件只在当前浏览器会话中预览，不会上传云端；导出的项目 JSON 仅包含素材 metadata，不包含真实文件。',
    '',
    hasSessionFiles
      ? '本次会话中存在可预览文件；离开当前浏览器会话后需要重新关联。'
      : '当前仅有素材 metadata，进入真实剪辑前需要重新关联本地文件。',
  ].join('\n');
}

export function buildDeliveryPackage(run: Omit<ListingFactoryRun, 'deliveryPackage' | 'operatingReview' | 'merchantContextCard'> & { deliveryPackage?: DeliveryPackage; operatingReview?: FactoryOperatingReview; merchantContextCard?: MerchantContextCard }): DeliveryPackage {
  const gate = run.qualityGate || evaluateRunQualityGate(run as ListingFactoryRun);
  const markdown = exportMarkdownReport(run.project, run.report, run.briefs);
  const briefCsv = exportBriefsCsv(run.briefs);
  const storyboards = run.storyboards || [];
  const scripts = run.scripts || [];
  const variantMatrices = run.variantMatrices || [];
  const assets = run.assets || [];
  const shotAssetMatches = run.shotAssetMatches && run.shotAssetMatches.length > 0
    ? run.shotAssetMatches
    : storyboards.flatMap(storyboard => matchAssetsToStoryboard(run.project, storyboard, assets));
  const productionReadiness = run.productionReadiness || evaluateProductionReadiness({
    ...run,
    scripts,
    storyboards,
    variantMatrices,
    assets,
    shotAssetMatches,
  });
  const assemblyPlan = run.assemblyPlan || buildAssemblyPlan({
    ...run,
    scripts,
    storyboards,
    variantMatrices,
    assets,
    shotAssetMatches,
    productionReadiness,
  });
  const productionAssets = {
    references: run.references || [],
    deconstructions: run.deconstructions || [],
    scripts,
    storyboards,
    assetPlan: run.assetPlan,
    variantMatrices,
    productionAssetsStatus: run.productionAssetsStatus,
    assets,
    shotAssetMatches,
    productionReadiness,
    assemblyPlan,
  };
  const batchLayer = buildBatchLayer({ ...run, ...productionAssets });
  const primaryBatch = batchLayer.productionBatches[0];
  const primaryEditPacks = batchLayer.editPacks.filter(pack => primaryBatch?.batchItems.some(item => item.id === pack.batchItemId));
  const primaryEditPack = primaryEditPacks[0];
  const videoAssemblyJobs = Array.isArray(run.videoAssemblyJobs) && run.videoAssemblyJobs.length > 0
    ? run.videoAssemblyJobs
    : primaryEditPack
      ? [buildVideoAssemblyJob({ ...run, ...productionAssets, ...batchLayer }, primaryEditPack, { providerId: 'local-mock-video', fallbackToMock: true })]
      : [];
  const videoQaSummary = run.videoQaSummary || videoAssemblyJobs[0]?.qaResult || {
    passed: false,
    score: 40,
    blockers: ['No video assembly job'],
    warnings: [],
    checks: [],
    recommendedNextStep: 'Build an Edit Pack before creating video assembly jobs.',
  };
  const videoProviderAudit = Array.isArray(run.videoProviderAudit) && run.videoProviderAudit.length > 0
    ? run.videoProviderAudit
    : videoAssemblyJobs.map(job => job.providerAudit);
  const performanceRecords = Array.isArray(run.performanceRecords) ? run.performanceRecords.map(calculatePerformanceMetrics) : [];
  const performanceInsights = Array.isArray(run.performanceInsights) && run.performanceInsights.length > 0
    ? run.performanceInsights
    : analyzePerformancePatterns(run, performanceRecords);
  const regenerationPlan = run.regenerationPlan || buildRegenerationPlan({ ...run, performanceRecords }, performanceInsights);
  const performanceFeedbackReport = run.performanceFeedbackReport || buildPerformanceFeedbackReport({
    ...run,
    performanceRecords,
    performanceInsights,
    regenerationPlan,
  });
  const experimentPlans = Array.isArray(run.experimentPlans) && run.experimentPlans.length > 0
    ? run.experimentPlans
    : [buildExperimentPlanFromInsights({ ...run, ...productionAssets, ...batchLayer, performanceRecords, performanceInsights, regenerationPlan }, performanceInsights, { targetPlatforms: regenerationPlan.nextPlatforms })];
  const experimentVariantMatrices = Array.isArray(run.experimentVariantMatrices) && run.experimentVariantMatrices.length > 0
    ? run.experimentVariantMatrices
    : experimentPlans.map(plan => buildExperimentVariantMatrix({ ...run, ...productionAssets, ...batchLayer }, plan));
  const experimentReports = Array.isArray(run.experimentReports) && run.experimentReports.length > 0
    ? experimentPlans.map((plan, index) => reportHasConfidence(run.experimentReports[index])
      ? run.experimentReports[index]
      : analyzeExperimentResults(plan, performanceRecords))
    : experimentPlans.map(plan => analyzeExperimentResults(plan, performanceRecords));
  const primaryExperimentPlan = experimentPlans[0];
  const primaryExperimentReport = experimentReports[0];
  const operatingReview = run.operatingReview || buildFactoryOperatingReview({
    ...run,
    ...productionAssets,
    ...batchLayer,
    videoAssemblyJobs,
    videoQaSummary,
    videoProviderAudit,
    performanceRecords,
    performanceInsights,
    regenerationPlan,
    performanceFeedbackReport,
    experimentPlans,
    experimentVariantMatrices,
    experimentReports,
    qualityGate: gate,
  });
  const merchantContextCard = run.merchantContextCard || buildMerchantContextCard({
    ...run,
    ...productionAssets,
    ...batchLayer,
    videoAssemblyJobs,
    videoQaSummary,
    videoProviderAudit,
    performanceRecords,
    performanceInsights,
    regenerationPlan,
    performanceFeedbackReport,
    experimentPlans,
    experimentVariantMatrices,
    experimentReports,
  });
  const experimentMemorySummary = memorySummaryLooksValid(run.experimentMemorySummary)
    ? run.experimentMemorySummary
    : buildExperimentMemorySummary({
      ...run,
      ...productionAssets,
      ...batchLayer,
      videoAssemblyJobs,
      videoQaSummary,
      videoProviderAudit,
      performanceRecords,
      performanceInsights,
      regenerationPlan,
      performanceFeedbackReport,
      experimentPlans,
      experimentVariantMatrices,
      experimentReports,
      merchantContextCard,
      updatedAt: run.updatedAt,
    });
  const experimentPriorityQueue = priorityQueueLooksValid(run.experimentPriorityQueue)
    ? run.experimentPriorityQueue
    : buildExperimentPriorityQueue({
      ...run,
      performanceInsights,
      regenerationPlan,
      experimentPlans,
      experimentReports,
      merchantContextCard,
      experimentMemorySummary,
      updatedAt: run.updatedAt,
    }, experimentMemorySummary, merchantContextCard);
  const experimentLearningGapMap = learningGapMapLooksValid(run.experimentLearningGapMap)
    ? run.experimentLearningGapMap
    : buildExperimentLearningGapMap({
      ...run,
      performanceInsights,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentMemorySummary, experimentPriorityQueue, merchantContextCard);
  const experimentSequencingPlan = sequencingPlanLooksValid(run.experimentSequencingPlan)
    ? run.experimentSequencingPlan
    : buildExperimentSequencingPlan({
      ...run,
      performanceInsights,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      experimentLearningGapMap,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentLearningGapMap, experimentPriorityQueue, experimentMemorySummary, merchantContextCard);
  const experimentValidationPolicy = validationPolicyLooksValid(run.experimentValidationPolicy)
    ? run.experimentValidationPolicy
    : buildExperimentValidationPolicy({
      ...run,
      performanceInsights,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      experimentLearningGapMap,
      experimentSequencingPlan,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, primaryExperimentReport?.confidenceSummary, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, merchantContextCard);
  const experimentDecisionSummary = decisionSummaryLooksValid(run.experimentDecisionSummary)
    ? run.experimentDecisionSummary
    : buildExperimentDecisionSummary({
      ...run,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      experimentLearningGapMap,
      experimentSequencingPlan,
      experimentValidationPolicy,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentValidationPolicy);
  const experimentCadencePlan = cadencePlanLooksValid(run.experimentCadencePlan)
    ? run.experimentCadencePlan
    : buildExperimentCadencePlan({
      ...run,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      experimentLearningGapMap,
      experimentSequencingPlan,
      experimentValidationPolicy,
      experimentDecisionSummary,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan);
  const experimentOperatorChecklist = operatorChecklistLooksValid(run.experimentOperatorChecklist)
    ? run.experimentOperatorChecklist
    : buildExperimentOperatorChecklist({
      ...run,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      experimentLearningGapMap,
      experimentSequencingPlan,
      experimentValidationPolicy,
      experimentDecisionSummary,
      experimentCadencePlan,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentValidationPolicy, experimentDecisionSummary);
  const experimentExecutionPlaybook = executionPlaybookLooksValid(run.experimentExecutionPlaybook)
    ? run.experimentExecutionPlaybook
    : buildExperimentExecutionPlaybook({
      ...run,
      experimentPlans,
      experimentReports,
      experimentMemorySummary,
      experimentPriorityQueue,
      experimentLearningGapMap,
      experimentSequencingPlan,
      experimentValidationPolicy,
      experimentDecisionSummary,
      experimentCadencePlan,
      experimentOperatorChecklist,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan, experimentPriorityQueue, experimentLearningGapMap, primaryExperimentReport?.confidenceSummary, merchantContextCard);
  const experimentExecutionSummary = executionSummaryLooksValid(run.experimentExecutionSummary)
    ? run.experimentExecutionSummary
    : buildExperimentExecutionSummary({
      ...run,
      experimentPlans,
      experimentReports,
      experimentValidationPolicy,
      experimentDecisionSummary,
      experimentCadencePlan,
      experimentOperatorChecklist,
      experimentExecutionPlaybook,
      merchantContextCard,
      updatedAt: run.updatedAt,
    }, experimentExecutionPlaybook, experimentCadencePlan, experimentOperatorChecklist);
  const archiveRecord = archiveRecordLooksValid(run.experimentArchiveRecord)
    ? run.experimentArchiveRecord
    : buildExperimentArchiveRecord({
      ...run,
      experimentReports,
      experimentMemorySummary,
      experimentValidationPolicy,
      experimentDecisionSummary,
      deliveryPackage: run.deliveryPackage,
      updatedAt: run.updatedAt,
    });
  const runHistorySummary = runHistorySummaryLooksValid(run.runHistorySummary)
    ? run.runHistorySummary
    : buildListingFactoryRunHistorySummary([
      {
        ...run,
        experimentReports,
        experimentMemorySummary,
        experimentValidationPolicy,
        experimentDecisionSummary,
        experimentOperatorChecklist,
        merchantContextCard,
        deliveryPackage: run.deliveryPackage,
        updatedAt: run.updatedAt,
      },
    ], [archiveRecord]);
  const runHistoryItem = runHistoryItemLooksValid(run.runHistoryItem)
    ? run.runHistoryItem
    : buildListingFactoryRunHistoryItem({
      ...run,
      experimentReports,
      experimentMemorySummary,
      experimentValidationPolicy,
      experimentDecisionSummary,
      experimentOperatorChecklist,
      merchantContextCard,
      deliveryPackage: run.deliveryPackage,
      updatedAt: run.updatedAt,
    }, archiveRecord);
  const experimentWorkbenchBoard = workbenchBoardLooksValid(run.experimentWorkbenchBoard)
    ? run.experimentWorkbenchBoard
    : buildExperimentWorkbenchBoard({
      ...run,
      experimentReports,
      experimentMemorySummary,
      experimentValidationPolicy,
      experimentDecisionSummary,
      experimentOperatorChecklist,
      merchantContextCard,
      deliveryPackage: run.deliveryPackage,
      updatedAt: run.updatedAt,
    }, runHistorySummary, [archiveRecord]);
  const crossRunComparison = run.crossRunComparison || buildCrossRunComparisonResult({
    ...run,
    experimentReports,
    experimentMemorySummary,
    experimentLearningGapMap,
    experimentValidationPolicy,
    experimentDecisionSummary,
    merchantContextCard,
    updatedAt: run.updatedAt,
  }, runHistorySummary, [archiveRecord]);
  const merchantLearningArchive = run.merchantLearningArchive || buildMerchantLearningArchive({
    ...run,
    experimentReports,
    experimentMemorySummary,
    experimentLearningGapMap,
    experimentValidationPolicy,
    experimentDecisionSummary,
    merchantContextCard,
    updatedAt: run.updatedAt,
  }, runHistorySummary, [archiveRecord]);
  const contentExperimentTraceGraph = run.contentExperimentTraceGraph || buildContentExperimentTraceGraph({
    ...run,
    ...productionAssets,
    ...batchLayer,
    performanceRecords,
    experimentPlans,
    experimentReports,
    experimentDecisionSummary,
    experimentMemorySummary,
    merchantLearningArchive,
    updatedAt: run.updatedAt,
  });
  const traceabilitySummary = run.traceabilitySummary || buildTraceabilitySummary({
    ...run,
    merchantLearningArchive,
    updatedAt: run.updatedAt,
  }, contentExperimentTraceGraph);
  const {
    platformDataContract,
    platformImportTemplate,
    platformFieldMapping,
    platformImportQualityReport,
    normalizedPlatformMetricRecords,
    platformDataReadinessSummary,
    platformCsvAdapterPresets,
    platformCsvMappingPreview,
    platformCsvImportPreviewSummary,
    platformCsvMappingPresetExport,
    platformExportVersionRegistry,
    platformCsvRehearsalSummary,
    platformCsvRegressionSnapshot,
  } = buildPlatformDataLayer({ ...run, performanceRecords, updatedAt: run.updatedAt });
  const safeProductionAssets = {
    ...productionAssets,
    assets: productionAssets.assets.map(stripSessionAssetFields),
  };
  const projectJson = JSON.stringify({
    id: run.id,
    project: run.project,
    briefs: run.briefs,
    tasks: run.tasks,
    calendarItems: run.calendarItems,
    report: run.report,
    ...safeProductionAssets,
    ...batchLayer,
    videoAssemblyJobs,
    videoQaSummary,
    videoProviderAudit,
    performanceRecords,
    performanceInsights,
    regenerationPlan,
    performanceFeedbackReport,
    experimentPlans,
    experimentVariantMatrices,
    experimentReports,
    experimentMemorySummary,
    experimentPriorityQueue,
    experimentLearningGapMap,
    experimentSequencingPlan,
    experimentValidationPolicy,
    experimentDecisionSummary,
    experimentExecutionPlaybook,
    experimentCadencePlan,
    experimentOperatorChecklist,
    experimentExecutionSummary,
    runHistoryItem,
    runHistorySummary,
    experimentWorkbenchBoard,
    experimentArchiveRecord: archiveRecord,
    crossRunComparison,
    merchantLearningArchive,
    contentExperimentTraceGraph,
    traceabilitySummary,
    platformDataContract,
    platformImportTemplate,
    platformFieldMapping,
    platformImportQualityReport,
    normalizedPlatformMetricRecords,
    platformDataReadinessSummary,
    platformCsvAdapterPresets,
    platformCsvMappingPreview,
    platformCsvImportPreviewSummary,
    platformCsvMappingPresetExport,
    platformExportVersionRegistry,
    platformCsvRehearsalSummary,
    platformCsvRegressionSnapshot,
    operatingReview,
    merchantContextCard,
    activityLog: run.activityLog,
    qualityGate: gate,
    currentStep: run.currentStep,
    updatedAt: run.updatedAt,
  }, null, 2);
  const briefTable = run.briefs.map(brief => ({
    platform: brief.platform,
    contentType: brief.contentType,
    hook: brief.hook,
    status: brief.status,
    score: brief.qualityScore.overallScore,
  }));
  const riskReview = unique(run.briefs.flatMap(brief => brief.riskNotes.map(safeRiskLabel))).slice(0, 8);

  return scrubDeliveryPackage({
    executiveSummary: run.report.conclusion,
    projectSummary: `${run.project.productName} · ${run.project.category} · ${run.project.targetPlatforms.join(' / ')}`,
    briefTable,
    riskReview,
    qualityGateSummary: gate.passed ? `质量门禁通过，综合分 ${gate.score}。` : `还有 ${gate.blockers.length} 个阻塞项需要修复。`,
    markdown,
    briefCsv,
    projectJson,
    scriptsMarkdown: exportScriptsMarkdown(productionAssets.scripts),
    storyboardMarkdown: exportStoryboardMarkdown(productionAssets.storyboards),
    assetPlanMarkdown: exportAssetPlanMarkdown(productionAssets.assetPlan),
    variantMatrixCsv: exportVariantMatrixCsv(productionAssets.variantMatrices),
    productionChecklistMarkdown: exportProductionChecklistMarkdown(run),
    assetLibraryMarkdown: exportAssetLibraryMarkdown(productionAssets.assets),
    productionReadinessMarkdown: exportProductionReadinessMarkdown(productionAssets.productionReadiness),
    assemblyManifestMarkdown: buildAssemblyManifestMarkdown({ ...run, ...productionAssets }),
    assemblyManifestCsv: buildAssemblyManifestCsv({ ...run, ...productionAssets }),
    missingAssetsChecklistMarkdown: exportMissingAssetsChecklistMarkdown(productionAssets.productionReadiness),
    batchProductionMarkdown: primaryBatch ? buildBatchProductionMarkdown(primaryBatch, primaryEditPacks) : '# 批量生产批次\n\n暂无批次。',
    editPackMarkdown: buildEditPackMarkdown(primaryEditPack),
    subtitleSrtSample: primaryEditPack ? buildSubtitleSrt(primaryEditPack) : '',
    editDecisionListCsv: primaryEditPack ? buildEditDecisionListCsv(primaryEditPack) : 'order,startSecond,endSecond,assetIds,subtitle,voiceover,transitionNote,productionNote',
    assetManifestCsv: primaryEditPack ? buildAssetManifestCsv(primaryEditPack) : 'shotOrder,assetId,fileName,usage,missing',
    batchQaSummaryMarkdown: buildBatchQaSummaryMarkdown(batchLayer.batchQaSummary),
    videoAssemblyMarkdown: buildVideoAssemblyMarkdown(videoAssemblyJobs),
    renderPlanMarkdown: buildRenderPlanMarkdown(videoAssemblyJobs[0]),
    providerPayloadJson: JSON.stringify(redactVideoPayload(videoAssemblyJobs[0]?.renderPlan.providerPayloadPreview || { providerId: 'local-mock-video', jobs: [] }), null, 2),
    videoQaMarkdown: buildVideoQaMarkdown(videoQaSummary),
    mockVideoOutputPlaceholderMarkdown: buildMockVideoOutputPlaceholderMarkdown(videoAssemblyJobs[0]),
    performanceFeedbackMarkdown: performanceFeedbackReport.markdown,
    performanceRecordsCsv: performanceFeedbackReport.csv,
    regenerationPlanMarkdown: buildRegenerationPlanMarkdown(regenerationPlan),
    experimentPlanMarkdown: buildExperimentPlanMarkdown(primaryExperimentPlan),
    experimentCsvTemplate: primaryExperimentPlan ? buildExperimentCsvTemplate(primaryExperimentPlan) : '',
    trackingPlanMarkdown: buildTrackingPlanMarkdown(primaryExperimentPlan),
    manualResultEntryTemplateCsv: primaryExperimentPlan ? buildManualResultEntryTemplate(primaryExperimentPlan) : '',
    experimentReportMarkdown: primaryExperimentReport?.markdown || '# 实验复盘报告\n\n当前还没有实验复盘报告。',
    experimentConfidenceMarkdown: buildExperimentConfidenceMarkdown(primaryExperimentPlan, primaryExperimentReport),
    experimentMemoryMarkdown: buildExperimentMemoryMarkdown(experimentMemorySummary),
    experimentPriorityQueueMarkdown: buildExperimentPriorityQueueMarkdown(experimentPriorityQueue),
    experimentLearningGapMapMarkdown: buildExperimentLearningGapMapMarkdown(experimentLearningGapMap),
    experimentSequencingPlanMarkdown: buildExperimentSequencingPlanMarkdown(experimentSequencingPlan),
    experimentValidationPolicyMarkdown: buildExperimentValidationPolicyMarkdown(experimentValidationPolicy),
    experimentDecisionSummaryMarkdown: buildExperimentDecisionSummaryMarkdown(experimentDecisionSummary),
    experimentExecutionPlaybookMarkdown: buildExperimentExecutionPlaybookMarkdown(experimentExecutionPlaybook),
    experimentCadencePlanMarkdown: buildExperimentCadencePlanMarkdown(experimentCadencePlan),
    experimentOperatorChecklistMarkdown: buildExperimentOperatorChecklistMarkdown(experimentOperatorChecklist),
    experimentWorkbenchMarkdown: buildExperimentWorkbenchMarkdown(experimentWorkbenchBoard, runHistorySummary, archiveRecord),
    crossRunComparisonMarkdown: buildCrossRunComparisonMarkdown(crossRunComparison),
    merchantLearningArchiveMarkdown: buildMerchantLearningArchiveMarkdown(merchantLearningArchive),
    contentExperimentTraceMarkdown: buildContentExperimentTraceMarkdown(contentExperimentTraceGraph),
    traceabilitySummaryMarkdown: buildTraceabilitySummaryMarkdown(traceabilitySummary),
    platformDataContractMarkdown: buildPlatformDataContractMarkdown(platformDataContract),
    platformImportTemplateCsv: platformImportTemplate.csv,
    platformImportQualityMarkdown: buildPlatformImportQualityMarkdown(platformImportQualityReport),
    platformDataReadinessMarkdown: buildPlatformDataReadinessMarkdown(platformDataReadinessSummary),
    platformCsvMappingPreviewMarkdown: buildPlatformCsvMappingPreviewMarkdown(platformCsvMappingPreview),
    platformCsvImportPreviewMarkdown: buildPlatformCsvImportPreviewMarkdown(platformCsvImportPreviewSummary),
    platformCsvMappingPresetJson: JSON.stringify(platformCsvMappingPresetExport, null, 2),
    platformExportVersionRegistryMarkdown: buildPlatformExportVersionRegistryMarkdown(platformExportVersionRegistry),
    platformCsvRehearsalMarkdown: buildPlatformCsvRehearsalMarkdown(platformCsvRehearsalSummary),
    platformCsvRegressionSnapshotMarkdown: buildPlatformCsvRegressionSnapshotMarkdown(platformCsvRegressionSnapshot),
    operatingReviewMarkdown: buildFactoryOperatingReviewMarkdown(operatingReview),
    merchantContextMarkdown: buildMerchantContextMarkdown(merchantContextCard),
    assetMetadataJson: exportAssetMetadataJson(productionAssets.assets),
    assetRelinkGuideMarkdown: exportAssetRelinkGuideMarkdown(productionAssets.assets),
    sessionAssetWarningMarkdown: exportSessionAssetWarningMarkdown(productionAssets.assets),
    clientMessageDraft: `本轮已完成 ${run.project.productName} 的本地试跑，生成 ${run.briefs.length} 条 Brief，并形成 POC 报告、任务队列、内容日历、批量生产批次和编辑交付包。建议下一步按 ${run.report.pricingRecommendation} 方案确认首轮生产范围。`,
    ready: gate.passed,
  });
}

export function safeDownloadFilename(input: string, extension: 'md' | 'csv' | 'json') {
  const base = slugify(input).slice(0, 48) || 'listing-project';
  return `${base}.${extension}`;
}

function createActivity(action: string, detail: string, now = new Date()): ActivityLogItem {
  return {
    id: `activity-${now.getTime().toString(36)}-${slugify(action)}`,
    time: now.toISOString(),
    action,
    detail,
  };
}

export function evaluateRunQualityGate(run: Pick<ListingFactoryRun, 'project' | 'briefs' | 'tasks' | 'calendarItems' | 'report'> & Partial<ListingFactoryRun>): QualityGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const requiredFixes: string[] = [];
  const contentTypes = unique(run.briefs.map(brief => brief.contentType));
  const platforms = unique(run.briefs.map(brief => brief.platform));
  const avgScore = average(run.briefs.map(brief => brief.qualityScore.overallScore || brief.qualityScore.overall));
  const highRiskCount = run.briefs.filter(brief => brief.riskLevel === 'high').length;

  if (!run.project.productName || !run.project.category || run.project.sellingPoints.length === 0) {
    blockers.push('SKU 信息不完整');
    requiredFixes.push('补齐商品名、类目和核心卖点');
  }
  if (run.briefs.length < 6) {
    blockers.push('Brief 少于 6 条');
    requiredFixes.push('重新生成至少 6 条 Brief');
  }
  if (contentTypes.length < 3) {
    blockers.push('内容类型少于 3 种');
    requiredFixes.push('补充更多内容类型变体');
  }
  if (!run.project.targetPlatforms.every(platform => platforms.includes(platform))) {
    warnings.push('尚未覆盖全部目标平台');
  }
  if (highRiskCount > 0) {
    warnings.push(`${highRiskCount} 条 Brief 需要品牌安全审核`);
  }
  if (avgScore < 70) {
    blockers.push('平均综合评分低于 70');
    requiredFixes.push('编辑 Hook / CTA 后重新评分');
  }
  if (!run.report.clientSummary) {
    blockers.push('缺少客户汇报摘要');
    requiredFixes.push('生成 POC 报告客户摘要');
  }
  if (!run.report || run.tasks.length === 0 || run.calendarItems.length === 0) {
    blockers.push('交付资产不完整');
    requiredFixes.push('补齐任务队列、内容日历和 POC 报告');
  }

  const score = clampScore(avgScore - blockers.length * 8 - warnings.length * 3);
  const passed = blockers.length === 0 && score >= 70;

  return {
    passed,
    score,
    blockers,
    warnings,
    requiredFixes,
    recommendedNextStep: passed ? '当前可进入 POC 报告和客户交付包。' : `还有 ${blockers.length} 个问题需要修复。`,
  };
}

function buildWorkflowSteps(run: Pick<ListingFactoryRun, 'project' | 'briefs' | 'tasks' | 'calendarItems' | 'report'> & { qualityGate?: QualityGateResult; deliveryPackage?: DeliveryPackage }): WorkflowStep[] {
  const gate = run.qualityGate || evaluateRunQualityGate(run as ListingFactoryRun);
  return [
    { id: 'ingest', label: '导入 / 输入 SKU', status: 'completed', summary: run.project.productName, nextAction: '检查类目规则' },
    { id: 'rules', label: '检查类目规则', status: run.project.categoryRules.length > 0 ? 'completed' : 'blocked', summary: `${run.project.categoryRules.length} 条规则`, nextAction: '补充平台限制' },
    { id: 'guardrails', label: '品牌禁区', status: run.project.brandGuardrails.length > 0 ? 'completed' : 'blocked', summary: `${run.project.brandGuardrails.length} 条禁区`, nextAction: '补充品牌禁区' },
    { id: 'generate_briefs', label: '生成 Brief', status: run.briefs.length >= 6 ? 'completed' : 'ready', summary: `${run.briefs.length} 条 Brief`, nextAction: '进入质量门禁' },
    { id: 'quality_review', label: '质量门禁', status: gate.passed ? 'completed' : 'blocked', summary: gate.passed ? `通过 · ${gate.score}` : `${gate.blockers.length} 个阻塞项`, nextAction: gate.recommendedNextStep },
    { id: 'task_queue', label: '任务队列', status: run.tasks.length > 0 ? 'completed' : 'pending', summary: `${run.tasks.length} 个任务`, nextAction: '排进内容日历' },
    { id: 'calendar', label: '内容日历', status: run.calendarItems.length > 0 ? 'completed' : 'pending', summary: `${run.calendarItems.length} 个日历项`, nextAction: '生成 POC 报告' },
    { id: 'report', label: 'POC 报告', status: run.report.clientSummary ? 'completed' : 'pending', summary: run.report.pricingRecommendation, nextAction: '生成交付包' },
    { id: 'delivery_package', label: '交付包', status: run.deliveryPackage?.ready ? 'completed' : 'ready', summary: run.deliveryPackage ? '可导出' : '待生成', nextAction: '导出项目' },
    { id: 'export', label: '导出 / 导入', status: 'ready', summary: 'JSON / Markdown / CSV', nextAction: '导出 JSON 延续项目' },
  ];
}

export function createRunFromProject(project: ListingProject, now = new Date()): ListingFactoryRun {
  const briefs = generateBriefs(project);
  const tasks = buildTasksFromBriefs(project, briefs);
  const calendarItems = buildCalendarFromTasks(tasks, now);
  const report = buildPocReport(project, briefs);
  const productionAssets = buildProductionAssets(project, briefs);
  const baseRun = {
    id: `run-${project.id}-${now.getTime().toString(36)}`,
    project,
    briefs,
    tasks,
    calendarItems,
    report,
    ...productionAssets,
    activityLog: [
      createActivity('创建本地项目', project.productName, now),
      createActivity('生成 Brief', `${briefs.length} 条`, now),
      createActivity('生成任务队列', `${tasks.length} 个任务`, now),
      createActivity('生成 POC 报告', report.pricingRecommendation, now),
    ],
    currentStep: 'quality_review' as WorkflowStepId,
    updatedAt: now.toISOString(),
  };
  const qualityGate = evaluateRunQualityGate(baseRun);
  const batchLayer = buildBatchLayer({ ...baseRun, qualityGate });
  const videoAssemblyJobs = batchLayer.editPacks.slice(0, 3).map(editPack => buildVideoAssemblyJob({ ...baseRun, ...batchLayer }, editPack, { providerId: 'local-mock-video', fallbackToMock: true }));
  const videoQaSummary = videoAssemblyJobs[0]?.qaResult || {
    passed: false,
    score: 40,
    blockers: ['No video assembly job'],
    warnings: [],
    checks: [],
    recommendedNextStep: 'Build edit packs before video assembly.',
  };
  const videoProviderAudit = videoAssemblyJobs.map(job => job.providerAudit);
  const videoLayer = { videoAssemblyJobs, videoQaSummary, videoProviderAudit };
  const performanceRecords: ContentPerformanceRecord[] = [];
  const performanceInsights = analyzePerformancePatterns(baseRun, performanceRecords);
  const regenerationPlan = buildRegenerationPlan({ ...baseRun, performanceRecords }, performanceInsights);
  const performanceFeedbackReport = buildPerformanceFeedbackReport({ ...baseRun, performanceRecords, performanceInsights, regenerationPlan });
  const performanceLayer = { performanceRecords, performanceInsights, regenerationPlan, performanceFeedbackReport };
  const experimentPlans = [buildExperimentPlanFromInsights({ ...baseRun, ...batchLayer, ...performanceLayer }, performanceInsights)];
  const experimentVariantMatrices = experimentPlans.map(plan => buildExperimentVariantMatrix({ ...baseRun, ...batchLayer }, plan));
  const experimentReports = experimentPlans.map(plan => analyzeExperimentResults(plan, performanceRecords));
  const experimentMemorySummary = buildExperimentMemorySummary({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports });
  const experimentPriorityQueue = buildExperimentPriorityQueue({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary }, experimentMemorySummary);
  const experimentLearningGapMap = buildExperimentLearningGapMap({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue }, experimentMemorySummary, experimentPriorityQueue);
  const experimentSequencingPlan = buildExperimentSequencingPlan({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap }, experimentLearningGapMap, experimentPriorityQueue, experimentMemorySummary);
  const experimentValidationPolicy = buildExperimentValidationPolicy({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan }, experimentReports[0]?.confidenceSummary, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan);
  const experimentDecisionSummary = buildExperimentDecisionSummary({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy }, experimentValidationPolicy);
  const experimentCadencePlan = buildExperimentCadencePlan({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan);
  const experimentOperatorChecklist = buildExperimentOperatorChecklist({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan }, experimentValidationPolicy, experimentDecisionSummary);
  const experimentLayerBase = { experimentPlans, experimentVariantMatrices, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan, experimentOperatorChecklist };
  const merchantContextCard = buildMerchantContextCard({ ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayerBase });
  const experimentExecutionPlaybook = buildExperimentExecutionPlaybook({ ...baseRun, ...performanceLayer, ...experimentLayerBase, merchantContextCard }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan, experimentPriorityQueue, experimentLearningGapMap, experimentReports[0]?.confidenceSummary, merchantContextCard);
  const experimentExecutionSummary = buildExperimentExecutionSummary({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, merchantContextCard }, experimentExecutionPlaybook, experimentCadencePlan, experimentOperatorChecklist);
  const experimentArchiveRecord = buildExperimentArchiveRecord({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard });
  const runHistorySummary = buildListingFactoryRunHistorySummary([{ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }], [experimentArchiveRecord]);
  const runHistoryItem = buildListingFactoryRunHistoryItem({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, experimentArchiveRecord);
  const experimentWorkbenchBoard = buildExperimentWorkbenchBoard({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const crossRunComparison = buildCrossRunComparisonResult({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const merchantLearningArchive = buildMerchantLearningArchive({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const traceSource = { ...baseRun, ...batchLayer, ...performanceLayer, ...experimentLayerBase, experimentDecisionSummary, merchantLearningArchive };
  const contentExperimentTraceGraph = buildContentExperimentTraceGraph(traceSource);
  const traceabilitySummary = buildTraceabilitySummary(traceSource, contentExperimentTraceGraph);
  const platformDataLayer = buildPlatformDataLayer({ ...baseRun, ...performanceLayer });
  const experimentLayer = { ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, runHistoryItem, runHistorySummary, experimentWorkbenchBoard, experimentArchiveRecord, crossRunComparison, merchantLearningArchive, contentExperimentTraceGraph, traceabilitySummary, ...platformDataLayer };
  const operatingReview = buildFactoryOperatingReview({ ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, qualityGate });
  const runWithoutPackage = { ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate, steps: [] as WorkflowStep[], deliveryPackage: undefined };
  const deliveryPackage = buildDeliveryPackage(runWithoutPackage);
  const run = { ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate, deliveryPackage, steps: [] as WorkflowStep[] };
  return { ...run, steps: buildWorkflowSteps(run) };
}

export function buildGoldenListingFactoryRun(goldenProject: GoldenListingFactoryProject, fixedDate = new Date('2026-05-12T09:00:00Z')): ListingFactoryRun {
  const project = createListingProject(goldenProject.projectInput, fixedDate);
  const briefs = generateBriefs(project);
  const tasks = buildTasksFromBriefs(project, briefs);
  const calendarItems = buildCalendarFromTasks(tasks, fixedDate);
  const report = buildPocReport(project, briefs);
  const references = goldenProject.referenceCreatives.map((reference, index): ReferenceCreative => ({
    id: `golden-ref-${project.id}-${index + 1}`,
    title: reference.title,
    platform: reference.platform,
    category: project.category,
    rawText: reference.rawText,
    observedHook: reference.observedHook || '',
    observedStructure: reference.observedStructure || '',
    audience: reference.audience || project.targetAudience,
    sellingPoint: reference.sellingPoint || project.sellingPoints[0] || project.productName,
    riskNotes: reference.riskNotes || [],
    sourceType: 'manual_input',
  }));
  const deconstructions = references.map(reference => deconstructReferenceCreative(reference, project));
  const scripts = briefs.slice(0, 6).map(brief => buildScriptFromBrief(project, brief));
  const storyboards = scripts.map(script => buildStoryboardFromScript(project, script));
  const assets = goldenProject.manualAssets.map((input, index) => ({
    ...createManualAsset(project.id, input, project),
    id: `golden-asset-${project.id}-${index + 1}`,
    createdAt: fixedDate.toISOString(),
  }));
  const assetPlan = buildAssetPlan(project, scripts, storyboards);
  const variantMatrices = briefs.slice(0, 2).map(brief => buildVariantMatrix(project, brief));
  const shotAssetMatches = storyboards.flatMap(storyboard => matchAssetsToStoryboard(project, storyboard, assets));
  const productionReadiness = evaluateProductionReadiness({ project, scripts, storyboards, variantMatrices, assets, shotAssetMatches });
  const assemblyPlan = buildAssemblyPlan({ project, scripts, storyboards, variantMatrices, assets, shotAssetMatches, productionReadiness });
  const productionAssetsStatus = {
    references: references.length,
    scripts: scripts.length,
    storyboards: storyboards.length,
    requiredAssets: assetPlan.requiredImages.length + assetPlan.requiredVideos.length,
    missingAssets: assetPlan.missingAssets.length,
    variants: variantMatrices.reduce((sum, matrix) => sum + matrix.variants.length, 0),
    ready: scripts.length > 0 && storyboards.length > 0,
  };
  const baseRun = {
    id: `run-${project.id}-golden-${fixedDate.getTime().toString(36)}`,
    project,
    briefs,
    tasks,
    calendarItems,
    report,
    references,
    deconstructions,
    scripts,
    storyboards,
    assetPlan,
    variantMatrices,
    productionAssetsStatus,
    assets,
    shotAssetMatches,
    productionReadiness,
    assemblyPlan,
    activityLog: [
      createActivity('加载黄金样本', goldenProject.label, fixedDate),
      createActivity('生成 Brief', `${briefs.length} 条`, fixedDate),
      createActivity('生成批量生产批次', `${project.productName}`, fixedDate),
    ],
    currentStep: 'quality_review' as WorkflowStepId,
    updatedAt: fixedDate.toISOString(),
  };
  const qualityGate = evaluateRunQualityGate(baseRun);
  const batchLayer = buildBatchLayer({ ...baseRun, qualityGate });
  const videoAssemblyJobs = batchLayer.editPacks.slice(0, 3).map(editPack => buildVideoAssemblyJob({ ...baseRun, ...batchLayer }, editPack, { providerId: 'local-mock-video', fallbackToMock: true }));
  const videoQaSummary = videoAssemblyJobs[0]?.qaResult || {
    passed: false,
    score: 40,
    blockers: ['No video assembly job'],
    warnings: [],
    checks: [],
    recommendedNextStep: 'Build edit packs before video assembly.',
  };
  const videoProviderAudit = videoAssemblyJobs.map(job => job.providerAudit);
  const videoLayer = { videoAssemblyJobs, videoQaSummary, videoProviderAudit };
  const demoPerformanceRecords = batchLayer.productionBatches[0].batchItems.slice(0, 6).map((item, index) => normalizePerformanceRecord({
    id: `golden-perf-${project.id}-${index + 1}`,
    platform: item.platform,
    contentType: item.contentType,
    hook: item.hook,
    impressions: 1200 + index * 280,
    views: 680 + index * 150,
    clicks: 35 + index * 11,
    likes: 42 + index * 7,
    comments: 6 + index,
    saves: 12 + index * 2,
    shares: 8 + index,
    revenue: index % 2 === 0 ? 320 + index * 45 : undefined,
    cost: index % 2 === 0 ? 95 + index * 12 : undefined,
    source: 'demo_performance',
    batchItemId: item.id,
    briefId: item.briefId,
    editPackId: item.editPackId,
    notes: index % 3 === 0 ? 'Strong opening; reuse structure carefully.' : 'Manual golden sample metric.',
  }, { ...baseRun, ...batchLayer }));
  const performanceInsights = analyzePerformancePatterns({ ...baseRun, ...batchLayer }, demoPerformanceRecords);
  const regenerationPlan = buildRegenerationPlan({ ...baseRun, ...batchLayer, performanceRecords: demoPerformanceRecords }, performanceInsights);
  const performanceFeedbackReport = buildPerformanceFeedbackReport({ ...baseRun, ...batchLayer, performanceRecords: demoPerformanceRecords, performanceInsights, regenerationPlan });
  const performanceLayer = { performanceRecords: demoPerformanceRecords, performanceInsights, regenerationPlan, performanceFeedbackReport };
  const experimentPlans = [buildExperimentPlanFromInsights({ ...baseRun, ...batchLayer, ...performanceLayer }, performanceInsights)];
  const experimentVariantMatrices = experimentPlans.map(plan => buildExperimentVariantMatrix({ ...baseRun, ...batchLayer }, plan));
  const experimentReports = experimentPlans.map(plan => analyzeExperimentResults(plan, demoPerformanceRecords));
  const experimentMemorySummary = buildExperimentMemorySummary({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports });
  const experimentPriorityQueue = buildExperimentPriorityQueue({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary }, experimentMemorySummary);
  const experimentLearningGapMap = buildExperimentLearningGapMap({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue }, experimentMemorySummary, experimentPriorityQueue);
  const experimentSequencingPlan = buildExperimentSequencingPlan({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap }, experimentLearningGapMap, experimentPriorityQueue, experimentMemorySummary);
  const experimentValidationPolicy = buildExperimentValidationPolicy({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan }, experimentReports[0]?.confidenceSummary, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan);
  const experimentDecisionSummary = buildExperimentDecisionSummary({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy }, experimentValidationPolicy);
  const experimentCadencePlan = buildExperimentCadencePlan({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan);
  const experimentOperatorChecklist = buildExperimentOperatorChecklist({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan }, experimentValidationPolicy, experimentDecisionSummary);
  const experimentLayerBase = { experimentPlans, experimentVariantMatrices, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan, experimentOperatorChecklist };
  const merchantContextCard = buildMerchantContextCard({ ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayerBase });
  const experimentExecutionPlaybook = buildExperimentExecutionPlaybook({ ...baseRun, ...performanceLayer, ...experimentLayerBase, merchantContextCard }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan, experimentPriorityQueue, experimentLearningGapMap, experimentReports[0]?.confidenceSummary, merchantContextCard);
  const experimentExecutionSummary = buildExperimentExecutionSummary({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, merchantContextCard }, experimentExecutionPlaybook, experimentCadencePlan, experimentOperatorChecklist);
  const experimentArchiveRecord = buildExperimentArchiveRecord({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard });
  const runHistorySummary = buildListingFactoryRunHistorySummary([{ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }], [experimentArchiveRecord]);
  const runHistoryItem = buildListingFactoryRunHistoryItem({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, experimentArchiveRecord);
  const experimentWorkbenchBoard = buildExperimentWorkbenchBoard({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const crossRunComparison = buildCrossRunComparisonResult({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const merchantLearningArchive = buildMerchantLearningArchive({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const traceSource = { ...baseRun, ...batchLayer, ...performanceLayer, ...experimentLayerBase, experimentDecisionSummary, merchantLearningArchive };
  const contentExperimentTraceGraph = buildContentExperimentTraceGraph(traceSource);
  const traceabilitySummary = buildTraceabilitySummary(traceSource, contentExperimentTraceGraph);
  const platformDataLayer = buildPlatformDataLayer({ ...baseRun, ...performanceLayer });
  const experimentLayer = { ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, runHistoryItem, runHistorySummary, experimentWorkbenchBoard, experimentArchiveRecord, crossRunComparison, merchantLearningArchive, contentExperimentTraceGraph, traceabilitySummary, ...platformDataLayer };
  const operatingReview = buildFactoryOperatingReview({ ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, qualityGate });
  const runWithoutPackage = { ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate, steps: [] as WorkflowStep[], deliveryPackage: undefined };
  const deliveryPackage = buildDeliveryPackage(runWithoutPackage);
  const run = { ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate, deliveryPackage, steps: [] as WorkflowStep[] };
  return { ...run, steps: buildWorkflowSteps(run) };
}

export function exportListingFactoryRun(run: ListingFactoryRun) {
  return JSON.stringify(stripRunSessionAssetFields(run), null, 2);
}

function hydrateProductionAssets(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'briefs'>) {
  const fallback = buildProductionAssets(run.project, run.briefs);
  const references = Array.isArray(run.references) && run.references.length > 0 ? run.references : fallback.references;
  const deconstructions = Array.isArray(run.deconstructions) && run.deconstructions.length > 0 ? run.deconstructions : references.map(reference => deconstructReferenceCreative(reference, run.project));
  const scripts = Array.isArray(run.scripts) && run.scripts.length > 0 ? run.scripts : fallback.scripts;
  const storyboards = Array.isArray(run.storyboards) && run.storyboards.length > 0 ? run.storyboards : scripts.map(script => buildStoryboardFromScript(run.project, script));
  const assetPlan = run.assetPlan || buildAssetPlan(run.project, scripts, storyboards);
  const variantMatrices = Array.isArray(run.variantMatrices) && run.variantMatrices.length > 0 ? run.variantMatrices : fallback.variantMatrices;
  const assets = Array.isArray(run.assets) ? run.assets : fallback.assets;
  const shotAssetMatches = Array.isArray(run.shotAssetMatches) && run.shotAssetMatches.length > 0
    ? run.shotAssetMatches
    : storyboards.flatMap(storyboard => matchAssetsToStoryboard(run.project, storyboard, assets));
  const productionReadiness = run.productionReadiness || evaluateProductionReadiness({
    project: run.project,
    scripts,
    storyboards,
    variantMatrices,
    assets,
    shotAssetMatches,
  });
  const assemblyPlan = run.assemblyPlan || buildAssemblyPlan({
    project: run.project,
    scripts,
    storyboards,
    variantMatrices,
    assets,
    shotAssetMatches,
    productionReadiness,
  });
  const productionAssetsStatus = run.productionAssetsStatus || {
    references: references.length,
    scripts: scripts.length,
    storyboards: storyboards.length,
    requiredAssets: assetPlan.requiredImages.length + assetPlan.requiredVideos.length,
    missingAssets: assetPlan.missingAssets.length,
    variants: variantMatrices.reduce((sum, matrix) => sum + matrix.variants.length, 0),
    ready: scripts.length > 0 && storyboards.length > 0,
  };

  return {
    references,
    deconstructions,
    scripts,
    storyboards,
    assetPlan,
    variantMatrices,
    productionAssetsStatus,
    assets,
    shotAssetMatches,
    productionReadiness,
    assemblyPlan,
  };
}

function hydrateBatchLayer(run: Partial<ListingFactoryRun> & BatchBuildRun) {
  return buildBatchLayer(run);
}

function defaultVideoQaSummary(): VideoQaResult {
  return {
    passed: false,
    score: 40,
    blockers: ['No video assembly job'],
    warnings: [],
    checks: [],
    recommendedNextStep: 'Build an Edit Pack before creating video assembly jobs.',
  };
}

function hydrateVideoLayer(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'assets'> & { editPacks: EditPack[] }) {
  const videoAssemblyJobs = Array.isArray(run.videoAssemblyJobs) && run.videoAssemblyJobs.length > 0
    ? run.videoAssemblyJobs
    : run.editPacks.slice(0, 3).map(editPack => buildVideoAssemblyJob(run, editPack, { providerId: 'local-mock-video', fallbackToMock: true }));
  const videoQaSummary = run.videoQaSummary || videoAssemblyJobs[0]?.qaResult || defaultVideoQaSummary();
  const videoProviderAudit = Array.isArray(run.videoProviderAudit) && run.videoProviderAudit.length > 0
    ? run.videoProviderAudit
    : videoAssemblyJobs.map(job => job.providerAudit);
  return { videoAssemblyJobs, videoQaSummary, videoProviderAudit };
}

function hydratePerformanceLayer(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project'>) {
  const performanceRecords = Array.isArray(run.performanceRecords) ? run.performanceRecords.map(calculatePerformanceMetrics) : [];
  const performanceInsights = Array.isArray(run.performanceInsights) && run.performanceInsights.length > 0
    ? run.performanceInsights
    : analyzePerformancePatterns(run, performanceRecords);
  const regenerationPlan = run.regenerationPlan || buildRegenerationPlan({ ...run, performanceRecords }, performanceInsights);
  const performanceFeedbackReport = run.performanceFeedbackReport || buildPerformanceFeedbackReport({
    ...run,
    performanceRecords,
    performanceInsights,
    regenerationPlan,
  });
  return { performanceRecords, performanceInsights, regenerationPlan, performanceFeedbackReport };
}

function hydrateExperimentLayer(run: Partial<ListingFactoryRun> & Pick<ListingFactoryRun, 'project' | 'briefs'>) {
  const performanceInsights = Array.isArray(run.performanceInsights) ? run.performanceInsights : [];
  const performanceRecords = Array.isArray(run.performanceRecords) ? run.performanceRecords.map(calculatePerformanceMetrics) : [];
  const experimentPlans = Array.isArray(run.experimentPlans) && run.experimentPlans.length > 0
    ? run.experimentPlans
    : [buildExperimentPlanFromInsights(run, performanceInsights, { targetPlatforms: run.regenerationPlan?.nextPlatforms || run.project.targetPlatforms })];
  const experimentVariantMatrices = Array.isArray(run.experimentVariantMatrices) && run.experimentVariantMatrices.length > 0
    ? run.experimentVariantMatrices
    : experimentPlans.map(plan => buildExperimentVariantMatrix(run, plan));
  const experimentReports = Array.isArray(run.experimentReports) && run.experimentReports.length > 0
    ? experimentPlans.map((plan, index) => reportHasConfidence(run.experimentReports?.[index])
      ? run.experimentReports[index]
      : analyzeExperimentResults(plan, performanceRecords))
    : experimentPlans.map(plan => analyzeExperimentResults(plan, performanceRecords));
  const experimentMemorySummary = memorySummaryLooksValid(run.experimentMemorySummary)
    ? run.experimentMemorySummary
    : buildExperimentMemorySummary({ ...run, experimentPlans, experimentReports, updatedAt: run.updatedAt });
  const experimentPriorityQueue = priorityQueueLooksValid(run.experimentPriorityQueue)
    ? run.experimentPriorityQueue
    : buildExperimentPriorityQueue({ ...run, experimentPlans, experimentReports, experimentMemorySummary, updatedAt: run.updatedAt }, experimentMemorySummary, run.merchantContextCard);
  const experimentLearningGapMap = learningGapMapLooksValid(run.experimentLearningGapMap)
    ? run.experimentLearningGapMap
    : buildExperimentLearningGapMap({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, updatedAt: run.updatedAt }, experimentMemorySummary, experimentPriorityQueue, run.merchantContextCard);
  const experimentSequencingPlan = sequencingPlanLooksValid(run.experimentSequencingPlan)
    ? run.experimentSequencingPlan
    : buildExperimentSequencingPlan({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, updatedAt: run.updatedAt }, experimentLearningGapMap, experimentPriorityQueue, experimentMemorySummary, run.merchantContextCard);
  const experimentValidationPolicy = validationPolicyLooksValid(run.experimentValidationPolicy)
    ? run.experimentValidationPolicy
    : buildExperimentValidationPolicy({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, updatedAt: run.updatedAt }, experimentReports[0]?.confidenceSummary, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, run.merchantContextCard);
  const experimentDecisionSummary = decisionSummaryLooksValid(run.experimentDecisionSummary)
    ? run.experimentDecisionSummary
    : buildExperimentDecisionSummary({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, updatedAt: run.updatedAt }, experimentValidationPolicy);
  const experimentCadencePlan = cadencePlanLooksValid(run.experimentCadencePlan)
    ? run.experimentCadencePlan
    : buildExperimentCadencePlan({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, updatedAt: run.updatedAt }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan);
  const experimentOperatorChecklist = operatorChecklistLooksValid(run.experimentOperatorChecklist)
    ? run.experimentOperatorChecklist
    : buildExperimentOperatorChecklist({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan, updatedAt: run.updatedAt }, experimentValidationPolicy, experimentDecisionSummary);
  const experimentExecutionPlaybook = executionPlaybookLooksValid(run.experimentExecutionPlaybook)
    ? run.experimentExecutionPlaybook
    : buildExperimentExecutionPlaybook({ ...run, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan, experimentOperatorChecklist, updatedAt: run.updatedAt }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan, experimentPriorityQueue, experimentLearningGapMap, experimentReports[0]?.confidenceSummary, run.merchantContextCard);
  const experimentExecutionSummary = executionSummaryLooksValid(run.experimentExecutionSummary)
    ? run.experimentExecutionSummary
    : buildExperimentExecutionSummary({ ...run, experimentPlans, experimentReports, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan, experimentOperatorChecklist, experimentExecutionPlaybook, updatedAt: run.updatedAt }, experimentExecutionPlaybook, experimentCadencePlan, experimentOperatorChecklist);
  const workbenchSource = {
    ...run,
    id: run.id || `run-${run.project.id}-hydrated`,
    experimentReports,
    experimentMemorySummary,
    experimentValidationPolicy,
    experimentDecisionSummary,
    experimentOperatorChecklist,
    updatedAt: run.updatedAt,
  };
  const experimentArchiveRecord = archiveRecordLooksValid(run.experimentArchiveRecord)
    ? run.experimentArchiveRecord
    : buildExperimentArchiveRecord(workbenchSource);
  const runHistorySummary = runHistorySummaryLooksValid(run.runHistorySummary)
    ? run.runHistorySummary
    : buildListingFactoryRunHistorySummary([workbenchSource], [experimentArchiveRecord]);
  const runHistoryItem = runHistoryItemLooksValid(run.runHistoryItem)
    ? run.runHistoryItem
    : buildListingFactoryRunHistoryItem(workbenchSource, experimentArchiveRecord);
  const experimentWorkbenchBoard = workbenchBoardLooksValid(run.experimentWorkbenchBoard)
    ? run.experimentWorkbenchBoard
    : buildExperimentWorkbenchBoard(workbenchSource, runHistorySummary, [experimentArchiveRecord]);
  const crossRunComparison = run.crossRunComparison || buildCrossRunComparisonResult(workbenchSource, runHistorySummary, [experimentArchiveRecord]);
  const merchantLearningArchive = run.merchantLearningArchive || buildMerchantLearningArchive(workbenchSource, runHistorySummary, [experimentArchiveRecord]);
  const traceSource = {
    ...run,
    id: run.id || `run-${run.project.id}-hydrated`,
    performanceRecords,
    experimentPlans,
    experimentReports,
    experimentMemorySummary,
    experimentDecisionSummary,
    merchantLearningArchive,
    updatedAt: run.updatedAt,
  };
  const contentExperimentTraceGraph = run.contentExperimentTraceGraph || buildContentExperimentTraceGraph(traceSource);
  const traceabilitySummary = run.traceabilitySummary || buildTraceabilitySummary(traceSource, contentExperimentTraceGraph);
  const platformDataLayer = buildPlatformDataLayer({ ...run, performanceRecords, updatedAt: run.updatedAt });
  return {
    experimentPlans,
    experimentVariantMatrices,
    experimentReports,
    experimentMemorySummary,
    experimentPriorityQueue,
    experimentLearningGapMap,
    experimentSequencingPlan,
    experimentValidationPolicy,
    experimentDecisionSummary,
    experimentCadencePlan,
    experimentOperatorChecklist,
    experimentExecutionPlaybook,
    experimentExecutionSummary,
    runHistoryItem,
    runHistorySummary,
    experimentWorkbenchBoard,
    experimentArchiveRecord,
    crossRunComparison,
    merchantLearningArchive,
    contentExperimentTraceGraph,
    traceabilitySummary,
    ...platformDataLayer,
  };
}

export function validateImportedRun(data: unknown): { ok: true; run: ListingFactoryRun } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: '导入内容不是有效对象' };
  }
  const run = data as ListingFactoryRun;
  if (!run.project?.productName || !Array.isArray(run.briefs) || !Array.isArray(run.tasks) || !Array.isArray(run.calendarItems)) {
    return { ok: false, error: '导入项目缺少 project、briefs、tasks 或 calendarItems' };
  }
  if (!run.report?.clientSummary) {
    return { ok: false, error: '导入项目缺少 POC 报告摘要' };
  }
  const productionAssets = hydrateProductionAssets(run);
  const batchLayer = hydrateBatchLayer({ ...run, ...productionAssets });
  const videoLayer = hydrateVideoLayer({ ...run, ...productionAssets, ...batchLayer });
  const performanceLayer = hydratePerformanceLayer({ ...run, ...productionAssets, ...batchLayer, ...videoLayer });
  const experimentLayer = hydrateExperimentLayer({ ...run, ...productionAssets, ...batchLayer, ...videoLayer, ...performanceLayer });
  const qualityGate = evaluateRunQualityGate(run);
  const operatingReview = run.operatingReview || buildFactoryOperatingReview({ ...run, ...productionAssets, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, qualityGate });
  const merchantContextCard = run.merchantContextCard || buildMerchantContextCard({ ...run, ...productionAssets, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer });
  const deliveryPackage = buildDeliveryPackage({ ...run, ...productionAssets, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate });
  const hydrated = {
    ...run,
    ...productionAssets,
    ...batchLayer,
    ...videoLayer,
    ...performanceLayer,
    ...experimentLayer,
    operatingReview,
    merchantContextCard,
    qualityGate,
    deliveryPackage,
    steps: buildWorkflowSteps({ ...run, ...productionAssets, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, qualityGate, deliveryPackage }),
  };
  return { ok: true, run: hydrated };
}

export function importListingFactoryRun(json: string): { ok: true; run: ListingFactoryRun } | { ok: false; error: string } {
  try {
    return validateImportedRun(JSON.parse(json));
  } catch {
    return { ok: false, error: 'JSON 解析失败，请检查导入文件内容' };
  }
}

export function saveListingProject(project: ListingProject, storage?: StorageLike) {
  const projects = loadListingProjects(storage).filter(item => item.id !== project.id);
  writeJson(PROJECTS_KEY, [project, ...projects].slice(0, 12), storage);
}

export function saveListingFactoryRun(run: ListingFactoryRun, storage?: StorageLike) {
  const safeRun = stripRunSessionAssetFields(run) as ListingFactoryRun;
  const runs = loadListingFactoryRuns(storage).filter(item => item.id !== run.id);
  writeJson(RUNS_KEY, [safeRun, ...runs].slice(0, 8), storage);
  const archiveRecords = loadExperimentArchiveRecords(storage)
    .filter(item => item.runId !== run.id);
  const archiveRecord = scrubExperimentArchiveRecord(safeRun.experimentArchiveRecord || buildExperimentArchiveRecord(safeRun));
  writeJson(ARCHIVES_KEY, [archiveRecord, ...archiveRecords].slice(0, 24), storage);
  const historySummary = buildListingFactoryRunHistorySummary([safeRun, ...runs], [archiveRecord, ...archiveRecords]);
  writeJson(RUN_HISTORY_KEY, historySummary, storage);
  saveListingProject(run.project, storage);
  saveGeneratedBriefs(run.project.id, run.briefs, storage);
  saveFactoryTasks(run.project.id, run.tasks, storage);
  savePocReport(run.report, storage);
}

export function loadListingFactoryRuns(storage?: StorageLike): ListingFactoryRun[] {
  return readJson<ListingFactoryRun[]>(RUNS_KEY, [], storage);
}

function scrubExperimentArchiveRecord(record: ExperimentArchiveRecord): ExperimentArchiveRecord {
  return {
    ...record,
    learningSummary: scrubDeliveryText(record.learningSummary),
    nextAction: scrubDeliveryText(record.nextAction),
  };
}

export function loadListingFactoryRunHistorySummary(storage?: StorageLike): ListingFactoryRunHistorySummary {
  const stored = readJson<ListingFactoryRunHistorySummary | null>(RUN_HISTORY_KEY, null, storage);
  if (stored && runHistorySummaryLooksValid(stored)) {
    return stored;
  }
  return buildListingFactoryRunHistorySummary(loadListingFactoryRuns(storage), loadExperimentArchiveRecords(storage));
}

export function loadExperimentArchiveRecords(storage?: StorageLike): ExperimentArchiveRecord[] {
  const stored = readJson<ExperimentArchiveRecord[]>(ARCHIVES_KEY, [], storage);
  return stored.filter(archiveRecordLooksValid).map(scrubExperimentArchiveRecord);
}

export function archiveListingFactoryRun(run: ListingFactoryRun, storage?: StorageLike) {
  const archiveRecord = scrubExperimentArchiveRecord({
    ...(run.experimentArchiveRecord || buildExperimentArchiveRecord(run)),
    archiveStatus: 'archived',
  });
  const archives = loadExperimentArchiveRecords(storage).filter(item => item.runId !== run.id);
  writeJson(ARCHIVES_KEY, [archiveRecord, ...archives].slice(0, 24), storage);
  const runs = loadListingFactoryRuns(storage);
  const historySummary = buildListingFactoryRunHistorySummary(runs, [archiveRecord, ...archives]);
  writeJson(RUN_HISTORY_KEY, historySummary, storage);
  return archiveRecord;
}

export function clearListingFactoryRunHistory(storage?: StorageLike) {
  const target = getStorage(storage);
  target.removeItem(RUN_HISTORY_KEY);
  target.removeItem(ARCHIVES_KEY);
  memoryStorage.delete(RUN_HISTORY_KEY);
  memoryStorage.delete(ARCHIVES_KEY);
}

export function hydrateRunFromStorage(storage?: StorageLike): ListingFactoryRun | null {
  const run = loadListingFactoryRuns(storage)[0];
  if (run) {
    const result = validateImportedRun(run);
    return result.ok ? result.run : null;
  }

  const project = loadListingProjects(storage)[0] ?? null;
  if (!project) return null;
  const briefs = loadGeneratedBriefs(project.id, storage);
  if (briefs.length === 0) return createRunFromProject(project);
  const tasks = loadFactoryTasks(project.id, storage);
  const report = loadPocReports(storage).find(item => item.projectId === project.id) || buildPocReport(project, briefs);
  const productionAssets = buildProductionAssets(project, briefs);
  const baseRun = {
    id: `run-${project.id}-hydrated`,
    project,
    briefs,
    tasks: tasks.length > 0 ? tasks : buildTasksFromBriefs(project, briefs),
    calendarItems: buildCalendarFromTasks(tasks.length > 0 ? tasks : buildTasksFromBriefs(project, briefs)),
    report,
    ...productionAssets,
    activityLog: [createActivity('恢复本地项目', project.productName)],
    currentStep: 'quality_review' as WorkflowStepId,
    updatedAt: new Date().toISOString(),
  };
  const qualityGate = evaluateRunQualityGate(baseRun);
  const batchLayer = buildBatchLayer({ ...baseRun, qualityGate });
  const videoAssemblyJobs = batchLayer.editPacks.slice(0, 3).map(editPack => buildVideoAssemblyJob({ ...baseRun, ...batchLayer }, editPack, { providerId: 'local-mock-video', fallbackToMock: true }));
  const videoQaSummary = videoAssemblyJobs[0]?.qaResult || defaultVideoQaSummary();
  const videoProviderAudit = videoAssemblyJobs.map(job => job.providerAudit);
  const videoLayer = { videoAssemblyJobs, videoQaSummary, videoProviderAudit };
  const performanceRecords: ContentPerformanceRecord[] = [];
  const performanceInsights = analyzePerformancePatterns(baseRun, performanceRecords);
  const regenerationPlan = buildRegenerationPlan({ ...baseRun, performanceRecords }, performanceInsights);
  const performanceFeedbackReport = buildPerformanceFeedbackReport({ ...baseRun, performanceRecords, performanceInsights, regenerationPlan });
  const performanceLayer = { performanceRecords, performanceInsights, regenerationPlan, performanceFeedbackReport };
  const experimentPlans = [buildExperimentPlanFromInsights({ ...baseRun, ...batchLayer, ...performanceLayer }, performanceInsights)];
  const experimentVariantMatrices = experimentPlans.map(plan => buildExperimentVariantMatrix({ ...baseRun, ...batchLayer }, plan));
  const experimentReports = experimentPlans.map(plan => analyzeExperimentResults(plan, performanceRecords));
  const experimentMemorySummary = buildExperimentMemorySummary({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports });
  const experimentPriorityQueue = buildExperimentPriorityQueue({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary }, experimentMemorySummary);
  const experimentLearningGapMap = buildExperimentLearningGapMap({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue }, experimentMemorySummary, experimentPriorityQueue);
  const experimentSequencingPlan = buildExperimentSequencingPlan({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap }, experimentLearningGapMap, experimentPriorityQueue, experimentMemorySummary);
  const experimentValidationPolicy = buildExperimentValidationPolicy({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan }, experimentReports[0]?.confidenceSummary, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan);
  const experimentDecisionSummary = buildExperimentDecisionSummary({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy }, experimentValidationPolicy);
  const experimentCadencePlan = buildExperimentCadencePlan({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan);
  const experimentOperatorChecklist = buildExperimentOperatorChecklist({ ...baseRun, ...performanceLayer, experimentPlans, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan }, experimentValidationPolicy, experimentDecisionSummary);
  const experimentLayerBase = { experimentPlans, experimentVariantMatrices, experimentReports, experimentMemorySummary, experimentPriorityQueue, experimentLearningGapMap, experimentSequencingPlan, experimentValidationPolicy, experimentDecisionSummary, experimentCadencePlan, experimentOperatorChecklist };
  const merchantContextCard = buildMerchantContextCard({ ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayerBase });
  const experimentExecutionPlaybook = buildExperimentExecutionPlaybook({ ...baseRun, ...performanceLayer, ...experimentLayerBase, merchantContextCard }, experimentValidationPolicy, experimentDecisionSummary, experimentSequencingPlan, experimentPriorityQueue, experimentLearningGapMap, experimentReports[0]?.confidenceSummary, merchantContextCard);
  const experimentExecutionSummary = buildExperimentExecutionSummary({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, merchantContextCard }, experimentExecutionPlaybook, experimentCadencePlan, experimentOperatorChecklist);
  const experimentArchiveRecord = buildExperimentArchiveRecord({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard });
  const runHistorySummary = buildListingFactoryRunHistorySummary([{ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }], [experimentArchiveRecord]);
  const runHistoryItem = buildListingFactoryRunHistoryItem({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, experimentArchiveRecord);
  const experimentWorkbenchBoard = buildExperimentWorkbenchBoard({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const crossRunComparison = buildCrossRunComparisonResult({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const merchantLearningArchive = buildMerchantLearningArchive({ ...baseRun, ...performanceLayer, ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, merchantContextCard }, runHistorySummary, [experimentArchiveRecord]);
  const traceSource = { ...baseRun, ...batchLayer, ...performanceLayer, ...experimentLayerBase, experimentDecisionSummary, merchantLearningArchive };
  const contentExperimentTraceGraph = buildContentExperimentTraceGraph(traceSource);
  const traceabilitySummary = buildTraceabilitySummary(traceSource, contentExperimentTraceGraph);
  const platformDataLayer = buildPlatformDataLayer({ ...baseRun, ...performanceLayer });
  const experimentLayer = { ...experimentLayerBase, experimentExecutionPlaybook, experimentExecutionSummary, runHistoryItem, runHistorySummary, experimentWorkbenchBoard, experimentArchiveRecord, crossRunComparison, merchantLearningArchive, contentExperimentTraceGraph, traceabilitySummary, ...platformDataLayer };
  const operatingReview = buildFactoryOperatingReview({ ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, qualityGate });
  const runWithoutPackage = { ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate, steps: [] as WorkflowStep[], deliveryPackage: undefined };
  const deliveryPackage = buildDeliveryPackage(runWithoutPackage);
  const hydrated = { ...baseRun, ...batchLayer, ...videoLayer, ...performanceLayer, ...experimentLayer, operatingReview, merchantContextCard, qualityGate, deliveryPackage, steps: [] as WorkflowStep[] };
  return { ...hydrated, steps: buildWorkflowSteps(hydrated) };
}

export function loadListingProjects(storage?: StorageLike): ListingProject[] {
  return readJson<ListingProject[]>(PROJECTS_KEY, [], storage);
}

export function saveGeneratedBriefs(projectId: string, briefs: GeneratedBrief[], storage?: StorageLike) {
  const allBriefs = loadAllGeneratedBriefs(storage).filter(brief => brief.projectId !== projectId);
  writeJson(BRIEFS_KEY, [...briefs, ...allBriefs], storage);
}

export function loadAllGeneratedBriefs(storage?: StorageLike): GeneratedBrief[] {
  return readJson<GeneratedBrief[]>(BRIEFS_KEY, [], storage);
}

export function loadGeneratedBriefs(projectId: string, storage?: StorageLike): GeneratedBrief[] {
  return loadAllGeneratedBriefs(storage).filter(brief => brief.projectId === projectId);
}

export function saveFactoryTasks(projectId: string, tasks: FactoryTask[], storage?: StorageLike) {
  const allTasks = loadAllFactoryTasks(storage).filter(task => task.projectId !== projectId);
  writeJson(TASKS_KEY, [...tasks, ...allTasks], storage);
}

export function loadAllFactoryTasks(storage?: StorageLike): FactoryTask[] {
  return readJson<FactoryTask[]>(TASKS_KEY, [], storage);
}

export function loadFactoryTasks(projectId: string, storage?: StorageLike): FactoryTask[] {
  return loadAllFactoryTasks(storage).filter(task => task.projectId === projectId);
}

export function savePocReport(report: PocReport, storage?: StorageLike) {
  const reports = loadPocReports(storage).filter(item => item.projectId !== report.projectId);
  writeJson(REPORTS_KEY, [report, ...reports], storage);
}

export function loadPocReports(storage?: StorageLike): PocReport[] {
  return readJson<PocReport[]>(REPORTS_KEY, [], storage);
}

export function loadLatestListingFactorySnapshot(storage?: StorageLike): ListingFactoryLocalSnapshot {
  const run = hydrateRunFromStorage(storage);
  const runHistorySummary = loadListingFactoryRunHistorySummary(storage);
  const archiveRecords = loadExperimentArchiveRecords(storage);
  if (run) {
    return {
      project: run.project,
      briefs: run.briefs,
      tasks: run.tasks,
      report: run.report,
      run,
      runHistorySummary,
      archiveRecords,
    };
  }

  const project = loadListingProjects(storage)[0] ?? null;
  if (!project) {
    return { project: null, briefs: [], tasks: [], report: null, run: null, runHistorySummary, archiveRecords };
  }

  return {
    project,
    briefs: loadGeneratedBriefs(project.id, storage),
    tasks: loadFactoryTasks(project.id, storage),
    report: loadPocReports(storage).find(item => item.projectId === project.id) ?? null,
    run: null,
    runHistorySummary,
    archiveRecords,
  };
}

export function clearListingFactoryLocalData(storage?: StorageLike) {
  const target = getStorage(storage);
  for (const key of [PROJECTS_KEY, BRIEFS_KEY, TASKS_KEY, REPORTS_KEY, RUNS_KEY, RUN_HISTORY_KEY, ARCHIVES_KEY]) {
    target.removeItem(key);
  }
  for (const key of [PROJECTS_KEY, BRIEFS_KEY, TASKS_KEY, REPORTS_KEY, RUNS_KEY, RUN_HISTORY_KEY, ARCHIVES_KEY]) {
    memoryStorage.delete(key);
  }
}
