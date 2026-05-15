import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  buildPocReport,
  createListingProject,
  detectRestrictedClaims,
  evaluateBriefQuality,
  generateBriefs,
} from '@/lib/listing-factory-engine';

const forbiddenWords = [
  '保证',
  '必然',
  '100%',
  '永久',
  '根治',
  '治疗',
  '治愈',
  '药效',
  '临床保证',
  '吊打',
  '碾压',
  '秒杀所有竞品',
  '全网最低',
  '最后一天',
  '错过永远没有',
  '立刻见效',
  '一天改变',
  '马上瘦',
];

describe('listing factory engine sample pressure test', () => {
  it('keeps eight realistic SKU samples available for QA', () => {
    expect(LISTING_FACTORY_QA_SAMPLES).toHaveLength(8);
    for (const sample of LISTING_FACTORY_QA_SAMPLES) {
      expect(sample.productName).toBeTruthy();
      expect(sample.category).toBeTruthy();
      expect(sample.targetPlatforms.length).toBeGreaterThanOrEqual(2);
      expect(sample.brandGuardrails.length).toBeGreaterThanOrEqual(3);
      expect(sample.categoryRules.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('generates deliverable constrained briefs and consultant reports for every sample', () => {
    const allHooks = new Set<string>();
    const firstHookByCategory = new Map<string, string>();

    for (const sample of LISTING_FACTORY_QA_SAMPLES) {
      const project = createListingProject(sample, new Date('2026-05-12T08:00:00Z'));
      const briefs = generateBriefs(project, { count: 8 });
      const report = buildPocReport(project, briefs);

      expect(briefs.length).toBeGreaterThanOrEqual(6);
      expect(new Set(briefs.map(brief => brief.contentType)).size).toBeGreaterThanOrEqual(3);
      expect(report.clientSummary).toContain(project.productName);
      expect(report.clientSummary).toMatch(/建议|本轮|第一轮|正式生产/);
      expect(report.recommendedContentAngles.length).toBeGreaterThanOrEqual(2);
      expect(report.executionPriority.length).toBeGreaterThanOrEqual(3);
      expect(report.qualityScoreRange).toMatch(/\d+-\d+/);
      expect(report.firstRoundProductionCount).toBeGreaterThanOrEqual(6);

      for (const brief of briefs) {
        allHooks.add(brief.hook);
        expect(brief.hook.length).toBeGreaterThan(16);
        expect(brief.visualDirection).toBeTruthy();
        expect(brief.voiceoverDirection).toBeTruthy();
        expect(brief.cta).toBeTruthy();
        expect(brief.riskNotes.length).toBeGreaterThan(0);
        expect(brief.qualityScore.overallScore).toBeGreaterThanOrEqual(60);
        expect(brief.qualityScore.overallScore).toBeLessThanOrEqual(100);
        expect(evaluateBriefQuality(brief, project).visualClarity).toBeGreaterThanOrEqual(60);

        for (const word of forbiddenWords) {
          expect(brief.hook).not.toContain(word);
          expect(brief.cta).not.toContain(word);
        }
        expect(detectRestrictedClaims(`${brief.hook} ${brief.cta}`, project.brandGuardrails)).toEqual([]);
      }

      const previous = firstHookByCategory.get(project.category);
      if (previous) {
        expect(previous).not.toBe(briefs[0].hook);
      }
      firstHookByCategory.set(project.category, briefs[0].hook);
    }

    expect(allHooks.size).toBeGreaterThan(LISTING_FACTORY_QA_SAMPLES.length);
  });
});
