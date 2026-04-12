# cc24h Runtime Reference

## Commands

| Command | Description |
|---------|-------------|
| `node bin/cc24h.mjs tui` | Launch terminal dashboard |
| `node bin/cc24h.mjs daemon` | Start autonomous daemon |
| `node bin/cc24h.mjs enqueue <file>` | Import tasks from YAML |
| `node bin/cc24h.mjs resume` | Resume failed/paused sessions |
| `node bin/cc24h.mjs sync` | Synchronize state |
| `node bin/cc24h.mjs doctor` | Health check |
| `node bin/cc24h.mjs review` | Morning review summary |
| `node bin/cc24h.mjs status` | Quick status |

## Daemon Options

```
--queue <file>       Import task queue before starting
--max-parallel <n>   Max concurrent tasks (default: 2)
--dry-run            Simulate without executing
--night              Night mode (conservative settings)
-p, --project <dir>  Project root (default: current dir)
```

## Task YAML Format

```yaml
tasks:
  - id: unique-task-id
    title: Human-readable title
    prompt: |
      Detailed instructions for Claude...
    priority: 1-10        # 1 = highest
    agent_role: implementer  # coordinator|planner|implementer|reviewer|tester|merge-manager
    depends_on:            # Tasks that must complete first
      - other-task-id
    tags: [bugfix, api]
    max_retries: 3
```

## Task Lifecycle

```
todo → running → review → done
  │       │
  │       └──→ failed → quarantined
  │       │        │
  │       │        └──→ todo (retry)
  │       │
  └──→ blocked (dependency/lock)
```

## State Directory (.cc24h/)

```
.cc24h/
├── state.db          # SQLite database
├── handoffs/         # YAML handoff notes
├── worklogs/         # Execution logs
├── checkpoints/      # State snapshots
├── locks/            # (managed in DB)
├── sessions/         # (managed in DB)
└── worktrees/        # Git worktree directories
```

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| n | New task |
| r | Resume session |
| s | Sync state |
| p | Pause/resume |
| a | Add agent |
| h | View handoffs |
| l | View locks |
| g | Git/worktree status |
| v | Verify/events |
| m | Merge candidates |
| d | Start daemon |
| ? | Help |
| Tab | Switch panel |
| q | Quit |
