/**
 * cc24h - Core Tests
 * Covers: database, task queue (with backoff), locks (atomic), sessions, handoffs,
 * orchestrator execute (dry-run), YAML import, and init system.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

const TEST_DIR = join(process.cwd(), '.cc24h-test');
const DB_PATH = join(TEST_DIR, 'state.db');

function cleanup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
}

// ═══════════════════════════════════════════
// Database
// ═══════════════════════════════════════════
describe('Database', () => {
  let db;

  before(async () => {
    cleanup();
    const { Database } = await import('../src/database.mjs');
    db = new Database(DB_PATH);
    await db.init();
  });

  after(() => { if (db) db.close(); cleanup(); });

  it('creates tables', () => {
    const tables = db.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const names = tables[0].values.map(v => v[0]);
    for (const t of ['tasks', 'sessions', 'handoffs', 'checkpoints', 'locks', 'events']) {
      assert.ok(names.includes(t), `Missing table: ${t}`);
    }
  });

  it('insert + get + update + delete', () => {
    db.insert('tasks', { id: 't1', title: 'X', prompt: 'Y', status: 'todo', priority: 5,
      depends_on: '[]', files_touched: '[]', tags: '[]',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    assert.equal(db.get('tasks', 't1').title, 'X');
    db.update('tasks', 't1', { status: 'running' });
    assert.equal(db.get('tasks', 't1').status, 'running');
    db.delete('tasks', 't1');
    assert.equal(db.get('tasks', 't1'), null);
  });

  it('atomic save (write-to-tmp-then-rename)', () => {
    db.insert('tasks', { id: 't2', title: 'Z', prompt: 'W', status: 'todo', priority: 1,
      depends_on: '[]', files_touched: '[]', tags: '[]',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    db.save();
    assert.ok(existsSync(DB_PATH));
    assert.ok(!existsSync(DB_PATH + '.tmp')); // tmp file cleaned up
  });

  it('rejects ops before init', async () => {
    const { Database } = await import('../src/database.mjs');
    const db2 = new Database('/tmp/noinit.db');
    assert.throws(() => db2.get('tasks', 'x'), /not initialized/);
  });
});

// ═══════════════════════════════════════════
// TaskQueue with retry backoff
// ═══════════════════════════════════════════
describe('TaskQueue', () => {
  let db, queue;

  before(async () => {
    cleanup();
    const { Database } = await import('../src/database.mjs');
    const { TaskQueue } = await import('../src/task-queue.mjs');
    db = new Database(DB_PATH);
    await db.init();
    queue = new TaskQueue(db);
  });

  after(() => { if (db) db.close(); cleanup(); });

  it('add + get + priority ordering', () => {
    queue.add({ id: 'q1', title: 'First', prompt: 'p1', priority: 1 });
    queue.add({ id: 'q2', title: 'Second', prompt: 'p2', priority: 5 });
    queue.add({ id: 'q3', title: 'Third', prompt: 'p3', priority: 3, depends_on: ['q1'] });
    const ready = queue.getReady(10);
    assert.equal(ready[0].id, 'q1'); // highest priority
    assert.ok(!ready.find(t => t.id === 'q3')); // blocked by dep
  });

  it('rejects empty prompt', () => {
    assert.throws(() => queue.add({ id: 'bad', title: 'x' }), /prompt/);
  });

  it('dependency unblocking', () => {
    queue.updateStatus('q1', 'done');
    const ready = queue.getReady(10);
    assert.ok(ready.find(t => t.id === 'q3')); // now unblocked
  });

  it('retry with backoff sets retry_after', () => {
    queue.updateStatus('q2', 'failed', { error: 'test' });
    const before = Date.now();
    queue.retry('q2');
    const task = queue.get('q2');
    assert.equal(task.status, 'todo');
    assert.equal(task.retry_count, 1);
    assert.ok(task.retry_after); // has a retry_after timestamp
    // retry_after should be ~60s in the future (30s * 2^1)
    const retryAt = new Date(task.retry_after).getTime();
    assert.ok(retryAt > before + 50000); // at least 50s from now
  });

  it('getReady respects retry_after', () => {
    // q2 has retry_after in the future, should NOT be ready
    const ready = queue.getReady(10);
    assert.ok(!ready.find(t => t.id === 'q2'));
  });

  it('quarantine after max retries', () => {
    const task = queue.get('q2');
    queue.updateStatus('q2', 'todo', { retry_count: 3, max_retries: 3 });
    const retried = queue.retry('q2');
    assert.equal(retried, false);
    assert.equal(queue.get('q2').status, 'quarantined');
  });

  it('blocks task when dep is quarantined', () => {
    queue.add({ id: 'q4', title: 'Dep on q2', prompt: 'p4', depends_on: ['q2'] });
    const ready = queue.getReady(10);
    assert.ok(!ready.find(t => t.id === 'q4'));
    const q4 = queue.get('q4');
    assert.equal(q4.status, 'blocked');
  });

  it('stats', () => {
    const s = queue.getStats();
    assert.ok(s.total > 0);
    assert.ok(s.done >= 1);
  });
});

// ═══════════════════════════════════════════
// LockManager (atomic)
// ═══════════════════════════════════════════
describe('LockManager', () => {
  let db, locks;

  before(async () => {
    cleanup();
    const { Database } = await import('../src/database.mjs');
    const { LockManager } = await import('../src/locks.mjs');
    db = new Database(DB_PATH);
    await db.init();
    locks = new LockManager(db);
  });

  after(() => { if (db) db.close(); cleanup(); });

  it('acquire + reject conflict + same-session refresh', () => {
    assert.ok(locks.acquire('a.ts', 's1').acquired);
    assert.ok(!locks.acquire('a.ts', 's2').acquired);
    assert.ok(locks.acquire('a.ts', 's1').acquired); // refresh
  });

  it('checkAvailability', () => {
    const r = locks.checkAvailability(['a.ts', 'b.ts'], 's2');
    assert.ok(!r.available);
    assert.equal(r.conflicts.length, 1);
  });

  it('releaseAll + re-acquire by another', () => {
    locks.releaseAll('s1');
    assert.ok(locks.acquire('a.ts', 's2').acquired);
  });

  it('cleanExpired', () => {
    locks.acquire('expired.ts', 's3', { ttlMs: 1 }); // 1ms TTL
    // Wait a tiny bit
    const cleaned = locks.cleanExpired();
    assert.ok(cleaned >= 1);
  });
});

// ═══════════════════════════════════════════
// SessionManager
// ═══════════════════════════════════════════
describe('SessionManager', () => {
  let db, sessions;

  before(async () => {
    cleanup();
    const { Database } = await import('../src/database.mjs');
    const { SessionManager } = await import('../src/session-manager.mjs');
    db = new Database(DB_PATH);
    await db.init();
    sessions = new SessionManager(db, { type: 'cli' });
  });

  after(() => { if (db) db.close(); cleanup(); });

  it('create + get + status flow', () => {
    const s = sessions.create({ display_name: 'test' });
    assert.ok(s.id);
    assert.equal(s.status, 'idle');
    sessions.updateStatus(s.id, 'active');
    assert.equal(sessions.get(s.id).status, 'active');
  });

  it('recover', async () => {
    const all = sessions.getAll();
    sessions.updateStatus(all[0].id, 'failed');
    const r = await sessions.recover(all[0].id);
    assert.equal(r.status, 'idle');
    assert.equal(r.retry_count, 1);
  });

  it('stats', () => {
    const s = sessions.getStats();
    assert.ok(s.total >= 1);
  });
});

// ═══════════════════════════════════════════
// Handoff generation
// ═══════════════════════════════════════════
describe('HandoffManager', () => {
  let db, handoffs;

  before(async () => {
    cleanup();
    mkdirSync(join(TEST_DIR, 'handoffs'), { recursive: true });
    const { Database } = await import('../src/database.mjs');
    const { HandoffManager } = await import('../src/handoff.mjs');
    db = new Database(DB_PATH);
    await db.init();
    handoffs = new HandoffManager(db, join(TEST_DIR, 'handoffs'));
  });

  after(() => { if (db) db.close(); cleanup(); });

  it('create + get + getRecent', () => {
    const h = handoffs.create({
      from_session: 'sa', to_session: 'sb', task_id: 't1',
      goal: 'test goal', next_steps: 'next',
    });
    assert.ok(h.id);
    const got = handoffs.get(h.id);
    assert.equal(got.goal, 'test goal');
    assert.equal(handoffs.getRecent(5).length, 1);
  });

  it('generateFromSession', () => {
    const session = { id: 'sx' };
    const task = { id: 'tx', title: 'Title', prompt: 'P', files_touched: ['a.ts'] };
    const h = handoffs.generateFromSession(session, task, {
      completed: ['done'], remaining: [], next_steps: 'merge',
    });
    assert.equal(h.from_session, 'sx');
    assert.equal(h.goal, 'Title');
  });
});

// ═══════════════════════════════════════════
// Orchestrator (dry-run execute)
// ═══════════════════════════════════════════
describe('Orchestrator dry-run', () => {
  let system;

  before(async () => {
    cleanup();
    const { initSystem } = await import('../src/init.mjs');
    system = await initSystem(TEST_DIR, { dryRun: true });
    // Inject a mock backend so orchestrator doesn't bail with no_backend
    const mockBackend = { type: 'mock', runPrompt: async () => ({ success: true, output: '', duration: 0, exitCode: 0 }) };
    system.orchestrator.backend = mockBackend;
    system.sessionManager.backend = mockBackend;
  });

  after(() => { if (system?.db) system.db.close(); cleanup(); });

  it('executeTask dry-run creates session + marks done', async () => {
    system.taskQueue.add({ id: 'dry1', title: 'Dry', prompt: 'test' });
    const task = system.taskQueue.get('dry1');
    const result = await system.orchestrator.executeTask(task);
    assert.ok(result.success);
    assert.ok(result.dryRun);
    assert.equal(system.taskQueue.get('dry1').status, 'done');
    assert.ok(system.sessionManager.getAll().length >= 1);
  });
});

// ═══════════════════════════════════════════
// YAML Import
// ═══════════════════════════════════════════
describe('YAML Import', () => {
  let db, queue;

  before(async () => {
    cleanup();
    const { Database } = await import('../src/database.mjs');
    const { TaskQueue } = await import('../src/task-queue.mjs');
    db = new Database(DB_PATH);
    await db.init();
    queue = new TaskQueue(db);
  });

  after(() => { if (db) db.close(); cleanup(); });

  it('imports nightly.yaml with deps and priorities', () => {
    const imported = queue.importFromYaml('examples/nightly.yaml');
    assert.ok(imported.length >= 3);
    const t = queue.get('fix-auth-bug');
    assert.equal(t.priority, 1);
    // add-logging depends on fix-auth-bug
    const dep = queue.get('add-logging');
    assert.ok(dep.depends_on.includes('fix-auth-bug'));
  });
});

// ═══════════════════════════════════════════
// Init System
// ═══════════════════════════════════════════
describe('initSystem', () => {
  let system;

  before(async () => {
    cleanup();
    const { initSystem } = await import('../src/init.mjs');
    system = await initSystem(TEST_DIR);
  });

  after(() => { if (system?.db) system.db.close(); cleanup(); });

  it('initializes all components', () => {
    assert.ok(system.db);
    assert.ok(system.taskQueue);
    assert.ok(system.sessionManager);
    assert.ok(system.worktreeManager);
    assert.ok(system.lockManager);
    assert.ok(system.handoffManager);
    assert.ok(system.checkpointManager);
    assert.ok(system.eventLogger);
    assert.ok(system.orchestrator);
  });

  it('creates state directory', () => {
    assert.ok(existsSync(join(TEST_DIR, '.cc24h')));
    assert.ok(existsSync(join(TEST_DIR, '.cc24h', 'state.db')));
  });

  it('orchestrator handles no backend gracefully', async () => {
    // Force backend to null to test the no-backend path
    const origBackend = system.orchestrator.backend;
    system.orchestrator.backend = null;
    system.taskQueue.add({ id: 'noback', title: 'No Backend', prompt: 'test' });
    const task = system.taskQueue.get('noback');
    const result = await system.orchestrator.executeTask(task);
    assert.ok(!result.success);
    assert.equal(result.reason, 'no_backend');
    system.orchestrator.backend = origBackend;
  });
});
