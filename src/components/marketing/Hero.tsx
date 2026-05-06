import Image from 'next/image';
import { Container, PrimaryButton, SecondaryButton, Section } from '@/components/marketing/Container';

const STATS = [
  { value: '10 SKU', label: '单次 POC 标准交付范围' },
  { value: '4 层规则', label: '类目、品牌、内容、合同推进' },
  { value: '1 条线', label: '从输入到验收再到商机流转' },
];

const TRACKS = [
  { label: 'POC 启动', detail: '选类目、填 SKU、生成标准包、提交试点' },
  { label: 'Brand IQ', detail: '品牌知识库、禁用词、语气规则、类目阈值' },
  { label: '内容营销', detail: 'Benchmark、Hook Matrix、Reel Brief、复盘报告' },
  { label: 'CRM 推进', detail: '询盘状态、SLA、下一步动作、合同判断' },
];

const OPERATIONS = [
  { name: '上新标准包', state: '已就绪', tone: 'text-accent border-accent/40 bg-accent/10' },
  { name: '品牌规则校验', state: '进行中', tone: 'text-[#8fb6d8] border-[#8fb6d8]/40 bg-[#8fb6d8]/10' },
  { name: '营销 Brief', state: '待复核', tone: 'text-[#9fb38a] border-[#9fb38a]/40 bg-[#9fb38a]/10' },
];

export function Hero() {
  return (
    <Section spacing="loose" className="border-b border-border-subtle">
      <Container className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface px-3 py-1.5 text-[11px] font-mono text-text-secondary">
              <span className="size-2 rounded-full bg-accent" aria-hidden />
              电商 AI 商业交付系统
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance font-[family-name:var(--font-outfit)] text-4xl font-semibold leading-[1.02] text-text-primary sm:text-5xl lg:text-[4.4rem]">
                从 SKU 输入，到 POC 报告，再到合同推进。
              </h1>
              <p className="max-w-2xl text-pretty text-[15px] leading-7 text-text-secondary sm:text-[17px]">
                wenai 不是再给团队多一个 AI 小工具，而是把上新、品牌规则、内容营销、老板版验收和 CRM
                推进压成一条可执行、可复盘、可销售的交付线。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/poc" size="lg">
                运行 5 分钟 POC
              </PrimaryButton>
              <SecondaryButton href="/pricing" size="lg">
                查看商业路径
              </SecondaryButton>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-md border border-border-subtle bg-bg-surface px-4 py-4">
                  <div className="font-mono text-2xl font-semibold tabular-nums text-text-primary">{stat.value}</div>
                  <div className="mt-2 text-sm leading-6 text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border-default bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <div>
                <div className="text-[11px] font-mono text-text-tertiary">交付控制台</div>
                <div className="mt-1 text-lg font-semibold text-text-primary">10 SKU Launch Pack</div>
              </div>
              <div className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-mono text-accent">
                可演示
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3">
                {OPERATIONS.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-root px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-text-primary">{item.name}</div>
                      <div className="mt-1 text-[12px] text-text-tertiary">按工作区规则进入交付链路</div>
                    </div>
                    <div className={`rounded-full border px-2.5 py-1 text-[11px] font-mono ${item.tone}`}>
                      {item.state}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_184px]">
                <div className="rounded-md border border-border-subtle bg-bg-root px-4 py-4">
                  <div className="mb-3 text-[11px] font-mono text-text-tertiary">系统分层</div>
                  <div className="space-y-3">
                    {TRACKS.map((track, index) => (
                      <div key={track.label} className="grid grid-cols-[24px_1fr] gap-3">
                        <div className="flex size-6 items-center justify-center rounded-full border border-border-default font-mono text-[11px] text-accent">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{track.label}</div>
                          <div className="mt-1 text-[12px] leading-5 text-text-secondary">{track.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border-subtle bg-bg-root">
                  <div className="border-b border-border-subtle px-4 py-3 text-[11px] font-mono text-text-tertiary">
                    首页展示素材
                  </div>
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/seed/pipeline-hero-collage.jpg"
                      alt="wenai 电商交付场景拼图"
                      fill
                      className="object-cover"
                      sizes="184px"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border-subtle bg-bg-root px-4 py-3 text-[13px] leading-6 text-text-secondary">
                输出不是一段文案，而是标准包、验收结果、老板版报告，以及下一步商机动作。
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
