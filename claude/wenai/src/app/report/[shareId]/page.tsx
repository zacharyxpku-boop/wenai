import { notFound } from 'next/navigation';
import { excerpt, getShare } from '@/lib/share-readonly';
import ReportTemplateClient from './ReportTemplateClient';

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const data = await getShare(shareId);
  return {
    title: data?.title ? `${data.title} / Wenai 决策报告` : 'Wenai 决策报告',
    description: data?.content ? excerpt(data.content, 140) : '复制决策模板并创建本地工作台',
  };
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { shareId } = await params;
  const query = await searchParams;
  const data = await getShare(shareId);
  if (!data) notFound();

  return (
    <ReportTemplateClient
      shareId={shareId}
      title={data.title || 'Wenai 脱敏决策报告'}
      content={data.content || ''}
      createdAt={data.createdAt}
      sourceProjectId={typeof query.sourceProjectId === 'string' ? query.sourceProjectId : ''}
      channel={typeof query.channel === 'string' ? query.channel : ''}
      templateSnapshot={typeof query.templateSnapshot === 'string' ? query.templateSnapshot : ''}
    />
  );
}
