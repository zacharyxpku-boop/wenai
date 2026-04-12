import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function exportPNG() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport to 750px width
  await page.setViewport({ width: 750, height: 800 });
  
  // Load the HTML file
  const htmlPath = resolve(__dirname, 'output/html/final.html');
  const fileUrl = 'file:///' + htmlPath.split('\\').join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  // Wait for rendering
  await new Promise(r => setTimeout(r, 2000));
  
  // Get full page height
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log('Page height:', bodyHeight);
  
  // Resize viewport to full height
  await page.setViewport({ width: 750, height: bodyHeight });
  await new Promise(r => setTimeout(r, 1000));
  
  // Take full page screenshot
  await page.screenshot({
    path: resolve(__dirname, 'output/final/final.png'),
    fullPage: true,
    type: 'png'
  });
  console.log('PNG exported to output/final/final.png');
  
  // Also export JPG
  await page.screenshot({
    path: resolve(__dirname, 'output/final/final.jpg'),
    fullPage: true,
    type: 'jpeg',
    quality: 92
  });
  console.log('JPG exported to output/final/final.jpg');
  
  // Export module 01 preview
  const module01Path = resolve(__dirname, 'output/module_previews/module_01.html');
  const m01Url = 'file:///' + module01Path.split('\\').join('/');
  await page.goto(m01Url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const m01Height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 750, height: m01Height });
  await page.screenshot({
    path: resolve(__dirname, 'output/module_previews/module_01_new.png'),
    fullPage: true,
    type: 'png'
  });
  console.log('Module 01 PNG exported');
  
  await browser.close();
  console.log('Done!');
}

exportPNG().catch(e => { console.error(e); process.exit(1); });
