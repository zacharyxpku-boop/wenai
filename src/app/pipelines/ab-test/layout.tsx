import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '测款 A-B 实验室 · 9 张主图变体一图爆款 — Wenai',
  description:
    '一张产品图 → AI 生 9 个 prompt 变体(3 钩子 × 3 配色)+ 测款 SOP。先投 3 张测点击率,数据回流找爆款。',
};

export default function AbTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
