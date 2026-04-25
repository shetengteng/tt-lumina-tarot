<script setup lang="ts">
import { computed } from 'vue';
import type { CardSuit, CardRank, MinorIllustrationStyle } from '@/types';

const props = withDefaults(
  defineProps<{
    suit: CardSuit;
    rank: CardRank;
    style?: MinorIllustrationStyle;
  }>(),
  { style: 'symbol' }
);

interface Slot {
  x: number;
  y: number;
  scale?: number;
}

// 100 x 130 viewBox. Numeric ranks distribute symbols geometrically; Court uses a single large center.
const LAYOUTS: Record<CardRank, Slot[]> = {
  ace: [{ x: 50, y: 65, scale: 2.6 }],
  '2': [
    { x: 50, y: 32 },
    { x: 50, y: 98 },
  ],
  '3': [
    { x: 50, y: 28 },
    { x: 30, y: 92 },
    { x: 70, y: 92 },
  ],
  '4': [
    { x: 30, y: 32 },
    { x: 70, y: 32 },
    { x: 30, y: 98 },
    { x: 70, y: 98 },
  ],
  '5': [
    { x: 30, y: 30 },
    { x: 70, y: 30 },
    { x: 50, y: 65 },
    { x: 30, y: 100 },
    { x: 70, y: 100 },
  ],
  '6': [
    { x: 30, y: 28 },
    { x: 70, y: 28 },
    { x: 30, y: 65 },
    { x: 70, y: 65 },
    { x: 30, y: 102 },
    { x: 70, y: 102 },
  ],
  '7': [
    { x: 30, y: 26 },
    { x: 70, y: 26 },
    { x: 50, y: 50 },
    { x: 30, y: 78 },
    { x: 70, y: 78 },
    { x: 30, y: 108 },
    { x: 70, y: 108 },
  ],
  '8': [
    { x: 30, y: 24 },
    { x: 70, y: 24 },
    { x: 30, y: 54 },
    { x: 70, y: 54 },
    { x: 30, y: 84 },
    { x: 70, y: 84 },
    { x: 30, y: 114 },
    { x: 70, y: 114 },
  ],
  '9': [
    { x: 26, y: 28 },
    { x: 50, y: 28 },
    { x: 74, y: 28 },
    { x: 26, y: 65 },
    { x: 50, y: 65 },
    { x: 74, y: 65 },
    { x: 26, y: 102 },
    { x: 50, y: 102 },
    { x: 74, y: 102 },
  ],
  '10': [
    { x: 26, y: 22 },
    { x: 50, y: 22 },
    { x: 74, y: 22 },
    { x: 26, y: 50 },
    { x: 50, y: 50 },
    { x: 74, y: 50 },
    { x: 26, y: 80 },
    { x: 50, y: 80 },
    { x: 74, y: 80 },
    { x: 50, y: 108 },
  ],
  page: [{ x: 50, y: 80, scale: 2.4 }],
  knight: [{ x: 50, y: 80, scale: 2.4 }],
  queen: [{ x: 50, y: 80, scale: 2.4 }],
  king: [{ x: 50, y: 80, scale: 2.4 }],
};

const slots = computed<Slot[]>(() => LAYOUTS[props.rank] ?? LAYOUTS.ace);

const COURT_RANKS: CardRank[] = ['page', 'knight', 'queen', 'king'];
const isCourt = computed(() => COURT_RANKS.includes(props.rank));

// 符号风格（symbol）：每个花色画成可识别的小图标，以 (x, y) 为中心，scale=1 约 8 个 SVG 单位宽
// 几何风格（geometric）：纯几何形状，对应火 / 水 / 风 / 土 四元素的本源
</script>

<template>
  <svg
    class="minor-illustration"
    viewBox="0 0 100 130"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 宫廷框：顶部弧线代表王权身份，根据角色配以王冠 / 光环 -->
    <g v-if="isCourt" class="court-frame">
      <path d="M22 32 Q50 14 78 32" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.55" />
      <!-- Page 侍从：朝上的小三角，象征信使 -->
      <template v-if="rank === 'page'">
        <path d="M46 22 L50 14 L54 22 Z" fill="currentColor" opacity="0.85" />
        <circle cx="50" cy="14" r="1" fill="currentColor" opacity="0.9" />
      </template>
      <!-- Knight 骑士：人字形 + 斜笔触，象征运动 -->
      <template v-else-if="rank === 'knight'">
        <path d="M40 22 L50 12 L60 22" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.85" />
        <line x1="58" y1="14" x2="68" y2="8" stroke="currentColor" stroke-width="0.8" opacity="0.7" />
      </template>
      <!-- Queen 王后：半月形王冠 -->
      <template v-else-if="rank === 'queen'">
        <path d="M40 22 Q50 8 60 22" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.85" />
        <circle cx="50" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.8" />
        <circle cx="50" cy="14" r="0.7" fill="currentColor" />
      </template>
      <!-- King 国王：三尖完整王冠 -->
      <template v-else-if="rank === 'king'">
        <path
          d="M38 24 L40 14 L46 22 L50 10 L54 22 L60 14 L62 24 Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.1"
          opacity="0.9"
        />
        <circle cx="40" cy="14" r="0.8" fill="currentColor" />
        <circle cx="50" cy="10" r="1" fill="currentColor" />
        <circle cx="60" cy="14" r="0.8" fill="currentColor" />
      </template>
    </g>

    <!-- =================== 符号风格 =================== -->
    <g v-if="props.style === 'symbol'">
      <!-- 权杖：竖直法杖，顶部小火苗 -->
      <template v-if="suit === 'wands'">
        <g v-for="(s, i) in slots" :key="`w-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <line x1="-2.5" y1="-6" x2="2.5" y2="-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <line x1="-2.5" y1="6" x2="2.5" y2="6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path
            d="M-1.6 -6 Q-1 -8.5 0 -8.5 Q1 -8.5 1.6 -6 Q1.2 -7 0 -7 Q-1.2 -7 -1.6 -6 Z"
            fill="currentColor"
            opacity="0.85"
          />
        </g>
      </template>

      <!-- 圣杯：U 形杯身搭杯柄，杯口弧形带轻微高光 -->
      <template v-else-if="suit === 'cups'">
        <g v-for="(s, i) in slots" :key="`c-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <path
            d="M-3.6 -5.5 Q-3.6 1.5 0 4 Q3.6 1.5 3.6 -5.5 Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linejoin="round"
          />
          <path
            d="M-3.6 -5.5 Q0 -4.2 3.6 -5.5"
            fill="none"
            stroke="currentColor"
            stroke-width="0.7"
            opacity="0.55"
          />
          <line x1="0" y1="4" x2="0" y2="6.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
          <ellipse cx="0" cy="6.8" rx="2.6" ry="0.7" fill="currentColor" opacity="0.85" />
        </g>
      </template>

      <!-- 宝剑：剑尖朝上，配护手与剑柄首 -->
      <template v-else-if="suit === 'swords'">
        <g v-for="(s, i) in slots" :key="`sw-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <path d="M0 -8 L1.1 5 L-1.1 5 Z" fill="currentColor" opacity="0.9" />
          <line x1="-3.5" y1="5" x2="3.5" y2="5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          <line x1="0" y1="5" x2="0" y2="7.6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
          <circle cx="0" cy="8.2" r="0.9" fill="currentColor" />
        </g>
      </template>

      <!-- 钱币：圆环内嵌五芒星 -->
      <template v-else-if="suit === 'pentacles'">
        <g v-for="(s, i) in slots" :key="`p-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <circle cx="0" cy="0" r="4.2" fill="none" stroke="currentColor" stroke-width="1.1" />
          <path
            d="M0 -3.4 L1 -1.05 L3.4 -1.05 L1.4 0.4 L2.1 2.75 L0 1.3 L-2.1 2.75 L-1.4 0.4 L-3.4 -1.05 L-1 -1.05 Z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="0" cy="0" r="0.55" fill="currentColor" opacity="0.6" />
        </g>
      </template>
    </g>

    <!-- =================== 几何风格 =================== -->
    <g v-else>
      <!-- 权杖 → 竖向条形（火焰之线） -->
      <template v-if="suit === 'wands'">
        <g v-for="(s, i) in slots" :key="`gw-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <rect x="-0.9" y="-6.5" width="1.8" height="13" rx="0.5" fill="currentColor" opacity="0.9" />
          <circle cx="0" cy="-7.6" r="0.95" fill="currentColor" opacity="0.95" />
        </g>
      </template>

      <!-- 圣杯 → 圆环内含水滴（容纳之水） -->
      <template v-else-if="suit === 'cups'">
        <g v-for="(s, i) in slots" :key="`gc-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <circle cx="0" cy="0" r="4.2" fill="none" stroke="currentColor" stroke-width="1.2" />
          <circle cx="0" cy="0" r="2.1" fill="currentColor" opacity="0.55" />
        </g>
      </template>

      <!-- 宝剑 → 向上三角（锋利思维） -->
      <template v-else-if="suit === 'swords'">
        <g v-for="(s, i) in slots" :key="`gsw-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <path d="M0 -5.5 L4.5 4.2 L-4.5 4.2 Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
          <line x1="0" y1="-3.8" x2="0" y2="3.4" stroke="currentColor" stroke-width="0.7" opacity="0.6" />
        </g>
      </template>

      <!-- 钱币 → 菱形 / 旋转 45° 的方形（落地的物质） -->
      <template v-else-if="suit === 'pentacles'">
        <g v-for="(s, i) in slots" :key="`gp-${i}`" :transform="`translate(${s.x}, ${s.y}) scale(${s.scale ?? 1})`">
          <rect
            x="-3.6"
            y="-3.6"
            width="7.2"
            height="7.2"
            rx="0.6"
            transform="rotate(45)"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
          />
          <rect
            x="-1.6"
            y="-1.6"
            width="3.2"
            height="3.2"
            transform="rotate(45)"
            fill="currentColor"
            opacity="0.85"
          />
        </g>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.minor-illustration {
  display: block;
  width: 100%;
  height: 100%;
  color: hsl(var(--primary));
  pointer-events: none;
}
</style>
