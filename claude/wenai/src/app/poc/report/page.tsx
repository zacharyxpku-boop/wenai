import type { Metadata } from 'next';
import { Suspense } from 'react';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { Container, PrimaryButton, Section, SecondaryButton } from '@/components/marketing/Container';
import { ListingFactoryReportDelivery } from '@/components/marketing/ListingFactorySections';
import PocReportGenerator from '@/components/PocReportGenerator';
import {
  getPocBenchmarkLane,
  POC_BENCHMARK_LANES,
  POC_DEMO_SCENARIOS,
  POC_SCORE_RUBRIC,
  type PocReportInput,
} from '@/lib/poc-report-evaluator';
import { POC_REPORT_STANDARD_PACK_ROUTE } from '@/lib/standard-pack-routing';

export const metadata: Metadata = {
  title: '试跑报告工作台 | wenai',
  description:
    '把 10 SKU 电商试跑变成验收报告、老板摘要、买方跟进、销售包和推进计划。',
};

const WORKSPACE_STEPS = [
  ['01', '先定场景', '选择目标、类目、SKU 范围、素材状态、参考样例水平和风险等级。'],
  ['02', '再做验收', '给交付覆盖、复核通过率、缺失素材、返工和内容测试准备度打分。'],
  ['03', '输出判断', '把试跑结果翻成可签约、可扩量、需补救或暂缓。'],
  ['04', '生成对外材料', '直接复制老板摘要、买方跟进、提案清单和推进计划。'],
] as const;

const COMPETITOR_PATTERNS = [
  ['内容工厂', '很多产品只做到导入、品牌语气、生成和导出。'],
  ['Feed 管理', '也有平台只强调缺失数据、校验和运营跟进。'],
  ['创意测试', '另一类产品擅长开场句、达人内容方向、素材角度和测试计划。'],
  ['wenai 这一层', 'wenai 把这些输出连接到试跑验收、合同推进和销售跟进。'],
] as const;

const OUTPUTS = [
  ['验收报告', '能直接做判断的试跑评分结果。'],
  ['老板摘要', '给决策人看的只读短版。'],
  ['买方跟进', '复盘后销售可以直接发出去的消息。'],
  ['销售包', '把说明、证据、风险、清单和推进计划合成一包。'],
  ['复盘标准包', '给下一批交付继续复用的标准包。'],
] as const;

const SECTION_JUMPS = [
  ['starter', '先选一个最接近的演示场景'],
  ['workspace', '打开报告工作台'],
  ['library', '对比 4 条参考路径'],
  ['rubric', '查看评分标准'],
  ['outputs', '看客户最终会拿到什么'],
] as const;

function buildWorkspaceHref(input: PocReportInput) {
  const params = new URLSearchParams();
  if (input.category) params.set('category', input.category);
  if (input.benchmarkPreset) params.set('benchmarkPreset', input.benchmarkPreset);
  params.set('skuPlanned', String(input.skuPlanned));
  params.set('skuDelivered', String(input.skuDelivered));
  params.set('finalReviewPassRate', String(input.finalReviewPassRate));
  params.set('benchmarkCoverage', String(input.benchmarkCoverage));
  params.set('riskCount', String(input.riskCount));
  params.set('missingAssetCount', String(input.missingAssetCount));
  params.set('reworkCount', String(input.reworkCount));
  params.set('contentTestReady', input.contentTestReady ? '1' : '0');
  params.set('ownerReady', input.ownerReady ? '1' : '0');
  params.set('contractIntent', input.contractIntent ? '1' : '0');
  return `/poc/report?${params.toString()}`;
}

const STARTER_RECIPES = POC_DEMO_SCENARIOS.map(item => ({
  key: item.key,
  label: item.label,
  segment: item.segment,
  note: item.note,
  href: buildWorkspaceHref(item.input),
  lane: getPocBenchmarkLane(item.input.benchmarkPreset),
}));

export default function PocReportPage() {
  return (
    <div className="min-h-screen bg-bg-root text-text-primary">
      <TopNav />
      <main>
        <ListingFactoryReportDelivery />
        <Section spacing="loose">
          <Container>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-accent">
                  试跑报告工作台
                </div>
                <h1 className="max-w-3xl break-words text-balance font-[family-name:var(--font-outfit)] text-[2.35rem] font-bold leading-[1.08] md:text-6xl [overflow-wrap:anywhere]">
                  把 10 SKU 试跑变成能发给老板和客户的成交材料。
                </h1>
                <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-text-secondary md:text-lg">
                  这里不是再生成一段内容，而是把交付证据整理成验收报告、老板摘要、买方跟进、提案清单、销售包和下一步推进计划。
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/inquire?from=poc-report" size="lg">
                    提交试跑需求
                  </PrimaryButton>
                  <SecondaryButton href={POC_REPORT_STANDARD_PACK_ROUTE} size="lg">
                    生成复盘包
                  </SecondaryButton>
                  <SecondaryButton href="/poc" size="lg">
                    查看试跑标准
                  </SecondaryButton>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-accent">工作台结构</div>
                    <div className="mt-1 text-[14px] font-semibold text-text-primary">从交付证据到销售动作</div>
                  </div>
                  <div className="rounded border border-accent/35 px-2 py-1 text-[10px] font-mono text-accent">
                    可发客户
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {WORKSPACE_STEPS.map(([num, title, body]) => (
                    <div key={num} className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-2 text-[10px] font-mono text-accent">{num}</div>
                      <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="rounded-lg border border-border-subtle bg-bg-surface/45 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">怎么用</div>
                  <div className="mt-1 text-[14px] font-semibold text-text-primary">从场景选择到成交判断，不需要离开这个工作台。</div>
                </div>
                <div className="rounded-md border border-accent/30 bg-accent/5 px-2 py-1 text-[10px] font-mono text-accent">
                  快速跳转
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                {SECTION_JUMPS.map(([id, label], index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="rounded-md border border-border-subtle bg-bg-root/35 p-3 transition-colors hover:border-accent/40"
                  >
                    <div className="text-[10px] font-mono text-accent">{String(index + 1).padStart(2, '0')}</div>
                    <div className="mt-1 text-pretty text-[11px] leading-relaxed text-text-secondary">{label}</div>
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section id="starter" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  快速开始
                </div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  先选一个最接近客户的起始场景，系统会带入默认条件。
                </h2>
                <p className="mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-text-secondary">
                  客户不需要先准备真实后台数据，也能看懂流程。这些演示卡会带入合理的试跑条件，让他们看到哪种情况该签约、扩量、补救或暂缓。
                </p>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-mono text-accent">
                引导式演示 / 默认参数 / 可直接讲解
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              {STARTER_RECIPES.map(item => (
                <article key={item.key} className="rounded-md border border-border-subtle bg-bg-surface/45 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-accent">{item.segment}</div>
                    <div className="text-[10px] font-mono text-text-tertiary">{item.lane.label}</div>
                  </div>
                  <h3 className="text-balance text-[15px] font-semibold text-text-primary">{item.label}</h3>
                  <p className="mt-2 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                  <div className="mt-3 rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">为什么选这个场景</div>
                    <p className="text-pretty text-[11px] leading-relaxed text-text-secondary">{item.lane.customerQuestion}</p>
                  </div>
                  <a
                    href={item.href}
                    className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] font-mono text-accent transition-colors hover:bg-accent/15"
                  >
                    打开这个演示
                  </a>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="workspace" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  现场工作台
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  用试跑信号生成提案材料
                </h2>
                <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-text-secondary">
                  如果客户还没有硬数据，就先用引导表；如果已经有复盘记录，就直接修改指标生成报告。
                </p>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-mono text-accent">
                报告 / 摘要 / 跟进 / 推进计划
              </div>
            </div>
            <Suspense fallback={<div className="rounded-md border border-border-subtle bg-bg-surface p-6 text-[13px] text-text-secondary">报告工作台加载中...</div>}>
              <PocReportGenerator />
            </Suspense>
          </Container>
        </Section>

        <Section className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
                  竞品对比
                </div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  壁垒不是单个生成器，而是交付后的接力系统。
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  竞品通常只优化一个环节：商品文案、商品资料质量、创意测试或素材生产。wenai 把这些环节打包成电商团队能验收、能销售跟进的试跑系统。
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {COMPETITOR_PATTERNS.map(([title, body]) => (
                  <div key={title} className="rounded-md border border-border-subtle bg-bg-surface/45 p-4">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">{title}</div>
                    <p className="text-[12px] leading-relaxed text-text-secondary">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section id="library" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  参考场景库
                </div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  四条可复用路径：参考竞品能力，但由 wenai 完成闭环。
                </h2>
                <p className="mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-text-secondary">
                  这里是 wenai 和通用工具分开的地方：每条路径都说明买方关心什么、要收集什么证据、如何验收、如何进入下一步商务动作。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {POC_BENCHMARK_LANES.map(lane => (
                <article key={lane.id} className="rounded-md border border-border-subtle bg-bg-surface/45 p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-accent">{lane.id}</div>
                      <h3 className="mt-1 text-[18px] font-semibold text-text-primary">{lane.label}</h3>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 px-2 py-1 text-[10px] font-mono text-text-tertiary">
                      客户可读
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">竞品常见做法</div>
                      <p className="text-pretty text-[11px] leading-relaxed text-text-secondary">{lane.competitorPattern}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">客户真正问题</div>
                      <p className="text-pretty text-[11px] leading-relaxed text-text-secondary">{lane.customerQuestion}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3">
                    <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">wenai 壁垒</div>
                    <p className="text-pretty text-[11px] leading-relaxed text-text-primary">{lane.wenaiMoat}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">要收集的证据</div>
                      <ul className="space-y-1.5">
                        {lane.proofToCollect.map(item => (
                          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-bg-root/35 p-3">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">验收信号</div>
                      <ul className="space-y-1.5">
                        {lane.acceptanceSignals.map(item => (
                          <li key={item} className="text-[11px] leading-relaxed text-text-secondary">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="rubric" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  评分标准
                </div>
                <h2 className="text-balance font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary md:text-3xl">
                  试跑分数要能解释、能复核，不能像拍脑袋。
                </h2>
                <p className="mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-text-secondary">
                  成熟买方会问：为什么你建议签约、扩量、补救或暂缓？这里把评分逻辑提前展示出来，降低信任成本。
                </p>
              </div>
              <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] font-mono text-accent">
                透明评分 / 买方信任 / 销售可控
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-border-subtle bg-bg-surface">
                <div className="border-b border-border-subtle p-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">评分权重</div>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-2 md:divide-x md:divide-y-0">
                  <div>
                    {POC_SCORE_RUBRIC.scoreWeights.map(item => (
                      <div key={item.label} className="border-b border-border-subtle p-4 last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
                          <div className="font-mono text-[12px] text-accent">{item.weight}</div>
                        </div>
                        <p className="mt-1 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    {POC_SCORE_RUBRIC.penalties.map(item => (
                      <div key={item.label} className="border-b border-border-subtle p-4 last:border-b-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
                          <div className="font-mono text-[12px] text-error">{item.maxPenalty}</div>
                        </div>
                        <p className="mt-1 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.note}</p>
                      </div>
                    ))}
                    <div className="p-4">
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">必填输入</div>
                      <div className="flex flex-wrap gap-2">
                        {POC_SCORE_RUBRIC.requiredInputs.map(item => (
                          <span key={item} className="rounded border border-border-subtle bg-bg-root/45 px-2 py-1 text-[10px] font-mono text-text-secondary">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface">
                <div className="border-b border-border-subtle p-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-accent">结果矩阵</div>
                </div>
                <div className="divide-y divide-border-subtle">
                  {POC_SCORE_RUBRIC.outcomeBands.map(item => (
                    <div key={item.label} className="p-4">
                      <div className="text-[13px] font-semibold text-text-primary">{item.label}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-tertiary">{item.condition}</p>
                      <p className="mt-2 text-pretty text-[11px] leading-relaxed text-text-secondary">{item.commercialMeaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="outputs" className="border-t border-border-subtle" spacing="tight">
          <Container>
            <div className="rounded-lg border border-border-subtle bg-bg-surface">
              <div className="border-b border-border-subtle p-5">
                <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-accent">输出约定</div>
                <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary">
                  客户能立刻拿去用的内容
                </h2>
              </div>
              <div className="grid grid-cols-1 divide-y divide-border-subtle md:grid-cols-5 md:divide-x md:divide-y-0">
                {OUTPUTS.map(([title, body]) => (
                  <div key={title} className="p-4">
                    <div className="text-[13px] font-semibold text-text-primary">{title}</div>
                    <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}
