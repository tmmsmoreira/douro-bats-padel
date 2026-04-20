#!/usr/bin/env node
/**
 * Generates iOS PWA startup (splash) images.
 *
 * Composites `public/icons/logo.png` (centered, ~33% of shortest side)
 * onto a solid brand-green background, in portrait + landscape for each
 * supported device. Output: `public/icons/splash/apple-splash-{w}-{h}.png`.
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

const BACKGROUND = { r: 0x16, g: 0xa3, b: 0x4a, alpha: 1 }; // #16a34a
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

    const filename = `apple-splash-${width}-${height}.png`;
    await sharp({
      create: { width, height, channels: 4, background: BACKGROUND },
    })
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(join(OUT_DIR, filename));

    console.log(`  ✓ ${filename}  (${label}, ${orientation})`);
  }
}

console.log(`\nDone. Wrote ${DEVICES.length * 2} files to ${OUT_DIR}`);
