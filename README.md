# Lumina Tarot

> 在黑暗中点亮内心微光 —— 一款**离线运行**的塔罗牌占卜 Web App，强调仪式感与沉浸体验。

Vue 3 · Vite · TypeScript · Tailwind CSS · shadcn-vue · Pinia · Vue Router · VueUse Motion

---

## 特性

- **纯前端、离线可用**：数据只存于用户本地（localStorage + Web Crypto API）。
- **三套可切换主题**：`神秘暗黑` / `现代极简` / `疗愈自然`，通过 shadcn-vue HSL 变量 + View Transitions 平滑切换。
- **移动优先**：核心流程均有移动端友好布局，触控目标 ≥ 44×44pt。
- **完整占卜闭环**：选牌阵 → 输入问题 → 洗牌 → 翻牌 → 解读 → 保存历史。
- **大阿卡那图鉴**：22 张卡牌的关键词、正/逆位、情感/事业/建议。
- **数据可导出**：JSON 格式一键备份。

## 项目结构

```
tt-lumina-tarot/
├── design/                        # 设计文档
│   ├── 2026-04-24-01-可行性分析.md
│   ├── 2026-04-24-02-系统设计.md
│   ├── 2026-04-24-03-原型设计.md
│   ├── 2026-04-24-05-实施清单-98%.md  # MVP 完工清单（文件名带进度，按全文 [x]/[ ] 自动统计）
│   ├── html/                      # 可交互 HTML 原型
│   │   └── 2026-04-24-04-原型.html
│   └── themes/                    # 纯 CSS 变量路径（备选参考）
├── public/                        # 静态资源
├── src/
│   ├── assets/css/                # base.css + themes.css（HSL token）
│   ├── components/
│   │   ├── ui/                    # shadcn-vue 组件（button/card/input/…）
│   │   ├── layout/                # AppHeader / BackgroundHost / ThemePicker
│   │   └── tarot/                 # TarotCard
│   ├── data/                      # 22 张大阿卡那 + 4 种牌阵 + 心情
│   ├── lib/                       # utils / tarot（抽牌算法）
│   ├── router/                    # Hash 路由
│   ├── stores/                    # settings / reading
│   ├── types/
│   ├── views/                     # Home / Spread / Question / Shuffle / Reveal / Reading / Library / CardDetail / History / Settings
│   ├── App.vue
│   └── main.ts
├── index.html
├── tailwind.config.ts             # 自定义 spacing（xs/sm/md/lg/xl/2xl）+ HSL 变量
├── components.json                # shadcn-vue 配置
├── vite.config.ts
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
| `pnpm build` | `vue-tsc --build` + `vite build` |
| `pnpm preview` | 预览生产构建 |
| `pnpm type-check` | 仅类型检查 |

## MVP 范围

当前 MVP 含：
- 22 张大阿卡那（Major Arcana）
- 4 种牌阵：`单张指引` / `三牌时间线` / `十字牌阵` / `凯尔特精简`
- 3 套主题 + View Transitions
- CSS 原生过渡动画（未引入 GSAP / tsparticles / Three.js）
- localStorage 持久化（设置 + 占卜历史，最多 100 条）

后续迭代方向参见 `design/2026-04-24-01-可行性分析.md` § 迭代路径。

## 致谢

- [shadcn-vue](https://www.shadcn-vue.com/)
- [radix-vue](https://www.radix-vue.com/)
- [VueUse](https://vueuse.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ✦ for quiet inner moments.
