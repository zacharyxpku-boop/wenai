import { describe, expect, it } from 'vitest';
import {
  appendInquiryActivity,
  buildInquiryCreatedActivity,
  buildLegacyInquiryActivities,
  buildOpsActivity,
  buildStatusChangeActivity,
  parseInquiryActivity,
  serializeInquiryActivity,
} from '@/lib/inquiry-activity';

describe('inquiry activity log', () => {
  it('creates a stable initial inquiry event', () => {
    const event = buildInquiryCreatedActivity({
      company: 'ACME',
      source: 'case-home',
      skuCount: '10',
      platforms: 'Shopify + TikTok Shop',
      createdAt: '2026-05-04T08:00:00.000Z',
    });

    expect(event.type).toBe('created');
    expect(event.title).toBe('收到新询盘');
    expect(event.body).toContain('case-home');
    expect(event.body).toContain('SKU 10');
    expect(event.body).toContain('Shopify + TikTok Shop');
  });

  it('appends status and ops events into bounded JSON', () => {
    const initial = serializeInquiryActivity([
      buildInquiryCreatedActivity({ createdAt: '2026-05-04T08:00:00.000Z' }),
    ]);
    const next = appendInquiryActivity(initial, [
      buildStatusChangeActivity({
        status: 'delivered',
        nextAction: '约复盘电话并判断是否进入主站合同',
        nextActionDue: '2026-05-06',
        at: '2026-05-04T09:00:00.000Z',
      }),
    ]);
    const parsed = parseInquiryActivity(next);

    expect(parsed).toHaveLength(2);
    expect(parsed[1].title).toContain('已交付');
    expect(parsed[1].body).toContain('约复盘电话');
  });

  it('summarizes changed ops fields without duplicating unchanged fields', () => {
    const event = buildOpsActivity({
      previous: {
        owner: 'A',
        reviewDecision: '',
        contractNextStep: '',
      },
      patch: {
        owner: 'A',
        reviewDecision: 'push_contract',
        contractNextStep: '发报价并确认付款方式',
      },
      at: '2026-05-04T10:00:00.000Z',
    });

    expect(event).not.toBeNull();
    expect(event?.title).toBe('保存复盘/合同/CRM 记录');
    expect(event?.body).toContain('推进主站合同');
    expect(event?.body).toContain('发报价');
    expect(event?.body).not.toContain('负责人');
  });

  it('records contract motion fields as commercial review activity', () => {
    const event = buildOpsActivity({
      previous: {
        contractStage: '',
        quoteStatus: 'not_sent',
        paymentStatus: 'not_started',
      },
      patch: {
        contractStage: 'proposal',
        quoteStatus: 'sent',
        paymentStatus: 'pending',
      },
      at: '2026-05-04T11:00:00.000Z',
    });

    expect(event).not.toBeNull();
    expect(event?.type).toBe('ops');
    expect(event?.title).toBeTruthy();
    expect(event?.body.split(' / ')).toHaveLength(3);
    expect(event?.body).toContain('方案/报价中');
    expect(event?.body).toContain('已发报价');
    expect(event?.body).toContain('待付款');
  });

  it('builds legacy activities for existing Redis rows', () => {
    const entries = buildLegacyInquiryActivities({
      company: 'OldCo',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
      status: 'reviewed',
      reviewDecision: 'expand_sku',
      contractNextStep: '约下一轮 SKU 评审',
      reviewNotes: '验收通过，但需要补品牌禁用词。',
    });

    expect(entries.length).toBeGreaterThanOrEqual(3);
    expect(entries.map(item => item.title).join(' ')).toContain('当前状态');
    expect(entries.map(item => item.body).join(' ')).toContain('扩 SKU');
  });

  it('ignores invalid serialized activity safely', () => {
    expect(parseInquiryActivity('not-json')).toEqual([]);
    expect(parseInquiryActivity(JSON.stringify([{ at: 1 }]))).toEqual([]);
  });
});
