/**
 * cc24h - Session Manager
 * Manages Claude Code session lifecycle, heartbeat, recovery.
 */

import { v4 as uuid } from 'uuid';
import { SessionStatus, createSession } from './models.mjs';

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min without heartbeat = stale

export class SessionManager {
  constructor(db, backend) {
    this.db = db;
    this.backend = backend;
    this._processes = new Map(); // sessionId -> { process, ... }
  }

  create(data) {
    const session = createSession({
      id: data.id || `sess-${uuid().slice(0, 8)}`,
      display_name: data.display_name || data.id,
      backend_type: this.backend?.type || 'none',
      ...data,
    });
    this.db.insert('sessions', session);
    this.db.autoSave();
    return session;
  }

  get(id) { return this.db.get('sessions', id); }
  getAll() { return this.db.query('sessions', {}, 'updated_at DESC'); }
  getActive() { return this.db.query('sessions', { status: SessionStatus.ACTIVE }); }

  heartbeat(id) {
    this.db.update('sessions', id, {
      last_heartbeat: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    // Don't autoSave on every heartbeat — too frequent
    this.db._dirty = true;
  }

  updateStatus(id, status, extra = {}) {
    this.db.update('sessions', id, {
      status,
      updated_at: new Date().toISOString(),
      ...extra,
    });
    this.db.autoSave();
  }

  /** Start a session running a task */
  async start(sessionId, task, options = {}) {
    const session = this.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    if (!this.backend) throw new Error('No backend available');

    // Heartbeat immediately on start
    this.heartbeat(sessionId);

    this.updateStatus(sessionId, SessionStatus.ACTIVE, {
      task_id: task.id,
      phase: 'coding',
      summary: `Working on: ${task.title}`,
    });

    const cwd = task.worktree || options.cwd || process.cwd();
    const logFile = options.logFile || null;

    const result = await this.backend.startSession(task.prompt, {
      cwd,
      maxTurns: options.maxTurns || 100,
      logFile,
      onOutput: () => this.heartbeat(sessionId),
      onClose: (res) => {
        this._processes.delete(sessionId);
        // Normalize: CLI gives { code, output }, SDK gives { exitCode, output, success }
        const exitCode = res?.code ?? res?.exitCode ?? 1;
        if (exitCode === 0 || res?.success) {
          this.updateStatus(sessionId, SessionStatus.COMPLETED, {
            summary: `Completed: ${task.title}`,
          });
        } else {
          this.updateStatus(sessionId, SessionStatus.FAILED, {
            summary: `Failed (exit ${exitCode}): ${task.title}`,
          });
        }
      },
    });

    if (result.pid) {
      this._processes.set(sessionId, result);
      this.db.update('sessions', sessionId, {
        pid: result.pid,
        backend_session_ref: result.sessionRef,
      });
      this.db.autoSave();
    }

    return result;
  }

  async pause(id) {
    const proc = this._processes.get(id);
    if (proc?.process) {
      proc.process.kill('SIGTERM');
      this._processes.delete(id);
    }
    this.updateStatus(id, SessionStatus.PAUSED);
  }

  async terminate(id) {
    const proc = this._processes.get(id);
    if (proc?.process) {
      proc.process.kill('SIGKILL');
      this._processes.delete(id);
    }
    this.updateStatus(id, SessionStatus.FAILED, { summary: 'Terminated by user' });
  }

  /** Detect stale sessions. Also checks if OS process is alive. */
  detectStale() {
    const active = this.db.query('sessions', { status: SessionStatus.ACTIVE });
    const now = Date.now();
    const stale = [];

    for (const s of active) {
      const lastHb = new Date(s.last_heartbeat).getTime();
      if (now - lastHb > STALE_THRESHOLD_MS) {
        // Check if process is actually alive
        let alive = false;
        if (s.pid) {
          try { process.kill(s.pid, 0); alive = true; } catch { /* dead */ }
        }
        if (this._processes.has(s.id)) alive = true;

        if (!alive) {
          this.updateStatus(s.id, SessionStatus.STALE, {
            blocker: 'No heartbeat, process dead',
          });
          stale.push(s);
        }
      }
    }
    return stale;
  }

  async recover(id) {
    const session = this.get(id);
    if (!session) return null;
    this.updateStatus(id, SessionStatus.IDLE, {
      blocker: null,
      retry_count: session.retry_count + 1,
    });
    return this.get(id);
  }

  getStats() {
    return {
      total: this.db.count('sessions'),
      active: this.db.count('sessions', { status: SessionStatus.ACTIVE }),
      paused: this.db.count('sessions', { status: SessionStatus.PAUSED }),
      idle: this.db.count('sessions', { status: SessionStatus.IDLE }),
      failed: this.db.count('sessions', { status: SessionStatus.FAILED }),
      stale: this.db.count('sessions', { status: SessionStatus.STALE }),
    };
  }

  remove(id) {
    this._processes.delete(id);
    this.db.delete('sessions', id);
    this.db.autoSave();
  }
}
