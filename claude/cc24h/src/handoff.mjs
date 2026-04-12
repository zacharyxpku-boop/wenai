/**
 * cc24h - Handoff Manager
 * Manages session-to-session handoffs with structured notes.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { createHandoff } from './models.mjs';

export class HandoffManager {
  constructor(db, handoffDir) {
    this.db = db;
    this.dir = handoffDir;
    mkdirSync(this.dir, { recursive: true });
  }

  create(data) {
    const handoff = createHandoff(data);
    this.db.insert('handoffs', handoff);

    // Also write to file for human readability
    const filePath = join(this.dir, `${handoff.id}.yaml`);
    writeFileSync(filePath, yaml.dump(handoff, { lineWidth: 120 }));

    this.db.autoSave();
    return handoff;
  }

  get(id) {
    return this.db.get('handoffs', id);
  }

  getByTask(taskId) {
    return this.db.query('handoffs', { task_id: taskId }, 'created_at DESC');
  }

  getRecent(limit = 10) {
    return this.db.query('handoffs', {}, 'created_at DESC', limit);
  }

  /** Generate a handoff note from session state */
  generateFromSession(session, task, extra = {}) {
    return this.create({
      from_session: session.id,
      to_session: extra.to_session || 'next',
      task_id: task.id,
      goal: task.title,
      completed: extra.completed || [],
      remaining: extra.remaining || [task.title],
      files_modified: task.files_touched || [],
      test_results: extra.test_results || 'Not run',
      risks: extra.risks || '',
      next_steps: extra.next_steps || task.prompt,
      can_parallel: extra.can_parallel || false,
    });
  }

  /** Load all handoff files from disk */
  loadFromDisk() {
    if (!existsSync(this.dir)) return [];
    const files = readdirSync(this.dir).filter(f => f.endsWith('.yaml'));
    return files.map(f => {
      const content = readFileSync(join(this.dir, f), 'utf-8');
      return yaml.load(content);
    });
  }
}
