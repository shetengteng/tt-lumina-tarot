<script setup lang="ts">
import type { CardBackVariant } from '@/types';

withDefaults(
  defineProps<{
    variant?: CardBackVariant;
  }>(),
  { variant: 'classic' }
);
</script>

<template>
  <svg
    class="card-back-svg"
    viewBox="0 0 100 160"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <template v-if="variant === 'classic'">
      <rect
        x="6" y="6" width="88" height="148" rx="4"
        fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"
      />
      <circle cx="50" cy="80" r="32" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.5" />
      <circle cx="50" cy="80" r="22" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.7" />
      <path
        d="M50 60 L52 78 L70 80 L52 82 L50 100 L48 82 L30 80 L48 78 Z"
        fill="currentColor" opacity="0.95"
      />
      <circle cx="50" cy="80" r="2" class="dot-bg" />
    </template>

    <template v-else-if="variant === 'celestial'">
      <rect
        x="6" y="6" width="88" height="148" rx="4"
        fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.3"
      />
      <g opacity="0.85">
        <line x1="20" y1="40" x2="32" y2="48" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
        <line x1="32" y1="48" x2="44" y2="58" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
        <line x1="44" y1="58" x2="56" y2="62" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
        <line x1="56" y1="62" x2="68" y2="58" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
        <line x1="68" y1="58" x2="78" y2="50" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
        <line x1="78" y1="50" x2="86" y2="40" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
        <circle cx="20" cy="40" r="1.6" fill="currentColor" />
        <circle cx="32" cy="48" r="1.3" fill="currentColor" />
        <circle cx="44" cy="58" r="1.4" fill="currentColor" />
        <circle cx="56" cy="62" r="1.5" fill="currentColor" />
        <circle cx="68" cy="58" r="1.3" fill="currentColor" />
        <circle cx="78" cy="50" r="1.4" fill="currentColor" />
        <circle cx="86" cy="40" r="1.7" fill="currentColor" />
      </g>
      <path
        d="M50 90 A20 20 0 1 0 50 130 A14 20 0 1 1 50 90 Z"
        fill="currentColor" opacity="0.85"
      />
      <circle cx="15" cy="100" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="85" cy="105" r="0.7" fill="currentColor" opacity="0.5" />
      <circle cx="25" cy="135" r="0.6" fill="currentColor" opacity="0.45" />
      <circle cx="80" cy="140" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="50" cy="22" r="0.9" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="70" r="0.5" fill="currentColor" opacity="0.4" />
    </template>

    <template v-else-if="variant === 'sacred'">
      <circle cx="50" cy="80" r="38" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4" />
      <g opacity="0.7">
        <circle v-for="i in 12" :key="`z-${i}`"
          :cx="50 + 38 * Math.cos(((i - 1) * Math.PI * 2) / 12 - Math.PI / 2)"
          :cy="80 + 38 * Math.sin(((i - 1) * Math.PI * 2) / 12 - Math.PI / 2)"
          r="1.2" fill="currentColor"
        />
      </g>
      <circle cx="50" cy="80" r="26" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.5" />
      <polygon points="50,55 72,90 28,90" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.9" />
      <polygon points="50,105 28,70 72,70" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.9" />
      <circle cx="50" cy="80" r="2" fill="currentColor" />
    </template>

    <template v-else-if="variant === 'floral'">
      <g opacity="0.75" stroke="currentColor" stroke-width="0.55" fill="none">
        <circle cx="50" cy="80" r="14" />
        <circle cx="50" cy="66" r="14" />
        <circle cx="50" cy="94" r="14" />
        <circle cx="62.12" cy="73" r="14" />
        <circle cx="62.12" cy="87" r="14" />
        <circle cx="37.88" cy="73" r="14" />
        <circle cx="37.88" cy="87" r="14" />
      </g>
      <circle cx="50" cy="80" r="34" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.4" />
      <g opacity="0.5" stroke="currentColor" stroke-width="0.5" fill="none" stroke-linecap="round">
        <path d="M14 18 Q20 22 18 30" />
        <path d="M86 18 Q80 22 82 30" />
        <path d="M14 142 Q20 138 18 130" />
        <path d="M86 142 Q80 138 82 130" />
      </g>
      <circle cx="50" cy="80" r="1.5" fill="currentColor" opacity="0.95" />
    </template>

    <template v-else-if="variant === 'eye'">
      <circle cx="50" cy="80" r="34" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4" />
      <circle cx="50" cy="80" r="22" fill="none" stroke="currentColor" stroke-width="0.55" opacity="0.5" />
      <g opacity="0.5" stroke="currentColor" stroke-width="0.4">
        <line v-for="i in 12" :key="`r-${i}`"
          :x1="50 + 26 * Math.cos(((i - 1) * Math.PI * 2) / 12 - Math.PI / 2)"
          :y1="80 + 26 * Math.sin(((i - 1) * Math.PI * 2) / 12 - Math.PI / 2)"
          :x2="50 + 32 * Math.cos(((i - 1) * Math.PI * 2) / 12 - Math.PI / 2)"
          :y2="80 + 32 * Math.sin(((i - 1) * Math.PI * 2) / 12 - Math.PI / 2)"
        />
      </g>
      <path
        d="M30 80 Q50 60 70 80 Q50 100 30 80 Z"
        fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.95"
      />
      <circle cx="50" cy="80" r="6.5" fill="currentColor" opacity="0.85" />
      <circle cx="50" cy="80" r="2.4" class="dot-bg" />
      <circle cx="52" cy="78.4" r="0.9" class="dot-bg" opacity="0.95" />
    </template>
  </svg>
</template>

<style scoped>
.card-back-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: hsl(var(--primary));
  pointer-events: none;
}

.dot-bg {
  fill: hsl(var(--card));
}

html[data-theme='mystic'] .card-back-svg {
  color: hsl(38 47% 58%);
}
html[data-theme='mystic'] .dot-bg {
  fill: hsl(229 35% 12%);
}

html[data-theme='nature'] .card-back-svg {
  color: hsl(37 67% 93%);
}
html[data-theme='nature'] .dot-bg {
  fill: hsl(18 42% 35%);
}

html[data-theme='minimal'] .card-back-svg {
  color: hsl(0 0% 12%);
}
html[data-theme='minimal'] .dot-bg {
  fill: hsl(40 25% 96%);
}
</style>
