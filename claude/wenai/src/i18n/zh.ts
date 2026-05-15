export const PLACEHOLDER = {
  servedBrands: '试跑团队',
  totalImages: '10 SKU',
  totalVideos: '3 套内容脚本',
  avgSavings: '人工复核',
  retention: '可进入正式合作',
  cases: [
    {
      slug: 'home-decor',
      industry: '家居收纳',
      brandPlaceholder: '演示 SKU / 收纳架',
      headline: '把混乱 SKU 资料转成上新包：文案、内容方向、风险提示和复盘口径一次生成。',
      metrics: [
        { label: '输入', from: '零散 SKU 备注', to: '结构化说明', multiple: '' },
        { label: '输出', from: '空白文档', to: '上新交付包', multiple: '' },
        { label: '验收', from: '凭记忆检查', to: '标准清单', multiple: '' },
        { label: '推进', from: '演示样例', to: '试跑决策', multiple: '' },
      ],
    },
    {
      slug: 'auto-parts',
      industry: '汽配',
      brandPlaceholder: '演示 SKU / 车载支架',
      headline: '把安装场景、适配风险和客服回复放进同一条 SKU 记录，避免交付割裂。',
      metrics: [
        { label: '输入', from: '规格表', to: 'SKU 摘要', multiple: '' },
        { label: '输出', from: '单条文案', to: '上新包', multiple: '' },
        { label: '风险', from: '人工漏查', to: '商标与适配提示', multiple: '' },
        { label: '推进', from: '演示样例', to: '试跑决策', multiple: '' },
      ],
    },
    {
      slug: 'electronics',
      industry: '数码配件',
      brandPlaceholder: '演示 SKU / 无线耳机',
      headline: '在内容测试前先跑标题、利益点、翻译、合规提示和复盘记录。',
      metrics: [
        { label: '输入', from: '松散卖点', to: '结构化角度', multiple: '' },
        { label: '输出', from: '中文草稿', to: '跨境上新文案', multiple: '' },
        { label: '测试', from: '拍脑袋', to: '可测试内容角度', multiple: '' },
        { label: '推进', from: '演示样例', to: '试跑决策', multiple: '' },
      ],
    },
  ],
  beforeAfter: [
    {
      industry: '家居收纳',
      traditionalCost: '3500 元/SKU',
      traditionalDays: '3 天',
      wenaiCost: '50 元/SKU',
      wenaiDays: '当晚',
      quote: '这个样例展示的是交付形态，不承诺具体业绩。',
      attribution: 'wenai 样例项目',
    },
    {
      industry: '汽配',
      traditionalCost: '2800 元/SKU',
      traditionalDays: '4 天',
      wenaiCost: '45 元/SKU',
      wenaiDays: '6 小时',
      quote: '价值在于安装语境、适配风险和人工复核边界，而不是只写一段文案。',
      attribution: 'wenai 样例项目',
    },
    {
      industry: '数码配件',
      traditionalCost: '4200 元/SKU',
      traditionalDays: '2 天',
      wenaiCost: '60 元/SKU',
      wenaiDays: '4 小时',
      quote: '先跑 SKU 上新包，再用真实投放数据进入复盘。',
      attribution: 'wenai 样例项目',
    },
  ],
  founder: {
    namePlaceholder: '创始人',
    titlePlaceholder: '创始人 / 运营负责人',
    storyPlaceholder:
      'wenai 面向不需要“又一个工具”的电商团队。他们真正需要的是一条可靠的商业交付线：SKU 输入、类目规则、品牌禁区、内容方向、验收报告和商务跟进。\n\n产品刻意保留人工复核。系统压缩重复准备工作，运营人员仍然掌控功效宣称、平台风险、品牌语气和最终验收。',
  },
  team: [
    { initial: '产', namePlaceholder: '产品负责人', role: '流程与试跑设计' },
    { initial: '工', namePlaceholder: '工程负责人', role: '管线、API 与稳定性' },
    { initial: '增', namePlaceholder: '增长负责人', role: '参考样例与内容营销' },
    { initial: '客', namePlaceholder: '客户成功', role: '交付复盘与使用推进' },
    { initial: '智', namePlaceholder: '规则系统', role: '标准流程、护栏与评分器' },
    { initial: '运', namePlaceholder: '运营负责人', role: '商务推进、响应时限与交接' },
  ],
  testimonials: [
    {
      quote: '10 SKU 试跑让交付边界很清楚，扩更大流程前我们能先看见真实质量。',
      personPlaceholder: '家居品类运营',
      initial: '家',
    },
    {
      quote: '品牌禁区和类目规则放在同一条流程里，省掉每周重复改同样检查项。',
      personPlaceholder: '跨境电商负责人',
      initial: '跨',
    },
    {
      quote: '老板版报告有用，因为它说明哪些已就绪、哪些要复核、哪些该进入合同。',
      personPlaceholder: '平台运营经理',
      initial: '运',
    },
  ],
} as const;

export const COPY = {
  brand: {
    name: 'wenai',
    tagline: '给电商团队的商业交付系统',
  },

  nav: {
    products: '产品',
    cases: '案例',
    pricing: '方案',
    resources: '资源',
    about: '关于',
    login: '登录',
    dashboard: '工作台',
    cta: '运行演示',
    productItems: [
      { label: '内容决策工作台', desc: '导入 5 大平台 CSV，生成暂停、放大、继续验证或重做承接建议。', href: '/dashboard' },
      { label: '生产需求 Brief', desc: '把决策结论转成剪辑师、投手和老板都能执行的文档。', href: '/factory' },
      { label: '脱敏报告模板', desc: '分享给团队或客户后，对方可复制模板创建自己的工作台。', href: '/poc/report' },
    ],
    resourceItems: [
      { label: '定价', desc: '查看 Free、Starter 和 Growth 的权益边界。', href: '/pricing' },
      { label: '工作台', desc: '从行业模板开始第一轮内容实验。', href: '/dashboard' },
      { label: '报告模板', desc: '查看老板和客户能直接读懂的脱敏报告。', href: '/poc/report' },
    ],
  },

  trust: {
    headline: '一个聚焦电商试跑交付、标准包、老板版报告和商务交接的子站。',
    stats: [
      { label: '试跑范围', value: PLACEHOLDER.totalImages },
      { label: '交付层数', value: '5' },
      { label: '复盘动作', value: '30 天' },
      { label: '商业状态', value: PLACEHOLDER.retention },
    ],
  },

  roi: {
    title: '扩正式合作前，先估算上新工作差距。',
    subtitle: '这个计算器对比人工 SKU 准备成本与标准化辅助交付流程。它是估算，不是营收承诺。',
    inputs: {
      dailySkus: '每日 SKU 数',
      currentCostPerSku: '当前每个 SKU 内容成本（元）',
    },
    output: {
      currentMonthly: '当前月成本估算',
      wenaiMonthly: '标准化流程估算',
      monthlySaved: '月度差距估算',
      yearlySaved: '年度差距估算',
    },
    primaryCta: '免费开始第一轮实验',
    secondaryCta: '查看定价',
    wenaiCostPerSku: 50,
  },

  pipeline3: {
    title: '从 SKU 输入到试跑验收，三步跑通',
    steps: [
      {
        step: '01',
        title: '准备 SKU',
        input: '名称 / 类目 / 卖点 / 平台 / 素材',
        output: '10 SKU 输入摘要',
        time: '客户准备',
        link: { label: '打开试跑清单', href: '/poc' },
      },
      {
        step: '02',
        title: '生成交付包',
        input: 'SKU 输入摘要',
        output: '图片方向 / 文案 / 合规 / 客服 / 复盘',
        time: '试跑交付',
        link: { label: '运行演示流程', href: '/demo' },
      },
      {
        step: '03',
        title: '复盘并推进',
        input: '交付包 + 风险提示',
        output: '老板版验收报告',
        time: '合同判断',
        link: { label: '查看报告模板', href: '/poc/report' },
      },
    ],
    note: '每一步都服务于同一个问题：这个账户是否应该进入主站合同和付款流程。',
  },

  beforeAfter: {
    title: '样例包展示完整交付形态',
    note: '这些样例展示输入、决策、报告和下一步动作如何闭环，帮助你判断是否适合自己的团队。',
    moreLink: { label: '查看案例库', href: '/cases' },
  },

  caseSection: {
    title: '三个 SKU 交付样例',
    moreLink: { label: '查看全部案例', href: '/cases' },
    fullCaseLink: '查看案例',
  },

  compliance: {
    title: '自动生成内容必须有复核边界',
    subtitle: '平台披露、商标、功效宣称风险、类目限制和人工最终审核会进入试跑报告。',
    platforms: [
      { name: 'TikTok', color: '#c8975a' },
      { name: 'Instagram', color: '#c8975a' },
      { name: 'YouTube', color: '#c8975a' },
      { name: 'Amazon', color: '#c8975a' },
      { name: 'Shopify', color: '#c8975a' },
      { name: '独立站', color: '#c8975a' },
    ],
    features: [
      { title: '披露提示', desc: '需要考虑 AIGC 标识或平台披露时自动提醒。' },
      { title: '品牌禁区', desc: '发布前始终展示禁用宣称、竞品名称和敏感词。' },
      { title: '人工复核', desc: '把系统建议和最终审批分开，最后一公里由运营人员负责。' },
    ],
    cta: '打开合规工具',
    ctaHref: '/tools/aigc-compliance',
  },

  pricing: {
    title: '试跑、团队版和企业落地的商业路径',
    subtitle: '先用 10 SKU 证明价值，再扩展到品牌规则、内容营销、报告和商务推进的可复用交付线。',
    tiers: [
      {
        id: 'poc',
        name: '试跑',
        price: '10 SKU',
        period: '',
        recommended: false,
        features: ['单类目上新包', '品牌规则与禁区复核', '老板版复盘', '验收评分'],
        cta: '运行试跑',
        ctaHref: '/poc',
      },
      {
        id: 'team',
        name: '团队版',
        price: '标准交付',
        period: '',
        recommended: true,
        features: ['批量上新交付流程', '内容参考样例包', '下一动作与响应时限', '可复用标准包'],
        cta: '提交询盘',
        ctaHref: '/inquire',
      },
      {
        id: 'enterprise',
        name: '企业版',
        price: '定制',
        period: '',
        recommended: false,
        features: ['工作区规则', '类目验收阈值', '私有部署范围', '合同交付支持'],
        cta: '咨询企业版',
        ctaHref: '/enterprise',
      },
    ],
  },

  faq: {
    title: '买方常见问题',
    items: [
      {
        q: 'wenai 只是文案生成器吗？',
        a: '不是。它把 SKU 输入、类目规则、品牌禁区、内容营销、试跑报告和商务推进打包成一条商业交付系统。',
      },
      {
        q: '客户不培训能跑通吗？',
        a: '试跑路径按 5 分钟首跑设计：选类目、填 SKU、生成标准包、查看报告、提交询盘。',
      },
      {
        q: '付款和正式合同在哪里处理？',
        a: '这个子站负责产品体验和试跑推进。正式付款和合同执行可以继续放在主独立站。',
      },
      {
        q: '规则能按类目配置吗？',
        a: '可以。品牌规则、禁用词、类目验收阈值和复盘备注都设计成可复用的工作区规则。',
      },
    ],
  },

  finalCta: {
    h2: '先跑第一批 10 SKU 试跑。',
    subtitle: '给客户一套标准交付包、老板版报告和清晰的下一步商务动作。',
    primaryCta: '开始试跑',
    primaryCtaHref: '/poc',
    secondaryCta: '提交询盘',
    secondaryCtaHref: '/inquire',
    note: '先明确试跑范围。合同、付款和生产扩容继续进入正式商务流程。',
  },

  footer: {
    columns: {
      product: {
        title: '产品',
        links: [
          { label: '内容决策工作台', href: '/dashboard' },
          { label: '导入 CSV', href: '/factory' },
          { label: '报告模板', href: '/poc/report' },
          { label: '定价', href: '/pricing' },
        ],
      },
      company: {
        title: '开始使用',
        links: [
          { label: '免费开始', href: '/dashboard' },
          { label: '从行业模板开始', href: '/dashboard' },
          { label: '查看完整对比', href: '/pricing' },
        ],
      },
      resources: {
        title: '资源',
        links: [
          { label: 'CSV 导入页', href: '/factory' },
          { label: '公开报告页', href: '/poc/report' },
          { label: '筷子科技设置', href: '/settings/kuaizi' },
        ],
      },
      legal: {
        title: '法律',
        links: [
          { label: '隐私', href: '/privacy' },
          { label: '条款', href: '/terms' },
          { label: '数据处理协议', href: '/legal/dpa' },
        ],
      },
    },
    copyright: 'Copyright 2026 wenai. All rights reserved.',
    icp: '内容实验决策工作台',
    socials: [
      { label: '邮箱', initial: '邮' },
      { label: '领英', initial: 'in' },
      { label: 'X', initial: 'X' },
    ],
  },

  about: {
    mission: 'wenai 帮电商团队把分散的 SKU 工作变成商业交付系统：输入清楚、规则复用、输出稳定、后续能推进合同。',
    sections: {
      founder: '操盘故事',
      team: '运营角色',
      customers: '试点反馈',
      careers: '加入建设',
    },
    careers: {
      desc: '我们正在建设聚焦电商的商业交付系统。当前优先级是产品交付、客户流程和商业化就绪。',
      jobs: [
        { title: '电商流程设计师', location: '远程' },
        { title: '前端产品工程师', location: '远程' },
        { title: '客户成功运营', location: '远程' },
      ],
      contact: 'hello@wenai.example',
    },
  },

  productPhotoshoot: {
    hero: {
      h1: '面向 SKU 上新包的产品图方向',
      h2: '在扩生产前，先为 SKU 生成场景方向、模特指导和人工复核提示。',
      cta: '运行演示 SKU',
      ctaHref: '/demo',
    },
    modesTitle: '场景模式',
    modes: [
      { title: '模特场景', desc: '适合服饰和生活方式类目的真人语境图方向。' },
      { title: '白底图', desc: '适合平台上架的干净产品框架。' },
      { title: '生活方式', desc: '围绕使用场景和利益点组织构图。' },
      { title: '节日营销', desc: '节日、活动和促销可用的视觉 prompt。' },
      { title: '汽配', desc: '强调安装和适配语境。' },
      { title: '数码', desc: '围绕功能点展示设备和配件。' },
      { title: '家居', desc: '房间尺度语境和使用角度。' },
      { title: '美妆', desc: '质地、流程和宣称安全方向。' },
    ],
    workflow: {
      title: '产品图方向流程',
      steps: [
        { label: 'SKU 说明', desc: '从产品名、类目、卖点和限制开始。' },
        { label: '场景计划', desc: '生成可执行的视觉方向和 prompt。' },
        { label: '复核', desc: '标出缺素材、风险宣称和最终人工检查项。' },
      ],
    },
    faq: [
      { q: '它会替代最终摄影审核吗？', a: '不会。它准备方向和复核备注，最终审批仍由人负责。' },
      { q: '能处理批量 SKU 吗？', a: '可以。客户已经准备好 10 个 SKU 输入时，使用批量上新。' },
    ],
  },

  productPipeline: {
    hero: {
      h1: '完整 SKU 上新交付管线',
      h2: '从产品信息到上新文案、内容方向、合规提示、客服话术和复盘。',
    },
    flow: 'SKU 输入 -> 类目规则 -> 品牌规则 -> 上新文案 -> 内容脚本 -> 合规检查 -> 老板版报告 -> 商务下一动作',
  },

  productVideo: {
    hero: {
      h1: '面向电商 SKU 的短视频脚本',
      h2: '把 SKU 卖点和参考样例转成 TikTok、Reels 和轮播脚本，方便运营复核。',
    },
    modesTitle: '视频脚本模式',
    modes: [
      { title: '开场优先短视频', desc: '用痛点、反差或结果开场，再展示产品证据。' },
      { title: '使用场景演示', desc: '用清晰顺序展示产品在真实场景里的使用方式。' },
      { title: '轮播脚本', desc: '逐帧图片和字幕计划，适合快速内容测试。' },
    ],
  },
} as const;
