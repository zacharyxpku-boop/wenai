import Image from 'next/image';
import { Container, PrimaryButton, SecondaryButton, Section } from '@/components/marketing/Container';

const STEPS = [
  { title: '填商品资料', body: '名称、类目、卖点、图片、目标平台' },
  { title: '生成交付包', body: '上新文案、图片方向、合规提示、营销脚本' },
  { title: '拿到复盘建议', body: '老板版报告、风险清单、下一步跟进动作' },
];

const OUTPUTS = ['商品上新文案', '主图拍摄方向', '禁用词提醒', '短视频脚本', '客户问答', 'POC 复盘报告'];

export function Hero() {
  return (
    <Section spacing="loose" className="border-b border-border-subtle">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-border-default bg-bg-surface px-3 py-1.5 text-[12px] text-text-secondary">
              给跨境电商团队用的上新与营销交付台
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance font-[family-name:var(--font-outfit)] text-4xl font-semibold leading-[1.08] text-text-primary sm:text-5xl lg:text-[4rem]">
                把商品资料丢进来，直接拿到能交付客户的上新包。
              </h1>
              <p className="max-w-2xl text-pretty text-[16px] leading-8 text-text-secondary">
                wenai 帮电商团队把零散 SKU、图片、卖点和平台要求整理成一套可复核的交付物：
                上新文案、主图方向、合规提醒、短视频脚本、客户问答和复盘报告。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/poc" size="lg">
                先试 10 个商品
              </PrimaryButton>
              <SecondaryButton href="/cases" size="lg">
                看交付样例
              </SecondaryButton>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="rounded-md border border-border-subtle bg-bg-surface px-4 py-4">
                  <div className="mb-3 flex size-7 items-center justify-center rounded-full border border-accent/40 font-mono text-[12px] text-accent">
                    {index + 1}
                  </div>
                  <div className="text-[15px] font-medium text-text-primary">{step.title}</div>
                  <div className="mt-2 text-[13px] leading-6 text-text-secondary">{step.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border-default bg-bg-surface">
            <div className="border-b border-border-subtle px-5 py-4">
              <div className="text-[12px] text-text-tertiary">演示输出</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">10 个商品试点包</div>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                {OUTPUTS.map((item) => (
                  <div key={item} className="rounded-md border border-border-subtle bg-bg-root px-3 py-3 text-[13px] text-text-primary">
                    {item}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_190px]">
                <div className="rounded-md border border-border-subtle bg-bg-root p-4">
                  <div className="text-[12px] text-text-tertiary">客户能看懂的结果</div>
                  <div className="mt-3 space-y-3 text-[14px] leading-6 text-text-secondary">
                    <p>哪些商品资料足够完整，哪些还缺图片、卖点或平台信息。</p>
                    <p>哪些文案可以直接复核，哪些涉及功效、商标或平台风险。</p>
                    <p>下一步应该继续合作、补资料，还是先做一轮小范围测试。</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-md border border-border-subtle bg-bg-root">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/seed/pipeline-hero-collage.jpg"
                      alt="电商商品内容交付样例"
                      fill
                      className="object-cover"
                      sizes="190px"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-accent/35 bg-accent/10 px-4 py-3 text-[13px] leading-6 text-text-primary">
                目标很简单：让客户 5 分钟知道怎么试，试完知道值不值得继续买。
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
