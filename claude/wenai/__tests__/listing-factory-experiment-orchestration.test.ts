import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  analyzeExperimentResults,
  analyzePerformancePatterns,
  buildAssetLineageRecords,
  buildContentExperimentTraceGraph,
  buildContentExperimentTraceMarkdown,
  buildDeliveryPackage,
  buildCrossRunComparisonResult,
  buildCrossRunLearningRecords,
  buildCrossRunVariableSummary,
  buildExperimentArchiveRecord,
  buildExperimentCadencePlan,
  buildExperimentCsvTemplate,
  buildExperimentDecisionSummary,
  buildExperimentEvidenceTraces,
  buildExperimentExecutionPlaybook,
  buildExperimentLearningGapMap,
  buildExperimentMetricWindows,
  buildExperimentMemorySummary,
  buildExperimentOperatorChecklist,
  buildExperimentPlanFromInsights,
  buildExperimentPriorityQueue,
  buildExperimentSequencingPlan,
  buildExperimentValidationPolicy,
  buildExperimentVariantMatrix,
  buildExperimentWorkbenchBoard,
  buildListingFactoryRunHistoryItem,
  buildLearningTimeline,
  buildMerchantLearningArchive,
  buildPlatformDataContract,
  buildPlatformDataReadinessSummary,
  buildPlatformCsvAdapterPresets,
  buildPlatformCsvFixtures,
  buildPlatformCsvImportPreviewSummary,
  buildPlatformCsvMappingPreview,
  buildPlatformCsvRegressionSnapshot,
  buildPlatformCsvRegressionSnapshotMarkdown,
  buildPlatformCsvRehearsalMarkdown,
  buildPlatformCsvRehearsalSummary,
  buildPlatformExportVersionRegistry,
  buildPlatformExportVersionRegistryMarkdown,
  buildPlatformFieldMapping,
  buildPlatformImportQualityReport,
  buildPlatformImportTemplate,
  buildTraceabilitySummaryMarkdown,
  buildTrackingNamingConvention,
  clearListingFactoryLocalData,
  createListingProject,
  createRunFromProject,
  exportListingFactoryRun,
  importListingFactoryRun,
  importPerformanceCsv,
  inferPlatformCsvFieldMapping,
  detectPlatformExportVersion,
  runPlatformCsvRehearsal,
  loadLatestListingFactorySnapshot,
  normalizePlatformMetricRecords,
  saveListingFactoryRun,
  searchMerchantLearningArchive,
  validatePlatformImportRows,
  exportPlatformCsvMappingPreset,
  type ContentPerformanceRecord,
  type ExperimentPlan,
  type ExperimentReport,
} from '@/lib/listing-factory-engine';

describe('listing factory experiment orchestration layer', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[0], new Date('2026-05-12T09:00:00Z'));
  const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));
  const csv = [
    'platform,contentType,hook,impressions,views,clicks,likes,comments,saves,shares,conversionRate,revenue,cost,notes',
    `"${project.targetPlatforms[0]}","${run.briefs[0].contentType}","${run.briefs[0].hook}",1200,800,72,90,12,24,14,0.04,420,120,"winner"`,
    `"${project.targetPlatforms[1] || 'Instagram'}","${run.briefs[1].contentType}","${run.briefs[1].hook}",1000,600,20,18,2,4,3,0.01,80,100,"weak"`,
  ].join('\n');

  function performanceRecords(): ContentPerformanceRecord[] {
    return importPerformanceCsv(run, csv, new Date('2026-05-12T10:00:00Z')).records;
  }

  function plan() {
    const records = performanceRecords();
    const insights = analyzePerformancePatterns({ ...run, performanceRecords: records }, records);
    return buildExperimentPlanFromInsights({ ...run, performanceRecords: records }, insights, {
      goal: 'Test next-round hooks from local feedback',
      targetPlatforms: project.targetPlatforms.slice(0, 2),
      maxCells: 3,
      primaryMetric: 'ctr',
      now: new Date('2026-05-12T09:00:00Z'),
    });
  }

  function experimentRecord(
    experimentPlan: ReturnType<typeof plan>,
    overrides: Partial<ContentPerformanceRecord> & { cellId?: string; notes: string; trackingCode: string; clicks: number; impressions: number },
  ): ContentPerformanceRecord {
    const base = performanceRecords()[0];
    return {
      ...base,
      ...overrides,
      id: overrides.id || `${overrides.trackingCode}-${overrides.notes}`,
      experimentId: experimentPlan.id,
      cellId: overrides.cellId || experimentPlan.experimentCells[0].id,
      trackingCode: overrides.trackingCode,
      notes: overrides.notes,
      clicks: overrides.clicks,
      impressions: overrides.impressions,
    };
  }

  function learningVariableType(variableType: ExperimentPlan['experimentCells'][number]['variableType']) {
    if (variableType === 'visual_angle') return 'angle';
    if (variableType === 'proof_point') return 'offer';
    if (variableType === 'content_type') return 'format';
    return variableType;
  }

  it('builds an experiment plan from performance insights', () => {
    const experimentPlan = plan();

    expect(experimentPlan.hypothesis).toContain('change only');
    expect(experimentPlan.successMetrics[0]).toMatchObject({ name: 'ctr', priority: 'primary' });
    expect(experimentPlan.experimentCells.length).toBeGreaterThanOrEqual(2);
    expect(experimentPlan.productionAssignments.length).toBeGreaterThan(0);
  });

  it('keeps each cell focused on one main variable', () => {
    const experimentPlan = plan();

    for (const cell of experimentPlan.experimentCells) {
      expect(['hook', 'audience', 'visual_angle', 'cta', 'proof_point', 'platform', 'content_type']).toContain(cell.variableType);
      expect(cell.controlValue).not.toEqual('');
      expect(cell.testValue).not.toEqual('');
      expect(cell.expectedLearning).toContain(cell.variableType);
    }
  });

  it('builds a control and variant matrix', () => {
    const experimentPlan = plan();
    const matrix = buildExperimentVariantMatrix(run, experimentPlan);

    expect(matrix.rows).toHaveLength(experimentPlan.experimentCells.length);
    expect(matrix.rows[0].control).toBeTruthy();
    expect(matrix.rows[0].variantA).toBeTruthy();
    expect(matrix.csv).toContain('control,variantA,variantB,variantC');
  });

  it('generates stable tracking naming and CSV template fields', () => {
    const experimentPlan = plan();
    const tracking = buildTrackingNamingConvention(project, experimentPlan);
    const template = buildExperimentCsvTemplate(experimentPlan);

    expect(tracking.namingConvention).toBe('WENAI_{category}_{platform}_{contentType}_{variableType}_{cellId}_{date}');
    expect(tracking.trackingCodes[0]).toContain('WENAI_');
    expect(template.split('\n')[0]).toBe('experimentId,cellId,contentId,platform,contentType,variableType,trackingCode,impressions,views,clicks,likes,comments,saves,shares,conversionRate,revenue,cost,notes');
  });

  it('analyzes experiment results without overclaiming thin data', () => {
    const experimentPlan = plan();
    const thinReport = analyzeExperimentResults(experimentPlan, []);

    expect(thinReport.inconclusiveCells.length).toBe(experimentPlan.experimentCells.length);
    expect(thinReport.learningSummary).toContain('当前数据不足');
    expect(thinReport.confidenceSummary.conclusion).toBe('needs_more_data');
  });

  it('does not call a tiny-sample CTR lift a candidate winner', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const records = [
      experimentRecord(experimentPlan, { id: 'tiny-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 3, impressions: 80, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'tiny-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 8, impressions: 90, notes: 'test variant' }),
    ];
    const report = analyzeExperimentResults(experimentPlan, records);

    expect(report.winningCells).not.toContain(cell.id);
    expect(report.cellConfidence[0].conclusion).not.toBe('candidate_winner');
    expect(report.cellConfidence[0].confidenceLevel).toBe('directional');
  });

  it('marks insufficient-sample CTR uplift as directional only', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const records = [
      experimentRecord(experimentPlan, { id: 'directional-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'directional-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ];
    const report = analyzeExperimentResults(experimentPlan, records);

    expect(report.winningCells).not.toContain(cell.id);
    expect(report.cellConfidence[0].conclusion).toBe('directional_signal');
    expect(report.cellConfidence[0].recommendedAction).toBe('continue_collecting_data');
  });

  it('identifies a sufficient-sample clear lift as a candidate winner', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const records = [
      experimentRecord(experimentPlan, { id: 'winner-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'winner-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 40, impressions: 1000, notes: 'test variant' }),
    ];
    const report = analyzeExperimentResults(experimentPlan, records);

    expect(report.winningCells).toContain(cell.id);
    expect(report.cellConfidence[0].conclusion).toBe('candidate_winner');
    expect(report.cellConfidence[0].recommendedAction).toBe('scale_candidate_winner');
    expect(report.metricDeltas[0].relativeLift).toBeGreaterThanOrEqual(0.1);
  });

  it('keeps close results inconclusive even with enough sample', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const records = [
      experimentRecord(experimentPlan, { id: 'close-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'close-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 42, impressions: 1000, notes: 'test variant' }),
    ];
    const report = analyzeExperimentResults(experimentPlan, records);

    expect(report.winningCells).not.toContain(cell.id);
    expect(report.losingCells).not.toContain(cell.id);
    expect(report.cellConfidence[0].conclusion).toBe('inconclusive');
  });

  it('recalculates CTR from raw clicks and impressions instead of stale fields', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const records = [
      experimentRecord(experimentPlan, { id: 'stale-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, ctr: 0.8, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'stale-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 80, impressions: 1000, ctr: 0.01, notes: 'test variant' }),
    ];
    const report = analyzeExperimentResults(experimentPlan, records);

    expect(report.metricDeltas[0].controlValue).toBe(0.02);
    expect(report.metricDeltas[0].testValue).toBe(0.08);
    expect(report.cellConfidence[0].conclusion).toBe('candidate_winner');
  });

  it('preserves experiment plans through export/import', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const enrichedRun = {
      ...run,
      experimentPlans: [experimentPlan],
      experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
      experimentReports: [report],
    };
    const imported = importListingFactoryRun(exportListingFactoryRun(enrichedRun));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.experimentPlans[0].id).toBe(experimentPlan.id);
      expect(imported.run.experimentVariantMatrices[0].rows.length).toBeGreaterThan(0);
      expect(imported.run.experimentReports[0].confidenceSummary.sampleGuardrail).toContain('曝光');
    }
  });

  it('turns a confident candidate winner into reusable experiment memory', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'mem-win-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'mem-win-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 45, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });

    expect(memory.entries[0].conclusion).toBe('candidate_winner');
    expect(memory.reusablePatterns.length).toBeGreaterThan(0);
    expect(memory.reusablePatterns[0].guidance).toContain('起点');
  });

  it('keeps directional signals in watchlist memory instead of hard truth', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'mem-watch-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'mem-watch-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });

    expect(memory.watchlistPatterns.length).toBeGreaterThan(0);
    expect(memory.reusablePatterns).toHaveLength(0);
    expect(memory.entries[0].conclusion).toBe('directional_signal');
  });

  it('creates avoid or rework guidance for candidate losers', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'mem-lose-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'mem-lose-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 20, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });

    expect(memory.avoidPatterns.length).toBeGreaterThan(0);
    expect(memory.entries[0].avoidRepeatingReason).toContain('落后');
  });

  it('assigns high duplicate risk to a repeated experiment candidate', () => {
    const oldPlan = plan();
    const oldCell = oldPlan.experimentCells[0];
    const oldReport = analyzeExperimentResults(oldPlan, [
      experimentRecord(oldPlan, { id: 'dup-old-control', cellId: oldCell.id, trackingCode: `CONTROL-${oldCell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(oldPlan, { id: 'dup-old-test', cellId: oldCell.id, trackingCode: `TEST-${oldCell.id}`, clicks: 40, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [oldPlan], experimentReports: [oldReport] });
    const newPlan: ExperimentPlan = {
      ...oldPlan,
      id: `${oldPlan.id}-repeat`,
      updatedAt: new Date('2026-06-01T09:00:00Z').toISOString(),
    };
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [newPlan] }, memory);

    expect(queue.candidates[0].duplicateRisk).toBe('high');
    expect(queue.candidates[0].nextRecommendedTest).toContain('不要原样重跑');
  });

  it('ranks high-confidence non-duplicate candidates above weak duplicate ones', () => {
    const basePlan = plan();
    const memorySourcePlan: ExperimentPlan = {
      ...basePlan,
      id: `${basePlan.id}-memory`,
      experimentCells: [
        { ...basePlan.experimentCells[0], id: 'memory-audience', variableType: 'audience', controlValue: 'broad buyer', testValue: 'daily commuter buyer', name: 'Audience commuter test' },
        { ...basePlan.experimentCells[1], id: 'memory-hook', variableType: 'hook', controlValue: 'generic opener', testValue: 'generic opener v2', name: 'Hook repeat test' },
      ],
      hypothesis: 'Keep the control stable and test either a commuter audience or a generic hook refresh.',
    };
    const memorySourceReport: ExperimentReport = {
      experimentId: memorySourcePlan.id,
      winningCells: ['memory-audience'],
      losingCells: ['memory-hook'],
      inconclusiveCells: [],
      metricDeltas: [
        { cellId: 'memory-audience', metric: 'ctr', controlValue: 0.02, testValue: 0.05, delta: 0.03, relativeLift: 1.5, conclusion: 'winner' as const },
        { cellId: 'memory-hook', metric: 'ctr', controlValue: 0.04, testValue: 0.02, delta: -0.02, relativeLift: -0.5, conclusion: 'loser' as const },
      ],
      cellConfidence: [
        { cellId: 'memory-audience', metric: 'ctr', confidenceLevel: 'strong' as const, conclusion: 'candidate_winner' as const, recommendedAction: 'scale_candidate_winner' as const, sampleSufficient: true, sampleGuardrail: 'Need >= 500 impressions and >= 20 clicks per control/test cell.', missingGuardrails: [], controlRecords: 1, testRecords: 1, controlImpressions: 1000, testImpressions: 1000, controlClicks: 20, testClicks: 50, controlValue: 0.02, testValue: 0.05, delta: 0.03, relativeLift: 1.5, explanation: 'Audience test won with enough sample.' },
        { cellId: 'memory-hook', metric: 'ctr', confidenceLevel: 'moderate' as const, conclusion: 'candidate_loser' as const, recommendedAction: 'retire_weak_variant' as const, sampleSufficient: true, sampleGuardrail: 'Need >= 500 impressions and >= 20 clicks per control/test cell.', missingGuardrails: [], controlRecords: 1, testRecords: 1, controlImpressions: 1000, testImpressions: 1000, controlClicks: 40, testClicks: 20, controlValue: 0.04, testValue: 0.02, delta: -0.02, relativeLift: -0.5, explanation: 'Hook test lost with enough sample.' },
      ],
      confidenceSummary: {
        experimentId: memorySourcePlan.id,
        confidenceLevel: 'strong' as const,
        conclusion: 'candidate_winner' as const,
        recommendedAction: 'scale_candidate_winner' as const,
        sampleGuardrail: 'Need >= 500 impressions and >= 20 clicks per control/test cell.',
        sufficientCellCount: 2,
        directionalCellCount: 0,
        candidateWinnerCount: 1,
        candidateLoserCount: 1,
        inconclusiveCellCount: 0,
        needsMoreDataCellCount: 0,
        briefExplanation: 'One audience win and one hook loser.',
      },
      learningSummary: 'Memory source',
      nextAction: 'Scale audience and retire weak hook.',
      markdown: 'memory report',
    };
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [memorySourcePlan], experimentReports: [memorySourceReport] });
    const queuePlan: ExperimentPlan = {
      ...basePlan,
      id: `${basePlan.id}-queue`,
      updatedAt: new Date('2026-06-10T09:00:00Z').toISOString(),
      hypothesis: 'Prioritize the next experiment queue from stored local learnings.',
      experimentCells: [
        { ...basePlan.experimentCells[0], id: 'queue-audience', variableType: 'audience', controlValue: 'broad buyer', testValue: 'commuter bundle shopper', name: 'Audience expansion test' },
        { ...basePlan.experimentCells[1], id: 'queue-hook', variableType: 'hook', controlValue: 'generic opener', testValue: 'generic opener v2', name: 'Duplicate hook retry' },
      ],
    };
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [queuePlan] }, memory);

    expect(queue.candidates[0].cellId).toBe('queue-audience');
    expect(queue.candidates[0].priorityScore).toBeGreaterThan(queue.candidates[1].priorityScore);
    expect(queue.candidates[1].duplicateRisk).toBe('high');
  });

  it('marks strong winner variables as learned in the gap map', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'gap-win-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'gap-win-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 45, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);

    expect(gapMap.gaps.find(item => item.variableType === learningVariableType(cell.variableType))?.status).toBe('learned');
  });

  it('marks directional results as directional and not learned in the gap map', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'gap-dir-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'gap-dir-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);

    const gap = gapMap.gaps.find(item => item.variableType === learningVariableType(cell.variableType));
    expect(gap?.status).toBe('directional');
    expect(gap?.status).not.toBe('learned');
  });

  it('turns inconclusive results into cleaner retest recommendations', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'gap-inc-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'gap-inc-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 42, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);

    const gap = gapMap.gaps.find(item => item.variableType === learningVariableType(cell.variableType));
    expect(gap?.status).toBe('inconclusive');
    expect(gap?.recommendedNextMove).toContain('重测');
  });

  it('marks never-tested variables as unknown gaps', () => {
    const gapMap = buildExperimentLearningGapMap(run);

    expect(gapMap.gaps.find(item => item.variableType === 'asset')?.status).toBe('unknown');
    expect(gapMap.gaps.find(item => item.variableType === 'price_message')?.status).toBe('unknown');
  });

  it('deprioritizes duplicate-heavy candidates in the sequencing plan', () => {
    const basePlan = plan();
    const memorySourcePlan: ExperimentPlan = {
      ...basePlan,
      id: `${basePlan.id}-sequence-memory`,
      experimentCells: [
        { ...basePlan.experimentCells[0], id: 'sequence-audience-memory', variableType: 'audience', controlValue: 'broad buyer', testValue: 'daily commuter buyer', name: 'Audience commuter memory' },
        { ...basePlan.experimentCells[1], id: 'sequence-hook-memory', variableType: 'hook', controlValue: 'generic opener', testValue: 'generic opener v2', name: 'Hook duplicate memory' },
      ],
    };
    const memorySourceReport: ExperimentReport = {
      experimentId: memorySourcePlan.id,
      winningCells: ['sequence-audience-memory'],
      losingCells: ['sequence-hook-memory'],
      inconclusiveCells: [],
      metricDeltas: [
        { cellId: 'sequence-audience-memory', metric: 'ctr', controlValue: 0.02, testValue: 0.05, delta: 0.03, relativeLift: 1.5, conclusion: 'winner' },
        { cellId: 'sequence-hook-memory', metric: 'ctr', controlValue: 0.04, testValue: 0.02, delta: -0.02, relativeLift: -0.5, conclusion: 'loser' },
      ],
      cellConfidence: [
        { cellId: 'sequence-audience-memory', metric: 'ctr', confidenceLevel: 'strong', conclusion: 'candidate_winner', recommendedAction: 'scale_candidate_winner', sampleSufficient: true, sampleGuardrail: 'Need >= 500 impressions and >= 20 clicks per control/test cell.', missingGuardrails: [], controlRecords: 1, testRecords: 1, controlImpressions: 1000, testImpressions: 1000, controlClicks: 20, testClicks: 50, controlValue: 0.02, testValue: 0.05, delta: 0.03, relativeLift: 1.5, explanation: 'Audience test won.' },
        { cellId: 'sequence-hook-memory', metric: 'ctr', confidenceLevel: 'moderate', conclusion: 'candidate_loser', recommendedAction: 'retire_weak_variant', sampleSufficient: true, sampleGuardrail: 'Need >= 500 impressions and >= 20 clicks per control/test cell.', missingGuardrails: [], controlRecords: 1, testRecords: 1, controlImpressions: 1000, testImpressions: 1000, controlClicks: 40, testClicks: 20, controlValue: 0.04, testValue: 0.02, delta: -0.02, relativeLift: -0.5, explanation: 'Hook test lost.' },
      ],
      confidenceSummary: {
        experimentId: memorySourcePlan.id,
        confidenceLevel: 'strong',
        conclusion: 'candidate_winner',
        recommendedAction: 'scale_candidate_winner',
        sampleGuardrail: 'Need >= 500 impressions and >= 20 clicks per control/test cell.',
        sufficientCellCount: 2,
        directionalCellCount: 0,
        candidateWinnerCount: 1,
        candidateLoserCount: 1,
        inconclusiveCellCount: 0,
        needsMoreDataCellCount: 0,
        briefExplanation: 'Audience winner and hook loser.',
      },
      learningSummary: 'sequence memory',
      nextAction: 'Validate audience before touching hook again.',
      markdown: 'sequence memory report',
    };
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [memorySourcePlan], experimentReports: [memorySourceReport] });
    const queuePlan: ExperimentPlan = {
      ...basePlan,
      id: `${basePlan.id}-sequence-queue`,
      experimentCells: [
        { ...basePlan.experimentCells[0], id: 'sequence-audience-queue', variableType: 'audience', controlValue: 'broad buyer', testValue: 'commuter bundle shopper', name: 'Audience expansion test' },
        { ...basePlan.experimentCells[1], id: 'sequence-hook-queue', variableType: 'hook', controlValue: 'generic opener', testValue: 'generic opener v2', name: 'Duplicate hook retry' },
      ],
      updatedAt: new Date('2026-06-10T09:00:00Z').toISOString(),
    };
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [queuePlan] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [queuePlan] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [queuePlan] }, gapMap, queue, memory);

    const hookStep = sequencingPlan.steps.find(step => step.primaryVariableType === 'hook');
    const audienceStep = sequencingPlan.steps.find(step => step.primaryVariableType === 'audience');
    expect(hookStep?.duplicateRisk).toBe('high');
    expect(hookStep && audienceStep ? hookStep.stepNumber > audienceStep.stepNumber : false).toBe(true);
  });

  it('keeps one primary variable per sequencing step', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, gapMap, queue, memory);

    expect(sequencingPlan.steps.every(step => ['hook', 'angle', 'audience', 'offer', 'cta', 'format', 'asset', 'price_message', 'platform'].includes(step.primaryVariableType))).toBe(true);
  });

  it('turns insufficient sample results into validate_more or do_not_decide', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'policy-thin-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 1, impressions: 60, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'policy-thin-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 2, impressions: 60, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);

    expect(['validate_more', 'do_not_decide']).toContain(policy.rules[0].decision);
    expect(policy.rules[0].sampleSufficient).toBe(false);
  });

  it('does not allow directional signals to become scale candidates', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'policy-direction-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'policy-direction-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);

    expect(report.cellConfidence[0].conclusion).toBe('directional_signal');
    expect(policy.rules[0].decision).toBe('validate_more');
  });

  it('turns moderate candidate winners into small rollouts', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'policy-small-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'policy-small-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 24, impressions: 1000, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const rule = policy.rules.find(item => item.cellId === cell.id);

    expect(report.cellConfidence[0].confidenceLevel).toBe('moderate');
    expect(rule?.decision).toBe('small_rollout');
  });

  it('allows strong low-risk winners to become scale candidates', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'policy-scale-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 2000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'policy-scale-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 90, impressions: 2000, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const rule = policy.rules.find(item => item.cellId === cell.id);

    expect(report.cellConfidence[0].confidenceLevel).toBe('strong');
    expect(rule?.decision).toBe('scale_candidate');
    expect(policy.rolloutRules[0]?.riskLevel).toBe('low');
  });

  it('turns sufficient-sample losers into stop variants', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'policy-stop-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 45, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'policy-stop-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 20, impressions: 1000, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);

    expect(policy.rules[0].decision).toBe('stop_variant');
    expect(policy.stopRules.length).toBeGreaterThan(0);
  });

  it('turns inconclusive results into rework_hypothesis', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'policy-rework-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'policy-rework-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 42, impressions: 1000, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);

    expect(policy.rules[0].decision).toBe('rework_hypothesis');
  });

  it('blocks direct scale recommendations when duplicate risk is high', () => {
    const basePlan = plan();
    const memoryPlan: ExperimentPlan = {
      ...basePlan,
      id: `${basePlan.id}-policy-memory`,
      experimentCells: [
        { ...basePlan.experimentCells[0], id: 'dup-scale-memory', variableType: 'hook', controlValue: 'generic opener', testValue: 'generic opener v2', name: 'Duplicate hook memory' },
      ],
    };
    const memoryReport = analyzeExperimentResults(memoryPlan, [
      experimentRecord(memoryPlan, { id: 'dup-scale-control', cellId: 'dup-scale-memory', trackingCode: 'CONTROL-dup-scale-memory', clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(memoryPlan, { id: 'dup-scale-test', cellId: 'dup-scale-memory', trackingCode: 'TEST-dup-scale-memory', clicks: 45, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [memoryPlan], experimentReports: [memoryReport] });
    const queuePlan: ExperimentPlan = {
      ...basePlan,
      id: `${basePlan.id}-policy-queue`,
      experimentCells: [
        { ...basePlan.experimentCells[0], id: 'dup-scale-memory', variableType: 'hook', controlValue: 'generic opener', testValue: 'generic opener v2', name: 'Duplicate hook retry' },
      ],
    };
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [queuePlan], experimentReports: [memoryReport] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [queuePlan], experimentReports: [memoryReport] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [queuePlan], experimentReports: [memoryReport] }, gapMap, queue, memory);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [queuePlan], experimentReports: [memoryReport], experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, memoryReport.confidenceSummary, memory, queue, gapMap, sequencingPlan);

    expect(queue.candidates[0].duplicateRisk).toBe('high');
    expect(policy.rules[0].decision).not.toBe('scale_candidate');
  });

  it('creates data-collection cadence for validate_more decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'cadence-validate-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'cadence-validate-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy }, policy);
    const cadencePlan = buildExperimentCadencePlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary }, policy, decisionSummary);

    expect(decisionSummary.topDecision).toBe('validate_more');
    expect(cadencePlan.currentDecision).toBe('validate_more');
    expect(cadencePlan.monitoringCadence).toContain('24');
    expect(cadencePlan.summary).toContain('验证');
  });

  it('keeps directional signals on a validation cadence instead of scale cadence', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'cadence-directional-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'cadence-directional-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy }, policy);
    const cadencePlan = buildExperimentCadencePlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary }, policy, decisionSummary);

    expect(report.confidenceSummary.conclusion).toBe('directional_signal');
    expect(cadencePlan.summary).toContain('验证');
    expect(cadencePlan.summary).not.toContain('放大候选');
  });

  it('creates controlled rollout tasks for small_rollout decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'playbook-small-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'playbook-small-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, gapMap, queue, memory);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, report.confidenceSummary, memory, queue, gapMap, sequencingPlan);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy);
    const playbook = buildExperimentExecutionPlaybook({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy, decisionSummary, sequencingPlan, queue, gapMap, report.confidenceSummary, run.merchantContextCard);

    expect(decisionSummary.topDecision).toBe('small_rollout');
    expect(playbook.currentDecision).toBe('small_rollout');
    expect(playbook.productionTasks.some(task => task.title.includes('小范围'))).toBe(true);
  });

  it('adds frequent monitoring guardrails for scale_candidate decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'cadence-scale-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1500, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'cadence-scale-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 100, impressions: 1500, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, gapMap, queue, memory);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, report.confidenceSummary, memory, queue, gapMap, sequencingPlan);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy);
    const cadencePlan = buildExperimentCadencePlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentSequencingPlan: sequencingPlan }, policy, decisionSummary, sequencingPlan);

    expect(decisionSummary.topDecision).toBe('scale_candidate');
    expect(cadencePlan.monitoringCadence).toContain('6');
    expect(cadencePlan.summary).toContain('放大候选');
  });

  it('creates stop and archive checklist coverage for stop_variant decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'check-stop-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'check-stop-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 20, impressions: 1000, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy }, policy);
    const checklist = buildExperimentOperatorChecklist({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary }, policy, decisionSummary);

    expect(decisionSummary.topDecision).toBe('stop_variant');
    expect(checklist.currentDecision).toBe('stop_variant');
    expect(checklist.sections.some(section => section.title === '停止前检查')).toBe(true);
    expect(checklist.sections.some(section => section.title === '复盘归档检查')).toBe(true);
  });

  it('returns to creative rewrite tasks for rework_hypothesis decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'playbook-rework-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'playbook-rework-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 42, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, gapMap, queue, memory);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, report.confidenceSummary, memory, queue, gapMap, sequencingPlan);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy);
    const playbook = buildExperimentExecutionPlaybook({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy, decisionSummary, sequencingPlan, queue, gapMap, report.confidenceSummary, run.merchantContextCard);

    expect(decisionSummary.topDecision).toBe('rework_hypothesis');
    expect(playbook.productionTasks.some(task => task.title.includes('重写'))).toBe(true);
  });

  it('covers publish, tracking, data collection, scale, stop, and archive checks in the operator checklist', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy }, policy);
    const checklist = buildExperimentOperatorChecklist({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary }, policy, decisionSummary);

    expect(checklist.sections.map(section => section.title)).toEqual([
      '发布前检查',
      '内容变量检查',
      '命名与追踪检查',
      '数据回收检查',
      '放大前检查',
      '停止前检查',
      '复盘归档检查',
    ]);
  });

  it('adds experiment exports to the delivery package', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const validationPolicy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: validationPolicy }, validationPolicy);
    const deliveryPackage = buildDeliveryPackage({
      ...run,
      experimentPlans: [experimentPlan],
      experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
      experimentReports: [report],
      experimentValidationPolicy: validationPolicy,
      experimentDecisionSummary: decisionSummary,
    });

    expect(deliveryPackage.experimentPlanMarkdown).toContain('实验计划');
    expect(deliveryPackage.experimentCsvTemplate).toContain('experimentId,cellId,contentId');
    expect(deliveryPackage.trackingPlanMarkdown).toContain('追踪命名规则');
    expect(deliveryPackage.manualResultEntryTemplateCsv).toContain('trackingCode');
    expect(deliveryPackage.experimentConfidenceMarkdown).toContain('实验置信度');
    expect(deliveryPackage.experimentConfidenceMarkdown).toContain('置信等级');
    expect(deliveryPackage.experimentMemoryMarkdown).toContain('实验记忆');
    expect(deliveryPackage.experimentPriorityQueueMarkdown).toContain('下一轮实验优先队列');
    expect(deliveryPackage.experimentLearningGapMapMarkdown).toContain('内容增长学习地图');
    expect(deliveryPackage.experimentSequencingPlanMarkdown).toContain('下一轮实验路线图');
    expect(deliveryPackage.experimentValidationPolicyMarkdown).toContain('实验验证策略');
    expect(deliveryPackage.experimentDecisionSummaryMarkdown).toContain('实验决策摘要');
  });

  it('rebuilds experiment memory and priority queue when importing a legacy run payload', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const currentRun = {
      ...run,
      experimentPlans: [experimentPlan],
      experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
      experimentReports: [report],
      deliveryPackage: buildDeliveryPackage({
        ...run,
        experimentPlans: [experimentPlan],
        experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
        experimentReports: [report],
      }),
    };
    const legacy = JSON.parse(exportListingFactoryRun(currentRun));
    delete legacy.experimentMemorySummary;
    delete legacy.experimentPriorityQueue;
    delete legacy.experimentLearningGapMap;
    delete legacy.experimentSequencingPlan;
    delete legacy.experimentValidationPolicy;
    delete legacy.experimentDecisionSummary;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.experimentMemoryMarkdown;
      delete legacy.deliveryPackage.experimentPriorityQueueMarkdown;
      delete legacy.deliveryPackage.experimentLearningGapMapMarkdown;
      delete legacy.deliveryPackage.experimentSequencingPlanMarkdown;
      delete legacy.deliveryPackage.experimentValidationPolicyMarkdown;
      delete legacy.deliveryPackage.experimentDecisionSummaryMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.experimentMemorySummary.entries.length).toBeGreaterThan(0);
      expect(imported.run.experimentPriorityQueue.candidates.length).toBeGreaterThan(0);
      expect(imported.run.experimentLearningGapMap.gaps.length).toBeGreaterThan(0);
      expect(imported.run.experimentSequencingPlan.steps.length).toBeGreaterThan(0);
      expect(imported.run.experimentValidationPolicy.rules.length).toBeGreaterThan(0);
      expect(imported.run.experimentDecisionSummary.summary.length).toBeGreaterThan(0);
      expect(imported.run.deliveryPackage.experimentValidationPolicyMarkdown).toContain('实验验证策略');
      expect(imported.run.deliveryPackage.experimentMemoryMarkdown).toContain('实验记忆');
      expect(imported.run.deliveryPackage.experimentLearningGapMapMarkdown).toContain('内容增长学习地图');
    }
  });
  it('includes p4 execution exports in the delivery package', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const validationPolicy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: validationPolicy }, validationPolicy);
    const cadencePlan = buildExperimentCadencePlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary }, validationPolicy, decisionSummary);
    const checklist = buildExperimentOperatorChecklist({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary, experimentCadencePlan: cadencePlan }, validationPolicy, decisionSummary);
    const playbook = buildExperimentExecutionPlaybook({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: validationPolicy, experimentDecisionSummary: decisionSummary, experimentCadencePlan: cadencePlan, experimentOperatorChecklist: checklist }, validationPolicy, decisionSummary, undefined, undefined, undefined, report.confidenceSummary, run.merchantContextCard);
    const deliveryPackage = buildDeliveryPackage({
      ...run,
      experimentPlans: [experimentPlan],
      experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
      experimentReports: [report],
      experimentValidationPolicy: validationPolicy,
      experimentDecisionSummary: decisionSummary,
      experimentCadencePlan: cadencePlan,
      experimentOperatorChecklist: checklist,
      experimentExecutionPlaybook: playbook,
    });

    expect(deliveryPackage.experimentExecutionPlaybookMarkdown).toContain('实验执行手册');
    expect(deliveryPackage.experimentCadencePlanMarkdown).toContain('实验节奏安排');
    expect(deliveryPackage.experimentOperatorChecklistMarkdown).toContain('操作检查表');
  });

  it('rebuilds p4 execution layer when importing a legacy run payload without p4 fields', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, performanceRecords());
    const currentRun = {
      ...run,
      experimentPlans: [experimentPlan],
      experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
      experimentReports: [report],
      deliveryPackage: buildDeliveryPackage({
        ...run,
        experimentPlans: [experimentPlan],
        experimentVariantMatrices: [buildExperimentVariantMatrix(run, experimentPlan)],
        experimentReports: [report],
      }),
    };
    const legacy = JSON.parse(exportListingFactoryRun(currentRun));
    delete legacy.experimentCadencePlan;
    delete legacy.experimentOperatorChecklist;
    delete legacy.experimentExecutionPlaybook;
    delete legacy.experimentExecutionSummary;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.experimentExecutionPlaybookMarkdown;
      delete legacy.deliveryPackage.experimentCadencePlanMarkdown;
      delete legacy.deliveryPackage.experimentOperatorChecklistMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.experimentCadencePlan.rules.length).toBeGreaterThan(0);
      expect(imported.run.experimentOperatorChecklist.sections.length).toBeGreaterThan(0);
      expect(imported.run.experimentExecutionPlaybook.productionTasks.length).toBeGreaterThan(0);
      expect(imported.run.experimentExecutionSummary.summary.length).toBeGreaterThan(0);
      expect(imported.run.deliveryPackage.experimentExecutionPlaybookMarkdown).toContain('实验执行手册');
      expect(imported.run.deliveryPackage.experimentCadencePlanMarkdown).toContain('实验节奏安排');
      expect(imported.run.deliveryPackage.experimentOperatorChecklistMarkdown).toContain('操作检查表');
    }
  });

  it('builds a run history item from a completed run', () => {
    const historyItem = buildListingFactoryRunHistoryItem(run, run.experimentArchiveRecord);

    expect(historyItem.runId).toBe(run.id);
    expect(historyItem.primaryProductName).toBe(run.project.productName);
    expect(historyItem.deliveryPackageAvailable).toBe(true);
    expect(historyItem.openChecklistCount).toBeGreaterThan(0);
  });

  it('surfaces the highest-priority next action on the workbench board', () => {
    const board = buildExperimentWorkbenchBoard(run, run.runHistorySummary, [run.experimentArchiveRecord]);

    expect(board.highestPriorityAction).toBeTruthy();
    expect(board.nextActionQueue.length).toBeGreaterThan(0);
    expect(['待补数据', '待验证实验', '可放大但需监控', '应停止方案', '待归档复盘']).toContain(board.highestPriorityAction?.title);
  });

  it('creates a 待补数据 action for validate_more decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'workbench-validate-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 400, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'workbench-validate-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 400, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy }, policy);
    const checklist = buildExperimentOperatorChecklist({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary }, policy, decisionSummary);
    const board = buildExperimentWorkbenchBoard({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentOperatorChecklist: checklist });

    expect(decisionSummary.topDecision).toBe('validate_more');
    expect(board.pendingDataActions[0]?.title).toBe('待补数据');
  });

  it('creates a 可放大但需监控 action for rollout decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'workbench-rollout-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 20, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'workbench-rollout-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 30, impressions: 1000, notes: 'test variant' }),
    ]);
    const memory = buildExperimentMemorySummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });
    const queue = buildExperimentPriorityQueue({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory);
    const gapMap = buildExperimentLearningGapMap({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, memory, queue);
    const sequencingPlan = buildExperimentSequencingPlan({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, gapMap, queue, memory);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, report.confidenceSummary, memory, queue, gapMap, sequencingPlan);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy);
    const checklist = buildExperimentOperatorChecklist({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan }, policy, decisionSummary);
    const board = buildExperimentWorkbenchBoard({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentOperatorChecklist: checklist, experimentMemorySummary: memory, experimentPriorityQueue: queue, experimentLearningGapMap: gapMap, experimentSequencingPlan: sequencingPlan });
    const rolloutAction = board.rolloutActions[0] || board.nextActionQueue.find(item => item.title === '可放大但需监控');

    expect(rolloutAction?.title).toBe('可放大但需监控');
  });

  it('creates an 应停止方案 action for stop_variant decisions', () => {
    const experimentPlan = plan();
    const cell = experimentPlan.experimentCells[0];
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { id: 'workbench-stop-control', cellId: cell.id, trackingCode: `CONTROL-${cell.id}`, clicks: 40, impressions: 1000, notes: 'control' }),
      experimentRecord(experimentPlan, { id: 'workbench-stop-test', cellId: cell.id, trackingCode: `TEST-${cell.id}`, clicks: 20, impressions: 1000, notes: 'test variant' }),
    ]);
    const policy = buildExperimentValidationPolicy({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] }, report.confidenceSummary);
    const decisionSummary = buildExperimentDecisionSummary({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy }, policy);
    const checklist = buildExperimentOperatorChecklist({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary }, policy, decisionSummary);
    const board = buildExperimentWorkbenchBoard({ ...run, experimentPlans: [experimentPlan], experimentReports: [report], experimentValidationPolicy: policy, experimentDecisionSummary: decisionSummary, experimentOperatorChecklist: checklist });

    expect(decisionSummary.topDecision).toBe('stop_variant');
    expect(board.stopActions[0]?.title).toBe('应停止方案');
  });

  it('reflects open checklist count in workbench history', () => {
    expect(run.runHistoryItem.openChecklistCount).toBe(run.experimentOperatorChecklist.requiredCount);
  });

  it('builds an archive record with learning summary and next action', () => {
    const archiveRecord = buildExperimentArchiveRecord(run);

    expect(archiveRecord.learningSummary.length).toBeGreaterThan(0);
    expect(archiveRecord.nextAction.length).toBeGreaterThan(0);
  });

  it('adds Chinese workbench markdown to the delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.experimentWorkbenchMarkdown).toContain('本地实验操作台');
    expect(deliveryPackage.experimentWorkbenchMarkdown).toContain('最近运行记录');
    expect(deliveryPackage.experimentWorkbenchMarkdown).toContain('本地归档');
  });

  it('rebuilds p5 workbench layer when importing a legacy run payload without p5 fields', () => {
    const legacy = JSON.parse(exportListingFactoryRun(run));
    delete legacy.runHistoryItem;
    delete legacy.runHistorySummary;
    delete legacy.experimentWorkbenchBoard;
    delete legacy.experimentArchiveRecord;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.experimentWorkbenchMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.runHistoryItem.primaryProductName).toBe(run.project.productName);
      expect(imported.run.runHistorySummary.items.length).toBeGreaterThan(0);
      expect(imported.run.experimentWorkbenchBoard.nextActionQueue.length).toBeGreaterThan(0);
      expect(imported.run.experimentArchiveRecord.learningSummary.length).toBeGreaterThan(0);
      expect(imported.run.deliveryPackage.experimentWorkbenchMarkdown).toContain('本地实验操作台');
    }
  });

  it('scrubs secret-like fields from workbench storage export', () => {
    clearListingFactoryLocalData();
    const secretRun = {
      ...run,
      runHistoryItem: {
        ...run.runHistoryItem,
        topLearning: 'apiKey=sk-live-123456',
        nextRecommendedAction: 'token=secret-token-123',
      },
      experimentArchiveRecord: {
        ...run.experimentArchiveRecord,
        learningSummary: 'auth=super-secret-value',
        nextAction: 'providerToken=abc123',
      },
    };
    saveListingFactoryRun(secretRun);
    const snapshot = loadLatestListingFactorySnapshot();
    const exported = JSON.stringify({
      runHistorySummary: snapshot.runHistorySummary,
      archiveRecords: snapshot.archiveRecords,
    });

    expect(exported).not.toContain('sk-live-123456');
    expect(exported).not.toContain('secret-token-123');
    expect(exported).not.toContain('super-secret-value');
    expect(exported).not.toContain('abc123');
    clearListingFactoryLocalData();
  });

  it('builds cross-run learning records from current run and archive history', () => {
    const records = buildCrossRunLearningRecords(run, run.runHistorySummary, [run.experimentArchiveRecord]);

    expect(records.length).toBeGreaterThan(0);
    expect(records.some(record => record.sourceType === 'archive')).toBe(true);
    expect(records[0].primaryProductName).toBe(run.project.productName);
  });

  it('groups cross-run records by variable type with correct status counts', () => {
    const records = [
      { ...buildCrossRunLearningRecords(run)[0], variableType: 'hook' as const, conclusion: 'candidate_winner' as const, decision: 'scale_candidate' as const },
      { ...buildCrossRunLearningRecords(run)[0], variableType: 'hook' as const, conclusion: 'directional_signal' as const, decision: 'validate_more' as const },
      { ...buildCrossRunLearningRecords(run)[0], variableType: 'hook' as const, conclusion: 'inconclusive' as const, decision: 'rework_hypothesis' as const },
      { ...buildCrossRunLearningRecords(run)[0], variableType: 'hook' as const, conclusion: 'candidate_loser' as const, decision: 'stop_variant' as const },
    ];
    const summary = buildCrossRunVariableSummary(records).find(item => item.variableType === 'hook');

    expect(summary?.totalTests).toBe(4);
    expect(summary?.learnedCount).toBe(1);
    expect(summary?.directionalCount).toBe(1);
    expect(summary?.inconclusiveCount).toBe(1);
    expect(summary?.stoppedCount).toBe(1);
  });

  it('searches local learning archive by variable type', () => {
    const records = buildCrossRunLearningRecords(run, run.runHistorySummary, [run.experimentArchiveRecord]);
    const hookResult = searchMerchantLearningArchive(records, { variableType: 'hook' });

    expect(hookResult.records.every(record => record.variableType === 'hook')).toBe(true);
  });

  it('searches local learning archive by conclusion confidence and decision', () => {
    const record = buildCrossRunLearningRecords(run)[0];
    const result = searchMerchantLearningArchive([record], {
      conclusion: record.conclusion,
      confidenceLevel: record.confidenceLevel,
      decision: record.decision,
    });

    expect(result.totalMatches).toBe(1);
  });

  it('matches keyword search against hypothesis learning and product name', () => {
    const records = buildCrossRunLearningRecords(run);
    const result = searchMerchantLearningArchive(records, { keyword: run.project.productName.slice(0, 2) });

    expect(result.totalMatches).toBeGreaterThan(0);
  });

  it('sorts the learning timeline chronologically', () => {
    const records = buildCrossRunLearningRecords(run).map((record, index) => ({
      ...record,
      createdAt: index === 0 ? '2026-05-14T00:00:00.000Z' : '2026-05-12T00:00:00.000Z',
    }));
    const timeline = buildLearningTimeline(records);

    expect(timeline[0].date).toBe('2026-05-12T00:00:00.000Z');
  });

  it('falls back to current run when local archive is missing', () => {
    const archive = buildMerchantLearningArchive(run, undefined, []);

    expect(archive.searchIndex.length).toBeGreaterThan(0);
    expect(archive.timeline.length).toBeGreaterThan(0);
  });

  it('adds Chinese cross-run comparison and learning archive markdown to the delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.crossRunComparisonMarkdown).toContain('跨运行学习对比');
    expect(deliveryPackage.crossRunComparisonMarkdown).toContain('变量学习沉淀');
    expect(deliveryPackage.merchantLearningArchiveMarkdown).toContain('商家增长学习档案');
    expect(deliveryPackage.merchantLearningArchiveMarkdown).toContain('学习时间线');
  });

  it('rebuilds p6 learning archive when importing a legacy run payload without p6 fields', () => {
    const legacy = JSON.parse(exportListingFactoryRun(run));
    delete legacy.crossRunComparison;
    delete legacy.merchantLearningArchive;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.crossRunComparisonMarkdown;
      delete legacy.deliveryPackage.merchantLearningArchiveMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.crossRunComparison.records.length).toBeGreaterThan(0);
      expect(imported.run.merchantLearningArchive.timeline.length).toBeGreaterThan(0);
      expect(imported.run.deliveryPackage.crossRunComparisonMarkdown).toContain('跨运行学习对比');
      expect(imported.run.deliveryPackage.merchantLearningArchiveMarkdown).toContain('商家增长学习档案');
    }
  });

  it('scrubs secret-like text from p6 archive and search outputs', () => {
    const secretRecord = {
      ...buildCrossRunLearningRecords(run)[0],
      hypothesis: 'apiKey=sk-live-999',
      reusableLearning: 'token=secret-token-999',
      riskNote: 'auth=hidden-value',
      nextRecommendedAction: 'providerToken=abc999',
    };
    const comparison = buildCrossRunComparisonResult({
      ...run,
      experimentMemorySummary: {
        ...run.experimentMemorySummary,
        entries: [],
      },
      experimentReports: [],
      experimentLearningGapMap: {
        ...run.experimentLearningGapMap,
        gaps: [],
      },
      experimentDecisionSummary: {
        ...run.experimentDecisionSummary,
        summary: secretRecord.hypothesis,
        whyThisDecision: secretRecord.reusableLearning,
        stopCondition: secretRecord.riskNote,
      },
    });
    const output = JSON.stringify(comparison) + comparison.records.map(record => record.nextRecommendedAction).join(' ');

    expect(output).not.toContain('sk-live-999');
    expect(output).not.toContain('secret-token-999');
    expect(output).not.toContain('hidden-value');
    expect(output).not.toContain('abc999');
  });

  it('builds a trace graph linking content artifacts to experiment evidence', () => {
    const graph = buildContentExperimentTraceGraph(run);
    const relations = graph.edges.map(edge => edge.relation);

    expect(graph.nodes.some(node => node.type === 'brief')).toBe(true);
    expect(graph.nodes.some(node => node.type === 'script')).toBe(true);
    expect(graph.nodes.some(node => node.type === 'storyboard')).toBe(true);
    expect(graph.nodes.some(node => node.type === 'asset')).toBe(true);
    expect(graph.nodes.some(node => node.type === 'batch_variant')).toBe(true);
    expect(graph.nodes.some(node => node.type === 'experiment_cell')).toBe(true);
    expect(graph.nodes.some(node => node.type === 'metric_window')).toBe(true);
    expect(relations).toContain('brief_to_script');
    expect(relations).toContain('script_to_storyboard');
    expect(relations).toContain('batch_variant_to_experiment_cell');
    expect(relations).toContain('experiment_cell_to_metric_window');
  });

  it('creates deterministic fallback lineage for missing asset ids', () => {
    const lineage = buildAssetLineageRecords({ ...run, assets: [], shotAssetMatches: [] });

    expect(lineage[0].assetId).toBe(`unlinked-asset-${run.project.id}`);
    expect(lineage[0].performanceSignal).toContain('未完全关联');
  });

  it('preserves unlinked trace nodes instead of dropping them', () => {
    const graph = buildContentExperimentTraceGraph({ ...run, assets: [], shotAssetMatches: [] });

    expect(graph.assetLineageRecords.some(item => item.performanceSignal.includes('未完全关联'))).toBe(true);
    expect(graph.unlinkedNodeIds.length).toBeGreaterThan(0);
  });

  it('recalculates metric windows from raw records instead of stale ctr fields', () => {
    const experimentPlan = plan();
    const record = experimentRecord(experimentPlan, {
      trackingCode: 'trace-stale-ctr',
      notes: 'stale ctr should be ignored',
      cellId: experimentPlan.experimentCells[0].id,
      clicks: 100,
      impressions: 500,
      ctr: 0.01,
    });
    const report = analyzeExperimentResults(experimentPlan, [record]);
    const windows = buildExperimentMetricWindows({
      ...run,
      experimentPlans: [experimentPlan],
      experimentReports: [report],
      performanceRecords: [record],
    });

    expect(windows[0].recalculatedCtr).toBe(0.2);
  });

  it('maps evidence strength from confidence conclusion and sample sufficiency', () => {
    const experimentPlan = plan();
    const report = analyzeExperimentResults(experimentPlan, [
      experimentRecord(experimentPlan, { trackingCode: 'trace-control', notes: 'control', cellId: 'control', clicks: 50, impressions: 1000 }),
      experimentRecord(experimentPlan, { trackingCode: 'trace-test', notes: 'test', cellId: experimentPlan.experimentCells[0].id, clicks: 90, impressions: 1000 }),
    ]);
    const traces = buildExperimentEvidenceTraces({ ...run, experimentPlans: [experimentPlan], experimentReports: [report] });

    expect(traces.some(trace => trace.evidenceStrength === 'strong' || trace.evidenceStrength === 'usable')).toBe(true);
  });

  it('links learning records back to source experiment cells metrics and assets', () => {
    const graph = buildContentExperimentTraceGraph(run);
    const link = graph.learningEvidenceLinks[0];

    expect(link.sourceExperimentId).toBeTruthy();
    expect(link.sourceCellIds.length).toBeGreaterThan(0);
    expect(link.sourceMetricWindowIds.length).toBeGreaterThan(0);
    expect(graph.edges.some(edge => edge.relation === 'decision_to_learning' || edge.relation === 'metric_window_to_learning')).toBe(true);
  });

  it('adds Chinese traceability markdown without causal overclaim', () => {
    const graph = buildContentExperimentTraceGraph(run);
    const markdown = buildContentExperimentTraceMarkdown(graph);
    const summaryMarkdown = buildTraceabilitySummaryMarkdown(run.traceabilitySummary);
    const output = `${markdown}\n${summaryMarkdown}`;

    expect(markdown).toContain('内容实验追踪链');
    expect(markdown).toContain('这条结论来自哪里');
    expect(markdown).toContain('素材来源记录');
    expect(markdown).toContain('目前还不能证明什么');
    expect(output).not.toContain('确定由该素材导致转化提升');
  });

  it('adds content trace and traceability summary markdown to the delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.contentExperimentTraceMarkdown).toContain('内容实验追踪链');
    expect(deliveryPackage.traceabilitySummaryMarkdown).toContain('可追溯证据链摘要');
  });

  it('rebuilds p7 traceability fields when importing a legacy run payload without p7 fields', () => {
    const legacy = JSON.parse(exportListingFactoryRun(run));
    delete legacy.contentExperimentTraceGraph;
    delete legacy.traceabilitySummary;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.contentExperimentTraceMarkdown;
      delete legacy.deliveryPackage.traceabilitySummaryMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.contentExperimentTraceGraph.nodes.length).toBeGreaterThan(0);
      expect(imported.run.traceabilitySummary.strongestTraceableLearning).toBeTruthy();
      expect(imported.run.deliveryPackage.contentExperimentTraceMarkdown).toContain('内容实验追踪链');
    }
  });

  it('scrubs secret-like text from p7 trace outputs', () => {
    const graph = buildContentExperimentTraceGraph({
      ...run,
      merchantLearningArchive: {
        ...run.merchantLearningArchive,
        searchIndex: [{
          ...buildCrossRunLearningRecords(run)[0],
          hypothesis: 'apiKey=sk-live-trace',
          reusableLearning: 'token=trace-secret-token',
          riskNote: 'auth=trace-hidden',
          nextRecommendedAction: 'providerToken=trace-provider',
        }],
      },
    });
    const output = JSON.stringify(graph) + buildContentExperimentTraceMarkdown(graph);

    expect(output).not.toContain('sk-live-trace');
    expect(output).not.toContain('trace-secret-token');
    expect(output).not.toContain('trace-hidden');
    expect(output).not.toContain('trace-provider');
  });

  it('defines required normalized fields in the platform data contract', () => {
    const contract = buildPlatformDataContract();
    const required = contract.requiredFields.map(field => field.name);

    expect(required).toEqual(expect.arrayContaining([
      'recordId',
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
    ]));
  });

  it('generates a stable English-compatible platform CSV template header', () => {
    const template = buildPlatformImportTemplate();

    expect(template.header.join(',')).toBe('channel,campaignName,contentName,trackingCode,experimentCellId,date,impressions,clicks,spend,orders,revenue,likes,comments,shares,saves,addToCart,productName,skuId,note');
    expect(template.csv.split('\n')[0]).toContain('channel');
  });

  it('creates validation errors for missing required platform fields', () => {
    const rows = [{ channel: 'tiktok', impressions: 100, clicks: 5, spend: 10, orders: 1, revenue: 20 }];
    const issues = validatePlatformImportRows(rows);

    expect(issues.some(issue => issue.severity === 'error' && issue.code === 'missing_campaignName')).toBe(true);
  });

  it('creates validation errors for negative metrics and clicks above impressions', () => {
    const rows = [{
      recordId: 'bad-1',
      channel: 'tiktok',
      campaignName: 'test',
      contentName: 'creative',
      trackingCode: 'track',
      experimentCellId: 'cell-1',
      date: '2026-05-12',
      impressions: 10,
      clicks: 12,
      spend: -1,
      orders: 1,
      revenue: 20,
    }];
    const issues = validatePlatformImportRows(rows);

    expect(issues.some(issue => issue.severity === 'error' && issue.code === 'negative_spend')).toBe(true);
    expect(issues.some(issue => issue.severity === 'error' && issue.code === 'clicks_gt_impressions')).toBe(true);
  });

  it('ignores stale ctr and roas fields when normalizing platform metrics', () => {
    const rows = [{
      recordId: 'metric-1',
      channel: 'tiktok',
      campaignName: 'test',
      contentName: 'creative',
      trackingCode: 'track',
      experimentCellId: 'cell-1',
      date: '2026-05-12',
      impressions: 1000,
      clicks: 100,
      spend: 50,
      orders: 10,
      revenue: 200,
      ctr: 0.001,
      roas: 99,
    }];
    const normalized = normalizePlatformMetricRecords(rows);

    expect(normalized[0].ctr).toBe(0.1);
    expect(normalized[0].conversionRate).toBe(0.1);
    expect(normalized[0].roas).toBe(4);
  });

  it('warns when trackingCode or experimentCellId is missing', () => {
    const rows = [{
      recordId: 'warn-1',
      channel: 'tiktok',
      campaignName: 'test',
      contentName: 'creative',
      date: '2026-05-12',
      impressions: 1000,
      clicks: 100,
      spend: 50,
      orders: 10,
      revenue: 200,
    }];
    const issues = validatePlatformImportRows(rows);

    expect(issues.some(issue => issue.severity === 'warning' && issue.code === 'missing_trackingCode')).toBe(true);
    expect(issues.some(issue => issue.severity === 'warning' && issue.code === 'missing_experimentCellId')).toBe(true);
  });

  it('preserves raw values and separates platform import errors from warnings', () => {
    const rows = [{
      recordId: 'quality-1',
      channel: 'unknown-channel',
      campaignName: 'test',
      contentName: 'creative',
      trackingCode: '',
      experimentCellId: '',
      date: '2026-05-12',
      impressions: 1000,
      clicks: 100,
      spend: 50,
      orders: 120,
      revenue: 200,
      likes: 5,
    }];
    const mapping = buildPlatformFieldMapping(rows);
    const normalized = normalizePlatformMetricRecords(rows, mapping);
    const report = buildPlatformImportQualityReport(rows, buildPlatformDataContract(), mapping);

    expect(normalized[0].impressions).toBe(1000);
    expect(normalized[0].likes).toBe(5);
    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBeGreaterThan(0);
  });

  it('adds Chinese platform data readiness outputs to the delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.platformDataContractMarkdown).toContain('平台数据契约');
    expect(deliveryPackage.platformImportTemplateCsv).toContain('channel');
    expect(deliveryPackage.platformImportQualityMarkdown).toContain('导入质量检查');
    expect(deliveryPackage.platformDataReadinessMarkdown).toContain('数据接入准备度');
  });

  it('rebuilds p8 platform data fields when importing a legacy run payload', () => {
    const legacy = JSON.parse(exportListingFactoryRun(run));
    delete legacy.platformDataContract;
    delete legacy.platformImportTemplate;
    delete legacy.platformFieldMapping;
    delete legacy.platformImportQualityReport;
    delete legacy.normalizedPlatformMetricRecords;
    delete legacy.platformDataReadinessSummary;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.platformDataContractMarkdown;
      delete legacy.deliveryPackage.platformImportTemplateCsv;
      delete legacy.deliveryPackage.platformImportQualityMarkdown;
      delete legacy.deliveryPackage.platformDataReadinessMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.platformDataContract.requiredFields.length).toBeGreaterThan(0);
      expect(imported.run.platformImportTemplate.csv).toContain('channel');
      expect(imported.run.deliveryPackage.platformDataReadinessMarkdown).toContain('数据接入准备度');
    }
  });

  it('scrubs secret-like text from p8 outputs', () => {
    const rows = [{
      recordId: 'secret-1',
      channel: 'tiktok',
      campaignName: 'apiKey=sk-live-platform',
      contentName: 'token=platform-secret',
      trackingCode: 'accessToken=hidden-access',
      experimentCellId: 'refreshToken=hidden-refresh',
      date: '2026-05-12',
      impressions: 100,
      clicks: 10,
      spend: 20,
      orders: 1,
      revenue: 40,
      note: 'providerToken=hidden-provider auth=hidden-auth',
    }];
    const normalized = normalizePlatformMetricRecords(rows);
    const readiness = buildPlatformDataReadinessSummary(buildPlatformDataContract(), buildPlatformImportQualityReport(rows), normalized);
    const output = JSON.stringify(normalized) + JSON.stringify(readiness);

    expect(output).not.toContain('sk-live-platform');
    expect(output).not.toContain('platform-secret');
    expect(output).not.toContain('hidden-access');
    expect(output).not.toContain('hidden-refresh');
    expect(output).not.toContain('hidden-provider');
    expect(output).not.toContain('hidden-auth');
  });

  it('provides adapter presets for all supported platforms', () => {
    const presets = buildPlatformCsvAdapterPresets();

    expect(presets.map(preset => preset.platform)).toEqual(expect.arrayContaining([
      'tiktok',
      'xiaohongshu',
      'amazon',
      'shopify',
      'meta_ads',
      'google_ads',
      'other',
    ]));
  });

  it('maps TikTok-like headers to normalized P8 fields', () => {
    const candidates = inferPlatformCsvFieldMapping(['Campaign Name', 'Ad name', 'Ad ID', 'Impressions', 'Clicks', 'Cost', 'Purchases', 'Sales'], 'tiktok');

    expect(candidates.find(item => item.originalHeader === 'Campaign Name')?.normalizedField).toBe('campaignName');
    expect(candidates.find(item => item.originalHeader === 'Ad name')?.normalizedField).toBe('contentName');
    expect(candidates.find(item => item.originalHeader === 'Cost')?.normalizedField).toBe('spend');
  });

  it('maps Shopify-like headers to normalized P8 fields', () => {
    const candidates = inferPlatformCsvFieldMapping(['Product title', 'Variant SKU', 'Orders', 'Net sales', 'Added to cart'], 'shopify');

    expect(candidates.find(item => item.originalHeader === 'Product title')?.normalizedField).toBe('contentName');
    expect(candidates.find(item => item.originalHeader === 'Variant SKU')?.normalizedField).toBe('skuId');
    expect(candidates.find(item => item.originalHeader === 'Net sales')?.normalizedField).toBe('revenue');
  });

  it('keeps unknown headers visible in preview warnings', () => {
    const preview = buildPlatformCsvMappingPreview(['Campaign Name', 'Mystery Header'], 'tiktok');

    expect(preview.unknownFields).toContain('Mystery Header');
    expect(preview.warnings.some(issue => issue.type === 'unknown_field')).toBe(true);
  });

  it('creates preview errors for missing required fields', () => {
    const preview = buildPlatformCsvMappingPreview(['Campaign Name', 'Clicks'], 'tiktok');

    expect(preview.missingRequiredFields).toContain('impressions');
    expect(preview.errors.some(issue => issue.type === 'missing_required')).toBe(true);
    expect(preview.estimatedImportReady).toBe(false);
  });

  it('creates conflict issues for duplicate mapped headers', () => {
    const preview = buildPlatformCsvMappingPreview(['Campaign Name', 'campaign_name', 'Clicks', 'Impressions', 'Cost', 'Orders', 'Sales', 'Date', 'Ad name', 'trackingCode', 'experimentCellId', 'recordId'], 'tiktok');

    expect(preview.conflictFields).toContain('campaignName');
    expect(preview.errors.some(issue => issue.type === 'conflict_field')).toBe(true);
  });

  it('estimates import readiness from mapping preview and P8 QA', () => {
    const rows = [{
      recordId: 'ready-1',
      channel: 'tiktok',
      campaignName: 'test',
      contentName: 'creative',
      trackingCode: 'track',
      experimentCellId: 'cell-1',
      date: '2026-05-12',
      impressions: 1000,
      clicks: 100,
      spend: 50,
      orders: 10,
      revenue: 200,
    }];
    const summary = buildPlatformCsvImportPreviewSummary(rows, 'tiktok');

    expect(summary.mappingPreview.estimatedImportReady).toBe(true);
    expect(summary.importQualityReport.readyForExperimentReview).toBe(true);
    expect(summary.estimatedImportReady).toBe(true);
  });

  it('reuses P8 validation and normalization in P9 preview', () => {
    const rows = [{
      recordId: 'bad-preview',
      channel: 'tiktok',
      campaignName: 'test',
      contentName: 'creative',
      trackingCode: 'track',
      experimentCellId: 'cell-1',
      date: '2026-05-12',
      impressions: 10,
      clicks: 20,
      spend: 50,
      orders: 1,
      revenue: 200,
    }];
    const summary = buildPlatformCsvImportPreviewSummary(rows, 'tiktok');

    expect(summary.importQualityReport.errors.some(issue => issue.code === 'clicks_gt_impressions')).toBe(true);
    expect(summary.estimatedImportReady).toBe(false);
  });

  it('keeps stale ctr and roas ignored through P9 normalization path', () => {
    const rows = [{
      recordId: 'stale-p9',
      channel: 'tiktok',
      campaignName: 'test',
      contentName: 'creative',
      trackingCode: 'track',
      experimentCellId: 'cell-1',
      date: '2026-05-12',
      impressions: 1000,
      clicks: 50,
      spend: 25,
      orders: 5,
      revenue: 100,
      ctr: 0.99,
      roas: 99,
    }];
    const preview = buildPlatformCsvMappingPreview(rows, 'tiktok');
    const preset = exportPlatformCsvMappingPreset(preview);
    const normalized = normalizePlatformMetricRecords(rows);

    expect(preset.mappings.length).toBeGreaterThan(0);
    expect(normalized[0].ctr).toBe(0.05);
    expect(normalized[0].roas).toBe(4);
  });

  it('exports a JSON-safe scrubbed mapping preset', () => {
    const preview = buildPlatformCsvMappingPreview(['Campaign Name', 'apiKey=sk-live-preset', 'accessToken=hidden'], 'tiktok');
    const preset = exportPlatformCsvMappingPreset(preview);
    const output = JSON.stringify(preset);

    expect(() => JSON.parse(output)).not.toThrow();
    expect(output).not.toContain('sk-live-preset');
    expect(output).not.toContain('hidden');
  });

  it('adds Chinese P9 preview outputs to the delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.platformCsvMappingPreviewMarkdown).toContain('平台字段适配');
    expect(deliveryPackage.platformCsvImportPreviewMarkdown).toContain('导入前 QA 摘要');
    expect(deliveryPackage.platformCsvMappingPresetJson).toContain('localOnlyNote');
  });

  it('rebuilds p9 fields when importing a legacy run payload', () => {
    const legacy = JSON.parse(exportListingFactoryRun(run));
    delete legacy.platformCsvAdapterPresets;
    delete legacy.platformCsvMappingPreview;
    delete legacy.platformCsvImportPreviewSummary;
    delete legacy.platformCsvMappingPresetExport;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.platformCsvMappingPreviewMarkdown;
      delete legacy.deliveryPackage.platformCsvImportPreviewMarkdown;
      delete legacy.deliveryPackage.platformCsvMappingPresetJson;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.platformCsvAdapterPresets.length).toBeGreaterThan(0);
      expect(imported.run.platformCsvMappingPreview.totalHeaders).toBeGreaterThan(0);
      expect(imported.run.deliveryPackage.platformCsvMappingPreviewMarkdown).toContain('平台字段适配');
    }
  });

  it('scrubs secret-like text from P9 outputs', () => {
    const preview = buildPlatformCsvMappingPreview(['token=secret-token-p9', 'providerToken=secret-provider-p9', 'Campaign Name'], 'tiktok');
    const preset = exportPlatformCsvMappingPreset(preview);
    const output = JSON.stringify(preview) + JSON.stringify(preset);

    expect(output).not.toContain('secret-token-p9');
    expect(output).not.toContain('secret-provider-p9');
  });

  it('provides export version registry entries for all supported platforms', () => {
    const registry = buildPlatformExportVersionRegistry();

    expect(registry.boundaryNote).toContain('本地适配预设，不代表平台官方接口');
    expect(registry.versions.map(version => version.platform)).toEqual(expect.arrayContaining([
      'tiktok',
      'xiaohongshu',
      'amazon',
      'shopify',
      'meta_ads',
      'google_ads',
      'other',
    ]));
  });

  it('detects clean TikTok-like export headers deterministically', () => {
    const version = detectPlatformExportVersion(['recordId', 'channel', 'Campaign Name', 'Ad name', 'Ad ID', 'UTM Content', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Cost', 'Purchases', 'Sales'], 'tiktok');

    expect(version.platform).toBe('tiktok');
    expect(version.versionId).toBe('tiktok-local-ads-v1');
  });

  it('returns manual confirmation for ambiguous export headers', () => {
    const version = detectPlatformExportVersion(['Campaign', 'Name', 'Value']);

    expect(version.versionId).toBe('manual_confirmation');
    expect(version.versionLabel).toBe('需要手动确认');
  });

  it('runs fixture rehearsal through P9 mapping and P8 QA normalization', () => {
    const fixture = buildPlatformCsvFixtures().find(item => item.fixtureId === 'tiktok-local-ads-v1-clean');
    expect(fixture).toBeTruthy();

    const result = runPlatformCsvRehearsal(fixture!);

    expect(result.versionId).toBe('tiktok-local-ads-v1');
    expect(result.mappingPreview.mappedFields.length).toBeGreaterThan(8);
    expect(result.importQualityReport.rowCount).toBe(1);
    expect(result.normalizedRecordCount).toBe(1);
    expect(result.importReady).toBe(true);
  });

  it('dirty fixture produces expected rehearsal errors and warnings', () => {
    const fixture = buildPlatformCsvFixtures().find(item => item.fixtureId === 'tiktok-local-ads-v1-dirty');
    expect(fixture).toBeTruthy();

    const result = runPlatformCsvRehearsal(fixture!);

    expect(result.mappingPreview.conflictFields).toContain('campaignName');
    expect(result.mappingPreview.unknownFields).toContain('Mystery Header');
    expect(result.importQualityReport.errors.some(issue => issue.code === 'invalid_date')).toBe(true);
    expect(result.importQualityReport.errors.some(issue => issue.code === 'negative_impressions')).toBe(true);
    expect(result.importReady).toBe(false);
  });

  it('keeps stale ctr and roas ignored through P10 rehearsal normalization', () => {
    const fixture = buildPlatformCsvFixtures().find(item => item.fixtureId === 'tiktok-local-ads-v1-dirty');
    const result = runPlatformCsvRehearsal(fixture!);

    expect(result.normalizedRecords[0].ctr).not.toBe(0.99);
    expect(result.normalizedRecords[0].roas).not.toBe(99);
    expect(result.normalizedRecords[0].roas).toBe(3.3333);
  });

  it('builds deterministic JSON-safe regression snapshots', () => {
    const summary = buildPlatformCsvRehearsalSummary();
    const snapshot = buildPlatformCsvRegressionSnapshot(summary);
    const again = buildPlatformCsvRegressionSnapshot(summary);
    const output = JSON.stringify(snapshot);

    expect(snapshot).toEqual(again);
    expect(snapshot.jsonSafe).toBe(true);
    expect(() => JSON.parse(output)).not.toThrow();
    expect(output).toContain('tiktok-local-ads-v1');
  });

  it('renders Chinese P10 markdown without official API claims', () => {
    const registryMarkdown = buildPlatformExportVersionRegistryMarkdown();
    const rehearsalMarkdown = buildPlatformCsvRehearsalMarkdown();
    const snapshotMarkdown = buildPlatformCsvRegressionSnapshotMarkdown();
    const output = registryMarkdown + rehearsalMarkdown + snapshotMarkdown;

    expect(output).toContain('平台导出版本库');
    expect(output).toContain('CSV 导入演练');
    expect(output).toContain('字段回归快照');
    expect(output).toContain('本地适配预设，不代表平台官方接口');
    expect(output).not.toContain('保证转化');
  });

  it('adds Chinese P10 rehearsal outputs to the delivery package', () => {
    const deliveryPackage = buildDeliveryPackage(run);

    expect(deliveryPackage.platformExportVersionRegistryMarkdown).toContain('平台导出版本库');
    expect(deliveryPackage.platformCsvRehearsalMarkdown).toContain('CSV 导入演练');
    expect(deliveryPackage.platformCsvRegressionSnapshotMarkdown).toContain('字段回归快照');
  });

  it('rebuilds p10 fields when importing a legacy run payload', () => {
    const legacy = JSON.parse(exportListingFactoryRun(run));
    delete legacy.platformExportVersionRegistry;
    delete legacy.platformCsvRehearsalSummary;
    delete legacy.platformCsvRegressionSnapshot;
    if (legacy.deliveryPackage) {
      delete legacy.deliveryPackage.platformExportVersionRegistryMarkdown;
      delete legacy.deliveryPackage.platformCsvRehearsalMarkdown;
      delete legacy.deliveryPackage.platformCsvRegressionSnapshotMarkdown;
    }
    const imported = importListingFactoryRun(JSON.stringify(legacy));

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.platformExportVersionRegistry.versions.length).toBeGreaterThan(0);
      expect(imported.run.platformCsvRehearsalSummary.resultCount).toBeGreaterThan(0);
      expect(imported.run.deliveryPackage.platformCsvRehearsalMarkdown).toContain('CSV 导入演练');
    }
  });

  it('scrubs secret-like text from P10 outputs', () => {
    const registry = buildPlatformExportVersionRegistry();
    registry.versions[0].detectedByHeaders.push('apiKey=sk-p10-secret');
    registry.versions[0].recommendedMappingNotes.push('token=hidden-p10-token');
    const markdown = buildPlatformExportVersionRegistryMarkdown(registry);
    const summary = buildPlatformCsvRehearsalSummary([{
      fixtureId: 'p10-secret-fixture',
      platform: 'tiktok',
      versionId: 'tiktok-local-ads-v1',
      label: 'P10 secret scrub fixture',
      fixtureType: 'dirty',
      headers: ['recordId', 'channel', 'Campaign Name', 'Ad name', 'UTM Content', 'experimentCellId', 'Date', 'Impressions', 'Clicks', 'Cost', 'Purchases', 'Sales', 'providerToken=hidden-p10-provider'],
      rows: [{
        recordId: 'p10-secret-1',
        channel: 'tiktok',
        'Campaign Name': 'test',
        'Ad name': 'creative',
        'UTM Content': 'track',
        experimentCellId: 'cell',
        Date: '2026-05-12',
        Impressions: 100,
        Clicks: 10,
        Cost: 5,
        Purchases: 1,
        Sales: 20,
        'providerToken=hidden-p10-provider': 'secret',
      }],
      expectedNotes: [],
    }], registry);
    const output = markdown + JSON.stringify(summary) + buildPlatformCsvRehearsalMarkdown(summary) + buildPlatformCsvRegressionSnapshotMarkdown(buildPlatformCsvRegressionSnapshot(summary));

    expect(output).not.toContain('sk-p10-secret');
    expect(output).not.toContain('hidden-p10-token');
    expect(output).not.toContain('hidden-p10-provider');
  });
});
