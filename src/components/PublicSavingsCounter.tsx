'use client';

import { useEffect, useState } from 'react';

/**
 * 首页公开累计省钱计数器 · 领先动作产品
 *
 * 5 分钟一次自取数, 拉到值后做 800ms 动画爬升 (心理冲击)
 * 数据失败 / Redis 没配 → 显式静默不渲染 (避免显示 ¥0)
 */

interface SavingsResp {
  replacementSavedCny: number;
  wenaiCostCny: number;
  cacheSavedCny: number;
  grandTotalCny: number;
  activeOrgCount: number;
  windowDays: number;
}

export function PublicSavingsCounter() {
  const [data, setData] = useState<SavingsResp | null>(null);
  const [animated, setAnimated] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/savings-total')
      .then(r => r.json())
      .then((d: SavingsResp) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 动画爬升 0 → grandTotal
  useEffect(() => {
    if (!data || data.grandTotalCny <= 0) return;
    const target = data.grandTotalCny;
    const duration = 1200;
    const start = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(target * eased);
      if (t < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [data]);

  if (loading || !data || data.grandTotalCny <= 0) return null;

  return (
    <div className="border border-success/40 bg-gradient-to-br from-success/10 to-accent/5 rounded-lg p-4 my-5 max-w-[600px]">
      <div className="flex items-baseline gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-mono text-success uppercase tracking-[0.15em] mb-1">
            过去 {data.windowDays} 天 · 全平台累计为商家节省
          </div>
          <div className="text-3xl lg:text-4xl font-bold text-success tabular-nums font-[family-name:var(--font-outfit)]">
            ¥{Math.floor(animated).toLocaleString('zh-CN')}
          </div>
        </div>
        <div className="text-[11px] text-text-secondary leading-relaxed">
          ({data.activeOrgCount} 个商家在用)
          <br />
          <span className="text-text-tertiary text-[10px] font-mono">
            vs 真人拍摄/外包替代成本 + 缓存红利
          </span>
        </div>
      </div>
    </div>
  );
}
