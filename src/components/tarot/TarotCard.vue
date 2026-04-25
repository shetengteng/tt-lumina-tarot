<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { TarotCardDef, CardRank } from '@/types';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';
import CardBackPattern from './CardBackPattern.vue';
import CardArtwork from './CardArtwork.vue';

const props = withDefaults(
  defineProps<{
    card?: TarotCardDef | null;
    reversed?: boolean;
    flipped?: boolean;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    class?: string;
  }>(),
  { reversed: false, flipped: false, size: 'md', interactive: false }
);

const settings = useSettingsStore();
const { effectiveCardBack, minorStyle, cardArtTheme } = storeToRefs(settings);

const useImageArt = computed(() => cardArtTheme.value !== 'minimal');

const emit = defineEmits<{
  (e: 'flip'): void;
}>();

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-[84px] h-[140px] text-xs';
    case 'lg':
      return 'w-[200px] h-[336px] text-base';
    case 'md':
    default:
      return 'w-[140px] h-[234px] text-sm';
  }
});

const RANK_LABEL: Record<CardRank, string> = {
  ace: 'A',
  '2': 'II',
  '3': 'III',
  '4': 'IV',
  '5': 'V',
  '6': 'VI',
  '7': 'VII',
  '8': 'VIII',
  '9': 'IX',
  '10': 'X',
  page: 'P',
  knight: 'Kn',
  queen: 'Q',
  king: 'K',
};

const cornerLabel = computed(() => {
  if (!props.card) return '—';
  if (props.card.arcana === 'minor' && props.card.rank) {
    return RANK_LABEL[props.card.rank];
  }
  return String(props.card.number).padStart(2, '0');
});

function onClick() {
  if (props.interactive) emit('flip');
}
</script>

<template>
  <button
    type="button"
    :class="cn('tarot-card group perspective', sizeClass, props.class)"
    :data-flipped="flipped"
    :data-reversed="reversed"
    :disabled="!interactive"
    @click="onClick"
  >
    <div class="relative h-full w-full transition-transform duration-700" style="transform-style: preserve-3d" :class="flipped ? 'is-flipped' : ''">
      <div class="card-face card-back absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <template v-if="effectiveCardBack.kind === 'image'">
          <img
            class="card-back-img"
            :src="effectiveCardBack.src"
            alt=""
            decoding="async"
            aria-hidden="true"
          />
        </template>
        <template v-else>
          <CardBackPattern :variant="effectiveCardBack.variant" />
        </template>
      </div>

      <div
        class="card-face card-front absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm"
        :class="useImageArt && card ? 'p-0' : 'p-md'"
      >
        <template v-if="useImageArt && card">
          <div class="flex h-full w-full items-center justify-center" :class="[reversed ? 'rotate-180' : '']">
            <CardArtwork :card="card" :theme="cardArtTheme" :minor-style="minorStyle" />
          </div>
          <span
            v-if="reversed"
            class="absolute right-1.5 top-1.5 rounded-sm bg-destructive/85 px-1 py-px text-[0.6rem] font-semibold uppercase leading-none text-white shadow"
          >REV</span>
        </template>
        <template v-else>
          <div class="flex items-start justify-between text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            <span>{{ cornerLabel }}</span>
            <span v-if="reversed" class="text-destructive">REV</span>
          </div>
          <div class="flex flex-1 items-center justify-center py-xs" :class="[reversed ? 'rotate-180' : '']">
            <template v-if="card">
              <CardArtwork :card="card" :theme="cardArtTheme" :minor-style="minorStyle" />
            </template>
            <template v-else>
              <span class="select-none text-[clamp(2.4rem,5vw,3.2rem)] leading-none">?</span>
            </template>
          </div>
          <div class="text-center">
            <div class="font-display text-[0.85em] leading-tight">{{ card?.name ?? '未揭示' }}</div>
            <div class="mt-0.5 text-[0.7em] tracking-widest text-muted-foreground">
              {{ card?.nameEn ?? 'HIDDEN' }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </button>
</template>

<style scoped>
.tarot-card {
  display: inline-block;
  background: transparent;
  border-radius: theme('borderRadius.lg');
  transition: transform 240ms ease, filter 240ms ease;
}
.tarot-card:disabled {
  cursor: default;
}
.tarot-card:not(:disabled):hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 8px 20px hsl(var(--primary) / 0.25));
}
.perspective {
  perspective: 1400px;
}
.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: theme('borderRadius.lg');
}
.card-front {
  transform: rotateY(180deg);
}
.is-flipped {
  transform: rotateY(180deg);
}
.card-back-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}
</style>
