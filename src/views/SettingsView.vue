<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ThemePicker from '@/components/layout/ThemePicker.vue';
import CardBackPattern from '@/components/tarot/CardBackPattern.vue';
import MinorIllustration from '@/components/tarot/MinorIllustration.vue';
import QrLightbox from '@/components/share/QrLightbox.vue';
import { useSettingsStore } from '@/stores/settings';
import { useReadingStore } from '@/stores/reading';
import { assetUrl } from '@/lib/utils';
import { generateQrSvgDataUrl, getShareSiteUrl } from '@/lib/share';
import type {
  CardBackVariant,
  MinorIllustrationStyle,
  CardSuit,
  CardArtTheme,
  Locale,
  AnimationLevel,
} from '@/types';

const { t } = useI18n();
const settings = useSettingsStore();
const {
  theme,
  cardBack,
  minorStyle,
  cardArtTheme,
  locale,
  animationLevel,
} = storeToRefs(settings);
const readingStore = useReadingStore();

const LANGUAGE_OPTIONS = computed<Array<{ id: Locale; name: string; sub: string }>>(() => [
  { id: 'zh-CN', name: t('settings.languageZh'), sub: t('settings.languageZhSub') },
  { id: 'en-US', name: t('settings.languageEn'), sub: t('settings.languageEnSub') },
]);

const ANIMATION_OPTIONS = computed<Array<{ id: AnimationLevel; name: string; desc: string }>>(() => [
  { id: 'off',  name: t('settings.animationOff'),  desc: t('settings.animationOffDesc') },
  { id: 'lite', name: t('settings.animationLite'), desc: t('settings.animationLiteDesc') },
  { id: 'full', name: t('settings.animationFull'), desc: t('settings.animationFullDesc') },
]);

const CARD_BACK_OPTIONS = computed<Array<{ id: CardBackVariant; name: string; desc: string }>>(() => [
  { id: 'classic',   name: t('settings.cardBackClassic'),   desc: t('settings.cardBackClassicDesc') },
  { id: 'celestial', name: t('settings.cardBackCelestial'), desc: t('settings.cardBackCelestialDesc') },
  { id: 'sacred',    name: t('settings.cardBackSacred'),    desc: t('settings.cardBackSacredDesc') },
  { id: 'floral',    name: t('settings.cardBackFloral'),    desc: t('settings.cardBackFloralDesc') },
  { id: 'eye',       name: t('settings.cardBackEye'),       desc: t('settings.cardBackEyeDesc') },
]);

const MINOR_STYLE_OPTIONS = computed<Array<{
  id: MinorIllustrationStyle;
  name: string;
  desc: string;
}>>(() => [
  { id: 'symbol',    name: t('settings.minorStyleSymbol'),    desc: t('settings.minorStyleSymbolDesc') },
  { id: 'geometric', name: t('settings.minorStyleGeometric'), desc: t('settings.minorStyleGeometricDesc') },
]);

const PREVIEW_SUITS: CardSuit[] = ['wands', 'cups', 'swords', 'pentacles'];

const CARD_ART_THEME_OPTIONS = computed<Array<{
  id: CardArtTheme;
  name: string;
  preview: string;
}>>(() => [
  {
    id: 'minimal',
    name: t('settings.cardArtMinimal'),
    preview: assetUrl('/img/card-theme-preview-minimal.webp'),
  },
  {
    id: 'rws',
    name: t('settings.cardArtRws'),
    preview: assetUrl('/decks/rws/fool.webp'),
  },
  {
    id: 'aquatic',
    name: t('settings.cardArtAquatic'),
    preview: assetUrl('/decks/aquatic/fool.webp'),
  },
]);

const themeNameMap = computed<Record<typeof theme.value, string>>(() => ({
  mystic: t('settings.themeMystic'),
  minimal: t('settings.themeMinimal'),
  nature: t('settings.themeNature'),
}));

function clearData() {
  if (typeof window !== 'undefined' && !window.confirm(t('settings.clearConfirm'))) return;
  readingStore.clearAll();
  readingStore.clearCurrent();
}

async function exportJSON() {
  await readingStore.readyPromise;
  const payload = {
    exportedAt: new Date().toISOString(),
    theme: theme.value,
    history: readingStore.history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lumina-tarot-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const shareUrl = ref('');
const shareQrDataUrl = ref('');

onMounted(async () => {
  try {
    shareUrl.value = getShareSiteUrl();
    if (!shareUrl.value) return;
    shareQrDataUrl.value = await generateQrSvgDataUrl(shareUrl.value, { size: 320 });
  } catch {
    /* ignore – section simply renders without QR */
  }
});
</script>

<template>
  <section class="mx-auto max-w-3xl px-md pt-2xl pb-2xl">
    <header class="mb-xl">
      <div class="text-xs uppercase tracking-[0.4em] text-primary">{{ t('settings.pageLabel') }}</div>
      <h1 class="mt-sm font-display text-3xl tracking-wide md:text-4xl">{{ t('settings.title') }}</h1>
    </header>

    <div class="space-y-md">
      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>{{ t('settings.themeLabel') }}</Label>
            <p class="text-sm text-muted-foreground">{{ t('settings.themeDesc') }}</p>
          </div>
          <ThemePicker />
          <p class="text-xs text-muted-foreground">
            {{ t('settings.currentLabel') }}<span class="text-foreground">{{ themeNameMap[theme] }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>{{ t('settings.languageLabel') }}</Label>
            <p class="text-sm text-muted-foreground">
              {{ t('settings.languageDesc') }}
            </p>
          </div>
          <div class="inline-flex items-center rounded-md border border-border/60 bg-card p-0.5">
            <button
              v-for="opt in LANGUAGE_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="locale === opt.id"
              class="lang-segment relative rounded-sm px-md py-1.5 text-sm transition focus:outline-none"
              :class="locale === opt.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="settings.setLocale(opt.id)"
            >
              <span class="font-medium">{{ opt.name }}</span>
              <span
                v-if="locale !== opt.id"
                class="ml-1 text-[10px] opacity-60"
              >· {{ opt.sub }}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>{{ t('settings.cardArtThemeLabel') }}</Label>
            <p class="text-sm text-muted-foreground">
              {{ t('settings.cardArtThemeDesc') }}
            </p>
          </div>
          <div class="grid grid-cols-1 gap-sm sm:grid-cols-3">
            <button
              v-for="opt in CARD_ART_THEME_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="cardArtTheme === opt.id"
              class="card-art-option group relative flex flex-col gap-xs rounded-lg border p-sm text-left transition focus:outline-none"
              :class="cardArtTheme === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setCardArtTheme(opt.id)"
            >
              <div class="art-preview relative mx-auto aspect-[5/9] w-[68px] overflow-hidden rounded-md border border-border/60 bg-card">
                <img
                  v-if="opt.id !== 'minimal'"
                  :src="opt.preview"
                  alt=""
                  class="h-full w-full object-cover"
                  :class="{ 'scale-[1.14]': opt.id === 'rws' }"
                  decoding="async"
                  loading="lazy"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-2xl text-primary">
                  ✦
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-foreground">{{ opt.name }}</div>
              </div>
              <span
                v-if="cardArtTheme === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p
            v-if="cardArtTheme !== 'minimal'"
            class="rounded-md border border-border/60 bg-muted/30 p-sm text-[11px] leading-relaxed text-muted-foreground"
          >
            {{ t('settings.cardArtImageHint') }}
          </p>
        </CardContent>
      </Card>

      <Card v-if="cardArtTheme === 'minimal'">
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>{{ t('settings.cardBackLabel') }}</Label>
            <p class="text-sm text-muted-foreground">
              {{ t('settings.cardBackDesc') }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-sm sm:grid-cols-3">
            <button
              v-for="opt in CARD_BACK_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="cardBack === opt.id"
              class="card-back-option group relative flex flex-col items-center gap-xs rounded-lg border p-sm transition focus:outline-none"
              :class="cardBack === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setCardBack(opt.id)"
            >
              <div class="card-back preview-card relative h-[112px] w-[68px] shrink-0">
                <CardBackPattern :variant="opt.id" />
              </div>
              <div class="text-center">
                <div class="text-xs font-medium text-foreground">{{ opt.name }}</div>
                <div class="mt-0.5 text-[10px] text-muted-foreground">{{ opt.desc }}</div>
              </div>
              <span
                v-if="cardBack === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ t('settings.currentLabel') }}<span class="text-foreground">{{ CARD_BACK_OPTIONS.find(o => o.id === cardBack)?.name }}</span>
          </p>
        </CardContent>
      </Card>

      <Card v-if="cardArtTheme === 'minimal'">
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>{{ t('settings.minorStyleLabel') }}</Label>
            <p class="text-sm text-muted-foreground">
              {{ t('settings.minorStyleDesc') }}
            </p>
          </div>
          <div class="grid grid-cols-1 gap-sm sm:grid-cols-2">
            <button
              v-for="opt in MINOR_STYLE_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="minorStyle === opt.id"
              class="minor-style-option group relative flex flex-col gap-xs rounded-lg border p-sm text-left transition focus:outline-none"
              :class="minorStyle === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setMinorStyle(opt.id)"
            >
              <div class="grid grid-cols-4 gap-xs rounded-md bg-card/60 p-xs">
                <div
                  v-for="suit in PREVIEW_SUITS"
                  :key="suit"
                  class="preview-tile relative aspect-[100/130] rounded-sm border border-border/50 bg-card"
                >
                  <MinorIllustration :suit="suit" rank="3" :style="opt.id" />
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-foreground">{{ opt.name }}</div>
                <div class="mt-0.5 text-xs text-muted-foreground">{{ opt.desc }}</div>
              </div>
              <span
                v-if="minorStyle === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ t('settings.currentLabel') }}<span class="text-foreground">{{ MINOR_STYLE_OPTIONS.find(o => o.id === minorStyle)?.name }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div class="space-y-xs">
            <Label>{{ t('settings.animationLabel') }}</Label>
            <p class="text-sm text-muted-foreground">
              {{ t('settings.animationDesc') }}
            </p>
          </div>
          <div class="grid grid-cols-3 gap-sm">
            <button
              v-for="opt in ANIMATION_OPTIONS"
              :key="opt.id"
              type="button"
              :aria-pressed="animationLevel === opt.id"
              class="anim-option group relative flex flex-col gap-xs rounded-lg border p-sm text-left transition focus:outline-none"
              :class="animationLevel === opt.id
                ? 'border-primary bg-accent/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'"
              @click="settings.setAnimationLevel(opt.id)"
            >
              <div class="text-sm font-medium text-foreground">{{ opt.name }}</div>
              <div class="text-[11px] leading-snug text-muted-foreground">{{ opt.desc }}</div>
              <span
                v-if="animationLevel === opt.id"
                class="absolute right-xs top-xs rounded-full bg-primary px-xs text-[10px] leading-4 text-primary-foreground"
              >
                ✓
              </span>
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ t('settings.currentLabel') }}<span class="text-foreground">{{ ANIMATION_OPTIONS.find(o => o.id === animationLevel)?.name }}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-md p-lg">
          <div>
            <Label>{{ t('settings.dataLabel') }}</Label>
            <p class="mt-xs text-sm text-muted-foreground">
              {{ t('settings.dataDesc') }}
            </p>
          </div>
          <Separator />
          <div class="flex flex-wrap gap-xs">
            <Button variant="outline" @click="exportJSON">{{ t('settings.exportJSON') }}</Button>
            <Button variant="destructive" @click="clearData">{{ t('settings.clearAll') }}</Button>
          </div>
        </CardContent>
      </Card>

      <Card class="about-card overflow-hidden">
        <CardContent class="relative space-y-lg p-lg">
          <div aria-hidden="true" class="about-glow" />

          <div class="space-y-sm">
            <Label class="font-display text-sm tracking-[0.3em] text-foreground/90">
              {{ t('settings.aboutLabel') }}
            </Label>
            <p class="text-sm leading-relaxed text-muted-foreground">
              {{ t('settings.aboutLine1') }}
            </p>
            <p class="text-sm leading-relaxed text-muted-foreground">
              {{ t('settings.aboutLine2') }}
            </p>
          </div>

          <div
            aria-hidden="true"
            class="flex items-center justify-center gap-sm text-muted-foreground/40"
          >
            <span class="h-px flex-1 bg-border/60" />
            <span class="text-[10px] tracking-[0.4em] text-primary/70">✦</span>
            <span class="h-px flex-1 bg-border/60" />
          </div>

          <div class="flex flex-col items-center gap-md sm:flex-row sm:items-center sm:gap-lg">
            <QrLightbox
              v-if="shareQrDataUrl"
              :qr-data-url="shareQrDataUrl"
              :share-url="shareUrl"
              trigger="inline"
            >
              <span class="block shrink-0 rounded-md bg-white p-sm shadow-md ring-1 ring-border/40">
                <img
                  :src="shareQrDataUrl"
                  alt=""
                  width="132"
                  height="132"
                  class="block h-[132px] w-[132px]"
                />
              </span>
            </QrLightbox>
            <div
              v-else
              class="shrink-0 rounded-md bg-white p-sm shadow-md ring-1 ring-border/40"
            >
              <div
                class="h-[132px] w-[132px] animate-pulse rounded-sm bg-muted"
                aria-hidden="true"
              />
            </div>
            <div class="min-w-0 flex-1 space-y-xs text-center sm:text-left">
              <p class="font-display text-base tracking-[0.18em] text-foreground/90">
                Lumina Tarot
              </p>
              <p class="text-[12px] leading-relaxed text-muted-foreground">
                {{ t('home.shareFooterDesc') }}
              </p>
            </div>
          </div>

          <p class="pt-xs text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60">
            {{ t('settings.aboutMeta') }}
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.about-card {
  background: linear-gradient(
    180deg,
    hsl(var(--card)) 0%,
    hsl(var(--card) / 0.92) 100%
  );
}

.about-glow {
  position: absolute;
  pointer-events: none;
  inset: -40% -10% auto auto;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle at 50% 50%,
    hsl(var(--primary) / 0.15) 0%,
    hsl(var(--primary) / 0.05) 40%,
    transparent 70%
  );
  filter: blur(20px);
  z-index: 0;
}
</style>
