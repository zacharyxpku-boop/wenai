import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '工具入口 | wenai',
  description:
    'wenai 的轻量工具入口：内容营销、hook 评分、AIGC 合规检查和 POC 准备。',
};

const TOOLS = [
  {
    href: '/pipelines/marketing-campaign',
    title: '内容营销标准包',
    desc: '把竞品内容、hook 矩阵、UGC brief、轮播/Reel brief 和复盘结构串起来。',
    tag: 'POC',
  },
  {
    href: '/tools/hook-score',
    title: 'Hook 评分',
    desc: '投放或发帖前，先粗评开头是否清楚、有钩子、有测试价值。',
    tag: '免费',
  },
  {
    href: '/tools/aigc-compliance',
    title: 'AIGC 合规检查',
    desc: '检查披露文案、平台风险、商标风险和必须人工复核的边界。',
    tag: '免费',
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-bg-root">
      <div className="mx-auto max-w-[800px] px-6 py-8">
        <div className="mb-6 border-b border-border-subtle pb-4">
          <Link href="/" className="mb-2 inline-block text-[10px] font-mono text-text-tertiary hover:text-accent">
            &lt;- 返回首页
          </Link>
          <h1 className="mb-1 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
            工具入口
          </h1>
          <p className="text-[12px] text-text-secondary">
            这些不是孤立小工具，而是 POC 交付系统里的辅助入口：先帮客户理解、检查和准备材料。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block rounded-md border border-border-subtle bg-bg-surface/30 p-5 transition-colors hover:border-accent/40"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-bold text-text-primary group-hover:text-accent">{tool.title}</span>
                <span className="rounded border border-accent/40 px-1.5 py-0.5 text-[9px] font-mono text-accent">
                  {tool.tag}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-text-secondary">{tool.desc}</p>
              <div className="mt-3 text-[10px] font-mono text-text-tertiary">打开 -&gt;</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-md border border-border-subtle bg-bg-surface/20 p-4 text-[11px] leading-relaxed text-text-secondary">
          完整 SKU 工作台、报告和商务推进请走 POC 与询盘流程；这里保留轻量入口，方便客户先试一小步。
        </div>
      </div>
    </div>
  );
}
