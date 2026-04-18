'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const PLAN_INFO: Record<string, { name: string; price: string; quota: string }> = {
  team: { name: '团队版 (Team)', price: '¥499 / 月', quota: '500 次 Pipeline / 天 · 5 席' },
  enterprise: { name: '企业定制', price: '面议', quota: '无限配额 · 本地部署' },
};

function CheckoutInner() {
  const params = useSearchParams();
  const plan = params.get('plan') || 'team';
  const info = PLAN_INFO[plan] || PLAN_INFO.team;

  const [method, setMethod] = useState<'wechat' | 'alipay' | 'bank'>('wechat');
  const [claimed, setClaimed] = useState(false);
  const [claimInfo, setClaimInfo] = useState({ contact: '', amount: '', time: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleClaim = async () => {
    if (!claimInfo.contact.trim() || !claimInfo.time.trim()) {
      alert('请至少填写联系方式和付款时间');
      return;
    }
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          moduleId: 'payment-claim',
          data: {
            rating: 5,
            verdict: 'good',
            comment: `付款声明 · 档位=${plan} · 方式=${method} · ${claimInfo.note}`,
            inputSample: JSON.stringify({ ...claimInfo, plan, method }),
            timestamp: new Date().toISOString(),
          },
        }),
      });
      setClaimed(true);
    } catch {
      alert('提交失败，请联系 zachary.x.pku@gmail.com');
    } finally {
      setSubmitting(false);
    }
  };

  if (claimed) {
    return (
      <div className="max-w-[600px] mx-auto py-20 px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-5 border-2 border-success rounded-full flex items-center justify-center text-success text-2xl">
          ✓
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-3">付款声明已提交</h1>
        <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
          作者会在 <span className="text-accent font-semibold">24 小时内</span>核对款项，
          确认后立即给你的邀请码升级为 {info.name}，并通过邮箱通知。
          <br /><br />
          如需加急或有疑问，微信/邮件联系：
          <br />
          <span className="font-mono text-accent text-[12px]">zachary.x.pku@gmail.com</span>
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/" className="px-4 py-2 border border-border-default rounded-md text-[12px] font-mono text-text-primary hover:border-accent/40">
            返回首页
          </a>
          <a href="/pipelines/new-listing" className="px-4 py-2 bg-accent text-bg-root rounded-md text-[12px] font-semibold hover:bg-accent-hover">
            继续使用 Pipeline →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-border-subtle">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
          CHECKOUT
        </div>
        <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)]">
          订阅 {info.name}
        </h1>
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-[24px] font-bold text-accent tabular-nums">{info.price}</span>
          <span className="text-[11px] font-mono text-text-tertiary">{info.quota}</span>
        </div>
      </div>

      {/* MVP 付款说明 */}
      <div className="mb-5 p-3 border border-accent/30 bg-accent/5 rounded-md">
        <div className="text-[11px] font-semibold text-accent mb-1">内测期付款流程说明</div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          当前阶段未接入自动支付网关（Stripe / 微信支付商户）。
          付款 → 截图凭证 → 提交声明 → 作者 24h 内人工核对后开通订阅。
          这不是最终方案，是"3 天内能收钱"的务实选择。
        </p>
      </div>

      {/* 付款方式 */}
      <div className="mb-5">
        <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
          选择付款方式
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'wechat', label: '微信', icon: '💬' },
            { id: 'alipay', label: '支付宝', icon: '💰' },
            { id: 'bank', label: '对公转账', icon: '🏦' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id as 'wechat' | 'alipay' | 'bank')}
              className={`flex flex-col items-center gap-1 py-3 border rounded-md transition-all ${
                method === m.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border-subtle text-text-secondary hover:border-accent/30'
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              <span className="text-[11px] font-mono">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 付款信息展示 */}
      <div className="mb-5 p-5 border border-border-subtle rounded-md bg-bg-surface">
        {method === 'wechat' && (
          <div className="text-center">
            <div className="text-[12px] text-text-secondary mb-3">扫码付款给 <span className="text-accent font-semibold">Zachary</span></div>
            <div className="inline-block p-4 bg-bg-raised border border-border-subtle rounded-md mb-3">
              <div className="w-40 h-40 flex items-center justify-center bg-bg-root text-text-tertiary text-[10px] font-mono">
                （此处放微信收款码）
              </div>
            </div>
            <p className="text-[10px] font-mono text-text-tertiary">
              付款备注：wenai-{plan}-你的邮箱
            </p>
          </div>
        )}
        {method === 'alipay' && (
          <div className="text-center">
            <div className="text-[12px] text-text-secondary mb-3">扫码付款给 <span className="text-accent font-semibold">Zachary</span></div>
            <div className="inline-block p-4 bg-bg-raised border border-border-subtle rounded-md mb-3">
              <div className="w-40 h-40 flex items-center justify-center bg-bg-root text-text-tertiary text-[10px] font-mono">
                （此处放支付宝收款码）
              </div>
            </div>
            <p className="text-[10px] font-mono text-text-tertiary">
              付款备注：wenai-{plan}-你的邮箱
            </p>
          </div>
        )}
        {method === 'bank' && (
          <div>
            <div className="text-[11px] font-semibold text-text-primary mb-3">对公转账信息</div>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-tertiary">户名</span>
                <span className="text-text-primary">（待补充 · 签合同前联系作者获取）</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-tertiary">开户行</span>
                <span className="text-text-primary">（待补充）</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-tertiary">账号</span>
                <span className="text-text-primary">（待补充）</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-tertiary">备注</span>
                <span className="text-text-primary">wenai-{plan}-贵司简称</span>
              </div>
            </div>
            <p className="text-[10px] text-text-tertiary/80 mt-3 leading-relaxed">
              需要开票请在转账后将公司全称 + 税号 + 银行账户发送到 zachary.x.pku@gmail.com，3 个工作日内开具。
            </p>
          </div>
        )}
      </div>

      {/* 付款声明表单 */}
      <div className="mb-5 p-5 border border-border-subtle rounded-md">
        <div className="text-[12px] font-semibold text-text-primary mb-3">
          Step 2 · 付完款后填写声明
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-mono text-text-tertiary mb-1 block">联系方式 <span className="text-error">*</span></label>
            <input
              type="text"
              value={claimInfo.contact}
              onChange={e => setClaimInfo({ ...claimInfo, contact: e.target.value })}
              placeholder="邮箱 / 微信号 / 手机（用于接收开通通知）"
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-text-tertiary mb-1 block">付款时间 <span className="text-error">*</span></label>
            <input
              type="text"
              value={claimInfo.time}
              onChange={e => setClaimInfo({ ...claimInfo, time: e.target.value })}
              placeholder="例：2026-04-18 14:30"
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-text-tertiary mb-1 block">付款金额</label>
            <input
              type="text"
              value={claimInfo.amount}
              onChange={e => setClaimInfo({ ...claimInfo, amount: e.target.value })}
              placeholder="例：499"
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-text-tertiary mb-1 block">备注</label>
            <textarea
              value={claimInfo.note}
              onChange={e => setClaimInfo({ ...claimInfo, note: e.target.value })}
              placeholder="公司名 / 需要开票信息 / 其他说明"
              rows={2}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={submitting}
        className="w-full py-3 bg-accent text-bg-root text-[13px] font-semibold rounded-md hover:bg-accent-hover disabled:opacity-50 transition-all"
      >
        {submitting ? '提交中...' : '提交付款声明 · 24h 内开通'}
      </button>

      <p className="text-[10px] font-mono text-text-tertiary text-center mt-4">
        已有问题？直接邮件 zachary.x.pku@gmail.com
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-text-tertiary">...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
