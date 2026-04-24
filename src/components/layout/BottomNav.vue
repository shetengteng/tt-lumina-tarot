<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

type NavItem = {
  name: string;
  label: string;
  iconPath: string;
  matches?: string[];
};

const navItems: NavItem[] = [
  {
    name: 'home',
    label: '首页',
    matches: ['home', 'spread', 'question', 'shuffle', 'reveal', 'reading'],
    iconPath:
      'M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10',
  },
  {
    name: 'library',
    label: '图鉴',
    matches: ['library', 'card-detail'],
    iconPath:
      'M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z',
  },
  {
    name: 'history',
    label: '历史',
    iconPath:
      'M12 8v4l3 2M3 12a9 9 0 1 0 3.5-7.1L3 8V4',
  },
  {
    name: 'settings',
    label: '设置',
    iconPath:
      'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  },
];

const route = useRoute();

function isActive(item: NavItem): boolean {
  const current = String(route.name ?? '');
  if (current === item.name) return true;
  return item.matches?.includes(current) ?? false;
}

const activeName = computed(() => {
  const hit = navItems.find((it) => isActive(it));
  return hit?.name ?? '';
});
</script>

<template>
  <nav
    aria-label="底部导航"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-md md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom);"
  >
    <ul class="mx-auto flex max-w-screen-sm items-stretch">
      <li v-for="item in navItems" :key="item.name" class="flex-1">
        <router-link
          :to="{ name: item.name }"
          class="group relative flex h-16 flex-col items-center justify-center gap-[2px] text-[11px] tracking-wide transition-colors"
          :class="[
            activeName === item.name
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground',
          ]"
        >
          <span
            v-if="activeName === item.name"
            aria-hidden="true"
            class="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-primary/80"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="item.iconPath" />
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>
