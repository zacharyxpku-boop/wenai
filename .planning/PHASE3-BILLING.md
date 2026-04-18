# Phase 3 · 商用化链路 + 合规升级

> 时间：2026-04-18
> 入场状态：Pipeline 01 已 ship（commit 9fb1ddf），能 demo 但不能收钱
> 本阶段目标：让 wzq 朋友能"点一下付钱" + 让大客户法务不拒签

## 关键决策

### 支付方案：手动 MVP（不接 Stripe）

**选择**：二维码 + 对公转账 + 手动审核开通

**理由**：
- Stripe 国内接起来需要企业资质 + 海外主体
- 微信支付商户号要求营业执照 + ICP，周期 2 周+
- 当前付费客户 ≤ 5，手动开通 3 天/人够了
- Phase 4 量起来再接第三方支付

**局限性**：
- 不能自动对账
- 不能按月续费，需手动续约
- 不能退款自助
- 但这些问题在 5 个客户规模下都不算问题

### 定价锚定

| 档 | 价 | 锚点 |
|---|---|---|
| Free | ¥0 · 7 天 · 10 Pipeline/天 | HotClaw 内测 |
| Team | ¥499/月 · 500/天 · 5 席 | 半个运营员工一天工资 |
| Enterprise | 面议 · 本地部署 | 锚点客户规模 ¥30-80 万/年 |

**Free → Team 转化钩子**：
- Free Pipeline 配额 10/天在锚点客户场景下 1 周就撞墙
- 撞配额时弹窗提示"升级 Team 即扩至 500/天"

### Pipeline 配额修正

**老 bug**：Pipeline 1 次点击触发 3 路并行 /api/ai，每路消耗 1 次单模块配额。
50 次/天 → 实际 16 次 Pipeline → 朋友报 bug。

**修复**：
- 新增 `pipeline` / `pipeline:new-listing` 独立配额（10 次/天）
- Pipeline 页先调 `/api/ratelimit/check` 预占配额
- 预占成功才触发 3 路并行
- /api/ai 识别 `x-from-pipeline` header，跳过 per-module 配额

**副作用**：Pipeline 消耗独立配额，单模块直接调用依然消耗单模块配额，两套互不干扰。

### 合规升级亮点

Terms v2：
- §4 商标库从"15 品牌"更新为"500+ 品牌 / 19 类"
- §6 配额按档位分层
- §7 SLA 分层（99.5% / 99.9%）
- §9 订阅退款条款
- §10 开票流程
- §11 数据处理边界（新增）
- §12 变更通知 14 天

Privacy v2：
- §6 DSAR 权利扩展（访问/更正/删除/导出/撤回/投诉）
- §7 子处理者清单表（阿里云/DeepSeek/Vercel/Upstash）
- §8 跨境传输声明
- §9 Cookie 清单（只有 wenai-session）
- §10 儿童隐私（明确 B2B 不面向未成年）
- §12 DPA 索取入口

### 新增 /legal/dpa 页面

GDPR Article 28 标准模板，12 条款：
- 定义 / 处理范围 / 处理方义务 / 子处理者 / 技术措施
- 跨境传输 / 数据主体支持 / 审计权 / 违约赔偿 / 终止 / 适用法律 / 签署栏

用法：Team/Enterprise 客户法务可直接看在线版预览，正式签署邮件索取 Word 双签版。

## 新增路由

| 路由 | 说明 |
|---|---|
| `/pricing` | 三档定价页 + FAQ |
| `/pricing/checkout?plan=team` | 付款页（二维码 + 对公转账 + 声明表单） |
| `/admin/payments` | 付款审核面板（口令保护） |
| `/legal/dpa` | DPA 在线模板 |
| `/api/ratelimit/check` | Pipeline 级配额检查 API |

## 不在 Phase 3 做

- Stripe / 微信支付商户接入 → Phase 4
- 自动续费 → Phase 4
- 发票自助开具 → Phase 5
- 多币种 → 永远不做（境内 ¥ 够了）
- A/B 定价实验 → 样本量不够，浪费

## 成功验证

1. 朋友点 Pipeline 3 次 → 消耗 3 次 Pipeline 配额（而非 9 次单模块）
2. 配额打满 → 弹窗引导到 /pricing
3. 在 /pricing/checkout 填写声明后跳感谢页
4. /admin/payments 能看到声明列表
5. 法务看 Terms + Privacy 没有明显漏条

## 回退

把以下目录删除即可回到 Phase 2（v2 Pipeline 状态）：
- `src/app/pricing/`
- `src/app/admin/payments/`
- `src/app/legal/`
- `src/app/api/ratelimit/`

Terms/Privacy 回退：`git revert` 对应 commit。

## 下一阶段（Phase 4）待办

优先级递减：
1. Pipeline 02 · 达人批量冷启（真正实装）
2. 结果 Excel / CSV 导出
3. 案例页 /cases（3 个真实客户故事）
4. Stripe / 微信支付自动化
5. 60 秒 Demo 视频（用 video-pipeline skill）
6. 发票自助开具
