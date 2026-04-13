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

  'ip-compliance': `## 知识产权合规扫描报告

### 扫描对象
商品标题："Wireless Earbuds Compatible with iPhone, AirPods Style Bluetooth Headphones"

### 风险检测结果

| 风险项 | 品牌/专利 | 风险等级 | 详情 |
|--------|----------|---------|------|
| "AirPods Style" | Apple Inc. (US Reg. #5467585) | 🔴 高危 | 直接引用注册商标，构成侵权 |
| "Compatible with iPhone" | Apple Inc. (US Reg. #3457218) | 🟡 中危 | 兼容性声明需加disclaimer |
| "Bluetooth" | Bluetooth SIG | 🟢 低危 | 需确认BQB认证 |

### 合规修改建议

**原标题（违规）：**
~~Wireless Earbuds Compatible with iPhone, AirPods Style Bluetooth Headphones~~

**修改后（合规）：**
Wireless Earbuds with Charging Case, Bluetooth 5.3 in-Ear Headphones, Touch Control, 30H Playtime, IPX5 Waterproof

**修改要点：**
1. 删除"AirPods Style" — 任何形式引用Apple商标均构成侵权
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
