#!/usr/bin/env node
/**
 * Aliyun EMAS Serverless 静态托管 · 一键部署脚本
 *
 * 把 dist/ 内的产物上传到 EMAS Static Hosting 的 /tarot 目录下，
 * 适配 EMAS 控制台的 4 个限制：
 *   1) 不解压 ZIP（它本质是 OSS）
 *   2) 单次上传 ≤ 99 个文件
 *   3) 不保留目录结构（要先手工建子目录）
 *   4) ErrorDocument 不接受子路径（本项目用 hash 路由，无需 fallback）
 *
 * 用法：
 *   pnpm deploy:emas                 # 一键部署（先 build，再上传）
 *   pnpm deploy:emas --no-build      # 跳过构建，直接用现有 dist
 *   pnpm deploy:emas --plan          # 仅打印部署计划（dry-run，不启动浏览器）
 *   PHASE=folders pnpm deploy:emas   # 仅创建文件夹
 *   PHASE=upload  pnpm deploy:emas   # 仅上传
 *   START_STEP=2 START_BATCH=1 pnpm deploy:emas    # 从指定断点恢复
 *   HEADLESS=1    pnpm deploy:emas   # 无头模式（首次登录请勿用）
 *
 * 第一次运行：
 *   会启动一个独立的 Chromium，自动跳转到 EMAS 控制台。
 *   请在弹出的浏览器里完成阿里云 SSO 登录、并进入 ProductId=3916496 的「静态托管」页面。
 *   登录态会缓存到 ~/.cache/lumina-tarot-emas/，下次免登录。
 */

import { spawn } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const CONFIG = {
  EMAS_URL:
    'https://emas.console.aliyun.com/emasService/platformService/serverless/app/static?ProductId=3916496',
  PUBLIC_URL: 'https://static-mp-7cc0e56a-b5a1-4347-8a40-f3868127df92.next.bspapp.com/tarot/',
  USER_DATA_DIR: join(homedir(), '.cache', 'lumina-tarot-emas'),
  DIST: join(REPO_ROOT, 'dist'),
  ROOT_LABEL: '全部文件',
  TARGET: 'tarot',
  BATCH_SIZE: 50,
  FOLDERS: ['img', 'assets', 'decks', 'decks/rws', 'decks/aquatic'],
};

const ts = () => new Date().toISOString().slice(11, 19);
const log = (msg) => console.log(`[${ts()}] ${msg}`);
const warn = (msg) => console.warn(`[${ts()}] ⚠ ${msg}`);

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function listFiles(rel) {
  const dir = rel ? join(CONFIG.DIST, rel) : CONFIG.DIST;
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((n) => join(dir, n))
    .filter((p) => statSync(p).isFile());
}

function buildPlan() {
  return [
    { breadcrumb: [CONFIG.ROOT_LABEL, CONFIG.TARGET], files: listFiles('') },
    { breadcrumb: [CONFIG.ROOT_LABEL, CONFIG.TARGET, 'assets'], files: listFiles('assets') },
    { breadcrumb: [CONFIG.ROOT_LABEL, CONFIG.TARGET, 'img'], files: listFiles('img') },
    { breadcrumb: [CONFIG.ROOT_LABEL, CONFIG.TARGET, 'decks', 'rws'], files: listFiles('decks/rws') },
    { breadcrumb: [CONFIG.ROOT_LABEL, CONFIG.TARGET, 'decks', 'aquatic'], files: listFiles('decks/aquatic') },
  ];
}

function runPnpmBuild() {
  return new Promise((res, rej) => {
    log('🔨 EMAS_DEPLOY=true pnpm build');
    const child = spawn('pnpm', ['build'], {
      cwd: REPO_ROOT,
      env: { ...process.env, EMAS_DEPLOY: 'true' },
      stdio: 'inherit',
    });
    child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`pnpm build exited ${code}`))));
  });
}

async function loadPlaywright() {
  try {
    return await import('playwright-core');
  } catch (e) {
    console.error('\n❌ 找不到 playwright-core。请先安装：');
    console.error('   pnpm add -D playwright-core');
    console.error('   pnpm exec playwright install chromium\n');
    throw e;
  }
}

async function ensureBrowser() {
  const { chromium } = await loadPlaywright();
  await mkdir(CONFIG.USER_DATA_DIR, { recursive: true });
  const headless = process.env.HEADLESS === '1';
  log(`启动 Chromium (headless=${headless})  userDataDir=${CONFIG.USER_DATA_DIR}`);
  let ctx;
  try {
    ctx = await chromium.launchPersistentContext(CONFIG.USER_DATA_DIR, {
      headless,
      viewport: { width: 1440, height: 900 },
      args: ['--disable-blink-features=AutomationControlled'],
    });
  } catch (e) {
    if (String(e?.message ?? e).includes('Executable doesn')) {
      console.error('\n❌ 缺少 Chromium 可执行文件。请运行：');
      console.error('   pnpm exec playwright install chromium\n');
    }
    throw e;
  }
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  return { ctx, page };
}

async function gotoConsole(page) {
  if (!page.url().includes('platformService/serverless')) {
    log(`跳转到控制台 ${CONFIG.EMAS_URL}`);
    await page.goto(CONFIG.EMAS_URL, { waitUntil: 'domcontentloaded' });
  }
  log('等待登录态... (若浏览器弹窗显示登录页，请在窗口中完成 Aliyun SSO 登录)');
  for (let i = 0; i < 60; i++) {
    if (page.url().includes('platformService/serverless')) break;
    await page.waitForTimeout(2000);
  }
  if (!page.url().includes('platformService/serverless')) {
    throw new Error('120s 内未检测到 EMAS 控制台页面，请手动登录后再次运行此脚本。');
  }
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  if (!page.url().includes('serverless/app/static')) {
    log('当前在 EMAS Serverless 概览页，主动跳转「静态网站托管」');
    await page.getByRole('menuitem', { name: '静态网站托管' }).click({ timeout: 30_000 });
    for (let i = 0; i < 30; i++) {
      if (page.url().includes('serverless/app/static')) break;
      await page.waitForTimeout(1000);
    }
    if (!page.url().includes('serverless/app/static')) {
      throw new Error('点击「静态网站托管」后 30s 内未跳转到 /app/static');
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
  }
}

async function getEmasFrame(page) {
  for (let i = 0; i < 30; i++) {
    const f = page
      .frames()
      .find(
        (fr) =>
          fr.url().includes('mpserverlessnew.console.aliyun.com') ||
          fr.url().includes('mpserverless') ||
          (fr.name() === '' && fr.parentFrame() === page.mainFrame() && fr.url().includes('app/static'))
      );
    if (f) return f;
    await page.waitForTimeout(1000);
  }
  warn('未找到 EMAS iframe，回退到主 frame');
  return page.mainFrame();
}

async function gotoBreadcrumb(page, frame, crumbs) {
  log(`  导航 -> ${crumbs.join(' / ')}`);
  const bc = frame.getByRole('navigation', { name: 'Breadcrumb' });
  await bc.waitFor({ state: 'visible', timeout: 30_000 });
  const root = bc.getByText(CONFIG.ROOT_LABEL, { exact: true });
  if ((await root.count()) > 0) {
    await root.first().click({ timeout: 30_000 });
    await page.waitForTimeout(800);
  }
  for (let i = 1; i < crumbs.length; i++) {
    const name = crumbs[i];
    const link = frame.getByRole('row').getByText(`${name}/`, { exact: true }).first();
    await link.waitFor({ state: 'visible', timeout: 30_000 });
    await link.click({ timeout: 30_000 });
    await page.waitForTimeout(900);
  }
}

async function ensureFolder(page, frame, parentCrumbs, name) {
  const fullPath = [...parentCrumbs.slice(1), name].join('/');
  log(`📁 ensure ${fullPath}`);
  await gotoBreadcrumb(page, frame, parentCrumbs);
  await page.waitForTimeout(600);
  const exists =
    (await frame.getByRole('row').getByText(`${name}/`, { exact: true }).count()) > 0;
  if (exists) {
    log(`   ↳ already exists, skip`);
    return;
  }
  await frame.getByRole('button', { name: '新建文件夹' }).click({ timeout: 30_000 });
  await page.waitForTimeout(800);
  const dlg = frame.locator('[role=dialog]', { hasText: '新建文件夹' });
  await dlg.locator('input[type=text], textarea, input').first().fill(name);
  await page.waitForTimeout(400);
  const ok = dlg.getByRole('button', { name: '确定' });
  if (await ok.isDisabled().catch(() => false)) {
    log(`   ↳ 确定按钮 disabled (可能已存在)，取消`);
    await dlg.getByRole('button', { name: '取消' }).click();
  } else {
    await ok.click();
  }
  await page.waitForTimeout(1500);
}

async function waitUploadDone(page, frame, expected) {
  const deadline = Date.now() + Math.max(180_000, expected * 4000);
  while (Date.now() < deadline) {
    const inFlight = await frame.getByText('上传中', { exact: false }).count();
    const errCount = await frame.getByText('上传失败', { exact: true }).count();
    const okCount = await frame.getByText('上传成功', { exact: true }).count();
    if (inFlight === 0 && okCount + errCount >= expected) {
      log(`     ✓ ${okCount} 成功 / ${errCount} 失败`);
      if (errCount > 0) warn(`本批有 ${errCount} 个文件上传失败`);
      return { ok: okCount, err: errCount };
    }
    await page.waitForTimeout(2500);
  }
  warn('等待上传完成超时');
  return { ok: 0, err: expected, timeout: true };
}

async function dismissOverwriteDialog(page, frame) {
  const overwrite = frame.getByRole('button', { name: /覆盖|确定/ });
  if ((await overwrite.count()) > 0) {
    const visible = await overwrite.first().isVisible().catch(() => false);
    if (visible) {
      log('   ↳ 检测到覆盖确认对话框，自动确认覆盖');
      await overwrite.first().click().catch(() => {});
      await page.waitForTimeout(1200);
      return true;
    }
  }
  return false;
}

async function uploadGroup(page, frame, crumbs, group, label) {
  await gotoBreadcrumb(page, frame, crumbs);
  await page.waitForTimeout(800);
  await frame.getByRole('button', { name: '上传文件' }).click({ timeout: 30_000 });
  await page.waitForTimeout(1200);
  const fi = frame.locator('input[type=file]').first();
  await fi.waitFor({ state: 'attached', timeout: 60_000 });
  await fi.setInputFiles(group, { timeout: 90_000 });
  await page.waitForTimeout(2000);
  await dismissOverwriteDialog(page, frame);
  await waitUploadDone(page, frame, group.length);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(1000);
  await frame.getByRole('button', { name: '刷新' }).click().catch(() => {});
  await page.waitForTimeout(1500);
}

async function uploadStep(page, frame, step, startBatch, label) {
  if (step.files.length === 0) {
    log(`   ↳ 0 文件，跳过`);
    return;
  }
  const groups = chunk(step.files, CONFIG.BATCH_SIZE);
  for (let g = startBatch; g < groups.length; g++) {
    log(`  ⬆ ${label} 批次 ${g + 1}/${groups.length} (${groups[g].length} 文件)`);
    await uploadGroup(page, frame, step.breadcrumb, groups[g], label);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const phase = process.env.PHASE || 'all';
  const skipBuild = args.has('--no-build');
  const planOnly = args.has('--plan');

  if (planOnly) {
    log('🔍 --plan 模式：仅打印部署计划，不构建、不启动浏览器');
  } else if (!skipBuild) {
    await runPnpmBuild();
  } else {
    log('⏭  跳过构建（--no-build）');
  }
  if (!existsSync(CONFIG.DIST)) {
    throw new Error(`dist 目录不存在：${CONFIG.DIST}`);
  }

  const PLAN = buildPlan();
  const totalFiles = PLAN.reduce((s, p) => s + p.files.length, 0);
  log(`本次将上传 ${totalFiles} 个文件，分 ${PLAN.length} 步：`);
  for (const [i, step] of PLAN.entries()) {
    const batches = Math.max(1, Math.ceil(step.files.length / CONFIG.BATCH_SIZE));
    log(`  [${i}] ${step.breadcrumb.slice(1).join('/') || '/'} → ${step.files.length} 文件 (${batches} 批)`);
  }
  log(`📁 需要确保的目录：${CONFIG.FOLDERS.map((f) => `${CONFIG.TARGET}/${f}/`).join(', ')}`);
  if (planOnly) {
    log('✅ --plan 模式结束');
    return;
  }

  const { ctx, page } = await ensureBrowser();
  try {
    await gotoConsole(page);
    const frame = await getEmasFrame(page);

    if (phase === 'folders' || phase === 'all') {
      log('\n=== Step 1/2 · 创建必要文件夹 ===');
      for (const folder of CONFIG.FOLDERS) {
        const parts = folder.split('/');
        const parent = [CONFIG.ROOT_LABEL, CONFIG.TARGET, ...parts.slice(0, -1)];
        const last = parts[parts.length - 1];
        await ensureFolder(page, frame, parent, last);
      }
    }

    if (phase === 'upload' || phase === 'all') {
      log('\n=== Step 2/2 · 批量上传 ===');
      const startStep = parseInt(process.env.START_STEP || '0', 10);
      const startBatch = parseInt(process.env.START_BATCH || '0', 10);
      for (let s = startStep; s < PLAN.length; s++) {
        const step = PLAN[s];
        const sb = s === startStep ? startBatch : 0;
        const label = step.breadcrumb.slice(1).join('/');
        log(`\n## [${s}] ${label} (${step.files.length} 文件) 起始批次=${sb}`);
        await uploadStep(page, frame, step, sb, label);
      }
    }

    log(`\n✅ 部署完成！请访问验证：${CONFIG.PUBLIC_URL}`);
    log('   自检：①首页加载  ②Library 78 张牌  ③Settings 切换 RWS 牌面  ④F5 刷新 hash 路由');
  } finally {
    if (process.env.KEEP_OPEN === '1') {
      log('KEEP_OPEN=1 → 浏览器保持打开');
    } else {
      await ctx.close();
    }
  }
}

main().catch((e) => {
  console.error('\n❌ 部署失败:', e);
  console.error('💡 可以用环境变量从断点恢复，例如：');
  console.error('   START_STEP=3 START_BATCH=2 PHASE=upload pnpm deploy:emas --no-build');
  process.exit(1);
});
