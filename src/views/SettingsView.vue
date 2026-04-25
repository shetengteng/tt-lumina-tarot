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
import type {
  CardBackVariant,
  MinorIllustrationStyle,
  CardSuit,
  CardArtTheme,
} from '@/types';

const settings = useSettingsStore();
const { reducedMotion, theme, cardBack, minorStyle, cardArtTheme } = storeToRefs(settings);
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

const CARD_ART_THEME_OPTIONS: Array<{
  id: CardArtTheme;
  name: string;
  desc: string;
  badge?: string;
  preview: string;
}> = [
  {
    id: 'minimal',
    name: '极简',
    desc: '使用站内 SVG 插画 · 无外部图片 · 加载最快',
    preview: '/img/card-theme-preview-minimal.webp',
  },
  {
    id: 'rws',
    name: '经典韦特',
    desc: '矢量化 Rider-Waite-Smith · 公有领域',
    badge: 'Wikimedia · CC0',
    preview: '/decks/rws/fool.webp',
  },
  {
    id: 'aquatic',
    name: '水彩重绘',
    desc: 'Andreas Schröter 水彩版 · 仅限非商业使用',
    badge: 'CC BY-NC-SA 3.0',
    preview: '/decks/aquatic/fool.webp',
  },
];

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
            <Label>卡面主题</Label>
            <p class="text-sm text-muted-foreground">
              切换 78 张牌正面的视觉风格。极简使用站内 SVG；其他主题使用本地图片资源。
            </p>
          </div>
          <div class="grid grid-cols-1 gap-sm sm:grid-cols-3">
            <button
              v-for="opt in CARD_ART_THEME_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="cardArtTheme === opt.id"
              class="card-art-option group relative flex flex-col gap-xs rounded-lg border p-sm text-left transition focus:outline-none"
              :class="cardArtTheme === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setCardArtTheme(opt.id)"
            >
              <div class="art-preview relative mx-auto aspect-[5/9] w-[68px] overflow-hidden rounded-md border border-border/60 bg-card">
                <img
                  v-if="opt.id !== 'minimal'"
                  :src="opt.preview"
                  alt=""
                  class="h-full w-full object-cover"
                  decoding="async"
                  loading="lazy"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-2xl text-primary">
                  ✦
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-foreground">{{ opt.name }}</div>
                <div class="mt-0.5 text-[11px] leading-snug text-muted-foreground">{{ opt.desc }}</div>
                <div
                  v-if="opt.badge"
                  class="mt-xs inline-block rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {{ opt.badge }}
                </div>
              </div>
              <span
                v-if="cardArtTheme === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p
            v-if="cardArtTheme !== 'minimal'"
            class="rounded-md border border-border/60 bg-muted/30 p-sm text-[11px] leading-relaxed text-muted-foreground"
          >
            ℹ 已切换到图片主题。牌背会自动使用与该主题配套的封面，「牌背图案」选项暂时隐藏。
            切回「极简」即可恢复 SVG 牌背的自由选择。
          </p>
          <p
            v-if="cardArtTheme === 'aquatic'"
            class="rounded-md border border-amber-500/30 bg-amber-500/10 p-sm text-[11px] leading-relaxed text-amber-700 dark:text-amber-400"
          >
            ⚠ Aquatic Tarot 由 Andreas Schröter 创作，授权为 <strong>CC BY-NC-SA 3.0</strong>，
            仅限个人非商业用途。如需商业使用请改用「极简」或「经典韦特」。
          </p>
        </CardContent>
      </Card>

      <Card v-if="cardArtTheme === 'minimal'">
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>牌背图案</Label>
            <p class="text-sm text-muted-foreground">
              洗牌、牌阵、占卜结果中所有未翻面的牌都会使用此图案。仅在「卡面主题 = 极简」时可自由选择。
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
              仅在「卡面主题 = 极简」时生效。影响 56 张小阿卡那（权杖 · 圣杯 · 宝剑 · 钱币）正面的中央插图。
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
          <p class="text-sm leading-relaxed text-muted-foreground">
            Lumina Tarot 是一座属于你自己的安静牌桌——
            <span class="text-foreground/85">无需登录，无需联网</span>，所有问题与记录都只留在你的设备里。
          </p>
          <p class="text-sm leading-relaxed text-muted-foreground">
            愿每一次抽牌，都成为与自己相处的小小仪式。
          </p>
          <p class="pt-xs text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60">
            Lumina Tarot · v0.1
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
