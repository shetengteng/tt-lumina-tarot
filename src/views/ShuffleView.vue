<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { useReadingStore } from '@/stores/reading';
import { getSpreadById } from '@/data/spreads';
import { drawCards } from '@/lib/tarot';
import { sleep } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';
import CardBackPattern from '@/components/tarot/CardBackPattern.vue';

const HOLD_DURATION_MS = 3000;
const REVEAL_LATENCY_MS = 450;

const router = useRouter();
const { t } = useI18n();
const readingStore = useReadingStore();
const settings = useSettingsStore();

type Phase = 'idle' | 'holding' | 'drawing' | 'done';
const phase = ref<Phase>('idle');
const progress = ref(0);

const spread = computed(() =>
  readingStore.current?.spreadId ? getSpreadById(readingStore.current.spreadId) : null
);

let rafId: number | null = null;
let holdStart = 0;
let holdAccumulated = 0;

onMounted(() => {
  if (!readingStore.current || !readingStore.current.question) {
    router.replace({ name: 'spread' });
  }
});

onBeforeUnmount(() => {
  stopLoop();
});

function tick(now: number) {
  if (phase.value !== 'holding') return;
  const elapsed = now - holdStart + holdAccumulated;
  const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
  progress.value = pct;
  if (pct >= 100) {
    finishHold();
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function startHold(e?: Event) {
  if (phase.value !== 'idle') return;
  e?.preventDefault();
  // 锁定 pointer 到按下的元素：避免轻微抖动 / 离开元素 / hit-test 重算
  // 触发 pointerleave / pointercancel，从而提前结束长按。
  if (e && 'pointerId' in e) {
    const pe = e as PointerEvent;
    const target = pe.currentTarget as Element | null;
    if (target && typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(pe.pointerId);
      } catch {
        // 某些浏览器在已释放的 pointer 上调用会抛错，忽略即可
      }
    }
  }
  phase.value = 'holding';
  holdStart = performance.now();
  rafId = requestAnimationFrame(tick);
}

function cancelHold() {
  if (phase.value !== 'holding') return;
  stopLoop();
  holdAccumulated = 0;
  progress.value = 0;
  phase.value = 'idle';
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

async function finishHold() {
  stopLoop();
  if (!spread.value || !readingStore.current) {
    router.replace({ name: 'spread' });
    return;
  }
  if (phase.value === 'drawing' || phase.value === 'done') return;
  phase.value = 'drawing';
  progress.value = 100;
  await sleep(REVEAL_LATENCY_MS);
  const cards = drawCards(spread.value);
  readingStore.setDrawnCards(cards);
  phase.value = 'done';
  await sleep(REVEAL_LATENCY_MS);
  router.push({ name: 'reveal' });
}

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat) return;
  if (e.key === 'Enter' || e.key === ' ') {
    startHold(e);
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    cancelHold();
  }
}

const hintText = computed(() => {
  switch (phase.value) {
    case 'idle':
      return t('shuffle.hintIdle');
    case 'holding':
      return progress.value >= 99 ? t('shuffle.hintAlmost') : t('shuffle.hintHolding');
    case 'drawing':
      return t('shuffle.hintDrawing');
    case 'done':
      return t('shuffle.hintDone');
  }
  return '';
});

const progressLabel = computed(() => {
  if (phase.value === 'idle') return t('shuffle.progressIdle');
  if (phase.value === 'drawing' || phase.value === 'done') return t('shuffle.progressReady');
  return t('shuffle.progressDoing', { pct: Math.floor(progress.value) });
});

const isShuffling = computed(
  () => !settings.reducedMotion && (phase.value === 'holding' || phase.value === 'drawing')
);
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-md pt-2xl pb-2xl">
    <header class="mb-xl text-center">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('shuffle.pageLabel') }}</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('shuffle.title') }}</h1>
      <p class="mt-sm text-sm text-muted-foreground">
        {{ t('shuffle.subtitle') }}
      </p>
    </header>

    <div
      v-if="readingStore.current?.question"
      class="relative z-0 mx-auto mb-xl max-w-xl rounded-md border border-border/60 bg-muted/40 p-md text-center text-sm text-muted-foreground"
    >
      <span class="text-primary">「</span>
      {{ readingStore.current.question }}
      <span class="text-primary">」</span>
    </div>

    <!-- 长按触控区：牌堆扇形 -->
    <div class="shuffle-stack-wrap relative z-20 mb-xl flex justify-center py-2xl">
      <div
        role="button"
        tabindex="0"
        :aria-pressed="phase === 'holding'"
        :aria-label="phase === 'idle' ? t('shuffle.holdAria') : t('shuffle.holdingAria')"
        class="relative flex h-[260px] w-[220px] cursor-pointer select-none items-center justify-center outline-none touch-none md:h-[320px] md:w-[240px]"
        @pointerdown="startHold"
        @pointerup="cancelHold"
        @pointercancel="cancelHold"
        @contextmenu.prevent
        @keydown="onKeyDown"
        @keyup="onKeyUp"
        @blur="cancelHold"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="card-back shuffle-card absolute left-1/2 top-1/2 h-[220px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-lg md:h-[260px] md:w-[170px]"
          :class="isShuffling && 'is-shuffling'"
          :style="{ '--i': i }"
        >
          <template v-if="settings.effectiveCardBack.kind === 'image'">
            <img
              class="shuffle-back-img"
              :src="settings.effectiveCardBack.src"
              alt=""
              decoding="async"
              aria-hidden="true"
            />
          </template>
          <template v-else>
            <CardBackPattern :variant="settings.effectiveCardBack.variant" />
          </template>
        </div>
      </div>
    </div>

    <!-- 长按指示圈：长按 3 秒触发洗牌 -->
    <div class="relative z-10 mb-lg flex items-center justify-center gap-md">
      <button
        type="button"
        :aria-label="phase === 'idle' ? t('shuffle.holdAria') : t('shuffle.holdingAria')"
        :aria-pressed="phase === 'holding'"
        :disabled="phase === 'drawing' || phase === 'done'"
        class="relative flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-full border-2 border-primary/60 bg-background/40 outline-none transition touch-none hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_18px_hsl(var(--primary)/0.45)] focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:opacity-70 md:h-14 md:w-14"
        :class="phase === 'idle' && !settings.reducedMotion && 'animate-pulse'"
        @pointerdown="startHold"
        @pointerup="cancelHold"
        @pointercancel="cancelHold"
        @contextmenu.prevent
        @keydown="onKeyDown"
        @keyup="onKeyUp"
        @blur="cancelHold"
      >
        <span
          aria-hidden="true"
          class="h-3 w-3 rounded-full bg-primary transition-transform md:h-4 md:w-4"
          :class="phase === 'holding' ? 'scale-125' : 'scale-100'"
        />
      </button>
      <p class="text-sm text-muted-foreground">
        {{ hintText }}
      </p>
    </div>

    <!-- 进度条 -->
    <div class="relative z-10 mx-auto mb-lg max-w-[320px]">
      <div class="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-75 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="mt-sm text-center text-xs text-muted-foreground">
        {{ progressLabel }}
      </p>
    </div>

    <!-- 键盘 / 无法长按时的备用按钮 -->
    <div class="text-center">
      <Button
        v-if="phase === 'idle'"
        variant="ghost"
        size="sm"
        class="text-xs text-muted-foreground"
        @click="finishHold"
      >
        {{ t('shuffle.fallbackButton') }}
      </Button>
    </div>
  </section>
</template>

<style scoped>
.shuffle-card {
  transform-origin: 50% 50%;
  transition: transform 600ms ease;
  transform: translate(-50%, -50%)
    rotate(calc((var(--i) - 3) * 5deg))
    translateY(calc((var(--i) - 3) * -3px));
}
.shuffle-card.is-shuffling {
  animation: shuffle-dance 1.8s ease-in-out infinite;
  animation-delay: calc(var(--i) * 80ms);
}
.shuffle-back-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}
@keyframes shuffle-dance {
  0% {
    transform: translate(-50%, -50%)
      rotate(calc((var(--i) - 3) * 5deg))
      translateY(calc((var(--i) - 3) * -3px));
  }
  25% {
    transform: translate(calc(-50% + 38px), -60%)
      rotate(calc((var(--i) - 3) * 16deg))
      translateY(-14px);
  }
  50% {
    transform: translate(calc(-50% - 40px), -40%)
      rotate(calc((var(--i) - 3) * -14deg))
      translateY(-4px);
  }
  75% {
    transform: translate(calc(-50% + 18px), -52%)
      rotate(calc((var(--i) - 3) * 8deg))
      translateY(-10px);
  }
  100% {
    transform: translate(-50%, -50%)
      rotate(calc((var(--i) - 3) * 5deg))
      translateY(calc((var(--i) - 3) * -3px));
  }
}
</style>
