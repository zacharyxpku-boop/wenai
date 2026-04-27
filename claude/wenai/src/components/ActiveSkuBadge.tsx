'use client';

import Link from 'next/link';

/**
 * 关联 SKU 徽章 · 模块顶部统一展示
 * 用户带 ?skuId=xxx 进来时显示, 链回 SKU 详情页, 提示"本次跑会归到这个 SKU 账"
 */
export function ActiveSkuBadge({ skuId }: { skuId: string | null }) {
  if (!skuId) return null;
  return (
    <Link
      href={`/me/skus/${skuId}`}
      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cat-content border border-cat-content/40 hover:bg-cat-content/10 rounded px-2 py-0.5 align-middle ml-2"
      title="本次跑的所有花费 (cost-cap detail) 会归到这个 SKU"
    >
      📦 关联 SKU: {skuId.length > 14 ? skuId.slice(0, 14) + '…' : skuId}
    </Link>
  );
}
