import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { acquireProjectCliLock } from '../src/cli-lock.mjs';

function createProjectRoot() {
  return mkdtempSync(join(tmpdir(), 'cc24h-cli-lock-'));
}

test('acquireProjectCliLock acquires and releases a project mutex', async () => {
  const projectRoot = createProjectRoot();
  const release = await acquireProjectCliLock(projectRoot, { command: 'test-acquire', timeoutMs: 500 });
  assert.equal(typeof release, 'function');
  release();
});

test('acquireProjectCliLock blocks a second contender until timeout', async () => {
  const projectRoot = createProjectRoot();
  const release = await acquireProjectCliLock(projectRoot, { command: 'holder', timeoutMs: 500 });

  await assert.rejects(
    acquireProjectCliLock(projectRoot, { command: 'contender', timeoutMs: 120, pollMs: 20 }),
    /Project CLI lock busy: holder/
  );

  release();
});

test('acquireProjectCliLock reclaims a stale lock owned by a dead pid', async () => {
  const projectRoot = createProjectRoot();
  const ccDir = join(projectRoot, '.cc24h', 'cli-lock');
  const ownerPath = join(ccDir, 'owner.json');

  await import('fs').then(({ mkdirSync, writeFileSync }) => {
    mkdirSync(ccDir, { recursive: true });
    writeFileSync(ownerPath, JSON.stringify({
      token: 'stale-token',
      pid: 999999,
      command: 'stale-owner',
      acquired_at: '2026-03-23T00:00:00.000Z',
    }, null, 2));
  });

  const release = await acquireProjectCliLock(projectRoot, { command: 'reclaimer', timeoutMs: 500, pollMs: 20 });
  assert.equal(typeof release, 'function');
  release();
});
