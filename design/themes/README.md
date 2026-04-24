# Lumina Tarot · 主题 Tokens（设计参考 · 备选纯 CSS 路径）

> 日期：2026-04-24  
> 位置：`design/themes/`（作为设计资产归档，与 `design/2026-04-24-02-系统设计.md` § 13 配套）  
> 说明：本目录承载三套主题的**纯 CSS 变量参考实装**，是主路径之外的备选落地方案。

---

## 两条实装路径（必读）

| 路径 | 位置 | 说明 |
|-------|-------|---------|
| **A. Tailwind + shadcn-vue（主路径，v0.4 起）** | `src/assets/css/base.css` + `src/assets/css/themes.css` | 与 shadcn-vue 深度集成，HSL 三元组 + `hsl(var(--token))`；当前 MVP 实装使用此路径 |
| **B. 纯 CSS 变量（本目录 · 备选）** | `design/themes/*.css` + `design/themes/themes.index.ts` | 不依赖 Tailwind 的极简路径，保留作为 token 语义"真源"与迁移参考 |

两条路径的**色值 / 字体 / 圆角语义完全对应**，只是表达方式不同：

- 路径 A：`--primary: 38 47% 58%` + `bg-primary` / `text-primary` 原子类
- 路径 B：`--accent-primary: #C9A961` + 直接读 `var(--accent-primary)`

---

## 目录清单

```
design/themes/
├── README.md                 本文件
├── tokens.base.css           跨主题共用基础 token（间距、字号、动效）
├── theme.mystic.css          主题 A · 神秘暗黑（Dark Mystic）
├── theme.minimal.css         主题 B · 现代极简（Modern Minimalist）
├── theme.nature.css          主题 C · 疗愈自然（Healing Nature）
└── themes.index.ts           TypeScript：主题描述 + 切换工具（Vue Plugin / useTheme）
```

---

## 路径 A（主路径）使用方式

当前 MVP 代码直接消费 `src/assets/css/themes.css`：

```ts
// src/main.ts
import './assets/css/base.css'  // base.css 内部 @import 'themes.css'
```

```vue
<!-- 组件中 -->
<template>
  <Button variant="glow">开始占卜</Button>   <!-- 主题化发光 -->
  <Card class="card-back" />                 <!-- 自动套当前主题牌背 -->
</template>
```

```ts
// 切换主题
import { useSettingsStore } from '@/stores/settings'
const settings = useSettingsStore()
settings.setTheme('minimal')   // 自动 localStorage 持久 + View Transitions
```

---

## 路径 B（备选）使用方式

如需脱离 Tailwind，独立使用本目录的 CSS 变量：

```ts
// 若作为备选路径接入，先把本目录整体拷贝到 src/themes/
import '@/themes/tokens.base.css'
import '@/themes/theme.mystic.css'
import '@/themes/theme.minimal.css'
import '@/themes/theme.nature.css'
import { applyTheme, getStoredTheme } from '@/themes/themes.index'

applyTheme(getStoredTheme())
```

```html
<!-- index.html —— 防 FOUC -->
<script>
  var t = localStorage.getItem('lumina-theme') || 'mystic'
  document.documentElement.dataset.theme = t
</script>
```

```vue
<template>
  <button class="btn-primary">开始占卜</button>
</template>

<style scoped>
.btn-primary {
  background: var(--accent-highlight);
  color: var(--text-inverse);
  border-radius: var(--radius-button);
  padding: var(--space-md) var(--space-xl);
  font-family: var(--font-display);
  transition: box-shadow var(--motion-fast) var(--ease-out-quart);
}
.btn-primary:hover {
  box-shadow: var(--fx-glow);
}
</style>
```

---

## 扩展新主题（两条路径通用的顺序）

### 路径 A
1. 在 `src/assets/css/themes.css` 追加 `html[data-theme='<id>']` 的 HSL 变量块
2. 在 `src/stores/settings.ts` 中扩展 `ThemeId` 联合类型（`src/types/index.ts`）
3. 在 `src/components/layout/ThemePicker.vue` 的 `options` 数组追加条目
4. 如需定制背景，在 `src/components/layout/BackgroundHost.vue` 追加对应 `v-if` 分支

### 路径 B
1. 复制 `theme.mystic.css` 为 `theme.<id>.css`
2. 修改 `:root[data-theme='<id>']` 下的所有 token
3. 在 `themes.index.ts` 中追加 `ThemeDescriptor`
4. 在 `main.ts` 中 `import '@/themes/theme.<id>.css'`
5. 刷新即可

---

## 设计原则（两条路径共享）

1. **业务组件零感知**：组件只读 token，不感知主题名
2. **语义命名**：按用途而非颜色（`--accent-primary` 而非 `--gold`）
3. **移动优先**：所有触控目标 ≥ 44×44pt
4. **无障碍**：所有主题对比度 ≥ WCAG AA
5. **性能**：仅变量切换，无需重新加载；配合 View Transitions API

---

## 对应文档

- `../2026-04-24-01-可行性分析.md`
- `../2026-04-24-02-系统设计.md` § 2 / § 12 / § 13
- `../2026-04-24-03-原型设计.md` § 15–20
- `../html/2026-04-24-04-原型.html`（可交互 HTML 原型）
