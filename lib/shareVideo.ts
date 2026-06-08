/**
 * Share a generated video blob via the Web Share API when available (iOS / Android),
 * with an anchor-download fallback for desktop browsers.
 *
 * On iOS the Web Share API opens the native share sheet, which lets the user
 * send the file directly to Instagram Stories, WhatsApp, Photos, etc. — much
 * more reliable than `<a download>` for blob URLs (which iOS Safari often
 * silently drops).
 */

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'error';

export async function shareVideoOrDownload(
  blobUrl: string,
  filename: string,
  options?: { title?: string; text?: string },
): Promise<ShareOutcome> {
  // Materialize the blob URL back into a File so the Web Share API can ingest it
  let file: File | null = null;
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    const type = blob.type || (filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm');
    file = new File([blob], filename, { type });
  } catch {
    // We still try anchor download below as a last resort
  }

  // Prefer Web Share API with a File payload (the only iOS-reliable path)
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
      // fall through to anchor fallback
    }
  }

  // Anchor download fallback (works on most desktop browsers)
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
