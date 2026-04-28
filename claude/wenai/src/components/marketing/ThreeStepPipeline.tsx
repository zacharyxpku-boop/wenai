import { COPY } from '@/i18n/zh';
import { Container, Section } from '@/components/marketing/Container';

/**
 * ThreeStepPipeline · 从 SKU 到上架, 3 步搞定
 *
 * 3 张卡 + 卡间横向连接箭头 (md+)
 */
export function ThreeStepPipeline() {
  const { pipeline3 } = COPY;

  return (
    <Section>
      <Container>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12 md:mb-16 font-[family-name:var(--font-outfit)]">
          {pipeline3.title}
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
          {pipeline3.steps.map((s, i) => (
            <div key={s.step} className="relative">
              <a
                href={s.link.href}
                className="group block h-full rounded-lg border border-border-default bg-bg-surface p-6 hover:border-accent hover:-translate-y-1 transition-all duration-200"
              >
                {/* 大数字 */}
                <div className="text-5xl text-accent font-bold leading-none mb-4 font-[family-name:var(--font-outfit)]">
                  {s.step}
                </div>

                {/* title */}
                <h3 className="text-xl font-bold text-text-primary mb-4">
                  {s.title}
                </h3>

                {/* 三行 mono */}
                <div className="flex flex-col gap-1.5 mb-5 font-mono text-sm">
                  <div className="flex gap-2">
                    <span className="text-text-tertiary shrink-0">输入:</span>
                    <span className="text-text-primary">{s.input}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-tertiary shrink-0">输出:</span>
                    <span className="text-text-primary">{s.output}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-tertiary shrink-0">时长:</span>
                    <span className="text-text-primary tabular-nums">{s.time}</span>
                  </div>
                </div>

                {/* 链接 */}
                <span className="inline-flex items-center gap-1 text-sm text-accent group-hover:gap-2 transition-all">
                  {s.link.label} <span aria-hidden>→</span>
                </span>
              </a>

              {/* 卡间连接箭头 (md+, 不是最后一张) */}
              {i < pipeline3.steps.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 translate-x-1/2 z-10 items-center justify-center w-7 h-7 rounded-full bg-bg-root border border-border-default text-accent"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6h8m0 0L6 2m4 4L6 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-text-tertiary mt-10">
          {pipeline3.note}
        </p>
      </Container>
    </Section>
  );
}
