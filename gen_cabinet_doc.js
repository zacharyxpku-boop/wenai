const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, LevelFormat, TableOfContents
} = require("docx");

// ── Helpers ──
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "2B5797" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, bold: true, size: 36, font: "Microsoft YaHei" })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, bold: true, size: 28, font: "Microsoft YaHei" })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, size: 24, font: "Microsoft YaHei" })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 21, font: "Microsoft YaHei", ...opts })] });
}
function bold(text) { return p(text, { bold: true }); }
function quote(text) {
  return new Paragraph({
    spacing: { after: 120 },
    indent: { left: 720 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: "2B5797", space: 8 } },
    children: [new TextRun({ text, size: 21, font: "Microsoft YaHei", italics: true, color: "555555" })]
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function makeRow(cells, isHeader = false) {
  const fill = isHeader ? "2B5797" : undefined;
  const fontColor = isHeader ? "FFFFFF" : "333333";
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      margins: cellMargins,
      shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
      width: { size: Math.floor(9360 / cells.length), type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: String(text), size: 20, font: "Microsoft YaHei", bold: isHeader, color: fontColor })] })]
    }))
  });
}

function makeTable(headers, rows) {
  const colCount = headers.length;
  const colWidth = Math.floor(9360 / colCount);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth),
    rows: [makeRow(headers, true), ...rows.map(r => makeRow(r))]
  });
}

// ── Content ──
const children = [];

// Cover
children.push(
  new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPC \u5185\u9601\u7cfb\u7edf", size: 56, bold: true, font: "Microsoft YaHei", color: "2B5797" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "\u4e00\u4eba\u516c\u53f8 AI \u51b3\u7b56\u4e0e\u6267\u884c\u64cd\u4f5c\u624b\u518c", size: 32, font: "Microsoft YaHei", color: "555555" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "v2.0 | 2026-04-10", size: 24, font: "Microsoft YaHei", color: "888888" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200 }, children: [new TextRun({ text: "\u4e00\u58f0\u300c\u5185\u9601\u300d\uff0c\u5168\u5458\u5f85\u547d\u3002CEO\u662f\u4f60\uff0c\u5176\u4ed6\u4eba\u662fAI\u3002", size: 24, font: "Microsoft YaHei", italics: true, color: "888888" })] }),
  pageBreak()
);

// TOC
children.push(
  h1("\u76ee\u5f55"),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
  pageBreak()
);

// ── Chapter 1: Overview ──
children.push(
  h1("\u7b2c\u4e00\u7ae0\uff1a\u7cfb\u7edf\u6982\u89c8"),
  h2("1.1 \u4ec0\u4e48\u662f\u5185\u9601"),
  p("\u5185\u9601\u662fOPC\uff08One Person Company\uff09\u521b\u59cb\u4eba\u7684AI\u51b3\u7b56\u4e0e\u6267\u884c\u603b\u67a2\u7ebd\u3002\u4e00\u4e2a\u5165\u53e3\u7edf\u7ba14\u5c42\u67b6\u6784\uff1a"),
  makeTable(["\u5c42\u7ea7", "\u540d\u79f0", "\u529f\u80fd", "\u7f16\u5236"],
    [["\u7b2c1\u5c42", "\u8463\u4e8b\u4f1a", "\u65b9\u5411\u5224\u65ad\u3001\u6218\u7565\u53d6\u820d", "7\u4f4d\u601d\u60f3\u5bb6"],
     ["\u7b2c2\u5c42", "C-Suite", "\u6267\u884c\u843d\u5730\u3001\u65b9\u6848\u4ea7\u51fa", "6\u4f4d\u9996\u5e2d\u5b98"],
     ["\u7b2c3\u5c42", "\u884c\u4e1a\u6a21\u5757", "\u7ade\u54c1\u60c5\u62a5\u3001\u884c\u4e1a\u6df1\u5ea6", "\u53ef\u63d2\u62d4"],
     ["\u7b2c4\u5c42", "\u5f15\u64ce\u5c42", "\u86b5\u9976\u3001\u65b9\u6cd5\u8bba\u3001\u751f\u547d\u5468\u671f", "3\u5f15\u64ce"]]),
  h2("1.2 \u4e0egstack\u7684\u533a\u522b"),
  makeTable(["\u7ef4\u5ea6", "gstack (Garry Tan)", "\u5185\u9601"],
    [["\u89e3\u51b3\u4ec0\u4e48", "\u4e00\u4e2a\u4eba\u5199\u4ee3\u7801\u50cf\u4e00\u652f\u5de5\u7a0b\u56e2\u961f", "\u4e00\u4e2a\u4eba\u505a\u5546\u4e1a\u51b3\u7b56\u50cf\u6709\u6574\u4e2a\u516c\u53f8"],
     ["\u89d2\u8272", "CEO/Designer/Eng/QA/Security", "CPO/CMO/CFO/CTO/COO/CLO+\u8463\u4e8b\u4f1a"],
     ["\u573a\u666f", "\u5199\u4ee3\u7801\u3001\u5ba1\u4ee3\u7801\u3001\u53d1\u5e03\u3001\u6d4b\u8bd5", "\u5b9a\u65b9\u5411\u3001\u505a\u4ea7\u54c1\u3001\u641e\u589e\u957f\u3001\u7ba1\u8d22\u52a1"],
     ["\u5173\u7cfb", "AI\u5de5\u7a0b\u90e8", "AI\u7ba1\u7406\u5c42\uff0c\u4e92\u8865\u4e0d\u51b2\u7a81"]]),
  h2("1.3 \u9002\u7528\u4eba\u7fa4"),
  p("\u4efb\u4f55OPC/Solo\u521b\u59cb\u4eba\u3002\u4e0d\u9700\u8981\u4f1a\u5199\u4ee3\u7801\u3002\u53ea\u9700\u8981\u6709Claude Code\u8ba2\u9605\uff08$20/\u6708\uff09\u3002"),
  pageBreak()
);

// ── Chapter 2: Quick Start ──
children.push(
  h1("\u7b2c\u4e8c\u7ae0\uff1a\u5feb\u901f\u5f00\u59cb"),
  h2("2.1 \u5206\u7ea7\u5b89\u88c5"),
  makeTable(["Tier", "\u5305\u542b", "\u9002\u5408\u8c01"],
    [["Tier 0", "cabinet + CPO + CMO + CFO", "Day 1\u521b\u4e1a\u8005"],
     ["Tier 1", "+ CTO + COO + CLO", "\u6709\u6536\u5165\u540e"],
     ["Tier 2", "+ \u8463\u4e8b\u4f1a(7\u4eba) + \u5973\u5a32", "\u9700\u8981\u6218\u7565\u51b3\u7b56\u65f6"],
     ["Tier 3", "+ \u884c\u4e1a\u6a21\u5757", "\u9700\u8981\u884c\u4e1a\u6df1\u5ea6\u65f6"]]),
  h2("2.2 \u624b\u52a8\u6307\u6325\u8868"),
  makeTable(["\u4f60\u8bf4", "\u5185\u9601\u6267\u884c"],
    [["\u300c\u5185\u9601\u300d+ \u95ee\u9898", "\u81ea\u52a8\u8def\u7531\u5230\u5408\u9002\u89d2\u8272"],
     ["\u300c\u5185\u9601\u00b7\u8463\u4e8b\u4f1a\u300d", "7\u4eba\u5168\u5458\u5f00\u4f1a"],
     ["\u300c\u5185\u9601\uff0c\u53eb\u8292\u683c\u6765\u300d", "\u5355\u4eba\u6c89\u6d78\u89d2\u8272"],
     ["\u300c\u5185\u9601\uff0cCFO\u6765\u300d", "\u8d22\u52a1\u603b\u76d1\u4e0a\u7ebf"],
     ["\u300c\u5185\u9601\uff0cCFO\u548cCTO\u4e00\u8d77\u770b\u770b\u300d", "\u8de8\u89d2\u8272\u534f\u4f5c"],
     ["\u300c\u5185\u9601\u00b7\u7ade\u54c1\uff0c\u6587\u97ec\u600e\u4e48\u83b7\u5ba2\u300d", "\u884c\u4e1a\u60c5\u62a5\u8c03\u53d6"],
     ["\u300c\u5185\u9601\uff0c\u84b8\u998f\u674e\u7b11\u6765\u300d", "\u5973\u5a32\u751f\u6210\u65b0\u8463\u4e8b"],
     ["\u300c\u5185\u9601\uff0c\u5168\u5458\u300d", "\u6240\u6709\u5c42\u7ea7\u5168\u90e8\u4e0a\u7ebf"]]),
  pageBreak()
);

// ── Chapter 3: Board ──
children.push(
  h1("\u7b2c\u4e09\u7ae0\uff1a\u8463\u4e8b\u4f1a\uff08\u65b9\u5411\u5c42\uff09"),
  quote("7\u4e2a\u4eba\u7684\u8ba4\u77e5\u6846\u67b6\uff0c\u4e00\u4e2a\u4eba\u7684\u6700\u7ec8\u51b3\u7b56\u3002"),
  makeTable(["\u4ee3\u53f7", "\u4eba\u7269", "\u6838\u5fc3\u6b66\u5668", "\u5178\u578b\u573a\u666f"],
    [["PG", "Paul Graham", "\u8fed\u4ee3\u53d1\u73b0/PMF/\u5199\u4f5c\u5373\u601d\u8003", "\u8be5\u4e0d\u8be5\u505a\u3001\u4f55\u65f6pivot"],
     ["YM", "\u5f20\u4e00\u9e23", "\u4fe1\u606f\u6548\u7387/\u7b97\u6cd5\u601d\u7ef4/Context not Control", "\u4ea7\u54c1\u65b9\u5411\u3001\u7ec4\u7ec7\u8bbe\u8ba1"],
     ["CM", "Charlie Munger", "\u9006\u5411\u601d\u8003/\u591a\u5b66\u79d1\u6a21\u578b/\u8ba4\u77e5\u504f\u8bef", "\u98ce\u9669\u68c0\u6d4b\u3001\u6295\u8d44\u51b3\u7b56"],
     ["NR", "Naval Ravikant", "\u6760\u6746/\u7279\u5b9a\u77e5\u8bc6/\u6b32\u671b\u7ba1\u7406", "\u804c\u4e1a\u9009\u62e9\u3001\u5546\u4e1a\u6a21\u5f0f"],
     ["WB", "Warren Buffett", "\u62a4\u57ce\u6cb3/\u5b89\u5168\u8fb9\u9645/\u590d\u5229", "\u8d44\u672c\u914d\u7f6e\u3001\u4f30\u503c\u5224\u65ad"],
     ["EM", "Elon Musk", "\u7b2c\u4e00\u6027\u539f\u7406/\u4e94\u6b65\u7b97\u6cd5/\u6210\u672c\u62c6\u89e3", "\u6210\u672c\u4f18\u5316\u3001\u6280\u672f\u53ef\u884c\u6027"],
     ["SJ", "Steve Jobs", "\u805a\u7126\u8bf4\u4e0d/\u7aef\u5230\u7aef\u63a7\u5236/\u4ea7\u54c1\u5224\u65ad", "\u529f\u80fd\u53d6\u820d\u3001\u4f53\u9a8c\u8bbe\u8ba1"]]),
  h2("3.1 \u6269\u5458\u673a\u5236"),
  p("\u8bf4\u300c\u84b8\u998fXX\u300d\u6216\u300c\u5973\u5a32\uff0c\u9020\u4e2aXX\u89c6\u89d2\u300d\uff0c\u81ea\u52a8\u8c03\u7528nuwa-distiller\u8fdb\u884c6\u7ef4\u5ea6\u8c03\u7814\uff08\u8457\u4f5c/\u8bbf\u8c08/\u8868\u8fbeDNA/\u4ed6\u8005\u89c6\u89d2/\u51b3\u7b56\u8bb0\u5f55/\u65f6\u95f4\u7ebf\uff09\uff0c\u751f\u6210\u53ef\u8fd0\u884c\u7684SKILL.md\uff0c\u81ea\u52a8\u52a0\u5165\u8463\u4e8b\u4f1a\u3002"),
  pageBreak()
);

// ── Chapter 4: C-Suite ──
children.push(
  h1("\u7b2c\u56db\u7ae0\uff1aC-Suite\uff08\u6267\u884c\u5c42\uff09"),
  quote("6\u4f4d\u9996\u5e2d\u5b98\u7ba1\u201c\u600e\u4e48\u505a\u201d\uff0c\u6bcf\u4eba\u914d\u5907\u4e13\u4e1a\u5de5\u5177\u7bb1\u3002"),
  h2("4.1 CPO\uff08\u9996\u5e2d\u4ea7\u54c1\u5b98\uff09"),
  p("\u804c\u8d23\uff1a\u9700\u6c42\u5b9a\u4e49\u3001PRD\u64b0\u5199\u3001\u7528\u6237\u6545\u4e8b\u3001\u8def\u7ebf\u56fe\u3001\u4f18\u5148\u7ea7\u6392\u5e8f\u3001\u4ea7\u54c1\u5ea6\u91cf"),
  p("\u5de5\u5177\u7bb1\uff1a47\u4e2aPM Skills\uff08prd-development\u3001user-story\u3001roadmap-planning\u3001jobs-to-be-done\u3001prioritization-advisor\u7b49\uff09"),
  h2("4.2 CMO\uff08\u9996\u5e2d\u8425\u9500\u5b98\uff09"),
  p("\u804c\u8d23\uff1a\u83b7\u5ba2\u7b56\u7565\u3001\u5185\u5bb9\u8425\u9500\u3001\u8f6c\u5316\u4f18\u5316\u3001\u589e\u957f\u5b9e\u9a8c\u3001\u54c1\u724c\u4f20\u64ad"),
  p("\u5de5\u5177\u7bb1\uff1a35\u4e2a\u8425\u9500Skills\uff08content-strategy\u3001page-cro\u3001cold-email\u3001pricing-strategy\u3001launch-strategy\u7b49\uff09"),
  h2("4.3 CFO\uff08\u9996\u5e2d\u8d22\u52a1\u5b98\uff09"),
  p("\u804c\u8d23\uff1a\u5b9a\u4ef7\u7b56\u7565\u3001\u73b0\u91d1\u6d41\u7ba1\u7406\u3001\u878d\u8d44\u51b3\u7b56\u3001\u5355\u4f4d\u7ecf\u6d4e\u6a21\u578b\uff08CAC/LTV/\u6bdb\u5229\u7387\uff09"),
  p("\u5de5\u5177\uff1afinance-ops\u3001revenue-intelligence\u3001data-analyzer\u3001pricing-strategy\u3001tam-sam-som-calculator"),
  h2("4.4 CTO\uff08\u9996\u5e2d\u6280\u672f\u5b98\uff09"),
  p("\u804c\u8d23\uff1a\u6280\u672f\u6808\u9009\u578b\u3001\u67b6\u6784\u51b3\u7b56\u3001\u6280\u672f\u503a\u4f18\u5148\u7ea7\u3001\u5b89\u5168\u5ba1\u8ba1"),
  bold("\u96f6\u6210\u672c\u6280\u672f\u6808\u914d\u7f6e\uff1a"),
  makeTable(["\u5de5\u5177", "\u7528\u9014", "\u8d39\u7528"],
    [["Claude Code", "\u5199\u4ee3\u7801\u4e3b\u529b", "$20/\u6708"],
     ["Supabase", "\u540e\u7aef\u6570\u636e\u5e93+Auth", "\u514d\u8d39(500MB)"],
     ["Vercel", "\u4e00\u952e\u90e8\u7f72\u6258\u7ba1", "\u514d\u8d39(100GB)"],
     ["Namecheap", "\u57df\u540d", "\u00a512/\u5e74"],
     ["Stripe", "\u652f\u4ed8\u63a5\u53e3", "2.9%\u624b\u7eed\u8d39"],
     ["GitHub", "\u4ee3\u7801\u7248\u672c\u63a7\u5236", "\u514d\u8d39"],
     ["Resend", "\u90ae\u4ef6\u5206\u53d1", "\u514d\u8d39(100\u5c01/\u5929)"],
     ["Clerk", "\u7528\u6237\u767b\u5f55\u6388\u6743", "\u514d\u8d39(10K MAU)"],
     ["Cloudflare", "DNS+CDN", "\u514d\u8d39"],
     ["PostHog", "\u7528\u6237\u6570\u636e\u5206\u6790", "\u514d\u8d39(100\u4e07\u4e8b\u4ef6)"],
     ["Sentry", "\u9519\u8bef\u8ffd\u8e2a", "\u514d\u8d39(5K\u9519\u8bef)"],
     ["Upstash", "Redis\u7f13\u5b58", "\u514d\u8d39(10K\u547d\u4ee4/\u5929)"],
     ["Pinecone", "\u5411\u91cf\u6570\u636e\u5e93", "\u514d\u8d39(100K\u5411\u91cf)"]]),
  p("\u6708\u5ea6\u56fa\u5b9a\u6210\u672c\uff1a~\u00a5146/\u6708\uff08Claude $20 + \u57df\u540d\u00a51\uff09\u3002\u5176\u4f59\u5168\u90e8\u514d\u8d39\u989d\u5ea6\u5185\u8986\u76d6\u65e9\u671f\u7528\u6237\u91cf\u3002"),
  h2("4.5 COO\uff08\u9996\u5e2d\u8fd0\u8425\u5b98\uff09"),
  p("\u804c\u8d23\uff1a\u8fd0\u8425\u6d41\u7a0b\u8bbe\u8ba1\u3001SOP\u6c89\u6dc0\u3001\u81ea\u52a8\u5316\u5ba1\u8ba1\u3001\u62db\u4eba\u51b3\u7b56\u3001\u5916\u5305vs\u81ea\u5efavs\u81ea\u52a8\u5316"),
  p("\u5de5\u5177\uff1aone-person-biz\u3001meeting-assistant\u3001GSD\u7cfb\u5217"),
  h2("4.6 CLO\uff08\u9996\u5e2d\u6cd5\u52a1\u5b98\uff09"),
  p("\u804c\u8d23\uff1a\u7528\u6237\u534f\u8bae\u3001\u6570\u636e\u5408\u89c4\u3001\u77e5\u8bc6\u4ea7\u6743\u3001\u5408\u540c\u5ba1\u67e5\u3001\u5e73\u53f0\u89c4\u5219\u98ce\u9669"),
  p("\u5de5\u5177\uff1alegal-advisor\u3001security-review"),
  pageBreak()
);

// ── Chapter 5: Friction ──
children.push(
  h1("\u7b2c\u4e94\u7ae0\uff1a\u6469\u64e6\u673a\u5236"),
  quote("\u9632\u6b62\u5185\u9601\u53d8\u6210\u4e00\u4e2a\u7a7f\u4e866\u5957\u8863\u670d\u7684\u4eba\u3002"),
  h2("5.1 \u89d2\u8272\u5236\u8861\u77e9\u9635"),
  makeTable(["\u89d2\u8272", "\u5236\u8861\u8c01", "\u5236\u8861\u65b9\u5f0f", "\u5426\u51b3\u6743\u573a\u666f"],
    [["CFO", "CMO", "CMO\u63d0\u82b1\u94b1\u65b9\u6848\u65f6\uff0cCFO\u5fc5\u987b\u5148\u7b97ROI\u548crunway\u5f71\u54cd", "burn rate\u8d85\u5b89\u5168\u7ebf\u53ef\u5426\u51b3\u6295\u653e"],
     ["CTO", "CPO", "CPO\u63d0\u9700\u6c42\u65f6\uff0cCTO\u5fc5\u987b\u8bc4\u4f30\u6280\u672f\u590d\u6742\u5ea6\u548c\u7ef4\u62a4\u6210\u672c", "\u6280\u672f\u503a\u8d85\u6807\u65f6\u53ef\u8981\u6c42\u5148\u8fd8\u503a"],
     ["CLO", "\u6240\u6709\u4eba", "\u4efb\u4f55\u6d89\u53ca\u6570\u636e/\u5408\u89c4/\u5408\u540c\u7684\u65b9\u6848\u5fc5\u987b\u8fc7\u5ba1", "\u5408\u89c4\u98ce\u9669\u65f6\u4e00\u7968\u5426\u51b3"],
     ["COO", "CPO+CMO", "\u65b0\u65b9\u6848\u5fc5\u987b\u7ecfCOO\u8bc4\u4f30\u6267\u884c\u53ef\u884c\u6027", "\u56e2\u961f\u4ea7\u80fd\u4e0d\u591f\u65f6\u53ef\u8981\u6c42\u780dscope"]]),
  h2("5.2 \u5f3a\u5236\u5bf9\u7ebf\u534f\u8bae"),
  p("\u82b1\u94b1\u51b3\u7b56 \u2192 \u81ea\u52a8\u89e6\u53d1CFO-CMO\u5bf9\u7ebf\uff1aCMO\u7ed9\u65b9\u6848\u548c\u9884\u671f\uff0cCFO\u7ed9\u6210\u672c\u5206\u6790\u548c\u6700\u574f\u60c5\u51b5\uff0c\u5206\u6b67\u70b9\u660e\u786e\u5217\u51fa\u3002"),
  p("\u65b0\u529f\u80fd\u51b3\u7b56 \u2192 \u81ea\u52a8\u89e6\u53d1CPO-CTO-COO\u4e09\u65b9\uff1aCPO\u8bf4\u9700\u6c42\uff0cCTO\u8bf4\u4ee3\u4ef7\uff0cCOO\u8bf4\u80fd\u4e0d\u80fd\u6297\u3002"),
  p("\u6218\u7565\u65b9\u5411 \u2192 \u81ea\u52a8\u89e6\u53d1\u8463\u4e8b\u4f1a\uff1a\u81f3\u5c112\u4f4d\u5fc5\u987b\u7ed9\u53cd\u5bf9\u610f\u89c1\u3002\u5168\u7968\u8d5e\u6210=\u6ca1\u8ba4\u771f\u60f3\u3002"),
  h2("5.3 \u53cd\u548c\u7a00\u6ce5\u68c0\u67e5"),
  p("\u2610 \u6709\u6ca1\u6709\u89d2\u8272\u4e4b\u95f4\u7684\u771f\u5b9e\u5206\u6b67\u88ab\u5448\u73b0\uff1f"),
  p("\u2610 \u6709\u6ca1\u6709\u89d2\u8272\u8bf4\u4e86\u201c\u4e0d\u884c\u201d\u6216\u201c\u592a\u8d35\u201d\u6216\u201c\u505a\u4e0d\u5230\u201d\uff1f"),
  p("\u2610 \u5982\u679c\u6240\u6709\u89d2\u8272\u90fd\u5728\u8bf4\u201c\u597d\u201d\u2014\u2014\u7ea2\u65d7\uff0c\u91cd\u65b0\u5ba1\u89c6\u3002"),
  pageBreak()
);

// ── Chapter 6: Lifecycle ──
children.push(
  h1("\u7b2c\u516d\u7ae0\uff1a\u751f\u547d\u5468\u671f\u5f15\u64ce"),
  quote("\u540c\u4e00\u4e2a\u95ee\u9898\uff0c\u79cd\u5b50\u671f\u548cB\u8f6e\u7684\u6b63\u786e\u7b54\u6848\u5b8c\u5168\u4e0d\u540c\u3002"),
  makeTable(["\u9636\u6bb5", "\u540d\u79f0", "\u5173\u952e\u6307\u6807", "\u751f\u6b7b\u7ebf"],
    [["S0", "\u7075\u611f\u671f", "\u6ca1\u6709\u4ea7\u54c1\uff0c\u53ea\u6709\u60f3\u6cd5", "\u60f3\u6cd5\u5bf9\u5e94\u771f\u5b9e\u75db\u70b9\u5417"],
     ["S1", "\u9a8c\u8bc1\u671f", "MVP+<100\u7528\u6237", "\u6709\u6ca1\u6709\u4eba\u613f\u610f\u4ed8\u94b1"],
     ["S2", "PMF\u671f", "100-1000\u7528\u6237\uff0c\u7559\u5b58>40%", "\u7559\u5b58\uff0c\u4e0d\u662f\u83b7\u5ba2"],
     ["S3", "\u89c4\u6a21\u5316\u671f", "1K-10K\u7528\u6237\uff0c\u6708\u589e>15%", "\u589e\u957f\u80fd\u4e0d\u80fd\u4fdd\u6301"],
     ["S4", "\u878d\u8d44\u671f", "\u51c6\u5907/\u6b63\u5728\u878d\u8d44", "\u5728\u94b1\u82b1\u5b8c\u4e4b\u524d\u62ff\u5230\u94b1"],
     ["S5", "Pre-IPO", "\u6536\u5165\u8fc7\u4ebf\uff0c\u51c6\u5907\u4e0a\u5e02", "\u5408\u89c4+\u6cbb\u7406+\u53ef\u6301\u7eed\u589e\u957f"],
     ["S6", "\u4e0a\u5e02\u540e", "\u5df2\u4e0a\u5e02\uff0c\u7a33\u5b9a\u589e\u957f", "\u5b63\u5ea6\u538b\u529bvs\u957f\u671f\u6295\u8d44\u5e73\u8861"],
     ["S7", "\u8870\u9000/\u8f6c\u578b", "\u589e\u957f\u505c\u6ede/\u4e0b\u964d", "\u8ba4\u6e05\u73b0\u5b9e\u7684\u901f\u5ea6"]]),
  h2("6.1 \u9636\u6bb5\u8bca\u65ad\u534f\u8bae\uff088\u4e2a\u95ee\u9898\u5feb\u901f\u5b9a\u4f4d\uff09"),
  p("1. \u6709\u6ca1\u6709\u4ea7\u54c1\uff1f\uff08\u65e0\u2192S0\uff09"),
  p("2. \u6709\u6ca1\u6709\u4ed8\u8d39\u7528\u6237\uff1f\uff08\u65e0\u2192S1\uff09"),
  p("3. \u7528\u6237\u7559\u5b58\u7387>40%\uff1f\uff08\u65e0\u2192S2\u524d\u534a\uff0c\u6709\u2192S2\u540e\u534a\uff09"),
  p("4. \u6708\u589e\u957f>15%\u4e14\u7528\u6237>1000\uff1f\uff08\u6709\u2192S3\uff09"),
  p("5. \u6b63\u5728\u878d\u8d44\uff1f\uff08\u6709\u2192S4\uff09"),
  p("6. \u6536\u5165\u8fc7\u4ebf\u51c6\u5907\u4e0a\u5e02\uff1f\uff08\u6709\u2192S5\uff09"),
  p("7. \u5df2\u4e0a\u5e02\uff1f\uff08\u6709\u2192S6\uff09"),
  p("8. \u589e\u957f\u505c\u6ede/\u4e0b\u964d\uff1f\uff08\u6709\u2192S7\uff09"),
  pageBreak()
);

// ── Chapter 7: Industry Modules ──
children.push(
  h1("\u7b2c\u4e03\u7ae0\uff1a\u884c\u4e1a\u6a21\u5757\uff08\u53ef\u63d2\u62d4\uff09"),
  h2("7.1 \u5f53\u524d\u5df2\u5b89\u88c5\uff1a\u6559\u80b2\u884c\u4e1a"),
  makeTable(["\u7ade\u54c1", "\u6570\u636e\u57fa\u7840", "\u89e6\u53d1\u8bcd"],
    [["\u6587\u97ec/\u667a\u80fd\u5c11\u5e74", "422\u6761\u89c6\u9891\u53f7\u9006\u5411\u5de5\u7a0b+9\u4efd\u6587\u6863", "\u300c\u6587\u97ec\u300d\u300c\u667a\u80fd\u5c11\u5e74\u300d"],
     ["Alpha School", "795\u6761IG+367\u4e2aYouTube+18\u7bc7\u62a5\u9053", "\u300cAlpha School\u300d\u300cMacKenzie\u300d"],
     ["Khan/Khanmigo", "\u5b98\u7f518\u4e07\u5b57+TED+60 Minutes", "\u300c\u53ef\u6c57\u5b66\u9662\u300d\u300cKhanmigo\u300d"],
     ["Synthesis", "$12M\u878d\u8d44+\u521b\u59cb\u4eba3\u64ad\u5ba2(136min)", "\u300cSynthesis\u300d\u300cAd Astra\u300d"]]),
  h2("7.2 \u521b\u5efa\u65b0\u884c\u4e1a\u6a21\u5757"),
  p("1. \u521b\u5efa industry/{name}/ \u76ee\u5f55"),
  p("2. \u5199 industry.json \u6ce8\u518c\u6e05\u5355\uff08id/pm_role/competitors/routing_rules\uff09"),
  p("3. \u4e3a\u6bcf\u4e2a\u7ade\u54c1\u5199 SKILL.md \u60c5\u62a5\u6863\u6848"),
  p("4. \u5199 think-tank \u603b\u63a7\u7f16\u6392\u5668"),
  p("\u5220\u6389\u884c\u4e1a\u6a21\u5757\uff0c\u5185\u9601\u4ecd\u6b63\u5e38\u8fd0\u884c\u3002\u6838\u5fc3\u4e0e\u884c\u4e1a\u5b8c\u5168\u89e3\u8026\u3002"),
  pageBreak()
);

// ── Chapter 8: Engines ──
children.push(
  h1("\u7b2c\u516b\u7ae0\uff1a\u8fdb\u5316\u5f15\u64ce"),
  h2("8.1 \u5973\u5a32\u84b8\u998f\u5668"),
  p("\u8f93\u5165\u4efb\u4f55\u4eba\u540d\uff0c\u81ea\u52a8\u6267\u884c\uff1a6\u4e2a\u5e76\u884cAgent\u8c03\u7814\uff08\u8457\u4f5c/\u8bbf\u8c08/\u8868\u8fbeDNA/\u4ed6\u8005\u89c6\u89d2/\u51b3\u7b56\u8bb0\u5f55/\u65f6\u95f4\u7ebf\uff09\u2192 \u4e09\u91cd\u9a8c\u8bc1\uff08\u8de82+\u9886\u57df/\u9884\u6d4b\u65b0\u95ee\u9898\u7acb\u573a/\u72ec\u7279\u6027\uff09\u2192 \u751f\u6210SKILL.md\uff08\u5fc3\u667a\u6a21\u578b+\u542f\u53d1\u5f0f+\u8868\u8fbeDNA+\u8bda\u5b9e\u8fb9\u754c\uff09"),
  h2("8.2 \u5927\u5e08\u65b9\u6cd5\u8bba\u5e93"),
  makeTable(["\u9886\u57df", "\u5927\u5e08", "\u6838\u5fc3\u65b9\u6cd5"],
    [["\u8c08\u5224", "Chris Voss", "\u6218\u672f\u540c\u7406\u5fc3"],
     ["\u62db\u8058", "Laszlo Bock / Geoff Smart", "\u7ed3\u6784\u5316\u9762\u8bd5"],
     ["\u5199\u4f5c", "Barbara Minto", "\u91d1\u5b57\u5854\u539f\u7406"],
     ["\u7528\u6237\u7814\u7a76", "Rob Fitzpatrick", "The Mom Test"],
     ["\u7cbe\u76ca\u521b\u4e1a", "Eric Ries", "\u6700\u5c0f\u53ef\u884c\u4ea7\u54c1"],
     ["\u51b3\u7b56", "Jeff Bezos / Annie Duke", "\u4e0d\u53ef\u9006vs\u53ef\u9006\u51b3\u7b56"],
     ["\u9886\u5bfc\u529b", "Ray Dalio / Andy Grove", "\u539f\u5219+\u53ea\u6709\u5076\u6267\u72c2\u624d\u80fd\u751f\u5b58"]]),
  h2("8.3 \u81ea\u6211\u8fdb\u5316Agent"),
  p("\u8bb0\u5f55\u5b66\u4e60\u3001\u81ea\u52a8\u6539\u8fdb\u3002\u6bcf\u6b21\u7528\u6237\u7ea0\u6b63\u6216\u65b0\u8ba4\u77e5\u4ea7\u751f\u65f6\uff0c\u81ea\u52a8\u6c89\u6dc0\u5230memory\u3002"),
  pageBreak()
);

// ── Chapter 9: Tech Stack SOP ──
children.push(
  h1("\u7b2c\u4e5d\u7ae0\uff1a\u96f6\u6210\u672c\u6280\u672f\u6808SOP"),
  quote("\u9664\u4e86\u57df\u540d\u00a512/\u5e74 + Claude $20/\u6708\uff0c\u5176\u4f59\u5168\u514d\u8d39\u3002\u522b\u518d\u8bf4\u6ca1\u8d44\u91d1\u3002"),
  h2("9.1 \u4ece\u96f6\u5230\u4e0a\u7ebf7\u6b65"),
  makeTable(["Step", "\u64cd\u4f5c", "\u65f6\u95f4"],
    [["1", "\u9879\u76ee\u521d\u59cb\u5316\uff08Next.js + Git + GitHub\uff09", "30\u5206\u949f"],
     ["2", "\u57fa\u7840\u8bbe\u65bd\uff08Vercel + Namecheap + Cloudflare\uff09", "1\u5c0f\u65f6"],
     ["3", "\u6570\u636e\u5e93+\u8ba4\u8bc1\uff08Supabase + Clerk\uff09", "2\u5c0f\u65f6"],
     ["4", "\u652f\u4ed8\u96c6\u6210\uff08Stripe\uff09", "2\u5c0f\u65f6"],
     ["5", "\u76d1\u63a7\u4e09\u4ef6\u5957\uff08PostHog + Sentry + Upstash\uff09", "30\u5206\u949f"],
     ["6", "\u90ae\u4ef6\u7cfb\u7edf\uff08Resend\uff09", "1\u5c0f\u65f6"],
     ["7", "\u90e8\u7f72\u4e0a\u7ebf\uff08git push \u2192 Vercel\u81ea\u52a8\u90e8\u7f72\uff09", "15\u5206\u949f"]]),
  h2("9.2 \u514d\u8d39\u989d\u5ea6\u5929\u82b1\u677f"),
  makeTable(["\u670d\u52a1", "\u514d\u8d39\u4e0a\u9650", "\u89e6\u53d1\u4ed8\u8d39\u4fe1\u53f7", "\u9884\u4f30\u6708\u8d39"],
    [["Supabase", "500MB/50K MAU", "\u6570\u636e>400MB", "$25"],
     ["Vercel", "100GB\u5e26\u5bbd", "\u5e26\u5bbd>80GB", "$20"],
     ["Clerk", "10K MAU", "MAU>8K", "$25"],
     ["PostHog", "100\u4e07\u4e8b\u4ef6/\u6708", "\u4e8b\u4ef6>80\u4e07", "$40"],
     ["Sentry", "5K\u9519\u8bef/\u6708", "\u9519\u8bef>4K(\u8bf4\u660e\u6709\u5927bug)", "$26"],
     ["Resend", "100\u5c01/\u5929", "\u65e5\u5747>80\u5c01", "$20"]]),
  p("CFO\u94c1\u5f8b\uff1a\u6708\u6d3b<5000\u3001\u6708\u6536\u5165<\u00a55000\u4e4b\u524d\uff0c\u6240\u6709\u5de5\u5177\u5fc5\u987b\u4fdd\u6301\u514d\u8d39\u989d\u5ea6\u5185\u3002\u8d85\u4e86\u5148\u4f18\u5316\uff0c\u4e0d\u662f\u5148\u5347\u7ea7\u3002"),
  pageBreak()
);

// ── Chapter 10: Open Source ──
children.push(
  h1("\u7b2c\u5341\u7ae0\uff1a\u5f00\u6e90\u67b6\u6784"),
  h2("10.1 \u63a8\u8350\u6587\u4ef6\u5939\u7ed3\u6784"),
  p("opc-cabinet/"),
  p("  core/             # \u6c38\u8fdc\u5b89\u88c5"),
  p("    cabinet/SKILL.md"),
  p("    roles/ (cpo/ cmo/ cfo/ cto/ coo/ clo/)"),
  p("    sub-skills/ (pm/ marketing/ finance/)"),
  p("    engines/ (nuwa-distiller/ skill-from-masters/ lifecycle/)"),
  p("  advisory/          # Tier 2"),
  p("    brain-trust/SKILL.md"),
  p("    personas/ (paul-graham/ munger/ naval/ ...)"),
  p("  industry/          # Tier 3"),
  p("    education/ (edu-pm/ think-tank/ competitors/)"),
  p("    _template/ (\u590d\u5236\u6b64\u76ee\u5f55\u521b\u5efa\u65b0\u884c\u4e1a)"),
  p("  docs/"),
  h2("10.2 \u5b89\u88c5\u547d\u4ee4"),
  p("# \u5b8c\u6574\u5b89\u88c5"),
  p("git clone https://github.com/yourorg/opc-cabinet.git"),
  p("cd opc-cabinet && ./install.sh --target ~/.claude/skills"),
  p(""),
  p("# \u6700\u5c0f\u5b89\u88c5\uff08\u4ec5\u6838\u5fc3\uff09"),
  p("./install.sh --target ~/.claude/skills --tier core"),
  p(""),
  p("# \u540e\u7eed\u6dfb\u52a0\u884c\u4e1a\u6a21\u5757"),
  p("./install.sh --add-industry education"),
  pageBreak()
);

// ── Appendix A: Trigger Words ──
children.push(
  h1("\u9644\u5f55A\uff1a\u5168\u90e8\u89e6\u53d1\u8bcd\u901f\u67e5"),
  makeTable(["\u89e6\u53d1\u8bcd", "\u6fc0\u6d3b\u4ec0\u4e48"],
    [["\u300c\u5185\u9601\u300d", "\u603b\u67a2\u7ebd\uff0c\u81ea\u52a8\u8def\u7531"],
     ["\u300c\u5185\u9601\u00b7\u8463\u4e8b\u4f1a\u300d", "7\u4eba\u667a\u56ca\u5168\u5458"],
     ["\u300c\u5185\u9601\u00b7\u7ecf\u7406\u4eba\u300d", "C-Suite\u6267\u884c\u5c42"],
     ["\u300c\u5185\u9601\u00b7\u7ade\u54c1\u300d", "\u884c\u4e1a\u60c5\u62a5"],
     ["\u300c\u8292\u683c\u89c6\u89d2\u300d/\u300cPG\u6a21\u5f0f\u300d/\u300cNaval\u600e\u4e48\u770b\u300d", "\u5355\u4eba\u6c89\u6d78\u89d2\u8272"],
     ["\u300cCPO\u300d/\u300cCMO\u300d/\u300cCFO\u300d/\u300cCTO\u300d/\u300cCOO\u300d/\u300cCLO\u300d", "\u5bf9\u5e94\u9996\u5e2d\u5b98"],
     ["\u300c\u6559\u80b2\u667a\u5e93\u300d/\u300c\u6587\u97ec\u300d/\u300cAlpha School\u300d", "\u884c\u4e1a\u6a21\u5757\u7ade\u54c1"],
     ["\u300c\u84b8\u998fXX\u300d/\u300c\u5973\u5a32\u300d", "\u84b8\u998f\u65b0\u4eba\u7269Skill"],
     ["\u300c\u6211\u5728\u54ea\u4e2a\u9636\u6bb5\u300d/\u300clifecycle\u300d", "\u751f\u547d\u5468\u671f\u8bca\u65ad"],
     ["\u300c\u5185\u9601\uff0c\u5168\u5458\u300d", "\u6240\u6709\u5c42\u7ea7\u5168\u90e8\u4e0a\u7ebf"]]),
  pageBreak()
);

// ── Appendix B: Auto-routing ──
children.push(
  h1("\u9644\u5f55B\uff1a\u81ea\u52a8\u8def\u7531\u8868"),
  makeTable(["\u5173\u952e\u8bcd", "\u8def\u7531\u5230"],
    [["\u8be5\u4e0d\u8be5\u505a/\u65b9\u5411/\u53d6\u820d/pivot", "\u8463\u4e8b\u4f1a"],
     ["PRD/\u7528\u6237\u6545\u4e8b/\u8def\u7ebf\u56fe/\u529f\u80fd", "CPO"],
     ["\u83b7\u5ba2/\u5185\u5bb9/\u8f6c\u5316/SEO/\u6295\u653e", "CMO"],
     ["\u94b1/\u5b9a\u4ef7/\u878d\u8d44/burn/runway", "CFO"],
     ["\u6280\u672f/\u67b6\u6784/\u90e8\u7f72/\u5b89\u5168/bug", "CTO"],
     ["\u6d41\u7a0b/SOP/\u62db\u4eba/\u5916\u5305/\u6548\u7387", "COO"],
     ["\u5408\u89c4/\u9690\u79c1/\u5408\u540c/\u7248\u6743", "CLO"],
     ["\u7ade\u54c1/\u884c\u4e1a\u5bf9\u6807", "\u884c\u4e1a\u6a21\u5757"],
     ["\u84b8\u998f/\u9020\u4eba", "\u5973\u5a32\u84b8\u998f\u5668"]]),
  pageBreak()
);

// ── Appendix C: Friction Matrix ──
children.push(
  h1("\u9644\u5f55C\uff1a\u89d2\u8272\u5236\u8861\u77e9\u9635"),
  makeTable(["\u51b3\u7b56\u7c7b\u578b", "\u5fc5\u987b\u53c2\u4e0e", "\u5236\u8861\u903b\u8f91"],
    [["\u82b1\u94b1\u51b3\u7b56", "CMO\u63d0\u6848 + CFO\u5ba1\u8ba1", "CFO\u7b97ROI\u5e95\u7ebf\u548crunway\u5f71\u54cd"],
     ["\u65b0\u529f\u80fd", "CPO\u9700\u6c42 + CTO\u4ee3\u4ef7 + COO\u53ef\u884c\u6027", "\u4e09\u65b9\u4e0d\u4e00\u81f4\u5fc5\u987b\u6446\u4e0a\u684c"],
     ["\u6218\u7565\u65b9\u5411", "\u8463\u4e8b\u4f1a\u81f3\u5c113\u4eba", "\u81f3\u5c112\u4f4d\u7ed9\u53cd\u5bf9\u610f\u89c1"],
     ["\u6d89\u53ca\u7528\u6237\u6570\u636e", "CLO\u5fc5\u8fc7\u5ba1", "\u5408\u89c4\u98ce\u9669\u4e00\u7968\u5426\u51b3"],
     ["\u62db\u4eba/\u6269\u56e2\u961f", "COO\u4e3b\u5bfc + CFO\u7b97\u8d26", "\u5148\u95ee\u80fd\u4e0d\u80fd\u81ea\u52a8\u5316\uff0c\u518d\u95ee\u80fd\u4e0d\u80fd\u5916\u5305"],
     ["\u6559\u80b2\u4ea7\u54c1", "Edu PM\u5fc5\u5230", "\u5148\u67e5\u56db\u5bb6\u7ade\u54c1\u518d\u7ed9\u5efa\u8bae"]]),
  new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "--- END ---", size: 20, color: "AAAAAA", font: "Microsoft YaHei" })] })
);

// ── Build Document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Microsoft YaHei", color: "2B5797" }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2B5797" }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Microsoft YaHei" }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2B5797", space: 4 } }, children: [new TextRun({ text: "OPC\u5185\u9601\u7cfb\u7edf v2.0", size: 18, color: "888888", font: "Microsoft YaHei" })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u7b2c ", size: 18, color: "888888" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }), new TextRun({ text: " \u9875", size: 18, color: "888888" })] })] })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("C:/Users/86136/Desktop/OPC_\u5185\u9601\u7cfb\u7edf_\u5b8c\u6574\u624b\u518c.docx", buf);
  console.log("DONE: OPC_\u5185\u9601\u7cfb\u7edf_\u5b8c\u6574\u624b\u518c.docx created on Desktop");
});
