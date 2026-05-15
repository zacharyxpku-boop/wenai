'use client';

import { useState } from 'react';

/**
 * 公共 hook: 从 URL ?skuId= 读取当前关联的 SKU
 *
 * 用户从 /me/skus/[id] 详情页跳模块时, 链接带 ?skuId=xxx
 * 模块进页用此 hook 拿到 activeSkuId, 调 API 时 body 带, cost-cap 写明细时落 skuId 字段
 *
 * 用法:
 *   const skuId = useActiveSkuId();
 *   ...
 *   body: JSON.stringify({ ..., skuId })
 *
 * 不用 next/navigation 的 useSearchParams 因为它要 Suspense, 直接读 window 简单
 */
export function useActiveSkuId(): string | null {
  const [skuId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const sp = new URLSearchParams(window.location.search);
    return sp.get('skuId');
  });
  return skuId;
}
