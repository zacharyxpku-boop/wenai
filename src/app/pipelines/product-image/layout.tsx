import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline 03 · AI 电商主图 · wenai',
  description: '选品类 + 场景预设 (15 选 1) → 通义万相生 5 图 (主图/场景/细节/使用/对比)。商标前置过滤 · Amazon/Shopee/Lazada 尺寸适配。',
  openGraph: {
    title: 'Pipeline 03 · AI 电商主图',
    description: '¥3500/SKU 摄影棚 → ¥0.7/SKU AI · 5000× 成本压缩',
    images: [{
      url: '/api/og?title=AI%20%E7%94%B5%E5%95%86%E4%B8%BB%E5%9B%BE&module=Pipeline%2003',
      width: 1200,
      height: 630,
    }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
