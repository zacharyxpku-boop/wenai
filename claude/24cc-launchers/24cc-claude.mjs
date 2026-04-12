#!/usr/bin/env node

import { spawn } from 'child_process';

const SAFE_ENTRY = 'C:\\Users\\86136\\Desktop\\cc24h\\bin\\cc24h-safe.mjs';
const args = process.argv.slice(2);
const [command, ...rest] = args;

if (!command) {
  console.error('Usage: 24cc-claude <cc24h-command> [args...]');
  process.exit(1);
}

const child = spawn(process.execPath, [SAFE_ENTRY, '--client', 'claude-code', command, ...rest], {
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
