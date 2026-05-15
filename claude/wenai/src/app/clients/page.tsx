import type { Metadata } from 'next';
import { ListingFactoryClientsPage } from '@/components/marketing/ListingFactorySections';

export const metadata: Metadata = {
  title: '客户项目空间 | Wenai Listing Factory',
  description: '按客户和项目沉淀 SKU、Brief、POC 报告、交付包和商务阶段。',
};

export default function ClientsPage() {
  return <ListingFactoryClientsPage />;
}
