'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * /me · 商家进入 wenai 后台第一眼看到的总览
 *
 * 之前直接落 /me/skus 是仓库视角, 商家其实更想先看"我的状态怎么样"
 * 这个页面把四类信号第一行铺开:
 *   1. 累计省钱 (近 7 天) → /me/savings
 *   2. 信号待看 → /me/alerts
 *   3. SKU 库 + 复评提醒 → /me/skus
 *   4. 今日花费 + 设置 → /me/settings
 *
 * 加最近 5 条产出的快速重入口
 */

interface AlertsSummary {
  count: number;
  criticalCount: number;
  warningCount: number;
}

interface SavingsSummary {
  grandTotalSavedCny: number;
  totalCalls: number;
  days: number;
}

interface CostSummary {
  todayCny: number;
  skuCount: number;
}

interface DigestPoint {
  date: string;
  critical: number;
  warning: number;
  info: number;
}

interface SettingsResp {
  settings: {
    email?: string;
    digestEmailEnabled?: boolean;
    industry?: string;
  };
}

interface InventorySummary {
  count: number;
  inventory: Array<{ status: 'healthy' | 'low' | 'out' }>;
}

export default function MeDashboardPage() {
  const [alerts, setAlerts] = useState<AlertsSummary | null>(null);
  const [savings, setSavings] = useState<SavingsSummary | null>(null);
  const [cost, setCost] = useState<CostSummary | null>(null);
  const [digests, setDigests] = useState<DigestPoint[] | null>(null);
  const [settings, setSettings] = useState<SettingsResp['settings'] | null>(null);
  const [inv, setInv] = useState<InventorySummary | null>(null);

  useEffect(() => {
    fetch('/api/user/alerts').then(r => r.json()).then(setAlerts).catch(() => {});
    fetch('/api/user/savings-summary?days=7').then(r => r.json()).then(setSavings).catch(() => {});
    fetch('/api/user/cost-summary').then(r => r.json()).then(setCost).catch(() => {});
    fetch('/api/user/digest?limit=7').then(r => r.json()).then(d => setDigests(d.digests || [])).catch(() => {});
    fetch('/api/user/settings').then(r => r.json()).then((d: SettingsResp) => setSettings(d.settings || {})).catch(() => {});
    fetch('/api/user/inventory').then(r => r.json()).then((d: InventorySummary) => setInv(d)).catch(() => {});
  }, []);

  const invStats = inv ? {
    out: inv.inventory.filter(i => i.status === 'out').length,
    low: inv.inventory.filter(i => i.status === 'low').length,
  } : null;

  const alertSeverityClass =
    !alerts || alerts.count === 0 ? 'border-success/40 text-success' :
    alerts.criticalCount > 0 ? 'border-error/50 text-error' :
    alerts.warningCount > 0 ? 'border-warning/50 text-warning' :
    'border-cat-content/40 text-cat-content';

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* 头 */}
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-1">
            商家工作台
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1 font-[family-name:var(--font-outfit)]">
            欢迎回来 · 你的状态总览
          </h1>
          <p className="text-[12px] text-text-secondary">
            一屏看完: 省钱 · 信号 · SKU 健康 · 今日烧钱 · 设置
          </p>
        </div>

        {/* 4 卡片大格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 省钱 */}
          <Link
            href="/me/savings"
            className="block border border-success/40 bg-gradient-to-br from-success/10 to-accent/5 rounded-lg p-5 hover:from-success/15 transition-colors"
          >
            <div className="text-[10px] font-mono text-success uppercase tracking-wider mb-2">
              💰 累计节省 (近 {savings?.days ?? 7} 天)
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-success tabular-nums font-[family-name:var(--font-outfit)]">
              {savings ? `¥${savings.grandTotalSavedCny.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-2">
              {savings?.totalCalls ? `${savings.totalCalls} 次调用 · ` : ''}vs 真人/外包 · 看明细 →
            </div>
          </Link>

          {/* 信号 */}
          <Link
            href="/me/alerts"
            className={`block border rounded-lg p-5 transition-colors hover:bg-bg-surface/50 ${alertSeverityClass}`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider mb-2 opacity-90">
              🔔 待看信号
            </div>
            <div className="text-3xl lg:text-4xl font-bold tabular-nums font-[family-name:var(--font-outfit)]">
              {alerts?.count ?? '—'}
            </div>
            <div className="text-[10px] font-mono mt-2 opacity-80">
              {alerts && alerts.count > 0
                ? `${alerts.criticalCount} 紧急 · ${alerts.warningCount} 警示 · ${alerts.count - alerts.criticalCount - alerts.warningCount} 提示 →`
                : '✓ 状态健康, 没问题需要处理'}
            </div>
          </Link>

          {/* 今日花费 */}
          <Link
            href="/me/settings"
            className="block border border-border-subtle bg-bg-surface/30 rounded-lg p-5 hover:border-accent/40 transition-colors"
          >
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
              💸 今日 wenai 花费
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-accent tabular-nums font-[family-name:var(--font-outfit)]">
              {cost ? `¥${cost.todayCny.toFixed(2)}` : '—'}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-2">
              {settings?.email && settings.digestEmailEnabled
                ? '✉️ 每日 digest 已开 · 改设置 →'
                : '设置邮件推送 + 行业上下文 →'}
            </div>
          </Link>

          {/* SKU */}
          <Link
            href="/me/skus"
            className="block border border-cat-content/30 bg-cat-content/5 rounded-lg p-5 hover:bg-cat-content/10 transition-colors"
          >
            <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider mb-2">
              📦 SKU 库
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-cat-content tabular-nums font-[family-name:var(--font-outfit)]">
              {cost?.skuCount ?? '—'}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-2">
              选品/测款/数据洞察都基于这份历史 →
            </div>
          </Link>
        </div>

        {/* 库存监控条 (有数据才显示) */}
        {inv && inv.count > 0 && invStats && (
          <Link
            href="/me/inventory"
            className={`block border rounded-lg px-4 py-3 mb-6 transition-colors ${
              invStats.out > 0
                ? 'border-error/50 bg-error/5 hover:bg-error/10'
                : invStats.low > 0
                  ? 'border-warning/40 bg-warning/5 hover:bg-warning/10'
                  : 'border-border-subtle hover:border-accent/40'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">库存监控</div>
                  <div className="text-[13px] text-text-primary">
                    {inv.count} 个 SKU 在监控
                    {invStats.out > 0 && <span className="text-error font-bold"> · 🔴 {invStats.out} 断货</span>}
                    {invStats.low > 0 && <span className="text-warning"> · 🟡 {invStats.low} 低位</span>}
                    {invStats.out === 0 && invStats.low === 0 && <span className="text-success"> · ✓ 全健康</span>}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-accent">看详情 →</span>
            </div>
          </Link>
        )}

        {/* 7 天 digest 趋势 (如果有) */}
        {digests && digests.length > 0 && (
          <section className="mb-6 border border-border-subtle bg-bg-surface/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                近 {digests.length} 天信号 cron 走势
              </div>
              <Link href="/me/alerts" className="text-[10px] font-mono text-accent hover:underline">
                看完整 inbox →
              </Link>
            </div>
            <div className="flex items-end gap-1 h-12">
              {digests.slice().reverse().map(p => {
                const total = p.critical + p.warning + p.info;
                return (
                  <div key={p.date} className="flex-1 flex flex-col-reverse" title={`${p.date} · ${p.critical}🚨 / ${p.warning}⚠️ / ${p.info}💡`}>
                    {p.critical > 0 && <div className="bg-error/70" style={{ height: `${(p.critical / Math.max(total, 1)) * 100}%`, minHeight: '2px' }} />}
                    {p.warning > 0 && <div className="bg-warning/70" style={{ height: `${(p.warning / Math.max(total, 1)) * 100}%`, minHeight: '2px' }} />}
                    {p.info > 0 && <div className="bg-cat-content/60" style={{ height: `${(p.info / Math.max(total, 1)) * 100}%`, minHeight: '2px' }} />}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {digests.slice().reverse().map(p => (
                <div key={p.date} className="flex-1 text-center text-[8px] font-mono text-text-tertiary tabular-nums">
                  {p.date.slice(5)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 跑模块快捷入口 */}
        <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
            🚀 直接跑模块
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { href: '/pipelines/product-discovery', label: '🎯 选品发现', desc: 'AI 推 5-8 候选' },
              { href: '/pipelines/ai-photoshoot', label: '🎬 AI 影棚', desc: '8 模式生图' },
              { href: '/pipelines/ai-video', label: '🎞️ AI 视频', desc: '一图变 5s 短片' },
              { href: '/pipelines/video-teardown', label: '🔬 拆爆款', desc: 'TikTok 出分镜' },
              { href: '/modules/standard-pack', label: '📦 SOP 标品', desc: '一键生成交付包' },
              { href: '/pipelines/ab-test', label: '⚗️ 测款 A-B', desc: '9 张测点击率' },
              { href: '/pipelines/data-insights', label: '📊 数据洞察', desc: '诊断 + 行动' },
              { href: '/pipelines/customer-service', label: '🤝 客服转化', desc: '三版回复推单' },
              { href: '/pipelines/batch-launch', label: '🏭 批量上架', desc: '50 SKU 一键' },
              { href: '/benchmark', label: '📊 行业基线', desc: '看你 SKU 排第几' },
            ].map(m => (
              <Link
                key={m.href}
                href={m.href}
                className="border border-border-subtle/60 hover:border-accent/40 rounded p-2 hover:bg-bg-surface/50 transition-colors"
              >
                <div className="text-[12px] font-semibold text-text-primary">{m.label}</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">{m.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 没填行业的引导 */}
        {settings && !settings.industry && (
          <section className="mt-6 border border-cat-content/30 bg-cat-content/5 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-[12px] font-bold text-cat-content">💡 让 AI 推荐更贴你的实际盘子</div>
                <div className="text-[11px] text-text-secondary mt-1">
                  花 30 秒填一句“你做的什么生意” → 决策类模块会基于这个上下文给建议
                </div>
              </div>
              <Link href="/me/settings" className="text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-3 py-1.5">
                去设置 →
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
