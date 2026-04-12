/**
 * cc24h - File/Directory Lock Manager
 * Prevents concurrent modification conflicts between parallel agents.
 * Uses UNIQUE constraint on path for atomic lock acquisition.
 */

export class LockManager {
  constructor(db) {
    this.db = db;
    // Ensure UNIQUE constraint on path for atomic locking
    try {
      this.db.db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_locks_path_unique ON locks(path)');
    } catch { /* index may already exist */ }
  }

  /** Acquire a lock atomically. Returns { acquired, holder?, lock? } */
  acquire(path, sessionId, options = {}) {
    const { type = 'file', ttlMs = 30 * 60 * 1000 } = options;

    // Check existing lock
    const existing = this.getByPath(path);
    if (existing) {
      if (existing.expires_at && new Date(existing.expires_at) < new Date()) {
        this.release(existing.id);
        // Fall through to acquire
      } else if (existing.session_id !== sessionId) {
        return { acquired: false, holder: existing.session_id, lock: existing };
      } else {
        // Same session: refresh TTL
        this.refresh(existing.id, ttlMs);
        return { acquired: true, lock: existing };
      }
    }

    // Atomic insert: UNIQUE constraint on path prevents race condition
    const id = `lock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const expiresAt = ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null;

    try {
      this.db.db.run(
        'INSERT INTO locks (id, path, type, session_id, acquired_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, path, type, sessionId, now, expiresAt]
      );
      this.db._dirty = true;
      this.db.autoSave();
      return { acquired: true, lock: { id, path, type, session_id: sessionId, acquired_at: now, expires_at: expiresAt } };
    } catch {
      // UNIQUE constraint violation = someone else acquired it between check and insert
      const winner = this.getByPath(path);
      return { acquired: false, holder: winner?.session_id, lock: winner };
    }
  }

  release(lockId) {
    this.db.delete('locks', lockId);
    this.db.autoSave();
  }

  releaseAll(sessionId) {
    const locks = this.db.query('locks', { session_id: sessionId });
    for (const lock of locks) {
      this.db.delete('locks', lock.id);
    }
    this.db.autoSave();
    return locks.length;
  }

  refresh(lockId, ttlMs = 30 * 60 * 1000) {
    this.db.update('locks', lockId, {
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
    });
    this.db.autoSave();
  }

  getByPath(path) {
    const locks = this.db.query('locks', { path });
    return locks[0] || null;
  }

  getBySession(sessionId) {
    return this.db.query('locks', { session_id: sessionId });
  }

  getAll() {
    return this.db.query('locks');
  }

  checkAvailability(paths, sessionId) {
    const conflicts = [];
    for (const p of paths) {
      const lock = this.getByPath(p);
      if (lock && lock.session_id !== sessionId) {
        if (!lock.expires_at || new Date(lock.expires_at) > new Date()) {
          conflicts.push({ path: p, holder: lock.session_id });
        }
      }
    }
    return { available: conflicts.length === 0, conflicts };
  }

  cleanExpired() {
    const all = this.getAll();
    let cleaned = 0;
    const now = new Date();
    for (const lock of all) {
      if (lock.expires_at && new Date(lock.expires_at) < now) {
        this.release(lock.id);
        cleaned++;
      }
    }
    return cleaned;
  }
}
