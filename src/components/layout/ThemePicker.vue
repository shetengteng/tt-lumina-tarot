<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/stores/settings';
import type { ThemeId } from '@/types';
import { cn } from '@/lib/utils';

const settings = useSettingsStore();
const { theme } = storeToRefs(settings);

interface ThemeOption {
  id: ThemeId;
  label: string;
  hint: string;
  swatch: string[];
}

const options: ThemeOption[] = [
  {
    id: 'mystic',
    label: '神秘暗黑',
    hint: '深邃 · 仪式感',
    swatch: ['hsl(230 30% 7%)', 'hsl(38 47% 58%)', 'hsl(43 72% 69%)'],
  },
  {
    id: 'minimal',
    label: '现代极简',
    hint: '留白 · 清澈',
    swatch: ['hsl(42 35% 97%)', 'hsl(0 0% 15%)', 'hsl(210 25% 80%)'],
  },
  {
    id: 'nature',
    label: '疗愈自然',
    hint: '温暖 · 手绘',
    swatch: ['hsl(37 67% 93%)', 'hsl(18 42% 45%)', 'hsl(30 52% 65%)'],
  },
];

function pick(id: ThemeId) {
  settings.setTheme(id);
}
</script>

<template>
  <div class="flex items-center gap-xs rounded-full border border-border/60 bg-card/70 p-1 backdrop-blur-md">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      :aria-pressed="theme === opt.id"
      :title="`${opt.label} · ${opt.hint}`"
      :class="
        cn(
          'group relative flex items-center gap-xs rounded-full px-xs py-1 text-xs transition-all',
          'hover:bg-accent/30',
          theme === opt.id
            ? 'bg-primary/15 text-foreground shadow-sm'
            : 'text-muted-foreground'
        )
      "
      @click="pick(opt.id)"
    >
      <span class="flex items-center gap-0.5">
        <span
          v-for="(c, idx) in opt.swatch"
          :key="idx"
          class="h-3 w-3 rounded-full border border-border/40"
          :style="{ background: c }"
        />
      </span>
      <span class="hidden font-medium sm:inline">{{ opt.label }}</span>
    </button>
  </div>
</template>
