'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * 公共 hook: 拉当前用户的 SKU 库 (最近 N 个)
 *
 * 用于决策层模块的"读"侧 — 让选品/测款/批量上架/数据洞察都能基于历史 SKU
 *
 * 用法:
 *   const { skus, loading, refresh } = useMySkus(20);
 */

export interface MySkuPerformance {
  ctr?: number;            // 平均 CTR (百分比, 例 3.2 = 3.2%)
  bestCtr?: number;        // 最佳变体 CTR
  cpc?: number;            // 最低 CPC (¥)
  convRate?: number;       // 转化率 (百分比)
  roi?: number;
  sales7d?: number;
  winningVariant?: string;
  testedAt?: string;       // ISO
  variantsCount?: number;
}

export interface MySku {
  id: string;
  name: string;
  category: string;
  status: string;
  platform?: string;
  priceCny?: string;
  notes?: string;
  modules?: string[];
  addedAt?: string;
  performance?: MySkuPerformance;
}

export function useMySkus(limit = 20) {
  const [skus, setSkus] = useState<MySku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user/sku-history?limit=${limit}`);
      const data = await response.json();
      setSkus((data.skus || []) as MySku[]);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'load failed');
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/user/sku-history?limit=${limit}`)
      .then(response => response.json())
      .then(data => {
        if (cancelled) return;
        setSkus((data.skus || []) as MySku[]);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'load failed');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [limit]);

  return { skus, loading, error, refresh };
}
