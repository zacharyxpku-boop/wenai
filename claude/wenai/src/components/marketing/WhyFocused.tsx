import { Container, PrimaryButton, Section, SecondaryButton } from './Container';

const CONTRAST = [
  ['不做大而全 AI 平台', '不把生图、社媒、客服、达人建联并排售卖, 避免客户不知道先买什么。'],
  ['只跑 SKU 上新 POC', '围绕 10 个真实 SKU, 交付能被运营和负责人复核的物料包。'],
  ['先验收再接入', '用缺参、风险、终审通过率和复评动作判断是否进入主站合同/支付。'],
] as const;

const MOATS = [
  'SKU 级输入、输出、风险、返工原因沉淀',
  '类目 SOP 和平台终审边界持续积累',
  'POC 状态流连接线索、交付、复盘、合同',
  '老板版验收报告把 AI 输出变成采购决策材料',
] as const;

export function WhyFocused() {
  return (
    <Section className="border-y border-border-subtle bg-bg-surface/20" spacing="tight">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-[0.22em] mb-3">
              Why Not Another AI OS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-[family-name:var(--font-outfit)] leading-tight">
              wenai 不做大而全, 只做能成交的 SKU POC
            </h2>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed">
              市面上的 AI 工作台容易把功能铺满: 生图、发社媒、客服、找达人。
              wenai 反过来做: 先把 10 个 SKU 的上新交付跑通, 让客户能验收、能复盘、能决定是否接入。
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <PrimaryButton href="/poc">看 POC 说明</PrimaryButton>
              <SecondaryButton href="/poc/report">看验收报告模板</SecondaryButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CONTRAST.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-border-subtle bg-bg-root/50 p-4">
                  <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                  <p className="mt-2 text-[12px] text-text-secondary leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">
                真正要打的壁垒
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {MOATS.map((item) => (
                  <div key={item} className="text-[12px] text-text-primary leading-relaxed flex gap-2">
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
