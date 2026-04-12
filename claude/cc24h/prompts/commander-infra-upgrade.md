# Commander Infra Upgrade — Hooks + Compaction + Resume

## Context
- Project: cc24h (C:\Users\86136\Desktop\cc24h)
- Stage: v2 infrastructure upgrade
- Prior work: Commander Core, Session Bridge, Skill Governance all operational
- This prompt covers GAPs 1-3 from docs/commander-gap-analysis.md

## Goal
Add three hook scripts and upgrade worker spawn configuration.

## Task 1: PreToolUse Risk Check Hook

Create `.cc24h/hooks/risk-check.mjs`:
```js
// Reads tool_input from stdin (JSON with file_path)
// Checks file_path against .cc24h/risk-policy.yaml high_risk_zones and directory_rules
// Exit 0 = allow, Exit 2 + stderr message = block
```

Create or merge into `.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "node .cc24h/hooks/risk-check.mjs"
      }]
    }]
  }
}
```

## Task 2: Stop Verification Hook

Create `.cc24h/hooks/verify-completion.mjs`:
```js
// Runs git diff --name-only to see what changed
// Outputs JSON: { files_changed: [...], has_changes: bool }
// Always exit 0 (informational, not blocking)
```

Add to `.claude/settings.json` hooks.Stop.

## Task 3: PostCompact Context Re-injection

Create `.cc24h/hooks/postcompact-inject.mjs`:
```js
// Reads .cc24h/commander/context-inject.md
// Outputs content to stdout (injected into Claude context)
// If file doesn't exist, exit 0 silently
```

Add to `.claude/settings.json` hooks.PostCompact.

## Task 4: Worker Spawn Upgrade

In `src/autonomous.mjs` and `src/orchestrator.mjs`, modify worker spawn:
- Add `--name cc24h-${taskId}` to spawn args
- Add `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` to spawn env
- On retry (task.retry_count > 0), use `--resume cc24h-${taskId}` instead of `-p`
- Store session name in task record
- Fallback: if resume fails (non-zero exit), retry with fresh `-p`

## Constraints
- Do NOT modify existing cc24h CLI commands
- Do NOT modify database schema (session name goes in existing `sessions.backend_session_ref`)
- Do NOT install new dependencies
- Merge into existing `.claude/settings.json` if it exists, don't overwrite

## Verification
1. `node .cc24h/hooks/risk-check.mjs` with stdin `{"tool_input":{"file_path":"src/auth/login.ts"}}` → exit 2
2. `node .cc24h/hooks/risk-check.mjs` with stdin `{"tool_input":{"file_path":"tests/foo.test.ts"}}` → exit 0
3. `node .cc24h/hooks/verify-completion.mjs` → outputs JSON with files_changed
4. Worker spawn includes `--name` and compaction env var

## Output
When done:
- List all files created/modified
- Confirm hooks fire correctly
- Confirm worker spawn args updated
