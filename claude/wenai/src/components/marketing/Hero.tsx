import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';

const DELIVERY_ITEMS = [
  '选类目, 贴 SKU, 自动整理资料缺口',
  '生成上新包: 卖点、详情页、合规风险、客服话术',
  '生成营销包: 开场句、短视频脚本、素材清单',
  '生成老板版报告: 是否扩 SKU、补资料、推合同',
];

const STATS = [
  { value: '5 分钟', label: '跑通第一条试跑路径' },
  { value: '10 SKU', label: '一批试跑的标准范围' },
  { value: '4 份', label: '标准包、营销包、报告、跟进动作' },
];

export function Hero() {
  return (
    <Section spacing="loose" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/50" />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-5 md:gap-12">
          <div className="flex min-w-0 flex-col gap-7 md:col-span-3">
            <div className="text-[11px] font-mono text-accent">
              给电商团队的商业交付系统
            </div>
            <h1 className="max-w-[16ch] text-balance text-[2rem] font-bold leading-[1.12] text-text-primary sm:max-w-[18ch] sm:text-5xl md:text-6xl font-[family-name:var(--font-outfit)]">
              不用学工具, 直接把一批 SKU 跑成交付包。
            </h1>
            <p className="max-w-2xl text-pretty text-[15px] leading-relaxed text-text-secondary md:text-lg">
              Wenai 把 SKU、类目规则、品牌禁区、内容营销、验收报告和商务推进放到同一条线里。
              客户打开后先跑 10 个 SKU, 看清楚能交付什么、哪里有风险、下一步值不值得合作。
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              {STATS.map(stat => (
                <div key={stat.value} className="border-l border-border-subtle pl-4">
                  <div className="font-mono text-2xl font-bold leading-none text-accent md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[12px] leading-snug text-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 pt-3 sm:w-auto sm:flex-row">
              <PrimaryButton href="/dashboard" size="lg" className="w-full sm:w-auto">
                免费开始第一轮实验
              </PrimaryButton>
              <SecondaryButton href="/pricing" size="lg" className="w-full sm:w-auto">
                查看定价
              </SecondaryButton>
            </div>
          </div>

          <div className="min-w-0 md:col-span-2">
            <div className="w-full rounded-md border border-border-default bg-bg-surface p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">
                    交付包
                  </div>
                  <div className="mt-1 text-lg font-semibold text-text-primary">
                    客户能拿走什么
                  </div>
                </div>
                <div className="shrink-0 rounded-md border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-mono text-accent">
                  可演示
                </div>
              </div>

              <div className="space-y-3">
                {DELIVERY_ITEMS.map((item, index) => (
                  <div
                    key={item}
                    className="flex min-w-0 gap-3 rounded-md border border-border-subtle bg-bg-root/35 p-3"
                  >
                    <div className="shrink-0 font-mono text-[11px] text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 break-words text-[13px] leading-relaxed text-text-primary">
                      {item}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/45 p-3 text-[12px] leading-relaxed text-text-secondary">
                第一眼只回答一个问题: 这批 SKU 能不能交付、哪里需要人工复核、下一步该不该进入正式合作。
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
