import { existsSync, readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { sliceTemplate } from './template-slicer.mjs';
import { analyzeTemplateWithAI, generateSegmentHTML, getProviderInfo } from './ai-vision.mjs';
import { renderModule, buildFullPageHTML, DESIGN_SYSTEM_CSS } from './module-templates.mjs';
import sharp from 'sharp';

/**
 * Main Generation Pipeline v3
 *
 * Architecture:
 * ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
 * │ Template IMG │────→│ Pixel Slicer │────→│ Segment PNGs     │
 * └─────────────┘     │ (sharp)      │     │ seg_01.png, ...  │
 *                     └──────────────┘     └──────┬───────────┘
 *                                                 │
 * ┌─────────────┐     ┌──────────────┐            │
 * │ Template IMG │────→│ GPT-4o Full  │────→ Module Map (types + text)
 * └─────────────┘     │ Analysis     │            │
 *                     └──────────────┘            │
 *                                                 ▼
 *                     ┌───────────────────────────────────────────┐
 *                     │ For each segment:                         │
 *                     │   GPT-4o sees segment PNG + module info   │
 *                     │   → generates pixel-faithful HTML         │
 *                     │   → uses uploaded assets where they match │
 *                     └───────────────────────────────────────────┘
 *                                                 │
 *                                                 ▼
 *                     ┌──────────────┐     ┌──────────────┐
 *                     │ Assemble     │────→│ Puppeteer    │
 *                     │ final.html   │     │ → final.png  │
 *                     └──────────────┘     └──────────────┘
 *
 * Key insight: AI generates HTML per-segment with visual reference,
 * not the whole page at once. This gives much higher fidelity.
 */
export async function generateLongImage({ jobId, inputDir, outputDir, taskConfig, apiKey }) {
  const logsDir = join(outputDir, 'logs');

  // === STEP 1: Scan files ===
  const inventory = scanInputFiles(inputDir);
  writeFileSync(join(logsDir, 'file_inventory.json'), JSON.stringify(inventory, null, 2));
  writeFileSync(join(logsDir, 'file_inventory.md'), renderInventoryMD(inventory));

  if (inventory.template.length === 0) throw new Error('No template image found');

  // === STEP 2: Pixel-slice template into segments ===
  // First do a rough pixel slice, then refine with AI y% boundaries
  let sliceResult = await sliceTemplate(inventory.template[0].path, outputDir);
  writeFileSync(join(logsDir, 'template_analysis_pixel.json'), JSON.stringify(sliceResult, null, 2));

  // === STEP 3: AI full-template analysis (get module types + text) ===
  let aiAnalysis = null;
  let colorScheme = { primary: '#D4A843', secondary: '#F7E8B0', bg_main: '#FFF8E7', text_main: '#333333', accent: '#A07D2E' };
  const useAI = !!apiKey;

  if (useAI) {
    try {
      const providerInfo = getProviderInfo(apiKey);
      aiAnalysis = await analyzeTemplateWithAI(
        apiKey,
        inventory.template[0].path,
        providerInfo.supportsVision ? null : sliceResult
      );
      writeFileSync(join(logsDir, 'template_analysis_ai.json'), JSON.stringify(aiAnalysis, null, 2));
      writeFileSync(join(logsDir, 'template_analysis.md'), renderAIAnalysisMD(aiAnalysis));
      writeFileSync(join(logsDir, 'module_map.json'), JSON.stringify(aiAnalysis, null, 2));
      // Use AI color scheme but ensure golden tones
      if (aiAnalysis.color_scheme) {
        colorScheme = aiAnalysis.color_scheme;
        // Force golden palette if AI returned non-golden colors
        if (colorScheme.primary === '#000000' || colorScheme.bg_main === '#FFFFFF') {
          colorScheme = { primary: '#D4A843', secondary: '#F7E8B0', bg_main: '#FFF8E7', text_main: '#333333', accent: '#A07D2E' };
        }
      }

      // Re-slice template using AI's y% boundaries for higher precision
      if (aiAnalysis.modules?.length > sliceResult.segments.length) {
        sliceResult = await resliceWithAI(inventory.template[0].path, outputDir, aiAnalysis, sliceResult);
        writeFileSync(join(logsDir, 'template_resliced.json'), JSON.stringify(sliceResult, null, 2));
      }
    } catch (err) {
      writeFileSync(join(logsDir, 'ai_error.log'), err.message + '\n' + (err.stack || ''));
    }
  }

  // === STEP 4: Per-segment HTML generation ===
  const previewDir = join(outputDir, 'module_previews');
  const segmentHTMLs = [];
  const segments = sliceResult.segments;

  // Prepare asset paths for AI
  const assetPaths = inventory.assets.map(a => a.path);

  if (useAI && segments.length > 0) {
    // AI mode: generate HTML for each segment individually
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segImagePath = seg.segment_image ? join(outputDir, seg.segment_image) : null;

      // Find matching AI module info for this segment
      const moduleInfo = findMatchingModule(aiAnalysis, seg, i, segments.length);

      try {
        let html = await generateSegmentHTML(
          apiKey,
          segImagePath,
          moduleInfo,
          assetPaths,
          i,
          segments.length,
          colorScheme
        );

        // Check for AI refusal — retry without image if refused
        if (html.includes("can't assist") || html.includes("I cannot") || html.includes("I'm sorry") || html.length < 100) {
          console.log(`Segment ${i+1}: AI refused, retrying without image...`);
          html = await generateSegmentHTML(
            apiKey,
            null, // no image this time
            moduleInfo,
            assetPaths,
            i,
            segments.length,
            colorScheme
          );
        }

        // If still refused, use pre-built template
        if (html.includes("can't assist") || html.includes("I cannot") || html.includes("I'm sorry") || html.length < 100) {
          throw new Error('AI refused twice');
        }

        segmentHTMLs.push(html);
        writeFileSync(join(previewDir, `module_${String(i + 1).padStart(2, '0')}.html`), wrapPreview(html));
      } catch (err) {
        // Fallback to pre-built template
        const fallbackType = moduleInfo?.module_type || 'hero';
        const fallbackHTML = renderModule(fallbackType, {
          title: moduleInfo?.title_text || `模块 ${i + 1}`,
          subtitle: moduleInfo?.body_text || ''
        });
        segmentHTMLs.push(fallbackHTML);
        writeFileSync(join(previewDir, `module_${String(i + 1).padStart(2, '0')}.html`), wrapPreview(fallbackHTML));
        writeFileSync(join(logsDir, `segment_${i+1}_error.log`), err.message);
      }
    }
  } else {
    // No AI: use pre-built luxury templates as fallback
    const typeSequence = ['header', 'hero', 'pain_points', 'value_props', 'steps', 'cta', 'teacher_profile', 'product', 'faq'];
    for (let i = 0; i < segments.length; i++) {
      const type = i < typeSequence.length ? typeSequence[i] : 'hero';
      const html = renderModule(type, { title: `模块 ${i + 1}` });
      segmentHTMLs.push(html);
      writeFileSync(join(previewDir, `module_${String(i + 1).padStart(2, '0')}.html`), wrapPreview(html));
    }
  }

  // === STEP 5: Design tokens ===
  const designTokens = { target_width: 750, color_scheme: colorScheme };
  writeFileSync(join(logsDir, 'design_tokens.json'), JSON.stringify(designTokens, null, 2));
  writeFileSync(join(logsDir, 'design_system.md'), `# Design System\n\nColors: ${JSON.stringify(colorScheme)}\nWidth: 750px\n`);
  writeFileSync(join(logsDir, 'content_mapping.json'), JSON.stringify({
    mode: useAI ? 'ai_per_segment' : 'pixel_fallback',
    segments: segments.length,
    ai_modules: aiAnalysis?.modules?.length || 0
  }, null, 2));

  // === STEP 6: Assemble final HTML ===
  const finalHTML = assembleFinalHTML(segmentHTMLs, colorScheme);
  writeFileSync(join(outputDir, 'html', 'final.html'), finalHTML);

  writeFileSync(join(logsDir, 'module_01_notes.md'),
    `# Generation Notes\n\n- Mode: ${useAI ? 'AI per-segment' : 'pixel fallback'}\n- Segments: ${segments.length}\n- AI modules: ${aiAnalysis?.modules?.length || 0}\n- Assets: ${inventory.assets.length}\n`);

  return {
    moduleCount: segmentHTMLs.length,
    segmentCount: segments.length,
    mode: useAI ? 'ai_per_segment' : 'pixel_fallback',
    aiModules: aiAnalysis?.modules?.length || 0,
    htmlPath: `/output/${jobId}/html/final.html`,
    logs: readdirSync(logsDir).map(f => `/output/${jobId}/logs/${f}`)
  };
}

// ─── Re-slice template using AI module boundaries ───
async function resliceWithAI(templatePath, outputDir, aiAnalysis, originalSlice) {
  const { original_width, original_height } = originalSlice;
  const segmentDir = join(outputDir, 'segments');
  mkdirSync(segmentDir, { recursive: true });

  const newSegments = [];
  const modules = aiAnalysis.modules || [];

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const yStart = Math.round((mod.y_percent_start / 100) * original_height);
    const yEnd = Math.round((mod.y_percent_end / 100) * original_height);
    const height = Math.max(yEnd - yStart, 20);

    // Extract this segment as PNG
    const segFilename = `segment_${String(i + 1).padStart(2, '0')}.png`;
    try {
      await sharp(templatePath)
        .extract({
          left: 0,
          top: Math.min(yStart, original_height - 1),
          width: original_width,
          height: Math.min(height, original_height - yStart)
        })
        .resize(750, null)
        .png()
        .toFile(join(segmentDir, segFilename));
    } catch (e) {
      // If extraction fails, skip
      continue;
    }

    newSegments.push({
      module_id: mod.module_id || `segment_${String(i + 1).padStart(2, '0')}`,
      order: i + 1,
      y_start_original: yStart,
      y_end_original: yEnd,
      height_original: height,
      segment_image: `segments/${segFilename}`,
      module_type_guess: mod.module_type,
      dominant_hex: '#FFF8E7',
      is_dark_bg: false,
      is_light_bg: true,
      ai_module: mod
    });
  }

  return {
    original_width,
    original_height,
    analysis_width: 750,
    analysis_height: Math.round(original_height * (750 / original_width)),
    segment_count: newSegments.length,
    segments: newSegments
  };
}

// ─── Find matching AI module for a pixel segment ───
function findMatchingModule(aiAnalysis, segment, segIndex, totalSegments) {
  if (!aiAnalysis?.modules?.length) return null;

  // Map segment position to percentage
  const segPercent = (segIndex / totalSegments) * 100;

  // Find the AI module whose y_percent range overlaps this segment
  let bestMatch = null;
  let bestOverlap = -1;

  for (const mod of aiAnalysis.modules) {
    const modStart = mod.y_percent_start || 0;
    const modEnd = mod.y_percent_end || 100;
    const segStart = segPercent;
    const segEnd = ((segIndex + 1) / totalSegments) * 100;

    const overlapStart = Math.max(modStart, segStart);
    const overlapEnd = Math.min(modEnd, segEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestMatch = mod;
    }
  }

  // If no good overlap, use order-based matching
  if (!bestMatch || bestOverlap < 1) {
    if (segIndex < aiAnalysis.modules.length) {
      return aiAnalysis.modules[segIndex];
    }
  }

  return bestMatch;
}

// ─── Assemble final HTML ───
function assembleFinalHTML(moduleHTMLs, colorScheme) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=750">
<title>长图预览</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: ${colorScheme?.bg_main || '#FFF8E7'};
  display: flex; justify-content: center;
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page { width: 750px; overflow: hidden; }
.page > section { width: 750px; }
.page img { max-width: 100%; }
</style>
</head>
<body>
<div class="page">
${moduleHTMLs.join('\n')}
</div>
</body>
</html>`;
}

function wrapPreview(html) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=750"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#FFF8E7;display:flex;justify-content:center;font-family:"PingFang SC","Microsoft YaHei",sans-serif;}</style></head><body>${html}</body></html>`;
}

// ─── Scan ───
function scanInputFiles(inputDir) {
  const result = { template: [], pdf: [], assets: [] };
  const scan = (subdir, exts) => {
    const dir = join(inputDir, subdir);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter(f => exts.some(e => f.toLowerCase().endsWith(e)))
      .map(f => ({ name: f, path: join(dir, f), size: statSync(join(dir, f)).size, relativePath: `${subdir}/${f}` }));
  };
  result.template = scan('template', ['.png', '.jpg', '.jpeg', '.webp']);
  result.pdf = scan('pdf', ['.pdf']);
  result.assets = scan('assets', ['.png', '.jpg', '.jpeg', '.webp', '.svg']);
  return result;
}

function renderInventoryMD(inv) {
  let md = '# File Inventory\n\n';
  ['template', 'pdf', 'assets'].forEach(t => {
    md += `## ${t} (${inv[t].length})\n`;
    inv[t].forEach(f => md += `- ${f.name} (${(f.size/1024).toFixed(0)}KB)\n`);
    md += '\n';
  });
  return md;
}

function renderAIAnalysisMD(ai) {
  let md = `# AI Template Analysis\n\nStyle: ${ai.overall_style || ''}\nModules: ${ai.total_modules || ai.modules?.length}\nColors: ${JSON.stringify(ai.color_scheme)}\n\n`;
  (ai.modules || []).forEach((m, i) => {
    md += `## ${i+1}. ${m.module_type} (${m.y_percent_start}%-${m.y_percent_end}%)\n`;
    md += `Title: ${m.title_text || 'N/A'}\nBody: ${m.body_text || 'N/A'}\n\n`;
  });
  return md;
}
