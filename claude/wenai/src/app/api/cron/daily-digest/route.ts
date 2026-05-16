import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { listSkus } from '@/lib/sku-history';
import { getDailyCost } from '@/lib/cost-cap';
import { getCacheStatSnapshot } from '@/lib/cache-stats';
import { listLowOrOut } from '@/lib/inventory';
import { getUserSettings } from '@/lib/user-settings';
import { sendEmail } from '@/lib/mailer';
import { makeUnsubscribeToken } from '@/lib/unsubscribe';
import { sendDigestToWebhooks } from '@/lib/webhook-out';

/**
 * 每日 digest cron · vercel.json 9:00am 触发
 *
 * 跑全部 org 的轻量信号检测, 把 digest payload 落地到 Redis
 *   wenai:digest:<orgId>:<YYYY-MM-DD>  hash {jsonPayload}
 *   wenai:digest:list:<orgId>          list 最近 30 天 dateStr
 *
 * 之后商家 /api/user/digest 拉到自己最新一份 → /me/alerts 顶部"昨天推送"展示
 * 邮件接 Resend/SendGrid 阶段只需读这份 hash 不再算逻辑
 *
 * 安全: vercel cron 注入 x-vercel-cron-secret · 拒绝外部直接调
 *       本地 dev: process.env.CRON_SECRET 匹配也通过
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const STALE_DAYS = 30;
const COST_CAP_CENTS = parseInt(process.env.COST_CAP_DAILY_CENTS || '5000', 10);
const DIGEST_TTL_SEC = 30 * 24 * 3600;
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wenai-one.vercel.app';

interface DigestPayload {
  orgId: string;
  date: string;
  generatedAt: string;
  critical: number;
  warning: number;
  info: number;
  signals: Array<{ kind: string; severity: 'critical' | 'warning' | 'info'; headline: string }>;
  metrics: {
    skuCount: number;
    launchedCount: number;
    todayCny: number;
    cacheRate7d: number | null;
  };
  topAction: string | null; // 一句话最该做的事
}

async function discoverOrgs(): Promise<string[]> {
  if (!redis) return [];
  const orgs = new Set<string>();
  const today = new Date().toISOString().slice(0, 10);
  for (const pattern of [`wenai:sku:list:*`, `wenai:cost:*:${today}`]) {
    let cursor: string | number = 0;
    let iter = 0;
    try {
      do {
        const res: [string | number, string[]] = await redis.scan(cursor, { match: pattern, count: 200 });
        cursor = res[0];
        for (const key of res[1]) {
          if (key.includes(':detail:')) continue;
          if (key.startsWith('wenai:sku:list:')) {
            orgs.add(key.slice('wenai:sku:list:'.length));
          } else if (key.startsWith('wenai:cost:')) {
            const parts = key.split(':');
            const id = parts.slice(2, parts.length - 1).join(':');
            if (id) orgs.add(id);
          }
        }
        iter++;
        if (iter > 30) break;
      } while (cursor !== '0' && cursor !== 0);
    } catch {
      // skip
    }
  }
  return Array.from(orgs);
}

async function buildDigest(orgId: string, dateStr: string): Promise<DigestPayload> {
  const [skus, dailyCents, lowInv] = await Promise.all([
    listSkus(orgId, 200),
    getDailyCost(orgId),
    listLowOrOut(orgId),
  ]);
  const signals: DigestPayload['signals'] = [];

  // 库存优先级最高
  const out = lowInv.filter(r => r.status === 'out').length;
  const low = lowInv.filter(r => r.status === 'low').length;
  if (out > 0) {
    signals.push({ kind: 'inventory-out', severity: 'critical', headline: `${out} 个 SKU 断货 · 立即下架或补货` });
  }
  if (low > 0) {
    signals.push({
      kind: 'inventory-low',
      severity: low >= 5 ? 'warning' : 'info',
      headline: `${low} 个 SKU 库存接近阈值`,
    });
  }

  // stale-sku
  const cutoff = Date.now() - STALE_DAYS * 24 * 3600 * 1000;
  const stale = skus.filter(s => s.status === 'launched' && new Date(s.updatedAt).getTime() < cutoff).length;
  if (stale >= 5) {
    signals.push({ kind: 'stale-sku', severity: 'critical', headline: `${stale} 个上架 SKU 死掉` });
  } else if (stale > 0) {
    signals.push({ kind: 'stale-sku', severity: 'warning', headline: `${stale} 个上架 SKU 该复评` });
  }

  // no-perf
  const noPerf = skus.filter(s => s.status === 'launched' && !s.performance?.testedAt).length;
  if (noPerf >= 3) {
    signals.push({ kind: 'no-perf', severity: 'warning', headline: `${noPerf} 个 SKU 无投放数据` });
  } else if (noPerf > 0) {
    signals.push({ kind: 'no-perf', severity: 'info', headline: `${noPerf} 个 SKU 待回填` });
  }

  // cost-near-cap (今日)
  const ratio = dailyCents / COST_CAP_CENTS;
  if (ratio >= 1) {
    signals.push({ kind: 'cost-near-cap', severity: 'critical', headline: '今日已达成本上限' });
  } else if (ratio >= 0.7) {
    signals.push({ kind: 'cost-near-cap', severity: 'warning', headline: `今日成本 ${(ratio * 100).toFixed(0)}% × cap` });
  }

  // cache-rate-7d
  let totalHits = 0;
  let totalCalls = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const snap = await getCacheStatSnapshot(orgId, dStr);
    totalHits += snap.totalHits;
    totalCalls += snap.totalHits + snap.totalMisses;
  }
  const cacheRate7d = totalCalls >= 30 ? totalHits / totalCalls : null;
  if (cacheRate7d !== null && cacheRate7d < 0.10) {
    signals.push({ kind: 'low-cache-rate', severity: 'info', headline: `命中率 ${(cacheRate7d * 100).toFixed(1)}% (低)` });
  }

  // no-bench
  const withPerf = skus.filter(s => s.performance?.testedAt).length;
  if (skus.length >= 5 && withPerf < 3) {
    signals.push({ kind: 'no-bench', severity: 'info', headline: `自建 benchmark 不足 (${withPerf}/${skus.length})` });
  }

  const critical = signals.filter(s => s.severity === 'critical').length;
  const warning = signals.filter(s => s.severity === 'warning').length;
  const info = signals.filter(s => s.severity === 'info').length;

  // 选一个 topAction
  const topAction = signals.find(s => s.severity === 'critical')?.headline
    ?? signals.find(s => s.severity === 'warning')?.headline
    ?? signals.find(s => s.severity === 'info')?.headline
    ?? null;

  return {
    orgId,
    date: dateStr,
    generatedAt: new Date().toISOString(),
    critical, warning, info,
    signals,
    metrics: {
      skuCount: skus.length,
      launchedCount: skus.filter(s => s.status === 'launched').length,
      todayCny: +(dailyCents / 100).toFixed(2),
      cacheRate7d,
    },
    topAction,
  };
}

export async function GET(req: NextRequest) {
  // 鉴权: vercel cron header 或 ?secret= (本地 dev)
  const cronSecret = process.env.CRON_SECRET;
  const provided = req.headers.get('x-vercel-cron-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '')
    || new URL(req.url).searchParams.get('secret');
  if (cronSecret && provided !== cronSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!redis) {
    return NextResponse.json({ ok: false, error: '当前为本地试用模式，定时摘要不会跨环境持久化。' });
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const orgs = await discoverOrgs();
  const written: string[] = [];
  const emailsSent: Array<{ orgId: string; provider: string }> = [];
  const webhooksFired = { sent: 0, failed: 0 };
  const errors: Array<{ orgId: string; err: string }> = [];

  for (const orgId of orgs) {
    try {
      const digest = await buildDigest(orgId, dateStr);
      // 跳过完全无信号的 org (减无效写)
      if (digest.signals.length === 0) continue;
      const key = `wenai:digest:${orgId}:${dateStr}`;
      await redis.set(key, JSON.stringify(digest), { ex: DIGEST_TTL_SEC });
      // 推到列表头, 截前 30 条
      const listKey = `wenai:digest:list:${orgId}`;
      await redis.lpush(listKey, dateStr);
      await redis.ltrim(listKey, 0, 29);
      await redis.expire(listKey, DIGEST_TTL_SEC);
      written.push(orgId);

      // 邮件 push (如果商家配了 email + 开关 + 阈值匹配)
      const settings = await getUserSettings(orgId);
      if (settings.email && settings.digestEmailEnabled) {
        const minSev = settings.digestSeverityMin ?? 'warning';
        const meets =
          (minSev === 'critical' && digest.critical > 0) ||
          (minSev === 'warning' && (digest.critical > 0 || digest.warning > 0)) ||
          (minSev === 'info' && digest.signals.length > 0);
        if (meets) {
          const unsubToken = makeUnsubscribeToken(orgId);
          const html = renderDigestHtml(digest, unsubToken);
          const subject = digest.critical > 0
            ? `🚨 wenai 信号 · ${digest.critical} 项紧急`
            : digest.warning > 0
              ? `⚠️ wenai 信号 · ${digest.warning} 项警示`
              : `💡 wenai 每日信号 · ${digest.signals.length} 条`;
          const r = await sendEmail({ to: settings.email, subject, html });
          if (r.ok) emailsSent.push({ orgId, provider: r.provider });
          else errors.push({ orgId, err: `mail:${r.provider}:${r.error}` });
        }
      }

      // outbound webhook fan-out (飞书/Slack/Discord/generic) · 与邮件独立, 互不阻塞
      try {
        const wh = await sendDigestToWebhooks(orgId, digest);
        webhooksFired.sent += wh.sent;
        webhooksFired.failed += wh.failed;
        for (const r of wh.results) {
          if (!r.ok) errors.push({ orgId, err: `webhook:${r.kind}:${r.error || 'fail'}` });
        }
      } catch (e) {
        errors.push({ orgId, err: `webhook:throw:${e instanceof Error ? e.message : 'unknown'}` });
      }
    } catch (e) {
      errors.push({ orgId, err: e instanceof Error ? e.message : 'unknown' });
    }
  }

  return NextResponse.json({
    ok: true,
    date: dateStr,
    totalOrgs: orgs.length,
    digestsWritten: written.length,
    emailsSent: emailsSent.length,
    emailProviders: countBy(emailsSent.map(e => e.provider)),
    webhooksSent: webhooksFired.sent,
    webhooksFailed: webhooksFired.failed,
    skipped: orgs.length - written.length - errors.length,
    errors: errors.slice(0, 10),
  });
}

function countBy(arr: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of arr) out[s] = (out[s] || 0) + 1;
  return out;
}

function renderDigestHtml(digest: DigestPayload, unsubToken?: string): string {
  const sevColor: Record<string, string> = {
    critical: '#dc2626', warning: '#d97706', info: '#7c3aed',
  };
  const sevEmoji: Record<string, string> = {
    critical: '🚨', warning: '⚠️', info: '💡',
  };
  const rows = digest.signals
    .map(s => `<tr>
  <td style="padding:8px 12px;border-left:3px solid ${sevColor[s.severity]};color:${sevColor[s.severity]};font-weight:600;">${sevEmoji[s.severity]} ${escapeHtml(s.kind)}</td>
  <td style="padding:8px 12px;color:#222;">${escapeHtml(s.headline)}</td>
</tr>`).join('');
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background:#f8f9fb;margin:0;padding:24px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
    <div style="font-size:11px;color:#888;letter-spacing:0.1em;text-transform:uppercase;">wenai 每日信号 · ${digest.date}</div>
    <h1 style="margin:8px 0 0;font-size:18px;color:#111;">${digest.critical > 0 ? '🚨' : digest.warning > 0 ? '⚠️' : '💡'} ${digest.signals.length} 条待看</h1>
  </div>
  <div style="padding:16px 24px;display:flex;gap:12px;font-size:13px;">
    <span style="color:#dc2626;">${digest.critical} 紧急</span>
    <span style="color:#d97706;">${digest.warning} 警示</span>
    <span style="color:#7c3aed;">${digest.info} 提示</span>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table>
  <div style="padding:16px 24px;border-top:1px solid #e5e7eb;">
    <div style="font-size:11px;color:#666;margin-bottom:8px;">SKU ${digest.metrics.skuCount} 个 · 上架 ${digest.metrics.launchedCount} · 今日花费 ¥${digest.metrics.todayCny.toFixed(2)}${digest.metrics.cacheRate7d !== null ? ' · 缓存命中率 ' + (digest.metrics.cacheRate7d * 100).toFixed(1) + '%' : ''}</div>
    <a href="${PUBLIC_BASE_URL}/me/alerts" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;">看完整信号 →</a>
  </div>
  <div style="padding:12px 24px;font-size:10px;color:#aaa;border-top:1px solid #e5e7eb;">
    不想再收? ${unsubToken
      ? `<a href="${PUBLIC_BASE_URL}/api/unsubscribe?token=${unsubToken}" style="color:#888;text-decoration:underline;">一键退订</a> · `
      : ''}去 /me/settings 改邮件设置
  </div>
</div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}
