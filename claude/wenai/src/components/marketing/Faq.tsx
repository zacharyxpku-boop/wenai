'use client';

import { useState } from 'react';
import { COPY } from '@/i18n/zh';
import { Container, Section } from './Container';

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <Section>
      <Container className="max-w-[800px]">
        <div id="faq" className="scroll-mt-20" />

        <h2 className="mb-10 text-center text-3xl font-bold text-text-primary md:text-4xl font-[family-name:var(--font-outfit)]">
          {COPY.faq.title}
        </h2>

        <ul className="flex flex-col">
          {COPY.faq.items.map((item, index) => {
            const isOpen = openIdx === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;
            return (
              <li key={item.q} className="border-b border-border-subtle">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-text-primary transition-colors hover:text-accent"
                >
                  <span className="text-base font-medium leading-relaxed">{item.q}</span>
                  <span aria-hidden className="w-6 shrink-0 text-center font-mono text-xl text-accent">
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="pb-5 pr-10 text-sm leading-relaxed text-text-secondary"
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
