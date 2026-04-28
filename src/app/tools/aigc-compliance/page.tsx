import { Metadata } from 'next';
import Link from 'next/link';
import { listChecklists, daysSinceVerified, needsReview } from '@/lib/aigc-checklists';
import { CopyDisclosureButton } from './CopyDisclosureButton';

/**
 * /tools/aigc-compliance · AIGC 多平台合规速查
 *
 * SSG · SEO · 静态渲染, 商家无登录可看 (引流到 /me/skus 注册商家)
 * 移植自 clico-clean MOAT-10
 */

export const metadata: Metadata = {
  title: 'AI 内容披露合规速查 · 抖音 / TikTok / 视频号 / 小红书 / YouTube / Instagram | wenai',
  description: '跨境电商用 AI 生成主图、视频、种草帖必看 · 6 大平台 AIGC 披露规则官方链接 + 一键复制披露文案 + 不标后果详解',
  keywords: [
    '抖音 AI 视频标识规则',
    'TikTok AI content disclosure',
    '视频号 AI 合成标签',
    '小红书 AI 生成内容',
    'YouTube altered content',
    'Instagram AI info',
    'AIGC 合规',
    '深度合成规定',
    '跨境电商 AI 视频',
  ],
  openGraph: {
    title: 'AIGC 合规速查 · 6 平台 AI 内容披露规则一览',
    description: '抖音/TikTok/视频号/小红书/YouTube/Instagram 的 AI 内容标注规则 · 一键复制披露语',
  },
};

export default function AigcCompliancePage() {
  const cnList = listChecklists({ region: 'CN' });
  const globalList = listChecklists({ region: 'Global' });

  return (
    <div className="min-h-screen bg-bg-root">
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-[10px] font-mono text-text-tertiary hover:text-accent">← 首页</Link>
            <span className="text-[10px] font-mono text-text-tertiary">/</span>
            <span className="text-[10px] font-mono text-accent">工具 / AIGC 合规速查</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
            🛡️ AI 内容多平台披露合规速查
          </h1>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            跨境电商用 AI 生成主图、口播视频、种草帖时, 各平台披露规则不同 ·
            不标会被限流、降权、损账号信任分 · 这里挂官方链接 + 一键复制披露语
          </p>
        </div>

        <div className="border border-warning/30 bg-warning/5 rounded-lg p-3 mb-6 text-[11px] text-text-secondary leading-relaxed">
          <div className="font-mono text-[10px] text-warning mb-1">⚠️ 合规提示, 非法律意见</div>
          每条规则都附官方链接, 平台规则会变 · 我们尽量 90 天复核一次, 但最终请以官方链接为准
        </div>

        {/* CN 区 */}
        <section className="mb-8">
          <h2 className="text-[14px] font-bold text-text-primary uppercase tracking-wider mb-3">
            🇨🇳 中国大陆平台
          </h2>
          <div className="space-y-4">
            {cnList.map(c => (
              <PlatformCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* Global 区 */}
        <section className="mb-8">
          <h2 className="text-[14px] font-bold text-text-primary uppercase tracking-wider mb-3">
            🌐 海外平台
          </h2>
          <div className="space-y-4">
            {globalList.map(c => (
              <PlatformCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        <div className="border border-border-subtle rounded-lg p-4 bg-bg-surface/20 text-[11px] text-text-secondary leading-relaxed">
          <div className="text-[10px] font-mono text-text-tertiary uppercase mb-2">数据维护</div>
          每条规则附 <strong>官方链接</strong> + <strong>最后核验日</strong>
          <br />
          超 90 天没核验会标 <span className="text-warning">⚠ 需复核</span>, 商家自行反查
          <br />
          已发现规则变更或新平台? 邮件 <code className="text-accent">hello@wenai</code>
          <br /><br />
          <Link href="/me/skus" className="text-accent hover:underline">
            → 去 wenai SKU 库管理你的产品 + 用 AI 跑主图/文案
          </Link>
        </div>
      </div>
    </div>
  );
}

type Checklist = ReturnType<typeof listChecklists>[number];

function PlatformCard({ c }: { c: Checklist }) {
  const stale = needsReview(c);
  const days = daysSinceVerified(c);

  return (
    <article className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30">
      <header className="flex items-baseline justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-border-subtle">
        <div>
          <h3 className="text-[15px] font-bold text-text-primary">{c.name}</h3>
          <div className="text-[10px] font-mono text-text-tertiary">{c.operator}</div>
        </div>
        <div className="text-right">
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            stale ? 'border-warning/40 text-warning bg-warning/10' : 'border-border-default text-text-tertiary'
          }`}>
            {stale ? '⚠ 需复核' : '✓ 已核验'} · {days} 天前
          </span>
        </div>
      </header>

      <div className="space-y-3">
        {c.requirements.map(req => (
          <div key={req.key} className="border-l-2 border-accent/30 pl-3 py-1">
            <div className="font-semibold text-[13px] text-text-primary mb-1">{req.label}</div>
            <div className="text-[12px] text-text-secondary leading-relaxed mb-2">{req.summary}</div>

            {req.disclosureText && (
              <div className="bg-bg-root/60 border border-border-subtle rounded p-2 mb-2 flex items-start gap-2">
                <code className="flex-1 text-[11px] font-mono text-text-primary break-all">
                  {req.disclosureText}
                </code>
                <CopyDisclosureButton text={req.disclosureText} />
              </div>
            )}

            {req.steps && req.steps.length > 0 && (
              <details className="mb-2">
                <summary className="text-[10px] font-mono text-accent cursor-pointer hover:underline">
                  📋 操作步骤 ({req.steps.length} 步)
                </summary>
                <ol className="mt-1.5 ml-4 text-[11px] text-text-secondary space-y-0.5 list-decimal">
                  {req.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </details>
            )}

            {req.riskIfSkipped && (
              <div className="text-[10px] font-mono text-error/80 bg-error/5 border border-error/20 rounded px-2 py-1 mb-2">
                ⚠️ 不标后果: {req.riskIfSkipped}
              </div>
            )}

            <a
              href={req.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-accent hover:underline"
            >
              📖 看官方原文 →
            </a>
          </div>
        ))}
      </div>
    </article>
  );
}
