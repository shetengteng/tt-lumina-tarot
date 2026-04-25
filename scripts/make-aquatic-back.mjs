import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const W = 600;
const H = 1020;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.5" r="0.78">
      <stop offset="0" stop-color="#1c4566"/>
      <stop offset="0.55" stop-color="#0f2a44"/>
      <stop offset="1" stop-color="#05111f"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7e08a"/>
      <stop offset="0.5" stop-color="#d4af37"/>
      <stop offset="1" stop-color="#a37416"/>
    </linearGradient>
    <pattern id="scales" patternUnits="userSpaceOnUse" width="36" height="36">
      <path d="M0 18 Q9 0 18 18 Q27 36 36 18" fill="none" stroke="#d4af37" stroke-opacity="0.10" stroke-width="0.9"/>
      <path d="M-18 36 Q-9 18 0 36 Q9 54 18 36" fill="none" stroke="#d4af37" stroke-opacity="0.10" stroke-width="0.9"/>
      <path d="M18 36 Q27 18 36 36 Q45 54 54 36" fill="none" stroke="#d4af37" stroke-opacity="0.10" stroke-width="0.9"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#scales)"/>

  <!-- 双层金色边框 -->
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="8" fill="none" stroke="url(#gold)" stroke-width="3"/>
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="6" fill="none" stroke="#d4af37" stroke-opacity="0.45" stroke-width="1"/>

  <!-- 四角金色装饰 -->
  <g fill="none" stroke="url(#gold)" stroke-width="1.6" stroke-linecap="round">
    <path d="M50 50 Q70 50 70 70" />
    <path d="M${W - 50} 50 Q${W - 70} 50 ${W - 70} 70" />
    <path d="M50 ${H - 50} Q70 ${H - 50} 70 ${H - 70}" />
    <path d="M${W - 50} ${H - 50} Q${W - 70} ${H - 50} ${W - 70} ${H - 70}" />
  </g>
  <g fill="#d4af37" fill-opacity="0.8">
    <circle cx="60" cy="60" r="2.4"/>
    <circle cx="${W - 60}" cy="60" r="2.4"/>
    <circle cx="60" cy="${H - 60}" r="2.4"/>
    <circle cx="${W - 60}" cy="${H - 60}" r="2.4"/>
  </g>

  <!-- 顶部弧形纹饰 -->
  <g transform="translate(${W / 2} 130)" fill="none" stroke="url(#gold)" stroke-linecap="round">
    <path d="M-90 0 Q-45 -22 0 0 Q45 22 90 0" stroke-width="1.6" stroke-opacity="0.85"/>
    <path d="M-70 12 Q-35 -8 0 12 Q35 32 70 12" stroke-width="1.2" stroke-opacity="0.55"/>
    <circle cx="0" cy="-2" r="3" fill="#f7e08a" stroke="none"/>
  </g>

  <!-- 中央主图：八芒星 + 双环 + 中心宝石 -->
  <g transform="translate(${W / 2} ${H / 2})">
    <!-- 外圈双环 -->
    <circle r="172" fill="none" stroke="#d4af37" stroke-opacity="0.35" stroke-width="1.2"/>
    <circle r="160" fill="none" stroke="url(#gold)" stroke-width="2"/>

    <!-- 八芒星：4 大尖 + 4 小尖 重叠形成完整八角 -->
    <g fill="url(#gold)" fill-opacity="0.92">
      <!-- 主四角（垂直十字） -->
      <path d="M0 -150 L26 0 L0 150 L-26 0 Z"/>
      <path d="M-150 0 L0 -26 L150 0 L0 26 Z"/>
      <!-- 副四角（45度，略短） -->
      <g transform="rotate(45)">
        <path d="M0 -110 L20 0 L0 110 L-20 0 Z"/>
        <path d="M-110 0 L0 -20 L110 0 L0 20 Z"/>
      </g>
    </g>

    <!-- 内圆：作为主图收口 -->
    <circle r="42" fill="#0f2a44" stroke="url(#gold)" stroke-width="2"/>
    <circle r="34" fill="none" stroke="#d4af37" stroke-opacity="0.55" stroke-width="0.8"/>

    <!-- 中心宝石（菱形） -->
    <g>
      <path d="M0 -22 L16 0 L0 22 L-16 0 Z" fill="url(#gold)" stroke="#f7e08a" stroke-width="0.8"/>
      <path d="M0 -10 L8 0 L0 10 L-8 0 Z" fill="#1c4566"/>
    </g>

    <!-- 水滴小符号（八方位，绕在八芒星外） -->
    <g fill="url(#gold)" fill-opacity="0.85">
      <g transform="translate(0 -195)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(138 -138) rotate(45)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(195 0) rotate(90)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(138 138) rotate(135)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(0 195) rotate(180)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(-138 138) rotate(225)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(-195 0) rotate(270)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
      <g transform="translate(-138 -138) rotate(315)"><path d="M0 -8 Q-6 0 -6 6 A 6 6 0 0 0 6 6 Q 6 0 0 -8 Z"/></g>
    </g>
  </g>

  <!-- 底部弧形纹饰（与顶部对称） -->
  <g transform="translate(${W / 2} ${H - 130})" fill="none" stroke="url(#gold)" stroke-linecap="round">
    <path d="M-90 0 Q-45 22 0 0 Q45 -22 90 0" stroke-width="1.6" stroke-opacity="0.85"/>
    <path d="M-70 -12 Q-35 8 0 -12 Q35 -32 70 -12" stroke-width="1.2" stroke-opacity="0.55"/>
    <circle cx="0" cy="2" r="3" fill="#f7e08a" stroke="none"/>
  </g>

  <!-- vignette -->
  <defs>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;

const back = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer();
await writeFile(
  '/Users/TerrellShe/Documents/personal/tt-projects/tt-lumina-tarot/public/decks/aquatic/_back.webp',
  back
);
console.log('saved aquatic _back.webp:', back.length, 'bytes');
