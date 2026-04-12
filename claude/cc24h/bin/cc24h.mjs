#!/usr/bin/env node

/**
 * cc24h - CLI Entry Point
 * 24H Autonomous Claude Code Orchestration System
 *
 * Command groups:
 *   Ops:     tui, daemon, doctor, review, status, sync
 *   Tasks:   enqueue, plan, commander
 *   Bridge:  register, claim, submit, next, context (any session → Commander Core)
 */

import { program } from 'commander';
import { resolve } from 'path';
import { existsSync } from 'fs';
import yaml from 'js-yaml';
import { initSystem } from '../src/init.mjs';
import { acquireProjectCliLock } from '../src/cli-lock.mjs';

// Helper: -p is always project root
const pOpt = (cmd) => cmd.option('-p, --project <path>', 'Project root', '.');
const backendOpt = (cmd) => cmd.option('--backend <type>', 'Backend: auto|claude|sdk|codex', 'auto');

program.name('cc24h').description('24H Autonomous Claude Code Orchestration').version('0.2.0');

const activeProjectLocks = new WeakMap();

program.hook('preAction', async (_thisCommand, actionCommand) => {
  const opts = typeof actionCommand.optsWithGlobals === 'function'
    ? actionCommand.optsWithGlobals()
    : actionCommand.opts();

  if (!Object.prototype.hasOwnProperty.call(opts, 'project')) return;

  const release = await acquireProjectCliLock(resolve(opts.project || '.'), {
    command: actionCommand.name(),
  });
  activeProjectLocks.set(actionCommand, release);
});

program.hook('postAction', async (_thisCommand, actionCommand) => {
  const release = activeProjectLocks.get(actionCommand);
  if (!release) return;
  activeProjectLocks.delete(actionCommand);
  release();
});

// ═══════════════════════════════════════════════════════════
// OPS
// ═══════════════════════════════════════════════════════════

pOpt(program.command('tui').description('Terminal dashboard'))
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    const { TuiApp } = await import('../src/tui/app.mjs');
    new TuiApp(sys).start();
  });

backendOpt(pOpt(program.command('daemon').description('Autonomous mode')))
  .option('-q, --queue <file>', 'Import YAML before starting')
  .option('--max-parallel <n>', 'Max parallel tasks', '2')
  .option('--dry-run', 'Simulate')
  .option('--night', 'Night mode')
  .action(async (opts) => {
    const sys = await initSystem(opts.project, {
      backend: opts.backend,
      maxParallel: parseInt(opts.maxParallel), dryRun: opts.dryRun || false,
      runMode: opts.night ? 'night' : 'autonomous',
    });
    if (!sys.backend) { console.error('No backend. Run: cc24h doctor'); process.exit(1); }
    if (opts.queue) {
      const n = sys.taskQueue.importFromYaml(resolve(opts.queue));
      console.log(`Imported ${n.length} tasks`);
    }
    console.log(`Daemon: parallel=${opts.maxParallel} mode=${opts.night ? 'night' : 'auto'} dry=${!!opts.dryRun}`);
    process.on('SIGINT', () => { sys.orchestrator.stop(); sys.db.save(); process.exit(0); });
    await sys.orchestrator.runLoop();
  });

backendOpt(pOpt(program.command('doctor').description('Health check')))
  .action(async (opts) => {
    const { execSync } = await import('child_process');
    console.log('cc24h Doctor\n');
    console.log(`[✓] Node.js ${process.version}`);
    try { console.log(`[✓] ${execSync('git --version', { encoding: 'utf-8' }).trim()}`); } catch { console.log('[✗] Git'); }
    try { console.log(`[✓] Claude CLI: ${execSync('claude --version', { encoding: 'utf-8', shell: true }).trim()}`); } catch { console.log('[✗] Claude CLI'); }
    try { await import('@anthropic-ai/claude-code'); console.log('[✓] Agent SDK'); } catch { console.log('[~] Agent SDK not installed (CLI fallback)'); }

    const sys = await initSystem(opts.project, { backend: opts.backend });
    const isGit = sys.worktreeManager.isGitRepo();
    console.log(`\nProject: ${resolve(opts.project)}`);
    console.log(`Git: ${isGit ? `yes (${sys.worktreeManager.getCurrentBranch()})` : 'no → worktree isolation unavailable'}`);
    if (isGit) console.log(`Worktrees: ${sys.worktreeManager.list().length}`);
    if (sys.backend) {
      const info = sys.backend.getInfo?.() || { type: sys.backend.type };
      console.log(`Backend: ${info.type}${info.version ? ` (${info.version})` : ''}`);
    } else {
      console.log(`Backend: unavailable (requested=${opts.backend})`);
    }

    const cs = sys.bridge.status();
    console.log(`\nCommander: ${cs.sessions} sessions, ${cs.activeSessions} active`);
    console.log(`Tasks: todo=${cs.taskStats.todo} run=${cs.taskStats.running} review=${cs.taskStats.review} done=${cs.taskStats.done} fail=${cs.taskStats.failed}`);
    console.log(`Locks: ${cs.locks}`);
    sys.db.save();
  });

pOpt(program.command('review').description('Morning review'))
  .action(async (opts) => { const sys = await initSystem(opts.project); console.log(sys.orchestrator.generateReview()); sys.db.save(); });

pOpt(program.command('status').description('Quick status'))
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    const cs = sys.bridge.status();
    console.log('cc24h Status');
    console.log('─────────────');
    console.log(`Tasks:    todo=${cs.taskStats.todo} run=${cs.taskStats.running} review=${cs.taskStats.review} done=${cs.taskStats.done} fail=${cs.taskStats.failed} total=${cs.taskStats.total}`);
    console.log(`Sessions: ${cs.sessions} total │ ${cs.activeSessions} active │ ${cs.idleSessions} idle │ ${cs.staleSessions} stale`);
    console.log(`Locks:    ${cs.locks}`);
    console.log(`Last:     ${cs.lastDecision} (${cs.lastDecisionAt})`);
    sys.db.save();
  });

pOpt(program.command('sync').description('Clean locks + recover stale'))
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    const locksCleaned = sys.lockManager.cleanExpired();
    const staleOld = sys.sessionManager.detectStale();
    const staleCmd = sys.bridge.commander.recoverStaleSessions();
    const { RuntimeIntegrityAuditor } = await import('../src/runtime-audit.mjs');
    const audit = new RuntimeIntegrityAuditor({
      taskQueue: sys.taskQueue,
      projectRoot: sys.projectRoot,
      auditDir: resolve(sys.projectRoot, '.cc24h', 'audits'),
    }).run({ repair: true });

    console.log(
      `Sync: ${locksCleaned} locks cleaned, ${staleOld.length + staleCmd.length} stale sessions recovered, ${audit.findings_count} integrity findings, ${audit.reopened_count} tasks reopened`
    );
    if (audit.reopened_count > 0) {
      console.log(`Reopened: ${audit.reopened.map((item) => item.task_id).join(', ')}`);
    }
    console.log(`Audit: ${audit.reportPath}`);
    console.log(`Tasks: ${JSON.stringify(sys.taskQueue.getStats())}`);
    sys.db.save();
  });

pOpt(program.command('resume').description('Resume failed session'))
  .option('--session <id>', 'Session ID')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    if (opts.session) {
      const s = await sys.sessionManager.recover(opts.session);
      console.log(s ? `Recovered: ${s.id}` : `Not found: ${opts.session}`);
    } else {
      const rec = sys.sessionManager.getAll().filter(s => ['failed', 'paused', 'stale'].includes(s.status));
      if (!rec.length) { console.log('No recoverable sessions.'); } else {
        console.log('Recoverable:');
        for (const s of rec) console.log(`  ${s.id} (${s.status}) ${s.display_name}`);
        console.log('\nUse: cc24h resume --session <id>');
      }
    }
    sys.db.save();
  });

// ═══════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════

pOpt(program.command('enqueue <file>').description('Import tasks from YAML'))
  .action(async (file, opts) => {
    const sys = await initSystem(opts.project);
    const imported = sys.taskQueue.importFromYaml(resolve(file));
    console.log(`Imported ${imported.length} task(s):`);
    for (const t of imported) console.log(`  [P${t.priority}] ${t.id} — ${t.title}`);
    sys.db.save();
  });

backendOpt(pOpt(program.command('plan <goal>').description('Quick: Claude/Codex → task YAML')))
  .option('--max-tasks <n>', 'Max tasks', '8')
  .option('--run', 'Immediately start daemon')
  .action(async (goal, opts) => {
    const sys = await initSystem(opts.project, { backend: opts.backend });
    if (!sys.backend) { console.error('No backend.'); process.exit(1); }
    const { Planner } = await import('../src/planner.mjs');
    try {
      const { yamlPath } = await new Planner(sys.backend, resolve(opts.project)).plan(goal, { maxTasks: parseInt(opts.maxTasks) });
      const imported = sys.taskQueue.importFromYaml(yamlPath);
      console.log(`Enqueued ${imported.length} tasks.`);
      sys.db.save();
      if (opts.run) { process.on('SIGINT', () => { sys.orchestrator.stop(); sys.db.save(); process.exit(0); }); await sys.orchestrator.runLoop(); }
    } catch (e) { console.error(`Plan failed: ${e.message}`); process.exit(1); }
  });

backendOpt(pOpt(program.command('commander <idea>').description('Full pipeline: idea → 4 phases → tasks')))
  .option('--max-tasks <n>', '', '10')
  .option('--phases <list>', '', 'a,b,c,d')
  .option('--skip-to <phase>', 'Reuse cached earlier phases')
  .option('--run', 'Start daemon after')
  .option('--max-parallel <n>', '', '2')
  .action(async (idea, opts) => {
    const sys = await initSystem(opts.project, { backend: opts.backend });
    if (!sys.backend) { console.error('No backend.'); process.exit(1); }
    const { Commander } = await import('../src/commander.mjs');
    try {
      const { tasks, yamlPath } = await new Commander(sys.backend, resolve(opts.project)).run(idea, {
        maxTasks: parseInt(opts.maxTasks), phases: opts.phases.split(',').map(s => s.trim()), skipTo: opts.skipTo,
      });
      if (yamlPath && tasks.length > 0) {
        const imported = sys.taskQueue.importFromYaml(yamlPath);
        console.log(`Enqueued ${imported.length} tasks.`);
        sys.db.save();
        if (opts.run) { process.on('SIGINT', () => { sys.orchestrator.stop(); sys.db.save(); process.exit(0); }); await sys.orchestrator.runLoop(); }
      }
    } catch (e) { console.error(`Commander failed: ${e.message}`); process.exit(1); }
  });

// ═══════════════════════════════════════════════════════════
// BRIDGE — Any session talks to Commander Core via these
// ═══════════════════════════════════════════════════════════

pOpt(program.command('register').description('Register session with Commander'))
  .requiredOption('-s, --session <id>', 'Session ID')
  .option('-r, --role <role>', 'Role: builder/reviewer/qa-operator/market-growth', 'builder')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    sys.bridge.register(opts.session, opts.role);
    console.log(`✓ Registered: ${opts.session} (${opts.role})`);
    sys.db.save();
  });

pOpt(program.command('claim').description('Get next task from Commander'))
  .requiredOption('-s, --session <id>', 'Session ID')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    const r = sys.bridge.claimTask(opts.session);
    if (r.task) {
      console.log(`\n═══ TASK: ${r.task.id} ═══`);
      console.log(`Title:    ${r.task.title}`);
      console.log(`Priority: ${r.task.priority}`);
      if (r.worktree) console.log(`Worktree: ${r.worktree}`);
      if (r.branch) console.log(`Branch:   ${r.branch}`);
      const locks = sys.lockManager.getBySession(opts.session);
      if (locks.length) console.log(`Locks:    ${locks.map(l => l.path).join(', ')}`);
      console.log(`\n─── PROMPT ───\n`);
      console.log(r.prompt);
    } else {
      console.log(r.decision);
    }
    sys.db.save();
  });

pOpt(program.command('submit').description('Submit result to Commander'))
  .requiredOption('-s, --session <id>', 'Session ID')
  .requiredOption('-t, --task <id>', 'Task ID')
  .option('--summary <text>', '', '')
  .option('--files <list>', 'Changed files (comma-sep)', '')
  .option('--tests <result>', '', 'unknown')
  .option('--issues <text>', '', '')
  .option('--next <text>', '', '')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    const r = sys.bridge.submitResult(opts.session, opts.task, {
      summary: opts.summary, filesChanged: opts.files ? opts.files.split(',').map(s => s.trim()) : [],
      tests: opts.tests, issues: opts.issues, nextSuggestion: opts.next,
    });
    console.log(r.message);
    sys.db.save();
  });

pOpt(program.command('next').description('Continue current or get new task'))
  .requiredOption('-s, --session <id>', 'Session ID')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    const r = sys.bridge.nextPrompt(opts.session);
    if (r.prompt) {
      console.log(`═══ ${r.taskId || 'TASK'} ═══`);
      if (r.worktree) console.log(`Worktree: ${r.worktree}`);
      if (r.branch) console.log(`Branch:   ${r.branch}`);
      console.log(`\n${r.prompt}`);
    } else { console.log(r.message || r.decision || 'No work.'); }
    sys.db.save();
  });

pOpt(program.command('context').description('Commander project context'))
  .option('-s, --session <id>', 'Session ID (optional, for sync)')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    if (opts.session) {
      console.log(yaml.dump(sys.bridge.syncContext(opts.session), { lineWidth: 120 }));
    } else {
      console.log(sys.bridge.context());
    }
    sys.db.save();
  });

pOpt(program.command('request-review').description('Move current task to review'))
  .requiredOption('-s, --session <id>', 'Session ID')
  .action(async (opts) => {
    const sys = await initSystem(opts.project);
    console.log(sys.bridge.requestReview(opts.session).message);
    sys.db.save();
  });

// ═══════════════════════════════════════════════════════════
// AUTONOMOUS — Commander drives workers automatically
// ═══════════════════════════════════════════════════════════

backendOpt(pOpt(program.command('run').description('Commander auto-loop: claim → spawn workers → submit → repeat')))
  .option('-q, --queue <file>', 'Import YAML before starting')
  .option('--max-parallel <n>', 'Max parallel workers', '2')
  .option('--max-turns <n>', 'Max turns per worker', '80')
  .option('--timeout <sec>', 'Per-task timeout in seconds', '1200')
  .option('--dry-run', 'Simulate without spawning Claude')
  .action(async (opts) => {
    const sys = await initSystem(opts.project, { backend: opts.backend });
    if (!sys.backend) { console.error('No backend. Run: cc24h doctor'); process.exit(1); }

    if (opts.queue) {
      const imported = sys.taskQueue.importFromYaml(resolve(opts.queue));
      console.log(`Imported ${imported.length} tasks`);
    }

    const { AutonomousLoop } = await import('../src/autonomous.mjs');
    const loop = new AutonomousLoop({
      bridge: sys.bridge,
      backend: sys.backend,
      projectRoot: sys.projectRoot,
      config: {
        maxParallel: parseInt(opts.maxParallel),
        maxTurns: parseInt(opts.maxTurns),
        taskTimeout: parseInt(opts.timeout) * 1000,
        dryRun: opts.dryRun || false,
      },
    });

    await loop.run();
    sys.db.save();
  });

// ═══════════════════════════════════════════════════════════
// GO — One command: plan + auto-execute (the ultimate shortcut)
// ═══════════════════════════════════════════════════════════

backendOpt(pOpt(program.command('go <idea>').description('Commander plans + auto-executes everything')))
  .option('--max-tasks <n>', 'Max tasks to generate', '8')
  .option('--max-parallel <n>', 'Max parallel workers', '2')
  .option('--dry-run', 'Simulate')
  .action(async (idea, opts) => {
    const sys = await initSystem(opts.project, { backend: opts.backend });
    if (!sys.backend) { console.error('No backend.'); process.exit(1); }

    // Phase 1: Commander plans
    console.log('Phase 1: Commander planning...\n');
    const { Commander } = await import('../src/commander.mjs');
    try {
      const { tasks, yamlPath } = await new Commander(sys.backend, resolve(opts.project)).run(idea, {
        maxTasks: parseInt(opts.maxTasks),
      });

      if (!yamlPath || tasks.length === 0) {
        console.error('Commander generated no tasks.');
        process.exit(1);
      }

      const imported = sys.taskQueue.importFromYaml(yamlPath);
      console.log(`\nPhase 1 done: ${imported.length} tasks enqueued.\n`);
      sys.db.save();
    } catch (e) {
      console.error(`Planning failed: ${e.message}`);
      process.exit(1);
    }

    // Phase 2: Auto-execute
    console.log('Phase 2: Auto-executing...\n');
    const { AutonomousLoop } = await import('../src/autonomous.mjs');
    const loop = new AutonomousLoop({
      bridge: sys.bridge,
      backend: sys.backend,
      projectRoot: sys.projectRoot,
      config: {
        maxParallel: parseInt(opts.maxParallel),
        dryRun: opts.dryRun || false,
      },
    });

    await loop.run();
    sys.db.save();
  });

// ═══════════════════════════════════════════════════════════
// SKILL GOVERNANCE
// ═══════════════════════════════════════════════════════════

pOpt(program.command('skill').description('Skill governance commands'))
  .argument('[action]', 'list|show|add|promote|disable|audit|report|check', 'list')
  .argument('[target]', 'skill ID (for show/promote/disable/audit)')
  .option('--status <s>', 'Filter by status')
  .option('--category <c>', 'Filter by category')
  .option('--risk <l>', 'Filter by risk level')
  .option('--limit <n>', 'Audit log limit', '20')
  .action(async (action, target, opts) => {
    const sys = await initSystem(opts.project);
    const { RISK_LEVELS } = await import('../src/skill-governance.mjs');

    switch (action) {
      case 'list': {
        const where = {};
        if (opts.status) where.status = opts.status;
        if (opts.category) where.category = opts.category;
        const skills = sys.skillRegistry.getAll(where);

        if (skills.length === 0) { console.log('No skills found.'); break; }

        console.log('═══ Skills Registry ═══\n');
        console.log(`${'ID'.padEnd(24)} ${'Risk'.padEnd(5)} ${'Status'.padEnd(12)} ${'Uses'.padEnd(6)} ${'Score'.padEnd(7)} Category`);
        console.log('─'.repeat(80));
        for (const s of skills) {
          if (opts.risk && s.risk_level !== opts.risk) continue;
          console.log(
            `${(s.id || '').padEnd(24)} ${(s.risk_level || '').padEnd(5)} ${(s.status || '').padEnd(12)} ${String(s.use_count || 0).padEnd(6)} ${String(s.adoption_score || 0).padEnd(7)} ${s.category || ''}`
          );
        }
        console.log(`\nTotal: ${skills.length}`);
        break;
      }

      case 'show': {
        if (!target) { console.error('Usage: skill show <id>'); break; }
        const s = sys.skillRegistry.get(target);
        if (!s) { console.error(`Not found: ${target}`); break; }
        console.log(yaml.dump(s, { lineWidth: 120 }));
        break;
      }

      case 'add': {
        if (!target) { console.error('Usage: skill add <id> (then edit the YAML)'); break; }
        const s = sys.skillRegistry.add({
          id: target, name: target, purpose: 'New skill (edit YAML to configure)',
          category: opts.category || 'general', risk_level: opts.risk || 'L1',
        });
        console.log(`Added: ${s.id} (${s.status})`);
        console.log(`Edit: ${sys.stateDir}/skills/${s.category}/${s.id}.yaml`);
        break;
      }

      case 'promote': {
        if (!target) { console.error('Usage: skill promote <id>'); break; }
        try {
          const s = sys.skillRegistry.promote(target, 'manual CLI promotion');
          console.log(`Promoted: ${s.id} → ${s.status}`);
        } catch (e) { console.error(e.message); }
        break;
      }

      case 'disable': {
        if (!target) { console.error('Usage: skill disable <id>'); break; }
        try {
          const s = sys.skillRegistry.disable(target, 'manual CLI disable');
          console.log(`Disabled: ${s.id}`);
        } catch (e) { console.error(e.message); }
        break;
      }

      case 'audit': {
        const logs = sys.skillRegistry.getAuditLog(target, parseInt(opts.limit));
        if (logs.length === 0) { console.log('No audit entries.'); break; }
        console.log(`═══ Skill Audit ${target ? `(${target})` : '(all)'} ═══\n`);
        for (const a of logs) {
          const time = (a.created_at || '').slice(0, 16);
          console.log(`${time}  ${(a.action || '').padEnd(30)} ${(a.skill_id || '').padEnd(20)} ${a.result || ''}`);
          if (a.failure_reason) console.log(`          REASON: ${a.failure_reason}`);
        }
        break;
      }

      case 'report': {
        console.log(sys.skillEvaluator.weeklyReport());
        break;
      }

      case 'check': {
        if (!target) { console.error('Usage: skill check <id> (checks policy)'); break; }
        const s = sys.skillRegistry.get(target);
        if (!s) { console.error(`Not found: ${target}`); break; }
        const result = sys.riskPolicy.check(s, {
          files: (s.scope || []),
          tags: [],
        });
        console.log(`Skill: ${s.id} (${s.risk_level}, ${s.status})`);
        if (result.allowed) {
          console.log('Policy check: ALLOWED');
        } else {
          console.log('Policy check: BLOCKED');
          for (const i of result.issues) console.log(`  - ${i}`);
        }

        const prom = sys.riskPolicy.canPromote(s);
        console.log(`Promotion: ${prom.ready ? 'READY' : 'NOT READY'} (${prom.reason})`);
        break;
      }

      default:
        console.error(`Unknown action: ${action}. Use: list|show|add|promote|disable|audit|report|check`);
    }

    sys.db.save();
  });

program.parse();
