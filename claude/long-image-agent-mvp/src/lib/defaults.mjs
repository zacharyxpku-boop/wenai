import path from "node:path";

export const ROOT = process.cwd();

export const PATHS = {
  root: ROOT,
  input: path.join(ROOT, "input"),
  template: path.join(ROOT, "input", "template"),
  pdf: path.join(ROOT, "input", "pdf"),
  assets: path.join(ROOT, "input", "assets"),
  task: path.join(ROOT, "input", "task.json"),
  output: path.join(ROOT, "output"),
  logs: path.join(ROOT, "output", "logs"),
  previews: path.join(ROOT, "output", "module_previews"),
  html: path.join(ROOT, "output", "html"),
  final: path.join(ROOT, "output", "final")
};

export const DEFAULT_CONFIG = {
  target_width: 750,
  theme: "golden luxury",
  review_mode: "first_module_then_auto_continue",
  first_module_as_style_baseline: true,
  output_format: "png",
  prefer_assets_over_pdf_images: true,
  preserve_template_structure_first: true
};

export const MODULE_LIBRARY = [
  {
    module_type: "hero",
    required_fields: ["eyebrow", "title", "subtitle", "stats", "footnote"],
    style_notes: [
      "Large serif headline with metallic gold gradients.",
      "Top-of-page hero with luxury frame and editorial spacing.",
      "Supports summary metrics and a short explanatory paragraph."
    ]
  },
  {
    module_type: "highlights",
    required_fields: ["section_label", "title", "bullets", "chips"],
    style_notes: [
      "Three-column or staggered highlight cards.",
      "Short, punchy copy with strong hierarchy.",
      "Use outlined cards and glossy top borders."
    ]
  },
  {
    module_type: "data",
    required_fields: ["section_label", "title", "stats", "body", "source_note"],
    style_notes: [
      "Numeric emphasis with oversized digits and restrained labels.",
      "Dense information arranged in balanced card grids.",
      "Can host 2-4 stats plus one interpretation block."
    ]
  },
  {
    module_type: "visual",
    required_fields: ["section_label", "title", "body", "image", "caption"],
    style_notes: [
      "Large media frame with rich placeholder if no valid image exists.",
      "Use double-border treatment and soft radial backlights.",
      "Text should stay concise and secondary to imagery."
    ]
  },
  {
    module_type: "cta",
    required_fields: ["section_label", "title", "body", "actions", "footnote"],
    style_notes: [
      "Closing module with decisive conclusion and next-step instructions.",
      "Can use pill buttons, process steps or handoff notices.",
      "Bottom module should visually seal the entire long image."
    ]
  }
];

export const FILE_EXTENSIONS = {
  template: new Set([".png", ".jpg", ".jpeg", ".webp"]),
  pdf: new Set([".pdf"]),
  assets: new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"])
};

const MODULE_KEYWORDS = {
  hero: ["hero", "cover", "intro", "banner", "top", "head"],
  highlights: ["highlight", "feature", "selling", "point", "benefit", "advantage"],
  data: ["data", "chart", "metric", "stat", "number", "figure"],
  visual: ["image", "visual", "gallery", "product", "photo", "case"],
  cta: ["cta", "ending", "footer", "contact", "action", "final"]
};

export function mergeConfig(taskConfig = {}) {
  return { ...DEFAULT_CONFIG, ...taskConfig };
}

export function guessFileRole(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (FILE_EXTENSIONS.template.has(ext)) return "template";
  if (FILE_EXTENSIONS.pdf.has(ext)) return "pdf";
  if (FILE_EXTENSIONS.assets.has(ext)) return "asset";
  return "other";
}

export function guessModuleType(label, index, total) {
  const normalized = String(label || "").toLowerCase();

  for (const [moduleType, keywords] of Object.entries(MODULE_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return moduleType;
    }
  }

  if (index === 0) return "hero";
  if (index === total - 1) return "cta";
  if (index === 1) return "highlights";
  if (index === 2) return "data";
  return "visual";
}

export function inferModuleCountFromRatio(ratio) {
  if (ratio >= 7) return 6;
  if (ratio >= 5) return 5;
  if (ratio >= 3.6) return 4;
  if (ratio >= 2.2) return 3;
  return 2;
}

export function moduleBlueprintForType(moduleType) {
  return (
    MODULE_LIBRARY.find((item) => item.module_type === moduleType) ||
    MODULE_LIBRARY.find((item) => item.module_type === "visual")
  );
}

export function getKnownEdgeExecutable() {
  return (
    process.env.EDGE_EXECUTABLE ||
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  );
}

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export function relativeFrom(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile);
  return toPosix(rel.startsWith(".") ? rel : `./${rel}`);
}

export function nowIso() {
  return new Date().toISOString();
}

export function chunk(array, size) {
  const output = [];
  for (let index = 0; index < array.length; index += size) {
    output.push(array.slice(index, index + size));
  }
  return output;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
