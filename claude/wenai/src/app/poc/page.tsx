import type { Metadata } from 'next';
import Link from 'next/link';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Container, Section, PrimaryButton, SecondaryButton } from '@/components/marketing/Container';
import FiveMinutePocOnboarding from '@/components/FiveMinutePocOnboarding';
import PocLaunchChecklist from '@/components/PocLaunchChecklist';
import { ListingFactoryPocConfigurator } from '@/components/marketing/ListingFactorySections';
import { POC_EVIDENCE_CASES } from '@/lib/poc-case-studies';
import { POC_STANDARD_PACK_ROUTE } from '@/lib/standard-pack-routing';

export const metadata: Metadata = {
  title: '10 SKU 试跑 | wenai',
  description:
    '给电商团队的 10 SKU 试跑：选类目、填 SKU、出标准包、出报告、提交商务跟进。',
};

const STEPS = [
  ['01', '准备 10 个真实 SKU', '收集商品名、类目、卖点、价格带、目标平台、现有图片和参考链接。'],
  ['02', '生成上新包', '输出图片方向、详情页文案、合规红线、客服 FAQ 和验收清单。'],
  ['03', '套入品牌规则', '写入品牌语气、禁用词、类目阈值、证据要求和复核负责人。'],
  ['04', '生成验收报告', '把交付证据变成验收分、风险、下一步动作和商务推进建议。'],
] as const;

const DELIVERABLES = [
  '01_SKU_intake.md',
  '02_image_direction.md',
  '03_listing_copy.md',
  '04_compliance_redlines.md',
  '05_customer_service_faq.md',
  '06_content_marketing_pack.md',
  '07_poc_acceptance_report.md',
] as const;

const ACCEPTANCE = [
  ['输入完整', '每个 SKU 都有商品背景、目标平台、品牌规则和复核负责人。'],
  ['输出可复用', '交付包包含文案、图片方向、合规、常见问答、参考样例和报告材料。'],
  ['边界清楚', '有风险的宣称会标成草稿、需复核或可交付，不混在一起。'],
  ['能做决策', '报告会建议签约、扩量、补救冲刺或暂缓。'],
] as const;

const NOT_PROMISED = [
  '不会跳过人工复核直接一键发布。',
  '不会替代法律、商标、平台审核或医疗功效审批。',
  '不会伪造客户评价、截图或增长数据。',
  '本子站只承接体验和试跑，付款与合同仍由主站处理。',
] as const;

const SYSTEM_LAYERS = [
  ['上新包', 'SKU 输入、图片方向、详情页文案、合规红线和 FAQ。'],
  ['品牌规则', '品牌语气、禁用词、类目阈值和证据要求。'],
  ['内容测试包', 'TikTok / Instagram 参考样例、开场句矩阵、轮播和短视频脚本。'],
  ['验收报告', '验收分、阻塞项、买方跟进和老板版摘要。'],
  ['商务推进', '询盘状态、合同阶段、报价状态、付款状态和响应时限。'],
] as const;

export default function PocPage() {
  return (
    <div className="min-h-screen bg-bg-root text-text-primary">
      <TopNav />
      <main>
        <ListingFactoryPocConfigurator />
        <Section spacing="loose">
          <Container>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div>
                <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                  10 SKU 试跑
                </div>
                <h1 className="max-w-4xl text-balance font-[family-name:var(--font-outfit)] text-4xl font-bold leading-[1.08] md:text-6xl">
                  让客户 5 分钟看懂：这批 SKU 能不能交付，下一步值不值得签。
                </h1>
                <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary md:text-lg">
                  wenai 不是文案玩具。它把 SKU 资料、类目规则、品牌禁区、内容营销、验收报告和商务跟进压成一条客户能直接使用的交付线。
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/inquire?from=poc-hero" size="lg">
                    提交试跑需求
                  </PrimaryButton>
                  <SecondaryButton href={POC_STANDARD_PACK_ROUTE} size="lg">
                    生成标准包
                  </SecondaryButton>
                  <SecondaryButton href="/poc/report" size="lg">
                    打开报告工作台
                  </SecondaryButton>
                </div>
              </div>
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-5">
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  一次好试跑要证明什么
                </div>
                <div className="space-y-3">
                  {ACCEPTANCE.map(([title, body]) => (
                    <div key={title} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {STEPS.map(([num, title, body]) => (
                <div key={num} className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                  <div className="mb-3 text-[10px] font-mono text-accent">{num}</div>
                  <h2 className="mb-2 text-[15px] font-bold text-text-primary">{title}</h2>
                  <p className="text-[12px] leading-relaxed text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <FiveMinutePocOnboarding />
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <PocLaunchChecklist />
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  系统层
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  壁垒不是生成一段文案，而是让交付可复用、可验收、可推进。
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                  竞品也能生成文本。wenai 要做的是把电商工作打包成验收标准、参考样例、风险边界和商务动作。
                </p>
              </div>
              <SecondaryButton href="/pipelines/marketing-campaign">
                打开内容营销包
              </SecondaryButton>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              {SYSTEM_LAYERS.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-border-subtle bg-bg-surface/45 p-4">
                  <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-accent">{title}</div>
                  <p className="text-[12px] leading-relaxed text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  样例层
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  从输入到商务判断的匿名试跑样例。
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                  这些样例不承诺 ROI，只展示 wenai 如何把混乱的电商资料整理成标准包、复核边界和下一步动作。
                </p>
              </div>
              <SecondaryButton href="/cases">
                查看案例库
              </SecondaryButton>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {POC_EVIDENCE_CASES.map(item => (
                <article key={item.slug} className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface/45">
                  <div className="border-b border-border-subtle p-5">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">{item.segment}</div>
                    <h3 className="text-[18px] font-semibold text-text-primary">{item.title}</h3>
                    <p className="mt-2 text-[11px] leading-relaxed text-text-tertiary">{item.disclaimer}</p>
                  </div>
                  <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">输入</div>
                      <ul className="space-y-2">
                        {Object.values(item.input).map(line => (
                          <li key={line} className="text-[12px] leading-relaxed text-text-secondary">{line}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">就绪度</div>
                      <p className="text-[12px] leading-relaxed text-text-primary">{item.standardPack.readiness}</p>
                      <p className="mt-2 text-[12px] leading-relaxed text-accent">{item.standardPack.decision}</p>
                    </div>
                  </div>
                  <div className="border-t border-border-subtle p-4">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">复核结果</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <Metric label="验收" value={item.review.acceptanceScore} />
                      <Metric label="判断" value={item.review.decision} />
                      <Metric label="下一步" value={item.review.nextStep} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  标准交付物
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-text-secondary">
                  每次试跑输出都应该能被运营、老板和外部合伙人直接复核。
                </p>
                <div className="overflow-hidden rounded-lg border border-border-subtle">
                  {DELIVERABLES.map(item => (
                    <div key={item} className="flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface/45 px-4 py-3 last:border-b-0">
                      <span className="text-[13px] font-mono text-text-primary">{item}</span>
                      <span className="text-[10px] font-mono text-accent">试跑</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-4 font-[family-name:var(--font-outfit)] text-2xl font-bold md:text-3xl">
                  边界
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-text-secondary">
                  真正能商业化的产品必须讲清楚边界。wenai 会把草稿、需复核和最终责任分开。
                </p>
                <div className="space-y-3">
                  {NOT_PROMISED.map(item => (
                    <div key={item} className="rounded-md border border-error/25 bg-error/5 p-3 text-[13px] leading-relaxed text-text-primary">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="flex flex-col gap-5 rounded-lg border border-accent/35 bg-accent/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  下一步
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary">
                  准备 10 个 SKU，跑一次真实试跑。
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  暂时没准备好？先用 <Link href="/demo" className="text-accent underline">演示 SKU</Link> 看完整流程。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton href="/inquire?from=poc-final" size="lg">
                  提交试跑需求
                </PrimaryButton>
                <SecondaryButton href={POC_STANDARD_PACK_ROUTE} size="lg">
                  生成试跑包
                </SecondaryButton>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
      <div className="mb-1 text-[9px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="text-[12px] leading-relaxed text-text-primary">{value}</div>
    </div>
  );
}
