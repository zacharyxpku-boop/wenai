import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync, rmSync } from 'fs';
import { generateLongImage } from './lib/generator.mjs';
import { exportPNG } from './lib/exporter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3462;

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Serve generated outputs
app.use('/output', express.static(join(__dirname, 'output')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subdir = 'misc';
    if (file.fieldname === 'template') subdir = 'template';
    else if (file.fieldname === 'pdf') subdir = 'pdf';
    else if (file.fieldname === 'assets') subdir = 'assets';

    const dir = join(__dirname, 'uploads', req.uploadId || 'default', subdir);
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename with Buffer to handle Chinese chars
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// Middleware to assign upload ID
app.use('/api/upload', (req, res, next) => {
  req.uploadId = 'job_' + Date.now();
  next();
});

// Upload endpoint
app.post('/api/upload',
  upload.fields([
    { name: 'template', maxCount: 5 },
    { name: 'pdf', maxCount: 10 },
    { name: 'assets', maxCount: 20 }
  ]),
  (req, res) => {
    const jobId = req.uploadId;
    const files = {
      template: (req.files.template || []).map(f => f.path),
      pdf: (req.files.pdf || []).map(f => f.path),
      assets: (req.files.assets || []).map(f => f.path)
    };

    // Parse task config if provided
    let taskConfig = null;
    if (req.body.taskConfig) {
      try { taskConfig = JSON.parse(req.body.taskConfig); } catch(e) {}
    }

    res.json({
      jobId,
      files: {
        template: files.template.length,
        pdf: files.pdf.length,
        assets: files.assets.length
      },
      status: 'uploaded'
    });
  }
);

// Generate endpoint
app.post('/api/generate/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const jobDir = join(__dirname, 'uploads', jobId);

  if (!existsSync(jobDir)) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const outputDir = join(__dirname, 'output', jobId);
  mkdirSync(join(outputDir, 'logs'), { recursive: true });
  mkdirSync(join(outputDir, 'module_previews'), { recursive: true });
  mkdirSync(join(outputDir, 'html'), { recursive: true });
  mkdirSync(join(outputDir, 'final'), { recursive: true });

  try {
    const result = await generateLongImage({
      jobId,
      inputDir: jobDir,
      outputDir,
      taskConfig: req.body.taskConfig || null,
      apiKey: req.body.apiKey || process.env.OPENAI_API_KEY || null
    });

    res.json({
      jobId,
      status: 'generated',
      ...result
    });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export PNG endpoint
app.post('/api/export/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const outputDir = join(__dirname, 'output', jobId);
  const htmlPath = join(outputDir, 'html', 'final.html');

  if (!existsSync(htmlPath)) {
    return res.status(404).json({ error: 'HTML not generated yet' });
  }

  try {
    const result = await exportPNG(htmlPath, join(outputDir, 'final'));
    res.json({
      jobId,
      status: 'exported',
      png: `/output/${jobId}/final/final.png`,
      jpg: `/output/${jobId}/final/final.jpg`,
      ...result
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get job status / files
app.get('/api/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const outputDir = join(__dirname, 'output', jobId);

  const result = { jobId };

  if (existsSync(join(outputDir, 'final', 'final.png'))) {
    result.status = 'complete';
    result.png = `/output/${jobId}/final/final.png`;
    result.jpg = `/output/${jobId}/final/final.jpg`;
  } else if (existsSync(join(outputDir, 'html', 'final.html'))) {
    result.status = 'html_ready';
  } else {
    result.status = 'pending';
  }

  result.html = existsSync(join(outputDir, 'html', 'final.html'))
    ? `/output/${jobId}/html/final.html` : null;

  // List log files
  const logsDir = join(outputDir, 'logs');
  if (existsSync(logsDir)) {
    result.logs = readdirSync(logsDir).map(f => `/output/${jobId}/logs/${f}`);
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Long Image Agent running at http://localhost:${PORT}`);
});
