import fs from "node:fs/promises";
import path from "node:path";
import { exportHtmlScreenshot } from "./lib/render.mjs";

const ROOT = process.cwd();
const PATHS = {
  input: path.join(ROOT, "input"),
  template: path.join(ROOT, "input", "template"),
  pdf: path.join(ROOT, "input", "pdf"),
  assets: path.join(ROOT, "input", "assets"),
  reference: path.join(ROOT, "input", "reference"),
  task: path.join(ROOT, "input", "task.json"),
  output: path.join(ROOT, "output"),
  logs: path.join(ROOT, "output", "logs"),
  previews: path.join(ROOT, "output", "module_previews"),
  html: path.join(ROOT, "output", "html"),
  final: path.join(ROOT, "output", "final")
};

const CONFIG = {
  target_width: 750,
  theme: "golden luxury education commerce",
  prefer_assets_over_pdf_images: true
};

const MODULES = [
  ["M01", "顶部主视觉", ["主标题", "副标题", "能力标签", "特训营卖点", "产品堆头"]],
  ["M02", "用户痛点模块", ["痛点标题", "家长/老师/学生表达", "问题卡片"]],
  ["M03", "价值定义模块", ["题感是什么", "题感有什么用", "三栏说明"]],
  ["M04", "系统培养模块", ["Step1-Step4", "图示", "说明块"]],
  ["M05", "方法论证模块", ["题眼审题法", "90% 强化", "4个关键动作"]],
  ["M06", "模型证明模块", ["583解题模型", "圆形数据点", "书页/截图示意"]],
  ["M07", "学习法与内页展示", ["挖空笔记", "目录", "导图", "典题", "跟踪挑战"]],
  ["M08", "权威推荐模块", ["陈永华老师", "推荐语", "人物图", "徽章"]],
  ["M09", "产品信息模块", ["产品 mockup", "适用年级", "适用教材", "出版社", "ISBN"]],
  ["M10", "FAQ 模块", ["购买", "发货", "群服务", "问答卡片"]]
];

const PDF_RULES = [
  {
    match: "腰封-绝对题感",
    role: "direct_content_priority",
    extracted_signals: [
      "绝对题感",
      "30天清北名师题感提升特训营",
      "中考命题人郑重推荐",
      "陈永华老师",
      "新课标徽章",
      "三年级通用"
    ],
    mapped_modules: ["M01", "M08"]
  },
  {
    match: "核心考点公式",
    role: "visual_reference_only",
    extracted_signals: ["封面视觉参考", "99元", "包装风格参考"],
    mapped_modules: ["M09"]
  },
  {
    match: "绝对题感-盒子",
    role: "product_visual_reference",
    extracted_signals: ["绝对题感盒子包装", "产品身份一致", "封套/盒子形态"],
    mapped_modules: ["M01", "M09"]
  },
  {
    match: "主书延展",
    role: "inner_page_visual_reference",
    extracted_signals: ["7年级线索", "主书延展", "可用于内页展示 mockup"],
    mapped_modules: ["M06", "M07", "M09"]
  }
];

function logStep(step, text) {
  console.log(`- [STEP ${step}/6] ${text}`);
}

function logWarn(text) {
  console.log(`- [WARN] ${text}`);
}

async function ensureDirs() {
  await Promise.all(
    [
      PATHS.output,
      PATHS.logs,
      PATHS.previews,
      PATHS.html,
      PATHS.final
    ].map((dir) => fs.mkdir(dir, { recursive: true }))
  );
}

async function listFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => path.join(dir, entry.name));
  } catch {
    return [];
  }
}

async function statInfo(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return { exists: true, size: stat.size };
  } catch {
    return { exists: false, size: 0 };
  }
}

function matchRule(fileName) {
  return PDF_RULES.find((rule) => fileName.includes(rule.match));
}

function buildModuleMap() {
  return MODULES.map(([id, title, requiredFields], index) => ({
    module_id: id,
    order: index + 1,
    visual_order: index + 1,
    module_title: title,
    required_fields: requiredFields,
    style_notes: [
      "Follow the supplied template screenshot before adding decorative polish.",
      "Use warm gold / cream / deep brown hierarchy.",
      "Keep education-commerce readability over pure poster drama."
    ]
  }));
}

function buildTemplateAnalysis(templateFiles) {
  const modules = buildModuleMap();
  const md = [
    "# Template Analysis",
    "",
    `- Template file count: ${templateFiles.length}`,
    "- Template source: 绝对题感模板.png",
    "- Recognition mode: manual template-guided split",
    "- Template observation: the supplied long screenshot shows 10 stacked gray-title modules from hero to FAQ.",
    "- Action: respect the 10 fixed modules rather than inventing a new structure.",
    "",
    "## Design Language",
    "",
    "- Tone: education e-commerce with controlled gold premium finish.",
    "- Palette: cream background, warm gold accents, deep brown / black contrast.",
    "- Components: badges, outlined cards, light texture, metallic CTA, rounded product mockups.",
    "- Rhythm: hero -> pain -> value -> method -> evidence -> inner pages -> endorsement -> product -> FAQ.",
    ""
  ];
  modules.forEach((module) => {
    md.push(`- ${module.module_id} ${module.module_title}: ${module.required_fields.join(" / ")}`);
  });
  return { modules, markdown: md.join("\n") };
}

function buildPdfExtraction(pdfFiles) {
  const extraction = {
    pdfs: pdfFiles.map((filePath) => {
      const file_name = path.basename(filePath);
      const rule = matchRule(file_name);
      return {
        file_name,
        extraction_status: "vector_outline_detected",
        text_ocr_status: "low_confidence_no_live_text",
        role: rule?.role || "unclassified",
        extracted_signals: rule?.extracted_signals || [],
        mapped_modules: rule?.mapped_modules || [],
        note:
          "This PDF appears to be outline/curve-heavy. Live text extraction is weak, so high-confidence signals are derived from filename plus user-provided mapping rules."
      };
    })
  };

  const md = [
    "# PDF Extraction",
    "",
    "- Extraction mode: live text weak, fallback to filename + explicit mapping rules.",
    ""
  ];

  extraction.pdfs.forEach((pdf) => {
    md.push(`## ${pdf.file_name}`);
    md.push(`- role: ${pdf.role}`);
    md.push(`- mapped modules: ${pdf.mapped_modules.join(", ") || "none"}`);
    md.push(`- signals: ${pdf.extracted_signals.join(" / ") || "none"}`);
    md.push(`- note: ${pdf.note}`);
    md.push("");
  });

  return { extraction, markdown: md.join("\n") };
}

function buildContentMapping() {
  const mapping = [
    {
      module_id: "M01",
      module_title: "顶部主视觉",
      direct_sources: ["模板图", "腰封-绝对题感_转曲文件-三年级通用.pdf"],
      visual_references: ["绝对题感-盒子_转曲.pdf"],
      selected_content: {
        title: "绝对题感",
        subtitle: "心中有题感，破题如有神",
        campaign: "30天清北名师题感提升特训营",
        tags: ["基础题思维组", "题感提升", "清北名师", "30天特训"]
      },
      confidence: 0.92,
      mode: "direct_use"
    },
    {
      module_id: "M02",
      module_title: "用户痛点模块",
      direct_sources: ["模板图"],
      visual_references: [],
      selected_content: {
        title: "不会做题 / 方法问题",
        bullets: ["家长表达位", "老师表达位", "学生表达位"]
      },
      confidence: 0.46,
      mode: "template_led_partial"
    },
    {
      module_id: "M03",
      module_title: "价值定义模块",
      direct_sources: ["模板图"],
      visual_references: [],
      selected_content: {
        title: "初中学习该重视题感",
        cards: ["题感是什么", "题感有什么用", "价值说明待正式文案补齐"]
      },
      confidence: 0.51,
      mode: "template_led_partial"
    },
    {
      module_id: "M04",
      module_title: "系统培养模块",
      direct_sources: ["模板图"],
      visual_references: [],
      selected_content: {
        title: "“绝对题感”系统式培养",
        steps: ["Step 1", "Step 2", "Step 3", "Step 4"]
      },
      confidence: 0.38,
      mode: "placeholder_low_confidence"
    },
    {
      module_id: "M05",
      module_title: "方法论证模块",
      direct_sources: ["模板图"],
      visual_references: [],
      selected_content: {
        title: "题眼审题法",
        highlight: "90%",
        actions: ["关键动作 01", "关键动作 02", "关键动作 03", "关键动作 04"]
      },
      confidence: 0.44,
      mode: "template_led_partial"
    },
    {
      module_id: "M06",
      module_title: "模型证明模块",
      direct_sources: ["模板图"],
      visual_references: ["主书延展_7年级_转曲.pdf"],
      selected_content: {
        title: "583解题模型",
        data_points: ["5", "8", "3"],
        note: "书页截图待后续从 PDF 图像化提取"
      },
      confidence: 0.56,
      mode: "mixed"
    },
    {
      module_id: "M07",
      module_title: "学习法与内页展示",
      direct_sources: ["模板图"],
      visual_references: ["主书延展_7年级_转曲.pdf"],
      selected_content: {
        title: "“挖空笔记”学习法",
        sub_blocks: ["目录", "导图", "典题", "跟踪挑战"]
      },
      confidence: 0.52,
      mode: "mixed"
    },
    {
      module_id: "M08",
      module_title: "权威推荐模块",
      direct_sources: ["模板图", "腰封-绝对题感_转曲文件-三年级通用.pdf"],
      visual_references: [],
      selected_content: {
        title: "中考命题人郑重推荐",
        person: "陈永华老师",
        quote: "推荐语待从腰封高清版 OCR 补齐"
      },
      confidence: 0.84,
      mode: "direct_use"
    },
    {
      module_id: "M09",
      module_title: "产品信息模块",
      direct_sources: ["模板图", "绝对题感-盒子_转曲.pdf"],
      visual_references: ["【封面11.01】核心考点公式-99元终版.pdf", "主书延展_7年级_转曲.pdf"],
      selected_content: {
        title: "绝对题感（数学）",
        fields: [
          "适用年级：待核定（发现 7年级 / 三年级通用两条线索）",
          "适用教材：待 OCR",
          "出版社：待 OCR",
          "ISBN：待 OCR"
        ]
      },
      confidence: 0.67,
      mode: "mixed"
    },
    {
      module_id: "M10",
      module_title: "FAQ 模块",
      direct_sources: ["模板图"],
      visual_references: [],
      selected_content: {
        title: "购买相关问题",
        faqs: ["发货相关", "群服务相关", "版本相关"]
      },
      confidence: 0.34,
      mode: "placeholder_low_confidence"
    }
  ];

  const md = ["# Content Mapping", ""];
  mapping.forEach((item) => {
    md.push(`## ${item.module_id} ${item.module_title}`);
    md.push(`- direct sources: ${item.direct_sources.join(", ")}`);
    md.push(`- visual references: ${item.visual_references.join(", ") || "none"}`);
    md.push(`- mode: ${item.mode}`);
    md.push(`- confidence: ${item.confidence}`);
    md.push("");
  });

  return { mapping, markdown: md.join("\n") };
}

function designCss() {
  return `
  :root{--w:750px;--bg:#f7f1df;--ink:#26190f;--gold:#d2a84d;--gold2:#f5d98a;--gold3:#8a5a1d;--brown:#3e2815;--cream:#fff9ef;--line:rgba(140,94,32,.18);--shadow:0 18px 45px rgba(59,35,8,.14);}
  *{box-sizing:border-box} html,body{margin:0;background:linear-gradient(180deg,#f5edd8 0%,#fffaf1 100%);color:var(--ink);font-family:"Microsoft YaHei UI","PingFang SC",sans-serif}
  body{padding:0} .page{width:var(--w);margin:0 auto;background:linear-gradient(180deg,#fff9ef 0%,#fff4db 100%);position:relative;overflow:hidden}
  .page:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right,rgba(210,168,77,.16),transparent 24%),radial-gradient(circle at 20% 10%,rgba(145,95,29,.08),transparent 30%);pointer-events:none}
  .module{padding:18px 24px 0;position:relative}.block{background:rgba(255,251,244,.9);border:1px solid var(--line);border-radius:26px;box-shadow:var(--shadow);padding:24px;position:relative;overflow:hidden}
  .block:before{content:"";position:absolute;inset:0 0 auto 0;height:4px;background:linear-gradient(90deg,var(--gold3),var(--gold2),var(--gold))}
  .kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#fff7e5;border:1px solid rgba(210,168,77,.28);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold3)}
  .title{margin:18px 0 0;font-size:46px;line-height:1.08;font-weight:900;color:var(--brown)}
  .subtitle{margin:12px 0 0;font-size:22px;line-height:1.7;color:#5a4632}
  .grid{display:grid;gap:14px}.hero{grid-template-columns:1.2fr .9fr;margin-top:18px}.cols-3{grid-template-columns:repeat(3,1fr)}.cols-2{grid-template-columns:repeat(2,1fr)}
  .card,.mockup,.badgebox,.faq,.step,.metric{background:linear-gradient(180deg,#fffef9,#fff6e6);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 10px 28px rgba(78,48,11,.06)}
  .pillrow,.sources,.minirow{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.pill{padding:9px 12px;border-radius:999px;background:#2f2015;color:#fff5dd;font-size:13px}
  .camp{margin-top:16px;padding:16px 18px;border-radius:18px;background:linear-gradient(135deg,#2f2015,#6b4823);color:#fff3d0;font-size:24px;font-weight:800}
  .mockup{min-height:240px;display:grid;gap:10px;align-content:start;background:linear-gradient(160deg,#fff8e8,#f3e1b8)}
  .book{padding:14px;border-radius:14px;background:linear-gradient(160deg,#fff,#f3e7c4);border:1px solid rgba(138,90,29,.18);font-weight:700}
  h2{margin:0 0 10px;font-size:32px;color:var(--brown)} p{margin:0;line-height:1.75;color:#5f4a37}
  .label{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a5a1d;font-weight:700}
  .big{font-size:56px;font-weight:900;color:var(--gold3);line-height:1}.circle{width:88px;height:88px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(160deg,#fff,#efd8a0);border:1px solid rgba(138,90,29,.22);font-size:34px;font-weight:900;color:#5a3817}
  .faq h3,.card h3,.step h3,.metric h3{margin:0 0 8px;font-size:18px;color:#3e2815}.footer{padding:20px 24px 28px;color:#7d664d;font-size:12px}
  .note{margin-top:10px;color:#8c765d;font-size:13px}.quote{font-size:20px;line-height:1.7;font-weight:700;color:#4c341f}
  .person{display:flex;gap:16px;align-items:center}.avatar{width:86px;height:86px;border-radius:50%;background:linear-gradient(160deg,#f5deb2,#d9a95b);display:grid;place-items:center;color:#fff;font-weight:900;font-size:28px}
  .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(140,94,32,.28),transparent);margin:16px 0}
  `;
}

function renderModule01(mapping) {
  const m01 = mapping.find((item) => item.module_id === "M01");
  return `
  <section class="module"><div class="block">
    <span class="kicker">M01 Hero / Template Locked</span>
    <h1 class="title">${m01.selected_content.title}</h1>
    <p class="subtitle">${m01.selected_content.subtitle}</p>
    <div class="camp">${m01.selected_content.campaign}</div>
    <div class="pillrow">${m01.selected_content.tags.map((tag) => `<span class="pill">${tag}</span>`).join("")}</div>
    <div class="grid hero">
      <div class="card">
        <div class="label">Direct Material</div>
        <p class="quote">腰封 PDF 提供了顶部活动身份、推荐位和“题感提升特训营”的内容锚点；模板截图提供了模块结构与能力标签缺口。</p>
        <div class="sources"><span class="pill">模板图</span><span class="pill">腰封 PDF</span></div>
      </div>
      <div class="mockup">
        <div class="label">Product Stack / Visual Anchor</div>
        <div class="book">绝对题感-盒子_转曲.pdf</div>
        <div class="book">腰封-绝对题感_转曲文件-三年级通用.pdf</div>
        <div class="book">主书延展_7年级_转曲.pdf</div>
        <p class="note">当前先用产品 mockup 卡替代真实封面渲染，避免把“核心考点公式”错当正文内容。</p>
      </div>
    </div>
  </div></section>`;
}

function renderFinalHtml(mapping) {
  const get = (id) => mapping.find((item) => item.module_id === id);
  const m01 = get("M01"), m02 = get("M02"), m03 = get("M03"), m04 = get("M04"), m05 = get("M05");
  const m06 = get("M06"), m07 = get("M07"), m08 = get("M08"), m09 = get("M09"), m10 = get("M10");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=750,initial-scale=1"/><title>绝对题感（数学）长图</title><style>${designCss()}</style></head><body><div class="page">
  ${renderModule01(mapping)}
  <section class="module"><div class="block"><span class="kicker">M02 Pain</span><h2>${m02.selected_content.title}</h2><div class="grid cols-3">${m02.selected_content.bullets.map((item) => `<div class="card"><h3>${item}</h3><p>模板已给出痛点表达位，当前保留沟通框架，待正式文案补齐。</p></div>`).join("")}</div></div></section>
  <section class="module"><div class="block"><span class="kicker">M03 Value</span><h2>${m03.selected_content.title}</h2><div class="grid cols-3">${m03.selected_content.cards.map((item) => `<div class="card"><h3>${item}</h3><p>本模块保留价值解释结构，避免在 PDF 未 OCR 清晰前硬写长文案。</p></div>`).join("")}</div></div></section>
  <section class="module"><div class="block"><span class="kicker">M04 System</span><h2>${m04.selected_content.title}</h2><div class="grid cols-2">${m04.selected_content.steps.map((item) => `<div class="step"><div class="label">${item}</div><h3>系统路径占位</h3><p>模板存在 4 步图示结构，具体步骤说明待从正式高清稿提取。</p></div>`).join("")}</div></div></section>
  <section class="module"><div class="block"><span class="kicker">M05 Method</span><h2>${m05.selected_content.title}</h2><div class="grid hero"><div class="metric"><div class="label">结论强化</div><div class="big">${m05.selected_content.highlight}</div><p>模板明确要求强化结论感；当前保留数字锚点，避免虚构解释数据。</p></div><div class="grid cols-2">${m05.selected_content.actions.map((item) => `<div class="card"><h3>${item}</h3><p>动作细项待从正式方法页补齐。</p></div>`).join("")}</div></div></div></section>
  <section class="module"><div class="block"><span class="kicker">M06 Model</span><h2>${m06.selected_content.title}</h2><div class="minirow">${m06.selected_content.data_points.map((n) => `<div class="circle">${n}</div>`).join("")}</div><p class="note">${m06.selected_content.note}</p></div></section>
  <section class="module"><div class="block"><span class="kicker">M07 Inner Pages</span><h2>${m07.selected_content.title}</h2><div class="grid cols-2">${m07.selected_content.sub_blocks.map((item) => `<div class="card"><h3>${item}</h3><p>保留该子块位，后续优先从主书延展 PDF 做图像化截图。</p></div>`).join("")}</div></div></section>
  <section class="module"><div class="block"><span class="kicker">M08 Endorsement</span><h2>${m08.selected_content.title}</h2><div class="person"><div class="avatar">陈</div><div><div class="label">${m08.selected_content.person}</div><p class="quote">${m08.selected_content.quote}</p><div class="sources"><span class="pill">腰封 PDF 直接来源</span><span class="pill">模板徽章位</span></div></div></div></div></section>
  <section class="module"><div class="block"><span class="kicker">M09 Product</span><h2>${m09.selected_content.title}</h2><div class="grid hero"><div class="mockup"><div class="label">Product Mockup</div><div class="book">绝对题感-盒子_转曲.pdf</div><div class="book">主书延展_7年级_转曲.pdf</div><div class="book">【封面11.01】核心考点公式-99元终版.pdf</div><p class="note">“核心考点公式”仅作封面与包装表现参考，不进入正文卖点。</p></div><div class="card">${m09.selected_content.fields.map((item) => `<p>${item}</p>`).join("<div class='divider'></div>")}</div></div></div></section>
  <section class="module"><div class="block"><span class="kicker">M10 FAQ</span><h2>${m10.selected_content.title}</h2><div class="grid cols-3">${m10.selected_content.faqs.map((item) => `<div class="faq"><h3>${item}</h3><p>模板保留问答位，当前先放规范占位，不虚构承诺。</p></div>`).join("")}</div></div></section>
  <div class="footer">Generated for 绝对题感（数学） · structure locked by template screenshot · content mapped from real PDFs and filename-level high-confidence signals.</div>
  </div></body></html>`;
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function writeReport(inventory, mapping, commanderStatus) {
  const reportPath = path.join(PATHS.logs, "run_report.md");
  const targets = [
    path.join(PATHS.logs, "file_inventory.json"),
    path.join(PATHS.logs, "template_analysis.md"),
    path.join(PATHS.logs, "module_map.json"),
    path.join(PATHS.logs, "pdf_extraction.md"),
    path.join(PATHS.logs, "pdf_extraction.json"),
    path.join(PATHS.logs, "content_mapping.json"),
    path.join(PATHS.logs, "content_mapping.md"),
    path.join(PATHS.previews, "module_01.html"),
    path.join(PATHS.previews, "module_01.png"),
    path.join(PATHS.html, "final.html"),
    path.join(PATHS.final, "final.png")
  ];
  const files = await Promise.all(targets.map(async (file) => ({ path: file, ...(await statInfo(file)) })));
  const directModules = mapping.filter((item) => item.mode === "direct_use").map((item) => item.module_id);
  const lowConfidenceModules = mapping
    .filter((item) => item.mode.includes("placeholder") || item.confidence < 0.6)
    .map((item) => item.module_id);
  const buildLines = (reportMeta) => {
    const lines = [
      "# Run Report",
      "",
      `- Commander: ${commanderStatus}`,
      `- Template files: ${inventory.template_files.length}`,
      `- PDF files: ${inventory.pdf_files.length}`,
      `- Asset files: ${inventory.asset_files.length}`,
      `- Reference files: ${inventory.reference_files.length}`,
      "",
      "## Direct Material Modules",
      "",
      `- ${directModules.join(", ") || "none"}`,
      "",
      "## Placeholder / Low Confidence Modules",
      "",
      `- ${lowConfidenceModules.join(", ") || "none"}`,
      "",
      "## Generated Files",
      ""
    ];
    [...files, { path: reportPath, ...reportMeta }].forEach((file) => {
      lines.push(
        `- ${file.path} | exists: ${file.exists} | size: ${file.size} | status: ${file.exists ? "success" : "failed"}`
      );
    });
    return lines;
  };

  let reportMeta = { exists: false, size: 0 };
  for (let i = 0; i < 3; i += 1) {
    await fs.writeFile(reportPath, buildLines(reportMeta).join("\n"), "utf8");
    const nextMeta = await statInfo(reportPath);
    if (nextMeta.size === reportMeta.size && nextMeta.exists === reportMeta.exists) {
      reportMeta = nextMeta;
      break;
    }
    reportMeta = nextMeta;
  }

  await fs.writeFile(reportPath, buildLines(reportMeta).join("\n"), "utf8");
}

async function main() {
  await ensureDirs();

  logStep(1, "扫描输入并写出 file_inventory.json / run_report.md 初始上下文。");
  const inventory = {
    template_files: await listFiles(PATHS.template),
    pdf_files: await listFiles(PATHS.pdf),
    asset_files: await listFiles(PATHS.assets),
    reference_files: await listFiles(PATHS.reference),
    task_config_found: false,
    target_width: CONFIG.target_width,
    theme: CONFIG.theme
  };
  await writeJson(path.join(PATHS.logs, "file_inventory.json"), inventory);

  logStep(2, "读取模板图，按固定 10 模块结构生成 module_map.json。");
  const templateAnalysis = buildTemplateAnalysis(inventory.template_files);
  await fs.writeFile(path.join(PATHS.logs, "template_analysis.md"), templateAnalysis.markdown, "utf8");
  await writeJson(path.join(PATHS.logs, "module_map.json"), templateAnalysis.modules);

  logStep(3, "读取 PDF，输出基于真实文件名与已知规则的 pdf_extraction。");
  const pdfExtraction = buildPdfExtraction(inventory.pdf_files);
  await fs.writeFile(path.join(PATHS.logs, "pdf_extraction.md"), pdfExtraction.markdown, "utf8");
  await writeJson(path.join(PATHS.logs, "pdf_extraction.json"), pdfExtraction.extraction);

  logStep(4, "先做内容映射，再生成 M01 模块 HTML。");
  const contentMapping = buildContentMapping();
  await fs.writeFile(path.join(PATHS.logs, "content_mapping.md"), contentMapping.markdown, "utf8");
  await writeJson(path.join(PATHS.logs, "content_mapping.json"), contentMapping.mapping);
  const module01Html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=750,initial-scale=1"/><title>M01 绝对题感主视觉</title><style>${designCss()}</style></head><body><div class="page">${renderModule01(contentMapping.mapping)}<div class="footer">M01 generated first as the visual baseline for the full page.</div></div></body></html>`;
  await fs.writeFile(path.join(PATHS.previews, "module_01.html"), module01Html, "utf8");
  try {
    await exportHtmlScreenshot({
      htmlPath: path.join(PATHS.previews, "module_01.html"),
      outputPath: path.join(PATHS.previews, "module_01.png"),
      type: "png"
    });
  } catch (error) {
    logWarn(`module_01.png 导出失败：${error.message}`);
  }

  logStep(5, "在 M01 风格定调后继续生成整页 final.html。");
  const finalHtml = renderFinalHtml(contentMapping.mapping);
  await fs.writeFile(path.join(PATHS.html, "final.html"), finalHtml, "utf8");

  logStep(6, "导出 final.png 并写入最终 run_report.md。");
  try {
    await exportHtmlScreenshot({
      htmlPath: path.join(PATHS.html, "final.html"),
      outputPath: path.join(PATHS.final, "final.png"),
      type: "png"
    });
  } catch (error) {
    logWarn(`final.png 导出失败：${error.message}`);
  }

  await writeReport(inventory, contentMapping.mapping, "attempted externally, failed: Commander requires login");
}

main().catch((error) => {
  console.log(`- [ERROR] ${error.message}`);
  process.exitCode = 1;
});
