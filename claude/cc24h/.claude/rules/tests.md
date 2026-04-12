---
paths:
  - "tests/**"
---

# Test Conventions

- Use Node.js built-in test runner: `import { describe, it } from 'node:test'`
- Assertions: `import assert from 'node:assert/strict'`
- Test files: `tests/*.test.mjs`
- Each test should be independent (no shared mutable state)
- Mock external services, not internal modules
- Run: `node --test tests/`
