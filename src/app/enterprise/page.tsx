import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Enterprise · 企业定制 · wenai',
  description: '跨境代运营 500+ 人规模企业部署方案 · 本地部署 · SLA 99.9% · 品类深度调教 · 合同约束',
};

export default function EnterprisePage() {
  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          ENTERPRISE · 企业定制
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          为千人规模代运营设计
        </h1>
        <p className="text-[14px] text-text-secondary max-w-[680px] mx-auto leading-relaxed">
          本地部署 · 五品类深度调教 · SLA 99.9% · 专属 prompt 工程师对接。
          <br />
          5-10 万元起可签,适合年营收 ¥1 亿+ 的跨境代运营公司。
        </p>
      </div>

      {/* 谁适合 */}
      <section className="mb-10 p-6 border border-border-subtle rounded-md bg-bg-surface">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-4">
          这个方案适合谁
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1.5">🏢 大型代运营公司</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              供应链 + 营销 500+ 人,年上新 SKU 1000+,迫切需要统一 AI 基础设施替代散落工具
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1.5">🛡️ 数据敏感品牌方</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              未上架新品 / 核心 SKU 信息不能传云,法务明确要求数据不出内网或指定私有云
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text-primary mb-1.5">🎯 有明确垂直品类</div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              主营某一两个品类 (如汽车电子 / 家居收纳 / 户外装备),需要品类专属模型调教
            </p>
          </div>
        </div>
      </section>

      {/* Team vs Enterprise 对比 */}
      <section className="mb-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          Team 还是 Enterprise?
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-3 pr-4 font-mono text-[10px] text-text-tertiary uppercase">维度</th>
                <th className="text-left py-3 pr-4 font-mono text-[10px] text-text-tertiary uppercase">Team (¥499/月)</th>
                <th className="text-left py-3 font-mono text-[10px] text-accent uppercase">Enterprise (¥5-10 万/年起)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">部署方式</td>
                <td className="py-3 pr-4 text-text-secondary">SaaS (Vercel 托管)</td>
                <td className="py-3 text-accent font-semibold">本地部署 / 客户私有云</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">配额</td>
                <td className="py-3 pr-4 text-text-secondary">500 Pipeline / 天 · 5 席</td>
                <td className="py-3 text-accent font-semibold">无限 · 按合同</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">品类调教</td>
                <td className="py-3 pr-4 text-text-secondary">5 类通用 prompt</td>
                <td className="py-3 text-accent font-semibold">客户真实 SKU 样本训练 · 一家一模型</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">SLA</td>
                <td className="py-3 pr-4 text-text-secondary">99.5% best effort</td>
                <td className="py-3 text-accent font-semibold">99.9% · 含赔偿条款</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">响应</td>
                <td className="py-3 pr-4 text-text-secondary">邮件 48h 内</td>
                <td className="py-3 text-accent font-semibold">专属对接人 · 紧急 4h 内</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">数据处理</td>
                <td className="py-3 pr-4 text-text-secondary">不落库 · 第三方 AI 处理</td>
                <td className="py-3 text-accent font-semibold">全程客户方内网 · 跨境零传输</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">合规文件</td>
                <td className="py-3 pr-4 text-text-secondary">
                  <Link href="/legal/dpa" className="text-accent hover:underline">标准 DPA</Link>
                </td>
                <td className="py-3 text-accent font-semibold">定制 DPA + 保密协议 + 等保对接</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-text-primary">集成</td>
                <td className="py-3 pr-4 text-text-secondary">Web UI + CSV 导入导出</td>
                <td className="py-3 text-accent font-semibold">API / SDK · 企微/飞书 bot · ERP 对接</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 定价锚点 */}
      <section className="mb-10 p-6 border border-accent/30 bg-accent/5 rounded-md">
        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">
          定价范围 · 供参考
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-[11px] font-mono text-text-tertiary mb-1">基础方案</div>
            <div className="text-[20px] font-bold text-text-primary tabular-nums">¥5-8 万 / 年</div>
            <div className="text-[10px] text-text-secondary mt-1 leading-relaxed">
              本地部署 + 3 Pipeline 开放 + 5 品类调教 + 标准 SLA
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-text-tertiary mb-1">标准方案</div>
            <div className="text-[20px] font-bold text-accent tabular-nums">¥15-30 万 / 年</div>
            <div className="text-[10px] text-text-secondary mt-1 leading-relaxed">
              + 客户 SKU 样本调教 + API/SDK + 企微/飞书集成 + 4h 响应
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-text-tertiary mb-1">深度定制</div>
            <div className="text-[20px] font-bold text-text-primary tabular-nums">¥50 万+ / 年</div>
            <div className="text-[10px] text-text-secondary mt-1 leading-relaxed">
              以上全部 + ERP 对接 + 专属 Pipeline 开发 + 等保三级对接
            </div>
          </div>
        </div>
        <p className="text-[10px] font-mono text-text-tertiary border-t border-border-subtle pt-3">
          实际报价按:品类复杂度 · SKU 量级 · 部署环境 · 开发人天 · 合同期限 综合评估。首次合同建议 6 个月 POC 再转年度。
        </p>
      </section>

      {/* 签约流程 */}
      <section className="mb-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-4">
          合作流程 · 预期 4-6 周
        </div>
        <div className="space-y-3">
          {[
            { step: 1, title: '诊断访谈 · 1 周', body: '作者本人上门或线上 1-2 次访谈,拿客户真实 3-5 个品的完整上新流程样本,估时估 ROI' },
            { step: 2, title: 'POC 试跑 · 1-2 周', body: '基于客户 SKU 样本调 prompt,在 SaaS 版跑 10-20 个真实新品,对比客户手工时间/成本' },
            { step: 3, title: '合同定稿 · 1 周', body: 'DPA / SLA / 定制范围 / 里程碑 / 验收标准明确,法务双签' },
            { step: 4, title: '本地部署 · 1-2 周', body: 'Docker 镜像交付 + 客户运维对接 + 管理员培训 1 场' },
            { step: 5, title: '持续优化', body: '月度数据复盘 · 品类调教迭代 · 合同内免费 Pipeline 升级' },
          ].map(s => (
            <div key={s.step} className="flex gap-4 p-4 border border-border-subtle rounded-md bg-bg-surface/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/40 flex items-center justify-center text-accent font-mono text-[13px] tabular-nums">
                {s.step}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-text-primary mb-1">{s.title}</div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 合规清单 */}
      <section className="mb-10 p-6 border border-border-subtle rounded-md bg-bg-surface">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          合规 · 法务尽调清单
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/legal/dpa" className="flex items-center gap-2 p-3 border border-border-subtle rounded hover:border-accent/40 hover:bg-bg-raised transition-all">
            <span className="text-[14px]">📄</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-text-primary">DPA 模板</div>
              <div className="text-[10px] font-mono text-text-tertiary">GDPR Article 28 · 12 条款</div>
            </div>
            <span className="text-[10px] text-accent">查看 →</span>
          </Link>
          <Link href="/privacy" className="flex items-center gap-2 p-3 border border-border-subtle rounded hover:border-accent/40 hover:bg-bg-raised transition-all">
            <span className="text-[14px]">🔒</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-text-primary">隐私政策</div>
              <div className="text-[10px] font-mono text-text-tertiary">含子处理者清单 · 跨境传输声明</div>
            </div>
            <span className="text-[10px] text-accent">查看 →</span>
          </Link>
          <Link href="/terms" className="flex items-center gap-2 p-3 border border-border-subtle rounded hover:border-accent/40 hover:bg-bg-raised transition-all">
            <span className="text-[14px]">📋</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-text-primary">服务条款</div>
              <div className="text-[10px] font-mono text-text-tertiary">SLA / 退款 / 开票 / 数据处理边界</div>
            </div>
            <span className="text-[10px] text-accent">查看 →</span>
          </Link>
          <Link href="/status" className="flex items-center gap-2 p-3 border border-border-subtle rounded hover:border-accent/40 hover:bg-bg-raised transition-all">
            <span className="text-[14px]">🟢</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-text-primary">实时状态</div>
              <div className="text-[10px] font-mono text-text-tertiary">SLA 可观测 · 公开健康指标</div>
            </div>
            <span className="text-[10px] text-accent">查看 →</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          企业尽调常见问题
        </div>
        <div className="space-y-2">
          {[
            ['本地部署怎么交付?', 'Docker Compose + K8s manifest 两种方案。客户内网 Linux 服务器或私有云 (阿里云/腾讯云/AWS) 都支持。交付后我方远程协助运维,合同内免费。'],
            ['客户数据去哪?', 'Enterprise 本地部署版本,客户数据全程不出内网。推理发生在客户方部署的推理节点 (可用本地大模型 / 客户自有的阿里云账户)。我方零访问客户业务数据。'],
            ['品类调教需要客户什么配合?', '一次性提供 50-100 条真实 SKU 样本 (合规脱敏即可) + 10-20 条期望输出标准样本。作者团队 1-2 周完成 prompt 迭代 + 对比测试。'],
            ['合同违约 / SLA 赔偿怎么约定?', '99.9% 月度可用性,每下降 0.1% 按月度 SLA 费 10% 扣减,上限 50%。详见合同第 11 条标准模板。'],
            ['能不能按需求定制 Pipeline?', 'Enterprise 标准方案含 1 条定制 Pipeline (30 人天内)。超出按 ¥3000-5000/人天 计费。'],
            ['离职怎么办? 只有你一个人?', '合同约定源代码托管到 GitHub 私有 repo + 备份到客户方。作者不可用时,客户自动获得完整代码所有权 (escrow 条款)。'],
          ].map(([q, a], i) => (
            <details key={i} className="border border-border-subtle rounded-md p-4 hover:bg-bg-surface/50">
              <summary className="text-[13px] font-semibold text-text-primary cursor-pointer list-none flex items-center justify-between">
                {q}
                <span className="text-accent text-[11px] font-mono">+</span>
              </summary>
              <p className="text-[12px] text-text-secondary mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 预约 */}
      <section className="p-6 border border-accent/40 bg-accent/5 rounded-md text-center">
        <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-2">
          下一步 · 预约诊断访谈
        </div>
        <h2 className="text-[18px] font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
          先聊 30 分钟,再决定要不要 POC
        </h2>
        <p className="text-[12px] text-text-secondary mb-4 max-w-[520px] mx-auto leading-relaxed">
          访谈免费,不推销。作者本人对接 (不走销售)。结束后给你书面的"要不要做 POC"建议,你自己判断。
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/inquire?from=enterprise"
            className="px-5 py-2.5 bg-accent text-bg-root rounded-md text-[13px] font-semibold hover:bg-accent-hover"
          >
            📨 提交询盘 · 24h 内联系 →
          </Link>
          <a
            href="mailto:zachary.x.pku@gmail.com?subject=Wenai%20Enterprise%20%E8%AF%8A%E6%96%AD%E8%AE%BF%E8%B0%88&body=%E5%85%AC%E5%8F%B8%3A%0A%E4%B8%BB%E8%90%A5%E5%93%81%E7%B1%BB%3A%0A%E8%A7%84%E6%A8%A1%3A%0A%E5%B8%8C%E6%9C%9B%E8%A7%A3%E5%86%B3%E7%9A%84%E6%A0%B8%E5%BF%83%E7%97%9B%E7%82%B9%3A"
            className="px-5 py-2.5 border border-border-default text-[13px] font-mono text-text-primary hover:border-accent/40 rounded-md"
          >
            📧 或直接邮件
          </a>
          <Link href="/cases" className="px-5 py-2.5 border border-border-default text-[13px] font-mono text-text-primary hover:border-accent/40 rounded-md">
            先看 4 个案例
          </Link>
        </div>
      </section>
    </div>
  );
}
