#!/usr/bin/env node
// Verify PWA: manifest fetch, SW registration, precache, offline-readiness, screenshots.

import CDP from 'chrome-remote-interface';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { request } from 'node:http';

const PORT_DBG = 9444;
const PORT_APP = 4173;
const URL_BASE = `http://localhost:${PORT_APP}`;
const OUT_DIR = '/tmp/lumina-pwa';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(OUT_DIR, { recursive: true });

function http(path) {
  return new Promise((res, rej) => {
    const req = request(`${URL_BASE}${path}`, (r) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => res({ status: r.statusCode, headers: r.headers, body: Buffer.concat(chunks).toString('utf-8') }));
    });
    req.on('error', rej);
    req.end();
  });
}

async function checkStatic() {
  console.log('\n[1/4] Static asset checks');
  const checks = [
    '/manifest.webmanifest',
    '/sw.js',
    '/registerSW.js',
    '/img/icon-192.png',
    '/img/icon-512.png',
    '/img/icon-512-maskable.png',
    '/img/apple-touch-icon-180.png',
    '/pwa-icon.svg',
    '/pwa-icon-maskable.svg',
    '/favicon.svg',
  ];
  for (const path of checks) {
    const r = await http(path);
    const ok = r.status === 200;
    console.log(`  ${ok ? '✓' : '✗'} ${path.padEnd(40)} ${r.status}  ${(r.headers['content-type'] || '').split(';')[0]}`);
    if (!ok) throw new Error(`Asset ${path} failed: ${r.status}`);
  }

  console.log('\n[1.1] Manifest content:');
  const m = await http('/manifest.webmanifest');
  const manifest = JSON.parse(m.body);
  console.log(`  name        : ${manifest.name}`);
  console.log(`  short_name  : ${manifest.short_name}`);
  console.log(`  display     : ${manifest.display}`);
  console.log(`  theme_color : ${manifest.theme_color}`);
  console.log(`  start_url   : ${manifest.start_url}`);
  console.log(`  icons       : ${manifest.icons.length} (${manifest.icons.map((i) => i.sizes).join(', ')})`);
  console.log(`  shortcuts   : ${manifest.shortcuts.length}`);

  console.log('\n[1.2] index.html PWA tags:');
  const idx = await http('/');
  const html = idx.body;
  const checksHtml = [
    ['<link rel="manifest"', 'manifest link'],
    ['/registerSW.js', 'SW register script'],
    ['apple-touch-icon', 'apple-touch-icon'],
    ['apple-mobile-web-app-capable', 'apple-mobile-web-app-capable'],
    ['theme-color', 'theme-color meta'],
  ];
  for (const [needle, label] of checksHtml) {
    const found = html.includes(needle);
    console.log(`  ${found ? '✓' : '✗'} ${label}`);
    if (!found) throw new Error(`Missing ${label}`);
  }
}

async function withChrome(fn) {
  const profile = '/tmp/lumina-pwa-profile';
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${PORT_DBG}`,
      '--no-first-run',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  await new Promise((r) => setTimeout(r, 1500));
  let client;
  try {
    client = await CDP({ port: PORT_DBG });
    return await fn(client);
  } finally {
    if (client) await client.close().catch(() => {});
    chrome.kill();
  }
}

async function checkBrowser() {
  console.log('\n[2/4] Headless browser: SW registration + precache');

  await withChrome(async (client) => {
    const { Page, Runtime, Network, ServiceWorker, Emulation } = client;
    await Page.enable();
    await Runtime.enable();
    await Network.enable();
    await ServiceWorker.enable();

    await Emulation.setDeviceMetricsOverride({ width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
    await Page.navigate({ url: `${URL_BASE}/?t=mystic#/` });
    await Page.loadEventFired();

    console.log('  ⏳ Waiting for SW + precache (5s)...');
    await new Promise((r) => setTimeout(r, 5000));

    const swStatus = await Runtime.evaluate({
      expression: `(async () => {
        if (!('serviceWorker' in navigator)) return { supported: false };
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return { supported: true, registered: false };
        const sw = reg.active || reg.installing || reg.waiting;
        return {
          supported: true,
          registered: true,
          scope: reg.scope,
          state: sw?.state,
          scriptURL: sw?.scriptURL,
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('  SW registration:', JSON.stringify(swStatus.result.value, null, 2));
    if (!swStatus.result.value.registered) throw new Error('SW not registered');

    const cacheStatus = await Runtime.evaluate({
      expression: `(async () => {
        const names = await caches.keys();
        const result = {};
        for (const n of names) {
          const c = await caches.open(n);
          const keys = await c.keys();
          result[n] = keys.length;
        }
        return result;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('  Cache Storage:', JSON.stringify(cacheStatus.result.value, null, 2));
    const totalCached = Object.values(cacheStatus.result.value).reduce((a, b) => a + b, 0);
    if (totalCached < 10) throw new Error(`Only ${totalCached} entries cached, expected >=10 from precache`);

    const installCheck = await Runtime.evaluate({
      expression: `(async () => {
        const m = document.querySelector('link[rel="manifest"]');
        if (!m) return { ok: false, reason: 'no manifest link' };
        const r = await fetch(m.href);
        const j = await r.json();
        return { ok: true, name: j.name, icons: j.icons.length };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('  Manifest fetched in browser:', JSON.stringify(installCheck.result.value, null, 2));

    console.log('\n[3/4] Online screenshot');
    await new Promise((r) => setTimeout(r, 800));
    const { data: shot1 } = await Page.captureScreenshot({ format: 'png', captureBeyondViewport: false });
    writeFileSync(`${OUT_DIR}/01-online.png`, Buffer.from(shot1, 'base64'));
    console.log('  ✓ 01-online.png');

    console.log('\n[4/4] Offline mode (Network.emulateNetworkConditions offline=true)');
    await Network.emulateNetworkConditions({ offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await Page.reload({ ignoreCache: false });
    await Page.loadEventFired();
    await new Promise((r) => setTimeout(r, 1500));
    const offlineCheck = await Runtime.evaluate({
      expression: `(() => ({
        title: document.title,
        bodyHasContent: document.body.innerText.length > 100,
        appMounted: !!document.querySelector('#app').children.length,
      }))()`,
      returnByValue: true,
    });
    console.log('  Offline page state:', JSON.stringify(offlineCheck.result.value, null, 2));
    const { data: shot2 } = await Page.captureScreenshot({ format: 'png', captureBeyondViewport: false });
    writeFileSync(`${OUT_DIR}/02-offline.png`, Buffer.from(shot2, 'base64'));
    console.log('  ✓ 02-offline.png');

    if (!offlineCheck.result.value.appMounted) throw new Error('App did not mount in offline mode');

    console.log('\n[4.1] Offline navigation to /library');
    await Page.navigate({ url: `${URL_BASE}/?t=mystic#/library` });
    await new Promise((r) => setTimeout(r, 1500));
    const { data: shot3 } = await Page.captureScreenshot({ format: 'png', captureBeyondViewport: false });
    writeFileSync(`${OUT_DIR}/03-offline-library.png`, Buffer.from(shot3, 'base64'));
    console.log('  ✓ 03-offline-library.png');

    console.log('\n[4.2] Mobile screenshots (375x812, online)');
    await Network.emulateNetworkConditions({ offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await Emulation.setDeviceMetricsOverride({ width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await Page.navigate({ url: `${URL_BASE}/?t=mystic#/` });
    await Page.loadEventFired();
    await new Promise((r) => setTimeout(r, 1500));
    const { data: shot4 } = await Page.captureScreenshot({ format: 'png', captureBeyondViewport: false });
    writeFileSync(`${OUT_DIR}/04-mobile-mystic.png`, Buffer.from(shot4, 'base64'));
    console.log('  ✓ 04-mobile-mystic.png');
  });
}

async function main() {
  await checkStatic();
  await checkBrowser();
  console.log(`\n✅ All PWA checks passed. Screenshots → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error('\n❌ FAIL:', err.message);
  console.error(err.stack);
  process.exit(1);
});
