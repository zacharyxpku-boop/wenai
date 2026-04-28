'use client';

import { useState, useEffect } from 'react';
import ModuleCard from '@/components/ModuleCard';
import OnboardingTour from '@/components/OnboardingTour';
import { PublicSavingsCounter } from '@/components/PublicSavingsCounter';
import ROICalculator from '@/components/ROICalculator';
import modulesConfig from '@/config/modules.json';
import clientConfig from '@/config/client.json';

interface UsageStats {
  todayCount: number;
  weekCount: number;
  totalCount: number;
  weekTokens: number;
  avgRating: number;
  ratingCount: number;
  ranking: { moduleId: string; count: number }[];
  dailyTrend: { date: string; count: number; tokens: number }[];
}

// 每次AI调用替代的人工时间(分钟)和人力时薪(元)
const MODULE_ROI: Record<string, { minutesSaved: number; label: string }> = {
  translate: { minutesSaved: 45, label: '翻译' },
  outreach: { minutesSaved: 30, label: '外联' },
  reviews: { minutesSaved: 60, label: '评论分析' },
  copywriting: { minutesSaved: 40, label: '文案' },
  'ip-compliance': { minutesSaved: 90, label: '合规检索' },
  content: { minutesSaved: 35, label: '种草内容' },
  images: { minutesSaved: 50, label: '主图设计' },
  livestream: { minutesSaved: 25, label: '直播脚本' },
  competitor: { minutesSaved: 120, label: '竞品拆解' },
  selection: { minutesSaved: 80, label: '选品' },
  operations: { minutesSaved: 60, label: '运营策略' },
  'customer-service': { minutesSaved: 15, label: '客服' },
  leads: { minutesSaved: 40, label: '获客' },
  video: { minutesSaved: 30, label: '视频' },
  'ocr-translate': { minutesSaved: 30, label: '图片OCR翻译' },
  positioning: { minutesSaved: 180, label: '直播间定位' },
  'private-domain': { minutesSaved: 90, label: '私域序列' },
  'data-insights': { minutesSaved: 120, label: '数据洞察' },
  'ad-optimizer': { minutesSaved: 90, label: '投流诊断' },
};
const HOURLY_COST_RMB = 35; // 代运营公司普通员工时薪

// ============================================================
// 聚焦重构 · 2026-04 · 见 .planning/DECISION.md
// 从 19 模块大平台 → 3 旗舰 + 次级 + 折叠观察
// 回退：把 MODULE_TIERS 改回全部 'flagship' 即可恢复老首页
// ============================================================

type Tier = 'flagship' | 'support' | 'aux' | 'observe';

const MODULE_TIERS: Record<string, Tier> = {
  // 🏆 旗舰 — 阿里国际 250 人验证过的真刚需
  translate: 'flagship',
  reviews: 'flagship',
  outreach: 'flagship',
  // 🔹 次级 — 刚需但不首屏抢焦
  'ip-compliance': 'support',
  copywriting: 'support',
  'ocr-translate': 'support',
  // 🔸 辅助 — 有场景但 AI 确定性一般
  video: 'aux',
  'customer-service': 'aux',
  livestream: 'aux',
  content: 'aux',
  'private-domain': 'aux',
  'ad-optimizer': 'aux',
  // 🔻 观察 — 代码保留不默认启用
  competitor: 'observe',
  'data-insights': 'observe',
  images: 'observe',
  operations: 'observe',
  leads: 'observe',
  positioning: 'observe',
  selection: 'observe',
};

const FLAGSHIP_HERO: Record<string, {
  eyebrow: string;
  title: string;
  body: string;
  kpi: string;
  cta: string;
}> = {
  translate: {
    eyebrow: '旗舰 · 跨境代运营第一刚需',
    title: '一次贴 10 条，5 语言同时出',
    body: '阿里国际 250 人团队验证过的真实场景。把每天手工翻译 listing 的 2 小时压缩到 30 秒。英日韩西德葡，术语表自动对齐。',
    kpi: '节省 45 分钟 / 次',
    cta: '开始翻译 →',
  },
  reviews: {
    eyebrow: '旗舰 · 卖点痛点结构化',
    title: '贴评论出报告，看两眼就知道改哪里',
    body: '20 条 Amazon 评论 → 4 维度结构化：优势 / 痛点 / 改进点 / 差评挽回话术。选品、优化 listing、客服挽回一套打通。',
    kpi: '节省 60 分钟 / 次',
    cta: '分析评论 →',
  },
  outreach: {
    eyebrow: '旗舰 · 达人寄样批量启动',
    title: '3 版本冷启邮件，拉开回复率 10 倍',
    body: '给达人名 + 产品 + 合作方式，出安全版 / 热情版 / 数据版三封邮件。A/B 选一封发出去，回复率明显高于手写。',
    kpi: '节省 30 分钟 / 次',
    cta: '生成邮件 →',
  },
};

export default function Dashboard() {
  const enabledIds = new Set(clientConfig.enabledModules);
  const categories = modulesConfig.categories;
  const enabledCount = enabledIds.size;
  const priorityTiers = (modulesConfig as Record<string, unknown>).priorityTiers as Record<string, { modules: string[] }> | undefined;

  const getModuleTier = (moduleId: string): number => {
    if (!priorityTiers) return 0;
    if (priorityTiers.tier1?.modules.includes(moduleId)) return 1;
    if (priorityTiers.tier2?.modules.includes(moduleId)) return 2;
    if (priorityTiers.tier3?.modules.includes(moduleId)) return 3;
    return 0;
  };
  const demoProducts = (clientConfig as Record<string, unknown>).demoProducts as { name: string; category: string; price: string; features: string }[] | undefined;

  const [stats, setStats] = useState<UsageStats | null>(null);
  const [showAllModules, setShowAllModules] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState<Record<string, { total: number; goodRatio: number }>>({});
  const [healthWarning, setHealthWarning] = useState<{ overall: string; downServices: string[] } | null>(null);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.overall !== 'operational') {
          const downServices = (d.services || [])
            .filter((s: { status: string }) => s.status !== 'operational')
            .map((s: { name: string }) => s.name);
          setHealthWarning({ overall: d.overall, downServices });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/feedback?type=summary')
      .then(r => r.json())
      .then(d => { if (d.summary) setFeedbackSummary(d.summary); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const moduleNameMap: Record<string, string> = {};
  for (const m of modulesConfig.modules) {
    moduleNameMap[m.id] = m.name;
  }

  const maxTrend = stats ? Math.max(...stats.dailyTrend.map(d => d.count), 1) : 1;

  // ROI calculations
  const totalMinutesSaved = stats
    ? stats.ranking.reduce((sum, r) => {
        const roi = MODULE_ROI[r.moduleId];
        return sum + (roi ? roi.minutesSaved * r.count : 20 * r.count);
      }, 0)
    : 0;
  const totalHoursSaved = totalMinutesSaved / 60;
  const costSavedRMB = totalHoursSaved * HOURLY_COST_RMB;
  const aiCostRMB = stats ? (stats.weekTokens / 1000) * 0.002 * 7.2 : 0; // ~$0.002/1k tok, 7.2 CNY/USD
  const roiMultiple = aiCostRMB > 0 ? costSavedRMB / aiCostRMB : 0;

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-base font-semibold text-text-primary tracking-tight font-[family-name:var(--font-outfit)]">
              工作台
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {clientConfig.clientName} &middot; {clientConfig.industry}
            </p>
          </div>
          <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
            <a
              href="/tools"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-accent/40 bg-accent/5 hover:bg-accent/15 transition-colors"
              title="免费工具 · Hook 打分 / AIGC 合规 / 库存监控"
            >
              <span className="text-[12px]">🧰</span>
              <span className="text-[10px] lg:text-[11px] font-mono text-accent tabular-nums">免费工具</span>
              <span className="text-[8px] font-mono text-accent/60 px-1 py-0.5 rounded bg-accent/10">FREE</span>
            </a>
            <a
              href="/status"
              className="text-right hover:opacity-80 transition-opacity"
              title="系统状态"
            >
              <p className="label-mono mb-1 flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
                Live
              </p>
              <p className="text-[10px] lg:text-[11px] font-mono text-success tabular-nums">运行中</p>
            </a>
            <div className="text-right hidden sm:block">
              <p className="label-mono mb-1">在线员工</p>
              <p className="text-lg lg:text-xl font-semibold text-accent font-mono tabular-nums">{enabledCount}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="label-mono mb-1">商品库</p>
              <p className="text-lg lg:text-xl font-semibold text-text-primary font-mono tabular-nums">{demoProducts?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health 降级警告 · 仅非 operational 时显示 */}
      {healthWarning && (
        <div className={`mb-5 p-3 border rounded-md flex items-start gap-3 animate-fade-up ${
          healthWarning.overall === 'down'
            ? 'border-error/40 bg-error/10'
            : 'border-accent/40 bg-accent/10'
        }`}>
          <span className="text-[14px] flex-shrink-0">
            {healthWarning.overall === 'down' ? '🔴' : '🟡'}
          </span>
          <div className="flex-1 min-w-0">
            <div className={`text-[11px] font-semibold ${
              healthWarning.overall === 'down' ? 'text-error' : 'text-accent'
            }`}>
              {healthWarning.overall === 'down' ? '核心服务异常' : '部分服务降级'}
              {healthWarning.downServices.length > 0 && ` · ${healthWarning.downServices.slice(0, 2).join(' / ')}`}
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
              部分 Pipeline 可能不可用,稍后重试或看 /status 了解详情
            </div>
          </div>
          <a href="/status" className="text-[10px] font-mono text-accent hover:underline flex-shrink-0 mt-0.5">
            /status →
          </a>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-up stagger-1">
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4 hover:bg-bg-raised hover:border-border-default hover:shadow-[0_4px_16px_rgba(200,151,90,0.08)] transition-all duration-200 group">
          <p className="label-mono mb-2">今日处理</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-accent font-mono tabular-nums group-hover:scale-105 transition-transform origin-left">
              {stats?.todayCount ?? '—'}
            </p>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-text-tertiary/60 uppercase">calls</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border-subtle/40">
            <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent" />
            <span className="text-[9px] font-mono text-text-tertiary">
              本周 <span className="text-accent font-semibold">{stats?.weekCount ?? 0}</span>
            </span>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4 hover:bg-bg-raised hover:border-border-default hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-200 group">
          <p className="label-mono mb-2">累计调用</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary font-mono tabular-nums group-hover:scale-105 transition-transform origin-left">
              {stats?.totalCount ?? '—'}
            </p>
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-text-tertiary/60 uppercase">total</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border-subtle/40">
            <div className="flex-1 h-px bg-gradient-to-r from-text-tertiary/20 to-transparent" />
            <span className="text-[9px] font-mono text-text-tertiary">
              {stats ? (stats.weekTokens / 1000).toFixed(1) : '0'}k tok
            </span>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4 hover:bg-bg-raised hover:border-border-default hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-200 group">
          <p className="label-mono mb-2">质量评分</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary font-mono tabular-nums group-hover:scale-105 transition-transform origin-left">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}
            </p>
            <span className="text-[13px] text-text-tertiary/70 font-mono">/5.0</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border-subtle/40">
            <div className="flex-1 h-px bg-gradient-to-r from-success/20 to-transparent" />
            <span className="text-[9px] font-mono text-text-tertiary">
              {stats?.ratingCount ?? 0} 次评价
            </span>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4 hover:bg-bg-raised hover:border-border-default hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-200">
          <p className="label-mono mb-3">7日趋势</p>
          {stats?.dailyTrend ? (
            <div className="flex items-end gap-1 h-[52px]">
              {stats.dailyTrend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                  <div
                    className="w-full bg-accent/60 rounded-t-sm min-h-[3px] transition-all duration-200 hover:bg-accent cursor-pointer relative group-hover/bar:shadow-[0_-2px_8px_rgba(200,151,90,0.4)]"
                    style={{ height: `${Math.max((d.count / maxTrend) * 44, 3)}px` }}
                    title={`${d.date}: ${d.count} 次`}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-bg-raised border border-accent/30 rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
                      <span className="text-[8px] font-mono text-accent font-semibold">{d.count}</span>
                    </div>
                  </div>
                  <span className="text-[7px] font-mono text-text-tertiary/50 group-hover/bar:text-text-tertiary transition-colors">{d.date.slice(-2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[52px]">
              <p className="text-[10px] text-text-tertiary font-mono">—</p>
            </div>
          )}
        </div>
      </div>

      {/* ROI metrics */}
      {stats && stats.totalCount > 0 && (
        <div className="mb-6 animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="label-mono">投产效益（7日）</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
              <p className="label-mono mb-2">节省人时</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent font-mono tabular-nums">
                  {totalHoursSaved < 1 ? `${totalMinutesSaved}` : totalHoursSaved.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {totalHoursSaved < 1 ? 'min' : 'hrs'}
                </span>
              </div>
              <p className="text-[9px] font-mono text-text-tertiary mt-2 pt-2 border-t border-border-subtle/40">
                ≈ {(totalHoursSaved / 8).toFixed(1)} 人天
              </p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
              <p className="label-mono mb-2">节省人力成本</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-mono text-text-tertiary">¥</span>
                <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">
                  {costSavedRMB < 1000 ? costSavedRMB.toFixed(0) : `${(costSavedRMB / 1000).toFixed(1)}k`}
                </span>
              </div>
              <p className="text-[9px] font-mono text-text-tertiary mt-2 pt-2 border-t border-border-subtle/40">
                按 ¥{HOURLY_COST_RMB}/时计算
              </p>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
              <p className="label-mono mb-2">AI 消耗</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-mono text-text-tertiary">¥</span>
                <span className="text-2xl font-bold text-text-primary font-mono tabular-nums">
                  {aiCostRMB < 1 ? aiCostRMB.toFixed(2) : aiCostRMB.toFixed(1)}
                </span>
              </div>
              <p className="text-[9px] font-mono text-text-tertiary mt-2 pt-2 border-t border-border-subtle/40">
                {stats ? (stats.weekTokens / 1000).toFixed(1) : '0'}k tokens
              </p>
            </div>
            <div className="bg-bg-surface border border-accent/30 rounded-md p-4">
              <p className="label-mono mb-2">投产比 ROI</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent font-mono tabular-nums">
                  {roiMultiple > 0 ? `${roiMultiple.toFixed(0)}` : '∞'}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">x</span>
              </div>
              <p className="text-[9px] font-mono text-accent/70 mt-2 pt-2 border-t border-accent/20">
                每花 ¥1 AI成本节省 ¥{roiMultiple > 0 ? roiMultiple.toFixed(0) : '—'} 人力
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Module ranking */}
      {stats && stats.ranking.length > 0 && (
        <div className="mb-6 animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="label-mono">模块使用排名（7日）</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded-md p-3.5">
            <div className="space-y-2">
              {stats.ranking.slice(0, 5).map((r, i) => {
                const maxCount = stats.ranking[0].count;
                return (
                  <div key={r.moduleId} className="flex items-center gap-3 group">
                    <span className="text-[10px] font-mono text-text-tertiary w-3.5 text-right">{i + 1}</span>
                    <span className="text-[12px] text-text-secondary group-hover:text-text-primary w-[110px] truncate font-[family-name:var(--font-outfit)] transition-colors">
                      {moduleNameMap[r.moduleId] || r.moduleId}
                    </span>
                    <div className="flex-1 h-1 bg-bg-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/60 group-hover:bg-accent/80 rounded-full transition-all duration-300"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-text-tertiary w-7 text-right tabular-nums">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product inventory strip */}
      {demoProducts && demoProducts.length > 0 && (
        <div className="mb-6 animate-fade-up stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="label-mono">商品库</span>
            <div className="flex-1 h-px bg-gradient-to-r from-border-subtle to-transparent" />
            <div className="flex items-center gap-1.5 bg-bg-surface border border-border-subtle rounded-md px-2 py-1">
              <div className="w-1 h-1 rounded-full bg-success animate-pulse-dot" />
              <span className="text-[9px] font-mono text-text-primary font-semibold tabular-nums">{demoProducts.length}</span>
              <span className="text-[8px] font-mono text-text-tertiary uppercase">SKU</span>
            </div>
          </div>
          <div className="relative group/scroll">
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-root to-transparent pointer-events-none z-10 opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-root to-transparent pointer-events-none z-10 opacity-0 group-hover/scroll:opacity-100 transition-opacity" />

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {demoProducts.map((p, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 bg-bg-surface border border-border-subtle rounded-md px-4 py-3 min-w-[200px] hover:bg-bg-raised hover:border-accent/30 hover:shadow-[0_2px_12px_rgba(200,151,90,0.12)] transition-all duration-200 group cursor-pointer hover:translate-y-[-2px]"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-[13px] font-semibold text-text-primary truncate group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">{p.name}</span>
                    <div className="flex items-baseline gap-0.5 flex-shrink-0">
                      <span className="text-[11px] font-mono text-accent font-bold tabular-nums">{p.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-mono text-text-tertiary/90 uppercase tracking-[0.12em] bg-bg-raised px-1.5 py-0.5 rounded">{p.category}</span>
                    <div className="flex-1 h-px bg-border-subtle/30" />
                  </div>
                  <p className="text-[10px] text-text-secondary/90 leading-[1.6] line-clamp-2">{p.features}</p>
                  {/* Hover indicator */}
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border-subtle/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-px bg-accent" />
                    <span className="text-[8px] font-mono text-accent uppercase tracking-wider">view</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI 工厂杀器 Hero · MOAT_MAP 一句话叙事 */}
      <div className="mb-6 animate-fade-up stagger-3">
        <div className="relative border border-accent/40 bg-gradient-to-br from-bg-surface via-bg-raised to-bg-surface rounded-md p-6 lg:p-8 shadow-[0_16px_48px_rgba(200,151,90,0.10)] overflow-hidden hero-breathing"
          style={{ borderLeftWidth: '3px', borderLeftColor: '#c8975a' }}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase tracking-[0.15em] rounded">
              AI FACTORY · v2026.4
            </span>
            <span className="text-[10px] font-mono text-text-tertiary">跨境电商工厂级流水线</span>
            <div className="flex-1 h-px bg-border-subtle/60" />
            <a href="/MOAT_MAP" className="text-[10px] font-mono text-accent/80 hover:text-accent">查看 MOAT 文档 →</a>
          </div>

          <h2 className="text-[22px] lg:text-[30px] font-bold text-text-primary mb-3 leading-tight font-[family-name:var(--font-outfit)]">
            来一次,主图 · 模特图 · 详情页 · 短视频 · 客服话术 · 询盘对接 全套交付完
          </h2>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed mb-5 max-w-[820px]">
            不是单点工具,是 <span className="text-accent font-semibold">商家从空白 SKU 到上架的完整流水线</span>。
            8 个 photoshoot 模式 + 视频生成 + 爆款拆解 + 反向意图 + 19 个 toolbox,
            <span className="text-text-primary"> 在同一个工厂里串通,不用切平台</span>。
          </p>

          {/* 成本压缩 */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-error/30 bg-error/5 rounded text-[10px]">
              <span className="font-mono text-error">真人摄影 + 美工 + 文案</span>
              <span className="text-text-secondary tabular-nums">¥3-8K / SKU · 1-3 天</span>
            </span>
            <span className="text-text-tertiary text-[12px] self-center">→</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-success/40 bg-success/10 rounded text-[10px]">
              <span className="font-mono text-success">wenai</span>
              <span className="text-text-primary font-semibold tabular-nums">≈ ¥30-100 / SKU · 一晚</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 border border-accent/30 rounded text-[10px] font-mono text-accent">
              30-100× 压缩 · 见 <a href="/MOAT_MAP" className="underline">MOAT_MAP.md</a>
            </span>
          </div>

          {/* 工作流可视化 · 一条流水线 */}
          <div className="border border-border-subtle/60 bg-bg-root/40 rounded p-4 mb-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                完整商业闭环 · SKU 全生命周期 9 步
              </div>
              <div className="text-[9px] font-mono text-success/80 uppercase tracking-wider">
                ↺ 数据回流 → 回选品起新一轮
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {[
                { num: '1', name: '选品发现', href: '/pipelines/product-discovery', cn: 'AI 推 5-8 个候选' },
                { num: '2', name: '反向意图', href: '/pipelines/intent-mining', cn: '挖非显然客群' },
                { num: '3', name: '爆款拆解', href: '/pipelines/video-teardown', cn: 'TikTok 出分镜' },
                { num: '4', name: 'AI 影棚', href: '/pipelines/ai-photoshoot', cn: '8 模式生图' },
                { num: '5', name: 'AI 视频', href: '/pipelines/ai-video', cn: '一图变 5s 短片' },
                { num: '6', name: '测款 A-B', href: '/pipelines/ab-test', cn: '9 张测点击率' },
                { num: '7', name: '上新流水线', href: '/pipelines/new-listing', cn: '翻译/文案/合规' },
                { num: '8', name: '数据洞察', href: '/pipelines/data-insights', cn: '诊断 + 行动' },
                { num: '9', name: '客服转化', href: '/pipelines/customer-service', cn: '三版回复推单' },
                { num: '10', name: '询盘对接', href: '/inquire?from=hero', cn: '24h 内联系' },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center gap-1.5">
                  <a
                    href={step.href}
                    className="flex items-center gap-1.5 px-2 py-1 border border-border-subtle hover:border-accent/60 hover:bg-bg-surface rounded transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-mono text-accent tabular-nums">
                      {step.num}
                    </span>
                    <span className="text-text-primary font-semibold">{step.name}</span>
                    <span className="text-text-tertiary text-[10px] hidden lg:inline">{step.cn}</span>
                  </a>
                  {i < arr.length - 1 && <span className="text-accent/40 text-[10px]">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/pipelines/ai-photoshoot"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover transition-colors"
            >
              🎬 从 AI 影棚开始 →
            </a>
            <a
              href="/pipelines/video-teardown"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-accent/40 text-accent text-[11px] font-mono rounded-md hover:bg-accent/10"
            >
              🔬 拆爆款视频 (MOAT-01)
            </a>
            <a
              href="/inquire?from=hero"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border-default text-text-primary text-[11px] font-mono rounded-md hover:border-accent/40"
            >
              📨 ToB 询盘
            </a>
            <a
              href="/cases"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-text-tertiary text-[11px] font-mono hover:text-accent"
            >
              先看案例 →
            </a>
          </div>

          {/* 实时节省计数器 · 公开领先动作产品 */}
          <PublicSavingsCounter />
        </div>
      </div>

      {/* Pipelines 完整网格 · 新老 7 条横向并列 */}
      <div className="mb-6 animate-fade-up stagger-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="label-mono text-[10px] font-semibold text-accent">PIPELINES · 10 条流水线</span>
          <div className="flex-1 h-px bg-accent/20" />
          <span className="text-[9px] font-mono text-text-tertiary">每条都可独立跑,也可串成上面那条 9 步闭环</span>
        </div>

        {/* 决策层 · 选品 + 测款 + 数据洞察 (新增) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <a
            href="/pipelines/product-discovery"
            className="group block border border-cat-content/40 bg-bg-surface rounded-md p-4 hover:border-cat-content/70 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(110,168,215,0.15)] transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#6ea8d7' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-cat-content/15 text-cat-content text-[9px] font-mono uppercase rounded">决策</span>
              <span className="text-[9px] font-mono text-success">痛点 #1</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-cat-content transition-colors font-[family-name:var(--font-outfit)]">
              🎯 AI 选品发现
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              平台 + 类目 + 预算 → AI 推 5-8 个候选 SKU + 利润 + 风险
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">拍脑袋选</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">数据驱动</span>
            </div>
          </a>

          <a
            href="/pipelines/ab-test"
            className="group block border border-cat-content/40 bg-bg-surface rounded-md p-4 hover:border-cat-content/70 hover:-translate-y-0.5 transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#6ea8d7' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-cat-content/15 text-cat-content text-[9px] font-mono uppercase rounded">决策</span>
              <span className="text-[9px] font-mono text-success">痛点 #11</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-cat-content transition-colors font-[family-name:var(--font-outfit)]">
              ⚗️ 测款 A-B 实验室
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              一图变 9 张 (3 钩子 × 3 配色) + 杀/留硬指标 + 数据回流 SOP
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">看图直觉</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">3×3 矩阵</span>
            </div>
          </a>

          <a
            href="/pipelines/data-insights"
            className="group block border border-cat-content/40 bg-bg-surface rounded-md p-4 hover:border-cat-content/70 hover:-translate-y-0.5 transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#6ea8d7' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-cat-content/15 text-cat-content text-[9px] font-mono uppercase rounded">决策</span>
              <span className="text-[9px] font-mono text-success">痛点 #10</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-cat-content transition-colors font-[family-name:var(--font-outfit)]">
              📊 数据洞察
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              贴销售数据 → AI 诊断 4-8 条 P0/P1/P2 行动建议 + killList
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">下滑不知因</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">根因 + 动作</span>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* AI 影棚 · 旗舰新增 */}
          <a
            href="/pipelines/ai-photoshoot"
            className="group block border border-accent/40 bg-bg-surface rounded-md p-4 hover:border-accent/70 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(200,151,90,0.15)] transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#c8975a' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/15 text-accent text-[9px] font-mono uppercase rounded">★ HERO</span>
              <span className="text-[9px] font-mono text-success">8 模式</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              🎬 AI 影棚
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              模特生图 · 换装 · 换姿 · 换景 · OOTD · 平台调性 · 全套详情 · 爆款复刻
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">¥3-8K / 组棚</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">¥0.3-1.2 / 张</span>
            </div>
          </a>

          {/* 爆款视频拆解 · MOAT-01 */}
          <a
            href="/pipelines/video-teardown"
            className="group block border border-border-subtle bg-bg-surface rounded-md p-4 hover:border-accent/40 hover:-translate-y-0.5 transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#9b8ec4' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase rounded">MOAT-01</span>
              <span className="text-[9px] font-mono text-success">独占</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              🔬 爆款视频拆解
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              扔 TikTok 链接 → Gemini 拆出钩子/节奏/CTA + 每个镜头的图像 prompt
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">人工拆 2-3h</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">15-30s</span>
            </div>
          </a>

          {/* AI 视频 i2v */}
          <a
            href="/pipelines/ai-video"
            className="group block border border-border-subtle bg-bg-surface rounded-md p-4 hover:border-accent/40 hover:-translate-y-0.5 transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#5bb89a' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase rounded">NEW</span>
              <span className="text-[9px] font-mono text-success">wanx i2v</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              🎞️ AI 视频
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              一图变 5s 带货短片 · 模特动态展示 / 360° 旋转 / lifestyle / 自定义
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">真人拍 ¥500-3K</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">¥3-7 / 条</span>
            </div>
          </a>

          {/* 反向意图扩客 · MOAT-02 */}
          <a
            href="/pipelines/intent-mining"
            className="group block border border-border-subtle bg-bg-surface rounded-md p-4 hover:border-accent/40 hover:-translate-y-0.5 transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#6ea8d7' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase rounded">MOAT-02</span>
              <span className="text-[9px] font-mono text-success">DeepSeek</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              🔍 反向意图扩客
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              阿里万相同款方法论:美甲师 → 电子锁 · 5-8 个非显然高潜客群
            </p>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-text-tertiary">运营拍脑袋</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">数据驱动</span>
            </div>
          </a>
        </div>

        {/* 老 3 条 Pipeline 第二行 (新品上新 / 达人冷启 / 主图 wanx) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="/pipelines/new-listing"
            className="group block border border-border-subtle bg-bg-surface rounded-md p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(200,151,90,0.1)] transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#c8975a' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase rounded">
                PIPELINE · 01
              </span>
              <span className="text-[9px] font-mono text-success">LIVE · 旗舰</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              📋 新品上新流水线
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              贴 1 条 SKU,并行跑翻译 + 文案 + 合规检索 · 5 大品类 prompt 调教
            </p>
            <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono">
              <span className="text-text-tertiary">80min · ¥3500/SKU</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">45s · ¥0.02</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                进入流水线 →
              </span>
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/pipelines/new-listing?demo=1'; }}
                className="text-[9px] font-mono text-success border border-success/30 rounded px-1.5 py-0.5 hover:bg-success/10 cursor-pointer"
              >
                ⚡ demo
              </span>
            </div>
          </a>

          <a
            href="/pipelines/influencer-outbound"
            className="group block border border-border-subtle bg-bg-surface rounded-md p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(200,151,90,0.1)] transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#9b8ec4' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase rounded">
                PIPELINE · 02
              </span>
              <span className="text-[9px] font-mono text-success">NEW · 已上线</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              📮 达人批量冷启
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              贴达人名单 · 批量生成个性化邮件 · Excel 直接喂 Gmail Mail Merge
            </p>
            <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono">
              <span className="text-text-tertiary">200min/10人</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">3min/10人</span>
              <span className="text-accent/80 tabular-nums">· 回复率 4%→11%</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                进入流水线 →
              </span>
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/pipelines/influencer-outbound?demo=1'; }}
                className="text-[9px] font-mono text-success border border-success/30 rounded px-1.5 py-0.5 hover:bg-success/10 cursor-pointer"
              >
                ⚡ demo
              </span>
            </div>
          </a>

          <a
            href="/pipelines/product-image"
            className="group block border border-border-subtle bg-bg-surface rounded-md p-4 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(200,151,90,0.1)] transition-all"
            style={{ borderLeftWidth: '2px', borderLeftColor: '#e94560' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] font-mono uppercase rounded">
                PIPELINE · 03
              </span>
              <span className="text-[9px] font-mono text-success">LIVE · 通义万相</span>
            </div>
            <div className="text-[14px] font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
              🖼️ AI 电商主图生成
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              15 场景预设 · 1 SKU 出 5 图 · 中文 prompt 原生 · 商标词前置过滤
            </p>
            <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono">
              <span className="text-text-tertiary">¥3500/SKU 棚</span>
              <span className="text-text-tertiary/50">→</span>
              <span className="text-success font-semibold">¥0.7/SKU</span>
              <span className="text-accent/80 tabular-nums">· 5000× 压缩</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                进入流水线 →
              </span>
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/pipelines/product-image?demo=1'; }}
                className="text-[9px] font-mono text-success border border-success/30 rounded px-1.5 py-0.5 hover:bg-success/10 cursor-pointer"
              >
                ⚡ demo
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Beta activity feed · 社会证明 — 只在有真实数据时显示 */}
      {Object.keys(feedbackSummary).length > 0 && (
        <div className="mb-6 animate-fade-up stagger-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-1 rounded-full bg-success animate-pulse-dot" />
            <span className="label-mono">内测朋友评价</span>
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-[9px] font-mono text-text-tertiary">
              共 {Object.values(feedbackSummary).reduce((s, v) => s + v.total, 0)} 条
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {Object.entries(feedbackSummary)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 4)
              .map(([mid, data]) => {
                const mod = modulesConfig.modules.find(m => m.id === mid);
                if (!mod) return null;
                return (
                  <div key={mid} className="bg-bg-surface border border-border-subtle rounded-md p-3">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[12px] font-semibold text-text-primary truncate">{mod.name}</span>
                      <span className="text-[10px] font-mono text-text-tertiary tabular-nums">{data.total}</span>
                    </div>
                    <div className="h-1 bg-bg-raised rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-success/60 rounded-full"
                        style={{ width: `${data.goodRatio}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-text-tertiary">
                      {data.goodRatio}% 好评
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Toolbox 入口 */}
      {!showAllModules && (
        <div className="mb-7 animate-fade-up stagger-5">
          <button
            onClick={() => setShowAllModules(true)}
            className="w-full py-2.5 border border-dashed border-border-subtle rounded-md text-[11px] font-mono text-text-tertiary/70 hover:text-accent hover:border-accent/30 transition-all"
          >
            🧰 Toolbox · 单点工具 {enabledCount} 个（翻译/评论/外联/文案/直播/私域...） ↓
          </button>
        </div>
      )}

      {/* 展开后的全部模块 · 按 tier 分组 */}
      {showAllModules && categories.map((cat, catIndex) => {
        const catModules = modulesConfig.modules.filter(
          m => m.category === cat.id && enabledIds.has(m.id)
        );
        if (catModules.length === 0) return null;

        return (
          <div key={cat.id} className={`mb-7 animate-fade-up stagger-${catIndex + 4}`}>
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="label-mono flex-shrink-0">
                {cat.label}
              </span>
              <span className="text-[10px] font-mono text-text-tertiary/60 truncate">
                {cat.description}
              </span>
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-[9px] font-mono text-text-tertiary flex-shrink-0 tabular-nums">{catModules.length}</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
              {catModules.map(mod => (
                <ModuleCard
                  key={mod.id}
                  id={mod.id}
                  name={mod.name}
                  nameEn={mod.nameEn}
                  description={mod.description}
                  icon={mod.icon}
                  category={mod.category}
                  categoryColor={cat.color}
                  categoryLabel={cat.label}
                  tier={getModuleTier(mod.id)}
                  assistOnly={(mod as Record<string, unknown>).assistOnly === true}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-10 p-5 border border-border-subtle rounded-md bg-bg-surface">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 border border-accent/30 rounded-md flex items-center justify-center flex-shrink-0 text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-mono text-text-primary font-semibold mb-1">免费资源 · TikTok Shop 零成本直播间搭建指南</div>
            <div className="text-[11px] font-mono text-text-tertiary mb-2">手机直播 7 件套清单、三点布光法、开播前检查表,跨境卖家 0 到 1 起步文档。</div>
            <a
              href="/guides/tiktok-live-studio-setup.md"
              target="_blank"
              rel="noopener"
              className="inline-block text-[11px] font-mono text-accent hover:text-accent-hover underline-offset-2 hover:underline"
            >
              下载指南 →
            </a>
          </div>
        </div>
      </div>

      {/* 案例入口条 · 分享给老板的弹药 */}
      <div className="mt-6 mb-3 flex items-center justify-between py-3 px-4 border border-border-subtle rounded-md bg-bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-success/30 rounded-md flex items-center justify-center text-success text-[14px]">
            📊
          </div>
          <div>
            <div className="text-[12px] font-semibold text-text-primary">
              3 个真实案例 · 家居 / 汽摩 / 数码
            </div>
            <div className="text-[10px] font-mono text-text-tertiary">
              Before / After 对比 · 主管访谈 · 分享给老板看
            </div>
          </div>
        </div>
        <a href="/cases" className="text-[11px] font-mono text-accent hover:underline">
          看案例 →
        </a>
      </div>

      {/* 免费工具入口 strip · 跑前先用免费的, 高分再去付费 pipeline */}
      <div className="mt-6 mb-6 border border-accent/30 bg-gradient-to-r from-accent/5 via-accent/10 to-bg-surface rounded-md p-4 lg:p-5">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider">🧰 免费工具 · 跑前先用</div>
            <div className="text-[13px] font-semibold text-text-primary mt-0.5">
              0 LLM 调用 · 不烧 quota · 给你算账后再决定要不要花钱跑
            </div>
          </div>
          <a href="/tools" className="text-[11px] font-mono text-accent hover:underline">
            看全部 →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="/tools/hook-score" className="block border border-border-subtle bg-bg-surface/40 rounded p-3 hover:border-accent/40 hover:bg-bg-surface/70 transition-colors">
            <div className="text-[11px] font-semibold text-text-primary mb-1">🎯 Hook 跑前打分</div>
            <div className="text-[10px] font-mono text-text-tertiary leading-relaxed">
              粘文案 → 0-100 分 + 预估 CTR 区间 · 低分先重写, 别白烧主图费
            </div>
          </a>
          <a href="/tools/aigc-compliance" className="block border border-border-subtle bg-bg-surface/40 rounded p-3 hover:border-accent/40 hover:bg-bg-surface/70 transition-colors">
            <div className="text-[11px] font-semibold text-text-primary mb-1">🛡️ AIGC 合规速查</div>
            <div className="text-[10px] font-mono text-text-tertiary leading-relaxed">
              抖音 / TikTok / 视频号 / 小红书 / YT / IG · 披露规则 + 一键复制披露语
            </div>
          </a>
          <a href="/me/inventory" className="block border border-border-subtle bg-bg-surface/40 rounded p-3 hover:border-accent/40 hover:bg-bg-surface/70 transition-colors">
            <div className="text-[11px] font-semibold text-text-primary mb-1">📦 库存监控</div>
            <div className="text-[10px] font-mono text-text-tertiary leading-relaxed">
              ERP cron POST 库存数 → 断货 / 低位 自动推飞书 + 邮件 + alerts inbox
            </div>
          </a>
        </div>
      </div>

      {/* ROI 计算器 */}
      <ROICalculator />

      {/* Pricing 入口条 */}
      <div className="mt-6 flex items-center justify-between py-3 px-4 border border-border-subtle rounded-md bg-bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-accent/30 rounded-md flex items-center justify-center text-accent text-[14px]">
            💎
          </div>
          <div>
            <div className="text-[12px] font-semibold text-text-primary">
              内测免费 7 天 · 升级 Team ¥499/月 · Enterprise 面议
            </div>
            <div className="text-[10px] font-mono text-text-tertiary">
              锚点客户首选 Team · 千人规模定制联系作者
            </div>
          </div>
        </div>
        <a
          href="/pricing"
          className="text-[11px] font-mono text-accent hover:underline"
        >
          查看定价 →
        </a>
      </div>

      {/* Footer · 统一导航 */}
      <footer className="mt-10 pt-6 border-t border-border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-mono">
            <a href="/docs" className="text-text-secondary hover:text-accent">手册</a>
            <a href="/cases" className="text-text-secondary hover:text-accent">案例</a>
            <a href="/benchmark" className="text-accent hover:underline">行业基线</a>
            <a href="/pricing" className="text-text-secondary hover:text-accent">定价</a>
            <a href="/enterprise" className="text-text-secondary hover:text-accent">企业版</a>
            <a href="/status" className="text-text-secondary hover:text-accent">状态</a>
            <a href="/changelog" className="text-text-secondary hover:text-accent">更新日志</a>
            <a href="/roadmap" className="text-text-secondary hover:text-accent">路线图</a>
            <a href="/privacy" className="text-text-secondary hover:text-accent">隐私</a>
            <a href="/terms" className="text-text-secondary hover:text-accent">条款</a>
            <a href="/legal/dpa" className="text-text-secondary hover:text-accent">DPA</a>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-text-tertiary">
            <span className="w-1 h-1 rounded-full bg-success animate-pulse-dot" />
            wenai-one.vercel.app
          </div>
        </div>
        <p className="text-[9px] font-mono text-text-tertiary/60">
          © 2026 wenai · 跨境代运营流水线 OS · zachary.x.pku@gmail.com
        </p>
      </footer>

      <OnboardingTour />
    </div>
  );
}
