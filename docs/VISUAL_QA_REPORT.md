# wenai 视觉验收记录

日期：2026-05-06

## 本轮覆盖

- 本地构建：`scripts/verify.ps1` 覆盖 Next build、TypeScript、ESLint、重点测试。
- 页面路由：构建产物确认核心路由存在，包括 `/`、`/poc`、`/poc/report`、`/share/[id]`、`/share/[id]/executive`、`/admin/inquiries`、`/admin/inquiries/[id]`、`/pipelines/marketing-campaign`、`/pricing`、`/inquire`。
- 分组状态：`scripts/release-scope.ps1` 已将工作树拆成 8 个交付桶，并在提交前确认无未分组项。

## 桌面验收重点

- 首页必须像“电商 AI 商业交付系统”，不是工具集合。
- POC 路径必须能表达 5 分钟跑通：类目、SKU、标准包、报告、询盘。
- CRM 详情页必须能看到合同阶段、报价、付款、SLA、外部 CRM 同步。
- 内容营销页必须能表达 benchmark、hook matrix、brief、发布复盘。

## 移动端验收重点

- CTA 不换行挤压。
- 报告页和 POC 页不出现横向滚动。
- 卡片、表单、按钮高度稳定。
- 只读分享页不露出后台编辑动作。

## 当前结论

代码级验证已通过；本轮新增外部 CRM 同步按钮和 launch checklist 后，还需要在部署环境配置 API key、Redis、CRM webhook 后做一次真实浏览器点击验收。

