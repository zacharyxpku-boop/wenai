/**
 * cc24h - Claude CLI Backend
 * Executes tasks via `claude` CLI with --dangerously-skip-permissions.
 * Prompt is piped via stdin to avoid Windows shell escaping issues.
 */

import { spawn, execSync } from 'child_process';
import { writeFileSync, writeFileSync as writeFile, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { BaseBackend } from './base.mjs';

// Rate limit detection patterns
const RATE_LIMIT_PATTERNS = [
  /rate.?limit/i,
  /429/,
  /too many requests/i,
  /quota exceeded/i,
  /overloaded/i,
  /capacity/i,
  /try again (in|after|later)/i,
  /billing/i,
  /credit/i,
];

function detectRateLimit(text) {
  for (const pat of RATE_LIMIT_PATTERNS) {
    if (pat.test(text)) return true;
  }
  return false;
}

// Extract wait duration from rate limit messages (e.g., "try again in 30 seconds")
function extractWaitSeconds(text) {
  const match = text.match(/(?:try again|wait|retry|after)\s+(?:in\s+)?(\d+)\s*(second|minute|sec|min)/i);
  if (match) {
    const val = parseInt(match[1]);
    return match[2].startsWith('min') ? val * 60 : val;
  }
  return 0; // unknown, caller decides default
}

export class CliBackend extends BaseBackend {
  constructor(config = {}) {
    super(config);
    this.type = 'cli';
    this.maxTurns = config.maxTurns || 100;
    this.model = config.model || null;
    this._available = null;

    // Rate limit state (shared across all calls)
    this._rateLimited = false;
    this._rateLimitUntil = 0;     // timestamp when we can retry
    this._rateLimitCount = 0;     // consecutive rate limits
    this._onRateLimit = null;     // callback: (waitMs) => void
  }

  /** Check if currently rate-limited */
  isRateLimited() {
    if (!this._rateLimited) return false;
    if (Date.now() >= this._rateLimitUntil) {
      this._rateLimited = false;
      return false;
    }
    return true;
  }

  /** Get ms until rate limit clears */
  getRateLimitWaitMs() {
    if (!this._rateLimited) return 0;
    return Math.max(0, this._rateLimitUntil - Date.now());
  }

  /** Register rate limit callback */
  onRateLimit(cb) { this._onRateLimit = cb; }

  /** Handle a detected rate limit */
  _handleRateLimit(output) {
    this._rateLimitCount++;
    const extractedWait = extractWaitSeconds(output);
    // Exponential backoff: 30s, 60s, 120s, 240s, 300s max
    const backoffSec = extractedWait || Math.min(30 * Math.pow(2, this._rateLimitCount - 1), 300);
    const waitMs = backoffSec * 1000;
    this._rateLimited = true;
    this._rateLimitUntil = Date.now() + waitMs;
    console.log(`[RATE-LIMIT] Hit #${this._rateLimitCount}. Backing off ${backoffSec}s (until ${new Date(this._rateLimitUntil).toISOString().slice(11, 19)})`);
    if (this._onRateLimit) this._onRateLimit(waitMs);
    return waitMs;
  }

  /** Clear rate limit after successful call */
  _clearRateLimit() {
    if (this._rateLimited && Date.now() >= this._rateLimitUntil) {
      this._rateLimited = false;
      this._rateLimitCount = 0;
    }
  }

  async isAvailable() {
    if (this._available !== null) return this._available;
    try {
      execSync('claude --version', { stdio: 'pipe', shell: true });
      this._available = true;
    } catch {
      this._available = false;
    }
    return this._available;
  }

  getVersion() {
    try {
      return execSync('claude --version', { encoding: 'utf-8', shell: true }).trim();
    } catch {
      return 'unknown';
    }
  }

  _buildArgs(maxTurns) {
    const args = [
      '--dangerously-skip-permissions',
      '--max-turns', String(maxTurns),
      '--print',
      '--output-format', 'text',
      '-p', '-',  // read prompt from stdin
    ];
    if (this.model) args.unshift('--model', this.model);
    return args;
  }

  async runPrompt(prompt, options = {}) {
    const {
      cwd = process.cwd(),
      maxTurns = this.maxTurns,
      logFile = null,
      timeout = 0,
      onOutput = null,
    } = options;

    return new Promise((resolve, reject) => {
      const args = this._buildArgs(maxTurns);
      const startTime = Date.now();
      const output = [];
      let resolved = false;

      const child = spawn('claude', args, {
        cwd,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Write prompt to stdin, then close
      child.stdin.write(prompt);
      child.stdin.end();

      let timer = null;
      if (timeout > 0) {
        timer = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          child.kill('SIGTERM');
          setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 5000);
          resolve({
            output: output.join('') + '\n[TIMEOUT]',
            exitCode: -1,
            duration: Math.round((Date.now() - startTime) / 1000),
            success: false,
          });
        }, timeout);
      }

      child.stdout.on('data', (data) => {
        output.push(data.toString());
        if (onOutput) onOutput(data.toString());
      });

      child.stderr.on('data', (data) => {
        output.push(`[STDERR] ${data.toString()}`);
      });

      child.on('close', (code) => {
        if (resolved) return;
        resolved = true;
        if (timer) clearTimeout(timer);
        const duration = Math.round((Date.now() - startTime) / 1000);
        const fullOutput = output.join('');
        if (logFile) writeFileSync(logFile, fullOutput);

        // Rate limit detection
        const isRateLimited = detectRateLimit(fullOutput);
        if (isRateLimited) {
          const waitMs = this._handleRateLimit(fullOutput);
          resolve({
            output: fullOutput,
            exitCode: code,
            duration,
            success: false,
            rateLimited: true,
            retryAfterMs: waitMs,
          });
          return;
        }

        // Successful call clears rate limit state
        if (code === 0) this._clearRateLimit();

        resolve({
          output: fullOutput,
          exitCode: code,
          duration,
          success: code === 0,
          rateLimited: false,
        });
      });

      child.on('error', (err) => {
        if (resolved) return;
        resolved = true;
        if (timer) clearTimeout(timer);
        reject(err);
      });
    });
  }

  async startSession(prompt, options = {}) {
    const {
      cwd = process.cwd(),
      maxTurns = this.maxTurns,
      logFile = null,
      onOutput = null,
      onClose = null,
    } = options;

    const args = this._buildArgs(maxTurns);

    const child = spawn('claude', args, {
      cwd,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Pipe prompt via stdin
    child.stdin.write(prompt);
    child.stdin.end();

    const output = [];

    child.stdout.on('data', (data) => {
      output.push(data.toString());
      if (onOutput) onOutput(data.toString());
    });

    child.stderr.on('data', (data) => {
      output.push(`[STDERR] ${data.toString()}`);
    });

    child.on('close', (code) => {
      if (logFile) writeFileSync(logFile, output.join(''));
      if (onClose) onClose({ code, output: output.join('') });
    });

    return {
      pid: child.pid,
      sessionRef: `cli-${child.pid}`,
      process: child,
      getOutput: () => output.join(''),
    };
  }

  async killSession(pid) {
    try { process.kill(pid, 'SIGTERM'); return true; } catch { return false; }
  }

  getInfo() {
    return {
      type: 'cli',
      available: this._available,
      version: this._available ? this.getVersion() : 'N/A',
      maxTurns: this.maxTurns,
      model: this.model || 'default',
    };
  }
}
