# Lumina Tarot

> 在黑暗中点亮内心微光 —— 一款**离线运行**的塔罗牌占卜 Web App，强调仪式感与沉浸体验。

Vue 3 · Vite · TypeScript · Tailwind CSS · shadcn-vue · Pinia · Vue Router · vue-i18n · Dexie (IndexedDB) · Workbox PWA · VueUse Motion · GSAP · tsparticles · Three.js · Fuse.js

---

## 特性

- **纯前端、离线可用**：可作为 PWA 安装；用户数据全部留在本机（IndexedDB via Dexie + localStorage 偏好）。
- **完整 78 张塔罗牌**：22 张大阿卡那 + 56 张小阿卡那（权杖 / 圣杯 / 宝剑 / 钱币）。
- **双语界面**：简体中文 / English，可在设置中实时切换；卡牌文案、关键词与解读均含双语。
- **三套可切换主题**：`神秘暗黑` / `现代极简` / `疗愈自然`，通过 shadcn-vue HSL 变量 + View Transitions 平滑切换。
- **三种卡面风格**：站内 SVG 极简版 / 经典韦特（Rider–Waite–Smith）/ 水彩重绘（Aquatic Tarot），可自由切换。
- **五种牌背图案 + 两种小阿卡那插画风格**：卡面为「极简」时可自由组合，兼顾仪式感与清爽。
- **三档动画强度**：`关闭 / 轻量 / 完整`，覆盖粒子背景、洗牌动画与界面过渡，适配低端机与晕动症用户。
- **完整占卜闭环**：选牌阵 → 输入问题 → 长按洗牌 → 翻牌 → AI 风格解读 → 保存历史。
- **首页今日仪式**：`今日一牌` 即点即翻 + 三大领域（事业 / 情感 / 自我）日运牌，每日一组、缓存到当地。
- **图鉴 & 历史**：78 张牌可全文搜索（牌名 / 英文 / 关键词 / 花色）；历史 100 条本地保留，支持 JSON 导出与分享。
- **移动优先**：核心流程均有移动端友好布局，触控目标 ≥ 44×44pt；通过 Lighthouse 移动端基线。

## 项目结构

```
tt-lumina-tarot/
├── design/                        # 设计与可行性文档（按日期归档）
│   ├── 2026-04-24-01-可行性分析.md
│   ├── 2026-04-24-02-系统设计.md
│   ├── 2026-04-24-03-原型设计.md
│   ├── 2026-04-24-05-实施清单-98%.md   # MVP 完工清单（文件名带进度，按全文 [x]/[ ] 自动统计）
│   ├── 2026-04-25-01-tarot-prompts.md  # 卡牌文案 / AI 解读 prompt
│   ├── html/                      # 可交互 HTML 原型
│   └── themes/                    # 纯 CSS 变量路径（备选参考）
├── public/                        # 静态资源
│   └── decks/                     # 卡面图源（rws / aquatic）+ 牌背
├── raw-assets/                    # 本地 AI→SVG 中间产物（不入库，见 .gitignore）
├── release/                       # 本地发布/备份归档（不入库，见 .gitignore）
├── scripts/                       # 一次性工具脚本
│   ├── download-decks.mjs         # 拉取并归一化卡面资源
│   ├── generate-pwa-icons.mjs     # 生成 PWA 图标
│   ├── verify-pwa.mjs             # 校验 manifest / SW / 图标
│   └── make-{rws,aquatic}-back.mjs# 生成对应主题牌背
├── src/
│   ├── assets/css/                # base.css + themes.css（HSL token）
│   ├── components/
│   │   ├── ui/                    # shadcn-vue 组件（button/card/input/…）
│   │   ├── layout/                # AppHeader / BackgroundHost / ThemePicker / BottomNav
│   │   └── tarot/                 # TarotCard / CardArtwork / CardBackPattern / MinorIllustration
│   ├── composables/               # useCardI18n / useTarotI18n / useShare / ...
│   ├── data/                      # 78 张牌定义 + 牌阵 + 心情
│   ├── i18n/                      # vue-i18n 入口
│   │   └── locales/               # en-US / zh-CN（通用）+ cards/（牌文案）
│   ├── lib/                       # utils / db (Dexie) / tarot（抽牌算法）/ share
│   ├── router/                    # Hash 路由
│   ├── stores/                    # settings / reading（Pinia）
│   ├── types/
│   ├── views/                     # Home / Spread / Question / Shuffle / Reveal / Reading / Library / CardDetail / History / Settings
│   ├── App.vue
│   └── main.ts
├── index.html
├── tailwind.config.ts             # 自定义 spacing（xs/sm/md/lg/xl/2xl）+ HSL 变量
├── components.json                # shadcn-vue 配置
├── vite.config.ts                 # 含 vite-plugin-pwa（Workbox）
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── package.json
```

## 快速开始

```bash
pnpm install

pnpm dev
# → http://localhost:5173

pnpm build
pnpm preview
```

> 首次加载会从 Google Fonts 拉取三种字体。完全离线场景下可将字体文件本地化（详见 `design/2026-04-24-02-系统设计.md` § 12）。

## 主题

| 主题 ID | 名称 | 氛围 | 字体 | 圆角 |
|-|-|-|-|-|
| `mystic` | 神秘暗黑 | 深邃仪式感 · 午夜蓝 + 玫瑰金 | Cinzel / Cormorant | 锐利 `0.25rem` |
| `minimal` | 现代极简 | 留白清澈 · 米色 + 深灰 | Inter / Poppins | 柔和 `1rem` |
| `nature` | 疗愈自然 | 温暖包容 · 陶土 + 亚麻 | Fraunces / Caveat | 圆润 `1.5rem` |

切换方式：顶栏 `ThemePicker` 组件、`设置` 页面，或键盘 `T` 键（HTML 原型）。

## Tailwind Spacing Token（已统一）

```ts
spacing: {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '48px',
  '2xl': '96px',
}
```

## 脚本

| 命令 | 说明 |
|-|-|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | `vue-tsc -b` + `vite build`（含 Workbox PWA 产物） |
| `pnpm preview` | 预览生产构建（含 Service Worker） |
| `pnpm type-check` | 仅类型检查 |
| `pnpm icons:gen` | 生成 PWA 各尺寸图标 |
| `pnpm verify:pwa` | 校验 manifest / SW / 图标完整性 |
| `pnpm decks:download` | 下载并归一化卡面资源到 `public/decks/` |

## 部署到 GitHub

本项目用 `createWebHashHistory` 路由 + 纯前端构建，**天然适配 GitHub Pages**（不需要 404 fallback，URL 形如 `…/#/library`）。下面给出从"零仓库"到"线上可访问"的完整流程。

### 1. 推送源码到 GitHub

```bash
# 在 GitHub 上创建空仓库（不要勾选 README / .gitignore / LICENSE，避免冲突）
git init                                           # 已经是 git 仓库可跳过
git remote add origin git@github.com:<user>/tt-lumina-tarot.git
git branch -M main
git push -u origin main
```

> `release/` 与 `raw-assets/` 已在 `.gitignore` 中，不会被推送（包含可能受版权保护的本地资源）。

### 2. 部署到 GitHub Pages（项目页 · 子路径）

GitHub Pages 项目页的 URL 形如 `https://<user>.github.io/tt-lumina-tarot/`，需要在 **三处** 把基础路径从 `/` 改为 `/tt-lumina-tarot/`：

**① `vite.config.ts` — 加 `base`：**

```ts
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/tt-lumina-tarot/' : '/',
  // ...其余配置不变
});
```

**② 同文件 `VitePWA({ manifest })` — 同步 `id` / `start_url` / `scope` 与 icon 路径：**

```ts
manifest: {
  id: '/tt-lumina-tarot/',
  start_url: '/tt-lumina-tarot/',
  scope: '/tt-lumina-tarot/',
  icons: [
    { src: 'img/icon-192.png',          sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'img/icon-512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'img/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: 'pwa-icon.svg',              sizes: 'any',     type: 'image/svg+xml', purpose: 'any' },
  ],
  // shortcuts.url 也要改成 './' 或 '/tt-lumina-tarot/...'
},
workbox: {
  navigateFallback: '/tt-lumina-tarot/index.html',
  // 其余 workbox 选项不变
},
```

> 仅在用 `GITHUB_PAGES=true` 构建时生效，本地 `pnpm dev` / 默认 `pnpm build` 仍然走根路径，互不干扰。

**③ 新增 `.github/workflows/deploy.yml` — Actions 自动构建并发布：**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          GITHUB_PAGES: 'true'
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3. 在 GitHub 仓库开启 Pages

1. 进入仓库 **Settings → Pages**
2. **Source** 选 **GitHub Actions**（不要选 "Deploy from a branch"）
3. 推送任何到 `main` 的提交即触发构建；首次部署完成后访问：

```
https://<user>.github.io/tt-lumina-tarot/
```

### 4. 部署后自检清单

- [ ] 首页能正常加载，`<head>` 中的资源 URL 都带 `/tt-lumina-tarot/` 前缀
- [ ] 通过浏览器 DevTools → Application → Manifest 检查 PWA 可安装
- [ ] 离线模式下刷新仍能进入 `#/library`、`#/history`
- [ ] 卡面图（`/decks/rws/*.webp`、`/decks/aquatic/*.webp`）加载成功
- [ ] Lighthouse 移动端 ≥ 90 分

> 若使用 **自定义域名 / username.github.io 根仓库**，把上述 `'/tt-lumina-tarot/'` 全部改回 `'/'`、删掉 `GITHUB_PAGES` 判断即可。

## 已实装范围

当前版本（v0.1）已包含：

- **完整牌库**：78 张（22 大阿 + 56 小阿），大阿/小阿都含双语关键词与正/逆位的核心 / 情感 / 事业 / 建议四字段。
- **牌阵**：`单张指引` / `三牌时间线` / `十字牌阵` / `凯尔特精简` 等。
- **占卜流程**：选牌阵 → 输入问题 → 长按洗牌（`pointer capture` 抗抖动）→ 翻牌 → 解读 → 写入历史。
- **首页 Daily**：`今日一牌` 即点即翻；事业 / 情感 / 自我三领域日运卡每日生成并缓存到本地。
- **图鉴**：78 张牌全文搜索（牌名 / 英文 / 关键词 / 花色），单卡详情含正/逆位四字段双语版。
- **历史**：100 条本地存储，可分享、可 JSON 导出、可清空。
- **主题与外观**：3 套色彩主题 × 3 套卡面 × 5 种牌背 × 2 种小阿插画 × 3 档动画级别，组合出从极简到沉浸的视觉光谱；切换走 View Transitions。
- **持久化**：偏好走 `localStorage`、占卜历史与 daily draw 走 IndexedDB（Dexie）。
- **离线**：通过 `vite-plugin-pwa` + Workbox 注册 Service Worker，可作为 PWA 安装并离线运行。

后续迭代方向参见 `design/2026-04-24-01-可行性分析.md` § 迭代路径。

## 致谢

**框架与开源工具**

- [shadcn-vue](https://www.shadcn-vue.com/) · [radix-vue](https://www.radix-vue.com/)
- [VueUse](https://vueuse.org/) · [@vueuse/motion](https://motion.vueuse.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Dexie.js](https://dexie.org/) · [Fuse.js](https://www.fusejs.io/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) · [Workbox](https://developer.chrome.com/docs/workbox/)
- [GSAP](https://gsap.com/) · [tsparticles](https://particles.js.org/) · [three.js](https://threejs.org/)

**牌面资源**

- **经典韦特（Rider–Waite–Smith）**：原作 Pamela Colman Smith / Arthur Edward Waite，1909 年出版，**已进入公有领域（Public Domain）**。
- **水彩重绘（Aquatic Tarot）**：由 [Andreas Schröter](https://www.aquatictarot.de/) 创作，授权为 [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/)。**仅限个人非商业用途**；如需商业使用，请改用「极简」或「经典韦特」主题，并直接联系原作者。
- **极简卡面**：本项目内置 SVG，与本仓库同许可。

## License

本仓库源代码采用 MIT License；详见 `LICENSE`（如有）。

牌面图源遵循各自上游协议：
- `public/decks/rws/*` — Public Domain
- `public/decks/aquatic/*` — © Andreas Schröter, CC BY-NC-SA 3.0（仅限个人非商业使用）

---

Made with ✦ for quiet inner moments.
