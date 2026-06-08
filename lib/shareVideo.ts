/**
 * Share a generated video blob.
 *
 *   Strategy (in order):
 *   1. Web Share API with `files`        — iOS native share sheet
 *      (send to IG Stories / WhatsApp / Save to Photos with one tap).
 *   2. iOS: `window.open(blobUrl)`        — opens the video in a new tab
 *      where the user can long-press the video or tap the share icon
 *      to save / send. Anchor downloads for blob URLs are KNOWN-BROKEN
 *      on iOS Safari (the system prompts to download but silently fails
 *      to save the file — a documented WebKit issue).
 *   3. Anchor download                    — works on desktop browsers.
 */

export type ShareOutcome = 'shared' | 'downloaded' | 'opened' | 'cancelled' | 'error';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPad on iOS 13+ reports as "Macintosh" so also check touch points.
  return /iPad|iPhone|iPod/.test(ua) ||
         (ua.includes('Mac') && typeof document !== 'undefined' && 'ontouchend' in document);
}

export async function shareVideoOrDownload(
  blobUrl: string,
  filename: string,
  options?: { title?: string; text?: string },
): Promise<ShareOutcome> {
  // Materialize the blob URL back into a File so the Web Share API can ingest it.
  // We try to keep this fast so the user-gesture context is still valid when
  // we call navigator.share().
  let file: File | null = null;
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    const type = blob.type || (filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm');
    file = new File([blob], filename, { type });
  } catch {
    // We still try the fallbacks below
  }

  // 1) Web Share API — best UX on iOS / Android
  if (
    file &&
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: options?.title,
        text:  options?.text,
      });
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
      // fall through
    }
  }

  // 2) iOS fallback — anchor downloads of blob URLs are broken on iOS Safari.
  //    Open the blob in a new tab so the user can tap the share icon (or
  //    long-press the video) to save / send it.
  if (isIOS()) {
    try {
      const w = window.open(blobUrl, '_blank');
      if (w) return 'opened';
    } catch {
      // fall through
    }
  }

  // 3) Desktop fallback — anchor download.
  try {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return 'downloaded';
  } catch {
    return 'error';
  }
}
