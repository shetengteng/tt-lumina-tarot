<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import AppHeader from '@/components/layout/AppHeader.vue';
import BottomNav from '@/components/layout/BottomNav.vue';
import BackgroundHost from '@/components/layout/BackgroundHost.vue';
import SiteFooter from '@/components/layout/SiteFooter.vue';
import { storeToRefs } from 'pinia';

const settings = useSettingsStore();
const { theme } = storeToRefs(settings);

onMounted(() => {
  document.documentElement.dataset.theme = theme.value;
});
</script>

<template>
  <div class="relative min-h-dvh bg-background text-foreground">
    <BackgroundHost />
    <AppHeader />

    <main class="relative z-10 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

    <SiteFooter />

    <BottomNav />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 280ms ease,
    transform 280ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
