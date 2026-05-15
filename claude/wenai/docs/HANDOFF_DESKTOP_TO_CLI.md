# Desktop to CLI Handoff

## Current Goal

Keep Wenai stable while converting a large dirty tree into reviewable, verified commits. Continue by functional group. Do not restart discovery from scratch.

## Repo Facts

- Project path: `C:\Users\86136\Desktop\claude\wenai`
- Git root: `C:\Users\86136\Desktop`
- Branch: `codex/wenai-deliverable-groups`
- Scope all Git commands to `claude/wenai`.

## Completed Commits

1. `8bb99fd feat(wenai): stabilize listing factory production rc`
   - Listing Factory core engine and local production RC.
   - Golden projects, deterministic runs, providers, samples, focused tests, and RC docs.

2. `bc8296f feat(wenai): connect listing factory product flow`
   - Listing Factory product routes and landing/pricing integration.
   - Dashboard/report/review/calendar/client shells.
   - Local analytics, report sharing, Kuaizi local API config/push flow.
   - Updated `scripts/verify.ps1`.

## Latest Verification

Run from `C:\Users\86136\Desktop\claude\wenai`:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1
```

Result on 2026-05-15:

- 26 test files passed.
- 276 tests passed.
- TypeScript passed.
- ESLint passed.
- Next build passed.

## Remaining Dirty Tree

Remaining work should be split using `docs/WORKTREE_REVIEW.md`.

High-level remaining groups:

- Docs handoff group: current document updates.
- E2E/package group: `package.json`, `package-lock.json`, `playwright.config.ts`, `e2e/`.
- Admin/billing group: admin pages, billing API mock, alerts/admin ops.
- Broad marketing/content group: cases, about, docs, enterprise, invite, POC pages, copy/data libs.
- Generated/runtime files: logs and `test-results/`; do not stage, delete, or clean without explicit approval.

## Hard Rules

- Never use `git add .`.
- Never use `git reset --hard`.
- Never use `git clean -fd`.
- Never stage logs or `test-results/`.
- Never touch unrelated Desktop projects.
- Never expose or migrate API keys.
- Stage by explicit path only.

## Recommended Next Step

Commit this docs group first. Then inspect the E2E/package group separately and decide whether Playwright should remain part of the deliverable.
