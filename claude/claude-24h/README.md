# Claude Code 24H 自动编码配置

## 目录结构

```
claude-24h/
├── scripts/           # 运行脚本
│   ├── run-task.sh        # 方案1: 单次任务执行脚本
│   ├── run-daemon.sh      # 方案2: 持续守护进程脚本
│   ├── run-multi.sh       # 方案3: 多agent并行脚本
│   └── setup-scheduler.ps1 # Windows定时任务配置
├── agent-sdk/         # Agent SDK 双agent架构
│   ├── package.json
│   ├── orchestrator.mjs   # 主编排器
│   └── tasks.json         # 任务配置
├── tasks/             # 任务定义文件
│   └── example-task.md
├── logs/              # 运行日志
└── README.md
```

## 三种方案

### 方案1: --dangerously-skip-permissions 无人值守模式
最简单直接，适合单一任务长时间运行。
```bash
bash scripts/run-task.sh "你的任务描述" /path/to/project
```

### 方案2: Agent SDK 双agent架构
适合复杂项目开发，支持跨session持续构建。
```bash
cd agent-sdk && npm install && node orchestrator.mjs
```

### 方案3: 定时任务 + 多agent并行
适合多仓库维护、定期自动化任务。
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-scheduler.ps1
```

## 安全注意事项
- **没有 Docker 时**: 确保只在你信任的项目目录中运行
- **API 费用**: 长时间运行会消耗大量 token，建议设置 `--max-turns` 限制
- **备份**: 运行前确保代码已 commit，方便回滚
- **网络隔离**: 如果可能，断开不必要的网络连接
