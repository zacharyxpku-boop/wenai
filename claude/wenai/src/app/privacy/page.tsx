export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-5">
        隐私政策
      </h1>

      {/* Hard pledge banner — 内测期明确兜底 */}
      <div className="mb-8 p-5 border-l-2 border-accent bg-bg-surface rounded-r-md">
        <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-3">
          内测期数据承诺
        </div>
        <ul className="space-y-2 text-[13px] text-text-primary font-semibold">
          <li className="flex gap-2.5">
            <span className="text-accent">✓</span>
            <span>你输入的商品信息/评论/竞品数据 <span className="text-accent">不落库</span> — 处理完即丢</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-accent">✓</span>
            <span>你的数据 <span className="text-accent">不训练模型</span> — 第三方协议已审查确认</span>
          </li>
          <li className="flex gap-2.5">
            <span className="text-accent">✓</span>
            <span>关闭浏览器即 <span className="text-accent">清除</span> — 我们只保留调用次数统计（无内容）</span>
          </li>
        </ul>
        <p className="mt-3 pt-3 border-t border-border-subtle text-[11px] text-text-tertiary">
          如有疑问，加微信 <span className="font-mono text-accent">zachary.x.pku@gmail.com</span> 找作者本人确认。
        </p>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-text-secondary text-[13px] leading-relaxed space-y-6 [&_h2]:text-text-primary [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3">
        <p className="text-[11px] font-mono text-text-tertiary">最后更新：2026年4月17日（内测版）</p>

        <h2>1. 信息收集</h2>
        <p>本平台收集以下类型的信息：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>账户信息</strong>：用户名（不收集真实姓名、手机号、邮箱等个人身份信息）</li>
          <li><strong>使用数据</strong>：模块调用次数、时间戳、token消耗量、用户评分反馈</li>
          <li><strong>输入内容</strong>：您提交给AI处理的文本、CSV文件、图片等业务数据</li>
        </ul>

        <h2>2. 信息用途</h2>
        <p>收集的信息仅用于：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>提供和改善AI辅助服务</li>
          <li>统计使用量以进行服务限额管理</li>
          <li>生成匿名化的服务质量统计</li>
        </ul>
        <p>我们不会将您的业务数据出售给第三方，也不会用于AI模型训练。</p>

        <h2>3. 第三方数据处理</h2>
        <p>您提交的输入内容将传输至以下第三方服务进行处理：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>阿里云通义千问（Qwen）</strong>：用于AI文本生成。数据传输遵循阿里云数据安全协议</li>
          <li><strong>阿里云OCR</strong>（仅图文翻译模块）：用于图片文字识别</li>
        </ul>
        <p>我们已审查上述服务商的数据处理协议，确认其不会将客户输入数据用于模型训练。</p>

        <h2>4. 数据存储与保留</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>使用统计数据保留于服务器本地，不超过90天</li>
          <li>用户输入内容不做持久化存储，处理完成后即丢弃</li>
          <li>会话令牌（JWT）有效期7天，过期后自动失效</li>
          <li>Demo模式会话有效期2小时</li>
        </ul>

        <h2>5. 数据安全</h2>
        <p>我们采取以下措施保护您的数据：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>所有API通信使用HTTPS加密传输</li>
          <li>密码使用加盐SHA-256哈希存储，不保存明文</li>
          <li>会话令牌采用HS256签名的JWT，HttpOnly Cookie传输</li>
          <li>部署平台（Vercel）通过SOC 2 Type II认证</li>
        </ul>

        <h2>6. 您的权利</h2>
        <p>根据《个人信息保护法》、GDPR（若适用）及其他可适用法律，您享有以下权利：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>查询（Access）您的账户信息及使用数据</li>
          <li>更正（Rectify）不准确的个人信息</li>
          <li>删除（Erasure）您的使用数据</li>
          <li>导出（Portability）您的数据（结构化 JSON 格式）</li>
          <li>撤回（Withdraw）对数据处理的同意</li>
          <li>投诉（Complaint）至所在地数据保护机构</li>
        </ul>
        <p>行使上述权利，邮件至：<code>zachary.x.pku@gmail.com</code>，主题注明 &ldquo;数据权利请求 · [请求类型]&rdquo;，我们在 14 天内响应。</p>

        <h2>7. 子处理者清单（Subprocessors）</h2>
        <p>我们使用以下第三方服务来提供 wenai。每个子处理者均已审查其数据处理协议：</p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left py-2 pr-3 font-mono text-text-tertiary text-[10px] uppercase">供应商</th>
                <th className="text-left py-2 pr-3 font-mono text-text-tertiary text-[10px] uppercase">用途</th>
                <th className="text-left py-2 pr-3 font-mono text-text-tertiary text-[10px] uppercase">所在国</th>
                <th className="text-left py-2 font-mono text-text-tertiary text-[10px] uppercase">DPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <td className="py-2 pr-3 font-semibold">阿里云 DashScope</td>
                <td className="py-2 pr-3">AI 模型推理（通义千问 Qwen）</td>
                <td className="py-2 pr-3">中国</td>
                <td className="py-2"><a href="https://help.aliyun.com/legal" className="text-accent underline">查看</a></td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">DeepSeek</td>
                <td className="py-2 pr-3">AI 模型推理（备选）</td>
                <td className="py-2 pr-3">中国</td>
                <td className="py-2"><a href="https://deepseek.com" className="text-accent underline">查看</a></td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Vercel</td>
                <td className="py-2 pr-3">应用托管与边缘执行</td>
                <td className="py-2 pr-3">美国</td>
                <td className="py-2"><a href="https://vercel.com/legal/dpa" className="text-accent underline">查看</a></td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Upstash Redis</td>
                <td className="py-2 pr-3">速率限制与反馈存储</td>
                <td className="py-2 pr-3">美国</td>
                <td className="py-2"><a href="https://upstash.com/trust" className="text-accent underline">查看</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-text-tertiary">
          我们新增或替换子处理者时，会在 14 天内更新本表。Enterprise 客户可订阅子处理者变更邮件通知。
        </p>

        <h2>8. 跨境数据传输</h2>
        <p>当前默认部署在 Vercel（美国节点）。您的输入数据在处理过程中可能经过：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Vercel 边缘节点（美国）— 应用层处理</li>
          <li>阿里云 DashScope（中国）— AI 推理</li>
          <li>Upstash Redis（美国）— 使用统计缓存</li>
        </ul>
        <p>
          输入内容不做持久化存储，仅在处理过程中经过上述节点。
          <strong>Enterprise 客户</strong>可选择本地部署或私有云方案，所有数据处理均发生在客户方指定的内网 / 私有云内，不跨境。
        </p>

        <h2>9. Cookie 使用</h2>
        <p>本平台仅使用必要的功能性 Cookie：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><code>wenai-session</code>：会话令牌（HttpOnly、Secure），7 天有效期</li>
        </ul>
        <p>不使用追踪 Cookie、不使用第三方分析工具（Google Analytics / Mixpanel / Hotjar 等均未接入）。</p>

        <h2>10. 儿童隐私</h2>
        <p>wenai 为面向企业用户的 SKU 上新工作流子站，不面向 18 岁以下未成年人。我们不会故意收集未成年人的个人信息。</p>

        <h2>11. 政策变更</h2>
        <p>本政策如有重大变更（含子处理者清单扩展、数据保留周期调整、跨境传输范围变化等），我们将至少提前 14 天通过站内公告及注册邮箱通知。继续使用即视为接受变更。</p>

        <h2>12. DPA（数据处理协议）</h2>
        <p>POC 与 Enterprise 接入可按主站订单或双方合同签署数据处理协议（DPA），遵循 GDPR 第 28 条。请邮件 <code>zachary.x.pku@gmail.com</code> 索取 DPA 模板。</p>

        <h2>联系方式</h2>
        <p>数据保护相关问题：<code>zachary.x.pku@gmail.com</code>（主题：数据保护 / DPA / 子处理者变更订阅）</p>
      </div>
    </div>
  );
}
