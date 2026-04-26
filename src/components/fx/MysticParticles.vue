<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const ready = ref(false);
let container: import('@tsparticles/engine').Container | null = null;
let disposed = false;

async function init() {
  if (disposed) return;
  if (!containerRef.value) return;

  const [{ tsParticles }, { loadSlim }] = await Promise.all([
    import('@tsparticles/engine'),
    import('@tsparticles/slim'),
  ]);
  if (disposed) return;
  await loadSlim(tsParticles);
  if (disposed) return;

  const loaded = await tsParticles.load({
    element: containerRef.value,
    options: {
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 60,
          density: { enable: true, width: 1280, height: 720 },
        },
        color: { value: ['#c9a961', '#e6cf95', '#f8e9c1'] },
        opacity: {
          value: { min: 0.25, max: 0.75 },
          animation: { enable: true, speed: 0.6, sync: false },
        },
        size: {
          value: { min: 0.6, max: 1.8 },
        },
        move: {
          enable: true,
          speed: 0.18,
          direction: 'top',
          random: true,
          straight: false,
          outModes: { default: 'out' },
        },
        shape: { type: 'circle' },
      },
      interactivity: {
        events: { onHover: { enable: false }, resize: { enable: true } },
      },
    },
  });
  container = loaded ?? null;
  if (disposed && container) {
    try {
      container.destroy();
    } catch {
      /* ignore */
    }
    container = null;
    return;
  }
  ready.value = !!container;
}

onMounted(() => {
  const idle: (cb: () => void) => number =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (cb) =>
          (window as Window & typeof globalThis).requestIdleCallback(cb, { timeout: 1500 })
      : (cb) => window.setTimeout(cb, 600);
  idle(() => {
    void init();
  });
});

onBeforeUnmount(() => {
  disposed = true;
  try {
    container?.destroy();
  } catch {
    /* ignore */
  }
  container = null;
});
</script>

<template>
  <div
    ref="containerRef"
    class="absolute inset-0 transition-opacity duration-500"
    :style="{ opacity: ready ? 0.85 : 0 }"
  ></div>
</template>
