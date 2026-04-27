'use client';

import { useEffect, useState } from 'react';

/**
 * 公共 hook: 拉当前用户的 SKU 库 (最近 N 个)
 *
 * 用于决策层模块的"读"侧 — 让选品/测款/批量上架/数据洞察都能基于历史 SKU
 *
 * 用法:
 *   const { skus, loading, refresh } = useMySkus(20);
 */

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
}

export function useMySkus(limit = 20) {
  const [skus, setSkus] = useState<MySku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    fetch(`/api/user/sku-history?limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        setSkus((d.skus || []) as MySku[]);
        setLoading(false);
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : 'load failed');
        setLoading(false);
      });
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [limit]);

  return { skus, loading, error, refresh };
}
