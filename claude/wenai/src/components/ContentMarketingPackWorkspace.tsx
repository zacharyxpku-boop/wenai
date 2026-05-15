'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildContentMarketingPack, type ContentMarketingPackInput } from '@/lib/content-marketing-pack';

export default function ContentMarketingPackWorkspace() {
  const [input, setInput] = useState<ContentMarketingPackInput>({
    category: 'home',
    sku: '抽屉收纳盒 10 SKU 上新批次',
    platform: 'both',
    benchmarkLinks: '',
    brandVoice: '干净、可信、不夸张',
    campaignGoal: '先验证 TikTok 和 Instagram 内容角度，再决定是否扩大这批 SKU',
  });
  const [copied, setCopied] = useState(false);
  const pack = useMemo(() => buildContentMarketingPack(input), [input]);

  async function copyPack() {
    await navigator.clipboard.writeText(pack.markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="min-h-screen bg-bg-root px-5 py-8 text-text-primary sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">
            内容测试交付包
            </div>
            <h1 className="text-balance font-[family-name:var(--font-outfit)] text-3xl font-bold text-text-primary md:text-4xl">
              TikTok / Instagram 参考样例到内容营销交付包
            </h1>
            <p className="mt-3 text-pretty text-[14px] leading-relaxed text-text-secondary">
              不是泛营销灵感页。这里把 SKU、平台参考、类目护栏压成开场句矩阵、轮播脚本、短视频脚本和发布复盘报告。
            </p>
          </div>
          <Link
            href="/poc"
            className="inline-flex min-h-[40px] items-center rounded-md border border-border-default px-4 py-2 text-[12px] font-mono text-text-primary hover:border-accent/40"
          >
            返回试跑入口
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-border-subtle bg-bg-surface/35 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono text-accent">输入资料</div>
                <h2 className="mt-1 text-[16px] font-semibold text-text-primary">最小必要信息</h2>
              </div>
              <button
                type="button"
                onClick={copyPack}
                className="rounded-md bg-accent px-3 py-2 text-[12px] font-semibold text-bg-root hover:bg-accent-hover"
              >
                {copied ? '已复制' : '复制交付包'}
              </button>
            </div>

            <div className="space-y-3">
              <Field label="类目">
                <select
                  value={input.category}
                  onChange={event => setInput(prev => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-md border border-border-default bg-bg-root px-3 py-2 text-[13px]"
                >
                  <option value="home">家居用品</option>
                  <option value="auto">汽摩配件</option>
                  <option value="digital">数码电子</option>
                  <option value="beauty">美妆个护</option>
                  <option value="apparel">服饰鞋包</option>
                  <option value="supplement">营养健康</option>
                  <option value="mixed">混合品类</option>
                </select>
              </Field>

              <Field label="SKU / 批次">
                <textarea
                  value={input.sku}
                  onChange={event => setInput(prev => ({ ...prev, sku: event.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-md border border-border-default bg-bg-root px-3 py-2 text-[13px]"
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="平台">
                  <select
                    value={input.platform}
                    onChange={event => setInput(prev => ({ ...prev, platform: event.target.value as ContentMarketingPackInput['platform'] }))}
                    className="w-full rounded-md border border-border-default bg-bg-root px-3 py-2 text-[13px]"
                  >
                    <option value="both">TikTok + Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </Field>
                <Field label="品牌语气">
                  <input
                    value={input.brandVoice}
                    onChange={event => setInput(prev => ({ ...prev, brandVoice: event.target.value }))}
                    className="w-full rounded-md border border-border-default bg-bg-root px-3 py-2 text-[13px]"
                  />
                </Field>
              </div>

              <Field label="TikTok / Instagram 参考链接或账号">
                <textarea
                  value={input.benchmarkLinks}
                  onChange={event => setInput(prev => ({ ...prev, benchmarkLinks: event.target.value }))}
                  rows={4}
                  placeholder="没有也能先生成假设包，但发布前必须补参考样例。"
                  className="w-full resize-none rounded-md border border-border-default bg-bg-root px-3 py-2 text-[13px]"
                />
              </Field>

              <Field label="内容测试目标">
                <textarea
                  value={input.campaignGoal}
                  onChange={event => setInput(prev => ({ ...prev, campaignGoal: event.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-md border border-border-default bg-bg-root px-3 py-2 text-[13px]"
                />
              </Field>
            </div>

            <div className="mt-4 rounded-md border border-accent/30 bg-accent/10 p-3">
              <div className="mb-1 text-[10px] font-mono tracking-wider text-accent">标准包交接</div>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                当前交付包可以继续进入标准包工作台，形成客户可复制的交付标准。
              </p>
              <Link
                href={pack.standardPackHref}
                className="mt-3 inline-flex min-h-[40px] items-center rounded-md border border-accent/40 px-3 py-2 text-[12px] font-mono text-accent hover:bg-accent/10"
              >
                生成内容营销标准包
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-border-subtle bg-bg-surface/20 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-accent">
                  交付结果
                </div>
                <h2 className="mt-1 text-[16px] font-semibold text-text-primary">
                  {pack.categoryLabel} / {pack.platformLabel}
                </h2>
              </div>
              <span className="rounded border border-accent/35 px-2 py-1 text-[10px] font-mono text-accent">
                参考 → 开场句 → 脚本 → 复盘
              </span>
            </div>

            <div className="space-y-4">
              <Panel title="开场句矩阵">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {pack.hookMatrix.map(row => (
                    <div key={row.angle} className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
                      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-accent">{row.angle}</div>
                      <p className="text-[12px] leading-relaxed text-text-primary">{row.hook}</p>
                      <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">第一帧: {row.firstFrame}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">需要证据: {row.proofNeeded}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Panel title="轮播 / 短视频脚本">
                  <List items={[...pack.slideshowBrief, ...pack.reelBrief]} />
                </Panel>
                <Panel title="发布复盘报告">
                  <List items={pack.publishingReport} />
                </Panel>
              </div>

              <Panel title="风险红线">
                <List items={pack.redlines} />
              </Panel>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-mono text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface/35 p-4">
      <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-accent">{title}</div>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item} className="text-[12px] leading-relaxed text-text-secondary">
          {item}
        </li>
      ))}
    </ul>
  );
}
