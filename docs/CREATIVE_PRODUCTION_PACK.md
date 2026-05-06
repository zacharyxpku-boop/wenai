# Creative Production Pack 设计

更新时间: 2026-05-02

## 结论

PostPlus 最后一批模块可以统一收敛成 wenai 的一个产品层:

**Creative Production Pack**

它不是一个独立产品，而是 10 SKU POC 之上的高阶交付层。作用是把 benchmark、脚本、人物、分镜、素材、粗剪、精剪串成真正可投放或可验证的内容成品。

## 为什么不能拆成很多零散功能

这些模块表面上很多:

- 自然语言定制 workflow
- podcast 风格 AI UGC
- 批量化 UGC 风格视频
- 街头采访视频
- animated ai ads
- 视频编排
- UGC 人物形象设计
- 5 分钟产出 5 份 TikTok slideshow / Instagram Reels

但本质上只是在解决三个问题:

1. **什么内容值得做**
2. **怎么把它稳定做出来**
3. **怎么快速做多版本**

所以产品上不能做 8 个散入口，否则用户会迷路，团队也难以标准化交付。

## 应该如何收敛

wenai 的交付结构调整为三层:

### Layer 1 · Launch Pack

解决上新基础问题:
- 标题
- 详情页
- 主图方向
- 合规提醒
- 客服话术

### Layer 2 · Growth Test Pack

解决 benchmark-to-campaign:
- 产品读图
- 搜索地图
- benchmark shortlist
- 评论证据
- 视频拆解
- 脚本改编
- 测试计划

### Layer 3 · Creative Production Pack

解决内容生产:
- 人物设定
- 参考图板
- 脚本和分镜
- AI 图像 / 视频批量生成
- B-roll 规划
- 粗剪 / 字幕 / 精剪
- 多版本输出

## Creative Production Pack 的 6 个工作流类型

### 1. Podcast UGC

适合:
- 解释型产品
- 高信任要求产品
- 补剂、保健、成分教育、工具讲解

交付:
- 单人 / 双人 podcast 脚本
- 参考人物和场景
- structured prompt
- 15s segment requests
- B-roll plan
- edit recommendations

### 2. Street Interview UGC

适合:
- 有明确生活场景的产品
- 要求“原生感”“真实感”的内容

交付:
- street persona
- 采访式脚本
- 镜头语言
- 分镜图
- 字幕版脚本
- 成片修订建议

### 3. Batch UGC Clips

适合:
- 需要短平快投放测试
- 0-15 秒第一人称批量视频

交付:
- 多脚本
- 多 angle
- 多分镜
- 批量生成请求

### 4. Animated Ads

适合:
- 适合 mascot / ingredients / abstract benefits 的产品
- 视觉风格要求高，真人素材不足

交付:
- 风格图
- 脚本
- storyboard
- 关键帧组
- 分段视频生成请求
- 合成方案

### 5. Slideshow / Reels Batch

适合:
- TikTok native 图文内容
- 快速做 3-5 个角度的内容测试

交付:
- 5 个 slideshow angle
- 每条 7-8 张图的 contact sheet
- 文案层说明
- TikTok / Ins Reels 适配

### 6. Editing / Polishing

适合:
- 前面已经有 rough cut
- 需要更像成品

交付:
- cut map
- B-roll insert plan
- subtitle style
- background music direction
- final edit recommendation

## 自然语言定制 workflow 的产品化方式

这块不能直接开放成无限自由度 builder。

当前阶段应该做成:

**自然语言描述 -> 系统推荐 workflow 模板 -> 再填结构化参数**

推荐模板:

1. benchmark-first
2. brief-first
3. hook-first
4. asset-first
5. iteration-first
6. podcast-ugc
7. street-interview
8. slideshow-batch
9. animated-ad

用户先说:
- 想做什么内容
- 用在哪里
- 有哪些素材
- 参考什么风格
- 最后要什么交付物

系统再把它映射进上面模板，而不是让用户自己发明一套完全新的流程。

## 商业化判断

### 最该先做进 wenai 当前 POC 的

1. benchmark-to-campaign
2. slideshow / reels batch
3. street interview UGC
4. podcast UGC

理由:
- 更贴近 TikTok / Instagram 电商营销
- 更容易形成样例和复盘
- 比 animated ads 更容易先成交

### 暂时不该重做成核心入口的

1. 完全自由 workflow builder
2. 过深的视频精剪工作台
3. 复杂 animated ads 生产线

理由:
- 太重服务
- 需要太多模型 / 素材 / 人工审核
- 不适合当前子站阶段

## 当前最终目标的再定义

wenai 当前不是“AI 电商工具站”。

wenai 应该定义为:

**电商 SKU 增长 POC 交付系统**

其中高阶交付能力由 Creative Production Pack 提供。

完整闭环:

1. Intake
2. Market Evidence
3. Launch Pack
4. Growth Test Pack
5. Creative Production Pack
6. Review Report
7. Main-site Contract

## 近期改造优先级

### P1

- 询盘表单增加 creative workflow 需求字段
- 后台项目板增加 production progress 字段
- 文档页公开说明 3 层交付结构

### P2

- 在 batch launch 导出包中增加 creative pack 目录
- 增加 workflow 推荐逻辑说明

### P3

- 再考虑独立 creative workflow 页面或模板选择器
