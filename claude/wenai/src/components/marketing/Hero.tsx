import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';

const STATS = [
  { value: '10 SKU', label: 'POC launch scope' },
  { value: '5 layers', label: 'Brand, category, content, report, CRM' },
  { value: '1 line', label: 'From intake to contract motion' },
];

const DELIVERY_ITEMS = [
  'SKU intake and category acceptance rules',
  'Brand IQ, forbidden claims, and tone guardrails',
  'TikTok and Instagram content marketing pack',
  'POC report, executive share, and CRM next action',
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
              Ecommerce AI commercial delivery system
            </div>
            <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl font-[family-name:var(--font-outfit)]">
              From SKU to POC report to contract motion.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              wenai turns ecommerce launch work into a standard delivery line: SKU intake, category rules,
              Brand IQ, content marketing, executive reporting, and CRM follow-up in one customer-ready flow.
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
                Run 5-minute POC
              </PrimaryButton>
              <SecondaryButton href="/pricing" size="lg">
                View commercial paths
              </SecondaryButton>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-md border border-border-default bg-bg-surface p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Delivery package</div>
                  <div className="mt-1 text-lg font-semibold text-text-primary">10 SKU POC</div>
                </div>
                <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-mono text-accent">
                  READY
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
                Output: standard pack, acceptance checklist, read-only executive report, and next commercial action.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
