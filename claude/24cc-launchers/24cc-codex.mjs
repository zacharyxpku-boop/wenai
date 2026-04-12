#!/usr/bin/env node

import { spawn } from 'child_process';

const SAFE_ENTRY = 'C:\\Users\\86136\\Desktop\\cc24h\\bin\\cc24h-safe.mjs';
const args = process.argv.slice(2);
const [command, ...rest] = args;
const BACKEND_AWARE_COMMANDS = new Set(['daemon', 'doctor', 'plan', 'commander', 'run', 'go']);

if (!command) {
  console.error('Usage: 24cc-codex <cc24h-command> [args...]');
  process.exit(1);
}

const forwarded = ['--client', 'codex', command, ...rest];
if (BACKEND_AWARE_COMMANDS.has(command)) {
  forwarded.splice(3, 0, '--backend', 'codex');
}

const child = spawn(process.execPath, [SAFE_ENTRY, ...forwarded], {
  stdio: 'inherit',
  windowsHide: true
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
