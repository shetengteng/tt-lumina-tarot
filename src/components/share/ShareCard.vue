<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';
import { useCardI18n } from '@/composables/useCardI18n';
import { useTarotI18n } from '@/composables/useTarotI18n';
import { getCardById } from '@/data/cards';
import { getSpreadById } from '@/data/spreads';
import CardArtwork from '@/components/tarot/CardArtwork.vue';
import { formatDate } from '@/lib/utils';
import type { ReadingRecord } from '@/types';

const props = defineProps<{
  record: ReadingRecord;
  qrDataUrl?: string | null;
}>();

const { t, locale } = useI18n();
const settings = useSettingsStore();
const { cardArtTheme, minorStyle } = storeToRefs(settings);
const { getName } = useCardI18n();
const { spreadName, spreadPositionName, moodLabel } = useTarotI18n();

const spread = computed(() => getSpreadById(props.record.spreadId));

const headline = computed(() => {
  if (props.record.cards.length === 1) return t('share.titleSingle');
  return t('share.titleMultiple');
});

const dateText = computed(() => formatDate(props.record.createdAt, locale.value));

const enrichedCards = computed(() =>
  props.record.cards.map((c) => {
    const card = getCardById(c.cardId);
    const fallbackPos = t('reveal.nthCard', { n: c.positionIndex + 1 });
    const inSpread = spread.value?.positions[c.positionIndex]?.name ?? fallbackPos;
    const positionName = spread.value
      ? spreadPositionName(spread.value.id, c.positionIndex, inSpread)
      : fallbackPos;
    return {
      key: `${c.cardId}-${c.positionIndex}`,
      card,
      reversed: c.reversed,
      positionName,
      cardName: card ? getName(card) : '?',
      cardEn: card?.nameEn ?? '',
    };
  })
);

const cardCount = computed(() => enrichedCards.value.length);

const gridClass = computed(() => {
  const n = cardCount.value;
  if (n <= 1) return 'sc-grid sc-grid-1';
  if (n === 2) return 'sc-grid sc-grid-2';
  if (n === 3) return 'sc-grid sc-grid-3';
  if (n <= 4) return 'sc-grid sc-grid-4';
  return 'sc-grid sc-grid-many';
});

const moodText = computed(() => moodLabel(props.record.mood));
</script>

<template>
  <div class="sc-root" data-share-card>
    <div class="sc-bg-deco" aria-hidden="true">
      <span class="sc-star sc-star-a">✦</span>
      <span class="sc-star sc-star-b">✧</span>
      <span class="sc-star sc-star-c">✦</span>
      <span class="sc-star sc-star-d">·</span>
    </div>

    <header class="sc-header">
      <div class="sc-brand">
        <span class="sc-brand-symbol">◐</span>
        <span class="sc-brand-name">{{ t('share.brand') }}</span>
      </div>
      <div class="sc-tagline">{{ t('share.tagline') }}</div>
    </header>

    <section class="sc-headline-block">
      <div class="sc-eyebrow">{{ headline }}</div>
      <h2 v-if="record.question" class="sc-question">
        <span class="sc-quote">「</span>{{ record.question }}<span class="sc-quote">」</span>
      </h2>
      <h2 v-else class="sc-question sc-question-empty">
        {{ t('history.unnamed') }}
      </h2>
    </section>

    <section :class="gridClass">
      <div
        v-for="item in enrichedCards"
        :key="item.key"
        class="sc-card-cell"
      >
        <div class="sc-card-frame" :class="{ 'sc-rev': item.reversed }">
          <div
            class="sc-art-wrap"
            :class="cardArtTheme === 'minimal' ? 'sc-art-pad' : 'sc-art-flush'"
          >
            <CardArtwork
              v-if="item.card"
              :card="item.card"
              :theme="cardArtTheme"
              :minor-style="minorStyle"
            />
          </div>
          <span v-if="item.reversed" class="sc-rev-tag">{{ t('common.rev') }}</span>
        </div>
        <div class="sc-card-meta">
          <div class="sc-pos">{{ item.positionName }}</div>
          <div class="sc-name">{{ item.cardName }}</div>
          <div class="sc-name-en">{{ item.cardEn }}</div>
          <div class="sc-status">
            {{ item.reversed ? t('common.reversed') : t('common.upright') }}
          </div>
        </div>
      </div>
    </section>

    <section v-if="record.note" class="sc-note">
      <div class="sc-note-label">✎ {{ t('share.noteLabel') }}</div>
      <p class="sc-note-text">{{ record.note }}</p>
    </section>

    <section class="sc-meta">
      <div v-if="spread" class="sc-meta-row">
        <span class="sc-meta-key">{{ t('share.spreadLabel') }}</span>
        <span class="sc-meta-val">{{ spreadName(spread) }}</span>
      </div>
      <div v-if="moodText" class="sc-meta-row">
        <span class="sc-meta-key">{{ t('share.moodLabel') }}</span>
        <span class="sc-meta-val">{{ moodText }}</span>
      </div>
      <div class="sc-meta-row">
        <span class="sc-meta-key">{{ t('share.dateLabel') }}</span>
        <span class="sc-meta-val">{{ dateText }}</span>
      </div>
    </section>

    <footer class="sc-footer">
      <div class="sc-watermark">{{ t('share.waterMarkHint') }}</div>
      <div v-if="qrDataUrl" class="sc-qr-block">
        <img
          :src="qrDataUrl"
          :alt="t('share.qrAlt')"
          class="sc-qr-img"
          crossorigin="anonymous"
        />
        <div class="sc-qr-hint">{{ t('share.qrHint') }}</div>
      </div>
      <div class="sc-brand-line">
        <span class="sc-brand-symbol-sm">◐</span> Lumina Tarot
      </div>
    </footer>
  </div>
</template>

<style scoped>
.sc-root {
  position: relative;
  width: 1080px;
  min-height: 1500px;
  padding: 80px 72px 72px;
  font-family: 'Cinzel', 'Cormorant Garamond', 'Noto Serif SC', 'PingFang SC', 'Songti SC', serif;
  color: rgb(238, 230, 255);
  background:
    radial-gradient(circle at 25% 12%, rgba(168, 122, 255, 0.18), transparent 55%),
    radial-gradient(circle at 80% 88%, rgba(76, 188, 200, 0.14), transparent 50%),
    linear-gradient(160deg, rgb(15, 11, 33) 0%, rgb(22, 16, 49) 45%, rgb(13, 9, 28) 100%);
  border-radius: 36px;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.sc-bg-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.sc-star {
  position: absolute;
  color: rgba(220, 200, 255, 0.35);
  font-size: 28px;
  font-family: serif;
}
.sc-star-a { top: 60px;  right: 110px; font-size: 36px; }
.sc-star-b { top: 220px; left: 96px;   font-size: 22px; color: rgba(180, 240, 240, 0.45); }
.sc-star-c { bottom: 280px; right: 80px; font-size: 32px; color: rgba(255, 220, 240, 0.32); }
.sc-star-d { bottom: 140px; left: 140px; font-size: 18px; }

.sc-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}
.sc-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
.sc-brand-symbol {
  font-size: 44px;
  color: rgb(196, 152, 255);
  line-height: 1;
}
.sc-brand-name {
  font-size: 30px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgb(232, 220, 255);
}
.sc-tagline {
  font-size: 22px;
  letter-spacing: 0.18em;
  color: rgba(220, 210, 255, 0.65);
  text-align: right;
  max-width: 360px;
  line-height: 1.4;
}

.sc-headline-block {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 24px;
}
.sc-eyebrow {
  font-size: 24px;
  letter-spacing: 0.5em;
  color: rgb(196, 152, 255);
  text-transform: uppercase;
  margin-bottom: 28px;
}
.sc-question {
  font-size: 56px;
  line-height: 1.35;
  font-weight: 500;
  margin: 0;
  color: rgb(245, 240, 255);
}
.sc-question-empty {
  color: rgba(245, 240, 255, 0.65);
  font-style: italic;
  font-size: 44px;
}
.sc-quote {
  color: rgb(196, 152, 255);
  margin: 0 4px;
}

.sc-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 36px;
  justify-items: center;
  width: 100%;
}
.sc-grid-1 {
  grid-template-columns: 1fr;
  max-width: 420px;
  margin: 0 auto;
}
.sc-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 760px;
  margin: 0 auto;
}
.sc-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.sc-grid-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 760px;
  margin: 0 auto;
}
.sc-grid-many {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sc-card-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}
.sc-card-frame {
  position: relative;
  aspect-ratio: 100 / 165;
  width: 100%;
  max-width: 280px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(196, 152, 255, 0.45);
  box-shadow:
    0 18px 36px -16px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
.sc-art-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(20, 14, 42);
}
.sc-art-pad {
  padding: 14px;
}
.sc-rev :deep(.card-artwork-img),
.sc-rev :deep(.card-artwork-symbol),
.sc-rev :deep(.card-artwork-minor) {
  transform: rotate(180deg);
}
.sc-rev-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgb(220, 70, 90);
  color: rgb(255, 255, 255);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2em;
  padding: 4px 10px;
  border-radius: 6px;
  z-index: 2;
}
.sc-card-meta {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sc-pos {
  font-size: 18px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(220, 210, 255, 0.75);
}
.sc-name {
  font-size: 32px;
  font-weight: 500;
  color: rgb(245, 240, 255);
  line-height: 1.2;
}
.sc-name-en {
  font-size: 16px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgb(196, 152, 255);
}
.sc-status {
  margin-top: 6px;
  font-size: 18px;
  color: rgba(245, 240, 255, 0.75);
}

.sc-note {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  max-width: 880px;
  padding: 28px 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(196, 152, 255, 0.25);
  border-radius: 20px;
}
.sc-note-label {
  font-size: 18px;
  color: rgb(196, 152, 255);
  letter-spacing: 0.18em;
  margin-bottom: 12px;
}
.sc-note-text {
  font-size: 24px;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: rgb(245, 240, 255);
}

.sc-meta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px 56px;
  font-size: 20px;
}
.sc-meta-row {
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
  color: rgba(245, 240, 255, 0.85);
}
.sc-meta-key {
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgb(196, 152, 255);
  font-size: 16px;
}
.sc-meta-val {
  color: rgb(245, 240, 255);
}

.sc-footer {
  position: relative;
  z-index: 1;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(196, 152, 255, 0.25);
}
.sc-watermark {
  flex: 1 1 0;
  min-width: 0;
  font-size: 18px;
  color: rgba(220, 210, 255, 0.6);
  letter-spacing: 0.08em;
}
.sc-qr-block {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.sc-qr-img {
  width: 132px;
  height: 132px;
  display: block;
  background: rgb(255, 255, 255);
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.sc-qr-hint {
  font-size: 14px;
  letter-spacing: 0.18em;
  color: rgba(220, 210, 255, 0.72);
  text-align: center;
}
.sc-brand-line {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  font-size: 20px;
  color: rgb(232, 220, 255);
  letter-spacing: 0.24em;
}
.sc-brand-symbol-sm {
  font-size: 24px;
  color: rgb(196, 152, 255);
}
</style>
