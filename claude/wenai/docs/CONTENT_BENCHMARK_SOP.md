# TikTok / Instagram 内容营销 POC SOP

更新时间: 2026-05-02

## 核心判断

这个案例说明 PostPlus 真正强的不是“AI 生成视频”，而是 **benchmark-to-campaign**:

1. 先根据产品图片和卖点，推导应该搜什么内容
2. 去 TikTok / Instagram 找真实可学习内容
3. 拆解爆款视频为什么有效
4. 把结构改编成客户产品可用的脚本和素材方案
5. 再生成图片、视频片段、字幕、B-roll 和测试计划

wenai 要吸收这套能力，但不能做成泛社媒工具。它应该成为 10 SKU POC 的一部分:

**每个优先 SKU 都要有内容证据、参考结构、改编脚本、素材清单和 7 天测试计划。**

## 适用场景

在以下情况启用这个 SOP:

- 客户要做 TikTok / Instagram / 小红书 / 抖音内容营销
- POC 里包含新品验证、短视频投放、达人寄样或 UGC 内容
- SKU 的卖点不清楚，需要从真实内容和评论里找用户语言
- 客户已经有竞品视频、达人账号或参考链接
- 客户想知道一个产品更适合 TikTok Shop、Amazon、独立站还是内容种草

不适用:

- 客户只想要便宜批量图文
- 产品类目敏感但没有合规资料
- 没有任何真实素材，也不愿意提供产品图、视频或竞品链接
- 客户要求复制竞品视频

## 工作流

### 1. 产品读图和搜索方向

输入:
- 产品图
- 产品名称
- 核心卖点
- 目标市场
- 目标平台

输出:
- 类目判断
- 核心 claims
- 购买驱动因素
- 搜索关键词桶

关键词桶至少包括:
- exact product / brand searches
- generic high-intent product searches
- problem / pain searches
- audience / lifestyle searches
- competitor / alternative searches

验收标准:
- 不能只搜产品名
- 必须覆盖用户痛点、使用场景和替代品
- 必须说明为什么这些词能找到可学习内容

### 2. Benchmark 搜集

目标:
- 找到 20-100 条可学习内容
- 不只看播放量，还要看 save、comment、评论质量和产品匹配度

记录字段:
- 平台
- URL
- creator
- views
- saves
- comments
- save rate
- valuable comments count
- insight score
- product fit
- 可学习点

验收标准:
- 至少 5 条高价值参考内容
- 至少 3 条评论证据
- 必须区分“热闹但不相关”和“值得改编”

### 3. 视频结构拆解

对每条核心参考视频拆:

- Audience: 这个视频是给谁看的
- Product: 解决什么具体痛点，卖点如何融入
- Context: 拍摄场景在哪里，为什么可信
- Hook: 前 3 秒怎么抓眼球
- Timeline: 每个时间段发生什么
- Visual proof: 有什么视觉证据
- CTA: 如何引导下一步
- Native feel: 为什么像真实分享而不是硬广

时间线至少拆:
- 0-3s hook
- 中段演示 / 信息结构
- 结尾 CTA

验收标准:
- 不能只总结主题
- 必须拆出可复用结构
- 必须写清楚不能复制的部分

### 4. 产品改编

把参考视频结构改成客户产品版本。

输出:
- 改编原则
- shot-by-shot recreation plan
- hook variants
- script version
- storyboard
- 素材需求
- 禁止复制点

验收标准:
- 不 1:1 复制原视频
- 保留有效结构，替换成客户产品的真实卖点
- 每个镜头必须回答一个购买疑问

### 5. 素材生成和拼接

输出:
- 参考帧提取建议
- AI 图片生成请求
- AI 视频生成请求
- B-roll 清单
- 字幕文件或字幕文案
- CapCut / 剪辑拼接说明
- manifest

验收标准:
- 每个素材都能追溯到脚本
- 每个视频片段都说明用途
- 生成失败或偏离产品时要回到请求层微调

### 6. 测试和复盘

输出:
- 7 天发布计划
- 平台适配版本
- A/B 测试变量
- 复盘指标

指标:
- CTR
- 3 秒停留
- 完播率
- save rate
- valuable comments
- add-to-cart / inquiry

验收标准:
- 不承诺爆款
- 不承诺 GMV
- 必须定义“继续投 / 返工 / 放弃”的阈值

## POC 交付物

正式交付时至少包含:

1. `01_product_read.md`
2. `02_search_map.md`
3. `03_benchmark_shortlist.csv`
4. `04_video_breakdown.md`
5. `05_adaptation_brief.md`
6. `06_script_storyboard.md`
7. `07_asset_manifest.json`
8. `08_test_plan.md`
9. `09_review_report.md`

## wenai 的产品化方向

短期:
- 批量上新里新增“内容拆解包”工序
- 导出 POC 验收包时加入 benchmark-to-campaign 目录
- 询盘表单增加参考视频 / 竞品账号 / 内容目标字段

中期:
- 后台记录内容测试状态、参考链接、复盘指标
- 支持客户上传 benchmark URL / CSV / 截图
- 生成客户可读的 campaign report

长期:
- 再考虑真实发布、排期、达人外联和广告账户数据

## 关键边界

1. 没有真实 benchmark 时，只能输出搜索地图和测试假设，不能伪装成已调研。
2. 不能复制创作者身份、字幕位置、镜头构图和具体文本。
3. 保健品、美妆功效、儿童、医疗相关内容必须保守表达并人工终审。
4. 视频生成只是生产环节，脚本和 benchmark 判断才是成败关键。
