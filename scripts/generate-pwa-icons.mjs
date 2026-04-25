#!/usr/bin/env node
// Render public/pwa-icon{,-maskable}.svg into PNG sizes consumed by manifest + iOS.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = resolve(root, 'public/img');

const targets = [
  { src: 'public/pwa-icon.svg', size: 192, name: 'icon-192.png' },
  { src: 'public/pwa-icon.svg', size: 512, name: 'icon-512.png' },
  { src: 'public/pwa-icon-maskable.svg', size: 512, name: 'icon-512-maskable.png' },
  { src: 'public/pwa-icon.svg', size: 180, name: 'apple-touch-icon-180.png' },
];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function render({ src, size, name }) {
  const svg = await readFile(resolve(root, src));
  const png = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const out = resolve(outDir, name);
  await writeFile(out, png);
  console.log(`✓ ${name.padEnd(28)} ${size}px ← ${src}  (${(png.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  await ensureDir(outDir);
  for (const t of targets) {
    await render(t);
  }
  console.log(`\nDone → ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
