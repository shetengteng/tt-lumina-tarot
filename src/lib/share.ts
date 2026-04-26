import html2canvas from 'html2canvas';

export interface ShareImageOptions {
  scale?: number;
  background?: string;
  filename?: string;
}

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed';

/**
 * Render a DOM node into a PNG Blob using html2canvas.
 * - Uses 2x scale by default (Retina-friendly).
 * - Forces an opaque background color so devicePixelRatio mishaps don't
 *   produce transparent corners.
 */
export async function renderNodeToBlob(
  node: HTMLElement,
  opts: ShareImageOptions = {}
): Promise<Blob> {
  const scale = opts.scale ?? 2;
  const background = opts.background ?? '#0e0a1a';

  const canvas = await html2canvas(node, {
    backgroundColor: background,
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 8000,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/png',
      0.95
    );
  });

  return blob;
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function downloadBlob(blob: Blob, filename = `lumina-tarot-${Date.now()}.png`) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Try to share via Web Share API Level 2 (with files). Falls back to
 * downloading the blob locally if the API or files-share is unavailable
 * or the user cancels.
 */
export async function shareBlob(
  blob: Blob,
  meta: { title?: string; text?: string; filename?: string } = {}
): Promise<ShareOutcome> {
  const filename = meta.filename ?? `lumina-tarot-${Date.now()}.png`;
  const file = new File([blob], filename, { type: blob.type || 'image/png' });

  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const canShareFiles =
    !!nav &&
    typeof nav.canShare === 'function' &&
    nav.canShare({ files: [file] }) &&
    typeof nav.share === 'function';

  if (canShareFiles) {
    try {
      await nav!.share({
        title: meta.title,
        text: meta.text,
        files: [file],
      });
      return 'shared';
    } catch (err) {
      const e = err as DOMException | Error;
      if ((e as DOMException).name === 'AbortError') return 'cancelled';
      downloadBlob(blob, filename);
      return 'downloaded';
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}
