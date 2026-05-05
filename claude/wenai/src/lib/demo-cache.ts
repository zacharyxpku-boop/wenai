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

  'customer-service': `## 销售转化Agent · 对话诊断与话术

### 1. 意图识别

| 意图类型 | 信号词/特征 | 转化优先级 |
|---------|------------|-----------|
| 产品咨询 | "这个...", "能不能..." | P0 临门一脚 |
| 价格异议 | "太贵了", "能便宜吗" | P0 异议处理 |
| 物流担心 | "多久到", "能退吗" | P1 兜底承诺 |
| 比较选购 | "和XX比怎样" | P1 锚定引导 |
| 售后投诉 | "坏了", "不满意" | P0 挽回优先 |
| 复购犹豫 | "之前买过..." | P0 升单机会 |

**当前对话判定：价格异议 + 比较选购（混合意图）**

### 2. 三版本话术（A/B/C）

**版本 A · 安全中性**
> 完全理解您的顾虑。我们确实比普通款贵 $8，但多出来的钱都花在 BPA-free 食品级 PP 和四侧卡扣密封上。是否支持试用、退换或退款, 请以店铺正式政策为准。

**版本 B · 主动转化**
> 说实话，这个价位买密封盒的人里，90% 冲着三件事：装米防虫、装面粉防潮、装宠物粮防串味。如果您也有这类需求，这个价值得。如果只是收纳玩具/杂物，普通无密封款就够。告诉我您主要用途，我给您精准推荐。

**版本 C · 共情降温**
> 预算是真实问题，我懂。这款套装目前第二件半价，两套一起拍只多 $15，平均下来比单买便宜 25%。如果您身边有朋友也缺收纳盒，可以凑单更划算。

### 3. 追单钩子（48h内跟进）
- 首触 4h后未回：发送 "刚帮您查了库存，您看的规格只剩 8 套了"
- 24h未回：发优惠券 $5 off 限时 24h
- 48h：发真人使用视频（UGC）

### 4. 升单机会
- 拍 2 件享第二件半价
- 加 $9.99 升级到 12 件装
- 搭配标签笔套装 $6.99（复购率 38%）

### 5. 话术禁忌
- ❌ "亲，这是最低价了" — 显得防御
- ❌ "那您看看别家吧" — 主动放弃转化
- ❌ "性价比很高" — 空洞无说服力`,

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

  positioning: `## 直播间定位方案（10选3精选）

### 全量方案一览

| # | 方案名 | 人设 | 场景 | 形式 | 钩子 | 客群 | 定位 | GMV区间 | 难度 |
|---|--------|------|------|------|------|------|------|---------|------|
| 1 | 工厂老板直连 | 工厂老板 | 车间 | 开箱实测 | 原产地直发 | 理性比价型 | "20年代工厂老板，省掉中间商" | $30-80K/场 | ★★ |
| 2 | 留学生严选 | 留学生 | 海外公寓 | 教学式 | 海外仓现货 | 留学生/新移民 | "帮你选海外刚需" | $10-30K/场 | ★ |
| 3 | 设计师买手 | 设计师 | 展厅 | 剧情带货 | 限量款 | 25-35都市女性 | "设计师眼光选品" | $20-50K/场 | ★★★ |
| 4 | 原产地农户 | 农户 | 原产地 | 纯讲解 | 产地直发 | 食品健康党 | "山里来的真货" | $8-25K/场 | ★ |
| 5 | 专业测评师 | 测评师 | 实验室 | 对比测评 | 老板亲测 | 数码极客 | "拆给你看" | $15-40K/场 | ★★★ |
| 6 | 健身教练推荐 | 健身教练 | 健身房 | 教学式 | 会员专享 | 健身人群 | "我在用的装备" | $10-25K/场 | ★★ |
| 7 | 新手宝妈 | 宝妈 | 家庭场 | 互动答疑 | 7天无理由 | 0-6岁妈妈 | "亲测过的才敢推" | $8-20K/场 | ★ |
| 8 | 跨境卖家本人 | 卖家 | 办公室 | 砍价PK | 极致低价 | 价格敏感 | "我直接亏本冲量" | $20-60K/场 | ★★ |
| 9 | 行业老兵 | 老兵 | 门店 | 纯讲解 | 独家联名 | 高端客群 | "15年行业经验" | $25-70K/场 | ★★★ |
| 10 | 海外华人 | 华人 | 海外公寓 | 用户访谈 | 售后承诺 | 华人社区 | "自己人给自己人推" | $12-30K/场 | ★★ |

---

### 方案1 · 工厂老板直连（Top推荐）

**完整定位：** 一位做了20年OEM代工的深圳工厂老板，今年决定绕开中间商，直接通过TikTok Shop把厂价卖给海外消费者。直播间就是车间，背后是流水线，货就是刚下线的。主打"你在亚马逊看到的品牌都是我代工的"。

**第一屏视觉：** 车间背景 + 老板穿POLO衫 + 身后员工在打包 + 字幕"Factory Direct · No Middleman"

**开场30秒话术：**
> Hey guys, I'm Kevin, I own this factory in Shenzhen. We've been making these for Amazon sellers for 20 years. Same factory, same product, but today you're getting factory price. No middleman. No markup. Let me show you around first...

**高光内容钩子：**
1. 拿出一个Amazon上$49的同款，当场撕标签
2. 让员工打包的画面直接入镜
3. 对比价：Amazon $49 / 我们 $19
4. 承诺"工厂直发，10天到美国"
5. 每小时抽一单工厂价

**最可能翻车的3个坑：**
- 英文不够地道 → 配一个双语副播
- 工厂背景太嘈杂 → 提前做声学处理
- 海外用户质疑工厂真实性 → 挂营业执照+工厂门牌特写

**冷启动执行清单：**
- Day1: 拍3条工厂探访短视频，打"Factory Tour"标签
- Day2-3: 每天2条短视频，产品直对比
- Day4: 第一场直播，2小时，主打1个引流款
- Day5: 复盘+投Spark Ads
- Day6-7: 加场直播，接入主推款

### 方案5 · 专业测评师（第二推荐）
[...详细展开...]

### 方案9 · 行业老兵（第三推荐）
[...详细展开...]`,

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

  'private-domain': `## 私域运营自动化 · 弃单挽回序列（US市场）

**场景：** Abandoned Cart · 客单价 $28-35 · 目标市场 US

### 7天序列总览

| Day | 渠道 | 时机 | Subject/首句 | 核心钩子 |
|-----|------|------|-------------|---------|
| D0 +1h | Email | 弃单后1小时 | Did something go wrong at checkout? | 纯提醒+客服兜底 |
| D0 +4h | Email | 弃单后4小时 | Your cart is waiting — free US shipping inside | 包邮钩子 |
| D1 | SMS | 次日10am | Hey [Name], your HOMELODY bins are almost gone — 15% off if you finish today | 库存焦虑+折扣 |
| D3 | Email | 第3天上午 | Real customers, real kitchens — see why 2,300+ chose us | 社会证明UGC |
| D5 | Email | 第5天 | Last call: 20% off expires tonight | 最终折扣+deadline |
| D7 | WhatsApp | 第7天 | One question — what stopped you? | 调研挽回 |

### D0 +4h 邮件全文

**Subject:** Your cart is waiting — free US shipping inside 📦

Hi [First Name],

Noticed you left the 6-piece Stackable Storage Bins in your cart. Two things you should know:

✅ **Free US shipping** — automatically applied at checkout
✅ **90-day returns** — if it doesn't fit your space, send it back

[Complete My Order →]

P.S. 2,300+ reviews, 4.8★ average. Most-loved by people who hate clutter (like us).

---

### A/B 测试建议
- Subject A: "Did something go wrong?" (好奇型)
- Subject B: "Your cart is waiting — free shipping inside" (利益型)
- 预期：B 打开率高 15-20%，A 回复率高

### 合规提示
- CAN-SPAM: 邮件底部必须含 unsubscribe + 物理地址
- TCPA: SMS 必须有明确opt-in记录，含STOP退订
- GDPR (如投EU): 需单独consent，不能沿用购物流程授权`,

  'data-insights': `## 数据洞察报告

**业务背景：** 家居收纳品类 · 月GMV $45k · 近4周环比下滑18%

### 健康度评分：62/100 ⚠️

| 维度 | 得分 | 状态 |
|------|------|------|
| 流量 | 70 | 🟡 稳定但质量下降 |
| 转化 | 55 | 🔴 明显恶化 |
| 客单价 | 68 | 🟡 略降 |
| 复购 | 75 | 🟢 健康 |

### Top 3 关键发现

**1. 主图CTR从3.2%掉到2.1%（证据：广告后台4周趋势）**
- 假设：新品图换成极简风格后丢失对比度
- 影响：每天少引入~200点击，占整体流量下滑60%
- 行动：本周内A/B测试老版主图 vs 新版，按数据决定回滚

**2. 加购→支付转化率从28%掉到19%**
- 假设：运费规则4周前改为$6.99起，用户在结账页流失
- 影响：单此一项月损约$8.2k
- 行动：恢复$35免邮或改为商品内含运费

**3. 差评集中在"盖子密封不严"（12条/近30天）**
- 假设：新批次PP原料硬度偏低
- 影响：退货率从2.1%升至4.8%
- 行动：联系工厂核查批次，召回未发货库存

### 7天行动清单

| Day | 任务 | 负责 | 验收 |
|-----|------|------|------|
| D1 | 主图A/B上架 | 运营 | 老版/新版各50%流量 |
| D2 | 运费规则改回 | 运营 | 结账页显示免邮 |
| D3 | 工厂批次核查 | 采购 | 拿到QC报告 |
| D5 | 差评主动私信挽回 | 客服 | 12条100%触达 |
| D7 | 数据复盘 | 运营 | 转化恢复≥25% |`,

  'ad-optimizer': `## 投流诊断报告 · TikTok Ads

**目标：** 降低CPA至$12以内 · 当前CPA $21.5

### 账户健康度：58/100 🔴

### 6维度诊断

| 维度 | 问题 | 严重度 |
|------|------|--------|
| 账户结构 | 5个广告组混投多品类 | 🔴 高 |
| 预算分配 | 70%预算压在CPA最高的广告组 | 🔴 高 |
| 素材 | 4条素材中2条CTR<0.8% | 🟡 中 |
| 受众 | 兴趣定向过宽(1000万+) | 🟡 中 |
| 出价 | 最高出价模式导致尾部无效曝光 | 🔴 高 |
| 落地页 | 移动端加载3.8s，弃单率高 | 🟡 中 |

### 立即止损（今天执行）

1. **关停广告组 AG-003（CPA $38，预算$150/天）** → 每天立省$150
2. **暂停低CTR素材 Video_02 和 Video_04** → 预算回流到Video_01(CTR 2.1%)
3. **出价模式切换** 最高出价 → 成本上限$12 → 杜绝尾部浪费

**预期：3天内CPA下降至$15，7天内达到$12目标**

### 7天优化路线

| Day | 动作 | 验收指标 |
|-----|------|---------|
| D1 | 止损3动作 | CPA≤$16 |
| D2 | 按品类拆分广告组（1品1组） | 结构清晰 |
| D3 | 上线3条新素材（UGC风） | 至少1条CTR≥1.5% |
| D4 | 受众收窄到精准兴趣(<300万) | 频次<3 |
| D5 | 落地页加载优化 | <2s |
| D6 | 复盘+放量 | ROAS≥2.5 |
| D7 | 稳定跑量 | CPA≤$12 |

### 素材迭代方向
- 前3秒强钩子："This $30 bin replaced my $200 closet organizer"
- 第4-8秒产品对比实拍（乱→整）
- 第9-15秒CTA+限时折扣`,
};

/**
 * Get a pre-cached response for a module, if available.
 * Returns null if no cached response exists for the module.
 */
export function getCachedResponse(moduleId: string): string | null {
  return DEMO_RESPONSES[moduleId] || null;
}
