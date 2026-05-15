import type { Metadata } from 'next';
import Link from 'next/link';
import CaseLibraryExplorer from '@/components/CaseLibraryExplorer';
import { ListingFactoryCasesSection } from '@/components/marketing/ListingFactorySections';
import { getCaseLibraryEntries } from '@/lib/case-library';
import { POC_EVIDENCE_CASES } from '@/lib/poc-case-studies';

export const metadata: Metadata = {
  title: 'Wenai · 交付样例 · 电商试跑证据库',
  description:
    '用匿名样例展示 Wenai 如何把 SKU、类目规则、品牌禁区、内容营销和试跑报告压成可验收的商业交付包。',
};

const JOURNEY = [
  {
    step: '输入',
    title: '客户给 SKU 和类目背景',
    body: '不要求客户会写提示词, 只需要给 SKU、平台、素材、参考账号和最痛的返工点。',
  },
  {
    step: '标准包',
    title: '系统生成可验收交付范围',
    body: '自动整理资料缺口、类目规则、品牌禁用词、内容参考和负责人验收口径。',
  },
  {
    step: '试跑报告',
    title: '用报告判断能否继续买',
    body: '复盘不只看“产出好不好”, 而是判断扩 SKU、补资料、推合同还是停止。',
  },
];

export default function CasesPage() {
  const caseLibraryEntries = getCaseLibraryEntries();

  return (
    <>
      <ListingFactoryCasesSection />
      <main className="max-w-[1180px] mx-auto px-5 py-8 md:px-6 md:py-12">
      <section className="mb-8 md:mb-10">
        <div className="max-w-[760px]">
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
            交付样例 · 2026
          </div>
          <h1 className="text-[28px] leading-tight md:text-[42px] md:leading-[1.05] font-semibold text-text-primary font-[family-name:var(--font-outfit)] text-balance">
            先看 Wenai 怎么把电商需求变成能验收、能复盘、能推进合同的交付包
          </h1>
          <p className="mt-4 text-[14px] md:text-[15px] text-text-secondary leading-relaxed text-pretty">
            这些是匿名试跑样例, 用来展示交付结构和验收口径。它们不是客户业绩承诺,
            也不承诺转化率, 但能让你在 3 分钟内判断: 这套系统是否适合你的上新、内容和商务推进流程。
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/inquire?from=cases"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover transition-colors"
          >
            提交 10 SKU 试跑需求
          </Link>
          <Link
            href="/poc/report"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-5 py-2.5 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors"
          >
            查看老板版报告
          </Link>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        {JOURNEY.map(item => (
          <article
            key={item.step}
            className="rounded-md border border-border-subtle bg-bg-surface p-4"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-[12px] font-mono text-accent">
              {item.step}
            </div>
            <h2 className="text-[15px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
              {item.title}
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
              {item.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-8 rounded-md border border-accent/30 bg-accent/5 p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
              匿名试跑证据
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
              从输入到下一步动作, 每一项都能被客户检查
            </h2>
            <p className="mt-2 max-w-[760px] text-[12px] leading-relaxed text-text-secondary">
              这块解决客户最常见的三个疑问: 我该给什么资料? 你会交付什么? 做完以后怎么判断是否继续合作?
            </p>
          </div>
          <Link
            href="/poc"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-accent/30 px-3 py-2 text-[12px] font-semibold text-accent hover:bg-accent/10"
          >
            看 10 SKU 验收标准
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {POC_EVIDENCE_CASES.map(item => (
            <article key={item.slug} className="rounded-md border border-border-subtle bg-bg-root/45 p-4">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
                {item.segment}
              </div>
              <h3 className="text-[16px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
                {item.title}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                {item.disclaimer}
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <EvidenceMetric label="就绪度" value={item.standardPack.readiness} />
                <EvidenceMetric label="验收分" value={item.review.acceptanceScore} />
                <EvidenceMetric label="复盘动作" value={item.review.decision} />
              </div>

              <div className="mt-4 rounded-md border border-border-subtle bg-bg-surface/60 p-3">
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
                  典型交付物
                </div>
                <ul className="space-y-1.5">
                  {item.deliverables.slice(0, 4).map(line => (
                    <li key={line} className="text-[12px] leading-relaxed text-text-secondary">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed text-text-primary">
                下一步: {item.review.nextStep}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <CaseLibraryExplorer entries={caseLibraryEntries} />
      </section>

      <section className="rounded-md border border-border-subtle bg-bg-surface p-5 text-center md:p-6">
        <div className="text-[18px] font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
          想看你自己的 SKU 能不能跑?
        </div>
        <p className="mx-auto mt-2 max-w-[620px] text-[13px] leading-relaxed text-text-secondary">
          先提交一批真实 SKU。我们会用标准包预览判断资料是否足够, 再决定是直接试跑、先补资料还是只做内容参考拆解。
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/inquire?from=cases-footer"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg-root hover:bg-accent-hover transition-colors"
          >
            提交试跑需求
          </Link>
          <Link
            href="/demo"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-5 py-2.5 text-[13px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-colors"
          >
            先看演示
          </Link>
        </div>
      </section>
      </main>
    </>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/60 p-3">
      <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-[12px] leading-relaxed text-text-primary">{value}</div>
    </div>
  );
}
