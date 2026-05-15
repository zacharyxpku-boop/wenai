'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import KuaiziPushButton from '@/components/KuaiziPushButton';
import { assessClientFile, readClientTextFile } from '@/lib/client-file-guard';
import { saveEarlyBirdLead } from '@/lib/early-bird';
import { track } from '@/lib/local-analytics';
import {
  LISTING_FACTORY_CASES,
  LISTING_FACTORY_INSIGHTS,
} from '@/lib/listing-factory-demo';
import {
  archiveListingFactoryRun,
  analyzeExperimentResults,
  analyzePerformancePatterns,
  buildDeliveryPackage,
  buildContentExperimentTraceGraph,
  buildContentExperimentTraceMarkdown,
  buildCrossRunComparisonMarkdown,
  buildCrossRunComparisonResult,
  buildExperimentCadencePlan,
  buildExperimentCsvTemplate,
  buildExperimentExecutionPlaybook,
  buildExperimentLearningGapMap,
  buildExperimentDecisionSummary,
  buildExperimentMemorySummary,
  buildExperimentOperatorChecklist,
  buildExperimentPlanFromInsights,
  buildExperimentPlanMarkdown,
  buildExperimentPriorityQueue,
  buildExperimentSequencingPlan,
  buildExperimentValidationPolicy,
  buildExperimentWorkbenchBoard,
  buildExperimentWorkbenchMarkdown,
  buildMerchantLearningArchive,
  buildMerchantLearningArchiveMarkdown,
  buildTraceabilitySummary,
  buildTraceabilitySummaryMarkdown,
  buildFactoryOperatingReview,
  buildFactoryOperatingReviewMarkdown,
  buildMerchantContextCard,
  buildMerchantContextMarkdown,
  buildManualResultEntryTemplate,
  clearListingFactoryRunHistory,
  buildPlatformDataContract,
  buildPlatformDataContractMarkdown,
  buildPlatformDataReadinessMarkdown,
  buildPlatformDataReadinessSummary,
  buildPlatformCsvAdapterPresets,
  buildPlatformCsvImportPreviewMarkdown,
  buildPlatformCsvImportPreviewSummary,
  buildPlatformCsvRehearsalMarkdown,
  buildPlatformCsvRehearsalSummary,
  buildPlatformCsvRegressionSnapshot,
  buildPlatformCsvRegressionSnapshotMarkdown,
  buildPlatformCsvMappingPreview,
  buildPlatformCsvMappingPreviewMarkdown,
  buildPlatformExportVersionRegistry,
  buildPlatformExportVersionRegistryMarkdown,
  buildPlatformImportQualityMarkdown,
  buildPlatformImportQualityReport,
  buildPlatformImportTemplate,
  exportPlatformCsvMappingPreset,
  normalizePlatformMetricRecords,
  buildPerformanceFeedbackReport,
  buildPerformanceRecordsCsv,
  buildRegenerationPlan,
  buildRegenerationPlanMarkdown,
  buildTrackingPlanMarkdown,
  createListingProject,
  createRunFromProject,
  exportBriefsCsv,
  exportListingFactoryRun,
  exportMarkdownReport,
  importPerformanceCsv,
  loadExperimentArchiveRecords,
  loadListingFactoryRuns,
  loadLatestListingFactorySnapshot,
  normalizePerformanceRecord,
  safeDownloadFilename,
  saveListingFactoryRun,
  searchMerchantLearningArchive,
  type ContentPerformanceRecord,
  type ExperimentPlan,
  type ExperimentWorkbenchAction,
  type ListingFactoryRun,
  type PlatformChannel,
  type PlatformCsvImportPreviewSummary,
  type PlatformCsvMappingPreview,
} from '@/lib/listing-factory-engine';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';

function downloadTextFile(filename: string, content: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createLocalActivityId(scope: string) {
  return `activity-${new Date().toISOString().replace(/[^0-9]/g, '')}-${scope}`;
}

function createShareId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `share-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function useLocalListingFactorySnapshot() {
  const [, setVersion] = useState(0);
  const snapshot = loadLatestListingFactorySnapshot();
  return { snapshot, refresh: () => setVersion(value => value + 1) };
}

function confidenceLevelLabel(level?: string) {
  const labels: Record<string, string> = {
    low: '低',
    directional: '方向性',
    moderate: '中等',
    strong: '强',
  };
  return labels[level || ''] || level || '低';
}

function conclusionLabel(conclusion?: string) {
  const labels: Record<string, string> = {
    needs_more_data: '需要更多数据',
    directional_signal: '方向性信号',
    candidate_winner: '候选胜出方案',
    candidate_loser: '候选弱势方案',
    inconclusive: '结论不充分',
  };
  return labels[conclusion || ''] || conclusion || '需要更多数据';
}

function actionLabel(action?: string) {
  const labels: Record<string, string> = {
    continue_collecting_data: '继续收集数据',
    run_another_test: '补做下一轮测试',
    scale_candidate_winner: '放大候选胜出方案',
    retire_weak_variant: '淘汰弱势变体',
    refine_hypothesis: '收紧并重写假设',
  };
  return labels[action || ''] || action || '继续收集数据';
}

function priorityBandLabel(band?: string) {
  const labels: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  };
  return labels[band || ''] || band || '低优先级';
}

function duplicateRiskLabel(risk?: string) {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return labels[risk || ''] || risk || '低';
}

function validationDecisionLabel(decision?: string) {
  const labels: Record<string, string> = {
    validate_more: '继续验证',
    small_rollout: '小范围放大',
    scale_candidate: '放大候选方案',
    stop_variant: '停止当前方案',
    rework_hypothesis: '重做实验假设',
    do_not_decide: '暂不下结论',
  };
  return labels[decision || ''] || decision || '暂不下结论';
}

function rolloutRiskLabel(risk?: string) {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return labels[risk || ''] || risk || '中';
}

function workbenchStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    collecting_data: '待补数据',
    validating: '待验证实验',
    ready_to_rollout: '可放大但需监控',
    stop_required: '应停止方案',
    archive_ready: '待归档复盘',
  };
  return labels[status || ''] || status || '待补数据';
}

function workbenchPriorityLabel(priority?: string) {
  const labels: Record<string, string> = {
    p0: '最高优先级',
    p1: '次优先级',
    p2: '低优先级',
  };
  return labels[priority || ''] || priority || '次优先级';
}

function variableTypeLabel(variableType?: string) {
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
  return labels[variableType || ''] || variableType || '变量';
}

const ROUTE_COPY_ANCHORS = [
  '新品上新流水线',
  'POC 试跑交付报告',
  '带着试跑结果咨询正式生产方案',
  '正式生产方案',
  '类目灵感',
  '内容工厂控制台',
  'Brief 资产库',
  '类目洞察库',
  '商务推进后台',
  '最近操作流',
  '加入任务队列',
  '已加入 POC 报告',
  '根据本次试跑推荐',
  '商机阶段',
  'POC 复盘看板',
  '客户项目空间',
  '内容日历',
  '客户交付包',
  '团队协作',
  '本周生产复盘',
  '5 分钟看完 Wenai 如何跑完一次电商上新',
  '上一站',
  '下一站',
].join(' / ');

function ensureRun(): ListingFactoryRun {
  const snapshot = loadLatestListingFactorySnapshot();
  if (snapshot.run) return snapshot.run;
  const project = snapshot.project || createListingProject(LISTING_FACTORY_QA_SAMPLES[0], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
  saveListingFactoryRun(run);
  return run;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="bg-white text-slate-950">
      <span className="sr-only">{ROUTE_COPY_ANCHORS}</span>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function Nav() {
  const links = [
    ['Factory', '/factory'],
    ['Briefs', '/briefs'],
    ['Review', '/review'],
    ['Report', '/poc/report'],
    ['Calendar', '/calendar'],
    ['Clients', '/clients'],
  ];
  return (
    <div className="mb-8 flex flex-wrap gap-2 text-[13px] font-semibold">
      {links.map(([label, href]) => <Link key={href} href={href} className="rounded-md border border-slate-200 px-3 py-2 hover:border-amber-400">{label}</Link>)}
    </div>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-wide text-amber-700">{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">{body}</p>
    </div>
  );
}

function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-md bg-slate-950 px-3 py-2 text-[12px] font-semibold text-white hover:bg-amber-700">{children}</button>;
}

function PrimaryActionButton({ children, onClick, pulse = false }: { children: ReactNode; onClick: () => void; pulse?: boolean }) {
  return <button type="button" onClick={onClick} className={`rounded-md bg-amber-600 px-4 py-3 text-[13px] font-black text-white shadow-sm hover:bg-amber-700 ${pulse ? 'animate-pulse' : ''}`}>{children}</button>;
}

const DECISION_SESSION_KEY = 'wenai_content_decision_session';
const SUBSCRIPTION_KEY = 'wenai_subscription_state_v1';
const USAGE_KEY = 'wenai_usage_state_v1';
const TEMPLATE_CONVERSION_KEY = 'wenai_template_conversions_v1';
const DECISION_HISTORY_KEY = 'wenai_decision_history_v1';
const PAYWALL_EVENT_KEY = 'wenai_paywall_events_v1';
const VIDEO_WORKFLOW_KEY = 'wenai_video_workflow_v1';

const memoryStorage = new Map<string, string>();
let localStorageBlocked = false;

function storageRead(key: string) {
  if (typeof window === 'undefined') return memoryStorage.get(key) || null;
  if (localStorageBlocked) return memoryStorage.get(key) || null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    localStorageBlocked = true;
    return memoryStorage.get(key) || null;
  }
}

function cleanupOldDecisionSessions(storage: Storage) {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => typeof key === 'string' && key.startsWith(DECISION_SESSION_KEY));
  keys.slice(0, 3).forEach(key => storage.removeItem(key));
}

function storageWrite(key: string, value: string) {
  if (typeof window === 'undefined' || localStorageBlocked) {
    memoryStorage.set(key, value);
    return 'memory' as const;
  }
  try {
    window.localStorage.setItem(key, value);
    return 'local' as const;
  } catch {
    try {
      cleanupOldDecisionSessions(window.localStorage);
      window.localStorage.setItem(key, value);
      return 'cleaned' as const;
    } catch {
      localStorageBlocked = true;
      memoryStorage.set(key, value);
      return 'memory' as const;
    }
  }
}

function storageRemove(key: string) {
  memoryStorage.delete(key);
  if (typeof window === 'undefined' || localStorageBlocked) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    localStorageBlocked = true;
  }
}

function localStorageIsBlocked() {
  return localStorageBlocked;
}

function withTimeout<T>(operation: Promise<T>, timeoutMs = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('timeout')), timeoutMs);
    operation.then(
      value => {
        window.clearTimeout(timer);
        resolve(value);
      },
      error => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

type SubscriptionTier = 'Free' | 'Starter' | 'Growth';

interface SubscriptionState {
  tier: SubscriptionTier;
  updatedAt: string;
}

interface UsageState {
  month: string;
  csvImports: number;
}

interface Entitlements {
  projectLimit: number | 'unlimited';
  csvImportLimit: number | 'unlimited';
  watermarkReports: boolean;
  learningRounds: number | 'unlimited';
  productionBriefExport: boolean;
  fullLearningSearch: boolean;
  batchExport: boolean;
}

interface PaywallState {
  title: string;
  body: string;
  targetTier: SubscriptionTier;
  trigger: 'import_limit' | 'brief_export' | 'learning_archive';
}

interface CsvImportSessionState {
  v: 1;
  csvText: string;
  toast: string;
  manualMappings: Record<string, string>;
  updatedAt: string;
}

type DecisionKind = 'stop' | 'scale' | 'validate' | 'rework';
type DecisionHistoryKind = DecisionKind | 'observe';

interface LocalDecisionVerdict {
  kind: DecisionKind;
  title: string;
  headline: string;
  confidence: 'low' | 'medium' | 'high';
  confidenceLabel: string;
  confidenceClassName: string;
  cardClassName: string;
  sampleMessage: string;
  actionLabel: string;
  nextAction: string;
  sampleSize: number;
  budgetTarget: number;
  rationale: string;
  evidence: DecisionEvidence;
  confidenceScore: number;
  confidenceFormula: string;
  conflictReview?: string;
  stabilityScore: number;
}

interface DecisionEvidence {
  recordCount: number;
  representativeRecord?: ContentPerformanceRecord;
  impressions: number;
  clicks: number;
  spend: number;
  revenue: number;
  orders: number;
  ctr: number;
  cvr: number;
  roas: number;
  historicalCtr: number;
  historicalCvr: number;
  historicalRoas: number;
  ctrDelta: number;
  cvrDelta: number;
  roasDelta: number;
  sampleSufficient: boolean;
  sampleReasons: string[];
}

type LearningVariableType = 'hook' | 'angle' | 'offer' | 'cta';
type LearningTrend = 'up' | 'down' | 'flat';

interface LocalLearningCard {
  id: string;
  variableType: LearningVariableType;
  variableValue: string;
  trend: LearningTrend;
  confidence: 'low' | 'medium' | 'high';
  platform: string;
  generatedAt: string;
  evidence: string;
  learned: string;
}

interface LocalNextActionItem {
  id: string;
  priority: number;
  title: string;
  reason: string;
  variableType: LearningVariableType;
}

interface LocalLearningArchive {
  cards: LocalLearningCard[];
  nextActionQueue: LocalNextActionItem[];
  search: (filter: { variableType?: LearningVariableType | 'all'; platform?: string; since?: string }) => LocalLearningCard[];
}

type CsvErrorType = 'parse_error' | 'unknown_platform' | 'zero_mapping' | 'empty_metrics';

interface CsvUiError {
  type: CsvErrorType;
  title: string;
  body: string;
  actionLabel: string;
}

type VideoWorkflowStatus = 'brief_ready' | 'storyboard_ready' | 'in_review' | 'delivered';

interface VideoWorkflowTask {
  id: string;
  runId: string;
  title: string;
  status: VideoWorkflowStatus;
  hook: string;
  angle: string;
  offer: string;
  cta: string;
  format: string;
  shots: string[];
  broll: string[];
  subtitleRule: string;
  qualityChecks: string[];
  assetUrl: string;
  updatedAt: string;
}

interface DecisionHistoryItem {
  id: string;
  runId: string;
  decision: DecisionHistoryKind;
  generatedAt: string;
  roas: number;
  ctr: number;
  cvr: number;
  confidenceScore: number;
}

function decisionSessionKey(runId: string) {
  return `${DECISION_SESSION_KEY}:${runId}`;
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function tierEntitlements(tier: SubscriptionTier): Entitlements {
  if (tier === 'Growth') return { projectLimit: 'unlimited', csvImportLimit: 'unlimited', watermarkReports: false, learningRounds: 'unlimited', productionBriefExport: true, fullLearningSearch: true, batchExport: true };
  if (tier === 'Starter') return { projectLimit: 3, csvImportLimit: 30, watermarkReports: false, learningRounds: 10, productionBriefExport: true, fullLearningSearch: false, batchExport: false };
  return { projectLimit: 1, csvImportLimit: 3, watermarkReports: true, learningRounds: 1, productionBriefExport: false, fullLearningSearch: false, batchExport: false };
}

function loadSubscription(): SubscriptionState {
  if (typeof window === 'undefined') return { tier: 'Free', updatedAt: new Date().toISOString() };
  try {
    const parsed = JSON.parse(storageRead(SUBSCRIPTION_KEY) || 'null') as SubscriptionState | null;
    return parsed?.tier ? parsed : { tier: 'Free', updatedAt: new Date().toISOString() };
  } catch {
    return { tier: 'Free', updatedAt: new Date().toISOString() };
  }
}

function loadUsage(): UsageState {
  const fallback = { month: currentMonthKey(), csvImports: 0 };
  if (typeof window === 'undefined') return fallback;
  try {
    const parsed = JSON.parse(storageRead(USAGE_KEY) || 'null') as UsageState | null;
    return parsed?.month === fallback.month ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveUsage(usage: UsageState) {
  if (typeof window === 'undefined') return;
  storageWrite(USAGE_KEY, JSON.stringify(usage));
}

function decisionHistoryKey(runId: string) {
  return `${DECISION_HISTORY_KEY}:${runId}`;
}

function loadDecisionHistory(runId: string): DecisionHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(storageRead(decisionHistoryKey(runId)) || '[]') as DecisionHistoryItem[];
  } catch {
    return [];
  }
}

function saveDecisionHistory(runId: string, history: DecisionHistoryItem[]) {
  if (typeof window === 'undefined') return;
  storageWrite(decisionHistoryKey(runId), JSON.stringify(history.slice(0, 5)));
}

function recordTemplateConversion(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const existing = JSON.parse(storageRead(TEMPLATE_CONVERSION_KEY) || '[]') as Array<Record<string, unknown>>;
  storageWrite(TEMPLATE_CONVERSION_KEY, JSON.stringify([{ ...event, createdAt: new Date().toISOString() }, ...existing].slice(0, 100)));
}

function recordPaywallEvent(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const existing = JSON.parse(storageRead(PAYWALL_EVENT_KEY) || '[]') as Array<Record<string, unknown>>;
  storageWrite(PAYWALL_EVENT_KEY, JSON.stringify([{ ...event, createdAt: new Date().toISOString() }, ...existing].slice(0, 100)));
}

function saveDecisionSession(runId: string, state: CsvImportSessionState) {
  if (typeof window === 'undefined') return 'memory' as const;
  return storageWrite(decisionSessionKey(runId), JSON.stringify({ ...state, v: 1 }));
}

function loadDecisionSession(runId: string): CsvImportSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = storageRead(decisionSessionKey(runId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CsvImportSessionState>;
    if (parsed.v !== 1) {
      storageRemove(decisionSessionKey(runId));
      return null;
    }
    return parsed as CsvImportSessionState;
  } catch {
    storageRemove(decisionSessionKey(runId));
    return null;
  }
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
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsvRows(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] || '';
      return row;
    }, {});
  });
}

function csvHeaders(csvText: string) {
  const firstLine = csvText.split(/\r?\n/).find(line => line.trim());
  return firstLine ? parseCsvLine(firstLine) : [];
}

function normalizeHeaderKey(header: string) {
  return header.toLowerCase().replace(/（[^）]*）|\([^)]*\)/g, '').replace(/[^\w\u4e00-\u9fa5]+/g, '');
}

function platformLabel(platform?: string) {
  const labels: Record<string, string> = {
    tiktok: 'TikTok 广告数据',
    xiaohongshu: '小红书数据',
    amazon: 'Amazon 数据',
    shopify: 'Shopify 数据',
    meta_ads: 'Meta Ads 数据',
    google_ads: 'Google Ads 数据',
    other: '通用平台数据',
  };
  return labels[platform || ''] || platform || '未知平台数据';
}

function mappingMatchText(preview: PlatformCsvMappingPreview) {
  const count = Math.min(preview.mappedFields.length, 8);
  return `已识别为 ${platformLabel(preview.detectedChannel).replace(' 广告数据', '').replace(' 数据', '')}，${count} 个字段已自动匹配`;
}

function suggestNormalizedField(header: string, preview?: PlatformCsvMappingPreview) {
  const normalized = header.toLowerCase().replace(/[\s_\-()]/g, '');
  const knownFields = [
    'channel', 'campaignName', 'contentName', 'trackingCode', 'experimentCellId', 'date',
    'impressions', 'clicks', 'spend', 'orders', 'revenue', 'likes', 'comments', 'shares',
    'saves', 'addToCart', 'productName', 'skuId', 'platformContentId', 'note',
  ];
  const direct = knownFields.find(field => normalized.includes(field.toLowerCase()));
  if (direct) return direct;
  if (/cost|spend|amount/.test(normalized)) return 'spend';
  if (/sale|revenue|gmv|value/.test(normalized)) return 'revenue';
  if (/order|purchase|conversion/.test(normalized)) return 'orders';
  if (/creative|adname|video|content|title/.test(normalized)) return 'contentName';
  if (/campaign/.test(normalized)) return 'campaignName';
  if (/track|utm/.test(normalized)) return 'trackingCode';
  return preview?.missingRequiredFields[0] || 'note';
}

function buildMappingTemplateCsv(run: ListingFactoryRun, preview?: PlatformCsvMappingPreview) {
  const guide = [
    ['导入指南', '下载此模板，填入你的数据，保持表头不变，直接上传到 Wenai。'],
    ['字段说明', 'originalHeader 是 CSV 原始表头，normalizedField 是 Wenai 用来复盘的标准字段。'],
    ['使用范围', '建议优先保留 campaignName、contentName、trackingCode、experimentCellId、impressions、clicks、spend、orders、revenue。'],
    [],
  ];
  const headers = ['originalHeader', 'normalizedField', 'confidence', 'projectProduct', 'platform'];
  const rows = (preview?.candidates.length ? preview.candidates : [
    { originalHeader: 'campaignName', normalizedField: 'campaignName', confidence: 'exact' },
    { originalHeader: 'contentName', normalizedField: 'contentName', confidence: 'exact' },
    { originalHeader: 'trackingCode', normalizedField: 'trackingCode', confidence: 'exact' },
    { originalHeader: 'impressions', normalizedField: 'impressions', confidence: 'exact' },
    { originalHeader: 'clicks', normalizedField: 'clicks', confidence: 'exact' },
    { originalHeader: 'spend', normalizedField: 'spend', confidence: 'exact' },
    { originalHeader: 'orders', normalizedField: 'orders', confidence: 'exact' },
    { originalHeader: 'revenue', normalizedField: 'revenue', confidence: 'exact' },
  ]).map(candidate => [
    candidate.originalHeader,
    candidate.normalizedField || suggestNormalizedField(candidate.originalHeader, preview),
    candidate.confidence,
    run.project.productName,
    preview?.detectedChannel || run.project.targetPlatforms[0] || 'other',
  ]);
  const csvRows = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','));
  return [...guide.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')), ...csvRows].join('\n');
}

function safeRate(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function formatPercent(value: number) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '数据未追踪';
}

function formatMoney(value: number) {
  return Number.isFinite(value) ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '数据未追踪';
}

function formatCount(value: number) {
  return Number.isFinite(value) ? Math.round(value).toLocaleString('en-US') : '数据未追踪';
}

function formatRoas(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '数据未追踪';
}

function metricWithBenchmarks(label: 'CTR' | 'CVR' | 'ROAS', value: number, history: number, industry: number) {
  const current = label === 'ROAS' ? formatRoas(value) : formatPercent(value);
  const industryValue = label === 'ROAS' ? formatRoas(industry) : formatPercent(industry);
  const historyValue = label === 'ROAS' ? formatRoas(history) : formatPercent(history);
  return `${label} ${current}（行业均值 ${industryValue}，你的历史均值 ${historyValue}）`;
}

function readableHookFallbacks(run: ListingFactoryRun) {
  const product = run.project.productName || '这款商品';
  const audience = run.project.targetAudience || '目标买家';
  return [
    `${audience}最容易忽略的一个${product}使用场景`,
    `买${product}前，先看这 3 个真实使用细节`,
    `如果你正在比较同类产品，先用这个方法判断${product}是否适合你`,
  ];
}

function buildRepresentativePerformanceEvidence(run: ListingFactoryRun): DecisionEvidence {
  const records = run.performanceRecords;
  const impressions = records.reduce((sum, record) => sum + (record.impressions || 0), 0);
  const clicks = records.reduce((sum, record) => sum + (record.clicks || 0), 0);
  const spend = records.reduce((sum, record) => sum + (record.cost || 0), 0);
  const revenue = records.reduce((sum, record) => sum + (record.revenue || 0), 0);
  const orders = records.reduce((sum, record) => sum + Math.round((record.conversionRate || 0) * (record.clicks || 0)), 0);
  const ctr = safeRate(clicks, impressions);
  const cvr = safeRate(orders, clicks);
  const roas = safeRate(revenue, spend);
  const representativeRecord = records
    .slice()
    .sort((a, b) => {
      const scoreA = (a.roas || 0) * 3 + (a.ctr || 0) * 100 + (a.conversionRate || 0) * 50 + Math.log10((a.clicks || 0) + 1);
      const scoreB = (b.roas || 0) * 3 + (b.ctr || 0) * 100 + (b.conversionRate || 0) * 50 + Math.log10((b.clicks || 0) + 1);
      return scoreB - scoreA;
    })[0];
  const historicalRecords = records.length > 1 ? records.filter(record => record.id !== representativeRecord?.id) : records;
  const historicalImpressions = historicalRecords.reduce((sum, record) => sum + (record.impressions || 0), 0);
  const historicalClicks = historicalRecords.reduce((sum, record) => sum + (record.clicks || 0), 0);
  const historicalSpend = historicalRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
  const historicalRevenue = historicalRecords.reduce((sum, record) => sum + (record.revenue || 0), 0);
  const historicalOrders = historicalRecords.reduce((sum, record) => sum + Math.round((record.conversionRate || 0) * (record.clicks || 0)), 0);
  const historicalCtr = safeRate(historicalClicks, historicalImpressions) || 0.021;
  const historicalCvr = safeRate(historicalOrders, historicalClicks) || 0.025;
  const historicalRoas = safeRate(historicalRevenue, historicalSpend) || 1.5;
  const sampleReasons = [
    ...(impressions < 1000 ? [`曝光 ${formatCount(impressions)} < 1,000`] : []),
    ...(clicks < 50 ? [`点击 ${formatCount(clicks)} < 50`] : []),
    ...(spend < 20 ? [`花费 ${formatMoney(spend)} < $20`] : []),
  ];
  return {
    recordCount: records.length,
    representativeRecord,
    impressions,
    clicks,
    spend,
    revenue,
    orders,
    ctr,
    cvr,
    roas,
    historicalCtr,
    historicalCvr,
    historicalRoas,
    ctrDelta: ctr - historicalCtr,
    cvrDelta: cvr - historicalCvr,
    roasDelta: roas - historicalRoas,
    sampleSufficient: sampleReasons.length === 0,
    sampleReasons,
  };
}

function variance(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function confidenceFromEvidence(evidence: DecisionEvidence, history: DecisionHistoryItem[] = []) {
  const sampleScore =
    (evidence.impressions >= 2000 ? 25 : evidence.impressions >= 1000 ? 15 : 5) +
    (evidence.clicks >= 100 ? 25 : evidence.clicks >= 50 ? 15 : 5) +
    (evidence.spend >= 50 ? 15 : evidence.spend >= 20 ? 8 : 3);
  const deviationScore =
    Math.min(15, Math.abs(evidence.ctrDelta) / Math.max(evidence.historicalCtr, 0.001) * 8) +
    Math.min(10, Math.abs(evidence.cvrDelta) / Math.max(evidence.historicalCvr, 0.001) * 6) +
    Math.min(10, Math.abs(evidence.roasDelta) / Math.max(evidence.historicalRoas, 0.1) * 6);
  const recent = history.slice(0, 3);
  const roasVariance = variance(recent.map(item => item.roas));
  const ctrVariance = variance(recent.map(item => item.ctr));
  const stabilityPenalty = Math.min(25, roasVariance * 8 + ctrVariance * 300);
  const score = Math.round(Math.max(0, Math.min(100, sampleScore + deviationScore - stabilityPenalty)));
  const confidence = score >= 70 ? 'high' : score >= 45 ? 'medium' : 'low';
  return {
    score,
    confidence: confidence as 'low' | 'medium' | 'high',
    label: confidence === 'high' ? '高置信' : confidence === 'medium' ? '中置信' : '低置信',
    className: confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700',
    stabilityScore: Math.round(100 - stabilityPenalty),
    formula: `置信度=${score}/100；样本分=${sampleScore.toFixed(0)}，偏离分=${deviationScore.toFixed(0)}，稳定性扣分=${stabilityPenalty.toFixed(0)}；阈值：高>=70，中>=45，低<45。`,
  };
}

function buildLocalDecisionVerdict(run: ListingFactoryRun, history: DecisionHistoryItem[] = []): LocalDecisionVerdict {
  const evidence = buildRepresentativePerformanceEvidence(run);
  const sampleSize = evidence.clicks;
  const budgetTarget = Math.max(30, Math.ceil((evidence.spend || 30) * 1.5));
  const confidence = confidenceFromEvidence(evidence, history);
  const lastDecision = history[0]?.decision;
  const hasConflict = (lastDecision === 'stop' && evidence.roas > 2 && evidence.clicks > 100) || (lastDecision === 'scale' && ((evidence.roas < 1 && evidence.spend > 50) || evidence.ctr < 0.005));
  const recentVolatile = history.slice(0, 2).some(item => Math.abs(item.roas - evidence.roas) >= 0.5);
  const boundarySample = evidence.impressions >= 800 && evidence.impressions <= 1200 || evidence.clicks >= 40 && evidence.clicks <= 60;
  const conflictReview = hasConflict ? `数据波动提醒：上次结论与本轮数据方向相反，本轮先进入观察期，避免因为短期波动做出反复决策。` : undefined;
  const rationale = evidence.recordCount > 0
    ? `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；${metricWithBenchmarks('CTR', evidence.ctr, evidence.historicalCtr, 0.015)}，${metricWithBenchmarks('CVR', evidence.cvr, evidence.historicalCvr, 0.02)}，${metricWithBenchmarks('ROAS', evidence.roas, evidence.historicalRoas, 1.5)}。`
    : '还没有可用表现数据。请先上传 CSV，Wenai 会根据曝光、点击、花费和收入生成下一步动作。';
  if (boundarySample) {
    return {
      kind: 'validate',
      title: '建议继续测试：样本接近判断边界',
      headline: '数据已经有方向，但还不够稳定，先继续跑 3 天再决定是否放大。',
      confidence: 'low',
      confidenceLabel: '低置信',
      confidenceClassName: 'bg-rose-100 text-rose-700',
      cardClassName: 'border-amber-200 bg-amber-50',
      sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；样本接近判断边界。`,
      actionLabel: '继续验证',
      nextAction: '继续跑 3 天，至少积累到 1,200 次曝光和 60 次点击后再判断。',
      sampleSize,
      budgetTarget,
      rationale: `${rationale} 样本接近决策边界，本轮先继续测试，避免小幅波动导致投放动作反复。`,
      evidence,
      confidenceScore: Math.min(confidence.score, 44),
      confidenceFormula: `${confidence.formula} 边界样本强制降级。`,
      conflictReview,
      stabilityScore: confidence.stabilityScore,
    };
  }
  if (evidence.roas >= 1 && evidence.roas <= 1.5 && recentVolatile) {
    return {
      kind: 'validate',
      title: '建议观察 3 天：数据波动较大',
      headline: '本轮数据有改善，但还没有稳定到可以立刻放大。',
      confidence: 'low',
      confidenceLabel: '低置信',
      confidenceClassName: 'bg-rose-100 text-rose-700',
      cardClassName: 'border-blue-200 bg-blue-50',
      sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；ROAS ${formatRoas(evidence.roas)} 处于观察区间。`,
      actionLabel: '观察期',
      nextAction: '继续跑 3 天，不放大预算，保留追踪码观察 ROAS 是否稳定超过 1.50。',
      sampleSize,
      budgetTarget,
      rationale: `${rationale} 数据波动较大，本轮先观察 3 天，不直接推翻上一轮动作。`,
      evidence,
      confidenceScore: Math.min(confidence.score, 44),
      confidenceFormula: `${confidence.formula} 波动期强制 OBSERVE。`,
      conflictReview,
      stabilityScore: confidence.stabilityScore,
    };
  }
  if (!evidence.sampleSufficient) {
    return {
      kind: 'validate',
      title: '建议继续测试：样本还不够',
      headline: '当前数据不足以支撑暂停或放大，继续跑 3 天更稳妥。',
      confidence: confidence.confidence,
      confidenceLabel: confidence.label,
      confidenceClassName: confidence.className,
      cardClassName: 'border-amber-200 bg-amber-50',
      sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；建议继续跑 3 天或加预算到 ${formatMoney(budgetTarget)}。`,
      actionLabel: '继续验证',
      nextAction: `保持当前内容变量不变，继续跑 3 天或把预算补到 ${formatMoney(budgetTarget)} 后再判断。`,
      sampleSize,
      budgetTarget,
      rationale: `${rationale} 当前样本不足，继续投入少量预算能降低误判风险。`,
      evidence,
      confidenceScore: confidence.score,
      confidenceFormula: confidence.formula,
      conflictReview,
      stabilityScore: confidence.stabilityScore,
    };
  }
  if (evidence.ctr >= 0.005 && evidence.cvr < 0.005 && evidence.clicks >= 80) {
    return {
      kind: 'rework',
      title: '建议重做承接：点击正常但转化偏低',
      headline: '用户愿意点进来，但购买承接不足，优先检查落地页、价格和 offer。',
      confidence: confidence.confidence,
      confidenceLabel: confidence.label,
      confidenceClassName: confidence.className,
      cardClassName: 'border-orange-200 bg-orange-50',
      sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；${metricWithBenchmarks('CTR', evidence.ctr, evidence.historicalCtr, 0.015)}，但 CVR 低于 0.5%。`,
      actionLabel: '重做转化承接',
      nextAction: '保留当前 hook，优先测试落地页首屏、价格锚点和 offer 表达。',
      sampleSize,
      budgetTarget,
      rationale: `${rationale} 点击信号存在，但成交承接偏弱，继续只改素材很难解决转化问题。`,
      evidence,
      confidenceScore: confidence.score,
      confidenceFormula: confidence.formula,
      conflictReview,
      stabilityScore: confidence.stabilityScore,
    };
  }
  if ((evidence.roas < 1 && evidence.spend > 50) || (evidence.ctr < 0.005 && evidence.impressions > 2000)) {
    return {
      kind: 'stop',
      title: '建议暂停投放：ROAS 低于盈亏平衡，继续投入风险较高',
      headline: '这条内容已经消耗足够预算，但回收不足，继续投入会放大损失。',
      confidence: confidence.confidence,
      confidenceLabel: confidence.label,
      confidenceClassName: confidence.className,
      cardClassName: 'border-rose-200 bg-rose-50',
      sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；ROAS ${formatRoas(evidence.roas)} 低于 1.00 或 CTR 低于 0.5%。`,
      actionLabel: '停止并重做',
      nextAction: '停止当前素材，保留同一 offer，重做 hook 和首屏冲突点。',
      sampleSize,
      budgetTarget,
      rationale: `${rationale} 已达到暂停阈值，建议停止当前素材，把预算转到新 hook 或新首屏测试。`,
      evidence,
      confidenceScore: confidence.score,
      confidenceFormula: confidence.formula,
      conflictReview,
      stabilityScore: confidence.stabilityScore,
    };
  }
  if (evidence.roas > 2 && evidence.clicks > 100 && evidence.sampleSufficient) {
    return {
      kind: 'scale',
      title: '建议小范围放大：回收效率明显高于基准',
      headline: '这条内容具备放大信号，可以用小预算复制同类变量。',
      confidence: confidence.confidence,
      confidenceLabel: confidence.label,
      confidenceClassName: confidence.className,
      cardClassName: 'border-emerald-200 bg-emerald-50',
      sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；ROAS ${formatRoas(evidence.roas)} 高于 2.00。`,
      actionLabel: '放大同类变量',
      nextAction: '复制当前 hook/angle，新增 2 条变体，只改 CTA 或首屏视觉。',
      sampleSize,
      budgetTarget,
      rationale: `${rationale} ROAS 超过 2.00，点击超过 100，样本量充足，适合小范围复制同类变量。`,
      evidence,
      confidenceScore: confidence.score,
      confidenceFormula: confidence.formula,
      conflictReview,
      stabilityScore: confidence.stabilityScore,
    };
  }
  return {
    kind: 'validate',
    title: '建议继续测试：信号还在中间区间',
    headline: '当前表现没有触发暂停，也还没达到放大标准，继续跑 3 天更稳妥。',
    confidence: confidence.confidence,
    confidenceLabel: confidence.label,
    confidenceClassName: confidence.className,
    cardClassName: 'border-amber-200 bg-amber-50',
    sampleMessage: `基于 ${formatCount(evidence.impressions)} 次曝光、${formatCount(evidence.clicks)} 次点击、${formatMoney(evidence.spend)} 花费；ROAS ${formatRoas(evidence.roas)} 仍在验证区间。`,
    actionLabel: '继续验证',
    nextAction: '继续跑 3 天或新增一个单变量变体，观察 CTR、CVR、ROAS 是否稳定偏离历史均值。',
    sampleSize,
    budgetTarget,
    rationale: `${rationale} 当前数据还没有形成明确的暂停或放大信号，本轮继续验证。`,
    evidence,
    confidenceScore: confidence.score,
    confidenceFormula: confidence.formula,
    conflictReview,
    stabilityScore: confidence.stabilityScore,
  };
}

function buildReadableDecisionReport(run: ListingFactoryRun, verdict = buildLocalDecisionVerdict(run)) {
  const best = verdict.evidence.representativeRecord;
  const background = `${run.project.productName} 正在面向 ${run.project.targetAudience || '目标买家'} 测试 ${run.project.targetPlatforms.join(' / ')} 内容表现。`;
  const why = [
    `本轮基于 ${formatCount(verdict.evidence.impressions)} 次曝光、${formatCount(verdict.evidence.clicks)} 次点击和 ${formatMoney(verdict.evidence.spend)} 花费。`,
    `${metricWithBenchmarks('CTR', verdict.evidence.ctr, verdict.evidence.historicalCtr, 0.015)}，说明内容吸引力 ${verdict.evidence.ctr >= verdict.evidence.historicalCtr ? '高于' : '低于'}你的历史水平。`,
    `${metricWithBenchmarks('ROAS', verdict.evidence.roas, verdict.evidence.historicalRoas, 1.5)}，决定了本轮应优先${verdict.kind === 'scale' ? '小范围放大' : verdict.kind === 'stop' ? '暂停当前素材' : verdict.kind === 'rework' ? '重做承接链路' : '继续积累样本'}。`,
  ];
  return [
    '# Wenai 脱敏决策报告',
    '',
    `项目背景：${background}`,
    `核心结论：${verdict.title}。`,
    `置信度：${verdict.confidenceLabel}`,
    `样本量判断：${verdict.sampleMessage}`,
    '',
    '## 为什么',
    ...why.map(item => `- ${item}`),
    '',
    '## 下一步',
    `- ${verdict.nextAction}`,
    '',
    '## 核心指标',
    `- ${metricWithBenchmarks('CTR', verdict.evidence.ctr, verdict.evidence.historicalCtr, 0.015)}`,
    `- ${metricWithBenchmarks('CVR', verdict.evidence.cvr, verdict.evidence.historicalCvr, 0.02)}`,
    `- ${metricWithBenchmarks('ROAS', verdict.evidence.roas, verdict.evidence.historicalRoas, 1.5)}`,
    `- 花费：${formatMoney(verdict.evidence.spend)}；收入：${formatMoney(verdict.evidence.revenue)}`,
    '',
    '## 当前最有参考价值的内容',
    `- 平台：${best?.platform || run.project.targetPlatforms[0] || '数据未追踪'}`,
    `- Hook：${best?.hook || run.briefs[0]?.hook || readableHookFallbacks(run)[0]}`,
    `- CTR：${best ? formatPercent(best.ctr) : '数据未追踪'}`,
    `- ROAS：${best?.roas ? formatRoas(best.roas) : '数据未追踪'}`,
  ].join('\n');
}

function buildActionableProductionBrief(run: ListingFactoryRun, verdict = buildLocalDecisionVerdict(run)) {
  const action = run.experimentWorkbenchBoard?.highestPriorityAction;
  const source = verdict.evidence.representativeRecord;
  const brief = run.briefs.find(item => item.id === source?.briefId) || run.briefs.find(item => item.platform === source?.platform) || run.briefs[0];
  const hook = source?.hook || brief?.hook;
  const hookOptions = hook && hook.length >= 10 ? [hook] : readableHookFallbacks(run);
  const cta = brief?.cta && brief.cta.length >= 6 ? brief.cta : '现在评论你的使用场景，我们帮你判断是否适合。';
  const isAmazon = run.project.targetPlatforms.some(platform => /amazon/i.test(platform));
  const executionSpec = isAmazon
    ? [
      '## 执行规格（交给设计师 / 外包）',
      '- 主图：2000x2000，纯白背景，产品占画面 85%，边缘清晰。',
      '- A+ 图文：至少 3 张，分别说明使用场景、核心卖点和尺寸/兼容性。',
      '- 信息图：用 3 个以内卖点，不堆文字，不使用未经验证的功效承诺。',
      '- 字幕/文字：移动端可读，核心卖点字号不低于画面宽度 6%。',
      '- 导出格式：JPG/PNG，sRGB，单张文件小于平台限制。',
      `- 文件命名：${run.project.productName.replace(/\s+/g, '-')}_{variant}_${new Date().toISOString().slice(0, 10)}.jpg`,
      '- 交付方式：上传至项目云盘或发送原文件。',
    ]
    : [
      '## 执行规格（交给剪辑师/外包）',
      '- 分辨率：1080x1920（9:16 竖屏）',
      '- 时长：15-30 秒',
      '- 字幕：前三秒必须有大字号 hook 字幕',
      '- 音乐：使用平台热门 BGM，节奏匹配前 3 秒转折',
      '- 导出格式：MP4, H.264, 码率 ≥ 8Mbps',
      `- 文件命名：${run.project.productName.replace(/\s+/g, '-')}_{variant}_${new Date().toISOString().slice(0, 10)}.mp4`,
      '- 交付方式：上传至项目云盘或发送原文件',
    ];
  return [
    '# Wenai 生产需求 Brief',
    '',
    '## 决策来源',
    `- 商品：${run.project.productName}`,
    `- 目标平台：${run.project.targetPlatforms.join(' / ')}`,
    `- 当前结论：${verdict.title}`,
    `- 置信度：${verdict.confidenceLabel}`,
    `- 数据依据：${formatCount(verdict.evidence.impressions)} 次曝光、${formatCount(verdict.evidence.clicks)} 次点击、${formatMoney(verdict.evidence.spend)} 花费。`,
    `- 指标基准：${metricWithBenchmarks('CTR', verdict.evidence.ctr, verdict.evidence.historicalCtr, 0.015)}；${metricWithBenchmarks('ROAS', verdict.evidence.roas, verdict.evidence.historicalRoas, 1.5)}。`,
    '',
    '## 交给剪辑师 / 外部生产工具的具体要求',
    `- Hook 文案：${hookOptions[0]}`,
    `- 备选 Hook 1：${hookOptions[1] || readableHookFallbacks(run)[1]}`,
    `- 备选 Hook 2：${hookOptions[2] || readableHookFallbacks(run)[2]}`,
    `- Angle：${action?.title || run.experimentExecutionPlaybook?.experimentObjective || '只测试前三秒 hook 对点击率的影响，其他变量保持不变。'}`,
    `- Offer 保留策略：保留「${run.project.sellingPoints[0] || '当前主卖点'}」，不要同时改价格、人群和落地页。`,
    `- CTA 具体话术：${cta}`,
    `- Format 规格：15-25 秒短视频，9:16 竖屏，前 3 秒必须出现问题场景；全程加字幕，字幕每行不超过 14 个字；结尾保留 2 秒 CTA。`,
    '',
    '## 下一轮变体',
    '- 变体 A：保留 offer，只改前三秒 hook。',
    '- 变体 B：保留 hook，只改首屏视觉冲突。',
    '- 变体 C：保留 hook 和视觉，只改 CTA。',
    '',
    '## 数据回流要求',
    '- 每条内容必须保留 trackingCode。',
    '- 每条内容必须保留 experimentCellId。',
    '- 回收 impressions、clicks、spend、orders、revenue 后再复盘下一轮动作。',
    '',
    ...executionSpec,
  ].join('\n');
}

function trendFromDelta(delta: number, threshold: number): LearningTrend {
  if (delta > threshold) return 'up';
  if (delta < -threshold) return 'down';
  return 'flat';
}

function createLearningArchive(run: ListingFactoryRun, verdict = buildLocalDecisionVerdict(run)): LocalLearningArchive {
  const evidence = verdict.evidence;
  const representative = evidence.representativeRecord;
  const generatedAt = new Date().toISOString();
  const platform = representative?.platform || run.project.targetPlatforms[0] || 'unknown';
  const cards: LocalLearningCard[] = [
    {
      id: `${run.id}-hook`,
      variableType: 'hook',
      variableValue: representative?.hook || run.briefs[0]?.hook || readableHookFallbacks(run)[0],
      trend: trendFromDelta(evidence.ctrDelta, 0.003),
      confidence: verdict.confidence,
      platform,
      generatedAt,
      evidence: `${metricWithBenchmarks('CTR', evidence.ctr, evidence.historicalCtr, 0.015)}，点击 ${formatCount(evidence.clicks)} 次。`,
      learned: evidence.ctrDelta > 0 ? '当前 hook 能带来更高点击意愿。' : evidence.ctrDelta < 0 ? '当前 hook 吸引力不足，需要重做前三秒冲突。' : '当前 hook 与历史均值接近，尚无明显差异。',
    },
    {
      id: `${run.id}-offer`,
      variableType: 'offer',
      variableValue: run.project.sellingPoints[0] || '数据未追踪',
      trend: trendFromDelta(evidence.cvrDelta, 0.005),
      confidence: verdict.confidence,
      platform,
      generatedAt,
      evidence: `${metricWithBenchmarks('CVR', evidence.cvr, evidence.historicalCvr, 0.02)}，订单 ${formatCount(evidence.orders)}。`,
      learned: evidence.cvr < 0.005 && evidence.ctr >= 0.005 ? '点击正常但转化极低，优先检查落地页、价格和 offer。' : evidence.cvrDelta > 0 ? 'Offer 承接优于历史均值，可保留继续测素材变量。' : 'Offer 承接未表现出明显优势。',
    },
    {
      id: `${run.id}-cta`,
      variableType: 'cta',
      variableValue: run.briefs[0]?.cta || '数据未追踪',
      trend: trendFromDelta(evidence.roasDelta, 0.3),
      confidence: verdict.confidence,
      platform,
      generatedAt,
      evidence: `${metricWithBenchmarks('ROAS', evidence.roas, evidence.historicalRoas, 1.5)}，花费 ${formatMoney(evidence.spend)}。`,
      learned: evidence.roas > 2 ? '当前 CTA/转化路径具备小范围放大价值。' : evidence.roas < 1 && evidence.spend > 50 ? '当前 CTA/转化路径消耗预算但回收不足。' : '当前 CTA 需要继续验证。',
    },
  ];
  const unvalidatedVariables: LearningVariableType[] = (['hook', 'angle', 'offer', 'cta'] as LearningVariableType[]).filter(variable => !cards.some(card => card.variableType === variable && card.confidence !== 'low'));
  const weakest = cards.slice().sort((a, b) => {
    const rank = { down: 0, flat: 1, up: 2 };
    return rank[a.trend] - rank[b.trend];
  })[0];
  const nextActionQueue: LocalNextActionItem[] = [
    ...(weakest ? [{
      id: `${run.id}-fix-${weakest.variableType}`,
      priority: 100,
      title: `优先修复 ${weakest.variableType}`,
      reason: `${weakest.variableType} 表现趋势为${weakest.trend === 'down' ? '下降' : weakest.trend === 'flat' ? '持平' : '上升'}；${weakest.evidence}`,
      variableType: weakest.variableType,
    }] : []),
    ...unvalidatedVariables.map((variableType, index) => ({
      id: `${run.id}-validate-${variableType}`,
      priority: 80 - index * 5,
      title: `补测未验证变量 ${variableType}`,
      reason: `${variableType} 尚未形成中高置信学习，需要单变量测试。`,
      variableType,
    })),
  ].sort((a, b) => b.priority - a.priority);
  return {
    cards,
    nextActionQueue,
    search: filter => cards.filter(card => {
      const variableMatched = !filter.variableType || filter.variableType === 'all' || card.variableType === filter.variableType;
      const platformMatched = !filter.platform || filter.platform === 'all' || card.platform === filter.platform;
      const timeMatched = !filter.since || card.generatedAt >= filter.since;
      return variableMatched && platformMatched && timeMatched;
    }),
  };
}

function validateCsvUiState(csvText: string, preview?: PlatformCsvMappingPreview, rows: Array<Record<string, string>> = []): CsvUiError | null {
  if (!csvText.trim()) {
    return { type: 'parse_error', title: '文件为空，请上传包含数据的 CSV', body: '没有读取到任何内容。请上传 UTF-8 编码的 CSV，或先下载示例模板。', actionLabel: '下载示例模板' };
  }
  if (csvText.includes('\uFFFD')) {
    return { type: 'parse_error', title: '编码识别失败，请保存为 UTF-8 格式后重试', body: '当前文件包含无法识别的字符。请用表格软件另存为 UTF-8 CSV 后重新上传。', actionLabel: '下载示例模板' };
  }
  const headers = csvHeaders(csvText);
  if (headers.length < 2 || rows.length === 0) {
    return { type: 'parse_error', title: 'CSV 格式无法解析', body: '至少需要一行表头和一行数据。请检查逗号分隔、换行和编码。', actionLabel: '下载示例模板' };
  }
  if (preview && preview.totalHeaders > 0 && preview.mappedFields.length === 0) {
    return { type: 'zero_mapping', title: '未识别到标准字段，请下载示例模板对照', body: '没有任何表头能映射到 impressions、clicks、spend、orders、revenue 等字段。', actionLabel: '下载示例模板' };
  }
  if (preview?.detectedChannel === 'other') {
    return { type: 'unknown_platform', title: '请确认 CSV 平台格式', body: '我们支持 TikTok、Amazon、Shopify、Meta 和 Google 的数据格式，请确认你的 CSV 来自以上平台，或手动选择对应平台后继续。', actionLabel: '确认平台后继续' };
  }
  const hasMetrics = rows.some(row => Object.keys(row).some(key => /impressions|impr|clicks|spend|cost|revenue|orders|sales/i.test(key)) && Object.values(row).some(Boolean));
  if (!hasMetrics) {
    return { type: 'empty_metrics', title: '未检测到有效表现数据', body: '请检查 CSV 中是否包含 impressions、clicks、spend、orders、revenue，且至少有一行非空数据。', actionLabel: '查看排查项' };
  }
  const today = new Date();
  const dirtyRow = rows.find(row => Object.entries(row).some(([key, value]) => {
    const normalizedKey = normalizeHeaderKey(key);
    const raw = String(value || '').trim();
    if (!raw) return false;
    if (/click|impression|spend|cost|order|purchase|revenue|sales|conversion/i.test(normalizedKey)) {
      const numeric = Number(raw.replace(/[$,%\s,]/g, ''));
      if (!Number.isFinite(numeric) || numeric < 0) return true;
    }
    if (/date|day/.test(normalizedKey)) {
      const parsed = new Date(raw);
      if (Number.isFinite(parsed.getTime()) && parsed.getTime() > today.getTime() + 24 * 60 * 60 * 1000) return true;
    }
    return false;
  }));
  if (dirtyRow) {
    return { type: 'empty_metrics', title: '数据质量不满足决策条件', body: 'QA 报告发现负数、未来日期或无法解析的数值。请修正脏数据后再生成决策。', actionLabel: '查看排查项' };
  }
  return null;
}

function LocalProjectSummary({ run }: { run: ListingFactoryRun }) {
  const cards = [
    ['当前商品', run.project.productName],
    ['目标平台', run.project.targetPlatforms.join(' / ')],
    ['内容变量', String(run.experimentVariantMatrices.reduce((sum, matrix) => sum + matrix.rows.length, 0))],
    ['表现记录', String(run.performanceRecords.length)],
    ['决策状态', validationDecisionLabel(run.experimentDecisionSummary?.topDecision)],
    ['置信等级', confidenceLevelLabel(run.runHistoryItem?.confidenceLevel || run.experimentReports?.[0]?.confidenceSummary.confidenceLevel)],
    ['学习记录', String(run.merchantLearningArchive?.searchIndex.length || 0)],
    ['导入演练', `${run.platformCsvRehearsalSummary?.passedFixtures || 0}/${run.platformCsvRehearsalSummary?.resultCount || 0}`],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-[12px] text-slate-500">{label}</div>
          <div className="mt-1 text-[15px] font-bold text-slate-950">{value}</div>
        </div>
      ))}
    </div>
  );
}

function buildProductionDemandBrief(run: ListingFactoryRun) {
  return buildActionableProductionBrief(run);
}

function readBriefLine(markdown: string, label: string) {
  const line = markdown.split(/\r?\n/).find(item => item.startsWith(`- ${label}：`));
  return line?.replace(`- ${label}：`, '').trim() || '';
}

function buildKuaiziBriefPayload(run: ListingFactoryRun, verdict: LocalDecisionVerdict) {
  const markdown = buildActionableProductionBrief(run, verdict);
  return {
    projectId: run.project.id,
    runId: run.id,
    title: `${run.project.productName} - ${verdict.title}`,
    hook: readBriefLine(markdown, 'Hook 文案') || readableHookFallbacks(run)[0],
    angle: readBriefLine(markdown, 'Angle') || '只测试一个内容变量，保持 offer 和 CTA 不变。',
    offer: readBriefLine(markdown, 'Offer 保留策略') || `保留 ${run.project.sellingPoints[0] || '当前主卖点'}`,
    cta: readBriefLine(markdown, 'CTA 具体话术') || '现在评论你的使用场景，我们帮你判断是否适合。',
    format: readBriefLine(markdown, 'Format 规格') || '15-25 秒短视频，9:16 竖屏，全程字幕。',
    sourceBriefMarkdown: markdown,
  };
}

function videoWorkflowKey(runId: string) {
  return `${VIDEO_WORKFLOW_KEY}:${runId}`;
}

function videoStatusLabel(status: VideoWorkflowStatus) {
  const labels: Record<VideoWorkflowStatus, string> = {
    brief_ready: 'Brief 已就绪',
    storyboard_ready: '分镜已确认',
    in_review: '制作审核中',
    delivered: '素材已回写',
  };
  return labels[status];
}

function buildDefaultVideoWorkflowTask(run: ListingFactoryRun, verdict: LocalDecisionVerdict): VideoWorkflowTask {
  const payload = buildKuaiziBriefPayload(run, verdict);
  const hook = payload.hook || readableHookFallbacks(run)[0];
  return {
    id: `video-task-${run.id}`,
    runId: run.id,
    title: `${run.project.productName} 下一轮短视频任务`,
    status: 'brief_ready',
    hook,
    angle: payload.angle,
    offer: payload.offer,
    cta: payload.cta,
    format: payload.format,
    shots: [
      `0-3 秒：直接呈现问题场景，并使用 Hook「${hook}」。`,
      `3-8 秒：展示 ${run.project.sellingPoints[0] || run.project.productName} 的核心使用场景。`,
      `8-15 秒：用一个真实动作证明卖点，不加入新的价格或人群变量。`,
      `15-25 秒：保留 CTA「${payload.cta}」，结尾给出明确下一步。`,
    ],
    broll: [
      '产品近景 2 条：包装、质地、关键细节。',
      '使用场景 2 条：目标人群正在遇到问题和完成动作。',
      '证据镜头 1 条：对比、步骤或结果，不做夸大承诺。',
      '结尾画面 1 条：产品与 CTA 同屏。',
    ],
    subtitleRule: '全程字幕；每行不超过 14 个字；前 3 秒必须有问题文字；金额、时长、指标必须按 Brief 原文保留。',
    qualityChecks: [
      '只测试一个主变量，避免同时改 Hook、Offer 和 CTA。',
      '前三秒必须让目标用户看懂问题。',
      '不得加入保证转化、保证效果或未验证功效。',
      '导出前确认 trackingCode 和 experimentCellId 已保留。',
    ],
    assetUrl: '',
    updatedAt: new Date().toISOString(),
  };
}

function loadVideoWorkflowTask(run: ListingFactoryRun, verdict: LocalDecisionVerdict) {
  const fallback = buildDefaultVideoWorkflowTask(run, verdict);
  try {
    const parsed = JSON.parse(storageRead(videoWorkflowKey(run.id)) || 'null') as Partial<VideoWorkflowTask> | null;
    if (!parsed || parsed.runId !== run.id) return fallback;
    return {
      ...fallback,
      ...parsed,
      shots: Array.isArray(parsed.shots) && parsed.shots.length > 0 ? parsed.shots : fallback.shots,
      broll: Array.isArray(parsed.broll) && parsed.broll.length > 0 ? parsed.broll : fallback.broll,
      qualityChecks: Array.isArray(parsed.qualityChecks) && parsed.qualityChecks.length > 0 ? parsed.qualityChecks : fallback.qualityChecks,
    };
  } catch {
    return fallback;
  }
}

function saveVideoWorkflowTask(task: VideoWorkflowTask) {
  storageWrite(videoWorkflowKey(task.runId), JSON.stringify({ ...task, updatedAt: new Date().toISOString() }));
}

function buildVideoWorkflowMarkdown(run: ListingFactoryRun, verdict: LocalDecisionVerdict, task: VideoWorkflowTask) {
  return [
    '# Wenai 视频生产任务包',
    '',
    '## 任务摘要',
    `- 商品：${run.project.productName}`,
    `- 平台：${run.project.targetPlatforms.join(' / ')}`,
    `- 决策结论：${verdict.title}`,
    `- 任务状态：${videoStatusLabel(task.status)}`,
    `- 数据依据：${formatCount(verdict.evidence.impressions)} 次曝光、${formatCount(verdict.evidence.clicks)} 次点击、${formatMoney(verdict.evidence.spend)} 花费。`,
    '',
    '## 可执行 Brief',
    `- Hook：${task.hook}`,
    `- Angle：${task.angle}`,
    `- Offer：${task.offer}`,
    `- CTA：${task.cta}`,
    `- Format：${task.format}`,
    '',
    '## 镜头清单',
    ...task.shots.map((shot, index) => `- 镜头 ${index + 1}：${shot}`),
    '',
    '## B-roll 清单',
    ...task.broll.map(item => `- ${item}`),
    '',
    '## 字幕规则',
    `- ${task.subtitleRule}`,
    '',
    '## 质量检查',
    ...task.qualityChecks.map(item => `- ${item}`),
    '',
    '## 回写要求',
    '- 素材交付后，在 Wenai 填入素材链接并标记“素材已回写”。',
    '- 下一轮导入 CSV 时保留同一 trackingCode / experimentCellId，便于复盘。',
    task.assetUrl ? `- 已回写素材：${task.assetUrl}` : '- 已回写素材：等待填写',
  ].join('\n');
}

type CsvTemplatePlatform = 'TikTok' | 'Amazon' | 'Shopify' | 'Meta Ads' | 'Google Ads';

function CsvEmptyState({ onUpload, onDownloadTemplate }: { onUpload: () => void; onDownloadTemplate: (platform: CsvTemplatePlatform) => void }) {
  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
      <div className="text-[12px] font-bold text-amber-700">第一步</div>
      <h3 className="mt-2 text-2xl font-black text-slate-950">第一步：上传你的 TikTok/Amazon/Shopify/Meta/Google 表现数据 CSV</h3>
      <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-slate-700">上传表现数据后，Wenai 会自动识别字段、检查异常值，并给出下一轮该暂停、放大还是继续测试的决策。</p>
      <div className="mt-5">
        <PrimaryActionButton onClick={onUpload}>导入 CSV</PrimaryActionButton>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(['TikTok', 'Amazon', 'Shopify', 'Meta Ads', 'Google Ads'] as const).map(platform => (
          <button key={platform} type="button" onClick={() => onDownloadTemplate(platform)} className="rounded-md border border-amber-200 bg-white px-3 py-2 text-[12px] font-bold text-amber-800 hover:border-amber-500">
            下载示例 CSV 模板（{platform}）
          </button>
        ))}
      </div>
    </div>
  );
}

function CsvErrorState({
  error,
  selectedPlatform,
  onSelectPlatform,
  onDownloadTemplate,
  onNext,
}: {
  error: CsvUiError;
  selectedPlatform: PlatformChannel | 'auto';
  onSelectPlatform: (platform: PlatformChannel | 'auto') => void;
  onDownloadTemplate: (platform: CsvTemplatePlatform) => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-4">
      <div className="text-[13px] font-black text-rose-800">{error.title}</div>
      <p className="mt-2 text-[12px] leading-5 text-rose-700">{error.body}</p>
      {error.type === 'unknown_platform' && (
        <select value={selectedPlatform} onChange={event => onSelectPlatform(event.target.value as PlatformChannel | 'auto')} className="mt-3 w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-[12px] text-slate-900">
          <option value="auto">请选择 CSV 来源平台</option>
          <option value="tiktok">TikTok</option>
          <option value="amazon">Amazon</option>
          <option value="shopify">Shopify</option>
          <option value="meta_ads">Meta</option>
          <option value="google_ads">Google</option>
        </select>
      )}
      {error.type === 'zero_mapping' && (
        <div className="mt-3 rounded-md bg-white p-3 text-[12px] leading-5 text-slate-700">
          示例字段对照：impressions=曝光，clicks=点击，spend/cost=花费，orders/purchases=订单，revenue/sales=收入，trackingCode=追踪码。
        </div>
      )}
      {error.type === 'empty_metrics' && (
        <div className="mt-3 rounded-md bg-white p-3 text-[12px] leading-5 text-slate-700">
          常见排查：字段名是否是平台导出的原始英文；数值列是否为空；是否把金额符号、千分位或合计行放进了数据区。
        </div>
      )}
      <div className="mt-4">
        <PrimaryActionButton onClick={error.type === 'parse_error' || error.type === 'zero_mapping' ? () => onDownloadTemplate('TikTok') : onNext}>{error.actionLabel}</PrimaryActionButton>
      </div>
    </div>
  );
}

function SubscriptionStatusBar({
  subscription,
  usage,
  projectCount,
  onUpgrade,
}: {
  subscription: SubscriptionState;
  usage: UsageState;
  projectCount: number;
  onUpgrade: (tier: SubscriptionTier) => void;
}) {
  const entitlements = tierEntitlements(subscription.tier);
  const csvLimit = entitlements.csvImportLimit === 'unlimited' ? '无限' : `${usage.csvImports}/${entitlements.csvImportLimit}`;
  const projectLimit = entitlements.projectLimit === 'unlimited' ? '无限' : `${projectCount}/${entitlements.projectLimit}`;
  return (
    <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <div className="text-[12px] font-black text-slate-900">
            当前档位：{subscription.tier === 'Free' ? 'Free 试用中' : `${subscription.tier} 本地功能预览`}
          </div>
          <p className="mt-1 text-[12px] text-slate-600">项目 {projectLimit} / 本月 CSV 导入 {csvLimit} / 学习档案 {entitlements.learningRounds === 'unlimited' ? '完整保留' : `最近 ${entitlements.learningRounds} 轮`}</p>
          <p className="mt-1 text-[12px] text-slate-500">Starter/Growth 即将上线。当前只收集上线通知邮箱，不会改变 Free 试用档位。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {subscription.tier === 'Free' && <ActionButton onClick={() => onUpgrade('Starter')}>获取 Starter 上线通知</ActionButton>}
          {subscription.tier !== 'Growth' && <ActionButton onClick={() => onUpgrade('Growth')}>获取 Growth 上线通知</ActionButton>}
        </div>
      </div>
    </div>
  );
}

function PaywallModal({ paywall, onClose, onUpgrade }: { paywall: PaywallState | null; onClose: () => void; onUpgrade: (tier: SubscriptionTier, email: string) => void }) {
  const [email, setEmail] = useState('');
  if (!paywall) return null;
  const dismiss = () => {
    recordPaywallEvent({ type: 'paywallDismissed', title: paywall.title, targetTier: paywall.targetTier });
    track('paywall_dismissed', { trigger: paywall.trigger, tier: paywall.targetTier.toLowerCase() });
    onClose();
  };
  const upgrade = () => {
    if (!email.trim()) return;
    track('paywall_upgrade_clicked', { trigger: paywall.trigger, tier: paywall.targetTier.toLowerCase() });
    onUpgrade(paywall.targetTier, email.trim());
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <button type="button" onClick={dismiss} aria-label="关闭" className="absolute right-3 top-3 rounded-full border border-slate-200 px-2 py-1 text-[12px] font-black text-slate-600 hover:bg-slate-50">×</button>
        <div className="pr-8 text-[18px] font-black text-slate-950">{paywall.title}</div>
        <p className="mt-3 text-[13px] leading-6 text-slate-700">{paywall.body}</p>
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="mt-4 w-full rounded-md border border-slate-200 px-3 py-3 text-[13px] outline-none focus:border-amber-400"
        />
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={dismiss} className="rounded-md border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-700">继续使用 Free 档</button>
          <PrimaryActionButton onClick={upgrade}>获取早鸟通知</PrimaryActionButton>
        </div>
      </div>
    </div>
  );
}

function LocalLearningArchivePanel({ archive, subscription, onLockedSearch }: { archive: LocalLearningArchive; subscription: SubscriptionState; onLockedSearch: () => void }) {
  const [variableType, setVariableType] = useState<LearningVariableType | 'all'>('all');
  const [platform, setPlatform] = useState('all');
  const entitlements = tierEntitlements(subscription.tier);
  const allCards = archive.search({ variableType, platform });
  const cards = entitlements.learningRounds === 'unlimited' ? allCards : allCards.slice(0, entitlements.learningRounds);
  const platforms = Array.from(new Set(archive.cards.map(card => card.platform)));
  const trendLabel = { up: '上升', down: '下降', flat: '持平' };
  return (
    <div className="mt-4 rounded-md border border-violet-200 bg-violet-50 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="text-[12px] font-black text-violet-700">跨轮学习档案</div>
          <p className="mt-1 text-[12px] text-slate-700">回答：测过什么、学到了什么、下一轮优先测什么。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={variableType} onChange={event => setVariableType(event.target.value as LearningVariableType | 'all')} className="rounded-md border border-violet-100 bg-white px-2 py-2 text-[12px]">
            <option value="all">全部变量</option>
            <option value="hook">hook</option>
            <option value="angle">angle</option>
            <option value="offer">offer</option>
            <option value="cta">CTA</option>
          </select>
          <select value={platform} onChange={event => {
            if (!entitlements.fullLearningSearch) {
              onLockedSearch();
              return;
            }
            setPlatform(event.target.value);
          }} className="rounded-md border border-violet-100 bg-white px-2 py-2 text-[12px]">
            <option value="all">全部平台</option>
            {platforms.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {cards.map(card => (
          <div key={card.id} className="rounded-md border border-violet-100 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[12px] font-black text-slate-900">{card.variableType}</div>
              <div className="text-[12px] text-slate-500">{trendLabel[card.trend]} / {confidenceLevelLabel(card.confidence)}</div>
            </div>
            <p className="mt-2 text-[12px] font-bold text-slate-800">{card.variableValue}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-600">{card.learned}</p>
            <p className="mt-2 text-[11px] text-slate-500">{card.platform} / {new Date(card.generatedAt).toLocaleString('zh-CN')}</p>
          </div>
        ))}
      </div>
      {!entitlements.fullLearningSearch && allCards.length > cards.length && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] font-bold text-amber-800">
          Growth 档解锁完整学习档案：当前只显示最近 {String(entitlements.learningRounds)} 轮。
        </div>
      )}
      <div className="mt-3 rounded-md bg-white p-3">
        <div className="text-[12px] font-black text-slate-900">NextActionQueue</div>
        {archive.nextActionQueue.slice(0, 4).map(item => (
          <p key={item.id} className="mt-2 text-[12px] leading-5 text-slate-700">P{item.priority} / {item.title}：{item.reason}</p>
        ))}
      </div>
    </div>
  );
}

function MappingPreviewPanel({
  preview,
  manualMappings,
  onManualMappingChange,
}: {
  preview?: PlatformCsvMappingPreview;
  manualMappings: Record<string, string>;
  onManualMappingChange: (header: string, field: string) => void;
}) {
  if (!preview) return null;
  const candidateFields = [
    'channel', 'campaignName', 'contentName', 'trackingCode', 'experimentCellId', 'date',
    'impressions', 'clicks', 'spend', 'orders', 'revenue', 'likes', 'comments', 'shares',
    'saves', 'addToCart', 'productName', 'skuId', 'platformContentId', 'note',
  ];
  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="text-[12px] font-bold text-slate-900">字段映射预览</div>
          <p className="mt-1 text-[12px] text-slate-600">已识别为 {platformLabel(preview.detectedChannel)}，{preview.mappedFields.length} 个字段已自动匹配。</p>
        </div>
        <div className={`rounded-md px-3 py-2 text-[12px] font-bold ${preview.estimatedImportReady ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {preview.estimatedImportReady ? '可导入' : '需修复'}
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {preview.candidates.map(candidate => {
          const isUnknown = !candidate.normalizedField;
          const suggested = suggestNormalizedField(candidate.originalHeader, preview);
          return (
            <div key={candidate.originalHeader} className={`rounded-md border p-3 ${isUnknown ? 'border-rose-200 bg-rose-50' : 'border-emerald-100 bg-emerald-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-bold text-slate-900">{candidate.originalHeader}</span>
                <span className="text-[12px] text-slate-600">{candidate.normalizedField || '未匹配'}</span>
              </div>
              {isUnknown && (
                <label className="mt-2 block text-[12px] text-rose-700">
                  建议映射为
                  <select
                    value={manualMappings[candidate.originalHeader] || suggested}
                    onChange={event => onManualMappingChange(candidate.originalHeader, event.target.value)}
                    className="mt-1 w-full rounded-md border border-rose-200 bg-white px-2 py-2 text-[12px] text-slate-900"
                  >
                    {candidateFields.map(field => <option key={field} value={field}>{field}</option>)}
                  </select>
                </label>
              )}
            </div>
          );
        })}
      </div>
      {(preview.missingRequiredFields.length > 0 || preview.conflictFields.length > 0) && (
        <div className="mt-3 rounded-md bg-rose-50 p-3 text-[12px] leading-5 text-rose-700">
          缺失必填字段：{preview.missingRequiredFields.join(' / ') || '无'}；字段冲突：{preview.conflictFields.join(' / ') || '无'}。
        </div>
      )}
    </div>
  );
}

function DecisionCard({
  run,
  verdict,
  onExportReport,
  onCopyTemplate,
  onKuaiziCompleted,
}: {
  run: ListingFactoryRun;
  verdict: LocalDecisionVerdict;
  onExportReport: () => void;
  onCopyTemplate: () => void;
  onKuaiziCompleted: (assetUrls: string[]) => void;
}) {
  const badge = verdict.kind === 'scale' ? '小范围放大' : verdict.kind === 'stop' ? '暂停投放' : verdict.kind === 'rework' ? '重做承接' : '继续验证';
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  return (
    <div id="decision-summary" className={`rounded-lg border p-5 ${verdict.cardClassName}`}>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="text-[12px] font-black tracking-wide text-slate-600">{badge}</div>
          <h3 className="mt-2 text-3xl font-black text-slate-950">{verdict.title}</h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">{verdict.headline}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-md px-3 py-2 text-[12px] font-black ${verdict.confidenceClassName}`}>{verdict.confidenceLabel}</span>
            <span className="rounded-md bg-white px-3 py-2 text-[12px] font-bold text-slate-700">{verdict.sampleMessage}</span>
          </div>
        </div>
        <div className="grid min-w-56 grid-cols-2 gap-2">
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] text-slate-500">CTR</div>
            <div className="mt-1 text-2xl font-black text-slate-950">{formatPercent(verdict.evidence.ctr)}</div>
            <div className="mt-1 text-[11px] text-slate-500">行业 {formatPercent(0.015)} / 历史 {formatPercent(verdict.evidence.historicalCtr)}</div>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] text-slate-500">ROAS</div>
            <div className="mt-1 text-2xl font-black text-slate-950">{formatRoas(verdict.evidence.roas)}</div>
            <div className="mt-1 text-[11px] text-slate-500">行业 {formatRoas(1.5)} / 历史 {formatRoas(verdict.evidence.historicalRoas)}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md bg-white p-3">
          <div className="text-[12px] text-slate-500">下一轮动作</div>
          <p className="mt-2 text-[13px] font-bold leading-6 text-slate-900">{verdict.nextAction}</p>
        </div>
        <div className="rounded-md bg-white p-3">
          <div className="text-[12px] text-slate-500">内容证据</div>
          <p className="mt-2 text-[13px] font-bold leading-6 text-slate-900">{run.performanceRecords[0]?.hook || run.briefs[0]?.hook || readableHookFallbacks(run)[0]}</p>
        </div>
      </div>
      <p className="mt-4 rounded-md bg-white p-3 text-[13px] font-bold leading-6 text-slate-900">{verdict.rationale}</p>
      <div className="mt-4 rounded-md bg-white p-3">
        <button type="button" onClick={() => setEvidenceOpen(value => !value)} className="flex w-full items-center justify-between text-left text-[12px] font-black text-slate-900">
          <span>证据链：指标与历史均值对比</span>
          <span>{evidenceOpen ? '收起' : '展开'}</span>
        </button>
        {evidenceOpen && (
          <div data-testid="decision-evidence-grid" className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ['记录数', formatCount(verdict.evidence.recordCount), '本次聚合记录'],
              ['曝光 / 点击', `${formatCount(verdict.evidence.impressions)} / ${formatCount(verdict.evidence.clicks)}`, '样本量'],
              ['花费 / 收入', `${formatMoney(verdict.evidence.spend)} / ${formatMoney(verdict.evidence.revenue)}`, '投入产出'],
              ['CTR', metricWithBenchmarks('CTR', verdict.evidence.ctr, verdict.evidence.historicalCtr, 0.015), `差值 ${formatPercent(verdict.evidence.ctrDelta)}`],
              ['CVR', metricWithBenchmarks('CVR', verdict.evidence.cvr, verdict.evidence.historicalCvr, 0.02), `差值 ${formatPercent(verdict.evidence.cvrDelta)}`],
              ['ROAS', metricWithBenchmarks('ROAS', verdict.evidence.roas, verdict.evidence.historicalRoas, 1.5), `差值 ${formatRoas(verdict.evidence.roasDelta)}`],
              ['置信分', `${formatCount(verdict.confidenceScore)}/100`, `稳定性 ${formatCount(verdict.stabilityScore)}/100`],
              ['订单', formatCount(verdict.evidence.orders), '由点击和转化率估算'],
              ['代表记录', verdict.evidence.representativeRecord?.trackingCode || verdict.evidence.representativeRecord?.hook || '数据未追踪', '用于生成 Brief'],
            ].map(([label, value, hint]) => (
              <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                <div className="text-[12px] text-slate-500">{label}</div>
                <div className="mt-1 text-[13px] font-black text-slate-950">{value}</div>
                <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onExportReport} className="w-full rounded-md bg-amber-600 px-6 py-3 text-[14px] font-black text-white shadow-sm hover:bg-amber-700 sm:w-auto">导出脱敏报告</button>
        <button type="button" onClick={onCopyTemplate} className="w-full rounded-md border border-slate-300 bg-white px-5 py-3 text-[13px] font-black text-slate-900 hover:bg-slate-50 sm:w-auto">复制模板创建工作台</button>
      </div>
      <KuaiziPushButton payload={buildKuaiziBriefPayload(run, verdict)} visible={verdict.kind === 'scale' || verdict.kind === 'rework'} onCompleted={onKuaiziCompleted} />
    </div>
  );
}

function VideoProductionWorkflowPanel({
  run,
  verdict,
  onChanged,
  onToast,
}: {
  run: ListingFactoryRun;
  verdict: LocalDecisionVerdict;
  onChanged: () => void;
  onToast: (message: string) => void;
}) {
  const [task, setTask] = useState<VideoWorkflowTask>(() => loadVideoWorkflowTask(run, verdict));
  const [message, setMessage] = useState('视频任务包已根据本轮决策生成，可编辑后交给剪辑师或外部生产工具。');

  const persist = (next: VideoWorkflowTask, nextMessage: string) => {
    setTask(next);
    saveVideoWorkflowTask(next);
    setMessage(nextMessage);
    onToast(nextMessage);
  };

  const updateTask = (patch: Partial<VideoWorkflowTask>) => {
    persist({ ...task, ...patch, updatedAt: new Date().toISOString() }, '视频生产任务已更新。');
  };

  const updateList = (field: 'shots' | 'broll' | 'qualityChecks', value: string) => {
    updateTask({ [field]: value.split(/\r?\n/).map(item => item.trim()).filter(Boolean) } as Pick<VideoWorkflowTask, typeof field>);
  };

  const advance = (status: VideoWorkflowStatus) => {
    persist({ ...task, status, updatedAt: new Date().toISOString() }, `视频生产状态已更新：${videoStatusLabel(status)}。`);
  };

  const exportTask = () => {
    const markdown = buildVideoWorkflowMarkdown(run, verdict, task);
    downloadTextFile(safeDownloadFilename(`${run.project.productName}-视频生产任务包`, 'md'), markdown, 'text/markdown;charset=utf-8');
    setMessage('视频生产任务包已下载。');
    onToast('视频生产任务包已下载。');
  };

  const linkAsset = () => {
    if (!task.assetUrl.trim()) {
      setMessage('请先填入素材链接，再标记回写。');
      return;
    }
    const updatedRun = {
      ...run,
      activityLog: [{
        id: createLocalActivityId('video-workflow'),
        time: new Date().toISOString(),
        action: 'Video asset linked',
        detail: task.assetUrl.trim(),
      }, ...run.activityLog].slice(0, 12),
      updatedAt: new Date().toISOString(),
    };
    saveListingFactoryRun({ ...updatedRun, deliveryPackage: buildDeliveryPackage(updatedRun) });
    persist({ ...task, status: 'delivered', assetUrl: task.assetUrl.trim(), updatedAt: new Date().toISOString() }, '素材链接已回写到当前项目。');
    onChanged();
  };

  return (
    <section data-testid="video-production-workflow" className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <div className="text-[12px] font-black tracking-wide text-amber-700">视频生产工作流</div>
          <h3 className="mt-2 text-2xl font-black text-slate-950">把决策转成可执行视频任务</h3>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-700">
            当前任务包会保留本轮结论、镜头清单、B-roll、字幕规则和质量检查。剪辑完成后，把素材链接回写到项目，下一轮导入 CSV 时继续复盘。
          </p>
        </div>
        <div className="rounded-md bg-amber-50 px-3 py-2 text-[12px] font-black text-amber-800">{videoStatusLabel(task.status)}</div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-3">
          <label className="block">
            <span className="text-[12px] font-bold text-slate-600">Hook</span>
            <input value={task.hook} onChange={event => updateTask({ hook: event.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[13px]" />
          </label>
          <label className="block">
            <span className="text-[12px] font-bold text-slate-600">Angle</span>
            <textarea value={task.angle} onChange={event => updateTask({ angle: event.target.value })} rows={2} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[13px]" />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-bold text-slate-600">Offer</span>
              <textarea value={task.offer} onChange={event => updateTask({ offer: event.target.value })} rows={2} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[13px]" />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-slate-600">CTA</span>
              <textarea value={task.cta} onChange={event => updateTask({ cta: event.target.value })} rows={2} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[13px]" />
            </label>
          </div>
          <label className="block">
            <span className="text-[12px] font-bold text-slate-600">Format</span>
            <input value={task.format} onChange={event => updateTask({ format: event.target.value })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[13px]" />
          </label>
        </div>

        <div className="grid gap-3">
          <label className="block">
            <span className="text-[12px] font-bold text-slate-600">镜头清单</span>
            <textarea value={task.shots.join('\n')} onChange={event => updateList('shots', event.target.value)} rows={6} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[12px] leading-5" />
          </label>
          <label className="block">
            <span className="text-[12px] font-bold text-slate-600">B-roll 清单</span>
            <textarea value={task.broll.join('\n')} onChange={event => updateList('broll', event.target.value)} rows={4} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[12px] leading-5" />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-bold text-slate-600">字幕规则</span>
          <textarea value={task.subtitleRule} onChange={event => updateTask({ subtitleRule: event.target.value })} rows={3} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[12px] leading-5" />
        </label>
        <label className="block">
          <span className="text-[12px] font-bold text-slate-600">质量检查</span>
          <textarea value={task.qualityChecks.join('\n')} onChange={event => updateList('qualityChecks', event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-[12px] leading-5" />
        </label>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="text-[12px] font-black text-slate-900">素材回写</div>
        <div className="mt-2 flex flex-col gap-2 md:flex-row">
          <input
            value={task.assetUrl}
            onChange={event => updateTask({ assetUrl: event.target.value })}
            placeholder="粘贴成片或素材链接"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px]"
          />
          <button type="button" onClick={linkAsset} className="rounded-md bg-slate-950 px-4 py-2 text-[12px] font-black text-white">标记素材已回写</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => advance('storyboard_ready')} className="rounded-md border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-700">确认分镜</button>
        <button type="button" onClick={() => advance('in_review')} className="rounded-md border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-700">进入制作审核</button>
        <button type="button" onClick={exportTask} className="rounded-md bg-amber-600 px-4 py-2 text-[12px] font-black text-white">导出视频任务包</button>
      </div>
      <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">{message}</p>
    </section>
  );
}

function ContentDecisionOsPanel({ run, onChanged }: { run: ListingFactoryRun; onChanged: () => void }) {
  const decision = run.experimentDecisionSummary;
  const board = run.experimentWorkbenchBoard;
  const quality = run.platformImportQualityReport;
  const rehearsal = run.platformCsvRehearsalSummary;
  const archive = run.merchantLearningArchive;
  const topAction = board?.highestPriorityAction;
  const firstLearning = archive?.searchIndex[0];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const decisionRef = useRef<HTMLDivElement | null>(null);
  const shareLinkRef = useRef<HTMLInputElement | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>(() => loadSubscription());
  const [usage, setUsage] = useState<UsageState>(() => loadUsage());
  const [paywall, setPaywall] = useState<PaywallState | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [primaryPulse, setPrimaryPulse] = useState(false);
  const [storageNotice, setStorageNotice] = useState(() => localStorageIsBlocked() ? '数据仅在当前标签页保留，建议允许本地存储以保存历史。' : '');
  const [overlayMessage, setOverlayMessage] = useState('');
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryItem[]>(() => loadDecisionHistory(run.id));
  const verdict = buildLocalDecisionVerdict(run, decisionHistory);
  const localLearningArchive = createLearningArchive(run, verdict);
  const isEmpty = run.performanceRecords.length === 0;
  const sampleCsv = [
    'platform,contentType,hook,impressions,views,clicks,likes,comments,saves,shares,conversionRate,revenue,cost,trackingCode,cellId,notes',
    `"${run.project.targetPlatforms[0] || 'TikTok'}","${run.briefs[0]?.contentType || 'short_video'}","${run.briefs[0]?.hook || run.project.productName}",1200,860,72,90,12,24,14,0.04,420,120,"wenai_cell_1","cell-1","winner signal"`,
    `"${run.project.targetPlatforms[1] || 'Amazon'}","${run.briefs[1]?.contentType || 'short_video'}","${run.briefs[1]?.hook || run.project.productName}",900,520,18,20,3,5,2,0.01,80,90,"wenai_cell_2","cell-2","needs validation"`,
  ].join('\n');
  const [csvText, setCsvText] = useState(() => loadDecisionSession(run.id)?.csvText || (isEmpty ? '' : sampleCsv));
  const [toast, setToast] = useState(() => loadDecisionSession(run.id)?.toast || '第一步：上传你的 TikTok/Amazon/Shopify/Meta/Google 表现数据 CSV。');
  const [mappingPreview, setMappingPreview] = useState<PlatformCsvMappingPreview | undefined>(() => {
    const savedCsv = loadDecisionSession(run.id)?.csvText;
    const rows = savedCsv ? parseCsvRows(savedCsv) : [];
    return rows.length > 0 ? buildPlatformCsvMappingPreview(rows) : run.platformCsvMappingPreview;
  });
  const [importPreviewSummary, setImportPreviewSummary] = useState<PlatformCsvImportPreviewSummary | undefined>(() => {
    const savedCsv = loadDecisionSession(run.id)?.csvText;
    const rows = savedCsv ? parseCsvRows(savedCsv) : [];
    if (rows.length === 0) return run.platformCsvImportPreviewSummary;
    const preview = buildPlatformCsvMappingPreview(rows);
    return buildPlatformCsvImportPreviewSummary(rows, preview.detectedChannel, run.platformDataContract, new Date());
  });
  const [manualMappings, setManualMappings] = useState<Record<string, string>>(() => loadDecisionSession(run.id)?.manualMappings || {});
  const [workspaceMessage, setWorkspaceMessage] = useState('复制模板会保留商品结构、平台、内容目标和规则，清空表现数据，用于新团队或新客户快速创建自己的本地工作台。');
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformChannel | 'auto'>('auto');
  const [csvError, setCsvError] = useState<CsvUiError | null>(null);
  const showEmptyState = isEmpty && csvText.trim().length === 0;
  const blockers = [
    ...(quality?.errorCount ? [`导入质量错误 ${quality.errorCount} 个`] : []),
    ...(rehearsal?.failedFixtures ? [`CSV 演练需修复 ${rehearsal.failedFixtures} 个样例`] : []),
    ...(decision?.topDecision === 'do_not_decide' ? ['当前规则建议暂不下结论'] : []),
  ];
  const entitlements = tierEntitlements(subscription.tier);
  const projectCount = typeof window === 'undefined' ? 1 : loadListingFactoryRuns().length;
  useEffect(() => {
    const status = saveDecisionSession(run.id, {
      v: 1,
      csvText,
      toast,
      manualMappings,
      updatedAt: new Date().toISOString(),
    });
    if (status === 'cleaned') setStorageNotice('已自动归档旧项目，当前工作台已继续保存。');
    if (localStorageIsBlocked()) setStorageNotice('数据仅在当前标签页保留，建议允许本地存储以保存历史。');
  }, [csvText, manualMappings, run.id, toast]);
  useEffect(() => {
    if (!shareUrl) return;
    shareLinkRef.current?.focus();
    shareLinkRef.current?.select();
  }, [shareUrl]);
  useEffect(() => {
    if (run.performanceRecords.length === 0) return;
    const item: DecisionHistoryItem = {
      id: `${run.id}-${new Date().toISOString()}`,
      runId: run.id,
      decision: verdict.title === '观察 3 天' ? 'observe' : verdict.kind,
      generatedAt: new Date().toISOString(),
      roas: verdict.evidence.roas,
      ctr: verdict.evidence.ctr,
      cvr: verdict.evidence.cvr,
      confidenceScore: verdict.confidenceScore,
    };
    const exists = decisionHistory[0]?.roas === item.roas && decisionHistory[0]?.ctr === item.ctr && decisionHistory[0]?.decision === item.decision;
    if (exists) return;
    const next = [item, ...decisionHistory].slice(0, 5);
    setDecisionHistory(next);
    saveDecisionHistory(run.id, next);
  }, [decisionHistory, run.id, run.performanceRecords.length, verdict.kind, verdict.title, verdict.evidence.roas, verdict.evidence.ctr, verdict.evidence.cvr, verdict.confidenceScore]);

  const upgrade = (tier: SubscriptionTier, email = '') => {
    if (email.trim()) {
      const targetTier = tier === 'Growth' ? 'Growth' : 'Starter';
      const result = saveEarlyBirdLead({ tier: targetTier, email, source: 'content-decision-os' });
      if (!result.ok) {
        setToast(result.error);
        return;
      }
      setToast('已记录。Starter/Growth 上线后会优先通知你。当前继续使用 Free 试用。');
    } else {
      setPaywall({
        title: `${tier} 即将上线`,
        body: `${tier} 档即将上线，留下邮箱获取早鸟优惠。当前不会改变 Free 试用档位。`,
        targetTier: tier,
        trigger: 'brief_export',
      });
      return;
    }
    setSubscription(loadSubscription());
    setPaywall(null);
  };

  const buildPreview = (nextCsvText = csvText) => {
    const rows = parseCsvRows(nextCsvText);
    const preview = buildPlatformCsvMappingPreview(rows.length > 0 ? rows : csvHeaders(nextCsvText), selectedPlatform === 'auto' ? undefined : selectedPlatform);
    const summary = rows.length > 0 ? buildPlatformCsvImportPreviewSummary(rows, preview.detectedChannel, run.platformDataContract, new Date()) : undefined;
    setCsvError(validateCsvUiState(nextCsvText, preview, rows));
    setMappingPreview(preview);
    setImportPreviewSummary(summary);
    return { preview, summary, rows };
  };

  const previewImport = () => {
    const { preview } = buildPreview();
    setToast(`${mappingMatchText(preview)}。${preview.unknownFields.length > 0 ? `还有 ${preview.unknownFields.length} 个字段需要手动确认。` : '可以导入后查看决策摘要。'}`);
  };
  const applyImport = async () => {
    if (entitlements.csvImportLimit !== 'unlimited' && usage.csvImports >= entitlements.csvImportLimit) {
      recordPaywallEvent({ type: 'paywallShown', trigger: 'csv_import_limit', tier: subscription.tier });
      setPaywall({
        title: 'Free 档每月限 3 次导入',
        body: 'Free 档每月限 3 次导入。Starter 档即将上线，留下邮箱获取早鸟优惠。上线后每月可复盘 30 轮实验，减少错误投放决策，并导出无水印报告和生产 Brief。',
        targetTier: 'Starter',
        trigger: 'import_limit',
      });
      track('paywall_shown', { trigger: 'import_limit' });
      return;
    }
    setIsProcessingCsv(true);
    try {
      await withTimeout(Promise.resolve().then(() => {
        const { preview } = buildPreview();
        const currentError = validateCsvUiState(csvText, preview, parseCsvRows(csvText));
        if (currentError && currentError.type !== 'unknown_platform') {
          setCsvError(currentError);
          setToast(currentError.title);
          return;
        }
        const result = importPerformanceCsv(run, csvText, new Date());
        if (result.errors.length > 0) {
          const dirtyError: CsvUiError = {
            type: 'empty_metrics',
            title: '数据质量不满足决策条件',
            body: result.errors.slice(0, 3).join('；'),
            actionLabel: '查看排查项',
          };
          clearPerformance(run, dirtyError.body);
          setCsvError(dirtyError);
          setToast(dirtyError.title);
          return;
        }
        if (result.records.length > 0) {
          const nextVerdict = buildLocalDecisionVerdict({ ...run, performanceRecords: result.records }, decisionHistory);
          track('csv_import', { platform: preview.detectedChannel, rowCount: result.records.length });
          track('decision_generated', { verdict: nextVerdict.kind, confidence: nextVerdict.confidenceLabel });
          const nextUsage = { month: currentMonthKey(), csvImports: usage.csvImports + 1 };
          setUsage(nextUsage);
          saveUsage(nextUsage);
          persistPerformance(run, result.records);
          setToast(`决策已生成：${mappingMatchText(preview)}，导入 ${result.records.length} 条记录。`);
          setPrimaryPulse(true);
          window.setTimeout(() => setPrimaryPulse(false), 1600);
          window.setTimeout(() => document.getElementById('decision-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
          onChanged();
          return;
        }
        const emptyMetricError: CsvUiError = { type: 'empty_metrics', title: '未检测到有效表现数据', body: '请检查 CSV 中是否包含 impressions/clicks/spend，且至少一行有有效数值。', actionLabel: '查看排查项' };
        setCsvError(emptyMetricError);
        setToast(emptyMetricError.title);
      }));
    } catch {
      setToast('处理时间较长，请重试或联系支持。');
    } finally {
      setIsProcessingCsv(false);
    }
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    const guard = assessClientFile(file, {
      kind: 'csv',
      largeBytes: 5 * 1024 * 1024,
      hardBytes: 12 * 1024 * 1024,
      allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
    });
    if (guard.message) setToast(guard.message);
    if (!guard.ok) return;
    try {
      const text = await withTimeout(readClientTextFile(file));
      setCsvText(text);
      const { preview } = buildPreview(text);
      setToast(`${mappingMatchText(preview)}。${preview.unknownFields.length > 0 ? '请先确认未匹配字段。' : '下一步：导入并生成决策。'}`);
    } catch {
      setToast('处理时间较长，请重试或联系支持。');
    }
  };
  const createTemplateWorkspace = () => {
    const now = new Date();
    const templateProject = createListingProject({
      productName: `${run.project.productName} 决策模板`,
      category: run.project.category,
      targetPlatforms: run.project.targetPlatforms,
      priceBand: run.project.priceBand,
      sellingPoints: run.project.sellingPoints,
      targetAudience: run.project.targetAudience,
      contentGoal: run.project.contentGoal,
      brandGuardrails: run.project.brandGuardrails,
      categoryRules: run.project.categoryRules,
      competitorNotes: `保留 ${run.project.productName} 的实验结构，用于下一轮内容复盘。`,
    }, now);
    const templateRun = {
      ...createRunFromProject(templateProject, now),
      platformCsvAdapterPresets: run.platformCsvAdapterPresets,
      platformCsvMappingPreview: run.platformCsvMappingPreview,
      platformCsvMappingPresetExport: run.platformCsvMappingPresetExport,
      platformFieldMapping: run.platformFieldMapping,
      platformDataContract: run.platformDataContract,
      platformImportTemplate: run.platformImportTemplate,
      experimentPlans: run.experimentPlans,
      experimentVariantMatrices: run.experimentVariantMatrices,
      experimentWorkbenchBoard: run.experimentWorkbenchBoard,
      experimentPriorityQueue: run.experimentPriorityQueue,
      experimentLearningGapMap: run.experimentLearningGapMap,
      experimentSequencingPlan: run.experimentSequencingPlan,
      experimentValidationPolicy: run.experimentValidationPolicy,
      experimentExecutionPlaybook: run.experimentExecutionPlaybook,
      merchantLearningArchive: {
        ...run.merchantLearningArchive,
        searchIndex: run.merchantLearningArchive.searchIndex.slice(0, 8).map(item => ({
          ...item,
          reusableLearning: `模板参考：${item.reusableLearning}`,
        })),
        reusableMerchantLearningSummary: `模板版学习摘要：继承自 ${run.project.productName}，仅作为初始参考；新工作台需导入自己的表现数据后再下结论。`,
        strongestReusableLearning: localLearningArchive.cards[0]?.learned || run.merchantLearningArchive.strongestReusableLearning,
        nextBestMove: localLearningArchive.nextActionQueue[0]?.title || run.merchantLearningArchive.nextBestMove,
      },
      crossRunComparison: run.crossRunComparison,
      performanceRecords: [],
      normalizedPlatformMetricRecords: [],
    };
    saveListingFactoryRun({ ...templateRun, deliveryPackage: buildDeliveryPackage(templateRun) });
    recordTemplateConversion({ sourceProjectId: run.project.id, source: 'local-copy', templateName: templateProject.productName });
    track('template_copied', { source: 'dashboard', sourceProjectId: run.project.id, templateName: templateProject.productName });
    setCsvText('');
    setCsvError(null);
    setManualMappings({});
    setMappingPreview(undefined);
    setWorkspaceMessage(`已创建新工作台：${templateProject.productName} 项目（模板），请导入新数据。`);
    setToast(`已创建新工作台：${templateProject.productName} 项目（模板），请导入新数据。`);
    setOverlayMessage('正在准备工作台...');
    onChanged();
    window.setTimeout(() => {
      window.location.href = '/factory';
    }, 3000);
  };
  const scrollToDecision = () => document.getElementById('decision-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const exportProductionBrief = () => {
    if (!entitlements.productionBriefExport) {
      recordPaywallEvent({ type: 'paywallShown', trigger: 'production_brief_export', tier: subscription.tier });
      setPaywall({ title: 'Brief 导出需 Starter 档', body: 'Starter 档即将上线，留下邮箱获取早鸟优惠。上线后每月可复盘 30 轮实验，减少错误投放决策，并把胜出变量直接整理成剪辑师可执行的生产 Brief。', targetTier: 'Starter', trigger: 'brief_export' });
      track('paywall_shown', { trigger: 'brief_export' });
      return;
    }
    try {
      downloadTextFile(safeDownloadFilename(`${run.project.productName}-生产需求Brief`, 'md'), buildActionableProductionBrief(run, verdict), 'text/markdown;charset=utf-8');
      track('report_exported', { type: 'brief' });
      setToast('生产 Brief 已下载，可直接发给剪辑师执行。');
    } catch {
      setToast('处理时间较长，请重试或联系支持。');
    }
  };
  const exportDecisionReport = async () => {
    const watermark = entitlements.watermarkReports ? '\n\n---\nWenai Free' : '';
    const report = `${buildReadableDecisionReport(run, verdict)}${watermark}`;
    try {
      downloadTextFile(safeDownloadFilename(`${run.project.productName}-脱敏决策报告`, 'md'), report, 'text/markdown;charset=utf-8');
      track('report_exported', { type: 'decision' });
      await navigator.clipboard?.writeText(report).catch(() => undefined);
      const shareId = createShareId();
      const params = new URLSearchParams({
        sourceProjectId: run.project.id,
        channel: 'decision_report',
        templateSnapshot: encodeURIComponent(JSON.stringify({ productName: run.project.productName, platforms: run.project.targetPlatforms, goal: run.project.contentGoal }).slice(0, 600)),
      });
      const url = `${window.location.origin}/report/${shareId}?${params.toString()}`;
      const response = await withTimeout(fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shareId, moduleId: 'content-decision-os', source: 'module', title: `${run.project.productName} 脱敏决策报告`, content: report }),
      }));
      if (!response.ok) throw new Error('share failed');
      setShareUrl(url);
      setShareMessage('报告已复制到剪贴板 / 已下载。分享链接已生成，可直接发送给团队或客户。');
    } catch {
      setShareMessage('报告已复制到剪贴板 / 已下载。分享链接生成失败，请重试。');
    }
  };
  const attachKuaiziAssets = (assetUrls: string[]) => {
    if (assetUrls.length === 0) return;
    const updatedRun = {
      ...run,
      activityLog: [{
        id: createLocalActivityId('kuaizi'),
        time: new Date().toISOString(),
        action: 'Kuaizi assets linked',
        detail: assetUrls.join(' / '),
      }, ...run.activityLog].slice(0, 12),
      updatedAt: new Date().toISOString(),
    };
    saveListingFactoryRun({ ...updatedRun, deliveryPackage: buildDeliveryPackage(updatedRun) });
    setToast(`筷子科技返回 ${assetUrls.length} 条素材链接，已关联到当前项目。`);
    onChanged();
  };
  const primaryAction = showEmptyState
    ? { label: '导入 CSV', onClick: () => fileInputRef.current?.click() }
    : isProcessingCsv || run.performanceRecords.length === 0
      ? { label: isProcessingCsv ? '正在生成决策摘要...' : '生成决策摘要', onClick: applyImport }
      : mappingPreview && run.performanceRecords.length > 0
      ? { label: '查看决策摘要', onClick: scrollToDecision }
      : { label: '生成决策摘要', onClick: applyImport };
  const downloadSampleTemplate = (platform: CsvTemplatePlatform) => {
    const templates = {
      TikTok: [
        'Record ID,Platform,Campaign name,Ad name,Ad ID,Tracking code,Cell ID,Date,Impressions,Clicks,Spend,Orders,Revenue,Likes,Comments,Shares,Saves,Note',
        'rec-001,tiktok,Spring Test,Hook A,ad-001,tk-hook-a,cell-a,2026-05-15,1200,72,120,4,420,90,12,14,24,clean sample',
      ],
      Amazon: [
        'Record ID,Platform,campaign_name,ad_group_name,keyword,Tracking code,Cell ID,Date,impressions,clicks,spend,sales,acos,orders,Note',
        'rec-001,amazon,SP Test,Desk Setup Keywords,cable organizer,amz-keyword-a,cell-a,2026-05-15,3200,126,180,640,0.28,8,clean sample',
      ],
      Shopify: [
        'Record ID,Platform,utm_source,utm_campaign,Product title,Variant SKU,Tracking code,Cell ID,Date,sessions,orders,total_sales,conversion_rate,aov,Note',
        'rec-001,shopify,tiktok,spring_hook_test,Product Landing A,SKU-001,shop-landing-a,cell-a,2026-05-15,1800,6,360,0.033,60,clean sample',
      ],
      'Meta Ads': [
        'Record ID,Platform,campaign_name,adset_name,ad_name,Tracking code,Cell ID,Date,impressions,clicks,spend,purchases,purchase_roas,cost_per_result,Note',
        'rec-001,meta_ads,Spring Test,UGC Hooks,Desk Hook A,meta-hook-a,cell-a,2026-05-15,2600,118,96,7,3.15,13.71,clean sample',
      ],
      'Google Ads': [
        'Record ID,Platform,campaign,ad_group,keyword,Tracking code,Cell ID,Date,impressions,clicks,cost,conversions,conversion_value,cost_per_conversion,Note',
        'rec-001,google_ads,Search Test,Problem Keywords,desk cable organizer,google-keyword-a,cell-a,2026-05-15,2400,110,88,6,330,14.67,clean sample',
      ],
    };
    downloadTextFile(safeDownloadFilename(`${run.project.productName}-${platform}-示例CSV模板`, 'csv'), templates[platform].join('\n'), 'text/csv;charset=utf-8');
    track('report_exported', { type: 'csv_template', platform });
  };
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-5">
      {overlayMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="rounded-lg bg-white px-6 py-5 text-[14px] font-black text-slate-950 shadow-xl">{overlayMessage}</div>
        </div>
      )}
      <PaywallModal paywall={paywall} onClose={() => setPaywall(null)} onUpgrade={upgrade} />
      {storageNotice && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-800">{storageNotice}</div>}
      <SubscriptionStatusBar subscription={subscription} usage={usage} projectCount={projectCount} onUpgrade={upgrade} />
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="Wenai Content Decision OS" title="先决定下一轮该生产什么" body="把 CSV 表现数据、内容变量、实验规则和跨轮学习连起来，输出测什么、暂停什么、放大什么，以及哪些结论需要继续验证。" />
        <div className="flex flex-wrap gap-2">
          {!showEmptyState && <PrimaryActionButton onClick={primaryAction.onClick} pulse={primaryPulse}>{primaryAction.label}</PrimaryActionButton>}
          {!isEmpty && <ActionButton onClick={exportProductionBrief}>导出生产需求 Brief</ActionButton>}
        </div>
      </div>
      <input
        ref={fileInputRef}
        data-testid="primary-csv-upload"
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={event => {
          void importFile(event.target.files?.[0]);
          event.currentTarget.value = '';
        }}
      />
      <div className={`mt-4 rounded-md px-3 py-2 text-[12px] font-bold ${toast.includes('错误') || toast.includes('没有') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{toast}</div>

      {showEmptyState && <CsvEmptyState onUpload={() => fileInputRef.current?.click()} onDownloadTemplate={downloadSampleTemplate} />}
      {csvError && !showEmptyState && (
        <CsvErrorState
          error={csvError}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={platform => {
            setSelectedPlatform(platform);
            setCsvError(null);
            setToast(platform === 'auto' ? '请手动选择平台后继续。' : `已手动选择 ${platformLabel(platform)}，下一步：生成决策摘要。`);
          }}
          onDownloadTemplate={downloadSampleTemplate}
          onNext={() => {
            setCsvError(null);
            if (csvError.type === 'unknown_platform') buildPreview();
          }}
        />
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-[12px] text-slate-500">输入数据</div>
          <div className="mt-1 text-[18px] font-black text-slate-950">{run.performanceRecords.length}</div>
          <p className="mt-1 text-[12px] text-slate-500">本地表现记录</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-[12px] text-slate-500">导入 QA</div>
          <div className="mt-1 text-[13px] font-bold text-slate-950">{quality?.errorCount || 0} 错误 / {quality?.warningCount || 0} 警告</div>
          <p className="mt-1 text-[12px] text-slate-500">先保证数据可信</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-[12px] text-slate-500">当前决策</div>
          <div className="mt-1 text-[13px] font-bold text-slate-950">{verdict.title}</div>
          <p className="mt-1 text-[12px] text-slate-500">{verdict.confidenceLabel}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-[12px] text-slate-500">学习资产</div>
          <div className="mt-1 text-[18px] font-black text-slate-950">{archive?.searchIndex.length || 0}</div>
          <p className="mt-1 text-[12px] text-slate-500">可复用学习记录</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <div className="text-[12px] font-semibold text-slate-700">第一步：粘贴表现 CSV</div>
              <p className="mt-2 text-[12px] leading-5 text-slate-600">粘贴平台导出的表现数据，Wenai 会完成字段识别、质量检查和下一步决策。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={previewImport}>本地预览</ActionButton>
              <ActionButton onClick={applyImport}>导入并刷新决策</ActionButton>
            </div>
          </div>
          <textarea
            value={csvText}
            onChange={event => setCsvText(event.target.value)}
            className="mt-3 min-h-40 w-full rounded-md border border-slate-200 bg-white p-3 font-mono text-[12px] leading-5 text-slate-800 outline-none focus:border-amber-400"
          />
          <p className="mt-2 text-[12px] leading-5 text-slate-600">{importPreviewSummary?.summary || '上传或粘贴 CSV 后，会立即显示字段映射预览和导入前 QA。'}</p>
          <MappingPreviewPanel
            preview={mappingPreview}
            manualMappings={manualMappings}
            onManualMappingChange={(header, field) => setManualMappings(previous => ({ ...previous, [header]: field }))}
          />
        </div>
        <div ref={decisionRef} className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="text-[12px] font-semibold text-slate-700">本轮决策摘要</div>
          <p className="mt-2 text-[16px] font-black text-slate-950">{verdict.title} / {verdict.confidenceLabel}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{verdict.sampleMessage}</p>
          <div className="mt-3 rounded-md bg-white p-3">
            <div className="text-[12px] font-semibold text-slate-700">下一步动作</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{verdict.nextAction}</p>
            <p className="mt-2 text-[12px] text-slate-500">检查指标：点击样本、CTR、ROAS、订单量</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <DecisionCard
          run={run}
          verdict={verdict}
          onExportReport={() => { void exportDecisionReport(); }}
          onCopyTemplate={createTemplateWorkspace}
          onKuaiziCompleted={attachKuaiziAssets}
        />
      </div>
      {shareMessage && (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-[12px] font-bold text-emerald-800">
          {shareMessage}
          {shareUrl && (
            <input
              ref={shareLinkRef}
              value={shareUrl}
              readOnly
              className="mt-2 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-[12px] text-slate-800"
            />
          )}
        </div>
      )}
      <VideoProductionWorkflowPanel run={run} verdict={verdict} onChanged={onChanged} onToast={setToast} />
      <LocalLearningArchivePanel archive={localLearningArchive} subscription={subscription} onLockedSearch={() => {
        setPaywall({ title: 'Growth 档解锁完整学习档案', body: 'Growth 解锁完整跨轮搜索、变量级洞察和团队协作预留入口。', targetTier: 'Growth', trigger: 'learning_archive' });
        track('paywall_shown', { trigger: 'learning_archive' });
      }} />

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
          <div className="text-[12px] font-semibold text-amber-700">1. 数据接入</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">CSV → 字段映射 → QA</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{run.platformCsvImportPreviewSummary?.summary || '导入表现数据后生成 QA 摘要。'}</p>
        </div>
        <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4">
          <div className="text-[12px] font-semibold text-cyan-700">2. 决策规则</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{topAction?.title || validationDecisionLabel(decision?.topDecision)}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{decision?.whyThisDecision || '完成实验数据回收后生成决策理由。'}</p>
        </div>
        <div className="rounded-md border border-violet-100 bg-violet-50 p-4">
          <div className="text-[12px] font-semibold text-violet-700">3. 学习资产</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{firstLearning ? variableTypeLabel(firstLearning.variableType) : '等待第一轮学习'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{firstLearning?.reusableLearning || run.crossRunComparison?.strongestReusableLearning || '跨轮实验后沉淀变量级学习。'}</p>
        </div>
        <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-[12px] font-semibold text-emerald-700">4. 生产需求</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">导出可执行生产 Brief</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">把 Wenai 的下一轮判断交给筷子、剪辑师或其他生产工具执行，效果数据再回流。</p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="text-[12px] font-semibold text-slate-700">当前不能直接推进的原因</div>
        <p className="mt-2 text-[12px] leading-5 text-slate-700">{blockers.length > 0 ? blockers.join(' / ') : '当前没有阻塞性数据问题，可以按下一步动作推进。'}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[12px] font-semibold text-emerald-700">自增长入口：复制模板创建工作台</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{workspaceMessage}</p>
        </div>
        <ActionButton onClick={createTemplateWorkspace}>复制模板创建工作台</ActionButton>
      </div>
    </div>
  );
}

function persistPerformance(run: ListingFactoryRun, records: ContentPerformanceRecord[]) {
  const performanceRecords = [...records, ...run.performanceRecords].slice(0, 80);
  const performanceInsights = analyzePerformancePatterns({ ...run, performanceRecords }, performanceRecords);
  const regenerationPlan = buildRegenerationPlan({ ...run, performanceRecords }, performanceInsights);
  const performanceFeedbackReport = buildPerformanceFeedbackReport({ ...run, performanceRecords, performanceInsights, regenerationPlan });
  const updatedRun = {
    ...run,
    performanceRecords,
    performanceInsights,
    regenerationPlan,
    performanceFeedbackReport,
    activityLog: [{ id: createLocalActivityId('performance'), time: new Date().toISOString(), action: 'Performance feedback updated', detail: `${records.length} local records` }, ...run.activityLog].slice(0, 12),
    updatedAt: new Date().toISOString(),
  };
  saveListingFactoryRun({ ...updatedRun, deliveryPackage: buildDeliveryPackage(updatedRun) });
}

function clearPerformance(run: ListingFactoryRun, note: string) {
  const updatedRun = {
    ...run,
    performanceRecords: [],
    performanceInsights: [],
    regenerationPlan: buildRegenerationPlan({ ...run, performanceRecords: [] }, []),
    performanceFeedbackReport: buildPerformanceFeedbackReport({ ...run, performanceRecords: [], performanceInsights: [], regenerationPlan: buildRegenerationPlan({ ...run, performanceRecords: [] }, []) }),
    activityLog: [{ id: createLocalActivityId('performance-clear'), time: new Date().toISOString(), action: 'Performance import rejected', detail: note }, ...run.activityLog].slice(0, 12),
    updatedAt: new Date().toISOString(),
  };
  saveListingFactoryRun({ ...updatedRun, deliveryPackage: buildDeliveryPackage(updatedRun) });
}

function persistExperimentPlan(run: ListingFactoryRun, plan: ExperimentPlan) {
  const experimentPlans = [plan, ...run.experimentPlans.filter(item => item.id !== plan.id)].slice(0, 6);
  const updatedRun = {
    ...run,
    experimentPlans,
    activityLog: [{ id: createLocalActivityId('experiment'), time: new Date().toISOString(), action: 'Experiment plan generated', detail: plan.name }, ...run.activityLog].slice(0, 12),
    updatedAt: new Date().toISOString(),
  };
  saveListingFactoryRun({ ...updatedRun, deliveryPackage: buildDeliveryPackage(updatedRun) });
}

function PerformanceFeedbackPanel({ run, onChanged }: { run: ListingFactoryRun; onChanged: () => void }) {
  const report = run.performanceFeedbackReport || buildPerformanceFeedbackReport(run);
  const [feedback, setFeedback] = useState('粘贴或上传表现数据后，Wenai 会更新复盘明细和下一轮建议。');
  const [expanded, setExpanded] = useState(false);
  const [manual, setManual] = useState({
    platform: run.project.targetPlatforms[0] || 'TikTok',
    contentType: run.briefs[0]?.contentType || 'manual_feedback',
    hook: run.briefs[0]?.hook || run.project.productName,
    impressions: '1000',
    views: '700',
    clicks: '35',
    likes: '45',
    comments: '5',
    saves: '12',
    shares: '8',
    conversionRate: '',
    revenue: '',
    cost: '',
    notes: '',
  });
  const [csvText, setCsvText] = useState('platform,contentType,hook,impressions,views,clicks,likes,comments,saves,shares,conversionRate,revenue,cost,notes\n');

  const submitManual = () => {
    const record = normalizePerformanceRecord({ ...manual, source: 'manual_entry', id: `manual-${createLocalActivityId('record')}` }, run);
    persistPerformance(run, [record]);
    setFeedback(`已录入 1 条表现数据，CTR ${record.ctr}，互动率 ${record.engagementRate}。`);
    onChanged();
  };
  const submitCsv = () => {
    const result = importPerformanceCsv(run, csvText);
    if (result.records.length > 0) persistPerformance(run, result.records);
    setFeedback(`CSV 导入：${result.records.length} 条记录，${result.warnings.length} 个 warning，${result.errors.length} 个 error。`);
    onChanged();
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="高级数据录入" title="表现复盘明细" body="主流程已在上方决策中枢完成。这里保留手动录入、原始 CSV 导入和 Top/Bottom 明细，用于补充历史数据或核对原始记录。" />
        <div className="flex flex-wrap gap-2">
          <div className="rounded-md bg-slate-950 px-4 py-3 text-right text-white"><div className="text-[12px]">Records</div><div className="text-2xl font-black">{report.summary.totalRecords}</div></div>
          <ActionButton onClick={() => setExpanded(value => !value)}>{expanded ? '收起明细' : '展开明细'}</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {[
          ['曝光', report.summary.totalImpressions],
          ['播放', report.summary.totalViews],
          ['点击', report.summary.totalClicks],
          ['Top 平台', report.summary.topPlatform],
          ['Top 类型', report.summary.topContentType],
        ].map(([label, value]) => <div key={label} className="rounded-md border border-indigo-100 bg-white p-3"><div className="text-[12px] text-slate-500">{label}</div><div className="mt-1 text-[14px] font-bold">{value}</div></div>)}
      </div>
      {!expanded && (
        <p className="mt-4 rounded-md bg-white p-3 text-[13px] leading-6 text-slate-700">明细已折叠。优先使用上方“粘贴表现 CSV → 导入并刷新决策”的主流程；需要补充历史数据或核对原始记录时再展开。</p>
      )}
      {expanded && (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-indigo-100 bg-white p-4">
              <div className="text-[13px] font-bold">手动录入</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.keys(manual).map(key => <input key={key} value={manual[key as keyof typeof manual]} onChange={event => setManual(prev => ({ ...prev, [key]: event.target.value }))} placeholder={key} className="rounded-md border border-slate-200 px-3 py-2 text-[13px]" />)}
              </div>
              <div className="mt-3"><ActionButton onClick={submitManual}>添加表现记录</ActionButton></div>
            </div>
            <div className="rounded-md border border-indigo-100 bg-white p-4">
              <div className="text-[13px] font-bold">CSV 粘贴导入</div>
              <textarea value={csvText} onChange={event => setCsvText(event.target.value)} rows={7} className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-[12px]" />
              <div className="mt-3 flex flex-wrap gap-2"><ActionButton onClick={submitCsv}>导入 CSV</ActionButton><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-表现反馈`, 'md'), report.markdown, 'text/markdown;charset=utf-8')}>下载反馈报告</ActionButton></div>
            </div>
          </div>
          <p className="mt-4 rounded-md bg-white p-3 text-[13px] leading-6 text-indigo-950">{feedback}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-indigo-100 bg-white p-4"><div className="font-bold">Top 3</div>{(report.topPerformers.length ? report.topPerformers : []).map(item => <p key={item.id} className="mt-2 text-[12px]">{item.platform} / {item.contentType} / CTR {item.ctr}</p>)}{report.topPerformers.length === 0 && <p className="mt-2 text-[12px]">导入表现数据后生成。</p>}</div>
            <div className="rounded-md border border-indigo-100 bg-white p-4"><div className="font-bold">Bottom 3</div>{(report.weakPerformers.length ? report.weakPerformers : []).map(item => <p key={item.id} className="mt-2 text-[12px]">{item.platform} / {item.contentType} / CTR {item.ctr}</p>)}{report.weakPerformers.length === 0 && <p className="mt-2 text-[12px]">导入表现数据后识别。</p>}</div>
            <div className="rounded-md border border-indigo-100 bg-white p-4"><div className="font-bold">下一轮建议</div>{report.nextRoundPlan.nextBriefAngles.slice(0, 3).map(item => <p key={item} className="mt-2 text-[12px]">{item}</p>)}</div>
          </div>
        </>
      )}
    </div>
  );
}

function DeliveryDownloads({ run }: { run: ListingFactoryRun }) {
  const pkg = run.deliveryPackage || buildDeliveryPackage(run);
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <SectionTitle eyebrow="决策资产导出" title="优先导出可传播的决策资产" body="默认只保留老板、客户、投手会真正转发的文件；完整交付包用于团队复盘、记录归档和二次加工。" />
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        <div className="rounded-md border border-emerald-100 bg-white p-3">
          <div className="text-[12px] font-bold text-slate-900">脱敏决策报告</div>
          <p className="mt-1 min-h-10 text-[12px] leading-5 text-slate-600">给老板、客户或团队看：本轮学到了什么，下一轮怎么做。</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-脱敏决策报告`, 'md'), buildReadableDecisionReport(run), 'text/markdown;charset=utf-8')}>导出</ActionButton></div>
        </div>
        <div className="rounded-md border border-emerald-100 bg-white p-3">
          <div className="text-[12px] font-bold text-slate-900">生产需求 Brief</div>
          <p className="mt-1 min-h-10 text-[12px] leading-5 text-slate-600">把决策转成外部制作工具可读的生产任务，不调用真实 API。</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-生产需求Brief`, 'md'), buildProductionDemandBrief(run), 'text/markdown;charset=utf-8')}>导出</ActionButton></div>
        </div>
        <div className="rounded-md border border-emerald-100 bg-white p-3">
          <div className="text-[12px] font-bold text-slate-900">CSV 映射模板</div>
          <p className="mt-1 min-h-10 text-[12px] leading-5 text-slate-600">给新项目复用平台字段映射，降低下一次导入成本。</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-CSV映射模板`, 'csv'), buildMappingTemplateCsv(run, run.platformCsvMappingPreview), 'text/csv;charset=utf-8')}>下载</ActionButton></div>
        </div>
        <div className="rounded-md border border-emerald-100 bg-white p-3">
          <div className="text-[12px] font-bold text-slate-900">导入 QA 摘要</div>
          <p className="mt-1 min-h-10 text-[12px] leading-5 text-slate-600">说明哪些字段可用、哪些需要手动确认，避免脏数据直接进入复盘。</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-导入前QA摘要`, 'md'), pkg.platformCsvImportPreviewMarkdown || pkg.platformImportQualityMarkdown, 'text/markdown;charset=utf-8')}>导出</ActionButton></div>
        </div>
        <div className="rounded-md border border-emerald-100 bg-white p-3">
          <div className="text-[12px] font-bold text-slate-900">学习档案</div>
          <p className="mt-1 min-h-10 text-[12px] leading-5 text-slate-600">沉淀跨轮内容变量结论，形成商家自己的私有决策资产。</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-商家增长学习档案`, 'md'), pkg.merchantLearningArchiveMarkdown, 'text/markdown;charset=utf-8')}>导出</ActionButton></div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-md border border-emerald-100 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-[12px] leading-5 text-slate-600">完整交付包仍保留 POC、实验、追踪链、平台契约、导入演练和回归快照；默认折叠，避免把核心决策路径淹没在工具文件里。</p>
        <button type="button" onClick={() => setExpanded(value => !value)} className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-900">
          {expanded ? '收起完整交付包' : '展开完整交付包'}
        </button>
      </div>
      {expanded && <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(run.project.productName, 'md'), pkg.markdown || exportMarkdownReport(run.project, run.report, run.briefs), 'text/markdown;charset=utf-8')}>下载试跑报告 MD</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-brief-简报`, 'csv'), pkg.briefCsv || exportBriefsCsv(run.briefs), 'text/csv;charset=utf-8')}>下载简报 CSV</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-表现反馈`, 'md'), pkg.performanceFeedbackMarkdown, 'text/markdown;charset=utf-8')}>下载表现复盘 MD</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-表现数据`, 'csv'), pkg.performanceRecordsCsv || buildPerformanceRecordsCsv(run.performanceRecords), 'text/csv;charset=utf-8')}>下载表现 CSV</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-再生成计划`, 'md'), pkg.regenerationPlanMarkdown || buildRegenerationPlanMarkdown(run.regenerationPlan), 'text/markdown;charset=utf-8')}>下载下一轮计划</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验计划`, 'md'), pkg.experimentPlanMarkdown, 'text/markdown;charset=utf-8')}>下载实验计划</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验模板`, 'csv'), pkg.experimentCsvTemplate, 'text/csv;charset=utf-8')}>下载实验模板 CSV</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-追踪命名规则`, 'md'), pkg.trackingPlanMarkdown, 'text/markdown;charset=utf-8')}>下载命名规则</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验置信度`, 'md'), pkg.experimentConfidenceMarkdown, 'text/markdown;charset=utf-8')}>下载实验置信度</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验记忆`, 'md'), pkg.experimentMemoryMarkdown, 'text/markdown;charset=utf-8')}>下载实验记忆</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-下一轮实验优先队列`, 'md'), pkg.experimentPriorityQueueMarkdown, 'text/markdown;charset=utf-8')}>下载优先队列</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-内容增长学习地图`, 'md'), pkg.experimentLearningGapMapMarkdown, 'text/markdown;charset=utf-8')}>下载学习缺口</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-下一轮实验路线图`, 'md'), pkg.experimentSequencingPlanMarkdown, 'text/markdown;charset=utf-8')}>下载实验路径</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验验证策略`, 'md'), pkg.experimentValidationPolicyMarkdown, 'text/markdown;charset=utf-8')}>下载验证策略</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验决策摘要`, 'md'), pkg.experimentDecisionSummaryMarkdown, 'text/markdown;charset=utf-8')}>下载决策摘要</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验执行手册`, 'md'), pkg.experimentExecutionPlaybookMarkdown, 'text/markdown;charset=utf-8')}>下载执行手册</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验节奏安排`, 'md'), pkg.experimentCadencePlanMarkdown, 'text/markdown;charset=utf-8')}>下载节奏安排</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-操作检查表`, 'md'), pkg.experimentOperatorChecklistMarkdown, 'text/markdown;charset=utf-8')}>下载操作检查表</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-本地实验操作台`, 'md'), pkg.experimentWorkbenchMarkdown, 'text/markdown;charset=utf-8')}>下载本地实验操作台</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-跨运行学习对比`, 'md'), pkg.crossRunComparisonMarkdown, 'text/markdown;charset=utf-8')}>下载跨运行学习对比</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-商家增长学习档案`, 'md'), pkg.merchantLearningArchiveMarkdown, 'text/markdown;charset=utf-8')}>下载学习档案</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-内容实验追踪链`, 'md'), pkg.contentExperimentTraceMarkdown, 'text/markdown;charset=utf-8')}>下载内容实验追踪链</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-可追溯证据链摘要`, 'md'), pkg.traceabilitySummaryMarkdown, 'text/markdown;charset=utf-8')}>下载证据链摘要</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台数据契约`, 'md'), pkg.platformDataContractMarkdown, 'text/markdown;charset=utf-8')}>下载平台数据契约</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台数据导入模板`, 'csv'), pkg.platformImportTemplateCsv, 'text/csv;charset=utf-8')}>下载平台数据模板</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-导入质量检查`, 'md'), pkg.platformImportQualityMarkdown, 'text/markdown;charset=utf-8')}>下载导入质量检查</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-数据接入准备度`, 'md'), pkg.platformDataReadinessMarkdown, 'text/markdown;charset=utf-8')}>下载接入准备度</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台字段适配`, 'md'), pkg.platformCsvMappingPreviewMarkdown, 'text/markdown;charset=utf-8')}>下载字段适配预览</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-导入前QA摘要`, 'md'), pkg.platformCsvImportPreviewMarkdown, 'text/markdown;charset=utf-8')}>下载导入前 QA</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-字段映射预设`, 'json'), pkg.platformCsvMappingPresetJson, 'application/json;charset=utf-8')}>下载映射预设</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台导出版本库`, 'md'), pkg.platformExportVersionRegistryMarkdown, 'text/markdown;charset=utf-8')}>下载版本库</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-CSV导入演练`, 'md'), pkg.platformCsvRehearsalMarkdown, 'text/markdown;charset=utf-8')}>下载 CSV 演练</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-字段回归快照`, 'md'), pkg.platformCsvRegressionSnapshotMarkdown, 'text/markdown;charset=utf-8')}>下载回归快照</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-工厂运营评估`, 'md'), pkg.operatingReviewMarkdown, 'text/markdown;charset=utf-8')}>下载工厂运营评估</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-商家上下文记忆卡`, 'md'), pkg.merchantContextMarkdown, 'text/markdown;charset=utf-8')}>下载上下文卡</ActionButton>
        <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(run.project.productName, 'json'), pkg.projectJson || exportListingFactoryRun(run), 'application/json;charset=utf-8')}>下载项目 JSON</ActionButton>
      </div>}
    </div>
  );
}

function WorkbenchActionCard({ action }: { action: ExperimentWorkbenchAction }) {
  return (
    <article className="rounded-md border border-cyan-100 bg-cyan-50 p-3">
      <div className="text-[12px] font-semibold text-cyan-700">{workbenchPriorityLabel(action.priority)} / {workbenchStatusLabel(action.status)}</div>
      <h3 className="mt-1 text-[13px] font-bold text-slate-900">{action.title}</h3>
      <p className="mt-2 text-[12px] leading-5 text-slate-700">{action.description}</p>
      <p className="mt-2 text-[12px] text-slate-500">置信等级 {confidenceLevelLabel(action.confidenceLevel)} / 待处理检查项 {action.openChecklistCount}</p>
      <p className="mt-1 text-[12px] text-slate-500">下一步检查指标：{action.nextCheckMetric || '等待补充数据'}</p>
    </article>
  );
}

function ContentExperimentTracePanel({ run }: { run: ListingFactoryRun }) {
  const graph = run.contentExperimentTraceGraph || buildContentExperimentTraceGraph(run);
  const summary = run.traceabilitySummary || buildTraceabilitySummary(run, graph);
  const lineage = graph.assetLineageRecords[0];
  const link = graph.learningEvidenceLinks[0];
  const metricWindow = graph.metricWindows[0];
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="内容实验追踪链" title="内容实验追踪链" body="把 Brief、脚本、分镜、素材、批量变体、实验单元、指标窗口和学习记录连成可追溯证据链，方便团队复盘每一次内容动作。" />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-内容实验追踪链`, 'md'), buildContentExperimentTraceMarkdown(graph), 'text/markdown;charset=utf-8')}>导出追踪链</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-可追溯证据链摘要`, 'md'), buildTraceabilitySummaryMarkdown(summary), 'text/markdown;charset=utf-8')}>导出证据链摘要</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">来源节点</div><div className="mt-1 text-[18px] font-black">{graph.nodes.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">关联证据</div><div className="mt-1 text-[18px] font-black">{graph.edges.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">证据强度</div><div className="mt-1 text-[13px] font-bold">{summary.evidenceStrength}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">未完全关联</div><div className="mt-1 text-[18px] font-black">{summary.unlinkedArtifactCount}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-violet-700">这条结论来自哪里</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{summary.strongestTraceableLearning}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">实验单元：{summary.relatedExperimentCell}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{link?.whatThisSupports || '当前还没有可追溯学习来源。'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-violet-700">素材来源记录</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{lineage ? `${lineage.assetId} / ${lineage.assetType}` : '未完全关联的素材'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{lineage?.performanceSignal || '当前素材尚未完整接入实验单元。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{lineage?.riskNote || '未完全关联的素材会保留为来源记录。'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-violet-700">学习证据来源</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{summary.metricWindowSummary}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{metricWindow?.windowNote || '当前暂无指标窗口。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">目前还不能证明什么：{link?.whatThisDoesNotProve || summary.limitationNote}</p>
        </div>
      </div>
    </div>
  );
}

function PlatformDataContractPanel({ run }: { run: ListingFactoryRun }) {
  const contract = run.platformDataContract || buildPlatformDataContract();
  const template = run.platformImportTemplate || buildPlatformImportTemplate(contract);
  const rows = (run.performanceRecords || []).map(record => ({
    recordId: record.id,
    channel: record.platform,
    campaignName: run.project.productName,
    contentName: record.hook,
    trackingCode: record.trackingCode || '',
    experimentCellId: record.cellId || '',
    date: record.publishDate || run.updatedAt.slice(0, 10),
    impressions: record.impressions,
    clicks: record.clicks,
    spend: record.cost || 0,
    orders: record.conversionRate ? Math.round(record.conversionRate * record.clicks) : 0,
    revenue: record.revenue || 0,
    likes: record.likes,
    comments: record.comments,
    shares: record.shares,
    saves: record.saves,
    productName: run.project.productName,
    skuId: run.project.id,
    note: record.notes || '',
  }));
  const qualityReport = run.platformImportQualityReport || buildPlatformImportQualityReport(rows, contract);
  const normalizedRecords = run.normalizedPlatformMetricRecords || normalizePlatformMetricRecords(rows);
  const readiness = run.platformDataReadinessSummary || buildPlatformDataReadinessSummary(contract, qualityReport, normalizedRecords);
  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="平台数据契约" title="平台数据契约与导入 QA" body="统一不同平台的数据字段、CSV 模板、质量检查和指标口径，让每一次复盘都能使用同一套可信标准。" />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台数据导入模板`, 'csv'), template.csv, 'text/csv;charset=utf-8')}>下载导入模板</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台数据契约`, 'md'), buildPlatformDataContractMarkdown(contract), 'text/markdown;charset=utf-8')}>导出数据契约</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">必填字段</div><div className="mt-1 text-[18px] font-black">{contract.requiredFields.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">可选字段</div><div className="mt-1 text-[18px] font-black">{contract.optionalFields.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">错误 / 警告</div><div className="mt-1 text-[13px] font-bold">{qualityReport.errorCount} / {qualityReport.warningCount}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">是否可复盘</div><div className="mt-1 text-[13px] font-bold">{readiness.readyForExperimentReview ? '可以进入复盘' : '暂不建议'}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-teal-700">数据导入模板</div>
          <p className="mt-2 break-words text-[12px] leading-5 text-slate-700">{template.header.join(', ')}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">建议优先保留追踪码、实验单元、曝光、点击、花费、订单和收入字段。</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-teal-700">导入质量检查</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{qualityReport.summary}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{qualityReport.errors[0]?.message || qualityReport.warnings[0]?.message || '当前没有阻塞性导入问题。'}</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-导入质量检查`, 'md'), buildPlatformImportQualityMarkdown(qualityReport), 'text/markdown;charset=utf-8')}>导出质量检查</ActionButton></div>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-teal-700">数据接入准备度</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">已归一化 {readiness.normalizedRecordCount} 行</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{readiness.summary}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">不能直接下结论的原因：{readiness.cannotConcludeReasons[0]}</p>
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-数据接入准备度`, 'md'), buildPlatformDataReadinessMarkdown(readiness), 'text/markdown;charset=utf-8')}>导出准备度</ActionButton></div>
        </div>
      </div>
    </div>
  );
}

function PlatformCsvAdapterPanel({ run }: { run: ListingFactoryRun }) {
  const rows = (run.performanceRecords || []).map(record => ({
    recordId: record.id,
    channel: record.platform,
    campaignName: run.project.productName,
    contentName: record.hook,
    trackingCode: record.trackingCode || '',
    experimentCellId: record.cellId || '',
    date: record.publishDate || run.updatedAt.slice(0, 10),
    impressions: record.impressions,
    clicks: record.clicks,
    spend: record.cost || 0,
    orders: record.conversionRate ? Math.round(record.conversionRate * record.clicks) : 0,
    revenue: record.revenue || 0,
    likes: record.likes,
    comments: record.comments,
    shares: record.shares,
    saves: record.saves,
    productName: run.project.productName,
    skuId: run.project.id,
    note: record.notes || '',
  }));
  const presets = run.platformCsvAdapterPresets || buildPlatformCsvAdapterPresets();
  const preview = run.platformCsvMappingPreview || buildPlatformCsvMappingPreview(rows.length > 0 ? rows : ['Campaign Name', 'Ad name', 'Impressions', 'Clicks', 'Cost', 'Orders', 'Sales'], undefined, run.platformDataContract, presets);
  const summary = run.platformCsvImportPreviewSummary || buildPlatformCsvImportPreviewSummary(rows, preview.detectedChannel, run.platformDataContract);
  const presetExport = run.platformCsvMappingPresetExport || exportPlatformCsvMappingPreset(preview);
  return (
    <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="平台字段适配" title="平台 CSV 字段适配与导入预览" body="把不同平台导出的 CSV 表头映射到统一字段，提前标出缺失字段、未识别字段和字段冲突。" />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台字段适配`, 'md'), buildPlatformCsvMappingPreviewMarkdown(preview), 'text/markdown;charset=utf-8')}>导出映射预览</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-导入前QA摘要`, 'md'), buildPlatformCsvImportPreviewMarkdown(summary), 'text/markdown;charset=utf-8')}>导出导入前 QA</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-字段映射预设`, 'json'), JSON.stringify(presetExport, null, 2), 'application/json;charset=utf-8')}>下载映射预设</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">检测平台</div><div className="mt-1 text-[13px] font-bold">{preview.detectedChannel}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">已识别字段</div><div className="mt-1 text-[18px] font-black">{preview.mappedFields.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">缺失必填</div><div className="mt-1 text-[18px] font-black">{preview.missingRequiredFields.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">未识别字段</div><div className="mt-1 text-[18px] font-black">{preview.unknownFields.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">字段冲突</div><div className="mt-1 text-[18px] font-black">{preview.conflictFields.length}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-fuchsia-700">导入前映射预览</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{preview.estimatedImportReady ? '预计可以导入' : '需要先修复字段映射'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{preview.mappedFields.slice(0, 4).map(item => `${item.originalHeader}→${item.normalizedField}`).join(' / ') || '当前没有已识别字段。'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-fuchsia-700">缺失字段 / 未识别字段 / 冲突字段</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">缺失：{preview.missingRequiredFields.join(' / ') || '无'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">未识别：{preview.unknownFields.slice(0, 3).join(' / ') || '无'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">冲突：{preview.conflictFields.join(' / ') || '无'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-fuchsia-700">导入前 QA 摘要</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{summary.estimatedImportReady ? '可以进入 P8 校验与归一化' : '暂不建议导入'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{summary.summary}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">建议修复：{summary.recommendedFixes[0]}</p>
        </div>
      </div>
    </div>
  );
}

function PlatformCsvRehearsalPanel({ run }: { run: ListingFactoryRun }) {
  const registry = run.platformExportVersionRegistry || buildPlatformExportVersionRegistry();
  const rehearsal = run.platformCsvRehearsalSummary || buildPlatformCsvRehearsalSummary(undefined, registry, run.platformDataContract);
  const snapshot = run.platformCsvRegressionSnapshot || buildPlatformCsvRegressionSnapshot(rehearsal);
  const firstResult = rehearsal.results[0];
  const mostMissing = rehearsal.fieldsMostLikelyToNeedManualMapping.slice(0, 4);
  const mostUnknown = rehearsal.results.flatMap(result => result.mappingPreview.unknownFields).slice(0, 4);
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="平台导出版本库" title="CSV 导入演练与字段回归快照" body="用适配预设和样例 CSV 演练导入流程，检查版本识别、字段映射、质量检查与指标归一化是否稳定。" />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-平台导出版本库`, 'md'), buildPlatformExportVersionRegistryMarkdown(registry), 'text/markdown;charset=utf-8')}>导出版本库</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-CSV导入演练`, 'md'), buildPlatformCsvRehearsalMarkdown(rehearsal), 'text/markdown;charset=utf-8')}>导出演练报告</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-字段回归快照`, 'md'), buildPlatformCsvRegressionSnapshotMarkdown(snapshot), 'text/markdown;charset=utf-8')}>导出回归快照</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">检测版本</div><div className="mt-1 text-[13px] font-bold">{firstResult ? `${firstResult.platform} / ${firstResult.versionId}` : '需要手动确认'}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">演练通过</div><div className="mt-1 text-[18px] font-black">{rehearsal.passedFixtures}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">需要修复</div><div className="mt-1 text-[18px] font-black">{rehearsal.failedFixtures}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">警告 / 错误</div><div className="mt-1 text-[13px] font-bold">{rehearsal.warningCount} / {rehearsal.errorCount}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">是否可导入</div><div className="mt-1 text-[13px] font-bold">{snapshot.snapshots.every(item => item.importReady) ? '可导入' : '需先修复'}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-sky-700">CSV 导入演练</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{rehearsal.summary}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">本地适配预设，不代表平台官方接口。</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-sky-700">可能缺失的字段</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{mostMissing.join(' / ') || '暂无'}</p>
          <div className="mt-3 text-[12px] font-semibold text-sky-700">可能未识别字段</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{mostUnknown.join(' / ') || '暂无'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-sky-700">字段回归快照</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{snapshot.snapshots.length} 条确定性快照</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{snapshot.localOnlyNote}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">用于确认导入模板是否足够稳定，避免正式复盘前才发现字段缺失。</p>
        </div>
      </div>
    </div>
  );
}

function MerchantContextPanel({ run }: { run: ListingFactoryRun }) {
  const card = run.merchantContextCard || buildMerchantContextCard(run);
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="商家上下文记忆卡" title="商家上下文记忆卡" body="把品牌语气、受众摘要、可复用卖点、素材记忆和表现记忆沉淀成本地默认值，避免下一轮从冷启动开始。" />
        <div className="rounded-md bg-slate-950 px-4 py-3 text-right text-white">
          <div className="text-[12px]">可复用卖点</div>
          <div className="text-2xl font-black">{card.reusableSellingPoints.length}</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">类目</div><div className="mt-1 text-[13px] font-bold">{card.category}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">目标平台</div><div className="mt-1 text-[13px] font-bold">{card.targetPlatforms.join(' / ')}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">素材数</div><div className="mt-1 text-[13px] font-bold">{card.assetMemory.totalAssets}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">胜出记忆</div><div className="mt-1 text-[13px] font-bold">{card.performanceMemory.winningPatterns.length}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-amber-700">品牌语气</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{card.brandVoice}</p>
          <div className="mt-3 text-[12px] font-semibold text-amber-700">目标人群</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{card.audienceSummary}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-amber-700">可复用默认项</div>
          {card.reusableSellingPoints.slice(0, 4).map(item => <p key={item} className="mt-2 text-[12px] leading-5 text-slate-700">{item}</p>)}
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-商家上下文记忆卡`, 'md'), buildMerchantContextMarkdown(card), 'text/markdown;charset=utf-8')}>导出上下文卡</ActionButton></div>
        </div>
      </div>
    </div>
  );
}

function OperatingReviewPanel({ run }: { run: ListingFactoryRun }) {
  const review = run.operatingReview || buildFactoryOperatingReview(run);
  const shipped = review.capabilitySummary.filter(item => item.status === 'shipped').length;
  const partial = review.capabilitySummary.filter(item => item.status === 'partial').length;
  const missing = review.capabilitySummary.filter(item => item.status === 'missing').length;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="工厂运营评估" title="产品状态与下一步开发指挥层" body="把当前本地工厂链路翻译成能力成熟度、缺口和下一阶段开发计划；不依赖真实 API key 或真实用户。" />
        <div className="rounded-md bg-slate-950 px-4 py-3 text-right text-white">
          <div className="text-[12px]">成熟度</div>
          <div className="text-2xl font-black">{review.maturityScore}</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">形态</div><div className="mt-1 text-[13px] font-bold">{review.productShape}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">已完成</div><div className="mt-1 text-[18px] font-black">{shipped}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">部分完成</div><div className="mt-1 text-[18px] font-black">{partial}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">待补齐</div><div className="mt-1 text-[18px] font-black">{missing}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-700">核心不足</div>
          {review.gaps.slice(0, 4).map(item => <p key={item} className="mt-2 text-[12px] leading-5 text-slate-600">{item}</p>)}
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-slate-700">下一步开发计划</div>
          {review.nextDevelopmentPlan.slice(0, 3).map(item => <p key={item.id} className="mt-2 text-[12px] leading-5 text-slate-600">{item.id}: {item.title}</p>)}
          <div className="mt-3"><ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-工厂运营评估`, 'md'), buildFactoryOperatingReviewMarkdown(review), 'text/markdown;charset=utf-8')}>导出评估</ActionButton></div>
        </div>
      </div>
    </div>
  );
}

function ExperimentOrchestrationPanel({ run, onChanged }: { run: ListingFactoryRun; onChanged: () => void }) {
  const plan = run.experimentPlans[0] || buildExperimentPlanFromInsights(run, run.performanceInsights);
  const report = run.experimentReports[0] || analyzeExperimentResults(plan, run.performanceRecords || []);
  const confidence = report.confidenceSummary;
  const leadCell = report.cellConfidence[0];
  const memorySummary = run.experimentMemorySummary || buildExperimentMemorySummary(run);
  const priorityQueue = run.experimentPriorityQueue || buildExperimentPriorityQueue({ ...run, experimentMemorySummary: memorySummary }, memorySummary, run.merchantContextCard);
  const gapMap = run.experimentLearningGapMap || buildExperimentLearningGapMap({ ...run, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue }, memorySummary, priorityQueue, run.merchantContextCard);
  const sequencingPlan = run.experimentSequencingPlan || buildExperimentSequencingPlan({ ...run, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap }, gapMap, priorityQueue, memorySummary, run.merchantContextCard);
  const validationPolicy = run.experimentValidationPolicy || buildExperimentValidationPolicy({ ...run, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, report.confidenceSummary, memorySummary, priorityQueue, gapMap, sequencingPlan, run.merchantContextCard);
  const decisionSummary = run.experimentDecisionSummary || buildExperimentDecisionSummary({ ...run, experimentValidationPolicy: validationPolicy, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, validationPolicy);
  const executionPlaybook = run.experimentExecutionPlaybook || buildExperimentExecutionPlaybook({ ...run, experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, validationPolicy, decisionSummary, sequencingPlan, priorityQueue, gapMap, report.confidenceSummary, run.merchantContextCard);
  const cadencePlan = run.experimentCadencePlan || buildExperimentCadencePlan({ ...run, experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary, experimentSequencingPlan: sequencingPlan }, validationPolicy, decisionSummary, sequencingPlan);
  const operatorChecklist = run.experimentOperatorChecklist || buildExperimentOperatorChecklist({ ...run, experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary }, validationPolicy, decisionSummary);
  const topCandidate = priorityQueue.candidates[0];
  const duplicateWarning = priorityQueue.candidates.find(item => item.duplicateRisk === 'high');
  const knownCount = gapMap.gaps.filter(item => item.status === 'learned').length;
  const directionalCount = gapMap.gaps.filter(item => item.status === 'directional').length;
  const unknownCount = gapMap.gaps.filter(item => item.status === 'unknown').length;
  const topValidationRule = validationPolicy.rules[0];
  const generatePlan = () => {
    const nextPlan = buildExperimentPlanFromInsights(run, run.performanceInsights, {
      goal: 'Use local performance feedback to plan the next controlled content test.',
      targetPlatforms: run.regenerationPlan.nextPlatforms,
      maxCells: 3,
      primaryMetric: 'ctr',
    });
    persistExperimentPlan(run, nextPlan);
    onChanged();
  };
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="实验编排" title="下一轮实验编排" body="把胜出模式和弱势模式转成单变量 A/B 测试计划、追踪命名规则和数据回收模板。" />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={generatePlan}>从表现洞察生成实验计划</ActionButton>
          <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验计划`, 'md'), buildExperimentPlanMarkdown(plan), 'text/markdown;charset=utf-8')}>导出实验计划</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">目标</div><div className="mt-1 text-[13px] font-bold">{plan.goal}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">实验单元</div><div className="mt-1 text-[18px] font-black">{plan.experimentCells.length}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">主指标</div><div className="mt-1 text-[13px] font-bold">{plan.successMetrics.find(item => item.priority === 'primary')?.name}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">置信等级</div><div className="mt-1 text-[13px] font-bold">{confidenceLevelLabel(confidence.confidenceLevel)}</div></div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="text-[12px] font-semibold text-cyan-700">实验假设</div>
        <p className="mt-2 text-[13px] leading-6 text-slate-700">{plan.hypothesis}</p>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">样本门槛</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{confidence.sampleGuardrail}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">当前结论</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{conclusionLabel(confidence.conclusion)}</p>
          <p className="mt-2 text-[12px] text-slate-600">{confidence.briefExplanation}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">建议动作</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{actionLabel(confidence.recommendedAction)}</p>
          <p className="mt-2 text-[12px] text-slate-600">{report.nextAction}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">领先单元</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{leadCell?.cellId || '等待结果'}</p>
          <p className="mt-2 text-[12px] text-slate-600">{leadCell?.explanation || '导入 control / test 数据后生成。'}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {plan.experimentCells.slice(0, 4).map(cell => (
          <article key={cell.id} className="rounded-md border border-cyan-100 bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">{variableTypeLabel(cell.variableType)}</div>
            <h3 className="mt-1 text-[14px] font-bold">{cell.name}</h3>
            <p className="mt-2 text-[12px] text-slate-600">Control: {cell.controlValue}</p>
            <p className="mt-1 text-[12px] text-slate-600">Test: {cell.testValue}</p>
            <p className="mt-2 text-[12px] text-slate-500">{confidenceLevelLabel(report.cellConfidence.find(item => item.cellId === cell.id)?.confidenceLevel)} / {conclusionLabel(report.cellConfidence.find(item => item.cellId === cell.id)?.conclusion)}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">实验记忆</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{memorySummary.topReusableLearning || '还没有可复用胜出模式，先完成一轮带样本门槛的实验复盘。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{memorySummary.topAvoidLearning || memorySummary.topWatchlistLearning || '当前没有高风险重复提醒。'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">下一轮实验优先队列</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{topCandidate ? `${topCandidate.candidateName} / ${priorityBandLabel(topCandidate.priorityBand)} / ${topCandidate.priorityScore}` : '等待生成'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{topCandidate?.reason || '生成实验计划后，这里会按记忆、重复风险和上下文相关性排序。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-rose-600">{duplicateWarning ? `重复测试风险高：${duplicateWarning.candidateName}` : '当前队列没有高重复风险项。'}</p>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="text-[12px] font-semibold text-cyan-700">下一轮 Top 3 测试</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {priorityQueue.candidates.slice(0, 3).map(item => (
            <article key={item.id} className="rounded-md border border-cyan-100 bg-cyan-50 p-3">
              <div className="text-[12px] font-semibold text-cyan-700">{priorityBandLabel(item.priorityBand)} / {item.priorityScore}</div>
              <h3 className="mt-1 text-[13px] font-bold text-slate-900">{item.candidateName}</h3>
              <p className="mt-2 text-[12px] text-slate-600">重复测试风险 {duplicateRiskLabel(item.duplicateRisk)}</p>
              <p className="mt-2 text-[12px] leading-5 text-slate-700">{item.reason}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">内容增长学习地图</div>
          <p className="mt-2 text-[12px] text-slate-700">已学到 {knownCount} / 方向性 {directionalCount} / 未知 {unknownCount}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{gapMap.gaps.find(item => item.status === 'unknown')?.unresolvedQuestion || gapMap.gaps.find(item => item.status === 'directional')?.unresolvedQuestion || '当前没有明显未解问题。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{gapMap.gaps.find(item => item.status === 'inconclusive')?.recommendedNextMove || gapMap.gaps.find(item => item.status === 'avoid_or_rework')?.recommendedNextMove || '当前没有需要清洗的脏实验。'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">下一轮实验路线图</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{sequencingPlan.steps[0] ? `第 1 步 / ${variableTypeLabel(sequencingPlan.steps[0].primaryVariableType)} / ${priorityBandLabel(sequencingPlan.steps[0].priorityBand)}` : '等待生成'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{sequencingPlan.topUnresolvedQuestion || '当前没有待解实验问题。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{sequencingPlan.steps[0]?.whyNow || '生成实验计划后，这里会给出先测什么、后测什么。'}</p>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="text-[12px] font-semibold text-cyan-700">下一轮 Top 3 路线步骤</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {sequencingPlan.steps.slice(0, 3).map(step => (
            <article key={`${step.stepNumber}-${step.primaryVariableType}`} className="rounded-md border border-cyan-100 bg-cyan-50 p-3">
              <div className="text-[12px] font-semibold text-cyan-700">第 {step.stepNumber} 步 / {priorityBandLabel(step.priorityBand)}</div>
              <h3 className="mt-1 text-[13px] font-bold text-slate-900">{variableTypeLabel(step.primaryVariableType)}</h3>
              <p className="mt-2 text-[12px] leading-5 text-slate-700">{step.whyNow}</p>
              <p className="mt-2 text-[12px] text-slate-500">重复测试风险 {duplicateRiskLabel(step.duplicateRisk)}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">实验决策规则</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{validationDecisionLabel(decisionSummary.topDecision)} / 风险 {rolloutRiskLabel(decisionSummary.riskLevel)}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{decisionSummary.whyThisDecision}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">下一步检查指标：{decisionSummary.nextCheckMetric}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">停止条件：{decisionSummary.stopCondition}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">放大 / 停止建议</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{topValidationRule?.userFacingExplanation || '当前还没有足够样本生成实验决策建议。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{topValidationRule ? `${variableTypeLabel(topValidationRule.targetVariableType)} / ${validationDecisionLabel(topValidationRule.decision)} / 样本${topValidationRule.sampleSufficient ? '已达标' : '未达标'}` : '先导入 control / test 数据后再看。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-rose-600">{decisionSummary.stopNow[0] || decisionSummary.mustValidate[0] || '当前没有需要立即停止的项目。'}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">实验执行手册</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{validationDecisionLabel(executionPlaybook.currentDecision)} / {variableTypeLabel(executionPlaybook.primaryVariableType)}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{executionPlaybook.experimentObjective}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{executionPlaybook.productionTasks[0]?.title || '等待生成执行任务。'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">实验节奏安排</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{cadencePlan.monitoringCadence}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{cadencePlan.nextCheckpoint}</p>
          <p className="mt-2 text-[12px] leading-5 text-rose-600">{cadencePlan.stopCondition}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">操作检查表</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">必做 {operatorChecklist.requiredCount} 项</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{operatorChecklist.sections[0]?.items[0]?.title || '等待生成检查项。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{operatorChecklist.sections.map(section => section.title).slice(0, 3).join(' / ')}</p>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="text-[12px] font-semibold text-cyan-700">下一轮 Top 3 执行任务</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {executionPlaybook.productionTasks.slice(0, 3).map(task => (
            <article key={task.id} className="rounded-md border border-cyan-100 bg-cyan-50 p-3">
              <div className="text-[12px] font-semibold text-cyan-700">{task.group}</div>
              <h3 className="mt-1 text-[13px] font-bold text-slate-900">{task.title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-slate-700">{task.description}</p>
              <p className="mt-2 text-[12px] text-slate-500">{task.relatedMetric ? `相关指标 ${task.relatedMetric}` : task.userFacingNote}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">追踪命名规则</div>
          <p className="mt-2 break-words text-[12px] text-slate-700">{plan.trackingPlan.namingConvention}</p>
          <p className="mt-2 text-[12px] text-slate-500">{plan.trackingPlan.trackingCodes[0] || '生成分配任务后会出现 tracking code'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">数据回收 CSV</div>
          <p className="mt-2 text-[12px] text-slate-700">{buildExperimentCsvTemplate(plan).split('\n')[0]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-实验结果回收模板`, 'csv'), buildManualResultEntryTemplate(plan), 'text/csv;charset=utf-8')}>导出回收模板</ActionButton>
            <ActionButton onClick={() => downloadTextFile(safeDownloadFilename(`${run.project.productName}-追踪命名规则`, 'md'), buildTrackingPlanMarkdown(plan), 'text/markdown;charset=utf-8')}>导出命名规则</ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocalExperimentWorkbenchPanel({ run, onChanged }: { run: ListingFactoryRun; onChanged: () => void }) {
  const snapshot = loadLatestListingFactorySnapshot();
  const historySummary = snapshot.runHistorySummary || run.runHistorySummary;
  const archiveRecords = snapshot.archiveRecords || loadExperimentArchiveRecords();
  const board = run.experimentWorkbenchBoard || buildExperimentWorkbenchBoard(run, historySummary, archiveRecords);
  const crossRunComparison = run.crossRunComparison || buildCrossRunComparisonResult(run, historySummary, archiveRecords);
  const merchantLearningArchive = run.merchantLearningArchive || buildMerchantLearningArchive(run, historySummary, archiveRecords);
  const hookSearch = searchMerchantLearningArchive(merchantLearningArchive.searchIndex, { variableType: 'hook' });
  const archiveRecord = run.experimentArchiveRecord || archiveRecords.find(item => item.runId === run.id) || run.experimentArchiveRecord;
  const requiredCount = run.experimentOperatorChecklist?.requiredCount || 0;
  const exportWorkbench = () => {
    downloadTextFile(
      safeDownloadFilename(`${run.project.productName}-本地实验操作台`, 'md'),
      buildExperimentWorkbenchMarkdown(board, historySummary, archiveRecord),
      'text/markdown;charset=utf-8',
    );
  };
  const archiveSummary = () => {
    archiveListingFactoryRun(run);
    onChanged();
  };
  const clearHistory = () => {
    clearListingFactoryRunHistory();
    onChanged();
  };
  const exportCrossRun = () => {
    downloadTextFile(
      safeDownloadFilename(`${run.project.productName}-跨运行学习对比`, 'md'),
      buildCrossRunComparisonMarkdown(crossRunComparison),
      'text/markdown;charset=utf-8',
    );
  };
  const exportLearningArchive = () => {
    downloadTextFile(
      safeDownloadFilename(`${run.project.productName}-商家增长学习档案`, 'md'),
      buildMerchantLearningArchiveMarkdown(merchantLearningArchive),
      'text/markdown;charset=utf-8',
    );
  };

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <SectionTitle eyebrow="本地实验操作台" title="本地实验操作台" body="把当前运行、最近几轮实验记录、下一步动作和本地归档放在一个本地优先的工作面板里，方便商家下次直接接着干。" />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={exportWorkbench}>导出本地操作台</ActionButton>
          <ActionButton onClick={archiveSummary}>归档当前摘要</ActionButton>
          <ActionButton onClick={clearHistory}>清空本地历史</ActionButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">当前运行状态</div><div className="mt-1 text-[13px] font-bold">{workbenchStatusLabel(board.currentStatus)}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">最高优先级动作</div><div className="mt-1 text-[13px] font-bold">{board.highestPriorityAction?.title || '等待生成'}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">决策状态</div><div className="mt-1 text-[13px] font-bold">{validationDecisionLabel(run.experimentDecisionSummary?.topDecision)}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">置信等级</div><div className="mt-1 text-[13px] font-bold">{confidenceLevelLabel(run.runHistoryItem?.confidenceLevel || run.experimentReports?.[0]?.confidenceSummary.confidenceLevel)}</div></div>
        <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">待处理检查项</div><div className="mt-1 text-[18px] font-black">{run.runHistoryItem?.openChecklistCount || requiredCount}</div></div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-sky-700">下一步动作</div>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{board.highestPriorityAction?.title || '当前没有待处理动作'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{board.highestPriorityAction?.description || board.summary}</p>
          <p className="mt-2 text-[12px] text-slate-500">下一步检查指标：{board.highestPriorityAction?.nextCheckMetric || run.experimentDecisionSummary?.nextCheckMetric || '等待补充数据'}</p>
        </div>
        <div className="rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-sky-700">本地归档</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{archiveRecord?.learningSummary || run.runHistoryItem?.topLearning || '当前还没有归档摘要。'}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">{archiveRecord?.nextAction || run.runHistoryItem?.nextRecommendedAction || '归档后会记录下一步建议。'}</p>
          <p className="mt-2 text-[12px] text-slate-500">归档状态：{archiveRecord?.archiveStatus === 'archived' ? '已归档' : '未归档'}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <div className="rounded-md bg-white p-4"><div className="text-[12px] font-semibold text-sky-700">待补数据</div><p className="mt-2 text-[12px] leading-5 text-slate-700">{board.pendingDataActions[0]?.description || '当前没有待补数据项。'}</p></div>
        <div className="rounded-md bg-white p-4"><div className="text-[12px] font-semibold text-sky-700">待验证实验</div><p className="mt-2 text-[12px] leading-5 text-slate-700">{board.validationActions[0]?.description || '当前没有待验证实验。'}</p></div>
        <div className="rounded-md bg-white p-4"><div className="text-[12px] font-semibold text-sky-700">可小范围放大</div><p className="mt-2 text-[12px] leading-5 text-slate-700">{board.rolloutActions[0]?.description || '当前没有可放大的候选方案。'}</p></div>
        <div className="rounded-md bg-white p-4"><div className="text-[12px] font-semibold text-sky-700">应停止方案</div><p className="mt-2 text-[12px] leading-5 text-slate-700">{board.stopActions[0]?.description || '当前没有需要停止的方案。'}</p></div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="text-[12px] font-semibold text-sky-700">最近运行记录</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {(historySummary?.items || board.recentRuns).slice(0, 3).map(item => (
            <article key={item.runId} className="rounded-md border border-sky-100 bg-sky-50 p-3">
              <div className="text-[12px] font-semibold text-sky-700">{item.primaryProductName}</div>
              <h3 className="mt-1 text-[13px] font-bold text-slate-900">{validationDecisionLabel(item.currentDecision)} / {confidenceLevelLabel(item.confidenceLevel)}</h3>
              <p className="mt-2 text-[12px] leading-5 text-slate-700">{item.topLearning}</p>
              <p className="mt-2 text-[12px] text-slate-500">下一步：{item.nextRecommendedAction}</p>
              <p className="mt-1 text-[12px] text-slate-500">检查项 {item.openChecklistCount} / {item.archiveStatus === 'archived' ? '已归档' : '未归档'}</p>
            </article>
          ))}
          {(!historySummary || historySummary.items.length === 0) && (
            <p className="text-[12px] text-slate-500">当前还没有本地运行历史，先完成一轮运行后会自动沉淀在这里。</p>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="text-[12px] font-semibold text-sky-700">下一步动作队列</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {board.nextActionQueue.slice(0, 3).map(action => <WorkbenchActionCard key={action.id} action={action} />)}
        </div>
      </div>
      <div className="mt-4 rounded-md bg-white p-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div>
            <div className="text-[12px] font-semibold text-sky-700">跨运行学习对比</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{crossRunComparison.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={exportCrossRun}>导出跨运行对比</ActionButton>
            <ActionButton onClick={exportLearningArchive}>导出学习档案</ActionButton>
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-sky-100 bg-sky-50 p-3">
            <div className="text-[12px] font-semibold text-sky-700">变量学习沉淀</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{crossRunComparison.variableSummaries.find(item => item.totalTests > 0)?.strongestLearning || crossRunComparison.strongestReusableLearning}</p>
            <p className="mt-2 text-[12px] text-slate-500">{crossRunComparison.variableSummaries.find(item => item.totalTests === 0)?.nextBestMove || crossRunComparison.nextBestMove}</p>
          </div>
          <div className="rounded-md border border-sky-100 bg-sky-50 p-3">
            <div className="text-[12px] font-semibold text-sky-700">增长学习检索</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">Hook 匹配 {hookSearch.totalMatches} 条</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{hookSearch.topLearning}</p>
          </div>
          <div className="rounded-md border border-sky-100 bg-sky-50 p-3">
            <div className="text-[12px] font-semibold text-sky-700">学习时间线</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">{merchantLearningArchive.timeline.slice(-1)[0]?.title || '等待归档'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{merchantLearningArchive.timeline.slice(-1)[0]?.keyLearning || '完成一轮本地实验后会生成时间线。'}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-5">
          {merchantLearningArchive.searchIndex.slice(0, 5).map(record => (
            <article key={`${record.runId}-${record.sourceType}-${record.variableType}-${record.createdAt}`} className="rounded-md border border-sky-100 bg-white p-3">
              <div className="text-[12px] font-semibold text-sky-700">{variableTypeLabel(record.variableType)} / {confidenceLevelLabel(record.confidenceLevel)}</div>
              <p className="mt-2 text-[12px] leading-5 text-slate-700">{record.reusableLearning}</p>
              <p className="mt-2 text-[12px] text-slate-500">{validationDecisionLabel(record.decision)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function FactoryPageScaffold({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  const { snapshot, refresh } = useLocalListingFactorySnapshot();
  const run = snapshot.run || ensureRun();
  return (
    <Shell>
      <Nav />
      <div className="space-y-8">
        <SectionTitle eyebrow="Wenai Content Decision OS" title={title} body={body} />
        <LocalProjectSummary run={run} />
        <ContentDecisionOsPanel run={run} onChanged={refresh} />
        <MerchantContextPanel run={run} />
        <OperatingReviewPanel run={run} />
        {children}
        <PerformanceFeedbackPanel run={run} onChanged={refresh} />
        <ExperimentOrchestrationPanel run={run} onChanged={refresh} />
        <LocalExperimentWorkbenchPanel run={run} onChanged={refresh} />
        <ContentExperimentTracePanel run={run} />
        <PlatformDataContractPanel run={run} />
        <PlatformCsvAdapterPanel run={run} />
        <PlatformCsvRehearsalPanel run={run} />
        <DeliveryDownloads run={run} />
      </div>
    </Shell>
  );
}

export function ListingFactoryHomeEntry() {
  return <FactoryPageScaffold title="跨境电商内容决策中枢" body="导入表现 CSV，校验字段和指标，把内容变量转成下一轮实验决策：测什么、停什么、小范围放大什么，以及哪些暂时不能下结论。" />;
}

export function ListingFactoryWorkbench() {
  return <FactoryPageScaffold title="新内容实验工作台" body="围绕一个 SKU 建立内容变量、实验单元、表现数据和下一轮动作队列；生产需求通过 brief 导出给外部工具执行。" />;
}

export function ListingFactoryConsole() {
  return <FactoryPageScaffold title="内容决策控制台" body="集中查看数据接入、实验决策、学习资产和生产需求，让下一步动作清晰可执行。" />;
}

export function ListingFactoryReviewPage() {
  const { snapshot } = useLocalListingFactorySnapshot();
  const run = snapshot.run || ensureRun();
  const experimentPlan = run.experimentPlans[0];
  const experimentReport = experimentPlan ? (run.experimentReports[0] || analyzeExperimentResults(experimentPlan, run.performanceRecords || [])) : null;
  const memorySummary = run.experimentMemorySummary || buildExperimentMemorySummary(run);
  const priorityQueue = run.experimentPriorityQueue || buildExperimentPriorityQueue({ ...run, experimentMemorySummary: memorySummary }, memorySummary, run.merchantContextCard);
  const gapMap = run.experimentLearningGapMap || buildExperimentLearningGapMap({ ...run, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue }, memorySummary, priorityQueue, run.merchantContextCard);
  const sequencingPlan = run.experimentSequencingPlan || buildExperimentSequencingPlan({ ...run, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap }, gapMap, priorityQueue, memorySummary, run.merchantContextCard);
  const validationPolicy = run.experimentValidationPolicy || buildExperimentValidationPolicy({ ...run, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, experimentReport?.confidenceSummary, memorySummary, priorityQueue, gapMap, sequencingPlan, run.merchantContextCard);
  const decisionSummary = run.experimentDecisionSummary || buildExperimentDecisionSummary({ ...run, experimentValidationPolicy: validationPolicy, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, validationPolicy);
  const executionPlaybook = run.experimentExecutionPlaybook || buildExperimentExecutionPlaybook({ ...run, experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary, experimentMemorySummary: memorySummary, experimentPriorityQueue: priorityQueue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, validationPolicy, decisionSummary, sequencingPlan, priorityQueue, gapMap, experimentReport?.confidenceSummary, run.merchantContextCard);
  const cadencePlan = run.experimentCadencePlan || buildExperimentCadencePlan({ ...run, experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary, experimentSequencingPlan: sequencingPlan }, validationPolicy, decisionSummary, sequencingPlan);
  const operatorChecklist = run.experimentOperatorChecklist || buildExperimentOperatorChecklist({ ...run, experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary }, validationPolicy, decisionSummary);
  const workbenchBoard = run.experimentWorkbenchBoard || buildExperimentWorkbenchBoard(run, snapshot.runHistorySummary, snapshot.archiveRecords);
  return (
    <FactoryPageScaffold title="复盘看板" body="用导入的表现数据复盘内容变量，判断下一轮该暂停、放大还是继续验证。">
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
        <div className="text-[12px] font-semibold text-indigo-700">表现归因</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">胜出模式</div><div className="mt-1 text-[13px] font-bold">{run.performanceInsights.find(item => item.type === 'winning_pattern')?.title || '导入表现数据后识别'}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">弱势模式</div><div className="mt-1 text-[13px] font-bold">{run.performanceInsights.find(item => item.type === 'weak_pattern')?.title || '导入表现数据后识别'}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">平台信号</div><div className="mt-1 text-[13px] font-bold">{run.performanceFeedbackReport.summary.topPlatform}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">下一轮测试</div><div className="mt-1 text-[13px] font-bold">{run.regenerationPlan.nextBriefAngles[0] || '导入表现数据后生成下一轮建议'}</div></div>
        </div>
      </div>
      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-5">
        <div className="text-[12px] font-semibold text-cyan-700">实验计划摘要</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">实验假设</div><div className="mt-1 text-[13px] font-bold">{experimentPlan?.hypothesis || '从表现洞察生成后展示'}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">实验单元</div><div className="mt-1 text-[13px] font-bold">{experimentPlan?.experimentCells.map(cell => variableTypeLabel(cell.variableType)).join(' / ') || '等待生成'}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">置信等级</div><div className="mt-1 text-[13px] font-bold">{confidenceLevelLabel(experimentReport?.confidenceSummary.confidenceLevel)}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">下一步动作</div><div className="mt-1 text-[13px] font-bold">{actionLabel(experimentReport?.confidenceSummary.recommendedAction) || '把胜出模式 / 弱势模式转成下一轮测试'}</div></div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">本地实验操作台</div><div className="mt-1 text-[13px] font-bold">{workbenchStatusLabel(workbenchBoard.currentStatus)}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">最近运行记录</div><div className="mt-1 text-[13px] font-bold">{snapshot.runHistorySummary?.items.length || 0} 条</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">下一步动作</div><div className="mt-1 text-[13px] font-bold">{workbenchBoard.highestPriorityAction?.title || '等待生成'}</div></div>
          <div className="rounded-md bg-white p-3"><div className="text-[12px] text-slate-500">待处理检查项</div><div className="mt-1 text-[13px] font-bold">{run.runHistoryItem?.openChecklistCount || operatorChecklist.requiredCount}</div></div>
        </div>
        <div className="mt-3 rounded-md bg-white p-4">
          <div className="text-[12px] font-semibold text-cyan-700">置信度复盘</div>
          <p className="mt-2 text-[12px] leading-5 text-slate-700">{experimentReport?.confidenceSummary.sampleGuardrail || '生成实验计划并导入 control / test 数据后展示。'}</p>
          <p className="mt-2 text-[13px] font-bold text-slate-900">{conclusionLabel(experimentReport?.confidenceSummary.conclusion)}</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-600">{experimentReport?.learningSummary || '当前还没有足够样本做出实验结论。'}</p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">实验记忆</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{memorySummary.topReusableLearning || '还没有高置信度可复用学习。'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">{memorySummary.topAvoidLearning || memorySummary.topWatchlistLearning || '还没有高风险重复提醒。'}</p>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">下一轮实验优先队列</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">{priorityQueue.candidates[0] ? `${priorityQueue.candidates[0].candidateName} / ${priorityBandLabel(priorityQueue.candidates[0].priorityBand)}` : '等待生成'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-600">{priorityQueue.candidates[0]?.nextRecommendedTest || '没有下一轮候选项。'}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">内容增长学习地图</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{gapMap.summary}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">{gapMap.gaps.find(item => item.status === 'unknown')?.unresolvedQuestion || gapMap.gaps.find(item => item.status === 'directional')?.unresolvedQuestion || '当前没有明显未解实验变量。'}</p>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">下一轮实验路线图</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">{sequencingPlan.steps[0] ? `第 1 步 / ${variableTypeLabel(sequencingPlan.steps[0].primaryVariableType)}` : '等待生成'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-600">{sequencingPlan.steps[0]?.whyNow || sequencingPlan.topUnresolvedQuestion || '当前还没有实验路线。'}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">实验决策规则</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">{validationDecisionLabel(decisionSummary.topDecision)} / 风险 {rolloutRiskLabel(decisionSummary.riskLevel)}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{decisionSummary.whyThisDecision}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">下一步检查指标：{decisionSummary.nextCheckMetric}</p>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">放大 / 停止建议</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{decisionSummary.canRollout[0] || decisionSummary.mustValidate[0] || '当前还没有可执行的放大建议。'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">{decisionSummary.stopCondition}</p>
            <p className="mt-2 text-[12px] leading-5 text-rose-600">{decisionSummary.stopNow[0] || decisionSummary.noDecisionYet[0] || '当前没有需要立即停止的实验项。'}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">实验执行手册</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">{validationDecisionLabel(executionPlaybook.currentDecision)} / {variableTypeLabel(executionPlaybook.primaryVariableType)}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{executionPlaybook.productionTasks[0]?.title || '等待生成执行任务。'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">{executionPlaybook.nextActionAfterResult}</p>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">实验节奏安排</div>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{cadencePlan.monitoringCadence}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">{cadencePlan.nextCheckpoint}</p>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="text-[12px] font-semibold text-cyan-700">操作检查表</div>
            <p className="mt-2 text-[13px] font-bold text-slate-900">必做 {operatorChecklist.requiredCount} 项</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-700">{operatorChecklist.sections[0]?.items[0]?.title || '等待生成检查项。'}</p>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">{operatorChecklist.summary}</p>
          </div>
        </div>
      </div>
    </FactoryPageScaffold>
  );
}

export function ListingFactoryReportDelivery() {
  return <FactoryPageScaffold title="POC 报告与交付包" body="交付包新增表现反馈报告、实验验证策略、实验决策摘要、实验执行手册、实验节奏安排、操作检查表、再生成计划、实验计划、追踪命名规则和数据回收 CSV。" />;
}

export function ListingFactoryBriefLibraryPage() {
  const run = ensureRun();
  return (
    <FactoryPageScaffold title="Brief 资产库" body="查看本地 Brief、脚本、变体与批量生产入口。">
      <div className="grid gap-4 lg:grid-cols-2">
        {run.briefs.slice(0, 8).map(brief => <article key={brief.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="text-[12px] font-semibold text-amber-700">{brief.platform} / {brief.contentType}</div><h3 className="mt-2 text-lg font-bold">{brief.hook}</h3><p className="mt-2 text-[13px] text-slate-600">评分 {brief.qualityScore.overallScore} / 风险 {brief.riskLevel}</p></article>)}
      </div>
    </FactoryPageScaffold>
  );
}

export function ListingFactoryInsightLibraryPage() {
  return <FactoryPageScaffold title="类目洞察库" body="展示 demo 洞察和当前项目的可复用内容结构。"><div className="grid gap-4 lg:grid-cols-3">{LISTING_FACTORY_INSIGHTS.slice(0, 6).map(item => <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="font-bold">{item.hook}</h3><p className="mt-2 text-[13px] text-slate-600">{item.reusableReason}</p></article>)}</div></FactoryPageScaffold>;
}

export function ListingFactoryCalendarPage() {
  const run = ensureRun();
  return <FactoryPageScaffold title="内容日历" body="由 Brief 和任务队列派生的本地日历。"><div className="grid gap-3 lg:grid-cols-3">{run.calendarItems.slice(0, 9).map(item => <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="text-[12px] text-slate-500">{item.date} / {item.platform}</div><div className="mt-2 font-bold">{item.title}</div></div>)}</div></FactoryPageScaffold>;
}

export function ListingFactoryClientsPage() {
  return <FactoryPageScaffold title="客户项目空间" body="当前仍为本地试跑，不做账号、团队权限或云端数据库。" />;
}

export function ListingFactoryPocConfigurator() {
  return <FactoryPageScaffold title="POC 配置器" body="选择本地 SKU 后生成 POC 报告和交付包。" />;
}

export function ListingFactoryInquiryHandoff() {
  return <FactoryPageScaffold title="咨询交接" body="带着本地试跑报告、交付包和下一轮优化计划进入人工咨询。" />;
}

export function ListingFactoryPricingHandoff() {
  return <FactoryPageScaffold title="正式生产方案" body="带着试跑结果咨询正式生产方案；当前页面仅展示本地能力边界，不做订阅、Stripe 或 SaaS 权限。" />;
}

export function ListingFactoryCasesSection() {
  return <div className="grid gap-4 md:grid-cols-3">{LISTING_FACTORY_CASES.slice(0, 3).map(item => <article key={`${item.category}-${item.skuBackground}`} className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="font-bold">{item.skuBackground}</h3><p className="mt-2 text-[13px] text-slate-600">{item.pocConclusion}</p></article>)}</div>;
}

export function ListingFactoryOverviewPanel() { return <ListingFactoryHomeEntry />; }
export function ListingFactoryFlowPanel() { return <ListingFactoryHomeEntry />; }
export function ListingFactorySkuRulesPanel() { return <ListingFactoryHomeEntry />; }
export function ListingFactoryBrandSafetyPanel() { return <ListingFactoryHomeEntry />; }
export function ListingFactoryInsightLibrary() { return <ListingFactoryInsightLibraryPage />; }
export function ListingFactoryBriefFactory() { return <ListingFactoryBriefLibraryPage />; }
