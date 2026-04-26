import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '爆款视频拆解 · TikTok/抖音/小红书 → 结构化分镜 — Wenai',
  description:
    'Gemini Vision 拆解爆款视频:钩子类型 / 节奏 / 情绪曲线 / CTA 位置 / 每个镜头的图像 prompt。一键带去 AI 影棚生同款。',
};

export default function VideoTeardownLayout({ children }: { children: React.ReactNode }) {
  return children;
}
