'use client';

import { useState } from 'react';
import { COPY } from '@/i18n/zh';
import { Container, Section } from './Container';

/**
 * FAQ 折叠面板 · client component
 */
export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <Section>
      <Container className="max-w-[800px]">
        <div id="faq" className="scroll-mt-20" />

        <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-text-primary text-center mb-10">
          {COPY.faq.title}
        </h2>

        <ul className="flex flex-col">
          {COPY.faq.items.map((item, i) => {
            const isOpen = openIdx === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-trigger-${i}`;
            return (
              <li key={i} className="border-b border-border-subtle">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left text-text-primary hover:text-accent transition-colors"
                >
                  <span className="text-base font-medium leading-relaxed">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-xl text-accent shrink-0 w-6 text-center"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="pb-5 pr-10 text-sm text-text-secondary leading-relaxed"
                  >
                    {item.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
