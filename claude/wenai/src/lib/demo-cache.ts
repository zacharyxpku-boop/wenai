/**
 * Pre-cached demo responses for T1 modules.
 * Used as fallback when AI API is slow/down during demos.
 */

const DEMO_RESPONSES: Record<string, string> = {
  translate: `## 翻译结果

| 语言 | 标题翻译 | 五点描述 (第1条) |
|------|---------|-----------------|
| 英语 | Premium Foldable Storage Bins - BPA-Free PP Material, Stackable Design, 3 Sizes Available | Made from food-grade BPA-free polypropylene for safe, durable everyday storage |
| 日语 | プレミアム折りたたみ収納ボックス - BPAフリーPP素材、スタッキング設計、3サイズ展開 | 食品グレードのBPAフリーポリプロピレン製で、安全で耐久性のある日常収納に |
| 韓国語 | 프리미엄 접이식 수납함 - BPA 프리 PP 소재, 적층 설계, 3가지 사이즈 | 식품 등급 BPA 프리 폴리프로필렌으로 제작되어 안전하고 내구성 있는 일상 수납 |
| 西班牙语 | Cajas de Almacenamiento Plegables Premium - Material PP sin BPA, Diseño Apilable, 3 Tamaños | Fabricadas con polipropileno de grado alimentario sin BPA para un almacenamiento seguro y duradero |

### 术语表
- Storage Bin → 収納ボックス (JP) / 수납함 (KR) / Caja de Almacenamiento (ES)
- BPA-Free → BPAフリー / BPA 프리 / sin BPA
- Stackable → スタッキング / 적층 / Apilable

> 共翻译 4 种语言 × 标题+5点描述，合计 24 条文本`,

  outreach: `## 达人外联邮件

### 邮件模板 A — 首次触达

**Subject:** Collaboration Opportunity | HOMELODY × [Creator Name]

Hi [Creator Name],

I came across your home organization content and loved your recent video on closet makeovers — your audience clearly trusts your recommendations.

We're HOMELODY, a home storage brand with 4.8★ average rating on Amazon (2,300+ reviews). Our foldable storage bins are a bestseller in the Home & Kitchen category.

**What we're offering:**
- Free product samples (3-piece set, retail value $89.97)
- 15% commission on all sales through your unique link
- Creative freedom — no script required

**Why this fits your content:**
Your audience is actively searching for organization solutions. Our bins are visually clean, photograph well, and solve a real pain point.

Would you be open to a quick chat this week?

Best,
[Your Name]
HOMELODY Brand Team

---

### 邮件模板 B — 跟进（3天后）

**Subject:** Re: Quick follow-up — HOMELODY collab

Hi [Creator Name],

Just bumping this up in case it got buried. Happy to send samples with no strings attached — if you love them, we'd love a mention. If not, keep them!

Let me know 🙂

### 发送建议
- 最佳发送时间：周二/周四上午 9-11am（创作者邮箱活跃期）
- 批量发送间隔：每封间隔 3-5 分钟，避免触发垃圾邮件
- 个性化率建议 ≥ 30%（至少改 Subject + 首段提及具体内容）`,

  reviews: `## 评论分析报告

### 数据概览
- 分析评论数：847 条
- 好评率：89.3%（756/847）
- 差评率：6.7%（57/847）
- 中评率：4.0%（34/847）

### Top 3 卖点（从好评提取）

| 排名 | 卖点关键词 | 出现频次 | 代表性评论 |
|------|-----------|---------|-----------|
| 1 | 容量大/空间足 | 234次 | "Fits perfectly in my closet, holds way more than expected" |
| 2 | 折叠方便/不占地 | 189次 | "Love that it folds flat when not in use" |
| 3 | 材质厚实/耐用 | 156次 | "Much sturdier than the cheap ones I bought before" |

### Top 3 痛点（从差评提取）

| 排名 | 痛点关键词 | 出现频次 | 严重程度 | 建议改进 |
|------|-----------|---------|---------|---------|
| 1 | 气味大/塑料味 | 28次 | 高 | 增加通风孔设计 + listing标注"建议开箱通风24h" |
| 2 | 盖子不紧/松动 | 18次 | 中 | 改卡扣设计，加密封条 |
| 3 | 颜色偏差 | 11次 | 低 | 更新产品图，标注"实物颜色可能因显示器略有差异" |

### Listing优化建议
1. 标题加入"大容量"+"可折叠"（覆盖Top 2卖点词）
2. 五点描述第1条改为"无异味承诺 — 通过FDA认证，开箱即用"
3. A+页面增加折叠收纳对比图（展开 vs 折叠厚度）`,

  copywriting: `## 商品文案

### Amazon Listing 标题（≤200字符）
HOMELODY Foldable Storage Bins 3-Pack | BPA-Free, Stackable Organizer for Closet, Bedroom, Kitchen | Large Capacity with Reinforced Handles | Beige

### 五点描述 (Bullet Points)

1. **SPACE-SAVING FOLDABLE DESIGN** — Collapses to just 2" flat when not in use. Perfect for apartments, dorms, and small spaces. Set up in seconds with no tools needed.

2. **PREMIUM BPA-FREE MATERIAL** — Made from food-grade polypropylene that passed FDA 21 CFR and LFGB testing. No plastic smell, safe for storing children's items and pantry goods.

3. **BUILT TO LAST** — Reinforced double-stitched handles support up to 30 lbs. Rigid side panels prevent sagging even when fully loaded. Outlasts fabric bins by 3x.

4. **3 VERSATILE SIZES INCLUDED** — Large (15"×11"×10"), Medium (13"×9"×8"), Small (11"×8"×6"). Stack them, nest them, or use separately across every room.

5. **HASSLE-FREE GUARANTEE** — 30-day no-questions-asked return. Over 2,300 five-star reviews. Join 50,000+ organized homes. Contact us anytime via Amazon messaging.

### A+ Content 段落
Transform your chaotic closets into Instagram-worthy spaces. HOMELODY storage bins aren't just containers — they're your secret weapon against clutter...`,

  competitor: `## 竞品分析报告

### 竞品概况

| 维度 | 我方产品 | 竞品A (SimpleHouse) | 竞品B (SONGMICS) |
|------|---------|-------------------|-----------------|
| 价格 | $29.99/3件 | $24.99/3件 | $34.99/3件 |
| 评分 | 4.5★ (2,300+) | 4.3★ (5,800+) | 4.6★ (12,000+) |
| BSR | #156 | #89 | #42 |
| 上架时间 | 2024-03 | 2022-06 | 2020-11 |

### 核心差异点

1. **价格带**: 我方处于中间位，竞品A走低价冲量，竞品B走品质溢价
2. **评论量差距**: SONGMICS先发优势明显，评论量是我方5x
3. **产品差异化**: 我方可折叠+BPA-Free是差异卖点，竞品均无此组合

### 机会点
- 竞品A差评集中在"材质薄/易变形"，我方可主打"加厚加固"
- 竞品B无折叠功能，listing中可强调"节省50%存储空间"
- 两家均无视频review，TikTok内容营销是蓝海

### 30天行动建议
1. 标题优化加入"Reinforced/Thick Material"对标竞品A痛点
2. 价格暂维持$29.99，通过coupon做$26.99测试转化
3. 发起Vine计划，目标30天内新增50+评论`,

  selection: `## 选品分析报告

### 候选产品评估

| 产品 | 市场规模(月) | 竞争度 | 利润率 | 推荐指数 |
|------|------------|--------|--------|---------|
| 可折叠硅胶水杯 | $2.8M | 中 | 42% | ⭐⭐⭐⭐ |
| 便携式颈部按摩仪 | $5.1M | 高 | 38% | ⭐⭐⭐ |
| 磁吸式手机支架 | $8.3M | 极高 | 25% | ⭐⭐ |
| 宠物自动喂食器 | $4.2M | 中 | 45% | ⭐⭐⭐⭐⭐ |

### Top推荐：宠物自动喂食器

**推荐理由：**
- 市场增速28% YoY，宠物经济持续增长
- 前10名平均评论3,200条，新品仍有机会
- 供应链成熟(深圳/东莞)，采购价$18-22，售价$49.99
- 客单价高，广告ROI更优

**风险提示：**
- 需FCC认证(含WiFi模块款)，认证周期4-6周
- 退货率偏高(8-12%)，需做好品控
- 季节性弱，全年可售`,

  operations: `## 30天运营SOP

### 第1周：基础优化
| 日期 | 任务 | 负责人 | 验收标准 |
|------|------|--------|---------|
| Day1 | Listing标题A/B测试 | 运营 | 设置2组标题，用Manage Experiments |
| Day2 | 主图更新(白底+场景) | 设计 | 主图CTR目标≥3.5% |
| Day3 | 五点描述重写 | 文案 | 覆盖Top 3搜索词 |
| Day4-5 | A+页面上线 | 运营+设计 | 含对比图+使用场景 |

### 第2周：流量获取
- SP广告：自动+手动混投，日预算$30，ACOS目标≤25%
- 核心词出价：$1.2-1.8（根据类目平均调整）
- 长尾词铺量：30个精准长尾，出价$0.5-0.8

### 第3-4周：评论积累+排名冲刺
- Vine计划申请（目标20条高质量review）
- 站外deal：SlickDeals/Reddit发布优惠信息
- 社交媒体：TikTok达人合作3-5个

### KPI看板
- 目标BSR：从#156进入Top 100
- 目标日均单量：15→30单
- 目标ACOS：≤25%
- 目标评论数：+50条/月`,

  content: `## 种草内容方案

### 小红书笔记 — 收纳好物分享

**标题：** 租房党的收纳神器，3个箱子搞定全屋乱糟糟

**正文：**
搬了3次家，最怕的就是收拾东西😭

上次搬家光纸箱就用了20个，到新家全堆在角落吃灰。后来被闺蜜安利了这款可折叠收纳箱，真的打开了新世界的大门。

用不到的时候压扁就2cm，塞床底完全不占地方。需要的时候秒变大容量收纳箱，我的冬天大棉被都能塞进去。

材质是PP的，不是那种一捏就软的布袋子，装满东西也不会塌。而且没有塑料味！（之前买过某款开箱差点熏晕）

三个装才不到200块，大中小刚好分区收纳。

📌 适合人群：租房党/小户型/换季收纳/宿舍

---

### 抖音短视频脚本(15秒)

**画面1(0-3s):** 凌乱的房间特写 → 文字"你的房间是不是也这样？"
**画面2(3-8s):** 拿出折叠收纳箱，展开过程 → "两秒变大箱子"
**画面3(8-13s):** 快速收纳衣物过程 → "冬天的衣服全塞进去"
**画面4(13-15s):** 整洁的房间 → "链接在购物车"`,

  livestream: `## 直播脚本

### 产品：可折叠收纳箱3件套 | 时长：5分钟

**开场(0:00-0:30)**
> 家人们看过来！今天这个品我自己家里用了半年，真心推荐。你们有没有换季的时候衣服被子没地方放的？柜子塞不下，纸箱又丑又占地方？来，看我手里这个。

**产品展示(0:30-2:00)**
> 看，现在它是这样的【展示折叠状态】，薄薄一片，2cm不到。我往上一提——【展开动作】——变！大箱子出来了。
>
> 大号能装什么？冬天的羽绒服，两件，塞进去，盖上，完美。中号放毛衣针织衫，小号放袜子内衣。三个箱子，一个柜子，换季收纳全搞定。
>
> 材质你们摸一下【怼镜头展示厚度】，PP材质，不是那种软趴趴的布袋，装满也不变形。

**价格逼单(2:00-3:30)**
> 今天直播间专属价！3件套，大中小各一个，日常价199。今天——99！对，你没听错，砍一半。
>
> 但是只有200套！拍完就恢复原价。

**互动+逼单(3:30-5:00)**
> 扣1的家人我看看有多少！收到的给我反馈，好评截图下次来直播间抽免单。
>
> 最后30秒了家人们，3、2、1，改价！去拍！

### 弹幕预案
| 弹幕问题 | 回复话术 |
|---------|---------|
| 有味道吗 | 完全没味道，PP材质不是PVC，我自己家用了半年 |
| 能放多重 | 实测30斤没问题，把手加固过的 |
| 颜色有几种 | 米色/灰色/白色三色可选 |`,

  leads: `## 精准客户线索

### 目标客户画像
**行业：** 家居日用品跨境卖家
**规模：** 年营收$500K-$5M
**特征：** 已有Amazon店铺，正在拓展新品类或新站点

### 潜在客户名单

| 公司/店铺 | 联系方式 | 匹配度 | 切入点 |
|-----------|---------|--------|--------|
| HomeVibe LLC | info@homevibe.com | 95% | 主营收纳品类，缺日语listing |
| GreenNest Co | 领英: /greenest-co | 88% | 刚拓展日本站，需要本地化 |
| TidyLife Store | Amazon店铺ID | 82% | 3个月内上新12个SKU |
| OrganizeHub | contact@orghub.com | 78% | 评论提到需要改进文案 |

### 外联策略
1. **首触渠道**: 领英InMail（开信率最高42%）
2. **话术角度**: 不直接推销，以"行业趋势分享"切入
3. **跟进节奏**: D1首触 → D3社交互动 → D7二次触达 → D14电话跟进`,

  'customer-service': `## 客服自动回复模板

### FAQ自动回复库

**Q1: 产品有异味怎么办？**
> 您好！PP材质产品出厂时可能有轻微气味，这是正常现象。建议您：
> 1. 开箱后在通风处放置2-4小时
> 2. 用湿布擦拭一遍
> 气味会在24小时内完全消散。如果超过48小时仍有异味，请联系我们为您安排免费换货。

**Q2: 可以退货吗？**
> 当然可以！我们提供30天无理由退货：
> - Amazon订单：直接在"我的订单"申请退货
> - 独立站订单：回复本邮件，附上订单号即可
> 退货运费由我们承担，退款将在收到商品后3-5个工作日内到账。

**Q3: 大号能装多少？**
> 大号尺寸为 15"×11"×10"(约38×28×25cm)，可以装：
> - 2件厚羽绒服
> - 4-5件毛衣
> - 或约15-20件T恤
> 承重达30磅(约13.6公斤)，加固把手不会断裂。

### 差评挽回话术
> Dear Customer, we're sorry to hear about your experience. We take every piece of feedback seriously. We'd like to offer you a free replacement or full refund — whichever you prefer. Could you please share your order number so we can resolve this right away? Thank you for giving us the chance to make it right.`,

  video: `## 短视频方案

### TikTok产品展示视频 — 收纳箱

**时长:** 15秒 | **格式:** 竖屏9:16

**分镜脚本:**
| 时间 | 画面 | 文字叠加 | 音效 |
|------|------|---------|------|
| 0-2s | 凌乱房间俯拍 | "POV: 你的房间" | 紧张BGM |
| 2-5s | 手拿折叠状态的箱子 | "但是看这个..." | 转折音效 |
| 5-9s | 展开+快速收纳过程 | "2秒展开 10秒收纳" | 节奏BGM |
| 9-13s | 收纳前后对比(分屏) | "Before → After" | 满足感音效 |
| 13-15s | 产品特写+价格 | "3件套 限时$19.99" | CTA音效 |

**拍摄要求:**
- 自然光/暖色灯光，避免惨白日光灯
- 手持拍摄增加真实感
- 收纳过程用2x加速

**预估KPI:**
- 完播率目标: ≥45%
- 互动率目标: ≥5%
- 转化率目标: ≥2%`,

  images: `## 商品主图方案

### Amazon主图设计(7张)

| 序号 | 类型 | 内容描述 | 规格 |
|------|------|---------|------|
| 1 | 白底主图 | 3件套45°角摆放，展开状态 | 2000×2000px, RGB, 白底≥85% |
| 2 | 场景图 | 卧室衣柜内使用场景，暖色调 | 2000×2000px |
| 3 | 尺寸图 | 大中小三款并排+尺寸标注 | 2000×2000px |
| 4 | 卖点图 | 折叠过程3步图解+厚度对比 | 2000×2000px |
| 5 | 材质图 | PP材质特写+BPA-Free认证标 | 2000×2000px |
| 6 | 对比图 | vs布艺收纳箱承重对比 | 2000×2000px |
| 7 | 生活图 | 多场景拼图(厨房+儿童房+车库) | 2000×2000px |

### 设计规范
- 字体: Montserrat Bold (标题) + Open Sans (正文)
- 主色: #2C3E50(深灰蓝) + #E8D5B7(暖米色)
- 信息图标: 扁平化线条图标，2px描边
- 文字覆盖面积 ≤ 画面30%

### 各平台适配
- Amazon: 2000×2000px, 白底, JPEG
- Shopee: 800×800px, 可带促销角标
- TikTok Shop: 1:1方图 + 9:16竖图各一套`,

  'ocr-translate': `## OCR识别+翻译结果

### 识别的原文(中文)
1. 品名：可折叠收纳箱三件套
2. 材质：食品级PP聚丙烯
3. 尺寸：大号38×28×25cm / 中号33×23×20cm / 小号28×20×15cm
4. 承重：≤15kg
5. 特点：无毒无味，可折叠，防潮防尘

### 翻译结果

| 字段 | 英语 | 日语 |
|------|------|------|
| 品名 | Foldable Storage Bins 3-Pack | 折りたたみ収納ボックス3個セット |
| 材质 | Food-grade PP Polypropylene | 食品グレードPPポリプロピレン |
| 尺寸(大) | Large: 15"×11"×10" | 大: 38×28×25cm |
| 承重 | Max Load: 33 lbs | 耐荷重: 15kg |
| 特点 | Non-toxic, Odor-free, Foldable, Moisture & Dust Resistant | 無毒・無臭、折りたたみ可能、防湿・防塵 |

### 注意事项
- 尺寸已转换为目标市场常用单位(英寸/cm)
- "食品级"翻译为"Food-grade"，符合FDA标准表述`,

  'ip-compliance': `## 知识产权合规扫描报告

### 扫描对象
商品标题："Wireless Earbuds Compatible with iPhone, AirPods Style Bluetooth Headphones"

### 风险检测结果

| 风险项 | 品牌/专利 | 风险等级 | 详情 |
|--------|----------|---------|------|
| "AirPods Style" | Apple Inc. (US Reg. #5467585) | 🔴 高危 | 直接引用注册商标，可能存在侵权风险 |
| "Compatible with iPhone" | Apple Inc. (US Reg. #3457218) | 🟡 中危 | 兼容性声明建议添加disclaimer |
| "Bluetooth" | Bluetooth SIG | 🟢 低危 | 需确认BQB认证 |

### 合规修改建议

**原标题（违规）：**
~~Wireless Earbuds Compatible with iPhone, AirPods Style Bluetooth Headphones~~

**修改后（合规）：**
Wireless Earbuds with Charging Case, Bluetooth 5.3 in-Ear Headphones, Touch Control, 30H Playtime, IPX5 Waterproof

**修改要点：**
1. 删除"AirPods Style" — 引用Apple注册商标存在较高侵权风险
2. 删除"Compatible with iPhone" — 改为"Compatible with iOS and Android devices"
3. 用技术参数（Bluetooth 5.3, IPX5）替代品牌关联词

### 各市场合规清单
- 🇺🇸 美国：FCC Part 15 认证 ✓ | UL安全认证 待确认
- 🇪🇺 欧盟：CE RED指令 ✓ | RoHS ✓ | WEEE注册号 待确认
- 🇬🇧 英国：UKCA标志 待申请（脱欧后不再接受CE）`,
};

/**
 * Get a pre-cached response for a module, if available.
 * Returns null if no cached response exists for the module.
 */
export function getCachedResponse(moduleId: string): string | null {
  return DEMO_RESPONSES[moduleId] || null;
}
