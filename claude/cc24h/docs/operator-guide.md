# cc24h 操作指南

## 安装

```bash
cd cc24h && npm install
node bin/cc24h.mjs doctor   # 检查环境
```

## 日常操作

### 早上

```bash
node bin/cc24h.mjs review -p <项目>    # 看昨晚结果
node bin/cc24h.mjs tui -p <项目>       # 详细查看
# TUI 里按 m 看 merge 候选，r 恢复失败 session
```

### 白天

```bash
# 交互式添加任务
node bin/cc24h.mjs tui -p <项目>   # 按 n 新建任务

# 或批量导入
node bin/cc24h.mjs enqueue tasks.yaml -p <项目>

# 启动 daemon（2并行，TUI里也可按 d）
node bin/cc24h.mjs daemon -p <项目> --max-parallel 2
```

### 晚上

```bash
# 导入夜间任务
node bin/cc24h.mjs enqueue tasks/nightly.yaml -p <项目>

# 夜间模式（保守，单线程）
node bin/cc24h.mjs daemon -p <项目> --night --max-parallel 1

# 重要：禁用电脑休眠
```

## 故障处理

| 问题 | 解决 |
|------|------|
| "No backend" | `node bin/cc24h.mjs doctor` — 确认 Claude CLI 已安装 |
| Session stale | `node bin/cc24h.mjs sync` 检测并标记 |
| Task stuck | TUI 里 `s` 同步 → `r` 恢复 |
| Lock 冲突 | TUI 里 `l` 查看 → `s` 清理过期锁 |
| 数据库损坏 | 删除 `.cc24h/state.db` 重建（任务需重新导入） |

## 并行策略

- 每个任务在独立 `cc24h/<task-id>` 分支
- `files_touched` 字段驱动文件锁（同文件不会并行写）
- 依赖关系（`depends_on`）决定执行顺序
- 完成后在 `review` 状态等你检查并 merge

## 重试机制

- 失败自动重试，指数退避（30s → 60s → 120s）
- 超过 `max_retries` 后隔离（quarantine）
- 隔离的任务不再自动执行，需手动处理
