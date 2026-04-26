<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardArtwork from '@/components/tarot/CardArtwork.vue';
import ShareDialog from '@/components/share/ShareDialog.vue';
import { useReadingStore } from '@/stores/reading';
import { useSettingsStore } from '@/stores/settings';
import { getSpreadById } from '@/data/spreads';
import { getCardById } from '@/data/cards';
import { formatRelative } from '@/lib/utils';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';
import type { CardRank, ReadingRecord } from '@/types';

const RANK_LABEL: Record<CardRank, string> = {
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

const router = useRouter();
const { t } = useI18n();
const readingStore = useReadingStore();
const settings = useSettingsStore();
const { historySorted } = storeToRefs(readingStore);
const { getName } = useCardI18n();
const { spreadName: spreadNameOf, spreadPositionName } = useTarotI18n();

function cornerLabelOf(cardId: string): string {
  const card = getCardById(cardId);
  if (!card) return '?';
  if (card.arcana === 'minor' && card.rank) return RANK_LABEL[card.rank];
  return String(card.number).padStart(2, '0');
}

function openCard(cardId: string) {
  router.push({ name: 'card-detail', params: { id: cardId } });
}

function openDetail(id: string) {
  router.push({ name: 'history-detail', params: { id } });
}

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
  if (p === 'today') return t('history.periodToday');
  if (p === 'yesterday') return t('history.periodYesterday');
  if (p === 'thisWeek') return t('history.periodThisWeek');
  return p;
}

function spreadName(id: string) {
  const spread = getSpreadById(id);
  if (!spread) return id;
  return spreadNameOf(spread);
}

function summaryOf(r: ReadingRecord): string {
  if (r.cards.length === 0) return '—';
  const spread = getSpreadById(r.spreadId);
  if (r.cards.length === 1) {
    const only = r.cards[0];
    const card = getCardById(only.cardId);
    if (!card) return '—';
    const status = only.reversed ? t('common.reversed') : t('common.upright');
    const summary = card.summary;
    const brief = summary.length > 30 ? summary.slice(0, 30) + '…' : summary;
    return t('history.summarySingle', { name: getName(card), status, brief });
  }
  if (r.cards.length <= 3) {
    return r.cards
      .map((c) => {
        const card = getCardById(c.cardId);
        const fallbackPos = t('reveal.nthCard', { n: c.positionIndex + 1 });
        const inSpread = spread?.positions[c.positionIndex]?.name ?? fallbackPos;
        const pos = spread
          ? spreadPositionName(spread.id, c.positionIndex, inSpread)
          : fallbackPos;
        const name = card ? getName(card) : '?';
        return `${pos}：${name}${c.reversed ? '·' + t('common.rev') : ''}`;
      })
      .join(' · ');
  }
  const names = r.cards
    .map((c) => {
      const card = getCardById(c.cardId);
      return card ? getName(card) : '?';
    })
    .slice(0, 4)
    .join('、');
  const more = r.cards.length > 4 ? t('history.summaryMore', { count: r.cards.length }) : '';
  return t('history.summaryMultiple', { count: r.cards.length, names, more });
}

function removeOne(id: string) {
  readingStore.removeRecord(id);
}

function clearAll() {
  if (typeof window !== 'undefined' && !window.confirm(t('history.clearAllConfirm'))) return;
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

const shareDialogOpen = ref(false);
const shareTargetRecord = ref<ReadingRecord | null>(null);
function openShare(r: ReadingRecord) {
  shareTargetRecord.value = r;
  shareDialogOpen.value = true;
}
</script>

<template>
  <section class="mx-auto max-w-4xl px-md pt-2xl pb-2xl">
    <header class="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
      <div>
        <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('history.pageLabel') }}</div>
        <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('history.title') }}</h1>
        <p v-if="!isEmpty" class="mt-sm text-sm text-muted-foreground">
          {{ t('history.countSummary', { total: totalCount, monthly: monthlyCount }) }}
        </p>
        <p v-else class="mt-sm text-sm text-muted-foreground">
          {{ t('history.keepHint') }}
        </p>
      </div>
      <div class="flex gap-xs">
        <Button v-if="!isEmpty" variant="outline" size="sm" @click="exportJSON">{{ t('history.actionExport') }}</Button>
        <Button v-if="!isEmpty" variant="outline" size="sm" class="border-destructive/40 text-destructive hover:bg-destructive/10" @click="clearAll">
          {{ t('history.actionClear') }}
        </Button>
        <Button variant="glow" size="sm" @click="router.push({ name: 'spread' })">{{ t('history.actionNew') }}</Button>
      </div>
    </header>

    <Card v-if="isEmpty">
      <CardContent class="flex flex-col items-center gap-md p-xl text-center">
        <span class="text-4xl text-primary">◌</span>
        <p class="text-sm text-muted-foreground">{{ t('history.emptyTitle') }}</p>
        <Button variant="glow" @click="router.push({ name: 'spread' })">{{ t('history.emptyCta') }}</Button>
      </CardContent>
    </Card>

    <div v-else class="space-y-md">
      <article
        v-for="r in historySorted"
        :key="r.id"
        class="group rounded-lg border border-border/70 bg-card/80 p-lg text-card-foreground shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="mb-sm flex items-center justify-between gap-md">
          <span class="text-xs text-muted-foreground">
            {{ formatRelative(r.createdAt) }} · {{ spreadName(r.spreadId) }}
          </span>
          <span class="rounded-full bg-muted px-sm py-xs text-[11px] text-muted-foreground">
            {{ periodLabel(periodOf(r.createdAt)) }}
          </span>
        </div>

        <button
          type="button"
          class="history-headline-link block w-full text-left"
          :aria-label="t('history.openDetailAria', { name: r.question || t('history.unnamed') })"
          @click="openDetail(r.id)"
        >
          <h3 class="mb-xs font-display text-lg leading-snug tracking-wide transition group-hover:text-primary">
            <span class="text-primary">「</span>{{ r.question || t('history.unnamed') }}<span class="text-primary">」</span>
          </h3>

          <p class="mb-md text-sm leading-relaxed text-muted-foreground">
            {{ summaryOf(r) }}
          </p>
        </button>

        <div class="flex items-end justify-between gap-md">
          <div class="flex flex-wrap gap-xs">
            <button
              v-for="c in r.cards"
              :key="c.cardId + c.positionIndex"
              type="button"
              class="thumb-card group relative flex h-[112px] w-[72px] flex-col items-center justify-between overflow-hidden rounded-md border border-primary/30 bg-gradient-to-b from-background/40 to-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-[0_6px_18px_hsl(var(--primary)/0.25)]"
              :class="settings.cardArtTheme === 'minimal' ? 'p-1.5' : 'p-0'"
              :title="(getName(getCardById(c.cardId)) || '?') + ' · ' + (c.reversed ? t('common.reversed') : t('common.upright'))"
              :aria-label="t('history.cardOpenAria', { name: getName(getCardById(c.cardId)) || '?', rev: c.reversed ? ' ' + t('common.reversed') : '' })"
              @click="openCard(c.cardId)"
            >
              <template v-if="settings.cardArtTheme !== 'minimal' && getCardById(c.cardId)">
                <span class="thumb-img-wrap" :class="c.reversed && 'rotate-180'">
                  <CardArtwork
                    :card="getCardById(c.cardId)!"
                    :theme="settings.cardArtTheme"
                    :minor-style="settings.minorStyle"
                    lazy
                  />
                </span>
                <span
                  v-if="c.reversed"
                  class="absolute right-1 top-1 rounded-sm bg-destructive/90 px-1 py-px text-[8px] font-semibold uppercase leading-none text-white shadow"
                >{{ t('common.revShort') }}</span>
              </template>
              <template v-else>
                <span class="self-start font-display text-[9px] font-semibold uppercase leading-none tracking-widest text-primary/80">
                  {{ cornerLabelOf(c.cardId) }}
                </span>
                <span
                  class="thumb-art-wrap flex flex-1 items-center justify-center py-0.5"
                  :class="c.reversed && 'rotate-180'"
                >
                  <template v-if="getCardById(c.cardId)">
                    <span class="thumb-illustration-fallback block">
                      <CardArtwork
                        :card="getCardById(c.cardId)!"
                        :theme="settings.cardArtTheme"
                        :minor-style="settings.minorStyle"
                        lazy
                      />
                    </span>
                  </template>
                </span>
                <span class="self-stretch truncate text-center font-display text-[10px] leading-tight text-foreground/95">
                  {{ getName(getCardById(c.cardId)) || '?' }}
                </span>
                <span
                  v-if="c.reversed"
                  class="absolute right-1 top-1 rounded-sm bg-destructive/90 px-1 py-px text-[8px] font-semibold uppercase leading-none text-white shadow"
                >{{ t('common.revShort') }}</span>
              </template>
            </button>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-xs">
            <Button
              variant="outline"
              size="sm"
              class="text-xs"
              @click="openDetail(r.id)"
            >
              {{ t('history.actionView') }}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="text-xs text-muted-foreground hover:text-primary"
              @click="openShare(r)"
            >
              {{ t('history.actionShare') }}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="text-xs text-muted-foreground hover:text-destructive"
              @click="removeOne(r.id)"
            >
              {{ t('common.delete') }}
            </Button>
          </div>
        </div>

        <p
          v-if="r.note"
          class="mt-md rounded-md border border-border/50 bg-muted/30 p-md text-sm leading-relaxed"
        >
          <span class="mr-xs text-primary">✎</span>{{ r.note }}
        </p>
      </article>
    </div>

    <ShareDialog v-model:open="shareDialogOpen" :record="shareTargetRecord" />
  </section>
</template>

<style scoped>
.thumb-art-wrap {
  width: 100%;
}
.thumb-illustration-fallback {
  width: 52px;
  height: 67px;
  line-height: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--primary));
}
.thumb-img-wrap {
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
  border-radius: inherit;
}
.thumb-card {
  cursor: pointer;
}
.history-headline-link {
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  appearance: none;
  font: inherit;
  color: inherit;
}
.history-headline-link:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.6);
  outline-offset: 4px;
  border-radius: 6px;
}
</style>
