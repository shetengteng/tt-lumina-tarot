<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import TarotCardVue from '@/components/tarot/TarotCard.vue';
import { useReadingStore } from '@/stores/reading';
import { getCardById } from '@/data/cards';
import { getSpreadById } from '@/data/spreads';

const router = useRouter();
const readingStore = useReadingStore();

const note = ref('');

const spread = computed(() =>
  readingStore.current?.spreadId ? getSpreadById(readingStore.current.spreadId) : null
);

const drawn = computed(() => readingStore.current?.cards ?? []);

onMounted(() => {
  if (!readingStore.current || drawn.value.length === 0) {
    router.replace({ name: 'spread' });
  }
});

function positionName(idx: number) {
  if (!spread.value) return `第 ${idx + 1} 张`;
  return spread.value.positions[idx]?.name ?? `第 ${idx + 1} 张`;
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
      <div class="text-xs uppercase tracking-[0.4em] text-primary">Reading</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">你的牌面解读</h1>
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
              <h2 class="font-display text-2xl">{{ getCardById(d.cardId)?.name }}</h2>
              <span class="font-display text-xs uppercase tracking-[0.3em] text-primary">
                {{ getCardById(d.cardId)?.nameEn }}
              </span>
              <Badge v-if="d.reversed" variant="destructive" class="ml-xs">逆位</Badge>
              <Badge v-else variant="secondary" class="ml-xs">正位</Badge>
            </div>

            <p class="text-sm text-muted-foreground handwritten">
              {{ getCardById(d.cardId)?.summary }}
            </p>

            <div class="flex flex-wrap gap-xs">
              <Badge v-for="k in getCardById(d.cardId)?.keywords ?? []" :key="k" variant="outline">
                # {{ k }}
              </Badge>
            </div>

            <Separator />

            <Tabs default-value="meaning" class="w-full">
              <TabsList class="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="meaning">核心</TabsTrigger>
                <TabsTrigger value="love">情感</TabsTrigger>
                <TabsTrigger value="career">事业</TabsTrigger>
                <TabsTrigger value="advice">建议</TabsTrigger>
              </TabsList>
              <TabsContent value="meaning">
                <p class="text-sm leading-relaxed">
                  {{ d.reversed ? getCardById(d.cardId)?.reversed.meaning : getCardById(d.cardId)?.upright.meaning }}
                </p>
              </TabsContent>
              <TabsContent value="love">
                <p class="text-sm leading-relaxed">
                  {{ d.reversed ? getCardById(d.cardId)?.reversed.love : getCardById(d.cardId)?.upright.love }}
                </p>
              </TabsContent>
              <TabsContent value="career">
                <p class="text-sm leading-relaxed">
                  {{ d.reversed ? getCardById(d.cardId)?.reversed.career : getCardById(d.cardId)?.upright.career }}
                </p>
              </TabsContent>
              <TabsContent value="advice">
                <p class="text-sm leading-relaxed">
                  {{ d.reversed ? getCardById(d.cardId)?.reversed.advice : getCardById(d.cardId)?.upright.advice }}
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg md:p-xl">
          <div class="space-y-xs">
            <Label for="note">记录一下你的感受</Label>
            <Textarea id="note" v-model="note" :rows="4" placeholder="写下此刻的想法、触动或计划（可选）。" :maxlength="500" />
            <div class="text-right text-xs text-muted-foreground">{{ note.length }} / 500</div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-xs">
            <Button variant="ghost" @click="discard">放弃这次占卜</Button>
            <Button variant="glow" size="lg" @click="finish">保存到历史 ✦</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
