import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wenai · 定价',
  description: '内测免费 / 团队版 ¥499 月 / 企业定制 · 本地部署 · 五品类专属调教',
};

interface PlanFeature {
  text: string;
  emphasis?: boolean;
  missing?: boolean;
}

interface Plan {
  id: 'free' | 'team' | 'enterprise';
  name: string;
  nameEn: string;
  price: string;
  priceUnit: string;
  priceNote?: string;
  quota: string;
  audience: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: '内测版',
    nameEn: 'Free Beta',
    price: '¥0',
    priceUnit: '7 天',
    priceNote: '凭邀请码激活',
    quota: '10 次 Pipeline / 天',
    audience: '个人试用 · 朋友内测',
    features: [
      { text: 'Pipeline 01 · 新品上新流水线' },
      { text: '五大品类专属 prompt 调教' },
      { text: 'Toolbox 19 个单点工具' },
      { text: 'Markdown 一键打包' },
      { text: '结果不落库 · 浏览器关了就清' },
      { text: '团队共享 · 多人协作', missing: true },
      { text: '本地部署 · 数据不出局', missing: true },
    ],
    cta: '申请邀请码',
    ctaHref: '/invite',
  },
  {
    id: 'team',
    name: '团队版',
    nameEn: 'Team',
    price: '¥499',
    priceUnit: '月 · 5 席',
    priceNote: '约等于半个运营的一天工资',
    quota: '500 次 Pipeline / 天',
    audience: '跨境代运营团队 · 20-50 人',
    features: [
      { text: 'Pipeline 01 + 02 + 03（全部实装）', emphasis: true },
      { text: '五品类专属调教 + 自定义品类', emphasis: true },
      { text: 'Toolbox 19 个工具全开' },
      { text: 'Markdown / Excel / CSV 多格式导出' },
      { text: '5 席团队共享 · 协作看板' },
      { text: '邮件客服响应 48h 内' },
      { text: '本地部署 · 数据不出局', missing: true },
    ],
    cta: '订阅 Team',
    ctaHref: '/pricing/checkout?plan=team',
    highlight: true,
    badge: '锚点客户首选',
  },
  {
    id: 'enterprise',
    name: '企业定制',
    nameEn: 'Enterprise',
    price: '面议',
    priceUnit: '年度合同',
    priceNote: '典型规模 ¥30-80 万/年',
    quota: '无限 · 按品类 / SKU 定制调教',
    audience: '千人规模代运营 · 品牌出海 · ToG',
    features: [
      { text: '所有 Team 功能' },
      { text: '本地部署 · 数据全程不出内网', emphasis: true },
      { text: '五品类深度定制 + 客户真实样本调教', emphasis: true },
      { text: '专属 prompt 工程师对接' },
      { text: 'SLA 99.9% · 合同约束' },
      { text: '企业微信 / 飞书 bot 集成' },
      { text: 'DPA + 跨境数据处理合规' },
    ],
    cta: '提交询盘 · 24h 内联系',
    ctaHref: '/inquire?from=pricing',
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-10 px-6">
      <div className="mb-10 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          PRICING · 2026
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          先免费用 7 天，确定省时间再付费
        </h1>
        <p className="text-[13px] text-text-secondary max-w-[640px] mx-auto">
          wenai 不卷 GPT 封装产品。定价锚定在「一天能帮代运营省下的人力工时」——
          ¥499/月 ≈ 半个运营的一天工资。用得着就付，用不着就走。
        </p>
      </div>

      {/* 三档定价卡 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative border rounded-md p-6 flex flex-col ${
              plan.highlight
                ? 'border-accent bg-gradient-to-br from-bg-surface to-bg-raised shadow-[0_12px_40px_rgba(200,151,90,0.15)] scale-[1.02]'
                : 'border-border-subtle bg-bg-surface'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-bg-root text-[10px] font-mono font-semibold rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="mb-5 pb-5 border-b border-border-subtle">
              <div className="flex items-baseline gap-2 mb-1.5">
                <h3 className="text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                  {plan.name}
                </h3>
                <span className="text-[10px] font-mono text-text-tertiary uppercase">
                  {plan.nameEn}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className={`text-[32px] font-bold tabular-nums ${plan.highlight ? 'text-accent' : 'text-text-primary'}`}>
                  {plan.price}
                </span>
                <span className="text-[12px] font-mono text-text-tertiary">/ {plan.priceUnit}</span>
              </div>
              {plan.priceNote && (
                <p className="text-[10px] font-mono text-text-tertiary/80">{plan.priceNote}</p>
              )}
              <div className="mt-3 space-y-0.5">
                <div className="text-[11px] font-mono text-text-secondary">
                  <span className="text-text-tertiary">配额：</span>
                  {plan.quota}
                </div>
                <div className="text-[11px] font-mono text-text-secondary">
                  <span className="text-text-tertiary">目标：</span>
                  {plan.audience}
                </div>
              </div>
            </div>

            {/* 功能列表 */}
            <div className="flex-1 space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-[12px] ${
                    f.missing ? 'text-text-tertiary/60' : 'text-text-secondary'
                  } ${f.emphasis ? 'font-semibold text-text-primary' : ''}`}
                >
                  <span className={`flex-shrink-0 mt-0.5 ${f.missing ? 'text-text-tertiary/40' : 'text-accent'}`}>
                    {f.missing ? '✕' : '✓'}
                  </span>
                  <span className={f.missing ? 'line-through' : ''}>{f.text}</span>
                </div>
              ))}
            </div>

            <Link
              href={plan.ctaHref}
              className={`block text-center py-2.5 rounded-md text-[13px] font-semibold transition-all ${
                plan.highlight
                  ? 'bg-accent text-bg-root hover:bg-accent-hover'
                  : 'border border-border-default text-text-primary hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              {plan.cta} →
            </Link>
          </div>
        ))}
      </div>

      {/* 差异化锚定 */}
      <div className="mb-10 p-6 border border-border-subtle rounded-md bg-bg-surface/50">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">
          为什么不是另一个 GPT 封装
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1.5">① 品类专属调教</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              家居、汽摩、数码、工具、生活百货 5 大类各有专属 prompt 前缀。AI 知道你卖的是带 FCC 的数码品还是带 BPA 的家居品，输出风格完全不同。
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1.5">② Pipeline 编排</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              贴 1 条 SKU，翻译 / 文案 / 合规 并行跑完。不是一个个工具让你自己选，是一条流水线替你串完。
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1.5">③ 本地部署</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              企业版支持本地部署（Enterprise 档）。数据全程不出内网。大客户谈合规时不卡壳。
            </p>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-text-primary mb-4">常见问题</h2>
        <div className="space-y-3">
          {[
            ['能开发票吗？', 'Team / Enterprise 可开 6% 或 13% 增值税普票 / 专票。Free 不开票。'],
            ['支持试用吗？', 'Free 内测 7 天，每日 10 次 Pipeline 配额，足够跑 3-5 个真实项目。够不够用你自己判断。'],
            ['Team 版的 5 席怎么分？', '一个主账号 + 4 个子账号邀请码。共用配额池 500/天。可以运营 + 文案 + 合规各一个。'],
            ['Enterprise 本地部署什么意思？', '我们部署在你的内网服务器 / 私有云 / 阿里云私有区。API 密钥你管，数据不出你内网。'],
            ['能按次付费吗？', '不提供。原因：次付费会引导薅羊毛行为，扰乱产品价值判断。'],
            ['Pipeline 02 / 03 啥时候上？', 'Pipeline 01 内测反馈 ≥ 10 条后启动。现在 Team 订阅价已包含，到时免费升级。'],
          ].map(([q, a], i) => (
            <details
              key={i}
              className="border border-border-subtle rounded-md p-4 hover:bg-bg-surface/50 transition-colors"
            >
              <summary className="text-[13px] font-semibold text-text-primary cursor-pointer list-none flex items-center justify-between">
                {q}
                <span className="text-accent text-[11px] font-mono">+</span>
              </summary>
              <p className="text-[12px] text-text-secondary mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* 锚点客户推荐条 */}
      <div className="text-center">
        <p className="text-[11px] font-mono text-text-tertiary mb-2">
          ━━━ 需要定制开发或规模签约 ━━━
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="/inquire?from=pricing-footer"
            className="text-[12px] font-mono text-accent hover:underline"
          >
            提交询盘 →
          </a>
          <span className="text-text-tertiary text-[11px]">·</span>
          <a
            href="mailto:zachary.x.pku@gmail.com?subject=Wenai%20Enterprise%20%E6%B4%BD%E8%B0%88"
            className="text-[12px] font-mono text-text-secondary hover:text-accent"
          >
            或直接邮件
          </a>
        </div>
      </div>
    </div>
  );
}
