'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * 行业上下文提示条 · 决策模块共用
 *
 * 只读 /api/user/settings industry 字段, 显示一个小绿条
 * "AI 已知道你做的是 X · 改" 引导商家配设置 / 提示当前生效
 *
 * 没设置 industry 时显示灰色提示引导填
 */
export function IndustryHint() {
  const [industry, setIndustry] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/user/settings')
      .then(r => r.json())
      .then(d => {
        setIndustry(d.settings?.industry || null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  if (industry) {
    return (
      <div className="inline-flex items-center gap-2 border border-success/40 bg-success/5 rounded px-2.5 py-1 text-[10px] font-mono">
        <span className="text-success">🏷️ AI 已知行业:</span>
        <span className="text-text-primary truncate max-w-[280px]" title={industry}>
          {industry.length > 32 ? industry.slice(0, 32) + '…' : industry}
        </span>
        <Link href="/me/settings" className="text-text-tertiary hover:text-accent">改 →</Link>
      </div>
    );
  }

  return (
    <Link
      href="/me/settings"
      className="inline-flex items-center gap-2 border border-text-tertiary/30 hover:border-accent/40 rounded px-2.5 py-1 text-[10px] font-mono text-text-tertiary hover:text-accent transition-colors"
      title="补一句行业 (例: 跨境女装独立站) AI 决策建议会更贴你的实际盘子"
    >
      💡 补行业上下文 · AI 推荐能更准 →
    </Link>
  );
}
