<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SPREADS } from '@/data/spreads';
import { useReadingStore } from '@/stores/reading';
import { useTarotI18n } from '@/composables/useTarotI18n';
import { cn } from '@/lib/utils';

const router = useRouter();
const { t } = useI18n();
const readingStore = useReadingStore();
const { spreadName, spreadSubtitle, spreadDescription, spreadPositionName } = useTarotI18n();
const selectedId = ref<string>(readingStore.current?.spreadId ?? 'three-card');

function difficultyLabel(d: 'beginner' | 'intermediate' | 'advanced') {
  return d === 'beginner'
    ? t('spread.difficultyBeginner')
    : d === 'intermediate'
      ? t('spread.difficultyIntermediate')
      : t('spread.difficultyAdvanced');
}

function next() {
  const spread = SPREADS.find((s) => s.id === selectedId.value);
  if (!spread) return;
  readingStore.startReading(spread.id, readingStore.current?.question ?? '');
  router.push({ name: 'question' });
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('spread.pageLabel') }}</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('spread.title') }}</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        {{ t('spread.subtitle') }}
      </p>
    </header>

    <div class="grid gap-md md:grid-cols-2">
      <Card
        v-for="s in SPREADS"
        :key="s.id"
        :class="
          cn(
            'cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg',
            selectedId === s.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          )
        "
        @click="selectedId = s.id"
      >
        <CardContent class="flex flex-col gap-md p-lg">
          <div class="flex items-start justify-between gap-sm">
            <div class="min-w-0 flex-1">
              <div class="font-display text-xs uppercase tracking-[0.3em] text-primary">{{ spreadSubtitle(s) }}</div>
              <h2 class="mt-xs font-display text-xl">{{ spreadName(s) }}</h2>
            </div>
            <Badge variant="outline" class="shrink-0 whitespace-nowrap text-[11px]">
              {{ difficultyLabel(s.difficulty) }} · {{ t('spread.countLabel', { count: s.count }) }}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground">{{ spreadDescription(s) }}</p>

          <div class="flex flex-wrap gap-xs">
            <Badge v-for="p in s.positions" :key="p.index" variant="secondary" class="font-normal">
              {{ p.index + 1 }}. {{ spreadPositionName(s.id, p.index, p.name) }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="mt-xl flex justify-center">
      <Button variant="glow" size="lg" :disabled="!selectedId" @click="next">
        {{ t('spread.nextStep') }}
      </Button>
    </div>
  </section>
</template>
