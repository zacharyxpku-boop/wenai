import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '企业版 | wenai',
  description:
    '面向 Brand IQ、类目规则、私有部署、API/ERP 交接、SLA 和合同级电商交付的企业路径。',
};

const FITS = [
  ['多 SKU 运营团队', '每周都有上新、内容测试和复核任务，需要稳定的可复用流程。'],
  ['品牌禁区敏感团队', '发布前必须处理品牌红线、数据边界和人工审核。'],
  ['深类目团队', '类目规则、验收阈值和平台限制复杂，需要沉淀成工作区规则。'],
];

const STEPS = [
  ['需求确认', '确认 SKU 量、类目范围、数据边界和真实 POC 验收标准。'],
  ['POC 试跑', '用 10-20 个真实 SKU 跑通系统，记录质量、节省工作量和复核问题。'],
  ['合同范围', '明确 DPA、SLA、定制工作流、验收标准和商务条款。'],
  ['部署接入', '接入选定环境、模型供应商、管理密钥和客户交接路径。'],
  ['复盘扩展', '用报告和 CRM 动作判断扩量、续约或调整 workflow。'],
];

export default function EnterprisePage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-10 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">企业版</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          把可复用 POC 升级成客户专属电商操作系统。
        </h1>
        <p className="mx-auto max-w-[700px] text-[14px] leading-relaxed text-text-secondary">
          企业版不从空谈开始，而从一次聚焦 POC 开始。目标是把 SKU 规则、品牌红线、内容营销、报告和合同推进变成稳定工作区。
        </p>
      </div>

      <section className="mb-10 rounded-md border border-border-subtle bg-bg-surface p-6">
        <div className="mb-4 text-[10px] font-mono uppercase tracking-wider text-accent">适合谁</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FITS.map(([title, body]) => (
            <div key={title} className="rounded-md border border-border-subtle bg-bg-root/35 p-4">
              <div className="mb-2 text-[13px] font-semibold text-text-primary">{title}</div>
              <p className="text-[11px] leading-relaxed text-text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">商务流程</div>
        <div className="space-y-3">
          {STEPS.map(([title, body], index) => (
            <div key={title} className="flex gap-4 rounded-md border border-border-subtle bg-bg-surface/50 p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-accent/10 font-mono text-[13px] text-accent tabular-nums">
                {index + 1}
              </div>
              <div>
                <div className="mb-1 text-[13px] font-semibold text-text-primary">{title}</div>
                <p className="text-[11px] leading-relaxed text-text-secondary">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-accent/40 bg-accent/5 p-6 text-center">
        <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-accent">下一步</div>
        <h2 className="mb-2 text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
          先跑范围明确的 POC，再判断企业版深度。
        </h2>
        <p className="mx-auto mb-4 max-w-[560px] text-[12px] leading-relaxed text-text-secondary">
          正式付款、合同、发票、退款和 SLA 条款继续走主站商务流程。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/inquire?from=enterprise" className="rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover">
            提交询盘
          </Link>
          <Link href="/poc" className="rounded-md border border-border-default px-5 py-2.5 text-[13px] font-mono text-text-primary hover:border-accent/40">
            先跑 POC
          </Link>
          <Link href="/legal/dpa" className="rounded-md border border-border-default px-5 py-2.5 text-[13px] font-mono text-text-primary hover:border-accent/40">
            查看 DPA
          </Link>
        </div>
      </section>
    </div>
  );
}
