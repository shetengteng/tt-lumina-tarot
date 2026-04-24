import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { ThemeId } from '@/types';

const STORAGE_KEY = 'lumina-theme';
const REDUCED_MOTION_KEY = 'lumina-reduced-motion';

function readInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return 'mystic';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'mystic' || saved === 'minimal' || saved === 'nature') return saved;
  return 'mystic';
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeId>(readInitialTheme());
  const reducedMotion = ref<boolean>(
    typeof window !== 'undefined' && window.localStorage.getItem(REDUCED_MOTION_KEY) === '1'
  );

  function applyThemeToDOM(next: ThemeId) {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const color =
        next === 'mystic' ? '#0b0d1a' : next === 'minimal' ? '#faf8f4' : '#f4ecd8';
      meta.setAttribute('content', color);
    }
  }

  function setTheme(next: ThemeId) {
    if (next === theme.value) return;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    if (doc.startViewTransition && !reducedMotion.value) {
      doc.startViewTransition(() => {
        theme.value = next;
        applyThemeToDOM(next);
      });
    } else {
      theme.value = next;
      applyThemeToDOM(next);
    }
  }

  function toggleReducedMotion(v?: boolean) {
    reducedMotion.value = v ?? !reducedMotion.value;
  }

  watch(
    theme,
    (v) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(STORAGE_KEY, v);
      applyThemeToDOM(v);
    },
    { immediate: true }
  );

  watch(reducedMotion, (v) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(REDUCED_MOTION_KEY, v ? '1' : '0');
  });

  return {
    theme,
    reducedMotion,
    setTheme,
    toggleReducedMotion,
  };
});
