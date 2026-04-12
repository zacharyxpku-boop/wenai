# Commander v2 Architecture

## Core Change: From "Code-Only Policy" to "Hooks + Skills + State"

v1 enforced everything through prompts and code. v2 uses Claude Code's native mechanisms:

```
┌─────────────────────────────────────────────────────────┐
│ .claude/settings.json (hooks)                           │
│  PreToolUse  → risk policy enforcement (deterministic)  │
│  Stop        → auto-verify completion                   │
│  PostCompact → re-inject commander context              │
│  PostToolUse → auto-format edited files                 │
└─────────────────────────────────────────────────────────┘
         ↓ enforces
┌─────────────────────────────────────────────────────────┐
│ Commander Core (unchanged)                              │
│  SQLite state · Session Bridge · Task Queue · Locks     │
│  Handoffs · Decisions · Checkpoints · Skill Registry    │
└─────────────────────────────────────────────────────────┘
         ↓ dispatches to
┌─────────────────────────────────────────────────────────┐
│ Worker Sessions                                         │
│  claude --dangerously-skip-permissions                  │
│         --name cc24h-<task-id>                          │
│         --max-turns 80                                  │
│  env: CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50                │
│  On retry: claude --resume cc24h-<task-id>              │
└─────────────────────────────────────────────────────────┘
         ↓ uses
┌─────────────────────────────────────────────────────────┐
│ .claude/skills/   → executable skill content            │
│ .claude/agents/   → role definitions with frontmatter   │
│ .claude/rules/    → path-conditional conventions        │
│ CLAUDE.md         → project guide (<200 lines)          │
└─────────────────────────────────────────────────────────┘
```

## What Changes

### 1. Hooks Layer (NEW)

`.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "node .cc24h/hooks/risk-check.mjs"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node .cc24h/hooks/verify-completion.mjs"
      }]
    }],
    "PostCompact": [{
      "hooks": [{
        "type": "command",
        "command": "cat .cc24h/commander/context-inject.md"
      }]
    }]
  }
}
```

### 2. Worker Spawn (ENHANCED)

Before:
```js
spawn("claude", ["--dangerously-skip-permissions", "--print", "-p", prompt])
```

After:
```js
spawn("claude", [
  "--dangerously-skip-permissions",
  "--name", `cc24h-${taskId}`,
  "--max-turns", "80",
  "--print", "-p", prompt
], {
  env: { ...process.env, CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "50" }
})
```

On retry:
```js
spawn("claude", ["--resume", `cc24h-${taskId}`, "--print"])
```

### 3. Skills as Real Files (NEW)

Convert skill registry entries to `.claude/skills/<name>/SKILL.md`:
```
.claude/skills/
├── codebase-understand/SKILL.md
├── task-decomposition/SKILL.md
├── handoff-generation/SKILL.md
├── review-checklist/SKILL.md
├── page-copy-review/SKILL.md
├── test-generation/SKILL.md
└── risk-scan/SKILL.md
```

Each SKILL.md has frontmatter + instructions that Claude Code can natively invoke.

### 4. Agent Definitions (NEW)

`.claude/agents/` with proper frontmatter:
```yaml
---
name: builder
description: Execute coding tasks assigned by Commander
tools: [Read, Edit, Write, Bash, Glob, Grep]
maxTurns: 80
---
```

### 5. Conditional Rules (NEW)

`.claude/rules/api.md`:
```yaml
---
paths: ["src/api/**"]
---
# API conventions: use Zod for validation, return standard error format...
```

### What Stays the Same

- Commander Core (SQLite, bridge, task queue, locks, handoffs)
- Skill Governance (registry, lifecycle, risk levels, audit)
- Autonomous loop (plan → dispatch → execute → review)
- TUI dashboard
- CLI interface (all cc24h commands)
- YAML task format
- Worktree isolation strategy

### What's Deferred

- Agent SDK backend (wait for Windows npm availability)
- Agent Teams integration (experimental, our bridge is more stable)
- MCP server integration (per-project, not system-level)
- Dynamic prompt injection via backtick commands
