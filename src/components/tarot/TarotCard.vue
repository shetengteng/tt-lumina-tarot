<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { TarotCardDef, CardRank } from '@/types';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';
import CardBackPattern from './CardBackPattern.vue';
import MinorIllustration from './MinorIllustration.vue';

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
const { cardBack, minorStyle } = storeToRefs(settings);

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
      <div class="card-face card-back absolute inset-0 flex items-center justify-center">
        <CardBackPattern :variant="cardBack" />
      </div>

      <div class="card-face card-front absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-border bg-card p-md text-card-foreground shadow-sm">
        <div class="flex items-start justify-between text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          <span>{{ cornerLabel }}</span>
          <span v-if="reversed" class="text-destructive">REV</span>
        </div>

        <div class="flex flex-1 items-center justify-center py-xs">
          <template v-if="card && card.arcana === 'minor' && card.suit && card.rank">
            <div class="minor-wrap" :class="[reversed ? 'rotate-180' : '']">
              <MinorIllustration :suit="card.suit" :rank="card.rank" :style="minorStyle" />
            </div>
          </template>
          <template v-else>
            <span class="select-none text-[clamp(2.4rem,5vw,3.2rem)] leading-none" :class="[reversed ? 'rotate-180' : '']">
              {{ card?.symbol ?? '?' }}
            </span>
          </template>
        </div>

        <div class="text-center">
          <div class="font-display text-[0.85em] leading-tight">{{ card?.name ?? '未揭示' }}</div>
          <div class="mt-0.5 text-[0.7em] tracking-widest text-muted-foreground">
            {{ card?.nameEn ?? 'HIDDEN' }}
          </div>
        </div>
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
.minor-wrap {
  width: 80%;
  aspect-ratio: 100 / 130;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
