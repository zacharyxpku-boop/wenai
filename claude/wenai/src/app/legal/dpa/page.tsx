'use client';

export default function DPAPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-6 pb-5 border-b border-border-subtle">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          数据处理协议（Data Processing Agreement · DPA）
        </h1>
        <div className="text-[11px] font-mono text-text-tertiary">
          版本 1.0 · 生效 {today} · 遵循 GDPR Article 28 + 个人信息保护法
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="text-[11px] font-mono text-accent border border-accent/30 rounded px-3 py-1.5 hover:bg-accent/10"
          >
            🖨 打印 / 导出 PDF
          </button>
          <a
            href="mailto:zachary.x.pku@gmail.com?subject=Wenai%20DPA%20signed"
            className="text-[11px] font-mono text-text-secondary border border-border-default rounded px-3 py-1.5 hover:border-accent/30"
          >
            📧 邮件申请签署版
          </a>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed text-text-secondary space-y-5 [&_h2]:text-text-primary [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:mt-7 [&_h2]:mb-2 [&_h3]:text-[13px] [&_h3]:text-text-primary [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1">

        <div className="p-4 border border-accent/30 bg-accent/5 rounded-md text-[11px] text-text-secondary">
          <strong className="text-accent">使用说明</strong>：本文件是 Team / Enterprise 订阅客户可签署的
          DPA 模板。签署流程：打印 → 法务审核 → 盖章回传 → 我方反签 → 邮件归档。
          本在线版供预览。正式签署请联系 <code>zachary.x.pku@gmail.com</code> 索取 Word / PDF 双签版。
        </div>

        <h2>1. 定义</h2>
        <p>本协议中使用的术语含义如下：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>&ldquo;客户&rdquo;</strong>（Controller）：订阅 wenai 服务的企业或组织</li>
          <li><strong>&ldquo;服务提供方&rdquo;</strong>（Processor）：wenai 运营方</li>
          <li><strong>&ldquo;个人数据&rdquo;</strong>：客户通过 wenai 处理的、含可识别自然人信息的数据</li>
          <li><strong>&ldquo;处理&rdquo;</strong>：对个人数据进行的任何操作，包括收集、存储、使用、披露、删除</li>
          <li><strong>&ldquo;子处理者&rdquo;</strong>：wenai 聘用的、代表其执行数据处理的第三方</li>
        </ul>

        <h2>2. 数据处理范围与目的</h2>
        <h3>2.1 处理对象</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>客户提交给 AI 模块的输入文本（商品信息、评论、邮件草稿等）</li>
          <li>使用过程中生成的调用日志（时间、调用次数、token 消耗）</li>
          <li>客户账户信息（用户名、邀请码）</li>
        </ul>
        <h3>2.2 处理目的</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>向客户提供 Pipeline 和单模块 AI 服务</li>
          <li>生成聚合统计以计费和限速</li>
          <li>响应客户发起的数据主体权利请求</li>
        </ul>
        <h3>2.3 处理期限</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>输入文本：处理即销毁，不持久化</li>
          <li>调用日志：90 天</li>
          <li>账户信息：订阅期内 + 订阅结束后 30 天（供数据导出用），之后删除</li>
        </ul>

        <h2>3. 服务提供方义务</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>仅按客户指示处理数据，不用于任何其他目的</li>
          <li>对处理数据的员工签订保密协议</li>
          <li>采取适当的技术与组织措施（见第 5 条）</li>
          <li>协助客户响应数据主体权利请求（访问 / 更正 / 删除 / 导出）</li>
          <li>发生数据泄露时 72 小时内通知客户</li>
          <li>协助客户进行数据保护影响评估（DPIA）</li>
          <li>合同终止后按客户指示删除或返还所有数据</li>
        </ol>

        <h2>4. 子处理者</h2>
        <p>客户授权 wenai 使用下列子处理者。新增或替换子处理者时，wenai 将至少提前 14 天通知客户。客户有权在合理理由下反对新增子处理者。</p>
        <div className="overflow-x-auto my-3">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-2 pr-3">子处理者</th>
                <th className="text-left py-2 pr-3">用途</th>
                <th className="text-left py-2">所在地</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr><td className="py-2 pr-3">阿里云 DashScope</td><td className="py-2 pr-3">AI 推理</td><td className="py-2">中国</td></tr>
              <tr><td className="py-2 pr-3">DeepSeek</td><td className="py-2 pr-3">AI 推理</td><td className="py-2">中国</td></tr>
              <tr><td className="py-2 pr-3">Vercel Inc.</td><td className="py-2 pr-3">托管</td><td className="py-2">美国</td></tr>
              <tr><td className="py-2 pr-3">Upstash</td><td className="py-2 pr-3">缓存 / 限速</td><td className="py-2">美国</td></tr>
            </tbody>
          </table>
        </div>

        <h2>5. 技术与组织安全措施</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>所有网络通信使用 TLS 1.2+ 加密</li>
          <li>JWT 令牌使用 HS256 签名，HttpOnly + Secure Cookie 传输</li>
          <li>密码使用加盐 SHA-256 哈希存储</li>
          <li>生产环境 JWT_SECRET / PASSWORD_SALT 通过 Vercel 环境变量管理，不入代码库</li>
          <li>Upstash Redis 使用 ACL Token 隔离</li>
          <li>最小权限原则：仅授权人员可访问生产系统</li>
          <li>Enterprise 本地部署版本支持客户自有 VPC / 内网隔离</li>
        </ol>

        <h2>6. 跨境数据传输</h2>
        <p>默认 SaaS 部署中，数据可能在下列地点间传输：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>中国（阿里云推理）</li>
          <li>美国（Vercel 托管、Upstash 缓存）</li>
        </ul>
        <p>跨境传输依据：客户对本 DPA 及服务条款的签署，构成对跨境传输的明示同意。Enterprise 客户可要求本地部署以完全避免跨境传输。</p>

        <h2>7. 数据主体权利支持</h2>
        <p>wenai 将在客户收到数据主体请求后的 10 个工作日内协助提供必要数据或执行删除，配合客户履行其控制者义务。</p>

        <h2>8. 审计权</h2>
        <p>Team 订阅：客户可每年 1 次书面查询 wenai 的合规状态。</p>
        <p>Enterprise 订阅：合同约定的审计范围和频率，通常含每年 1 次远程审计（Q&A 形式）或第三方审计报告（如 SOC 2）。</p>

        <h2>9. 违约与赔偿</h2>
        <p>因 wenai 违反本 DPA 导致客户直接损失的，wenai 按订阅合同约定的责任上限承担赔偿。</p>

        <h2>10. 生效与终止</h2>
        <p>本 DPA 随订阅合同生效，订阅终止后 30 天内 wenai 完成数据删除并出具确认函。</p>

        <h2>11. 适用法律与争议解决</h2>
        <p>本协议适用中华人民共和国法律。争议由上海仲裁委员会仲裁解决，仲裁地为上海。</p>

        <h2>12. 签署栏（正式版）</h2>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <div className="text-[11px] font-mono text-text-tertiary mb-1">客户方（Controller）</div>
            <div className="h-16 border-b border-border-default mb-2"></div>
            <div className="text-[10px] text-text-tertiary">签字 / 盖章 / 日期</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-text-tertiary mb-1">服务方（Processor）· wenai</div>
            <div className="h-16 border-b border-border-default mb-2"></div>
            <div className="text-[10px] text-text-tertiary">签字 / 盖章 / 日期</div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-subtle text-[10px] font-mono text-text-tertiary">
          附：本模板仅作参考，正式签署版需在企业法务和我方复核后定稿。邮件索取 Word 双签版：
          <code>zachary.x.pku@gmail.com</code>
        </div>
      </div>
    </div>
  );
}
