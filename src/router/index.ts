import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { ensureCardsLocale } from '@/i18n';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/spread',
    name: 'spread',
    component: () => import('@/views/SpreadView.vue'),
    meta: { title: '选择牌阵' },
  },
  {
    path: '/question',
    name: 'question',
    component: () => import('@/views/QuestionView.vue'),
    meta: { title: '问题输入' },
  },
  {
    path: '/shuffle',
    name: 'shuffle',
    component: () => import('@/views/ShuffleView.vue'),
    meta: { title: '洗牌抽牌' },
  },
  {
    path: '/reveal',
    name: 'reveal',
    component: () => import('@/views/RevealView.vue'),
    meta: { title: '翻牌揭示', needsCards: true },
  },
  {
    path: '/reading',
    name: 'reading',
    component: () => import('@/views/ReadingView.vue'),
    meta: { title: '解读', needsCards: true },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/LibraryView.vue'),
    meta: { title: '牌卡图鉴', needsCards: true },
  },
  {
    path: '/library/:id',
    name: 'card-detail',
    component: () => import('@/views/CardDetailView.vue'),
    meta: { title: '卡牌详情', needsCards: true },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: '占卜历史', needsCards: true },
  },
  {
    path: '/history/:id',
    name: 'history-detail',
    component: () => import('@/views/HistoryDetailView.vue'),
    meta: { title: '占卜详情', needsCards: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置' },
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (to.meta?.needsCards) {
    void ensureCardsLocale();
  }
  return true;
});

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? '';
  document.title = title ? `${title} · Lumina Tarot` : 'Lumina Tarot';
});

export default router;
