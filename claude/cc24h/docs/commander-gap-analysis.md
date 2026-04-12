# Commander Gap Analysis

## What We Do Well

1. **Centralized state**: SQLite + YAML dual-write. All sessions hit one source of truth. Better than relying on prompt history.
2. **Session Bridge**: Any session registers → claims task → gets prompt + worktree → submits result. Clean API.
3. **Skill Governance**: Lifecycle (proposed→approved), risk levels, audit log, policy checks. More mature than most projects.
4. **Worktree isolation**: Automatic branch + worktree creation on task claim. File locking.
5. **Handoff system**: Structured handoff notes for session relay. Better than ad-hoc CLAUDE.md notes.
6. **Autonomous loop**: Commander plans → bridge dispatches → workers execute → results collected.
7. **Multi-phase planning**: idea → product definition → architecture → design → task YAML. Structured pipeline.

## Critical Gaps (ordered by impact)

### GAP 1: No Hooks — Policy is Prompt-Only (CRITICAL)
**Impact**: Risk policy, auto-formatting, auto-verification all depend on Claude "remembering" to follow rules. Hooks make this deterministic.
**Fix**: Add `.claude/settings.json` hooks for:
- `PreToolUse`: Block writes to high-risk zones
- `Stop`: Auto-verify task completion
- `PostCompact`: Re-inject commander state
- `PostToolUse(Edit|Write)`: Auto-format

### GAP 2: No Session Resume — Workers Start Fresh (HIGH)
**Impact**: If a worker fails mid-task, we restart from scratch. On long tasks, this wastes all progress.
**Fix**:
- Use `--name cc24h-<task-id>` when spawning workers
- Capture session name from output
- On retry, use `--resume cc24h-<task-id>` instead of fresh `-p`

### GAP 3: No Compaction Config — Long Tasks May OOM (HIGH)
**Impact**: Workers on complex tasks hit context limit and fail instead of compacting.
**Fix**: Set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` in worker environment

### GAP 4: Skills Are Registry-Only — No Executable Content (HIGH)
**Impact**: We track 7 skills in DB but they don't exist as `.claude/skills/SKILL.md` files that Claude Code can invoke.
**Fix**: Create actual SKILL.md files for each registered skill.

### GAP 5: No Conditional Rules — All Context Always Loaded (MEDIUM)
**Impact**: Every worker gets full project context even if only touching one module.
**Fix**: Add `.claude/rules/` with path-conditional rules for different code areas.

### GAP 6: Workers Don't Report Structured Results (MEDIUM)
**Impact**: Worker output is raw text. We parse success/failure from exit code only. No structured data about what changed, what tests passed, what issues remain.
**Fix**: Add a `Stop` hook that forces workers to output JSON summary before completing.

### GAP 7: No PostCompact Context Re-injection (MEDIUM)
**Impact**: Long-running workers lose commander context after compaction.
**Fix**: `PostCompact` hook that reads `.cc24h/commander/context-inject.md` and injects it.

### GAP 8: Commander Prompts Don't Use Dynamic Injection (LOW)
**Impact**: Commander phases read docs manually. Could use `!`\`command\`` syntax for live data.
**Fix**: Convert commander phase prompts to use backtick injection for git status, file lists, etc.

### GAP 9: No Agent Definitions as .claude/agents/ Files (LOW)
**Impact**: Our agent roles exist in code but not as files Claude Code can natively discover.
**Fix**: Create `.claude/agents/` files with proper frontmatter for each role.

### GAP 10: No MCP Integration Strategy (LOW for now)
**Impact**: External tools (GitHub, Jira, etc.) require manual setup per session.
**Fix**: Document which MCPs are useful; add to agent frontmatter `mcpServers`.

## Priority Matrix

| Gap | Impact | Effort | Do Now? |
|-----|--------|--------|---------|
| GAP 1: Hooks | Critical | Low | YES |
| GAP 2: Session Resume | High | Low | YES |
| GAP 3: Compaction Config | High | Trivial | YES |
| GAP 4: Real Skill Files | High | Medium | YES |
| GAP 5: Conditional Rules | Medium | Low | Next |
| GAP 6: Structured Results | Medium | Medium | Next |
| GAP 7: PostCompact Inject | Medium | Low | Next |
| GAP 8: Dynamic Injection | Low | Low | Later |
| GAP 9: Agent Files | Low | Low | Later |
| GAP 10: MCP Strategy | Low | Low | Later |
