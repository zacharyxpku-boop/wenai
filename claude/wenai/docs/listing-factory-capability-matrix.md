# Wenai Listing Factory Capability Matrix

| 能力项 | 当前状态 | 说明 |
|---|---|---|
| SKU 输入 | 已具备 | 可输入真实 SKU 并创建本地项目 |
| 类目规则 | 本地具备 | 规则进入 Brief、报告和风险提示 |
| 品牌禁区 | 本地具备 | 会影响生成、评分和 QA |
| Brief 生成 | 本地具备 | deterministic generator，不接真实 LLM |
| 参考内容拆解 | 本地具备 | 手动参考内容可拆结构 |
| 脚本生成 | 本地具备 | Brief 可生成短视频脚本 |
| 分镜 | 本地具备 | 脚本可生成 shot list |
| 素材清单 | 本地具备 | 生成 required / missing assets |
| 素材匹配 | 本地具备 | 用 metadata 匹配分镜 |
| 生产就绪评分 | 本地具备 | 输出 blockers、warnings、next step |
| 批量变体 | 本地具备 | 生成文本/脚本层变体 |
| 批次生产 | 本地具备 | 可组织 batch items |
| Edit Pack | 本地具备 | 每条内容可生成编辑包 |
| SRT / EDL / Asset Manifest | 本地具备 | 纯文本导出，不做视频合成 |
| POC 报告 | 本地具备 | 由项目和 Brief 汇总生成 |
| 客户交付包 | 本地具备 | 交付物可下载轻量文件 |
| 本地导入导出 | 本地具备 | JSON round trip |
| 真实视频生成 | 暂未具备 | 不接 FFmpeg 或视频模型 |
| 真实平台分发 | 暂未具备 | 不接 TikTok / 小红书 / Amazon API |
| 真实数据回流 | 暂未具备 | 不接平台数据 |
| 云端协作 | 未来可接入 | 当前没有账号、权限、云盘 |
