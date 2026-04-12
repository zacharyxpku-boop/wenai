import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Export HTML to PNG/JPG
 * Strategy:
 * 1. Try full-page screenshot first
 * 2. If page is too tall (>16000px), render segments individually and stitch with sharp
 */
export async function exportPNG(htmlPath, outputDir) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 750, height: 800 });

  const fileUrl = 'file:///' + htmlPath.split('\\').join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

  const pngPath = join(outputDir, 'final.png').split('\\').join('/');
  const jpgPath = join(outputDir, 'final.jpg').split('\\').join('/');

  if (bodyHeight <= 16000) {
    // Direct full-page screenshot
    await page.setViewport({ width: 750, height: bodyHeight });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: pngPath, fullPage: true, type: 'png' });
    await page.screenshot({ path: jpgPath, fullPage: true, type: 'jpeg', quality: 92 });
  } else {
    // Segment-based rendering: screenshot in chunks and stitch
    const chunkHeight = 8000;
    const chunks = [];

    for (let y = 0; y < bodyHeight; y += chunkHeight) {
      const h = Math.min(chunkHeight, bodyHeight - y);
      await page.setViewport({ width: 750, height: h });
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await new Promise(r => setTimeout(r, 500));

      const chunkPath = join(outputDir, `chunk_${chunks.length}.png`).split('\\').join('/');
      await page.screenshot({ path: chunkPath, type: 'png' });
      chunks.push({ path: chunkPath, y, height: h });
    }

    // Stitch chunks with sharp
    const composites = chunks.map(c => ({
      input: c.path,
      top: c.y,
      left: 0
    }));

    await sharp({
      create: { width: 750, height: bodyHeight, channels: 4, background: { r: 10, g: 10, b: 18, alpha: 1 } }
    })
      .composite(composites)
      .png()
      .toFile(pngPath);

    await sharp(pngPath).jpeg({ quality: 92 }).toFile(jpgPath);
  }

  await browser.close();

  return { width: 750, height: bodyHeight, pngPath, jpgPath };
}
