<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SPREADS } from '@/data/spreads';
import { useReadingStore } from '@/stores/reading';
import { cn } from '@/lib/utils';

const router = useRouter();
const readingStore = useReadingStore();
const selectedId = ref<string>(readingStore.current?.spreadId ?? 'three-card');

function difficultyLabel(d: 'beginner' | 'intermediate' | 'advanced') {
  return d === 'beginner' ? '入门' : d === 'intermediate' ? '进阶' : '深度';
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
      <div class="text-xs uppercase tracking-[0.4em] text-primary">Step 1 / 4</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">选择你的牌阵</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        不同牌阵适合不同深度的问题，选择一个与你当下情绪契合的结构。
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
          <div class="flex items-start justify-between gap-md">
            <div>
              <div class="font-display text-xs uppercase tracking-[0.3em] text-primary">{{ s.subtitle }}</div>
              <h2 class="mt-xs font-display text-xl">{{ s.name }}</h2>
            </div>
            <Badge variant="outline">{{ difficultyLabel(s.difficulty) }} · {{ s.count }} 张</Badge>
          </div>
          <p class="text-sm text-muted-foreground">{{ s.description }}</p>

          <div class="flex flex-wrap gap-xs">
            <Badge v-for="p in s.positions" :key="p.index" variant="secondary" class="font-normal">
              {{ p.index + 1 }}. {{ p.name }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="mt-xl flex justify-center">
      <Button variant="glow" size="lg" :disabled="!selectedId" @click="next">
        进入下一步 →
      </Button>
    </div>
  </section>
</template>
