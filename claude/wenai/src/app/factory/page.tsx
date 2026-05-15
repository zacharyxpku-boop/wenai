import type { Metadata } from 'next';
import { ListingFactoryConsole } from '@/components/marketing/ListingFactorySections';

export const metadata: Metadata = {
  title: '内容工厂控制台 | Wenai Listing Factory',
  description: '集中查看 SKU 上新进度、品牌禁区、批量 Brief、内容任务和客户交付状态。',
};

export default function FactoryPage() {
  return <ListingFactoryConsole />;
}
