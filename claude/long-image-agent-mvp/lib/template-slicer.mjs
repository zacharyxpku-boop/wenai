/**
 * Template Slicer - Analyzes template image structure using sharp
 *
 * Strategy:
 * 1. Read template image, get dimensions
 * 2. Scan horizontal lines to find "section breaks" (rows with uniform color / low variance)
 * 3. Split template into segments at break points
 * 4. For each segment, detect dominant colors, content regions, and image placeholder areas
 * 5. Output structured module map with pixel-level coordinates
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function sliceTemplate(templatePath, outputDir) {
  const image = sharp(templatePath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // Get raw pixel data (downscaled for analysis speed)
  const analysisWidth = Math.min(width, 750);
  const scale = analysisWidth / width;
  const analysisHeight = Math.round(height * scale);

  const { data, info } = await image
    .resize(analysisWidth, analysisHeight)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;

  // Step 1: Scan each row for color variance to find section breaks
  const rowVariances = [];
  for (let y = 0; y < analysisHeight; y++) {
    const rowColors = [];
    for (let x = 0; x < analysisWidth; x += 4) { // sample every 4th pixel
      const idx = (y * analysisWidth + x) * channels;
      rowColors.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      });
    }

    // Calculate color variance for this row
    const avgR = rowColors.reduce((s, c) => s + c.r, 0) / rowColors.length;
    const avgG = rowColors.reduce((s, c) => s + c.g, 0) / rowColors.length;
    const avgB = rowColors.reduce((s, c) => s + c.b, 0) / rowColors.length;

    const variance = rowColors.reduce((s, c) => {
      return s + Math.pow(c.r - avgR, 2) + Math.pow(c.g - avgG, 2) + Math.pow(c.b - avgB, 2);
    }, 0) / rowColors.length;

    rowVariances.push({
      y,
      variance,
      avgColor: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
      isUniform: variance < 200 // Low variance = likely a divider/background row
    });
  }

  // Step 2: Find section breaks - sequences of uniform rows
  const breaks = findSectionBreaks(rowVariances, analysisHeight);

  // Step 3: Create segments between breaks
  const segments = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    const yStart = breaks[i];
    const yEnd = breaks[i + 1];
    const segmentHeight = yEnd - yStart;

    if (segmentHeight < 30) continue; // Skip tiny gaps

    // Analyze this segment
    const segment = await analyzeSegment(data, analysisWidth, analysisHeight, channels, yStart, yEnd, i);
    segment.y_start_original = Math.round(yStart / scale);
    segment.y_end_original = Math.round(yEnd / scale);
    segment.height_original = segment.y_end_original - segment.y_start_original;
    segments.push(segment);
  }

  // Step 4: Extract each segment as a separate image for reference
  const segmentDir = join(outputDir, 'segments');
  mkdirSync(segmentDir, { recursive: true });

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    try {
      await sharp(templatePath)
        .extract({
          left: 0,
          top: seg.y_start_original,
          width: width,
          height: Math.min(seg.height_original, height - seg.y_start_original)
        })
        .resize(750, null)
        .png()
        .toFile(join(segmentDir, `segment_${String(i + 1).padStart(2, '0')}.png`));
      seg.segment_image = `segments/segment_${String(i + 1).padStart(2, '0')}.png`;
    } catch (e) {
      seg.segment_image = null;
    }
  }

  return {
    original_width: width,
    original_height: height,
    analysis_width: analysisWidth,
    analysis_height: analysisHeight,
    segment_count: segments.length,
    segments
  };
}

function findSectionBreaks(rowVariances, totalHeight) {
  const breaks = [0];
  const minSegmentHeight = 120; // Minimum segment height
  const windowSize = 15; // Smoothing window for color change detection

  // Strategy 1: Find rows where average color shifts significantly
  // Compute color difference between consecutive rows (smoothed)
  const colorDiffs = [];
  for (let y = windowSize; y < rowVariances.length - windowSize; y++) {
    // Average color of rows above vs below this point
    let aboveR = 0, aboveG = 0, aboveB = 0;
    let belowR = 0, belowG = 0, belowB = 0;
    for (let dy = 1; dy <= windowSize; dy++) {
      const a = rowVariances[y - dy].avgColor;
      const b = rowVariances[y + dy].avgColor;
      aboveR += a.r; aboveG += a.g; aboveB += a.b;
      belowR += b.r; belowG += b.g; belowB += b.b;
    }
    aboveR /= windowSize; aboveG /= windowSize; aboveB /= windowSize;
    belowR /= windowSize; belowG /= windowSize; belowB /= windowSize;

    const diff = Math.abs(aboveR - belowR) + Math.abs(aboveG - belowG) + Math.abs(aboveB - belowB);
    colorDiffs.push({ y, diff });
  }

  // Strategy 2: Also detect uniform-row stretches (divider lines)
  let inUniform = false;
  let uniformStart = 0;
  for (let y = 0; y < rowVariances.length; y++) {
    if (rowVariances[y].isUniform) {
      if (!inUniform) { uniformStart = y; inUniform = true; }
    } else {
      if (inUniform) {
        const len = y - uniformStart;
        if (len >= 3) {
          const bp = Math.round((uniformStart + y) / 2);
          if (bp - breaks[breaks.length - 1] >= minSegmentHeight) {
            breaks.push(bp);
          }
        }
        inUniform = false;
      }
    }
  }

  // Find peaks in color difference (local maxima = section boundaries)
  // Sort by diff value, pick top ones that are spaced apart
  const sorted = [...colorDiffs].sort((a, b) => b.diff - a.diff);
  const candidates = sorted.slice(0, 30); // Top 30 candidates

  for (const c of candidates) {
    if (c.diff < 15) break; // Too subtle
    // Check minimum distance from existing breaks
    const tooClose = breaks.some(b => Math.abs(c.y - b) < minSegmentHeight);
    if (!tooClose) {
      breaks.push(c.y);
    }
  }

  // Sort and ensure we end at the bottom
  breaks.sort((a, b) => a - b);

  if (totalHeight - breaks[breaks.length - 1] >= minSegmentHeight) {
    breaks.push(totalHeight);
  } else if (breaks.length > 1) {
    breaks[breaks.length - 1] = totalHeight;
  } else {
    breaks.push(totalHeight);
  }

  // If still too few breaks, force-split into equal chunks
  if (breaks.length <= 2 && totalHeight > 800) {
    const idealSegHeight = 500;
    const numSegs = Math.max(3, Math.round(totalHeight / idealSegHeight));
    const segH = Math.round(totalHeight / numSegs);
    const forcedBreaks = [0];
    for (let i = 1; i < numSegs; i++) {
      // Find the nearest "best" break point around the ideal position
      const idealY = i * segH;
      let bestY = idealY;
      let bestDiff = 0;
      for (const cd of colorDiffs) {
        if (Math.abs(cd.y - idealY) < segH * 0.3 && cd.diff > bestDiff) {
          bestDiff = cd.diff;
          bestY = cd.y;
        }
      }
      forcedBreaks.push(bestY);
    }
    forcedBreaks.push(totalHeight);
    return forcedBreaks;
  }

  return breaks;
}

async function analyzeSegment(data, width, height, channels, yStart, yEnd, index) {
  const segHeight = yEnd - yStart;

  // Sample colors in this segment
  const colors = [];
  const brightPixels = [];
  const darkPixels = [];
  let hasImageLikeContent = false;

  for (let y = yStart; y < yEnd; y += 3) {
    for (let x = 0; x < width; x += 6) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      colors.push({ r, g, b });

      const brightness = (r + g + b) / 3;
      if (brightness > 200) brightPixels.push({ x, y: y - yStart });
      if (brightness < 40) darkPixels.push({ x, y: y - yStart });

      // High color variance locally suggests photo/image content
      if (x > 0 && y > yStart) {
        const prevIdx = ((y - 1) * width + x) * channels;
        const diff = Math.abs(r - data[prevIdx]) + Math.abs(g - data[prevIdx + 1]) + Math.abs(b - data[prevIdx + 2]);
        if (diff > 100) hasImageLikeContent = true;
      }
    }
  }

  // Dominant colors
  const avgR = Math.round(colors.reduce((s, c) => s + c.r, 0) / colors.length);
  const avgG = Math.round(colors.reduce((s, c) => s + c.g, 0) / colors.length);
  const avgB = Math.round(colors.reduce((s, c) => s + c.b, 0) / colors.length);

  // Color distribution analysis
  const isGolden = avgR > 150 && avgG > 100 && avgB < 100;
  const isDark = avgR < 60 && avgG < 60 && avgB < 80;
  const isLight = avgR > 200 && avgG > 200 && avgB > 200;

  // Detect if segment has significant image/photo areas
  // (regions with high local color variance)
  const imageRegions = detectImageRegions(data, width, channels, yStart, yEnd);

  // Detect text-heavy areas (lots of contrast on dark bg)
  const textDensity = brightPixels.length / (colors.length || 1);

  // Guess module type based on analysis
  const moduleType = guessModuleType(index, segHeight, isDark, isLight, isGolden,
    textDensity, hasImageLikeContent, imageRegions);

  return {
    module_id: `segment_${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    y_start: yStart,
    y_end: yEnd,
    height: segHeight,
    dominant_color: { r: avgR, g: avgG, b: avgB },
    dominant_hex: rgbToHex(avgR, avgG, avgB),
    is_dark_bg: isDark,
    is_light_bg: isLight,
    has_golden_tones: isGolden,
    text_density: Math.round(textDensity * 100) / 100,
    has_image_content: hasImageLikeContent,
    image_regions: imageRegions,
    module_type_guess: moduleType,
    needs_image: imageRegions.length > 0,
    needs_text: textDensity > 0.05
  };
}

function detectImageRegions(data, width, channels, yStart, yEnd) {
  // Scan for rectangular regions with high color variance (likely photos/images)
  const regions = [];
  const blockSize = 40;
  const segHeight = yEnd - yStart;

  for (let by = 0; by < segHeight; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      let variance = 0;
      let count = 0;
      let sumR = 0, sumG = 0, sumB = 0;

      // First pass: compute mean
      for (let y = yStart + by; y < Math.min(yStart + by + blockSize, yEnd); y += 4) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x += 4) {
          const idx = (y * width + x) * channels;
          sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2];
          count++;
        }
      }

      if (count === 0) continue;
      const mR = sumR / count, mG = sumG / count, mB = sumB / count;

      // Second pass: compute variance
      for (let y = yStart + by; y < Math.min(yStart + by + blockSize, yEnd); y += 4) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x += 4) {
          const idx = (y * width + x) * channels;
          variance += Math.pow(data[idx] - mR, 2) + Math.pow(data[idx + 1] - mG, 2) + Math.pow(data[idx + 2] - mB, 2);
        }
      }
      variance /= count;

      // High variance blocks are likely image content
      if (variance > 2000) {
        regions.push({
          x: bx,
          y: by,
          width: blockSize,
          height: blockSize,
          variance: Math.round(variance),
          type: variance > 5000 ? 'photo' : 'graphic'
        });
      }
    }
  }

  // Merge adjacent regions
  return mergeRegions(regions, blockSize);
}

function mergeRegions(regions, blockSize) {
  if (regions.length === 0) return [];

  // Simple merge: group nearby blocks
  const merged = [];
  const used = new Set();

  for (let i = 0; i < regions.length; i++) {
    if (used.has(i)) continue;

    let minX = regions[i].x, minY = regions[i].y;
    let maxX = regions[i].x + blockSize, maxY = regions[i].y + blockSize;
    used.add(i);

    for (let j = i + 1; j < regions.length; j++) {
      if (used.has(j)) continue;
      const r = regions[j];
      if (r.x >= minX - blockSize && r.x <= maxX &&
          r.y >= minY - blockSize && r.y <= maxY) {
        minX = Math.min(minX, r.x);
        minY = Math.min(minY, r.y);
        maxX = Math.max(maxX, r.x + blockSize);
        maxY = Math.max(maxY, r.y + blockSize);
        used.add(j);
      }
    }

    merged.push({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      type: 'image_area'
    });
  }

  // Filter out tiny regions
  return merged.filter(r => r.width > 60 && r.height > 60);
}

function guessModuleType(index, height, isDark, isLight, isGolden, textDensity, hasImage, imageRegions) {
  // First segment is usually the header
  if (index === 0) return 'header';

  // Very short segments might be dividers
  if (height < 40) return 'divider';

  // Image-heavy segments
  if (imageRegions.length > 2) return 'image_gallery';
  if (imageRegions.length === 1 && imageRegions[0].width > 200) return 'hero_image';

  // Text-heavy on dark bg
  if (isDark && textDensity > 0.15) return 'text_content';
  if (isDark && textDensity > 0.05) return 'info_section';

  // Light backgrounds often have data/stats
  if (isLight && textDensity > 0.1) return 'data_section';
  if (isLight) return 'content_section';

  // Golden sections
  if (isGolden) return 'highlight_section';

  return 'general_section';
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Match uploaded assets to template segments based on:
 * 1. Image region positions in segments
 * 2. Asset dimensions vs region dimensions
 * 3. Color harmony between asset and segment background
 */
export async function matchAssetsToSegments(segments, assetPaths) {
  if (!assetPaths || assetPaths.length === 0) return segments;

  // Analyze each asset
  const assets = [];
  for (const assetPath of assetPaths) {
    try {
      const meta = await sharp(assetPath).metadata();
      const { data } = await sharp(assetPath).resize(50, 50, { fit: 'cover' }).raw().toBuffer({ resolveWithObject: true });

      // Get dominant color of asset
      let sumR = 0, sumG = 0, sumB = 0;
      const pixelCount = 50 * 50;
      for (let i = 0; i < pixelCount; i++) {
        sumR += data[i * 3]; sumG += data[i * 3 + 1]; sumB += data[i * 3 + 2];
      }

      assets.push({
        path: assetPath,
        width: meta.width,
        height: meta.height,
        aspect: meta.width / meta.height,
        avgColor: {
          r: Math.round(sumR / pixelCount),
          g: Math.round(sumG / pixelCount),
          b: Math.round(sumB / pixelCount)
        },
        used: false
      });
    } catch (e) {
      // Skip unreadable assets
    }
  }

  // Match assets to segments with image regions
  for (const seg of segments) {
    if (!seg.image_regions || seg.image_regions.length === 0) continue;

    for (const region of seg.image_regions) {
      // Find best matching unused asset
      let bestAsset = null;
      let bestScore = -1;

      for (const asset of assets) {
        if (asset.used) continue;

        // Score based on:
        // 1. Aspect ratio match (region vs asset)
        const regionAspect = region.width / region.height;
        const aspectScore = 1 - Math.min(Math.abs(regionAspect - asset.aspect), 2) / 2;

        // 2. Color harmony (complementary to segment bg)
        const colorDiff = Math.abs(asset.avgColor.r - seg.dominant_color.r) +
                          Math.abs(asset.avgColor.g - seg.dominant_color.g) +
                          Math.abs(asset.avgColor.b - seg.dominant_color.b);
        const colorScore = Math.min(colorDiff, 300) / 300; // Different from bg = good

        const score = aspectScore * 0.6 + colorScore * 0.4;

        if (score > bestScore) {
          bestScore = score;
          bestAsset = asset;
        }
      }

      if (bestAsset && bestScore > 0.3) {
        region.matched_asset = bestAsset.path;
        region.match_score = Math.round(bestScore * 100) / 100;
        bestAsset.used = true;
      }
    }
  }

  return segments;
}
