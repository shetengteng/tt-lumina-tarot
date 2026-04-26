<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import ShareCard from './ShareCard.vue';
import type { ReadingRecord } from '@/types';

type ShareModule = typeof import('@/lib/share');
let shareModulePromise: Promise<ShareModule> | null = null;
function loadShareModule(): Promise<ShareModule> {
  if (!shareModulePromise) {
    shareModulePromise = import('@/lib/share');
  }
  return shareModulePromise;
}

const props = defineProps<{
  open: boolean;
  record: ReadingRecord | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const { t } = useI18n();

const cardRef = ref<HTMLElement | null>(null);
const previewBlob = ref<Blob | null>(null);
const previewUrl = ref<string | null>(null);
const status = ref<'idle' | 'rendering' | 'ready' | 'failed'>('idle');
const toastMessage = ref<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function setToast(msg: string) {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = null;
  }, 2200);
}

function releaseUrl() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

async function buildPreview() {
  if (!props.record || !cardRef.value) return;
  status.value = 'rendering';
  releaseUrl();
  previewBlob.value = null;
  try {
    await nextTick();
    await waitForFonts();
    await waitForImages(cardRef.value);
    const { renderNodeToBlob, blobToObjectUrl } = await loadShareModule();
    const blob = await renderNodeToBlob(cardRef.value, { scale: 2, background: '#0e0a1a' });
    previewBlob.value = blob;
    previewUrl.value = blobToObjectUrl(blob);
    status.value = 'ready';
  } catch (err) {
    console.error('[share] render failed', err);
    status.value = 'failed';
    setToast(t('share.failed'));
  }
}

async function waitForFonts() {
  if (typeof document === 'undefined') return;
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (fonts?.ready) {
    try {
      await fonts.ready;
    } catch {
      // ignore
    }
  }
}

async function waitForImages(scope: HTMLElement) {
  const imgs = Array.from(scope.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const cleanup = () => {
            img.removeEventListener('load', onDone);
            img.removeEventListener('error', onDone);
          };
          const onDone = () => {
            cleanup();
            resolve();
          };
          img.addEventListener('load', onDone, { once: true });
          img.addEventListener('error', onDone, { once: true });
        })
    )
  );
}

async function onShare() {
  if (!previewBlob.value || !props.record) return;
  const meta = {
    title: props.record.cards.length > 1 ? t('share.titleMultiple') : t('share.titleSingle'),
    text: props.record.question || t('share.brand'),
    filename: `lumina-tarot-${props.record.id}.png`,
  };
  const { shareBlob } = await loadShareModule();
  const result = await shareBlob(previewBlob.value, meta);
  if (result === 'shared') setToast(t('share.sharedSuccess'));
  else if (result === 'downloaded') setToast(t('share.fallbackDownload'));
  else if (result === 'cancelled') setToast(t('share.cancelled'));
}

async function onDownload() {
  if (!previewBlob.value || !props.record) return;
  const { downloadBlob } = await loadShareModule();
  downloadBlob(previewBlob.value, `lumina-tarot-${props.record.id}.png`);
  setToast(t('share.fallbackDownload'));
}

function close() {
  emit('update:open', false);
}

watch(
  () => props.open,
  async (v) => {
    if (v && props.record) {
      previewBlob.value = null;
      previewUrl.value && releaseUrl();
      status.value = 'idle';
      await nextTick();
      await buildPreview();
    } else if (!v) {
      releaseUrl();
      previewBlob.value = null;
      status.value = 'idle';
    }
  }
);

onBeforeUnmount(() => {
  releaseUrl();
  if (toastTimer) clearTimeout(toastTimer);
});

const showCanShare = computed(() => {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.share === 'function';
});
</script>

<template>
  <Teleport to="body">
    <transition name="share-dialog">
      <div
        v-if="open"
        class="share-dialog-mask"
        role="dialog"
        aria-modal="true"
        :aria-label="t('share.titleSingle')"
        @click.self="close"
      >
        <div class="share-dialog-panel">
          <header class="share-dialog-header">
            <h3 class="share-dialog-title">
              {{ record && record.cards.length > 1 ? t('share.titleMultiple') : t('share.titleSingle') }}
            </h3>
            <button
              type="button"
              class="share-dialog-close"
              :aria-label="t('share.closeAria')"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="share-dialog-body">
            <div class="share-preview-frame">
              <div v-if="status === 'rendering'" class="share-status">
                <span class="share-status-dot" />
                {{ t('share.rendering') }}
              </div>
              <div v-else-if="status === 'failed'" class="share-status share-status-failed">
                {{ t('share.failed') }}
                <button type="button" class="share-retry-btn" @click="buildPreview">
                  {{ t('share.retry') }}
                </button>
              </div>
              <img
                v-else-if="previewUrl"
                :src="previewUrl"
                :alt="t('share.previewAlt')"
                class="share-preview-img"
              />
            </div>
          </div>

          <footer class="share-dialog-actions">
            <Button variant="ghost" @click="close">{{ t('common.close') }}</Button>
            <Button variant="outline" :disabled="status !== 'ready'" @click="onDownload">
              {{ t('share.saveImage') }}
            </Button>
            <Button
              v-if="showCanShare"
              variant="glow"
              :disabled="status !== 'ready'"
              @click="onShare"
            >
              {{ t('share.shareNow') }}
            </Button>
          </footer>

          <transition name="share-toast">
            <div v-if="toastMessage" class="share-toast">
              {{ toastMessage }}
            </div>
          </transition>
        </div>

        <div class="share-render-host" aria-hidden="true">
          <div ref="cardRef" class="share-render-stage">
            <ShareCard v-if="record" :record="record" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.share-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(8, 5, 18, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
}

.share-dialog-panel {
  position: relative;
  width: min(560px, 100%);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 16px;
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.share-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}
.share-dialog-title {
  font-family: 'Cinzel', serif;
  font-size: 1.05rem;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
}
.share-dialog-close {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: hsl(var(--muted-foreground));
  border: none;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.share-dialog-close:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.share-dialog-body {
  padding: 16px 20px;
  overflow-y: auto;
}
.share-preview-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1080 / 1500;
  border-radius: 12px;
  overflow: hidden;
  background: rgb(14, 10, 26);
  border: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
}
.share-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.share-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(220, 210, 255);
}
.share-status-failed {
  flex-direction: column;
  gap: 12px;
  color: rgb(255, 180, 180);
  text-align: center;
}
.share-retry-btn {
  background: transparent;
  border: 1px solid rgba(255, 180, 180, 0.4);
  color: rgb(255, 200, 200);
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: 0.12em;
}
.share-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgb(196, 152, 255);
  box-shadow: 0 0 12px rgb(196, 152, 255);
  animation: share-pulse 1.2s ease-in-out infinite;
}
@keyframes share-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}

.share-dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid hsl(var(--border));
}

.share-toast {
  position: absolute;
  left: 50%;
  bottom: 84px;
  transform: translateX(-50%);
  background: rgba(20, 14, 42, 0.95);
  color: rgb(232, 220, 255);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(196, 152, 255, 0.4);
  pointer-events: none;
  z-index: 1;
}

.share-render-host {
  position: fixed;
  left: -10000px;
  top: 0;
  width: 1080px;
  height: auto;
  pointer-events: none;
  opacity: 1;
  z-index: -1;
}
.share-render-stage {
  width: 1080px;
}

.share-dialog-enter-active,
.share-dialog-leave-active {
  transition: opacity 0.18s ease;
}
.share-dialog-enter-from,
.share-dialog-leave-to {
  opacity: 0;
}

.share-toast-enter-active,
.share-toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.share-toast-enter-from,
.share-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}
</style>
