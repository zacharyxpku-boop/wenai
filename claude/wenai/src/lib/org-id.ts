import type { NextRequest } from 'next/server';
import { verifyToken, getCookieName } from '@/lib/auth';
import { inferPlanFromUser, type PlanId } from './entitlements';

/**
 * 统一 orgId 解析口径 · 跨 API 路由保持一致
 *
 * 之前的隐患: cost-cap 用 'x-tenant-id || default', sku-history 用 'token || x-tenant-id || ip:'
 * 同一用户在两个系统里 orgId 不一致 → cost-cap 写到 'default' 桶, sku-history 写到 'ip:xxx' 桶 → admin 看不齐
 *
 * 新口径(优先级从高到低, 始终返回非空):
 *   1. cookie token 解析的 username (登录用户最稳)
 *   2. x-tenant-id header (中间件已注入, 内部 RPC 用)
 *   3. x-username header (兜底)
 *   4. ip:<IP> (匿名访客, 用 IP 当桶)
 *   5. 'anon' (兜底兜底, 前面全失败)
 *
 * 注意: 这个 helper 是 Next API route 专用 (NextRequest), 不要在 React 组件用
 */

function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function resolveOrgId(req: NextRequest): Promise<string> {
  // 1. token username
  try {
    const token = req.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) return payload.username;
    }
  } catch {
    // token 损坏忽略, 继续 fallback
  }

  // 2. middleware 注入 (内部信任)
  const tenantId = req.headers.get('x-tenant-id');
  if (tenantId) return tenantId;

  // 3. 兜底
  const username = req.headers.get('x-username');
  if (username) return username;

  // 4. IP 桶
  const ip = getIp(req);
  if (ip && ip !== 'unknown') return `ip:${ip}`;

  // 5. anon
  return 'anon';
}

export async function resolveOrgContext(req: NextRequest): Promise<{ orgId: string; plan: PlanId }> {
  try {
    const token = req.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) {
        return { orgId: payload.username, plan: inferPlanFromUser(payload.role) };
      }
    }
  } catch {
    // token 损坏忽略, 继续 fallback
  }

  return { orgId: resolveOrgIdSync(req), plan: 'free' };
}

/** 同步版本 · 不解析 token, 仅用 header / ip (供不需要 token 的快路径) */
export function resolveOrgIdSync(req: NextRequest): string {
  const tenantId = req.headers.get('x-tenant-id');
  if (tenantId) return tenantId;
  const username = req.headers.get('x-username');
  if (username) return username;
  const ip = getIp(req);
  return ip && ip !== 'unknown' ? `ip:${ip}` : 'anon';
}
