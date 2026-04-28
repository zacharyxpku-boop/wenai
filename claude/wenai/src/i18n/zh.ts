/**
 * wenai 全站中文文案 · i18n 预留
 *
 * 占位数据请改 PLACEHOLDER 区域
 * 后续加 en/ja 时新增同结构对象, 通过 useLocale hook 切换
 */

export const PLACEHOLDER = {
  servedBrands: '200+',
  totalImages: '120 万+',
  totalVideos: '8 万+',
  avgSavings: '87%',
  retention: '94%',
  cases: [
    {
      slug: 'home-decor',
      industry: '家居',
      brandPlaceholder: '某家居跨境品牌',
      headline: '团队从 12 人砍到 3 人, 月上新从 120 SKU 干到 800',
      metrics: [
        { label: '月上新', from: '120 SKU', to: '800 SKU', multiple: '6.7×' },
        { label: '内容成本', from: '¥42 万', to: '¥4,800', multiple: '87×' },
        { label: '上架周期', from: '14 天', to: '1 天', multiple: '14×' },
        { label: 'ROI', from: '—', to: '87×', multiple: '' },
      ],
    },
    {
      slug: 'auto-parts',
      industry: '汽摩配件',
      brandPlaceholder: '某汽摩配件代运营',
      headline: '一个人盯 20 个店, AI 出图 + 客服话术全包',
      metrics: [
        { label: '管理店铺', from: '5 个', to: '20 个', multiple: '4×' },
        { label: '内容成本', from: '¥28 万/月', to: '¥6,500/月', multiple: '43×' },
        { label: '响应时延', from: '4 小时', to: '8 分钟', multiple: '30×' },
        { label: 'ROI', from: '—', to: '52×', multiple: '' },
      ],
    },
    {
      slug: 'electronics',
      industry: '数码',
      brandPlaceholder: '某数码品牌',
      headline: '上架周期从 2 周缩到 1 天, 6 国语言一晚完工',
      metrics: [
        { label: '上架周期', from: '14 天', to: '1 天', multiple: '14×' },
        { label: '语言覆盖', from: '英语', to: '6 国', multiple: '6×' },
        { label: '内容成本', from: '¥38 万/月', to: '¥7,200/月', multiple: '53×' },
        { label: 'ROI', from: '—', to: '63×', multiple: '' },
      ],
    },
  ],
  beforeAfter: [
    {
      industry: '家居',
      traditionalCost: '¥3,500/SKU',
      traditionalDays: '3 天交付',
      wenaiCost: '¥50/SKU',
      wenaiDays: '一晚交付',
      quote: '肉眼无法分辨, 转化率提升 12%',
      attribution: '某家居跨境品牌 · 内容运营负责人',
    },
    {
      industry: '汽摩',
      traditionalCost: '¥2,800/SKU',
      traditionalDays: '4 天交付',
      wenaiCost: '¥45/SKU',
      wenaiDays: '6 小时交付',
      quote: '配件类 SKU 多, AI 出图后退货率反而下降',
      attribution: '某汽摩代运营 · COO',
    },
    {
      industry: '数码',
      traditionalCost: '¥4,200/SKU',
      traditionalDays: '2 天交付',
      wenaiCost: '¥60/SKU',
      wenaiDays: '4 小时交付',
      quote: '6 个语言版本一晚出, 比之前外包快 7 倍',
      attribution: '某数码品牌 · 跨境运营总监',
    },
  ],
  founder: {
    namePlaceholder: '创始人姓名',
    titlePlaceholder: '创始人 · CEO',
    storyPlaceholder: '2024 年, 我在跨境电商行业看到一个荒谬场景: 一个 SKU 的内容生产成本高达 ¥3,500, 但生命周期可能只有 30 天。\n\n传统拍摄流程在 SKU 爆炸的今天完全跑不动。AI 不是要取代摄影师, 是把摄影师从重复劳动里解放出来, 专注真正创造价值的高端大片。\n\nwenai 想做的不是"另一个 AI 工具", 是把摄影、文案、合规、客服打通成一条工厂级流水线 — 让中国跨境品牌用 1/50 的成本做出比海外大牌更好看的内容。',
  },
  team: [
    { initial: '张', namePlaceholder: '团队成员 1', role: '联合创始人 · CTO' },
    { initial: '李', namePlaceholder: '团队成员 2', role: '产品负责人' },
    { initial: '王', namePlaceholder: '团队成员 3', role: '增长负责人' },
    { initial: '陈', namePlaceholder: '团队成员 4', role: '客户成功负责人' },
    { initial: '刘', namePlaceholder: '团队成员 5', role: 'AI 算法工程师' },
    { initial: '赵', namePlaceholder: '团队成员 6', role: '前端工程师' },
  ],
  testimonials: [
    {
      quote: '原来 1 个摄影团队一周拍 20 SKU, 现在 wenai 一晚跑 200 SKU, 成本还低 50 倍',
      personPlaceholder: '某家居品牌 内容总监',
      initial: '林',
    },
    {
      quote: '6 个国家语言一次过, 之前外包翻译要等一周, 现在 30 分钟全完工',
      personPlaceholder: '某数码品牌 跨境总监',
      initial: '吴',
    },
    {
      quote: '合规那块我最焦虑, AIGC 标识自动加, 平台 0 投诉, 这是真省心',
      personPlaceholder: '某汽摩代运营 法务',
      initial: '郑',
    },
    {
      quote: '团队从 12 人到 3 人, 老板那边的成本压力直接消失',
      personPlaceholder: '某服装跨境 创始人',
      initial: '孙',
    },
    {
      quote: '试用期就跑了 30 个 SKU, 第二周直接上 Team 版',
      personPlaceholder: '某美妆跨境 运营经理',
      initial: '黄',
    },
    {
      quote: 'API 接进我们 ERP, 库存断货自动推飞书, 老板再也不漏单',
      personPlaceholder: '某户外品牌 IT 负责人',
      initial: '徐',
    },
  ],
} as const;

export const COPY = {
  brand: {
    name: 'wenai',
    tagline: '跨境电商内容工厂',
  },

  nav: {
    products: '产品',
    cases: '案例',
    pricing: '定价',
    resources: '资源',
    about: '关于',
    login: '登录',
    dashboard: '我的工作台',
    cta: '免费开始',
    productItems: [
      { label: 'AI 影棚', desc: '主图与模特图工厂', href: '/product/photoshoot' },
      { label: 'AI 视频', desc: '5 秒短视频与脚本', href: '/product/video' },
      { label: '全流水线交付', desc: '从 SKU 到上架闭环', href: '/product/pipeline' },
    ],
    resourceItems: [
      { label: '免费工具', desc: 'Hook 打分 / 合规速查', href: '/tools' },
      { label: '帮助中心', desc: '使用指南与 FAQ', href: '/docs' },
      { label: 'Changelog', desc: '版本与功能更新', href: '/changelog' },
      { label: 'API 文档', desc: '商家集成参考', href: '/docs' },
    ],
  },

  hero: {
    h1: '跨境电商内容生产, 便宜 50 倍',
    h2: '工厂级 AI 流水线, 一晚交付主图、模特图、详情页、短视频、客服话术全套\n对比真人摄影, 每个 SKU 从 ¥3,500 降到 ¥50',
    stats: [
      { value: '50×', label: '降本' },
      { value: '一晚', label: '交付' },
      { value: '全套', label: '交付' },
    ],
    primaryCta: '算一下我每月能省多少',
    secondaryCta: '看 3 个真实案例',
  },

  trust: {
    headline: `已服务 ${PLACEHOLDER.servedBrands} 跨境电商品牌`,
    stats: [
      { label: '累计生成图片', value: PLACEHOLDER.totalImages },
      { label: '累计生成视频', value: PLACEHOLDER.totalVideos },
      { label: '平均节省成本', value: PLACEHOLDER.avgSavings },
      { label: '客户续费率', value: PLACEHOLDER.retention },
    ],
    logoCount: 8,
  },

  roi: {
    title: '你公司每月能省多少? 输入两个数字就知道',
    subtitle: `基于 ${PLACEHOLDER.servedBrands} 真实客户数据估算, 结果可保存为 PDF 给老板看`,
    inputs: {
      dailySkus: '日均上新 SKU 数',
      currentCostPerSku: '当前每个 SKU 的内容生产成本 (元)',
    },
    output: {
      currentMonthly: '你目前每月花',
      wenaiMonthly: '用 wenai 每月花',
      monthlySaved: '每月节省',
      yearlySaved: '一年节省',
    },
    primaryCta: '发送 ROI 报告到我邮箱',
    secondaryCta: '预约 15 分钟 demo',
    wenaiCostPerSku: 50,
  },

  pipeline3: {
    title: '从 SKU 到上架, 3 步搞定',
    steps: [
      {
        step: '①',
        title: '选品 + 拍图',
        input: '商品信息 + 关键词',
        output: '5 张主图 + 8 套模特图',
        time: '30 分钟',
        link: { label: '了解 AI 影棚', href: '/product/photoshoot' },
      },
      {
        step: '②',
        title: '内容 + 视频',
        input: '第一步的图',
        output: '详情页 + 5 秒短视频',
        time: '1 小时',
        link: { label: '了解 AI 视频', href: '/product/video' },
      },
      {
        step: '③',
        title: '上架 + 转化',
        input: '第二步的内容',
        output: '客服话术 + 询盘对接',
        time: '自动运行',
        link: { label: '了解全流水线', href: '/product/pipeline' },
      },
    ],
    note: '点击任意一步, 跳转产品详情页',
  },

  beforeAfter: {
    title: '真人拍 vs AI 拍, 你能分辨吗?',
    note: '图片均为真实交付样品, 已获客户授权',
    moreLink: { label: '看更多对比', href: '/cases' },
  },

  caseSection: {
    title: '3 家公司用了 wenai 之后',
    moreLink: { label: '查看全部 12 个案例', href: '/cases' },
    fullCaseLink: '看完整复盘',
  },

  compliance: {
    title: '唯一专为跨境电商打造的 AI 内容工具',
    subtitle: '6 大平台 AIGC 披露规则内置, 一键合规',
    platforms: [
      { name: '抖音', color: '#FE2C55' },
      { name: 'TikTok', color: '#000000' },
      { name: '视频号', color: '#07C160' },
      { name: '小红书', color: '#FF2741' },
      { name: 'YouTube', color: '#FF0000' },
      { name: 'Instagram', color: '#E1306C' },
    ],
    features: [
      {
        title: '自动 AIGC 标识',
        desc: '每张图自动添加平台合规水印, 0 起投诉',
      },
      {
        title: '披露话术模板',
        desc: '客户问"是真拍吗"有标准回复, 3 版按合规等级分级',
      },
      {
        title: '风险预审',
        desc: '上架前扫描违禁词与图像合规, 避免封店',
      },
    ],
    cta: '下载合规速查手册 (免费)',
    ctaHref: '/tools/aigc-compliance',
  },

  pricing: {
    title: '选一个适合你的方案',
    subtitle: '所有方案 7 天免费试用, 不满意全额退款',
    tiers: [
      {
        id: 'trial',
        name: '试用版',
        price: '¥0',
        period: '',
        features: ['3 个 SKU 免费跑通', '全部产品功能', '7 天有效期'],
        cta: '免费开始',
        ctaHref: '/me/skus',
        recommended: false,
      },
      {
        id: 'team',
        name: 'Team 版',
        price: '¥499',
        period: '/月',
        features: [
          '适合月上新 50-500 SKU',
          '不限重跑次数',
          '标准客服响应',
          '全部 6 大平台合规',
        ],
        cta: '立即订阅',
        ctaHref: '/pricing/checkout?plan=team',
        recommended: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: '面议',
        period: '',
        features: ['月上新 500+ SKU', '定制流水线', '专属客户成功', 'API + Webhook'],
        cta: '预约通话',
        ctaHref: '/inquire?plan=enterprise',
        recommended: false,
      },
    ],
    faqLink: '还有疑问? 看常见问题',
  },

  faq: {
    title: '常见问题',
    items: [
      {
        q: '图是 AI 生成的, 平台会不会判违规?',
        a: `内置 6 大平台合规规则, 自动生成披露标识和话术。已通过 ${PLACEHOLDER.totalImages} 张图实测, 0 起合规投诉。`,
      },
      {
        q: '客户问"这是真拍的吗"我怎么回?',
        a: '每个 SKU 自动生成 3 版披露话术, 从"AI 辅助生成"到"数字孪生展示"按合规等级分级, 一键复制给客服。',
      },
      {
        q: '万一出来的图不能用怎么办?',
        a: '所有方案不限重跑次数。Team 版以上还提供人工审核兜底, 质量不达标全额退款。',
      },
      {
        q: '我已经有内容团队, 还需要 wenai 吗?',
        a: '不替代团队, 是放大团队产能 30 倍。摄影师专注高价值大片, 重复出图交给 wenai。',
      },
      {
        q: '数据安全吗? 我的 SKU 信息会被泄露吗?',
        a: '所有数据存储在阿里云华东区, 符合 GDPR 和等保三级。Enterprise 版支持私有化部署。',
      },
      {
        q: '一般多久能上手?',
        a: '试用版 10 分钟出第一张图。Team 版客户成功 1 对 1 培训, 3 天达到日常运营熟练度。',
      },
    ],
  },

  finalCta: {
    h2: '今晚下单, 明早上架',
    subtitle: `${PLACEHOLDER.servedBrands} 跨境品牌已经在用, 每月省下数十万`,
    primaryCta: '免费开始 7 天试用',
    primaryCtaHref: '/me/skus',
    secondaryCta: '预约 15 分钟 demo',
    secondaryCtaHref: '/inquire?from=final-cta',
    note: '无需信用卡 · 7 天免费 · 不满意全额退款',
  },

  footer: {
    columns: {
      product: {
        title: '产品',
        links: [
          { label: 'AI 影棚', href: '/product/photoshoot' },
          { label: 'AI 视频', href: '/product/video' },
          { label: '全流水线', href: '/product/pipeline' },
          { label: '免费工具', href: '/tools' },
          { label: '定价', href: '/pricing' },
          { label: '客户案例', href: '/cases' },
        ],
      },
      company: {
        title: '公司',
        links: [
          { label: '关于我们', href: '/about' },
          { label: '团队', href: '/about#team' },
          { label: '招聘', href: '/about#careers' },
          { label: '媒体报道', href: '/about#press' },
          { label: '联系我们', href: '/contact' },
        ],
      },
      resources: {
        title: '资源',
        links: [
          { label: '博客', href: '/resources' },
          { label: '帮助中心', href: '/docs' },
          { label: 'Changelog', href: '/changelog' },
          { label: 'API 文档', href: '/docs' },
          { label: '状态页', href: '/status' },
        ],
      },
      legal: {
        title: '法务',
        links: [
          { label: '服务条款', href: '/terms' },
          { label: '隐私政策', href: '/privacy' },
          { label: '数据处理', href: '/privacy#data' },
          { label: 'AIGC 合规', href: '/tools/aigc-compliance' },
        ],
      },
    },
    copyright: '© 2026 wenai. All rights reserved.',
    icp: 'ICP 备案号 · 待业主提供',
    socials: [
      { label: '微信公众号', initial: '微' },
      { label: '知乎', initial: '知' },
      { label: '小红书', initial: '小' },
      { label: 'X', initial: 'X' },
      { label: 'LinkedIn', initial: 'in' },
    ],
  },

  about: {
    mission: '让中国跨境品牌用 1/50 的成本做出比海外大牌更好看的内容',
    sections: {
      founder: '创始人',
      team: '团队',
      customers: '我们的客户',
      careers: '加入我们',
    },
    careers: {
      desc: '我们在杭州 + 远程, 找懂跨境电商 + 真喜欢 AI 应用的人',
      jobs: [
        { title: '高级前端工程师', location: '杭州 / 远程' },
        { title: 'AI 算法工程师 (CV)', location: '杭州' },
        { title: '客户成功经理', location: '杭州 / 深圳' },
      ],
      contact: 'hello@wenai.app',
    },
  },

  productPhotoshoot: {
    hero: {
      h1: 'AI 影棚 · 一晚出 200 SKU 主图',
      h2: '8 套场景模式 · 模特、白底、生活、节日、汽摩、数码、家居、美妆 · 一键全跑',
      cta: '开始免费跑 3 个 SKU',
      ctaHref: '/me/skus',
    },
    modesTitle: '8 个内置场景模式',
    modes: [
      { title: '模特图', desc: '亚欧非美 12 模特库 · 自定义肤色身高' },
      { title: '白底主图', desc: '电商规范 1:1 / 3:4 / 16:9 一次出三套' },
      { title: '生活场景', desc: '家居室内 / 户外 / 办公 60+ 场景模板' },
      { title: '节日营销', desc: '春节 / 618 / 双 11 / 黑五 节日氛围一键加' },
      { title: '汽摩配件', desc: '车载场景 + 真实安装位 · 不再 3D 渲染' },
      { title: '数码 3C', desc: '科技感冷光 + 手持人像 · 多角度' },
      { title: '家居家纺', desc: '北欧 / 日式 / 现代 / 田园 4 种风格' },
      { title: '美妆个护', desc: '化妆台 + 浴室 + 试妆 + 卸妆 4 流程' },
    ],
    workflow: {
      title: '工作流',
      steps: [
        { label: '输入', desc: '商品图 + 关键词 + 选场景' },
        { label: '处理', desc: '30 分钟跑完, 不限重跑' },
        { label: '输出', desc: '5-20 张可上架主图 + 模特图' },
      ],
    },
    faq: [
      {
        q: '出来的图能直接上抖店 / 亚马逊吗?',
        a: '是。8 个场景模式都按平台规范出图, 含正方形 / 竖版 / 横版三套, AIGC 水印自动加。',
      },
      {
        q: '模特图能不能换种族?',
        a: '可以。亚洲 / 欧美 / 非洲 / 拉美 12 个模特库, 每个支持身高肤色微调。',
      },
      {
        q: '出图风格能跟我自家拍的一致吗?',
        a: 'Team 版以上支持上传 5-10 张参考图做风格锚定, 后续所有 SKU 沿用该风格。',
      },
    ],
  },

  productVideo: {
    hero: {
      h1: 'AI 视频 · 5 秒短视频一晚批量出',
      h2: '商品图 + 文案 → 5 秒带货短视频, 抖店 / TikTok / 视频号一次跑',
    },
    modesTitle: '3 类视频场景',
    modes: [
      { title: '商品展示', desc: '5-15 秒带货短视频 · 内置 BGM 库' },
      { title: '使用教程', desc: '操作步骤分镜 + 字幕 · 适合 3C / 美妆' },
      { title: '场景代入', desc: '生活场景植入 · 适合家居 / 服装' },
    ],
  },

  productPipeline: {
    hero: {
      h1: '全流水线交付 · 从 SKU 到上架闭环',
      h2: '商品信息进, 完整上架物料出 · 主图 + 文案 + 视频 + 客服话术 + 合规标识 一晚跑完',
    },
    flow: '商品信息 → 选品验证 → 主图工厂 → 视频工厂 → 详情页 → 客服话术 → 合规预审 → 上架包',
  },
} as const;

export type Copy = typeof COPY;
