# wenai working tree 交付分组

这份文档用于把当前很脏的 working tree 收敛成可审、可测、可拆 commit 的交付分组。它不是回滚清单，也不是要求一次性提交所有内容。

核心原则：

- 只按 `C:\Users\86136\Desktop\claude\wenai` 项目范围判断，不把 Desktop 上层历史改动算进 wenai。
- 不回滚用户已有改动，不删除未确认文件。
- 不用“working tree 是否完全干净”作为唯一发布信号。
- 发布信号以分组审查、`scripts/verify.ps1` 通过、真实 API key / 支付 / 外部 CRM 配置完成为准。

## 01 CRM / 外部 CRM 映射

目标：把询盘从轻量表格推进到可运营 CRM 工作台，并为后续外部 CRM 同步准备字段。

核心范围：

- `src/app/admin/inquiries/page.tsx`
- `src/app/admin/inquiries/[id]/page.tsx`
- `src/app/api/sales/inquiry/route.ts`
- `src/components/AdminInquiryCommercialEditor.tsx`
- `src/lib/crm-labels.ts`
- `src/lib/crm-pipeline.ts`
- `src/lib/inquiry-activity.ts`
- `__tests__/crm-pipeline.test.ts`
- `__tests__/inquiry-activity.test.ts`

验收点：

- 询盘列表能看到状态、SLA、合同阶段、报价、付款、下一步动作。
- 询盘详情能维护账户、联系人、商机、外部 CRM ID/URL、同步状态。
- `/api/sales/inquiry?format=external-crm` 能导出外部 CRM 映射结构。

## 02 全站中文化 / 后台收口

目标：把公开站和后台演示面统一成中文，避免明显英文运营文案或历史乱码影响商业化观感。

核心范围：

- `src/i18n/zh.ts`
- `src/components/AdminHeader.tsx`
- `src/app/admin/metrics/page.tsx`
- `src/app/admin/cost/page.tsx`
- `src/app/admin/feedback/page.tsx`
- `src/app/admin/invites/page.tsx`
- `src/app/admin/payments/page.tsx`
- `src/components/marketing/*`
- `src/app/about/page.tsx`
- `src/app/docs/page.tsx`
- `src/app/enterprise/page.tsx`
- `src/app/product/*`
- `src/app/roadmap/page.tsx`
- `src/app/tools/page.tsx`
- `src/app/changelog/page.tsx`

验收点：

- 首页、产品页、价格页、关于页、文档页主文案是中文。
- 后台导航、指标面、CRM 面、成本面、邀请和支付面没有明显乱码。
- 必要技术标识如 API、SKU、CRM、POC、orgId 可以保留英文。

## 03 POC / 老板版分享 / 标品包

目标：客户 5 分钟跑通，从类目、SKU、标准包到报告和询盘。

核心范围：

- `src/app/poc/*`
- `src/app/share/*`
- `src/app/api/share/route.ts`
- `src/app/api/standard-pack/*`
- `src/components/FiveMinutePocOnboarding.tsx`
- `src/components/PocLaunchChecklist.tsx`
- `src/components/PocReportGenerator.tsx`
- `src/components/SharePageActions.tsx`
- `src/components/StandardPackWorkspace.tsx`
- `src/lib/brand-iq.ts`
- `src/lib/ecommerce-guardrails.ts`
- `src/lib/poc-launch-check.ts`
- `src/lib/poc-report-evaluator.ts`
- `src/lib/share-readonly.ts`
- `src/lib/sop-workflows.ts`
- `src/lib/standard-pack-routing.ts`

验收点：

- 选择类目 -> 填 SKU -> 生成标准包 -> 打开报告 -> 提交 POC。
- 老板版分享页可只读打开。
- Brand IQ、禁用词、类目阈值进入评分和报告。

## 04 内容营销 / 案例证据库

目标：把 TikTok / INS benchmark、hook matrix、slideshow / reel brief 和发布复盘做成营销标品。

核心范围：

- `src/app/pipelines/marketing-campaign/page.tsx`
- `src/components/ContentMarketingPackWorkspace.tsx`
- `src/lib/content-marketing-pack.ts`
- `src/app/cases/*`
- `src/components/CaseLibraryExplorer.tsx`
- `src/lib/case-library.ts`
- `src/lib/case-study-details.ts`
- `src/lib/poc-case-studies.ts`

验收点：

- 内容营销模块能输出 benchmark、hook、brief、复盘报告。
- 案例库能按类目、交付线、决策场景筛选。

## 05 原有 pipeline / API 稳定性改动

目标：保留之前为上新、批量、影棚、视频、拆解等 pipeline 做的稳定性和入口改动。

典型范围：

- `src/app/pipelines/*`
- `src/app/api/*`
- `src/components/AIWorkspace.tsx`
- `src/components/Layout/Sidebar.tsx`
- `src/config/*`
- `src/lib/auth.ts`
- `src/lib/ratelimit.ts`
- `src/proxy.ts`
- `tsconfig.json`

验收点：

- `scripts/verify.ps1` 通过。
- pipeline 页面不因本轮 CRM / 中文化改动回归。

## 06 文档 / 验证 / 上架清单

目标：把产品定位、交付 SOP、商业化状态、验证入口留成可传递资料。

核心范围：

- `docs/FINAL_GOAL.md`
- `docs/PRODUCT_STATUS.md`
- `docs/WENAI_OPERATING_SYSTEM.md`
- `docs/COMMERCIALIZATION_CLOSEOUT.md`
- `docs/LAUNCH_READINESS_CHECKLIST.md`
- `docs/POC_DELIVERY_SOP.md`
- `docs/CONTENT_BENCHMARK_SOP.md`
- `docs/CREATIVE_PRODUCTION_PACK.md`
- `scripts/verify.ps1`
- `scripts/release-scope.ps1`
- `scripts/repo-status.ps1`

验收点：

- 后续接 API key、支付、合同、外部 CRM 时，有明确清单。
- 任何人接手都知道本仓是“电商 AI 商业交付系统”，不是零散工具集合。

## 07 商业化计费 / 法务状态面

目标：把价格、提交询盘、支付 checkout、条款隐私、状态页和权益判断单独成组，便于上架前与支付和法务配置联动。

核心范围：

- `src/app/pricing/page.tsx`
- `src/app/pricing/checkout/page.tsx`
- `src/app/inquire/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/status/page.tsx`
- `src/lib/entitlements.ts`

验收点：

- 价格页和 checkout 页可以独立审查，不被混在 POC 或首页改动里。
- 询盘入口能连接 CRM 和 POC 路径。
- 条款、隐私、状态页至少达到演示和上架前检查水平。

## 08 账户工作区 / 全局壳层

目标：把用户中心、模块页、首页壳层、全局样式和 demo 入口单独成组，便于 UI 验收和账户体验回归。

核心范围：

- `src/app/page.tsx`
- `src/app/demo/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/me/*`
- `src/app/modules/[moduleId]/page.tsx`

验收点：

- 首页入口、demo、账户中心、SKU 页面、模块详情页能一起做体验验收。
- 全局样式改动有明确归属，不和 CRM / POC / 营销模块混在一起。

## 09 未分组项

`scripts/release-scope.ps1` 会把没有落入上面 8 个桶的改动列到 `Ungrouped items requiring manual review`。

处理方式：

- 如果是商业化入口、计费、法务或权益，归入 `07 商业化计费 / 法务状态面`。
- 如果是首页、账户中心、模块页或全局样式，归入 `08 账户工作区 / 全局壳层`。
- 如果只是历史脏改动，保持不动，不在本轮回滚。

## 查看分组

运行：

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\release-scope.ps1
```

该脚本只展示分组，不 stage、不提交、不回滚、不删除。

## 最终验证

运行：

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

