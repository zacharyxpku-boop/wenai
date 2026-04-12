/**
 * cc24h - Commander System
 * Multi-phase pipeline: rough idea → structured analysis → executable tasks.
 *
 * Pipeline:
 *   Phase A: Idea → Project Definition (positioning, users, goals, MVP scope)
 *   Phase B: Definition → Architecture (tech stack, routes, components, architecture.md)
 *   Phase C: Architecture → Design Spec (brand, style, content, design-spec.md)
 *   Phase D: Design Spec → Task Queue (precise Claude Code prompts as YAML)
 *
 * Each phase reads the codebase + all prior phase outputs to accumulate context.
 * Outputs: .cc24h/commander/<project>/phase-{a,b,c,d}.md + final tasks.yaml
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const TASKS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['tasks'],
  properties: {
    tasks: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'prompt', 'priority', 'agent_role', 'depends_on', 'files_touched'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          prompt: { type: 'string' },
          priority: { type: 'integer', minimum: 1, maximum: 10 },
          agent_role: { type: 'string' },
          depends_on: { type: 'array', items: { type: 'string' } },
          files_touched: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

// ── Phase prompts ──────────────────────────────────────────────────────

const PHASE_A_PROMPT = (idea, existingContext) => `You are a senior product strategist and business analyst. You have been given a rough idea and must produce a precise project definition.

## The Idea
${idea}

${existingContext ? `## Existing Project Context\n${existingContext}\n` : ''}
## Your Task
Analyze this idea thoroughly. Read any existing code in this directory to understand current state. Then output a structured project definition.

## Output Format (Markdown, use these exact headers)

# Project Definition

## Positioning
- What type of product is this? (SaaS / brand site / lead-gen / content site / tool / marketplace / other)
- One-sentence value proposition
- How does this differ from alternatives?

## Target Users
- Primary user persona (role, pain points, goals)
- Secondary personas (if any)

## Business Goals
- Primary conversion goal
- Secondary goals
- Success metrics (KPIs)

## MVP Scope
- What's IN for MVP (numbered list)
- What's OUT for MVP (numbered list)
- Why this cut line?

## Page List
For each page:
- Route path
- Purpose (one sentence)
- Priority (P0 = must-have, P1 = should-have, P2 = nice-to-have)

## Conversion Path
- Entry points (how users arrive)
- Key journey: landing → engagement → conversion
- CTA strategy

## Current State Assessment
- What already exists in the codebase
- What can be reused
- What needs to be built from scratch

Output the definition now. Be specific, not generic.`;


const PHASE_B_PROMPT = (phaseAOutput) => `You are a staff-level software architect. You have a project definition and must produce a technical architecture.

## Project Definition
${phaseAOutput}

## Your Task
Read the codebase thoroughly. Based on the project definition and existing code, produce a complete technical architecture.

## Output Format (Markdown, use these exact headers)

# Architecture

## Tech Stack Decision
For each choice, explain WHY (one line):
- Framework:
- Styling:
- State management:
- Data layer:
- Deployment:
- Build tool:

## Directory Structure
\`\`\`
project-root/
├── ... (show full tree with file descriptions)
\`\`\`

## Route Table
| Route | Component | Data needs | Auth? | Priority |
|-------|-----------|------------|-------|----------|

## Component Breakdown
For each key component:
- Name
- Props/inputs
- Responsibility (one sentence)
- Dependencies

## Data Model
- What entities exist?
- What API calls are needed?
- What's stored locally vs server?

## Infrastructure Needs
- Database: yes/no, which
- CMS: yes/no, which
- Forms/submission handling
- Analytics/tracking
- SEO requirements
- Auth requirements
- Third-party integrations

## Build Phases
- Phase 1 (MVP): what to build first
- Phase 2: what comes next
- Phase 3: future enhancements

## Existing Code Reuse
- What files/modules can be reused as-is
- What needs modification
- What should be deleted

Output the architecture now. Every decision must be justified.`;


const PHASE_C_PROMPT = (phaseAOutput, phaseBOutput) => `You are a senior product designer and content strategist. You have a project definition and architecture, and must produce a design specification.

## Project Definition
${phaseAOutput}

## Architecture
${phaseBOutput}

## Your Task
Based on the product definition and architecture, produce a design and content specification.

## Output Format (Markdown, use these exact headers)

# Design Specification

## Brand Voice & Tone
- Adjectives (3-5 words)
- Writing style
- What to avoid

## Visual Direction
- Color palette (primary, secondary, accent, neutrals — hex values)
- Typography (headings, body)
- Spacing system
- Border radius, shadows
- Dark mode: yes/no

## Homepage Blueprint
For each section (in order):
- Section name
- Purpose
- Content structure (what text, what visuals)
- CTA (if any)
- Technical notes

## Page-by-Page Content Framework
For each page from the architecture:
- Key message
- Section outline
- Copy direction (not full copy, but strategy)
- Social proof / trust signals
- CTA placement

## CTA Strategy
- Primary CTA text and placement
- Secondary CTAs
- Micro-conversions (newsletter, demo, download, etc.)

## Responsive Strategy
- Desktop layout approach
- Tablet breakpoint behavior
- Mobile layout approach

## Interaction Patterns
- Animations (what, where, why)
- Loading states
- Error states
- Empty states

Output the design spec now. Be opinionated, not generic.`;


const PHASE_D_PROMPT = (phaseAOutput, phaseBOutput, phaseCOutput, maxTasks) => `You are an expert Claude Code prompt engineer. You have a complete project definition, architecture, and design spec. Your job is to translate everything into a sequence of precise, executable task prompts.

## Project Definition
${phaseAOutput}

## Architecture
${phaseBOutput}

## Design Specification
${phaseCOutput}

## Your Task
Generate a task queue as YAML. Each task will be sent to a Claude Code agent running with --dangerously-skip-permissions. The agent will receive ONLY the task prompt — it will NOT have access to the documents above. So each prompt must be self-contained.

## Rules
1. Each task prompt must include ALL context the agent needs — file paths, tech choices, styling values, component structures
2. First task: project setup (init, dependencies, config files, directory structure)
3. Then homepage (always first real page)
4. Then other pages in priority order
5. Then features/integrations
6. Last task: a reviewer that runs build, lint, and visual check
7. Max ${maxTasks} tasks
8. Tasks without dependencies should be marked for parallel execution
9. Every prompt ends with: git add and commit with "feat(<task-id>): <description>"
10. Be extremely specific in prompts — include exact color codes, exact component names, exact file paths
11. Include the design spec values directly in each prompt that needs them (colors, fonts, spacing)
12. Never say "refer to design spec" — paste the actual values

## Output Format
Output ONLY valid YAML (no markdown fences, no text before or after):

tasks:
  - id: kebab-case-id
    title: Short descriptive title
    prompt: |
      [Full, self-contained prompt for Claude Code.
       Must include every detail the agent needs.
       Should be 20-60 lines of clear instructions.]
    priority: 1-10
    agent_role: implementer
    depends_on: []
    files_touched:
      - src/path/to/file

Output the YAML now.`;

const PHASE_D_PROMPT_JSON = (phaseAOutput, phaseBOutput, phaseCOutput, maxTasks) => `You are an expert coding-task prompt engineer. You have a complete project definition, architecture, and design spec. Your job is to translate everything into a sequence of precise, executable task prompts.

## Project Definition
${phaseAOutput}

## Architecture
${phaseBOutput}

## Design Specification
${phaseCOutput}

## Your Task
Generate a task queue as JSON matching the provided schema.

## Rules
1. Each task prompt must include ALL context the agent needs — file paths, tech choices, styling values, component structures
2. First task: project setup (init, dependencies, config files, directory structure)
3. Then homepage (always first real page)
4. Then other pages in priority order
5. Then features/integrations
6. Last task: a reviewer that runs build, lint, and visual check
7. Max ${maxTasks} tasks
8. Tasks without dependencies should be marked for parallel execution
9. Every prompt ends with: git add and commit with "feat(<task-id>): <description>"
10. Be extremely specific in prompts — include exact color codes, exact component names, exact file paths
11. Include design values directly in each prompt that needs them
12. Return ONLY JSON matching the schema, with no markdown or commentary

Output the JSON now.`;

const REVIEW_PROMPT_JSON = (phaseA, phaseB, executionSummary, maxTasks) => `You are a tech lead reviewing completed work and planning next steps.

## Project Definition
${phaseA.slice(0, 3000)}

## Architecture
${phaseB.slice(0, 3000)}

## Execution Results
${executionSummary}

## Your Task
1. Review what was completed
2. Identify what still needs to be done
3. Generate the next batch of tasks
4. Return ONLY JSON matching the provided schema

Max ${maxTasks} tasks. Focus on what's most important next.`;


// ── Commander class ────────────────────────────────────────────────────

export class Commander {
  constructor(backend, projectRoot) {
    this.backend = backend;
    this.projectRoot = projectRoot;
    this.outputDir = join(projectRoot, '.cc24h', 'commander');
    mkdirSync(this.outputDir, { recursive: true });
  }

  /** Run a single phase via Claude */
  async _runPhase(name, prompt, opts = {}) {
    const { timeout = 8 * 60 * 1000, outputSchema = null } = opts;
    console.log(`\n── Phase ${name} ──`);

    const result = await this.backend.runPrompt(prompt, {
      cwd: this.projectRoot,
      maxTurns: 40,
      timeout,
      outputSchema,
    });

    if (!result.success) {
      throw new Error(`Phase ${name} failed (exit ${result.exitCode}): ${result.output.slice(0, 300)}`);
    }

    // Save phase output
    const outPath = join(this.outputDir, `phase-${name.toLowerCase()}.md`);
    writeFileSync(outPath, result.output);
    console.log(`  ✓ Saved → ${outPath} (${result.duration}s)`);

    return result.output;
  }

  /** Read existing project context (README, package.json, etc.) */
  _getExistingContext() {
    const files = ['README.md', 'package.json', 'architecture.md', 'progress.md', 'design-spec.md'];
    const parts = [];
    for (const f of files) {
      const p = join(this.projectRoot, f);
      if (existsSync(p)) {
        const content = readFileSync(p, 'utf-8').slice(0, 2000);
        parts.push(`### ${f}\n\`\`\`\n${content}\n\`\`\``);
      }
    }
    if (existsSync(join(this.projectRoot, 'docs'))) {
      parts.push(`### docs/ directory exists`);
    }
    return parts.length > 0 ? parts.join('\n\n') : '';
  }

  /** Load a previously saved phase output */
  _loadPhase(name) {
    const p = join(this.outputDir, `phase-${name.toLowerCase()}.md`);
    if (existsSync(p)) return readFileSync(p, 'utf-8');
    return null;
  }

  /**
   * Run the full commander pipeline.
   * @param {string} idea - The rough idea from the user
   * @param {object} opts - { maxTasks, skipTo, phases }
   * @returns {{ tasks, yamlPath, phases }}
   */
  async run(idea, opts = {}) {
    const { maxTasks = 10, skipTo = null, phases = ['a', 'b', 'c', 'd'] } = opts;
    const results = {};
    const structuredTasks = this.backend?.type === 'codex';

    console.log('╔══════════════════════════════════════╗');
    console.log('║      CC24H COMMANDER SYSTEM          ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`\nIdea: "${idea.slice(0, 80)}${idea.length > 80 ? '...' : ''}"`);
    console.log(`Target: ${this.projectRoot}`);
    console.log(`Max tasks: ${maxTasks}`);

    // Gather existing context
    let existingContext = '';
    try {
      const files = ['README.md', 'package.json', 'architecture.md', 'progress.md', 'design-spec.md'];
      const parts = [];
      for (const f of files) {
        const p = join(this.projectRoot, f);
        if (existsSync(p)) {
          const content = readFileSync(p, 'utf-8').slice(0, 2000);
          parts.push(`### ${f}\n\`\`\`\n${content}\n\`\`\``);
        }
      }
      existingContext = parts.join('\n\n');
    } catch {}

    // Phase A: Project Definition
    if (phases.includes('a')) {
      const cached = skipTo && skipTo !== 'a' ? this._loadPhase('a') : null;
      results.a = cached || await this._runPhase('A', PHASE_A_PROMPT(idea, existingContext));
    }

    // Phase B: Architecture
    if (phases.includes('b')) {
      const cached = skipTo && !['a', 'b'].includes(skipTo) ? this._loadPhase('b') : null;
      results.b = cached || await this._runPhase('B', PHASE_B_PROMPT(results.a));
    }

    // Phase C: Design Spec
    if (phases.includes('c')) {
      const cached = skipTo && !['a', 'b', 'c'].includes(skipTo) ? this._loadPhase('c') : null;
      results.c = cached || await this._runPhase('C', PHASE_C_PROMPT(results.a, results.b));
    }

    // Phase D: Task Generation
    let tasks = [];
    let yamlPath = null;
    if (phases.includes('d')) {
      const rawD = await this._runPhase(
        'D',
        structuredTasks ? PHASE_D_PROMPT_JSON(results.a, results.b, results.c, maxTasks) : PHASE_D_PROMPT(results.a, results.b, results.c, maxTasks),
        structuredTasks ? { outputSchema: TASKS_JSON_SCHEMA } : {}
      );

      try {
        if (structuredTasks) {
          tasks = JSON.parse(rawD.trim())?.tasks || [];
        } else {
          let yamlText = rawD.trim();
          yamlText = yamlText.replace(/^```ya?ml?\n?/i, '').replace(/\n?```$/i, '').trim();
          const parsed = yaml.load(yamlText);
          tasks = parsed?.tasks || [];
        }
      } catch {
        if (!structuredTasks) {
          let yamlText = rawD.trim();
          yamlText = yamlText.replace(/^```ya?ml?\n?/i, '').replace(/\n?```$/i, '').trim();
          const match = yamlText.match(/tasks:\n([\s\S]+)/);
          if (match) {
            try {
              tasks = yaml.load('tasks:\n' + match[1])?.tasks || [];
            } catch (e2) {
              console.error(`Failed to parse task YAML: ${e2.message}`);
              console.error(`Raw output saved to phase-d.md for manual review`);
            }
          }
        }
      }

      if (tasks.length > 0) {
        yamlPath = join(this.outputDir, `tasks-${Date.now()}.yaml`);
        writeFileSync(yamlPath, yaml.dump({ tasks }, { lineWidth: 120 }));
        console.log(`\n── Results ──`);
        console.log(`Generated ${tasks.length} executable tasks → ${yamlPath}`);
        for (const t of tasks) {
          const deps = t.depends_on?.length ? ` [after: ${t.depends_on.join(',')}]` : ' [parallel]';
          console.log(`  P${t.priority || '?'} ${t.id} — ${t.title}${deps}`);
        }
      }
    }

    // Save progress.md to project root
    this._writeProgressFile(idea, results, tasks);

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║         COMMANDER COMPLETE           ║');
    console.log('╚══════════════════════════════════════╝');

    return { tasks, yamlPath, phases: results };
  }

  /** Write/update progress.md in project root */
  _writeProgressFile(idea, phases, tasks) {
    const content = `# Project Progress

## Original Idea
${idea}

## Phase Outputs
${phases.a ? '- [x] Phase A: Project Definition → .cc24h/commander/phase-a.md' : '- [ ] Phase A'}
${phases.b ? '- [x] Phase B: Architecture → .cc24h/commander/phase-b.md' : '- [ ] Phase B'}
${phases.c ? '- [x] Phase C: Design Spec → .cc24h/commander/phase-c.md' : '- [ ] Phase C'}
${tasks.length > 0 ? `- [x] Phase D: ${tasks.length} tasks generated` : '- [ ] Phase D'}

## Task Summary
${tasks.map(t => `- [ ] ${t.id}: ${t.title}`).join('\n') || 'No tasks yet'}

## Last Updated
${new Date().toISOString()}
`;
    writeFileSync(join(this.projectRoot, 'progress.md'), content);
  }

  /**
   * Review phase: take execution results and generate next round of tasks.
   * Used after workers complete tasks — the commander reviews and plans next steps.
   */
  async review(executionSummary, opts = {}) {
    const { maxTasks = 5 } = opts;
    const structuredTasks = this.backend?.type === 'codex';

    // Load previous phases
    const phaseA = this._loadPhase('a') || '';
    const phaseB = this._loadPhase('b') || '';
    const phaseC = this._loadPhase('c') || '';

    const prompt = structuredTasks ? REVIEW_PROMPT_JSON(phaseA, phaseB, executionSummary, maxTasks) : `You are a tech lead reviewing completed work and planning next steps.

## Project Definition
${phaseA.slice(0, 3000)}

## Architecture
${phaseB.slice(0, 3000)}

## Execution Results
${executionSummary}

## Your Task
1. Review what was completed
2. Identify what still needs to be done
3. Generate the next batch of tasks

## Output Format
Output ONLY valid YAML:

tasks:
  - id: kebab-case-id
    title: Short title
    prompt: |
      [Self-contained prompt with all context needed]
    priority: 1-10
    agent_role: implementer
    depends_on: []
    files_touched: []

Max ${maxTasks} tasks. Focus on what's most important next.`;

    const result = await this.backend.runPrompt(prompt, {
      cwd: this.projectRoot,
      maxTurns: 20,
      timeout: 5 * 60 * 1000,
      outputSchema: structuredTasks ? TASKS_JSON_SCHEMA : null
    });

    if (!result.success) {
      throw new Error(`Review failed: ${result.output.slice(0, 200)}`);
    }

    let tasks = [];
    if (structuredTasks) {
      try {
        tasks = JSON.parse(result.output.trim())?.tasks || [];
      } catch {}
    } else {
      let yamlText = result.output.trim().replace(/^```ya?ml?\n?/i, '').replace(/\n?```$/i, '');
      try {
        tasks = yaml.load(yamlText)?.tasks || [];
      } catch {
        const match = yamlText.match(/tasks:\n([\s\S]+)/);
        if (match) {
          try { tasks = yaml.load('tasks:\n' + match[1])?.tasks || []; } catch {}
        }
      }
    }

    if (tasks.length > 0) {
      const yamlPath = join(this.outputDir, `review-tasks-${Date.now()}.yaml`);
      writeFileSync(yamlPath, yaml.dump({ tasks }, { lineWidth: 120 }));
      return { tasks, yamlPath };
    }

    return { tasks: [], yamlPath: null };
  }
}
