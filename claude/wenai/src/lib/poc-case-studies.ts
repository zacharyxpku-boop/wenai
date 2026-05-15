export interface PocEvidenceCase {
  slug: string;
  title: string;
  segment: string;
  disclaimer: string;
  input: {
    skuScope: string;
    platforms: string;
    assets: string;
    benchmark: string;
  };
  standardPack: {
    readiness: string;
    blockers: string[];
    decision: string;
  };
  deliverables: string[];
  beforeAfter: Array<{ label: string; before: string; after: string }>;
  review: {
    acceptanceScore: string;
    decision: string;
    nextStep: string;
  };
  evidence: string[];
}

export const POC_EVIDENCE_CASES: PocEvidenceCase[] = [
  {
    slug: 'home-storage-launch-pack',
    title: '匿名样例 A · 家居收纳 10 SKU 上新交付包',
    segment: '美区独立站 + TikTok Shop / 家居收纳 / 10 SKU 试跑',
    disclaimer: '匿名样例, 用于展示交付结构和复盘口径。不是客户业绩承诺, 不声明销售额或转化提升。',
    input: {
      skuScope: '10 个真实 SKU, 覆盖抽屉收纳、食品密封盒、柜门挂架 3 个子类目。',
      platforms: 'Shopify 独立站 + TikTok Shop, 重点验证短视频首帧和详情页卖点顺序。',
      assets: '商品图齐, 但缺少统一场景图、禁用词清单和负责人验收口径。',
      benchmark: '3 条 TikTok 家居整理视频、2 个 Instagram 家居账号、1 个 Amazon 同类商品页。',
    },
    standardPack: {
      readiness: '线索分 86 / 验收准备 78 / 合同准备 74',
      blockers: [
        '缺少最终审核人签字口径',
        '合规禁用词未整理',
        '参考样例只能支撑内容假设, 还不能直接当作投放结论',
      ],
      decision: '可进入试跑, 但复盘前必须补齐审核人和禁用词边界。',
    },
    deliverables: [
      '10 SKU 输入简报与资料缺口表',
      '每个 SKU 的主图方向、详情页卖点顺序和合规提醒',
      'TikTok / Instagram 内容参考拆解表',
      '轮播图首帧测试假设与 7 天排期',
      '客服高频问答与人工终审清单',
      '试跑验收报告与下一轮 SKU 决策',
    ],
    beforeAfter: [
      { label: '输入资料', before: 'SKU、图片、内容参考分散在表格和聊天记录里', after: '统一成 SKU 简报、资料缺口、验收字段' },
      { label: '交付判断', before: '运营凭经验判断先做哪些 SKU', after: '按平台、素材、内容参考、合规风险排序' },
      { label: '复盘动作', before: '交付完只说“看起来不错”', after: '明确继续迭代、扩 SKU、推合同或停止推进' },
    ],
    review: {
      acceptanceScore: '82/100',
      decision: '扩 SKU',
      nextStep: '补齐禁用词清单后, 把胜出开场句和主图方向扩到下一批 20 SKU。',
    },
    evidence: [
      '每个交付物都能对应到输入字段, 不靠临场口头解释。',
      '阻塞项在开工前暴露, 避免交付后才发现负责人无法验收。',
      '复盘结论直接落到下一轮 SKU 范围和合同推进动作。',
    ],
  },
  {
    slug: 'auto-accessory-content-pack',
    title: '匿名样例 B · 汽摩配件参考样例到内容包',
    segment: 'Amazon + 独立站 / 车载配件 / 内容营销试跑',
    disclaimer: '匿名样例, 只展示方法和交付形态。竞品内容只做拆解参考, 不复制素材, 不承诺投放结果。',
    input: {
      skuScope: '8 个车载支架和收纳配件, 其中 5 个可进入完整内容测试。',
      platforms: 'Amazon 商品页 + 独立站落地页 + Instagram 短视频。',
      assets: '参数表齐, 但车型兼容、商标词、安装场景需要人工终审。',
      benchmark: 'Amazon 3 个同类商品页、Instagram 4 条安装演示内容、2 条用户评论痛点。',
    },
    standardPack: {
      readiness: '线索分 81 / 验收准备 80 / 合同准备 77',
      blockers: [
        '车型兼容清单需要负责人确认',
        '商标词和第三方品牌引用必须人工终审',
      ],
      decision: '可进入试跑, 复盘重点放在兼容说明、安装场景和内容首帧。',
    },
    deliverables: [
      '兼容车型描述结构',
      'Amazon 标题与五点描述候选',
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
      acceptanceScore: '84/100',
      decision: '推进主站合同',
      nextStep: '把兼容说明模板、合规词库和内容测试包纳入主站长期交付。',
    },
    evidence: [
      '把参考样例变成可复用结构, 不是复制竞品文案。',
      '把合规红线前置到交付包, 降低后期返工。',
      '复盘不只评价内容好坏, 而是判断是否值得长期接入。',
    ],
  },
];
