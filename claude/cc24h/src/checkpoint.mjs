/**
 * cc24h - Checkpoint Manager
 * Periodic state snapshots for recovery.
 */

import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { createCheckpoint } from './models.mjs';

export class CheckpointManager {
  constructor(db, checkpointDir) {
    this.db = db;
    this.dir = checkpointDir;
    mkdirSync(this.dir, { recursive: true });
  }

  create(data) {
    const cp = createCheckpoint(data);
    this.db.insert('checkpoints', cp);

    const filePath = join(this.dir, `${cp.id}.yaml`);
    writeFileSync(filePath, yaml.dump(cp, { lineWidth: 120 }));

    this.db.autoSave();
    return cp;
  }

  get(id) {
    return this.db.get('checkpoints', id);
  }

  getBySession(sessionId) {
    return this.db.query('checkpoints', { session_id: sessionId }, 'created_at DESC');
  }

  getByTask(taskId) {
    return this.db.query('checkpoints', { task_id: taskId }, 'created_at DESC');
  }

  getLatest(sessionId) {
    const cps = this.getBySession(sessionId);
    return cps[0] || null;
  }

  /** Create checkpoint from current session + worktree state */
  createFromSession(session, task, worktreeManager) {
    let commitSha = null;
    if (task.worktree && worktreeManager) {
      commitSha = worktreeManager.checkpoint(
        task.worktree,
        `[cc24h] checkpoint: ${task.id} - ${task.phase || 'in-progress'}`
      );
    }

    return this.create({
      session_id: session.id,
      task_id: task.id,
      branch: task.branch,
      commit_sha: commitSha,
      phase: task.phase || session.phase,
      summary: session.summary || `Working on ${task.title}`,
    });
  }
}
