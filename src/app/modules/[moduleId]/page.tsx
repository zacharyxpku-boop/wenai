import { notFound } from 'next/navigation';
import AIWorkspace from '@/components/AIWorkspace';
import VideoWorkspace from '@/components/VideoWorkspace';
import TranslateWorkspace from '@/components/TranslateWorkspace';
import modulesConfig from '@/config/modules.json';
import clientConfig from '@/config/client.json';

const moduleFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
  translate: [
    { key: 'targetLang', label: '目标语言', placeholder: '英语 / English' },
  ],
  outreach: [
    { key: 'influencer', label: '达人信息', placeholder: '达人名称、平台、粉丝量...' },
    { key: 'product', label: '产品信息', placeholder: '产品名称、卖点...' },
    { key: 'cooperation', label: '合作方式', placeholder: '寄样试用 / 佣金合作...' },
  ],
  livestream: [
    { key: 'product', label: '产品信息', placeholder: '产品名称、价格、卖点...' },
    { key: 'platform', label: '直播平台', placeholder: '抖音 / 淘宝直播 / 快手...' },
    { key: 'audience', label: '目标人群', placeholder: '25-35岁女性 / 家庭主妇...' },
  ],
  'customer-service': [
    { key: 'shopInfo', label: '店铺信息', placeholder: '店铺类型、主营品类、退换政策...' },
  ],
};

const csvEnabledModules = new Set(['translate', 'copywriting', 'outreach', 'reviews']);

const modulePlaceholders: Record<string, string> = {
  translate: '请输入需要翻译的商品信息（标题、描述、卖点等）...',
  outreach: '请输入额外的合作需求或补充说明...',
  reviews: '请粘贴商品评论（支持多条，每条一行）...',
  video: '请描述您的视频需求（产品、风格、时长、平台）...',
  copywriting: '请输入商品信息（名称、品类、价格、核心卖点、目标人群）...',
  content: '请输入产品信息（名称、卖点、目标人群、使用场景）...',
  images: '请输入商品信息（名称、品类、风格定位、参考竞品）...',
  livestream: '请输入额外的直播需求说明...',
  competitor: '请输入竞品信息（链接、名称、价格、或任何已知信息）...',
  selection: '请输入品类方向或选品需求...',
  operations: '请输入店铺/产品现状（品类、日均销量、客单价、当前问题）...',
  'customer-service': '请输入客户咨询内容...',
  leads: '请描述目标客户画像（行业、规模、地区、预算）...',
};

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { moduleId } = await params;
  const mod = modulesConfig.modules.find(m => m.id === moduleId);
  const enabledIds = new Set(clientConfig.enabledModules);

  if (!mod || !enabledIds.has(moduleId)) {
    notFound();
  }

  // Specialized workspaces
  if (moduleId === 'translate') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <TranslateWorkspace />
      </div>
    );
  }

  if (moduleId === 'video') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <VideoWorkspace />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <AIWorkspace
        moduleId={mod.id}
        moduleName={`${mod.name} · ${mod.nameEn}`}
        modulePrompt={mod.prompt}
        placeholder={modulePlaceholders[mod.id] || '请输入内容...'}
        fields={moduleFields[mod.id]}
        supportCSV={csvEnabledModules.has(mod.id)}
      />
    </div>
  );
}

export async function generateStaticParams() {
  return modulesConfig.modules.map(m => ({ moduleId: m.id }));
}
