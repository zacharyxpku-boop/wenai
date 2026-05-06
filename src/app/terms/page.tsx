export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-8">
        服务条款
      </h1>
      <div className="prose prose-invert prose-sm max-w-none text-text-secondary text-[13px] leading-relaxed space-y-6 [&_h2]:text-text-primary [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3">
        <p className="text-[11px] font-mono text-text-tertiary">最后更新：2026年4月13日</p>

        <h2>1. 服务概述</h2>
        <p>Wenai（以下简称&ldquo;本平台&rdquo;）是一款面向跨境电商企业的AI辅助工具，提供翻译、文案生成、竞品分析、合规检测等功能。本平台由深圳市原点智学科技有限公司运营。</p>

        <h2>2. 使用条件</h2>
        <p>使用本平台即表示您同意以下条款。本平台仅供企业用户合法商业用途使用，您需确保拥有处理所提交数据的合法权利。</p>

        <h2>3. AI生成内容免责</h2>
        <p>本平台所有AI生成内容（包括但不限于翻译结果、文案建议、竞品分析、合规扫描结果）均为辅助参考，不构成专业意见或法律建议。您应当：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>对AI输出内容进行人工审核后方可用于商业用途</li>
          <li>不将合规扫描结果作为法律合规的唯一依据</li>
          <li>就知识产权相关事项咨询持证律师</li>
        </ul>

        <h2>4. 商标检测声明</h2>
        <p>本平台的知识产权合规模块使用内置的 USPTO 商标参考数据库（覆盖约 500+ 品牌、19 大品类），提供初步筛查。存在漏检可能，检测结果仅提示潜在风险，不等同于法律意见。任何商标侵权风险的最终判断应以专业商标律师的意见为准。</p>

        <h2>5. 数据处理</h2>
        <p>您提交的文本、文件等输入数据将通过第三方 AI 模型服务商进行处理（当前主要使用阿里云通义千问 DashScope 或 DeepSeek）。我们不会将您的业务数据用于模型训练。子处理者清单详见《隐私政策》第 7 条。</p>

        <h2>6. 使用限制</h2>
        <p>为保障服务质量，Pipeline 和单模块均设有调用上限，具体配额如下：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Free（内测版）</strong>：10 次 Pipeline / 天；单模块 50 次 / 天</li>
          <li><strong>10 SKU POC</strong>：以接入订单开通临时额度, 用于真实 SKU 交付验证</li>
          <li><strong>Enterprise（企业定制）</strong>：无限配额（按合同约定）</li>
        </ul>
        <p>禁止通过技术手段绕过使用限制。</p>

        <h2>7. 服务等级（SLA）</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>演示环境</strong>：按「现状」提供，不保证可用性或业务效果</li>
          <li><strong>POC</strong>：交付窗口、响应方式、复改次数以接入订单为准</li>
          <li><strong>Enterprise</strong>：SLA、赔偿、响应等级和例外情况按双方合同约定</li>
        </ul>
        <p>AI 模型服务可能因第三方 API 波动而暂时不可用，此时系统将返回明确错误并建议重试。仅 demo 模式（带 <code>?demo=1</code> 查询参数）会使用预缓存结果。</p>

        <h2>8. 责任限制</h2>
        <p>在法律允许的最大范围内，本平台不对因使用 AI 生成内容而产生的直接或间接损失承担责任，包括但不限于因商标侵权、listing 违规、翻译错误导致的商业损失。POC 及 Enterprise 的具体责任边界以接入订单或合同为准。</p>

        <h2>9. 接入、合同与退款</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>本子站用于产品介绍、演示与接入需求收集，不直接处理线上收款。</li>
          <li>POC、企业接入、SLA、发票与退款安排，以主站或双方签署的合同/订单为准。</li>
          <li>演示环境仅用于评估流程，不构成已购买服务、固定 SLA 或退款承诺。</li>
        </ul>

        <h2>10. 开票与发票</h2>
        <p>POC 及 Enterprise 接入支持按主站订单或双方合同开具发票。需要开票请按主站支付/合同流程提交公司全称、税号和开票信息。</p>

        <h2>11. 数据处理边界</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>输入数据：处理完毕后即刻销毁，不做持久化存储（Enterprise 本地部署版本数据全程保留客户方）</li>
          <li>会话令牌（JWT）：7 天后自动失效</li>
          <li>Demo 会话：2 小时后自动失效</li>
          <li>使用统计：仅保留调用次数、时间戳、token 消耗量等聚合数据，不含输入内容，保留 90 天</li>
          <li>内测期用户反馈（含评论文本）：保留于 Upstash Redis 或本地 JSON，保留 200 条 / 模块，仅用于产品迭代</li>
        </ul>

        <h2>12. 条款变更</h2>
        <p>我们保留随时修改本条款的权利。重大变更（如定价、数据处理范围）将提前 14 天通过邮件或站内通知。继续使用本平台即视为接受修改后的条款。</p>

        <h2>联系方式</h2>
        <p>如有问题，请通过平台内反馈功能或邮件联系：<code>zachary.x.pku@gmail.com</code></p>
      </div>
    </div>
  );
}
