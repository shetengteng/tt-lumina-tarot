<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
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
import type { ReadingRecord } from '@/types';

const router = useRouter();
const { t } = useI18n();
const readingStore = useReadingStore();
const { getName, getField, getKeywords } = useCardI18n();
const { spreadPositionName } = useTarotI18n();

const note = ref('');

const spread = computed(() =>
  readingStore.current?.spreadId ? getSpreadById(readingStore.current.spreadId) : null
);

const drawn = computed(() => readingStore.current?.cards ?? []);

const shareDialogOpen = ref(false);
const shareDraftRecord = ref<ReadingRecord | null>(null);

onMounted(() => {
  if (!readingStore.current || drawn.value.length === 0) {
    router.replace({ name: 'spread' });
  }
});

function positionName(idx: number) {
  const fallback = t('reveal.nthCard', { n: idx + 1 });
  if (!spread.value) return fallback;
  const inSpread = spread.value.positions[idx]?.name ?? fallback;
  return spreadPositionName(spread.value.id, idx, inSpread);
}

function buildDraftRecord(): ReadingRecord {
  const cur = readingStore.current!;
  return {
    id: 'draft',
    createdAt: Date.now(),
    spreadId: cur.spreadId,
    question: cur.question,
    mood: cur.mood,
    cards: cur.cards.map((c) => ({ ...c })),
    note: note.value.trim() || undefined,
  };
}

function openShare() {
  if (!readingStore.current || drawn.value.length === 0) return;
  shareDraftRecord.value = buildDraftRecord();
  shareDialogOpen.value = true;
}

function finish() {
  const rec = readingStore.finalizeReading(note.value.trim() || undefined);
  readingStore.clearCurrent();
  if (rec) router.push({ name: 'history' });
  else router.push({ name: 'home' });
}

function discard() {
  readingStore.clearCurrent();
  router.push({ name: 'home' });
}
</script>

<template>
  <section class="mx-auto max-w-4xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('reading.pageLabel') }}</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('reading.title') }}</h1>
      <p v-if="readingStore.current?.question" class="mx-auto mt-sm max-w-xl text-sm text-muted-foreground">
        <span class="text-primary">「</span>{{ readingStore.current.question }}<span class="text-primary">」</span>
      </p>
    </header>

    <div class="space-y-md">
      <Card v-for="d in drawn" :key="d.positionIndex">
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
            <Textarea id="note" v-model="note" :rows="4" :placeholder="t('reading.notePlaceholder')" :maxlength="500" />
            <div class="text-right text-xs text-muted-foreground">{{ t('reading.noteCounter', { count: note.length }) }}</div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-xs">
            <Button variant="ghost" @click="discard">{{ t('reading.discardThisReading') }}</Button>
            <Button variant="outline" @click="openShare">{{ t('reading.shareAction') }}</Button>
            <Button variant="glow" size="lg" @click="finish">{{ t('reading.saveAction') }}</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <ShareDialog
      v-model:open="shareDialogOpen"
      :record="shareDraftRecord"
    />
  </section>
</template>
