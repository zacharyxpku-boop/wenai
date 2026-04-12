import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { getKnownEdgeExecutable, relativeFrom, toPosix } from "./defaults.mjs";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildDesignTokens(config, templateAnalysis, inventory, mapping) {
  const moduleCount = templateAnalysis.modules.length;
  const materialCount =
    inventory.summary.template_count + inventory.summary.pdf_count + inventory.summary.asset_count;

  return {
    meta: {
      theme: config.theme,
      target_width: config.target_width,
      module_count: moduleCount,
      materials_detected: materialCount,
      template_mode: templateAnalysis.mode
    },
    color_palette: {
      background_top: "#050506",
      background_bottom: "#18110a",
      panel_base: "#120d08",
      panel_elevated: "rgba(39, 28, 17, 0.92)",
      panel_soft: "rgba(248, 226, 170, 0.08)",
      gold_primary: "#f6d889",
      gold_bright: "#ffe9a8",
      gold_deep: "#b8822b",
      gold_shadow: "#6a4511",
      text_primary: "#fff6d7",
      text_secondary: "rgba(255, 243, 208, 0.78)",
      text_muted: "rgba(255, 243, 208, 0.54)",
      border_strong: "rgba(246, 216, 137, 0.34)",
      border_soft: "rgba(246, 216, 137, 0.16)"
    },
    backgrounds: {
      canvas:
        "radial-gradient(circle at 18% 0%, rgba(255, 226, 154, 0.22), transparent 34%), radial-gradient(circle at 85% 12%, rgba(201, 126, 15, 0.18), transparent 30%), linear-gradient(180deg, #050506 0%, #0d0906 42%, #18110a 100%)",
      panel:
        "linear-gradient(180deg, rgba(42, 31, 20, 0.96) 0%, rgba(15, 11, 8, 0.96) 100%)",
      metallic:
        "linear-gradient(135deg, rgba(255, 243, 202, 0.98) 0%, rgba(246, 216, 137, 0.98) 28%, rgba(182, 130, 43, 0.98) 74%, rgba(255, 236, 180, 0.92) 100%)"
    },
    typography: {
      display: {
        font_family: "'Times New Roman', 'STSong', 'Songti SC', serif",
        weight: 700,
        size: {
          hero: 64,
          section: 36,
          number: 48
        },
        letter_spacing: {
          hero: "0.06em",
          label: "0.18em"
        }
      },
      body: {
        font_family: "'Aptos', 'Microsoft YaHei UI', 'PingFang SC', sans-serif",
        weight: 400,
        size: {
          lead: 24,
          body: 18,
          caption: 14
        },
        line_height: {
          lead: 1.7,
          body: 1.8,
          caption: 1.6
        }
      }
    },
    emphasis_rules: {
      number_highlight: "Oversized metallic figures with muted uppercase labels.",
      short_copy_priority: "Keep lines short, visual and traceable to source material.",
      empty_state:
        "When material is missing, state 内容不足 explicitly and convert empty state into a polished placeholder."
    },
    surfaces: {
      card_radius: 28,
      image_radius: 30,
      section_padding: 40,
      gap: 24,
      shadow:
        "0 28px 60px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 236, 186, 0.12)",
      border: "1px solid rgba(246, 216, 137, 0.18)"
    },
    spacing: {
      canvas_side: 28,
      module_gap: 18,
      content_gap: 18,
      card_gap: 16
    },
    image_rules: {
      priority: [
        "input/assets",
        "template-designated materials",
        "PDF-derived image clues",
        "premium placeholders"
      ],
      crop: "Cover fill with center composition; avoid stretching.",
      placeholder_style:
        "Use metallic frame, subtle blur glow and engraved placeholder label instead of low-quality bitmap."
    },
    mapping_summary: mapping.map((item) => ({
      module_id: item.module_id,
      module_type: item.module_type,
      confidence: item.confidence,
      source_pdf: item.source_pdf,
      source_pages: item.source_pages
    }))
  };
}

export function designTokensToCss(tokens) {
  return `
:root {
  --canvas-width: ${tokens.meta.target_width}px;
  --canvas-bg: ${tokens.backgrounds.canvas};
  --panel-bg: ${tokens.backgrounds.panel};
  --metallic: ${tokens.backgrounds.metallic};
  --bg-top: ${tokens.color_palette.background_top};
  --bg-bottom: ${tokens.color_palette.background_bottom};
  --panel-base: ${tokens.color_palette.panel_base};
  --panel-elevated: ${tokens.color_palette.panel_elevated};
  --panel-soft: ${tokens.color_palette.panel_soft};
  --gold-primary: ${tokens.color_palette.gold_primary};
  --gold-bright: ${tokens.color_palette.gold_bright};
  --gold-deep: ${tokens.color_palette.gold_deep};
  --gold-shadow: ${tokens.color_palette.gold_shadow};
  --text-primary: ${tokens.color_palette.text_primary};
  --text-secondary: ${tokens.color_palette.text_secondary};
  --text-muted: ${tokens.color_palette.text_muted};
  --border-strong: ${tokens.color_palette.border_strong};
  --border-soft: ${tokens.color_palette.border_soft};
  --display-font: ${tokens.typography.display.font_family};
  --body-font: ${tokens.typography.body.font_family};
  --card-radius: ${tokens.surfaces.card_radius}px;
  --image-radius: ${tokens.surfaces.image_radius}px;
  --shadow-luxe: ${tokens.surfaces.shadow};
  --gap-outer: ${tokens.spacing.canvas_side}px;
  --gap-inner: ${tokens.spacing.gap}px;
  --gap-content: ${tokens.spacing.content_gap}px;
  --gap-card: ${tokens.spacing.card_gap}px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  min-height: 100%;
  background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
  color: var(--text-primary);
}

body {
  font-family: var(--body-font);
  padding: 0;
}

.long-image-page {
  width: var(--canvas-width);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: var(--canvas-bg);
}

.long-image-page::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 235, 190, 0.06), transparent 22%, transparent 78%, rgba(255, 235, 190, 0.04)),
    radial-gradient(circle at 12% 18%, rgba(255, 225, 140, 0.16), transparent 24%),
    radial-gradient(circle at 80% 10%, rgba(140, 82, 12, 0.18), transparent 30%);
  opacity: 0.95;
  pointer-events: none;
}

.grain {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  mix-blend-mode: screen;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 0.8px, transparent 0),
    radial-gradient(circle at 2px 2px, rgba(255,222,156,0.14) 0.6px, transparent 0);
  background-size: 14px 14px, 21px 21px;
  pointer-events: none;
}

.page-inner {
  position: relative;
  z-index: 1;
  padding: 22px 0 32px;
}

.module {
  position: relative;
  padding: 0 var(--gap-outer);
  margin-top: 18px;
}

.module-shell {
  position: relative;
  background: var(--panel-bg);
  border: 1px solid var(--border-soft);
  border-radius: 34px;
  padding: 30px 28px 30px;
  box-shadow: var(--shadow-luxe);
  overflow: hidden;
}

.module-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 245, 214, 0.08) 0%, transparent 20%, transparent 75%, rgba(255, 204, 106, 0.06) 100%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 40%);
  pointer-events: none;
}

.module-shell::after {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 26px;
  border: 1px solid rgba(246, 216, 137, 0.12);
  pointer-events: none;
}

.eyebrow, .section-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  color: var(--gold-bright);
  background: rgba(246, 216, 137, 0.08);
  border: 1px solid rgba(246, 216, 137, 0.18);
  text-transform: uppercase;
  letter-spacing: ${tokens.typography.display.letter_spacing.label};
  font-size: 11px;
  font-weight: 600;
}

.eyebrow::before, .section-label::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--metallic);
  box-shadow: 0 0 18px rgba(255, 225, 145, 0.38);
}

.hero-grid, .info-grid, .stats-grid, .visual-grid, .footer-grid {
  display: grid;
  gap: var(--gap-card);
}

.hero-grid { grid-template-columns: 1.55fr 0.95fr; align-items: stretch; margin-top: 20px; }
.info-grid { grid-template-columns: repeat(3, 1fr); margin-top: 22px; }
.stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 20px; }
.visual-grid { grid-template-columns: 1.1fr 0.9fr; margin-top: 20px; }
.footer-grid { grid-template-columns: 1.1fr 0.9fr; margin-top: 18px; }

.display-title, .section-title {
  margin: 16px 0 0;
  font-family: var(--display-font);
  font-weight: ${tokens.typography.display.weight};
  line-height: 1.06;
  color: transparent;
  background: var(--metallic);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 10px 28px rgba(125, 81, 15, 0.2);
}

.display-title { font-size: ${tokens.typography.display.size.hero}px; letter-spacing: ${tokens.typography.display.letter_spacing.hero}; }
.section-title { font-size: ${tokens.typography.display.size.section}px; }

.subtitle, .body-copy, .footnote, .caption, .source-note, .metric-label { color: var(--text-secondary); }
.subtitle { font-size: ${tokens.typography.body.size.lead}px; line-height: ${tokens.typography.body.line_height.lead}; margin: 18px 0 0; }
.body-copy { font-size: ${tokens.typography.body.size.body}px; line-height: ${tokens.typography.body.line_height.body}; }
.footnote, .caption, .source-note { font-size: ${tokens.typography.body.size.caption}px; line-height: ${tokens.typography.body.line_height.caption}; }

.body-panel, .luxe-card, .metric-card, .copy-card, .image-frame, .cta-panel, .action-panel {
  position: relative;
  border-radius: var(--card-radius);
  background:
    linear-gradient(180deg, rgba(255, 245, 210, 0.055) 0%, rgba(255, 245, 210, 0.012) 100%),
    rgba(19, 14, 10, 0.82);
  border: 1px solid rgba(246, 216, 137, 0.14);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  overflow: hidden;
}

.body-panel, .copy-card, .cta-panel, .action-panel { padding: 22px 20px; }
.luxe-card, .metric-card { padding: 18px 18px 20px; }

.luxe-card::before, .metric-card::before, .image-frame::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 234, 171, 0.92) 22%, rgba(181, 125, 32, 0.86) 68%, transparent 100%);
}

.card-kicker {
  display: block;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
  color: var(--text-primary);
}

.card-copy, .metric-copy {
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.metric-number {
  font-family: var(--display-font);
  font-size: ${tokens.typography.display.size.number}px;
  line-height: 1;
  margin: 6px 0 4px;
  color: transparent;
  background: var(--metallic);
  -webkit-background-clip: text;
  background-clip: text;
}

.metric-label { text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px; }

.bullet-list, .action-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: grid;
  gap: 12px;
}

.bullet-list li, .action-list li {
  position: relative;
  padding-left: 22px;
  line-height: 1.75;
  color: var(--text-secondary);
}

.bullet-list li::before, .action-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 11px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--metallic);
  box-shadow: 0 0 14px rgba(255, 226, 147, 0.24);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 237, 187, 0.08);
  border: 1px solid rgba(255, 223, 140, 0.18);
  color: var(--gold-bright);
  font-size: 13px;
  letter-spacing: 0.08em;
}

.image-frame {
  min-height: 300px;
  border-radius: var(--image-radius);
  padding: 14px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 230, 164, 0.14), transparent 32%),
    linear-gradient(180deg, rgba(45, 32, 19, 0.98) 0%, rgba(12, 10, 8, 0.98) 100%);
}

.image-shell {
  width: 100%;
  height: 100%;
  min-height: 270px;
  border-radius: calc(var(--image-radius) - 10px);
  background:
    linear-gradient(135deg, rgba(255, 246, 210, 0.08), rgba(255, 246, 210, 0.03)),
    linear-gradient(180deg, rgba(7, 5, 5, 0.4), rgba(40, 28, 17, 0.7));
  border: 1px solid rgba(246, 216, 137, 0.12);
  overflow: hidden;
  display: grid;
  place-items: center;
  position: relative;
}

.image-shell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.placeholder-mark {
  text-align: center;
  padding: 32px;
}

.placeholder-mark strong {
  display: block;
  font-family: var(--display-font);
  font-size: 26px;
  letter-spacing: 0.08em;
  color: var(--gold-primary);
}

.placeholder-mark span {
  display: block;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.divider {
  height: 1px;
  margin: 18px 0 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 225, 146, 0.42) 50%, transparent 100%);
}

.source-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.source-pill {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--text-secondary);
  border: 1px solid rgba(246, 216, 137, 0.14);
  background: rgba(255,255,255,0.02);
}

.cta-title {
  margin: 14px 0 0;
  font-family: var(--display-font);
  font-size: 32px;
  line-height: 1.16;
  color: var(--text-primary);
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  padding: 14px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 225, 144, 0.28);
  text-decoration: none;
  color: #1d1204;
  background: var(--metallic);
  font-weight: 700;
  letter-spacing: 0.06em;
}

.cta-button.secondary {
  background: rgba(255, 237, 187, 0.06);
  color: var(--gold-bright);
}

.module-footer { margin-top: 18px; }
.page-footer-note { padding: 10px var(--gap-outer) 0; color: var(--text-muted); font-size: 12px; letter-spacing: 0.04em; }
`;
}

function renderStats(stats = []) {
  if (!stats.length) return "";
  return `
    <div class="stats-grid">
      ${stats
        .map(
          (stat) => `
            <article class="metric-card">
              <span class="card-kicker">${esc(stat.kicker || "Metric")}</span>
              <div class="metric-number">${esc(stat.value)}</div>
              <div class="metric-label">${esc(stat.label)}</div>
              ${stat.note ? `<p class="metric-copy">${esc(stat.note)}</p>` : ""}
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderBullets(items = []) {
  if (!items.length) return "";
  return `<ul class="bullet-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function renderChips(items = []) {
  if (!items.length) return "";
  return `<div class="chips">${items.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}</div>`;
}

function renderSourceStrip(mapping) {
  const pills = [];
  if (mapping.source_pdf) pills.push(`PDF: ${mapping.source_pdf}`);
  if (mapping.source_pages?.length) pills.push(`页码: ${mapping.source_pages.join(", ")}`);
  if (mapping.image_source?.type && mapping.image_source.type !== "none") {
    pills.push(`图像: ${mapping.image_source.label}`);
  }
  pills.push(`置信度: ${mapping.confidence}`);
  return `<div class="source-strip">${pills.map((item) => `<span class="source-pill">${esc(item)}</span>`).join("")}</div>`;
}

function renderImageBlock(moduleHtmlPath, imageSource, caption, fallbackLabel) {
  if (imageSource?.path) {
    const src = relativeFrom(moduleHtmlPath, imageSource.path);
    return `
      <div class="image-frame">
        <div class="image-shell">
          <img src="${esc(src)}" alt="${esc(caption || fallbackLabel || "Image asset")}" />
        </div>
      </div>
    `;
  }

  return `
    <div class="image-frame">
      <div class="image-shell">
        <div class="placeholder-mark">
          <strong>${esc(fallbackLabel || "内容不足")}</strong>
          <span>${esc(caption || "当前没有满足质量要求的图片素材，系统已保留高质感占位样式，避免硬塞低清图。")}</span>
        </div>
      </div>
    </div>
  `;
}

function renderHero(moduleHtmlPath, module, mapping) {
  const content = mapping.selected_content;
  return `
    <section class="module module-hero" id="${esc(module.module_id)}">
      <div class="module-shell">
        <span class="eyebrow">${esc(content.eyebrow)}</span>
        <div class="hero-grid">
          <div>
            <h1 class="display-title">${esc(content.title)}</h1>
            <p class="subtitle">${esc(content.subtitle)}</p>
            <div class="body-panel" style="margin-top: 18px;">
              <span class="card-kicker">Module Intent</span>
              <p class="body-copy">${esc(content.body)}</p>
              ${renderSourceStrip(mapping)}
            </div>
          </div>
          ${renderImageBlock(moduleHtmlPath, mapping.image_source, content.image_caption, "Style Baseline")}
        </div>
        ${renderStats(content.stats)}
        <div class="module-footer">
          <p class="footnote">${esc(content.footnote)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderHighlights(module, mapping) {
  const content = mapping.selected_content;
  return `
    <section class="module module-highlights" id="${esc(module.module_id)}">
      <div class="module-shell">
        <span class="section-label">${esc(content.section_label)}</span>
        <h2 class="section-title">${esc(content.title)}</h2>
        <p class="subtitle">${esc(content.body)}</p>
        <div class="info-grid">
          ${(content.cards || [])
            .map(
              (card) => `
                <article class="luxe-card">
                  <span class="card-kicker">${esc(card.kicker)}</span>
                  <h3 class="card-title">${esc(card.title)}</h3>
                  <p class="card-copy">${esc(card.copy)}</p>
                </article>
              `
            )
            .join("")}
        </div>
        ${renderBullets(content.bullets)}
        ${renderChips(content.chips)}
        <div class="divider"></div>
        <p class="footnote">${esc(content.footnote)}</p>
        ${renderSourceStrip(mapping)}
      </div>
    </section>
  `;
}

function renderData(module, mapping) {
  const content = mapping.selected_content;
  return `
    <section class="module module-data" id="${esc(module.module_id)}">
      <div class="module-shell">
        <span class="section-label">${esc(content.section_label)}</span>
        <h2 class="section-title">${esc(content.title)}</h2>
        <p class="subtitle">${esc(content.body)}</p>
        ${renderStats(content.stats)}
        <div class="copy-card" style="margin-top: 16px;">
          <span class="card-kicker">Compression Notes</span>
          <p class="body-copy">${esc(content.compression_notes)}</p>
          <p class="source-note">${esc(content.source_note)}</p>
        </div>
        ${renderSourceStrip(mapping)}
      </div>
    </section>
  `;
}

function renderVisual(moduleHtmlPath, module, mapping) {
  const content = mapping.selected_content;
  return `
    <section class="module module-visual" id="${esc(module.module_id)}">
      <div class="module-shell">
        <span class="section-label">${esc(content.section_label)}</span>
        <h2 class="section-title">${esc(content.title)}</h2>
        <div class="visual-grid">
          ${renderImageBlock(moduleHtmlPath, mapping.image_source, content.caption, "Premium Placeholder")}
          <div class="cta-panel">
            <span class="card-kicker">Visual Narrative</span>
            <p class="body-copy">${esc(content.body)}</p>
            ${renderBullets(content.bullets)}
            <p class="caption" style="margin-top: 16px;">${esc(content.caption)}</p>
            ${renderSourceStrip(mapping)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCta(module, mapping) {
  const content = mapping.selected_content;
  return `
    <section class="module module-cta" id="${esc(module.module_id)}">
      <div class="module-shell">
        <span class="section-label">${esc(content.section_label)}</span>
        <div class="footer-grid">
          <div class="cta-panel">
            <h2 class="cta-title">${esc(content.title)}</h2>
            <p class="body-copy">${esc(content.body)}</p>
            <div class="cta-actions">
              ${(content.actions || [])
                .map((action, index) => `<span class="cta-button ${index > 0 ? "secondary" : ""}">${esc(action)}</span>`)
                .join("")}
            </div>
            <p class="footnote" style="margin-top: 18px;">${esc(content.footnote)}</p>
          </div>
          <div class="action-panel">
            <span class="card-kicker">Operational Checklist</span>
            <ul class="action-list">
              ${(content.checklist || []).map((item) => `<li>${esc(item)}</li>`).join("")}
            </ul>
            ${renderSourceStrip(mapping)}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderModuleSection(moduleHtmlPath, module, mapping) {
  switch (module.module_type_guess) {
    case "hero":
      return renderHero(moduleHtmlPath, module, mapping);
    case "highlights":
      return renderHighlights(module, mapping);
    case "data":
      return renderData(module, mapping);
    case "visual":
      return renderVisual(moduleHtmlPath, module, mapping);
    case "cta":
      return renderCta(module, mapping);
    default:
      return renderVisual(moduleHtmlPath, module, mapping);
  }
}

export function renderStandaloneHtml({ title, cssRelativePath, moduleMarkup, footerNote }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=750, initial-scale=1" />
    <title>${esc(title)}</title>
    <link rel="stylesheet" href="${esc(toPosix(cssRelativePath))}" />
  </head>
  <body>
    <div class="long-image-page">
      <div class="grain"></div>
      <div class="page-inner">
        ${moduleMarkup}
      </div>
      ${footerNote ? `<div class="page-footer-note">${esc(footerNote)}</div>` : ""}
    </div>
  </body>
</html>`;
}

export async function writeDesignCss(cssPath, tokens) {
  await fs.writeFile(cssPath, designTokensToCss(tokens), "utf8");
}

export async function exportHtmlScreenshot({ htmlPath, outputPath, type = "png" }) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: getKnownEdgeExecutable(),
    args: ["--allow-file-access-from-files", "--disable-web-security"]
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 750, height: 1200 },
      deviceScaleFactor: 2
    });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type,
      ...(type === "jpeg" ? { quality: 92 } : {})
    });
  } finally {
    await browser.close();
  }
}

export function buildModuleNotes(module, mapping) {
  const content = mapping.selected_content;
  return [
    `# ${module.module_id}`,
    "",
    `- Module type: ${module.module_type_guess}`,
    `- Confidence: ${mapping.confidence}`,
    `- Source PDF: ${mapping.source_pdf || "none"}`,
    `- Source pages: ${mapping.source_pages?.length ? mapping.source_pages.join(", ") : "none"}`,
    `- Image source: ${mapping.image_source?.label || "none"}`,
    "",
    "## Selected content",
    "",
    `- Title: ${content.title || "内容不足"}`,
    `- Summary: ${content.body || content.subtitle || "内容不足"}`,
    `- Compression notes: ${mapping.compression_notes || "None"}`,
    ""
  ].join("\n");
}

export function buildFinalHtml({ finalHtmlPath, cssRelativePath, modules, mappings }) {
  const sections = modules
    .map((module, index) => renderModuleSection(finalHtmlPath, module, mappings[index]))
    .join("\n");

  return renderStandaloneHtml({
    title: "Long Image Agent Final",
    cssRelativePath,
    moduleMarkup: sections,
    footerNote:
      "Generated by Long Image Agent MVP. Replace empty-state content by dropping template / PDF / asset files into input/ and rerunning the pipeline."
  });
}
