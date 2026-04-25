import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 影棚 · 模特图 / 场景图 / 产品图升级 — Wenai',
  description:
    '替代真人模特拍摄 (¥3-8K/组 → ¥0.3-1.2/张)。上传产品图,选模特参数和场景,gpt-image-1 直接生成电商级效果图。',
};

export default function AIPhotoshootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
