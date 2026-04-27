'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 全局命令面板 · ⌘K / Ctrl+K 唤起
 *
 * 三类候选:
 *   1. SKU 名 → 跳 /me/skus/[id]
 *   2. 模块 → 跳 /pipelines/X
 *   3. /me 子页 → 跳 /me/...
 *
 * 实现要点:
 *   - keydown 捕获 cmd/ctrl+k 阻止默认浏览器搜索
 *   - 打开时从 sku-history 拉一次 (不阻塞 keypress 响应)
 *   - 模糊匹配 (lowercase 包含)
 *   - 上下键浏览, Enter 跳, Esc 关闭
 *   - 全屏 backdrop click 关闭
 */

interface SkuLite {
  id: string;
  name: string;
  category?: string;
  status?: string;
}

interface Item {
  id: string;
  type: 'sku' | 'pipeline' | 'me';
  label: string;
  hint?: string;
  href: string;
}

const PIPELINES: Item[] = [
  { id: 'p-discovery', type: 'pipeline', label: '🎯 选品发现', hint: 'AI 推 5-8 候选 SKU', href: '/pipelines/product-discovery' },
  { id: 'p-photoshoot', type: 'pipeline', label: '🎬 AI 影棚', hint: '8 模式生图', href: '/pipelines/ai-photoshoot' },
  { id: 'p-video', type: 'pipeline', label: '🎞️ AI 视频', hint: '一图变 5s 短片', href: '/pipelines/ai-video' },
  { id: 'p-teardown', type: 'pipeline', label: '🔬 爆款拆解', hint: 'TikTok 出分镜', href: '/pipelines/video-teardown' },
  { id: 'p-abtest', type: 'pipeline', label: '⚗️ 测款 A-B', hint: '9 张测点击率', href: '/pipelines/ab-test' },
  { id: 'p-data', type: 'pipeline', label: '📊 数据洞察', hint: '诊断 + 行动', href: '/pipelines/data-insights' },
  { id: 'p-customer', type: 'pipeline', label: '🤝 销售转化客服', hint: '三版回复推单', href: '/pipelines/customer-service' },
  { id: 'p-batch', type: 'pipeline', label: '🏭 批量上架', hint: '50 SKU 一键', href: '/pipelines/batch-launch' },
  { id: 'p-intent', type: 'pipeline', label: '🔍 反向意图', hint: '挖非显然客群', href: '/pipelines/intent-mining' },
  { id: 'p-listing', type: 'pipeline', label: '📋 上新流水线', hint: '翻译/文案/合规', href: '/pipelines/new-listing' },
];

const ME_PAGES: Item[] = [
  { id: 'me-dash', type: 'me', label: '🏠 总览', hint: '/me dashboard', href: '/me' },
  { id: 'me-skus', type: 'me', label: '📦 SKU 库', hint: '管理 SKU + 批量', href: '/me/skus' },
  { id: 'me-alerts', type: 'me', label: '🔔 信号', hint: '盲点 + 复评提醒', href: '/me/alerts' },
  { id: 'me-savings', type: 'me', label: '💰 省钱', hint: '战利品 + CSV 导出', href: '/me/savings' },
  { id: 'me-settings', type: 'me', label: '⚙️ 设置', hint: '邮件 push + 行业', href: '/me/settings' },
  { id: 'me-bench', type: 'me', label: '📊 行业基线', hint: '公开 benchmark', href: '/benchmark' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [skus, setSkus] = useState<SkuLite[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isMeta) {
        e.preventDefault();
        setOpen(prev => !prev);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // 打开时拉 SKU + 聚焦
  useEffect(() => {
    if (!open) return;
    setQ('');
    setActiveIdx(0);
    setTimeout(() => inputRef.current?.focus(), 30);
    if (skus.length === 0) {
      fetch('/api/user/sku-history?limit=200')
        .then(r => r.json())
        .then(d => setSkus(d.skus || []))
        .catch(() => {});
    }
  }, [open, skus.length]);

  const items = useMemo<Item[]>(() => {
    const skuItems: Item[] = skus.map(s => ({
      id: `sku-${s.id}`,
      type: 'sku',
      label: `📦 ${s.name}`,
      hint: [s.category, s.status].filter(Boolean).join(' · '),
      href: `/me/skus/${s.id}`,
    }));
    return [...skuItems, ...PIPELINES, ...ME_PAGES];
  }, [skus]);

  const filtered = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return items.slice(0, 30);
    return items.filter(it =>
      it.label.toLowerCase().includes(trimmed) ||
      (it.hint || '').toLowerCase().includes(trimmed)
    ).slice(0, 30);
  }, [items, q]);

  const go = (it: Item) => {
    setOpen(false);
    router.push(it.href);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = filtered[activeIdx];
      if (it) go(it);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[640px] mx-4 bg-bg-surface border border-accent/40 rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 border-b border-border-subtle">
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={e => { setQ(e.target.value); setActiveIdx(0); }}
            onKeyDown={onKey}
            placeholder="搜 SKU / 跳模块 / 进 /me 子页 ..."
            className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary outline-none font-mono"
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[12px] font-mono text-text-tertiary">
              没匹配 · 试试 SKU 名 / 模块名 / "省钱" / "信号"
            </div>
          ) : (
            filtered.map((it, i) => (
              <button
                key={it.id}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => go(it)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 ${
                  i === activeIdx ? 'bg-accent/10' : 'hover:bg-bg-root/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text-primary font-medium truncate">{it.label}</div>
                  {it.hint && (
                    <div className="text-[10px] font-mono text-text-tertiary truncate mt-0.5">{it.hint}</div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">
                  {it.type}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border-subtle text-[10px] font-mono text-text-tertiary flex items-center justify-between">
          <span>↑↓ 选 · Enter 跳 · Esc 关</span>
          <span>{filtered.length} / {items.length} 项</span>
        </div>
      </div>
    </div>
  );
}
