'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ListingFactoryInquiryHandoff } from '@/components/marketing/ListingFactorySections';
import { buildStandardPack } from '@/lib/sop-workflows';
import { buildInquiryStandardPackPrefill, buildInquiryStandardPackRoute } from '@/lib/standard-pack-routing';

interface FormData {
  company: string;
  contact: string;
  channel: string;
  scale: string;
  category: string;
  skuCount: string;
  platforms: string;
  assetsReady: string;
  expectedDeliverables: string;
  creativeNeeds: string;
  benchmarkLinks: string;
  painPoint: string;
  budget: string;
  timeline: string;
}

const INITIAL: FormData = {
  company: '',
  contact: '',
  channel: 'email',
  scale: '',
  category: '',
  skuCount: '',
  platforms: '',
  assetsReady: '',
  expectedDeliverables: '',
  creativeNeeds: '',
  benchmarkLinks: '',
  painPoint: '',
  budget: '',
  timeline: '',
};

function InquireInner() {
  const params = useSearchParams();
  const source = params.get('from') || 'direct';
  const skuCountFromUrl = params.get('skuCount') || '';
  const platformFromUrl = params.get('platform') || '';

  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const ready = form.company.trim() && form.contact.trim() && form.painPoint.trim().length > 10;
  const submittedStandardPackHref = buildInquiryStandardPackRoute({
    company: form.company,
    scale: form.scale,
    category: form.category,
    skuCount: form.skuCount,
    platforms: form.platforms,
    assetsReady: form.assetsReady,
    expectedDeliverables: form.expectedDeliverables,
    creativeNeeds: form.creativeNeeds,
    benchmarkLinks: form.benchmarkLinks,
    painPoint: form.painPoint,
  });
  const prefill = buildInquiryStandardPackPrefill({
    company: form.company,
    scale: form.scale,
    category: form.category,
    skuCount: form.skuCount,
    platforms: form.platforms,
    assetsReady: form.assetsReady,
    expectedDeliverables: form.expectedDeliverables,
    creativeNeeds: form.creativeNeeds,
    benchmarkLinks: form.benchmarkLinks,
    painPoint: form.painPoint,
  });
  const readiness = buildStandardPack({
    goal: prefill.goal,
    brand: prefill.brand,
    sku: prefill.sku,
    links: prefill.links || '',
    workflowId: prefill.workflow,
  }).readiness;
  const publicReadiness = {
    label: toCustomerCopy(readiness.label),
    stageLabel: toCustomerCopy(readiness.stageLabel),
    nextStepLabel: toCustomerCopy(readiness.nextStepLabel),
    contractBlockers: readiness.contractBlockers.map(toCustomerCopy),
  };

  useEffect(() => {
    if (!skuCountFromUrl && !platformFromUrl) return;
    setForm(prev => ({
      ...prev,
      skuCount: prev.skuCount || skuCountFromUrl,
      platforms: prev.platforms || platformFromUrl,
    }));
  }, [skuCountFromUrl, platformFromUrl]);

  const handleSubmit = async () => {
    if (!ready) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/sales/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败,请稍后重试或邮件联系');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-5 border-2 border-success rounded-full flex items-center justify-center text-success text-2xl">
          ✓
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          已收到询盘
        </h1>
        <p className="text-[13px] text-text-secondary leading-relaxed mb-6">
          我会在 <span className="text-accent font-semibold">24 小时内</span>主动联系
          {form.channel === 'wechat' ? '加你微信' : form.channel === 'phone' ? '电话' : '邮件回复'}。
          不走话术,不打骚扰电话,只确认类目、SKU、交付边界和下一步试跑节奏。
        </p>
        <div className="space-y-2 mb-6">
          <Link href={submittedStandardPackHref} className="block px-4 py-2.5 border border-accent/40 bg-accent/10 rounded-md text-[12px] font-mono text-accent hover:bg-accent/15">
            先生成试跑标准包
          </Link>
          <Link href="/poc" className="block px-4 py-2.5 border border-border-default rounded-md text-[12px] font-mono text-text-primary hover:border-accent/40">
            查看 10 SKU 验收标准
          </Link>
          <Link href="/demo" className="block px-4 py-2.5 text-[11px] font-mono text-text-tertiary hover:text-accent">
            再看一次演示流程
          </Link>
        </div>
        <p className="text-[10px] font-mono text-text-tertiary">
          催单或紧急: <a href="mailto:zachary.x.pku@gmail.com" className="text-accent">zachary.x.pku@gmail.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto py-10 px-6">
      <ListingFactoryInquiryHandoff />
      <div className="mb-8">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          10 SKU 试跑申请
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          提交 10 个 SKU 试跑需求
        </h1>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          你只要写清楚类目、平台和最卡的地方。系统会先生成一份标准包预览, 我再判断是否值得进入正式试跑。
        </p>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            ['准备', '选 10 个真实 SKU, 最好覆盖 2-3 个子类目'],
            ['交付', '上新标准流程、主图方向、详情页文案、合规提醒、客服话术'],
            ['验收', '看返工减少、人工终审通过率、内容测试和 30 天复评节奏'],
          ].map(([title, body]) => (
            <div key={title} className="border border-border-subtle rounded-md bg-bg-surface/40 p-3">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">{title}</div>
              <div className="text-[11px] text-text-secondary leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 border border-accent/30 rounded-lg bg-accent/10 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">
                试跑匹配度预览
              </div>
              <div className="text-[14px] font-semibold text-text-primary">{publicReadiness.label}</div>
              <p className="mt-1 text-[12px] text-text-secondary leading-relaxed">{publicReadiness.stageLabel}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 min-w-[260px]">
              <MiniScore label="线索" value={readiness.leadScore} />
              <MiniScore label="验收" value={readiness.acceptanceScore} />
              <MiniScore label="合同" value={readiness.contractReadiness} />
            </div>
          </div>
          <div className="mt-3 break-words text-[12px] leading-relaxed text-text-primary [overflow-wrap:anywhere]">
            {publicReadiness.nextStepLabel}
          </div>
          {publicReadiness.contractBlockers.length > 0 && (
            <div className="mt-2 break-words text-[11px] leading-relaxed text-text-secondary [overflow-wrap:anywhere]">
              当前阻塞: {publicReadiness.contractBlockers.slice(0, 2).join(' / ')}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Step 1 · 公司基本信息 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ① 你们是谁
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">公司名 *</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder="例: 深圳 XX 跨境电子商务有限公司"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">规模</label>
              <select
                value={form.scale}
                onChange={e => setForm({ ...form, scale: e.target.value })}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                <option value="">不指定</option>
                <option value="<50">{'<'} 50 人</option>
                <option value="50-200">50-200 人</option>
                <option value="200-1000">200-1000 人</option>
                <option value="1000+">1000+ 人</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">主营品类</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                <option value="">不指定</option>
                <option value="home">家居用品</option>
                <option value="auto">汽摩配件</option>
                <option value="digital">数码电子</option>
                <option value="tool">工具工艺</option>
                <option value="living">生活百货</option>
                <option value="mixed">混合多品类</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Step 2 · 试跑输入资料 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ② 试跑输入资料
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">准备跑几个 SKU</label>
              <input
                type="text"
                value={form.skuCount}
                onChange={e => setForm({ ...form, skuCount: e.target.value })}
                placeholder="例: 10 个真实 SKU / 先 5 个样品"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">目标平台</label>
              <input
                type="text"
                value={form.platforms}
                onChange={e => setForm({ ...form, platforms: e.target.value })}
                placeholder="例: Shopify + TikTok Shop / Amazon"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">素材准备情况</label>
              <select
                value={form.assetsReady}
                onChange={e => setForm({ ...form, assetsReady: e.target.value })}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                <option value="">不指定</option>
                <option value="ready">已有商品图/参数/卖点</option>
                <option value="partial">只有部分图或参数</option>
                <option value="none">还没有素材, 需要先整理</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">最想验收什么</label>
              <input
                type="text"
                value={form.expectedDeliverables}
                onChange={e => setForm({ ...form, expectedDeliverables: e.target.value })}
                placeholder="例: 主图方向 / 详情页 / 合规 / 客服话术 / 内容参考拆解 / 短视频脚本 / 轮播图测试"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">创意生产需求</label>
              <select
                value={form.creativeNeeds}
                onChange={e => setForm({ ...form, creativeNeeds: e.target.value })}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                <option value="">先不做</option>
                <option value="benchmark-only">只做内容参考拆解</option>
                <option value="podcast-ugc">访谈感种草内容</option>
                <option value="street-interview">街采感短视频</option>
                <option value="slideshow-batch">轮播图 / 短视频批量测试</option>
                <option value="batch-ugc">批量真人感短视频</option>
                <option value="animated-ads">动画广告素材</option>
                <option value="editing-only">只做粗剪 / 精剪优化</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">参考链接 / 竞品账号</label>
              <input
                type="text"
                value={form.benchmarkLinks}
                onChange={e => setForm({ ...form, benchmarkLinks: e.target.value })}
                placeholder="例: TikTok 链接 / Instagram 账号 / Amazon 商品页"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
          </div>
        </fieldset>

        {/* Step 3 · 痛点描述 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ③ 最痛的一件事 *
          </legend>
          <textarea
            value={form.painPoint}
            onChange={e => setForm({ ...form, painPoint: e.target.value })}
            placeholder={`举例:\n- 每月新品 200+, 商品图/详情页/合规要 5 个运营全职跟,慢且错率高\n- 摄影棚排队两周,新品上架慢错过流量窗口\n- 10 个 SKU 想先验证上新物料包能不能减少返工`}
            rows={6}
            className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none mt-2"
          />
          <div className="text-[9px] font-mono text-text-tertiary mt-1">
            {form.painPoint.length}/2000 · 越具体越好, 数字+场景比“想提效”更容易判断能否交付
          </div>
        </fieldset>

        {/* Step 4 · 节奏 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ④ 节奏 (可选)
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">预算区间</label>
              <input
                type="text"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
                placeholder="例: 可先小额试跑 / 企业接入走合同"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">期望落地时间</label>
              <input
                type="text"
                value={form.timeline}
                onChange={e => setForm({ ...form, timeline: e.target.value })}
                placeholder="例: 2 周内完成试跑 / Q3 内接入"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
          </div>
        </fieldset>

        {/* Step 5 · 联系方式 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ⑤ 怎么联系你 *
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div className="md:col-span-1">
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">渠道</label>
              <select
                value={form.channel}
                onChange={e => setForm({ ...form, channel: e.target.value })}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                <option value="email">邮件</option>
                <option value="wechat">微信</option>
                <option value="phone">电话</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">
                {form.channel === 'wechat' ? '微信号' : form.channel === 'phone' ? '手机号' : '邮箱'}
              </label>
              <input
                type="text"
                value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })}
                placeholder={form.channel === 'wechat' ? 'wxid_xxx' : form.channel === 'phone' ? '13800138000' : 'name@company.com'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
          </div>
        </fieldset>

        {error && (
          <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
            ✗ {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!ready || submitting}
          className="w-full py-3 bg-accent text-bg-root rounded-md text-[13px] font-semibold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? '提交中...' : '提交试跑需求 · 24h 内联系'}
        </button>

        <p className="text-[10px] font-mono text-text-tertiary text-center">
          填完不强卖 · 只用于判断试跑边界 · 详见 <Link href="/privacy" className="text-accent underline">隐私政策</Link>
        </p>
      </div>

      {/* 替代路径 */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3 text-center">
          暂时不想填表?
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <a
            href="mailto:zachary.x.pku@gmail.com?subject=Wenai%20Enterprise%20%E8%AF%A2%E7%9B%98"
            className="px-4 py-2 border border-border-default rounded text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            直接邮件
          </a>
          <Link
            href="/demo"
            className="px-4 py-2 border border-border-default rounded text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            先看演示流程
          </Link>
          <Link
            href="/cases"
            className="px-4 py-2 border border-border-default rounded text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            看交付样例
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border-subtle rounded-md bg-bg-root/45 p-2 text-center">
      <div className="text-[9px] font-mono text-text-tertiary uppercase">{label}</div>
      <div className="mt-1 text-[16px] font-bold text-accent font-mono tabular-nums">{value}</div>
    </div>
  );
}

function toCustomerCopy(value: string) {
  return value
    .replace(/缺少 benchmark 证据, 复盘时无法解释内容假设来源/gi, '缺少内容参考证据, 复盘解释不够稳')
    .replace(/缺少 10 SKU\/批量范围, 更像一次性工具试用而不是标准 POC/gi, '缺少批量范围, 暂时不像标准试跑')
    .replace(/先补 benchmark, 再决定是否进入 POC/gi, '先补内容参考, 再决定是否进入试跑')
    .replace(/先跑 10 SKU POC, 同时补齐复盘与审核机制/gi, '先跑 10 SKU, 同时补齐复盘和审核机制')
    .replace(/benchmark/gi, '内容参考')
    .replace(/benchmark-to-campaign/gi, '内容参考到营销包')
    .replace(/POC/g, '试跑')
    .replace(/AI/g, '系统')
    .replace(/SOP/g, '标准流程')
    .replace(/Hook/gi, '开场句')
    .replace(/Brief/gi, '执行说明')
    .replace(/GMV/gi, '销售额')
    .replace(/ROI/gi, '投入产出')
    .replace(/10 SKU\/批量/g, '10 SKU 或批量');
}

export default function InquirePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-tertiary font-mono text-[12px]">加载中...</div>}>
      <InquireInner />
    </Suspense>
  );
}
