import { describe, expect, it } from 'vitest';
import { buildExecutiveRecap, excerpt, readCommercialBriefing } from '@/lib/share-readonly';

describe('share readonly helpers', () => {
  const markdown = [
    '# POC recap',
    '',
    '- Acceptance score: 88/100',
    '- Commercial score: 91/100',
    '- Decision: push-contract',
    '- Contract status: ready',
    '',
    '## Commercial briefing',
    '- Commercial motion: close now',
    '- Price signal: high intent',
    '- Package recommendation: monthly POC ops',
    '- Owner message: send contract',
    '',
    '## Strengths',
    '- SKU pack is complete',
    '- Benchmark evidence is ready',
    '',
    '## Blockers',
    '- Legal owner must review claims',
    '',
    '## Commercial next actions',
    '- Send contract and invoice',
  ].join('\n');

  it('extracts executive fields from a POC share markdown', () => {
    const brief = readCommercialBriefing(markdown);

    expect(brief.acceptanceScore).toBe('88/100');
    expect(brief.commercialScore).toBe('91/100');
    expect(brief.contractStatus).toBe('ready');
    expect(brief.proofPoints).toContain('SKU pack is complete');
    expect(brief.nextActions).toContain('Send contract and invoice');
  });

  it('builds a compact executive recap', () => {
    const recap = buildExecutiveRecap('Board recap', readCommercialBriefing(markdown));

    expect(recap).toContain('Board recap');
    expect(recap).toContain('Commercial motion: close now');
    expect(recap).toContain('Next action: Send contract and invoice');
  });

  it('creates safe excerpts from markdown', () => {
    expect(excerpt('## Hello **world** `code`', 20)).toBe('Hello world code');
  });
});
