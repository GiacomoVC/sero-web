'use client';

import { useRef, useState } from 'react';
import { StoryCard, type StoryCardHandle } from './StoryCard';
import { Confetti } from '../ui/Confetti';
import { StickerNote } from '../ui/StickerNote';
import { Highlight } from '../ui/Highlight';
import { shareVideoOrDownload } from '@/lib/shareVideo';
import type { SubmitResult } from '@/lib/types';

export function ShareScreen({
  result,
  firstName,
  initialBlob: _initialBlob,
}: {
  result: SubmitResult;
  firstName: string;
  initialBlob?: File | null;
}) {
  const cardRef  = useRef<StoryCardHandle>(null);
  const [state,  setState]  = useState<'idle' | 'recording' | 'done'>('idle');
  const [pct,    setPct]    = useState(0);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const tags = (result.tags ?? []).filter(Boolean);

  const handleDownload = async () => {
    if (state !== 'idle') return;
    setState('recording');
    setPct(0);

    const start    = Date.now();
    const interval = setInterval(() => {
      setPct(Math.min(Math.round((Date.now() - start) / 8400 * 100), 99));
    }, 200);

    try {
      // Copy URL to clipboard — runs in parallel with recording
      navigator.clipboard.writeText(shareUrl).catch(() => {});

      const { url, ext } = await cardRef.current!.captureVideo();
      clearInterval(interval);
      setPct(100);

      // Try iOS-friendly share sheet first, fall back to anchor download
      const outcome = await shareVideoOrDownload(
        url,
        `sero-${result.slug}.${ext}`,
        { title: 'sero', text: 'Únete a sero — amigos que comparten lo que amas' },
      );

      // Cleanup blob URL (after the share sheet has read it)
      setTimeout(() => URL.revokeObjectURL(url), 30_000);

      if (outcome === 'cancelled') {
        setState('idle');
        setPct(0);
      } else {
        setState('done');
        setTimeout(() => { setState('idle'); setPct(0); }, 4000);
      }
    } catch {
      clearInterval(interval);
      setState('idle');
      setPct(0);
    }
  };

  const buttonLabel = () => {
    if (state === 'done')      return 'Listo · link copiado ✓';
    if (state === 'recording') return `Preparando tu video… ${pct}%`;
    return 'Compartir mi video y copiar mi link';
  };

  return (
    <div className="relative min-h-[100svh] bg-cream flex flex-col items-center px-6 py-10 overflow-hidden">
      <Confetti density="dense" />

      {/* Title */}
      <h1 className="relative z-10 text-3xl sm:text-4xl font-black tracking-tight text-ink text-center mt-2">
        ¡Listo,{' '}
        <Highlight variant="underline" color="coral">{firstName || 'amigo'}</Highlight>!
      </h1>

      {/* Card + sticker cluster */}
      <div className="relative z-10 mt-8 inline-block">
        <div className="shrink-0 shadow-[0_24px_60px_-20px_rgba(91,45,130,0.35)] rounded-3xl overflow-hidden">
          <StoryCard
            ref={cardRef}
            firstName={firstName}
            tags={tags}
            shareUrl={shareUrl}
          />
        </div>
        <div className="hidden sm:block absolute -top-4 -right-24">
          <StickerNote color="mint" tilt={8} arrow="down-left">
            ¡compártelo<br />ya! 🚀
          </StickerNote>
        </div>
      </div>

      {/* Nudge */}
      <p className="relative z-10 mt-6 text-ink/60 text-sm text-center max-w-xs">
        Más amigos se suman, más rápido sale tu plan 🥂
      </p>

      {/* Progress bar (only during recording) */}
      {state === 'recording' && (
        <div className="relative z-10 mt-4 w-full max-w-sm h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Download CTA */}
      <button
        onClick={handleDownload}
        disabled={state === 'recording'}
        className="relative z-10 mt-4 btn-primary flex items-center gap-2.5 text-base disabled:opacity-70 disabled:cursor-wait"
      >
        {state === 'recording' ? (
          <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden>
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 11.586V4a1 1 0 011-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {buttonLabel()}
      </button>

      {/* Instructions */}
      <div className="relative z-10 mt-6 w-full max-w-sm space-y-3">
        <p className="text-ink/75 text-base font-medium leading-snug">
          1️⃣ &nbsp;Toca el botón — se abre la hoja para compartir 📤
        </p>
        <p className="text-ink/75 text-base font-medium leading-snug">
          2️⃣ &nbsp;Manda a Instagram Stories o WhatsApp 📲
        </p>
        <p className="text-ink/75 text-base font-medium leading-snug">
          3️⃣ &nbsp;Pega tu link (ya está en tu portapapeles) como sticker 🔗
        </p>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-10 text-ink/30 text-xs tracking-[0.3em] uppercase">
        Sero · {new Date().getFullYear()}
      </p>
    </div>
  );
}
