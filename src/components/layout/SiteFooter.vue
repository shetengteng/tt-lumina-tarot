<script setup lang="ts">
import { onMounted, ref } from 'vue';
import QrLightbox from '@/components/share/QrLightbox.vue';
import { generateQrSvgDataUrl, getShareSiteUrl } from '@/lib/share';

const shareUrl = ref('');
const shareQrDataUrl = ref('');

onMounted(async () => {
  try {
    shareUrl.value = getShareSiteUrl();
    if (!shareUrl.value) return;
    shareQrDataUrl.value = await generateQrSvgDataUrl(shareUrl.value, { size: 200 });
  } catch {
    /* ignore – footer renders without QR */
  }
});
</script>

<template>
  <footer
    class="relative z-10 mt-2xl hidden border-t border-border/50 py-lg md:block"
  >
    <div
      class="mx-auto flex max-w-5xl items-center justify-center gap-sm px-md text-xs text-muted-foreground"
    >
      <div>
        <p class="font-display tracking-widest">
          Lumina Tarot · 在黑暗中点亮内心微光
        </p>
        <p class="mt-xs opacity-70">
          Offline-first · Vue 3 · Tailwind · shadcn-vue
        </p>
      </div>
      <QrLightbox
        v-if="shareQrDataUrl"
        :qr-data-url="shareQrDataUrl"
        :share-url="shareUrl"
        trigger="inline"
      >
        <span class="block shrink-0 rounded-md bg-white p-[2px] shadow-sm">
          <img
            :src="shareQrDataUrl"
            alt=""
            width="28"
            height="28"
            class="block h-[28px] w-[28px]"
          />
        </span>
      </QrLightbox>
      <div
        v-else
        class="shrink-0 rounded-md bg-white p-[2px] shadow-sm"
        aria-hidden="true"
      >
        <div class="h-[28px] w-[28px] animate-pulse rounded-sm bg-muted" />
      </div>
    </div>
  </footer>
</template>
