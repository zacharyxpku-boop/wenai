import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '多 SKU 批量上架 · 一份计划跑完 N 个新品 — Wenai',
  description:
    '50 个 SKU 上架 = 50 次手跑 wenai 各模块? 不。贴 SKU 列表 → AI 生成完整批量 SOP, 每个 SKU 在每个工序的 prompt + 参数 + 检查清单一次到位。',
};

export default function BatchLaunchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
