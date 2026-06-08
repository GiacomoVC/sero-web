'use client';

import { useEffect, useRef, useState } from 'react';
import { StoryCard, type StoryCardHandle } from './StoryCard';
import { Confetti } from '../ui/Confetti';
import { StickerNote } from '../ui/StickerNote';
import { Highlight } from '../ui/Highlight';
import { shareVideoBlob } from '@/lib/shareVideo';
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
  const cardRef = useRef<StoryCardHandle>(null);
  // Stage of the share flow:
  //   'preparing' — recording in background, button disabled
  //   'ready'     — recording finished, button enabled & ready to share
  //   'sharing'   — share sheet open / blob being read
  //   'done'      — share/download succeeded
  const [stage, setStage] = useState<'preparing' | 'ready' | 'sharing' | 'done'>('preparing');
  const [pct,   setPct]   = useState(0);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const tags = (result.tags ?? []).filter(Boolean);

  // Progress meter while preparing
  useEffect(() => {
    if (stage !== 'preparing') return;
    const start = Date.now();
    const id = setInterval(() => {
      setPct(Math.min(Math.round((Date.now() - start) / 8400 * 100), 99));
    }, 200);
    return () => clearInterval(id);
  }, [stage]);

  // The share handler MUST be synchronous up to navigator.share() to preserve
  // the iOS user-gesture context. We pre-recorded the Blob on mount, so the
  // click handler can construct the File and call share() with zero awaits.
  const handleShare = (_e: React.MouseEvent) => {
    if (stage !== 'ready') return;
    const ready = cardRef.current?.getReadyVideo();
    if (!ready) return;

    // Copy URL — fire & forget, doesn't block the gesture.
    navigator.clipboard.writeText(shareUrl).catch(() => {});

    setStage('sharing');
    // shareVideoBlob is synchronous up to navigator.share() — the returned
    // promise resolves after the user dismisses the share sheet.
    shareVideoBlob(
      ready.blob,
      ready.url,
      `sero-${result.slug}.${ready.ext}`,
      { title: 'sero', text: 'Únete a sero — amigos que comparten lo que amas' },
    )
      .then((outcome) => {
        if (outcome === 'cancelled') {
          setStage('ready');
        } else {
          setStage('done');
          setTimeout(() => setStage('ready'), 4000);
        }
      })
      .catch(() => setStage('ready'));
  };

  const buttonLabel = () => {
    if (stage === 'done')      return 'Listo · link copiado ✓';
    if (stage === 'sharing')   return 'Abriendo…';
    if (stage === 'preparing') return `Preparando tu video… ${pct}%`;
    return 'Compartir mi video y copiar mi link';
  };

  const buttonDisabled = stage === 'preparing' || stage === 'sharing';

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
            onReady={() => {
              setPct(100);
              setStage((s) => (s === 'preparing' ? 'ready' : s));
            }}
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

      {/* Progress bar (only while preparing) */}
      {stage === 'preparing' && (
        <div className="relative z-10 mt-4 w-full max-w-sm h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Share CTA */}
      <button
        onClick={handleShare}
        disabled={buttonDisabled}
        className="relative z-10 mt-4 btn-primary flex items-center gap-2.5 text-base disabled:opacity-70 disabled:cursor-wait"
      >
        {buttonDisabled ? (
          <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden>
            <path d="M13 4a3 3 0 1 0-2.83 4H10a3 3 0 0 0-3 3v.17A3 3 0 1 0 8.83 13H9a3 3 0 1 0 0-2H8.83A3 3 0 0 0 7 8.83V9a3 3 0 0 0 3 3h.17A3 3 0 1 0 12 9.17V9a3 3 0 0 0-3-3h-.17A3 3 0 0 0 13 4z" />
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

