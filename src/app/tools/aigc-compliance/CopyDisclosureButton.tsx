'use client';

import { useState } from 'react';

/**
 * 复制披露语 client 组件 · 主页用 SSG 不能直接 useState, 故拆出
 */
export function CopyDisclosureButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 老浏览器 fallback (没有 clipboard API): 不报错, 商家自己手动复制
    }
  };

  return (
    <button
      onClick={copy}
      className={`text-[10px] font-mono px-2 py-1 rounded shrink-0 ${
        copied
          ? 'bg-success/20 text-success'
          : 'bg-accent text-bg-root hover:bg-accent-hover'
      }`}
    >
      {copied ? '✓ 已复制' : '📋 复制'}
    </button>
  );
}
