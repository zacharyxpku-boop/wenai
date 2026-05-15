'use client';

import { useEffect, useState } from 'react';

/**
 * 全局键盘快捷键帮助 · ? 键唤起
 *
 * 文档当前商用主路径快捷键。
 *
 * 做帮助而不是 onboarding tour: 商家想看时按 ?, 不打扰主流程
 */

interface Shortcut {
  keys: string[];
  desc: string;
  scope?: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['⌘', 'K'], desc: '打开命令面板 · 进入导入、报告、定价和生产设置', scope: '全局' },
  { keys: ['Ctrl', 'K'], desc: '同上 (Windows/Linux)', scope: '全局' },
  { keys: ['?'], desc: '打开/关闭本帮助', scope: '全局' },
  { keys: ['Esc'], desc: '关闭命令面板 / 帮助 / 弹层', scope: '全局' },
  { keys: ['Enter'], desc: '打开命令面板中当前高亮的核心动作', scope: '命令面板' },
  { keys: ['↑', '↓'], desc: '切换命令面板候选项', scope: '命令面板' },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ? 键 (shift+/) 打开
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // 输入框聚焦时不抢
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        setOpen(prev => !prev);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  // 按 scope 分组
  const grouped = SHORTCUTS.reduce<Record<string, Shortcut[]>>((acc, s) => {
    const key = s.scope || '其他';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[520px] mx-4 bg-bg-surface border border-accent/40 rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              KEYBOARD SHORTCUTS
            </div>
            <h3 className="text-[15px] font-bold text-text-primary mt-0.5">
              键盘快捷键
            </h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-text-tertiary hover:text-text-primary text-[12px] font-mono"
          >
            Esc 关 ✕
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(grouped).map(([scope, items]) => (
            <div key={scope}>
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
                {scope}
              </div>
              <div className="space-y-1.5">
                {items.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-1">
                    <span className="text-[12px] text-text-primary flex-1">{s.desc}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="text-[10px] font-mono px-1.5 py-0.5 border border-border-default rounded bg-bg-root text-text-secondary tabular-nums"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-2.5 border-t border-border-subtle text-[10px] font-mono text-text-tertiary">
          按 <kbd className="px-1 py-0.5 border border-border-default rounded bg-bg-root">Esc</kbd> 关闭本帮助
        </div>
      </div>
    </div>
  );
}
