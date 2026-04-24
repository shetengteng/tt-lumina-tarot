<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReadingStore } from '@/stores/reading';
import { useSettingsStore } from '@/stores/settings';
import { getSpreadById } from '@/data/spreads';
import { getCardById } from '@/data/cards';
import { formatRelative } from '@/lib/utils';
import type { ReadingRecord } from '@/types';

const router = useRouter();
const readingStore = useReadingStore();
const settings = useSettingsStore();
const { historySorted } = storeToRefs(readingStore);

const isEmpty = computed(() => historySorted.value.length === 0);
const totalCount = computed(() => historySorted.value.length);

const monthlyCount = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return historySorted.value.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
});

type Period = 'today' | 'yesterday' | 'thisWeek' | string;

function periodOf(ts: number, now: number = Date.now()): Period {
  const nowDay = new Date(now);
  const day = new Date(ts);
  const sameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDate(day, nowDay)) return 'today';
  const yesterday = new Date(now - 86400000);
  if (sameDate(day, yesterday)) return 'yesterday';
  if (now - ts < 7 * 86400000) return 'thisWeek';
  return `${day.getFullYear()}.${String(day.getMonth() + 1).padStart(2, '0')}`;
}

function periodLabel(p: Period) {
  if (p === 'today') return '今天';
  if (p === 'yesterday') return '昨天';
  if (p === 'thisWeek') return '本周';
  return p;
}

function spreadName(id: string) {
  return getSpreadById(id)?.name ?? id;
}

function summaryOf(r: ReadingRecord): string {
  if (r.cards.length === 0) return '—';
  const spread = getSpreadById(r.spreadId);
  if (r.cards.length === 1) {
    const only = r.cards[0];
    const card = getCardById(only.cardId);
    if (!card) return '—';
    const status = only.reversed ? '逆位' : '正位';
    const brief = card.summary.length > 30 ? card.summary.slice(0, 30) + '…' : card.summary;
    return `抽到 ${card.name} ${status} — ${brief}`;
  }
  if (r.cards.length <= 3) {
    return r.cards
      .map((c) => {
        const card = getCardById(c.cardId);
        const pos = spread?.positions[c.positionIndex]?.name ?? `第 ${c.positionIndex + 1} 张`;
        const name = card?.name ?? '?';
        return `${pos}：${name}${c.reversed ? '·逆' : ''}`;
      })
      .join(' · ');
  }
  const names = r.cards
    .map((c) => getCardById(c.cardId)?.name ?? '?')
    .slice(0, 4)
    .join('、');
  const more = r.cards.length > 4 ? `…等 ${r.cards.length} 张` : '';
  return `${r.cards.length} 张牌 — 依次：${names}${more}`;
}

function removeOne(id: string) {
  readingStore.removeRecord(id);
}

function clearAll() {
  if (typeof window !== 'undefined' && !window.confirm('将清空所有占卜历史，确定吗？')) return;
  readingStore.clearAll();
}

function exportJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    theme: settings.theme,
    history: readingStore.history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lumina-tarot-history-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <section class="mx-auto max-w-4xl px-md pt-2xl pb-2xl">
    <header class="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
      <div>
        <div class="text-xs uppercase tracking-[0.4em] text-primary">History</div>
        <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">占卜历史</h1>
        <p v-if="!isEmpty" class="mt-sm text-sm text-muted-foreground">
          共 {{ totalCount }} 次占卜 · 本月 {{ monthlyCount }} 次
        </p>
        <p v-else class="mt-sm text-sm text-muted-foreground">
          最多保留 100 条，仅存在于你的设备。
        </p>
      </div>
      <div class="flex gap-xs">
        <Button v-if="!isEmpty" variant="outline" size="sm" @click="exportJSON">导出</Button>
        <Button v-if="!isEmpty" variant="outline" size="sm" class="border-destructive/40 text-destructive hover:bg-destructive/10" @click="clearAll">
          清空
        </Button>
        <Button variant="glow" size="sm" @click="router.push({ name: 'spread' })">新的占卜</Button>
      </div>
    </header>

    <!-- 空态 -->
    <Card v-if="isEmpty">
      <CardContent class="flex flex-col items-center gap-md p-xl text-center">
        <span class="text-4xl text-primary">◌</span>
        <p class="text-sm text-muted-foreground">还没有任何记录，现在就开启一次仪式吧。</p>
        <Button variant="glow" @click="router.push({ name: 'spread' })">开始占卜 →</Button>
      </CardContent>
    </Card>

    <!-- 时间线 -->
    <div v-else class="space-y-md">
      <article
        v-for="r in historySorted"
        :key="r.id"
        class="group rounded-lg border border-border/70 bg-card/80 p-lg text-card-foreground shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <!-- 第一行：时间 + 牌阵 · pill -->
        <div class="mb-sm flex items-center justify-between gap-md">
          <span class="text-xs text-muted-foreground">
            {{ formatRelative(r.createdAt) }} · {{ spreadName(r.spreadId) }}
          </span>
          <span class="rounded-full bg-muted px-sm py-xs text-[11px] text-muted-foreground">
            {{ periodLabel(periodOf(r.createdAt)) }}
          </span>
        </div>

        <!-- 第二行：问题 -->
        <h3 class="mb-xs font-display text-lg leading-snug tracking-wide">
          <span class="text-primary">「</span>{{ r.question || '未命名占卜' }}<span class="text-primary">」</span>
        </h3>

        <!-- 第三行：摘要 -->
        <p class="mb-md text-sm leading-relaxed text-muted-foreground">
          {{ summaryOf(r) }}
        </p>

        <!-- 第四行：牌背缩略 + 操作 -->
        <div class="flex items-end justify-between gap-md">
          <div class="flex flex-wrap gap-xs">
            <div
              v-for="c in r.cards"
              :key="c.cardId + c.positionIndex"
              class="card-back h-12 w-8 rounded-sm shadow-sm"
              :aria-label="`第 ${c.positionIndex + 1} 张`"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="shrink-0 text-xs text-muted-foreground hover:text-destructive"
            @click="removeOne(r.id)"
          >
            删除
          </Button>
        </div>

        <!-- 记录的笔记 -->
        <p
          v-if="r.note"
          class="mt-md rounded-md border border-border/50 bg-muted/30 p-md text-sm leading-relaxed"
        >
          <span class="mr-xs text-primary">✎</span>{{ r.note }}
        </p>
      </article>
    </div>
  </section>
</template>
