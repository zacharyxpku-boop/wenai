'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 全局命令面板 · ⌘K / Ctrl+K 唤起
 *
 * 三类候选:
 *   1. 核心工作台入口
 *   2. 报告与定价入口
 *   3. 管理员可见的 SKU 入口
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
  type: 'sku' | 'core' | 'settings';
  label: string;
  hint?: string;
  href: string;
}

const CORE_ACTIONS: Item[] = [
  { id: 'dashboard', type: 'core', label: '实验项目', hint: '创建项目或从行业模板开始', href: '/dashboard' },
  { id: 'factory', type: 'core', label: '导入 CSV', hint: '上传 TikTok、Amazon、Shopify、Meta 或 Google 数据', href: '/factory' },
  { id: 'report', type: 'core', label: '报告模板', hint: '查看脱敏报告和复制模板链路', href: '/poc/report' },
  { id: 'pricing', type: 'core', label: '定价', hint: '查看 Free、Starter、Growth 权益', href: '/pricing' },
  { id: 'kuaizi', type: 'settings', label: '生产工具设置', hint: '配置外部生产工具后推送 Brief', href: '/settings/kuaizi' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [skus, setSkus] = useState<SkuLite[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPalette = () => {
    setQ('');
    setActiveIdx(0);
    setOpen(true);
  };

  // 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isMeta) {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          openPalette();
        }
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
    return [...CORE_ACTIONS, ...skuItems];
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
            placeholder="搜索核心动作：导入 CSV / 报告 / 定价 / 生产工具设置"
            className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary outline-none font-mono"
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[12px] font-mono text-text-tertiary">
              没有匹配项 · 试试“导入”“报告”“定价”或“生产工具”
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
          <span>↑↓ 选择 · Enter 打开 · Esc 关闭</span>
          <span>{filtered.length} / {items.length} 项</span>
        </div>
      </div>
    </div>
  );
}
