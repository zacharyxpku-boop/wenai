import { describe, expect, it } from 'vitest';
import { LISTING_FACTORY_QA_SAMPLES } from '@/lib/listing-factory-samples';
import {
  advanceTaskStatus,
  buildCalendarFromTasks,
  buildDeliveryPackage,
  buildTasksFromBriefs,
  createListingProject,
  createRunFromProject,
  evaluateRunQualityGate,
  exportListingFactoryRun,
  importListingFactoryRun,
  moveCalendarItem,
  regenerateBriefSet,
  regenerateBriefVariant,
  reScoreBrief,
  validateImportedRun,
} from '@/lib/listing-factory-engine';

describe('listing factory workbench run', () => {
  const project = createListingProject(LISTING_FACTORY_QA_SAMPLES[0], new Date('2026-05-12T09:00:00Z'));

  it('creates a complete local run from a project', () => {
    const run = createRunFromProject(project, new Date('2026-05-12T09:00:00Z'));

    expect(run.id).toContain('run-');
    expect(run.project.productName).toBe(project.productName);
    expect(run.briefs.length).toBeGreaterThanOrEqual(6);
    expect(run.tasks.length).toBe(run.briefs.length);
    expect(run.calendarItems.length).toBeGreaterThanOrEqual(7);
    expect(run.report.clientSummary).toContain(project.productName);
    expect(run.deliveryPackage.markdown).toContain(project.productName);
    expect(run.activityLog.length).toBeGreaterThanOrEqual(4);
    expect(run.currentStep).toBe('quality_review');
    expect(run.steps.map(step => step.id)).toContain('delivery_package');
  });

  it('evaluates quality gate passed, blockers, and warnings', () => {
    const run = createRunFromProject(project);
    const gate = evaluateRunQualityGate(run);
    expect(gate.score).toBeGreaterThanOrEqual(70);
    expect(gate.requiredFixes).toEqual([]);
    expect(gate.recommendedNextStep).toMatch(/POC|任务|日历|交付/);

    const brokenRun = { ...run, briefs: run.briefs.slice(0, 2), report: { ...run.report, clientSummary: '' } };
    const brokenGate = evaluateRunQualityGate(brokenRun);
    expect(brokenGate.passed).toBe(false);
    expect(brokenGate.blockers.length).toBeGreaterThan(0);
    expect(brokenGate.requiredFixes.length).toBeGreaterThan(0);
  });

  it('round trips exported and imported runs', () => {
    const run = createRunFromProject(project);
    const exported = exportListingFactoryRun(run);
    const imported = importListingFactoryRun(exported);

    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.run.project.productName).toBe(project.productName);
      expect(imported.run.briefs).toHaveLength(run.briefs.length);
      expect(validateImportedRun(imported.run).ok).toBe(true);
    }

    expect(importListingFactoryRun('{bad json').ok).toBe(false);
    expect(validateImportedRun({ project: {} }).ok).toBe(false);
  });

  it('regenerates and rescoring brief variants without restricted copy', () => {
    const run = createRunFromProject(project);
    const original = run.briefs[0];
    const variant = regenerateBriefVariant(project, original, 'qa-seed');
    const set = regenerateBriefSet(project, original.contentType);
    const edited = reScoreBrief({ ...original, hook: `${original.hook} 先看这个真实场景。` }, project);

    expect(variant.hook).not.toBe(original.hook);
    expect(variant.riskNotes.length).toBeGreaterThan(0);
    expect(set).toHaveLength(3);
    expect(new Set(set.map(brief => brief.hook)).size).toBe(3);
    expect(edited.qualityScore.overallScore).toBeGreaterThanOrEqual(60);
    for (const brief of [variant, ...set]) {
      expect(brief.hook).not.toContain('保证');
      expect(brief.cta).not.toContain('全网最低');
    }
  });

  it('derives tasks, calendar, and delivery package from real briefs', () => {
    const run = createRunFromProject(project);
    const tasks = buildTasksFromBriefs(project, run.briefs);
    const calendar = buildCalendarFromTasks(tasks, new Date('2026-05-12T00:00:00Z'));
    const advanced = advanceTaskStatus(tasks[0]);
    const moved = moveCalendarItem(calendar[0], 2);
    const deliveryPackage = buildDeliveryPackage({ ...run, tasks, calendarItems: calendar });

    expect(tasks).toHaveLength(run.briefs.length);
    expect(calendar.length).toBeGreaterThanOrEqual(7);
    expect(advanced.status).not.toBe(tasks[0].status);
    expect(moved.date).toBe('2026-05-14');
    expect(deliveryPackage.markdown).toContain('# POC');
    expect(deliveryPackage.briefCsv).toContain('hook');
    expect(JSON.parse(deliveryPackage.projectJson).project.productName).toBe(project.productName);
    expect(deliveryPackage.clientMessageDraft).toContain(project.productName);
  });
});
