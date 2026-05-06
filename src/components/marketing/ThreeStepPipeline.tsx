import { COPY } from '@/i18n/zh';
import { Container, Section } from '@/components/marketing/Container';

export function ThreeStepPipeline() {
  const { pipeline3 } = COPY;

  return (
    <Section>
      <Container>
        <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:mb-16 md:text-4xl font-[family-name:var(--font-outfit)]">
          {pipeline3.title}
        </h2>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
          {pipeline3.steps.map((step, index) => (
            <div key={step.step} className="relative">
              <a
                href={step.link.href}
                className="group block h-full rounded-md border border-border-default bg-bg-surface p-6 transition-colors hover:border-accent"
              >
                <div className="mb-4 text-5xl font-bold leading-none text-accent font-[family-name:var(--font-outfit)]">
                  {step.step}
                </div>
                <h3 className="mb-4 text-xl font-bold text-text-primary">{step.title}</h3>
                <div className="mb-5 flex flex-col gap-1.5 font-mono text-sm">
                  <Row label="Input" value={step.input} />
                  <Row label="Output" value={step.output} />
                  <Row label="Timing" value={step.time} />
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-accent transition-colors group-hover:text-accent-hover">
                  {step.link.label} <span aria-hidden>-&gt;</span>
                </span>
              </a>

              {index < pipeline3.steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute top-1/2 right-0 z-10 hidden size-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-border-default bg-bg-root text-accent md:flex"
                >
                  -&gt;
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-text-tertiary">{pipeline3.note}</p>
      </Container>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-text-tertiary">{label}:</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}
