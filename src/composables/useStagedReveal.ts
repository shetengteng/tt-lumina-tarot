import { useSettingsStore } from '@/stores/settings';
import { sleep } from '@/lib/utils';

type GsapModule = typeof import('gsap');

let gsapPromise: Promise<GsapModule> | null = null;
function loadGsap(): Promise<GsapModule> {
  if (!gsapPromise) {
    gsapPromise = import('gsap');
  }
  return gsapPromise;
}

export interface StagedRevealOptions {
  step: (index: number) => void;
  /** Element selector or function returning HTMLElement[] for entrance animation. Optional. */
  targets?: () => HTMLElement[];
  delayMs?: number;
}

export function useStagedReveal() {
  const settings = useSettingsStore();

  async function reveal(count: number, opts: StagedRevealOptions): Promise<void> {
    const delay = opts.delayMs ?? 280;
    if (settings.animationLevel === 'off' || settings.reducedMotion) {
      for (let i = 0; i < count; i++) opts.step(i);
      return;
    }

    if (settings.animationLevel === 'full') {
      const { gsap } = await loadGsap();
      for (let i = 0; i < count; i++) {
        opts.step(i);
        if (opts.targets) {
          const els = opts.targets();
          const el = els[i];
          if (el) {
            gsap.fromTo(
              el,
              { scale: 0.92, filter: 'brightness(0.7)' },
              {
                scale: 1,
                filter: 'brightness(1.0)',
                duration: 0.45,
                ease: 'power3.out',
              }
            );
          }
        }
        await sleep(delay * 0.65);
      }
      return;
    }

    for (let i = 0; i < count; i++) {
      opts.step(i);
      await sleep(delay);
    }
  }

  return { reveal };
}
