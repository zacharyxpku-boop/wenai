# PostPlus 参考下的 wenai 融合设计

更新时间: 2026-05-02

## 外部参考结论

PostPlus 的核心不是一个单点生图工具，而是一套面向 AI Agent 的营销 workflow:

1. Discover: 先看平台、创作者、评论、受众语言和内容模式
2. Generate: 生成 hook、首帧、脚本、视觉方向和语音草稿
3. Edit: 进入 B-roll、字幕、剪辑决策和增强包装
4. Ship: 分发到多平台，并做排期、外联、交付和报告

它的价值点在于 **把营销工作拆成可路由、可取证、可交付的 SOP**，不是模型本身。

根据用户提供的飞书截图，PostPlus 的关键能力还包括:

- 市场内容调研: topic listening、趋势发现、评论挖掘、用户语言、需求信号
- 创作者发现: KOL/KOC 搜索、账号补全、内容匹配打分、shortlist、outreach 准备
- 产品和渠道判断: 平台比较、价格带、评论分析、供应链检查、go / no-go 建议
- 内容结构分析: hook、视觉语法、benchmark-to-brief、storyboard、prompt QA
- 媒体生产: 转写、字幕、帧抽取、B-roll、图片生成、视频生成、剪辑打包
- 增长优化: CRO、SEO、paid creative、analytics、A/B tests、pricing、lifecycle
- 发布交接: Feishu / Google Workspace / campaign folder / report / publishing record

## 对 wenai 的判断

wenai 不应该融合成一个“社媒营销 OS”。这会破坏当前已经收敛的 10 SKU POC 主线。

正确融合方式:

**把 PostPlus 的 evidence-first workflow，收敛成 wenai POC 交付包里的「内容拆解与增长测试包」工序。**

换句话说，PostPlus 解决“短视频从想法到发布”，wenai 要解决的是:

**一个真实 SKU 上新前后，如何基于真实市场内容证据，产出可测试的内容脚本、素材清单和复盘指标。**

## 从截图案例抽出的关键模式

TikTok / Instagram 内容营销案例证明，真正有效的路径不是“让 AI 随便写脚本”，而是:

1. 产品读图: 先识别类目、claims、购买驱动因素
2. 搜索地图: 不只搜产品名，还搜痛点、场景、竞品、生活方式和高意图词
3. Benchmark 搜集: 找 20-100 条真实内容，看播放、save、评论和匹配度
4. 评论证据: 记录 usage_question、objection、product_info_request 等真实用户语言
5. 结构拆解: 按 Audience / Product / Context / Hook / Timeline / CTA 拆视频
6. 产品改编: 保留有效结构，但替换为客户产品真实卖点
7. 素材 manifest: 把脚本拆成图片、视频片段、B-roll、字幕、配音和生成请求
8. 测试复盘: 用 CTR、3 秒停留、完播率、save rate、valuable comments、询盘判断是否继续投

## 顶层设计

### 新的交付结构

10 SKU POC 交付包从“上新物料包”升级为:

1. SKU 简报
2. 主图方向与场景 Prompt
3. 详情页文案与卖点
4. 合规与商标风险
5. 客服话术
6. 30 天复评 Checklist
7. **内容拆解与增长测试包**

第 7 项不是泛内容生产，而是 benchmark-to-campaign:

- 每个优先 SKU 给搜索地图
- 每个 SKU 至少 3 个 benchmark 方向
- 每个方向拆 Audience / Product / Context / Hook / Timeline / CTA
- 给产品改编版 hook、脚本、storyboard、素材需求和 manifest
- 标注适配平台: TikTok / Instagram Reels / 小红书 / 抖音 / 独立站
- 给 7 天测试排期
- 给复盘指标: CTR、3 秒停留、完播率、save rate、valuable comments、加购或询盘

### 产品边界

做:
- SKU 上新前后的内容证据和 benchmark 拆解
- 每个 SKU 的短视频 / 图文种草改编方案
- 平台适配和素材清单
- 复盘指标和下一步动作

不做:
- 直接替用户全平台代发
- 承诺爆款、GMV 或 ROI
- 复制竞品视频
- 把主站支付/合同搬进子站

## 商业逻辑

内容验证与分发包能提高 POC 的签约概率，原因很简单:

1. 客户买的不是“生成一段文案”，而是“这批 SKU 上线后怎么测、怎么复盘、怎么继续投”。
2. 单纯 listing 交付很容易被平台原生 AI 替代；listing + 内容测试 + 复盘指标更接近运营闭环。
3. 复盘时可以从“你觉得内容好不好”转成“哪些 SKU 和角度有继续投入信号”。

## 新最终目标补充

wenai 的最终目标不变:

**每月进合同的合格 POC 数**

但 POC 的定义升级:

**10 SKU 上新物料包 + 内容拆解与增长测试包 + 复盘指标**

这比泛 AI OS 更窄，比单纯上新工具更有商业闭环。

## 90 天执行顺序

1. 把“内容拆解与增长测试包”加入批量上新工序和导出验收包
2. 在 POC SOP 里明确内容包的输入、输出、人工终审边界
3. 在后台复盘记录中跟踪 benchmark、脚本、素材和测试是否完成
4. 后续再判断是否接入真实发布、排期、Lark/企微报告

## 关键风险

1. 如果做成泛短视频工具，会重新进入红海。
2. 如果没有真实平台信号，只能生成内容草稿，不能包装成“爆款预测”。
3. 如果直接接第三方分发，合规、账号权限、客户授权会变复杂。

当前阶段最好的方案是:

**先做 POC 交付包里的内容测试设计，不急着做真实自动发布。**
