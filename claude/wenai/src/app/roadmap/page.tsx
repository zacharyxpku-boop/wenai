import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '路线图 | wenai',
  description:
    'wenai 的产品路线图：POC 交付、内容营销、CRM、Brand IQ 和企业交接。',
};

const QUARTERS = [
  {
    label: '现在',
    period: 'POC 可交付',
    theme: '把客户第一条路径做成能演示、能验收、能推进。',
    items: [
      '5 分钟 POC onboarding',
      'Brand IQ 和类目护栏',
      '老板版只读报告',
      '询盘、合同、SLA 和下一步动作',
      '内容 benchmark 到创意 brief',
    ],
  },
  {
    label: '上架前',
    period: '真实客户准备',
    theme: '把演示子站接到主站付款、合同和真实服务流程。',
    items: [
      '生产环境检查清单',
      '演示数据和样例报告',
      '移动端视觉验收',
      '主站合同和支付跳转',
      '客户授权案例库',
    ],
  },
  {
    label: '企业化',
    period: '客户专属规则',
    theme: '把可复用 POC 变成客户自己的电商操作系统。',
    items: [
      '工作区专属 Brand IQ',
      '类目验收阈值模板',
      '长期交付历史',
      '私有部署包',
      'API / ERP 交接',
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono text-accent">路线图</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          先把 POC 做硬，再扩成商业操作系统。
        </h1>
        <p className="mx-auto max-w-[660px] text-[13px] leading-relaxed text-text-secondary">
          路线图只围绕一件事：让电商 SKU 工作可复用、可复核、可分享、可推进合同。
        </p>
      </div>

      <div className="space-y-6">
        {QUARTERS.map((quarter, index) => (
          <section key={quarter.label} className="rounded-md border border-border-subtle bg-bg-surface p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                    {quarter.label}
                  </span>
                  {index === 0 && (
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-mono text-accent">
                      当前
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[13px] text-text-secondary">{quarter.theme}</div>
              </div>
              <span className="font-mono text-[10px] text-text-tertiary">{quarter.period}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {quarter.items.map((item) => (
                <div key={item} className="rounded-md border border-border-subtle bg-bg-root/35 p-3 text-[12px] text-text-primary">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-6">
        <Link href="/changelog" className="text-[12px] font-semibold text-accent hover:underline">
          查看更新记录
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href="/poc" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            POC
          </Link>
          <Link href="/pricing" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            方案
          </Link>
          <Link href="/enterprise" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
            企业版
          </Link>
        </div>
      </div>
    </div>
  );
}
