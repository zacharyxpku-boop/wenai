import { describe, expect, it } from 'vitest';
import {
  buildBrandKnowledgeBrief,
  getCategoryGuardrail,
  normalizeCategoryKey,
} from '@/lib/ecommerce-guardrails';

describe('ecommerce guardrails', () => {
  it('normalizes category labels into ecommerce guardrail playbooks', () => {
    expect(normalizeCategoryKey('汽摩配件')).toBe('auto');
    expect(normalizeCategoryKey('beauty skincare')).toBe('beauty');
    expect(normalizeCategoryKey('unknown')).toBe('other');
  });

  it('exposes stricter thresholds for high-risk categories', () => {
    const auto = getCategoryGuardrail('auto');
    const supplement = getCategoryGuardrail('supplement');

    expect(auto.acceptanceThresholds.maxRiskCount).toBe(0);
    expect(supplement.acceptanceThresholds.reviewPassRate).toBeGreaterThanOrEqual(88);
    expect(supplement.forbiddenClaims).toContain('治疗');
  });

  it('builds a reusable brand knowledge brief with custom forbidden words', () => {
    const brief = buildBrandKnowledgeBrief({
      category: 'home',
      brandVoice: 'clean and credible',
      forbiddenWords: 'best, guaranteed',
      platforms: 'Shopify + TikTok Shop',
      owner: 'ops lead',
    });

    expect(brief).toContain('Brand Knowledge Brief');
    expect(brief).toContain('clean and credible');
    expect(brief).toContain('guaranteed');
    expect(brief).toContain('Review pass rate');
  });
});
