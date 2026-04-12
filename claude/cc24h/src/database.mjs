/**
 * cc24h - SQLite Database Layer
 * Uses sql.js (pure JS SQLite) for zero-native-dep portability.
 */

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

let SQL = null;

export class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this._dirty = false;
    this._initialized = false;
    this._saving = false;
  }

  async init() {
    if (!SQL) SQL = await initSqlJs();

    mkdirSync(dirname(this.dbPath), { recursive: true });

    if (existsSync(this.dbPath)) {
      const buf = readFileSync(this.dbPath);
      this.db = new SQL.Database(buf);
    } else {
      this.db = new SQL.Database();
    }

    this._createSchema();
    this.save();
    this._initialized = true;
    return this;
  }

  _assertReady() {
    if (!this._initialized) throw new Error('Database not initialized. Call await db.init() first.');
  }

  _createSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        priority INTEGER DEFAULT 5,
        agent_role TEXT,
        session_id TEXT,
        branch TEXT,
        worktree TEXT,
        phase TEXT,
        depends_on TEXT DEFAULT '[]',
        files_touched TEXT DEFAULT '[]',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        retry_after TEXT,
        error TEXT,
        checkpoint_id TEXT,
        tags TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT,
        started_at TEXT,
        completed_at TEXT
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        backend_type TEXT DEFAULT 'cli',
        backend_session_ref TEXT,
        task_id TEXT,
        agent_role TEXT,
        branch TEXT,
        worktree TEXT,
        model TEXT DEFAULT 'claude-sonnet-4-20250514',
        status TEXT DEFAULT 'idle',
        phase TEXT,
        last_heartbeat TEXT,
        summary TEXT DEFAULT '',
        next_action TEXT DEFAULT '',
        blocker TEXT,
        retry_count INTEGER DEFAULT 0,
        pid INTEGER,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS handoffs (
        id TEXT PRIMARY KEY,
        from_session TEXT NOT NULL,
        to_session TEXT NOT NULL,
        task_id TEXT NOT NULL,
        goal TEXT DEFAULT '',
        completed TEXT DEFAULT '[]',
        remaining TEXT DEFAULT '[]',
        files_modified TEXT DEFAULT '[]',
        test_results TEXT DEFAULT '',
        risks TEXT DEFAULT '',
        next_steps TEXT DEFAULT '',
        can_parallel INTEGER DEFAULT 0,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS checkpoints (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        branch TEXT,
        commit_sha TEXT,
        phase TEXT,
        summary TEXT DEFAULT '',
        files_snapshot TEXT DEFAULT '[]',
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS locks (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL,
        type TEXT DEFAULT 'file',
        session_id TEXT NOT NULL,
        acquired_at TEXT,
        expires_at TEXT
      );
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        level TEXT DEFAULT 'info',
        session_id TEXT,
        task_id TEXT,
        created_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_locks_path ON locks(path);
      CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
    `);
  }

  insert(table, obj) {
    this._assertReady();
    const keys = Object.keys(obj);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => {
      const v = obj[k];
      if (v === undefined) return null;
      if (Array.isArray(v)) return JSON.stringify(v);
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v;
    });
    this.db.run(
      `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    this._dirty = true;
  }

  update(table, id, changes) {
    this._assertReady();
    const sets = [];
    const values = [];
    for (const [k, v] of Object.entries(changes)) {
      sets.push(`${k} = ?`);
      const val = v === undefined ? null : (Array.isArray(v) ? JSON.stringify(v) : (typeof v === 'boolean' ? (v ? 1 : 0) : v));
      values.push(val);
    }
    values.push(id);
    this.db.run(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`, values);
    this._dirty = true;
  }

  get(table, id) {
    this._assertReady();
    const stmt = this.db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this._parseRow(row);
    }
    stmt.free();
    return null;
  }

  query(table, where = {}, orderBy = null, limit = null) {
    this._assertReady();
    let sql = `SELECT * FROM ${table}`;
    const values = [];
    const conditions = [];
    for (const [k, v] of Object.entries(where)) {
      if (Array.isArray(v)) {
        conditions.push(`${k} IN (${v.map(() => '?').join(', ')})`);
        values.push(...v);
      } else {
        conditions.push(`${k} = ?`);
        values.push(v);
      }
    }
    if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    if (limit) sql += ` LIMIT ${limit}`;

    const results = [];
    const stmt = this.db.prepare(sql);
    stmt.bind(values);
    while (stmt.step()) {
      results.push(this._parseRow(stmt.getAsObject()));
    }
    stmt.free();
    return results;
  }

  delete(table, id) {
    this._assertReady();
    this.db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    this._dirty = true;
  }

  count(table, where = {}) {
    this._assertReady();
    let sql = `SELECT COUNT(*) as cnt FROM ${table}`;
    const values = [];
    const conditions = [];
    for (const [k, v] of Object.entries(where)) {
      conditions.push(`${k} = ?`);
      values.push(v);
    }
    if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
    const stmt = this.db.prepare(sql);
    stmt.bind(values);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.cnt;
  }

  _parseRow(row) {
    const parsed = { ...row };
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) {
        try { parsed[k] = JSON.parse(v); } catch { /* keep as string */ }
      }
    }
    return parsed;
  }

  /** Save database to disk. Tries atomic rename, falls back to direct write on Windows. */
  save() {
    if (this._saving) return;
    this._saving = true;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      try {
        const tmp = this.dbPath + '.tmp';
        writeFileSync(tmp, buffer);
        renameSync(tmp, this.dbPath);
      } catch {
        // Rename can fail on Windows — fall back to direct write
        writeFileSync(this.dbPath, buffer);
      }
      this._dirty = false;
    } finally {
      this._saving = false;
    }
  }

  autoSave() {
    if (this._dirty) this.save();
  }

  close() {
    this.autoSave();
    this.db.close();
  }
}
