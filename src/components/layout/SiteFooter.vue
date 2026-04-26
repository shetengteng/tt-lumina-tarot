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
      class="mx-auto flex max-w-5xl items-center justify-between gap-md px-md text-xs text-muted-foreground"
    >
      <div>
        <p class="font-display tracking-widest">
          Lumina Tarot · 在黑暗中点亮内心微光
        </p>
        <p class="mt-xs opacity-70">
          Offline-first · Vue 3 · Tailwind · shadcn-vue
        </p>
      </div>
      <div class="shrink-0 rounded-md bg-white p-[2px] shadow-sm">
        <img
          v-if="shareQrDataUrl"
          :src="shareQrDataUrl"
          alt=""
          width="32"
          height="32"
          class="block h-[32px] w-[32px]"
        />
        <div
          v-else
          class="h-[32px] w-[32px] animate-pulse rounded-sm bg-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  </footer>
</template>
