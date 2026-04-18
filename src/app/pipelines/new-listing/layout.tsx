import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline 01 · 新品上新流水线 · wenai',
  description: '贴 1 条 SKU + 选品类 → 翻译 / 文案 / 合规 并行出。家居/汽摩/数码/工具/生活百货 五类专属调教。30-45 秒闭环,支持批量 20 条。',
  openGraph: {
    title: 'Pipeline 01 · 新品上新流水线',
    description: '30 秒跑完一个新品的翻译 + 文案 + 合规 · 品类专属调教',
    images: [{
      url: '/api/og?title=%E6%96%B0%E5%93%81%E4%B8%8A%E6%96%B0%E6%B5%81%E6%B0%B4%E7%BA%BF&module=Pipeline%2001',
      width: 1200,
      height: 630,
    }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
