<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TarotCardVue from '@/components/tarot/TarotCard.vue';
import { useReadingStore } from '@/stores/reading';
import { getCardById } from '@/data/cards';
import { getSpreadById } from '@/data/spreads';
import { sleep } from '@/lib/utils';

const router = useRouter();
const readingStore = useReadingStore();

const spread = computed(() =>
  readingStore.current?.spreadId ? getSpreadById(readingStore.current.spreadId) : null
);

const drawn = computed(() => readingStore.current?.cards ?? []);

const flippedState = reactive<Record<number, boolean>>({});

const allFlipped = computed(() =>
  drawn.value.length > 0 && drawn.value.every((d) => flippedState[d.positionIndex])
);

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
  for (const d of drawn.value) {
    flippedState[d.positionIndex] = true;
    await sleep(280);
  }
}

function next() {
  router.push({ name: 'reading' });
}

function positionName(idx: number) {
  if (!spread.value) return `第 ${idx + 1} 张`;
  return spread.value.positions[idx]?.name ?? `第 ${idx + 1} 张`;
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">Step 4 / 4</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">翻开你的牌</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        点击牌面揭示，或一次全部翻开。
      </p>
    </header>

    <Card>
      <CardContent class="p-lg md:p-xl">
        <div class="flex flex-wrap items-stretch justify-center gap-lg">
          <div
            v-for="d in drawn"
            :key="d.positionIndex"
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
                {{ getCardById(d.cardId)?.name }}
                <span v-if="d.reversed" class="text-destructive">· 逆位</span>
              </template>
              <template v-else>未翻开</template>
            </div>
          </div>
        </div>

        <div class="mt-xl flex flex-wrap items-center justify-center gap-md">
          <Button variant="outline" size="lg" :disabled="allFlipped" @click="revealAll">
            一次全部翻开
          </Button>
          <Button variant="glow" size="lg" :disabled="!allFlipped" @click="next">
            进入解读 →
          </Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
