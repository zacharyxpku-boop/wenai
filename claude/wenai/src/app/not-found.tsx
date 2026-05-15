import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '页面不存在 · wenai',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
            404 · PAGE NOT FOUND
          </div>
          <div className="text-6xl font-bold text-text-primary/20 font-mono tabular-nums leading-none mb-3">
            404
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
            页面不存在
          </h1>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            该功能正在升级，请前往首页体验新功能。
            <br />
            你也可以直接进入内容决策工作台，继续导入 CSV 并生成下一轮行动建议。
          </p>
        </div>

        {/* 建议入口 */}
        <div className="space-y-2 mb-6">
          <Link
            href="/"
            className="block w-full py-3 bg-accent hover:bg-accent-hover text-bg-root text-[13px] font-semibold rounded-md transition-colors"
          >
            返回首页
          </Link>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/dashboard"
              className="py-2 text-[11px] font-mono text-text-secondary hover:text-accent border border-border-default rounded-md hover:border-accent/40 transition-colors"
            >
              工作台
            </Link>
            <Link
              href="/factory"
              className="py-2 text-[11px] font-mono text-text-secondary hover:text-accent border border-border-default rounded-md hover:border-accent/40 transition-colors"
            >
              导入 CSV
            </Link>
            <Link
              href="/pricing"
              className="py-2 text-[11px] font-mono text-text-secondary hover:text-accent border border-border-default rounded-md hover:border-accent/40 transition-colors"
            >
              定价
            </Link>
          </div>
        </div>

        {/* 辅助链接 */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-text-tertiary">
          <Link href="/pricing" className="hover:text-accent">定价</Link>
          <span className="opacity-40">·</span>
          <Link href="/poc/report" className="hover:text-accent">报告模板</Link>
          <span className="opacity-40">·</span>
          <Link href="/settings/kuaizi" className="hover:text-accent">生产工具设置</Link>
        </div>
      </div>
    </div>
  );
}
