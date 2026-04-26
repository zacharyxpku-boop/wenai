import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 视频 · 模特动态展示 / 产品旋转 / lifestyle 短片 — Wenai',
  description:
    '一张图 → 5 秒带货短视频。wanx2.1 i2v 直接生成,替代真人拍摄+剪辑 ¥500-3K/条。模特动态展示服装、产品 360°、生活场景闪动。',
};

export default function AIVideoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
