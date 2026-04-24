<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useReadingStore } from '@/stores/reading';
import TarotCard from '@/components/tarot/TarotCard.vue';
import { ALL_CARDS, getCardById } from '@/data/cards';
import { formatRelative, isReversed, shuffle } from '@/lib/utils';
import { getSpreadById } from '@/data/spreads';
import type { TarotCardDef } from '@/types';

const router = useRouter();
const readingStore = useReadingStore();
const { history } = storeToRefs(readingStore);

type DailySlot = {
  area: '事业' | '感情' | '自我';
  areaEn: string;
  cardId: string;
  reversed: boolean;
};

const DAILY_STORAGE_KEY = 'lumina-daily-insight';

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const dailyDateKey = ref(todayKey());
const dailyDisplay = computed(() => dailyDateKey.value.replace(/-/g, '.'));
const dailySlots = ref<DailySlot[]>([]);

const AREAS: Array<{ area: DailySlot['area']; areaEn: string }> = [
  { area: '事业', areaEn: 'CAREER' },
  { area: '感情', areaEn: 'LOVE' },
  { area: '自我', areaEn: 'INNER' },
];

function loadOrGenerateDaily() {
  const key = todayKey();
  dailyDateKey.value = key;

  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { date: string; slots: DailySlot[] };
      if (saved && saved.date === key && Array.isArray(saved.slots) && saved.slots.length === 3) {
        dailySlots.value = saved.slots;
        return;
      }
    }
  } catch {
    /* ignore */
  }

  const picked = shuffle(ALL_CARDS).slice(0, 3);
  const slots: DailySlot[] = picked.map((card, i) => ({
    area: AREAS[i].area,
    areaEn: AREAS[i].areaEn,
    cardId: card.id,
    reversed: isReversed(),
  }));
  dailySlots.value = slots;
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ date: key, slots }));
  } catch {
    /* ignore */
  }
}

type QuickDraw = { card: TarotCardDef; reversed: boolean; flipped: boolean };
const quickDraw = ref<QuickDraw | null>(null);
const quickOpen = ref(false);
const drawing = ref(false);

function toggleDailyCard() {
  if (!quickOpen.value) {
    quickOpen.value = true;
  }
  drawDaily();
}

async function drawDaily() {
  drawing.value = true;
  const pool = shuffle(ALL_CARDS);
  const card = pool[0];
  const reversed = isReversed();
  quickDraw.value = { card, reversed, flipped: false };
  setTimeout(() => {
    if (quickDraw.value) quickDraw.value.flipped = true;
    drawing.value = false;
  }, 500);
}

function closeDaily() {
  quickOpen.value = false;
  quickDraw.value = null;
}

function startReading() {
  router.push({ name: 'spread' });
}

const latestReading = computed(() => history.value[0] ?? null);

const latestSpreadName = computed(() => {
  if (!latestReading.value) return '';
  return getSpreadById(latestReading.value.spreadId)?.name ?? '占卜';
});

const latestFirstCard = computed(() => {
  const rec = latestReading.value;
  if (!rec || rec.cards.length === 0) return null;
  const drawn = rec.cards[0];
  const card = getCardById(drawn.cardId);
  if (!card) return null;
  return { card, reversed: drawn.reversed };
});

onMounted(() => {
  loadOrGenerateDaily();
});
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-md md:px-lg">
    <!-- Hero：居中仪式感 -->
    <div class="flex flex-col items-center gap-md py-2xl text-center">
      <p class="font-display text-xs tracking-[0.45em] text-muted-foreground">
        TODAY · {{ dailyDisplay }}
      </p>
      <h1 class="font-display text-4xl tracking-wide text-foreground md:text-5xl">
        今日之问
      </h1>
      <p class="max-w-[42ch] text-sm leading-relaxed text-muted-foreground md:text-base">
        塔罗并非预言，而是一面镜子。<br class="hidden md:inline" />
        你所抽到的每一张牌，都映照出此刻内心最真实的侧影。
      </p>

      <div class="mt-sm flex w-full max-w-md flex-col items-stretch justify-center gap-md sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          class="btn-glow inline-flex min-h-[44px] items-center justify-center gap-sm rounded-lg px-xl py-md text-sm font-semibold tracking-wide transition-all"
          @click="startReading"
        >
          <span>开始占卜</span>
          <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          class="inline-flex min-h-[44px] items-center justify-center gap-sm rounded-lg border border-border/70 px-xl py-md text-sm font-medium text-foreground transition-all hover:bg-accent/40"
          @click="toggleDailyCard"
        >
          <span aria-hidden="true">✦</span>
          <span>今日一牌</span>
        </button>
      </div>
    </div>

    <!-- 今日一牌 · 展开区 -->
    <transition name="fade">
      <div
        v-if="quickOpen"
        class="mx-auto mb-xl w-full max-w-xl rounded-lg border border-border/60 bg-card/70 p-lg shadow-sm backdrop-blur-sm"
      >
        <div class="flex items-start gap-lg">
          <div class="shrink-0">
            <TarotCard
              :card="quickDraw?.card ?? null"
              :reversed="quickDraw?.reversed ?? false"
              :flipped="quickDraw?.flipped ?? false"
              size="md"
              interactive
              @flip="quickDraw && (quickDraw.flipped = !quickDraw.flipped)"
            />
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-xs text-sm">
            <div class="flex items-center justify-between gap-sm">
              <p class="font-display text-xs tracking-[0.3em] text-muted-foreground">
                DAILY DRAW
              </p>
              <button
                type="button"
                class="text-xs text-muted-foreground transition hover:text-foreground"
                aria-label="关闭今日一牌"
                @click="closeDaily"
              >
                关闭
              </button>
            </div>
            <template v-if="quickDraw?.flipped && quickDraw.card">
              <div class="font-display text-xl text-foreground">
                {{ quickDraw.card.name }}
                <span v-if="quickDraw.reversed" class="ml-xs rounded-md border border-destructive/50 px-xs text-[10px] tracking-wider text-destructive">
                  REVERSED
                </span>
              </div>
              <p class="text-muted-foreground">
                {{ quickDraw.reversed ? quickDraw.card.reversed.advice : quickDraw.card.upright.advice }}
              </p>
              <div class="mt-xs flex flex-wrap gap-xs">
                <button
                  type="button"
                  class="rounded-md border border-border/60 px-sm py-xs text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
                  :disabled="drawing"
                  @click="drawDaily"
                >
                  {{ drawing ? '抽取中…' : '再抽一张' }}
                </button>
                <button
                  type="button"
                  class="rounded-md border border-border/60 px-sm py-xs text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
                  @click="router.push({ name: 'library', query: { focus: quickDraw.card.id } })"
                >
                  查看图鉴 →
                </button>
              </div>
            </template>
            <template v-else>
              <p class="text-muted-foreground">点击牌面，或等待它为你翻开。</p>
            </template>
          </div>
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
              {{ slot.areaEn }} · {{ slot.area }}
            </p>
            <h3 class="font-display text-lg leading-snug">
              {{ getCardById(slot.cardId)?.name }}
              <span class="ml-xs text-xs text-muted-foreground">
                {{ slot.reversed ? '逆位' : '正位' }}
              </span>
            </h3>
          </div>
          <span class="shrink-0 rounded-full border border-primary/40 px-sm py-xs text-[10px] tracking-wider text-primary">
            TODAY
          </span>
        </div>
        <p class="text-sm leading-relaxed text-muted-foreground">
          <template v-if="getCardById(slot.cardId)">
            {{
              slot.reversed
                ? getCardById(slot.cardId)!.reversed.advice
                : getCardById(slot.cardId)!.upright.advice
            }}
          </template>
        </p>
      </article>
    </div>

    <!-- 最近一次占卜 -->
    <article class="mb-xl rounded-lg border border-border/70 bg-card/80 p-lg text-card-foreground shadow-sm backdrop-blur-sm">
      <div class="mb-md flex items-center justify-between gap-sm">
        <h2 class="font-display text-xl">最近一次占卜</h2>
        <button
          type="button"
          class="text-xs text-muted-foreground transition hover:text-foreground"
          @click="router.push({ name: 'history' })"
        >
          查看全部 →
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
            <span v-else class="text-muted-foreground">（无具体提问）</span>
            <span class="ml-xs">—</span>
            <span class="ml-xs">
              抽到
              <span class="font-medium text-primary">
                {{ latestFirstCard.card.name }} {{ latestFirstCard.reversed ? '逆位' : '正位' }}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div v-else class="flex flex-col items-start gap-sm text-sm text-muted-foreground">
        <p>还没有记录。让今天成为你第一次与塔罗对话的日子。</p>
        <button
          type="button"
          class="rounded-md border border-border/60 px-sm py-xs text-xs transition hover:bg-accent/40 hover:text-foreground"
          @click="startReading"
        >
          开启首次占卜 →
        </button>
      </div>
    </article>
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
</style>
