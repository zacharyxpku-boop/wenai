import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createListingProject,
  createRunFromProject,
  type GeneratedBrief,
} from '@/lib/listing-factory-engine';
import {
  buildBriefGenerationPrompt,
  generateBriefsWithProvider,
  getProviderAuditLog,
  openaiCompatibleProvider,
  parseProviderJsonResponse,
  safeParseProviderResponse,
  setSessionLLMProviderConfig,
  clearSessionLLMProviderConfig,
} from '@/lib/listing-factory-providers';

const project = createListingProject({
  productName: '低糖燕麦棒',
  category: '食品饮料',
  targetPlatforms: ['TikTok', '小红书'],
  priceBand: '39-59 元',
  sellingPoints: '低糖；高纤维；独立包装',
  targetAudience: '下午容易饿、又怕摄入太多糖的办公室人群',
  contentGoal: '上新种草',
  brandGuardrails: '不能保证减肥；不能虚假折扣；不能绝对化承诺',
  categoryRules: '说明营养成分；不要替代正餐；避免医疗功效',
  competitorNotes: '可参考办公室零食测评，不贬低具体品牌。',
});

function mockChatResponse(content: string) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => ({
      choices: [
        {
          message: { content },
        },
      ],
    }),
  })) as unknown as typeof fetch;
}

afterEach(() => {
  vi.restoreAllMocks();
  clearSessionLLMProviderConfig();
});

describe('listing factory real provider pilot', () => {
  it('reports unavailable without configuration', async () => {
    clearSessionLLMProviderConfig();

    expect(await openaiCompatibleProvider.available()).toBe(false);
  });

  it('falls back local when provider is not configured', async () => {
    const result = await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
    });

    expect(result.providerId).toBe('local-deterministic');
    expect(result.fallbackUsed).toBe(true);
    expect(result.briefs.length).toBeGreaterThanOrEqual(6);
  });

  it('parses mock fetch JSON brief output', async () => {
    setSessionLLMProviderConfig({
      providerId: 'openai-compatible',
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'sk-test-secret',
      model: 'mock-model',
      enabled: true,
      source: 'user_session',
    });
    vi.stubGlobal('fetch', mockChatResponse(JSON.stringify({
      briefs: [
        {
          platform: 'TikTok',
          contentType: '办公室场景种草',
          hook: '下午三点想吃零食，先看糖和纤维够不够清楚。',
          visualDirection: '办公桌、抽屉、拆包装和营养成分近景。',
          voiceoverDirection: '先说下午饥饿场景，再解释低糖和高纤维边界。',
          cta: '先保存营养成分核对清单。',
          riskNotes: ['避免承诺减肥效果。'],
          reusableStructure: '场景 -> 成分 -> 适用边界 -> CTA',
        },
      ],
    })));

    const result = await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
      count: 1,
    });

    expect(result.providerId).toBe('openai-compatible');
    expect(result.fallbackUsed).toBe(false);
    expect(result.briefs[0].hook).toContain('下午三点');
    expect(result.briefs[0].qualityScore.overallScore).toBeGreaterThanOrEqual(60);
  });

  it('parses provider JSON code blocks', () => {
    const parsed = parseProviderJsonResponse('模型说明\n```json\n{"briefs":[{"hook":"先看配料表"}]}\n```\n谢谢');

    expect(parsed).toEqual({ briefs: [{ hook: '先看配料表' }] });
  });

  it('falls back when remote returns bad JSON', async () => {
    setSessionLLMProviderConfig({
      providerId: 'openai-compatible',
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'sk-test-secret',
      model: 'mock-model',
      enabled: true,
      source: 'user_session',
    });
    vi.stubGlobal('fetch', mockChatResponse('不是 JSON'));

    const result = await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
    });

    expect(result.providerId).toBe('local-deterministic');
    expect(result.fallbackUsed).toBe(true);
  });

  it('sanitizes risky remote output', async () => {
    setSessionLLMProviderConfig({
      providerId: 'openai-compatible',
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'sk-test-secret',
      model: 'mock-model',
      enabled: true,
      source: 'user_session',
    });
    vi.stubGlobal('fetch', mockChatResponse(JSON.stringify({
      briefs: [
        {
          hook: '保证减肥，100% 全网最低',
          cta: '错过永远没有',
        },
      ],
    })));

    const result = await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
      count: 1,
    });
    const text = `${result.briefs[0].hook} ${result.briefs[0].cta}`;

    expect(text).not.toContain('保证');
    expect(text).not.toContain('100%');
    expect(text).not.toContain('全网最低');
    expect(result.briefs[0].qualityScore.brandSafety).toBeGreaterThanOrEqual(70);
  });

  it('normalizes remote output with missing fields', async () => {
    setSessionLLMProviderConfig({
      providerId: 'openai-compatible',
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'sk-test-secret',
      model: 'mock-model',
      enabled: true,
      source: 'user_session',
    });
    vi.stubGlobal('fetch', mockChatResponse(JSON.stringify({ briefs: [{ hook: '办公室零食先看成分表。' }] })));

    const result = await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
      count: 1,
    });

    expect(result.briefs[0].visualDirection.length).toBeGreaterThan(0);
    expect(result.briefs[0].voiceoverDirection.length).toBeGreaterThan(0);
    expect(result.briefs[0].reusableStructure.length).toBeGreaterThan(0);
  });

  it('prompt includes guardrails and output schema', () => {
    const prompt = buildBriefGenerationPrompt(project, { count: 6, guardrailMode: 'strict' });

    expect(prompt).toContain(project.productName);
    expect(prompt).toContain('品牌禁区');
    expect(prompt).toContain('不能保证减肥');
    expect(prompt).toContain('JSON');
    expect(prompt).toContain('briefs');
    expect(prompt).not.toContain('保证爆款');
  });

  it('provider audit never contains api key', async () => {
    setSessionLLMProviderConfig({
      providerId: 'openai-compatible',
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'sk-test-secret',
      model: 'mock-model',
      enabled: true,
      source: 'user_session',
    });
    vi.stubGlobal('fetch', mockChatResponse(JSON.stringify({ briefs: [{ hook: '先看成分表。' }] })));

    await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
      count: 1,
    });
    const auditText = JSON.stringify(getProviderAuditLog());

    expect(auditText).toContain('openai-compatible');
    expect(auditText).not.toContain('sk-test-secret');
  });

  it('provider error does not crash engine workflow', async () => {
    const source = createRunFromProject(project).briefs[0] as GeneratedBrief;
    setSessionLLMProviderConfig({
      providerId: 'openai-compatible',
      endpoint: 'https://example.test/v1/chat/completions',
      apiKey: 'sk-test-secret',
      model: 'mock-model',
      enabled: true,
      source: 'user_session',
    });
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network failed with sk-test-secret');
    }) as unknown as typeof fetch);

    const parsed = safeParseProviderResponse('bad response', { briefs: [] });
    const result = await generateBriefsWithProvider(project, {
      providerId: 'openai-compatible',
      fallbackToLocal: true,
      count: 1,
    });

    expect(parsed).toEqual({ briefs: [] });
    expect(result.providerId).toBe('local-deterministic');
    expect(result.briefs.length).toBe(1);
    expect(source.id).toContain('brief-');
    expect(JSON.stringify(getProviderAuditLog())).not.toContain('sk-test-secret');
  });
});
