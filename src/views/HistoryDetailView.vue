<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import TarotCardVue from '@/components/tarot/TarotCard.vue';
import ShareDialog from '@/components/share/ShareDialog.vue';
import { useReadingStore } from '@/stores/reading';
import { getCardById } from '@/data/cards';
import { getSpreadById } from '@/data/spreads';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';
import { formatDate, formatRelative } from '@/lib/utils';
import type { ReadingRecord } from '@/types';

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const readingStore = useReadingStore();
const { historySorted } = storeToRefs(readingStore);
const { getName, getField, getKeywords } = useCardI18n();
const { spreadName: spreadNameOf, spreadPositionName, moodLabel } = useTarotI18n();

const recordId = computed(() => String(route.params.id ?? ''));

const record = computed<ReadingRecord | null>(() => {
  if (!recordId.value) return null;
  return historySorted.value.find((r) => r.id === recordId.value) ?? null;
});

const spread = computed(() =>
  record.value ? getSpreadById(record.value.spreadId) : null
);

const localNote = ref('');
const noteSaved = ref(false);
let noteTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  record,
  (r) => {
    if (r) localNote.value = r.note ?? '';
  },
  { immediate: true }
);

onMounted(async () => {
  await readingStore.readyPromise;
  if (!record.value) {
    router.replace({ name: 'history' });
  }
});

function positionName(idx: number) {
  const fallback = t('reveal.nthCard', { n: idx + 1 });
  if (!spread.value) return fallback;
  const inSpread = spread.value.positions[idx]?.name ?? fallback;
  return spreadPositionName(spread.value.id, idx, inSpread);
}

function saveNote() {
  if (!record.value) return;
  readingStore.updateNote(record.value.id, localNote.value.trim());
  noteSaved.value = true;
  if (noteTimer) clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    noteSaved.value = false;
  }, 1800);
}

const shareDialogOpen = ref(false);
function openShare() {
  if (!record.value) return;
  shareDialogOpen.value = true;
}

function backToHistory() {
  router.push({ name: 'history' });
}

const headerMeta = computed(() => {
  if (!record.value) return '';
  const date = formatDate(record.value.createdAt, locale.value);
  const rel = formatRelative(record.value.createdAt);
  const sname = spread.value ? spreadNameOf(spread.value) : '';
  return [date, rel, sname].filter(Boolean).join(' · ');
});

const moodText = computed(() => moodLabel(record.value?.mood));
</script>

<template>
  <section v-if="record" class="mx-auto max-w-4xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">
        {{ t('historyDetail.pageLabel') }}
      </div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">
        <span v-if="record.question">
          <span class="text-primary">「</span>{{ record.question }}<span class="text-primary">」</span>
        </span>
        <span v-else class="text-muted-foreground italic">{{ t('history.unnamed') }}</span>
      </h1>
      <p class="mx-auto mt-sm max-w-xl text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {{ headerMeta }}
        <span v-if="moodText"> · {{ moodText }}</span>
      </p>
    </header>

    <div class="space-y-md">
      <Card v-for="d in record.cards" :key="d.positionIndex">
        <CardContent class="grid gap-lg p-lg md:grid-cols-[180px_1fr] md:p-xl">
          <div class="flex flex-col items-center gap-xs">
            <TarotCardVue
              :card="getCardById(d.cardId) ?? null"
              :reversed="d.reversed"
              :flipped="true"
              size="md"
            />
            <div class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {{ positionName(d.positionIndex) }}
            </div>
          </div>

          <div class="flex flex-col gap-md">
            <div class="flex flex-wrap items-baseline gap-xs">
              <h2 class="font-display text-2xl">{{ getName(getCardById(d.cardId)) }}</h2>
              <span class="font-display text-xs uppercase tracking-[0.3em] text-primary">
                {{ getCardById(d.cardId)?.nameEn }}
              </span>
              <Badge v-if="d.reversed" variant="destructive" class="ml-xs">{{ t('common.reversed') }}</Badge>
              <Badge v-else variant="secondary" class="ml-xs">{{ t('common.upright') }}</Badge>
            </div>

            <p class="text-sm text-muted-foreground handwritten">
              {{ getField(getCardById(d.cardId), 'summary') }}
            </p>

            <div class="flex flex-wrap gap-xs">
              <Badge v-for="k in getKeywords(getCardById(d.cardId))" :key="k" variant="outline">
                # {{ k }}
              </Badge>
            </div>

            <Separator />

            <Tabs default-value="meaning" class="w-full">
              <TabsList class="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="meaning">{{ t('reading.tabCore') }}</TabsTrigger>
                <TabsTrigger value="love">{{ t('reading.tabLove') }}</TabsTrigger>
                <TabsTrigger value="career">{{ t('reading.tabCareer') }}</TabsTrigger>
                <TabsTrigger value="advice">{{ t('reading.tabAdvice') }}</TabsTrigger>
              </TabsList>
              <TabsContent value="meaning">
                <p class="text-sm leading-relaxed">
                  {{ getField(getCardById(d.cardId), d.reversed ? 'reversed.meaning' : 'upright.meaning') }}
                </p>
              </TabsContent>
              <TabsContent value="love">
                <p class="text-sm leading-relaxed">
                  {{ getField(getCardById(d.cardId), d.reversed ? 'reversed.love' : 'upright.love') }}
                </p>
              </TabsContent>
              <TabsContent value="career">
                <p class="text-sm leading-relaxed">
                  {{ getField(getCardById(d.cardId), d.reversed ? 'reversed.career' : 'upright.career') }}
                </p>
              </TabsContent>
              <TabsContent value="advice">
                <p class="text-sm leading-relaxed">
                  {{ getField(getCardById(d.cardId), d.reversed ? 'reversed.advice' : 'upright.advice') }}
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg md:p-xl">
          <div class="space-y-xs">
            <Label for="note">{{ t('reading.noteLabel') }}</Label>
            <Textarea
              id="note"
              v-model="localNote"
              :rows="4"
              :placeholder="t('reading.notePlaceholder')"
              :maxlength="500"
            />
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span :class="noteSaved ? 'text-primary' : ''">
                <span v-if="noteSaved">✓ {{ t('historyDetail.noteSaved') }}</span>
              </span>
              <span>{{ t('reading.noteCounter', { count: localNote.length }) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-xs">
            <Button variant="ghost" @click="backToHistory">
              {{ t('historyDetail.backToHistory') }}
            </Button>
            <Button variant="outline" @click="saveNote">
              {{ t('historyDetail.saveNote') }}
            </Button>
            <Button variant="glow" @click="openShare">
              {{ t('reading.shareAction') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <ShareDialog v-model:open="shareDialogOpen" :record="record" />
  </section>
</template>
