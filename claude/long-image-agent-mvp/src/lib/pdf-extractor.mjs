import fs from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const DATA_POINT_REGEX =
  /((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:%|万|亿|元|人|家|倍|个|项|年|m|bn|M|B)?)/g;
const IMAGE_CLUE_REGEX = /(图|表|Figure|Chart|示意|海报|照片|产品图|案例图)/i;
const CHART_CONCLUSION_REGEX =
  /(增长|下降|提升|改善|领先|占比|同比|环比|趋势|increase|decrease|growth|share|trend|lead|improve)/i;
const HEADING_REGEX =
  /^([一二三四五六七八九十\d]+[、.．])|^第[\d一二三四五六七八九十]+(章|节|部分)|^[A-Z][A-Za-z0-9\s/&-]{2,40}$/;

function cleanText(input) {
  return String(input || "").replace(/\s+/g, " ").trim();
}

function dedupeEntries(entries, valueKey = "text") {
  const seen = new Set();
  return entries.filter((entry) => {
    const text = cleanText(entry[valueKey]);
    if (!text || seen.has(text)) return false;
    seen.add(text);
    return true;
  });
}

function groupTextLines(textItems) {
  const buckets = new Map();

  for (const item of textItems) {
    const text = cleanText(item.str);
    if (!text) continue;
    const y = Math.round(item.transform?.[5] ?? item.height ?? 0);
    const x = item.transform?.[4] ?? 0;
    const fontSize = Math.abs(item.transform?.[0] ?? item.height ?? 12);

    if (!buckets.has(y)) buckets.set(y, []);
    buckets.get(y).push({ text, x, fontSize });
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([y, items]) => {
      const ordered = items.sort((a, b) => a.x - b.x);
      const lineText = ordered
        .map((item, index) => {
          const previous = ordered[index - 1];
          if (!previous) return item.text;
          const gap = item.x - previous.x;
          return `${gap > 22 ? " " : ""}${item.text}`;
        })
        .join("");
      const averageFontSize =
        ordered.reduce((sum, item) => sum + item.fontSize, 0) / ordered.length;

      return {
        y,
        text: cleanText(lineText),
        fontSize: Number(averageFontSize.toFixed(2))
      };
    })
    .filter((line) => line.text);
}

function isHeading(line) {
  if (!line?.text) return false;
  if (HEADING_REGEX.test(line.text)) return true;
  if (line.text.length <= 28 && !/[。！？.!?]$/.test(line.text)) return true;
  return false;
}

function pickTop(entries, count) {
  return entries.slice(0, count);
}

function extractDataPoints(lines, pageNumber) {
  const results = [];
  for (const line of lines) {
    const matches = [...line.text.matchAll(DATA_POINT_REGEX)];
    if (!matches.length) continue;
    const values = matches.map((match) => match[0]);
    results.push({
      text: line.text,
      values,
      page: pageNumber
    });
  }
  return dedupeEntries(results);
}

export async function extractPdfFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: true
  });
  const pdf = await loadingTask.promise;

  const titles = [];
  const headings = [];
  const keyParagraphs = [];
  const dataPoints = [];
  const chartConclusions = [];
  const shortSellingPoints = [];
  const imageClues = [];
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = groupTextLines(textContent.items);
    const averageFontSize =
      lines.reduce((sum, line) => sum + line.fontSize, 0) / Math.max(lines.length, 1);
    const titleCandidates = lines.filter(
      (line, index) => index < 6 && line.fontSize >= averageFontSize * 1.12 && line.text.length <= 52
    );
    const headingCandidates = lines.filter((line) => isHeading(line) && line.text.length <= 60);
    const paragraphCandidates = lines.filter(
      (line) => line.text.length >= 28 && line.text.length <= 180
    );
    const pageDataPoints = extractDataPoints(lines, pageNumber);
    const pageChartConclusions = lines
      .filter((line) => CHART_CONCLUSION_REGEX.test(line.text))
      .map((line) => ({ text: line.text, page: pageNumber }));
    const pageImageClues = lines
      .filter((line) => IMAGE_CLUE_REGEX.test(line.text))
      .map((line) => ({ text: line.text, page: pageNumber }));
    const pageShortSellingPoints = lines
      .filter(
        (line) =>
          line.text.length >= 10 &&
          line.text.length <= 34 &&
          !/[。！？.!?]$/.test(line.text)
      )
      .map((line) => ({ text: line.text, page: pageNumber }));

    titles.push(...titleCandidates.map((line) => ({ text: line.text, page: pageNumber })));
    headings.push(...headingCandidates.map((line) => ({ text: line.text, page: pageNumber })));
    keyParagraphs.push(
      ...pickTop(
        paragraphCandidates.map((line) => ({ text: line.text, page: pageNumber })),
        6
      )
    );
    dataPoints.push(...pageDataPoints);
    chartConclusions.push(...pageChartConclusions);
    shortSellingPoints.push(...pageShortSellingPoints);
    imageClues.push(...pageImageClues);

    pages.push({
      page: pageNumber,
      titles: titleCandidates.map((line) => line.text),
      headings: pickTop(headingCandidates, 4).map((line) => line.text),
      key_paragraphs: pickTop(paragraphCandidates, 4).map((line) => line.text),
      data_points: pageDataPoints,
      chart_conclusions: pageChartConclusions,
      image_clues: pageImageClues
    });
  }

  return {
    file_name: path.basename(filePath),
    file_path: filePath,
    page_count: pdf.numPages,
    titles: pickTop(dedupeEntries(titles), 10),
    headings: pickTop(dedupeEntries(headings), 16),
    key_paragraphs: pickTop(dedupeEntries(keyParagraphs), 18),
    data_points: pickTop(dedupeEntries(dataPoints), 16),
    chart_conclusions: pickTop(dedupeEntries(chartConclusions), 12),
    short_selling_points: pickTop(dedupeEntries(shortSellingPoints), 12),
    image_clues: pickTop(dedupeEntries(imageClues), 12),
    pages
  };
}
