import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 选品发现 · 跨境/本土电商 SKU 推荐 — Wenai',
  description:
    '别拍脑袋选品。告诉 wenai 你的平台 / 类目 / 预算 / 风险偏好,AI 推 5-10 个候选 SKU + 利润预测 + 竞争度评级 + 切入策略。',
};

export default function ProductDiscoveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
