# 24cc Launchers

统一入口，避免在桌面散落脚本，也不用每次手打完整参数。

## Codex 调 24cc

```bat
C:\Users\86136\Desktop\24cc-launchers\24cc-codex.cmd status -p C:\你的项目
C:\Users\86136\Desktop\24cc-launchers\24cc-codex.cmd commander "你的任务" -p C:\你的项目
```

特点：

- 自动走 `cc24h-safe`
- 自动打上 `--client codex`
- 自动切到 `--backend codex`
- 参数顺序由 Node launcher 处理，不需要自己拼

## Claude Code 调 24cc

```bat
C:\Users\86136\Desktop\24cc-launchers\24cc-claude.cmd status -p C:\你的项目
C:\Users\86136\Desktop\24cc-launchers\24cc-claude.cmd commander "你的任务" -p C:\你的项目
```

特点：

- 自动走 `cc24h-safe`
- 自动打上 `--client claude-code`
- 默认沿用 24cc 原本的 Claude backend 行为

## 说明

两边都经过同一个安全入口，所以同一项目会串行进入 Commander，不会直接撞 `.cc24h/state.db`、`sessions`、`locks`。
