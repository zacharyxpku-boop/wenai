/**
 * 电商场景 prompt 库 · wenai 包办商家所有提示词
 *
 * 核心理念: 商家不用学 prompt engineering, 选「我卖什么 × 我要什么图/视频 × 投哪个平台」
 * 三轴定位, 系统自动生成 80-150 字工业级 prompt 喂给 gpt-image-2 / wanx i2v
 *
 * Prompt 写作铁律 (借冉胖子 + Picset AI 实测经验):
 *   1. 开头一句话定锚 (产品 + 风格 + 镜头)
 *   2. 必带画面构图占比 ("产品占画面 70%" 这类硬约束)
 *   3. 必带光影描述 (光线方向 + 软硬)
 *   4. 必带分辨率/质感 ("8K 超清, 商业摄影质感")
 *   5. 平台风格特异化结尾 (Amazon 极简 / 拼多多冲击 / 小红书氛围)
 *
 * 用法:
 *   import { resolvePrompt } from '@/lib/ecom-prompts';
 *   const finalPrompt = resolvePrompt({ category: 'apparel', scenario: 'main-image', style: 'amazon', productHint: '红色连衣裙' });
 */

// ============================================================
// 维度定义
// ============================================================

export type EcomCategory =
  | 'apparel'      // 服装 (上衣/下装/外套/连衣裙/内衣)
  | 'shoes-bags'   // 鞋包 (球鞋/皮鞋/包袋/钱包)
  | 'home'         // 家居用品 (收纳/餐具/床品/装饰)
  | 'kitchen'      // 厨房电器/餐具
  | '3c'           // 3C 数码 (耳机/手机配件/相机/智能硬件)
  | 'beauty'       // 美妆个护 (护肤/彩妆/香水/口腔护理)
  | 'mom-baby'     // 母婴 (奶瓶/纸尿裤/玩具/童装)
  | 'food'         // 食品/保健品 (零食/饮品/营养品)
  | 'pets'         // 宠物用品 (狗粮/玩具/猫砂)
  | 'auto'         // 汽配 (车载/轮胎/装饰)
  | 'tools'        // 工具/户外 (电动工具/露营/钓具)
  | 'sports'       // 运动健身 (瑜伽垫/哑铃/球类)
  | 'jewelry';     // 饰品配件 (项链/手表/眼镜)

export type EcomScenario =
  | 'main-image'      // 主图 (白底/45° 俯视, listing 规范)
  | 'detail-set'      // 全套详情 (12 张组合)
  | 'lifestyle'       // 场景图 (使用环境)
  | 'model-on'        // 模特上身/上脚/上脸
  | 'flat-lay'        // 平铺 OOTD
  | 'close-up'        // 细节微距 (材质/工艺)
  | 'before-after'    // 前后对比
  | 'package-shot'    // 包装外观
  | 'unboxing'        // 拆箱平铺
  | 'video-display'   // 视频: 展示 (转身/360°)
  | 'video-usage'     // 视频: 使用瞬间 (开盖/涂抹/穿戴)
  | 'video-lifestyle';// 视频: lifestyle 短片

export type EcomStyle =
  | 'amazon'         // Amazon 极简白底
  | 'taobao'         // 淘宝/天猫 精致小资
  | 'pdd'            // 拼多多 高饱和冲击
  | 'independent'    // 独立站/Shopify 大片质感
  | 'xiaohongshu'    // 小红书 氛围感
  | 'douyin'         // 抖音/TikTok 强对比抓眼
  | 'tmall-global'   // 天猫国际/跨境 高级感
  | 'shopee';        // Shopee 东南亚审美

// ============================================================
// 品类锚点描述 (resolvePrompt 用)
// ============================================================

const CATEGORY_ANCHOR: Record<EcomCategory, string> = {
  apparel: '一件服装(包含面料质感、版型轮廓、缝线工艺)',
  'shoes-bags': '一件鞋类或包袋(包含材质纹理、五金件、内衬细节)',
  home: '一件家居用品(包含材质、做工、使用场景)',
  kitchen: '一件厨房用品或小家电(包含金属/玻璃/陶瓷质感、按钮细节)',
  '3c': '一件 3C 数码产品(包含外壳质感、接口、屏幕、按键)',
  beauty: '一件美妆个护产品(包含瓶身设计、质地颜色、包装质感)',
  'mom-baby': '一件母婴用品(柔软安全质感、孩童使用场景、家长视角)',
  food: '一件食品或保健品(包装设计、内容物展示、新鲜感)',
  pets: '一件宠物用品(柔软材质、宠物互动、温暖氛围)',
  auto: '一件汽配产品(金属/塑料工艺感、安装位置、对比效果)',
  tools: '一件工具或户外装备(工业质感、使用场景、坚固耐用感)',
  sports: '一件运动健身用品(动感、力量感、场景代入)',
  jewelry: '一件饰品(金属光泽、宝石折射、佩戴效果)',
};

// 品类典型构图角度
const CATEGORY_ANGLE: Record<EcomCategory, string> = {
  apparel: '正面平视为主, 局部 45° 切换',
  'shoes-bags': '45° 俯视主图 + 360° 环视细节',
  home: '45° 俯视或正面平视',
  kitchen: '45° 俯视, 突出操作面',
  '3c': '45° 俯视 + 接口特写',
  beauty: '正面平视瓶身, 倾斜展示质地',
  'mom-baby': '柔和正面或侧面, 配孩童手部互动',
  food: '俯视平铺或 45° 角带配料',
  pets: '宠物使用瞬间或产品旁宠物互动',
  auto: '安装位置特写 + 安装前后对比',
  tools: '使用瞬间或工具与配件平铺',
  sports: '动感斜角度, 突出力量线条',
  jewelry: '正面 + 微距细节切换',
};

// ============================================================
// 平台风格画风指令
// ============================================================

const STYLE_DIRECTIVES: Record<EcomStyle, string> = {
  amazon: '纯白色 #FFFFFF 背景, 产品居中占画面 80%, 柔和投影, Amazon listing 规范, 极简高级, 无任何文字标签, 5:4 比例可裁',
  taobao: '精致小资风, 木质或大理石质感道具, 自然窗光, 浅景深, 中性暖色调, 适合天猫/淘宝主图',
  pdd: '高饱和度配色, 顶部和底部预留促销贴位置 (留 15% 空白), 产品占画面 90%, 冲击力强, 接地气视觉, 适合拼多多/快手',
  independent: '生活方式大片质感, 留白多, 景深虚化突出产品, 品牌叙事感, 高级冷调或奶油色调, 适合 Shopify 独立站',
  xiaohongshu: '小红书氛围感, 米白/奶咖背景, 旁配少量手账/咖啡杯/植物道具, 自然光柔和, 真实感优先于完美感, INS 风',
  douyin: '强对比配色, 边缘锐利, 产品占画面 70-80%, 动感构图, 适合抖音 / TikTok 信息流封面 9:16 竖图',
  'tmall-global': '高级感冷色调或经典黑金配色, 大理石/丝绸/金属道具, 影棚主光 + 轮廓光, 接近奢侈品广告质感',
  shopee: '明亮色调, 笑脸友好氛围, 突出性价比叙事, 东南亚消费者审美 (饱和度略高于淘宝, 略低于拼多多)',
};

// ============================================================
// 场景 prompt 骨架
// ============================================================

interface ScenarioBlueprint {
  output: 'image' | 'video';
  defaultRatio: string; // '1:1' | '16:9' 等
  description: string;
  buildBody: (ctx: { category: EcomCategory; productHint: string; angle: string }) => string;
}

const SCENARIO_BLUEPRINTS: Record<EcomScenario, ScenarioBlueprint> = {
  'main-image': {
    output: 'image',
    defaultRatio: '1:1',
    description: '主图 · 平台规范的标准产品图',
    buildBody: ({ category, productHint, angle }) =>
      `电商主图: ${productHint || CATEGORY_ANCHOR[category]}, ${angle}, 影棚级专业打光 (45° 主光 + 柔光填充 + 边缘轮廓光), 产品本体特征 1:1 真实, 无模糊无变形, 8K 锐利细节, 商业摄影质感`,
  },
  'detail-set': {
    output: 'image',
    defaultRatio: '3:4',
    description: '全套详情 · 12 张组合 (主图/45°/场景/细节/材质/使用/对比/参数/包装)',
    buildBody: ({ category, productHint, angle }) =>
      `12 宫格电商详情图集 (3x4 网格), 围绕 ${productHint || CATEGORY_ANCHOR[category]} 衍生: ① 主图 45° 白底 ② 正面平视 ③ lifestyle 场景使用 ④ 材质微距 ⑤ 工艺细节 ⑥ 人手互动 ⑦ 多色多规格对比 ⑧ 参数标注图 ⑨ 包装外观 ⑩ 拆箱配件平铺 ⑪ 品牌氛围图 ⑫ 尺寸对照. 每格独立, 风格统一, 产品本体 1:1 还原, 8K 高清. 默认机位: ${angle}`,
  },
  lifestyle: {
    output: 'image',
    defaultRatio: '4:3',
    description: 'lifestyle 场景图 · 使用环境真实代入',
    buildBody: ({ category, productHint }) =>
      `lifestyle 场景图: ${productHint || CATEGORY_ANCHOR[category]} 置于真实使用环境中, 周围有相关道具增强代入感 (比如 ${category === 'beauty' ? '化妆台 + 镜子 + 香薰' : category === 'kitchen' ? '木质砧板 + 新鲜食材' : category === '3c' ? '极简办公桌 + 笔记本' : '生活化道具'}), 自然光线柔和, 景深虚化突出产品, 故事感构图, 8K 超清, Pinterest / 小红书 美学`,
  },
  'model-on': {
    output: 'image',
    defaultRatio: '3:4',
    description: '模特上身/上脚/上脸 · 替代真人拍摄',
    buildBody: ({ category, productHint }) =>
      `专业电商模特照片, 亚洲青年女性 (22-30 岁, 标准身材, 自然甜美气质), 全身或半身构图, 45° 侧身或正面站姿, ${
        category === 'apparel' ? '穿戴' : category === 'shoes-bags' ? '搭配' : category === 'beauty' ? '使用' : '展示'
      }${productHint || CATEGORY_ANCHOR[category]}, 模特真实上身效果 1:1 还原产品, 杂志大片质感, 自然光 + 影棚光混合, 皮肤纹理真实, 毛发清晰, 模特占画面 70% 产品清晰可见, 背景 ${
        category === 'apparel' ? '巴黎街头或日系街拍' : category === 'beauty' ? '大理石浴室或化妆台' : '简洁影棚白底或灰背景'
      }, 8K 高清`,
  },
  'flat-lay': {
    output: 'image',
    defaultRatio: '1:1',
    description: 'OOTD 平铺 · 拆解为单品 ins 风',
    buildBody: ({ category, productHint }) =>
      `ins 风格平铺图: 将 ${productHint || CATEGORY_ANCHOR[category]} 及其周边搭配单品依次摆放在纯白色背景上, 单品独立间距均匀, 从上到下从左到右有节奏感, 顶部用英文手写花体写 "${
        category === 'apparel' || category === 'shoes-bags' ? 'OOTD' : category === 'beauty' ? 'DAILY' : category === 'food' ? 'MENU' : 'LAYOUT'
      }", 自然光柔和, 产品材质真实, 8K 电商平铺规范`,
  },
  'close-up': {
    output: 'image',
    defaultRatio: '1:1',
    description: '细节微距 · 材质/工艺特写',
    buildBody: ({ category, productHint }) =>
      `微距细节特写: ${productHint || CATEGORY_ANCHOR[category]} 的关键材质/工艺/接缝/纹理放大 5-10 倍, 锐利对焦, 浅景深, 影棚硬光 + 反光板, 突出 ${
        category === 'apparel' ? '面料织纹和缝线' : category === 'shoes-bags' ? '皮革纹理和五金件做工' : category === '3c' ? '接口和按键的精密做工' : '材质质感'
      }, 工业设计美学, 8K 超清`,
  },
  'before-after': {
    output: 'image',
    defaultRatio: '16:9',
    description: '前后对比 · 使用前 vs 使用后',
    buildBody: ({ category, productHint }) =>
      `电商前后对比图: 左半为使用 ${productHint || CATEGORY_ANCHOR[category]} 之前的状态(${
        category === 'beauty' ? '皮肤暗沉/瑕疵明显' : category === 'home' ? '杂乱无序' : category === 'auto' ? '老旧损耗' : '原始状态'
      }), 右半为使用之后的改善(${
        category === 'beauty' ? '皮肤通透发光' : category === 'home' ? '整齐美观' : category === 'auto' ? '焕然如新' : '明显升级'
      }). 左右构图严格对称, 中间一道细分割线, 顶部小字标注 "Before / After", 8K 高清, 视觉冲击强`,
  },
  'package-shot': {
    output: 'image',
    defaultRatio: '1:1',
    description: '包装外观',
    buildBody: ({ category, productHint }) =>
      `产品包装外观图: ${productHint || CATEGORY_ANCHOR[category]} 的零售包装盒/袋, 45° 俯视主图角度, 包装设计 logo 占视觉中心, 周围背景简洁 (奶油色/浅灰), 8K 锐利, 包装做工和材质质感清晰可见`,
  },
  unboxing: {
    output: 'image',
    defaultRatio: '4:3',
    description: '拆箱平铺 · 产品 + 全套配件',
    buildBody: ({ category, productHint }) =>
      `拆箱平铺图 (knolling 风格): ${productHint || CATEGORY_ANCHOR[category]} 主体居中, 周围环绕全部配件 (${
        category === '3c' ? '充电线 / 说明书 / 收纳袋 / 备用配件' :
        category === 'beauty' ? '小样 / 卡片 / 缎带 / 礼盒衬纸' :
        category === 'apparel' ? '吊牌 / 备用扣 / 防尘袋' :
        '全部随附配件'
      }), 俯视构图, 间距均匀, 简洁背景, 自然光均匀, 仪式感, 8K 高清`,
  },
  'video-display': {
    output: 'video',
    defaultRatio: '9:16',
    description: '视频展示 · 360° 旋转或转身',
    buildBody: ({ category, productHint }) =>
      `${
        category === 'apparel' || category === 'shoes-bags' ?
          `亚洲年轻女性穿戴/搭配 ${productHint || CATEGORY_ANCHOR[category]}, 完整保留造型细节, 缓慢转身展示前后效果, 然后再转回正面, 动作流畅且重点突出穿搭细节, 固定镜头全身构图` :
          `${productHint || CATEGORY_ANCHOR[category]} 在固定位置缓慢 360° 旋转一周, 镜头静止, 各角度细节清晰, 背景静止不变, 产品本体特征严格保留无形变`
      }, 光线均匀柔和突出质感, 风格清新, 时尚展示短片, 2K 高清`,
  },
  'video-usage': {
    output: 'video',
    defaultRatio: '9:16',
    description: '视频使用瞬间 · 开盖/涂抹/穿戴/操作',
    buildBody: ({ category, productHint }) =>
      `电商使用演示短片: ${productHint || CATEGORY_ANCHOR[category]}, 人手自然进入画面与产品互动 (${
        category === 'beauty' ? '挤出质地 → 涂抹于手背或脸颊 → 推开吸收' :
        category === 'kitchen' ? '打开 → 加入食材 → 启动按钮' :
        category === '3c' ? '拿起 → 按下电源 → 操作演示' :
        category === 'apparel' ? '提起 → 试穿 → 整理细节' :
        category === 'food' ? '撕开包装 → 倒出 → 入口 / 冲泡' :
        '自然使用'
      }), 2-3 秒内完成核心交互, 镜头微推或静止, 环境光真实柔和, 景深虚化, 色调温暖通透`,
  },
  'video-lifestyle': {
    output: 'video',
    defaultRatio: '9:16',
    description: '视频 lifestyle · 真实场景动起来',
    buildBody: ({ category, productHint }) =>
      `lifestyle 短片: ${productHint || CATEGORY_ANCHOR[category]} 在真实生活场景中被使用, 人物自然出现 (面部不必清晰, 重点是手部互动和氛围), 一阵风吹起头发或窗帘, 产品在画面中被自然带过, 散发生活气息, 自然光斑流动, 缓慢运镜, 安静治愈, 适合小红书/抖音种草`,
  },
};

// ============================================================
// 主 API
// ============================================================

export interface ResolvePromptInput {
  category: EcomCategory;
  scenario: EcomScenario;
  style: EcomStyle;
  productHint?: string;     // 用户填的一句话产品描述, 例: "粉色露肩 T 恤 / 智能蓝牙耳机 / 红枣山药八珍糕"
  extraDetails?: string;    // 用户额外补充
}

export interface ResolvedPrompt {
  prompt: string;
  output: 'image' | 'video';
  recommendedRatio: string;
  descriptor: string; // 给 UI 显示用的人话描述
}

export function resolvePrompt(input: ResolvePromptInput): ResolvedPrompt {
  const { category, scenario, style, productHint, extraDetails } = input;
  const blueprint = SCENARIO_BLUEPRINTS[scenario];
  const angle = CATEGORY_ANGLE[category];
  const styleDirective = STYLE_DIRECTIVES[style];

  const body = blueprint.buildBody({ category, productHint: productHint?.trim() || '', angle });

  const prompt = [
    body,
    `平台审美定位: ${styleDirective}`,
    extraDetails?.trim() ? `用户额外要求: ${extraDetails.trim()}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  return {
    prompt,
    output: blueprint.output,
    recommendedRatio: blueprint.defaultRatio,
    descriptor: `${CATEGORY_LABELS[category]} · ${SCENARIO_LABELS[scenario]} · ${STYLE_LABELS[style]}`,
  };
}

// ============================================================
// UI 标签 (中文)
// ============================================================

export const CATEGORY_LABELS: Record<EcomCategory, string> = {
  apparel: '👗 服装',
  'shoes-bags': '👜 鞋包',
  home: '🛋️ 家居',
  kitchen: '🍳 厨房/小家电',
  '3c': '📱 3C 数码',
  beauty: '💄 美妆个护',
  'mom-baby': '🍼 母婴',
  food: '🍪 食品/保健品',
  pets: '🐶 宠物',
  auto: '🚗 汽配',
  tools: '🔧 工具/户外',
  sports: '🏋️ 运动健身',
  jewelry: '💍 饰品配件',
};

export const SCENARIO_LABELS: Record<EcomScenario, string> = {
  'main-image': '主图',
  'detail-set': '全套详情(12 图)',
  lifestyle: '场景图',
  'model-on': '模特上身',
  'flat-lay': 'OOTD 平铺',
  'close-up': '细节微距',
  'before-after': '前后对比',
  'package-shot': '包装外观',
  unboxing: '拆箱平铺',
  'video-display': '视频 · 展示',
  'video-usage': '视频 · 使用',
  'video-lifestyle': '视频 · lifestyle',
};

export const STYLE_LABELS: Record<EcomStyle, string> = {
  amazon: '🟧 Amazon 极简',
  taobao: '🟦 淘宝 精致',
  pdd: '🟥 拼多多 冲击',
  independent: '⬛ 独立站 大片',
  xiaohongshu: '🟤 小红书 氛围',
  douyin: '⚡ 抖音 强对比',
  'tmall-global': '🥇 天猫国际 高级',
  shopee: '🌴 Shopee 东南亚',
};

// ============================================================
// 一键 SOP · 给商家的"按钮包"
// 每个 SOP 是一组场景, 选了 SOP 就跑一整套图
// ============================================================

export interface SopPreset {
  id: string;
  title: string;
  desc: string;
  category: EcomCategory;
  scenarios: EcomScenario[];
  defaultStyle: EcomStyle;
}

export const SOP_PRESETS: SopPreset[] = [
  {
    id: 'apparel-launch',
    title: '服装新品上架全套',
    desc: '一件衣服 → 主图 + 模特上身 + lifestyle + 细节 + OOTD 平铺 + 转身视频, 6 件齐活',
    category: 'apparel',
    scenarios: ['main-image', 'model-on', 'lifestyle', 'close-up', 'flat-lay', 'video-display'],
    defaultStyle: 'taobao',
  },
  {
    id: 'beauty-launch',
    title: '美妆新品上架全套',
    desc: '护肤/彩妆 → 包装 + 质地涂抹 + 模特上脸 + 前后对比 + 使用视频',
    category: 'beauty',
    scenarios: ['package-shot', 'main-image', 'model-on', 'before-after', 'video-usage'],
    defaultStyle: 'xiaohongshu',
  },
  {
    id: '3c-launch',
    title: '3C 数码新品上架',
    desc: '硬件类 → 主图 + 接口细节 + 桌面场景 + 拆箱 + 操作视频',
    category: '3c',
    scenarios: ['main-image', 'close-up', 'lifestyle', 'unboxing', 'video-usage'],
    defaultStyle: 'amazon',
  },
  {
    id: 'home-launch',
    title: '家居用品新品上架',
    desc: '收纳/餐具/装饰 → 主图 + lifestyle + 细节 + 使用视频',
    category: 'home',
    scenarios: ['main-image', 'lifestyle', 'close-up', 'video-usage'],
    defaultStyle: 'taobao',
  },
  {
    id: 'food-launch',
    title: '食品/保健品新品上架',
    desc: '零食/营养品 → 包装 + 倾倒展示 + 食用场景 + 食用视频',
    category: 'food',
    scenarios: ['package-shot', 'main-image', 'lifestyle', 'video-usage'],
    defaultStyle: 'taobao',
  },
  {
    id: 'cross-border-amazon',
    title: '跨境 Amazon 标准包',
    desc: '任何品类 → 7 张 Amazon 规范主图副图 (白底 + 多角度 + lifestyle + 拆箱)',
    category: 'home',
    scenarios: ['main-image', 'close-up', 'lifestyle', 'unboxing'],
    defaultStyle: 'amazon',
  },
  {
    id: 'tiktok-shop-burst',
    title: 'TikTok Shop 爆款套装',
    desc: '抖音 / TikTok 算法偏好 → 强对比主图 + before/after + 使用视频 + 模特展示视频',
    category: 'beauty',
    scenarios: ['main-image', 'before-after', 'video-usage', 'video-display'],
    defaultStyle: 'douyin',
  },
];
