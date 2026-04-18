import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Redis } from '@upstash/redis';

interface ShareData {
  moduleId: string;
  title: string;
  content: string;
  source: string;
  createdAt: string;
}

async function getShare(id: string): Promise<ShareData | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Serverless: 无 Redis 就不能读 memStore（因为 share/[id] 是 SSR 独立路由的 instance）
    return null;
  }
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const raw = await redis.hgetall(`wenai:share:${id}`);
    if (!raw || Object.keys(raw).length === 0) return null;
    return raw as unknown as ShareData;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) return { title: '分享已过期 · wenai' };

  const ogParams = new URLSearchParams({
    title: (data.title || 'wenai · 跨境代运营 AI').slice(0, 60),
    excerpt: data.content.replace(/[#*`>\-|]+/g, ' ').slice(0, 140),
    module: PIPELINE_LABELS[data.source] || data.moduleId || '',
  });

  return {
    title: `${data.title || 'AI 产出分享'} · wenai`,
    description: data.content.slice(0, 140),
    openGraph: {
      title: data.title || 'wenai · AI 产出分享',
      description: data.content.slice(0, 140),
      images: [{ url: `/api/og?${ogParams.toString()}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title || 'wenai · AI 产出分享',
      description: data.content.slice(0, 140),
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}

const PIPELINE_LABELS: Record<string, string> = {
  'pipeline-01': '新品上新 Pipeline',
  'pipeline-02': '达人批量冷启',
  'pipeline-03': 'AI 电商主图',
  'module': '单点工具',
};

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getShare(id);
  if (!data) notFound();

  return (
    <div className="max-w-[960px] mx-auto py-10 px-6">
      {/* 头部身份 */}
      <div className="mb-6 pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/" className="text-[10px] font-mono text-accent uppercase tracking-[0.15em] hover:underline">
            wenai
          </Link>
          <span className="text-text-tertiary text-[10px]">/</span>
          <span className="text-[10px] font-mono text-text-tertiary">
            {PIPELINE_LABELS[data.source] || '产出分享'}
          </span>
          <span className="text-text-tertiary text-[10px]">/</span>
          <span className="text-[10px] font-mono text-text-tertiary">只读分享</span>
        </div>
        {data.title && (
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] leading-tight">
            {data.title}
          </h1>
        )}
        <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-text-tertiary">
          <span>生成于 {new Date(data.createdAt).toLocaleString('zh-CN')}</span>
          <span>·</span>
          <span>7 天后过期</span>
        </div>
      </div>

      {/* Pipeline 03 图片 TTL 警告 */}
      {data.source === 'pipeline-03' && (
        <div className="mb-5 px-4 py-3 border border-accent/40 bg-accent/5 rounded-md flex items-start gap-3">
          <span className="text-accent text-[14px] flex-shrink-0">⏳</span>
          <div className="flex-1 text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-accent">图片 24 小时有效</strong> ·
            wanx 返回的图 URL 是临时签名,超时会 404。
            如看到图已失效,联系生成者重新跑即可。长期交付建议下载原图存档。
          </div>
        </div>
      )}

      {/* 内容 */}
      <article className="prose prose-invert prose-sm max-w-none text-[13px] leading-[1.8] text-text-secondary [&_table]:border-collapse [&_th]:border [&_th]:border-border-subtle [&_th]:px-2 [&_th]:py-1 [&_th]:bg-bg-raised [&_th]:text-[11px] [&_td]:border [&_td]:border-border-subtle [&_td]:px-2 [&_td]:py-1 [&_td]:text-[12px] [&_strong]:text-text-primary [&_h2]:text-[16px] [&_h2]:text-text-primary [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-[14px] [&_h3]:text-text-primary [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_code]:bg-bg-raised [&_code]:px-1 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono [&_img]:rounded-md [&_img]:border [&_img]:border-border-subtle [&_img]:my-3">
        <ReactMarkdown>{data.content}</ReactMarkdown>
      </article>

      {/* 底部 CTA */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <div className="p-5 border border-accent/30 rounded-md bg-accent/5 text-center">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">
            这是 wenai 的真实 Pipeline 产出
          </div>
          <h3 className="text-[14px] font-semibold text-text-primary mb-2 font-[family-name:var(--font-outfit)]">
            想自己跑一个？Free 版 7 天免费，10 次 Pipeline / 天
          </h3>
          <p className="text-[11px] text-text-secondary mb-4">
            从贴 SKU 到出多语言翻译 / 文案 / 合规 / 生图，30 秒闭环。
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link
              href="/invite?code=demo"
              className="px-4 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover"
            >
              申请邀请码 →
            </Link>
            <Link
              href="/cases"
              className="px-4 py-2 border border-border-default text-[12px] font-mono text-text-primary hover:border-accent/40 rounded-md"
            >
              看 4 个真实案例
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 border border-border-default text-[12px] font-mono text-text-primary hover:border-accent/40 rounded-md"
            >
              定价
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
