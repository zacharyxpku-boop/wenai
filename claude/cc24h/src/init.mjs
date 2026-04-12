/**
 * cc24h - System Initialization
 * Wires up all components from a single entry point.
 */

import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Database } from './database.mjs';
import { createBackend } from './backends/index.mjs';
import { TaskQueue } from './task-queue.mjs';
import { SessionManager } from './session-manager.mjs';
import { WorktreeManager } from './worktree.mjs';
import { LockManager } from './locks.mjs';
import { HandoffManager } from './handoff.mjs';
import { CheckpointManager } from './checkpoint.mjs';
import { EventLogger } from './events.mjs';
import { Orchestrator } from './orchestrator.mjs';
import { SessionBridge } from './session-bridge.mjs';
import { SkillRegistry, RiskPolicy, SkillEvaluator, SkillSandbox, seedPrioritySkills } from './skill-governance.mjs';

export async function initSystem(projectRoot = null, config = {}) {
  const root = resolve(projectRoot || process.cwd());
  const stateDir = join(root, '.cc24h');

  // Ensure directories
  for (const sub of ['handoffs', 'worklogs', 'checkpoints', 'locks', 'sessions', 'worktrees']) {
    mkdirSync(join(stateDir, sub), { recursive: true });
  }

  // Database
  const db = new Database(join(stateDir, 'state.db'));
  await db.init();

  // Backend
  let backend;
  try {
    backend = await createBackend(config);
  } catch (e) {
    // Return partial system without backend for doctor/review commands
    backend = null;
  }

  // Managers
  const taskQueue = new TaskQueue(db);
  const sessionManager = new SessionManager(db, backend);
  const worktreeManager = new WorktreeManager(root);
  const lockManager = new LockManager(db);
  const handoffManager = new HandoffManager(db, join(stateDir, 'handoffs'));
  const checkpointManager = new CheckpointManager(db, join(stateDir, 'checkpoints'));
  const eventLogger = new EventLogger(db);

  // Orchestrator
  const orchestrator = new Orchestrator({
    db, taskQueue, sessionManager, worktreeManager, lockManager,
    handoffManager, checkpointManager, eventLogger, backend,
    config: {
      maxParallel: config.maxParallel || 2,
      dryRun: config.dryRun || false,
      runMode: config.runMode || 'autonomous',
      logsDir: join(stateDir, 'worklogs'),
      ...config,
    },
  });

  // Session Bridge (connects any session to Commander Core)
  const bridge = new SessionBridge({
    db, taskQueue, sessionManager, worktreeManager, lockManager,
    handoffManager, eventLogger, projectRoot: root,
  });

  // Skill Governance
  const skillRegistry = new SkillRegistry(db, stateDir);
  const riskPolicy = new RiskPolicy(stateDir);
  const skillEvaluator = new SkillEvaluator(skillRegistry, riskPolicy);
  const skillSandbox = new SkillSandbox(skillRegistry, riskPolicy);

  // Seed priority skills on first run
  seedPrioritySkills(skillRegistry);

  return {
    db,
    backend,
    taskQueue,
    sessionManager,
    worktreeManager,
    lockManager,
    handoffManager,
    checkpointManager,
    eventLogger,
    orchestrator,
    bridge,
    skillRegistry,
    riskPolicy,
    skillEvaluator,
    skillSandbox,
    stateDir,
    projectRoot: root,
  };
}
