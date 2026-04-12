/**
 * cc24h - Autonomous Commander Loop
 *
 * The Commander itself drives the entire cycle:
 *   1. Claim task from Commander Core
 *   2. Spawn a Claude CLI worker to execute the prompt
 *   3. Parse worker output for structured result
 *   4. Submit result back to Commander Core
 *   5. If review tasks exist, spawn reviewer
 *   6. Repeat until queue empty
 *
 * This is the "one session runs everything" mode.
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export class AutonomousLoop {
  constructor({ bridge, backend, projectRoot, config = {} }) {
    this.bridge = bridge;
    this.commander = bridge.commander;
    this.backend = backend;
    this.projectRoot = projectRoot;
    this.maxParallel = config.maxParallel || 2;
    this.maxTurns = config.maxTurns || 80;
    this.taskTimeout = config.taskTimeout || 20 * 60 * 1000; // 20 min
    this.cooldown = config.cooldown || 5000;
    this.dryRun = config.dryRun || false;
    this.logsDir = join(projectRoot, '.cc24h', 'worklogs');
    mkdirSync(this.logsDir, { recursive: true });
    this._running = false;
    this._activeWorkers = new Map(); // sessionId → { process, task }

    // ═══ Rate Limit Aware Scheduling ═══
    this._parkedSessions = [];    // { sessionId, task, prompt, worktree, parkedAt }
    this._globalPaused = false;   // true when rate-limited
    this._pauseUntil = 0;        // timestamp
    this._consecutiveRateLimits = 0;
    this._totalRateLimits = 0;

    // Wire up backend rate limit callback
    if (this.backend.onRateLimit) {
      this.backend.onRateLimit((waitMs) => {
        this._onGlobalRateLimit(waitMs);
      });
    }
  }

  /** Called when backend detects any rate limit */
  _onGlobalRateLimit(waitMs) {
    this._consecutiveRateLimits++;
    this._totalRateLimits++;

    // Pause ALL new dispatches
    this._globalPaused = true;
    this._pauseUntil = Date.now() + waitMs;

    const waitSec = Math.round(waitMs / 1000);
    console.log(`\n[${ts()}] ⏸  RATE LIMITED — pausing all dispatch for ${waitSec}s`);
    console.log(`         Active workers: ${this._activeWorkers.size} (will finish naturally)`);
    console.log(`         Parked sessions: ${this._parkedSessions.length}`);
    console.log(`         Total rate limits this run: ${this._totalRateLimits}`);
    console.log(`         Resume at: ${new Date(this._pauseUntil).toISOString().slice(11, 19)}\n`);
  }

  /** Check if we can resume dispatching */
  _checkResume() {
    if (!this._globalPaused) return true;
    if (Date.now() >= this._pauseUntil) {
      this._globalPaused = false;
      console.log(`[${ts()}] ▶  Rate limit cooldown complete. Resuming dispatch.`);
      console.log(`         Parked sessions to wake: ${this._parkedSessions.length}`);
      return true;
    }
    return false;
  }

  /** Park a session for later wake-up */
  _parkSession(sessionId, task, prompt, worktree) {
    // Don't double-park
    if (this._parkedSessions.find(p => p.task.id === task.id)) return;
    this._parkedSessions.push({ sessionId, task, prompt, worktree, parkedAt: Date.now() });
    console.log(`[${ts()}] 🅿  Parked: ${sessionId} ← ${task.id} (will resume after rate limit)`);
  }

  /** Wake parked sessions after rate limit clears */
  _wakeParkedSessions() {
    if (this._parkedSessions.length === 0) return;
    const toWake = [...this._parkedSessions];
    this._parkedSessions = [];
    this._consecutiveRateLimits = 0; // Reset on wake

    console.log(`[${ts()}] ⏰  Waking ${toWake.length} parked session(s)...`);
    for (const p of toWake) {
      if (!this._running) break;
      if (this._activeWorkers.size >= this.maxParallel) {
        // Re-park excess
        this._parkedSessions.push(p);
        continue;
      }
      console.log(`[${ts()}] ▶  Resume: ${p.sessionId} ← ${p.task.id}`);
      this._spawnWorker(p.sessionId, p.task, p.prompt, p.worktree);
    }
  }

  async run() {
    this._running = true;
    console.log(`\n══════════════════════════════════════`);
    console.log(`  CC24H Autonomous Commander Loop`);
    console.log(`  Parallel: ${this.maxParallel} | Timeout: ${this.taskTimeout / 1000}s`);
    console.log(`  Dry run: ${this.dryRun}`);
    console.log(`══════════════════════════════════════\n`);

    // Register worker sessions
    const workerIds = [];
    for (let i = 1; i <= this.maxParallel; i++) {
      const id = `auto-builder-${i}`;
      this.bridge.register(id, 'builder');
      workerIds.push(id);
    }
    // Register a reviewer
    const reviewerId = 'auto-reviewer';
    this.bridge.register(reviewerId, 'reviewer');

    let loopCount = 0;
    let totalCompleted = 0;
    let totalFailed = 0;

    process.on('SIGINT', () => {
      console.log('\nStopping...');
      this._running = false;
      for (const [sid, w] of this._activeWorkers) {
        try { w.process?.kill('SIGTERM'); } catch {}
      }
    });

    while (this._running) {
      loopCount++;

      // Clean stale
      this.commander.recoverStaleSessions(15 * 60 * 1000);

      // ── Check finished workers ──
      for (const [sid, w] of this._activeWorkers) {
        if (w.done) {
          if (w.success) totalCompleted++; else totalFailed++;
          this._activeWorkers.delete(sid);
        }
      }

      // Get status
      const status = this.bridge.status();
      const { taskStats } = status;

      // Nothing left? (also check parked sessions)
      if (taskStats.todo === 0 && taskStats.running === 0 && taskStats.review === 0
          && this._parkedSessions.length === 0 && this._activeWorkers.size === 0) {
        console.log(`\n✓ All tasks complete. Done=${taskStats.done} Failed=${taskStats.failed}`);
        break;
      }

      // Show status every 5 loops
      if (loopCount % 5 === 1) {
        const parkInfo = this._parkedSessions.length > 0 ? ` parked=${this._parkedSessions.length}` : '';
        const rlInfo = this._globalPaused ? ` ⏸ rate-limited (${Math.round((this._pauseUntil - Date.now()) / 1000)}s)` : '';
        console.log(`[${ts()}] todo=${taskStats.todo} run=${taskStats.running} review=${taskStats.review} done=${taskStats.done} fail=${taskStats.failed}${parkInfo}${rlInfo}`);
      }

      // ── Rate limit check ──
      if (this._globalPaused) {
        if (this._checkResume()) {
          // Wake parked sessions
          this._wakeParkedSessions();
        } else {
          // Still paused — don't dispatch, just wait and check finished workers
          await sleep(Math.min(this.cooldown, 3000));
          continue;
        }
      }

      // ── Also check backend-level rate limit ──
      if (this.backend.isRateLimited && this.backend.isRateLimited()) {
        const waitMs = this.backend.getRateLimitWaitMs();
        if (!this._globalPaused) {
          this._onGlobalRateLimit(waitMs);
        }
        await sleep(Math.min(this.cooldown, 3000));
        continue;
      }

      // ── Dispatch builders ──
      const idleWorkers = workerIds.filter(id => !this._activeWorkers.has(id));
      for (const workerId of idleWorkers) {
        if (!this._running) break;
        if (this._globalPaused) break; // Stop dispatching on rate limit

        const claim = this.bridge.claimTask(workerId);
        if (!claim.task) continue;

        console.log(`[${ts()}] ${workerId} ← ${claim.task.id}: ${claim.task.title}`);
        if (claim.worktree) console.log(`         worktree: ${claim.worktree}`);

        if (this.dryRun) {
          console.log(`         [DRY-RUN] skip execution`);
          this.bridge.submitResult(workerId, claim.task.id, {
            summary: 'dry-run', tests: 'skipped',
          });
          totalCompleted++;
          continue;
        }

        // Spawn Claude CLI worker
        this._spawnWorker(workerId, claim.task, claim.prompt, claim.worktree);
      }

      // ── Dispatch reviewer ──
      if (!this._activeWorkers.has(reviewerId) && !this._globalPaused) {
        const reviewClaim = this.bridge.claimTask(reviewerId);
        if (reviewClaim.task) {
          console.log(`[${ts()}] ${reviewerId} ← ${reviewClaim.task.id}: ${reviewClaim.task.title}`);
          if (!this.dryRun) {
            this._spawnWorker(reviewerId, reviewClaim.task, reviewClaim.prompt, reviewClaim.worktree);
          } else {
            this.bridge.submitResult(reviewerId, reviewClaim.task.id, { summary: 'dry-run review', tests: 'skipped' });
          }
        }
      }

      // Wait (longer if we just came back from rate limit)
      const waitTime = this._consecutiveRateLimits > 0
        ? this.cooldown * Math.min(this._consecutiveRateLimits + 1, 4)
        : this.cooldown;
      await sleep(waitTime);
    }

    // Wait for remaining workers
    if (this._activeWorkers.size > 0) {
      console.log(`Waiting for ${this._activeWorkers.size} active worker(s)...`);
      await this._waitAll(60000);
    }

    console.log(`\n══════════════════════════════════════`);
    console.log(`  Completed: ${totalCompleted}  Failed: ${totalFailed}`);
    const finalStatus = this.bridge.status();
    console.log(`  Final: todo=${finalStatus.taskStats.todo} done=${finalStatus.taskStats.done} fail=${finalStatus.taskStats.failed}`);
    if (this._totalRateLimits > 0) {
      console.log(`  Rate limits hit: ${this._totalRateLimits} (all auto-recovered)`);
    }
    if (this._parkedSessions.length > 0) {
      console.log(`  Still parked: ${this._parkedSessions.length} session(s) — run again to resume`);
    }
    console.log(`══════════════════════════════════════\n`);
  }

  _spawnWorker(sessionId, task, prompt, worktreePath) {
    const cwd = worktreePath || this.projectRoot;
    const logFile = join(this.logsDir, `${task.id}_${Date.now()}.log`);
    const output = [];
    const startTime = Date.now();
    const sessionName = `cc24h-${task.id}`;
    const isRetry = (task.retry_count || 0) > 0;

    // GAP 2: Use --name for resumability; on retry, try --resume first
    const args = isRetry
      ? ['--resume', sessionName, '--dangerously-skip-permissions', '--max-turns', String(this.maxTurns), '--print', '--output-format', 'text']
      : ['--dangerously-skip-permissions', '--name', sessionName, '--max-turns', String(this.maxTurns), '--print', '--output-format', 'text', '-p', '-'];

    // GAP 3: Earlier compaction to prevent context overflow on long tasks
    const env = {
      ...process.env,
      CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '50',
    };

    const child = spawn('claude', args, {
      cwd,
      shell: true,
      stdio: isRetry ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
      env,
    });

    if (!isRetry) {
      child.stdin.write(prompt);
      child.stdin.end();
    }

    child.stdout.on('data', (d) => output.push(d.toString()));
    child.stderr.on('data', (d) => output.push(`[ERR] ${d.toString()}`));

    // Timeout
    const timer = setTimeout(() => {
      try { child.kill('SIGTERM'); } catch {}
      setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 5000);
    }, this.taskTimeout);

    const entry = { process: child, task, done: false, success: false };
    this._activeWorkers.set(sessionId, entry);

    // Heartbeat
    const hbTimer = setInterval(() => {
      this.commander.heartbeat(sessionId);
    }, 30000);

    child.on('close', (code) => {
      clearTimeout(timer);
      clearInterval(hbTimer);
      const duration = Math.round((Date.now() - startTime) / 1000);
      const fullOutput = output.join('');

      writeFileSync(logFile, fullOutput);

      // ═══ Rate limit detection ═══
      const RATE_LIMIT_RX = /rate.?limit|429|too many requests|quota exceeded|overloaded|capacity/i;
      if (RATE_LIMIT_RX.test(fullOutput) && code !== 0) {
        console.log(`[${ts()}] ⚠ ${sessionId} hit rate limit on ${task.id} (${duration}s)`);

        // Un-claim the task so it goes back to the queue
        try {
          this.bridge.submitResult(sessionId, task.id, {
            summary: `Rate limited after ${duration}s — will retry`,
            issues: 'rate-limited',
            tests: 'skipped',
          });
        } catch {}

        // Re-set task to pending so it can be re-claimed
        try {
          const tasks = this.bridge.commander.db.all('SELECT * FROM tasks WHERE id = ?', task.id);
          if (tasks.length) {
            this.bridge.commander.db.run(`UPDATE tasks SET status = 'todo' WHERE id = ?`, task.id);
          }
        } catch {}

        // Park this session for later wake-up
        this._parkSession(sessionId, task, prompt, worktreePath);

        // Trigger global rate limit
        const waitMatch = fullOutput.match(/(\d+)\s*(second|minute|sec|min)/i);
        const waitSec = waitMatch ? (waitMatch[2].startsWith('min') ? parseInt(waitMatch[1]) * 60 : parseInt(waitMatch[1])) : 0;
        const backoffMs = (waitSec || 30) * 1000 * Math.min(Math.pow(1.5, this._consecutiveRateLimits), 10);
        this._onGlobalRateLimit(Math.round(backoffMs));

        entry.done = true;
        entry.success = false;
        return;
      }

      // GAP 2: If resume failed (non-zero + short run), fallback to fresh -p
      if (isRetry && code !== 0 && duration < 10) {
        console.log(`[${ts()}] ↻ ${sessionId} resume failed, retrying fresh: ${task.id}`);
        entry.done = false;
        task._resumeFailed = true;
        this._spawnWorkerFresh(sessionId, task, prompt, worktreePath, entry);
        return;
      }

      // Parse structured result from output
      const result = this._parseResult(fullOutput);
      result.summary = result.summary || `${task.title} (${duration}s, exit=${code})`;

      if (code === 0) {
        console.log(`[${ts()}] ✓ ${sessionId} done: ${task.id} (${duration}s)`);
        entry.success = true;
        this._consecutiveRateLimits = 0; // Success clears consecutive counter
      } else {
        console.log(`[${ts()}] ✗ ${sessionId} fail: ${task.id} (${duration}s, exit=${code})`);
        result.issues = result.issues || `Exit code ${code}. Log: ${logFile}`;
      }

      this.bridge.submitResult(sessionId, task.id, result);
      entry.done = true;
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      clearInterval(hbTimer);
      console.log(`[${ts()}] ✗ ${sessionId} error: ${err.message}`);
      this.bridge.submitResult(sessionId, task.id, {
        summary: `Spawn error: ${err.message}`,
        issues: err.message,
      });
      entry.done = true;
    });
  }

  /** Resume-failed fallback: spawn fresh with -p */
  _spawnWorkerFresh(sessionId, task, prompt, worktreePath, entry) {
    const cwd = worktreePath || this.projectRoot;
    const logFile = join(this.logsDir, `${task.id}_fresh_${Date.now()}.log`);
    const output = [];
    const startTime = Date.now();

    const args = ['--dangerously-skip-permissions', '--name', `cc24h-${task.id}`, '--max-turns', String(this.maxTurns), '--print', '--output-format', 'text', '-p', '-'];
    const child = spawn('claude', args, { cwd, shell: true, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '50' } });
    child.stdin.write(prompt);
    child.stdin.end();
    child.stdout.on('data', (d) => output.push(d.toString()));
    child.stderr.on('data', (d) => output.push(`[ERR] ${d.toString()}`));
    entry.process = child;

    child.on('close', (code) => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      writeFileSync(logFile, output.join(''));
      const result = this._parseResult(output.join(''));
      result.summary = result.summary || `${task.title} (${duration}s, exit=${code}, fresh-retry)`;
      if (code === 0) { entry.success = true; } else { result.issues = result.issues || `Exit code ${code}`; }
      this.bridge.submitResult(sessionId, task.id, result);
      entry.done = true;
    });
    child.on('error', (err) => { entry.done = true; this.bridge.submitResult(sessionId, task.id, { summary: `Error: ${err.message}`, issues: err.message }); });
  }

  /** Parse structured COMPLETED/FILES_CHANGED/TESTS/ISSUES/NEXT from worker output */
  _parseResult(output) {
    const result = { summary: '', filesChanged: [], tests: 'unknown', issues: '', nextSuggestion: '' };
    const lines = output.split('\n');
    for (const line of lines) {
      const l = line.trim();
      if (l.startsWith('COMPLETED:')) result.summary = l.slice(10).trim();
      else if (l.startsWith('FILES_CHANGED:')) result.filesChanged = l.slice(14).trim().split(',').map(s => s.trim()).filter(Boolean);
      else if (l.startsWith('TESTS:')) result.tests = l.slice(6).trim();
      else if (l.startsWith('ISSUES:')) result.issues = l.slice(7).trim();
      else if (l.startsWith('NEXT:')) result.nextSuggestion = l.slice(5).trim();
      else if (l.startsWith('NEXT_SUGGESTION:')) result.nextSuggestion = l.slice(16).trim();
    }
    return result;
  }

  async _waitAll(timeoutMs) {
    const start = Date.now();
    while (this._activeWorkers.size > 0 && Date.now() - start < timeoutMs) {
      for (const [sid, w] of this._activeWorkers) {
        if (w.done) this._activeWorkers.delete(sid);
      }
      if (this._activeWorkers.size > 0) await sleep(1000);
    }
    // Force kill remaining
    for (const [sid, w] of this._activeWorkers) {
      try { w.process?.kill('SIGKILL'); } catch {}
      this._activeWorkers.delete(sid);
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function ts() { return new Date().toISOString().slice(11, 19); }
