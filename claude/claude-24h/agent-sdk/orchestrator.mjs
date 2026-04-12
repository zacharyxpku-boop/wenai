/**
 * Claude Code 24H 编排器
 *
 * 双Agent架构:
 * - Orchestrator Agent: 读取任务、拆分子任务、协调执行
 * - Worker Agent(s): 执行具体编码任务
 *
 * 用法: node orchestrator.mjs [--tasks tasks.json] [--project /path] [--dry-run]
 */

import { spawn, execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ========== 配置 ==========
const CONFIG = {
  maxTurnsPerTask: 100,       // 每个子任务最大对话轮次
  maxConcurrentWorkers: 2,    // 最大并行worker数
  taskPollInterval: 30000,    // 任务轮询间隔（毫秒）
  cooldownBetweenTasks: 15000, // 任务间冷却时间
  useGitBranch: true,         // 每个任务在独立git分支执行
  autoReview: true,           // 任务完成后自动review
  logsDir: join(__dirname, "..", "logs"),
  tasksFile: join(__dirname, "tasks.json"),
};

// ========== 参数解析 ==========
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tasksFileArg = args.find((_, i) => args[i - 1] === "--tasks");
const projectArg = args.find((_, i) => args[i - 1] === "--project");

if (tasksFileArg) CONFIG.tasksFile = tasksFileArg;

// ========== 日志 ==========
mkdirSync(CONFIG.logsDir, { recursive: true });

function log(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${msg}`;
  console.log(line);

  const logFile = join(CONFIG.logsDir, `orchestrator_${new Date().toISOString().slice(0, 10)}.log`);
  writeFileSync(logFile, line + "\n", { flag: "a" });
}

// ========== 任务管理 ==========
function loadTasks() {
  if (!existsSync(CONFIG.tasksFile)) {
    log("WARN", `任务文件不存在: ${CONFIG.tasksFile}`);
    return [];
  }
  const data = JSON.parse(readFileSync(CONFIG.tasksFile, "utf-8"));
  return data.tasks || [];
}

function saveTasks(tasks) {
  writeFileSync(CONFIG.tasksFile, JSON.stringify({ tasks }, null, 2));
}

// ========== Git 辅助 ==========
function git(cwd, ...args) {
  return execSync(`git ${args.join(" ")}`, { cwd, encoding: "utf-8" }).trim();
}

function createTaskBranch(cwd, taskId) {
  if (!CONFIG.useGitBranch) return null;
  try {
    const baseBranch = git(cwd, "rev-parse", "--abbrev-ref", "HEAD");
    const branchName = `claude-auto/${taskId}`;
    git(cwd, "checkout", "-b", branchName);
    log("INFO", `  创建分支: ${branchName} (基于 ${baseBranch})`);
    return { branchName, baseBranch };
  } catch (e) {
    log("WARN", `  无法创建git分支: ${e.message}`);
    return null;
  }
}

function restoreBranch(cwd, baseBranch) {
  if (!baseBranch) return;
  try {
    git(cwd, "checkout", baseBranch);
  } catch (e) {
    log("WARN", `  无法切回分支 ${baseBranch}: ${e.message}`);
  }
}

// ========== 自动Review ==========
function runReview(task, cwd, branchInfo) {
  return new Promise((resolve) => {
    if (!CONFIG.autoReview || !branchInfo) {
      resolve(null);
      return;
    }

    log("INFO", `  Review启动: [${task.id}]`);
    const reviewPrompt = `请 review 分支 ${branchInfo.branchName} 相对于 ${branchInfo.baseBranch} 的所有更改。检查：
1. 代码是否正确实现了需求
2. 是否有明显的 bug 或安全问题
3. 代码风格是否一致
4. 测试是否通过

输出简洁的 review 摘要，用中文。如果发现严重问题，在摘要开头标注 [NEEDS-FIX]。`;

    const child = spawn("claude", [
      "--dangerously-skip-permissions",
      "--max-turns", "10",
      "--print",
      "--output-format", "text",
      "-p", reviewPrompt,
    ], {
      cwd,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const output = [];
    child.stdout.on("data", (d) => output.push(d.toString()));
    child.stderr.on("data", (d) => output.push(d.toString()));

    child.on("close", () => {
      const review = output.join("");
      const reviewFile = join(CONFIG.logsDir, `review_${task.id}_${Date.now()}.log`);
      writeFileSync(reviewFile, review);
      const needsFix = review.includes("[NEEDS-FIX]");
      log("INFO", `  Review完成: [${task.id}] ${needsFix ? "需要修复" : "通过"}`);
      resolve({ reviewFile, needsFix, summary: review.slice(0, 200) });
    });

    child.on("error", () => resolve(null));
  });
}

// ========== Worker Agent ==========
function runWorker(task) {
  return new Promise((resolve, reject) => {
    const { id, prompt, projectDir } = task;
    const cwd = projectDir || projectArg || process.cwd();
    const taskLog = join(CONFIG.logsDir, `worker_${id}_${Date.now()}.log`);

    log("INFO", `Worker启动: [${id}] ${prompt.slice(0, 80)}...`);
    log("INFO", `  项目目录: ${cwd}`);
    log("INFO", `  日志: ${taskLog}`);

    if (dryRun) {
      log("INFO", `[DRY-RUN] 跳过执行: ${id}`);
      resolve({ id, status: "skipped", duration: 0 });
      return;
    }

    // 创建独立分支
    const branchInfo = createTaskBranch(cwd, id);

    const startTime = Date.now();
    const logStream = [];

    // 增强 prompt：注入 git commit 要求
    const enhancedPrompt = `${prompt}\n\n完成后请 git add 并 commit 所有更改，commit message 用英文，格式: "feat(${id}): 简要描述"`;

    const child = spawn("claude", [
      "--dangerously-skip-permissions",
      "--max-turns", String(CONFIG.maxTurnsPerTask),
      "--print",
      "--output-format", "text",
      "-p", enhancedPrompt,
    ], {
      cwd,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (data) => {
      logStream.push(data.toString());
    });

    child.stderr.on("data", (data) => {
      logStream.push(`[STDERR] ${data.toString()}`);
    });

    child.on("close", async (code) => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      const output = logStream.join("");

      writeFileSync(taskLog, output);

      if (code === 0) {
        log("INFO", `Worker完成: [${id}] (${duration}秒)`);

        // 自动review
        const review = await runReview(task, cwd, branchInfo);

        // 切回主分支
        restoreBranch(cwd, branchInfo?.baseBranch);

        resolve({
          id, status: "completed", duration, logFile: taskLog,
          branch: branchInfo?.branchName,
          review: review?.summary,
          needsFix: review?.needsFix,
        });
      } else {
        log("ERROR", `Worker失败: [${id}] 退出码=${code} (${duration}秒)`);
        restoreBranch(cwd, branchInfo?.baseBranch);
        resolve({ id, status: "failed", exitCode: code, duration, logFile: taskLog });
      }
    });

    child.on("error", (err) => {
      log("ERROR", `Worker错误: [${id}] ${err.message}`);
      restoreBranch(cwd, branchInfo?.baseBranch);
      reject(err);
    });
  });
}

// ========== 主循环 ==========
async function runOnce() {
  const tasks = loadTasks();
  const pendingTasks = tasks.filter((t) => t.status === "pending");

  if (pendingTasks.length === 0) {
    log("INFO", "没有待执行任务");
    return;
  }

  log("INFO", `发现 ${pendingTasks.length} 个待执行任务`);

  // 分批执行
  for (let i = 0; i < pendingTasks.length; i += CONFIG.maxConcurrentWorkers) {
    const batch = pendingTasks.slice(i, i + CONFIG.maxConcurrentWorkers);

    log("INFO", `执行批次 ${Math.floor(i / CONFIG.maxConcurrentWorkers) + 1}: ${batch.map((t) => t.id).join(", ")}`);

    // 标记为运行中
    batch.forEach((t) => { t.status = "running"; });
    saveTasks(tasks);

    // 并行执行
    const results = await Promise.allSettled(batch.map(runWorker));

    // 更新状态
    results.forEach((result, idx) => {
      const task = batch[idx];
      if (result.status === "fulfilled") {
        const r = result.value;
        task.status = r.needsFix ? "needs-review" : r.status;
        task.duration = r.duration;
        task.logFile = r.logFile;
        task.branch = r.branch;
        task.review = r.review;
      } else {
        task.status = "error";
        task.error = result.reason?.message;
      }
      task.completedAt = new Date().toISOString();
    });
    saveTasks(tasks);

    // 批次间冷却
    if (i + CONFIG.maxConcurrentWorkers < pendingTasks.length) {
      log("INFO", `等待 ${CONFIG.cooldownBetweenTasks / 1000} 秒后执行下一批...`);
      await new Promise((r) => setTimeout(r, CONFIG.cooldownBetweenTasks));
    }
  }

  // 汇总
  const completed = tasks.filter((t) => t.status === "completed").length;
  const needsReview = tasks.filter((t) => t.status === "needs-review").length;
  const failed = tasks.filter((t) => ["failed", "error"].includes(t.status)).length;
  log("INFO", "=========================================");
  log("INFO", `执行完毕 - 成功: ${completed}, 待审查: ${needsReview}, 失败: ${failed}, 总计: ${tasks.length}`);

  // 输出分支汇总，方便用户review
  const branchTasks = tasks.filter((t) => t.branch);
  if (branchTasks.length > 0) {
    log("INFO", "Git分支汇总 (等待你 review 后 merge):");
    branchTasks.forEach((t) => {
      const flag = t.status === "needs-review" ? " [NEEDS-FIX]" : "";
      log("INFO", `  ${t.branch} - ${t.id}${flag}`);
    });
    log("INFO", "合并命令: git merge <branch-name>");
  }
  log("INFO", "=========================================");
}

async function runDaemon() {
  log("INFO", "========================================");
  log("INFO", "Claude Code 编排器启动 (守护进程模式)");
  log("INFO", `轮询间隔: ${CONFIG.taskPollInterval / 1000}秒`);
  log("INFO", "按 Ctrl+C 停止");
  log("INFO", "========================================");

  while (true) {
    await runOnce();
    log("INFO", `等待 ${CONFIG.taskPollInterval / 1000} 秒后检查新任务...`);
    await new Promise((r) => setTimeout(r, CONFIG.taskPollInterval));
  }
}

// ========== 入口 ==========
if (args.includes("--daemon")) {
  runDaemon().catch((err) => {
    log("FATAL", `编排器崩溃: ${err.message}`);
    process.exit(1);
  });
} else {
  runOnce().catch((err) => {
    log("FATAL", `执行失败: ${err.message}`);
    process.exit(1);
  });
}
