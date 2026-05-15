import {
  buildScriptFromBrief,
  deconstructReferenceCreative,
  evaluateBriefQuality,
  generateBriefs,
  generateContentVariants,
  localDeterministicProvider as engineLocalDeterministicProvider,
  regenerateBriefVariant,
  sanitizeRiskyCopy,
  scoreBrandSafety,
  type BriefQualityScore,
  type ContentVariant,
  type GeneratedBrief,
  type GeneratedScript,
  type ListingProject,
  type ReferenceCreative,
} from './listing-factory-engine';

export type ListingFactoryProviderMode = 'local' | 'remote';
export type ProviderGuardrailMode = 'strict' | 'balanced';

export interface ProviderContext {
  guardrailMode?: ProviderGuardrailMode;
  qualityGate?: number;
  providerConfig?: LLMProviderConfig;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface ProviderOptions extends ProviderContext {
  providerId?: string;
  fallbackToLocal?: boolean;
  count?: number;
}

export interface LLMProviderConfig {
  providerId: string;
  endpoint?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
  source: 'env' | 'user_session' | 'disabled';
}

export interface ProviderAuditEntry {
  providerId: string;
  mode: ListingFactoryProviderMode;
  usedFallback: boolean;
  operation: 'briefs' | 'script' | 'reference' | 'variants' | 'improve';
  status: 'success' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

export interface ListingFactoryProvider {
  id: string;
  name: string;
  mode: ListingFactoryProviderMode;
  available: (context?: ProviderContext) => boolean | Promise<boolean>;
  generateBriefs: (project: ListingProject, context?: ProviderContext & { count?: number }) => Promise<unknown[]> | unknown[];
  generateScript: (project: ListingProject, brief: GeneratedBrief, context?: ProviderContext) => Promise<unknown> | unknown;
  deconstructReference: (reference: ReferenceCreative, project: ListingProject, context?: ProviderContext) => Promise<unknown> | unknown;
  improveBrief: (project: ListingProject, brief: GeneratedBrief, instruction: string, context?: ProviderContext) => Promise<unknown> | unknown;
  generateVariants: (project: ListingProject, brief: GeneratedBrief, context?: ProviderContext & { count?: number }) => Promise<unknown[]> | unknown[];
}

export type ProviderBriefResult = {
  providerId: string;
  fallbackUsed: boolean;
  briefs: GeneratedBrief[];
};

export type ProviderScriptResult = {
  providerId: string;
  fallbackUsed: boolean;
  script: GeneratedScript;
};

export type ProviderImproveResult = {
  providerId: string;
  fallbackUsed: boolean;
  brief: GeneratedBrief;
};

export type ProviderVariantResult = {
  providerId: string;
  fallbackUsed: boolean;
  variants: ContentVariant[];
};

const BAD_OUTPUT_TOKENS = ['undefined', 'null', '[object Object]', 'placeholder', 'TODO'];
const DEFAULT_REMOTE_TIMEOUT_MS = 12_000;
let sessionLLMProviderConfig: LLMProviderConfig | null = null;
const providerAuditLog: ProviderAuditEntry[] = [];

export function setSessionLLMProviderConfig(config: LLMProviderConfig) {
  sessionLLMProviderConfig = {
    ...config,
    source: config.source || 'user_session',
  };
}

export function clearSessionLLMProviderConfig() {
  sessionLLMProviderConfig = null;
  providerAuditLog.length = 0;
}

export function getProviderAuditLog() {
  return providerAuditLog.slice();
}

function getRuntimeLLMConfig(context?: ProviderContext): LLMProviderConfig {
  const config = context?.providerConfig || sessionLLMProviderConfig;
  if (config) return config;
  return {
    providerId: 'openai-compatible',
    enabled: false,
    source: 'disabled',
  };
}

function sanitizeAuditError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || 'Unknown provider error');
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, '[redacted-key]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [redacted-key]')
    .slice(0, 180);
}

function recordProviderAudit(entry: Omit<ProviderAuditEntry, 'timestamp'>) {
  providerAuditLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  providerAuditLog.splice(20);
}

function safeJsonStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

const briefSchema = {
  briefs: [
    {
      platform: 'string',
      contentType: 'string',
      hook: 'string',
      visualDirection: 'string',
      voiceoverDirection: 'string',
      cta: 'string',
      riskNotes: ['string'],
      reusableStructure: 'string',
    },
  ],
};

const scriptSchema = {
  title: 'string',
  duration: '15-30s',
  openingHook: 'string',
  scenes: [
    {
      timestamp: '0-3s',
      visual: 'string',
      voiceoverLine: 'string',
      onScreenText: 'string',
      assetNeed: 'string',
      riskNote: 'string',
    },
  ],
  voiceover: 'string',
  onScreenText: ['string'],
  cta: 'string',
  riskNotes: ['string'],
};

const deconstructionSchema = {
  hookPattern: 'string',
  painPoint: 'string',
  productReveal: 'string',
  proofPoint: 'string',
  objectionHandling: 'string',
  ctaPattern: 'string',
  reusableStructure: 'string',
  riskWarnings: ['string'],
  suitableBriefTypes: ['string'],
};

const variantSchema = {
  variants: [
    {
      platform: 'string',
      hook: 'string',
      angle: 'string',
      cta: 'string',
      audience: 'string',
      reusableStructure: 'string',
      riskLevel: 'low | medium | high',
    },
  ],
};

function projectPromptBlock(project: ListingProject) {
  return [
    `SKU: ${project.productName}`,
    `类目: ${project.category}`,
    `目标平台: ${project.targetPlatforms.join(' / ')}`,
    `价格带: ${project.priceBand}`,
    `核心卖点: ${project.sellingPoints.join(' / ')}`,
    `目标人群: ${project.targetAudience}`,
    `内容目标: ${project.contentGoal}`,
    `品牌禁区: ${project.brandGuardrails.join(' / ') || '按保守表达处理'}`,
    `类目规则: ${project.categoryRules.join(' / ') || '按平台常规限制处理'}`,
    `参考备注: ${project.competitorNotes || '无'}`,
    '禁止使用的风险表达：保证、必然、100%、永久、根治、治疗、治愈、吊打、碾压、全网最低、最后一天、错过永远没有、立刻见效、马上瘦、保证爆单。',
    '质量标准：输出必须具体、可拍摄、可交付；不能承诺爆款，不能绕过品牌禁区，必须说明适用边界。',
  ].join('\n');
}

function jsonOnlyInstruction(schema: unknown) {
  return [
    '只输出可解析 JSON，不要 Markdown 解释。',
    '如果必须使用代码块，只能使用 ```json。',
    '不要输出 undefined、null、[object Object]、placeholder 或 TODO。',
    `输出 JSON schema: ${safeJsonStringify(schema)}`,
  ].join('\n');
}

export function buildBriefGenerationPrompt(project: ListingProject, context: ProviderContext & { count?: number } = {}) {
  return [
    '你是 Wenai Listing Factory 的内容生产助手。请生成受品牌禁区和类目规则约束的电商上新 Brief。',
    projectPromptBlock(project),
    `生成数量: ${context.count ?? 8}`,
    `风控模式: ${context.guardrailMode || 'balanced'}`,
    '平台风格：TikTok 更短节奏，小红书更真实体验，Instagram 更 lifestyle，Amazon 更 FAQ/功能解释，Shopify 更落地页转化。',
    jsonOnlyInstruction(briefSchema),
  ].join('\n\n');
}

export function buildScriptGenerationPrompt(project: ListingProject, brief: GeneratedBrief, context: ProviderContext = {}) {
  return [
    '请把 Brief 转为 15-30 秒短视频脚本，至少 4 个 scenes。',
    projectPromptBlock(project),
    `Brief: ${safeJsonStringify({ platform: brief.platform, contentType: brief.contentType, hook: brief.hook, cta: brief.cta, reusableStructure: brief.reusableStructure })}`,
    `风控模式: ${context.guardrailMode || 'balanced'}`,
    jsonOnlyInstruction(scriptSchema),
  ].join('\n\n');
}

export function buildReferenceDeconstructionPrompt(reference: ReferenceCreative, project: ListingProject, context: ProviderContext = {}) {
  return [
    '请拆解参考内容结构，用于生成可复用的电商内容 Brief。不要复制原文，不要扩大承诺。',
    projectPromptBlock(project),
    `参考内容: ${safeJsonStringify(reference)}`,
    `风控模式: ${context.guardrailMode || 'balanced'}`,
    jsonOnlyInstruction(deconstructionSchema),
  ].join('\n\n');
}

export function buildBriefImprovementPrompt(project: ListingProject, brief: GeneratedBrief, instruction: string, context: ProviderContext = {}) {
  return [
    '请根据改写指令优化 Brief。必须保留品牌禁区、类目规则和可拍摄性。',
    projectPromptBlock(project),
    `原 Brief: ${safeJsonStringify(brief)}`,
    `改写指令: ${instruction}`,
    `风控模式: ${context.guardrailMode || 'balanced'}`,
    jsonOnlyInstruction(briefSchema.briefs[0]),
  ].join('\n\n');
}

export function buildVariantGenerationPrompt(project: ListingProject, brief: GeneratedBrief, context: ProviderContext & { count?: number } = {}) {
  return [
    '请基于一个 Brief 生成批量内容变体，变体必须在 hook、受众、画面角度、CTA、证明点上有差异。',
    projectPromptBlock(project),
    `Base Brief: ${safeJsonStringify(brief)}`,
    `生成数量: ${context.count ?? 6}`,
    `风控模式: ${context.guardrailMode || 'balanced'}`,
    jsonOnlyInstruction(variantSchema),
  ].join('\n\n');
}

function cleanText(value: unknown, fallback: string, project: ListingProject) {
  const text = typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  const withoutBadTokens = BAD_OUTPUT_TOKENS.reduce((current, token) => current.replaceAll(token, ''), text);
  return sanitizeRiskyCopy(withoutBadTokens.trim() || fallback, project.brandGuardrails);
}

function normalizeRiskNotes(value: unknown, project: ListingProject) {
  const notes = Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  const safeNotes = notes.map(note => cleanText(note, '已按品牌禁区做保守处理。', project));
  const safety = scoreBrandSafety(safeNotes.join(' '), project.brandGuardrails);
  return [...new Set([...safeNotes, ...safety.notes])].slice(0, 5);
}

function fallbackBrief(project: ListingProject, index = 0): GeneratedBrief {
  return generateBriefs(project, { count: Math.max(6, index + 1), provider: engineLocalDeterministicProvider })[index] || generateBriefs(project, { count: 6 })[0];
}

function riskLevelFromQuality(score: BriefQualityScore): GeneratedBrief['riskLevel'] {
  if (score.brandSafety >= 86) return 'low';
  if (score.brandSafety >= 70) return 'medium';
  return 'high';
}

export function validateGeneratedBrief(raw: unknown): { ok: true } | { ok: false; missingFields: string[] } {
  const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const requiredFields = ['platform', 'contentType', 'hook', 'visualDirection', 'voiceoverDirection', 'cta', 'riskNotes', 'reusableStructure'];
  const missingFields = requiredFields.filter(field => {
    const item = value[field];
    return Array.isArray(item) ? item.length === 0 : typeof item !== 'string' || item.trim().length === 0;
  });
  return missingFields.length === 0 ? { ok: true } : { ok: false, missingFields };
}

export function normalizeGeneratedBrief(raw: unknown, project: ListingProject, index = 0): GeneratedBrief {
  const value = raw && typeof raw === 'object' ? raw as Partial<GeneratedBrief> & Record<string, unknown> : {};
  const fallback = fallbackBrief(project, index);
  const briefWithoutScore: Omit<GeneratedBrief, 'qualityScore'> = {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : `provider-brief-${project.id}-${index + 1}`,
    projectId: project.id,
    platform: cleanText(value.platform, fallback.platform, project),
    contentType: cleanText(value.contentType, fallback.contentType, project),
    hook: cleanText(value.hook, fallback.hook, project),
    visualDirection: cleanText(value.visualDirection, fallback.visualDirection, project),
    voiceoverDirection: cleanText(value.voiceoverDirection, fallback.voiceoverDirection, project),
    cta: cleanText(value.cta, fallback.cta, project),
    riskLevel: 'low',
    riskNotes: normalizeRiskNotes(value.riskNotes, project),
    reusableStructure: cleanText(value.reusableStructure, fallback.reusableStructure, project),
    status: value.status === 'pending_review' || value.status === 'in_task_queue' || value.status === 'in_poc_report' || value.status === 'archived'
      ? value.status
      : 'draft',
  };
  const qualityScore = evaluateBriefQuality(briefWithoutScore, project);
  return {
    ...briefWithoutScore,
    riskLevel: riskLevelFromQuality(qualityScore),
    qualityScore,
  };
}

export function validateGeneratedScript(raw: unknown): { ok: true } | { ok: false; missingFields: string[] } {
  const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const requiredFields = ['title', 'duration', 'openingHook', 'scenes', 'voiceover', 'onScreenText', 'cta', 'riskNotes'];
  const missingFields = requiredFields.filter(field => {
    const item = value[field];
    return Array.isArray(item) ? item.length === 0 : typeof item !== 'string' || item.trim().length === 0;
  });
  return missingFields.length === 0 ? { ok: true } : { ok: false, missingFields };
}

export function normalizeGeneratedScript(raw: unknown, project: ListingProject, brief: GeneratedBrief): GeneratedScript {
  const value = raw && typeof raw === 'object' ? raw as Partial<GeneratedScript> & Record<string, unknown> : {};
  const fallback = buildScriptFromBrief(project, brief);
  const scenes = Array.isArray(value.scenes) && value.scenes.length >= 4 ? value.scenes : fallback.scenes;
  const safeScript: Omit<GeneratedScript, 'qualityScore'> = {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : `provider-script-${brief.id}`,
    briefId: brief.id,
    projectId: project.id,
    platform: cleanText(value.platform, brief.platform, project),
    title: cleanText(value.title, fallback.title, project),
    duration: cleanText(value.duration, fallback.duration, project),
    openingHook: cleanText(value.openingHook, brief.hook, project),
    scenes: fallback.scenes.map((fallbackScene, index) => {
      const rawScene = scenes[index] && typeof scenes[index] === 'object' ? scenes[index] as unknown as Record<string, unknown> : {};
      return {
        id: typeof rawScene.id === 'string' ? rawScene.id : fallbackScene.id,
        timestamp: cleanText(rawScene.timestamp, fallbackScene.timestamp, project),
        visual: cleanText(rawScene.visual, fallbackScene.visual, project),
        voiceoverLine: cleanText(rawScene.voiceoverLine, fallbackScene.voiceoverLine, project),
        onScreenText: cleanText(rawScene.onScreenText, fallbackScene.onScreenText, project),
        assetNeed: cleanText(rawScene.assetNeed, fallbackScene.assetNeed, project),
        riskNote: cleanText(rawScene.riskNote, fallbackScene.riskNote, project),
      };
    }),
    voiceover: cleanText(value.voiceover, fallback.voiceover, project),
    onScreenText: Array.isArray(value.onScreenText) ? value.onScreenText.map(item => cleanText(item, '', project)).filter(Boolean) : fallback.onScreenText,
    cta: cleanText(value.cta, fallback.cta, project),
    riskNotes: normalizeRiskNotes(value.riskNotes, project),
  };
  return {
    ...safeScript,
    qualityScore: evaluateBriefQuality({
      id: brief.id,
      projectId: project.id,
      platform: safeScript.platform,
      contentType: brief.contentType,
      hook: safeScript.openingHook,
      visualDirection: safeScript.scenes.map(scene => scene.visual).join('；'),
      voiceoverDirection: safeScript.voiceover,
      cta: safeScript.cta,
      riskLevel: brief.riskLevel,
      riskNotes: safeScript.riskNotes,
      reusableStructure: brief.reusableStructure,
      status: brief.status,
    }, project),
  };
}

export function repairProviderOutput(raw: unknown, schemaName: 'brief' | 'script' | string) {
  if (raw && typeof raw === 'object') return raw;
  return {
    repaired: true,
    schemaName,
    rawText: typeof raw === 'string' ? raw : '',
  };
}

export function parseProviderJsonResponse(text: string): unknown {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = codeBlock?.[1]?.trim() || trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const firstObject = candidate.indexOf('{');
    const lastObject = candidate.lastIndexOf('}');
    if (firstObject >= 0 && lastObject > firstObject) {
      return JSON.parse(candidate.slice(firstObject, lastObject + 1));
    }
    const firstArray = candidate.indexOf('[');
    const lastArray = candidate.lastIndexOf(']');
    if (firstArray >= 0 && lastArray > firstArray) {
      return JSON.parse(candidate.slice(firstArray, lastArray + 1));
    }
    throw new Error('Provider response is not valid JSON.');
  }
}

export function safeParseProviderResponse<T>(text: string, fallback: T): T {
  try {
    return parseProviderJsonResponse(text) as T;
  } catch {
    return fallback;
  }
}

export function normalizeRemoteBriefs(raw: unknown, project: ListingProject): GeneratedBrief[] {
  const value = raw && typeof raw === 'object' ? raw as { briefs?: unknown[] } : {};
  const list = Array.isArray(value.briefs) ? value.briefs : Array.isArray(raw) ? raw : [];
  return list.map((item, index) => normalizeGeneratedBrief(item, project, index));
}

export function normalizeRemoteScript(raw: unknown, project: ListingProject, brief: GeneratedBrief): GeneratedScript {
  return normalizeGeneratedScript(raw, project, brief);
}

export function normalizeRemoteVariants(raw: unknown, project: ListingProject, brief: GeneratedBrief): ContentVariant[] {
  const fallback = generateContentVariants(project, brief, { count: 6 });
  const value = raw && typeof raw === 'object' ? raw as { variants?: unknown[] } : {};
  const list = Array.isArray(value.variants) ? value.variants : Array.isArray(raw) ? raw : [];
  if (list.length === 0) return fallback;
  return list.map((item, index) => {
    const source = item && typeof item === 'object' ? item as Partial<ContentVariant> : {};
    const base = fallback[index % fallback.length];
    return {
      ...base,
      ...source,
      id: typeof source.id === 'string' ? source.id : `remote-variant-${brief.id}-${index + 1}`,
      briefId: brief.id,
      platform: cleanText(source.platform, base.platform, project),
      hook: cleanText(source.hook, base.hook, project),
      angle: cleanText(source.angle, base.angle, project),
      cta: cleanText(source.cta, base.cta, project),
      audience: cleanText(source.audience, base.audience, project),
      reusableStructure: cleanText(source.reusableStructure, base.reusableStructure, project),
      qualityScore: evaluateBriefQuality({
        id: brief.id,
        projectId: project.id,
        platform: cleanText(source.platform, base.platform, project),
        contentType: brief.contentType,
        hook: cleanText(source.hook, base.hook, project),
        visualDirection: cleanText(source.angle, base.angle, project),
        voiceoverDirection: cleanText(source.angle, base.angle, project),
        cta: cleanText(source.cta, base.cta, project),
        riskLevel: source.riskLevel || base.riskLevel,
        riskNotes: brief.riskNotes,
        reusableStructure: cleanText(source.reusableStructure, base.reusableStructure, project),
        status: brief.status,
      }, project),
    };
  });
}

async function callOpenAICompatibleJson(prompt: string, context?: ProviderContext) {
  const config = getRuntimeLLMConfig(context);
  if (!config.enabled || !config.endpoint || !config.apiKey || !config.model) {
    throw new Error('LLM provider is not configured.');
  }

  const fetcher = context?.fetchImpl || globalThis.fetch;
  if (!fetcher) throw new Error('Fetch is not available for remote provider.');
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = setTimeout(() => controller?.abort(), context?.timeoutMs ?? DEFAULT_REMOTE_TIMEOUT_MS);

  try {
    const response = await fetcher(config.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: config.temperature ?? 0.4,
        max_tokens: config.maxTokens ?? 1800,
        messages: [
          {
            role: 'system',
            content: 'You are Wenai Listing Factory. Return strict JSON only. Follow brand guardrails and category rules.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: controller?.signal,
    });
    if (!response.ok) throw new Error(`LLM provider request failed: ${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM provider returned empty content.');
    return parseProviderJsonResponse(content);
  } finally {
    clearTimeout(timeout);
  }
}

export const localDeterministicProvider: ListingFactoryProvider = {
  id: 'local-deterministic',
  name: 'Local deterministic provider',
  mode: 'local',
  available: () => true,
  generateBriefs: (project, context) => generateBriefs(project, { count: context?.count, provider: engineLocalDeterministicProvider }),
  generateScript: (project, brief) => buildScriptFromBrief(project, brief),
  deconstructReference: (reference, project) => deconstructReferenceCreative(reference, project),
  improveBrief: (project, brief, instruction) => {
    const improved = regenerateBriefVariant(project, brief, instruction || 'provider-improve');
    return {
      ...improved,
      id: `${brief.id}-improved-${slugInstruction(instruction)}`,
      hook: sanitizeRiskyCopy(`${improved.hook}（${instruction.slice(0, 18) || '已优化'}）`, project.brandGuardrails),
    };
  },
  generateVariants: (project, brief, context) => generateContentVariants(project, brief, { count: context?.count ?? 6 }),
};

export const remoteLLMProvider: ListingFactoryProvider = {
  id: 'remote-llm',
  name: 'Remote LLM provider',
  mode: 'remote',
  available: () => false,
  generateBriefs: async () => {
    throw new Error('Remote LLM provider is not configured.');
  },
  generateScript: async () => {
    throw new Error('Remote LLM provider is not configured.');
  },
  deconstructReference: async () => {
    throw new Error('Remote LLM provider is not configured.');
  },
  improveBrief: async () => {
    throw new Error('Remote LLM provider is not configured.');
  },
  generateVariants: async () => {
    throw new Error('Remote LLM provider is not configured.');
  },
};

export const openaiCompatibleProvider: ListingFactoryProvider = {
  id: 'openai-compatible',
  name: 'OpenAI-compatible LLM provider pilot',
  mode: 'remote',
  available: async (context) => {
    const config = getRuntimeLLMConfig(context);
    return Boolean(config.enabled && config.endpoint && config.apiKey && config.model);
  },
  generateBriefs: async (project, context) => {
    const raw = await callOpenAICompatibleJson(buildBriefGenerationPrompt(project, context), context);
    const briefs = normalizeRemoteBriefs(raw, project);
    if (briefs.length === 0) throw new Error('LLM provider returned no briefs.');
    return briefs;
  },
  generateScript: async (project, brief, context) => {
    const raw = await callOpenAICompatibleJson(buildScriptGenerationPrompt(project, brief, context), context);
    return normalizeRemoteScript(raw, project, brief);
  },
  deconstructReference: async (reference, project, context) => {
    const raw = await callOpenAICompatibleJson(buildReferenceDeconstructionPrompt(reference, project, context), context);
    const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    return {
      referenceId: reference.id,
      hookPattern: cleanText(value.hookPattern, reference.observedHook || '参考内容开场结构', project),
      painPoint: cleanText(value.painPoint, '目标用户痛点', project),
      productReveal: cleanText(value.productReveal, project.productName, project),
      proofPoint: cleanText(value.proofPoint, project.sellingPoints[0] || '可验证细节', project),
      objectionHandling: cleanText(value.objectionHandling, project.categoryRules[0] || '说明适用边界', project),
      ctaPattern: cleanText(value.ctaPattern, '保存清单或咨询具体场景', project),
      reusableStructure: cleanText(value.reusableStructure, 'Hook -> 痛点 -> 产品 -> 证明 -> CTA', project),
      riskWarnings: normalizeRiskNotes(value.riskWarnings, project),
      suitableBriefTypes: Array.isArray(value.suitableBriefTypes) ? value.suitableBriefTypes.map(item => cleanText(item, '痛点转化', project)).slice(0, 4) : ['痛点转化'],
    };
  },
  improveBrief: async (project, brief, instruction, context) => {
    const raw = await callOpenAICompatibleJson(buildBriefImprovementPrompt(project, brief, instruction, context), context);
    return normalizeGeneratedBrief(raw, project, 0);
  },
  generateVariants: async (project, brief, context) => {
    const raw = await callOpenAICompatibleJson(buildVariantGenerationPrompt(project, brief, context), context);
    return normalizeRemoteVariants(raw, project, brief);
  },
};

const providers = [localDeterministicProvider, remoteLLMProvider, openaiCompatibleProvider];

function getProvider(providerId?: string) {
  return providers.find(provider => provider.id === providerId) || localDeterministicProvider;
}

async function resolveProvider(options: ProviderOptions = {}) {
  const requested = getProvider(options.providerId);
  if (await requested.available(options)) return { provider: requested, fallbackUsed: false };
  if (options.fallbackToLocal !== false) return { provider: localDeterministicProvider, fallbackUsed: requested.id !== localDeterministicProvider.id };
  throw new Error(`Provider ${requested.id} is unavailable.`);
}

export async function generateBriefsWithProvider(project: ListingProject, options: ProviderOptions = {}): Promise<ProviderBriefResult> {
  const { provider, fallbackUsed } = await resolveProvider(options);
  const qualityGate = options.qualityGate ?? 60;
  try {
    const rawBriefs = await provider.generateBriefs(project, options);
    const source = Array.isArray(rawBriefs) && rawBriefs.length > 0 ? rawBriefs : generateBriefs(project, { count: options.count });
    const briefs = source.map((brief, index) => normalizeGeneratedBrief(brief, project, index));
    recordProviderAudit({
      providerId: provider.id,
      mode: provider.mode,
      usedFallback: fallbackUsed,
      operation: 'briefs',
      status: 'success',
    });
    return {
      providerId: provider.id,
      fallbackUsed,
      briefs: briefs.filter(brief => brief.qualityScore.overallScore >= qualityGate || options.guardrailMode !== 'strict').slice(0, options.count || briefs.length),
    };
  } catch (error) {
    recordProviderAudit({
      providerId: provider.id,
      mode: provider.mode,
      usedFallback: true,
      operation: 'briefs',
      status: 'failed',
      errorMessage: sanitizeAuditError(error),
    });
    if (options.fallbackToLocal === false || provider.id === localDeterministicProvider.id) throw error;
    const fallbackBriefs = generateBriefs(project, { count: options.count, provider: engineLocalDeterministicProvider })
      .map((brief, index) => normalizeGeneratedBrief(brief, project, index))
      .filter(brief => brief.qualityScore.overallScore >= qualityGate || options.guardrailMode !== 'strict');
    return {
      providerId: localDeterministicProvider.id,
      fallbackUsed: true,
      briefs: fallbackBriefs.slice(0, options.count || fallbackBriefs.length),
    };
  }
}

export async function buildScriptWithProvider(project: ListingProject, brief: GeneratedBrief, options: ProviderOptions = {}): Promise<ProviderScriptResult> {
  const { provider, fallbackUsed } = await resolveProvider(options);
  try {
    const rawScript = await provider.generateScript(project, brief, options);
    recordProviderAudit({ providerId: provider.id, mode: provider.mode, usedFallback: fallbackUsed, operation: 'script', status: 'success' });
    return {
      providerId: provider.id,
      fallbackUsed,
      script: normalizeGeneratedScript(rawScript, project, brief),
    };
  } catch (error) {
    recordProviderAudit({ providerId: provider.id, mode: provider.mode, usedFallback: true, operation: 'script', status: 'failed', errorMessage: sanitizeAuditError(error) });
    if (options.fallbackToLocal === false || provider.id === localDeterministicProvider.id) throw error;
    return {
      providerId: localDeterministicProvider.id,
      fallbackUsed: true,
      script: buildScriptFromBrief(project, brief),
    };
  }
}

export async function improveBriefWithProvider(project: ListingProject, brief: GeneratedBrief, instruction: string, options: ProviderOptions = {}): Promise<ProviderImproveResult> {
  const { provider, fallbackUsed } = await resolveProvider(options);
  try {
    const rawBrief = await provider.improveBrief(project, brief, instruction, options);
    const normalized = normalizeGeneratedBrief(rawBrief, project, 0);
    const rescored = normalizeGeneratedBrief({
      ...normalized,
      id: normalized.id === brief.id ? `${brief.id}-improved` : normalized.id,
      hook: normalized.hook === brief.hook
        ? `${normalized.hook} 先核对${project.categoryRules[0] || '使用边界'}。`
        : normalized.hook,
    }, project, 0);
    recordProviderAudit({ providerId: provider.id, mode: provider.mode, usedFallback: fallbackUsed, operation: 'improve', status: 'success' });
    return {
      providerId: provider.id,
      fallbackUsed,
      brief: rescored,
    };
  } catch (error) {
    recordProviderAudit({ providerId: provider.id, mode: provider.mode, usedFallback: true, operation: 'improve', status: 'failed', errorMessage: sanitizeAuditError(error) });
    if (options.fallbackToLocal === false || provider.id === localDeterministicProvider.id) throw error;
    const fallback = regenerateBriefVariant(project, brief, instruction || 'fallback-improve');
    return {
      providerId: localDeterministicProvider.id,
      fallbackUsed: true,
      brief: normalizeGeneratedBrief(fallback, project, 0),
    };
  }
}

export async function generateVariantsWithProvider(project: ListingProject, brief: GeneratedBrief, options: ProviderOptions = {}): Promise<ProviderVariantResult> {
  const { provider, fallbackUsed } = await resolveProvider(options);
  try {
    const rawVariants = await provider.generateVariants(project, brief, options);
    const variants = normalizeRemoteVariants(rawVariants, project, brief);
    recordProviderAudit({ providerId: provider.id, mode: provider.mode, usedFallback: fallbackUsed, operation: 'variants', status: 'success' });
    return {
      providerId: provider.id,
      fallbackUsed,
      variants,
    };
  } catch (error) {
    recordProviderAudit({ providerId: provider.id, mode: provider.mode, usedFallback: true, operation: 'variants', status: 'failed', errorMessage: sanitizeAuditError(error) });
    if (options.fallbackToLocal === false || provider.id === localDeterministicProvider.id) throw error;
    return {
      providerId: localDeterministicProvider.id,
      fallbackUsed: true,
      variants: generateContentVariants(project, brief, { count: options.count ?? 6 }),
    };
  }
}

function slugInstruction(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-').replace(/^-|-$/g, '').slice(0, 24) || 'local';
}
