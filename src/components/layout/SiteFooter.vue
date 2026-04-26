<script setup lang="ts">
import { onMounted, ref } from 'vue';
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
      class="mx-auto flex max-w-5xl flex-col items-center gap-sm px-md text-center text-xs text-muted-foreground"
    >
      <p class="font-display tracking-widest">
        Lumina Tarot · 在黑暗中点亮内心微光
      </p>
      <p class="opacity-70">
        Offline-first · Vue 3 · Tailwind · shadcn-vue
      </p>
      <div class="mt-xs rounded-md bg-white p-xs shadow-sm">
        <img
          v-if="shareQrDataUrl"
          :src="shareQrDataUrl"
          alt=""
          width="48"
          height="48"
          class="block h-[48px] w-[48px]"
        />
        <div
          v-else
          class="h-[48px] w-[48px] animate-pulse rounded-sm bg-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  </footer>
</template>
