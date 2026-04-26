import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fisher–Yates shuffle using Web Crypto API (cryptographically random).
 * Falls back to Math.random when crypto is unavailable (non-browser SSR etc).
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  const hasCrypto =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function';

  for (let i = out.length - 1; i > 0; i--) {
    let j: number;
    if (hasCrypto) {
      const buf = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buf);
      j = buf[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 以加密随机决定正位/逆位，reversedRate ∈ [0,1]，默认 0.35 */
export function isReversed(reversedRate = 0.35): boolean {
  const hasCrypto =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function';

  if (hasCrypto) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] / 0xffffffff < reversedRate;
  }
  return Math.random() < reversedRate;
}

export function formatDate(ts: number, locale = 'zh-CN'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(ts);
  } catch {
    return new Date(ts).toISOString();
  }
}

/** 相对时间描述：刚刚 / N 分钟前 / N 小时前 / N 天前 / 具体日期 */
export function formatRelative(ts: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  if (diff < MIN) return '刚刚';
  if (diff < HOUR) return `${Math.floor(diff / MIN)} 分钟前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} 小时前`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} 天前`;
  return formatDate(ts).slice(0, 10);
}

export function uid(prefix = 'id'): string {
  const rand = globalThis.crypto?.randomUUID?.();
  if (rand) return `${prefix}_${rand}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 把 `public/` 下的资源相对路径解析为带 vite base 前缀的绝对 URL。
 * 用于代码里硬编码的图片/资源路径（vite 的 base 配置只改写 HTML/JS/CSS
 * 中由打包器解析的引用，不会改写运行时字符串字面量）。
 *
 * 示例（BASE_URL='/tt-lumina-tarot/'）:
 *   assetUrl('/decks/rws/fool.webp')  -> '/tt-lumina-tarot/decks/rws/fool.webp'
 *   assetUrl('img/icon-192.png')      -> '/tt-lumina-tarot/img/icon-192.png'
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\/+/, '')}`;
}
