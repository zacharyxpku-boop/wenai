import { Container, PrimaryButton, Section, SecondaryButton } from './Container';

const PACKS = [
  {
    title: 'TikTok / INS Benchmark',
    tag: '研究',
    body: '拆解参考视频和图文的受众、场景、Hook、节奏、CTA 与素材需求，变成 SKU 可用的证据库。',
  },
  {
    title: 'Hook Matrix',
    tag: '创意',
    body: '围绕痛点、场景、对比、价格、风险和人群切出多组开头角度，给投放和自然流量同时使用。',
  },
  {
    title: 'Reel / Slideshow Brief',
    tag: '交付',
    body: '输出拍摄分镜、画面顺序、字幕、口播和复盘指标，不把内容营销停在灵感阶段。',
  },
];

export function MarketingGrowthLayer() {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="space-y-5">
            <div className="text-[11px] font-mono text-text-tertiary">营销资产闭环</div>
            <h2 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-semibold leading-tight text-text-primary md:text-4xl">
              上新之后，继续把 SKU 推进到内容营销和复盘。
            </h2>
            <p className="text-pretty text-[15px] leading-7 text-text-secondary">
              参考 PostPlus 这类内容工作流产品，wenai 不把营销做成泛内容生成器，而是让 TikTok、Instagram、Reels
              和 slideshow brief 都继承 SKU、品牌禁区和类目规则。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/pipelines/marketing-campaign">生成市场宣传包</PrimaryButton>
              <SecondaryButton href="/pipelines/video-teardown">拆一个参考视频</SecondaryButton>
            </div>
          </div>

          <div className="grid gap-3">
            {PACKS.map((pack, index) => (
              <a
                key={pack.title}
                href="/pipelines/marketing-campaign"
                className="group grid gap-4 rounded-md border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-accent/45 md:grid-cols-[80px_1fr]"
              >
                <div>
                  <div className="font-mono text-[11px] text-text-tertiary">0{index + 1}</div>
                  <div className="mt-2 inline-flex rounded-full border border-accent/35 px-2 py-1 text-[11px] font-mono text-accent">
                    {pack.tag}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-medium text-text-primary group-hover:text-accent">{pack.title}</div>
                  <p className="mt-2 text-[14px] leading-6 text-text-secondary">{pack.body}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
