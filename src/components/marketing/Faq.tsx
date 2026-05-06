'use client';

import { useState } from 'react';
import { Container, Section } from './Container';

const FAQS = [
  {
    q: 'wenai 和普通文案生成工具有什么区别？',
    a: 'wenai 的核心不是生成一段文案，而是把 SKU、类目规则、品牌禁区、内容营销、POC 报告和 CRM 推进组织成一条交付线。',
  },
  {
    q: '现在没有真实客户数据，能不能先商业化演示？',
    a: '可以。当前版本用规则、样例、模板和验收阈值先把产品形态做出来；真实数据接入后会增强评分和复盘，而不是改变产品主线。',
  },
  {
    q: '支付和合同在哪里处理？',
    a: '按你的设定，支付和合同由独立站点或主平台处理。wenai 子站负责完成 POC、自助理解、验收报告和商机推进。',
  },
  {
    q: '为什么要做 Brand IQ？',
    a: '电商团队最怕每次输出都重新解释品牌口吻、禁用词、竞品边界和平台风险。Brand IQ 把这些沉淀成可复用规则，是比单次生成更硬的壁垒。',
  },
];

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <Section>
      <Container className="max-w-[840px]">
        <div className="mb-8 space-y-3 text-center">
          <div className="text-[11px] font-mono text-text-tertiary">FAQ</div>
          <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
            客户会问的问题，页面先替你回答。
          </h2>
        </div>

        <ul className="rounded-md border border-border-subtle bg-bg-surface">
          {FAQS.map((item, index) => {
            const isOpen = openIdx === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;
            return (
              <li key={item.q} className="border-b border-border-subtle last:border-b-0">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-text-primary transition-colors hover:text-accent"
                >
                  <span className="text-base font-medium leading-7">{item.q}</span>
                  <span aria-hidden className="w-6 shrink-0 text-center font-mono text-xl text-accent">
                    {isOpen ? '-' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-5 pr-10 text-[14px] leading-7 text-text-secondary"
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
