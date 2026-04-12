---
paths:
  - "src/*.mjs"
  - "src/**/*.mjs"
---

# cc24h Core Module Conventions

- ES modules only (import/export, not require)
- Classes with constructor dependency injection
- Methods return plain objects, not class instances
- Database access through `this.db` (sql.js wrapper)
- Errors: throw for fatal, return `{ success: false, message }` for recoverable
- JSON arrays stored as TEXT in SQLite, auto-parsed by db._parseRow()
- Always call `this.db._dirty = true` and `this.db.autoSave()` after writes
