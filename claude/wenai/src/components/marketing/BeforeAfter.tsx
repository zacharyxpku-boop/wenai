import { COPY, PLACEHOLDER } from '@/i18n/zh';
import { Container, Section } from './Container';

export function BeforeAfter() {
  return (
    <Section>
      <Container>
        <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
          {COPY.beforeAfter.title}
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLACEHOLDER.beforeAfter.map((item, index) => {
            const slug = ['home', 'auto', 'digital'][index];
            return (
              <div key={item.industry} className="flex flex-col gap-4">
                <ImageBlock
                  label="Manual shoot"
                  src={`/seed/before-${slug}.jpg`}
                  alt={`${item.industry} manual shoot`}
                  fallback={`${item.industry} manual shoot`}
                />
                <p className="font-mono text-xs text-text-tertiary tabular-nums">
                  {item.traditionalCost} / {item.traditionalDays}
                </p>

                <ImageBlock
                  label="wenai 方向"
                  src={`/seed/after-${slug}.jpg`}
                  alt={`${item.industry} wenai 方向`}
                  fallback={`${item.industry} 内容方向`}
                  accent
                />
                <p className="font-mono text-xs text-text-tertiary tabular-nums">
                  {item.wenaiCost} / {item.wenaiDays}
                </p>

                <div className="mt-2 border-l-4 border-accent pl-3">
                  <p className="text-sm leading-relaxed text-text-primary">&quot;{item.quote}&quot;</p>
                  <p className="mt-1 text-xs text-text-tertiary">- {item.attribution}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-text-tertiary">
          {COPY.beforeAfter.note}{' '}
          <a href={COPY.beforeAfter.moreLink.href} className="text-accent transition-colors hover:text-accent-hover">
            {COPY.beforeAfter.moreLink.label}
          </a>
        </p>
      </Container>
    </Section>
  );
}

function ImageBlock({
  label,
  src,
  alt,
  fallback,
  accent = false,
}: {
  label: string;
  src: string;
  alt: string;
  fallback: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className={`text-xs font-medium uppercase ${accent ? 'text-accent' : 'text-text-tertiary'}`}>
        {label}
      </span>
      <div className={`relative aspect-[4/5] overflow-hidden rounded-md border ${accent ? 'border-accent/20 bg-accent/5' : 'border-border-subtle bg-bg-surface'}`}>
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs leading-relaxed text-text-tertiary">
          {fallback}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
      </div>
    </div>
  );
}
