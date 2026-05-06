'use client';

import { useMemo, useState } from 'react';
import { Container, PrimaryButton, Section, SecondaryButton } from '@/components/marketing/Container';

const WENAI_COST = 50;

export function RoiCalculator() {
  const [dailySkus, setDailySkus] = useState(50);
  const [cost, setCost] = useState(3500);

  const result = useMemo(() => {
    const currentMonthly = dailySkus * cost * 30;
    const wenaiMonthly = dailySkus * WENAI_COST * 30;
    const monthlyDiff = Math.max(0, currentMonthly - wenaiMonthly);
    const yearlyDiff = monthlyDiff * 12;
    const multiple = cost / WENAI_COST;
    return { currentMonthly, wenaiMonthly, monthlyDiff, yearlyDiff, multiple };
  }, [dailySkus, cost]);

  const fmt = (value: number) => value.toLocaleString('zh-CN');
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="text-[11px] font-mono text-text-tertiary">成本差距估算</div>
            <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
              客户付费前，先让他看见上新流程的成本差距。
            </h2>
            <p className="text-pretty text-[15px] leading-7 text-text-secondary">
              这是销售沟通用估算器，不承诺真实节省。它的作用是帮助客户理解：为什么应该先用 10 个 SKU 跑一个可验收 POC。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/inquire?from=roi">提交 POC 询盘</PrimaryButton>
              <SecondaryButton href="/demo">运行演示 SKU</SecondaryButton>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6 rounded-md border border-border-default bg-bg-surface p-5">
              <SliderField
                id="roi-skus"
                label="每日 SKU 数"
                value={dailySkus}
                min={1}
                max={1000}
                step={1}
                onChange={(value) => setDailySkus(clamp(value, 1, 1000))}
              />
              <SliderField
                id="roi-cost"
                label="当前每个 SKU 内容成本"
                value={cost}
                min={100}
                max={10000}
                step={50}
                prefix="RMB "
                onChange={(value) => setCost(clamp(value, 100, 10000))}
              />
            </div>

            <div className="space-y-5 rounded-md border border-accent/35 bg-bg-root p-5">
              <Metric label="当前月成本估算" value={`RMB ${fmt(result.currentMonthly)}`} muted />
              <Metric label="wenai 标准流程估算" value={`RMB ${fmt(result.wenaiMonthly)}`} />
              <div className="border-t border-border-subtle pt-5">
                <div className="text-[13px] text-text-secondary">月度差距估算</div>
                <div className="mt-2 font-mono text-3xl font-semibold text-accent tabular-nums">
                  RMB {fmt(result.monthlyDiff)}
                </div>
                <div className="mt-2 text-[12px] text-text-tertiary">约 {result.multiple.toFixed(0)}x 成本差距</div>
              </div>
              <Metric label="年度差距估算" value={`RMB ${fmt(result.yearlyDiff)}`} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  prefix = '',
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-text-secondary">
          {label}
        </label>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(parseInt(event.target.value || '0', 10) || min)}
          className="w-32 rounded-md border border-border-default bg-bg-root px-3 py-1.5 text-right font-mono text-text-primary tabular-nums focus:border-accent focus:outline-none"
          aria-label={label}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseInt(event.target.value, 10))}
        className="w-full cursor-pointer"
        style={{ accentColor: 'rgb(200 151 90)' }}
      />
      <div className="flex justify-between font-mono text-xs text-text-tertiary tabular-nums">
        <span>
          {prefix}
          {min.toLocaleString('zh-CN')}
        </span>
        <span>
          {prefix}
          {max.toLocaleString('zh-CN')}
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[13px] text-text-secondary">{label}</span>
      <span className={`font-mono text-lg font-semibold tabular-nums ${muted ? 'text-text-tertiary' : 'text-accent'}`}>
        {value}
      </span>
    </div>
  );
}
