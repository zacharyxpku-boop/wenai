import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/api-key';
import { addSku, listSkus, type SkuRecord } from '@/lib/sku-history';
import { recordBench } from '@/lib/cross-org-benchmark';

/**
 * 公开 API v1 · SKU 管理
 *
 * 商家从自家 ERP/Shopify webhook/抖店脚本/n8n flow 调:
 *   GET  /api/v1/skus              拉自己 SKU 库
 *   POST /api/v1/skus              新增 SKU (含 perf 一并提交)
 *
 * 鉴权:
 *   Authorization: Bearer wn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   或 ?apiKey= URL 参数 (脚本调试用, 生产建议走 header)
 *
 * 与 /api/user/sku-history 区别:
 *   /api/user/* 走 cookie/JWT 给前端
 *   /api/v1/* 走 API key 给外部系统 · 适合 webhook/cron/脚本
 *
 * 限速 v1 暂不强收, 配合 cost-cap 兜底; 滥用走 admin 撤销 key
 */

async function authenticate(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  let rawKey: string | null = null;
  if (auth?.startsWith('Bearer ')) {
    rawKey = auth.slice(7);
  } else {
    rawKey = new URL(req.url).searchParams.get('apiKey');
  }
  if (!rawKey) return null;
  return await verifyApiKey(rawKey);
}

export async function GET(req: NextRequest) {
  const orgId = await authenticate(req);
  if (!orgId) {
    return NextResponse.json({ error: '需要 Authorization: Bearer wn_xxx 或 ?apiKey=' }, { status: 401 });
  }
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
  const skus = await listSkus(orgId, limit);
  return NextResponse.json({
    orgId,
    count: skus.length,
    skus: skus.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      platform: s.platform ?? null,
      priceCny: s.priceCny ?? null,
      status: s.status,
      notes: s.notes ?? null,
      performance: s.performance ?? null,
      modules: s.modules ?? [],
      addedAt: s.addedAt,
      updatedAt: s.updatedAt,
    })),
  });
}

interface PostBody {
  name: string;
  category?: string;
  platform?: string;
  priceCny?: string;
  status?: SkuRecord['status'];
  notes?: string;
  performance?: SkuRecord['performance'];
}

export async function POST(req: NextRequest) {
  const orgId = await authenticate(req);
  if (!orgId) {
    return NextResponse.json({ error: '需要 Authorization: Bearer wn_xxx 或 ?apiKey=' }, { status: 401 });
  }
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体非 JSON' }, { status: 400 });
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return NextResponse.json({ error: 'name 必填且 >=2 字' }, { status: 400 });
  }

  const sku = await addSku(orgId, {
    name: body.name.trim(),
    category: body.category?.trim() || '未分类',
    platform: body.platform?.trim(),
    priceCny: body.priceCny?.trim(),
    status: body.status ?? 'idea',
    notes: body.notes?.trim(),
    performance: body.performance,
  });

  // 如果 perf 一并提交了, 喂给 cross-org benchmark (与 /api/user/sku-history PATCH 同款)
  if (body.performance && sku.category) {
    const bestCtr = body.performance.bestCtr ?? body.performance.ctr;
    const cpc = body.performance.cpc;
    if (typeof bestCtr === 'number' && bestCtr > 0) {
      recordBench({ orgId, skuId: sku.id, category: sku.category, metric: 'ctr', value: bestCtr }).catch(() => {});
    }
    if (typeof cpc === 'number' && cpc > 0) {
      recordBench({ orgId, skuId: sku.id, category: sku.category, metric: 'cpc', value: cpc }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, sku }, { status: 201 });
}
