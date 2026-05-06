import { describe, expect, it } from 'vitest';
import { buildPipelineSummary, getSlaState, scoreOpportunity } from '@/lib/crm-pipeline';

describe('crm pipeline', () => {
  it('scores commercial motion from status, quote, payment, and contract stage', () => {
    expect(scoreOpportunity({
      id: '1',
      company: 'Acme',
      status: 'reviewed',
      contractStage: 'proposal',
      quoteStatus: 'sent',
      paymentStatus: 'pending',
      leadScore: '90',
      contractReadiness: '88',
      readinessAcceptanceScore: '86',
    })).toBeGreaterThan(90);

    expect(scoreOpportunity({
      id: '2',
      company: 'Lost',
      status: 'dropped',
      contractStage: 'lost',
      quoteStatus: 'rejected',
    })).toBe(0);
  });

  it('detects SLA risk and builds a prioritized pipeline summary', () => {
    const now = new Date('2026-05-05T00:00:00.000Z');
    expect(getSlaState({ id: '1', company: 'A', nextActionDue: '2026-05-04' }, now)).toBe('overdue');
    expect(getSlaState({ id: '2', company: 'B', nextActionDue: '2026-05-05' }, now)).toBe('due-soon');

    const summary = buildPipelineSummary([
      { id: '1', company: 'ReadyCo', status: 'contract', contractStage: 'waiting_payment', paymentStatus: 'pending', nextAction: 'Collect payment', nextActionDue: '2026-05-04' },
      { id: '2', company: 'NewCo', status: 'new', nextAction: 'Confirm SKU' },
      { id: '3', company: 'DropCo', status: 'dropped' },
    ], now);

    expect(summary.opportunities).toHaveLength(2);
    expect(summary.opportunities[0].company).toBe('ReadyCo');
    expect(summary.overdueCount).toBe(1);
    expect(summary.nextBestActions[0]).toContain('Collect payment');
  });
});
