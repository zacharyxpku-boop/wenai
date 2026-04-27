import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBenchSnapshot } from '@/lib/cross-org-benchmark';

/**
 * /benchmark/[category] · 单品类详细分位
 *
 * SEO 长尾页 · 每个 category 一个独立 URL → Google 索引每条
 */

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = decodeURIComponent(category);
  return {
    title: `${cat} CTR / CPC 行业基线 · wenai`,
    description: `${cat} 品类全网匿名投放数据汇总, 看你 SKU 排在哪个分位。`,
    openGraph: {
      title: `${cat} 行业基线 · wenai`,
      description: `${cat} 真实 CTR / CPC 分位 · 完全匿名`,
    },
  };
}

export default async function CategoryBenchmarkPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = decodeURIComponent(category);
  const [ctr, cpc] = await Promise.all([
    getBenchSnapshot('ctr', cat),
    getBenchSnapshot('cpc', cat),
  ]);
  if (ctr.count < 10 && cpc.count < 10) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/benchmark" className="text-[10px] font-mono text-text-tertiary hover:text-accent">
            ← 全品类 benchmark
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
          {cat} · 行业基线
        </h1>
        <p className="text-[12px] text-text-secondary mb-6">
          wenai 真实匿名样本, 仅暴露统计分位, 不暴露任何商家或产品信息。
        </p>

        <DistRow snap={ctr} label="CTR (越高越好)" suffix="%" />
        <DistRow snap={cpc} label="CPC (越低越好)" suffix=" ¥" />

        <section className="mt-8 border border-accent/30 bg-accent/5 rounded-lg p-5">
          <h3 className="text-[14px] font-bold text-text-primary mb-2">想看你 SKU 排第几?</h3>
          <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
            登录后, wenai 会把你 SKU 的真实数据匿名加入这个 benchmark, 同时给你看自己的精确 percentile + 加预算 / 改图 / 杀验阈值建议。
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/login"
              className="inline-block text-[11px] font-mono px-4 py-2 bg-accent text-bg-root rounded hover:bg-accent-hover"
            >
              登录看自己的 →
            </Link>
            <Link
              href={`/inquire?from=benchmark-${encodeURIComponent(cat)}`}
              className="inline-block text-[11px] font-mono px-4 py-2 border border-accent/40 text-accent rounded hover:bg-accent/10"
            >
              企业批量对接 →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

interface Snap {
  metric: string;
  count: number;
  p10: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
}

function DistRow({ snap, label, suffix }: { snap: Snap; label: string; suffix: string }) {
  if (snap.count < 10) {
    return (
      <div className="border border-border-subtle rounded-lg p-4 mb-4 text-[11px] font-mono text-text-tertiary">
        {snap.metric.toUpperCase()} 该品类样本 {snap.count} 个 (需 ≥ 10 才公开)
      </div>
    );
  }
  return (
    <div className="border border-border-subtle rounded-lg p-5 mb-4 bg-bg-surface/30">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-[14px] font-bold text-text-primary">{label}</h2>
        <span className="text-[10px] font-mono text-text-tertiary">样本 n = {snap.count}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Pct label="P10" value={snap.p10} suffix={suffix} hint="头部 10%" />
        <Pct label="P25" value={snap.p25} suffix={suffix} hint="前 25%" />
        <Pct label="P50" value={snap.p50} suffix={suffix} hint="中位" />
        <Pct label="P75" value={snap.p75} suffix={suffix} hint="后 25%" />
        <Pct label="P90" value={snap.p90} suffix={suffix} hint="尾部 10%" />
      </div>
      {(snap.p10 === null || snap.p90 === null) && (
        <div className="text-[10px] font-mono text-text-tertiary mt-3 leading-relaxed">
          🔒 部分分位需 ≥{snap.p25 === null ? 20 : 50} 样本才公开 · 防小桶反向识别
        </div>
      )}
    </div>
  );
}

function Pct({ label, value, suffix, hint }: { label: string; value: number | null; suffix: string; hint: string }) {
  return (
    <div className="border border-border-subtle/50 rounded p-2 bg-bg-root/30 text-center">
      <div className="text-[9px] font-mono text-text-tertiary uppercase">{label}</div>
      <div className="text-[14px] font-bold text-text-primary tabular-nums mt-1">
        {value === null ? <span className="text-text-tertiary">🔒</span> : `${value.toFixed(2)}${suffix}`}
      </div>
      <div className="text-[9px] font-mono text-text-tertiary mt-0.5">{hint}</div>
    </div>
  );
}
