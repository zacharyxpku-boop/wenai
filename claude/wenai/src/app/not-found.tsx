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
            这个地址没挂到任何 Pipeline / Toolbox / 文档页面。
            <br />
            可能链接写错了，或者页面已经挪位置。
          </p>
        </div>

        {/* 建议入口 */}
        <div className="space-y-2 mb-6">
          <Link
            href="/"
            className="block w-full py-3 bg-accent hover:bg-accent-hover text-bg-root text-[13px] font-semibold rounded-md transition-colors"
          >
            回工作台 →
          </Link>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/pipelines/new-listing"
              className="py-2 text-[11px] font-mono text-text-secondary hover:text-accent border border-border-default rounded-md hover:border-accent/40 transition-colors"
            >
              01 新品
            </Link>
            <Link
              href="/pipelines/influencer-outbound"
              className="py-2 text-[11px] font-mono text-text-secondary hover:text-accent border border-border-default rounded-md hover:border-accent/40 transition-colors"
            >
              02 达人
            </Link>
            <Link
              href="/pipelines/product-image"
              className="py-2 text-[11px] font-mono text-text-secondary hover:text-accent border border-border-default rounded-md hover:border-accent/40 transition-colors"
            >
              03 主图
            </Link>
          </div>
        </div>

        {/* 辅助链接 */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-text-tertiary">
          <Link href="/cases" className="hover:text-accent">案例</Link>
          <span className="opacity-40">·</span>
          <Link href="/pricing" className="hover:text-accent">定价</Link>
          <span className="opacity-40">·</span>
          <Link href="/status" className="hover:text-accent">状态</Link>
          <span className="opacity-40">·</span>
          <a href="mailto:zachary.x.pku@gmail.com" className="hover:text-accent">联系</a>
        </div>
      </div>
    </div>
  );
}
