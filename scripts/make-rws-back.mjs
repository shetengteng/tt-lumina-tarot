import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const W = 600;
const H = 1020;

const back = await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: { r: 76, g: 38, b: 26, alpha: 1 },
  },
})
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
          <defs>
            <radialGradient id="bg" cx="0.5" cy="0.5" r="0.75">
              <stop offset="0" stop-color="#5a2a1a"/>
              <stop offset="0.6" stop-color="#3d1c12"/>
              <stop offset="1" stop-color="#1a0a06"/>
            </radialGradient>
            <pattern id="diag" patternUnits="userSpaceOnUse" width="36" height="36" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="36" stroke="#d4af37" stroke-opacity="0.15" stroke-width="1"/>
              <line x1="18" y1="0" x2="18" y2="36" stroke="#d4af37" stroke-opacity="0.08" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="${W}" height="${H}" fill="url(#bg)"/>
          <rect width="${W}" height="${H}" fill="url(#diag)"/>
          <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="#d4af37" stroke-opacity="0.85" stroke-width="3"/>
          <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="none" stroke="#d4af37" stroke-opacity="0.45" stroke-width="1.5"/>
          <g transform="translate(${W / 2} ${H / 2})" fill="none" stroke="#f5d56b" stroke-linecap="round" stroke-linejoin="round">
            <g stroke-width="2.5">
              <circle r="120" stroke-opacity="0.4"/>
              <circle r="92" stroke-opacity="0.65"/>
              <circle r="64" stroke-opacity="0.45"/>
            </g>
            <g stroke-width="2" stroke-opacity="0.85">
              <path d="M0 -110 L0 110 M-110 0 L110 0"/>
              <path d="M-78 -78 L78 78 M-78 78 L78 -78"/>
            </g>
            <g fill="#f5d56b" stroke="none">
              <circle r="5"/>
              <g transform="rotate(0)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(45)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(90)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(135)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(180)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(225)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(270)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
              <g transform="rotate(315)"><path d="M0 -120 L8 -100 L-8 -100 Z"/></g>
            </g>
            <g stroke-width="1.5" stroke-opacity="0.55" fill="none">
              <g transform="rotate(0)"><path d="M0 -50 Q-12 -30 0 -10 Q12 -30 0 -50 Z" fill="#d4af37" fill-opacity="0.25"/></g>
              <g transform="rotate(60)"><path d="M0 -50 Q-12 -30 0 -10 Q12 -30 0 -50 Z" fill="#d4af37" fill-opacity="0.25"/></g>
              <g transform="rotate(120)"><path d="M0 -50 Q-12 -30 0 -10 Q12 -30 0 -50 Z" fill="#d4af37" fill-opacity="0.25"/></g>
              <g transform="rotate(180)"><path d="M0 -50 Q-12 -30 0 -10 Q12 -30 0 -50 Z" fill="#d4af37" fill-opacity="0.25"/></g>
              <g transform="rotate(240)"><path d="M0 -50 Q-12 -30 0 -10 Q12 -30 0 -50 Z" fill="#d4af37" fill-opacity="0.25"/></g>
              <g transform="rotate(300)"><path d="M0 -50 Q-12 -30 0 -10 Q12 -30 0 -50 Z" fill="#d4af37" fill-opacity="0.25"/></g>
            </g>
          </g>
        </svg>`,
      ),
      top: 0,
      left: 0,
      blend: 'over',
    },
  ])
  .webp({ quality: 88 })
  .toBuffer();

await writeFile(
  '/Users/TerrellShe/Documents/personal/tt-projects/tt-lumina-tarot/public/decks/rws/_back.webp',
  back,
);
console.log('saved rws _back.webp:', back.length, 'bytes');
