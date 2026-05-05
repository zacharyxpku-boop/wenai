import type { Metadata } from 'next';
import Link from 'next/link';
import CaseLibraryExplorer from '@/components/CaseLibraryExplorer';
import { getCaseLibraryEntries } from '@/lib/case-library';
import { POC_EVIDENCE_CASES } from '@/lib/poc-case-studies';

export const metadata: Metadata = {
  title: 'Wenai · 案例 · 代运营三件事被 wenai 吃掉的样子',
  description: '家居 / 汽摩 / 数码案例的 POC 交付、验收和复盘样例：不仅看效率，也看是否值得继续接入。',
};

interface Case {
  slug: string;
  category: string;
  categoryIcon: string;
  customer: string;
  customerNote: string;
  scenario: string;
  before: {
    steps: { label: string; time: string }[];
    total: string;
    painPoint: string;
  };
  after: {
    pipelineLabel: string;
    pipelineHref: string;
    total: string;
    highlight: string;
  };
  outcome: string[];
  sampleOutput: { step: string; preview: string }[];
  pocReview: {
    readiness: string;
    acceptanceScore: string;
    decision: string;
    nextStep: string;
    guardrail: string;
  };
  quote: { text: string; author: string };
}

const CASES: Case[] = [
  {
    slug: 'homelody',
    category: '家居用品',
    categoryIcon: '🏠',
    customer: 'H 代运营（化名）',
    customerNote: '华南跨境代运营公司 · 运营 400 人 · 带 50+ 家居品牌',
    scenario: '新品 6 件装密封收纳盒 上 Amazon US / JP / DE 三站',
    before: {
      steps: [
        { label: '五语言翻译（运营手工 + Google）', time: '25 min' },
        { label: '五点描述按 Amazon A+ 规范改写', time: '15 min' },
        { label: '查 FDA / Prop 65 / LFGB 合规点', time: '30 min' },
        { label: '整理成 Excel 给主管审', time: '10 min' },
      ],
      total: '≈ 80 min',
      painPoint: '翻译常漏尺寸单位 · 合规点凭记忆 · 每个 SKU 都得过一遍',
    },
    after: {
      pipelineLabel: 'Pipeline 01 · 新品上新（家居品类）',
      pipelineHref: '/pipelines/new-listing',
      total: '≈ 45 sec',
      highlight: '五语言 + 文案 + 合规 三路并行，家居品类 prompt 自动提醒 BPA-Free / FDA 21 CFR',
    },
    outcome: [
      '单 SKU 上新从 80 分钟压到 45 秒（≈ 107×）',
      '合规点 4 项（FDA / Prop 65 / LFGB / REACH）由品类 prompt 自动注入，不再凭记忆',
      '批量模式下 20 个 SKU 一次出 Excel，运营直接转主管',
    ],
    sampleOutput: [
      { step: '翻译 · 日语', preview: '積み重ね可能な密閉収納ボックスセット（6個入り）・BPA フリー食品グレード PP 製 · FDA + LFGB 認証' },
      { step: '文案 · 标题', preview: 'HOMELODY Stackable Airtight Storage Bins, 6-Pack — BPA-Free PP, 3 Sizes, Save 40% Space' },
      { step: '合规', preview: '必要认证：US FDA 21 CFR · Prop 65 · 欧盟 LFGB · EU 10/2011 · REACH SVHC。商标冲突：未检出。' },
    ],
    pocReview: {
      readiness: '线索分 84 / 验收准备 82 / 合同准备 76',
      acceptanceScore: '83/100',
      decision: '扩 SKU',
      nextStep: '把合规 checklist 和批量上新 Excel 模板扩到下一批 20 个家居 SKU。',
      guardrail: '效率数字来自 demo 流程测算, 不作为真实客户 ROI 承诺。',
    },
    quote: {
      text: '以前主管一天审 6 个 SKU，现在审 40 个。合规点自动带出来，不再返工。',
      author: 'H 代运营 · 运营主管',
    },
  },
  {
    slug: 'vicseed',
    category: '汽摩配件',
    categoryIcon: '🚗',
    customer: 'V 独立站（化名）',
    customerNote: 'Shopify + Amazon 双渠道 · 车载配件 · 月 GMV $180K',
    scenario: 'MagSafe 磁吸车载支架上新，兼容车型描述要写 200 款',
    before: {
      steps: [
        { label: '查兼容车型清单（官方 spec sheet）', time: '40 min' },
        { label: '按年份 / 品牌 / 型号整理为可扫描段', time: '35 min' },
        { label: 'FCC Part 15 / CE 认证文案', time: '20 min' },
        { label: '翻译 5 语言', time: '30 min' },
      ],
      total: '≈ 125 min',
      painPoint: '兼容车型写法混乱 · 客户看不懂 · 退货率高 · 合规文案照抄竞品容易侵权',
    },
    after: {
      pipelineLabel: 'Pipeline 01 · 新品上新（汽摩品类）',
      pipelineHref: '/pipelines/new-listing',
      total: '≈ 50 sec',
      highlight: '汽摩品类 prompt 强制输出年份+品牌+型号三元组，合规 FCC / CE 自动写入，避免抄竞品',
    },
    outcome: [
      '车型清单从 200 款乱序改为按年份分组可扫描表格',
      '样例展示了兼容表结构如何降低误购风险，不声明真实退货率',
      '合规描述独立生成，不再挪用竞品文案，降低侵权风险',
    ],
    sampleOutput: [
      { step: '翻译 · 西语', preview: 'Soporte Magnético para Coche con MagSafe · Compatible con iPhone 12-15 Pro Max · Imanes N52 · Certificado FCC' },
      { step: '文案 · 兼容车型段', preview: '兼容车型：2018-2024 丰田 Camry / RAV4 / Highlander · 2019-2024 本田 Civic / CR-V / Pilot · 2020-2024 特斯拉 Model 3 / Y（完整 200 款见详情页表格）' },
      { step: '合规', preview: 'US FCC Part 15 Subpart B (含电子元件) · CE RED · RoHS · 车规 SAE J1455 参考。商标：避免 "Apple Compatible" 表述，改用 "Works with MagSafe devices"。' },
    ],
    pocReview: {
      readiness: '线索分 82 / 验收准备 79 / 合同准备 77',
      acceptanceScore: '80/100',
      decision: '推进主站合同',
      nextStep: '把车型兼容结构、商标词边界和安装场景脚本纳入长期车品上新 SOP。',
      guardrail: '兼容车型和第三方商标引用必须由客户负责人终审。',
    },
    quote: {
      text: '以前媒介一天能上 3 个新车品，现在上 18 个。车型清单自动对齐客户搜索习惯。',
      author: 'V 独立站 · 品牌负责人',
    },
  },
  {
    slug: 'micro-audio',
    category: '数码电子',
    categoryIcon: '🔌',
    customer: 'M 工厂直营（化名）',
    customerNote: '深圳数码工厂自营 TikTok Shop / Amazon · 蓝牙音箱主攻品',
    scenario: '户外防水蓝牙音箱 Micro 2 拓达人渠道，需批量联系 Instagram / TikTok 户外类博主',
    before: {
      steps: [
        { label: '手工筛达人 + 查邮箱', time: '60 min / 10 人' },
        { label: '每位写个性化邮件（不能群发模板）', time: '12 min / 封' },
        { label: 'A/B 两版主动收集表', time: '20 min' },
      ],
      total: '≈ 200 min / 10 人',
      painPoint: '同模板发被 Gmail 判垃圾 · 人工一封一改效率低 · 追踪回复靠 Excel 手填',
    },
    after: {
      pipelineLabel: 'Pipeline 02 · 达人批量冷启',
      pipelineHref: '/pipelines/influencer-outbound',
      total: '≈ 3 min / 10 人',
      highlight: '每条独立个性化 · 3 版本 A/B · Excel 可直接喂 Gmail YAMM / Mailmeteor',
    },
    outcome: [
      '媒介日均触达达人数从 10 人涨到 80 人（8×）',
      '回复率从 4% 涨到 11%（个性化开头 + 提对方频道内容）',
      '主管看 Excel 就能跟进，不用再追每一封单独邮件',
    ],
    sampleOutput: [
      { step: '达人 @outdoor_mika（TikTok 320K）', preview: 'Subject: Kayak × Micro 2 · Would your June trip need a waterproof speaker?\n\nHi Mika, saw your kayak loop in the BC 30-day series...' },
      { step: '达人 PantryPerfection（YouTube 85K）', preview: 'Subject: A weatherproof speaker for your garden shed build series\n\nHi, your wooden shed time-lapse last month hit me...' },
      { step: '达人 @trailrunner_kai（Instagram 48K）', preview: 'Subject: Swim-proof speaker for your trail sunrise Reels\n\nHi Kai, your 5 AM trail Reels set a mood...' },
    ],
    pocReview: {
      readiness: '线索分 78 / 验收准备 75 / 合同准备 71',
      acceptanceScore: '76/100',
      decision: '继续迭代 POC',
      nextStep: '先补达人筛选口径、合作条款和回复归因表, 再决定是否扩到完整外联包。',
      guardrail: '回复率样例只展示个性化邮件结构, 不承诺具体达人回复结果。',
    },
    quote: {
      text: '以前媒介一周发 50 封邮件，现在一天发 80 封，而且被标垃圾的次数反而变少。个性化是关键。',
      author: 'M 工厂 · 达人 BD 主管',
    },
  },
  {
    slug: 'novahome-image',
    category: '家居用品 · 主图',
    categoryIcon: '🖼️',
    customer: 'N 代工品牌（化名）',
    customerNote: '东莞家居代工厂自营 Amazon / Shopify · 月均 30+ SKU 上新',
    scenario: '新品收纳盒系列上 Amazon，需要主图 + 3 张场景图 + 1 张细节图 + 1 张对比图（共 6 图 / SKU）',
    before: {
      steps: [
        { label: '联系摄影棚 · 排档期', time: '3 天' },
        { label: '产品寄棚 + 拍摄', time: '2 天 × ¥3000' },
        { label: '设计师修图 · 改品牌色', time: '1 天 × ¥500' },
        { label: '退回改稿 1-2 轮', time: '+1 天' },
      ],
      total: '≈ 7 天 · ¥3500 / SKU',
      painPoint: '周期长错过爆款窗口 · 1688 拿图改 PS 版权风险 · 摄影棚排期卡死新品节奏',
    },
    after: {
      pipelineLabel: 'Pipeline 03 · AI 电商主图（通义万相）',
      pipelineHref: '/pipelines/product-image',
      total: '≈ 45 秒 · ¥0.7 / SKU',
      highlight: '五品类 × 三场景 15 个垂直预设 · 中文 prompt 喂 wanx 原生理解 · 商标词前置过滤',
    },
    outcome: [
      '主图产出成本从 ¥3500/SKU 降到 ¥0.7/SKU（5000× 成本压缩）',
      '周期从 7 天变 45 秒，新品上新与社媒同步推进，抢占流量窗口',
      '商标前置过滤避免 "AirPods Style" 类近似词生成，降低 Amazon listing 被 IP takedown 风险',
    ],
    sampleOutput: [
      { step: '主图 · 白底 45°', preview: '纯白背景，产品 80% 占画幅，柔和投影，Amazon listing 候选图规格 2000×2000，需人工终审' },
      { step: '场景图 · 厨房台面', preview: '干净白色厨房台面，晨光从左侧射入，极简北欧风格，浅景深，收纳盒作为前景主体' },
      { step: '细节图 · 材质微距', preview: 'BPA-Free 食品级 PP 材质表面纹理特写，影棚打光，锐利对焦，工业设计美学' },
    ],
    pocReview: {
      readiness: '线索分 80 / 验收准备 73 / 合同准备 69',
      acceptanceScore: '74/100',
      decision: '补资料再跑',
      nextStep: '先补品牌视觉规范、禁用词和人工终审人, 再扩到批量主图生产。',
      guardrail: 'AI 图只能作为候选图和测试素材, 最终上架必须人工终审。',
    },
    quote: {
      text: '以前摄影棚一次性排 5 个新品，档期很长。现在先用样例流程生成候选图，再由运营终审是否进入上架。',
      author: 'N 代工品牌 · 电商运营总监',
    },
  },
];

export default function CasesPage() {
  const caseLibraryEntries = getCaseLibraryEntries();

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-6">
      <div className="mb-10 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          CASES · 2026-04
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          不只看效率, 也看值不值得继续接入
        </h1>
        <p className="text-[13px] text-text-secondary max-w-[680px] mx-auto">
          下面这些案例用于展示 wenai 的 POC 交付结构、验收边界和复盘决策。
          它们不是客户业绩证明, 也不承诺 ROI, 但应该让你看清这套系统如何进入真实商业流程。
        </p>
      </div>

      <section className="mb-10 border border-accent/30 rounded-md bg-accent/5 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
              POC Evidence
            </div>
            <h2 className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
              匿名 POC 样例: 输入 → 标准包 → 交付 → 复盘 → 下一步
            </h2>
            <p className="mt-2 text-[12px] text-text-secondary leading-relaxed max-w-[760px]">
              这里展示的是交付结构和验收逻辑, 不是业绩承诺。真正的商业价值来自每一单复盘后沉淀下来的可复用证据。
            </p>
          </div>
          <Link href="/poc" className="text-[11px] font-mono text-accent border border-accent/30 rounded px-3 py-1.5 hover:bg-accent/10">
            查看 10 SKU POC →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {POC_EVIDENCE_CASES.map(item => (
            <article key={item.slug} className="border border-border-subtle rounded-md bg-bg-root/45 p-4">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">{item.segment}</div>
              <h3 className="text-[14px] font-semibold text-text-primary">{item.title}</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <EvidenceMetric label="准入" value={item.standardPack.readiness} />
                <EvidenceMetric label="复盘" value={`${item.review.acceptanceScore} · ${item.review.decision}`} />
                <EvidenceMetric label="下一步" value={item.review.nextStep} />
              </div>
              <ul className="mt-3 space-y-1.5">
                {item.evidence.map(line => (
                  <li key={line} className="text-[11px] text-text-secondary leading-relaxed">{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="mb-10">
        <CaseLibraryExplorer entries={caseLibraryEntries} />
      </div>

      {/* 案例列表 */}
      <div className="space-y-10">
        {CASES.map(c => (
          <section key={c.slug} id={c.slug} className="border border-border-subtle rounded-md overflow-hidden">
            {/* 头部 */}
            <div className="px-6 py-4 bg-gradient-to-r from-bg-surface to-bg-raised border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.categoryIcon}</span>
                <div>
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider">
                    {c.category}
                  </div>
                  <div className="text-[16px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                    {c.customer}
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary">{c.customerNote}</div>
                </div>
              </div>
              <Link
                href={c.after.pipelineHref}
                className="text-[11px] font-mono text-accent border border-accent/30 rounded px-3 py-1.5 hover:bg-accent/10"
              >
                去跑同款 Pipeline →
              </Link>
            </div>

            {/* 产品场景 hero */}
            <div className="aspect-[16/6] bg-bg-surface border-b border-border-subtle overflow-hidden relative">
              <span className="absolute inset-0 flex items-center justify-center text-text-tertiary text-xs font-mono z-0">
                {c.category} · 产品场景
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/seed/case-${c.slug}.jpg`}
                alt={`${c.customer} ${c.scenario}`}
                className="absolute inset-0 w-full h-full object-cover z-10"
                loading="lazy"
              />
            </div>

            {/* 场景 */}
            <div className="px-6 py-3 border-b border-border-subtle bg-bg-surface/30">
              <div className="text-[10px] font-mono text-text-tertiary uppercase mb-1">场景</div>
              <div className="text-[13px] text-text-primary">{c.scenario}</div>
            </div>

            {/* Before vs After */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
              <div className="p-6 bg-error/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-error uppercase tracking-wider font-semibold">Before · 手工流程</span>
                  <span className="text-[10px] font-mono text-error bg-error/10 px-2 py-0.5 rounded">{c.before.total}</span>
                </div>
                <div className="space-y-2 mb-3">
                  {c.before.steps.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] pb-2 border-b border-error/10">
                      <span className="text-text-secondary">{s.label}</span>
                      <span className="font-mono text-text-tertiary">{s.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-error/10 rounded text-[10px] text-error/90 leading-relaxed">
                  <span className="font-semibold">痛点：</span>{c.before.painPoint}
                </div>
              </div>

              <div className="p-6 bg-success/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-success uppercase tracking-wider font-semibold">After · Wenai Pipeline</span>
                  <span className="text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded">{c.after.total}</span>
                </div>
                <div className="text-[13px] font-semibold text-text-primary mb-1">{c.after.pipelineLabel}</div>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">{c.after.highlight}</p>
                <div className="p-2.5 bg-success/10 rounded space-y-1.5">
                  {c.outcome.map((o, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-success/90">
                      <span className="flex-shrink-0 mt-0.5">✓</span>
                      <span className="leading-relaxed">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 产出示例 */}
            <div className="p-6 border-t border-border-subtle">
              <div className="text-[11px] font-mono text-text-tertiary uppercase mb-3">产出预览</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {c.sampleOutput.map((o, i) => (
                  <div key={i} className="border border-border-subtle rounded p-3 bg-bg-surface/50">
                    <div className="text-[10px] font-mono text-accent uppercase mb-1.5">{o.step}</div>
                    <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">{o.preview}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-subtle bg-bg-surface/35">
              <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">POC 验收层</div>
                  <div className="text-[13px] font-semibold text-text-primary">{c.pocReview.readiness}</div>
                </div>
                <div className="text-[10px] font-mono text-text-tertiary">{c.pocReview.acceptanceScore}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <EvidenceMetric label="复盘决策" value={c.pocReview.decision} />
                <EvidenceMetric label="下一步" value={c.pocReview.nextStep} />
                <EvidenceMetric label="边界" value={c.pocReview.guardrail} />
              </div>
            </div>

            {/* 主管访谈 */}
            <div className="px-6 py-4 border-t border-border-subtle bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="text-[24px] text-accent/60 leading-none">&ldquo;</div>
                <div>
                  <p className="text-[13px] text-text-primary italic leading-relaxed">{c.quote.text}</p>
                  <p className="text-[10px] font-mono text-text-tertiary mt-2">— {c.quote.author}</p>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* 底部 CTA */}
      <div className="mt-12 p-6 border border-accent/30 rounded-md bg-accent/5 text-center">
        <div className="text-[14px] font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
          想跑自己的案例？
        </div>
        <p className="text-[12px] text-text-secondary mb-4">
          演示模式可先看样例输出形态。正式 POC 通过接入需求开通额度, 再跑真实 SKU。
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/demo" className="px-4 py-2 bg-accent text-bg-root rounded-md text-[12px] font-semibold hover:bg-accent-hover">
            试跑演示 →
          </Link>
          <Link href="/pricing" className="px-4 py-2 border border-border-default rounded-md text-[12px] font-mono text-text-primary hover:border-accent/40">
            查看定价
          </Link>
        </div>
      </div>
    </div>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle rounded bg-bg-surface/45 p-2">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[11px] text-text-primary leading-relaxed">{value}</div>
    </div>
  );
}
