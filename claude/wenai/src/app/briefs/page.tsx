import type { Metadata } from 'next';
import { ListingFactoryBriefLibraryPage } from '@/components/marketing/ListingFactorySections';

export const metadata: Metadata = {
  title: 'Brief 资产库 | Wenai Listing Factory',
  description: '把每次试跑生成的内容 Brief 沉淀为可筛选、可复用、可交付的内容资产。',
};

export default function BriefsPage() {
  return <ListingFactoryBriefLibraryPage />;
}
