import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

function resolveBase(): string {
  if (process.env.EMAS_DEPLOY === 'true') return '/tarot/';
  if (process.env.GITHUB_PAGES === 'true') return '/tt-lumina-tarot/';
  return '/';
}

const base = resolveBase();

export default defineConfig({
  base,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'pwa-icon.svg',
        'pwa-icon-maskable.svg',
        'img/apple-touch-icon-180.png',
      ],
      manifest: {
        id: base,
        name: 'Lumina Tarot · 在黑暗中点亮微光',
        short_name: 'Lumina',
        description:
          'Lumina Tarot · 离线塔罗牌占卜 · 78 张完整大小阿卡那 · 三主题 · 每日一牌',
        lang: 'zh-CN',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b0d1a',
        background_color: '#0b0d1a',
        categories: ['lifestyle', 'entertainment'],
        icons: [
          {
            src: `${base}img/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}img/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${base}img/icon-512-maskable.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: `${base}pwa-icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        shortcuts: [
          {
            name: '今日一牌',
            short_name: '今日一牌',
            description: '抽取今日塔罗指引',
            url: `${base}?shortcut=daily`,
            icons: [{ src: `${base}img/icon-192.png`, sizes: '192x192' }],
          },
          {
            name: '图鉴',
            short_name: '图鉴',
            description: '78 张大小阿卡那索引',
            url: `${base}library`,
            icons: [{ src: `${base}img/icon-192.png`, sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: `${base}index.html`,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: 'true',
    __VUE_I18N_LEGACY_API__: 'false',
    __INTLIFY_PROD_DEVTOOLS__: 'false',
    __INTLIFY_JIT_COMPILATION__: 'false',
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.match(/[\\/]node_modules[\\/](vue|vue-router|pinia|@vue)[\\/]/)) {
              return 'vue';
            }
            if (id.includes('@vueuse')) return 'vueuse';
            if (id.includes('vue-i18n') || id.includes('@intlify')) return 'i18n-runtime';
            if (id.includes('fuse.js')) return 'fuse';
            if (id.includes('radix-vue')) return 'radix';
          }
        },
      },
    },
  },
});
