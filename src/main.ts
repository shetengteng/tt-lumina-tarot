import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { MotionPlugin } from '@vueuse/motion';

import App from './App.vue';
import router from './router';
import i18n, { ensureCardsLocale } from './i18n';
import './assets/css/base.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(MotionPlugin);
app.mount('#app');

const idle: (cb: () => void) => number =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (cb) => (window as Window & typeof globalThis).requestIdleCallback(cb, { timeout: 1500 })
    : (cb) => window.setTimeout(cb, 600);

idle(() => {
  void ensureCardsLocale();
});
