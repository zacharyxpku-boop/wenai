import { describe, expect, it } from 'vitest';
import { buildBrandIqProfile } from '@/lib/brand-iq';

describe('brand iq profile', () => {
  it('turns category rules and brand inputs into reusable operating rules', () => {
    const profile = buildBrandIqProfile({
      category: 'beauty',
      brandName: 'Acme Beauty',
      brandVoice: 'clinical but warm',
      forbiddenWords: 'cure, guaranteed',
      platforms: 'Shopify + TikTok Shop',
      owner: 'Ops lead',
      benchmarkLinks: 'https://example.com/benchmark',
    });

    expect(profile.brandName).toBe('Acme Beauty');
    expect(profile.readinessScore).toBe(100);
    expect(profile.voiceRules.join(' ')).toContain('clinical but warm');
    expect(profile.forbiddenClaims).toContain('cure');
    expect(profile.workflowDefaults).toHaveLength(3);
    expect(profile.markdown).toContain('wenai Brand IQ Profile');
  });

  it('keeps missing benchmark and owner as explicit setup risks', () => {
    const profile = buildBrandIqProfile({ category: 'auto' });

    expect(profile.readinessScore).toBeLessThan(80);
    expect(profile.risks.join(' ')).toContain('Review owner is missing');
    expect(profile.risks.join(' ')).toContain('Benchmark links are missing');
  });
});
