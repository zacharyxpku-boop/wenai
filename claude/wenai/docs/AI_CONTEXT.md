# AI Context

Last updated: 2026-05-15

## Purpose

`wenai` is a remote ecommerce coworker for cross-border merchants. The product thesis is not an AI tool bundle. It watches SKU state, runs listing/material pipelines, and compounds merchant context.

## Current Focus

- Stabilize the engineering system before adding new features.
- Preserve the Listing Factory Production RC work already committed.
- Treat the current deliverable as local-first Production RC, not a complete SaaS.
- Favor one clear SKU-to-delivery-package demo path over more tools or pages.

## Current Committed Milestones

- `8bb99fd feat(wenai): stabilize listing factory production rc`
  - Core Listing Factory engine, providers, samples, golden projects, tests, and RC docs.
- `bc8296f feat(wenai): connect listing factory product flow`
  - Listing Factory product routes, landing/pricing integration, dashboard/report/review/calendar/client shells, local analytics, Kuaizi local integration, and updated verification entrypoint.

## Current P0

- Keep cleaning the dirty tree by explicit functional groups.
- Do not process unrelated Desktop git-root changes.
- Do not stage package/E2E/log/generated artifacts with product or docs commits.
- Keep verification tied to the repo entrypoint before reporting completion.

## Repo Boundaries

- Project path: `C:\Users\86136\Desktop\claude\wenai`
- Git root: `C:\Users\86136\Desktop`
- Current branch: `codex/wenai-deliverable-groups`
- Because the git root is Desktop, all git commands must be scoped to `claude/wenai`.

Use scoped git commands:

```powershell
git -C C:\Users\86136\Desktop status --short --ignore-submodules=all -- claude/wenai
git -C C:\Users\86136\Desktop diff -- claude/wenai
```

## Read Order

For most tasks, read only:

1. `AGENTS.md`
2. `docs/AI_CONTEXT.md`
3. `docs/TODO.md`
4. `docs/CHANGELOG_AI.md`
5. `docs/WORKTREE_REVIEW.md`
6. Files found with `rg` for the current task

For product or strategy tasks, read only the relevant section of:

- `STATE_OF_WENAI.md`
- `MOAT_MAP.md`
- `STRATEGY_DEEP.md`
- `DESIGN.md`

Do not repeatedly load long documents for routine engineering work.

## Search First

Before opening large files, locate relevant code with targeted search:

```powershell
rg "keyword" -n --glob "!node_modules" --glob "!.next" --glob "!.git"
```

Prefer narrow snippets around matches over loading whole files.

## Verification

Use the repo entrypoint:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

For small changes, run focused Vitest, lint, or type checks first. Run full verification when the change is ready.

## Design Rule

For UI work, read `DESIGN.md` first. Preserve the industrial editorial dark system: dense B2B SaaS, restrained amber accent, no generic AI gradients, no rounded-3xl/shadow-heavy cards.

## Cost Rules

- Do not scan or diff the whole Desktop git root.
- Do not reread long strategy docs during routine coding.
- Keep work in small batches.
- Summarize progress into docs instead of relying on chat history.
- Prefer focused tests before full verification.

## Hard Stops

- No `git reset --hard`.
- No `git clean -fd`.
- No recursive delete commands.
- No dependency install unless the user asks.
- No API key printing, setting, or migration.
