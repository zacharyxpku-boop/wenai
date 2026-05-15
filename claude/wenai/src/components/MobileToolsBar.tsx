/**
 * 移动端底部 sticky · 工具快速入口
 *
 * 只在 sm 屏幕以下显示 (大屏靠 Sidebar 即可)
 * 三个免费工具一行 · iOS safe-area 兼容
 *
 * Why server-side: 没 state, 不用 client component
 */

import Link from 'next/link';

const ITEMS = [
  { href: '/dashboard', icon: 'W', label: '项目' },
  { href: '/factory', icon: 'CSV', label: '导入' },
  { href: '/pricing', icon: '$', label: '定价' },
];

export function MobileToolsBar() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-border-subtle bg-bg-root/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      aria-label="免费工具快捷入口"
    >
      <div className="flex">
        {ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 text-text-secondary active:bg-accent/10"
          >
            <span className="text-[10px] leading-none mb-0.5 font-mono font-semibold text-accent">{item.icon}</span>
            <span className="text-[9px] font-mono">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
