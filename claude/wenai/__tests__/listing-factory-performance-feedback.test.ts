import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  analyzePerformancePatterns,
  buildDeliveryPackage,
  buildPerformanceFeedbackReport,
  buildRegenerationPlan,
  calculatePerformanceMetrics,
  createListingProject,
  createRunFromProject,
  exportListingFactoryRun,
  importListingFactoryRun,
  importPerformanceCsv,
  inferPlatformCsvFieldMapping,
  normalizePerformanceRecord,
  parsePerformanceCsv,
  summarizePerformance,
  type ContentPerformanceRecord,
} from '@/lib/listing-factory-engine';

describe('listing factory performance feedback layer', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[0], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
  const sampleCsv = [
    'platform,contentType,hook,impressions,views,clicks,likes,comments,saves,shares,conversionRate,revenue,cost,notes',
    `"${project.targetPlatforms[0]}","${run.briefs[0].contentType}","${run.briefs[0].hook}",1000,700,50,80,8,20,12,0.04,420,120,"strong opening"`,
    `"${project.targetPlatforms[1] || 'Instagram'}","${run.briefs[1].contentType}","${run.briefs[1].hook}",900,500,18,20,3,5,4,0.01,80,100,"weak proof"`,
    `"${project.targetPlatforms[0]}","${run.briefs[2].contentType}","${run.briefs[2].hook}",1400,920,70,96,11,33,20,0.05,520,130,"winning angle"`,
  ].join('\n');

  function records(): ContentPerformanceRecord[] {
    return importPerformanceCsv(run, sampleCsv, new Date('2026-05-12T10:00:00Z')).records;
  }

  it('parses basic performance CSV rows', () => {
    const rows = parsePerformanceCsv(sampleCsv);

    expect(rows).toHaveLength(3);
    expect(rows[0].platform).toBe(project.targetPlatforms[0]);
    expect(rows[0].impressions).toBe('1000');
  });

  it('handles bad CSV without crashing and returns warnings or errors', () => {
    const result = importPerformanceCsv(run, 'platform,hook\nTikTok,"thin row"', new Date('2026-05-12T10:00:00Z'));
    const empty = importPerformanceCsv(run, '', new Date('2026-05-12T10:00:00Z'));

    expect(result.records).toHaveLength(1);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(empty.errors.length).toBeGreaterThan(0);
  });

  it('maps common commerce performance headers without case or suffix brittleness', () => {
    const candidates = inferPlatformCsvFieldMapping(['Impressions', 'clicks', 'Ad Spend', 'Orders', 'Sales']);
    const mapped = Object.fromEntries(candidates.map(candidate => [candidate.originalHeader, candidate.normalizedField]));

    expect(mapped.Impressions).toBe('impressions');
    expect(mapped.clicks).toBe('clicks');
    expect(mapped['Ad Spend']).toBe('spend');
    expect(mapped.Orders).toBe('orders');
    expect(mapped.Sales).toBe('revenue');
  });

  it('calculates CTR, engagement rate and ROAS safely', () => {
    const record = normalizePerformanceRecord({
      platform: 'TikTok',
      contentType: 'FAQ',
      hook: 'How to check before buying',
      impressions: 1000,
      views: 500,
      clicks: 25,
      likes: 40,
      comments: 5,
      saves: 10,
      shares: 5,
      revenue: 300,
      cost: 100,
      source: 'manual_entry',
    }, run);
    const zero = calculatePerformanceMetrics({ ...record, impressions: 0, views: 0, revenue: 1, cost: 0 });

    expect(record.ctr).toBe(0.025);
    expect(record.engagementRate).toBe(0.12);
    expect(record.roas).toBe(3);
    expect(zero.ctr).toBe(0);
    expect(zero.engagementRate).toBe(0);
  });

  it('summarizes performance and identifies top platform/content type', () => {
    const summary = summarizePerformance(records());

    expect(summary.totalRecords).toBe(3);
    expect(summary.totalImpressions).toBe(3300);
    expect(summary.topPlatform).toBe(project.targetPlatforms[0]);
    expect(summary.topContentType.length).toBeGreaterThan(0);
  });

  it('analyzes performance patterns for top platform and content type', () => {
    const insights = analyzePerformancePatterns(run, records());

    expect(insights.some(item => item.type === 'platform_signal')).toBe(true);
    expect(insights.some(item => item.type === 'audience_signal')).toBe(true);
    expect(insights.some(item => item.type === 'winning_pattern')).toBe(true);
  });

  it('builds a next-round regeneration plan', () => {
    const performanceRecords = records();
    const insights = analyzePerformancePatterns({ ...run, performanceRecords }, performanceRecords);
    const plan = buildRegenerationPlan({ ...run, performanceRecords }, insights);

    expect(plan.projectId).toBe(project.id);
    expect(plan.nextBriefAngles.length).toBeGreaterThan(0);
    expect(plan.suggestedGenerationInstruction).toContain('\u653e\u5927\u80dc\u51fa\u7ed3\u6784');
    expect(plan.riskNotes.join(' ')).toContain('\u624b\u52a8\u5f55\u5165\u6216 CSV');
  });

  it('builds a feedback report with markdown and client summary', () => {
    const performanceRecords = records();
    const performanceInsights = analyzePerformancePatterns({ ...run, performanceRecords }, performanceRecords);
    const regenerationPlan = buildRegenerationPlan({ ...run, performanceRecords }, performanceInsights);
    const report = buildPerformanceFeedbackReport({ ...run, performanceRecords, performanceInsights, regenerationPlan });

    expect(report.markdown).toContain('\u8868\u73b0\u53cd\u9988\u62a5\u544a');
    expect(report.markdown).toContain('\u771f\u5b9e\u5e73\u53f0 API');
    expect(report.clientSummary.length).toBeGreaterThan(10);
    expect(report.csv).toContain('platform');
  });

  it('adds performance feedback exports to the delivery package', () => {
    const performanceRecords = records();
    const performanceInsights = analyzePerformancePatterns({ ...run, performanceRecords }, performanceRecords);
    const regenerationPlan = buildRegenerationPlan({ ...run, performanceRecords }, performanceInsights);
    const performanceFeedbackReport = buildPerformanceFeedbackReport({ ...run, performanceRecords, performanceInsights, regenerationPlan });
    const deliveryPackage = buildDeliveryPackage({ ...run, performanceRecords, performanceInsights, regenerationPlan, performanceFeedbackReport });

    expect(deliveryPackage.performanceFeedbackMarkdown).toContain('\u8868\u73b0\u53cd\u9988\u62a5\u544a');
    expect(deliveryPackage.performanceRecordsCsv).toContain('engagementRate');
    expect(deliveryPackage.regenerationPlanMarkdown).toContain('\u518d\u751f\u6210\u8ba1\u5212');
  });

  it('preserves performance records through export/import', () => {
    const performanceRecords = records();
    const performanceInsights = analyzePerformancePatterns({ ...run, performanceRecords }, performanceRecords);
    const regenerationPlan = buildRegenerationPlan({ ...run, performanceRecords }, performanceInsights);
    const performanceFeedbackReport = buildPerformanceFeedbackReport({ ...run, performanceRecords, performanceInsights, regenerationPlan });
    const enrichedRun = {
      ...run,
      performanceRecords,
      performanceInsights,
      regenerationPlan,
      performanceFeedbackReport,
      deliveryPackage: buildDeliveryPackage({ ...run, performanceRecords, performanceInsights, regenerationPlan, performanceFeedbackReport }),
    };
    const imported = importListingFactoryRun(exportListingFactoryRun(enrichedRun));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.performanceRecords).toHaveLength(3);
      expect(imported.run.performanceFeedbackReport.markdown).toContain('\u8868\u73b0\u53cd\u9988\u62a5\u544a');
    }
  });

  it('stays local-first and does not imply real platform API access', () => {
    const report = buildPerformanceFeedbackReport({ ...run, performanceRecords: records() });

    expect(report.markdown).toContain('\u771f\u5b9e\u5e73\u53f0 API');
    expect(report.markdown).not.toContain('TikTok API connected');
    expect(report.markdown).not.toContain('Amazon Ads API');
  });
});

