const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, LevelFormat
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };

function h1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text: t, bold: true, size: 36, font: "Microsoft YaHei", color: "1A5276" })] }); }
function h2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text: t, bold: true, size: 28, font: "Microsoft YaHei", color: "1A5276" })] }); }
function h3(t) { return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 24, font: "Microsoft YaHei" })] }); }
function p(t, o = {}) { return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: t, size: 21, font: "Microsoft YaHei", ...o })] }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }
function quote(t) {
  return new Paragraph({ spacing: { after: 120 }, indent: { left: 600 }, border: { left: { style: BorderStyle.SINGLE, size: 6, color: "1A5276", space: 8 } }, children: [new TextRun({ text: t, size: 21, font: "Microsoft YaHei", italics: true, color: "555555" })] });
}
function checklist(t) { return p("\u2610 " + t); }
function done(t) { return p("\u2611 " + t, { color: "888888" }); }

function makeRow(cells, isH = false) {
  const fill = isH ? "1A5276" : undefined;
  const fc = isH ? "FFFFFF" : "333333";
  return new TableRow({ children: cells.map(t => new TableCell({ borders, margins: cm, shading: fill ? { fill, type: ShadingType.CLEAR } : undefined, width: { size: Math.floor(9360 / cells.length), type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(t), size: 20, font: "Microsoft YaHei", bold: isH, color: fc })] })] })) });
}
function tbl(headers, rows) {
  const cw = Math.floor(9360 / headers.length);
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: Array(headers.length).fill(cw), rows: [makeRow(headers, true), ...rows.map(r => makeRow(r))] });
}

const c = [];

// Cover
c.push(
  new Paragraph({ spacing: { before: 3600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPC\u72ec\u7acb\u4ea7\u54c1\u5f00\u53d1", size: 52, bold: true, font: "Microsoft YaHei", color: "1A5276" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "\u5168\u6d41\u7a0bSOP\u624b\u518c", size: 36, font: "Microsoft YaHei", color: "555555" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "\u4ece\u60f3\u6cd5\u5230\u4e0a\u7ebf\u6536\u6b3e\uff0c\u4e00\u4e2a\u4eba\u8dd1\u901a\u5168\u6d41\u7a0b", size: 24, font: "Microsoft YaHei", color: "888888" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 }, children: [new TextRun({ text: "v1.0 | 2026-04-11 | \u914d\u5408\u5185\u9601\u7cfb\u7edf\u4f7f\u7528", size: 20, font: "Microsoft YaHei", color: "AAAAAA" })] }),
  pb()
);

// Phase 0
c.push(
  h1("Phase 0\uff1a\u60f3\u6cd5\u9a8c\u8bc1\uff08Day 1-3\uff09"),
  quote("\u76ee\u6807\uff1a\u786e\u8ba4\u8fd9\u4e2a\u60f3\u6cd5\u503c\u5f97\u82b1\u65f6\u95f4\u505a\u3002\u4e0d\u662f\u786e\u8ba4\u5b83\u80fd\u6210\u529f\uff0c\u662f\u786e\u8ba4\u75db\u70b9\u662f\u771f\u7684\u3002"),

  h2("0.1 \u75db\u70b9\u9a8c\u8bc1\uff083\u4e2a\u95ee\u9898\uff09"),
  p("1. \u8c01\u6709\u8fd9\u4e2a\u75db\u70b9\uff1f\uff08\u5199\u51fa\u5177\u4f53\u7684\u4eba\uff0c\u4e0d\u662f\u201c\u7528\u6237\u201d\uff09"),
  p("2. \u4ed6\u4eec\u73b0\u5728\u600e\u4e48\u89e3\u51b3\u7684\uff1f\uff08\u73b0\u6709\u66ff\u4ee3\u65b9\u6848\u662f\u4ec0\u4e48\uff09"),
  p("3. \u4e3a\u4ec0\u4e48\u73b0\u6709\u65b9\u6848\u4e0d\u591f\u597d\uff1f\uff08\u4f60\u7684\u5dee\u5f02\u5316\u5728\u54ea\uff09"),

  h2("0.2 \u5185\u9601\u8c03\u7528"),
  tbl(["\u8c01", "\u95ee\u4ec0\u4e48"],
    [["PG", "\u8fd9\u4e2a\u60f3\u6cd5\u662f\u201c\u60f3\u8981\u201d\u8fd8\u662f\u201c\u9700\u8981\u201d\uff1f"],
     ["\u8292\u683c", "\u8fd9\u4ef6\u4e8b\u600e\u4e48\u4f1a\u5931\u8d25\uff1f\uff08\u9006\u5411\u68c0\u9a8c\uff09"],
     ["Naval", "\u8fd9\u6709\u6760\u6746\u5417\uff1f\u8fb9\u9645\u6210\u672c\u8d8b\u8fd1\u96f6\u5417\uff1f"],
     ["CFO", "\u4f60\u80fd\u6491\u591a\u4e45\u4e0d\u8d5a\u94b1\uff1f"]]),

  h2("0.3 \u4ea7\u51fa\u7269"),
  checklist("\u4e00\u53e5\u8bdd\u5b9a\u4e49\uff1a\u201c\u4e3a[WHO]\u89e3\u51b3[WHAT\u75db\u70b9]\uff0c\u901a\u8fc7[HOW]\u201d"),
  checklist("\u7ade\u54c1\u5217\u8868\uff083-5\u5bb6\uff09+ \u6bcf\u5bb6\u7684\u6838\u5fc3\u5f31\u70b9"),
  checklist("\u5224\u65ad\uff1aGO / PIVOT / KILL"),
  pb()
);

// Phase 1
c.push(
  h1("Phase 1\uff1a\u7528\u6237\u8c03\u7814\uff08Day 4-7\uff09"),
  quote("\u76ee\u6807\uff1a\u548c5-10\u4e2a\u771f\u5b9e\u7528\u6237\u804a\u8fc7\u3002\u4e0d\u662f\u8c03\u67e5\u95ee\u5377\uff0c\u662f\u5bf9\u8bdd\u3002"),

  h2("1.1 Mom Test\u539f\u5219"),
  p("\u4e0d\u95ee\u201c\u4f60\u4f1a\u4e0d\u4f1a\u7528\u8fd9\u4e2a\u4ea7\u54c1\u201d\uff08\u4eba\u4eba\u4f1a\u8bf4\u4f1a\uff09"),
  p("\u95ee\u201c\u4f60\u4e0a\u6b21\u9047\u5230\u8fd9\u4e2a\u95ee\u9898\u662f\u4ec0\u4e48\u65f6\u5019\uff1f\u600e\u4e48\u89e3\u51b3\u7684\uff1f\u82b1\u4e86\u591a\u5c11\u94b1/\u65f6\u95f4\uff1f\u201d"),
  p("\u95ee\u884c\u4e3a\u4e0d\u95ee\u89c2\u70b9\uff0c\u95ee\u8fc7\u53bb\u4e0d\u95ee\u672a\u6765\u3002"),

  h2("1.2 \u8c03\u7814\u6a21\u677f"),
  tbl(["\u95ee\u9898", "\u76ee\u7684"],
    [["\u4f60\u4e0a\u6b21\u9047\u5230[X\u95ee\u9898]\u662f\u4ec0\u4e48\u65f6\u5019\uff1f", "\u9a8c\u8bc1\u75db\u70b9\u771f\u5b9e\u5b58\u5728"],
     ["\u5f53\u65f6\u600e\u4e48\u89e3\u51b3\u7684\uff1f", "\u4e86\u89e3\u73b0\u6709\u66ff\u4ee3\u65b9\u6848"],
     ["\u73b0\u6709\u65b9\u6848\u54ea\u91cc\u8ba9\u4f60\u4e0d\u6ee1\u610f\uff1f", "\u627e\u5dee\u5f02\u5316\u5207\u5165\u70b9"],
     ["\u4e3a\u89e3\u51b3\u8fd9\u4e2a\u95ee\u9898\u82b1\u8fc7\u94b1\u5417\uff1f\u591a\u5c11\uff1f", "\u9a8c\u8bc1\u4ed8\u8d39\u610f\u613f"],
     ["\u5982\u679c\u6709\u4e2a\u5de5\u5177\u80fd[X]\uff0c\u4f60\u4f1a\u600e\u4e48\u7528\uff1f", "\u53d1\u73b0\u771f\u5b9e\u4f7f\u7528\u573a\u666f"]]),

  h2("1.3 \u5185\u9601\u8c03\u7528"),
  p("CPO\uff1a\u7528 discovery-interview-prep + proto-persona \u51c6\u5907\u8c03\u7814"),
  p("CMO\uff1a\u7528 customer-research \u5206\u6790\u53cd\u9988"),

  h2("1.4 \u4ea7\u51fa\u7269"),
  checklist("5-10\u4efd\u7528\u6237\u8c03\u7814\u8bb0\u5f55"),
  checklist("\u7528\u6237\u753b\u50cf\uff081-2\u4e2a\u6838\u5fc3persona\uff09"),
  checklist("JTBD\u58f0\u660e\uff1a\u201c\u5f53[SITUATION]\u65f6\uff0c\u6211\u60f3[MOTIVATION]\uff0c\u8fd9\u6837\u6211\u5c31\u80fd[OUTCOME]\u201d"),
  pb()
);

// Phase 2
c.push(
  h1("Phase 2\uff1aMVP\u8bbe\u8ba1\uff08Day 8-10\uff09"),
  quote("\u76ee\u6807\uff1a\u786e\u5b9a\u505a\u4ec0\u4e48\u3001\u4e0d\u505a\u4ec0\u4e48\u3002\u780d\u5230\u53ea\u5269\u6838\u5fc3\u3002"),

  h2("2.1 \u529f\u80fd\u780d\u5200\u6cd5"),
  p("\u5217\u51fa\u4f60\u60f3\u505a\u7684\u6240\u6709\u529f\u80fd\uff0c\u7136\u540e\u95ee\u6bcf\u4e00\u4e2a\uff1a"),
  p("\u201c\u6ca1\u6709\u8fd9\u4e2a\u529f\u80fd\uff0c\u7528\u6237\u8fd8\u4f1a\u4ed8\u94b1\u5417\uff1f\u201d"),
  p("\u7b54\u6848\u662f\u201c\u4f1a\u201d\u7684\u624d\u7559\u3002\u5176\u4f59\u5168\u780d\u3002"),

  h2("2.2 MVP\u8303\u56f4\u5b9a\u4e49"),
  tbl(["\u7c7b\u578b", "\u6807\u51c6"],
    [["\u5fc5\u987b\u6709", "\u6ca1\u6709\u5b83\u7528\u6237\u4e0d\u4f1a\u4ed8\u94b1\u7684\u529f\u80fd\uff081-3\u4e2a\uff09"],
     ["\u6700\u597d\u6709", "\u6709\u4e86\u4f53\u9a8c\u66f4\u597d\uff0c\u4f46\u4e0d\u5f71\u54cd\u6838\u5fc3\u4ef7\u503c"],
     ["\u4ee5\u540e\u518d\u8bf4", "\u6240\u6709\u5176\u4ed6\u4e1c\u897f\u3002\u5168\u780d"]]),

  h2("2.3 \u5185\u9601\u8c03\u7528"),
  p("\u4e54\u5e03\u65af\uff1a\u201c\u8be5\u780d\u4ec0\u4e48\uff1f\u201d\uff08\u805a\u7126\u8bf4\u4e0d\uff09"),
  p("CPO\uff1a\u7528 prd-development \u5199MVP PRD"),
  p("CTO\uff1a\u8bc4\u4f30\u6280\u672f\u53ef\u884c\u6027\u548c\u5f00\u53d1\u65f6\u95f4"),
  p("COO\uff1a\u8fd9\u4e2a\u8303\u56f4\u4e00\u4e2a\u4eba\u80fd\u4e0d\u80fd2\u5468\u505a\u5b8c\uff1f"),

  h2("2.4 \u4ea7\u51fa\u7269"),
  checklist("MVP PRD\uff081-2\u9875\uff0c\u4e0d\u662f20\u9875\uff09"),
  checklist("\u7528\u6237\u6545\u4e8b\u5217\u8868\uff08\u6309\u4f18\u5148\u7ea7\u6392\u5e8f\uff09"),
  checklist("\u6280\u672f\u65b9\u6848\u786e\u8ba4\uff08CTO\u7b7e\u5b57\uff09"),
  checklist("\u65f6\u95f4\u4f30\u7b97\uff1aX\u5929\u5b8c\u6210"),
  pb()
);

// Phase 3
c.push(
  h1("Phase 3\uff1a\u6280\u672f\u642d\u5efa\uff08Day 11-12\uff09"),
  quote("\u76ee\u6807\uff1a\u57fa\u7840\u8bbe\u65bd\u5c31\u7eea\uff0c\u4ee3\u7801\u80fd\u8dd1\u3002"),

  h2("3.1 \u96f6\u6210\u672c\u6280\u672f\u6808\u4e00\u952e\u542f\u52a8"),
  tbl(["\u5de5\u5177", "\u7528\u9014", "\u8d39\u7528"],
    [["Next.js + TypeScript + Tailwind", "\u524d\u7aef\u6846\u67b6", "\u514d\u8d39"],
     ["Supabase", "\u6570\u636e\u5e93 + Auth + Storage", "\u514d\u8d39"],
     ["Vercel", "\u90e8\u7f72\u6258\u7ba1", "\u514d\u8d39"],
     ["Cloudflare", "DNS + CDN", "\u514d\u8d39"],
     ["Clerk", "\u7528\u6237\u8ba4\u8bc1", "\u514d\u8d39"],
     ["GitHub", "\u4ee3\u7801\u7248\u672c\u63a7\u5236", "\u514d\u8d39"]]),

  h2("3.2 \u64cd\u4f5c\u6b65\u9aa4"),
  p("Step 1: npx create-next-app@latest \u2192 git init \u2192 gh repo create"),
  p("Step 2: vercel link \u2192 Namecheap\u4e70\u57df\u540d \u2192 Cloudflare\u6539NS"),
  p("Step 3: Supabase\u521b\u5efa\u9879\u76ee + Clerk\u521b\u5efa\u5e94\u7528 \u2192 .env.local"),
  p("Step 4: \u9a8c\u8bc1\u57df\u540d\u53ef\u8bbf\u95ee + \u6ce8\u518c\u6d41\u7a0b\u8dd1\u901a"),

  h2("3.3 \u5185\u9601\u8c03\u7528"),
  p("CTO\uff1a\u6309\u96f6\u6210\u672c\u6808SOP\u6267\u884c\uff0c\u4e0d\u5141\u8bb8\u5f15\u5165\u4ed8\u8d39\u670d\u52a1"),
  p("CLO\uff1a\u786e\u8ba4.env\u4e0d\u63d0\u4ea4\u5230Git\uff0c\u9690\u79c1\u653f\u7b56\u6a21\u677f\u5c31\u4f4d"),

  h2("3.4 \u4ea7\u51fa\u7269"),
  checklist("\u53ef\u8bbf\u95ee\u7684\u57df\u540d + HTTPS"),
  checklist("\u6ce8\u518c/\u767b\u5f55\u6d41\u7a0b\u8dd1\u901a"),
  checklist("\u6570\u636e\u5e93\u8bfb\u5199\u6b63\u5e38"),
  checklist("Git\u4ed3\u5e93\u5e72\u51c0\uff0c.env\u5728.gitignore\u91cc"),
  pb()
);

// Phase 4
c.push(
  h1("Phase 4\uff1a\u6838\u5fc3\u529f\u80fd\u5f00\u53d1\uff08Day 13-24\uff09"),
  quote("\u76ee\u6807\uff1aMVP\u53ef\u7528\u3002\u80fd\u8dd1\u5c31\u884c\uff0c\u4e0d\u8981\u5b8c\u7f8e\u3002"),

  h2("4.1 \u5f00\u53d1\u8282\u5960"),
  p("\u6bcf\u5929\u4e0a\u5348\uff1a\u5199\u4ee3\u7801\uff08\u914d\u5408gstack\uff09"),
  p("\u6bcf\u5929\u4e0b\u5348\uff1a\u81ea\u6d4b + \u4fee\u590d"),
  p("\u6bcf2\u5929\uff1a\u627e1\u4e2a\u76ee\u6807\u7528\u6237\u8bd5\u7528\uff0c\u6536\u53cd\u9988"),
  p("\u7981\u6b62\uff1a\u82b1\u8d85\u8fc720%\u65f6\u95f4\u5728UI\u7f8e\u5316\u4e0a\u3002\u80fd\u7528\u5c31\u884c\u3002"),

  h2("4.2 gstack\u5de5\u4f5c\u6d41"),
  p("/plan \u2192 /code \u2192 /review \u2192 /test \u2192 /ship"),
  p("\u6bcf\u4e2aPR\u5fc5\u987b\u8fc7review\u548ctest\uff0c\u4e0d\u80fd\u8df3\u8fc7\u3002"),

  h2("4.3 \u5185\u9601\u8c03\u7528"),
  p("CPO\uff1a\u6bcf2\u5929\u68c0\u67e5\u4e00\u6b21\u201c\u8fd9\u4e2a\u529f\u80fd\u771f\u7684\u662fMVP\u5fc5\u987b\u7684\u5417\u201d"),
  p("CTO\uff1a\u4ee3\u7801\u8d28\u91cf\u5e95\u7ebf\uff08\u4e0d\u80fd\u4e3a\u4e86\u5feb\u800c\u57cb\u96f7\uff09"),
  p("\u8292\u683c\uff1a\u201c\u6211\u5728\u4f18\u5316\u4e00\u4e2a\u4e0d\u8be5\u5b58\u5728\u7684\u4e1c\u897f\u5417\uff1f\u201d"),

  h2("4.4 \u4ea7\u51fa\u7269"),
  checklist("MVP\u53ef\u7528\uff08\u6838\u5fc3\u6d41\u7a0b\u8dd1\u901a\uff09"),
  checklist("\u81f3\u5c115\u4e2a\u771f\u5b9e\u7528\u6237\u8bd5\u8fc7"),
  checklist("\u53cd\u9988\u8bb0\u5f55\uff08\u4ec0\u4e48\u597d\u7528/\u4ec0\u4e48\u96be\u7528/\u4ec0\u4e48\u7f3a\uff09"),
  pb()
);

// Phase 5
c.push(
  h1("Phase 5\uff1a\u652f\u4ed8\u96c6\u6210\uff08Day 25-27\uff09"),
  quote("\u76ee\u6807\uff1a\u80fd\u6536\u5230\u94b1\u3002\u4e0d\u662f\u201c\u51c6\u5907\u6536\u94b1\u201d\uff0c\u662f\u201c\u5b9e\u9645\u6536\u5230\u4e86\u94b1\u201d\u3002"),

  h2("5.1 Stripe\u96c6\u6210"),
  p("npm install stripe @stripe/stripe-js"),
  p("\u521b\u5efa /api/stripe/checkout \u548c /api/stripe/webhook \u4e24\u4e2a\u8def\u7531"),
  p("\u6d4b\u8bd5\u6a21\u5f0f\u8dd1\u901a\u5168\u6d41\u7a0b\uff0c\u518d\u5207\u6362\u5230\u751f\u4ea7\u73af\u5883"),

  h2("5.2 \u5b9a\u4ef7\u7b56\u7565"),
  p("\u5185\u9601\u8c03\u7528\uff1aCFO + CMO\u5bf9\u7ebf"),
  p("CFO\uff1a\u6210\u672c\u5e95\u7ebf\u662f\u591a\u5c11\uff1fLTV/CAC\u6a21\u578b"),
  p("CMO\uff1a\u7ade\u54c1\u5b9a\u4ef7\u9521\u70b9 + \u7528\u6237\u611f\u77e5\u4ef7\u503c"),
  p("\u5efa\u8bae\u8d77\u6b65\uff1a\u4e00\u4e2a\u4ef7\u683c\u3001\u4e00\u4e2a\u5957\u9910\u3002\u4e0d\u8981\u4e0a\u6765\u5c31\u5206\u4e09\u6863\u3002"),

  h2("5.3 \u4ea7\u51fa\u7269"),
  checklist("Stripe\u6d4b\u8bd5\u652f\u4ed8\u8dd1\u901a"),
  checklist("\u751f\u4ea7\u73af\u5883\u652f\u4ed8\u8dd1\u901a"),
  checklist("\u5b9a\u4ef7\u786e\u5b9a\uff08CFO+CMO\u5171\u540c\u7b7e\u5b57\uff09"),
  checklist("Webhook\u56de\u8c03\u6b63\u5e38\uff08\u4ed8\u6b3e\u540e\u81ea\u52a8\u5f00\u901a\u6743\u9650\uff09"),
  pb()
);

// Phase 6
c.push(
  h1("Phase 6\uff1a\u76d1\u63a7\u57cb\u70b9\uff08Day 28-29\uff09"),
  quote("\u76ee\u6807\uff1a\u77e5\u9053\u7528\u6237\u5728\u5e72\u4ec0\u4e48\u3001\u54ea\u91cc\u51fa\u95ee\u9898\u3001\u54ea\u91cc\u6d41\u5931\u3002"),

  h2("6.1 \u4e09\u4ef6\u5957"),
  tbl(["\u5de5\u5177", "\u76d1\u63a7\u4ec0\u4e48", "\u5173\u952e\u4e8b\u4ef6"],
    [["PostHog", "\u7528\u6237\u884c\u4e3a", "\u6ce8\u518c/\u767b\u5f55/\u6838\u5fc3\u529f\u80fd\u4f7f\u7528/\u4ed8\u6b3e"],
     ["Sentry", "\u9519\u8bef", "\u524d\u7aef\u62a5\u9519/API\u5f02\u5e38/\u672a\u6355\u83b7\u5f02\u5e38"],
     ["Upstash", "\u6027\u80fd", "\u7f13\u5b58\u547d\u4e2d\u7387/\u54cd\u5e94\u65f6\u95f4"]]),

  h2("6.2 \u5fc5\u57cb\u4e8b\u4ef6\uff08\u6700\u5c0f\u96c6\uff09"),
  p("1. \u7528\u6237\u6ce8\u518c\u5b8c\u6210"),
  p("2. \u7528\u6237\u9996\u6b21\u4f7f\u7528\u6838\u5fc3\u529f\u80fd"),
  p("3. \u7528\u6237\u53d1\u8d77\u4ed8\u6b3e"),
  p("4. \u7528\u6237\u4ed8\u6b3e\u6210\u529f"),
  p("5. \u7528\u6237\u6b21\u65e5\u56de\u8bbf"),

  h2("6.3 \u5185\u9601\u8c03\u7528"),
  p("CMO\uff1a\u786e\u8ba4\u5173\u952e\u8f6c\u5316\u8282\u70b9\u90fd\u6709\u57cb\u70b9"),
  p("CTO\uff1aSentry\u544a\u8b66\u914d\u7f6e\uff08\u9519\u8bef>10\u6b21/\u5c0f\u65f6\u5373\u544a\u8b66\uff09"),
  pb()
);

// Phase 7
c.push(
  h1("Phase 7\uff1aLanding Page\uff08Day 30-31\uff09"),
  quote("\u76ee\u6807\uff1a\u8ba9\u964c\u751f\u4eba30\u79d2\u5185\u7406\u89e3\u4f60\u505a\u4ec0\u4e48\u3001\u4e3a\u4ec0\u4e48\u4ed8\u94b1\u3002"),

  h2("7.1 \u7ed3\u6784\u516c\u5f0f\uff08\u4e0a\u5230\u4e0b\uff09"),
  tbl(["\u533a\u5757", "\u5185\u5bb9", "\u65f6\u95f4\u9650\u5236"],
    [["Hero", "\u4e00\u53e5\u8bdd\u5356\u70b9 + \u4e00\u4e2aCTA\u6309\u94ae", "\u7528\u6237\u52303\u79d2\u5185\u7406\u89e3"],
     ["Problem", "\u4f60\u7684\u7528\u6237\u73b0\u5728\u591a\u75db\uff08\u5177\u4f53\u573a\u666f\uff09", "\u5236\u9020\u5171\u9e23"],
     ["Solution", "\u4f60\u600e\u4e48\u89e3\u51b3\u7684\uff08\u622a\u56fe/\u52a8\u56fe\uff09", "\u964d\u4f4e\u7406\u89e3\u6210\u672c"],
     ["Social Proof", "\u7528\u6237\u8bc4\u4ef7/\u6570\u636e/Logo", "\u5efa\u7acb\u4fe1\u4efb"],
     ["Pricing", "\u7b80\u5355\u660e\u4e86\u7684\u4ef7\u683c", "\u6d88\u9664\u7096\u8c6b"],
     ["CTA", "\u91cd\u590d\u4e3b\u6309\u94ae", "\u4fc3\u6210\u884c\u52a8"]]),

  h2("7.2 \u5185\u9601\u8c03\u7528"),
  p("CMO\uff1a\u7528 page-cro + copywriting skill \u5ba1\u6838\u6587\u6848"),
  p("CPO\uff1a\u7528 positioning-statement \u786e\u8ba4\u5b9a\u4f4d\u4e00\u81f4"),
  p("\u4e54\u5e03\u65af\uff1a\u201c\u80fd\u4e0d\u80fd\u4e00\u53e5\u8bdd\u8bf4\u6e05\u8fd9\u4e2a\u4ea7\u54c1\u662f\u4ec0\u4e48\uff1f\u201d"),

  h2("7.3 \u4ea7\u51fa\u7269"),
  checklist("Landing Page\u4e0a\u7ebf"),
  checklist("\u624b\u673a\u7aef\u9002\u914d\u6b63\u5e38"),
  checklist("CTA\u6309\u94ae\u5230\u652f\u4ed8/\u6ce8\u518c\u6d41\u7a0b\u8dd1\u901a"),
  checklist("OG\u56fe\u7247+SEO meta\u914d\u7f6e\u5b8c\u6210"),
  pb()
);

// Phase 8
c.push(
  h1("Phase 8\uff1a\u53d1\u5e03\u4e0a\u7ebf\uff08Day 32-35\uff09"),
  quote("\u76ee\u6807\uff1a\u8ba9\u4e16\u754c\u77e5\u9053\u4f60\u5b58\u5728\u3002\u4e0d\u662f\u5b8c\u7f8e\u4e86\u518d\u53d1\uff0c\u662f\u53d1\u4e86\u518d\u5b8c\u7f8e\u3002"),

  h2("8.1 \u53d1\u5e03\u6e20\u9053\u6e05\u5355"),
  tbl(["\u6e20\u9053", "\u64cd\u4f5c", "\u9884\u671f"],
    [["Product Hunt", "\u5468\u4e8c/\u4e09\u51cc\u667600:01 PST\u53d1\u5e03", "\u524d100\u4e2a\u7528\u6237"],
     ["Hacker News", "Show HN: [one-liner]", "\u6280\u672f\u793e\u533a\u66dd\u5149"],
     ["Twitter/X", "\u521b\u59cb\u4eba\u6545\u4e8b + \u4ea7\u54c1\u94fe\u63a5", "\u4e2a\u4eba\u54c1\u724c"],
     ["\u5c0f\u7ea2\u4e66", "\u7528\u6237\u89c6\u89d2\u4f53\u9a8c\u5e16", "\u4e2d\u6587\u7528\u6237"],
     ["Reddit", "\u76f8\u5173\u5b50\u7248\u5206\u4eab", "\u7cbe\u51c6\u793e\u533a"],
     ["\u5fae\u4fe1\u670b\u53cb\u5708", "\u524d50\u4e2a\u79cd\u5b50\u7528\u6237\u5185\u6d4b\u53cd\u9988", "\u53e3\u7891\u542f\u52a8"]]),

  h2("8.2 \u5185\u9601\u8c03\u7528"),
  p("CMO\uff1a\u7528 launch-strategy + distribution-channels \u5236\u5b9a\u53d1\u5e03\u8ba1\u5212"),
  p("CPO\uff1a\u53d1\u5e03\u524d\u6700\u540e\u68c0\u67e5\u2014\u2014\u6838\u5fc3\u6d41\u7a0b\u6709\u6ca1\u6709bug"),
  p("CTO\uff1aSentry + PostHog\u5b9e\u65f6\u76d1\u63a7\u53d1\u5e03\u540e\u72b6\u6001"),

  h2("8.3 \u4ea7\u51fa\u7269"),
  checklist("\u53d1\u5e03\u5e16\u6587\u53d1\u51fa\uff08\u81f3\u5c113\u4e2a\u6e20\u9053\uff09"),
  checklist("\u524d24\u5c0f\u65f6\u6570\u636e\u8bb0\u5f55\uff08\u8bbf\u95ee/\u6ce8\u518c/\u4ed8\u6b3e\uff09"),
  checklist("\u7528\u6237\u53cd\u9988\u6536\u96c6\uff08\u81f3\u5c1010\u6761\uff09"),
  pb()
);

// Phase 9
c.push(
  h1("Phase 9\uff1a\u8fed\u4ee3\u4f18\u5316\uff08Day 36-60\uff09"),
  quote("\u76ee\u6807\uff1a\u6839\u636e\u771f\u5b9e\u6570\u636e\u8fed\u4ee3\uff0c\u4e0d\u662f\u6839\u636e\u611f\u89c9\u3002"),

  h2("9.1 \u6bcf\u5468\u5faa\u73af"),
  tbl(["\u5468\u4e00", "\u5468\u4e8c-\u56db", "\u5468\u4e94"],
    [["\u770bPostHog\u6570\u636e\uff0c\u5b9a\u672c\u5468\u76ee\u6807", "\u5f00\u53d1+\u6d4b\u8bd5+\u90e8\u7f72", "\u590d\u76d8\uff1a\u8fd9\u5468\u505a\u7684\u4e8b\u5bf9\u6307\u6807\u6709\u6ca1\u6709\u5f71\u54cd"]]),

  h2("9.2 \u5173\u6ce8\u4ec0\u4e48\u6307\u6807"),
  tbl(["\u9636\u6bb5", "\u6838\u5fc3\u6307\u6807", "\u5065\u5eb7\u7ebf"],
    [["\u524d2\u5468", "\u6ce8\u518c\u8f6c\u5316\u7387", ">20%"],
     ["\u524d1\u6708", "\u6b21\u65e5\u7559\u5b58", ">30%"],
     ["\u524d2\u6708", "\u4ed8\u8d39\u8f6c\u5316\u7387", ">3%"],
     ["\u6301\u7eed", "NPS", ">40"]]),

  h2("9.3 \u5185\u9601\u8c03\u7528"),
  p("CFO\uff1a\u6bcf\u5468\u5ba1\u8ba1\u5355\u4f4d\u7ecf\u6d4e\uff08CAC\u5728\u964d\u5417\uff1fLTV\u5728\u6da8\u5417\uff1f\uff09"),
  p("CMO\uff1a\u7528 churn-prevention \u5206\u6790\u6d41\u5931\u539f\u56e0"),
  p("\u8463\u4e8b\u4f1a\uff1a\u6bcf\u6708\u4e00\u6b21\u6218\u7565\u5ba1\u8ba1\u2014\u2014\u65b9\u5411\u8fd8\u5bf9\u5417\uff1f\u8be5pivot\u5417\uff1f"),
  pb()
);

// Phase 10
c.push(
  h1("Phase 10\uff1a\u589e\u957f\u4e0e\u53d8\u73b0\uff08Day 60+\uff09"),
  quote("\u76ee\u6807\uff1a\u627e\u5230\u53ef\u91cd\u590d\u7684\u83b7\u5ba2\u6e20\u9053\uff0c\u8ba9\u6536\u5165\u8d85\u8fc7\u6210\u672c\u3002"),

  h2("10.1 \u589e\u957f\u98de\u8f6e"),
  p("\u5185\u5bb9\u83b7\u5ba2 \u2192 \u7528\u6237\u4f7f\u7528 \u2192 \u7528\u6237\u4ea7\u51fa\u7ed3\u679c \u2192 \u7ed3\u679c\u53d8\u6210\u5185\u5bb9 \u2192 \u5438\u5f15\u65b0\u7528\u6237"),

  h2("10.2 \u53d8\u73b0\u5347\u7ea7\u8def\u5f84"),
  tbl(["\u9636\u6bb5", "\u64cd\u4f5c"],
    [["\u6708\u6536\u5165<\u00a55K", "\u4e13\u6ce8\u7559\u5b58\u548c\u53e3\u7891\uff0c\u4e0d\u8981\u82b1\u94b1\u6295\u653e"],
     ["\u00a55K-\u00a550K", "\u6d4b\u8bd51-2\u4e2a\u4ed8\u8d39\u6e20\u9053\uff08\u5c0f\u9884\u7b97\uff09"],
     ["\u00a550K+", "\u52a0\u4ef7\u6216\u52a0\u5957\u9910\uff0c\u63d0\u5347ARPU"],
     ["\u00a5200K+", "\u8003\u8651\u62db\u7b2c\u4e00\u4e2a\u4eba\u6216\u878d\u8d44"]]),

  h2("10.3 \u5185\u9601\u8c03\u7528"),
  p("Naval\uff1a\u201c\u8fd9\u4e2a\u6a21\u5f0f\u6709\u6760\u6746\u5417\uff1f\u8fb9\u9645\u6210\u672c\u5728\u964d\u5417\uff1f\u201d"),
  p("\u5df4\u83f2\u7279\uff1a\u201c\u62a4\u57ce\u6cb3\u5728\u53d8\u5bbd\u8fd8\u662f\u53d8\u7a84\uff1f\u201d"),
  p("COO\uff1a\u201c\u8be5\u62db\u4eba\u4e86\u5417\uff1f\u8fd8\u662f\u5148\u81ea\u52a8\u5316\uff1f\u201d"),
  pb()
);

// Appendix: Master Timeline
c.push(
  h1("\u9644\u5f55\uff1a60\u5929\u4e3b\u65f6\u95f4\u7ebf\u603b\u89c8"),
  tbl(["Day", "Phase", "\u4ea7\u51fa\u7269"],
    [["1-3", "P0 \u60f3\u6cd5\u9a8c\u8bc1", "\u4e00\u53e5\u8bdd\u5b9a\u4e49 + GO/KILL\u5224\u65ad"],
     ["4-7", "P1 \u7528\u6237\u8c03\u7814", "5-10\u4efd\u8c03\u7814 + \u7528\u6237\u753b\u50cf + JTBD"],
     ["8-10", "P2 MVP\u8bbe\u8ba1", "MVP PRD + \u7528\u6237\u6545\u4e8b + \u65f6\u95f4\u4f30\u7b97"],
     ["11-12", "P3 \u6280\u672f\u642d\u5efa", "\u57df\u540d+\u90e8\u7f72+\u6570\u636e\u5e93+\u8ba4\u8bc1"],
     ["13-24", "P4 \u6838\u5fc3\u5f00\u53d1", "MVP\u53ef\u7528 + 5\u4eba\u8bd5\u7528\u53cd\u9988"],
     ["25-27", "P5 \u652f\u4ed8", "Stripe\u8dd1\u901a + \u5b9a\u4ef7\u786e\u5b9a"],
     ["28-29", "P6 \u76d1\u63a7", "PostHog+Sentry+\u5173\u952e\u57cb\u70b9"],
     ["30-31", "P7 Landing Page", "\u843d\u5730\u9875\u4e0a\u7ebf + CTA\u8dd1\u901a"],
     ["32-35", "P8 \u53d1\u5e03", "\u81f3\u5c113\u6e20\u9053\u53d1\u5e03 + \u524d24h\u6570\u636e"],
     ["36-60", "P9 \u8fed\u4ee3", "\u6bcf\u5468\u5faa\u73af\uff1a\u6570\u636e\u2192\u5f00\u53d1\u2192\u590d\u76d8"],
     ["60+", "P10 \u589e\u957f", "\u53ef\u91cd\u590d\u83b7\u5ba2 + \u6536\u5165>\u6210\u672c"]]),

  new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "--- END ---", size: 20, color: "AAAAAA", font: "Microsoft YaHei" })] })
);

// Build
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Microsoft YaHei", color: "1A5276" }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Microsoft YaHei", color: "1A5276" }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Microsoft YaHei" }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1A5276", space: 4 } }, children: [new TextRun({ text: "OPC\u72ec\u7acb\u4ea7\u54c1\u5f00\u53d1SOP v1.0", size: 18, color: "888888", font: "Microsoft YaHei" })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u7b2c ", size: 18, color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }), new TextRun({ text: " \u9875", size: 18, color: "888888" })] })] })
    },
    children: c
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("C:/Users/86136/Desktop/OPC_\u72ec\u7acb\u4ea7\u54c1\u5f00\u53d1_\u5168\u6d41\u7a0bSOP.docx", buf);
  console.log("DONE");
});
