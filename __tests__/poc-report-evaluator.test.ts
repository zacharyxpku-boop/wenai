import { describe, expect, it } from 'vitest';
import {
  buildPocReportInputFromAdvisor,
  evaluatePocReport,
  getPocAdvisorPreset,
  getPocBenchmarkLane,
  getPocBenchmarkPreset,
  getPocCategoryPlaybook,
  getPocCategoryThreshold,
  getPocDemoScenario,
  POC_BENCHMARK_LANES,
  POC_DEMO_SCENARIOS,
  POC_SCORE_RUBRIC,
  recommendPocBenchmarkPreset,
} from '@/lib/poc-report-evaluator';

describe('poc report evaluator', () => {
  it('pushes contract when delivery quality is strong', () => {
    const result = evaluatePocReport({
      category: 'home',
      benchmarkPreset: 'catalog-launch',
      skuPlanned: 10,
      skuDelivered: 10,
      finalReviewPassRate: 90,
      benchmarkCoverage: 88,
      riskCount: 0,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
    });

    expect(result.acceptanceScore).toBeGreaterThanOrEqual(82);
    expect(result.decision).toBe('push-contract');
    expect(result.contractStatus).toBe('ready');
    expect(result.sla.dueDays).toBe(1);
    expect(result.reportMarkdown).toContain('Contract status: ready');
    expect(result.reportMarkdown).toContain('Commercial motion: Close now');
    expect(result.handoffMarkdown).toContain('wenai POC contract handoff memo');
    expect(result.handoffMarkdown).toContain('Recommended motion: move to main-site contract');
    expect(result.commercial.motion).toBe('close-now');
    expect(result.commercial.priceSignal).toBe('premium-retainer');
    expect(result.commercial.boardMarkdown).toContain('wenai commercial briefing');
    expect(result.commercial.boardMarkdown).toContain('## Proposal checklist');
    expect(result.commercial.boardMarkdown).toContain('## Close plan');
    expect(result.commercial.proposalChecklist).toContain('Payment path is ready on main site');
    expect(result.commercial.closePlan[0]).toEqual({
      day: 'Day 0',
      action: 'Send boss page and buyer follow-up.',
      owner: 'Sales owner',
    });
    expect(result.playbook.label).toBe('Home / living playbook');
    expect(result.reportMarkdown).toContain('## Category playbook');
    expect(result.reportMarkdown).toContain('Lifestyle image direction');
    expect(result.commercial.buyerFollowupMarkdown).toContain('Subject: Close now next step');
    expect(result.commercial.salesPackMarkdown).toContain('wenai POC sales pack');
    expect(result.reportMarkdown).toContain('Catalog launch pack');
  });

  it('recommends iteration or input collection when coverage and pass rate are weak', () => {
    const result = evaluatePocReport({
      category: 'mixed',
      skuPlanned: 10,
      skuDelivered: 6,
      finalReviewPassRate: 60,
      benchmarkCoverage: 52,
      riskCount: 2,
      missingAssetCount: 2,
      reworkCount: 3,
      contentTestReady: false,
      ownerReady: true,
      contractIntent: false,
    });

    expect(result.acceptanceScore).toBeLessThan(74);
    expect(result.decision === 'iterate' || result.decision === 'needs-input').toBe(true);
    expect(result.blockers.length).toBeGreaterThan(0);
    expect(result.contractStatus === 'blocked' || result.contractStatus === 'not-ready').toBe(true);
    expect(result.commercial.motion === 'fix-and-rescore' || result.commercial.motion === 'hold').toBe(true);
    expect(result.commercial.conversionRisks.length).toBeGreaterThan(0);
    expect(result.commercial.boardMarkdown).toContain('Conversion risks');
    expect(result.commercial.proposalChecklist.length).toBe(4);
    expect(result.commercial.closePlan).toHaveLength(3);
    expect(result.commercial.buyerFollowupMarkdown).toContain('Before we proceed');
  });

  it('expands sku when poc is usable but not contract ready', () => {
    const result = evaluatePocReport({
      category: 'home',
      benchmarkPreset: 'creative-test',
      skuPlanned: 10,
      skuDelivered: 9,
      finalReviewPassRate: 82,
      benchmarkCoverage: 78,
      riskCount: 1,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: false,
    });

    expect(result.decision).toBe('expand-sku');
    expect(result.label).toContain('Expand next SKU');
    expect(result.contractStatus).toBe('warm');
    expect(result.commercial.motion).toBe('paid-expansion');
    expect(result.commercial.packageRecommendation).toContain('paid expansion');
    expect(result.commercial.proposalChecklist).toContain('Next SKU batch size is defined');
    expect(result.commercial.closePlan[2].action).toContain('expansion batch');
    expect(result.playbook.label).toBe('Home / living playbook');
    expect(result.reportMarkdown).toContain('## Strengths');
    expect(result.reportMarkdown).toContain('## Blockers');
    expect(result.handoffMarkdown).toContain('expand paid pilot scope');
    expect(result.handoffMarkdown).toContain('hook diversity');
  });

  it('uses stricter thresholds for regulated categories', () => {
    const home = evaluatePocReport({
      category: 'home',
      skuPlanned: 10,
      skuDelivered: 10,
      finalReviewPassRate: 84,
      benchmarkCoverage: 82,
      riskCount: 1,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
    });
    const auto = evaluatePocReport({
      category: 'auto',
      skuPlanned: 10,
      skuDelivered: 10,
      finalReviewPassRate: 84,
      benchmarkCoverage: 82,
      riskCount: 1,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
    });

    expect(getPocCategoryThreshold('auto').maxRiskCount).toBe(0);
    expect(getPocCategoryPlaybook('auto').proposalAngles.join(' ')).toContain('fitment clarity');
    expect(home.decision).toBe('push-contract');
    expect(auto.decision).not.toBe('push-contract');
    expect(auto.blockers).toContain('Final review pass rate is below this category threshold.');
    expect(auto.blockers).toContain('Risk count is above the contract-ready threshold.');
    expect(auto.handoffMarkdown).toContain('## Category proposal angles');
  });

  it('uses high-risk category playbooks for beauty and supplements', () => {
    const beauty = getPocCategoryPlaybook('beauty');
    const supplement = evaluatePocReport({
      category: 'supplement',
      benchmarkPreset: 'market-qa',
      skuPlanned: 10,
      skuDelivered: 10,
      finalReviewPassRate: 86,
      benchmarkCoverage: 83,
      riskCount: 1,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
    });

    expect(beauty.riskChecks.join(' ')).toContain('Unsupported efficacy claim');
    expect(getPocCategoryThreshold('supplement').maxRiskCount).toBe(0);
    expect(supplement.decision).not.toBe('push-contract');
    expect(supplement.playbook.label).toBe('Supplement / wellness playbook');
    expect(supplement.reportMarkdown).toContain('Medical or disease claim');
    expect(supplement.handoffMarkdown).toContain('claim-safety');
  });

  it('returns category quick-start presets for high-value categories', () => {
    const beauty = getPocAdvisorPreset('beauty');
    const apparel = getPocAdvisorPreset('apparel');
    const supplement = getPocAdvisorPreset('supplement');

    expect(beauty.answers.goal).toBe('reduce-risk');
    expect(beauty.answers.riskLevel).toBe('high');
    expect(apparel.answers.skuScope).toBe('large');
    expect(apparel.rationale).toContain('variant-aware');
    expect(supplement.answers.skuScope).toBe('small');
    expect(supplement.answers.riskLevel).toBe('high');
    expect(supplement.rationale).toContain('claim safety');
  });

  it('falls back to catalog preset and exposes competitor-inspired framing', () => {
    const preset = getPocBenchmarkPreset('unknown');
    const lane = getPocBenchmarkLane('creative-test');

    expect(preset.id).toBe('catalog-launch');
    expect(preset.inspiredBy).toContain('Hypotenuse');
    expect(preset.acceptanceFocus).toContain('bulk export readiness');
    expect(POC_BENCHMARK_LANES).toHaveLength(4);
    expect(lane.label).toBe('Creative test lane');
    expect(lane.competitorPattern).toContain('Creative AI tools');
    expect(lane.wenaiMoat).toContain('repeatable creative matrix');
  });

  it('documents the visible POC scoring rubric', () => {
    expect(POC_SCORE_RUBRIC.scoreWeights.map(item => item.label)).toContain('Delivery coverage');
    expect(POC_SCORE_RUBRIC.scoreWeights.map(item => item.weight)).toContain('24%');
    expect(POC_SCORE_RUBRIC.penalties.map(item => item.maxPenalty)).toContain('-25 pts');
    expect(POC_SCORE_RUBRIC.requiredInputs).toContain('review owner');
    expect(POC_SCORE_RUBRIC.outcomeBands.find(item => item.label === 'Push contract')?.condition)
      .toContain('Score >= 82');
    expect(POC_SCORE_RUBRIC.outcomeBands.find(item => item.label === 'Collect inputs first')?.commercialMeaning)
      .toContain('Do not sell yet');
  });

  it('recommends creative test when content testing is ready with benchmark evidence', () => {
    const recommendation = recommendPocBenchmarkPreset({
      category: 'home',
      skuPlanned: 8,
      skuDelivered: 8,
      finalReviewPassRate: 82,
      benchmarkCoverage: 88,
      riskCount: 0,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: false,
    });

    expect(recommendation.preset.id).toBe('creative-test');
    expect(recommendation.reasons.join(' ')).toContain('Content testing is ready');
    expect(recommendation.nextInput).toContain('hook hypotheses');
  });

  it('recommends market QA for sensitive or risky categories', () => {
    const recommendation = recommendPocBenchmarkPreset({
      category: 'auto',
      skuPlanned: 6,
      skuDelivered: 6,
      finalReviewPassRate: 76,
      benchmarkCoverage: 70,
      riskCount: 2,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: false,
      ownerReady: true,
      contractIntent: false,
    });

    expect(recommendation.preset.id).toBe('market-qa');
    expect(recommendation.reasons.join(' ')).toContain('Risk');
    expect(recommendation.nextInput).toContain('restricted claims');
  });

  it('builds a creative-test POC input from advisor answers', () => {
    const result = buildPocReportInputFromAdvisor({
      goal: 'test-creative',
      category: 'home',
      skuScope: 'poc',
      materialState: 'ready',
      benchmarkState: 'strong',
      riskLevel: 'low',
      contractIntent: true,
    });

    expect(result.input).toMatchObject({
      category: 'home',
      benchmarkPreset: 'creative-test',
      skuPlanned: 10,
      skuDelivered: 10,
      finalReviewPassRate: 84,
      benchmarkCoverage: 86,
      riskCount: 0,
      missingAssetCount: 0,
      contentTestReady: true,
      contractIntent: true,
    });
    expect(result.summary).toContain('Creative test pack');
    expect(result.assumptions).toContain('Benchmark state translated into 86% coverage.');
  });

  it('builds a market QA input when advisor flags high risk', () => {
    const advisor = buildPocReportInputFromAdvisor({
      goal: 'reduce-risk',
      category: 'auto',
      skuScope: 'small',
      materialState: 'partial',
      benchmarkState: 'some',
      riskLevel: 'high',
      contractIntent: false,
    });
    const evaluated = evaluatePocReport(advisor.input);

    expect(advisor.input.benchmarkPreset).toBe('market-qa');
    expect(advisor.input.skuPlanned).toBe(5);
    expect(advisor.input.skuDelivered).toBe(4);
    expect(advisor.input.riskCount).toBe(3);
    expect(advisor.input.contentTestReady).toBe(false);
    expect(evaluated.contractStatus).toBe('blocked');
    expect(evaluated.blockers).toContain('Risk count is above the contract-ready threshold.');
  });

  it('builds a feed ops input when advisor reports missing materials', () => {
    const result = buildPocReportInputFromAdvisor({
      goal: 'fix-feed',
      category: 'mixed',
      skuScope: 'large',
      materialState: 'missing',
      benchmarkState: 'none',
      riskLevel: 'medium',
      contractIntent: false,
    });

    expect(result.input.benchmarkPreset).toBe('feed-ops');
    expect(result.input.skuPlanned).toBe(20);
    expect(result.input.skuDelivered).toBe(13);
    expect(result.input.finalReviewPassRate).toBe(55);
    expect(result.input.benchmarkCoverage).toBe(42);
    expect(result.input.missingAssetCount).toBe(3);
    expect(result.summary).toContain('missing materials');
  });

  it('exposes demo scenarios for customer self-serve walkthroughs', () => {
    const homeScenario = getPocDemoScenario('home-ready');
    const supplementScenario = getPocDemoScenario('supplement-hold');

    expect(POC_DEMO_SCENARIOS.length).toBeGreaterThanOrEqual(4);
    expect(homeScenario?.input.contractIntent).toBe(true);
    expect(supplementScenario?.input.category).toBe('supplement');

    const supplementResult = evaluatePocReport(supplementScenario!.input);
    expect(supplementResult.contractStatus).toBe('blocked');
    expect(supplementResult.playbook.label).toBe('Supplement / wellness playbook');
    expect(supplementResult.commercial.motion).toBe('fix-and-rescore');
    expect(supplementResult.commercial.conversionRisks.join(' ')).toContain('compliance risk');
  });
});
