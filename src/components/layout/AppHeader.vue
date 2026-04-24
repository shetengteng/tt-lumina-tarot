<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ThemePicker from './ThemePicker.vue';

const route = useRoute();
const router = useRouter();

const canGoBack = computed(() => route.name !== 'home');

const navLinks = [
  { name: 'home', label: '首页' },
  { name: 'library', label: '图鉴' },
  { name: 'history', label: '历史' },
  { name: 'settings', label: '设置' },
];

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push({ name: 'home' });
}
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-md border-b border-border/50 bg-background/75 px-md backdrop-blur-md md:px-lg"
  >
    <button
      v-if="canGoBack"
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
      aria-label="返回"
      @click="goBack"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>

    <router-link to="/" class="flex items-center gap-xs font-display text-base tracking-widest text-foreground md:text-lg">
      <span class="text-primary">✦</span>
      <span>Lumina</span>
      <span class="hidden text-muted-foreground sm:inline">Tarot</span>
    </router-link>

    <nav class="ml-auto hidden items-center gap-xs md:flex">
      <router-link
        v-for="link in navLinks"
        :key="link.name"
        :to="{ name: link.name }"
        class="rounded-md px-md py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
        active-class="bg-primary/15 text-foreground"
      >
        {{ link.label }}
      </router-link>
    </nav>

    <div class="ml-auto hidden md:ml-0 md:block">
      <ThemePicker />
    </div>
  </header>
</template>
