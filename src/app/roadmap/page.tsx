import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '路线图 · wenai',
  description: 'wenai 未来 3 个季度的规划。公开承诺接下来会做什么。',
};

interface Quarter {
  id: string;
  label: string;
  period: string;
  status: 'current' | 'next' | 'future';
  theme: string;
  items: { title: string; note?: string; state?: 'building' | 'planned' | 'researching' }[];
}

const QUARTERS: Quarter[] = [
  {
    id: 'q2-2026',
    label: 'Q2 2026',
    period: '2026-04 ~ 2026-06',
    status: 'current',
    theme: '内测闭环 · 3 Pipeline 真实装 + 付费链路',
    items: [
      { title: '3 Pipeline 全部实装 (新品/达人/主图)', state: 'building', note: '已 ship' },
      { title: '五品类专属 prompt 调教', state: 'building', note: '已 ship' },
      { title: 'Pricing + Checkout 手动审核 MVP', state: 'building', note: '已 ship' },
      { title: '公开分享 /share/[id] + OG 图', state: 'building', note: '已 ship' },
      { title: '邀请码可视化 CRUD', state: 'building', note: '已 ship' },
      { title: '锚点客户 wzq 朋友落地 POC', state: 'building' },
    ],
  },
  {
    id: 'q3-2026',
    label: 'Q3 2026',
    period: '2026-07 ~ 2026-09',
    status: 'next',
    theme: '付费自动化 + 团队账号',
    items: [
      { title: 'Stripe / 微信支付商户 接入', state: 'planned', note: '替代手动二维码' },
      { title: '自动续费 + 发票自助开具', state: 'planned' },
      { title: '多人团队账号 · Team 档 5 席真实落地', state: 'planned', note: '座位管理 + 权限分层' },
      { title: 'Pipeline 结果历史持久化到 DB', state: 'planned', note: '跨设备 · 可搜索' },
      { title: 'Vercel Blob · Pipeline 03 图片永久化', state: 'planned', note: '去掉 24h TTL 警告' },
      { title: '微信公众号 / 企业微信 bot 集成', state: 'researching', note: '私域分享闭环' },
    ],
  },
  {
    id: 'q4-2026',
    label: 'Q4 2026',
    period: '2026-10 ~ 2026-12',
    status: 'future',
    theme: 'Enterprise 落地 + 品类深度',
    items: [
      { title: 'Enterprise 本地部署方案', state: 'planned', note: '客户内网 / 私有云' },
      { title: '客户真实 SKU 样本调教 · 一家一个模型', state: 'planned', note: 'anchor 客户验证' },
      { title: '5 品类扩到 10+ (服装/美妆/户外 等)', state: 'planned' },
      { title: 'API / SDK 开放 · 程序化接入', state: 'researching' },
      { title: 'Pipeline 04 · 评论挽回全闭环', state: 'planned', note: '抓评论 → 结构化 → 挽回话术 → 发送' },
      { title: '海外节点 · 新加坡 / 美西', state: 'researching', note: '合规 + 低延迟' },
    ],
  },
];

const STATE_META = {
  building: { label: '执行中', color: 'text-accent', bg: 'bg-accent/10' },
  planned: { label: '已规划', color: 'text-text-secondary', bg: 'bg-bg-raised' },
  researching: { label: '调研中', color: 'text-text-tertiary', bg: 'bg-bg-surface' },
};

export default function RoadmapPage() {
  return (
    <div className="max-w-[960px] mx-auto py-10 px-6">
      <div className="mb-8 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          ROADMAP · 2026
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          路线图 · 未来 3 个季度
        </h1>
        <p className="text-[13px] text-text-secondary max-w-[640px] mx-auto">
          这不是空头 vision。是作者公开承诺接下来做什么,每季度末对照 /changelog 核对完成度。
          状态变更与新增项会实时反映到此页。
        </p>
      </div>

      {/* Quarters timeline */}
      <div className="space-y-8">
        {QUARTERS.map((q) => {
          const ringColor = q.status === 'current' ? 'border-accent bg-accent/10'
            : q.status === 'next' ? 'border-border-default bg-bg-surface'
            : 'border-border-subtle bg-bg-surface/50';
          return (
            <section key={q.id} className={`border rounded-md p-6 ${ringColor}`}>
              <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                      {q.label}
                    </span>
                    <span className="text-[10px] font-mono text-text-tertiary">{q.period}</span>
                    {q.status === 'current' && (
                      <span className="text-[9px] font-mono text-accent bg-accent/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        当前 · Current
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-text-secondary">{q.theme}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.items.map((item, i) => {
                  const meta = item.state ? STATE_META[item.state] : STATE_META.planned;
                  return (
                    <div key={i} className={`p-3 rounded border border-border-subtle ${meta.bg}`}>
                      <div className="flex items-start gap-2">
                        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${
                          item.state === 'building' ? 'bg-accent'
                          : item.state === 'planned' ? 'bg-text-tertiary'
                          : 'bg-text-tertiary/40'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-text-primary">{item.title}</div>
                          {item.note && (
                            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">{item.note}</div>
                          )}
                        </div>
                        <span className={`flex-shrink-0 text-[9px] font-mono ${meta.color} uppercase tracking-wider`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* 触发条件 · 透明度 */}
      <div className="mt-10 p-5 border border-border-subtle rounded-md bg-bg-surface">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          触发条件与放弃策略
        </div>
        <div className="space-y-2 text-[12px] text-text-secondary leading-relaxed">
          <p>
            · <strong className="text-text-primary">触发启动</strong>: Q3/Q4 项开工节点取决于 Q2 内测反馈 ≥ 10 朋友 / wzq 锚点客户签约 / feedback 明确需求.
          </p>
          <p>
            · <strong className="text-text-primary">公开放弃</strong>: 若某项调研后证伪 (如阿里 250 人验证过的"AI 选品"),会在 /changelog 标记 &ldquo;放弃 + 理由&rdquo;,不假装还在做.
          </p>
          <p>
            · <strong className="text-text-primary">客户影响优先</strong>: Enterprise 客户合同约定的功能会插队到 "building" 状态,不按季度等.
          </p>
        </div>
      </div>

      {/* 回顾 CTA */}
      <div className="mt-8 pt-6 border-t border-border-subtle flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-mono text-text-tertiary">
            看过去已交付的 →
          </div>
          <Link href="/changelog" className="text-[14px] font-semibold text-accent hover:underline">
            /changelog · 8 个 release 节点
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/pricing" className="text-[11px] font-mono text-text-secondary border border-border-default rounded px-3 py-1.5 hover:border-accent/40">
            定价
          </Link>
          <Link href="/cases" className="text-[11px] font-mono text-text-secondary border border-border-default rounded px-3 py-1.5 hover:border-accent/40">
            案例
          </Link>
          <a href="mailto:zachary.x.pku@gmail.com?subject=Wenai%20Roadmap" className="text-[11px] font-mono text-accent border border-accent/30 rounded px-3 py-1.5 hover:bg-accent/10">
            提议新项 →
          </a>
        </div>
      </div>
    </div>
  );
}
