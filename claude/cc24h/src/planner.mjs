/**
 * cc24h - Auto Planner
 * Uses Claude to analyze a project and generate a task queue automatically.
 * Flow: goal → Claude deep-analyzes codebase → outputs structured YAML tasks → enqueue
 */

import { writeFileSync, mkdirSync } from 'fs';
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

export class Planner {
  constructor(backend, projectRoot) {
    this.backend = backend;
    this.projectRoot = projectRoot;
  }

  /**
   * Given a high-level goal, use Claude to analyze the project and produce tasks.
   * @param {string} goal - What the user wants to achieve
   * @param {object} opts - { maxTasks, parallel, dryRun }
   * @returns {object} { tasks: [], yamlPath, raw }
   */
  async plan(goal, opts = {}) {
    const { maxTasks = 8, parallel = true } = opts;
    const structuredOutput = this.backend?.type === 'codex';

    const prompt = structuredOutput
      ? `You are a senior software architect planning work for an autonomous coding system.

## Your Mission
Analyze this project's codebase thoroughly, then break down the following goal into concrete, atomic tasks.

## Goal
${goal}

## Output Requirement
Return ONLY a JSON object matching the provided schema.

## Rules
1. Each task must be independently executable by a coding agent
2. Task prompts must be specific: name files, functions, patterns to follow
3. Use depends_on when task B needs task A's output
4. Tasks without dependencies can run in parallel — maximize this
5. files_touched must list files that will be MODIFIED (for lock conflict detection)
6. Max ${maxTasks} tasks
7. Priority 1 = do first, 10 = do last
8. agent_role: use "implementer" for code changes, "tester" for test writing, "reviewer" for review tasks
9. Read the actual codebase to understand the tech stack, patterns, and conventions before planning
10. The final task should be a "reviewer" that checks all prior work
11. Every prompt must be self-contained and mention exact files to read/change when possible

Output the JSON now.`
      : `You are a senior software architect planning work for an autonomous coding system.

## Your Mission
Analyze this project's codebase thoroughly, then break down the following goal into concrete, atomic tasks.

## Goal
${goal}

## Output Format
Output ONLY valid YAML (no markdown fences, no explanation before or after). Format:

tasks:
  - id: kebab-case-id
    title: Short title
    prompt: |
      Detailed implementation instructions for Claude Code.
      Include: which files to read, what to change, what conventions to follow.
      End with: git add and commit with message "feat(<id>): <description>"
    priority: 1-10
    agent_role: implementer
    depends_on: []
    files_touched:
      - src/path/to/file.ts

## Rules
1. Each task must be independently executable by a coding agent
2. Task prompts must be specific: name files, functions, patterns to follow
3. Use depends_on when task B needs task A's output
4. Tasks without dependencies can run in parallel — maximize this
5. files_touched must list files that will be MODIFIED (for lock conflict detection)
6. Max ${maxTasks} tasks
7. Priority 1 = do first, 10 = do last
8. agent_role: use "implementer" for code changes, "tester" for test writing, "reviewer" for review tasks
9. Read the actual codebase to understand the tech stack, patterns, and conventions before planning
10. The final task should be a "reviewer" that checks all prior work

Output the YAML now.`;

    console.log(`Planning: "${goal}"`);
    console.log('Analyzing codebase...\n');

    const result = await this.backend.runPrompt(prompt, {
      cwd: this.projectRoot,
      maxTurns: 30,
      timeout: 5 * 60 * 1000, // 5 min for planning
      outputSchema: structuredOutput ? TASKS_JSON_SCHEMA : null
    });

    if (!result.success) {
      throw new Error(`Planning failed: ${result.output.slice(0, 200)}`);
    }

    let parsed;
    if (structuredOutput) {
      try {
        parsed = JSON.parse(result.output.trim());
      } catch (e) {
        throw new Error(`Failed to parse planner output as JSON: ${e.message}\n\nRaw output:\n${result.output.slice(0, 500)}`);
      }
    } else {
      // Extract YAML from output (handle possible markdown fences)
      let yamlText = result.output.trim();
      yamlText = yamlText.replace(/^```ya?ml?\n?/i, '').replace(/\n?```$/i, '').trim();

      try {
        parsed = yaml.load(yamlText);
      } catch (e) {
        const match = yamlText.match(/tasks:\n([\s\S]+)/);
        if (match) {
          try {
            parsed = yaml.load('tasks:\n' + match[1]);
          } catch {
            throw new Error(`Failed to parse planner output as YAML: ${e.message}\n\nRaw output:\n${yamlText.slice(0, 500)}`);
          }
        } else {
          throw new Error(`Failed to parse planner output as YAML: ${e.message}\n\nRaw output:\n${yamlText.slice(0, 500)}`);
        }
      }
    }

    const tasks = parsed?.tasks;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error(`Planner returned no tasks.\n\nRaw output:\n${yamlText.slice(0, 500)}`);
    }

    // Save to file
    const outDir = join(this.projectRoot, '.cc24h');
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, `plan-${Date.now()}.yaml`);
    const cleanYaml = yaml.dump({ tasks }, { lineWidth: 120 });
    writeFileSync(outPath, cleanYaml);

    console.log(`Generated ${tasks.length} tasks → ${outPath}`);
    for (const t of tasks) {
      const deps = t.depends_on?.length ? ` (after: ${t.depends_on.join(', ')})` : '';
      console.log(`  [P${t.priority || '?'}] ${t.id} — ${t.title}${deps}`);
    }

    return { tasks, yamlPath: outPath, raw: yamlText };
  }
}
