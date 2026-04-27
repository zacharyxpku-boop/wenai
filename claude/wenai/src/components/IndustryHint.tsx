'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * 行业上下文提示条 · 决策模块共用
 *
 * 读 /api/user/settings industry 字段, 显示绿色"AI 已知行业 X"
 * 已配 + 有 SKU 时同时显示 "+ N SKU portfolio" 让商家知道 AI 看了哪些
 * 没设置时显示灰色引导跳设置页
 *
 * showPortfolio prop · 默认 true; 仅 portfolio 注入的 6 模块设 true
 */
export function IndustryHint({ showPortfolio = true }: { showPortfolio?: boolean } = {}) {
  const [industry, setIndustry] = useState<string | null>(null);
  const [skuCount, setSkuCount] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(d => setIndustry(d.settings?.industry || null))
      .catch(() => {});
    if (showPortfolio) {
      fetch('/api/user/sku-history?limit=8')
        .then(r => r.json())
        .then(d => setSkuCount(d.skus?.length || 0))
        .catch(() => {});
    }
    // 给 fetch 200ms 兜底, 不无限 loading 影响布局
    const t = setTimeout(() => setLoaded(true), 250);
    return () => clearTimeout(t);
  }, [showPortfolio]);

  if (!loaded) return null;

  if (industry) {
    return (
      <div className="inline-flex items-center gap-2 border border-success/40 bg-success/5 rounded px-2.5 py-1 text-[10px] font-mono flex-wrap">
        <span className="text-success">🏷️ AI 已知行业:</span>
        <span className="text-text-primary truncate max-w-[260px]" title={industry}>
          {industry.length > 32 ? industry.slice(0, 32) + '…' : industry}
        </span>
        {showPortfolio && skuCount > 0 && (
          <span className="text-success/80" title={`AI 推理时会看到你最近 ${Math.min(skuCount, 5)} 个 SKU 的 portfolio`}>
            + {Math.min(skuCount, 5)} SKU portfolio
          </span>
        )}
        <Link href="/me/settings" className="text-text-tertiary hover:text-accent">改 →</Link>
      </div>
    );
  }

  return (
    <Link
      href="/me/settings"
      className="inline-flex items-center gap-2 border border-text-tertiary/30 hover:border-accent/40 rounded px-2.5 py-1 text-[10px] font-mono text-text-tertiary hover:text-accent transition-colors"
      title="补一句行业 (例: 跨境女装独立站) AI 决策建议会更贴你的实际盘子"
    >
      💡 补行业上下文 · AI 推荐能更准 →
    </Link>
  );
}
