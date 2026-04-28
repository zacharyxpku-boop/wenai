import { COPY, PLACEHOLDER } from '@/i18n/zh';
import { Container, Section } from './Container';

/**
 * 真人摄影 vs wenai 生成 对比 section
 * 三组占位卡片 + 引言 · 客户授权图待业主上传
 */
export function BeforeAfter() {
  return (
    <Section>
      <Container>
        <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-text-primary text-center mb-12">
          {COPY.beforeAfter.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLACEHOLDER.beforeAfter.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {/* 真人摄影 */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  真人摄影
                </span>
                <div className="aspect-[4/5] bg-bg-surface border border-border-subtle rounded-md flex items-center justify-center px-4 text-center">
                  <span className="text-xs text-text-tertiary leading-relaxed">
                    {item.industry} 占位 · 客户授权图待业主上传
                  </span>
                </div>
                <p className="text-xs text-text-tertiary font-mono tabular-nums">
                  {item.traditionalCost} · {item.traditionalDays}
                </p>
              </div>

              {/* wenai 生成 */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-accent uppercase tracking-wide">
                  wenai 生成
                </span>
                <div className="aspect-[4/5] bg-accent/5 border border-accent/20 rounded-md flex items-center justify-center px-4 text-center">
                  <span className="text-xs text-text-tertiary leading-relaxed">
                    {item.industry} 占位 · 客户授权图待业主上传
                  </span>
                </div>
                <p className="text-xs text-text-tertiary font-mono tabular-nums">
                  {item.wenaiCost} · {item.wenaiDays}
                </p>
              </div>

              {/* 引言 */}
              <div className="border-l-4 border-accent pl-3 mt-2">
                <p className="text-sm text-text-primary leading-relaxed">
                  「{item.quote}」
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  —— {item.attribution}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-text-tertiary mt-10">
          {COPY.beforeAfter.note}
          {' · '}
          <a
            href={COPY.beforeAfter.moreLink.href}
            className="text-accent hover:text-accent-hover transition-colors"
          >
            {COPY.beforeAfter.moreLink.label}
          </a>
        </p>
      </Container>
    </Section>
  );
}
