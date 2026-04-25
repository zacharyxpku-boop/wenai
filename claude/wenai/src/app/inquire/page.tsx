'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  company: string;
  contact: string;
  channel: string;
  scale: string;
  category: string;
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
  painPoint: '',
  budget: '',
  timeline: '',
};

function InquireInner() {
  const params = useSearchParams();
  const source = params.get('from') || 'direct';

  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const ready = form.company.trim() && form.contact.trim() && form.painPoint.trim().length > 10;

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
          作者本人会在 <span className="text-accent font-semibold">24 小时内</span>主动联系
          {form.channel === 'wechat' ? '加你微信' : form.channel === 'phone' ? '电话' : '邮件回复'}。
          不走销售,不打骚扰电话,只问跟你业务直接相关的几个问题。
        </p>
        <div className="space-y-2 mb-6">
          <Link href="/cases" className="block px-4 py-2.5 border border-border-default rounded-md text-[12px] font-mono text-text-primary hover:border-accent/40">
            等回复时先看 4 个案例 →
          </Link>
          <Link href="/" className="block px-4 py-2.5 text-[11px] font-mono text-text-tertiary hover:text-accent">
            或注册 demo 邀请码自己试试
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
      <div className="mb-8">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          ENTERPRISE INQUIRY · 企业询盘
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          告诉我们最痛的一件事
        </h1>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          填完作者本人 24 小时内主动联系。不走销售流程 · 不要 PPT 演示 · 直接问跟你业务相关的几个问题。
          看完判断要不要做 POC,不强卖。
        </p>
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

        {/* Step 2 · 痛点描述 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ② 最痛的一件事 *
          </legend>
          <textarea
            value={form.painPoint}
            onChange={e => setForm({ ...form, painPoint: e.target.value })}
            placeholder={`举例:\n- 每月新品 200+,翻译+合规要 5 个运营全职跟,慢且错率高\n- 摄影棚排队两周,新品上架慢错过流量窗口\n- 媒介一周发 50 封达人邮件,回复率 < 3%`}
            rows={6}
            className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none mt-2"
          />
          <div className="text-[9px] font-mono text-text-tertiary mt-1">
            {form.painPoint.length}/2000 · 越具体越好,数字+场景比"想用 AI 提效"有用 100 倍
          </div>
        </fieldset>

        {/* Step 3 · 节奏 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ③ 节奏 (可选)
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">预算区间</label>
              <input
                type="text"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
                placeholder="例: 5-30 万/年"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-text-secondary mb-1 block">期望落地时间</label>
              <input
                type="text"
                value={form.timeline}
                onChange={e => setForm({ ...form, timeline: e.target.value })}
                placeholder="例: Q3 内 / 不急"
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
          </div>
        </fieldset>

        {/* Step 4 · 联系方式 */}
        <fieldset className="border border-border-subtle rounded-md p-4">
          <legend className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-2">
            ④ 怎么联系你 *
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
          {submitting ? '提交中...' : '提交询盘 · 24h 内联系'}
        </button>

        <p className="text-[10px] font-mono text-text-tertiary text-center">
          填完不强卖 · 询盘信息只作者本人看 · 详见 <Link href="/privacy" className="text-accent underline">隐私政策</Link>
        </p>
      </div>

      {/* 替代路径 */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3 text-center">
          不想填表?
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <a
            href="mailto:zachary.x.pku@gmail.com?subject=Wenai%20Enterprise%20%E8%AF%A2%E7%9B%98"
            className="px-4 py-2 border border-border-default rounded text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            📧 直接邮件
          </a>
          <Link
            href="/invite?code=demo"
            className="px-4 py-2 border border-border-default rounded text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            🎫 先用 demo 试 7 天
          </Link>
          <Link
            href="/cases"
            className="px-4 py-2 border border-border-default rounded text-[11px] font-mono text-text-primary hover:border-accent/40"
          >
            📊 看 4 个案例数据
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InquirePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-tertiary font-mono text-[12px]">加载中...</div>}>
      <InquireInner />
    </Suspense>
  );
}
