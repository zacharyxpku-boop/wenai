'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Sku {
  id: string;
  orgId: string;
  name: string;
  category: string;
  platform?: string;
  priceCny?: string;
  status: 'idea' | 'discovery-done' | 'photoshoot-done' | 'abtest-done' | 'launched' | 'paused' | 'killed';
  notes?: string;
  performance?: { ctr?: number; convRate?: number; roi?: number };
  addedAt: string;
  updatedAt: string;
  modules?: string[];
}

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
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<Sku['status'] | 'all'>('all');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');

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

  const filtered = filterStatus === 'all' ? skus : skus.filter(s => s.status === filterStatus);
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
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em] mb-1">
          MY SKU LIBRARY · 我的 SKU 库
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
          你跑过的 SKU 都在这
        </h1>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          wenai 替你记住每个 SKU 的状态、跑过哪些模块、当前业绩。
          决策层模块(选品/测款/数据洞察)会基于这份历史给你更精准的建议。
        </p>
      </div>

      {/* 状态过滤 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
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
        <div className="space-y-2">
          {filtered.map(sku => {
            const lab = STATUS_LABELS[sku.status];
            return (
              <div
                key={sku.id}
                className={`border rounded-lg p-3 bg-bg-surface/30 transition-colors hover:border-accent/30 ${lab.cls}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[14px] font-bold text-text-primary">{sku.name}</h3>
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
                      {sku.modules && sku.modules.length > 0 && (
                        <span>跑过 {sku.modules.length} 个模块</span>
                      )}
                      {sku.performance?.ctr !== undefined && (
                        <span className="text-accent">CTR {(sku.performance.ctr * 100).toFixed(1)}%</span>
                      )}
                      {sku.performance?.roi !== undefined && (
                        <span className="text-success">ROI {sku.performance.roi.toFixed(1)}</span>
                      )}
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
          <Link href="/pipelines/batch-launch" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            🏭 批量上架
          </Link>
        </div>
      </div>
    </div>
  );
}
