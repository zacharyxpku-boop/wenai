import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '更新记录 | wenai',
  description: 'wenai 的主要产品进展：POC、标准包、报告、CRM 和商业化就绪。',
};

const RELEASES = [
  {
    version: 'v0.90',
    date: '2026-05-05',
    phase: '商业化收尾',
    headline: 'POC 交付系统、Brand IQ、CRM 和老板版报告打通。',
    highlights: [
      '5 分钟 POC 路径收紧：选类目、填 SKU、出标准包、出报告、提交需求。',
      'Brand IQ 和类目护栏升级为产品壁垒，不再只是提示词。',
      '老板版只读分享页和报告动作更适合发给客户或合伙人。',
      'CRM 层记录状态、合同阶段、报价、付款、负责人、SLA 和下一步动作。',
      '公开页和客户入口改成更适合商业演示的中文表达。',
    ],
  },
  {
    version: 'v0.80',
    date: '2026-05-04',
    phase: '标准包闭环',
    headline: '上新流水线接入标准包和 POC 复盘入口。',
    highlights: [
      '新品上新流程能生成标准 POC 包。',
      '批量上新可以生成验收摘要，不把完整 AI 输出塞进 URL。',
      '内容营销流程接入 benchmark、hook、brief 和复盘报告。',
    ],
  },
  {
    version: 'v0.70',
    date: '2026-05-03',
    phase: '报告闭环',
    headline: 'POC 报告、分享页和询盘后续动作上线。',
    highlights: [
      '新增 POC 报告生成器。',
      '新增只读分享和老板版报告辅助动作。',
      '询盘提交成功后，继续引导客户理解 POC 标准包。',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono text-accent">更新记录</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          每一轮更新都围绕客户能不能直接用。
        </h1>
        <p className="mx-auto max-w-[620px] text-[13px] leading-relaxed text-text-secondary">
          这里记录真实产品收尾：POC 就绪、标准包、报告、CRM、内容营销和上架前打磨。
        </p>
      </div>

      <div className="space-y-5">
        {RELEASES.map((release) => (
          <section key={release.version} className="rounded-md border border-border-subtle bg-bg-surface p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] text-accent">{release.version}</div>
                <h2 className="mt-1 text-lg font-semibold text-text-primary">{release.headline}</h2>
              </div>
              <div className="text-right font-mono text-[10px] text-text-tertiary">
                <div>{release.date}</div>
                <div>{release.phase}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {release.highlights.map((item) => (
                <div key={item} className="rounded-md border border-border-subtle bg-bg-root/35 p-3 text-[12px] leading-relaxed text-text-primary">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-6">
        <Link href="/roadmap" className="text-[12px] font-semibold text-accent hover:underline">
          查看路线图
        </Link>
        <Link href="/poc" className="rounded-md border border-border-default px-3 py-1.5 text-[11px] font-mono text-text-secondary hover:border-accent/40">
          开始 5 分钟 POC
        </Link>
      </div>
    </div>
  );
}
