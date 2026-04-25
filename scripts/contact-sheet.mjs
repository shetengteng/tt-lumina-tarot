import sharp from 'sharp';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const deck = process.argv[2] || 'rws';
const root = `/Users/TerrellShe/Documents/personal/tt-projects/tt-lumina-tarot/public/decks/${deck}`;
const files = (await readdir(root))
  .filter((f) => f.endsWith('.webp') && !f.startsWith('_'))
  .sort();

const tileW = 100;
const tileH = 168;
const cols = 14;
const rows = Math.ceil(files.length / cols);
const W = cols * tileW;
const H = rows * tileH;

const tiles = await Promise.all(
  files.map(async (f, i) => {
    const buf = await sharp(join(root, f))
      .resize(tileW, tileH, { fit: 'cover' })
      .toBuffer();
    return {
      input: buf,
      top: Math.floor(i / cols) * tileH,
      left: (i % cols) * tileW,
    };
  })
);

const labels = files
  .map((f, i) => {
    const x = (i % cols) * tileW + 2;
    const y = Math.floor(i / cols) * tileH + tileH - 4;
    const txt = f.replace('.webp', '').slice(0, 14);
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="9" fill="white" stroke="black" stroke-width="0.4">${txt}</text>`;
  })
  .join('\n');

const labelLayer = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`;

await sharp({ create: { width: W, height: H, channels: 4, background: { r: 30, g: 30, b: 30, alpha: 1 } } })
  .composite([...tiles, { input: Buffer.from(labelLayer), top: 0, left: 0 }])
  .png()
  .toFile(`/tmp/contact-${deck}.png`);

console.log(`saved /tmp/contact-${deck}.png with ${files.length} cards (${cols}x${rows})`);
