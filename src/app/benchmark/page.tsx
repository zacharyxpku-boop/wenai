import Link from 'next/link';
import type { Metadata } from 'next';
import { listBenchCategories } from '@/lib/cross-org-benchmark';

/**
 * 公开匿名 benchmark 索引 · /benchmark
 *
 * SEO 钩子: 商家搜"女装连衣裙 CTR 多少正常" / "服装电商 CPC 行业基线"
 * → 落到这里看到 wenai 真实匿名样本中位数
 * → 引导注册看自己 SKU 排第几
 *
 * 服务端渲染 (Next App Router default), 5 分钟 ISR (Redis 压力可控)
 */

export const revalidate = 300;

export const metadata: Metadata = {
  title: '电商 CTR / CPC 行业基线 · wenai 匿名 benchmark',
  description: 'wenai 全平台真实投放数据汇总, 按品类查看中位 CTR / CPC, 看你 SKU 在行业中的位置。完全匿名, 不暴露任何商家或 SKU 信息。',
  openGraph: {
    title: '电商 CTR / CPC 行业基线 · wenai',
    description: '匿名汇总真实投放数据 · 看你 SKU 排在哪',
  },
};

export default async function BenchmarkPage() {
  const [ctrCats, cpcCats] = await Promise.all([
    listBenchCategories('ctr', 10),
    listBenchCategories('cpc', 10),
  ]);

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8 pb-6 border-b border-border-subtle">
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-2">
            PUBLIC BENCHMARK · 行业基线
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            电商 CTR / CPC 行业基线
          </h1>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-[760px]">
            wenai 全平台真实投放回填数据, 按品类聚合的中位数。<span className="text-accent">完全匿名</span>:
            只输出统计值, 不存任何商家 / SKU / 产品信息。每个品类至少 10 个独立 SKU 样本才会公开。
          </p>
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            <Link
              href="/me/skus"
              className="text-[11px] font-mono px-3 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover"
            >
              看你自己 SKU 排第几 →
            </Link>
            <Link
              href="/inquire?from=benchmark-index"
              className="text-[11px] font-mono px-3 py-1.5 border border-accent/40 text-accent rounded hover:bg-accent/10"
            >
              企业询盘批量对接 →
            </Link>
            <Link
              href="/"
              className="text-[11px] font-mono text-text-tertiary hover:text-accent"
            >
              wenai 主页
            </Link>
          </div>
        </div>

        {/* CTR */}
        <section className="mb-10">
          <h2 className="text-[16px] font-bold text-text-primary mb-3">
            🎯 CTR 中位数 (按品类)
            <span className="text-[10px] font-mono text-text-tertiary ml-2">
              · {ctrCats.length} 个品类样本足够公开
            </span>
          </h2>
          {ctrCats.length === 0 ? (
            <EmptyHint metric="CTR" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {ctrCats.map(c => (
                <CategoryCard key={c.category} category={c.category} count={c.count} value={c.median} suffix="%" metric="CTR" higherBetter />
              ))}
            </div>
          )}
        </section>

        {/* CPC */}
        <section className="mb-10">
          <h2 className="text-[16px] font-bold text-text-primary mb-3">
            💰 CPC 中位数 (按品类)
            <span className="text-[10px] font-mono text-text-tertiary ml-2">
              · {cpcCats.length} 个品类样本足够公开
            </span>
          </h2>
          {cpcCats.length === 0 ? (
            <EmptyHint metric="CPC" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {cpcCats.map(c => (
                <CategoryCard key={c.category} category={c.category} count={c.count} value={c.median} suffix=" ¥" metric="CPC" higherBetter={false} />
              ))}
            </div>
          )}
        </section>

        {/* 隐私 + 方法说明 */}
        <section className="border-t border-border-subtle pt-6">
          <h3 className="text-[12px] font-bold text-text-primary mb-2">数据来源 + 隐私</h3>
          <ul className="text-[11px] text-text-secondary leading-relaxed space-y-1.5 list-disc pl-5">
            <li>样本来源: wenai 商家在 ab-test 模块投放后回填的真实数据</li>
            <li>匿名化: 只存数值 + category, 不存 orgId / SKU 名 / 产品任何信息</li>
            <li>滚动窗口: 90 天 TTL, 老数据自动淘汰避免过时</li>
            <li>样本下限: 单品类 &lt; 10 不展示, 防小桶反向识别</li>
            <li>分位条件: ≥ 20 才出 p25/50/75, ≥ 50 才出 p10/p90 (登录后可见)</li>
            <li>更新频率: 5 分钟 ISR · 数据准实时</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function CategoryCard({ category, count, value, suffix, metric, higherBetter }: {
  category: string;
  count: number;
  value: number;
  suffix: string;
  metric: string;
  higherBetter: boolean;
}) {
  return (
    <Link
      href={`/benchmark/${encodeURIComponent(category)}`}
      className="border border-border-subtle bg-bg-surface/30 hover:border-accent/50 hover:bg-bg-surface/50 rounded-lg p-3 transition-colors"
    >
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[12px] font-semibold text-text-primary truncate flex-1">
          {category}
        </span>
        <span className="text-[10px] font-mono text-text-tertiary tabular-nums ml-2">
          n={count}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[18px] font-bold text-accent tabular-nums">
          {value.toFixed(2)}{suffix}
        </span>
        <span className="text-[9px] font-mono text-text-tertiary">
          {metric} {higherBetter ? '中位 (越高越好)' : '中位 (越低越好)'}
        </span>
      </div>
    </Link>
  );
}

function EmptyHint({ metric }: { metric: string }) {
  return (
    <div className="border border-dashed border-border-subtle rounded-lg p-6 text-center text-[11px] font-mono text-text-tertiary">
      {metric} benchmark 样本还不够公开 (每个品类需 ≥ 10 个独立 SKU)
      <br />
      <Link href="/" className="text-accent hover:underline mt-2 inline-block">
        来 wenai 跑你自己的 →
      </Link>
    </div>
  );
}
