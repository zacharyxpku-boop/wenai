/**
 * cc24h - Task Queue Manager
 * Manages task lifecycle, priority ordering, dependency resolution, retry backoff.
 */

import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import { v4 as uuid } from 'uuid';
import { TaskStatus, createTask } from './models.mjs';

// Exponential backoff: attempt 1 = 30s, 2 = 60s, 3 = 120s
function retryDelay(attempt) {
  return 30_000 * Math.pow(2, attempt);
}

export class TaskQueue {
  constructor(db) {
    this.db = db;
  }

  add(taskData) {
    if (!taskData.prompt) throw new Error('Task must have a prompt');
    const task = createTask({
      id: taskData.id || `task-${uuid().slice(0, 8)}`,
      ...taskData,
    });
    this.db.insert('tasks', task);
    this.db.autoSave();
    return task;
  }

  get(id) { return this.db.get('tasks', id); }

  /** Get next task(s) ready to run, respecting deps, priority, and retry backoff */
  getReady(limit = 1) {
    const all = this.db.query('tasks', { status: TaskStatus.TODO }, 'priority ASC, created_at ASC');
    const now = Date.now();

    const ready = [];
    for (const task of all) {
      if (ready.length >= limit) break;

      // Respect retry backoff window
      if (task.retry_after) {
        if (new Date(task.retry_after).getTime() > now) continue;
      }

      // Check all dependencies are completed (done or review)
      const deps = task.depends_on || [];
      const COMPLETED = [TaskStatus.DONE, TaskStatus.REVIEW];
      const depsOk = deps.every(depId => {
        const dep = this.db.get('tasks', depId);
        return dep && COMPLETED.includes(dep.status);
      });

      // Check no circular deps (simple: if dep doesn't exist or is quarantined, skip)
      const depsValid = deps.every(depId => {
        const dep = this.db.get('tasks', depId);
        return dep && dep.status !== TaskStatus.QUARANTINED;
      });

      if (!depsValid) {
        // Dependency will never complete → block this task
        this.updateStatus(task.id, TaskStatus.BLOCKED, {
          error: `Dependency failed/missing: ${deps.join(', ')}`,
        });
        continue;
      }

      if (depsOk) ready.push(task);
    }
    return ready;
  }

  updateStatus(id, status, extra = {}) {
    const changes = { status, updated_at: new Date().toISOString(), ...extra };
    if (status === TaskStatus.RUNNING) changes.started_at = new Date().toISOString();
    if (status === TaskStatus.DONE || status === TaskStatus.FAILED) {
      changes.completed_at = new Date().toISOString();
    }
    this.db.update('tasks', id, changes);
    this.db.autoSave();
  }

  /** Retry a task with exponential backoff */
  retry(id) {
    const task = this.get(id);
    if (!task) return false;
    if (task.retry_count >= task.max_retries) {
      this.updateStatus(id, TaskStatus.QUARANTINED, { error: 'Max retries exceeded' });
      return false;
    }
    const nextRetry = task.retry_count + 1;
    const retryAt = new Date(Date.now() + retryDelay(nextRetry)).toISOString();
    this.updateStatus(id, TaskStatus.TODO, {
      retry_count: nextRetry,
      retry_after: retryAt,
      error: null,
      session_id: null,
    });
    return true;
  }

  getByStatus(status) { return this.db.query('tasks', { status }); }

  getAll() { return this.db.query('tasks', {}, 'priority ASC, created_at ASC'); }

  getStats() {
    const statuses = [TaskStatus.TODO, TaskStatus.RUNNING, TaskStatus.BLOCKED,
      TaskStatus.REVIEW, TaskStatus.DONE, TaskStatus.FAILED, TaskStatus.QUARANTINED];
    const stats = {};
    for (const s of statuses) stats[s] = this.db.count('tasks', { status: s });
    stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
    return stats;
  }

  importFromYaml(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const data = yaml.load(content);
    const tasks = data.tasks || data;
    if (!Array.isArray(tasks)) throw new Error('YAML must contain a tasks array');

    const imported = [];
    for (const t of tasks) {
      const task = this.add({
        id: t.id || `task-${uuid().slice(0, 8)}`,
        title: t.title || t.id,
        prompt: t.prompt || t.title,
        priority: t.priority || 5,
        depends_on: t.depends_on || [],
        tags: t.tags || [],
        agent_role: t.agent_role || null,
        max_retries: t.max_retries ?? 3,
        files_touched: t.files_touched || [],
      });
      imported.push(task);
    }
    return imported;
  }

  checkConflict(taskA, taskB) {
    const filesA = new Set(taskA.files_touched || []);
    const filesB = new Set(taskB.files_touched || []);
    return [...filesA].filter(f => filesB.has(f));
  }

  remove(id) {
    this.db.delete('tasks', id);
    this.db.autoSave();
  }
}
