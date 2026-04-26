<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import TarotCardVue from '@/components/tarot/TarotCard.vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ALL_CARDS, getCardById } from '@/data/cards';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getName, getField, getKeywords } = useCardI18n();
const { suitLabel, rankLabel, elementLabel } = useTarotI18n();

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

const eyebrowText = computed(() => {
  const c = card.value;
  if (!c) return '';
  if (c.arcana === 'minor' && c.suit) {
    return `${suitLabel(c.suit)} · ${c.nameEn.toUpperCase()}`;
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
        ← {{ prevCard ? getName(prevCard) : '' }}
      </Button>
      <Button variant="outline" @click="router.push({ name: 'library' })">{{ t('cardDetail.backToLibrary') }}</Button>
      <Button
        variant="ghost"
        :disabled="!nextCard"
        @click="nextCard && router.push({ name: 'card-detail', params: { id: nextCard.id } })"
      >
        {{ nextCard ? getName(nextCard) : '' }} →
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
            <h1 class="font-display text-4xl tracking-wide">{{ getName(card) }}</h1>
            <p class="mt-sm text-sm text-muted-foreground handwritten">{{ getField(card, 'summary') }}</p>
          </div>

          <div class="flex flex-wrap gap-xs">
            <Badge v-if="card.arcana === 'major'" variant="default">{{ t('card.arcanaMajor') }}</Badge>
            <Badge v-else-if="card.suit" variant="default">
              {{ t('card.arcanaMinor') }} · {{ suitLabel(card.suit) }}
            </Badge>
            <Badge v-if="card.arcana === 'minor' && card.rank" variant="outline">
              {{ rankLabel(card.rank) }}
            </Badge>
            <Badge variant="outline" v-if="card.element">
              {{ t('cardDetail.elementLabel') }} · {{ elementLabel(card.element) }}
            </Badge>
            <Badge variant="outline" v-if="card.planet">{{ t('cardDetail.planetLabel') }} · {{ card.planet }}</Badge>
            <Badge variant="outline" v-if="card.zodiac">{{ t('cardDetail.zodiacLabel') }} · {{ card.zodiac }}</Badge>
          </div>

          <div class="flex flex-wrap gap-xs">
            <Badge v-for="k in getKeywords(card)" :key="k" variant="secondary">
              # {{ k }}
            </Badge>
          </div>

          <Separator />

          <Tabs default-value="upright" class="w-full">
            <TabsList class="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="upright">{{ t('common.upright') }}</TabsTrigger>
              <TabsTrigger value="reversed">{{ t('common.reversed') }}</TabsTrigger>
            </TabsList>

            <TabsContent value="upright">
              <div class="space-y-md text-sm leading-relaxed">
                <p><span class="font-display text-primary">{{ t('cardDetail.coreLabel') }} · </span>{{ getField(card, 'upright.meaning') }}</p>
                <p><span class="font-display text-primary">{{ t('cardDetail.loveLabel') }} · </span>{{ getField(card, 'upright.love') }}</p>
                <p><span class="font-display text-primary">{{ t('cardDetail.careerLabel') }} · </span>{{ getField(card, 'upright.career') }}</p>
                <p><span class="font-display text-primary">{{ t('cardDetail.adviceLabel') }} · </span>{{ getField(card, 'upright.advice') }}</p>
              </div>
            </TabsContent>

            <TabsContent value="reversed">
              <div class="space-y-md text-sm leading-relaxed">
                <p><span class="font-display text-destructive">{{ t('cardDetail.coreLabel') }} · </span>{{ getField(card, 'reversed.meaning') }}</p>
                <p><span class="font-display text-destructive">{{ t('cardDetail.loveLabel') }} · </span>{{ getField(card, 'reversed.love') }}</p>
                <p><span class="font-display text-destructive">{{ t('cardDetail.careerLabel') }} · </span>{{ getField(card, 'reversed.career') }}</p>
                <p><span class="font-display text-destructive">{{ t('cardDetail.adviceLabel') }} · </span>{{ getField(card, 'reversed.advice') }}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  </section>

  <section v-else class="mx-auto max-w-xl px-md py-2xl text-center">
    <p class="text-muted-foreground">{{ t('cardDetail.cardNotFound') }}</p>
    <Button class="mt-md" @click="router.push({ name: 'library' })">{{ t('cardDetail.backToLibrary') }}</Button>
  </section>
</template>
