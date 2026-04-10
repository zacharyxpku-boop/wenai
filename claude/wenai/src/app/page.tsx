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
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight font-[family-name:var(--font-outfit)]">
              工作台
            </h1>
            <p className="text-[13px] text-text-secondary mt-1">
              {clientConfig.clientName} &middot; {clientConfig.industry}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] font-mono text-text-tertiary tracking-widest">在线员工</p>
              <p className="text-lg font-semibold text-accent font-mono">{enabledCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-text-tertiary tracking-widest">演示商品</p>
              <p className="text-lg font-semibold text-text-primary font-mono">{demoProducts?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8 animate-fade-up stagger-1">
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <p className="text-[10px] font-mono text-text-tertiary tracking-widest mb-1">今日处理</p>
          <p className="text-2xl font-semibold text-accent font-mono">{stats?.todayCount ?? '—'}</p>
          <p className="text-[10px] font-mono text-text-tertiary mt-1">
            本周 {stats?.weekCount ?? 0} 次
          </p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <p className="text-[10px] font-mono text-text-tertiary tracking-widest mb-1">累计调用</p>
          <p className="text-2xl font-semibold text-text-primary font-mono">{stats?.totalCount ?? '—'}</p>
          <p className="text-[10px] font-mono text-text-tertiary mt-1">
            周消耗 {stats ? (stats.weekTokens / 1000).toFixed(1) : '0'}k tokens
          </p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <p className="text-[10px] font-mono text-text-tertiary tracking-widest mb-1">质量均分</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-semibold text-text-primary font-mono">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}
            </p>
            {stats?.avgRating ? <span className="text-[11px] text-text-tertiary font-mono">/5</span> : null}
          </div>
          <p className="text-[10px] font-mono text-text-tertiary mt-1">
            {stats?.ratingCount ?? 0} 条评价
          </p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <p className="text-[10px] font-mono text-text-tertiary tracking-widest mb-2">7日趋势</p>
          {stats?.dailyTrend ? (
            <div className="flex items-end gap-[3px] h-[32px]">
              {stats.dailyTrend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-accent/60 rounded-sm min-h-[2px] transition-all"
                    style={{ height: `${Math.max((d.count / maxTrend) * 28, 2)}px` }}
                  />
                  <span className="text-[7px] font-mono text-text-tertiary">{d.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary font-mono">暂无数据</p>
          )}
        </div>
      </div>

      {/* Module ranking */}
      {stats && stats.ranking.length > 0 && (
        <div className="mb-8 animate-fade-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[11px] font-mono font-medium text-text-tertiary tracking-widest">
              模块使用排名（7日）
            </h2>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
            <div className="space-y-2">
              {stats.ranking.slice(0, 5).map((r, i) => {
                const maxCount = stats.ranking[0].count;
                return (
                  <div key={r.moduleId} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-text-tertiary w-4">{i + 1}</span>
                    <span className="text-[12px] text-text-primary w-[100px] truncate font-[family-name:var(--font-outfit)]">
                      {moduleNameMap[r.moduleId] || r.moduleId}
                    </span>
                    <div className="flex-1 h-1.5 bg-bg-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/70 rounded-full transition-all"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-text-tertiary w-8 text-right">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product inventory strip */}
      {demoProducts && demoProducts.length > 0 && (
        <div className="mb-8 animate-fade-up stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[11px] font-mono font-medium text-text-tertiary tracking-widest">
              商品库
            </h2>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {demoProducts.map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-bg-surface border border-border-subtle rounded-md px-4 py-3 min-w-[200px] hover:bg-bg-raised transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-[12px] font-medium text-text-primary truncate">{p.name}</span>
                  <span className="text-[11px] font-mono text-accent flex-shrink-0">{p.price}</span>
                </div>
                <p className="text-[10px] font-mono text-text-tertiary">{p.category}</p>
                <p className="text-[11px] text-text-secondary mt-1 line-clamp-1">{p.features}</p>
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
          <div key={cat.id} className={`mb-8 animate-fade-up stagger-${catIndex + 4}`}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <h2 className="text-[11px] font-mono font-medium text-text-tertiary uppercase tracking-widest">
                {cat.label}
              </h2>
              <span className="text-[10px] font-mono text-text-tertiary">
                {cat.description}
              </span>
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-[10px] font-mono text-text-tertiary">{catModules.length}</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
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
