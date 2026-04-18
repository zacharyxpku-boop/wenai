'use client';

import { useState, useEffect } from 'react';
import ModuleCard from '@/components/ModuleCard';
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

const QUICK_START_CARDS = [
  {
    id: 'translate',
    title: '批量翻译 listing',
    hook: '粘贴 10 条商品信息，一次出 5 语言',
    demo: '家居收纳 → 英/日/韩/西/德',
    time: '≈ 30 秒',
    accent: '#c8975a',
  },
  {
    id: 'reviews',
    title: '差评挖痛点',
    hook: '贴评论，出结构化卖点/痛点报告',
    demo: '20 条 Amazon 评论 → 4 维度分析',
    time: '≈ 45 秒',
    accent: '#6ea8d7',
  },
  {
    id: 'outreach',
    title: '达人外联邮件',
    hook: '给达人名 + 产品，出 3 版本冷启邮件',
    demo: '英文 / 西语 / 葡语多版本',
    time: '≈ 20 秒',
    accent: '#9b8ec4',
  },
];

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
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="label-mono mb-1">在线员工</p>
              <p className="text-xl font-semibold text-accent font-mono tabular-nums">{enabledCount}</p>
            </div>
            <div className="text-right">
              <p className="label-mono mb-1">商品库</p>
              <p className="text-xl font-semibold text-text-primary font-mono tabular-nums">{demoProducts?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Quick Start · 3 cards for first-touch beta users */}
      <div className="mb-7 animate-fade-up stagger-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
          <span className="label-mono flex-shrink-0">30 秒上手</span>
          <span className="text-[10px] font-mono text-text-tertiary/60 truncate">
            第一次用？先从这三件事开始
          </span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_START_CARDS.map(card => (
            <a
              key={card.id}
              href={`/modules/${card.id}`}
              className="group bg-bg-surface border border-border-subtle rounded-md p-5 hover:border-accent/40 hover:bg-bg-raised hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,151,90,0.1)] transition-all duration-200"
              style={{ borderLeftColor: card.accent, borderLeftWidth: '2px' }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors font-[family-name:var(--font-outfit)]">
                  {card.title}
                </span>
                <span className="text-[9px] font-mono text-text-tertiary uppercase tabular-nums">
                  {card.time}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-2.5">
                {card.hook}
              </p>
              <div className="pt-2.5 border-t border-border-subtle/50 flex items-center justify-between">
                <span className="text-[9px] font-mono text-text-tertiary">
                  例：{card.demo}
                </span>
                <span className="text-[10px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  开始 →
                </span>
              </div>
            </a>
          ))}
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

      {/* Toggle to reveal all 19 modules */}
      {!showAllModules && (
        <div className="mb-7 animate-fade-up stagger-4">
          <button
            onClick={() => setShowAllModules(true)}
            className="w-full py-3 border border-dashed border-border-default rounded-md text-[12px] font-mono text-text-tertiary hover:text-accent hover:border-accent/40 hover:bg-bg-surface transition-all"
          >
            展开全部 {enabledCount} 个模块 · 执行/内容/情报/服务 ↓
          </button>
        </div>
      )}

      {/* Module grid by category */}
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
    </div>
  );
}
