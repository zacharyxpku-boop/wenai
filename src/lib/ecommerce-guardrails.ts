export type EcommerceCategoryKey =
  | 'home'
  | 'auto'
  | 'digital'
  | 'tool'
  | 'living'
  | 'beauty'
  | 'apparel'
  | 'pet'
  | 'outdoor'
  | 'supplement'
  | 'mixed'
  | 'other';

export interface CategoryGuardrailPlaybook {
  key: EcommerceCategoryKey;
  label: string;
  buyerPromise: string;
  acceptanceThresholds: {
    reviewPassRate: number;
    benchmarkCoverage: number;
    maxRiskCount: number;
    ownerRequired: boolean;
  };
  forbiddenClaims: string[];
  requiredProof: string[];
  reviewQuestions: string[];
}

export interface BrandKnowledgeInput {
  category: string;
  brandVoice?: string;
  forbiddenWords?: string;
  platforms?: string;
  owner?: string;
}

const DEFAULT_PLAYBOOK: CategoryGuardrailPlaybook = {
  key: 'other',
  label: '通用电商',
  buyerPromise: '用清晰 SKU 信息、平台边界和人工终审口径降低返工。',
  acceptanceThresholds: {
    reviewPassRate: 82,
    benchmarkCoverage: 78,
    maxRiskCount: 1,
    ownerRequired: true,
  },
  forbiddenClaims: ['最强', '永久有效', '100% 转化', '无风险上架'],
  requiredProof: ['SKU 参数', '目标平台', 'benchmark 链接', '人工终审人'],
  reviewQuestions: [
    '这批 SKU 是否覆盖真实售卖场景？',
    'benchmark 是否可访问并可复核？',
    '哪些输出只能作为候选方案？',
  ],
};

export const CATEGORY_GUARDRAIL_PLAYBOOKS: Record<EcommerceCategoryKey, CategoryGuardrailPlaybook> = {
  home: {
    key: 'home',
    label: '家居用品',
    buyerPromise: '把尺寸、材质、场景和收纳/使用方式说清楚，减少误购和返工。',
    acceptanceThresholds: { reviewPassRate: 78, benchmarkCoverage: 72, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['食品级绝对安全', '永不变形', '适合所有家庭', '0 甲醛'],
    requiredProof: ['尺寸图', '材质说明', '使用场景图', '护理/安装说明'],
    reviewQuestions: ['尺寸是否和实际产品一致？', '场景图是否误导容量或材质？', '是否有食品接触或儿童使用风险？'],
  },
  living: {
    key: 'living',
    label: '生活日用',
    buyerPromise: '把使用场景、材质边界和日常维护说明变成可复核交付。',
    acceptanceThresholds: { reviewPassRate: 78, benchmarkCoverage: 72, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['永久耐用', '完全无害', '所有人适用', '立刻改善生活质量'],
    requiredProof: ['材质说明', '使用限制', '场景图', '平台禁用词'],
    reviewQuestions: ['是否有夸大耐用或安全表述？', '是否需要补充人群/场景限制？', '售后 FAQ 是否覆盖高频疑问？'],
  },
  auto: {
    key: 'auto',
    label: '汽摩配件',
    buyerPromise: '把车型兼容、安装方式和商标/安全边界前置，降低误购风险。',
    acceptanceThresholds: { reviewPassRate: 86, benchmarkCoverage: 82, maxRiskCount: 0, ownerRequired: true },
    forbiddenClaims: ['适配所有车型', '原厂认证', '绝对安全', 'Apple 官方兼容'],
    requiredProof: ['车型兼容表', '安装步骤', '第三方商标边界', '安全限制'],
    reviewQuestions: ['车型年份和型号是否可复核？', '第三方品牌词是否合规？', '安装失败场景是否被说明？'],
  },
  digital: {
    key: 'digital',
    label: '数码电子',
    buyerPromise: '把规格、兼容性和性能承诺说准，避免客服和退货压力。',
    acceptanceThresholds: { reviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['官方认证', '永不掉线', '无限续航', '全设备兼容'],
    requiredProof: ['规格参数', '兼容设备', '认证信息', '包装清单'],
    reviewQuestions: ['性能参数是否有来源？', '兼容设备是否写得过宽？', '包装清单是否减少误解？'],
  },
  tool: {
    key: 'tool',
    label: '工具五金',
    buyerPromise: '用规格、载荷、使用限制和安全说明支撑专业买家的判断。',
    acceptanceThresholds: { reviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['工业级绝对安全', '永不损坏', '适合所有工况', '无需防护'],
    requiredProof: ['载荷/规格', '材质', '安全说明', '适用工况'],
    reviewQuestions: ['是否有安全误导？', '规格是否跨素材一致？', '是否需要加使用限制？'],
  },
  beauty: {
    key: 'beauty',
    label: '美妆个护',
    buyerPromise: '把成分、肤感、适用人群和功效边界写清楚，避免违规承诺。',
    acceptanceThresholds: { reviewPassRate: 86, benchmarkCoverage: 82, maxRiskCount: 0, ownerRequired: true },
    forbiddenClaims: ['治愈', '根除', '100% 有效', '医美级效果'],
    requiredProof: ['成分表', '适用肤质', '禁用功效词', '过敏提示'],
    reviewQuestions: ['是否暗示医疗功效？', '适用人群是否过宽？', '前后对比是否需要免责声明？'],
  },
  apparel: {
    key: 'apparel',
    label: '服饰鞋包',
    buyerPromise: '用尺码、版型、材质和搭配场景降低尺码争议。',
    acceptanceThresholds: { reviewPassRate: 82, benchmarkCoverage: 78, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['适合所有身材', '永不褪色', '零退货', '奢侈品同款'],
    requiredProof: ['尺码表', '面料说明', '模特信息', '护理说明'],
    reviewQuestions: ['尺码是否可复核？', '颜色/材质是否存在图文不一致？', '变体是否有独立描述？'],
  },
  pet: {
    key: 'pet',
    label: '宠物用品',
    buyerPromise: '把宠物体型、材质安全和使用限制说清楚，避免对健康效果过度承诺。',
    acceptanceThresholds: { reviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['治愈焦虑', '所有宠物适用', '完全无害', '兽医保证'],
    requiredProof: ['适用体型', '材质安全', '使用限制', '清洁说明'],
    reviewQuestions: ['是否涉及健康/行为改善承诺？', '宠物体型兼容是否明确？', '是否需要监护提醒？'],
  },
  outdoor: {
    key: 'outdoor',
    label: '户外运动',
    buyerPromise: '把环境、耐用、防护和安全边界讲清楚，让测试内容可复盘。',
    acceptanceThresholds: { reviewPassRate: 84, benchmarkCoverage: 80, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['绝对防水', '任何环境适用', '永不损坏', '专业救援级'],
    requiredProof: ['材质/等级', '使用环境', '安全限制', '收纳/安装说明'],
    reviewQuestions: ['防水/耐用是否有等级依据？', '极端环境是否被排除？', '是否需要安全免责声明？'],
  },
  supplement: {
    key: 'supplement',
    label: '营养健康',
    buyerPromise: '先做 claim-safety，再考虑内容营销和达人扩散。',
    acceptanceThresholds: { reviewPassRate: 88, benchmarkCoverage: 84, maxRiskCount: 0, ownerRequired: true },
    forbiddenClaims: ['治疗', '治愈', '替代药物', '保证减重'],
    requiredProof: ['成分/剂量', '适用人群', '禁忌提示', '合规终审人'],
    reviewQuestions: ['是否涉及疾病或医疗承诺？', '剂量和禁忌是否完整？', '是否有合规负责人签字？'],
  },
  mixed: {
    key: 'mixed',
    label: '混合品类',
    buyerPromise: '用统一字段和类目分流把混乱 SKU 变成可排产、可验收的批次。',
    acceptanceThresholds: { reviewPassRate: 82, benchmarkCoverage: 78, maxRiskCount: 1, ownerRequired: true },
    forbiddenClaims: ['全品类通用', '无需人工审核', '自动保证合规', '一键爆单'],
    requiredProof: ['SKU 分组', '类目负责人', '平台边界', '高风险标记'],
    reviewQuestions: ['是否需要按类目拆包？', '高风险 SKU 是否被标记？', '验收阈值是否按类目调整？'],
  },
  other: DEFAULT_PLAYBOOK,
};

export function normalizeCategoryKey(value: string | undefined): EcommerceCategoryKey {
  const key = (value || '').trim().toLowerCase();
  if (key in CATEGORY_GUARDRAIL_PLAYBOOKS) return key as EcommerceCategoryKey;
  if (/home|living|家居|生活/.test(key)) return 'home';
  if (/\b(auto|car|automotive|vehicle)\b|汽|车/.test(key)) return 'auto';
  if (/digital|electronic|数码|电子/.test(key)) return 'digital';
  if (/tool|hardware|工具|五金/.test(key)) return 'tool';
  if (/beauty|cosmetic|美妆|个护/.test(key)) return 'beauty';
  if (/apparel|fashion|服饰|鞋|包/.test(key)) return 'apparel';
  if (/pet|宠物/.test(key)) return 'pet';
  if (/outdoor|sport|户外|运动/.test(key)) return 'outdoor';
  if (/supplement|wellness|营养|健康|保健/.test(key)) return 'supplement';
  if (/mixed|multi|混合|多品类/.test(key)) return 'mixed';
  return 'other';
}

export function getCategoryGuardrail(value: string | undefined): CategoryGuardrailPlaybook {
  return CATEGORY_GUARDRAIL_PLAYBOOKS[normalizeCategoryKey(value)];
}

export function buildBrandKnowledgeBrief(input: BrandKnowledgeInput): string {
  const playbook = getCategoryGuardrail(input.category);
  const forbidden = [
    ...playbook.forbiddenClaims,
    ...(input.forbiddenWords || '')
      .split(/[,，\n]/)
      .map(item => item.trim())
      .filter(Boolean),
  ];

  return [
    '# wenai Brand Knowledge Brief',
    '',
    `- Category: ${playbook.label}`,
    `- Buyer promise: ${playbook.buyerPromise}`,
    `- Brand voice: ${input.brandVoice?.trim() || 'not provided'}`,
    `- Platforms: ${input.platforms?.trim() || 'not provided'}`,
    `- Review owner: ${input.owner?.trim() || 'not assigned'}`,
    '',
    '## Forbidden / risky claims',
    ...forbidden.map(item => `- ${item}`),
    '',
    '## Required proof before customer-ready output',
    ...playbook.requiredProof.map(item => `- ${item}`),
    '',
    '## Acceptance thresholds',
    `- Review pass rate >= ${playbook.acceptanceThresholds.reviewPassRate}%`,
    `- Benchmark coverage >= ${playbook.acceptanceThresholds.benchmarkCoverage}%`,
    `- Max unresolved risk count: ${playbook.acceptanceThresholds.maxRiskCount}`,
    `- Review owner required: ${playbook.acceptanceThresholds.ownerRequired ? 'yes' : 'no'}`,
    '',
    '## Human review questions',
    ...playbook.reviewQuestions.map(item => `- ${item}`),
  ].join('\n');
}
