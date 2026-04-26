<script setup lang="ts">
import { computed, onMounted, reactive, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TarotCardVue from '@/components/tarot/TarotCard.vue';
import { useReadingStore } from '@/stores/reading';
import { getCardById } from '@/data/cards';
import { getSpreadById } from '@/data/spreads';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';
import { useStagedReveal } from '@/composables/useStagedReveal';

const router = useRouter();
const { t } = useI18n();
const readingStore = useReadingStore();
const { getName } = useCardI18n();
const { spreadPositionName } = useTarotI18n();
const { reveal } = useStagedReveal();

const spread = computed(() =>
  readingStore.current?.spreadId ? getSpreadById(readingStore.current.spreadId) : null
);

const drawn = computed(() => readingStore.current?.cards ?? []);

const flippedState = reactive<Record<number, boolean>>({});

const allFlipped = computed(() =>
  drawn.value.length > 0 && drawn.value.every((d) => flippedState[d.positionIndex])
);

const cardWrapsRef = useTemplateRef<HTMLDivElement[]>('cardWraps');

onMounted(() => {
  if (!readingStore.current || drawn.value.length === 0) {
    router.replace({ name: 'spread' });
    return;
  }
  for (const d of drawn.value) flippedState[d.positionIndex] = false;
});

function toggle(idx: number) {
  flippedState[idx] = !flippedState[idx];
}

async function revealAll() {
  await reveal(drawn.value.length, {
    step: (i) => {
      const d = drawn.value[i];
      if (d) flippedState[d.positionIndex] = true;
    },
    targets: () => (cardWrapsRef.value ?? []) as HTMLDivElement[],
  });
}

function next() {
  router.push({ name: 'reading' });
}

function positionName(idx: number) {
  const fallback = t('reveal.nthCard', { n: idx + 1 });
  if (!spread.value) return fallback;
  const inSpread = spread.value.positions[idx]?.name ?? fallback;
  return spreadPositionName(spread.value.id, idx, inSpread);
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('reveal.pageLabel') }}</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('reveal.title') }}</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        {{ t('reveal.subtitle') }}
      </p>
    </header>

    <Card>
      <CardContent class="p-lg md:p-xl">
        <div class="flex flex-wrap items-stretch justify-center gap-lg">
          <div
            v-for="d in drawn"
            :key="d.positionIndex"
            ref="cardWraps"
            class="flex w-[148px] flex-col items-center gap-xs md:w-[160px]"
          >
            <div class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {{ positionName(d.positionIndex) }}
            </div>
            <TarotCardVue
              :card="getCardById(d.cardId) ?? null"
              :reversed="d.reversed"
              :flipped="flippedState[d.positionIndex]"
              size="md"
              interactive
              @flip="toggle(d.positionIndex)"
            />
            <div class="text-center text-xs text-muted-foreground">
              <template v-if="flippedState[d.positionIndex]">
                {{ getName(getCardById(d.cardId)) }}
                <span v-if="d.reversed" class="text-destructive">· {{ t('common.reversed') }}</span>
              </template>
              <template v-else>{{ t('reveal.notRevealed') }}</template>
            </div>
          </div>
        </div>

        <div class="mt-xl flex flex-wrap items-center justify-center gap-md">
          <Button variant="outline" size="lg" :disabled="allFlipped" @click="revealAll">
            {{ t('reveal.flipAll') }}
          </Button>
          <Button variant="glow" size="lg" :disabled="!allFlipped" @click="next">
            {{ t('reveal.nextStep') }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
