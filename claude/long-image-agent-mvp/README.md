# Long Image Agent MVP

桌面上的独立 MVP 工程。现在包含两层：

- 一个可分享的 Web demo
- 一个底层长图生成引擎

目标是把模板图、PDF 和补充素材自动加工成：

- 结构化分析日志
- 模块化 HTML 预览
- 750px 宽的完整长图 HTML
- PNG / JPG 导出

## 目录

```text
input/
  template/
  pdf/
  assets/
  task.json         # 可选

output/
  logs/
  module_previews/
  html/
  final/
```

## 运行 Web Demo

```bash
npm install
npm run dev
```

默认打开：

```text
http://localhost:3210
```

页面支持：

- 上传模板图
- 上传 PDF
- 上传高清素材
- 可选上传 `task.json`
- 自动生成结果
- 直接打开最终 HTML / PNG / 日志
- 用 `?job=<id>` 回看某次任务

## 直接跑底层生成器

```bash
npm run generate
```

这会继续使用当前工作目录里的 `input/` 与 `output/`。

## task.json 可选字段

```json
{
  "target_width": 750,
  "theme": "golden luxury",
  "review_mode": "first_module_then_auto_continue",
  "first_module_as_style_baseline": true,
  "output_format": "png",
  "prefer_assets_over_pdf_images": true,
  "preserve_template_structure_first": true
}
```

## 无素材模式

如果 `input/template`、`input/pdf`、`input/assets` 暂时为空，脚本不会停住，而是会：

- 生成完整的 inventory / analysis / mapping / design token 文件
- 生成“内容不足”但可交付的模块预览
- 导出最终长图 PNG / JPG

这样可以先确认 SOP、版式和技术链路，等素材进来后再重复运行。

## 分享 / 部署建议

这版已经更适合部署为一个小型 Demo 站，而不是只在本地跑：

- 适合部署到长期在线的 Node 平台
- 推荐优先考虑 Railway / Render / 自有云主机
- 因为服务端需要写入文件、跑 Playwright 截图，所以不建议先走纯静态站
