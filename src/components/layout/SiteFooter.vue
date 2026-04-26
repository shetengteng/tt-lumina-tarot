<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { generateQrSvgDataUrl, getShareSiteUrl } from '@/lib/share';

const { t } = useI18n();

const shareUrl = ref('');
const shareQrDataUrl = ref('');

onMounted(async () => {
  try {
    shareUrl.value = getShareSiteUrl();
    if (!shareUrl.value) return;
    shareQrDataUrl.value = await generateQrSvgDataUrl(shareUrl.value, { size: 200 });
  } catch {
    /* ignore – footer simply renders without QR */
  }
});
</script>

<template>
  <footer class="relative z-10 mt-2xl hidden border-t border-border/50 py-lg md:block">
    <div
      class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-md px-md sm:flex-row"
    >
      <div class="text-center text-xs text-muted-foreground sm:text-left">
        <p class="font-display tracking-widest">
          Lumina Tarot · 在黑暗中点亮内心微光
        </p>
        <p class="mt-xs opacity-70">
          Offline-first · Vue 3 · Tailwind · shadcn-vue
        </p>
      </div>

      <div class="flex items-center gap-sm">
        <div class="qr-tile shrink-0 rounded-md bg-white p-xs shadow-sm">
          <img
            v-if="shareQrDataUrl"
            :src="shareQrDataUrl"
            :alt="t('home.shareFooterTitle')"
            width="72"
            height="72"
            class="block h-[72px] w-[72px]"
          />
          <div
            v-else
            class="h-[72px] w-[72px] animate-pulse rounded-sm bg-muted"
            aria-hidden="true"
          />
        </div>
        <div class="max-w-[200px] text-left text-[11px] leading-tight">
          <p class="text-foreground/80">{{ t('home.shareFooterTitle') }}</p>
          <p
            v-if="shareUrl"
            class="mt-xs break-all font-mono text-muted-foreground/70"
          >
            {{ shareUrl }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
