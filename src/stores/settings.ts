import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { ThemeId, CardBackVariant, MinorIllustrationStyle, Locale, AnimationLevel } from '@/types';
import { initialLocale, setI18nLocale, SUPPORTED_LOCALES } from '@/i18n';

const STORAGE_KEY = 'lumina-theme';
const REDUCED_MOTION_KEY = 'lumina-reduced-motion';
const CARD_BACK_KEY = 'lumina-card-back';
const MINOR_STYLE_KEY = 'lumina-minor-style';
const ANIMATION_LEVEL_KEY = 'lumina-animation-level';

const VALID_CARD_BACKS: CardBackVariant[] = ['classic', 'celestial', 'sacred', 'floral', 'eye'];
const VALID_MINOR_STYLES: MinorIllustrationStyle[] = ['symbol', 'geometric'];
const VALID_ANIMATION_LEVELS: AnimationLevel[] = ['off', 'lite', 'full'];

function readInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return 'mystic';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'mystic' || saved === 'minimal' || saved === 'nature') return saved;
  return 'mystic';
}

function readInitialCardBack(): CardBackVariant {
  if (typeof window === 'undefined') return 'classic';
  const saved = window.localStorage.getItem(CARD_BACK_KEY);
  if (saved && (VALID_CARD_BACKS as string[]).includes(saved)) {
    return saved as CardBackVariant;
  }
  return 'classic';
}

function readInitialMinorStyle(): MinorIllustrationStyle {
  if (typeof window === 'undefined') return 'symbol';
  const saved = window.localStorage.getItem(MINOR_STYLE_KEY);
  if (saved && (VALID_MINOR_STYLES as string[]).includes(saved)) {
    return saved as MinorIllustrationStyle;
  }
  return 'symbol';
}

function readInitialAnimationLevel(): AnimationLevel {
  if (typeof window === 'undefined') return 'full';
  const saved = window.localStorage.getItem(ANIMATION_LEVEL_KEY);
  if (saved && (VALID_ANIMATION_LEVELS as string[]).includes(saved)) {
    return saved as AnimationLevel;
  }
  const legacy = window.localStorage.getItem(REDUCED_MOTION_KEY);
  if (legacy === '1') return 'off';
  if (typeof window.matchMedia === 'function') {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'lite';
    } catch {
      /* ignore */
    }
  }
  return 'full';
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeId>(readInitialTheme());
  const cardBack = ref<CardBackVariant>(readInitialCardBack());
  const minorStyle = ref<MinorIllustrationStyle>(readInitialMinorStyle());
  const locale = ref<Locale>(initialLocale);
  const animationLevel = ref<AnimationLevel>(readInitialAnimationLevel());
  const reducedMotion = ref<boolean>(animationLevel.value === 'off');

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

  function applyCardBackToDOM(next: CardBackVariant) {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.cardBack = next;
  }

  function applyMinorStyleToDOM(next: MinorIllustrationStyle) {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.minorStyle = next;
  }

  function applyAnimationLevelToDOM(next: AnimationLevel) {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.anim = next;
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

  function setCardBack(next: CardBackVariant) {
    if (next === cardBack.value) return;
    cardBack.value = next;
  }

  function setMinorStyle(next: MinorIllustrationStyle) {
    if (next === minorStyle.value) return;
    minorStyle.value = next;
  }

  function setLocale(next: Locale) {
    if (!(SUPPORTED_LOCALES as string[]).includes(next)) return;
    if (next === locale.value) return;
    locale.value = next;
    setI18nLocale(next);
  }

  function setAnimationLevel(next: AnimationLevel) {
    if (!(VALID_ANIMATION_LEVELS as string[]).includes(next)) return;
    if (next === animationLevel.value) return;
    animationLevel.value = next;
    reducedMotion.value = next === 'off';
  }

  function toggleReducedMotion(v?: boolean) {
    const target = v ?? !reducedMotion.value;
    reducedMotion.value = target;
    if (target) {
      animationLevel.value = 'off';
    } else if (animationLevel.value === 'off') {
      animationLevel.value = 'full';
    }
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

  watch(
    cardBack,
    (v) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(CARD_BACK_KEY, v);
      applyCardBackToDOM(v);
    },
    { immediate: true }
  );

  watch(
    minorStyle,
    (v) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(MINOR_STYLE_KEY, v);
      applyMinorStyleToDOM(v);
    },
    { immediate: true }
  );

  watch(
    animationLevel,
    (v) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(ANIMATION_LEVEL_KEY, v);
      applyAnimationLevelToDOM(v);
    },
    { immediate: true }
  );

  return {
    theme,
    reducedMotion,
    cardBack,
    minorStyle,
    locale,
    animationLevel,
    setTheme,
    setCardBack,
    setMinorStyle,
    setLocale,
    setAnimationLevel,
    toggleReducedMotion,
  };
});
