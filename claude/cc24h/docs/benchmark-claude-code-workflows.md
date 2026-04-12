# Benchmark: Claude Code Mature Patterns vs cc24h

## 1. Multi-Agent Patterns (Official)

### What Claude Code actually offers
- **Built-in agent types**: Explore (fast/read-only), Plan (research), General-purpose (all tools)
- **Agent Teams** (experimental): true parallel multi-agent with shared task list + inter-agent messaging
- **Subagent isolation**: each subagent gets its own context window; results summarized back to parent
- **Subagent worktree**: `isolation: "worktree"` gives each agent its own git worktree automatically
- **No nesting**: subagents cannot spawn other subagents

### Why it works
- Context isolation prevents "prompt pollution" between tasks
- Worktree isolation prevents file conflicts
- Summarization back to parent keeps coordinator context lean

### What's relevant to us
- Our commander-core → session-bridge → worker pattern mirrors the coordinator/subagent split
- We should use **native worktree isolation** (`isolation: "worktree"`) instead of manual git worktree management
- Agent Teams' shared task list + mailbox is exactly what our bridge does via SQLite

### What's NOT relevant now
- Agent Teams is experimental and requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- We already have our own task coordination; adopting Teams would mean replacing our bridge

---

## 2. Long-Running Autonomous Workflows

### Official patterns
- `--dangerously-skip-permissions` for fully autonomous operation
- `--max-turns` to limit agent scope
- Auto-compaction at 95% context (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
- Session resume via `--resume <session-name>` or `--resume <session-id>`
- Named sessions (`--name`) for later reference

### Why it works
- Compaction prevents context overflow on long tasks
- Named sessions enable resumability
- max-turns prevents runaway loops

### What's relevant to us
- We should set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` in our worker spawn to compact earlier
- We should use `--name` when spawning workers for resume support
- We should capture session IDs from worker output for true resume

### What we're missing
- Our workers don't capture Claude session IDs → can't resume mid-task
- Our workers don't set compaction threshold → may fail on long tasks
- We don't use `--resume` for recovery — we start fresh

---

## 3. Persistent Memory & Cross-Session Continuity

### Official patterns
- **CLAUDE.md**: <200 lines, project instructions, loaded every session
- **Auto-memory**: `~/.claude/projects/<project>/memory/MEMORY.md` + topic files
- **`.claude/rules/`**: conditional loading by file path pattern
- **Skills**: on-demand knowledge injection
- **PostCompact hook**: re-inject critical context after compaction

### Why it works
- Layered context: always-loaded (CLAUDE.md) + conditional (rules) + on-demand (skills)
- Keeps base prompt lean while making deep knowledge available

### What's relevant to us
- Our docs/ system (architecture.md, progress.md, etc.) maps to CLAUDE.md + rules
- We should add `.claude/rules/` files for project-specific conventions
- We should add a PostCompact hook that re-injects commander state

### What we already do well
- Our handoff + decisions + session registry is richer than auto-memory
- Our external state (SQLite + YAML) is exactly the "externalize, don't stuff prompt" pattern

---

## 4. Skills System

### Official patterns
- Skills = Markdown files with YAML frontmatter in `.claude/skills/`
- Can be user-invocable (`/skill-name`) or auto-invoked by Claude
- Support `context: fork` to run in subagent
- Support dynamic context injection via backtick commands (`!`\`git diff\``)
- Support pre-loading into subagents via `skills:` frontmatter

### Why it works
- Decouples knowledge from session context
- On-demand loading keeps context lean
- Fork context prevents skill execution from polluting main session

### What's relevant to us
- Our skill governance system manages metadata/lifecycle, but **skills themselves should be actual `.claude/skills/` files** that Claude Code can natively invoke
- We should convert our 7 registered skills into real SKILL.md files
- `context: fork` is perfect for our review and risk-scan skills

### Critical gap
- We have a skill registry but no actual skill files that Claude Code can invoke
- The registry tracks metadata; we need the actual executable skill content

---

## 5. Hooks System

### Official patterns
- 23 hook events covering full lifecycle
- Types: command, prompt, agent, http
- `PreToolUse` can block dangerous operations (exit code 2)
- `PostToolUse` can auto-format code
- `Stop` hooks can verify work before completing
- `SessionStart` can inject context

### Why it works
- Deterministic enforcement (not relying on Claude to "remember" rules)
- Auto-formatting, auto-testing, auto-verification
- Policy enforcement at system level, not prompt level

### What's relevant to us
- We should use `PreToolUse` hooks for risk policy enforcement instead of checking in code
- We should use `Stop` hooks to auto-verify task completion
- We should use `PostCompact` to re-inject commander state
- We should use `SessionStart` to inject the commander CLAUDE.md

### What we're completely missing
- We have zero hooks. All policy enforcement is in code or prompts.
- This is our biggest architectural gap.

---

## 6. Agent SDK

### Official patterns
- Python/TypeScript library wrapping Claude Code
- `query()` with streaming messages
- Session capture and resume
- Custom agent definitions
- MCP server injection
- Hook injection at runtime

### Why it works
- Programmatic control over Claude Code sessions
- Can build real orchestration with error handling, retry, state management
- Session resume enables true continuity

### What's relevant to us
- Our `autonomous.mjs` spawns `claude` CLI as child process — this is the low-level version of what Agent SDK provides
- If Agent SDK becomes available, we should swap our backend to use it for:
  - Session resume (not possible with CLI `--print` mode)
  - Streaming message handling (get structured output, not just text)
  - Runtime hook injection

### When to upgrade
- When Agent SDK npm package is installable on Windows
- When we need session resume within a task (not just between tasks)
- Current CLI approach works for MVP

---

## 7. Summary: Pattern Maturity Map

| Pattern | Official Maturity | cc24h Status | Gap |
|---------|------------------|--------------|-----|
| Coordinator → worker | Agent Teams (experimental) | ✓ Bridge + autonomous loop | Small — ours is more stable |
| Worktree isolation | Native `isolation: "worktree"` | ✓ Manual worktree mgmt | Medium — should use native |
| Context compaction | Auto at 95%, configurable | ✗ Not configured | High — workers may fail on long tasks |
| Session resume | `--resume` by name/ID | ✗ Fresh start on retry | High — lose all mid-task progress |
| Hooks for policy | 23 events, 4 types | ✗ Zero hooks | Critical — biggest gap |
| Skills as files | `.claude/skills/SKILL.md` | ✗ Registry only, no files | High — registry without content |
| Conditional rules | `.claude/rules/` with paths | ✗ None | Medium — helps context efficiency |
| Auto-memory | Project-level memory files | ✓ Docs + handoffs + decisions | Small — ours is richer |
| PostCompact re-inject | Hook-based | ✗ None | Medium — context lost on compact |
| Agent SDK | Python/TypeScript | ✗ CLI only | Low now — CLI works for MVP |
