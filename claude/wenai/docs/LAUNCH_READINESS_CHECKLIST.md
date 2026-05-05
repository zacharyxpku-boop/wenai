# wenai 上架前检查清单

目标：把 wenai 作为“电商 AI 商业交付系统”放进独立站子站，上架前只允许留下明确需要站点配置或外部账号配置的事项。

## 1. 生产环境配置

- [ ] `NEXT_PUBLIC_APP_URL` 指向线上 wenai 子站。
- [ ] `AI_API_KEY`、`AI_MODEL`、`AI_ENDPOINT` 已配置并通过真实请求测试。
- [ ] `JWT_SECRET`、`PASSWORD_SALT`、`ADMIN_KEY` 使用生产强度随机值。
- [ ] `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN` 已配置，用于询盘、分享链接和限流。
- [ ] `EXTERNAL_CRM_PROVIDER` 已选择：`generic`、`hubspot` 或 `feishu`。
- [ ] `EXTERNAL_CRM_WEBHOOK_URL` 已配置；未配置时系统保持“可导出 CRM 映射”模式。
- [ ] `EXTERNAL_CRM_TOKEN` 已配置到生产环境；如目标 webhook 不需要 token 可留空。
- [ ] 邮件服务只在需要通知时开启：`RESEND_API_KEY` 或 `SENDGRID_API_KEY`、`MAIL_FROM`。
- [ ] 媒体生成 provider 只给要开放的模块配置，避免客户点到未准备好的能力。
- [ ] 支付、合同、退款、发票、正式 SLA 默认走独立主站；除非明确要把 Stripe 放回本仓。

## 2. 客户可见路径 QA

- [ ] `/` 首屏明确表达：wenai 是给电商团队的 AI 商业交付系统。
- [ ] `/poc` 能在 5 分钟内完成：选类目 -> 填 SKU -> 出标准包 -> 出报告 -> 提交 POC。
- [ ] `/pricing` 解释 POC、团队版、企业版的购买路径和边界。
- [ ] `/inquire` 能捕获客户需求，并继续引导到 POC 标品包。
- [ ] `/share/[id]` 和 `/share/[id]/executive` 可只读分享给客户、合伙人或老板。
- [ ] `/cases`、`/pipelines/marketing-campaign` 能展示内容营销标品能力。
- [ ] `/admin/inquiries` 和 `/admin/inquiries/[id]` 能维护 CRM 状态、合同阶段、SLA、外部 CRM 同步。
- [ ] `/docs`、`/roadmap`、`/enterprise`、`/tools`、`/changelog` 没有明显乱码和旧定位。

## 3. 视觉验收矩阵

用桌面和移动端各过一遍：

- [ ] 首页：1280x900、390x844。
- [ ] POC 首页：1280x900、390x844。
- [ ] POC 报告页：1280x900、390x844。
- [ ] 老板版分享页：1280x900、390x844。
- [ ] CRM 列表页：1440x900。
- [ ] CRM 详情页：1440x900。
- [ ] 内容营销模块：1280x900、390x844。
- [ ] 价格/询盘页：1280x900、390x844。

验收标准：

- [ ] 首屏有明确产品信号，不像零散工具集合。
- [ ] 文案不溢出按钮、卡片、表格和移动端容器。
- [ ] 主要 CTA 可见且能点击。
- [ ] 后台表格和详情页在桌面可扫描。
- [ ] 只读分享页没有编辑入口。

## 4. Demo Room

- [ ] 准备 3 个演示类目：家居、汽配、数码。
- [ ] 准备 1 个 10 SKU POC 样例，包含类目、SKU 输入、Brand IQ、内容方向、验收分。
- [ ] 准备 1 个老板版报告链接，用于发客户、合伙人或投资人。
- [ ] 准备 1 个 CRM 询盘样例，包含 owner、SLA、合同阶段、报价状态、付款状态、下一步动作。
- [ ] 准备 1 个外部 CRM webhook 测试目标，确认同步按钮能返回 `synced` 或明确失败原因。

## 5. 商业和法务边界

- [ ] AI 输出不是最终法律、医疗、商标、平台政策或合规意见。
- [ ] 高风险类目、监管宣称、商标、最终发布内容必须人工复核。
- [ ] 成本节省和 ROI 计算是估算，不承诺具体收益。
- [ ] POC 报告用于商业判断，不等于保证成交。
- [ ] 付款、合同、退款、发票和正式 SLA 以独立主站商业流程为准。

## 6. 发布和回滚

- [ ] 8 个交付桶已经分组提交。
- [ ] `scripts/release-scope.ps1` 输出无未分组项。
- [ ] `scripts/verify.ps1` 通过。
- [ ] 分支已 push 到远程。
- [ ] PR 已创建，或记录无法创建 PR 的登录/权限阻塞。
- [ ] 上线前保留当前可验证 commit hash，必要时可按交付桶回滚。

