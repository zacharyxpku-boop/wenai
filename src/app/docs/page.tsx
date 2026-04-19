import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '使用手册 · wenai',
  description: '3 条 Pipeline 使用细则 + 五品类选择指南 + Excel Mail Merge 设置 + 常见坑',
};

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: 'quick-start',
    title: '⚡ 3 分钟上手',
    body: (
      <div className="space-y-3">
        <p>三种路径任选:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>首页 "Hero 卡" 下面点 <code className="bg-bg-raised px-1 rounded">⚡ 15 秒 demo</code>,自动灌入 HOMELODY 收纳盒示例跑完</li>
          <li>点任意 Pipeline 卡上的 <code className="bg-bg-raised px-1 rounded">⚡ demo</code> 小 chip</li>
          <li>进 Pipeline 页手动选品类 + 贴 SKU + 点 "开始"</li>
        </ol>
        <div className="p-3 bg-bg-raised/50 rounded text-[11px] font-mono text-text-secondary">
          Free 每天 10 次 Pipeline 配额 · 单模块 50 次 · 配额 UTC 0 点重置
        </div>
      </div>
    ),
  },
  {
    id: 'pipeline-01',
    title: 'Pipeline 01 · 新品上新流水线',
    body: (
      <div className="space-y-3">
        <p><strong>做什么</strong>: 1 条 SKU 并行跑 翻译 / 文案 / 合规 三路,30-45 秒闭环。</p>
        <p><strong>Step 1 选品类</strong> (必选):</p>
        <ul className="list-disc pl-5 space-y-1 text-[12px]">
          <li>🏠 家居用品 · 强调 FDA/BPA-Free/LFGB · 场景化描述</li>
          <li>🚗 汽摩配件 · 兼容车型三元组 · FCC/CE/车规</li>
          <li>🔌 数码电子 · 精确参数单位 · 避免 Apple 商标近似词</li>
          <li>🔧 工具工艺 · 精度/安全等级 · UL/CAT III</li>
          <li>☕ 生活百货 · 材质认证 · 保温性能测试数字</li>
        </ul>
        <p><strong>Step 2 贴 SKU 信息</strong> (200-800 字最佳):</p>
        <div className="p-3 bg-bg-raised/50 rounded text-[11px] font-mono text-text-secondary whitespace-pre-line">{`推荐格式:
产品名称
卖点 1 · 卖点 2 · 卖点 3 ...
核心参数 (尺寸/材质/认证)
目标市场`}</div>
        <p><strong>批量模式</strong>: tab 切换。多条 SKU 用 <code className="bg-bg-raised px-1 rounded">---</code> 分隔,最多 20 条。串行执行避免速率撞墙。导出 Excel 4 sheet。</p>
        <p><strong>失败重试</strong>: 批量表里失败行旁点 <code className="bg-bg-raised px-1 rounded">↻ 重试</code> 单独补,已成功的保留。</p>
      </div>
    ),
  },
  {
    id: 'pipeline-02',
    title: 'Pipeline 02 · 达人批量冷启',
    body: (
      <div className="space-y-3">
        <p><strong>做什么</strong>: 贴达人名单出个性化邮件,Excel 喂 Gmail Mail Merge。</p>
        <p><strong>Step 1 品牌信息</strong>: 品牌 / 产品 / 价格 / 卖点 / 预算 / 合作目标六字段必填。可点 "塞入示例" 快速填 HOMELODY 收纳盒。</p>
        <p><strong>Step 2 达人名单</strong>: 每行一条,格式:</p>
        <pre className="p-3 bg-bg-raised/50 rounded text-[11px] font-mono text-text-secondary">名字 | 平台 | 粉丝量 | 赛道 | 邮箱(可选)</pre>
        <p>最多 10 条。作者 prompt 根据粉丝量+平台自动选调性:</p>
        <ul className="list-disc pl-5 space-y-1 text-[12px]">
          <li>&lt; 50K · 共情版 (平等协作感 + commission + free sample)</li>
          <li>50-200K · 主动版 (品牌价值观 + creative freedom + 固定 fee)</li>
          <li>&gt; 200K · 数据版 (campaign context + performance bonus)</li>
          <li>TikTok 活泼 / YouTube 深度 / Instagram 视觉</li>
        </ul>
        <p><strong>Gmail Mail Merge 集成</strong>: 下 Excel 后:</p>
        <ol className="list-decimal pl-5 space-y-1 text-[12px]">
          <li>打开 Gmail → 扩展菜单 → 装 Yet Another Mail Merge (YAMM) 或 Mailmeteor</li>
          <li>上传 Excel 文件,选择 Mail Merge sheet</li>
          <li>映射: 邮箱列 / Subject 列 / Body 列</li>
          <li>建议首日只发 20-50 封测试回复率,再放量</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'pipeline-03',
    title: 'Pipeline 03 · AI 电商主图',
    body: (
      <div className="space-y-3">
        <p><strong>做什么</strong>: 选场景预设 → 通义万相生 5 张图 (主图 / 场景 / 细节 / 使用 / 对比)。</p>
        <p><strong>Step 1 选品类 + 场景</strong> (5 品类 × 3 场景 = 15 预设),例如家居可选:</p>
        <ul className="list-disc pl-5 space-y-1 text-[12px]">
          <li>厨房台面 · 晨光北欧风</li>
          <li>食品储藏室 · 暖光 Pinterest 风</li>
          <li>客厅桌面 · 胡桃木+多肉</li>
        </ul>
        <p><strong>Step 2 贴商品信息</strong>: 会被注入 prompt,wanx 原生中文,别写太长影响理解。</p>
        <p><strong>Step 3 勾选输出</strong>: 默认 5 种全勾,可按需取消。单独生 1 张也可以,省成本。</p>
        <p><strong>Step 4 点开始</strong>: 并行提交,~10 秒出齐。商标词 (AirPods / Apple / Sony 等) 自动替换为 <code>[brand]</code> 避免侵权。</p>
        <div className="p-3 border border-accent/30 bg-accent/5 rounded text-[11px] text-text-secondary">
          ⏳ <strong>重要</strong>: wanx 返回的图片 URL 24 小时后失效。要交付就立即点 <code className="bg-bg-raised px-1">⬇ 一键打包 ZIP</code> 下载到本地。
          分享链接超过 24h 图会 404。
        </div>
      </div>
    ),
  },
  {
    id: 'share',
    title: '🔗 公开分享给老板',
    body: (
      <div className="space-y-3">
        <p>每个 Pipeline 结果页都有 <code className="bg-bg-raised px-1 rounded">🔗 分享</code> 按钮。</p>
        <ol className="list-decimal pl-5 space-y-1 text-[12px]">
          <li>点分享 → 生成 /share/&lt;id&gt; 公开链接 7 天有效</li>
          <li>手机端调起微信/企业微信原生分享面板</li>
          <li>桌面端复制链接到剪贴板</li>
          <li>老板打开看到完整产出 + wenai 品牌 + 申请邀请码 CTA</li>
        </ol>
        <p>分享页动态生成 OG 图,微信/Twitter 转发时卡片预览带真实内容摘要。</p>
      </div>
    ),
  },
  {
    id: 'upgrade',
    title: '💎 升级到 Team / Enterprise',
    body: (
      <div className="space-y-3">
        <p>内测 7 天配额花光 (10 次 Pipeline/天 × 7 = 70 次) 后:</p>
        <ul className="list-disc pl-5 space-y-1 text-[12px]">
          <li><strong>Team ¥499/月</strong>: 500 次 Pipeline/天 × 5 席 · 付款页扫码 24h 内开通</li>
          <li><strong>Enterprise 面议</strong>: 本地部署 + 品类深度调教 + SLA 99.9% · <Link href="/enterprise" className="text-accent underline">看详情</Link></li>
        </ul>
        <p>Sidebar 底部会显示当前剩余天数,≤ 7 天金字提醒,≤ 3 天红字,过期红底。</p>
      </div>
    ),
  },
  {
    id: 'troubleshoot',
    title: '🐛 常见坑 / 排查',
    body: (
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-text-primary">Pipeline 跑到一半报错 &ldquo;AI 服务繁忙&rdquo;</p>
          <p className="text-[11px] text-text-secondary mt-1">阿里云 DashScope 偶发限流,等 10s 点 <code className="bg-bg-raised px-1">重试</code>。如持续,看 <Link href="/status" className="text-accent underline">/status</Link> 系统状态。</p>
        </div>
        <div>
          <p className="font-semibold text-text-primary">配额用完怎么办</p>
          <p className="text-[11px] text-text-secondary mt-1">Sidebar 看剩余天数判断:还在内测期可联系作者提额,已到期去 <Link href="/pricing" className="text-accent underline">/pricing</Link> 升级 Team。</p>
        </div>
        <div>
          <p className="font-semibold text-text-primary">Pipeline 03 图几天后打不开</p>
          <p className="text-[11px] text-text-secondary mt-1">wanx 签名 URL 24h 失效。生成后立即下 ZIP 存档,分享链接里的图也是一样过期。分享前告知对方"7 天内看,图 24h 刷新"。</p>
        </div>
        <div>
          <p className="font-semibold text-text-primary">邮件发出去被标垃圾</p>
          <p className="text-[11px] text-text-secondary mt-1">Pipeline 02 每条独立个性化已降低风险。首日建议发 20-50 封测,回复率&lt;3% 可能是邮箱信誉问题 (不是 wenai 问题),联系 Google Postmaster / 预热新域名。</p>
        </div>
        <div>
          <p className="font-semibold text-text-primary">老板看分享链接打不开</p>
          <p className="text-[11px] text-text-secondary mt-1">分享 7 天 TTL,过期重新生成。Pipeline 03 图 24h TTL,过期要重新跑 Pipeline 03 生图。</p>
        </div>
      </div>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-[1000px] mx-auto py-10 px-6">
      <div className="mb-8 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          DOCS · 使用手册
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          wenai 使用细则
        </h1>
        <p className="text-[13px] text-text-secondary max-w-[620px] mx-auto">
          卡住时先查手册。找不到答案再联系作者,能把作者的时间省下来继续迭代产品。
        </p>
      </div>

      {/* TOC */}
      <div className="mb-6 p-4 border border-border-subtle rounded-md bg-bg-surface/50">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2">
          目录
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="text-[12px] text-text-secondary hover:text-accent truncate">
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {SECTIONS.map(s => (
          <section key={s.id} id={s.id} className="scroll-mt-6">
            <h2 className="text-[18px] font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)] border-l-2 border-accent pl-3">
              {s.title}
            </h2>
            <div className="text-[12px] text-text-secondary leading-[1.8]">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      {/* 联系 */}
      <div className="mt-12 pt-6 border-t border-border-subtle text-center">
        <p className="text-[11px] text-text-secondary mb-2">手册没解答的问题?</p>
        <a href="mailto:zachary.x.pku@gmail.com" className="text-[13px] font-mono text-accent hover:underline">
          zachary.x.pku@gmail.com →
        </a>
      </div>
    </div>
  );
}
