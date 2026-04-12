# cc24h

24 小时自主 Claude Code 编排系统。管理多 session、多 agent、并行 worktree，支持无人值守运行。

## 快速开始

```bash
cd cc24h
npm install

# 检查环境
node bin/cc24h.mjs doctor

# 导入任务
node bin/cc24h.mjs enqueue examples/nightly.yaml -p /path/to/your/project

# 启动守护进程（需要 Claude CLI 已安装）
node bin/cc24h.mjs daemon -p /path/to/your/project --max-parallel 2

# 或打开 TUI 仪表盘
node bin/cc24h.mjs tui -p /path/to/your/project
```

## 命令

| 命令 | 说明 |
|------|------|
| `doctor` | 检查环境（Node、Git、Claude CLI） |
| `tui` | 终端仪表盘 |
| `daemon` | 无人值守自主运行 |
| `enqueue <yaml>` | 导入任务 |
| `status` | 快速状态 |
| `review` | 晨间摘要 |
| `sync` | 同步状态（清锁、检测stale） |
| `resume` | 恢复失败/暂停的 session |

## 并行运行演示

```bash
# 准备一个 git 项目
cd /path/to/your/git/project

# 导入 3 个任务（2 个可并行，1 个有依赖）
node /path/to/cc24h/bin/cc24h.mjs enqueue /path/to/cc24h/examples/demo-parallel.yaml

# 启动 daemon（2 并行）
node /path/to/cc24h/bin/cc24h.mjs daemon --max-parallel 2

# 观察：
# 1. add-health-check 和 add-env-validation 同时启动（不同 worktree）
# 2. add-startup-log 等待 add-env-validation 完成后才启动
# 3. 每个任务在独立 cc24h/<task-id> 分支
# 4. 完成后状态变为 review，等你 merge
```

## TUI 快捷键

```
n  新建任务      d  启动 daemon     r  恢复 session
s  同步状态      p  暂停全部        h  查看 handoff
l  查看锁        g  Git/worktree    m  合并候选
?  帮助          Tab 切换面板       q  退出
```

## 任务 YAML 格式

```yaml
tasks:
  - id: my-task
    title: 简要标题
    prompt: |
      详细指令...
    priority: 1          # 1=最高
    agent_role: implementer
    depends_on: [other]  # 依赖的 task id
    files_touched:       # 用于锁冲突检测
      - src/foo.ts
    max_retries: 3
```

## 状态目录 (.cc24h/)

```
.cc24h/
├── state.db        # SQLite 数据库
├── handoffs/       # 交接笔记 (YAML)
├── worklogs/       # 执行日志
├── checkpoints/    # 状态快照
└── worktrees/      # Git worktree 目录
```

## 已知限制

- **需要 Claude CLI**：`claude --version` 必须可用
- **Windows 休眠**：休眠会暂停 daemon，夜间运行请禁用休眠
- **单机**：所有状态本地存储
- **非 Git 项目**：无 worktree 隔离，任务串行执行

## 测试

```bash
node --test tests/core.test.mjs  # 26 个测试
bash scripts/verify.sh           # 完整验证
```
