import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '免费工具 · Hook 打分 / AIGC 合规速查 | wenai',
  description: '跨境电商开跑前用 · Hook 文案预估打分 · 多平台 AIGC 披露合规速查 · 0 LLM 成本随便用',
};

const TOOLS = [
  {
    href: '/tools/hook-score',
    emoji: '🎯',
    title: 'Hook 跑前打分',
    desc: '粘 hook 文案, 立即拿 0-100 分 + 预估 CTR 区间',
    tag: '0 LLM',
    free: true,
  },
  {
    href: '/tools/aigc-compliance',
    emoji: '🛡️',
    title: 'AIGC 合规速查',
    desc: '6 平台 AI 内容披露规则 · 一键复制披露语',
    tag: 'SEO',
    free: true,
  },
] as const;

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-[10px] font-mono text-text-tertiary hover:text-accent">← 首页</Link>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-1 font-[family-name:var(--font-outfit)]">
            🧰 免费工具
          </h1>
          <p className="text-[12px] text-text-secondary">
            开跑前用 · 不烧 quota · 不需登录, 直接干
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="block border border-border-subtle bg-bg-surface/30 rounded-lg p-5 hover:border-accent/40 transition-colors group"
            >
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-[9px] font-mono text-accent border border-accent/40 px-1.5 py-0.5 rounded">
                  {t.tag}
                </span>
              </div>
              <div className="text-[15px] font-bold text-text-primary mb-1 group-hover:text-accent">
                {t.title}
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed">{t.desc}</p>
              <div className="mt-3 text-[10px] font-mono text-text-tertiary">
                {t.free ? '免费 · 无需注册' : '需登录'} →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 p-4 border border-border-subtle rounded-lg bg-bg-surface/20 text-[11px] text-text-secondary leading-relaxed">
          这些工具会持续加 · 想要哪个? 邮件 <code className="text-accent">hello@wenai</code> 留言
          <br />
          完整 SKU 库 / AI 主图 / 视频拆解在 <Link href="/me/skus" className="text-accent hover:underline">/me/skus</Link>
        </div>
      </div>
    </div>
  );
}
