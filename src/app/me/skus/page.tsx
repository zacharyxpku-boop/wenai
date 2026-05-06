'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Sku {
  id: string;
  orgId: string;
  name: string;
  category: string;
  platform?: string;
  priceCny?: string;
  status: 'idea' | 'discovery-done' | 'photoshoot-done' | 'abtest-done' | 'launched' | 'paused' | 'killed';
  notes?: string;
  performance?: {
    ctr?: number;            // 平均 CTR (百分比值, 例 3.2 = 3.2%)
    bestCtr?: number;        // 最佳变体 CTR
    cpc?: number;            // 最低 CPC (¥)
    convRate?: number;       // 转化率 (百分比值)
    roi?: number;
    winningVariant?: string; // 例 A1
    testedAt?: string;       // ISO
    variantsCount?: number;
    sales7d?: number;
  };
  addedAt: string;
  updatedAt: string;
  modules?: string[];
}

type SortBy = 'recent' | 'ctr-desc' | 'cpc-asc' | 'stale';

const STALE_THRESHOLD_DAYS = 30;

const STATUS_LABELS: Record<Sku['status'], { txt: string; cls: string }> = {
  idea: { txt: '💡 想法', cls: 'text-text-tertiary border-border-subtle' },
  'discovery-done': { txt: '🎯 已选品', cls: 'text-cat-content border-cat-content/40 bg-cat-content/5' },
  'photoshoot-done': { txt: '🎬 已出图', cls: 'text-accent border-accent/40 bg-accent/5' },
  'abtest-done': { txt: '⚗️ 已测款', cls: 'text-accent border-accent/40 bg-accent/5' },
  launched: { txt: '🚀 已上架', cls: 'text-success border-success/40 bg-success/5' },
  paused: { txt: '⏸ 暂停', cls: 'text-text-tertiary border-text-tertiary/40' },
  killed: { txt: '🛑 已 kill', cls: 'text-error border-error/40 bg-error/5' },
};

export default function MySkusPage() {
  const router = useRouter();
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<Sku['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [todayCny, setTodayCny] = useState<number | null>(null);
  const [savedCny, setSavedCny] = useState<number | null>(null);
  // 批量选择 · 多选 status 改 / 删除
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkOpProgress, setBulkOpProgress] = useState({ done: 0, total: 0 });
  // 列表内关键字搜索 (前端 filter, 已 load 全量) · '/' 键聚焦
  const [search, setSearch] = useState('');
  // 列表 j/k 浏览的激活索引 · 与 SKU 详情页同款 vim 流
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  // '/' 键聚焦搜索框 (与 ⌘K 错峰: ⌘K 跳走, / 原地搜)
  // 输入框聚焦时不抢, 让用户能输 '/' 字符本身
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      const el = document.getElementById('sku-search') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const [alertsCount, setAlertsCount] = useState<{ total: number; critical: number; warning: number } | null>(null);

  useEffect(() => {
    fetch('/api/user/cost-summary')
      .then(r => r.json())
      .then(d => setTodayCny(d.todayCny))
      .catch(() => {});
    fetch('/api/user/savings-summary?days=7')
      .then(r => r.json())
      .then(d => setSavedCny(d.grandTotalSavedCny ?? 0))
      .catch(() => {});
    fetch('/api/user/alerts')
      .then(r => r.json())
      .then(d => setAlertsCount({
        total: d.count ?? 0,
        critical: d.criticalCount ?? 0,
        warning: d.warningCount ?? 0,
      }))
      .catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    fetch('/api/user/sku-history?limit=200')
      .then(r => r.json())
      .then(d => {
        setSkus(d.skus || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (newName.trim().length < 2) {
      setError('名字太短');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/user/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory.trim() || '未分类',
          status: 'idea',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewName('');
      setNewCategory('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '添加失败');
    } finally {
      setAdding(false);
    }
  };

  // 批量导入 · 解 onboarding 痛点 (新商家不用一个个手填)
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, failed: 0 });

  // 智能切列: 优先 tab → 中文 / → 半角 , (如有引号字段, 简单跳过)
  const parseRow = (line: string): { name: string; category: string; platform?: string; priceCny?: string; notes?: string } | null => {
    const cleaned = line.trim();
    if (!cleaned) return null;
    let parts: string[];
    if (cleaned.includes('\t')) parts = cleaned.split('\t');
    else if (cleaned.includes('|')) parts = cleaned.split('|');
    else if (cleaned.match(/[，,]/)) parts = cleaned.split(/[，,]/);
    else parts = [cleaned];
    parts = parts.map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length === 0) return null;
    return {
      name: parts[0],
      category: parts[1] || '未分类',
      platform: parts[2] || undefined,
      priceCny: parts[3] || undefined,
      notes: parts[4] || undefined,
    };
  };

  const parsedRows = bulkText
    .split(/\r?\n/)
    .map(parseRow)
    .filter((x): x is NonNullable<typeof x> => x !== null && x.name.length >= 2);

  const handleBulkImport = async () => {
    if (parsedRows.length === 0) {
      setError('解析后 0 条有效行 · 检查格式 (每行至少 SKU 名)');
      return;
    }
    if (parsedRows.length > 500) {
      setError(`一次最多 500 条 (你贴了 ${parsedRows.length})`);
      return;
    }
    setBulkImporting(true);
    setError('');
    setBulkProgress({ done: 0, total: parsedRows.length, failed: 0 });

    let done = 0;
    let failed = 0;
    // 串行 (Redis 写避免淹), 每 5 条更新一次进度
    for (const row of parsedRows) {
      try {
        const res = await fetch('/api/user/sku-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...row, status: 'idea' }),
        });
        if (res.ok) done++;
        else failed++;
      } catch {
        failed++;
      }
      if ((done + failed) % 5 === 0 || (done + failed) === parsedRows.length) {
        setBulkProgress({ done, total: parsedRows.length, failed });
      }
    }
    setBulkProgress({ done, total: parsedRows.length, failed });
    setBulkImporting(false);
    setBulkText('');
    load();
  };

  const handleStatusChange = async (id: string, status: Sku['status']) => {
    await fetch(`/api/user/sku-history?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除这个 SKU?')) return;
    await fetch(`/api/user/sku-history?id=${id}`, { method: 'DELETE' });
    load();
  };

  // 批量选择切换
  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkChangeStatus = async (status: Sku['status']) => {
    if (selected.size === 0) return;
    if (!confirm(`确认把选中的 ${selected.size} 个 SKU 状态改成 "${status}"?`)) return;
    setBulkRunning(true);
    setBulkOpProgress({ done: 0, total: selected.size });
    let done = 0;
    for (const id of selected) {
      try {
        await fetch(`/api/user/sku-history?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } catch { /* skip */ }
      done++;
      if (done % 5 === 0 || done === selected.size) {
        setBulkOpProgress({ done, total: selected.size });
      }
    }
    setBulkRunning(false);
    setSelected(new Set());
    load();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`⚠️ 确认删除选中的 ${selected.size} 个 SKU? 此操作不可撤销!`)) return;
    setBulkRunning(true);
    setBulkOpProgress({ done: 0, total: selected.size });
    let done = 0;
    for (const id of selected) {
      try {
        await fetch(`/api/user/sku-history?id=${id}`, { method: 'DELETE' });
      } catch { /* skip */ }
      done++;
      if (done % 5 === 0 || done === selected.size) {
        setBulkOpProgress({ done, total: selected.size });
      }
    }
    setBulkRunning(false);
    setSelected(new Set());
    load();
  };

  // 关键字搜索 (name / category / platform / notes 任一含)
  const searchLower = search.trim().toLowerCase();
  const matchSearch = (s: Sku): boolean => {
    if (!searchLower) return true;
    return [s.name, s.category, s.platform, s.notes]
      .filter((x): x is string => typeof x === 'string')
      .some(t => t.toLowerCase().includes(searchLower));
  };

  const filtered = (filterStatus === 'all' ? skus : skus.filter(s => s.status === filterStatus))
    .filter(matchSearch)
    .slice() // copy before sort
    .sort((a, b) => {
      if (sortBy === 'ctr-desc') {
        const ac = a.performance?.bestCtr ?? a.performance?.ctr ?? -1;
        const bc = b.performance?.bestCtr ?? b.performance?.ctr ?? -1;
        return bc - ac;
      }
      if (sortBy === 'cpc-asc') {
        const ap = a.performance?.cpc ?? Number.POSITIVE_INFINITY;
        const bp = b.performance?.cpc ?? Number.POSITIVE_INFINITY;
        return ap - bp;
      }
      if (sortBy === 'stale') {
        // 上架且最久未更新优先 (复评提醒)
        const aLaunched = a.status === 'launched' ? 0 : 1;
        const bLaunched = b.status === 'launched' ? 0 : 1;
        if (aLaunched !== bLaunched) return aLaunched - bLaunched;
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // stale: 上架超 30 天没更新, 该复评了 (MOAT-09 retention 钩子)
  const staleCutoff = Date.now() - STALE_THRESHOLD_DAYS * 24 * 3600 * 1000;
  const staleCount = skus.filter(s =>
    s.status === 'launched' && new Date(s.updatedAt).getTime() < staleCutoff
  ).length;

  // 列表 j/k 浏览 vim 流 (与 SKU 详情页对齐)
  // - j 下一行 / k 上一行 (首次按落第 0 行)
  // - Enter 进详情
  // - x 切选 (与 checkbox 等价)
  // - Esc 清空 activeIdx 和 selected
  // - filter/search 变化时 activeIdx 自动夹紧到合法范围
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (filtered.length === 0) return;
      if (e.key === 'j') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i < 0 ? 0 : i + 1, filtered.length - 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i < 0 ? 0 : i - 1, 0));
      } else if (e.key === 'Enter' && activeIdx >= 0 && activeIdx < filtered.length) {
        e.preventDefault();
        router.push(`/me/skus/${filtered[activeIdx].id}`);
      } else if (e.key === 'x' && activeIdx >= 0 && activeIdx < filtered.length) {
        e.preventDefault();
        const id = filtered[activeIdx].id;
        setSelected(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else if (e.key === 'Escape') {
        setActiveIdx(-1);
        setSelected(new Set());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, activeIdx, router]);

  // activeIdx 变化 → 滚动到视图内 (居中)
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = document.getElementById(`sku-row-${activeIdx}`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIdx]);

  // filter / search 变了, 把 activeIdx 夹紧防越界
  useEffect(() => {
    if (activeIdx >= filtered.length) {
      setActiveIdx(filtered.length === 0 ? -1 : filtered.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);
  const counts = {
    all: skus.length,
    idea: skus.filter(s => s.status === 'idea').length,
    'discovery-done': skus.filter(s => s.status === 'discovery-done').length,
    'photoshoot-done': skus.filter(s => s.status === 'photoshoot-done').length,
    'abtest-done': skus.filter(s => s.status === 'abtest-done').length,
    launched: skus.filter(s => s.status === 'launched').length,
    paused: skus.filter(s => s.status === 'paused').length,
    killed: skus.filter(s => s.status === 'killed').length,
  };

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-6">
      <div className="mb-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em]">
            MY SKU LIBRARY · 我的 SKU 库
          </div>
          {todayCny !== null && (
            <span className="text-[10px] font-mono text-text-tertiary">
              今日累计花费 <span className="text-accent font-bold tabular-nums">¥{todayCny.toFixed(2)}</span>
            </span>
          )}
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
          你跑过的 SKU 都在这
        </h1>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          wenai 替你记住每个 SKU 的状态、跑过哪些模块、当前业绩。
          决策层模块(选品/测款/数据洞察)会基于这份历史给你更精准的建议。
        </p>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {savedCny !== null && savedCny > 0 && (
            <Link
              href="/me/savings"
              className="inline-flex items-center gap-2 border border-success/40 bg-success/5 hover:bg-success/10 rounded-md px-3 py-2 text-[12px] transition-colors"
            >
              <span className="text-success font-bold tabular-nums">
                💰 近 7 天 wenai 帮你省了 ¥{savedCny.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-mono text-success/80">看明细 →</span>
            </Link>
          )}
          <Link
            href="/me/settings"
            className="inline-flex items-center gap-2 border border-border-subtle hover:border-accent/40 rounded-md px-3 py-2 text-[12px] text-text-secondary hover:text-accent transition-colors"
          >
            <span>⚙️ 设置 · 邮件推送/行业</span>
          </Link>
          {alertsCount && alertsCount.total > 0 && (
            <Link
              href="/me/alerts"
              className={`inline-flex items-center gap-2 border rounded-md px-3 py-2 text-[12px] transition-colors ${
                alertsCount.critical > 0
                  ? 'border-error/40 bg-error/5 hover:bg-error/10 text-error'
                  : alertsCount.warning > 0
                  ? 'border-warning/40 bg-warning/5 hover:bg-warning/10 text-warning'
                  : 'border-cat-content/40 bg-cat-content/5 hover:bg-cat-content/10 text-cat-content'
              }`}
            >
              <span className="font-bold tabular-nums">
                🔔 {alertsCount.critical > 0 ? `🚨 ${alertsCount.critical} 紧急 · ` : ''}
                {alertsCount.warning > 0 ? `⚠️ ${alertsCount.warning} 警示 · ` : ''}
                共 {alertsCount.total} 条信号待看
              </span>
              <span className="text-[10px] font-mono opacity-80">→</span>
            </Link>
          )}
        </div>
      </div>

      {/* 关键字搜索 (按 / 聚焦) */}
      <div className="mb-2 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[12px] font-mono pointer-events-none">
          🔍
        </span>
        <input
          id="sku-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜 SKU 名 / 类目 / 平台 / 备注 … (按 / 聚焦)"
          className="w-full pl-9 pr-9 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-error text-[10px] font-mono px-1.5"
            title="清空搜索"
          >
            ✗
          </button>
        )}
      </div>

      {/* 状态过滤 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
            filterStatus === 'all'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border-subtle text-text-secondary hover:border-accent/40'
          }`}
        >
          全部 ({counts.all})
        </button>
        {(['idea', 'discovery-done', 'photoshoot-done', 'abtest-done', 'launched', 'paused', 'killed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
              filterStatus === s
                ? `border-accent text-accent bg-accent/10`
                : 'border-border-subtle text-text-secondary hover:border-accent/40'
            }`}
          >
            {STATUS_LABELS[s].txt} ({counts[s]})
          </button>
        ))}
      </div>

      {/* 排序 */}
      <div className="flex items-center gap-2 mb-4 text-[10px] font-mono flex-wrap">
        <span className="text-text-tertiary">排序:</span>
        {([
          { v: 'recent' as SortBy, txt: '最近更新' },
          { v: 'ctr-desc' as SortBy, txt: 'CTR 高 → 低' },
          { v: 'cpc-asc' as SortBy, txt: 'CPC 低 → 高' },
          { v: 'stale' as SortBy, txt: `🕰️ 该复评 (上架 ${STALE_THRESHOLD_DAYS}+ 天没更新)` },
        ]).map(o => (
          <button
            key={o.v}
            onClick={() => setSortBy(o.v)}
            className={`px-2 py-0.5 rounded border ${
              sortBy === o.v
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border-subtle text-text-secondary hover:border-accent/40'
            }`}
          >
            {o.txt}
          </button>
        ))}
      </div>

      {/* 复评提醒 banner · MOAT-09 retention 钩子 */}
      {staleCount > 0 && sortBy !== 'stale' && (
        <div className="mb-4 border border-warning/40 bg-warning/5 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[12px] text-text-primary flex items-center gap-2">
            <span>🕰️</span>
            <span>
              你有 <span className="font-bold text-warning">{staleCount}</span> 个 SKU 上架超过 {STALE_THRESHOLD_DAYS} 天没更新 ·
              <span className="text-text-tertiary text-[10px] font-mono ml-2">爆款生命周期会衰减, 跑数据洞察看下是否需要换图/改价</span>
            </span>
          </div>
          <button
            onClick={() => setSortBy('stale')}
            className="text-[10px] font-mono text-warning border border-warning/40 hover:bg-warning/10 rounded px-2 py-1"
          >
            看哪些 →
          </button>
        </div>
      )}

      {/* 新增 SKU */}
      <section className="mb-6 border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          ➕ 新增 SKU 到库
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="SKU 名 (例: 北欧厨房收纳挂钩)"
            className="flex-1 min-w-[200px] px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
          />
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="类目 (例: 家居-收纳)"
            className="flex-1 min-w-[150px] px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px]"
          />
          <button
            onClick={handleAdd}
            disabled={adding || newName.trim().length < 2}
            className="px-4 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded hover:bg-accent-hover disabled:opacity-40"
          >
            {adding ? '添加中...' : '添加'}
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => setBulkOpen(o => !o)}
              className="text-[10px] font-mono text-cat-content hover:underline"
            >
              {bulkOpen ? '▾ 收起批量导入' : '▸ 批量导入 (粘贴 CSV / Excel · 一次最多 500 条)'}
            </button>
            <button
              onClick={() => exportSkusCsv(skus)}
              disabled={skus.length === 0}
              className="text-[10px] font-mono text-text-secondary border border-border-subtle hover:border-accent/40 hover:text-accent rounded px-2 py-0.5 disabled:opacity-40"
              title="导出当前 SKU 库 CSV (含 perf 数据), 供 ERP / 对账"
            >
              ⬇ 导出 SKU CSV ({skus.length})
            </button>
          </div>
          {bulkOpen && (
            <div className="mt-3 space-y-2">
              <div className="text-[10px] font-mono text-text-tertiary leading-relaxed">
                每行一个 SKU, 列顺序: <code className="text-accent">名 [, 类目 [, 平台 [, 价格 [, 备注]]]]</code>
                <br />
                支持分隔符: tab(从 Excel 直接 Ctrl+C) / 中文逗号 / 半角逗号 / 竖线
              </div>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={'连衣裙, 女装春季, 天猫, ¥199, 法式茶歇风\nT 恤, 女装基础款, 抖音, ¥69-99\n...'}
                rows={8}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[11px] font-mono leading-relaxed resize-none"
                disabled={bulkImporting}
              />
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-[10px] font-mono text-text-tertiary tabular-nums">
                  解析: <span className="text-accent">{parsedRows.length}</span> 条有效
                  {bulkImporting && (
                    <span className="ml-3">
                      进度 {bulkProgress.done + bulkProgress.failed}/{bulkProgress.total}
                      {bulkProgress.failed > 0 && <span className="text-error"> · 失败 {bulkProgress.failed}</span>}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {parsedRows.length > 0 && !bulkImporting && (
                    <span className="text-[10px] font-mono text-text-tertiary">
                      预览前 3: {parsedRows.slice(0, 3).map(r => r.name).join(' · ')}
                      {parsedRows.length > 3 && ` ...`}
                    </span>
                  )}
                  <button
                    onClick={handleBulkImport}
                    disabled={bulkImporting || parsedRows.length === 0}
                    className="text-[11px] font-mono px-3 py-1.5 bg-cat-content text-bg-root rounded hover:opacity-90 disabled:opacity-40"
                  >
                    {bulkImporting ? `导入中 ${bulkProgress.done}/${bulkProgress.total}` : `📥 导入 ${parsedRows.length} 条`}
                  </button>
                </div>
              </div>
              {bulkImporting && bulkProgress.total > 0 && (
                <div className="h-1 bg-bg-surface rounded overflow-hidden">
                  <div
                    className="h-full bg-cat-content transition-all"
                    style={{ width: `${((bulkProgress.done + bulkProgress.failed) / bulkProgress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="mb-3 p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
          ✗ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-text-tertiary font-mono text-[12px]">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-border-subtle rounded-md">
          <p className="text-text-tertiary text-[13px] mb-2">还没有 SKU</p>
          <p className="text-[10px] font-mono text-text-tertiary">
            上方手动添加 · 或在选品/测款模块跑完后会自动入库 (P2 待做)
          </p>
        </div>
      ) : (
        <>
        {/* 全选 / 反选 / 浮动批量操作条 */}
        <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-text-tertiary flex-wrap">
          <button
            onClick={() => {
              if (selected.size === filtered.length) setSelected(new Set());
              else setSelected(new Set(filtered.map(s => s.id)));
            }}
            className="px-2 py-0.5 border border-border-subtle hover:border-accent/40 hover:text-accent rounded"
          >
            {selected.size === filtered.length ? '取消全选' : `全选当前过滤 (${filtered.length})`}
          </button>
          {selected.size > 0 && (
            <span className="text-accent">已选 {selected.size}</span>
          )}
        </div>
        {selected.size > 0 && (
          <div className="sticky top-3 z-30 mb-3 border border-accent/50 bg-bg-surface rounded-lg p-3 shadow-[0_4px_16px_rgba(0,0,0,0.2)] flex items-center justify-between flex-wrap gap-2">
            <div className="text-[12px] font-mono text-text-primary">
              <span className="text-accent font-bold">{selected.size}</span> 个 SKU 已选 ·
              {bulkRunning && (
                <span className="text-warning ml-2">处理中 {bulkOpProgress.done}/{bulkOpProgress.total}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-mono text-text-tertiary">改状态:</span>
              {(['paused', 'launched', 'killed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => bulkChangeStatus(s)}
                  disabled={bulkRunning}
                  className={`text-[10px] font-mono px-2 py-1 border rounded ${STATUS_LABELS[s].cls} hover:bg-bg-surface disabled:opacity-40`}
                >
                  {STATUS_LABELS[s].txt}
                </button>
              ))}
              <span className="w-px h-4 bg-border-default mx-1" />
              <button
                onClick={bulkDelete}
                disabled={bulkRunning}
                className="text-[10px] font-mono px-2 py-1 border border-error/40 text-error hover:bg-error/10 rounded disabled:opacity-40"
              >
                🗑️ 批量删
              </button>
              <button
                onClick={() => setSelected(new Set())}
                disabled={bulkRunning}
                className="text-[10px] font-mono text-text-tertiary hover:text-text-primary px-1"
              >
                ✗ 清除选择
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {filtered.map((sku, i) => {
            const lab = STATUS_LABELS[sku.status];
            const isSelected = selected.has(sku.id);
            const isActive = i === activeIdx;
            return (
              <div
                key={sku.id}
                id={`sku-row-${i}`}
                className={`border rounded-lg p-3 bg-bg-surface/30 transition-colors hover:border-accent/30 ${lab.cls} ${isSelected ? 'ring-1 ring-accent/60' : ''} ${isActive ? 'ring-2 ring-accent shadow-[0_0_0_2px_rgba(200,151,90,0.2)]' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0 flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(sku.id)}
                      className="mt-1 w-3.5 h-3.5 cursor-pointer"
                      title="选中后顶部出现批量操作条"
                      aria-label={`选择 ${sku.name}`}
                    />
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link href={`/me/skus/${sku.id}`} className="text-[14px] font-bold text-text-primary hover:text-accent transition-colors">
                        {sku.name}
                      </Link>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${lab.cls}`}>
                        {lab.txt}
                      </span>
                      <span className="text-[10px] font-mono text-text-tertiary">{sku.category}</span>
                      {sku.platform && (
                        <span className="text-[10px] font-mono text-text-tertiary">· {sku.platform}</span>
                      )}
                      {sku.priceCny && (
                        <span className="text-[10px] font-mono text-accent">· {sku.priceCny}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-text-tertiary flex-wrap">
                      <span>添加 {new Date(sku.addedAt).toLocaleDateString('zh-CN')}</span>
                      {sku.status === 'launched' && new Date(sku.updatedAt).getTime() < staleCutoff && (
                        <span className="text-warning border border-warning/40 rounded px-1">
                          🕰️ {Math.floor((Date.now() - new Date(sku.updatedAt).getTime()) / 86400000)} 天没动 · 该复评
                        </span>
                      )}
                      {sku.modules && sku.modules.length > 0 && (
                        <span>跑过 {sku.modules.length} 个模块</span>
                      )}
                      {sku.performance?.bestCtr !== undefined ? (
                        <span className="text-accent">
                          CTR {sku.performance.bestCtr.toFixed(1)}%
                          {sku.performance.winningVariant && (
                            <span className="text-text-tertiary"> ({sku.performance.winningVariant})</span>
                          )}
                        </span>
                      ) : sku.performance?.ctr !== undefined ? (
                        <span className="text-accent">CTR {sku.performance.ctr.toFixed(1)}%</span>
                      ) : null}
                      {sku.performance?.cpc !== undefined && (
                        <span className="text-success">CPC ¥{sku.performance.cpc.toFixed(2)}</span>
                      )}
                      {sku.performance?.convRate !== undefined && (
                        <span className="text-cat-content">转化 {sku.performance.convRate.toFixed(1)}%</span>
                      )}
                      {sku.performance?.roi !== undefined && (
                        <span className="text-success">ROI {sku.performance.roi.toFixed(1)}</span>
                      )}
                    </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <select
                      value={sku.status}
                      onChange={e => handleStatusChange(sku.id, e.target.value as Sku['status'])}
                      className="text-[10px] font-mono px-2 py-1 bg-bg-surface border border-border-default rounded"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.txt}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(sku.id)}
                      className="text-[10px] font-mono text-text-tertiary hover:text-error border border-border-subtle hover:border-error/40 rounded px-2 py-1"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      <div className="mt-10 pt-6 border-t border-border-subtle">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          配套工作流
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/product-discovery" className="px-3 py-1.5 border border-cat-content/30 rounded text-[11px] font-mono text-cat-content hover:bg-cat-content/10">
            🎯 选品发现
          </Link>
          <Link href="/pipelines/ab-test" className="px-3 py-1.5 border border-cat-content/30 rounded text-[11px] font-mono text-cat-content hover:bg-cat-content/10">
            ⚗️ 测款 A-B
          </Link>
          <Link href="/pipelines/data-insights" className="px-3 py-1.5 border border-cat-content/30 rounded text-[11px] font-mono text-cat-content hover:bg-cat-content/10">
            📊 数据洞察
          </Link>
          <Link href="/modules/standard-pack" className="px-3 py-1.5 border border-cat-content/30 rounded text-[11px] font-mono text-cat-content hover:bg-cat-content/10">
            📦 SOP 标品
          </Link>
          <Link href="/pipelines/batch-launch" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            🏭 批量上架
          </Link>
        </div>
      </div>
    </div>
  );
}

function exportSkusCsv(skus: Sku[]) {
  if (skus.length === 0) return;
  const header = [
    'id', 'name', 'category', 'platform', 'priceCny', 'status',
    'addedAt', 'updatedAt', 'modules',
    'bestCtr', 'avgCtr', 'cpc', 'convRate', 'winningVariant', 'testedAt', 'variantsCount',
    'notes',
  ];
  const rows = skus.map(s => [
    s.id, s.name, s.category, s.platform || '', s.priceCny || '', s.status,
    s.addedAt, s.updatedAt, (s.modules || []).join('|'),
    s.performance?.bestCtr ?? '',
    s.performance?.ctr ?? '',
    s.performance?.cpc ?? '',
    s.performance?.convRate ?? '',
    s.performance?.winningVariant || '',
    s.performance?.testedAt || '',
    s.performance?.variantsCount ?? '',
    (s.notes || '').replace(/\n/g, ' '),
  ]);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = [header, ...rows].map(r => r.map(escape).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const today = new Date();
  a.download = `wenai-skus-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
