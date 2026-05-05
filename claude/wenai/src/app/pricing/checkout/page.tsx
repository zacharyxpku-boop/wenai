import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '接入申请 · wenai',
  description: 'wenai 子站不处理支付, 订阅和合同走独立主站。',
};

export default function CheckoutRedirectPage({
  searchParams,
}: {
  searchParams?: { plan?: string };
}) {
  const plan = searchParams?.plan || 'team';
  redirect(`/inquire?plan=${encodeURIComponent(plan)}&from=checkout`);
}
