'use client';

import { useMemo, useState } from 'react';
import { COPY } from '@/i18n/zh';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';

const WENAI_COST = COPY.roi.wenaiCostPerSku;

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

  const fmt = (value: number) => value.toLocaleString('en-US');
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  return (
    <Section as="section">
      <div id="roi-calculator" className="scroll-mt-20" />
      <Container>
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
            {roi.title}
          </h2>
          <p className="text-base leading-relaxed text-text-secondary md:text-lg">{roi.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-8 rounded-md border border-border-default bg-bg-surface p-6 md:p-8">
            <SliderField
              id="roi-skus"
              label={roi.inputs.dailySkus}
              value={dailySkus}
              min={1}
              max={1000}
              step={1}
              onChange={(value) => setDailySkus(clamp(value, 1, 1000))}
            />
            <SliderField
              id="roi-cost"
              label={roi.inputs.currentCostPerSku}
              value={cost}
              min={100}
              max={10000}
              step={50}
              prefix="RMB "
              onChange={(value) => setCost(clamp(value, 100, 10000))}
            />
          </div>

          <div className="flex flex-col gap-5 rounded-md border border-accent/30 bg-accent/10 p-6 md:p-8">
            <Metric label={roi.output.currentMonthly} value={`RMB ${fmt(result.currentMonthly)}`} muted />
            <Metric label={roi.output.wenaiMonthly} value={`RMB ${fmt(result.wenaiMonthly)}`} />
            <div className="h-px bg-accent/30" />
            <div className="flex flex-col gap-2">
              <span className="text-sm text-text-secondary">{roi.output.monthlySaved}</span>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-4xl font-bold leading-none text-accent tabular-nums md:text-5xl">
                  RMB {fmt(result.monthlyDiff)}
                </span>
                <span className="font-mono text-sm text-text-secondary tabular-nums">
                  ({result.multiple.toFixed(0)}x gap)
                </span>
              </div>
            </div>
            <Metric label={roi.output.yearlySaved} value={`RMB ${fmt(result.yearlyDiff)}`} />
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <PrimaryButton href="/dashboard" size="lg">
            {roi.primaryCta} <span aria-hidden>-&gt;</span>
          </PrimaryButton>
          <SecondaryButton href="/pricing" size="lg">
            {roi.secondaryCta}
          </SecondaryButton>
        </div>
        <p className="mt-4 text-center text-[11px] text-text-tertiary">
          Estimates are based on your inputs and do not guarantee revenue, cost reduction, or delivery outcomes.
        </p>
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
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-text-secondary">{label}</label>
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
        <span>{prefix}{min.toLocaleString('en-US')}</span>
        <span>{prefix}{max.toLocaleString('en-US')}</span>
      </div>
    </div>
  );
}

function Metric({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={`font-mono text-xl font-bold tabular-nums md:text-2xl ${
          muted ? 'text-text-secondary line-through decoration-text-tertiary/50' : 'text-accent'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
