'use client';

import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

/**
 * 1080×1440 canvas frame for Instagram carousel slides.
 *
 * Renders the children inside a scaled wrapper so it fits on screen, and
 * exposes a "Descargar PNG" button that exports at native pixel resolution.
 *
 * The trick: html2canvas internally clones the target node before rasterizing.
 * We use the `onclone` callback to strip the `transform: scale(...)` on the
 * clone, so the rasterizer sees a full-size 1080×1440 element. The original
 * DOM is never mutated, so animations keep running and the preview stays
 * untouched.
 */
export function IgPostFrame({
  children,
  fileName,
  background = '#FAF8F5',
}: {
  children: React.ReactNode;
  fileName: string;
  background?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function recompute() {
      const w = containerRef.current?.clientWidth ?? 600;
      const targetW = Math.min(w - 40, 600);
      setScale(targetW / 1080);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  async function download() {
    if (!frameRef.current || busy) return;
    setBusy(true);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(frameRef.current, {
        width: 1080,
        height: 1440,
        windowWidth: 1080,
        windowHeight: 1440,
        scale: 1,
        backgroundColor: background,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        onclone: (_doc, clonedElement) => {
          // Reset the scale on the cloned root so html2canvas sees it at its
          // native 1080×1440 size, not the visually shrunken preview size.
          const el = clonedElement as HTMLElement;
          el.style.transform = 'none';
          el.style.transformOrigin = 'top left';
        },
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('No blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error(e);
      alert('No se pudo exportar — intenta de nuevo o reporta el error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-4">
      <div
        style={{
          width: 1080 * scale,
          height: 1440 * scale,
        }}
        className="relative shadow-2xl rounded-2xl overflow-hidden"
      >
        <div
          ref={frameRef}
          style={{
            width: 1080,
            height: 1440,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background,
          }}
          className="relative"
        >
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="rounded-full bg-ink text-white px-6 py-3 text-sm font-bold disabled:opacity-60"
      >
        {busy ? 'Exportando…' : 'Descargar PNG (1080×1440)'}
      </button>
    </div>
  );
}
