import type { Metadata } from 'next';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import {
  Container,
  Section,
  PrimaryButton,
  SecondaryButton,
} from '@/components/marketing/Container';

export const metadata: Metadata = {
  title: 'Plans | wenai ecommerce AI delivery system',
  description:
    'POC, team, and enterprise paths for SKU launch packs, Brand IQ, content marketing, reporting, and contract motion.',
};

type Plan = {
  name: string;
  price: string;
  subtitle: string;
  cta: string;
  href: string;
  featured?: boolean;
  points: string[];
};

const PLANS: Plan[] = [
  {
    name: 'POC',
    price: '10 SKU',
    subtitle: 'Fast proof for a live category before contract expansion.',
    cta: 'Run POC intake',
    href: '/poc',
    points: [
      'Single category launch pack',
      'Brand IQ and redline review',
      'Executive share page and recap',
      'Acceptance score and contract recommendation',
    ],
  },
  {
    name: 'Team',
    price: 'Standard',
    subtitle: 'Weekly delivery motion for operators shipping SKUs and creative tests.',
    cta: 'Open inquiry',
    href: '/inquire',
    featured: true,
    points: [
      '10 SKU launch pipeline and batch workflow',
      'TikTok and Instagram benchmark to brief flow',
      'CRM next action, SLA, and owner tracking',
      'Reusable standard pack routes for new campaigns',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'Dedicated workspace rules, category thresholds, and operating support.',
    cta: 'Talk enterprise',
    href: '/enterprise',
    points: [
      'Brand knowledge base and workspace defaults',
      'Category-specific acceptance thresholds',
      'Executive reporting and contract motion layer',
      'Shared operating system for launch, content, and review teams',
    ],
  },
];

const ACCEPTANCE = [
  'A customer can move from category selection to SKU input, standard pack, report, and POC submission in one session.',
  'Every delivery package includes category rules, brand guardrails, content direction, and a clear human review line.',
  'The report can be shared upward as a read-only executive page instead of copied by hand.',
  'Commercial follow-up is captured with status, owner, SLA due date, quote state, payment state, and next action.',
];

const FAQ = [
  {
    q: 'What is the product buying?',
    a: 'Not generic copy generation. The buyer gets an ecommerce AI operating line with standard intake, guardrails, delivery artifacts, and contract-ready recap.',
  },
  {
    q: 'Does pricing include contract payment flow?',
    a: 'The subsite handles POC and motion design. Formal charging, payment, and master contract can stay on your main station.',
  },
  {
    q: 'Do we need all integrations live first?',
    a: 'No. This layer is designed to feel commercial-ready even before every upstream API is wired, as long as the core delivery flow is stable.',
  },
  {
    q: 'Who is it for?',
    a: 'Ecommerce operators, brand owners, and content teams that need a repeatable launch-plus-marketing workflow instead of isolated AI tools.',
  },
];

export default function PricingPage() {
  return (
    <>
      <TopNav />
      <main className="bg-bg-root text-text-primary">
        <Section spacing="tight">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-accent">Commercial paths</div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary md:text-5xl font-[family-name:var(--font-outfit)]">
                Choose the operating depth, not just the model calls.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-text-secondary">
                wenai packages SKU launch, Brand IQ, content marketing, POC reporting, and contract motion into
                a customer-facing system. Start with a 10 SKU proof, then expand into a repeatable team lane.
              </p>
            </div>
          </Container>
        </Section>

        <Section spacing="tight">
          <Container>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-md border p-6 ${
                    plan.featured
                      ? 'border-accent bg-accent/5'
                      : 'border-border-subtle bg-bg-surface'
                  }`}
                >
                  <div className="mb-5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                      {plan.name}
                    </div>
                    <div className="mt-2 text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                      {plan.price}
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{plan.subtitle}</p>
                  </div>

                  <div className="flex-1 space-y-3 border-y border-border-subtle py-5">
                    {plan.points.map((point) => (
                      <div key={point} className="flex gap-3 text-[13px] leading-relaxed text-text-primary">
                        <span className="mt-[2px] text-accent">+</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    {plan.featured ? (
                      <PrimaryButton href={plan.href} className="w-full justify-center">
                        {plan.cta}
                      </PrimaryButton>
                    ) : (
                      <SecondaryButton href={plan.href} className="w-full justify-center">
                        {plan.cta}
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section spacing="normal">
          <Container>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-md border border-border-subtle bg-bg-surface p-6">
                <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Acceptance bar</div>
                <h2 className="mt-2 text-2xl font-semibold text-text-primary">What “commercial-ready” means here</h2>
                <div className="mt-5 space-y-3">
                  {ACCEPTANCE.map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="font-mono text-[11px] text-accent">{String(index + 1).padStart(2, '0')}</div>
                      <p className="text-[13px] leading-relaxed text-text-primary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-border-subtle bg-bg-surface p-6">
                <div className="text-[10px] font-mono uppercase tracking-wider text-accent">Buyer FAQ</div>
                <div className="mt-5 space-y-4">
                  {FAQ.map((item) => (
                    <div key={item.q} className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
                      <div className="text-[13px] font-semibold text-text-primary">{item.q}</div>
                      <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </>
  );
}
