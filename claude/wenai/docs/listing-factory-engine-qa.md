# Wenai Listing Factory Engine QA

本轮 QA 目标不是继续扩页面，而是确认本地 deterministic generator 能否在真实感 SKU 上稳定生成可交付 Brief，并形成像样的 POC 报告。

## 已压测 SKU 样本

1. 美妆个护：姜根蓬松防脱洗发水
2. 宠物用品：犬猫日常口腔护理牙粉
3. 家居生活：儿童学习智能护眼台灯
4. 食品饮料：低糖高纤燕麦能量棒
5. 3C 配件：超薄磁吸无线充电宝
6. 教育产品：初中生 AI 学习规划体验课
7. 跨境 Amazon：不锈钢多功能牛油果切片器
8. TikTok Shop：便携榨汁随行杯

这些样本刻意保留了真实客户常见的不完整性：卖点有但证据不总是完整，竞品备注偏口语，品牌禁区和类目规则需要系统主动约束输出。

## 每类样本重点看什么

- 美妆个护：是否避开生发、治疗、药效、临床保证，是否把表达收束到日常护理体验。
- 宠物用品：是否避免替代兽医建议，是否说明适用年龄、喂食方式和严重问题就医。
- 家居生活：是否补充尺寸、真实使用距离和不适用边界，避免“护眼绝对有效”。
- 食品饮料：是否避免减肥、控糖治疗、健康疗效，是否提示配料表和过敏原。
- 3C 配件：是否说明兼容机型、发热边界、容量和安全认证，不做“永不发热”。
- 教育产品：是否避免提分保证、保过、逆袭和焦虑话术。
- 跨境 Amazon：是否更偏功能、FAQ、尺寸、清洗和安全边界。
- TikTok Shop：是否更像短节奏口播，同时避免爆单、减脂、虚假折扣。

## Brief 可交付判断

一条 Brief 至少应满足：

- Hook 具体，能看出 SKU、场景或用户问题。
- 画面建议可拍，不只是抽象策略。
- 口播方向能指导达人或运营写脚本。
- CTA 明确，但不使用虚假稀缺或绝对化承诺。
- riskNotes 能解释为什么要避开某些表达。
- qualityScore 在 60-100 范围内，且 brandSafety 不靠空白得高分。
- reusableStructure 可以扩展成同类 Brief 变体。

## 常见失败模式

- Hook 过泛：例如“这个东西太好用了”，看不出类目、场景和目标人群。
- 平台不分化：TikTok、小红书、Amazon、Shopify 都像同一条文案。
- 类目不分化：美妆、宠物、食品、3C 都套同一个痛点模板。
- 品牌禁区只展示不约束：生成结果仍出现“保证、治疗、全网最低、吊打竞品”。
- 报告像系统日志：只说生成了几条 Brief，没有顾问结论、风险判断和下一步生产建议。
- CTA 过度承诺：为了转化使用“最后一天、错过永远没有、马上见效”等高风险话术。

## 当前 deterministic generator 边界

当前生成器不接真实 LLM，也不理解外部平台实时趋势。它适合做：

- 本地 SKU 试跑
- 规则和品牌禁区约束验证
- Brief 结构化草稿
- POC 报告初稿
- QA 和销售演示

它不适合直接替代正式创意团队的最终内容，也不会自动保证爆款、投放表现或平台合规通过。

## 未来接 LLM Provider 的替换点

当前 provider 接口在 `src/lib/listing-factory-engine.ts`：

- `localDeterministicProvider`
- `futureLLMProvider`
- `generateBriefs(project, { provider })`

下一轮接真实 LLM 时，应保持 `ListingProject -> GeneratedBrief[]` 的输入输出合同不变，只替换 provider 的 `generate()` 实现。LLM 输出仍必须经过：

- `sanitizeRiskyCopy()`
- `detectRestrictedClaims()`
- `evaluateBriefQuality()`
- `buildPocReport()`

也就是说，LLM 只负责更强的生成能力，品牌安全、评分和报告合同仍由 Wenai Engine 控制。

