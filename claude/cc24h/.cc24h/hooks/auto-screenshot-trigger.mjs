#!/usr/bin/env node
/**
 * cc24h PostToolUse Hook — Auto Screenshot Loop Trigger
 *
 * After editing UI files (TSX/JSX/HTML/CSS), reminds Claude to run visual verification.
 * Does NOT block — outputs a strong reminder via stderr.
 * Tracks UI file edit count to trigger after meaningful changes.
 *
 * Always exit 0 (advisory, not blocking).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { extname, basename, join } from 'path';

const UI_EXTENSIONS = new Set(['.tsx', '.jsx', '.html', '.css', '.scss', '.vue', '.svelte']);
const TRACKER_PATH = join(process.cwd(), '.cc24h', 'ui-edit-tracker.json');

function loadTracker() {
  try {
    if (existsSync(TRACKER_PATH)) return JSON.parse(readFileSync(TRACKER_PATH, 'utf-8'));
  } catch {}
  return { editCount: 0, files: [], lastReminder: 0, lastVerified: 0 };
}

function saveTracker(t) {
  try {
    const dir = join(process.cwd(), '.cc24h');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(TRACKER_PATH, JSON.stringify(t, null, 2));
  } catch {}
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const filePath = data?.tool_input?.file_path || data?.tool_input?.path || '';
  if (!filePath) process.exit(0);

  const ext = extname(filePath).toLowerCase();
  if (!UI_EXTENSIONS.has(ext)) process.exit(0);

  // Skip test files
  const name = basename(filePath).toLowerCase();
  if (name.includes('.test.') || name.includes('.spec.') || name.includes('.config.')) process.exit(0);

  const tracker = loadTracker();
  tracker.editCount++;
  if (!tracker.files.includes(filePath)) tracker.files.push(filePath);

  const now = Date.now();
  const timeSinceReminder = now - (tracker.lastReminder || 0);
  const timeSinceVerified = now - (tracker.lastVerified || 0);

  // Trigger visual check reminder every 5 UI edits OR every 3 minutes of continuous UI editing
  const editThreshold = tracker.editCount >= 5;
  const timeThreshold = timeSinceReminder > 3 * 60 * 1000 && tracker.editCount >= 2;

  if (editThreshold || timeThreshold) {
    const fileList = tracker.files.slice(-5).map(f => basename(f)).join(', ');
    const msg = [
      '',
      `📸 VISUAL CHECK NEEDED — ${tracker.editCount} UI files edited since last check: ${fileList}`,
      '',
      'Run visual verification NOW using preview_* tools:',
      '  1. preview_screenshot — capture current state',
      '  2. preview_snapshot — check accessibility tree',
      '  3. preview_resize with preset "mobile" — check mobile layout',
      '  4. preview_console_logs — check for errors',
      '',
      'Or invoke /screenshot-loop for full 3-viewport analysis.',
      '',
    ].join('\n');
    process.stderr.write(msg);

    tracker.editCount = 0;
    tracker.files = [];
    tracker.lastReminder = now;
  }

  saveTracker(tracker);
  process.exit(0);
}

main().catch(() => process.exit(0));
