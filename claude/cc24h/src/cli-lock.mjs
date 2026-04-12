import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_POLL_MS = 100;
const DEFAULT_STALE_MS = 6 * 60 * 60 * 1000;

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function readOwner(lockPath) {
  const ownerPath = join(lockPath, 'owner.json');
  if (!existsSync(ownerPath)) return null;
  try {
    return JSON.parse(readFileSync(ownerPath, 'utf-8'));
  } catch {
    return null;
  }
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === 'EPERM';
  }
}

function isStale(lockPath, owner, staleMs) {
  if (owner?.pid && !isPidAlive(owner.pid)) return true;
  try {
    return Date.now() - statSync(lockPath).mtimeMs > staleMs;
  } catch {
    return false;
  }
}

function describeOwner(owner) {
  if (!owner) return 'unknown holder';
  const command = owner.command || 'unknown-command';
  const pid = owner.pid ? `pid=${owner.pid}` : 'pid=unknown';
  const acquiredAt = owner.acquired_at || 'time=unknown';
  return `${command} (${pid}, acquired=${acquiredAt})`;
}

export async function acquireProjectCliLock(projectRoot, options = {}) {
  const {
    command = 'unknown',
    timeoutMs = DEFAULT_TIMEOUT_MS,
    pollMs = DEFAULT_POLL_MS,
    staleMs = DEFAULT_STALE_MS,
  } = options;

  const root = resolve(projectRoot);
  const stateDir = join(root, '.cc24h');
  const lockPath = join(stateDir, 'cli-lock');
  const ownerPath = join(lockPath, 'owner.json');
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  mkdirSync(stateDir, { recursive: true });

  while (true) {
    try {
      mkdirSync(lockPath);
      const owner = {
        token,
        pid: process.pid,
        command,
        acquired_at: new Date().toISOString(),
        project_root: root,
      };
      writeFileSync(ownerPath, JSON.stringify(owner, null, 2));
      return () => {
        const currentOwner = readOwner(lockPath);
        if (!currentOwner || currentOwner.token !== token) return;
        rmSync(lockPath, { recursive: true, force: true });
      };
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }

    const owner = readOwner(lockPath);
    if (isStale(lockPath, owner, staleMs)) {
      rmSync(lockPath, { recursive: true, force: true });
      await sleep(25);
      continue;
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`Project CLI lock busy: ${describeOwner(owner)}`);
    }

    await sleep(pollMs);
  }
}
