<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');
const ready = ref(false);

let renderer: import('three').WebGLRenderer | null = null;
let scene: import('three').Scene | null = null;
let camera: import('three').PerspectiveCamera | null = null;
let stars: import('three').Points | null = null;
let glyph: import('three').LineSegments | null = null;
let raf: number | null = null;
let resizeListener: (() => void) | null = null;
let disposed = false;

async function init() {
  if (disposed) return;
  if (!canvasRef.value) return;

  const THREE = await import('three');
  if (disposed) return;

  const canvas = canvasRef.value;
  const { clientWidth, clientHeight } = canvas;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(clientWidth, clientHeight, false);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.1, 1000);
  camera.position.z = 60;

  const starCount = 900;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 80 + Math.random() * 220;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const tone = 0.55 + Math.random() * 0.45;
    colors[i * 3] = 0.95 * tone;
    colors[i * 3 + 1] = 0.85 * tone;
    colors[i * 3 + 2] = 0.55 * tone;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 1.4,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
  });
  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const glyphPositions: number[] = [];
  const sides = 6;
  const radius = 22;
  for (let i = 0; i < sides; i++) {
    const a1 = (i / sides) * Math.PI * 2;
    const a2 = ((i + 1) / sides) * Math.PI * 2;
    glyphPositions.push(
      Math.cos(a1) * radius,
      Math.sin(a1) * radius,
      0,
      Math.cos(a2) * radius,
      Math.sin(a2) * radius,
      0
    );
  }
  for (let i = 0; i < sides; i++) {
    const a1 = (i / sides) * Math.PI * 2;
    const a2 = ((i + 2) / sides) * Math.PI * 2;
    glyphPositions.push(
      Math.cos(a1) * radius,
      Math.sin(a1) * radius,
      0,
      Math.cos(a2) * radius,
      Math.sin(a2) * radius,
      0
    );
  }
  const glyphGeo = new THREE.BufferGeometry();
  glyphGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(glyphPositions), 3)
  );
  const glyphMat = new THREE.LineBasicMaterial({
    color: 0xc9a961,
    transparent: true,
    opacity: 0.18,
  });
  glyph = new THREE.LineSegments(glyphGeo, glyphMat);
  glyph.position.z = -10;
  scene.add(glyph);

  const start = performance.now();
  function animate() {
    if (disposed || !renderer || !scene || !camera || !stars || !glyph) return;
    const t = (performance.now() - start) / 1000;
    stars.rotation.y = t * 0.018;
    stars.rotation.x = Math.sin(t * 0.05) * 0.05;
    glyph.rotation.z = t * 0.06;
    glyph.position.y = Math.sin(t * 0.4) * 1.5;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  animate();
  ready.value = true;

  resizeListener = () => {
    if (!renderer || !camera || !canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resizeListener, { passive: true });
}

onMounted(() => {
  const idle: (cb: () => void) => number =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (cb) =>
          (window as Window & typeof globalThis).requestIdleCallback(cb, { timeout: 1500 })
      : (cb) => window.setTimeout(cb, 700);
  idle(() => {
    void init();
  });
});

onBeforeUnmount(() => {
  disposed = true;
  if (raf) cancelAnimationFrame(raf);
  if (resizeListener) window.removeEventListener('resize', resizeListener);
  resizeListener = null;
  try {
    if (stars) {
      stars.geometry.dispose();
      (stars.material as import('three').Material).dispose();
    }
    if (glyph) {
      glyph.geometry.dispose();
      (glyph.material as import('three').Material).dispose();
    }
    renderer?.dispose();
  } catch {
    /* ignore */
  }
  renderer = null;
  scene = null;
  camera = null;
  stars = null;
  glyph = null;
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 h-full w-full transition-opacity duration-700"
    :style="{ opacity: ready ? 0.7 : 0 }"
  />
</template>
