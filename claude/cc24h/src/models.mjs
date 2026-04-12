/**
 * cc24h - Data Models
 * All core data structures used across the system.
 */

// ===== Enums =====

export const TaskStatus = {
  TODO: 'todo',
  RUNNING: 'running',
  BLOCKED: 'blocked',
  REVIEW: 'review',
  DONE: 'done',
  FAILED: 'failed',
  QUARANTINED: 'quarantined',
};

export const SessionStatus = {
  IDLE: 'idle',
  ACTIVE: 'active',
  PAUSED: 'paused',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  FAILED: 'failed',
  STALE: 'stale',
};

export const AgentRole = {
  COORDINATOR: 'coordinator',
  PLANNER: 'planner',
  IMPLEMENTER: 'implementer',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
  MERGE_MANAGER: 'merge-manager',
  RECOVERY: 'recovery-agent',
};

export const TaskPhase = {
  PLANNING: 'planning',
  CODING: 'coding',
  TESTING: 'testing',
  REVIEWING: 'reviewing',
  MERGING: 'merging',
};

export const BackendType = {
  CLI: 'cli',
  SDK: 'sdk',
  CODEX: 'codex',
};

export const RunMode = {
  INTERACTIVE: 'interactive',
  AUTONOMOUS: 'autonomous',
  NIGHT: 'night',
};

// ===== Validation helpers =====

function required(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null) {
      throw new Error(`Missing required field: ${f}`);
    }
  }
}

function defaults(obj, defs) {
  const result = { ...defs, ...obj };
  return result;
}

// ===== Model factories =====

export function createTask(data) {
  required(data, ['id', 'title', 'prompt']);
  return defaults(data, {
    status: TaskStatus.TODO,
    priority: 5,
    agent_role: null,
    session_id: null,
    branch: null,
    worktree: null,
    phase: null,
    depends_on: [],
    files_touched: [],
    retry_count: 0,
    max_retries: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    error: null,
    checkpoint_id: null,
    tags: [],
  });
}

export function createSession(data) {
  required(data, ['id', 'display_name']);
  return defaults(data, {
    backend_type: BackendType.CLI,
    backend_session_ref: null,
    task_id: null,
    agent_role: null,
    branch: null,
    worktree: null,
    model: 'claude-sonnet-4-20250514',
    status: SessionStatus.IDLE,
    phase: null,
    last_heartbeat: new Date().toISOString(),
    summary: '',
    next_action: '',
    blocker: null,
    retry_count: 0,
    pid: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export function createHandoff(data) {
  required(data, ['from_session', 'to_session', 'task_id']);
  return defaults(data, {
    id: `handoff-${Date.now()}`,
    goal: '',
    completed: [],
    remaining: [],
    files_modified: [],
    test_results: '',
    risks: '',
    next_steps: '',
    can_parallel: false,
    created_at: new Date().toISOString(),
  });
}

export function createCheckpoint(data) {
  required(data, ['session_id', 'task_id']);
  return defaults(data, {
    id: `cp-${Date.now()}`,
    branch: null,
    commit_sha: null,
    phase: null,
    summary: '',
    files_snapshot: [],
    created_at: new Date().toISOString(),
  });
}

export function createLock(data) {
  required(data, ['path', 'session_id']);
  return defaults(data, {
    id: `lock-${Date.now()}`,
    type: 'file', // file | directory
    acquired_at: new Date().toISOString(),
    expires_at: null,
  });
}

export function createEvent(data) {
  required(data, ['type', 'message']);
  return defaults(data, {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    session_id: null,
    task_id: null,
    level: 'info', // info | warn | error | decision
    created_at: new Date().toISOString(),
  });
}
