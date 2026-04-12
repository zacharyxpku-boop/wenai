# cc24h Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│                  TUI (blessed)                   │
│  [Status] [Tasks] [Sessions] [Handoffs] [Logs]  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              CLI Entry (commander)                │
│   tui | daemon | enqueue | resume | sync | ...   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Orchestrator                         │
│  Task dispatch │ Parallel control │ Recovery      │
│  Watchdog      │ Checkpoint       │ Handoff       │
└──┬─────────┬───┴──────────┬───────┴──────────┬──┘
   │         │              │                  │
┌──▼──┐ ┌───▼───┐ ┌───────▼────────┐ ┌───────▼──┐
│Task │ │Session│ │   Worktree     │ │  Lock    │
│Queue│ │Manager│ │   Manager      │ │  Manager │
└──┬──┘ └───┬───┘ └───────┬────────┘ └──────────┘
   │        │             │
┌──▼────────▼─────────────▼───────────────────────┐
│           SQLite Database (sql.js)               │
│  tasks | sessions | handoffs | checkpoints |     │
│  locks | events                                  │
└─────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Backend Abstraction                    │
│  ┌──────────────┐  ┌──────────────────┐         │
│  │  CLI Backend  │  │   SDK Backend    │         │
│  │ (claude CLI)  │  │ (Agent SDK)      │         │
│  └──────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────┘
```

## Data Flow

1. Tasks enter via YAML import or TUI input
2. Orchestrator picks tasks respecting priority + dependencies
3. For each task: create worktree -> acquire locks -> create session -> execute
4. Backend runs Claude CLI/SDK with the task prompt
5. On completion: checkpoint -> handoff note -> release locks -> mark done
6. On failure: retry with backoff -> quarantine after max retries

## Parallel Isolation

- Each task gets its own git worktree + branch
- File locks prevent concurrent writes to same paths
- Impact analysis checks file overlap before parallel dispatch
- Merge manager handles branch convergence

## State Persistence

All state in `.cc24h/state.db` (SQLite):
- Survives process restart
- Human-readable exports in `.cc24h/handoffs/` and `.cc24h/checkpoints/`
- WAL mode for concurrent read safety

## Technology

- **Runtime**: Node.js 20+
- **TUI**: blessed (curses-like terminal UI)
- **Database**: sql.js (pure JS SQLite, no native deps)
- **CLI**: commander
- **Config**: js-yaml
- **Backend**: Claude CLI (primary), Agent SDK (optional)
