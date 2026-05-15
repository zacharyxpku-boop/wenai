import { describe, expect, it } from 'vitest';
import {
  buildPocReport,
  clearListingFactoryLocalData,
  createListingProject,
  detectRestrictedClaims,
  exportBriefsCsv,
  exportMarkdownReport,
  exportProjectJson,
  generateBriefs,
  futureLLMProvider,
  loadGeneratedBriefs,
  loadListingProjects,
  localDeterministicProvider,
  sanitizeRiskyCopy,
  saveGeneratedBriefs,
  saveListingProject,
  scoreBrandSafety,
  summarizeGuardrailImpact,
  type StorageLike,
} from '@/lib/listing-factory-engine';

function createMemoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: key => {
      data.delete(key);
    },
  };
}

const projectInput = {
  productName: '可折叠宠物慢食碗',
  category: '宠物用品',
  targetPlatforms: ['TikTok', '小红书', 'Shopify'],
  priceBand: '99-149 元',
  sellingPoints: ['可折叠收纳', '减慢进食速度', '户外便携'],
  targetAudience: '养中小型犬、经常带宠物出门的年轻家庭',
  contentGoal: '上新转化',
  brandGuardrails: ['不能绝对化承诺', '不能治疗 / 医疗功效', '不能贬低竞品', '不能承诺立刻见效'],
  categoryRules: ['避免替代兽医建议', '需要说明适用宠物体型', '补充清洁方式'],
  competitorNotes: '参考同类慢食碗内容，但不点名对比具体品牌。',
};

describe('listing factory engine', () => {
  it('creates a local ListingProject with stable defaults', () => {
    const project = createListingProject(projectInput, new Date('2026-05-12T10:00:00Z'));

    expect(project.id).toContain('project-');
    expect(project.productName).toBe(projectInput.productName);
    expect(project.targetPlatforms).toEqual(projectInput.targetPlatforms);
    expect(project.createdAt).toBe('2026-05-12T10:00:00.000Z');
    expect(project.updatedAt).toBe(project.createdAt);
  });

  it('generates at least six constrained briefs from a real SKU', () => {
    const project = createListingProject(projectInput);
    const briefs = generateBriefs(project);

    expect(briefs.length).toBeGreaterThanOrEqual(6);
    expect(new Set(briefs.map(brief => brief.platform)).size).toBeGreaterThanOrEqual(2);
    expect(briefs.every(brief => brief.projectId === project.id)).toBe(true);
    expect(briefs.every(brief => brief.status === 'draft' || brief.status === 'pending_review')).toBe(true);
    expect(briefs.every(brief => brief.qualityScore.overall >= 60)).toBe(true);
    expect(localDeterministicProvider.id).toBe('local-deterministic');
    expect(futureLLMProvider.status).toBe('planned');
  });

  it('lets brand guardrails affect risk notes and brand safety scores', () => {
    const project = createListingProject(projectInput);
    const briefs = generateBriefs(project);

    expect(summarizeGuardrailImpact(project)).toContain('不能绝对化承诺');
    expect(briefs.some(brief => brief.riskNotes.some(note => note.includes('绝对化') || note.includes('医疗')))).toBe(true);
    expect(briefs.every(brief => brief.qualityScore.brandSafety >= 90)).toBe(true);
    expect(scoreBrandSafety('保证立刻见效，治疗宠物进食问题', project.brandGuardrails).score).toBeLessThan(70);
  });

  it('sanitizes risky copy and keeps restricted claims out of generated hooks', () => {
    const project = createListingProject(projectInput);
    const sanitized = sanitizeRiskyCopy('保证立刻见效，治疗挑食，吊打竞品', project.brandGuardrails);

    expect(sanitized).not.toContain('保证');
    expect(sanitized).not.toContain('立刻见效');
    expect(sanitized).not.toContain('治疗');
    expect(sanitized).not.toContain('吊打');

    for (const brief of generateBriefs(project)) {
      expect(detectRestrictedClaims(brief.hook, project.brandGuardrails)).toEqual([]);
    }
  });

  it('builds a POC report from the real project and generated briefs', () => {
    const project = createListingProject(projectInput);
    const briefs = generateBriefs(project);
    const report = buildPocReport(project, briefs);

    expect(report.projectId).toBe(project.id);
    expect(report.briefCount).toBe(briefs.length);
    expect(report.clientSummary).toContain(project.productName);
    expect(report.executionPriority.length).toBeGreaterThanOrEqual(3);
    expect(report.pricingRecommendation).toMatch(/Starter|Growth|Enterprise/);
  });

  it('exports markdown, CSV, and project JSON strings', () => {
    const project = createListingProject(projectInput);
    const briefs = generateBriefs(project);
    const report = buildPocReport(project, briefs);
    const markdown = exportMarkdownReport(project, report, briefs);
    const csv = exportBriefsCsv(briefs);
    const json = exportProjectJson(project);

    expect(markdown).toContain('# POC 试跑交付报告');
    expect(markdown).toContain(project.productName);
    expect(csv.split('\n')[0]).toContain('hook');
    expect(csv).toContain(project.id);
    expect(JSON.parse(json).productName).toBe(project.productName);
  });

  it('saves and loads local projects and briefs through storage adapter fallback', () => {
    const storage = createMemoryStorage();
    const project = createListingProject(projectInput);
    const briefs = generateBriefs(project);

    clearListingFactoryLocalData(storage);
    saveListingProject(project, storage);
    saveGeneratedBriefs(project.id, briefs, storage);

    expect(loadListingProjects(storage)).toHaveLength(1);
    expect(loadGeneratedBriefs(project.id, storage)).toHaveLength(briefs.length);

    clearListingFactoryLocalData(storage);
    expect(loadListingProjects(storage)).toEqual([]);
    expect(loadGeneratedBriefs(project.id, storage)).toEqual([]);
  });
});
