/**
 * Lumina Tarot · 主题系统入口
 * ----------------------------------------------------------------
 * - 所有主题的 TypeScript 描述
 * - 主题切换工具（含 View Transitions API 支持 + localStorage 持久化）
 * - 主题 ID 类型守卫
 */

/* ============================================================
 * 类型
 * ============================================================ */

export type ThemeId = 'mystic' | 'minimal' | 'nature';

export interface ThemeDescriptor {
  /** 主题机器 ID（写入 data-theme） */
  id: ThemeId;
  /** 中文名（用于 UI 展示） */
  name: string;
  /** 英文代号 */
  codename: string;
  /** 一句话描述 */
  description: string;
  /** 配色风格关键字 */
  keywords: string[];
  /** 代表色（用于主题选择器色卡） */
  swatches: [string, string, string];
  /** 基调（dark / light / warm） */
  mood: 'dark' | 'light' | 'warm';
  /** 动效强度：决定是否启用星空、粒子等重度动画 */
  motionLevel: 'high' | 'medium' | 'low';
  /** 该主题推荐挂载的背景装饰类名（用于 BackgroundHost） */
  bgLayers: string[];
}

/* ============================================================
 * 主题注册表
 * ============================================================ */

export const THEMES: Record<ThemeId, ThemeDescriptor> = {
  mystic: {
    id: 'mystic',
    name: '神秘暗黑',
    codename: 'Dark Mystic',
    description: '深邃沉浸 · 午夜蓝玫瑰金 · 仪式感',
    keywords: ['深邃', '仪式感', '金色光芒', '沉浸'],
    swatches: ['#0b0d1a', '#c9a961', '#7b5ea8'],
    mood: 'dark',
    motionLevel: 'high',
    bgLayers: ['bg-starfield', 'bg-halo'],
  },
  minimal: {
    id: 'minimal',
    name: '现代极简',
    codename: 'Modern Minimalist',
    description: '清新治愈 · 奶油米色 · 留白呼吸',
    keywords: ['极简', '呼吸感', '无压力', '现代'],
    swatches: ['#faf8f4', '#b8a896', '#c3b1d4'],
    mood: 'light',
    motionLevel: 'low',
    bgLayers: ['bg-grain'],
  },
  nature: {
    id: 'nature',
    name: '疗愈自然',
    codename: 'Healing Nature',
    description: '温暖安全 · 陶土木质 · 手绘感',
    keywords: ['温暖', '大地色', '手绘', '陪伴'],
    swatches: ['#f4ecd8', '#b56b4a', '#7a8c6a'],
    mood: 'warm',
    motionLevel: 'medium',
    bgLayers: ['bg-sunspots'],
  },
};

export const THEME_IDS: ThemeId[] = ['mystic', 'minimal', 'nature'];
export const DEFAULT_THEME: ThemeId = 'mystic';
export const STORAGE_KEY = 'lumina-theme';

/* ============================================================
 * 工具函数
 * ============================================================ */

export function isValidThemeId(id: unknown): id is ThemeId {
  return typeof id === 'string' && (THEME_IDS as string[]).includes(id);
}

/**
 * 从 localStorage 读取主题，失败则返回默认主题
 * 安全：SSR 环境下不访问 window
 */
export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidThemeId(stored)) return stored;
  } catch {
  }
  return DEFAULT_THEME;
}

/**
 * 持久化主题
 */
export function storeTheme(id: ThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
  }
}

/**
 * 立即应用主题（写入 html.dataset.theme）
 * 已自动持久化
 */
export function applyTheme(id: ThemeId): void {
  if (typeof document === 'undefined') return;
  if (!isValidThemeId(id)) return;

  document.documentElement.dataset.theme = id;
  storeTheme(id);
}

/**
 * 带 View Transitions API 的主题切换
 * 不支持的浏览器会平滑降级到 applyTheme
 */
export function transitionTheme(id: ThemeId): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !isValidThemeId(id)) {
      resolve();
      return;
    }

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };

    if (typeof doc.startViewTransition !== 'function') {
      applyTheme(id);
      resolve();
      return;
    }

    const vt = doc.startViewTransition(() => {
      applyTheme(id);
    });

    vt.finished.then(() => resolve()).catch(() => resolve());
  });
}

/**
 * 获取当前已应用主题
 */
export function getCurrentTheme(): ThemeId {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const t = document.documentElement.dataset.theme;
  return isValidThemeId(t) ? t : DEFAULT_THEME;
}

/**
 * 循环切换到下一个主题（用于快捷键或测试）
 */
export function nextTheme(): ThemeId {
  const current = getCurrentTheme();
  const idx = THEME_IDS.indexOf(current);
  const next = THEME_IDS[(idx + 1) % THEME_IDS.length];
  applyTheme(next);
  return next;
}

/* ============================================================
 * Vue 插件封装（可选）
 * ============================================================
 * 在 Vue 项目中：
 *
 *   import { createApp } from 'vue'
 *   import { ThemePlugin } from '@/themes/themes.index'
 *   createApp(App).use(ThemePlugin).mount('#app')
 *
 *   const { theme, setTheme } = useTheme()
 */

import type { App, InjectionKey, Ref } from 'vue';
import { inject, ref } from 'vue';

export interface ThemeContext {
  theme: Ref<ThemeId>;
  setTheme: (id: ThemeId) => Promise<void>;
  themes: typeof THEMES;
}

export const ThemeInjectionKey: InjectionKey<ThemeContext> = Symbol('lumina-theme');

export const ThemePlugin = {
  install(app: App) {
    const initial = getStoredTheme();
    applyTheme(initial);

    const theme = ref<ThemeId>(initial);

    const setTheme = async (id: ThemeId) => {
      if (!isValidThemeId(id) || id === theme.value) return;
      await transitionTheme(id);
      theme.value = id;
    };

    app.provide(ThemeInjectionKey, {
      theme,
      setTheme,
      themes: THEMES,
    });
  },
};

/**
 * 组件内使用：
 *   const { theme, setTheme, themes } = useTheme()
 */
export function useTheme(): ThemeContext {
  const ctx = inject(ThemeInjectionKey);
  if (!ctx) {
    throw new Error(
      '[lumina-theme] useTheme() 必须在 ThemePlugin.install 之后调用'
    );
  }
  return ctx;
}
