import type { Metadata } from 'next';
import Link from 'next/link';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';
import FiveMinutePocOnboarding from '@/components/FiveMinutePocOnboarding';
import PocLaunchChecklist from '@/components/PocLaunchChecklist';
import { POC_EVIDENCE_CASES } from '@/lib/poc-case-studies';
import { POC_STANDARD_PACK_ROUTE } from '@/lib/standard-pack-routing';

export const metadata: Metadata = {
  title: '10 SKU POC | wenai',
  description:
    'A commercial POC system for ecommerce teams: SKU intake, category rules, Brand IQ, content marketing, POC report, and contract motion.',
};

const STEPS = [
  ['01', 'Prepare 10 real SKUs', 'Collect SKU names, category, selling points, price band, target platforms, current product images, and benchmark links.'],
  ['02', 'Generate launch pack', 'Produce image direction, listing copy, compliance redlines, customer-service FAQ, and review checklist.'],
  ['03', 'Apply Brand IQ', 'Attach brand voice, forbidden claims, category thresholds, proof requirements, and review-owner rules.'],
  ['04', 'Create POC report', 'Turn delivery evidence into acceptance score, risks, next action, and contract motion.'],
] as const;

const DELIVERABLES = [
  '01_SKU_intake.md',
  '02_image_direction.md',
  '03_listing_copy.md',
  '04_compliance_redlines.md',
  '05_customer_service_faq.md',
  '06_content_marketing_pack.md',
  '07_poc_acceptance_report.md',
] as const;

const ACCEPTANCE = [
  ['Complete input', 'Every SKU has enough product context, target platform, brand rule, and review owner.'],
  ['Reusable output', 'Each delivery includes copy, image direction, compliance, FAQ, benchmark, and report artifacts.'],
  ['Clear boundary', 'Every risky claim is marked as draft-only, review-only, or customer-ready.'],
  ['Commercial decision', 'The report recommends contract, expansion, repair sprint, or stop.'],
] as const;

const NOT_PROMISED = [
  'No one-click final publishing without human review.',
  'No replacement for legal, trademark, platform, or medical claims approval.',
  'No fake customer quotes, fake screenshots, or invented growth proof.',
  'No payment collection inside this subsite unless the owner enables checkout on the main site.',
] as const;

const SYSTEM_LAYERS = [
  ['Launch Pack', 'SKU intake, image direction, listing copy, compliance redlines, FAQ.'],
  ['Brand IQ', 'Brand voice, forbidden words, category thresholds, proof requirements.'],
  ['Growth Test Pack', 'TikTok / Instagram benchmark, hook matrix, slideshow and reel brief.'],
  ['POC Report', 'Acceptance score, blockers, buyer follow-up, executive recap.'],
  ['CRM Motion', 'Inquiry state, contract stage, quote status, payment status, SLA.'],
] as const;

export default function PocPage() {
  return (
    <div className="min-h-screen bg-bg-root text-text-primary">
      <TopNav />
      <main>
        <Section spacing="loose">
          <Container>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div>
                <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                  10 SKU POC
                </div>
                <h1 className="max-w-4xl font-[family-name:var(--font-outfit)] text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
                  AI commercial delivery system for ecommerce teams.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
                  wenai is not a copywriting toy. It turns SKU context, category rules, brand redlines,
                  content marketing, POC reports, and contract motion into one customer-ready operating line.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/inquire?from=poc-hero" size="lg">
                    Submit POC request
                  </PrimaryButton>
                  <SecondaryButton href={POC_STANDARD_PACK_ROUTE} size="lg">
                    Generate standard pack
                  </SecondaryButton>
                  <SecondaryButton href="/poc/report" size="lg">
                    Open report workspace
                  </SecondaryButton>
                </div>
              </div>
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-5">
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  What a good POC proves
                </div>
                <div className="space-y-3">
                  {ACCEPTANCE.map(([title, body]) => (
                    <div key={title} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {STEPS.map(([num, title, body]) => (
                <div key={num} className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                  <div className="mb-3 text-[10px] font-mono text-accent">{num}</div>
                  <h2 className="mb-2 text-[15px] font-bold text-text-primary">{title}</h2>
                  <p className="text-[12px] leading-relaxed text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <FiveMinutePocOnboarding />
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <PocLaunchChecklist />
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Operating system
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  The moat is the delivery line, not one generated paragraph.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                  Competitors can generate text. wenai packages ecommerce work into repeatable acceptance,
                  benchmark, risk, and commercial-motion artifacts.
                </p>
              </div>
              <SecondaryButton href="/pipelines/marketing-campaign">
                Open marketing pack
              </SecondaryButton>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              {SYSTEM_LAYERS.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-border-subtle bg-bg-surface/45 p-4">
                  <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-accent">{title}</div>
                  <p className="text-[12px] leading-relaxed text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Evidence layer
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  Anonymous POC examples from input to contract decision.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                  These examples do not promise ROI. They show how wenai structures messy ecommerce work into a
                  standard pack, review boundary, and next commercial action.
                </p>
              </div>
              <SecondaryButton href="/cases">
                View case library
              </SecondaryButton>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {POC_EVIDENCE_CASES.map(item => (
                <article key={item.slug} className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface/45">
                  <div className="border-b border-border-subtle p-5">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">{item.segment}</div>
                    <h3 className="text-[18px] font-semibold text-text-primary">{item.title}</h3>
                    <p className="mt-2 text-[11px] leading-relaxed text-text-tertiary">{item.disclaimer}</p>
                  </div>
                  <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Input</div>
                      <ul className="space-y-2">
                        {Object.values(item.input).map(line => (
                          <li key={line} className="text-[12px] leading-relaxed text-text-secondary">{line}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Readiness</div>
                      <p className="text-[12px] leading-relaxed text-text-primary">{item.standardPack.readiness}</p>
                      <p className="mt-2 text-[12px] leading-relaxed text-accent">{item.standardPack.decision}</p>
                    </div>
                  </div>
                  <div className="border-t border-border-subtle p-4">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">Review result</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <Metric label="Acceptance" value={item.review.acceptanceScore} />
                      <Metric label="Decision" value={item.review.decision} />
                      <Metric label="Next step" value={item.review.nextStep} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  Standard deliverables
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-text-secondary">
                  Every POC output should be reviewable by operations, owner, and outside collaborators.
                </p>
                <div className="overflow-hidden rounded-lg border border-border-subtle">
                  {DELIVERABLES.map(item => (
                    <div key={item} className="flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface/45 px-4 py-3 last:border-b-0">
                      <span className="text-[13px] font-mono text-text-primary">{item}</span>
                      <span className="text-[10px] font-mono text-accent">POC</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-4 font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  Boundaries
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-text-secondary">
                  A serious commercial product needs clear limits. wenai makes draft, review, and final responsibility explicit.
                </p>
                <div className="space-y-3">
                  {NOT_PROMISED.map(item => (
                    <div key={item} className="rounded-md border border-error/25 bg-error/5 p-3 text-[13px] leading-relaxed text-text-primary">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="flex flex-col gap-5 rounded-lg border border-accent/35 bg-accent/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  Next step
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary">
                  Prepare 10 SKUs and run a real POC.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  Not ready yet? Start with a <Link href="/demo" className="text-accent underline">demo SKU</Link>.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton href="/inquire?from=poc-final" size="lg">
                  Submit POC request
                </PrimaryButton>
                <SecondaryButton href={POC_STANDARD_PACK_ROUTE} size="lg">
                  Generate POC pack
                </SecondaryButton>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
      <div className="mb-1 text-[9px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="text-[12px] leading-relaxed text-text-primary">{value}</div>
    </div>
  );
}
