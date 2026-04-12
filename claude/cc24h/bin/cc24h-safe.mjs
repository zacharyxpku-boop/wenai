#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync, createWriteStream } from 'fs';
import { appendFile, mkdir, readFile, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CC24H_ENTRY = path.join(__dirname, 'cc24h.mjs');

function usage() {
  console.log(`cc24h-safe

Safe single-entry wrapper for cc24h.

Usage:
  node bin/cc24h-safe.mjs [wrapper options] <cc24h command> [cc24h args...]

Wrapper options:
  --client <name>      Logical caller label for logs. Default: unknown
  --wait-ms <ms>       Max wait time for the project lock. Default: 1800000
  --poll-ms <ms>       Lock polling interval. Default: 1000
  --stale-ms <ms>      Force-recover stale lock after this age. Default: 7200000
  --no-lock            Skip the project lock. Use only for read-only checks.
  --help               Show this help

Examples:
  node bin/cc24h-safe.mjs --client codex status -p C:\\work\\demo
  node bin/cc24h-safe.mjs --client claude-code commander "ship feature" -p C:\\work\\demo
`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv) {
  const wrapper = {
    client: 'unknown',
    waitMs: 30 * 60 * 1000,
    pollMs: 1000,
    staleMs: 2 * 60 * 60 * 1000,
    noLock: false
  };
  const passthrough = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      wrapper.help = true;
      continue;
    }
    if (arg === '--client') {
      wrapper.client = argv[i + 1] || wrapper.client;
      i += 1;
      continue;
    }
    if (arg.startsWith('--client=')) {
      wrapper.client = arg.slice('--client='.length) || wrapper.client;
      continue;
    }
    if (arg === '--wait-ms') {
      wrapper.waitMs = Number(argv[i + 1] || wrapper.waitMs);
      i += 1;
      continue;
    }
    if (arg.startsWith('--wait-ms=')) {
      wrapper.waitMs = Number(arg.slice('--wait-ms='.length) || wrapper.waitMs);
      continue;
    }
    if (arg === '--poll-ms') {
      wrapper.pollMs = Number(argv[i + 1] || wrapper.pollMs);
      i += 1;
      continue;
    }
    if (arg.startsWith('--poll-ms=')) {
      wrapper.pollMs = Number(arg.slice('--poll-ms='.length) || wrapper.pollMs);
      continue;
    }
    if (arg === '--stale-ms') {
      wrapper.staleMs = Number(argv[i + 1] || wrapper.staleMs);
      i += 1;
      continue;
    }
    if (arg.startsWith('--stale-ms=')) {
      wrapper.staleMs = Number(arg.slice('--stale-ms='.length) || wrapper.staleMs);
      continue;
    }
    if (arg === '--no-lock') {
      wrapper.noLock = true;
      continue;
    }
    passthrough.push(arg);
  }

  return { wrapper, passthrough };
}

function findProjectRoot(args) {
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '-p' || args[i] === '--project') {
      return path.resolve(args[i + 1] || '.');
    }
    if (args[i].startsWith('--project=')) {
      return path.resolve(args[i].slice('--project='.length));
    }
  }
  return path.resolve(process.cwd());
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

async function readJsonSafe(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function appendJsonLine(filePath, payload) {
  await appendFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}

async function ensureGatewayDirs(gatewayDir) {
  await mkdir(gatewayDir, { recursive: true });
  await mkdir(path.join(gatewayDir, 'logs'), { recursive: true });
}

async function acquireProjectLock({ projectRoot, gatewayDir, wrapper, commandArgs }) {
  const lockDir = path.join(gatewayDir, 'mutex');
  const lockFile = path.join(lockDir, 'lock.json');
  const startedAt = Date.now();
  const info = {
    projectRoot,
    client: wrapper.client,
    pid: process.pid,
    hostname: os.hostname(),
    startedAt: new Date().toISOString(),
    command: commandArgs.join(' ')
  };

  while (true) {
    try {
      await mkdir(lockDir);
      await writeFile(lockFile, JSON.stringify(info, null, 2), 'utf8');
      return { lockDir, lockFile, info };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;

      const existing = await readJsonSafe(lockFile);
      const lockAge = existing?.startedAt ? Date.now() - Date.parse(existing.startedAt) : 0;
      const staleByTime = lockAge > wrapper.staleMs;
      const staleByPid = existing?.pid ? !isProcessAlive(existing.pid) : false;

      if (staleByTime || staleByPid) {
        await rm(lockDir, { recursive: true, force: true });
        continue;
      }

      if (Date.now() - startedAt > wrapper.waitMs) {
        const holder = existing
          ? `${existing.client || 'unknown'} pid=${existing.pid || 'n/a'} command=${existing.command || 'n/a'}`
          : 'unknown holder';
        throw new Error(`Timed out waiting for project lock. Holder: ${holder}`);
      }

      const holder = existing
        ? `${existing.client || 'unknown'} pid=${existing.pid || 'n/a'}`
        : 'unknown';
      console.error(`[cc24h-safe] waiting for lock on ${projectRoot} (${holder})`);
      await sleep(wrapper.pollMs);
    }
  }
}

async function releaseProjectLock(lockState) {
  if (!lockState?.lockDir) return;
  await rm(lockState.lockDir, { recursive: true, force: true });
}

async function main() {
  const { wrapper, passthrough } = parseArgs(process.argv.slice(2));

  if (wrapper.help || passthrough.length === 0) {
    usage();
    process.exitCode = passthrough.length === 0 ? 1 : 0;
    return;
  }

  if (!existsSync(CC24H_ENTRY)) {
    throw new Error(`Missing cc24h entry: ${CC24H_ENTRY}`);
  }

  const projectRoot = findProjectRoot(passthrough);
  const stateDir = path.join(projectRoot, '.cc24h');
  const gatewayDir = path.join(stateDir, 'gateway');
  await ensureGatewayDirs(gatewayDir);

  const commandName = passthrough[0] || 'unknown';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeCommandName = commandName.replace(/[^\w-]/g, '_');
  const logPath = path.join(gatewayDir, 'logs', `${timestamp}-${wrapper.client}-${safeCommandName}.log`);
  const eventsPath = path.join(gatewayDir, 'invocations.jsonl');

  let lockState = null;
  let child = null;
  const logStream = createWriteStream(logPath, { flags: 'a' });

  const invocation = {
    type: 'start',
    client: wrapper.client,
    pid: process.pid,
    projectRoot,
    command: passthrough,
    startedAt: new Date().toISOString(),
    logPath
  };
  await appendJsonLine(eventsPath, invocation);

  const forwardSignal = (signal) => {
    if (child && !child.killed) child.kill(signal);
  };
  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));

  try {
    if (!wrapper.noLock) {
      lockState = await acquireProjectLock({ projectRoot, gatewayDir, wrapper, commandArgs: passthrough });
      console.log(`[cc24h-safe] lock acquired for ${projectRoot}`);
    } else {
      console.log(`[cc24h-safe] running without lock for ${projectRoot}`);
    }

    child = spawn(process.execPath, [CC24H_ENTRY, ...passthrough], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      logStream.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      logStream.write(chunk);
    });

    const exitCode = await new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', resolve);
    });

    await appendJsonLine(eventsPath, {
      type: 'finish',
      client: wrapper.client,
      pid: process.pid,
      projectRoot,
      command: passthrough,
      finishedAt: new Date().toISOString(),
      exitCode,
      logPath
    });

    process.exitCode = exitCode ?? 1;
  } finally {
    logStream.end();
    if (!wrapper.noLock) {
      await releaseProjectLock(lockState);
    }
  }
}

main().catch(async (error) => {
  console.error(`[cc24h-safe] ${error.message}`);
  process.exitCode = 1;
});
