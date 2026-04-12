---
name: test-generation
description: Generate unit/integration tests for changed files and verify they pass. Use after implementing a feature or fix.
user-invocable: true
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<file-or-module>"
---

# Test Generation

Generate tests for `$ARGUMENTS` (or recently changed files).

## Steps

1. Identify the target file(s) and their exports
2. Read the code to understand behavior
3. Identify the project's test framework (jest, vitest, mocha, node:test, pytest, etc.)
4. Follow existing test patterns in the project
5. Write tests covering:
   - Happy path for each public function
   - Edge cases (empty input, null, boundary values)
   - Error conditions
6. Run the tests to verify they pass
7. Report results

## Rules
- Match existing test file naming: `*.test.ts`, `*.spec.js`, `test_*.py`, etc.
- Match existing test patterns and assertions
- Don't mock what you can call directly
- Don't test private implementation details
- Each test should have a clear, descriptive name

## Output

After writing tests, run them and report:

```
TESTS: pass (or fail)
FILES_CHANGED: tests/path/to/test.ts
```

If tests fail, fix them before reporting.
