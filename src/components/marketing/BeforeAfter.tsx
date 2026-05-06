import Image from 'next/image';
import { Container, Section } from './Container';

const CASES = [
  {
    title: '家居收纳',
    before: '/seed/before-home.jpg',
    after: '/seed/after-home.jpg',
    metric: '从零散卖点到上新标准包',
    quote: '先把 SKU 资料变成可复核的交付包，再决定是否扩大投放。',
  },
  {
    title: '汽配安装',
    before: '/seed/before-auto.jpg',
    after: '/seed/after-auto.jpg',
    metric: '从规格表到适配风险提示',
    quote: '安装场景、适配边界和客服口径必须和文案一起交付。',
  },
  {
    title: '数码配件',
    before: '/seed/before-digital.jpg',
    after: '/seed/after-digital.jpg',
    metric: '从卖点草稿到可测试内容角度',
    quote: '标题、翻译、卖点和内容 brief 共用同一套 SKU 上下文。',
  },
];

export function BeforeAfter() {
  return (
    <Section>
      <Container className="space-y-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <div className="text-[11px] font-mono text-text-tertiary">交付样例</div>
          <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold text-text-primary md:text-4xl">
            页面不夸大真实业绩，只展示可交付的产品形态。
          </h2>
          <p className="text-pretty text-[15px] leading-7 text-text-secondary">
            这些是演示样例，用来说明 POC 的交付边界。真实客户授权后，可以替换成正式案例和数据。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CASES.map((item) => (
            <div key={item.title} className="rounded-md border border-border-subtle bg-bg-surface p-4">
              <div className="grid grid-cols-2 gap-3">
                <ImageBlock src={item.before} alt={`${item.title} 原始素材`} label="原始素材" />
                <ImageBlock src={item.after} alt={`${item.title} 交付方向`} label="交付方向" />
              </div>
              <div className="mt-5 text-lg font-medium text-text-primary">{item.title}</div>
              <div className="mt-1 font-mono text-[12px] text-accent">{item.metric}</div>
              <p className="mt-3 text-[14px] leading-6 text-text-secondary">{item.quote}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ImageBlock({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border-subtle bg-bg-root">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 180px" className="object-cover" />
      </div>
      <div className="mt-2 text-[11px] font-mono text-text-tertiary">{label}</div>
    </div>
  );
}
