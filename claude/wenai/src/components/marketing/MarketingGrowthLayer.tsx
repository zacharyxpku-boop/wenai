import { Container, Section, PrimaryButton, SecondaryButton } from './Container';

const PACKS = [
  {
    title: '内容拆解包',
    tag: '参考拆解',
    body: '把 TikTok、Instagram、Amazon 和独立站参考链接拆成受众、场景、开场句、时间线、行动口径和素材清单。',
  },
  {
    title: 'UGC 创意包',
    tag: '创意',
    body: '按 SKU 卖点生成口播 UGC、街采 UGC、轮播图、短视频脚本和拍摄分镜。',
  },
  {
    title: '增长测试包',
    tag: '测试',
    body: '把素材拆成 7 天测试节奏，记录平台、版本、投放假设、人工复盘指标和下一轮 SKU 判断。',
  },
] as const;

export function MarketingGrowthLayer() {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 items-start">
          <div>
            <div className="text-[11px] font-mono text-accent uppercase tracking-[0.18em] mb-3">
              内容营销层
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-[family-name:var(--font-outfit)] leading-tight mb-4">
              上新之后，还要能拿去做市场宣传
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed mb-5">
              wenai 的主线仍然是电商 SKU。内容营销、UGC、街采和自然语言定制流程，
              都应该收进同一个试跑里：先上新，再拆内容，再做小批量素材测试。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <PrimaryButton href="/factory">
                导入 CSV 生成决策
              </PrimaryButton>
              <SecondaryButton href="/poc/report">
                查看报告模板
              </SecondaryButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-3">
            {PACKS.map((pack, index) => (
              <a
                key={pack.title}
                href="/factory"
                className="group border border-border-subtle bg-bg-surface/45 rounded-lg p-4 hover:border-accent/45 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] font-mono text-text-tertiary tabular-nums">
                    0{index + 1}
                  </span>
                  <span className="text-[9px] font-mono text-accent border border-accent/35 rounded px-1.5 py-0.5">
                    {pack.tag}
                  </span>
                </div>
                <div className="text-[15px] font-semibold text-text-primary mb-1 group-hover:text-accent">
                  {pack.title}
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  {pack.body}
                </p>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
