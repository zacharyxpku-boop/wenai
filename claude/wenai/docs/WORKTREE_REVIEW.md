# Wenai Worktree Review

Last updated: 2026-05-15

## Scope

This review covers only:

```text
C:\Users\86136\Desktop\claude\wenai
```

Git root is:

```text
C:\Users\86136\Desktop
```

All Git commands for this project must stay scoped to `claude/wenai`.

## Current State

- Branch: `codex/wenai-deliverable-groups`
- Group A committed: `8bb99fd feat(wenai): stabilize listing factory production rc`
- Group B committed: `bc8296f feat(wenai): connect listing factory product flow`
- Current index should remain empty between groups.
- Remaining dirty tree is still large.
- Do not run `git add .`, `git reset --hard`, `git clean -fd`, or broad Desktop-level Git commands.

## Completed Groups

### Group A: Listing Factory Production RC

Committed as:

```text
8bb99fd feat(wenai): stabilize listing factory production rc
```

Included:

- `src/lib/listing-factory-demo.ts`
- `src/lib/listing-factory-engine.ts`
- `src/lib/listing-factory-golden-projects.ts`
- `src/lib/listing-factory-providers.ts`
- `src/lib/listing-factory-samples.ts`
- Listing Factory focused test files
- Listing Factory RC docs
- `vitest.config.ts`

### Group B: Listing Factory Product Flow

Committed as:

```text
bc8296f feat(wenai): connect listing factory product flow
```

Included:

- `scripts/verify.ps1`
- Listing Factory app routes: `/factory`, `/briefs`, `/insights`, `/review`, `/calendar`, `/clients`
- Landing/pricing/new-listing/product-image integration
- Dashboard/report/share/local analytics surfaces
- Local Kuaizi config and push flow

Full verification passed after this commit:

- 26 test files passed.
- 276 tests passed.
- TypeScript passed.
- ESLint passed.
- Next build passed.

## Remaining Candidate Groups

### Group C: Docs Handoff

Purpose: keep future Codex/CLI sessions from rediscovering current state.

Candidate files:

```text
claude/wenai/docs/AI_CONTEXT.md
claude/wenai/docs/TODO.md
claude/wenai/docs/CHANGELOG_AI.md
claude/wenai/docs/HANDOFF_DESKTOP_TO_CLI.md
claude/wenai/docs/WORKTREE_REVIEW.md
```

Suggested commit:

```text
docs(wenai): update handoff after grouped commits
```

Verification:

- `git diff --cached --check`
- No build required for docs-only changes.

### Group D: E2E Setup

Purpose: Playwright browser coverage.

Candidate files:

```text
claude/wenai/playwright.config.ts
claude/wenai/e2e/
claude/wenai/package.json
claude/wenai/package-lock.json
```

Do not stage runtime logs or generated test output:

```text
claude/wenai/devserver-3001.log
claude/wenai/e2e-devserver.err.log
claude/wenai/e2e-devserver.log
claude/wenai/start-3002.log
claude/wenai/start-rc-3000.err.log
claude/wenai/start-rc-3000.log
claude/wenai/start-rc-freeze-3000.err.log
claude/wenai/start-rc-freeze-3000.log
claude/wenai/test-results/
```

Review before staging:

- Confirm Playwright dependencies are intentional.
- Confirm tests do not require paid APIs, real credentials, or a long-running shared dev server.

Suggested commit:

```text
test(wenai): add playwright journey coverage
```

### Group E: Admin, Billing, and Operational Surfaces

Purpose: admin and operations expansion.

Candidate files:

```text
claude/wenai/src/app/admin/cache/page.tsx
claude/wenai/src/app/admin/feedback/page.tsx
claude/wenai/src/app/admin/inquiries/page.tsx
claude/wenai/src/app/admin/invites/page.tsx
claude/wenai/src/app/admin/page.tsx
claude/wenai/src/app/admin/payments/page.tsx
claude/wenai/src/app/admin/FounderAnalyticsClient.tsx
claude/wenai/src/app/api/admin/alerts/route.ts
claude/wenai/src/app/api/billing/
```

Review before staging:

- Check whether billing is mock-only before naming it billing support.
- Keep admin copy honest. Do not imply real payments or live back-office automation unless present.

Suggested commit:

```text
feat(wenai): add admin and ops mock surfaces
```

### Group F: Broad Marketing and Content Rewrites

Purpose: marketing copy, cases, product pages, support pages.

Candidate files include:

```text
claude/wenai/src/app/about/page.tsx
claude/wenai/src/app/cases/[slug]/page.tsx
claude/wenai/src/app/cases/page.tsx
claude/wenai/src/app/changelog/page.tsx
claude/wenai/src/app/demo/page.tsx
claude/wenai/src/app/docs/page.tsx
claude/wenai/src/app/enterprise/page.tsx
claude/wenai/src/app/inquire/page.tsx
claude/wenai/src/app/invite/page.tsx
claude/wenai/src/app/legal/dpa/page.tsx
claude/wenai/src/app/login/page.tsx
claude/wenai/src/app/modules/ocr-translate/page.tsx
claude/wenai/src/app/poc/page.tsx
claude/wenai/src/app/poc/report/page.tsx
claude/wenai/src/app/product/video/page.tsx
claude/wenai/src/app/roadmap/page.tsx
claude/wenai/src/app/status/page.tsx
claude/wenai/src/app/tools/page.tsx
claude/wenai/src/components/CaseLibraryExplorer.tsx
claude/wenai/src/components/ContentMarketingPackWorkspace.tsx
claude/wenai/src/components/FiveMinutePocOnboarding.tsx
claude/wenai/src/components/OnboardingTour.tsx
claude/wenai/src/components/PocReportGenerator.tsx
claude/wenai/src/components/SharePageActions.tsx
claude/wenai/src/components/StandardPackWorkspace.tsx
claude/wenai/src/components/VideoWorkspace.tsx
claude/wenai/src/i18n/zh.ts
claude/wenai/src/lib/case-library.ts
claude/wenai/src/lib/case-study-details.ts
claude/wenai/src/lib/content-marketing-pack.ts
claude/wenai/src/lib/poc-case-studies.ts
```

Review before staging:

- Split by page family or product surface.
- Validate copy and routing before committing.
- Do not bundle with E2E/package or admin/billing work.

## Cleanup Rules

- Never use `git add .`.
- Never stage logs or `test-results/`.
- Stage by explicit file path.
- Commit one functional group at a time.
- If a file belongs to multiple groups, inspect its diff before staging.
