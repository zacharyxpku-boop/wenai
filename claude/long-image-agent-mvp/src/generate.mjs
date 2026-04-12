import fs from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";
import {
  DEFAULT_CONFIG,
  PATHS,
  chunk,
  guessFileRole,
  guessModuleType,
  inferModuleCountFromRatio,
  mergeConfig,
  moduleBlueprintForType,
  nowIso,
  relativeFrom
} from "./lib/defaults.mjs";
import { extractPdfFile } from "./lib/pdf-extractor.mjs";
import {
  buildDesignTokens,
  buildFinalHtml,
  buildModuleNotes,
  exportHtmlScreenshot,
  renderModuleSection,
  renderStandaloneHtml,
  writeDesignCss
} from "./lib/render.mjs";

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function ensureBaseStructure() {
  await Promise.all([
    ensureDirectory(PATHS.input),
    ensureDirectory(PATHS.template),
    ensureDirectory(PATHS.pdf),
    ensureDirectory(PATHS.assets),
    ensureDirectory(PATHS.output),
    ensureDirectory(PATHS.logs),
    ensureDirectory(PATHS.previews),
    ensureDirectory(PATHS.html),
    ensureDirectory(PATHS.final)
  ]);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists(filePath) {
  if (!(await exists(filePath))) return null;
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}

async function listFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dirPath, entry.name))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function bytesToHuman(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

async function collectFileMetadata(filePath) {
  const stat = await fs.stat(filePath);
  const role = guessFileRole(filePath);
  let dimensions = null;

  if (role === "template" || role === "asset") {
    try {
      const size = imageSize(filePath);
      dimensions = { width: size.width ?? null, height: size.height ?? null };
    } catch {
      dimensions = null;
    }
  }

  return {
    file_name: path.basename(filePath),
    file_path: filePath,
    role,
    extension: path.extname(filePath).toLowerCase(),
    size_bytes: stat.size,
    size_human: bytesToHuman(stat.size),
    last_modified: stat.mtime.toISOString(),
    dimensions
  };
}

async function scanInputFiles(config) {
  const [templateFiles, pdfFiles, assetFiles] = await Promise.all([
    listFiles(PATHS.template),
    listFiles(PATHS.pdf),
    listFiles(PATHS.assets)
  ]);
  const taskConfig = await readJsonIfExists(PATHS.task);

  const [templateMeta, pdfMeta, assetMeta] = await Promise.all([
    Promise.all(templateFiles.map(collectFileMetadata)),
    Promise.all(pdfFiles.map(collectFileMetadata)),
    Promise.all(assetFiles.map(collectFileMetadata))
  ]);

  return {
    scanned_at: nowIso(),
    effective_config: config,
    task_config_found: Boolean(taskConfig),
    summary: {
      template_count: templateMeta.length,
      pdf_count: pdfMeta.length,
      asset_count: assetMeta.length,
      total_resources: templateMeta.length + pdfMeta.length + assetMeta.length
    },
    template_files: templateMeta,
    pdf_files: pdfMeta,
    asset_files: assetMeta
  };
}

function buildFileInventoryMarkdown(inventory) {
  const lines = [
    "# File Inventory",
    "",
    `- Scanned at: ${inventory.scanned_at}`,
    `- task.json found: ${inventory.task_config_found ? "yes" : "no, using defaults"}`,
    `- Templates: ${inventory.summary.template_count}`,
    `- PDFs: ${inventory.summary.pdf_count}`,
    `- Assets: ${inventory.summary.asset_count}`,
    `- Total resources: ${inventory.summary.total_resources}`,
    "",
    "## Templates",
    ""
  ];

  if (!inventory.template_files.length) {
    lines.push("- None detected in input/template.");
  } else {
    for (const file of inventory.template_files) {
      lines.push(
        `- ${file.file_name} · ${file.size_human} · ${file.dimensions?.width || "?"}x${
          file.dimensions?.height || "?"
        }`
      );
    }
  }

  lines.push("", "## PDFs", "");
  if (!inventory.pdf_files.length) {
    lines.push("- None detected in input/pdf.");
  } else {
    for (const file of inventory.pdf_files) {
      lines.push(`- ${file.file_name} · ${file.size_human}`);
    }
  }

  lines.push("", "## Assets", "");
  if (!inventory.asset_files.length) {
    lines.push("- None detected in input/assets.");
  } else {
    for (const file of inventory.asset_files) {
      lines.push(
        `- ${file.file_name} · ${file.size_human} · ${file.dimensions?.width || "?"}x${
          file.dimensions?.height || "?"
        }`
      );
    }
  }

  return lines.join("\n");
}

function buildFallbackModules() {
  const moduleTypes = ["hero", "highlights", "data", "visual", "cta"];
  return moduleTypes.map((moduleType, index) => {
    const blueprint = moduleBlueprintForType(moduleType);
    return {
      module_id: `module_${String(index + 1).padStart(2, "0")}`,
      order: index + 1,
      y_range: `${index * 20}% - ${(index + 1) * 20}%`,
      module_type_guess: moduleType,
      required_fields: blueprint.required_fields,
      style_notes: blueprint.style_notes,
      source_template: null
    };
  });
}

async function analyzeTemplates(inventory) {
  if (!inventory.template_files.length) {
    return {
      analyzed_at: nowIso(),
      mode: "fallback_no_template",
      design_language: {
        summary:
          "No template files were provided. The system falls back to a luxury editorial stack that preserves modular hierarchy and 750px long-image rhythm.",
        title_style: "High-contrast serif display titles with metallic gold treatment.",
        card_style: "Rounded dark cards with hairline gold borders and controlled glow.",
        decorative_elements: [
          "gold gradients",
          "engraved borders",
          "glasslike overlays",
          "soft radial highlights"
        ],
        spacing_rhythm: "Hero-led vertical rhythm with stacked premium cards.",
        template_risk: "内容不足：尚未提供模板图，版式还原暂以默认骨架代替。"
      },
      modules: buildFallbackModules()
    };
  }

  if (inventory.template_files.length > 1) {
    let offsetHeight = 0;
    const modules = inventory.template_files.map((file, index) => {
      const width = file.dimensions?.width || 750;
      const height = file.dimensions?.height || 420;
      const moduleType = guessModuleType(file.file_name, index, inventory.template_files.length);
      const blueprint = moduleBlueprintForType(moduleType);
      const start = offsetHeight;
      offsetHeight += height;
      return {
        module_id: `module_${String(index + 1).padStart(2, "0")}`,
        order: index + 1,
        y_range: `${start}px - ${offsetHeight}px`,
        module_type_guess: moduleType,
        required_fields: blueprint.required_fields,
        style_notes: [
          `Derived from segmented template file ${file.file_name}.`,
          `Original size ${width}x${height}.`,
          ...blueprint.style_notes
        ],
        source_template: file.file_name
      };
    });

    return {
      analyzed_at: nowIso(),
      mode: "segmented_template_files",
      design_language: {
        summary:
          "Multiple template slices detected; each slice is treated as a dedicated long-image module.",
        title_style: "Preserve per-slice hierarchy, then unify with golden-luxury tokens.",
        card_style: "Respect module rhythm from provided slices.",
        decorative_elements: ["follow slice structure first", "add controlled premium polish"],
        spacing_rhythm: "Derived from slice ordering and cumulative heights.",
        template_risk: "Template present: high-confidence structure preservation mode."
      },
      modules
    };
  }

  const [template] = inventory.template_files;
  const width = template.dimensions?.width || 750;
  const height = template.dimensions?.height || 3000;
  const ratio = height / Math.max(width, 1);
  const count = inferModuleCountFromRatio(ratio);
  const segmentHeight = Math.round(height / count);
  const modules = Array.from({ length: count }, (_, index) => {
    const moduleType = guessModuleType(template.file_name, index, count);
    const blueprint = moduleBlueprintForType(moduleType);
    return {
      module_id: `module_${String(index + 1).padStart(2, "0")}`,
      order: index + 1,
      y_range: `${index * segmentHeight}px - ${
        index === count - 1 ? height : (index + 1) * segmentHeight
      }px`,
      module_type_guess: moduleType,
      required_fields: blueprint.required_fields,
      style_notes: [
        `Heuristic segmentation from single long template ${template.file_name}.`,
        `Long-image ratio ${ratio.toFixed(2)} suggests ${count} modules.`,
        ...blueprint.style_notes
      ],
      source_template: template.file_name
    };
  });

  return {
    analyzed_at: nowIso(),
    mode: "single_template_heuristic_segmentation",
    design_language: {
      summary:
        "One template detected; the MVP segments it into modules using aspect ratio and long-image cadence heuristics.",
      title_style: "Preserve top-heavy hierarchy and increasingly dense middle modules.",
      card_style: "Carry a consistent dark-gold editorial frame throughout.",
      decorative_elements: ["premium borders", "numeric emphasis", "metallic gradients"],
      spacing_rhythm: "Segmented from single template aspect ratio.",
      template_risk: "Template structure inferred, not pixel-perfect parsed."
    },
    modules
  };
}

function buildTemplateAnalysisMarkdown(analysis) {
  const lines = [
    "# Template Analysis",
    "",
    `- Analyzed at: ${analysis.analyzed_at}`,
    `- Mode: ${analysis.mode}`,
    `- Module count: ${analysis.modules.length}`,
    "",
    "## Design Language",
    "",
    `- Summary: ${analysis.design_language.summary}`,
    `- Title style: ${analysis.design_language.title_style}`,
    `- Card style: ${analysis.design_language.card_style}`,
    `- Decorative elements: ${analysis.design_language.decorative_elements.join(", ")}`,
    `- Spacing rhythm: ${analysis.design_language.spacing_rhythm}`,
    `- Risk: ${analysis.design_language.template_risk}`,
    "",
    "## Module Map",
    ""
  ];

  for (const module of analysis.modules) {
    lines.push(
      `- ${module.module_id} · order ${module.order} · ${module.module_type_guess} · ${module.y_range}`
    );
    lines.push(`  required_fields: ${module.required_fields.join(", ")}`);
    lines.push(`  style_notes: ${module.style_notes.join(" | ")}`);
  }

  return lines.join("\n");
}

async function extractPdfContent(inventory) {
  const extraction = {
    extracted_at: nowIso(),
    pdfs: [],
    summary: {
      pdf_count: inventory.pdf_files.length,
      titles: 0,
      headings: 0,
      key_paragraphs: 0,
      data_points: 0,
      image_clues: 0
    }
  };

  for (const pdf of inventory.pdf_files) {
    const result = await extractPdfFile(pdf.file_path);
    extraction.pdfs.push(result);
    extraction.summary.titles += result.titles.length;
    extraction.summary.headings += result.headings.length;
    extraction.summary.key_paragraphs += result.key_paragraphs.length;
    extraction.summary.data_points += result.data_points.length;
    extraction.summary.image_clues += result.image_clues.length;
  }

  return extraction;
}

function buildPdfExtractionMarkdown(extraction) {
  const lines = [
    "# PDF Extraction",
    "",
    `- Extracted at: ${extraction.extracted_at}`,
    `- PDF count: ${extraction.summary.pdf_count}`,
    `- Titles: ${extraction.summary.titles}`,
    `- Headings: ${extraction.summary.headings}`,
    `- Key paragraphs: ${extraction.summary.key_paragraphs}`,
    `- Data points: ${extraction.summary.data_points}`,
    `- Image clues: ${extraction.summary.image_clues}`,
    ""
  ];

  if (!extraction.pdfs.length) {
    lines.push("内容不足：input/pdf 中暂无 PDF，后续映射将进入空内容占位模式。");
    return lines.join("\n");
  }

  for (const pdf of extraction.pdfs) {
    lines.push(`## ${pdf.file_name}`, "");
    lines.push(`- Pages: ${pdf.page_count}`);
    lines.push(
      `- Title candidates: ${
        pdf.titles.map((entry) => `${entry.text} (p.${entry.page})`).join(" | ") || "none"
      }`
    );
    lines.push(
      `- Data points: ${
        pdf.data_points.map((entry) => `${entry.text} (p.${entry.page})`).join(" | ") || "none"
      }`
    );
    lines.push(
      `- Image clues: ${
        pdf.image_clues.map((entry) => `${entry.text} (p.${entry.page})`).join(" | ") || "none"
      }`
    );
    lines.push("");
  }

  return lines.join("\n");
}

function pickBestAsset(inventory, usedAssetNames) {
  const candidate = inventory.asset_files.find((asset) => !usedAssetNames.has(asset.file_name));
  if (!candidate) return null;
  usedAssetNames.add(candidate.file_name);
  return {
    type: "asset",
    label: candidate.file_name,
    path: candidate.file_path
  };
}

function aggregatePdfSignals(extraction) {
  const titles = [];
  const headings = [];
  const paragraphs = [];
  const dataPoints = [];
  const chartConclusions = [];
  const shortSellingPoints = [];
  const imageClues = [];

  for (const pdf of extraction.pdfs) {
    titles.push(...pdf.titles.map((entry) => ({ ...entry, source_pdf: pdf.file_name })));
    headings.push(...pdf.headings.map((entry) => ({ ...entry, source_pdf: pdf.file_name })));
    paragraphs.push(...pdf.key_paragraphs.map((entry) => ({ ...entry, source_pdf: pdf.file_name })));
    dataPoints.push(...pdf.data_points.map((entry) => ({ ...entry, source_pdf: pdf.file_name })));
    chartConclusions.push(
      ...pdf.chart_conclusions.map((entry) => ({ ...entry, source_pdf: pdf.file_name }))
    );
    shortSellingPoints.push(
      ...pdf.short_selling_points.map((entry) => ({ ...entry, source_pdf: pdf.file_name }))
    );
    imageClues.push(...pdf.image_clues.map((entry) => ({ ...entry, source_pdf: pdf.file_name })));
  }

  return { titles, headings, paragraphs, dataPoints, chartConclusions, shortSellingPoints, imageClues };
}

function formatPages(entries) {
  return [...new Set(entries.map((entry) => entry.page))].sort((a, b) => a - b);
}

function mapModuleContent(modules, extraction, inventory) {
  const signals = aggregatePdfSignals(extraction);
  const usedAssetNames = new Set();

  return modules.map((module, index) => {
    const moduleBase = {
      module_id: module.module_id,
      module_type: module.module_type_guess,
      source_pdf: null,
      source_pages: [],
      image_source: { type: "none", label: "none", path: null },
      compression_notes: "Used fallback compression due missing or partial source material.",
      confidence: 0.4,
      selected_content: {}
    };

    if (!extraction.pdfs.length) {
      const factualSubtitle =
        "当前未检测到模板图 / PDF / 高清素材，系统先输出可交付的空内容长图，用于确认风格、模块节奏与产品链路。";
      const facts = [
        { kicker: "Template", value: String(inventory.summary.template_count), label: "files detected", note: "输入目录扫描结果" },
        { kicker: "PDF", value: String(inventory.summary.pdf_count), label: "documents detected", note: "暂无正文可抽取" },
        { kicker: "Assets", value: String(inventory.summary.asset_count), label: "visuals detected", note: "暂无高清图可映射" },
        { kicker: "Pipeline", value: "9", label: "workflow steps", note: "SOP 已可运行" }
      ];

      if (module.module_type_guess === "hero") {
        return {
          ...moduleBase,
          confidence: 0.28,
          selected_content: {
            eyebrow: "MVP READY / EMPTY STATE",
            title: "模板与内容待注入",
            subtitle: factualSubtitle,
            body:
              "系统已经完成输入扫描、模板分析骨架、映射策略和导出链路。等你把素材放进 input/ 后，这里会自动替换成真实标题、摘要与图文内容。",
            stats: facts,
            image_caption:
              "当前没有素材，首模块预览以高质感占位画面承接风格确认，不伪造事实。",
            footnote: "内容不足：当前为无素材占位模式。"
          }
        };
      }

      if (module.module_type_guess === "highlights") {
        return {
          ...moduleBase,
          confidence: 0.25,
          selected_content: {
            section_label: "Content Mapping Logic",
            title: "先保流程成立，再等真实内容注入",
            body: "在缺少 PDF 与模板图时，系统不会停住，而是先把模块编排、样式统一和文件产出链路跑通。",
            cards: [
              {
                kicker: "Priority 01",
                title: "模板优先",
                copy: "一旦有模板图，模块节奏、版式层级和图文分布将优先向模板靠拢。"
              },
              {
                kicker: "Priority 02",
                title: "真实内容",
                copy: "标题、卖点、数据、图表结论全部来自 PDF 或素材，不做事实捏造。"
              },
              {
                kicker: "Priority 03",
                title: "空内容可交付",
                copy: "内容不足时明确标注，并维持高级视觉占位，而不是塞入糊图或伪文案。"
              }
            ],
            bullets: [
              "input/assets 有高清图时优先使用。",
              "PDF 内容过多时，只保留结论、卖点、数据亮点与视觉化短句。",
              "后续可直接封装为命令行或 Web App。"
            ],
            chips: ["750PX", "GOLDEN LUXURY", "TRACEABLE", "AUTO-CONTINUE"],
            footnote: "当前模块使用流程说明替代真实业务内容。"
          }
        };
      }

      if (module.module_type_guess === "data") {
        return {
          ...moduleBase,
          confidence: 0.22,
          selected_content: {
            section_label: "Data Readiness",
            title: "真实数据位已留出，但目前没有 PDF 可抽取",
            body: "数据模块已经具备卡片化数字强调、来源标记与压缩说明位置；有 PDF 后会自动填充。",
            stats: [
              { kicker: "Input", value: "0", label: "PDF pages parsed", note: "等待实际文档" },
              { kicker: "Output", value: "100%", label: "pipeline scaffold", note: "日志、HTML、PNG 均已打通" },
              { kicker: "Mapping", value: "LOW", label: "confidence", note: "内容不足时低置信度回退" },
              { kicker: "Policy", value: "STRICT", label: "no fabrication", note: "没有内容就明确写明内容不足" }
            ],
            compression_notes:
              "当未来 PDF 过长时，系统会保留结论标题、核心卖点、数据亮点和可视化短句，并压缩正文长度。",
            source_note: "当前 source note 来自系统状态，而非业务 PDF。"
          }
        };
      }

      if (module.module_type_guess === "visual") {
        return {
          ...moduleBase,
          confidence: 0.2,
          selected_content: {
            section_label: "Image Strategy",
            title: "图像位已建立优先级，但暂无高清素材",
            body: "系统会在有素材时优先使用 input/assets 的高清图，其次再考虑模板指定图位和 PDF 图片线索。",
            bullets: [
              "高清资产优先于 PDF 内嵌图片。",
              "图片质量不足时保留高质感占位框，不强塞模糊图。",
              "后续可扩展到自动裁切、主视觉检测和图像打标。"
            ],
            caption: "当前图像位使用高级占位样式，等待真实视觉物料注入。"
          }
        };
      }

      return {
        ...moduleBase,
        confidence: 0.3,
        selected_content: {
          section_label: "Next Step",
          title: "把素材放进 input/，重新运行即可出正式长图",
          body:
            "这版 MVP 已经是可复用的程序化骨架。你后续只需要补齐模板图、PDF 和高清素材，脚本就会自动产出结构化日志、模块 HTML 和最终 PNG。",
          actions: ["Drop Materials", "Rerun npm run generate"],
          checklist: [
            "把模板图放进 input/template",
            "把 PDF 放进 input/pdf",
            "把高清图片和 logo 放进 input/assets",
            "必要时补一个 input/task.json 覆盖默认配置"
          ],
          footnote: "当前为无素材演示版，明确保留内容不足标记。"
        }
      };
    }

    const titles = signals.titles.slice(index, index + 2);
    const headings = signals.headings.slice(index * 2, index * 2 + 4);
    const paragraphs = signals.paragraphs.slice(index * 2, index * 2 + 3);
    const dataPoints = signals.dataPoints.slice(index * 2, index * 2 + 4);
    const shortSellingPoints = signals.shortSellingPoints.slice(index * 3, index * 3 + 6);
    const imageSource = pickBestAsset(inventory, usedAssetNames);
    const sourcePdf = titles[0]?.source_pdf || headings[0]?.source_pdf || paragraphs[0]?.source_pdf || null;
    const sourcePages = formatPages([...titles, ...headings, ...paragraphs, ...dataPoints]);

    if (module.module_type_guess === "hero") {
      return {
        ...moduleBase,
        source_pdf: sourcePdf,
        source_pages: sourcePages,
        image_source: imageSource || moduleBase.image_source,
        compression_notes: "Hero keeps top conclusion, one supporting paragraph and up to four metrics.",
        confidence: 0.78,
        selected_content: {
          eyebrow: titles[0]?.text || headings[0]?.text || "Auto extracted overview",
          title: titles[0]?.text || headings[0]?.text || "内容不足",
          subtitle:
            paragraphs[0]?.text ||
            "内容不足：PDF 中尚未抽出足够支撑 hero 模块的长摘要。",
          body:
            paragraphs[1]?.text ||
            "This hero module uses the highest-priority conclusion title and the most explanatory paragraph found in the PDFs.",
          stats: dataPoints.slice(0, 4).map((entry, dataIndex) => ({
            kicker: `Data ${dataIndex + 1}`,
            value: entry.values?.[0] || "N/A",
            label: entry.text.slice(0, 26),
            note: `${entry.source_pdf} · p.${entry.page}`
          })),
          image_caption:
            imageSource?.label || "No high-resolution image available; premium placeholder preserved.",
          footnote: sourcePdf
            ? `Source anchored to ${sourcePdf}${sourcePages.length ? ` pages ${sourcePages.join(", ")}` : ""}.`
            : "内容不足：未找到可追溯来源。"
        }
      };
    }

    if (module.module_type_guess === "highlights") {
      const cards = chunk(shortSellingPoints, 2).slice(0, 3).map((pair, pairIndex) => ({
        kicker: `Highlight ${pairIndex + 1}`,
        title: pair[0]?.text || headings[pairIndex]?.text || "内容不足",
        copy: pair[1]?.text || paragraphs[pairIndex]?.text || "内容不足：候选文案不足。"
      }));
      return {
        ...moduleBase,
        source_pdf: sourcePdf,
        source_pages: sourcePages,
        image_source: imageSource || moduleBase.image_source,
        compression_notes: "Short selling points were compressed into card-led highlights.",
        confidence: 0.73,
        selected_content: {
          section_label: "Key Highlights",
          title: headings[0]?.text || titles[0]?.text || "核心亮点",
          body:
            paragraphs[0]?.text ||
            "内容不足：需要更多可视化短句来撑起高密度 highlight 模块。",
          cards,
          bullets: shortSellingPoints.slice(0, 3).map((entry) => entry.text),
          chips: ["TRACEABLE", "MODULE FIT", "AUTO-COMPRESSED"],
          footnote: sourcePdf ? `Short-copy candidates sourced from ${sourcePdf}.` : "内容不足"
        }
      };
    }

    if (module.module_type_guess === "data") {
      return {
        ...moduleBase,
        source_pdf: sourcePdf,
        source_pages: sourcePages,
        image_source: imageSource || moduleBase.image_source,
        compression_notes:
          "Numeric lines were prioritized over verbose paragraphs. Supporting explanation stays limited to one compact copy block.",
        confidence: 0.76,
        selected_content: {
          section_label: "Data Lens",
          title: headings[0]?.text || "关键数据",
          body:
            paragraphs[0]?.text ||
            "内容不足：当前 PDF 中缺少足够清晰的数据解释语句。",
          stats: dataPoints.slice(0, 4).map((entry, dataIndex) => ({
            kicker: `Metric ${dataIndex + 1}`,
            value: entry.values?.[0] || "N/A",
            label: entry.text.slice(0, 28),
            note: `${entry.source_pdf} · p.${entry.page}`
          })),
          source_note: sourcePdf
            ? `${sourcePdf}${sourcePages.length ? ` · pages ${sourcePages.join(", ")}` : ""}`
            : "内容不足：暂无稳定来源页码"
        }
      };
    }

    if (module.module_type_guess === "visual") {
      return {
        ...moduleBase,
        source_pdf: sourcePdf,
        source_pages: sourcePages,
        image_source: imageSource || moduleBase.image_source,
        compression_notes: "Visual module prefers assets first; PDF image clues are retained as captions.",
        confidence: imageSource ? 0.74 : 0.51,
        selected_content: {
          section_label: "Visual Proof",
          title: headings[0]?.text || "图像线索与视觉承载",
          body:
            paragraphs[0]?.text ||
            "内容不足：当前可用图片线索不足，建议补充高质量产品图或人物图。",
          bullets: signals.imageClues.slice(0, 3).map((entry) => `${entry.text} · ${entry.source_pdf} p.${entry.page}`),
          caption:
            signals.imageClues[0]?.text ||
            (imageSource ? `Image sourced from ${imageSource.label}.` : "内容不足：暂无图像线索。")
        }
      };
    }

    return {
      ...moduleBase,
      source_pdf: sourcePdf,
      source_pages: sourcePages,
      image_source: imageSource || moduleBase.image_source,
      compression_notes: "Closing module keeps one conclusion line plus operational next steps.",
      confidence: 0.68,
      selected_content: {
        section_label: "Closing Takeaway",
        title: titles[0]?.text || headings[0]?.text || "结论与下一步",
        body:
          paragraphs[0]?.text ||
          "内容不足：需要更明确的结论性文案来支撑收尾模块。",
        actions: ["Review First Module", "Export Final Long Image"],
        checklist: [
          sourcePdf ? `Primary source PDF: ${sourcePdf}` : "内容不足：尚无主来源 PDF",
          sourcePages.length ? `Traceable pages: ${sourcePages.join(", ")}` : "暂无可靠页码",
          imageSource ? `Image ready: ${imageSource.label}` : "暂无高质量图片",
          "设计 tokens 已统一，可直接进入后续产品化封装"
        ],
        footnote: sourcePdf ? `Final module anchored to ${sourcePdf}.` : "内容不足"
      }
    };
  });
}

function buildContentMappingMarkdown(mapping) {
  const lines = ["# Content Mapping", ""];

  for (const item of mapping) {
    lines.push(`## ${item.module_id}`);
    lines.push(`- Module type: ${item.module_type}`);
    lines.push(`- Source PDF: ${item.source_pdf || "none"}`);
    lines.push(`- Source pages: ${item.source_pages?.length ? item.source_pages.join(", ") : "none"}`);
    lines.push(`- Image source: ${item.image_source?.label || "none"}`);
    lines.push(`- Confidence: ${item.confidence}`);
    lines.push(`- Compression notes: ${item.compression_notes}`);
    lines.push(`- Title: ${item.selected_content.title || item.selected_content.section_label || "内容不足"}`);
    lines.push("");
  }

  return lines.join("\n");
}

function buildDesignSystemMarkdown(tokens, analysis) {
  return [
    "# Design System",
    "",
    `- Theme: ${tokens.meta.theme}`,
    `- Target width: ${tokens.meta.target_width}px`,
    `- Template mode: ${tokens.meta.template_mode}`,
    `- Module count: ${tokens.meta.module_count}`,
    "",
    "## Palette",
    "",
    `- Background top: ${tokens.color_palette.background_top}`,
    `- Background bottom: ${tokens.color_palette.background_bottom}`,
    `- Gold primary: ${tokens.color_palette.gold_primary}`,
    `- Gold deep: ${tokens.color_palette.gold_deep}`,
    `- Text primary: ${tokens.color_palette.text_primary}`,
    "",
    "## Typography",
    "",
    `- Display font: ${tokens.typography.display.font_family}`,
    `- Hero size: ${tokens.typography.display.size.hero}px`,
    `- Section size: ${tokens.typography.display.size.section}px`,
    `- Body size: ${tokens.typography.body.size.body}px`,
    "",
    "## Surfaces",
    "",
    `- Card radius: ${tokens.surfaces.card_radius}px`,
    `- Image radius: ${tokens.surfaces.image_radius}px`,
    `- Shadow: ${tokens.surfaces.shadow}`,
    "",
    "## Rules",
    "",
    `- Number highlight: ${tokens.emphasis_rules.number_highlight}`,
    `- Empty state: ${tokens.emphasis_rules.empty_state}`,
    `- Image placeholder rule: ${tokens.image_rules.placeholder_style}`,
    "",
    "## Template Alignment",
    "",
    `- ${analysis.design_language.summary}`,
    `- ${analysis.design_language.template_risk}`,
    ""
  ].join("\n");
}

function buildManifest(inventory, config) {
  return {
    template_files: inventory.template_files.map((file) => file.file_name),
    pdf_files: inventory.pdf_files.map((file) => file.file_name),
    asset_files: inventory.asset_files.map((file) => file.file_name),
    task_config_found: inventory.task_config_found,
    target_width: config.target_width,
    theme: config.theme,
    prefer_assets_over_pdf_images: config.prefer_assets_over_pdf_images
  };
}

async function collectOutputFileSummary(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return {
      path: filePath,
      exists: true,
      size_bytes: stat.size,
      status: "success"
    };
  } catch {
    return {
      path: filePath,
      exists: false,
      size_bytes: 0,
      status: "failed"
    };
  }
}

async function buildRunReport({
  config,
  inventory,
  templateAnalysis,
  pdfExtraction,
  contentMapping,
  moduleArtifacts,
  finalArtifacts,
  warnings,
  errors
}) {
  const firstModule = contentMapping[0] || {};
  const requiredFiles = [
    path.join(PATHS.logs, "run_report.md"),
    path.join(PATHS.logs, "manifest.json"),
    path.join(PATHS.previews, "module_01.html"),
    path.join(PATHS.html, "final.html"),
    path.join(PATHS.previews, "module_01.png"),
    path.join(PATHS.final, "final.png")
  ];
  const fileSummaries = await Promise.all(requiredFiles.map(collectOutputFileSummary));

  const lines = [
    "# Run Report",
    "",
    `- Generated at: ${nowIso()}`,
    `- Target width: ${config.target_width}`,
    `- Theme: ${config.theme}`,
    `- Input resources: ${inventory.summary.total_resources}`,
    ""
  ];

  if (warnings.length) {
    lines.push("## Warnings", "");
    warnings.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (errors.length) {
    lines.push("## Errors", "");
    errors.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  lines.push("## Step 1 · Scan", "");
  lines.push(`- Templates: ${inventory.summary.template_count}`);
  lines.push(`- PDFs: ${inventory.summary.pdf_count}`);
  lines.push(`- Assets: ${inventory.summary.asset_count}`);
  lines.push(`- task.json found: ${inventory.task_config_found}`);
  lines.push("");

  lines.push("## Step 2 · Template Analysis", "");
  lines.push(`- Mode: ${templateAnalysis.mode}`);
  lines.push(`- Module count: ${templateAnalysis.modules.length}`);
  lines.push(`- Design summary: ${templateAnalysis.design_language.summary}`);
  lines.push("");

  lines.push("## Step 3 · PDF Extraction", "");
  lines.push(`- PDF count: ${pdfExtraction.summary.pdf_count}`);
  lines.push(`- Titles: ${pdfExtraction.summary.titles}`);
  lines.push(`- Key paragraphs: ${pdfExtraction.summary.key_paragraphs}`);
  lines.push(`- Data points: ${pdfExtraction.summary.data_points}`);
  lines.push("");

  lines.push("## Step 4 · Module 01", "");
  lines.push(`- Source PDF: ${firstModule.source_pdf || "none"}`);
  lines.push(
    `- Source pages: ${firstModule.source_pages?.length ? firstModule.source_pages.join(", ") : "none"}`
  );
  lines.push(`- Compression used: ${firstModule.compression_notes ? "yes" : "no"}`);
  lines.push(
    `- Placeholder image used: ${
      !firstModule.image_source?.path || firstModule.image_source?.type === "none" ? "yes" : "no"
    }`
  );
  lines.push("");

  lines.push("## Step 5 · Final HTML", "");
  lines.push(`- final.html generated: yes`);
  lines.push(`- Module previews generated: ${templateAnalysis.modules.length}`);
  lines.push("");

  lines.push("## Step 6 · Export", "");
  lines.push(
    `- module_01.png: ${moduleArtifacts.firstPreviewScreenshot ? "success" : "partial"}`
  );
  lines.push(`- final.png: ${finalArtifacts.finalPng ? "success" : "partial"}`);
  lines.push(`- final.jpg: ${finalArtifacts.finalJpg ? "success" : "partial"}`);
  lines.push("");

  lines.push("## Generated Files", "");
  for (const file of fileSummaries) {
    lines.push(
      `- ${file.path} | exists: ${file.exists} | size: ${file.size_bytes} | status: ${file.status}`
    );
  }

  return lines.join("\n");
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function writeMarkdown(filePath, text) {
  await fs.writeFile(filePath, text, "utf8");
}

async function generateModuleOutputs(modules, mapping, tokens) {
  const cssPath = path.join(PATHS.html, "design-tokens.css");
  const warnings = [];
  let firstPreviewScreenshot = false;
  await writeDesignCss(cssPath, tokens);

  for (let index = 0; index < modules.length; index += 1) {
    const module = modules[index];
    const mapped = mapping[index];
    const htmlPath = path.join(PATHS.previews, `${module.module_id}.html`);
    const pngPath = path.join(PATHS.previews, `${module.module_id}.png`);
    const moduleMarkup = renderModuleSection(htmlPath, module, mapped);
    const html = renderStandaloneHtml({
      title: `${module.module_id} Preview`,
      cssRelativePath: relativeFrom(htmlPath, cssPath),
      moduleMarkup,
      footerNote: `${module.module_id} preview · generated automatically`
    });
    await fs.writeFile(htmlPath, html, "utf8");
    try {
      await exportHtmlScreenshot({ htmlPath, outputPath: pngPath, type: "png" });
      if (index === 0) firstPreviewScreenshot = true;
    } catch (error) {
      warnings.push(`${module.module_id}.png export failed: ${error.message}`);
    }

    if (index === 0) {
      await writeMarkdown(
        path.join(PATHS.logs, "module_01_notes.md"),
        buildModuleNotes(module, mapped)
      );
    }
  }

  return { cssPath, warnings, firstPreviewScreenshot };
}

async function generateFinalOutputs(modules, mapping, cssPath) {
  const finalHtmlPath = path.join(PATHS.html, "final.html");
  const finalPngPath = path.join(PATHS.final, "final.png");
  const finalJpgPath = path.join(PATHS.final, "final.jpg");
  const warnings = [];
  const finalHtml = buildFinalHtml({
    finalHtmlPath,
    cssRelativePath: relativeFrom(finalHtmlPath, cssPath),
    modules,
    mappings: mapping
  });

  await fs.writeFile(finalHtmlPath, finalHtml, "utf8");
  let finalPng = false;
  let finalJpg = false;

  try {
    await exportHtmlScreenshot({ htmlPath: finalHtmlPath, outputPath: finalPngPath, type: "png" });
    finalPng = true;
  } catch (error) {
    warnings.push(`final.png export failed: ${error.message}`);
  }

  try {
    await exportHtmlScreenshot({ htmlPath: finalHtmlPath, outputPath: finalJpgPath, type: "jpeg" });
    finalJpg = true;
  } catch (error) {
    warnings.push(`final.jpg export failed: ${error.message}`);
  }

  return { warnings, finalPng, finalJpg };
}

async function main() {
  await ensureBaseStructure();

  console.log("- [STEP 1/6] 扫描输入目录并生成清单。");
  const taskConfig = (await readJsonIfExists(PATHS.task)) || {};
  const config = mergeConfig(taskConfig || DEFAULT_CONFIG);
  const inventory = await scanInputFiles(config);
  const warnings = [];
  const errors = [];

  if (inventory.summary.total_resources === 0) {
    const message =
      "Input directories are empty. Continuing in fallback mode to satisfy minimum deliverables.";
    warnings.push(message);
    errors.push("input/template, input/pdf, input/assets are all empty.");
    console.log(`- [WARN] ${message}`);
    console.log("- [ERROR] input/template, input/pdf, input/assets are all empty.");
  }

  console.log("- [STEP 2/6] 分析模板结构并生成模块映射。");
  const templateAnalysis = await analyzeTemplates(inventory);
  console.log("- [STEP 3/6] 抽取 PDF 文本、数据亮点和图片线索。");
  const pdfExtraction = await extractPdfContent(inventory);
  const contentMapping = mapModuleContent(templateAnalysis.modules, pdfExtraction, inventory);
  const designTokens = buildDesignTokens(config, templateAnalysis, inventory, contentMapping);
  const manifest = buildManifest(inventory, config);

  await writeMarkdown(path.join(PATHS.logs, "file_inventory.md"), buildFileInventoryMarkdown(inventory));
  await writeJson(path.join(PATHS.logs, "file_inventory.json"), inventory);
  await writeJson(path.join(PATHS.logs, "manifest.json"), manifest);
  await writeMarkdown(path.join(PATHS.logs, "template_analysis.md"), buildTemplateAnalysisMarkdown(templateAnalysis));
  await writeJson(path.join(PATHS.logs, "module_map.json"), templateAnalysis.modules);
  await writeMarkdown(path.join(PATHS.logs, "pdf_extraction.md"), buildPdfExtractionMarkdown(pdfExtraction));
  await writeJson(path.join(PATHS.logs, "pdf_extraction.json"), pdfExtraction);
  await writeMarkdown(path.join(PATHS.logs, "content_mapping.md"), buildContentMappingMarkdown(contentMapping));
  await writeJson(path.join(PATHS.logs, "content_mapping.json"), contentMapping);
  await writeMarkdown(path.join(PATHS.logs, "design_system.md"), buildDesignSystemMarkdown(designTokens, templateAnalysis));
  await writeJson(path.join(PATHS.logs, "design_tokens.json"), designTokens);

  console.log("- [STEP 4/6] 生成第1模块预览 HTML，并在可用时导出 PNG。");
  const moduleArtifacts = await generateModuleOutputs(
    templateAnalysis.modules,
    contentMapping,
    designTokens
  );
  warnings.push(...moduleArtifacts.warnings);
  console.log("- [STEP 5/6] 生成完整长图 final.html。");
  const finalArtifacts = await generateFinalOutputs(
    templateAnalysis.modules,
    contentMapping,
    moduleArtifacts.cssPath
  );
  warnings.push(...finalArtifacts.warnings);

  console.log("- [STEP 6/6] 导出最终图片并写入 run_report.md。");
  const runReportPath = path.join(PATHS.logs, "run_report.md");
  const reportPayload = {
    config,
    inventory,
    templateAnalysis,
    pdfExtraction,
    contentMapping,
    moduleArtifacts,
    finalArtifacts,
    warnings,
    errors
  };
  let runReport = await buildRunReport(reportPayload);
  await writeMarkdown(runReportPath, runReport);
  runReport = await buildRunReport(reportPayload);
  await writeMarkdown(runReportPath, runReport);

  console.log("Long Image Agent MVP generation complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
