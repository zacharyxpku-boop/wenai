'use client';

const metrics = [
  { label: 'CTR', value: '4.1%', note: '高于你的历史均值 2.1%' },
  { label: 'ROAS', value: '3.30', note: '基于 3,200 次曝光和 $67.00 花费' },
];

function DemoIcon({ type }: { type: 'csv' | 'brief' | 'share' }) {
  const paths = {
    csv: 'M6 3h8l4 4v14H6V3Zm8 0v5h4M8 12h8M8 16h8M8 20h5',
    brief: 'M12 3v12m0 0 4-4m-4 4-4-4M5 21h14',
    share: 'M8 12h8M16 12l-3-3m3 3-3 3M6 5h12v14H6V5Z',
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
      <path d={paths[type]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingDecisionDemo() {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface p-5">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary">你的决策摘要</div>
          <div className="mt-1 text-lg font-semibold text-text-primary">建议小范围放大</div>
        </div>
        <span className="rounded-md bg-accent-dim px-3 py-1 text-[11px] font-mono text-accent">高置信</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {metrics.map(metric => (
          <div key={metric.label} className="rounded-md border border-border-subtle bg-bg-root/35 p-4 transition-colors hover:border-accent/60">
            <div className="text-[10px] font-mono text-text-tertiary">{metric.label}</div>
            <div className="mt-2 text-3xl font-semibold text-text-primary">{metric.value}</div>
            <p className="mt-2 text-[12px] text-text-secondary">{metric.note}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/35 p-4">
        <div className="text-[12px] font-semibold text-text-primary">下一步动作</div>
        <p className="mt-2 text-[13px] leading-6 text-text-secondary">
          保留胜出的 Hook，预算小幅增加到 $100，继续跑 3 天验证转化稳定性，同时导出同结构生产 Brief。
        </p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          { icon: 'csv' as const, label: '导入 CSV' },
          { icon: 'brief' as const, label: '导出 Brief' },
          { icon: 'share' as const, label: '分享模板' },
        ].map(item => (
          <button key={item.label} type="button" className="inline-flex items-center justify-center gap-2 rounded-md border border-border-subtle px-3 py-2 text-[12px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent">
            <DemoIcon type={item.icon} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
