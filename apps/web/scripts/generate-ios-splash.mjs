#!/usr/bin/env node
/**
 * Generates iOS PWA startup (splash) images.
 *
 * Renders the home-page background (base color + `primary/20 → secondary/20`
 * top-right gradient) and composites `public/icons/logo.png` centered on top.
 * Output: `public/icons/splash/apple-splash-{w}-{h}.png`.
 *
 * Colors mirror the `--primary` / `--secondary` / `--background` tokens in
 * `src/app/globals.css`. Update here AND in the inline critical CSS in
 * `src/app/[lang]/layout.tsx` if those oklch tokens change.
 *
 * Device list matches the `<link rel="apple-touch-startup-image">` tags in
 * `src/app/[lang]/layout.tsx`. When adding a new device, update both.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const LOGO = join(PUBLIC_DIR, 'icons', 'logo.png');
const OUT_DIR = join(PUBLIC_DIR, 'icons', 'splash');

// Mirrors globals.css light-mode tokens (oklch → sRGB hex, pre-computed).
// Dark-mode splash not generated: iOS manifest doesn't support per-scheme
// startup images without doubling the PNG count + media queries.
const BASE = '#fafafa'; // --background (light)
const PRIMARY = 'rgb(167,216,0)'; // --primary
const SECONDARY = 'rgb(74,139,222)'; // --secondary
const GRADIENT_OPACITY = 0.2;
const LOGO_RATIO = 0.33;

// Portrait dimensions: [width, height, label]. Landscape is flipped automatically.
const DEVICES = [
  [1290, 2796, 'iPhone 15/16 Pro Max, 15 Plus'],
  [1179, 2556, 'iPhone 15/16, 15/16 Pro'],
  [1284, 2778, 'iPhone 14 Plus, 13/12 Pro Max'],
  [1170, 2532, 'iPhone 14, 13/13 Pro, 12/12 Pro'],
  [1125, 2436, 'iPhone 13 mini, 12 mini, 11 Pro, Xs, X'],
  [1242, 2688, 'iPhone 11 Pro Max, Xs Max'],
  [828, 1792, 'iPhone 11, XR'],
  [750, 1334, 'iPhone SE 2/3, 8, 7, 6s'],
  [2048, 2732, 'iPad Pro 12.9"'],
  [1668, 2388, 'iPad Pro 11", iPad Air 4/5'],
  [1620, 2160, 'iPad 10.2"/10.9"'],
  [1488, 2266, 'iPad mini 6'],
];

function buildBackgroundSvg(width, height) {
  // Gradient goes from bottom-left (primary) to top-right (secondary),
  // matching Tailwind's `bg-linear-to-tr from-primary/20 to-secondary/20`.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${PRIMARY}" stop-opacity="${GRADIENT_OPACITY}"/>
      <stop offset="100%" stop-color="${SECONDARY}" stop-opacity="${GRADIENT_OPACITY}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${BASE}"/>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`;
}

await mkdir(OUT_DIR, { recursive: true });

for (const [pw, ph, label] of DEVICES) {
  for (const orientation of ['portrait', 'landscape']) {
    const width = orientation === 'portrait' ? pw : ph;
    const height = orientation === 'portrait' ? ph : pw;
    const logoSize = Math.round(Math.min(width, height) * LOGO_RATIO);

    const logoBuffer = await sharp(LOGO)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const bgSvg = Buffer.from(buildBackgroundSvg(width, height));
    const filename = `apple-splash-${width}-${height}.png`;

    await sharp(bgSvg)
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(join(OUT_DIR, filename));

    console.log(`  ✓ ${filename}  (${label}, ${orientation})`);
  }
}

console.log(`\nDone. Wrote ${DEVICES.length * 2} files to ${OUT_DIR}`);
