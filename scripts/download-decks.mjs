#!/usr/bin/env node
// Download tarot deck images from public sources, re-encode to 600×1020 WebP
// and place them in public/decks/{deckId}/{cardId}.webp.
//
// Sources & licenses:
//   - rws (Wikimedia Commons / Vectorized by Immanuelle):
//       Vectorized SVG of Pamela Colman Smith's 1909 Rider-Waite-Smith deck.
//       Public domain (PD-1923 / PD-Mark).
//   - aquatic (arcanaland/reference-decks/aquatic-tarot/h800):
//       Andreas Schröter's water-color RWS reinterpretation.
//       CC BY-NC-SA 3.0 (NON-COMMERCIAL only).

import { mkdir, writeFile, access, readFile, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const baseOutDir = resolve(root, 'public/decks');

const TARGET_WIDTH = 600;
const TARGET_HEIGHT = 1020;
const WEBP_QUALITY = 82;
const PARALLEL = 2;
const MAX_RETRIES = 5;

// --- Major arcana: id → traditional Waite number (0..21) ---
const MAJOR_NUMBER = {
  fool: 0,
  magician: 1,
  'high-priestess': 2,
  empress: 3,
  emperor: 4,
  hierophant: 5,
  lovers: 6,
  chariot: 7,
  strength: 8,
  hermit: 9,
  wheel: 10,
  justice: 11,
  'hanged-man': 12,
  death: 13,
  temperance: 14,
  devil: 15,
  tower: 16,
  star: 17,
  moon: 18,
  sun: 19,
  judgement: 20,
  world: 21,
};

// --- Minor arcana: rank id → Aquatic file basename ---
const RANK_TO_AQUATIC = {
  ace: 'ace',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  page: 'page',
  knight: 'knight',
  queen: 'queen',
  king: 'king',
};
const AQUATIC_SUITS = ['wands', 'cups', 'swords', 'pentacles'];

// --- Wikimedia (vectorized RWS by Immanuelle) ---
// Each major SVG is at https://commons.wikimedia.org/wiki/File:RWS_Tarot_NN_Name.svg
// Each minor SVG is at https://commons.wikimedia.org/wiki/File:{Suit}{NN}.svg
//   (e.g. Wands01.svg ... Wands14.svg, Cups01..14, Swords01..14, Pents01..14)
// We can't predict the {hash} prefix in commons URLs, so we scrape the file page
// to discover the canonical raw URL once per file, then download SVG and rasterise.
const WIKI_BASE = 'https://commons.wikimedia.org';

const RWS_MAJOR_TITLES = {
  fool: '00 Fool',
  magician: '01 Magician',
  'high-priestess': '02 High Priestess',
  empress: '03 Empress',
  emperor: '04 Emperor',
  hierophant: '05 Hierophant',
  lovers: '06 Lovers',
  chariot: '07 Chariot',
  strength: '08 Strength',
  hermit: '09 Hermit',
  wheel: '10 Wheel of Fortune',
  justice: '11 Justice',
  'hanged-man': '12 Hanged Man',
  death: '13 Death',
  temperance: '14 Temperance',
  devil: '15 Devil',
  tower: '16 Tower',
  star: '17 Star',
  moon: '18 Moon',
  sun: '19 Sun',
  judgement: '20 Judgement',
  world: '21 World',
};

// Suit prefix used in Wikimedia file names.  "Pents" is upstream's convention.
const RWS_SUIT_PREFIX = {
  wands: 'Wands',
  cups: 'Cups',
  swords: 'Swords',
  pentacles: 'Pents',
};
// Map our rank id → 1-based number Immanuelle uses (ace=01, 2..10, page=11, knight=12, queen=13, king=14)
const RANK_TO_RWS_NUMBER = {
  ace: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  page: 11,
  knight: 12,
  queen: 13,
  king: 14,
};

// === Deck definitions ===
const DECKS = {
  rws: {
    label: 'Vectorized Rider-Waite-Smith (Wikimedia / Immanuelle, public domain)',
    resolveSourceUrl: rwsResolveSourceUrl,
    fetchAndRender: fetchAndRenderRaster,
  },
  aquatic: {
    label: "Aquatic Tarot — Andreas Schröter's water-color RWS (CC BY-NC-SA 3.0)",
    resolveSourceUrl: aquaticResolveSourceUrl,
    fetchAndRender: fetchAndRenderRaster,
  },
};

// =================================================================
// Source URL resolvers
// =================================================================

function aquaticResolveSourceUrl(cardId) {
  if (cardId in MAJOR_NUMBER) {
    const n = MAJOR_NUMBER[cardId];
    const padded = String(n).padStart(2, '0');
    return `https://raw.githubusercontent.com/arcanaland/reference-decks/main/aquatic-tarot/h800/major_arcana/${padded}.jpg`;
  }
  const [suit, rank] = cardId.split('-');
  if (!AQUATIC_SUITS.includes(suit)) throw new Error(`Unknown suit: ${suit}`);
  const basename = RANK_TO_AQUATIC[rank];
  if (!basename) throw new Error(`Unknown rank: ${rank}`);
  return `https://raw.githubusercontent.com/arcanaland/reference-decks/main/aquatic-tarot/h800/minor_arcana/${suit}/${basename}.jpg`;
}

async function rwsResolveSourceUrl(cardId) {
  // Build the file title used on Wikimedia.
  let title;
  if (cardId in MAJOR_NUMBER) {
    title = `RWS Tarot ${RWS_MAJOR_TITLES[cardId]}.svg`;
  } else {
    const [suit, rank] = cardId.split('-');
    const prefix = RWS_SUIT_PREFIX[suit];
    if (!prefix) throw new Error(`Unknown suit: ${suit}`);
    const num = RANK_TO_RWS_NUMBER[rank];
    if (!num) throw new Error(`Unknown rank: ${rank}`);
    title = `${prefix}${String(num).padStart(2, '0')}.svg`;
  }
  // Fetch the file description page and pull the canonical raw URL out of it.
  const pageUrl = `${WIKI_BASE}/wiki/File:${encodeURIComponent(title.replace(/ /g, '_'))}`;
  const html = await fetchText(pageUrl);
  // Use the 1280px pre-rendered PNG thumbnail instead of the multi-MB raw SVG.
  // Format: https://upload.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{Title}.svg/1280px-{Title}.svg.png
  const titleEsc = title.replace(/ /g, '_').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reThumb = new RegExp(
    `https://upload\\.wikimedia\\.org/wikipedia/commons/thumb/[0-9a-f]/[0-9a-f]{2}/${titleEsc}/1280px-${titleEsc}\\.png`
  );
  const m = html.match(reThumb);
  if (!m) {
    // Fallback to raw SVG URL if thumbnail wasn't pre-rendered yet (rare).
    const reRaw = new RegExp(
      `https://upload\\.wikimedia\\.org/wikipedia/commons/[0-9a-f]/[0-9a-f]{2}/${titleEsc}`
    );
    const raw = html.match(reRaw);
    if (!raw) throw new Error(`Could not resolve any URL for ${title}`);
    return raw[0];
  }
  return m[0];
}

// =================================================================
// Fetch + render
// =================================================================

async function fetchAndRenderRaster(url, outPath) {
  const buf = await fetchBuffer(url);
  const out = await sharp(buf, { failOn: 'none' })
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await writeFile(outPath, out);
  return out.length;
}

async function fetchAndRenderSvg(url, outPath) {
  const buf = await fetchBuffer(url);
  // Render SVG at our target resolution.  sharp uses libvips/librsvg under the hood.
  const out = await sharp(buf, { density: 300, failOn: 'none' })
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await writeFile(outPath, out);
  return out.length;
}

// =================================================================
// Plumbing
// =================================================================

function listAllCardIds() {
  const ids = Object.keys(MAJOR_NUMBER);
  for (const suit of AQUATIC_SUITS) {
    for (const rank of Object.keys(RANK_TO_AQUATIC)) {
      ids.push(`${suit}-${rank}`);
    }
  }
  return ids;
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function curlOnce(url, outPath, timeoutSec) {
  return new Promise((resolveP, rejectP) => {
    const args = [
      '-sSL',
      '--max-time',
      String(timeoutSec),
      '-A',
      'tt-lumina-tarot/0.1 (+local build script)',
      '-w',
      '%{http_code}',
      '-o',
      outPath,
      url,
    ];
    const child = spawn('curl', args);
    let stderr = '';
    let stdout = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => {
      if (code !== 0) {
        rejectP(new Error(`curl exit ${code}: ${stderr.trim()}`));
        return;
      }
      const status = parseInt(stdout.trim(), 10);
      if (status >= 200 && status < 300) {
        resolveP({ status });
      } else {
        rejectP(Object.assign(new Error(`HTTP ${status}`), { httpStatus: status }));
      }
    });
    child.on('error', (e) => rejectP(e));
  });
}

async function fetchBufferToFile(url, outPath) {
  let attempt = 0;
  let lastErr;
  while (attempt < MAX_RETRIES) {
    try {
      await curlOnce(url, outPath, 30);
      return;
    } catch (e) {
      lastErr = e;
      attempt++;
      const isRateLimit = e.httpStatus === 429 || e.httpStatus === 503;
      if (attempt >= MAX_RETRIES) break;
      const wait = isRateLimit ? 2000 * attempt + Math.floor(Math.random() * 1000) : 800 * attempt;
      await sleep(wait);
    }
  }
  throw lastErr || new Error(`Exhausted retries for ${url}`);
}

async function fetchBuffer(url) {
  const tmpPath = resolve(tmpdir(), `lumina-${Date.now()}-${randomBytes(4).toString('hex')}.bin`);
  try {
    await fetchBufferToFile(url, tmpPath);
    return await readFile(tmpPath);
  } finally {
    try {
      await unlink(tmpPath);
    } catch {
      /* ignore */
    }
  }
}

async function fetchText(url) {
  const buf = await fetchBuffer(url);
  return buf.toString('utf-8');
}

async function processCard(deckId, deck, cardId, force) {
  const outPath = resolve(baseOutDir, deckId, `${cardId}.webp`);
  if (!force && (await exists(outPath))) {
    process.stdout.write(`   · ${cardId}: skipped\n`);
    return { cardId, status: 'skipped', size: 0 };
  }
  const url = await deck.resolveSourceUrl(cardId);
  const size = await deck.fetchAndRender(url, outPath);
  process.stdout.write(`   · ${cardId}: ${(size / 1024).toFixed(1)} KB\n`);
  return { cardId, status: 'done', size };
}

async function runWithLimit(tasks, limit) {
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (cursor < tasks.length) {
      const i = cursor++;
      try {
        results[i] = await tasks[i]();
      } catch (e) {
        results[i] = { error: e.message };
      }
    }
  });
  await Promise.all(workers);
  return results;
}

async function downloadDeck(deckId, force) {
  const deck = DECKS[deckId];
  if (!deck) throw new Error(`Unknown deck id: ${deckId}`);

  await ensureDir(resolve(baseOutDir, deckId));
  const cardIds = listAllCardIds();
  const tasks = cardIds.map((id) => () => processCard(deckId, deck, id, force));

  console.log(`\n=== ${deckId} (${deck.label}) ===`);
  console.log(`   ${tasks.length} cards → ${baseOutDir}/${deckId}/  (parallel ${PARALLEL})`);

  const results = await runWithLimit(tasks, PARALLEL);

  let done = 0;
  let skipped = 0;
  let totalSize = 0;
  let failed = 0;
  const failures = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.error) {
      failed++;
      failures.push(`${cardIds[i]}: ${r.error}`);
    } else if (r.status === 'done') {
      done++;
      totalSize += r.size;
    } else {
      skipped++;
    }
  }
  console.log(
    `   ✓ done: ${done}, skipped: ${skipped}, failed: ${failed}, total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`
  );
  if (failures.length) {
    for (const f of failures) console.error(`   ✗ ${f}`);
    throw new Error(`${deckId}: ${failed} downloads failed`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const requested = args.filter((a) => !a.startsWith('--'));

  await ensureDir(baseOutDir);

  const deckIds = requested.length ? requested : Object.keys(DECKS);
  const unknown = deckIds.filter((d) => !(d in DECKS));
  if (unknown.length) {
    console.error(`Unknown decks: ${unknown.join(', ')}`);
    console.error(`Valid: ${Object.keys(DECKS).join(', ')}`);
    process.exit(1);
  }

  console.log(`Target: ${TARGET_WIDTH}×${TARGET_HEIGHT} WebP @ q=${WEBP_QUALITY}`);
  console.log(`Output: ${baseOutDir}`);
  console.log(`Force re-download: ${force}`);

  const start = Date.now();
  for (const id of deckIds) {
    await downloadDeck(id, force);
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nAll done in ${elapsed}s.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
