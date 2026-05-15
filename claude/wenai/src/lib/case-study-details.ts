import { buildStandardPackRoute } from './standard-pack-routing';

export interface CaseStudyDetail {
  slug: string;
  title: string;
  segment: string;
  category: string;
  summary: string;
  scenario: string;
  pipelineLabel: string;
  pipelineHref: string;
  proofLevel: string;
  disclaimer: string;
  metrics: Array<{ label: string; value: string }>;
  inputs: string[];
  deliverables: string[];
  beforeAfter: Array<{ label: string; before: string; after: string }>;
  review: {
    readiness: string;
    acceptanceScore: string;
    decision: string;
    nextStep: string;
    contractAction: string;
  };
  risks: string[];
  samples: Array<{ label: string; body: string }>;
  timeline: Array<{ label: string; body: string }>;
  standardPackHref: string;
}

function standardPackHref(input: {
  goal: string;
  brand: string;
  sku: string;
  links?: string;
}) {
  return buildStandardPackRoute({
    workflow: 'benchmark',
    goal: input.goal,
    brand: input.brand,
    sku: input.sku,
    links: input.links,
  });
}

const homeStorage: CaseStudyDetail = {
  slug: 'home-decor',
  title: '家居收纳上新交付包',
  segment: '家居收纳 / Shopify + TikTok Shop / 10 SKU 试跑',
  category: '家居用品',
  summary: '把零散 SKU 信息、商品图、竞品链接和平台边界压成一份可验收的上新交付包。',
  scenario: '客户准备测试一组收纳、密封、厨房整理类 SKU, 需要先判断哪些 SKU 值得进入主图、详情页和短视频首帧测试。',
  pipelineLabel: '流程 01 · 新品上新',
  pipelineHref: '/pipelines/new-listing',
  proofLevel: '匿名样例, 展示交付结构与复盘路径',
  disclaimer: '不承诺销售额、转化率或投放结果。这个案例只说明 wenai 如何把 10 SKU 试跑做成可复核交付。',
  metrics: [
    { label: '准入评分', value: '86/100' },
    { label: '验收准备', value: '78/100' },
    { label: '合同准备', value: '74/100' },
    { label: '下一动作', value: '扩 20 SKU 前补禁用词' },
  ],
  inputs: [
    '10 个真实 SKU 名称、类目、卖点、价格带和目标平台',
    '现有商品图、参考图、品牌语气和禁用表达',
    'TikTok / Instagram / Amazon 内容参考链接',
    '负责人验收口径: 哪些能直接上架, 哪些必须人工终审',
  ],
  deliverables: [
    'SKU 简报与资料缺口表',
    '主图方向、详情页卖点顺序和合规提醒',
    'TikTok / Instagram 内容参考拆解表',
    '客服高频问答与人工终审清单',
    '试跑验收报告和下一轮 SKU 决策',
  ],
  beforeAfter: [
    { label: '资料输入', before: 'SKU、图片、参考内容分散在表格和聊天记录里', after: '统一成 SKU 简报、资料缺口、验收字段' },
    { label: '上新判断', before: '运营凭经验判断先做哪些 SKU', after: '按平台、素材、参考内容、合规风险排序' },
    { label: '复盘动作', before: '交付后只说看起来不错', after: '明确继续迭代、扩 SKU、推合同或停止推进' },
  ],
  review: {
    readiness: '线索可进试跑, 但复盘前必须补齐审核人和禁用词边界。',
    acceptanceScore: '82/100',
    decision: '扩 SKU',
    nextStep: '补齐禁用词清单后, 把胜出开场句和主图方向扩到下一批 20 SKU。',
    contractAction: '若下一批验收分超过 85, 推进主站长期上新合同。',
  },
  risks: [
    '食品接触、儿童用品、功效承诺等表达必须由客户终审。',
    '内容参考只能支撑内容假设, 不能直接当作投放结论。',
    '系统生成的图片和文案进入上架前需要人工抽检。',
  ],
  samples: [
    { label: '标题候选', body: '可堆叠密封收纳盒 6 件套, 食品接触级 PP 材质, 三种尺寸, 节省橱柜空间。' },
    { label: '主图方向', body: '白底 45 度主体图 + 厨房台面场景图 + 材质细节图 + 尺寸对比图。' },
    { label: '合规提醒', body: '检查 FDA 21 CFR、LFGB、Prop 65、REACH SVHC, 禁止未经验证的食品安全绝对化表述。' },
  ],
  timeline: [
    { label: '01 输入', body: '收集 SKU、平台、素材和内容参考, 自动暴露缺口。' },
    { label: '02 标准包', body: '生成上新标准包, 输出准入分、阻塞项和交付目录。' },
    { label: '03 交付', body: '进入商品页、主图、客服话术或内容测试流程。' },
    { label: '04 复盘', body: '按验收分决定扩 SKU、补资料、推合同或停跑。' },
  ],
  standardPackHref: standardPackHref({
    goal: '为家居收纳 10 SKU 生成上新试跑标准交付包',
    brand: '家居收纳 / 10 SKU 试跑 / Shopify + TikTok Shop',
    sku: '收纳盒、密封罐、厨房整理、柜门挂架等 10 个 SKU, 目标是验证上新资料、主图方向、详情页卖点、合规边界和复盘决策。',
    links: '参考 TikTok 家居整理视频、Instagram 家居账号和 Amazon 同类商品页, 仅用于内容参考拆解。',
  }),
};

const autoAccessory: CaseStudyDetail = {
  slug: 'auto-parts',
  title: '汽摩配件参考样例到内容包',
  segment: '车载配件 / Amazon + 独立站 / 内容营销试跑',
  category: '汽摩配件',
  summary: '把车型兼容、安装场景、商标边界和内容首帧假设放进同一套可验收试跑。',
  scenario: '客户要上新车载支架和收纳配件, 最大风险不是文案不够好, 而是车型兼容、第三方商标和安装场景说不清。',
  pipelineLabel: '流程 01 · 新品上新 + 市场宣传包',
  pipelineHref: '/pipelines/marketing-campaign',
  proofLevel: '匿名样例, 展示参考样例如何变成交付目录',
  disclaimer: '不复制竞品素材, 不承诺投放结果。案例展示的是拆解、重组、验收和合同推进逻辑。',
  metrics: [
    { label: '准入评分', value: '81/100' },
    { label: '验收准备', value: '80/100' },
    { label: '合同准备', value: '77/100' },
    { label: '下一动作', value: '推进主站合同' },
  ],
  inputs: [
    '8 个车载支架和收纳配件 SKU',
    '车型兼容表、安装方式、材质参数和平台限制',
    'Amazon 商品页、Instagram 短视频和用户评论痛点',
    '第三方商标引用边界和人工终审责任人',
  ],
  deliverables: [
    '兼容车型描述结构',
    'Amazon 标题和五点候选',
    '安装场景短视频脚本与分镜',
    '商标词与平台合规风险清单',
    '7 天内容测试命名规则',
    '复盘报告与合同推进建议',
  ],
  beforeAfter: [
    { label: '兼容说明', before: '车型写法混乱, 用户难判断是否适配', after: '按年份、品牌、型号拆成可复核结构' },
    { label: '内容脚本', before: '只写卖点, 没有安装场景和反对意见', after: '从评论痛点拆开场句、场景、反驳和行动引导' },
    { label: '合同推进', before: '客户只看单次文案质量', after: '用复盘判断是否扩到全车品线' },
  ],
  review: {
    readiness: '可以进入试跑, 复盘重点放在兼容说明、安装场景和内容首帧。',
    acceptanceScore: '84/100',
    decision: '推进主站合同',
    nextStep: '把兼容说明模板、合规词库和内容测试包纳入主站长期交付。',
    contractAction: '用试跑报告换长期上新 + 内容营销月包, 不单卖散文案。',
  },
  risks: [
    '车型兼容清单需要客户负责人确认。',
    '第三方品牌词、MagSafe 等表达必须遵守平台规则。',
    '内容脚本只能作为测试假设, 不能替代投放复盘数据。',
  ],
  samples: [
    { label: '兼容结构', body: '按年份、品牌、车型分组展示: 例如 2018-2024 某中型车、2019-2024 某 SUV、2020-2024 某新能源车型。' },
    { label: '内容开场句', body: '3 秒内展示单手安装失败场景, 再切到磁吸固定和转弯稳定对比。' },
    { label: '合规边界', body: '避免 Apple Compatible 等高风险表达, 改为 Works with MagSafe devices 并保留人工终审。' },
  ],
  timeline: [
    { label: '01 输入', body: '导入车型、参数、安装方式和内容参考。' },
    { label: '02 标准包', body: '生成兼容说明、合规词边界和内容测试目录。' },
    { label: '03 交付', body: '进入商品页、短视频脚本和客服问答生产。' },
    { label: '04 复盘', body: '用验收分判断是否进入长期车品线合同。' },
  ],
  standardPackHref: standardPackHref({
    goal: '为汽摩配件 SKU 生成内容营销试跑标准交付包',
    brand: '汽摩配件 / Amazon + 独立站 / 内容营销试跑',
    sku: '车载支架、车载收纳、磁吸配件等 8 个 SKU, 重点验证车型兼容、安装场景、商标边界和内容首帧。',
    links: 'Amazon 同类商品页、Instagram 安装演示、用户评论痛点, 仅用于拆解参考。',
  }),
};

const electronicsOutbound: CaseStudyDetail = {
  slug: 'electronics',
  title: '数码 SKU 外联增长包',
  segment: '数码电子 / TikTok + Instagram / 达人冷启试跑',
  category: '数码电子',
  summary: '把产品卖点、达人画像、个性化开头和跟进节奏做成可批量执行的外联包。',
  scenario: '客户有蓝牙音箱、耳机等 SKU, 需要验证能不能用更低成本触达垂类达人, 同时保留人工审核口径。',
  pipelineLabel: '流程 02 · 达人批量冷启',
  pipelineHref: '/pipelines/influencer-outbound',
  proofLevel: '匿名样例, 展示外联标准流程与复盘字段',
  disclaimer: '不承诺达人回复率。案例展示个性化外联如何从散写变成可管理交付。',
  metrics: [
    { label: '准入评分', value: '78/100' },
    { label: '验收准备', value: '75/100' },
    { label: '合同准备', value: '71/100' },
    { label: '下一动作', value: '补筛选口径' },
  ],
  inputs: [
    '目标 SKU、价格、核心卖点、样品预算和合作动作',
    '达人账号、平台、粉丝量、近期内容和邮箱',
    '品牌禁用语、合作条款和回复归因表',
    'A/B 主动跟进版本和人工终审人',
  ],
  deliverables: [
    '达人分层与筛选理由',
    '每个达人独立个性化开头',
    '3 版外联邮件和私信脚本',
    '跟进节奏和回复归因表',
    '试跑验收报告与下一批达人建议',
  ],
  beforeAfter: [
    { label: '达人筛选', before: '人工翻账号, 只记粉丝数', after: '记录内容匹配、近期主题和合作风险' },
    { label: '外联文案', before: '复制模板群发, 容易被忽略', after: '每条引用对方近期内容, 保留品牌合作动作' },
    { label: '复盘', before: '只看有没有回复', after: '按开头、卖点、平台和达人层级归因' },
  ],
  review: {
    readiness: '可以继续迭代试跑, 但扩量前要补达人筛选口径和合作条款。',
    acceptanceScore: '76/100',
    decision: '继续迭代试跑',
    nextStep: '补齐达人筛选口径、合作条款和回复归因表, 再决定是否扩到完整外联包。',
    contractAction: '暂不推大合同, 先用第二轮试跑验证回复质量与执行稳定性。',
  },
  risks: [
    '达人邮箱和平台私信需要遵守反垃圾与平台规则。',
    '合作条款、样品寄送和费用预算必须由客户确认。',
    '回复率受名单质量影响大, 不能用样例做承诺。',
  ],
  samples: [
    { label: '邮件主题', body: '6 月户外出行内容, 是否需要一款防水便携音箱做场景测试?' },
    { label: '个性化开头', body: '看到你最近连续更新的皮划艇路线内容, 日出片段非常适合展示这款 SKU 的户外使用场景。' },
    { label: '跟进字段', body: '账号层级、内容主题、开头版本、合作动作版本、回复状态、下一步动作。' },
  ],
  timeline: [
    { label: '01 输入', body: '录入 SKU、预算、合作动作和达人清单。' },
    { label: '02 标准包', body: '生成外联标准流程、多版本文案和跟进字段。' },
    { label: '03 交付', body: '导出到 Gmail YAMM、Mailmeteor 或人工执行表。' },
    { label: '04 复盘', body: '按回复归因决定扩量、换人群或停止。' },
  ],
  standardPackHref: standardPackHref({
    goal: '为数码 SKU 生成达人外联试跑标准交付包',
    brand: '数码电子 / TikTok + Instagram / 达人冷启试跑',
    sku: '蓝牙音箱、耳机、户外数码配件, 目标是验证达人筛选、个性化外联、跟进节奏和复盘归因。',
    links: '达人账号列表、近期内容链接和竞品合作内容, 仅用于外联个性化参考。',
  }),
};

const productImage: CaseStudyDetail = {
  slug: 'novahome-image',
  title: '电商主图候选包',
  segment: '家居用品 / Amazon + Shopify / 主图生产试跑',
  category: '家居用品 · 主图',
  summary: '把拍摄排期前置成候选图验证, 让运营先判断哪些 SKU 值得进入正式视觉生产。',
  scenario: '客户月均 30+ SKU 上新, 摄影棚排期慢。试跑先验证主图方向、场景图和终审边界。',
  pipelineLabel: '流程 03 · 电商主图',
  pipelineHref: '/pipelines/product-image',
  proofLevel: '匿名样例, 展示候选图生产与人工终审边界',
  disclaimer: '系统生成图只作为候选图和测试素材, 最终上架必须人工终审。',
  metrics: [
    { label: '准入评分', value: '80/100' },
    { label: '验收准备', value: '73/100' },
    { label: '合同准备', value: '69/100' },
    { label: '下一动作', value: '补视觉规范' },
  ],
  inputs: [
    'SKU 图、材质、尺寸、包装、卖点和目标平台',
    '品牌视觉规范、禁用词和不能生成的元素',
    '主图、场景图、细节图、对比图数量要求',
    '人工终审人和上架责任边界',
  ],
  deliverables: [
    '主图描述词与候选图方向',
    '场景图和细节图生产清单',
    '平台规格与禁用元素清单',
    '候选图验收表和重跑建议',
    '下一批 SKU 视觉规范沉淀',
  ],
  beforeAfter: [
    { label: '生产节奏', before: '摄影棚排期 5-7 天', after: '先在 1 天内产出候选方向' },
    { label: '成本控制', before: '每个 SKU 先付完整拍摄成本', after: '先筛掉不值得进入正式拍摄的方向' },
    { label: '风险边界', before: '1688 改图和竞品仿图风险高', after: '候选生成 + 禁用词 + 人工终审' },
  ],
  review: {
    readiness: '需要补品牌视觉规范和禁用元素后再扩批量主图生产。',
    acceptanceScore: '74/100',
    decision: '补资料再跑',
    nextStep: '补齐品牌视觉规范、禁用词和人工终审人, 再扩到批量主图生产。',
    contractAction: '先卖视觉规范整理 + 10 SKU 候选图试跑, 通过后接长期视觉月包。',
  },
  risks: [
    '系统生成图可能出现细节不一致, 必须人工终审。',
    '平台主图规范、商标词和功效表达不能自动放行。',
    '候选图适合测试方向, 不等于最终商业摄影替代品。',
  ],
  samples: [
    { label: '白底主图', body: '纯白背景, 产品占画面 80%, 轻微投影, 保留材质真实感。' },
    { label: '厨房场景', body: '干净白色厨房台面, 自然侧光, 产品作为前景主体, 避免杂乱道具。' },
    { label: '细节图', body: 'BPA-Free 食品级 PP 材质纹理特写, 标注需人工终审。' },
  ],
  timeline: [
    { label: '01 输入', body: '整理 SKU、视觉规范和图像目标。' },
    { label: '02 标准包', body: '生成主图候选方向和验收规则。' },
    { label: '03 交付', body: '进入主图候选或摄影简报流程。' },
    { label: '04 复盘', body: '按候选图验收决定正式拍摄或批量生成。' },
  ],
  standardPackHref: standardPackHref({
    goal: '为家居 SKU 生成主图候选试跑标准交付包',
    brand: '家居用品 / Amazon + Shopify / 主图生产试跑',
    sku: '收纳盒系列 SKU, 需要主图、场景图、细节图和对比图候选方向, 最终上架人工终审。',
    links: '品牌视觉规范、平台图片规范和同类商品页参考。',
  }),
};

const homePack: CaseStudyDetail = {
  ...homeStorage,
  slug: 'home-storage-launch-pack',
  title: '家居收纳 10 SKU 试跑证据包',
};

const autoPack: CaseStudyDetail = {
  ...autoAccessory,
  slug: 'auto-accessory-content-pack',
  title: '汽摩配件内容营销试跑证据包',
};

const homelody: CaseStudyDetail = {
  ...homeStorage,
  slug: 'homelody',
  title: 'H 代运营家居上新样例',
  segment: '家居用品 / Amazon 多站点 / 新品上新试跑',
};

const vicseed: CaseStudyDetail = {
  ...autoAccessory,
  slug: 'vicseed',
  title: 'V 独立站车载支架样例',
  segment: '汽摩配件 / Shopify + Amazon / 兼容说明试跑',
};

const microAudio: CaseStudyDetail = {
  ...electronicsOutbound,
  slug: 'micro-audio',
  title: 'M 工厂数码达人外联样例',
  segment: '数码电子 / TikTok + Instagram / 达人冷启试跑',
};

export const CASE_STUDY_DETAILS: CaseStudyDetail[] = [
  homeStorage,
  autoAccessory,
  electronicsOutbound,
  homePack,
  autoPack,
  homelody,
  vicseed,
  microAudio,
  productImage,
];

export function getCaseStudyDetail(slug: string): CaseStudyDetail | undefined {
  return CASE_STUDY_DETAILS.find(item => item.slug === slug);
}
