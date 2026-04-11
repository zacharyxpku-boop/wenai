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

export default function Dashboard() {
  const enabledIds = new Set(clientConfig.enabledModules);
  const categories = modulesConfig.categories;
  const enabledCount = enabledIds.size;
  const demoProducts = (clientConfig as Record<string, unknown>).demoProducts as { name: string; category: string; price: string; features: string }[] | undefined;

  const [stats, setStats] = useState<UsageStats | null>(null);

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
        <div className="bg-bg-surface border border-border-subtle rounded-md p-3.5 hover:bg-bg-raised transition-colors">
          <p className="label-mono mb-1.5">今日处理</p>
          <p className="text-2xl font-semibold text-accent font-mono tabular-nums">{stats?.todayCount ?? '—'}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-[9px] font-mono text-text-tertiary">
              本周 {stats?.weekCount ?? 0}
            </span>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-3.5 hover:bg-bg-raised transition-colors">
          <p className="label-mono mb-1.5">累计调用</p>
          <p className="text-2xl font-semibold text-text-primary font-mono tabular-nums">{stats?.totalCount ?? '—'}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-[9px] font-mono text-text-tertiary">
              {stats ? (stats.weekTokens / 1000).toFixed(1) : '0'}k tok
            </span>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-3.5 hover:bg-bg-raised transition-colors">
          <p className="label-mono mb-1.5">质量评分</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-semibold text-text-primary font-mono tabular-nums">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}
            </p>
            {stats?.avgRating && <span className="text-[11px] text-text-tertiary font-mono">/5</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-[9px] font-mono text-text-tertiary">
              {stats?.ratingCount ?? 0} 条
            </span>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-3.5 hover:bg-bg-raised transition-colors">
          <p className="label-mono mb-2">7日趋势</p>
          {stats?.dailyTrend ? (
            <div className="flex items-end gap-[2px] h-[36px]">
              {stats.dailyTrend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent/70 rounded-[2px] min-h-[2px] transition-all hover:bg-accent"
                    style={{ height: `${Math.max((d.count / maxTrend) * 30, 2)}px` }}
                    title={`${d.date}: ${d.count}`}
                  />
                  <span className="text-[7px] font-mono text-text-tertiary/60">{d.date.slice(-2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[36px]">
              <p className="text-[10px] text-text-tertiary font-mono">—</p>
            </div>
          )}
        </div>
      </div>

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
          <div className="flex items-center gap-2 mb-2.5">
            <span className="label-mono">商品库</span>
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-[9px] font-mono text-text-tertiary">{demoProducts.length} SKU</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-0.5">
            {demoProducts.map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-bg-surface border border-border-subtle rounded-md px-3.5 py-2.5 min-w-[190px] hover:bg-bg-raised hover:border-border-default transition-all group"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="text-[12px] font-medium text-text-primary truncate group-hover:text-accent transition-colors">{p.name}</span>
                  <span className="text-[10px] font-mono text-accent flex-shrink-0 tabular-nums">{p.price}</span>
                </div>
                <p className="text-[9px] font-mono text-text-tertiary uppercase tracking-wide mb-1">{p.category}</p>
                <p className="text-[11px] text-text-secondary/80 leading-snug line-clamp-1">{p.features}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module grid by category */}
      {categories.map((cat, catIndex) => {
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
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
