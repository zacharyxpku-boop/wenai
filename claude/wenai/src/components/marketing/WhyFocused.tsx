import { Container, PrimaryButton, Section, SecondaryButton } from './Container';

const CONTRAST = [
  ['不做大而全平台', '不把生图、社媒、客服、达人、数据全塞进一个空壳，让客户不知道先买什么。'],
  ['只跑能验收的 SKU 试跑', '围绕 10 个真实 SKU，交付能被运营、老板和采购一起复核的标准包。'],
  ['先验收，再接入主站商业流', '用缺口、风险、通过率和下一步动作判断是否进入正式合同、付款和长期合作。'],
] as const;

const MOATS = [
  'SKU 级输入、输出、风险和返工原因持续沉淀',
  '类目标准流程和平台终审边界不断积累',
  '试跑状态流连接线索、交付、复盘和合同推进',
  '老板版验收报告把系统输出变成采购决策材料',
] as const;

export function WhyFocused() {
  return (
    <Section className="border-y border-border-subtle bg-bg-surface/20" spacing="tight">
      <Container>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
              为什么不是另一个工具壳子
            </div>
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              wenai 不做大而全，只做能成交的 SKU 试跑。
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              市面上很多产品喜欢先堆功能，再慢慢解释价值。wenai 反过来做：先把 10 个真实 SKU
              的交付线跑通，让客户能验收、能复盘、能判断要不要继续签更大的合作。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/poc">看试跑路径</PrimaryButton>
              <SecondaryButton href="/poc/report">看验收报告模板</SecondaryButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {CONTRAST.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-border-subtle bg-bg-root/50 p-4">
                  <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                真正要打的壁垒
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {MOATS.map((item) => (
                  <div key={item} className="flex gap-2 text-[12px] leading-relaxed text-text-primary">
                    <span className="text-accent">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
