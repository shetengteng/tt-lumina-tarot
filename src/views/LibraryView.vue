<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Fuse from 'fuse.js';
import type { CardSuit, TarotCardDef } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CardArtwork from '@/components/tarot/CardArtwork.vue';
import { useSettingsStore } from '@/stores/settings';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';
import { ALL_CARDS, MAJOR_ARCANA, getCardsBySuit } from '@/data/cards';

const settings = useSettingsStore();
const { minorStyle, cardArtTheme } = storeToRefs(settings);
const { t, locale } = useI18n();
const { getName, getKeywords } = useCardI18n();
const { suitLabel, elementLabel } = useTarotI18n();

type Tab = 'all' | 'major' | CardSuit;

const router = useRouter();
const q = ref('');
const activeTab = ref<Tab>('all');

const TABS = computed<{ id: Tab; label: string; count: number }[]>(() => [
  { id: 'all',       label: t('library.tabAll'),       count: ALL_CARDS.length },
  { id: 'major',     label: t('library.tabMajor'),     count: MAJOR_ARCANA.length },
  { id: 'wands',     label: t('library.tabWands'),     count: getCardsBySuit('wands').length },
  { id: 'cups',      label: t('library.tabCups'),      count: getCardsBySuit('cups').length },
  { id: 'swords',    label: t('library.tabSwords'),    count: getCardsBySuit('swords').length },
  { id: 'pentacles', label: t('library.tabPentacles'), count: getCardsBySuit('pentacles').length },
]);

const scoped = computed<TarotCardDef[]>(() => {
  switch (activeTab.value) {
    case 'all':
      return ALL_CARDS;
    case 'major':
      return MAJOR_ARCANA;
    default:
      return getCardsBySuit(activeTab.value);
  }
});

type SearchableCard = TarotCardDef & {
  _localizedName: string;
  _localizedKeywords: string[];
  _suitLabel: string;
  _elementLabel: string;
};

const searchable = computed<SearchableCard[]>(() => {
  void locale.value;
  return scoped.value.map((c) => ({
    ...c,
    _localizedName: getName(c),
    _localizedKeywords: getKeywords(c),
    _suitLabel: c.suit ? suitLabel(c.suit) : '',
    _elementLabel: elementLabel(c.element),
  }));
});

const fuse = computed(
  () =>
    new Fuse<SearchableCard>(searchable.value, {
      includeScore: false,
      threshold: 0.38,
      ignoreLocation: true,
      minMatchCharLength: 1,
      keys: [
        { name: '_localizedName', weight: 0.45 },
        { name: 'name', weight: 0.25 },
        { name: 'nameEn', weight: 0.25 },
        { name: '_localizedKeywords', weight: 0.2 },
        { name: 'keywords', weight: 0.15 },
        { name: '_suitLabel', weight: 0.06 },
        { name: 'suit', weight: 0.04 },
        { name: '_elementLabel', weight: 0.04 },
        { name: 'element', weight: 0.04 },
        { name: 'planet', weight: 0.03 },
        { name: 'zodiac', weight: 0.03 },
      ],
    })
);

const filtered = computed<SearchableCard[]>(() => {
  const term = q.value.trim();
  if (!term) return searchable.value;
  return fuse.value.search(term).map((r) => r.item);
});

function cornerLabel(c: TarotCardDef) {
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
      <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('library.pageLabel') }}</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('library.title') }}</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        {{ t('library.subtitle') }}
      </p>
    </header>

    <div class="mx-auto mb-md max-w-lg">
      <Input v-model="q" :placeholder="t('library.searchPlaceholder')" />
    </div>

    <div
      class="mb-lg flex flex-wrap justify-center gap-xs"
      role="tablist"
      :aria-label="t('library.tabAria')"
    >
      <button
        v-for="tab in TABS"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="inline-flex items-center gap-xs rounded-full border px-md py-xs text-xs transition"
        :class="
          activeTab === tab.id
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
        "
        @click="activeTab = tab.id"
      >
        <span>{{ tab.label }}</span>
        <span class="rounded-full bg-muted px-xs text-[0.6rem] text-muted-foreground">{{ tab.count }}</span>
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
          <div class="flex items-baseline justify-between gap-xs text-xs text-muted-foreground">
            <span class="shrink-0 font-mono">{{ cornerLabel(c) }}</span>
            <span
              class="min-w-0 truncate font-display tracking-[0.18em] text-[0.65rem] uppercase"
              :title="c.nameEn"
            >
              {{ c.nameEn }}
            </span>
          </div>
          <div
            class="flex aspect-[2/3] items-center justify-center overflow-hidden rounded-md bg-muted/40"
            :class="cardArtTheme === 'minimal' ? 'p-xs' : 'p-0'"
          >
            <CardArtwork :card="c" :theme="cardArtTheme" :minor-style="minorStyle" lazy />
          </div>
          <div class="truncate font-display text-base" :title="c._localizedName">
            {{ c._localizedName }}
          </div>
          <div class="flex min-h-[1.25rem] flex-wrap gap-xs overflow-hidden">
            <Badge
              v-for="k in c._localizedKeywords.slice(0, 2)"
              :key="k"
              variant="secondary"
              class="max-w-full overflow-hidden whitespace-nowrap text-[0.65rem]"
              :title="k"
            >
              {{ k }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <p v-if="filtered.length === 0" class="mt-xl text-center text-sm text-muted-foreground">
      {{ t('library.noResults') }}
    </p>
  </section>
</template>
