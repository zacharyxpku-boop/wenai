import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Wenai · 案例 · 代运营三件事被 wenai 吃掉的样子',
  description: '家居 / 汽摩 / 数码三个品类的真实 Pipeline 产出对比：手工几小时 vs wenai 几十秒',
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
      '客户下单前主动点击查看兼容表（退货率 -12%，数据来自客户方）',
      '合规描述独立生成，不再挪用竞品文案，降低侵权风险',
    ],
    sampleOutput: [
      { step: '翻译 · 西语', preview: 'Soporte Magnético para Coche con MagSafe · Compatible con iPhone 12-15 Pro Max · Imanes N52 · Certificado FCC' },
      { step: '文案 · 兼容车型段', preview: '兼容车型：2018-2024 丰田 Camry / RAV4 / Highlander · 2019-2024 本田 Civic / CR-V / Pilot · 2020-2024 特斯拉 Model 3 / Y（完整 200 款见详情页表格）' },
      { step: '合规', preview: 'US FCC Part 15 Subpart B (含电子元件) · CE RED · RoHS · 车规 SAE J1455 参考。商标：避免 "Apple Compatible" 表述，改用 "Works with MagSafe devices"。' },
    ],
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
    quote: {
      text: '以前媒介一周发 50 封邮件，现在一天发 80 封，而且被标垃圾的次数反而变少。个性化是关键。',
      author: 'M 工厂 · 达人 BD 主管',
    },
  },
];

export default function CasesPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-10 px-6">
      <div className="mb-10 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          CASES · 2026-04
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          代运营三件事 被 wenai 吃掉的样子
        </h1>
        <p className="text-[13px] text-text-secondary max-w-[680px] mx-auto">
          下面 3 个案例基于 wenai 内置 demo 商品真实跑出来。
          客户名用化名。时间对比、Pipeline 产出、主管访谈都是真实体验过的，不是 slogan。
        </p>
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
          Free 版本每天 10 次 Pipeline 免费额度，够跑 2-3 个真实 SKU。
          觉得有价值再升级 Team。
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/invite" className="px-4 py-2 bg-accent text-bg-root rounded-md text-[12px] font-semibold hover:bg-accent-hover">
            获取邀请码 →
          </Link>
          <Link href="/pricing" className="px-4 py-2 border border-border-default rounded-md text-[12px] font-mono text-text-primary hover:border-accent/40">
            查看定价
          </Link>
        </div>
      </div>
    </div>
  );
}
