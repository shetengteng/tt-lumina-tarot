<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import TarotCardVue from '@/components/tarot/TarotCard.vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { CardRank } from '@/types';
import { ALL_CARDS, SUITS, getCardById } from '@/data/cards';

const route = useRoute();
const router = useRouter();

const card = computed(() => getCardById(String(route.params.id)) ?? null);

const currentIndex = computed(() => {
  if (!card.value) return -1;
  return ALL_CARDS.findIndex((c) => c.id === card.value!.id);
});

const prevCard = computed(() =>
  currentIndex.value > 0 ? ALL_CARDS[currentIndex.value - 1] : null
);

const nextCard = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < ALL_CARDS.length - 1
    ? ALL_CARDS[currentIndex.value + 1]
    : null
);

const RANK_LABEL: Record<CardRank, string> = {
  ace: 'Ace',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
  '10': 'Ten',
  page: 'Page',
  knight: 'Knight',
  queen: 'Queen',
  king: 'King',
};

const eyebrowText = computed(() => {
  const c = card.value;
  if (!c) return '';
  if (c.arcana === 'minor' && c.suit) {
    const suitInfo = SUITS[c.suit];
    return `${suitInfo.label} · ${c.nameEn.toUpperCase()}`;
  }
  return `${String(c.number).padStart(2, '0')} · ${c.nameEn.toUpperCase()}`;
});
</script>

<template>
  <section v-if="card" class="mx-auto max-w-4xl px-md pt-2xl pb-2xl">
    <div class="mb-lg flex items-center justify-between gap-md">
      <Button
        variant="ghost"
        :disabled="!prevCard"
        @click="prevCard && router.push({ name: 'card-detail', params: { id: prevCard.id } })"
      >
        ← {{ prevCard?.name ?? '' }}
      </Button>
      <Button variant="outline" @click="router.push({ name: 'library' })">回到图鉴</Button>
      <Button
        variant="ghost"
        :disabled="!nextCard"
        @click="nextCard && router.push({ name: 'card-detail', params: { id: nextCard.id } })"
      >
        {{ nextCard?.name ?? '' }} →
      </Button>
    </div>

    <Card>
      <CardContent class="grid gap-lg p-lg md:grid-cols-[240px_1fr] md:p-xl">
        <div class="flex flex-col items-center gap-xs">
          <TarotCardVue :card="card" :reversed="false" :flipped="true" size="lg" />
          <div class="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {{ eyebrowText }}
          </div>
        </div>

        <div class="flex flex-col gap-md">
          <div>
            <h1 class="font-display text-4xl tracking-wide">{{ card.name }}</h1>
            <p class="mt-sm text-sm text-muted-foreground handwritten">{{ card.summary }}</p>
          </div>

          <div class="flex flex-wrap gap-xs">
            <Badge v-if="card.arcana === 'major'" variant="default">大阿卡那</Badge>
            <Badge v-else-if="card.suit" variant="default">
              小阿卡那 · {{ SUITS[card.suit].label }}
            </Badge>
            <Badge v-if="card.arcana === 'minor' && card.rank" variant="outline">
              {{ RANK_LABEL[card.rank] }}
            </Badge>
            <Badge variant="outline" v-if="card.element">元素 · {{ card.element }}</Badge>
            <Badge variant="outline" v-if="card.planet">行星 · {{ card.planet }}</Badge>
            <Badge variant="outline" v-if="card.zodiac">星座 · {{ card.zodiac }}</Badge>
          </div>

          <div class="flex flex-wrap gap-xs">
            <Badge v-for="k in card.keywords" :key="k" variant="secondary">
              # {{ k }}
            </Badge>
          </div>

          <Separator />

          <Tabs default-value="upright" class="w-full">
            <TabsList class="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="upright">正位</TabsTrigger>
              <TabsTrigger value="reversed">逆位</TabsTrigger>
            </TabsList>

            <TabsContent value="upright">
              <div class="space-y-md text-sm leading-relaxed">
                <p><span class="font-display text-primary">核心 · </span>{{ card.upright.meaning }}</p>
                <p><span class="font-display text-primary">情感 · </span>{{ card.upright.love }}</p>
                <p><span class="font-display text-primary">事业 · </span>{{ card.upright.career }}</p>
                <p><span class="font-display text-primary">建议 · </span>{{ card.upright.advice }}</p>
              </div>
            </TabsContent>

            <TabsContent value="reversed">
              <div class="space-y-md text-sm leading-relaxed">
                <p><span class="font-display text-destructive">核心 · </span>{{ card.reversed.meaning }}</p>
                <p><span class="font-display text-destructive">情感 · </span>{{ card.reversed.love }}</p>
                <p><span class="font-display text-destructive">事业 · </span>{{ card.reversed.career }}</p>
                <p><span class="font-display text-destructive">建议 · </span>{{ card.reversed.advice }}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  </section>

  <section v-else class="mx-auto max-w-xl px-md py-2xl text-center">
    <p class="text-muted-foreground">未找到这张牌。</p>
    <Button class="mt-md" @click="router.push({ name: 'library' })">回到图鉴</Button>
  </section>
</template>
