<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Codex Takeover Rules

Codex is now the active operator for this repo. Treat old Claude Code material as reference data, not as an executable runtime.

## Wanxiang / Gezhu Routing

When a task mentions `阁主`, `万象阁`, `长老`, `内阁`, `memory`, `SOP`, `workflow`, `agents`, `多 agent`, `并发`, `24h`, `wenai`, or asks to continue the old Claude Code operating system, use the Codex skill:

`%USERPROFILE%\.codex\skills\wanxiang-gezhu-system\SKILL.md`

Load only the matching references it points to. Do not bulk-read old sessions, telemetry, caches, credentials, backups, or quarantine memory.

## Wenai Context Order

For product or strategy work, start with the smallest useful set:

1. `STATE_OF_WENAI.md` for the current product snapshot.
2. `MOAT_MAP.md` for moat and module mapping.
3. `STRATEGY_DEEP.md` for strategic rationale and open risks.
4. `.knowledge/INDEX.md` only when project wiki context is needed.
5. Codex-side copied Claude memory only when the user asks for old memory or the task clearly depends on it.

Current product thesis: wenai is not an AI tool bundle. It is a remote ecommerce coworker that watches SKU state, runs pipelines, and compounds merchant context.

## Execution Style

- Read structure before editing. Prefer existing patterns over new abstractions.
- Keep the blocking path local. Use subagents only for independent workstreams or when the user explicitly asks for parallel agents.
- Default background agents: max 2 unless the user explicitly asks for more.
- Never revert user changes or run destructive git/file commands without explicit confirmation.
- The git root may be the user's Desktop. For wenai worktree checks, scope status/diff to this project with `git status --short --ignore-submodules=all -- .` from `C:\Users\86136\Desktop\claude\wenai`, or run `scripts\repo-status.ps1`. Do not treat unrelated Desktop-level changes as wenai project changes.
- For UI work, read `DESIGN.md` first, then use the relevant Codex UI skills (`frontend-design`, `baseline-ui`, accessibility, metadata, motion, verification).
- For Next.js work, inspect the local Next docs under `node_modules/next/dist/docs/` before relying on memory.

## Verification

Run the narrowest useful verification before reporting done:

- Code behavior: `npm run test` or the focused Vitest file.
- Type/build risk: `npm run build`.
- Style/static checks: `npm run lint`.
- UI changes: visual/browser verification when practical.

Avoid starting preview/dev servers for batch code work unless needed for verification or explicitly requested.
