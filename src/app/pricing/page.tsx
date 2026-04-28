import type { Metadata } from 'next';
import { COPY } from '@/i18n/zh';
import {
  Container,
  Section,
  PrimaryButton,
  SecondaryButton,
} from '@/components/marketing/Container';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: '定价 · wenai · 7 天免费试用, 不满意全额退款',
  description: '试用版 ¥0 · Team ¥499/月 · Enterprise 面议 · 完整功能对比表',
};

/**
 * 30 行功能对比表 · 4 列
 *
 * value 类型:
 *  - true → ✓ (accent)
 *  - false → ✗ (text-tertiary)
 *  - string → 具体限额
 */
type Cell = true | false | string;
interface Row {
  feature: string;
  trial: Cell;
  team: Cell;
  enterprise: Cell;
  group?: string;
}

const COMPARE_ROWS: Row[] = [
  // 主图工厂
  { group: '主图工厂', feature: '8 套场景模式', trial: true, team: true, enterprise: true },
  { feature: '月出图额度', trial: '3 SKU', team: '不限', enterprise: '不限', },
  { feature: '12 模特库', trial: true, team: true, enterprise: true },
  { feature: '风格锚定 (上传参考图)', trial: false, team: true, enterprise: true },
  { feature: '批量任务并发', trial: '1', team: '5', enterprise: '20+' },

  // AI 视频
  { group: 'AI 视频', feature: '5 秒带货短视频', trial: true, team: true, enterprise: true },
  { feature: '使用教程视频', trial: false, team: true, enterprise: true },
  { feature: '场景代入视频', trial: false, team: true, enterprise: true },
  { feature: '自定义 BGM 库', trial: false, team: true, enterprise: true },

  // 详情页
  { group: '详情页', feature: '详情页文案生成', trial: true, team: true, enterprise: true },
  { feature: '6 国语言翻译', trial: '英语', team: true, enterprise: true },
  { feature: '卖点结构模板', trial: '3', team: '20+', enterprise: '定制' },

  // AIGC 合规
  { group: 'AIGC 合规', feature: '6 大平台合规水印', trial: true, team: true, enterprise: true },
  { feature: '披露话术 (3 版分级)', trial: true, team: true, enterprise: true },
  { feature: '违禁词 + 图像预审', trial: false, team: true, enterprise: true },

  // 客服话术
  { group: '客服话术', feature: '常见问题话术', trial: true, team: true, enterprise: true },
  { feature: '多渠道适配 (店小蜜/抖音)', trial: false, team: true, enterprise: true },

  // 集成
  { group: '集成', feature: 'API 接入', trial: false, team: true, enterprise: true },
  { feature: 'Webhook 推送', trial: false, team: false, enterprise: true },
  { feature: 'ERP 双向对接', trial: false, team: false, enterprise: true },
  { feature: '飞书 / 钉钉 通知', trial: false, team: true, enterprise: true },

  // 部署 + 数据
  { group: '部署 / 数据', feature: '云端 SaaS', trial: true, team: true, enterprise: true },
  { feature: '私有化部署', trial: false, team: false, enterprise: true },
  { feature: '数据存储区', trial: '华东', team: '华东', enterprise: '指定' },
  { feature: '导出原始素材', trial: false, team: true, enterprise: true },

  // 服务
  { group: '服务', feature: '客户成功 1v1', trial: false, team: '工单', enterprise: '专属' },
  { feature: '人工审核兜底', trial: false, team: true, enterprise: true },
  { feature: '团队席位', trial: '1', team: '5', enterprise: '不限' },
  { feature: '权限分级 (管理员/编辑/查看)', trial: false, team: false, enterprise: true },
  { feature: 'SLA 保证', trial: false, team: '99%', enterprise: '99.9%' },
];

function CellRender({ value }: { value: Cell }) {
  if (value === true)
    return <span className="text-accent text-base font-bold">✓</span>;
  if (value === false)
    return <span className="text-text-tertiary text-base">—</span>;
  return <span className="text-text-primary text-sm">{value}</span>;
}

export default function PricingPage() {
  const tiers = COPY.pricing.tiers;
  const faqItems = COPY.faq.items.slice(0, 4);

  return (
    <>
      <TopNav />

      {/* 1 · Hero (mini) */}
      <Section spacing="tight">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-outfit)] text-text-primary">
              {COPY.pricing.title}
            </h1>
            <p className="mt-5 text-lg text-text-secondary">
              {COPY.pricing.subtitle}
            </p>
          </div>
        </Container>
      </Section>

      {/* 2 · 三栏定价卡 */}
      <Section spacing="tight">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-lg p-7 flex flex-col ${
                  tier.recommended
                    ? 'bg-bg-surface border-2 border-accent'
                    : 'bg-bg-surface border border-border-subtle'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-7 bg-accent text-bg-root text-xs font-bold px-3 py-1 rounded-full">
                    推荐
                  </div>
                )}
                <div className="mb-5">
                  <div className="text-xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
                    {tier.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-text-secondary text-sm">
                        {tier.period}
                      </span>
                    )}
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-7">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-text-secondary flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-accent mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {tier.recommended ? (
                  <PrimaryButton href={tier.ctaHref} className="w-full justify-center">
                    {tier.cta}
                  </PrimaryButton>
                ) : (
                  <SecondaryButton href={tier.ctaHref} className="w-full justify-center">
                    {tier.cta}
                  </SecondaryButton>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3 · 功能对比表 */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-8 text-center">
            完整功能对比
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-left min-w-[640px]">
              <thead className="sticky top-0 bg-bg-raised z-10">
                <tr className="border-b border-border-subtle">
                  <th className="py-4 px-5 text-sm font-bold text-text-primary w-[40%]">
                    功能
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-text-primary text-center">
                    试用
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-accent text-center">
                    Team
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-text-primary text-center">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.flatMap((row, i) => {
                  const rows = [];
                  if (row.group) {
                    rows.push(
                      <tr
                        key={`g-${i}`}
                        className="bg-bg-raised/40"
                      >
                        <td
                          colSpan={4}
                          className="py-2 px-5 text-xs font-bold uppercase tracking-wider text-text-tertiary"
                        >
                          {row.group}
                        </td>
                      </tr>
                    );
                  }
                  rows.push(
                    <tr
                      key={`r-${i}`}
                      className="border-b border-border-subtle last:border-b-0 hover:bg-bg-surface/40 transition-colors"
                    >
                      <td className="py-3 px-5 text-sm text-text-primary">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <CellRender value={row.trial} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <CellRender value={row.team} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <CellRender value={row.enterprise} />
                      </td>
                    </tr>
                  );
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* 4 · FAQ */}
      <Section className="border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-10 text-center">
            {COPY.faq.title}
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {faqItems.map((item) => (
              <div
                key={item.q}
                className="border-b border-border-subtle pb-6 last:border-b-0"
              >
                <div className="font-bold text-text-primary mb-3">Q · {item.q}</div>
                <div className="text-text-secondary leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5 · Final CTA */}
      <Section
        className="border-t border-border-subtle"
        spacing="tight"
      >
        <Container>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-text-primary mb-6 font-[family-name:var(--font-outfit)]">
              7 天免费试用, 不满意全额退款
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <PrimaryButton size="lg" href="/me/skus">
                免费开始
              </PrimaryButton>
              <SecondaryButton size="lg" href="/inquire">
                预约 demo
              </SecondaryButton>
            </div>
          </div>
        </Container>
      </Section>

      <MarketingFooter />
    </>
  );
}
