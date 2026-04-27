'use client';

import { useState } from 'react';

/**
 * 通用分享 hook · POST /api/share + URL 复制
 *
 * 用法:
 *   const share = useShare();
 *   <button onClick={() => share.generate({ moduleId: 'ab-test', title: '...', content: md })}>
 *     {share.url ? '✓ 已生成' : '🔗 公开分享'}
 *   </button>
 *
 * 让 video-teardown / ab-test / data-insights 等模块共用同一套分享逻辑
 * 避免每个页面重复写 fetch + state, 也避免 UI 风格漂移
 */
export interface SharePayload {
  moduleId: string;
  title: string;
  content: string;
  source?: 'pipeline-01' | 'pipeline-02' | 'pipeline-03' | 'module';
}

export function useShare() {
  const [url, setUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async (payload: SharePayload) => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, source: payload.source || 'module' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setUrl(`${window.location.origin}${data.url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成分享失败');
    } finally {
      setGenerating(false);
    }
  };

  const copyUrl = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setUrl(null);
    setError('');
    setCopied(false);
  };

  return { url, generating, error, copied, generate, copyUrl, reset };
}
