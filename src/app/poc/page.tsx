import type { Metadata } from 'next';
import Link from 'next/link';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Container, PrimaryButton, Section, SecondaryButton } from '@/components/marketing/Container';
import FiveMinutePocOnboarding from '@/components/FiveMinutePocOnboarding';
import PocLaunchChecklist from '@/components/PocLaunchChecklist';
import { POC_EVIDENCE_CASES } from '@/lib/poc-case-studies';
import { POC_STANDARD_PACK_ROUTE } from '@/lib/standard-pack-routing';

export const metadata: Metadata = {
  title: '试 10 个商品 | wenai',
  description: '用 10 个商品快速试用 wenai：填写商品资料，生成上新包、营销脚本、验收报告和下一步跟进建议。',
};

const STEPS = [
  ['01', '准备 10 个真实商品', '整理商品名、类目、卖点、价格段、目标平台、现有图片和参考链接。'],
  ['02', '生成上新交付包', '得到标题、卖点、详情页文案、主图方向、合规提示和客户问答。'],
  ['03', '补充品牌规则', '添加品牌语气、禁用词、不能碰的功效词、人工复核负责人。'],
  ['04', '生成复盘报告', '把交付结果变成通过情况、风险点、补资料项和下一步合作建议。'],
] as const;

const DELIVERABLES = [
  '商品资料整理表',
  '商品标题和卖点文案',
  '主图与场景图方向',
  '风险词和合规提醒',
  '客户问答和客服口径',
  '短视频或图文营销脚本',
  '老板版验收报告',
] as const;

const ACCEPTANCE = [
  ['资料够不够', '每个商品是否有类目、卖点、目标平台、图片和负责人。'],
  ['能不能复用', '输出是否能被运营、设计、客服和老板一起看懂。'],
  ['风险清不清楚', '涉及功效、商标、平台规则的内容是否明确标记。'],
  ['下一步做什么', '报告会建议继续合作、补资料、先小测，或暂时停止。'],
] as const;

const NOT_PROMISED = [
  '不会跳过人工复核直接发布。',
  '不会替代法务、商标、平台规则或医疗功效审查。',
  '不会编造客户评价、截图或增长数据。',
  '当前子站不直接收款，支付和合同可由你的主站承接。',
] as const;

const SYSTEM_LAYERS = [
  ['商品上新包', '标题、卖点、详情页、主图方向、客户问答。'],
  ['品牌规则', '品牌语气、禁用词、功效边界、复核负责人。'],
  ['内容营销包', '短视频脚本、图文结构、参考内容拆解。'],
  ['复盘报告', '通过分、风险点、补资料项、老板版摘要。'],
  ['客户跟进', '询盘状态、报价状态、下一步动作和提醒。'],
] as const;

export default function PocPage() {
  return (
    <div className="min-h-screen bg-bg-root text-text-primary">
      <TopNav />
      <main>
        <Section spacing="loose">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-start">
              <div>
                <div className="mb-4 text-[12px] text-accent">10 个商品试点</div>
                <h1 className="max-w-4xl text-balance font-[family-name:var(--font-outfit)] text-4xl font-semibold leading-[1.08] md:text-6xl">
                  不用先谈大系统，先拿 10 个商品试一轮。
                </h1>
                <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-text-secondary md:text-lg">
                  你只需要准备商品资料。wenai 会把它整理成上新文案、图片方向、风险提醒、营销脚本和一份老板能看的复盘报告。
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/inquire?from=poc-hero" size="lg">
                    提交试点需求
                  </PrimaryButton>
                  <SecondaryButton href={POC_STANDARD_PACK_ROUTE} size="lg">
                    生成试点包
                  </SecondaryButton>
                  <SecondaryButton href="/poc/report" size="lg">
                    看报告模板
                  </SecondaryButton>
                </div>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/10 p-5">
                <div className="mb-3 text-[12px] text-accent">好试点要证明什么</div>
                <div className="space-y-3">
                  {ACCEPTANCE.map(([title, body]) => (
                    <div key={title} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="text-[14px] font-medium text-text-primary">{title}</div>
                      <p className="mt-1 text-[13px] leading-6 text-text-secondary">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="grid gap-3 md:grid-cols-4">
              {STEPS.map(([num, title, body]) => (
                <div key={num} className="rounded-md border border-border-subtle bg-bg-surface p-4">
                  <div className="mb-3 font-mono text-[12px] text-accent">{num}</div>
                  <h2 className="mb-2 text-[15px] font-medium text-text-primary">{title}</h2>
                  <p className="text-[13px] leading-6 text-text-secondary">{body}</p>
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
                <div className="mb-3 text-[12px] text-accent">产品能力</div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-semibold md:text-3xl">
                  壁垒不是“会写文案”，而是把电商交付变成固定流程。
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                  客户每次试点都会沉淀类目规则、品牌禁区、风险边界、复盘记录和下一步跟进动作。
                </p>
              </div>
              <SecondaryButton href="/pipelines/marketing-campaign">打开内容营销</SecondaryButton>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {SYSTEM_LAYERS.map(([title, body]) => (
                <div key={title} className="rounded-md border border-border-subtle bg-bg-surface/45 p-4">
                  <div className="mb-2 text-[14px] font-medium text-text-primary">{title}</div>
                  <p className="text-[12px] leading-6 text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 text-[12px] text-accent">交付样例</div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-semibold md:text-3xl">
                  从输入资料到合作判断，样例先让客户看明白。
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                  这些样例不承诺收益，只说明 wenai 如何把混乱的电商工作整理成标准包、风险边界和下一步动作。
                </p>
              </div>
              <SecondaryButton href="/cases">查看样例库</SecondaryButton>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {POC_EVIDENCE_CASES.map((item) => (
                <article key={item.slug} className="overflow-hidden rounded-md border border-border-subtle bg-bg-surface/45">
                  <div className="border-b border-border-subtle p-5">
                    <div className="mb-2 text-[12px] text-accent">{item.segment}</div>
                    <h3 className="text-[18px] font-medium text-text-primary">{item.title}</h3>
                    <p className="mt-2 text-[12px] leading-6 text-text-tertiary">{item.disclaimer}</p>
                  </div>
                  <div className="grid divide-y divide-border-subtle md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="p-4">
                      <div className="mb-2 text-[12px] text-text-tertiary">输入资料</div>
                      <ul className="space-y-2">
                        {Object.values(item.input).map((line) => (
                          <li key={line} className="text-[12px] leading-6 text-text-secondary">{line}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 text-[12px] text-text-tertiary">试点判断</div>
                      <p className="text-[12px] leading-6 text-text-primary">{item.standardPack.readiness}</p>
                      <p className="mt-2 text-[12px] leading-6 text-accent">{item.standardPack.decision}</p>
                    </div>
                  </div>
                  <div className="border-t border-border-subtle p-4">
                    <div className="mb-2 text-[12px] text-text-tertiary">复盘结果</div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <Metric label="验收情况" value={item.review.acceptanceScore} />
                      <Metric label="合作判断" value={item.review.decision} />
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
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">试点会交付什么</h2>
                <p className="mb-5 text-sm leading-7 text-text-secondary">
                  每一项都要能被运营、设计、客服、老板或外部合作方复核。
                </p>
                <div className="overflow-hidden rounded-md border border-border-subtle">
                  {DELIVERABLES.map((item) => (
                    <div key={item} className="flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface/45 px-4 py-3 last:border-b-0">
                      <span className="text-[14px] text-text-primary">{item}</span>
                      <span className="text-[12px] text-accent">试点</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">边界说清楚</h2>
                <p className="mb-5 text-sm leading-7 text-text-secondary">
                  商业化产品必须先说清楚什么能做，什么必须由人工或主站流程承接。
                </p>
                <div className="space-y-3">
                  {NOT_PROMISED.map((item) => (
                    <div key={item} className="rounded-md border border-error/25 bg-error/5 p-3 text-[13px] leading-6 text-text-primary">
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
            <div className="flex flex-col gap-5 rounded-md border border-accent/35 bg-accent/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <div className="mb-2 text-[12px] text-accent">下一步</div>
                <h2 className="text-2xl font-semibold text-text-primary">
                  准备 10 个商品，先跑一轮真实试点。
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-text-secondary">
                  还没准备好？可以先用 <Link href="/demo" className="text-accent underline">演示商品</Link> 看流程。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton href="/inquire?from=poc-final" size="lg">提交试点需求</PrimaryButton>
                <SecondaryButton href={POC_STANDARD_PACK_ROUTE} size="lg">生成试点包</SecondaryButton>
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
      <div className="mb-1 text-[12px] text-text-tertiary">{label}</div>
      <div className="text-[12px] leading-6 text-text-primary">{value}</div>
    </div>
  );
}
