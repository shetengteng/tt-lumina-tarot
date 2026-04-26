<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useReadingStore } from '@/stores/reading';
import TarotCard from '@/components/tarot/TarotCard.vue';
import { ALL_CARDS, getCardById } from '@/data/cards';
import { formatRelative, isReversed, shuffle } from '@/lib/utils';
import { getSpreadById } from '@/data/spreads';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';
import type { TarotCardDef } from '@/types';
import { getDailyDraw, putDailyDraw } from '@/lib/db';
import { generateQrSvgDataUrl, getShareSiteUrl } from '@/lib/share';

const router = useRouter();
const { t } = useI18n();
const readingStore = useReadingStore();
const { history } = storeToRefs(readingStore);
const { getName, getField } = useCardI18n();
const { spreadName: spreadNameOf } = useTarotI18n();

const heroCardRef = ref<HTMLElement | null>(null);

type AreaId = 'career' | 'love' | 'inner';
type DailySlot = {
  area: AreaId;
  cardId: string;
  reversed: boolean;
};

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const dailyDateKey = ref(todayKey());
const dailyDisplay = computed(() => dailyDateKey.value.replace(/-/g, '.'));
const dailySlots = ref<DailySlot[]>([]);

const AREA_ORDER: AreaId[] = ['career', 'love', 'inner'];
const AREA_LABEL: Record<AreaId, () => string> = {
  career: () => t('home.areaCareer'),
  love: () => t('home.areaLove'),
  inner: () => t('home.areaInner'),
};
const AREA_LABEL_EN: Record<AreaId, () => string> = {
  career: () => t('home.areaCareerEn'),
  love: () => t('home.areaLoveEn'),
  inner: () => t('home.areaInnerEn'),
};

async function loadOrGenerateDaily() {
  const key = todayKey();
  dailyDateKey.value = key;

  try {
    const saved = await getDailyDraw(key);
    if (saved && Array.isArray(saved.slots) && saved.slots.length === 3) {
      dailySlots.value = saved.slots.map((s, i) => ({
        area: (AREA_ORDER as string[]).includes(String(s.area)) ? (s.area as AreaId) : AREA_ORDER[i],
        cardId: s.cardId,
        reversed: !!s.reversed,
      }));
      return;
    }
  } catch {
    /* ignore */
  }

  const picked = shuffle(ALL_CARDS).slice(0, 3);
  const slots: DailySlot[] = picked.map((card, i) => ({
    area: AREA_ORDER[i],
    cardId: card.id,
    reversed: isReversed(),
  }));
  dailySlots.value = slots;
  try {
    await putDailyDraw({ date: key, slots });
  } catch {
    /* ignore */
  }
}

type QuickDraw = {
  card: TarotCardDef;
  reversed: boolean;
  flipped: boolean;
  revealed: boolean;
};
const quickDraw = ref<QuickDraw | null>(null);
const drawing = ref(false);
let revealTimer: ReturnType<typeof setTimeout> | null = null;
let drawTimer: ReturnType<typeof setTimeout> | null = null;
let unflipTimer: ReturnType<typeof setTimeout> | null = null;

const FLIP_DURATION_MS = 700;
const PRE_FLIP_DELAY_MS = 500;

const heroFlipped = computed(() => !!quickDraw.value?.flipped);
const heroHint = computed(() => {
  if (!quickDraw.value) return t('home.clickToOpen');
  if (drawing.value) return t('home.drawing');
  if (!quickDraw.value.flipped) return t('home.flipping');
  if (!quickDraw.value.revealed) return t('home.revealing');
  const name = getName(quickDraw.value.card);
  const status = quickDraw.value.reversed ? t('common.reversed') : t('common.upright');
  return `${name} · ${status}`;
});

function clearTimers() {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  if (drawTimer) {
    clearTimeout(drawTimer);
    drawTimer = null;
  }
  if (unflipTimer) {
    clearTimeout(unflipTimer);
    unflipTimer = null;
  }
}

function onHeroCardClick() {
  if (drawing.value) return;
  if (!quickDraw.value || quickDraw.value.revealed) {
    drawDaily();
    return;
  }
  if (!quickDraw.value.flipped) {
    quickDraw.value.flipped = true;
    scheduleReveal();
  }
}

function scrollToHeroCard() {
  if (heroCardRef.value) {
    heroCardRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (!quickDraw.value) {
    drawDaily();
  } else if (quickDraw.value.revealed) {
    drawDaily();
  }
}

function scheduleReveal() {
  if (revealTimer) clearTimeout(revealTimer);
  revealTimer = setTimeout(() => {
    if (quickDraw.value && quickDraw.value.flipped) {
      quickDraw.value.revealed = true;
    }
    revealTimer = null;
  }, FLIP_DURATION_MS);
}

function startDrawCycle() {
  drawing.value = true;
  const pool = shuffle(ALL_CARDS);
  const card = pool[0];
  const reversed = isReversed();
  quickDraw.value = { card, reversed, flipped: false, revealed: false };
  drawTimer = setTimeout(() => {
    if (quickDraw.value) quickDraw.value.flipped = true;
    drawing.value = false;
    drawTimer = null;
    scheduleReveal();
  }, PRE_FLIP_DELAY_MS);
}

async function drawDaily() {
  clearTimers();

  if (quickDraw.value && quickDraw.value.flipped) {
    drawing.value = true;
    quickDraw.value.revealed = false;
    quickDraw.value.flipped = false;
    unflipTimer = setTimeout(() => {
      unflipTimer = null;
      startDrawCycle();
    }, FLIP_DURATION_MS);
    return;
  }

  startDrawCycle();
}

function closeDaily() {
  clearTimers();
  quickDraw.value = null;
  drawing.value = false;
}

function startReading() {
  router.push({ name: 'spread' });
}

const latestReading = computed(() => history.value[0] ?? null);

const latestSpreadName = computed(() => {
  if (!latestReading.value) return '';
  const spread = getSpreadById(latestReading.value.spreadId);
  if (!spread) return t('home.defaultReading');
  return spreadNameOf(spread);
});

const latestFirstCard = computed(() => {
  const rec = latestReading.value;
  if (!rec || rec.cards.length === 0) return null;
  const drawn = rec.cards[0];
  const card = getCardById(drawn.cardId);
  if (!card) return null;
  return { card, reversed: drawn.reversed };
});

const shareUrl = ref('');
const shareQrDataUrl = ref('');

async function loadShareQr() {
  try {
    shareUrl.value = getShareSiteUrl();
    if (!shareUrl.value) return;
    shareQrDataUrl.value = await generateQrSvgDataUrl(shareUrl.value, { size: 200 });
  } catch {
    /* ignore – QR is decorative */
  }
}

onMounted(() => {
  void loadOrGenerateDaily();
  void loadShareQr();
});

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-md md:px-lg">
    <!-- Hero：居中仪式感 -->
    <div class="flex flex-col items-center gap-md py-2xl text-center">
      <p class="font-display text-xs tracking-[0.45em] text-muted-foreground">
        {{ t('home.todayLabel') }} · {{ dailyDisplay }}
      </p>
      <h1 class="font-display text-4xl tracking-wide text-foreground md:text-5xl">
        {{ t('home.title') }}
      </h1>
      <p class="max-w-[42ch] text-sm leading-relaxed text-muted-foreground md:text-base">
        {{ t('home.intro1') }}<br class="hidden md:inline" />
        {{ t('home.intro2') }}
      </p>

      <div class="mt-sm flex w-full max-w-md flex-col items-stretch justify-center gap-md sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          class="btn-glow inline-flex min-h-[44px] items-center justify-center gap-sm rounded-lg px-xl py-md text-sm font-semibold tracking-wide transition-all"
          @click="startReading"
        >
          <span>{{ t('home.startReading') }}</span>
          <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          class="inline-flex min-h-[44px] items-center justify-center gap-sm rounded-lg border border-border/70 px-xl py-md text-sm font-medium text-foreground transition-all hover:bg-accent/40"
          @click="scrollToHeroCard"
        >
          <span aria-hidden="true">✦</span>
          <span>{{ t('home.todayDraw') }}</span>
        </button>
      </div>

      <!-- Hero 牌位：默认即出现的仪式焦点 -->
      <div ref="heroCardRef" class="hero-card-stage relative mt-xl flex flex-col items-center">
        <div class="hero-card-aura" aria-hidden="true" />
        <TarotCard
          :card="quickDraw?.card ?? null"
          :reversed="quickDraw?.reversed ?? false"
          :flipped="heroFlipped"
          size="lg"
          interactive
          class="relative z-10"
          @flip="onHeroCardClick"
        />
        <p
          class="mt-md font-display text-[11px] tracking-[0.42em] text-muted-foreground transition-colors"
          :class="{ 'text-primary': heroFlipped }"
        >
          {{ heroHint }}
        </p>
      </div>
    </div>

    <!-- 今日一牌 · 翻面后的文字结果（等翻面动画结束后再淡入） -->
    <transition name="fade">
      <div
        v-if="quickDraw?.revealed"
        class="mx-auto mb-xl w-full max-w-xl rounded-lg border border-border/60 bg-card/70 p-lg shadow-sm backdrop-blur-sm"
      >
        <div class="flex items-center justify-between gap-sm">
          <p class="font-display text-xs tracking-[0.3em] text-muted-foreground">
            {{ t('home.dailyDraw') }}
          </p>
          <button
            type="button"
            class="text-xs text-muted-foreground transition hover:text-foreground"
            :aria-label="t('home.closeAriaLabel')"
            @click="closeDaily"
          >
            {{ t('common.close') }}
          </button>
        </div>
        <p class="mt-sm text-sm leading-relaxed text-muted-foreground">
          {{ getField(quickDraw.card, quickDraw.reversed ? 'reversed.advice' : 'upright.advice') }}
        </p>
        <div class="mt-md flex flex-wrap gap-xs">
          <button
            type="button"
            class="rounded-md border border-border/60 px-sm py-xs text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
            :disabled="drawing"
            @click="drawDaily"
          >
            {{ drawing ? t('home.drawing') : t('home.drawAgain') }}
          </button>
          <button
            type="button"
            class="rounded-md border border-border/60 px-sm py-xs text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
            @click="router.push({ name: 'library', query: { focus: quickDraw.card.id } })"
          >
            {{ t('home.viewInLibrary') }}
          </button>
        </div>
      </div>
    </transition>

    <!-- 分隔线 -->
    <div class="divider-deco my-xl" aria-hidden="true">
      <span>—</span>
    </div>

    <!-- 今日运势三卡 -->
    <div class="mb-xl grid gap-md md:grid-cols-3">
      <article
        v-for="(slot, idx) in dailySlots"
        :key="slot.area"
        class="rounded-lg border border-border/70 bg-card/80 p-lg text-card-foreground shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 80 * idx, duration: 280 } }"
      >
        <div class="mb-md flex items-start justify-between gap-sm">
          <div>
            <p class="mb-xs text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              {{ AREA_LABEL_EN[slot.area]() }} · {{ AREA_LABEL[slot.area]() }}
            </p>
            <h3 class="font-display text-lg leading-snug">
              {{ getName(getCardById(slot.cardId)) }}
              <span class="ml-xs text-xs text-muted-foreground">
                {{ slot.reversed ? t('common.reversed') : t('common.upright') }}
              </span>
            </h3>
          </div>
          <span class="shrink-0 rounded-full border border-primary/40 px-sm py-xs text-[10px] tracking-wider text-primary">
            {{ t('home.todaySectionLabel') }}
          </span>
        </div>
        <p class="text-sm leading-relaxed text-muted-foreground">
          {{ getField(getCardById(slot.cardId), slot.reversed ? 'reversed.advice' : 'upright.advice') }}
        </p>
      </article>
    </div>

    <!-- 最近一次占卜 -->
    <article class="mb-xl rounded-lg border border-border/70 bg-card/80 p-lg text-card-foreground shadow-sm backdrop-blur-sm">
      <div class="mb-md flex items-center justify-between gap-sm">
        <h2 class="font-display text-xl">{{ t('home.latestReading') }}</h2>
        <button
          type="button"
          class="text-xs text-muted-foreground transition hover:text-foreground"
          @click="router.push({ name: 'history' })"
        >
          {{ t('home.viewAll') }}
        </button>
      </div>

      <div v-if="latestReading && latestFirstCard" class="flex items-center gap-md">
        <div class="shrink-0">
          <TarotCard
            :card="latestFirstCard.card"
            :reversed="latestFirstCard.reversed"
            :flipped="false"
            size="sm"
          />
        </div>
        <div class="min-w-0 flex-1 space-y-xs">
          <p class="text-xs text-muted-foreground">
            {{ formatRelative(latestReading.createdAt) }} · {{ latestSpreadName }}
          </p>
          <p class="line-clamp-2 text-sm text-foreground">
            <span v-if="latestReading.question" class="text-muted-foreground">
              “{{ latestReading.question }}”
            </span>
            <span v-else class="text-muted-foreground">{{ t('home.noQuestion') }}</span>
            <span class="ml-xs">—</span>
            <span class="ml-xs">
              {{ t('home.drewCard') }}
              <span class="font-medium text-primary">
                {{ getName(latestFirstCard.card) }} {{ latestFirstCard.reversed ? t('common.reversed') : t('common.upright') }}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div v-else class="flex flex-col items-start gap-sm text-sm text-muted-foreground">
        <p>{{ t('home.emptyHistory') }}</p>
        <button
          type="button"
          class="rounded-md border border-border/60 px-sm py-xs text-xs transition hover:bg-accent/40 hover:text-foreground"
          @click="startReading"
        >
          {{ t('home.startFirstReading') }}
        </button>
      </div>
    </article>

    <!-- 站点分享二维码 · 小尺寸入口 -->
    <div class="mt-xl mb-lg flex flex-col items-center gap-xs text-[11px] text-muted-foreground/80">
      <div class="rounded-md bg-white p-xs shadow-sm">
        <img
          v-if="shareQrDataUrl"
          :src="shareQrDataUrl"
          :alt="t('home.shareFooterTitle')"
          width="84"
          height="84"
          class="block h-[84px] w-[84px]"
        />
        <div
          v-else
          class="h-[84px] w-[84px] animate-pulse rounded-sm bg-muted"
          aria-hidden="true"
        />
      </div>
      <p v-if="shareUrl" class="break-all font-mono tracking-tight">
        {{ shareUrl }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 260ms ease,
    transform 260ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.hero-card-stage {
  --aura-size: 320px;
}

.hero-card-aura {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--aura-size);
  height: calc(var(--aura-size) * 1.45);
  transform: translate(-50%, calc(-50% - 16px));
  background: radial-gradient(
    ellipse at 50% 50%,
    hsl(var(--primary) / 0.22) 0%,
    hsl(var(--primary) / 0.08) 35%,
    transparent 70%
  );
  filter: blur(16px);
  pointer-events: none;
  animation: hero-aura 5.4s ease-in-out infinite;
  z-index: 0;
}

@keyframes hero-aura {
  0%, 100% {
    opacity: 0.55;
    transform: translate(-50%, calc(-50% - 16px)) scale(0.94);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, calc(-50% - 16px)) scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-card-aura {
    animation: none;
    opacity: 0.6;
    transform: translate(-50%, calc(-50% - 16px));
  }
}
</style>
