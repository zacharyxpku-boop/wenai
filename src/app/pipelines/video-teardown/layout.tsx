import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '视频结构拆解 · TikTok/抖音/小红书 → 结构化分镜 — Wenai',
  description:
    'Gemini Vision 拆解参考视频:钩子类型 / 节奏 / 情绪曲线 / CTA 位置 / 每个镜头的图像 prompt。可带去 AI 影棚生成候选图。',
};

export default function VideoTeardownLayout({ children }: { children: ReactNode }) {
  return children;
}
