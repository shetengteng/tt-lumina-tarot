<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import ThemePicker from '@/components/layout/ThemePicker.vue';
import { useSettingsStore } from '@/stores/settings';
import { useReadingStore } from '@/stores/reading';

const settings = useSettingsStore();
const { reducedMotion, theme } = storeToRefs(settings);
const readingStore = useReadingStore();

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
