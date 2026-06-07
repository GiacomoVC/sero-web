'use client';

import { useRef, useState } from 'react';
import { StoryCard, type StoryCardHandle } from './StoryCard';
import type { SubmitResult } from '@/lib/types';

function IconDownload() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden>
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 11.586V4a1 1 0 011-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export function ShareScreen({
  result,
  firstName,
  initialBlob: _initialBlob,
}: {
  result: SubmitResult;
  firstName: string;
  initialBlob?: File | null;
}) {
  const cardRef = useRef<StoryCardHandle>(null);
  const [dlState, setDlState] = useState<'idle' | 'loading' | 'done'>('idle');

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const tags = (result.tags ?? []).filter(Boolean);

  const handleDownload = async () => {
    if (dlState === 'loading') return;
    setDlState('loading');

    // Copy URL to clipboard
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* noop */ }

    // Capture card as 1080×1920 PNG
    try {
      const dataUrl = await cardRef.current?.capture();
      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `sero-${result.slug}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch { /* noop */ }

    setDlState('done');
    setTimeout(() => setDlState('idle'), 3500);
  };

  return (
    <div className="min-h-[100svh] bg-ink flex flex-col items-center px-6 py-10">

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white text-center mt-2">
        ¡Listo, {firstName || 'amigo'}!
      </h1>

      {/* Animated card */}
      <div className="mt-8 shrink-0 rounded-3xl shadow-2xl overflow-hidden">
        <StoryCard
          ref={cardRef}
          firstName={firstName}
          tags={tags}
          shareUrl={shareUrl}
        />
      </div>

      {/* Social proof nudge */}
      <p className="mt-6 text-white/60 text-sm text-center max-w-xs">
        Más amigos se suman, más rápido sale tu plan 🥂
      </p>

      {/* Download + copy CTA */}
      <button
        onClick={handleDownload}
        disabled={dlState === 'loading'}
        className="mt-4 btn-primary flex items-center gap-2.5 text-base disabled:opacity-70"
      >
        {dlState === 'loading' ? (
          <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <IconDownload />
        )}
        {dlState === 'done'
          ? 'Descargado · link copiado ✓'
          : dlState === 'loading'
          ? 'Preparando…'
          : 'Descargar card y copiar mi link'}
      </button>

      {/* Step instructions */}
      <div className="mt-6 w-full max-w-sm space-y-2">
        <p className="text-white/40 text-xs leading-relaxed">
          <span className="text-white/25 mr-2">1</span>
          Click arriba para descargar y auto-copiar tu link
        </p>
        <p className="text-white/40 text-xs leading-relaxed">
          <span className="text-white/25 mr-2">2</span>
          Comparte tu card en stories con el link como sticker, o envíala por WhatsApp (no olvides pegar tu link)
        </p>
      </div>

      {/* Footer */}
      <p className="mt-10 text-white/20 text-xs tracking-[0.3em] uppercase">
        Sero · {new Date().getFullYear()}
      </p>
    </div>
  );
}
