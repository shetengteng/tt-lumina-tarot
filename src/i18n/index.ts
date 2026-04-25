import { createI18n } from 'vue-i18n';
import type { Locale } from '@/types';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import { CARDS_ZH_CN } from './locales/cards/zh-CN';
import { CARDS_EN_US } from './locales/cards/en-US';

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
    'zh-CN': { ...zhCN, cards: CARDS_ZH_CN },
    'en-US': { ...enUS, cards: CARDS_EN_US },
  },
});

export default i18n;

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
}
