export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-xl font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-8">
        隐私政策
      </h1>
      <div className="prose prose-invert prose-sm max-w-none text-text-secondary text-[13px] leading-relaxed space-y-6 [&_h2]:text-text-primary [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3">
        <p className="text-[11px] font-mono text-text-tertiary">最后更新：2026年4月13日</p>

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
        <p>根据《个人信息保护法》，您享有以下权利：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>查询、更正您的账户信息</li>
          <li>要求删除您的使用数据</li>
          <li>撤回对数据处理的同意</li>
          <li>获取数据处理活动的说明</li>
        </ul>
        <p>行使上述权利，请联系：privacy@wenai.ai</p>

        <h2>7. Cookie使用</h2>
        <p>本平台仅使用必要的功能性Cookie（会话令牌），不使用任何追踪Cookie或第三方分析工具。</p>

        <h2>8. 政策变更</h2>
        <p>本政策如有重大变更，我们将在平台内通知。继续使用即视为接受变更后的政策。</p>

        <h2>联系方式</h2>
        <p>数据保护相关问题：privacy@wenai.ai</p>
      </div>
    </div>
  );
}
