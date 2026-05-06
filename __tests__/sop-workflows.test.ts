import { describe, expect, it } from 'vitest';
import {
  buildStandardPack,
  formatStandardPackFollowup,
  formatStandardPackMarkdown,
  formatStandardPackOpsBrief,
  formatStandardPackReport,
  getStandardPackExecutionPlan,
  recommendWorkflowId,
  scoreStandardPackReadiness,
} from '@/lib/sop-workflows';

describe('sop workflow engine', () => {
  it('recommends workflow from natural language', () => {
    expect(recommendWorkflowId('做 podcast 口播种草')).toBe('podcast-ugc');
    expect(recommendWorkflowId('需要街采路人采访')).toBe('street-interview');
    expect(recommendWorkflowId('做 slideshow reels 批量测试')).toBe('slideshow-batch');
  });

  it('builds a standard pack with missing input gates', () => {
    const pack = buildStandardPack({
      goal: '测试 TikTok Hook',
      brand: '',
      sku: '厨房收纳盒',
      links: '',
    });

    expect(pack.workflow.id).toBe('benchmark');
    expect(pack.missingInputs).toContain('品牌 / 店铺上下文');
    expect(pack.missingInputs).toContain('benchmark URL / 竞品账号 / 评论证据');
    expect(pack.readiness.decision).toBe('needs-info');
    expect(pack.readiness.acceptanceScore).toBeLessThan(80);
    expect(pack.sections.some(section => section.title.includes('验收标准'))).toBe(true);
  });

  it('scores POC readiness for contract-grade standard packs', () => {
    const readiness = scoreStandardPackReadiness({
      goal: '10 SKU POC for TikTok Shop, review acceptance, CTR and 7 day test recap before contract',
      brand: 'US home organization Shopify brand, clean reliable tone, compliance review needed',
      sku: '10 SKU batch: drawer organizer, pantry bins, cabinet rack, with price band and selling points',
      links: 'https://example.com/tiktok-video https://example.com/amazon-listing',
      workflowId: 'slideshow-batch',
    }, []);

    expect(readiness.decision).toBe('ready-for-poc');
    expect(readiness.leadScore).toBeGreaterThanOrEqual(80);
    expect(readiness.acceptanceScore).toBeGreaterThanOrEqual(80);
    expect(readiness.contractReadiness).toBeGreaterThanOrEqual(70);
    expect(readiness.nextStepLabel).toContain('POC');
    expect(readiness.strengths.join(' ')).toContain('benchmark');
    expect(readiness.reviewChecklist.length).toBeGreaterThanOrEqual(4);
  });

  it('formats markdown as a stable deliverable', () => {
    const pack = buildStandardPack({
      goal: '做 7 天内容测试',
      brand: '美区家居独立站',
      sku: '伸缩抽屉收纳盒',
      links: 'https://example.com/video',
      workflowId: 'slideshow-batch',
    });

    const md = formatStandardPackMarkdown(pack);
    expect(md).toContain('# wenai Slideshow / Reels 批量测试 标准交付包');
    expect(md).toContain('## 04 验收标准');
    expect(md).toContain('## 07 POC 准入与复盘判断');
    expect(md).toContain('## 08 商业推进动作');
    expect(md).toContain('验收准备度');
    expect(md).toContain('合同准备度');
    expect(md).toContain('## 下一步');
  });

  it('formats customer-ready report, ops brief, and followup assets', () => {
    const pack = buildStandardPack({
      goal: '10 SKU POC for TikTok Shop, review acceptance and contract decision',
      brand: 'US home organization Shopify brand with owner review',
      sku: '10 SKU batch: drawer organizer, pantry bins, cabinet rack',
      links: 'https://example.com/tiktok-video https://example.com/amazon-listing',
      workflowId: 'slideshow-batch',
    });

    const report = formatStandardPackReport(pack);
    const brief = formatStandardPackOpsBrief(pack);
    const followup = formatStandardPackFollowup(pack);

    expect(report).toContain('验收摘要');
    expect(report).toContain('合同准备');
    expect(report).toContain('下一步');
    expect(report).toContain('推荐执行路线');
    expect(brief).toContain('执行 Brief');
    expect(brief).toContain('验收标准');
    expect(brief).toContain('红线');
    expect(followup).toContain('你好');
    expect(followup).toContain('POC 状态');
    expect(followup).toContain('拿到这些信息后');
  });

  it('routes standard packs to the right customer execution pipeline', () => {
    const pack = buildStandardPack({
      goal: '做 slideshow reels 批量测试, 7 天后复盘 CTR 和合同判断',
      brand: 'TikTok Shop home brand with owner review',
      sku: '10 SKU batch with product images and selling points',
      links: 'https://example.com/tiktok-video',
      workflowId: 'slideshow-batch',
    });

    const plan = getStandardPackExecutionPlan(pack);

    expect(plan.primaryPipeline.href).toBe('/pipelines/ab-test');
    expect(plan.supportingPipelines.some(item => item.href === '/pipelines/product-image')).toBe(true);
    expect(plan.customerSteps.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps hypothesis packs away from contract push when benchmark is missing', () => {
    const pack = buildStandardPack({
      goal: '10 SKU TikTok Shop launch POC, 7 天测试后做验收复盘并评估主站合同',
      brand: '美区家居独立站, founder 亲自审核, 有商品图和详情页素材',
      sku: '10 SKU batch: drawer organizer, pantry bins, cabinet rack, hooks, clips, shelf divider',
      links: '',
      workflowId: 'benchmark',
    });

    expect(pack.readiness.decision).toBe('hypothesis-only');
    expect(pack.readiness.contractBlockers.join(' ')).not.toContain('10 SKU');
    expect(pack.sections.some(section => section.title.includes('商业推进动作'))).toBe(true);
    expect(formatStandardPackMarkdown(pack)).toContain('补 benchmark 证据');
  });
});
