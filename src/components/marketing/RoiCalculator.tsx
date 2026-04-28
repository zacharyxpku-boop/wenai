'use client';

import { useMemo, useState } from 'react';
import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';

const WENAI_COST = COPY.roi.wenaiCostPerSku; // 50

/**
 * RoiCalculator · 你公司每月能省多少
 *
 * 左输入 (滑块+数字框) + 右实时结果 (琥珀卡)
 * 默认 50 SKU/¥3,500 → 节省 ¥499,500/月
 */
export function RoiCalculator() {
  const { roi } = COPY;

  const [dailySkus, setDailySkus] = useState(50);
  const [cost, setCost] = useState(3500);

  const result = useMemo(() => {
    const currentMonthly = dailySkus * cost * 30;
    const wenaiMonthly = dailySkus * WENAI_COST * 30;
    const monthlyDiff = currentMonthly - wenaiMonthly;
    const yearlyDiff = monthlyDiff * 12;
    const multiple = cost / WENAI_COST;
    return { currentMonthly, wenaiMonthly, monthlyDiff, yearlyDiff, multiple };
  }, [dailySkus, cost]);

  const fmt = (n: number) => n.toLocaleString('zh-CN');

  // 边界
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  return (
    <Section as="section">
      <div id="roi-calculator" className="scroll-mt-20" />
      <Container>
        {/* 顶部标题 */}
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            {roi.title}
          </h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed">
            {roi.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左 输入 */}
          <div className="flex flex-col gap-8 rounded-lg border border-border-default bg-bg-surface p-6 md:p-8">
            {/* 输入 1 SKU */}
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor="roi-skus"
                  className="text-sm text-text-secondary"
                >
                  {roi.inputs.dailySkus}
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={dailySkus}
                  onChange={(e) =>
                    setDailySkus(clamp(parseInt(e.target.value || '0', 10) || 0, 1, 1000))
                  }
                  className="w-24 px-3 py-1.5 rounded-md border border-border-default bg-bg-root text-text-primary font-mono tabular-nums text-right focus:border-accent focus:outline-none"
                />
              </div>
              <input
                id="roi-skus"
                type="range"
                min={1}
                max={1000}
                value={dailySkus}
                onChange={(e) => setDailySkus(parseInt(e.target.value, 10))}
                className="w-full accent-accent cursor-pointer"
                style={{ accentColor: 'rgb(200 151 90)' }}
              />
              <div className="flex justify-between text-xs text-text-tertiary font-mono tabular-nums">
                <span>1</span>
                <span>1,000</span>
              </div>
            </div>

            {/* 输入 2 cost */}
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor="roi-cost"
                  className="text-sm text-text-secondary"
                >
                  {roi.inputs.currentCostPerSku}
                </label>
                <input
                  type="number"
                  min={100}
                  max={10000}
                  value={cost}
                  onChange={(e) =>
                    setCost(clamp(parseInt(e.target.value || '0', 10) || 0, 100, 10000))
                  }
                  className="w-28 px-3 py-1.5 rounded-md border border-border-default bg-bg-root text-text-primary font-mono tabular-nums text-right focus:border-accent focus:outline-none"
                />
              </div>
              <input
                id="roi-cost"
                type="range"
                min={100}
                max={10000}
                step={50}
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer"
                style={{ accentColor: 'rgb(200 151 90)' }}
              />
              <div className="flex justify-between text-xs text-text-tertiary font-mono tabular-nums">
                <span>¥100</span>
                <span>¥10,000</span>
              </div>
            </div>
          </div>

          {/* 右 结果 */}
          <div className="flex flex-col gap-5 rounded-lg border border-accent/30 bg-accent/10 p-6 md:p-8">
            {/* 当前月花 */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-text-secondary">
                {roi.output.currentMonthly}
              </span>
              <span className="text-xl md:text-2xl font-bold text-text-secondary font-mono tabular-nums line-through decoration-text-tertiary/50">
                ¥{fmt(result.currentMonthly)}
              </span>
            </div>

            {/* wenai 月花 */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-text-secondary">
                {roi.output.wenaiMonthly}
              </span>
              <span className="text-xl md:text-2xl font-bold text-accent font-mono tabular-nums">
                ¥{fmt(result.wenaiMonthly)}
              </span>
            </div>

            <div className="h-px bg-accent/30" />

            {/* 月省 (主) */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-text-secondary">
                {roi.output.monthlySaved}
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl md:text-5xl font-bold text-accent font-mono tabular-nums leading-none">
                  ¥{fmt(result.monthlyDiff)}
                </span>
                <span className="text-sm text-text-secondary font-mono tabular-nums">
                  ({result.multiple.toFixed(0)}× 倍)
                </span>
              </div>
            </div>

            {/* 年省 */}
            <div className="flex items-baseline justify-between gap-4 pt-1">
              <span className="text-sm text-text-secondary">
                {roi.output.yearlySaved}
              </span>
              <span className="text-xl md:text-2xl font-bold text-accent font-mono tabular-nums">
                ¥{fmt(result.yearlyDiff)}
              </span>
            </div>
          </div>
        </div>

        {/* 跨两栏底部 CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryButton href="/inquire?from=roi" size="lg">
            {roi.primaryCta} <span aria-hidden>→</span>
          </PrimaryButton>
          <SecondaryButton href="/inquire?from=demo" size="lg">
            {roi.secondaryCta}
          </SecondaryButton>
        </div>
      </Container>
    </Section>
  );
}
