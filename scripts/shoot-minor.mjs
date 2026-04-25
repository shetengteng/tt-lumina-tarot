#!/usr/bin/env node
import CDP from 'chrome-remote-interface';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const PORT = 9555;
const APP = 'http://localhost:4173';
const OUT = '/tmp/lumina-minor';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new', '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    `--user-data-dir=/tmp/lumina-minor-profile`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);
await new Promise((r) => setTimeout(r, 1500));

const client = await CDP({ port: PORT });
const { Page, Runtime, Emulation } = client;
await Page.enable();
await Runtime.enable();

async function shoot(name, { url, w = 1440, h = 1000, mobile = false, wait = 1500, click = null }) {
  await Emulation.setDeviceMetricsOverride({ width: w, height: h, deviceScaleFactor: 2, mobile });
  await Page.navigate({ url });
  await Page.loadEventFired();
  await new Promise((r) => setTimeout(r, wait));
  if (click) {
    await Runtime.evaluate({
      expression: `(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
        const t = tabs.find(el => el.textContent.includes('${click}'));
        if (t) t.click();
      })()`,
    });
    await new Promise((r) => setTimeout(r, 800));
  }
  const { data } = await Page.captureScreenshot({ format: 'png', captureBeyondViewport: false });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
  console.log(`  ✓ ${name}.png`);
}

console.log('A. Single card details (mystic) × 2 styles:');
const detailCards = ['cups-ace', 'cups-5', 'swords-10', 'wands-7', 'pentacles-king'];
for (const cid of detailCards) {
  for (const s of ['symbol', 'geometric']) {
    await shoot(`A-${cid}-${s}`, { url: `${APP}/?t=mystic&ms=${s}#/library/${cid}` });
  }
}

console.log('\nB. Library page (圣杯 tab) × 3 themes × 2 styles:');
for (const t of ['mystic', 'minimal', 'nature']) {
  for (const s of ['symbol', 'geometric']) {
    await shoot(`B-library-cups-${t}-${s}`, {
      url: `${APP}/?t=${t}&ms=${s}#/library`,
      h: 1100,
      click: '圣杯',
    });
  }
}

console.log('\nC. Settings page (minor style picker):');
await shoot(`C-settings-mystic`, { url: `${APP}/?t=mystic&ms=symbol#/settings`, h: 1400 });
await shoot(`C-settings-nature`, { url: `${APP}/?t=nature&ms=geometric#/settings`, h: 1400 });

await client.close();
chrome.kill();
console.log(`\nDone → ${OUT}`);
