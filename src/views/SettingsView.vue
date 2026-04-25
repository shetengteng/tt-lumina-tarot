<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import ThemePicker from '@/components/layout/ThemePicker.vue';
import CardBackPattern from '@/components/tarot/CardBackPattern.vue';
import MinorIllustration from '@/components/tarot/MinorIllustration.vue';
import { useSettingsStore } from '@/stores/settings';
import { useReadingStore } from '@/stores/reading';
import type { CardBackVariant, MinorIllustrationStyle, CardSuit } from '@/types';

const settings = useSettingsStore();
const { reducedMotion, theme, cardBack, minorStyle } = storeToRefs(settings);
const readingStore = useReadingStore();

const CARD_BACK_OPTIONS: Array<{ id: CardBackVariant; name: string; desc: string }> = [
  { id: 'classic',   name: '经典',     desc: '双层圆环 · 八芒星' },
  { id: 'celestial', name: '星图',     desc: '北斗 · 上弦月' },
  { id: 'sacred',    name: '神圣几何', desc: '大卫之星 · 黄道十二宫' },
  { id: 'floral',    name: '生命之花', desc: '七圆相切 · 藤蔓饰' },
  { id: 'eye',       name: '神秘之眼', desc: '杏核眼 · 十二放射' },
];

const MINOR_STYLE_OPTIONS: Array<{ id: MinorIllustrationStyle; name: string; desc: string }> = [
  {
    id: 'symbol',
    name: '符号系',
    desc: '杖 · 杯 · 剑 · 五芒钱 · 韦特意象简化',
  },
  {
    id: 'geometric',
    name: '几何系',
    desc: '线 · 环 · 三角 · 菱形 · 元素抽象',
  },
];

const PREVIEW_SUITS: CardSuit[] = ['wands', 'cups', 'swords', 'pentacles'];

function clearData() {
  if (typeof window !== 'undefined' && !window.confirm('将清空所有占卜历史与当前进行中的占卜，确定吗？')) return;
  readingStore.clearAll();
  readingStore.clearCurrent();
}

function exportJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    theme: theme.value,
    history: readingStore.history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lumina-tarot-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-md pt-2xl pb-2xl">
    <header class="mb-xl">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">Settings</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">偏好与数据</h1>
    </header>

    <div class="space-y-md">
      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>主题</Label>
            <p class="text-sm text-muted-foreground">选择一个最符合你当下心境的氛围。</p>
          </div>
          <ThemePicker />
          <p class="text-xs text-muted-foreground">
            当前：<span class="text-foreground">{{ { mystic: '神秘暗黑', minimal: '现代极简', nature: '疗愈自然' }[theme] }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>牌背图案</Label>
            <p class="text-sm text-muted-foreground">
              洗牌、牌阵、占卜结果中所有未翻面的牌都会使用此图案。
            </p>
          </div>
          <div class="grid grid-cols-2 gap-sm sm:grid-cols-3">
            <button
              v-for="opt in CARD_BACK_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="cardBack === opt.id"
              class="card-back-option group relative flex flex-col items-center gap-xs rounded-lg border p-sm transition focus:outline-none"
              :class="cardBack === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setCardBack(opt.id)"
            >
              <div class="card-back preview-card relative h-[112px] w-[68px] shrink-0">
                <CardBackPattern :variant="opt.id" />
              </div>
              <div class="text-center">
                <div class="text-xs font-medium text-foreground">{{ opt.name }}</div>
                <div class="mt-0.5 text-[10px] text-muted-foreground">{{ opt.desc }}</div>
              </div>
              <span
                v-if="cardBack === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            当前：<span class="text-foreground">{{ CARD_BACK_OPTIONS.find(o => o.id === cardBack)?.name }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>小阿卡那插画风格</Label>
            <p class="text-sm text-muted-foreground">
              影响 56 张小阿卡那（权杖 · 圣杯 · 宝剑 · 钱币）正面的中央插图。大阿卡那不受影响。
            </p>
          </div>
          <div class="grid grid-cols-1 gap-sm sm:grid-cols-2">
            <button
              v-for="opt in MINOR_STYLE_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="minorStyle === opt.id"
              class="minor-style-option group relative flex flex-col gap-xs rounded-lg border p-sm text-left transition focus:outline-none"
              :class="minorStyle === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setMinorStyle(opt.id)"
            >
              <div class="grid grid-cols-4 gap-xs rounded-md bg-card/60 p-xs">
                <div
                  v-for="suit in PREVIEW_SUITS"
                  :key="suit"
                  class="preview-tile relative aspect-[100/130] rounded-sm border border-border/50 bg-card"
                >
                  <MinorIllustration :suit="suit" rank="3" :style="opt.id" />
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-foreground">{{ opt.name }}</div>
                <div class="mt-0.5 text-xs text-muted-foreground">{{ opt.desc }}</div>
              </div>
              <span
                v-if="minorStyle === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            当前：<span class="text-foreground">{{ MINOR_STYLE_OPTIONS.find(o => o.id === minorStyle)?.name }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="flex items-start justify-between gap-md">
            <div class="space-y-xs">
              <Label for="reduced-motion">减弱动画</Label>
              <p class="text-sm text-muted-foreground">
                关闭背景粒子、流动雾气与洗牌动画，更适合低性能设备或晕动症用户。
              </p>
            </div>
            <Switch
              id="reduced-motion"
              :checked="reducedMotion"
              @update:checked="settings.toggleReducedMotion($event)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div>
            <Label>数据</Label>
            <p class="mt-xs text-sm text-muted-foreground">
              所有历史存储在 localStorage，不会离开你的设备。你可以导出为 JSON 作为备份。
            </p>
          </div>
          <Separator />
          <div class="flex flex-wrap gap-xs">
            <Button variant="outline" @click="exportJSON">导出 JSON</Button>
            <Button variant="destructive" @click="clearData">清空全部历史</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-xs p-lg">
          <Label>关于</Label>
          <p class="text-sm text-muted-foreground">
            Lumina Tarot · v0.1 · 离线塔罗牌占卜 Web App。
            Vue 3 · Vite · TypeScript · Tailwind · shadcn-vue。
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
