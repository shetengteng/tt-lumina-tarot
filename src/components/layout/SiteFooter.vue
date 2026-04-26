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

      <div class="flex flex-col items-center gap-xs sm:items-end">
        <div class="rounded-md bg-white p-xs shadow-sm">
          <img
            v-if="shareQrDataUrl"
            :src="shareQrDataUrl"
            alt=""
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
        <p
          v-if="shareUrl"
          class="break-all font-mono text-[10px] text-muted-foreground/70"
        >
          {{ shareUrl }}
        </p>
      </div>
    </div>
  </footer>
</template>
