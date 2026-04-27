'use client';

import type { SharePayload } from '@/lib/use-share';
import { useShare } from '@/lib/use-share';

/**
 * 跨模块复用的"生成公开分享链接"按钮 + URL 反馈
 *
 * 接 buildPayload() 函数 (而不是直接接 payload), 让模块在点击瞬间才组装内容,
 * 避免 result 还没出来时反复算 markdown 浪费 CPU
 *
 * 视觉风格: 默认 cat-content / 已生成 success · 与 video-teardown 同
 */
export function ShareButton({
  buildPayload,
  className = '',
  label = '🔗 公开分享',
}: {
  buildPayload: () => SharePayload | null;
  className?: string;
  label?: string;
}) {
  const share = useShare();

  const handleClick = async () => {
    const payload = buildPayload();
    if (!payload) return;
    await share.generate(payload);
  };

  if (share.url) {
    return (
      <div className={`flex items-center gap-1 border border-success/40 bg-success/5 rounded px-2 py-1.5 ${className}`}>
        <button
          onClick={share.copyUrl}
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            share.copied ? 'bg-success/30 text-success' : 'text-success hover:bg-success/10'
          }`}
        >
          {share.copied ? '✓ 已复制' : '📋 复制'}
        </button>
        <a
          href={share.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-success underline truncate max-w-[180px]"
          title={share.url}
        >
          {share.url.replace(/^https?:\/\//, '').slice(0, 30)}...
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={share.generating}
        className={`text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-3 py-1.5 disabled:opacity-40 ${className}`}
        title="生成 7 天有效公开分享链接, 朋友打开看到完整结果 + wenai 品牌"
      >
        {share.generating ? '生成中...' : label}
      </button>
      {share.error && (
        <span className="text-[10px] text-error font-mono">✗ {share.error}</span>
      )}
    </div>
  );
}
