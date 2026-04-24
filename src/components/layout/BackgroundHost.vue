<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const { theme, reducedMotion } = storeToRefs(settings);

const mode = computed(() => theme.value);
const disabled = computed(() => reducedMotion.value);
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div v-if="mode === 'mystic'" class="absolute inset-0">
      <div class="bg-mystic-base" />
      <div v-if="!disabled" class="bg-mystic-stars" />
      <div v-if="!disabled" class="bg-mystic-mist" />
      <div class="bg-mystic-vignette" />
    </div>

    <div v-else-if="mode === 'minimal'" class="absolute inset-0">
      <div class="bg-minimal-base" />
      <div class="bg-minimal-grain" />
      <div v-if="!disabled" class="bg-minimal-circle" />
    </div>

    <div v-else class="absolute inset-0">
      <div class="bg-nature-base" />
      <div class="bg-nature-sun" />
      <div v-if="!disabled" class="bg-nature-leaves" />
    </div>
  </div>
</template>

<style scoped>
.bg-mystic-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 10%, hsl(230 45% 19% / 0.8), transparent 60%),
    radial-gradient(ellipse at 80% 90%, hsl(265 40% 20% / 0.6), transparent 65%),
    linear-gradient(180deg, hsl(230 30% 5%) 0%, hsl(230 30% 9%) 100%);
}
.bg-mystic-stars {
  position: absolute;
  inset: -25%;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 18%, hsl(43 72% 85% / 0.9) 50%, transparent 60%),
    radial-gradient(1px 1px at 76% 28%, hsl(43 72% 85% / 0.7) 50%, transparent 60%),
    radial-gradient(1.5px 1.5px at 35% 72%, hsl(43 72% 85% / 0.85) 50%, transparent 60%),
    radial-gradient(1px 1px at 88% 60%, hsl(43 72% 85% / 0.6) 50%, transparent 60%),
    radial-gradient(1.2px 1.2px at 52% 12%, hsl(43 72% 85% / 0.75) 50%, transparent 60%),
    radial-gradient(1px 1px at 22% 56%, hsl(43 72% 85% / 0.5) 50%, transparent 60%),
    radial-gradient(1.5px 1.5px at 68% 84%, hsl(43 72% 85% / 0.9) 50%, transparent 60%),
    radial-gradient(1px 1px at 8% 88%, hsl(43 72% 85% / 0.5) 50%, transparent 60%);
  background-size: 100% 100%;
  animation: starDrift 80s linear infinite, starTwinkle 4s ease-in-out infinite;
  opacity: 0.7;
}
.bg-mystic-mist {
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    ellipse at 50% 60%,
    hsl(265 40% 50% / 0.15) 0%,
    transparent 60%
  );
  animation: mistDrift 30s ease-in-out infinite alternate;
  mix-blend-mode: screen;
}
.bg-mystic-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    transparent 40%,
    hsl(230 30% 5% / 0.75) 100%
  );
}
@keyframes starDrift {
  from { transform: translate3d(0, 0, 0) rotate(0deg); }
  to { transform: translate3d(-2%, -2%, 0) rotate(1deg); }
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.9; }
}
@keyframes mistDrift {
  from { transform: translate3d(-3%, -1%, 0); }
  to { transform: translate3d(3%, 1%, 0); }
}

.bg-minimal-base {
  position: absolute;
  inset: 0;
  background: hsl(var(--background));
}
.bg-minimal-grain {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    radial-gradient(hsl(0 0% 0% / 0.05) 1px, transparent 1px),
    radial-gradient(hsl(0 0% 0% / 0.03) 1px, transparent 1px);
  background-size: 4px 4px, 6px 6px;
  background-position: 0 0, 2px 2px;
}
.bg-minimal-circle {
  position: absolute;
  left: 50%;
  top: 12%;
  width: 560px;
  aspect-ratio: 1;
  max-width: 80vw;
  transform: translateX(-50%);
  border: 1.5px solid hsl(var(--foreground) / 0.1);
  border-radius: 50%;
  animation: circlePulse 10s ease-in-out infinite;
}
@keyframes circlePulse {
  0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.65; transform: translateX(-50%) scale(1.02); }
}

.bg-nature-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 10%, hsl(37 67% 96%) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, hsl(30 52% 78%) 0%, transparent 60%),
    linear-gradient(180deg, hsl(37 67% 93%) 0%, hsl(32 50% 85%) 100%);
}
.bg-nature-sun {
  position: absolute;
  right: -12%;
  top: -12%;
  width: 45vmax;
  aspect-ratio: 1;
  background: radial-gradient(
    circle at 50% 50%,
    hsl(43 72% 80% / 0.55) 0%,
    hsl(30 52% 75% / 0.25) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(20px);
}
.bg-nature-leaves {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(10px 4px at 12% 80%, hsl(110 25% 55% / 0.4), transparent 60%),
    radial-gradient(14px 5px at 68% 22%, hsl(110 25% 60% / 0.35), transparent 60%),
    radial-gradient(12px 4px at 35% 48%, hsl(110 25% 50% / 0.4), transparent 60%),
    radial-gradient(10px 4px at 86% 70%, hsl(110 25% 55% / 0.35), transparent 60%);
  animation: leafFloat 14s ease-in-out infinite;
  mix-blend-mode: multiply;
}
@keyframes leafFloat {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-1%, -2%, 0); }
}
</style>
