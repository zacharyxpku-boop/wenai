import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '更新日志 · wenai',
  description: 'wenai 的每次大迭代和发布节点。产品持续在做,不是一次性 demo。',
};

interface Release {
  version: string;
  date: string;
  headline: string;
  highlights: string[];
  phase: string;
}

// 倒序 · 最新在上
const RELEASES: Release[] = [
  {
    version: 'v0.40',
    date: '2026-04-28',
    phase: 'Phase 12',
    headline: '助手化 · 主动找你 + 键盘流',
    highlights: [
      '/me dashboard 总览 · 4 大卡 (省钱/信号/今日花费/SKU 库) + 7 天信号趋势',
      '/me/alerts inbox · 6 类盲点信号自动盯 (stale/no-perf/cost-near-cap)',
      '/me/settings 邮件 push 偏好 · 严重度阈值 + 行业自报',
      'Daily digest cron · 北京 09:00 写快照, Resend/SendGrid 三档自动发邮件',
      'industry + SKU portfolio 双层注入 6 决策模块 prompt · AI 推荐质变',
      '⌘K 全局命令面板 · 跨 SKU/模块/me 子页瞬间跳',
      '? 键全局快捷键帮助 + vim 流 j/k 翻 SKU + / 聚焦搜索',
      '/me/skus 批量选 + 批量改状态 + 批量删 + 关键字搜索',
      'admin/alerts 跨 org 信号总览 · 谁该被打电话',
    ],
  },
  {
    version: 'v0.32',
    date: '2026-04-27',
    phase: 'Phase 11',
    headline: '飞轮 · 数据壁垒 + 拉新闭环',
    highlights: [
      'MOAT-11 跨 org 匿名 CTR/CPC benchmark (90 天滚动)',
      '/benchmark 公开 SEO 页 · 匿名分位 + 三档 redact 防反识别',
      '首页公开累计省钱计数器 · 7 天聚合 + easeOutCubic 动画',
      '/me/savings 战利品 + CSV/MD 导出 · 24 模块替代成本表',
      '内容哈希缓存铺到 video-teardown / ai-photoshoot / ai-video',
      'admin/cache + admin/cost 7/14/30 趋势图',
      '/api/share + /share/[id] 全模块 PLG 拉新通道',
      'SKU.performance 写读双向闭环 · ab-test → /me/skus → data-insights',
    ],
  },
  {
    version: 'v0.24',
    date: '2026-04-26',
    phase: 'Phase 10',
    headline: '工厂化 · SKU 全周期 + 决策深度',
    highlights: [
      'batch-launch 异步分片 · 20 SKU 上限解锁到 100',
      '/pipelines/customer-service 销售转化 Agent · SKU 全周期收尾',
      'video-teardown 行业模板 + SKU 联动 + 直跳影棚',
      'use-active-sku hook + ActiveSkuBadge 6 模块铺满',
      'cost-cap 真实对账 · admin/cost orgId × SKU 跨表',
      'SKU 库批量导入 (CSV/Excel · 上限 500)',
      'MOAT-09 SKU 复评提醒 · 上架超 30 天自动盯',
    ],
  },
  {
    version: 'v0.18',
    date: '2026-04-18',
    phase: 'Phase 8',
    headline: '收尾 · 可靠性 + 闭环',
    highlights: [
      '/changelog 页 + 首页统一 footer',
      'Pipeline 03 单图失败重生按钮',
      '3 Pipeline 独立 SEO metadata + 专属 OG 图',
      'Pipeline 01/02 批量失败条目单独重试',
      '首页 header 移动端响应式快改',
      '结果公开分享 /share/[id] 三 Pipeline 全覆盖',
      'Pipeline 03 ZIP 一键打包下载 + README.md',
    ],
  },
  {
    version: 'v0.15',
    date: '2026-04-18',
    phase: 'Phase 7',
    headline: '可观测 + 门面',
    highlights: [
      '/status + /api/health 健康检查 (4 依赖分级状态)',
      'SLA 承诺 surface · Team 99.5% / Enterprise 99.9%',
      '.env.example 完整同步 · WANX_MODEL / INVITE_ROSTER / FAL 预留',
      '/admin/metrics 跨端数据总览',
      '自定义 404 · sitemap.xml · robots.txt',
      '首页 health 降级警告 · 不让用户替系统背锅',
      'README 营销化 · badge + 架构图 + 快速入口表',
    ],
  },
  {
    version: 'v0.12',
    date: '2026-04-18',
    phase: 'Phase 6',
    headline: '对标 HotClaw · Pipeline 03 上线',
    highlights: [
      'Pipeline 03 AI 电商主图 alpha · 接通义万相 wanx2.1-t2i-turbo',
      'wanx prompt 全链路中文化 · 场景 15 预设',
      'Pipeline 01 ↔ 02 ↔ 03 三向联动 handoff banner',
      '15 秒 demo 路径覆盖 3 Pipeline · ?demo=1 统一',
      '/cases 补 Pipeline 03 案例 · 共 4 条 Before/After',
      'Pipeline 页底部案例信任锚链',
    ],
  },
  {
    version: 'v0.10',
    date: '2026-04-18',
    phase: 'Phase 5',
    headline: 'Pipeline 02 · 达人批量冷启',
    highlights: [
      '/pipelines/influencer-outbound 三段式',
      '专用 prompt 结构化 Subject/Body · 喂 Gmail YAMM',
      '粉丝量 + 平台自动选调性 (共情 / 主动 / 数据)',
      'Excel 双 sheet (Mail Merge + 品牌信息)',
      '首页 Pipeline 02 卡从 Coming Soon 真实装',
    ],
  },
  {
    version: 'v0.8',
    date: '2026-04-18',
    phase: 'Phase 4',
    headline: 'Pipeline 01 批量模式 + Excel',
    highlights: [
      '批量模式 tab · 最多 20 条 SKU',
      '--- 分隔 SKU · 串行跑避免速率撞墙',
      'Excel 4 工作表导出 (概览 + 3 步)',
      '单 SKU 模式加 Excel 导出按钮',
      'Pipeline 配额按 SKU 独立计数',
    ],
  },
  {
    version: 'v0.6',
    date: '2026-04-18',
    phase: 'Phase 3',
    headline: '付费链路 + 合规',
    highlights: [
      '/pricing 三档 (Free / Team ¥499 / Enterprise 面议)',
      '/pricing/checkout 手动审核 MVP (二维码 + 对公)',
      '/admin/payments 作者侧审核面板',
      'Terms v2 · 12 条款 · SLA / 退款 / 开票',
      'Privacy v2 · 子处理者清单 · 跨境传输声明',
      '/legal/dpa GDPR 第 28 条标准模板',
    ],
  },
  {
    version: 'v0.4',
    date: '2026-04-18',
    phase: 'Phase 2',
    headline: '聚焦重构 v2 · 1 Pipeline + Toolbox',
    highlights: [
      '废弃 19 模块平铺 · 立 Pipeline / Toolbox 二元',
      'Pipeline 01 新品上新流水线 HotClaw 三段式',
      '五品类专属 prompt 前缀库 · 家居/汽摩/数码/工具/生活百货',
      'Sidebar 重构 PIPELINES + TOOLBOX 分区',
    ],
  },
  {
    version: 'v0.2',
    date: '2026-04-18',
    phase: 'Phase 1',
    headline: '内测就绪',
    highlights: [
      '首触 3 卡片快速启动',
      '/invite?code=xxx 邀请链接系统',
      'BetaFeedback 轻量反馈三按钮',
      '错误真实化 · demo-cache 仅 ?demo=1',
      '/admin/feedback 反馈查看',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-[960px] mx-auto py-10 px-6">
      <div className="mb-8 text-center">
        <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-3">
          CHANGELOG · 2026
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
          更新日志
        </h1>
        <p className="text-[13px] text-text-secondary max-w-[600px] mx-auto">
          wenai 的每次大迭代节点。每一条都对应 GitHub 上的真实 commit。
          产品持续在做,不是一次性 demo。
        </p>
      </div>

      {/* Release timeline */}
      <div className="space-y-6">
        {RELEASES.map((r, i) => (
          <article
            key={r.version}
            className="relative pl-8 border-l-2 border-border-subtle pb-2"
          >
            {/* Dot */}
            <div className={`absolute left-0 top-0 -translate-x-[5px] w-2 h-2 rounded-full ${
              i === 0 ? 'bg-accent shadow-[0_0_8px_rgba(200,151,90,0.5)]' : 'bg-text-tertiary'
            }`} />

            {/* Header */}
            <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                  {r.version}
                </span>
                <span className="text-[9px] font-mono text-accent uppercase tracking-wider px-1.5 py-0.5 bg-accent/10 rounded">
                  {r.phase}
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary">{r.date}</span>
            </div>

            {/* Headline */}
            <h2 className="text-[15px] font-semibold text-text-primary mb-2">{r.headline}</h2>

            {/* Highlights */}
            <ul className="space-y-1">
              {r.highlights.map((h, j) => (
                <li key={j} className="flex items-start gap-2 text-[12px] text-text-secondary leading-relaxed">
                  <span className="text-accent/60 mt-0.5 flex-shrink-0">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 p-5 border border-border-subtle rounded-md bg-bg-surface/50 text-center">
        <div className="text-[11px] font-mono text-text-tertiary mb-2 uppercase tracking-wider">
          持续迭代中
        </div>
        <p className="text-[12px] text-text-secondary mb-4">
          每次大版本会同步到 GitHub + Vercel · 本页列的每条都对应真实 commit。
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/roadmap" className="text-[11px] font-mono text-accent hover:underline">
            路线图 (未来 3 Q)
          </Link>
          <span className="text-text-tertiary opacity-40">·</span>
          <a
            href="https://github.com/zacharyxpku-boop/wenai"
            target="_blank"
            rel="noopener"
            className="text-[11px] font-mono text-accent hover:underline"
          >
            GitHub repo
          </a>
          <span className="text-text-tertiary opacity-40">·</span>
          <Link href="/status" className="text-[11px] font-mono text-accent hover:underline">
            实时状态
          </Link>
          <span className="text-text-tertiary opacity-40">·</span>
          <Link href="/cases" className="text-[11px] font-mono text-accent hover:underline">
            4 个案例
          </Link>
        </div>
      </div>
    </div>
  );
}
