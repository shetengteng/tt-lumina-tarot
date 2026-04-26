import { createI18n } from 'vue-i18n';
import type { Locale } from '@/types';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US'];
export const DEFAULT_LOCALE: Locale = 'zh-CN';
export const LOCALE_STORAGE_KEY = 'lumina-locale';

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && (SUPPORTED_LOCALES as string[]).includes(saved)) return saved as Locale;
  const navLang = (navigator.language || '').toLowerCase();
  if (navLang.startsWith('zh')) return 'zh-CN';
  return 'en-US';
}

export const initialLocale = detectInitialLocale();

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: 'zh-CN',
  warnHtmlMessage: false,
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

export default i18n;

const cardsLoaded: Partial<Record<Locale, boolean>> = {};
let cardsLoadingPromise: Promise<void> | null = null;

/**
 * Load the heavy 78-card i18n dictionary on demand.
 * Cards are not used on Home / Spread / Question / Shuffle / Reveal,
 * so deferring this saves ~25 KB gzip from the initial chunk.
 */
export function ensureCardsLocale(locale: Locale = i18n.global.locale.value as Locale): Promise<void> {
  if (cardsLoaded[locale]) return Promise.resolve();
  if (cardsLoadingPromise) return cardsLoadingPromise;
  cardsLoadingPromise = (async () => {
    if (locale === 'en-US') {
      const { CARDS_EN_US } = await import('./locales/cards/en-US');
      i18n.global.mergeLocaleMessage('en-US', { cards: CARDS_EN_US });
      cardsLoaded['en-US'] = true;
    } else {
      const { CARDS_ZH_CN } = await import('./locales/cards/zh-CN');
      i18n.global.mergeLocaleMessage('zh-CN', { cards: CARDS_ZH_CN });
      cardsLoaded['zh-CN'] = true;
    }
  })().finally(() => {
    cardsLoadingPromise = null;
  });
  return cardsLoadingPromise;
}

export function setI18nLocale(next: Locale) {
  i18n.global.locale.value = next;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
    document.documentElement.dataset.locale = next;
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }
  void ensureCardsLocale(next);
}
