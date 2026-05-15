# TODO

## Done

- [x] Commit Group A: Listing Factory Production RC core engine, providers, samples, tests, and RC docs.
- [x] Commit Group B: Listing Factory product flow, landing/pricing integration, dashboard/report/review/calendar/client shells, local analytics, and Kuaizi local integration.
- [x] Run full repo verification after Group B: 26 test files / 276 tests, TypeScript, ESLint, and Next build passed.
- [x] Reduce Desktop Git object bloat from the large historical pack cleanup.

## Next

- P0: Commit this docs handoff group only, with no code or generated files.
- P0: Decide the next code group from `docs/WORKTREE_REVIEW.md`.
- P0: Keep all staging explicit. Never use `git add .` or broad Desktop-level staging.
- P1: Review E2E/package changes separately before deciding whether Playwright should stay.
- P1: Review admin/billing changes separately and confirm mock-only wording before commit.
- P1: Review broad marketing/content rewrites by page family instead of one large commit.
- P2: Clean or ignore runtime logs and `test-results/` only after explicit user approval. Do not delete automatically.

## Standing Constraints

- Git root is `C:\Users\86136\Desktop`; project path is `C:\Users\86136\Desktop\claude\wenai`.
- Scope Git commands to `claude/wenai`.
- Do not touch other active projects.
- Do not modify global Codex config.
- Do not expose or migrate API keys.
