<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useReadingStore } from '@/stores/reading';
import { getSpreadById } from '@/data/spreads';
import { MOODS } from '@/data/moods';
import { cn } from '@/lib/utils';

const router = useRouter();
const readingStore = useReadingStore();

const question = ref(readingStore.current?.question ?? '');
const mood = ref<string | undefined>(readingStore.current?.mood);

const spread = computed(() =>
  readingStore.current?.spreadId ? getSpreadById(readingStore.current.spreadId) : null
);

const canGoNext = computed(() => question.value.trim().length >= 4);

onMounted(() => {
  if (!readingStore.current) router.replace({ name: 'spread' });
});

function next() {
  if (!readingStore.current || !canGoNext.value) return;
  readingStore.current.question = question.value.trim();
  readingStore.current.mood = mood.value;
  router.push({ name: 'shuffle' });
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">Step 2 / 4</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">写下你的问题</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        一个具体、可回答的问题，会让牌面更聚焦。
      </p>
    </header>

    <Card>
      <CardContent class="space-y-lg p-lg md:p-xl">
        <div v-if="spread" class="rounded-md border border-border/60 bg-muted/40 p-md text-sm text-muted-foreground">
          <span class="text-primary">●</span>
          当前牌阵：<span class="font-medium text-foreground">{{ spread.name }}</span>
          <span class="mx-xs opacity-50">·</span>{{ spread.count }} 张
        </div>

        <div class="space-y-xs">
          <Label for="q">你的问题</Label>
          <Textarea
            id="q"
            v-model="question"
            placeholder="例如：这段关系中我真正在意的是什么？ / 下一步工作选择该考虑哪些因素？"
            :rows="5"
            :maxlength="280"
          />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>至少 4 个字，最多 280 字。</span>
            <span>{{ question.length }} / 280</span>
          </div>
        </div>

        <div class="space-y-xs">
          <Label>此刻的心情（可选）</Label>
          <div class="flex flex-wrap gap-xs">
            <button
              v-for="m in MOODS"
              :key="m.id"
              type="button"
              :class="
                cn(
                  'inline-flex items-center gap-xs rounded-full border border-border px-md py-1.5 text-sm text-muted-foreground transition-colors',
                  mood === m.id
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'hover:bg-accent/30 hover:text-foreground'
                )
              "
              @click="mood = mood === m.id ? undefined : m.id"
            >
              <span class="text-primary">{{ m.emoji }}</span>
              {{ m.label }}
            </button>
          </div>
        </div>

        <div class="flex justify-end">
          <Button variant="glow" size="lg" :disabled="!canGoNext" @click="next">
            去洗牌 →
          </Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
