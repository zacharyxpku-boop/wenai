/**
 * cc24h - Event Logger
 * Structured event stream for TUI display and auditing.
 */

import { createEvent } from './models.mjs';

export class EventLogger {
  constructor(db) {
    this.db = db;
    this._listeners = [];
  }

  log(type, message, extra = {}) {
    const event = createEvent({ type, message, ...extra });
    this.db.insert('events', event);
    this.db.autoSave();
    for (const listener of this._listeners) {
      try { listener(event); } catch { /* ignore */ }
    }
    return event;
  }

  info(msg, extra = {}) { return this.log('info', msg, { ...extra, level: 'info' }); }
  warn(msg, extra = {}) { return this.log('warn', msg, { ...extra, level: 'warn' }); }
  error(msg, extra = {}) { return this.log('error', msg, { ...extra, level: 'error' }); }
  decision(msg, extra = {}) { return this.log('decision', msg, { ...extra, level: 'decision' }); }

  getRecent(limit = 50) {
    return this.db.query('events', {}, 'created_at DESC', limit);
  }

  getByLevel(level, limit = 20) {
    return this.db.query('events', { level }, 'created_at DESC', limit);
  }

  onEvent(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
}
