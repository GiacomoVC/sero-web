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
    // shareVideoBlob is synchronous up to navigator.share(); the returned
    // promise resolves after the user dismisses the share sheet.
    // For WhatsApp the `text` becomes the message body. Instagram Stories
    // ignores `text` so IG is unaffected.
    const waText = `${shareUrl}\n\nentre con mi link y en 24hrs tendrás mejores planes 🥂`;
    shareVideoBlob(
      ready.blob,
      ready.url,
      `sero-${result.slug}.${ready.ext}`,
      { title: 'sero', text: waText },
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

  const buttonDisabled = stage === 'preparing' || stage === 'sharing';

  return (
    <div className="relative min-h-[100svh] bg-cream flex flex-col items-center px-6 py-10 overflow-hidden">
      <Confetti density="dense" />

      {/* Title */}
      <h1 className="relative z-10 text-3xl sm:text-4xl font-black tracking-tight text-ink text-center mt-2">
        ¡Listo,{' '}
        <Highlight variant="underline" color="coral">{firstName || 'amigo'}</Highlight>!
      </h1>

      {/* Card */}
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

      {/* Progress bar (only while preparing) */}
      {stage === 'preparing' && (
        <div className="relative z-10 mt-7 w-full max-w-sm h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-coral rounded-full transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Share CTA — minimal: share icon + "link" */}
      <button
        onClick={handleShare}
        disabled={buttonDisabled}
        aria-label="Compartir tu link"
        className="relative z-10 mt-7 btn-primary flex items-center gap-2.5 text-base disabled:opacity-70 disabled:cursor-wait"
      >
        {stage === 'done' ? (
          <span className="text-lg leading-none">✓</span>
        ) : buttonDisabled ? (
          <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0" aria-hidden>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
        Compartir
      </button>

      {/* Nudge below the button */}
      <p className="relative z-10 mt-6 max-w-sm text-center text-ink/80 text-base font-medium leading-snug">
        Comparte y en ~24hrs estarás invitad@ a tu primer plan
      </p>

      {/* Footer */}
      <p className="relative z-10 mt-10 text-ink/30 text-xs tracking-[0.3em] uppercase">
        Sero · {new Date().getFullYear()}
      </p>
    </div>
  );
}

