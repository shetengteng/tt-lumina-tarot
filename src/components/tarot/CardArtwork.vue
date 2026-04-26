<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TarotCardDef, MinorIllustrationStyle, CardArtTheme } from '@/types';
import { assetUrl } from '@/lib/utils';
import MinorIllustration from './MinorIllustration.vue';

const props = withDefaults(
  defineProps<{
    card: TarotCardDef;
    theme: CardArtTheme;
    minorStyle: MinorIllustrationStyle;
    lazy?: boolean;
  }>(),
  { lazy: false }
);

const failed = ref(false);

const imageSrc = computed(() => {
  if (props.theme === 'rws') return assetUrl(`/decks/rws/${props.card.id}.webp`);
  if (props.theme === 'aquatic') return assetUrl(`/decks/aquatic/${props.card.id}.webp`);
  return null;
});

watch(
  () => [props.theme, props.card.id],
  () => {
    failed.value = false;
  }
);

function onImgError() {
  failed.value = true;
}

const useImage = computed(() => imageSrc.value !== null && !failed.value);
const isMinor = computed(
  () => props.card.arcana === 'minor' && props.card.suit && props.card.rank
);
</script>

<template>
  <div class="card-artwork">
    <img
      v-if="useImage"
      class="card-artwork-img"
      :class="{ 'card-artwork-img--scaled': theme === 'rws' }"
      :src="imageSrc!"
      :alt="card.name"
      decoding="async"
      :loading="lazy ? 'lazy' : 'eager'"
      @error="onImgError"
    />
    <template v-else>
      <div v-if="isMinor" class="card-artwork-minor">
        <MinorIllustration
          :suit="card.suit!"
          :rank="card.rank!"
          :style="minorStyle"
        />
      </div>
      <span v-else class="card-artwork-symbol" aria-hidden="true">{{ card.symbol }}</span>
    </template>
  </div>
</template>

<style scoped>
.card-artwork {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.card-artwork-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  display: block;
}
/* 经典韦特（RWS）源图自带外侧黑边与底部标题文字带，
   放大 1.14 倍由父级 overflow:hidden 裁掉边缘；
   水彩重绘（Aquatic）边缘已无冗余，无需缩放。 */
.card-artwork-img--scaled {
  transform: scale(1.14);
  transform-origin: center;
}
.card-artwork-minor {
  width: 80%;
  aspect-ratio: 100 / 130;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-artwork-symbol {
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  line-height: 1;
  user-select: none;
}
</style>
