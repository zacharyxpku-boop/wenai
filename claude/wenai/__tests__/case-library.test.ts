import { describe, expect, it } from 'vitest';
import {
  filterCaseLibrary,
  getCaseLibraryCategories,
  getCaseLibraryEntries,
} from '@/lib/case-library';

describe('case library', () => {
  it('builds commercial metadata for every case-study detail', () => {
    const entries = getCaseLibraryEntries();
    const campaignEntry = entries.find(
      item => item.slug === 'auto-accessory-content-pack',
    );

    expect(entries.length).toBeGreaterThanOrEqual(9);
    expect(campaignEntry?.lane).toBe('content-campaign');
    expect(campaignEntry?.commercialUse).toContain('参考样例到内容交付');
    expect(entries.find(item => item.slug === 'novahome-image')?.decision).toBe(
      'collect-inputs',
    );
  });

  it('filters cases by lane, decision, and category', () => {
    const entries = getCaseLibraryEntries();
    const autoCategory =
      entries.find(item => item.slug === 'auto-parts')?.category ?? '';
    const filtered = filterCaseLibrary(entries, {
      lane: 'content-campaign',
      decision: 'push-contract',
      category: autoCategory,
    });

    expect(filtered.map(item => item.slug)).toEqual(
      expect.arrayContaining(['auto-parts', 'auto-accessory-content-pack', 'vicseed']),
    );
    expect(filtered.every(item => item.lane === 'content-campaign')).toBe(true);
    expect(filtered.every(item => item.decision === 'push-contract')).toBe(true);
  });

  it('returns a stable category list for filter rendering', () => {
    const categories = getCaseLibraryCategories(getCaseLibraryEntries());

    expect(categories).toContain('家居用品');
    expect(categories).toContain('汽摩配件');
    expect(categories).toContain('数码电子');
  });
});
