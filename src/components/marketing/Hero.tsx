import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';

const STATS = [
  { value: '10 SKU', label: 'POC 标准交付范围' },
  { value: '5 层', label: '品牌、类目、内容、报告、CRM' },
  { value: '1 条线', label: '从输入到合同推进' },
];

const DELIVERY_ITEMS = [
  'SKU 输入和类目验收规则',
  'Brand IQ、禁用词和语气护栏',
  'TikTok / Instagram 内容营销交付包',
  'POC 报告、老板版分享页和 CRM 下一动作',
];

export function Hero() {
  return (
    <Section spacing="loose" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200, 151, 90, 0.5), transparent 70%)',
        }}
      />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-5 md:gap-12">
          <div className="flex flex-col gap-7 md:col-span-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-accent">
              给电商团队的 AI 商业交付系统
            </div>
            <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl font-[family-name:var(--font-outfit)]">
              从 SKU 输入，到 POC 报告，再到合同推进。
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              wenai 把电商上新和营销交付压成一条标准作业线：SKU 输入、类目规则、Brand IQ、内容营销、
              老板版报告和 CRM 跟进，在一个客户可直接理解的流程里跑完。
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div key={stat.value} className="border-l border-border-subtle pl-4">
                  <div className="font-mono text-2xl font-bold leading-none text-accent md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[12px] leading-snug text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <PrimaryButton href="/poc" size="lg">
                运行 5 分钟 POC
              </PrimaryButton>
              <SecondaryButton href="/pricing" size="lg">
                查看商业路径
              </SecondaryButton>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-md border border-border-default bg-bg-surface p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">交付包</div>
                  <div className="mt-1 text-lg font-semibold text-text-primary">10 SKU POC</div>
                </div>
                <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-mono text-accent">
                  就绪
                </div>
              </div>

              <div className="space-y-3">
                {DELIVERY_ITEMS.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
                    <div className="font-mono text-[11px] text-accent">{String(index + 1).padStart(2, '0')}</div>
                    <div className="text-[13px] leading-relaxed text-text-primary">{item}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/45 p-3 text-[12px] leading-relaxed text-text-secondary">
                产出：标准包、验收清单、只读老板版报告，以及下一步商业动作。
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
