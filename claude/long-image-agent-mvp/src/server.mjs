import express from "express";
import multer from "multer";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const JOBS_ROOT = path.join(ROOT, "jobs");
const PUBLIC_ROOT = path.join(ROOT, "public");
const PORT = Number(process.env.PORT || 3210);

function nowIso() {
  return new Date().toISOString();
}

function sanitizeFileName(input) {
  const base = path.basename(String(input || "file"));
  return base.replace(/[^\w.\-\u4e00-\u9fa5]/g, "_").slice(0, 120) || "file";
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function ensureAppStructure() {
  await Promise.all([ensureDir(JOBS_ROOT), ensureDir(PUBLIC_ROOT)]);
}

function getJobRoot(jobId) {
  return path.join(JOBS_ROOT, jobId);
}

function getJobFile(jobId) {
  return path.join(getJobRoot(jobId), "job.json");
}

async function readJsonSafe(filePath) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeJob(jobId, payload) {
  await fsp.writeFile(getJobFile(jobId), JSON.stringify(payload, null, 2), "utf8");
}

async function readJob(jobId) {
  return readJsonSafe(getJobFile(jobId));
}

async function updateJob(jobId, patch) {
  const current = (await readJob(jobId)) || {};
  const next = { ...current, ...patch, updatedAt: nowIso() };
  await writeJob(jobId, next);
  return next;
}

async function fileExists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function summarizeJobOutputs(jobId) {
  const root = getJobRoot(jobId);
  const finalPng = path.join(root, "output", "final", "final.png");
  const finalJpg = path.join(root, "output", "final", "final.jpg");
  const finalHtml = path.join(root, "output", "html", "final.html");
  const firstPreview = path.join(root, "output", "module_previews", "module_01.png");
  const modulePreviewDir = path.join(root, "output", "module_previews");
  const logsDir = path.join(root, "output", "logs");
  const runtimeLog = path.join(root, "runtime.log");

  let previewFiles = [];
  let logFiles = [];

  try {
    const files = await fsp.readdir(modulePreviewDir);
    previewFiles = files
      .filter((name) => name.endsWith(".png"))
      .sort()
      .map((name) => `/jobs/${jobId}/output/module_previews/${name}`);
  } catch {}

  try {
    const files = await fsp.readdir(logsDir);
    logFiles = files
      .filter((name) => name.endsWith(".md") || name.endsWith(".json"))
      .sort()
      .map((name) => `/jobs/${jobId}/output/logs/${name}`);
  } catch {}

  return {
    finalHtmlUrl: (await fileExists(finalHtml)) ? `/jobs/${jobId}/output/html/final.html` : null,
    finalPngUrl: (await fileExists(finalPng)) ? `/jobs/${jobId}/output/final/final.png` : null,
    finalJpgUrl: (await fileExists(finalJpg)) ? `/jobs/${jobId}/output/final/final.jpg` : null,
    firstPreviewUrl: (await fileExists(firstPreview))
      ? `/jobs/${jobId}/output/module_previews/module_01.png`
      : null,
    previewUrls: previewFiles,
    logUrls: logFiles,
    runtimeLogUrl: (await fileExists(runtimeLog)) ? `/jobs/${jobId}/runtime.log` : null
  };
}

async function makeJobResponse(jobId) {
  const job = await readJob(jobId);
  if (!job) return null;
  return {
    ...job,
    outputs: await summarizeJobOutputs(jobId)
  };
}

async function createJobStructure(jobId) {
  const root = getJobRoot(jobId);
  const dirs = [
    root,
    path.join(root, "input"),
    path.join(root, "input", "template"),
    path.join(root, "input", "pdf"),
    path.join(root, "input", "assets"),
    path.join(root, "input", "reference"),
    path.join(root, "output"),
    path.join(root, "output", "logs"),
    path.join(root, "output", "module_previews"),
    path.join(root, "output", "html"),
    path.join(root, "output", "final")
  ];
  await Promise.all(dirs.map(ensureDir));
  return {
    root,
    template: path.join(root, "input", "template"),
    pdf: path.join(root, "input", "pdf"),
    assets: path.join(root, "input", "assets"),
    reference: path.join(root, "input", "reference"),
    task: path.join(root, "input")
  };
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const fieldToDir = {
      templateFiles: req.jobPaths.template,
      pdfFiles: req.jobPaths.pdf,
      assetFiles: req.jobPaths.assets,
      referenceFiles: req.jobPaths.reference,
      taskFile: req.jobPaths.task
    };
    cb(null, fieldToDir[file.fieldname] || req.jobPaths.assets);
  },
  filename(_req, file, cb) {
    cb(null, `${Date.now()}-${sanitizeFileName(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024,
    files: 32
  }
});

async function prepareJob(req, _res, next) {
  try {
    const jobId = randomUUID().slice(0, 8);
    req.jobId = jobId;
    req.jobPaths = await createJobStructure(jobId);
    next();
  } catch (error) {
    next(error);
  }
}

async function runGeneratorJob(jobId) {
  const root = getJobRoot(jobId);
  const runtimeLog = path.join(root, "runtime.log");
  const logStream = fs.createWriteStream(runtimeLog, { flags: "a" });

  await updateJob(jobId, {
    status: "running",
    startedAt: nowIso(),
    error: null
  });

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, "src", "generate-jueduitigan.mjs")], {
      cwd: root,
      env: process.env
    });

    logStream.write(`[${nowIso()}] Job started\n`);

    child.stdout.on("data", (chunk) => logStream.write(chunk));
    child.stderr.on("data", (chunk) => logStream.write(chunk));

    child.on("close", async (code) => {
      logStream.write(`\n[${nowIso()}] Job exited with code ${code}\n`);
      logStream.end();

      if (code === 0) {
        await updateJob(jobId, {
          status: "completed",
          finishedAt: nowIso()
        });
      } else {
        await updateJob(jobId, {
          status: "failed",
          finishedAt: nowIso(),
          error: `Generator exited with code ${code}`
        });
      }

      resolve();
    });

    child.on("error", async (error) => {
      logStream.write(`\n[${nowIso()}] ${error.stack || error.message}\n`);
      logStream.end();
      await updateJob(jobId, {
        status: "failed",
        finishedAt: nowIso(),
        error: error.message
      });
      resolve();
    });
  });
}

const app = express();

app.use(express.static(PUBLIC_ROOT));
app.use("/jobs", express.static(JOBS_ROOT));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "long-image-agent-mvp", now: nowIso() });
});

app.post(
  "/api/jobs",
  prepareJob,
  upload.fields([
    { name: "templateFiles", maxCount: 12 },
    { name: "pdfFiles", maxCount: 12 },
    { name: "assetFiles", maxCount: 20 },
    { name: "referenceFiles", maxCount: 20 },
    { name: "taskFile", maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      const files = req.files || {};
      const templateCount = files.templateFiles?.length || 0;
      const pdfCount = files.pdfFiles?.length || 0;
      const assetCount = files.assetFiles?.length || 0;
      const referenceCount = files.referenceFiles?.length || 0;
      const taskCount = files.taskFile?.length || 0;

      await writeJob(req.jobId, {
        jobId: req.jobId,
        status: "queued",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        shareUrl: `/?job=${req.jobId}`,
        workspacePath: getJobRoot(req.jobId),
        fileCounts: {
          templateCount,
          pdfCount,
          assetCount,
          referenceCount,
          taskCount
        },
        error: null
      });

      runGeneratorJob(req.jobId);

      res.status(202).json(await makeJobResponse(req.jobId));
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/jobs/:jobId", async (req, res) => {
  const job = await makeJobResponse(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

app.get("*", async (_req, res) => {
  res.sendFile(path.join(PUBLIC_ROOT, "index.html"));
});

await ensureAppStructure();

app.listen(PORT, () => {
  console.log(`Long Image Agent web demo running at http://localhost:${PORT}`);
});
