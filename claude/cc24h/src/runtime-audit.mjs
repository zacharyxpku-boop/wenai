import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
import { TaskStatus } from './models.mjs';

function summarizeFindings(findings) {
  return findings
    .map((finding) => {
      if (finding.file) return `${finding.type}:${finding.file}`;
      return finding.type;
    })
    .join(', ');
}

export class RuntimeIntegrityAuditor {
  constructor({ taskQueue, projectRoot, auditDir }) {
    this.taskQueue = taskQueue;
    this.projectRoot = resolve(projectRoot);
    this.auditDir = auditDir || join(this.projectRoot, '.cc24h', 'audits');
    mkdirSync(this.auditDir, { recursive: true });
  }

  run({ repair = false } = {}) {
    const checkedStatuses = [TaskStatus.DONE, TaskStatus.REVIEW];
    const findings = [];
    const reopened = [];

    for (const task of this.taskQueue.getAll()) {
      if (!checkedStatuses.includes(task.status)) continue;
      const taskFindings = this.auditTask(task);
      findings.push(...taskFindings);

      if (repair && taskFindings.some((finding) => finding.confidence === 'high')) {
        const error = `Integrity audit failed: ${summarizeFindings(taskFindings)}`;
        this.taskQueue.updateStatus(task.id, TaskStatus.TODO, {
          session_id: null,
          branch: null,
          worktree: null,
          phase: null,
          completed_at: null,
          error,
        });
        reopened.push({
          task_id: task.id,
          previous_status: task.status,
          reason: error,
        });
      }
    }

    const report = {
      id: `runtime-integrity-${Date.now()}`,
      created_at: new Date().toISOString(),
      project_root: this.projectRoot,
      repair_applied: repair,
      findings_count: findings.length,
      reopened_count: reopened.length,
      findings,
      reopened,
    };

    const reportPath = join(this.auditDir, `${report.id}.yaml`);
    writeFileSync(reportPath, yaml.dump(report, { lineWidth: 120 }));

    return {
      ...report,
      reportPath,
    };
  }

  auditTask(task) {
    const findings = [];
    const touchedFiles = task.files_touched || [];

    for (const file of touchedFiles) {
      const absolutePath = resolve(this.projectRoot, file);
      if (!existsSync(absolutePath)) {
        findings.push({
          task_id: task.id,
          type: 'missing-file',
          file,
          expected: 'file to exist in workspace',
          confidence: 'high',
        });
      }
    }

    const createSpec = this._extractCreateFileSpec(task.prompt || '');
    if (createSpec) {
      const absolutePath = resolve(this.projectRoot, createSpec.file);
      if (!existsSync(absolutePath)) {
        findings.push({
          task_id: task.id,
          type: 'prompt-create-file-missing',
          file: createSpec.file,
          expected: createSpec.content,
          confidence: 'high',
        });
      } else {
        const content = readFileSync(absolutePath, 'utf-8').trim();
        if (content !== createSpec.content.trim()) {
          findings.push({
            task_id: task.id,
            type: 'prompt-create-file-content-mismatch',
            file: createSpec.file,
            expected: createSpec.content,
            actual: content,
            confidence: 'high',
          });
        }
      }
    }

    const appendSpec = this._extractAppendLineSpec(task.prompt || '');
    if (appendSpec) {
      const absolutePath = resolve(this.projectRoot, appendSpec.file);
      if (!existsSync(absolutePath)) {
        findings.push({
          task_id: task.id,
          type: 'prompt-append-file-missing',
          file: appendSpec.file,
          expected: appendSpec.line,
          confidence: 'high',
        });
      } else {
        const content = readFileSync(absolutePath, 'utf-8');
        if (!content.includes(appendSpec.line)) {
          findings.push({
            task_id: task.id,
            type: 'prompt-append-line-missing',
            file: appendSpec.file,
            expected: appendSpec.line,
            confidence: 'high',
          });
        }
      }
    }

    return findings;
  }

  _extractCreateFileSpec(prompt) {
    const match = prompt.match(/Create a file called\s+([^\s]+)\s+with content\s+["']([^"']+)["']/i);
    if (!match) return null;
    return {
      file: match[1],
      content: match[2],
    };
  }

  _extractAppendLineSpec(prompt) {
    const match = prompt.match(/Add a line\s+["']([^"']+)["']\s+at the end of\s+([^\s]+)(?=\s|$)/i);
    if (!match) return null;
    return {
      line: match[1],
      file: match[2].replace(/[.,;:]+$/, ''),
    };
  }
}
