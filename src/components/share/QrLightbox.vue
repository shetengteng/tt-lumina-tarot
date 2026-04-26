<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  qrDataUrl: string | null | undefined;
  shareUrl?: string | null;
  trigger: 'manual' | 'inline';
  open?: boolean;
  size?: number;
  alt?: string;
  caption?: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const { t } = useI18n();

const internalOpen = ref(false);
const isOpen = ref(false);

watch(
  () => props.open,
  (v) => {
    if (props.trigger === 'manual') isOpen.value = !!v;
  },
  { immediate: true }
);

watch(internalOpen, (v) => {
  if (props.trigger === 'inline') isOpen.value = v;
});

function show() {
  if (!props.qrDataUrl) return;
  if (props.trigger === 'manual') emit('update:open', true);
  else internalOpen.value = true;
}

function hide() {
  if (props.trigger === 'manual') emit('update:open', false);
  else internalOpen.value = false;
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) hide();
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey);
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
}

const altText = (() => props.alt || t('share.qrAlt'));
const captionText = (() => props.caption || t('share.qrHint'));
const titleText = (() => t('qrLightbox.title'));
const closeAria = (() => t('qrLightbox.closeAria'));
const linkLabel = (() => t('qrLightbox.openLink'));
const buttonAria = (() => t('qrLightbox.expandAria'));
</script>

<template>
  <button
    v-if="trigger === 'inline'"
    type="button"
    class="qr-trigger"
    :class="{ 'qr-trigger--disabled': !qrDataUrl }"
    :aria-label="buttonAria()"
    :disabled="!qrDataUrl"
    @click="show"
  >
    <slot />
  </button>

  <Teleport to="body">
    <transition name="qr-lightbox">
      <div
        v-if="isOpen && qrDataUrl"
        class="qr-lightbox-mask"
        role="dialog"
        aria-modal="true"
        :aria-label="titleText()"
        @click.self="hide"
      >
        <div class="qr-lightbox-panel">
          <header class="qr-lightbox-header">
            <h3 class="qr-lightbox-title">{{ titleText() }}</h3>
            <button
              type="button"
              class="qr-lightbox-close"
              :aria-label="closeAria()"
              @click="hide"
            >
              ×
            </button>
          </header>
          <div class="qr-lightbox-body">
            <div class="qr-lightbox-image">
              <img
                :src="qrDataUrl"
                :alt="altText()"
                :width="size ?? 360"
                :height="size ?? 360"
                draggable="false"
              />
            </div>
            <p v-if="captionText()" class="qr-lightbox-caption">
              {{ captionText() }}
            </p>
            <a
              v-if="shareUrl"
              :href="shareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="qr-lightbox-link"
            >
              {{ linkLabel() }}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.qr-trigger {
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: zoom-in;
  display: inline-flex;
  border-radius: 8px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.qr-trigger:hover:not(.qr-trigger--disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px hsl(var(--primary) / 0.18);
}
.qr-trigger:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.6);
  outline-offset: 4px;
}
.qr-trigger--disabled {
  cursor: default;
  opacity: 0.6;
}

.qr-lightbox-mask {
  position: fixed;
  inset: 0;
  background: rgba(8, 5, 18, 0.82);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
}

.qr-lightbox-panel {
  position: relative;
  width: min(440px, 100%);
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.qr-lightbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid hsl(var(--border));
}
.qr-lightbox-title {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.qr-lightbox-close {
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
.qr-lightbox-close:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.qr-lightbox-body {
  padding: 24px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.qr-lightbox-image {
  width: 100%;
  display: flex;
  justify-content: center;
  background: white;
  padding: 14px;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}
.qr-lightbox-image img {
  width: 100%;
  max-width: 360px;
  height: auto;
  display: block;
}
.qr-lightbox-caption {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.14em;
  color: hsl(var(--muted-foreground));
  text-align: center;
}
.qr-lightbox-link {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: hsl(var(--primary));
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.15s ease;
}
.qr-lightbox-link:hover {
  text-decoration: underline;
}

.qr-lightbox-enter-active,
.qr-lightbox-leave-active {
  transition: opacity 0.18s ease;
}
.qr-lightbox-enter-from,
.qr-lightbox-leave-to {
  opacity: 0;
}
</style>
