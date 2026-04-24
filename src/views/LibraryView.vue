<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CardSuit } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ALL_CARDS, MAJOR_ARCANA, SUITS, getCardsBySuit } from '@/data/cards';

type Tab = 'all' | 'major' | CardSuit;

const router = useRouter();
const q = ref('');
const activeTab = ref<Tab>('all');

const TABS: { id: Tab; label: string; count: number }[] = [
  { id: 'all', label: '全部', count: ALL_CARDS.length },
  { id: 'major', label: '大阿卡那', count: MAJOR_ARCANA.length },
  { id: 'wands', label: SUITS.wands.label, count: getCardsBySuit('wands').length },
  { id: 'cups', label: SUITS.cups.label, count: getCardsBySuit('cups').length },
  { id: 'swords', label: SUITS.swords.label, count: getCardsBySuit('swords').length },
  { id: 'pentacles', label: SUITS.pentacles.label, count: getCardsBySuit('pentacles').length },
];

const scoped = computed(() => {
  switch (activeTab.value) {
    case 'all':
      return ALL_CARDS;
    case 'major':
      return MAJOR_ARCANA;
    default:
      return getCardsBySuit(activeTab.value);
  }
});

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase();
  if (!term) return scoped.value;
  return scoped.value.filter((c) => {
    const hay = [
      c.name,
      c.nameEn,
      String(c.number),
      ...c.keywords,
      c.element ?? '',
      c.zodiac ?? '',
      c.planet ?? '',
      c.suit ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(term);
  });
});

function cornerLabel(c: typeof ALL_CARDS[number]) {
  if (c.arcana === 'minor' && c.rank) {
    const RANK_LABEL: Record<string, string> = {
      ace: 'A',
      '2': 'II',
      '3': 'III',
      '4': 'IV',
      '5': 'V',
      '6': 'VI',
      '7': 'VII',
      '8': 'VIII',
      '9': 'IX',
      '10': 'X',
      page: 'P',
      knight: 'Kn',
      queen: 'Q',
      king: 'K',
    };
    return RANK_LABEL[c.rank] ?? '';
  }
  return String(c.number).padStart(2, '0');
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">Library</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">塔罗图鉴 · 78 张</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        大阿卡那 22 张 + 小阿卡那 56 张，按花色浏览每一张牌的意象、元素与关键词。
      </p>
    </header>

    <div class="mx-auto mb-md max-w-lg">
      <Input v-model="q" placeholder="搜索：牌名 / 英文 / 关键词 / 花色…" />
    </div>

    <div class="mb-lg flex flex-wrap justify-center gap-xs" role="tablist" aria-label="按分组查看">
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === t.id"
        class="inline-flex items-center gap-xs rounded-full border px-md py-xs text-xs transition"
        :class="
          activeTab === t.id
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
        "
        @click="activeTab = t.id"
      >
        <span>{{ t.label }}</span>
        <span class="rounded-full bg-muted px-xs text-[0.6rem] text-muted-foreground">{{ t.count }}</span>
      </button>
    </div>

    <div class="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <Card
        v-for="c in filtered"
        :key="c.id"
        class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
        @click="router.push({ name: 'card-detail', params: { id: c.id } })"
      >
        <CardContent class="flex flex-col gap-xs p-md">
          <div class="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>{{ cornerLabel(c) }}</span>
            <span class="font-display tracking-widest">{{ c.nameEn.toUpperCase() }}</span>
          </div>
          <div class="flex aspect-[2/3] items-center justify-center rounded-md bg-muted/40">
            <span class="text-[clamp(2rem,5vw,3.5rem)] text-primary">{{ c.symbol }}</span>
          </div>
          <div class="font-display text-base">{{ c.name }}</div>
          <div class="flex flex-wrap gap-xs">
            <Badge v-for="k in c.keywords.slice(0, 2)" :key="k" variant="secondary" class="text-[0.65rem]">
              {{ k }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <p v-if="filtered.length === 0" class="mt-xl text-center text-sm text-muted-foreground">
      没有匹配的卡牌，换个关键词试试。
    </p>
  </section>
</template>
