# AI Changelog

## 2026-05-15

### Completed

- Committed Group A as `8bb99fd feat(wenai): stabilize listing factory production rc`.
- Committed Group B as `bc8296f feat(wenai): connect listing factory product flow`.
- Updated the repo verification entrypoint to include the Listing Factory focused suite and related lint targets.
- Confirmed full repo verification after Group B.

### Verification

- `npx.cmd tsc --noEmit`
  - Passed.
- Focused Group B ESLint over touched UI/routes/libs
  - Passed.
- `npm.cmd run build`
  - Passed.
- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1`
  - Passed.
  - 26 test files passed.
  - 276 tests passed.
  - TypeScript passed.
  - ESLint passed.
  - Next build passed.

### Residual Risks

- The repo is still local-first Production RC, not a complete SaaS.
- Remaining dirty tree is large and must be split by functional group.
- `package.json`, `package-lock.json`, Playwright/E2E, logs, and `test-results/` remain uncommitted and should not be bundled with product/code/docs commits.
- Some runtime Git maintenance / external `git add -A` processes were observed from the Codex app environment. Current index checks showed no staged pollution.

## 2026-05-12

### Completed

- Brought Wenai Listing Factory to Production RC shape.
- Added golden projects and deterministic local production-chain coverage.
- Added delivery package quality checks.
- Stabilized delivery exports for Markdown, CSV, script, storyboard, asset plan, variant matrix, assembly manifest, SRT, EDL, asset manifest, and project JSON.
- Added Listing Factory RC regression tests and docs.

### Verification

- Listing Factory focused tests passed.
- Full repo verification passed during the later Group B validation on 2026-05-15.
