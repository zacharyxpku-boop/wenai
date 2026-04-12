# cc24h-safe

`cc24h-safe` is the stable shared entry for calling 24cc from both Codex and Claude Code without racing on the same project state.

## Why this exists

`cc24h` writes project state into:

- `.cc24h/state.db`
- `.cc24h/locks`
- `.cc24h/sessions`

If two tools hit the same project at the same time, they can step on the same database save cycle or lock lifecycle. `cc24h-safe` serializes access per project and keeps an audit trail.

## What it does

- Uses a per-project mutex at `.cc24h/gateway/mutex`
- Waits for the current caller instead of colliding
- Auto-recovers stale locks by age or dead PID
- Writes per-run logs into `.cc24h/gateway/logs`
- Appends invocation events to `.cc24h/gateway/invocations.jsonl`

## Recommended usage

Always use this wrapper for stateful commands:

```bash
node bin/cc24h-safe.mjs --client codex status -p C:\work\demo
node bin/cc24h-safe.mjs --client codex commander "new idea" -p C:\work\demo
node bin/cc24h-safe.mjs --client claude-code claim -s worker-01 -p C:\work\demo
```

Windows shortcut:

```bat
bin\cc24h-safe.cmd --client codex status -p C:\work\demo
```

## Wrapper options

- `--client <name>`: logical caller label in logs
- `--wait-ms <ms>`: how long to wait for the mutex
- `--poll-ms <ms>`: retry interval while waiting
- `--stale-ms <ms>`: force-recover stale locks after this age
- `--no-lock`: bypass the mutex for read-only experiments

## Team rule

If Codex and Claude Code both need to touch the same project, both should call `cc24h-safe`, not `cc24h` directly.
