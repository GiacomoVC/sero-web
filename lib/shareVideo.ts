/**
 * Share a pre-recorded video Blob — SYNCHRONOUSLY launches the iOS share
 * sheet from the user-gesture handler.
 *
 * Why this matters on iOS:
 *   - iOS Safari requires `navigator.share()` to be called inside the same
 *     synchronous task as the user gesture (click).
 *   - Even a microtask `await` (e.g. `await fetch(blobUrl)` to materialize
 *     a File) breaks the gesture context and the share is rejected with
 *     `NotAllowedError`, then the code silently falls through to an anchor
 *     download — which iOS Safari ALSO can't complete for blob URLs.
 *
 *   So: the caller must already hold the Blob (pre-recorded) and call this
 *   helper synchronously from the click handler. No `await` anywhere on the
 *   path between click → navigator.share().
 *
 * Returns a Promise so the caller can react to the share completing, but
 * `navigator.share()` itself is invoked synchronously.
 */

export type ShareOutcome = 'shared' | 'downloaded' | 'opened' | 'cancelled' | 'error';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) ||
         (ua.includes('Mac') && typeof document !== 'undefined' && 'ontouchend' in document);
}

function fallback(url: string, filename: string): ShareOutcome {
  // iOS: open the blob in a new tab — user can long-press the video or tap
  // the share icon to save / send. Anchor downloads of blob URLs are
  // known-broken on iOS Safari.
  if (isIOS()) {
    try {
      const w = window.open(url, '_blank');
      if (w) return 'opened';
    } catch { /* fall through */ }
  }
  // Desktop: anchor download
  try {
    const a = document.createElement('a');
    a.href = url;
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

export function shareVideoBlob(
  blob: Blob,
  blobUrl: string,
  filename: string,
  options?: { title?: string; text?: string },
): Promise<ShareOutcome> {
  // Construct the File synchronously — no fetch / no microtask awaits.
  const type = blob.type || (filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm');
  const file = new File([blob], filename, { type });

  // Web Share API with files — best UX on iOS / Android
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    // CRITICAL: this call must be reached synchronously from the click handler.
    // Returning a Promise that wraps the share() call is fine because the
    // share() is dispatched immediately; the caller can `await` the returned
    // promise without breaking iOS's gesture rule.
    return navigator.share({
      files: [file],
      title: options?.title,
      text:  options?.text,
    })
      .then(() => 'shared' as ShareOutcome)
      .catch((err: DOMException) => {
        if (err?.name === 'AbortError') return 'cancelled';
        return fallback(blobUrl, filename);
      });
  }

  // No Web Share API support for files — go straight to the fallback chain.
  return Promise.resolve(fallback(blobUrl, filename));
}
