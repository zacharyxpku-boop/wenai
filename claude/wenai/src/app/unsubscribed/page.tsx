import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '邮件已退订 · wenai',
  description: '已关闭 wenai 每日 digest 邮件 · 想重开请去设置',
};

interface PageProps {
  searchParams: Promise<{ status?: string; reason?: string }>;
}

export default async function UnsubscribedPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status ?? 'ok';
  const reason = sp.reason ?? '';

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-bg-root flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full border border-error/40 bg-error/5 rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">✗</div>
          <h1 className="text-[18px] font-bold text-error mb-2">退订链接无效</h1>
          <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
            可能原因: 链接已过期 (30 天) / 被篡改 / 已退订过. 错误码: <code className="text-[10px] font-mono">{reason}</code>
          </p>
          <p className="text-[11px] font-mono text-text-tertiary mb-5">
            请登录后去 /me/settings 关掉每日推送
          </p>
          <Link
            href="/me/settings"
            className="inline-block text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-4 py-2"
          >
            登录改设置 →
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-bg-root flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full border border-warning/40 bg-warning/5 rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-[18px] font-bold text-warning mb-2">操作失败</h1>
          <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
            后端写入失败 (Redis 暂时不可用?), 请稍后再试. 或登录后手动关闭.
          </p>
          <Link
            href="/me/settings"
            className="inline-block text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-4 py-2"
          >
            登录改设置 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-root flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full border border-success/40 bg-success/5 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h1 className="text-[20px] font-bold text-success mb-2">已退订每日 digest 邮件</h1>
        <p className="text-[12px] text-text-secondary leading-relaxed mb-2">
          以后不再给你发 wenai 每日信号汇总。
        </p>
        <p className="text-[11px] font-mono text-text-tertiary mb-5">
          站内 /me/alerts 信号面板永远在线, 不受邮件开关影响
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/me/settings"
            className="text-[11px] font-mono text-accent border border-accent/40 hover:bg-accent/10 rounded px-4 py-2"
          >
            想再开 → 设置
          </Link>
          <Link
            href="/"
            className="text-[11px] font-mono text-text-tertiary hover:text-accent"
          >
            wenai 首页
          </Link>
        </div>
      </div>
    </div>
  );
}
