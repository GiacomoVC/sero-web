'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from '../ui/Logo';
import type { SubmitResult } from '@/lib/types';

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" aria-hidden>
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)" />
    </svg>
  );
}

/* ─── Story card (9:16 preview) ──────────────────────────────────────────── */

function StoryCard({
  firstName,
  item1,
  item2,
  shareUrl,
}: {
  firstName: string;
  item1: string;
  item2: string | null;
  shareUrl: string;
}) {
  const shortUrl = shareUrl.replace(/^https?:\/\//, '');

  return (
    <div
      className="relative w-full h-full rounded-[28px] overflow-hidden flex flex-col select-none shadow-2xl"
      style={{ background: '#FAF8F5' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,94,0.35), rgba(255,138,61,0.15))', filter: 'blur(1px)' }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(91,45,130,0.20), rgba(255,107,94,0.08))' }}
      />

      {/* Top bar */}
      <div className="relative z-10 pt-5 px-5 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.25em] text-ink/50 uppercase">
          sero
        </span>
        {/* Standalone O ring */}
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          <defs>
            <linearGradient id="card-o-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B5E" />
              <stop offset="100%" stopColor="#FF8A3D" />
            </linearGradient>
          </defs>
          <circle
            cx="8" cy="8" r="5.5"
            fill="none"
            stroke="url(#card-o-grad)"
            strokeWidth="1.8"
            strokeDasharray="30.0 1.9 1.6 1.1"
            style={{
              transform: 'rotate(-24deg)',
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-2">
        {/* Name */}
        <p className="text-[9px] font-bold tracking-[0.2em] text-ink/35 uppercase mb-4">
          el mundo de {firstName || 'alguien especial'}
        </p>

        {/* Label */}
        <p className="text-[11px] font-semibold text-ink/50 mb-2">
          Mi plan ideal:
        </p>

        {/* Items */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: '#FF6B5E', marginTop: '5px' }}
            />
            <span className="text-ink font-bold text-sm leading-snug">{item1}</span>
          </div>

          {item2 && (
            <div className="flex items-start gap-2">
              <span
                className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: '#FF8A3D', marginTop: '5px' }}
              />
              <span className="text-ink font-bold text-sm leading-snug">{item2}</span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 border border-ink/20"
              style={{ marginTop: '5px' }}
            />
            <span className="text-ink/35 text-sm italic leading-snug">y mucho más…</span>
          </div>
        </div>

        {/* CTA line */}
        <div className="mt-5 pt-4 border-t border-ink/8">
          <p className="text-[11px] text-ink/60 leading-snug">
            Convierte lo que amas en un plan 🍕🍷
          </p>
          <p className="text-[10px] text-ink/40 mt-1">
            Únete a Sero 👇
          </p>
        </div>
      </div>

      {/* URL pill */}
      <div className="relative z-10 px-5 pb-5">
        <div
          className="rounded-xl px-3 py-2"
          style={{ backgroundColor: 'rgba(24,24,27,0.06)' }}
        >
          <p className="text-[9px] font-medium tracking-wide truncate" style={{ color: 'rgba(24,24,27,0.45)' }}>
            {shortUrl}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function canShareFiles(files: File[]): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files })
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function ShareScreen({
  result,
  firstName,
  initialBlob,
}: {
  result: SubmitResult;
  firstName: string;
  initialBlob?: File | null;
}) {
  const [copied, setCopied]   = useState(false);
  const [waState, setWaState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [igState, setIgState] = useState<'idle' | 'loading' | 'done'>('idle');

  // Image file — seeded from preloaded blob, fetched on demand if missing
  const fileRef = useRef<File | null>(initialBlob ?? null);
  const [fileReady, setFileReady] = useState(!!initialBlob);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const storyUrl =
    typeof window !== 'undefined'
      ? result.igUrl.replace(/^https?:\/\/[^/]+/, window.location.origin)
      : result.igUrl;

  // Fetch story image in the background if it wasn't pre-loaded
  useEffect(() => {
    if (fileRef.current) return;
    fetch(storyUrl)
      .then((r) => r.blob())
      .then((blob) => {
        fileRef.current = new File([blob], `sero-story-${result.slug}.png`, { type: 'image/png' });
        setFileReady(true);
      })
      .catch(() => setFileReady(false));
  }, [storyUrl, result.slug]);

  // Pick the 2 most personal items from server-computed tags
  const tags  = (result.tags ?? []).filter(Boolean);
  const item1 = tags[0] ?? 'algo que amas';
  const item2 = tags[1] ?? null;

  const waText = `Este es mi enlace de amigo en Sero: ${shareUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  // WhatsApp: native share (image + text) → fallback to wa.me text link
  const handleWhatsApp = async () => {
    const file = fileRef.current;
    if (file && canShareFiles([file])) {
      setWaState('loading');
      try {
        await navigator.share({ files: [file], text: waText });
        setWaState('done');
        setTimeout(() => setWaState('idle'), 3000);
        return;
      } catch {
        // User cancelled or share failed — fall through to text link
      }
      setWaState('idle');
    }
    // Fallback: open WhatsApp with pre-filled text (no image)
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
  };

  // Instagram: native share (image) → fallback to copy URL + instructions
  const handleInstagram = async () => {
    const file = fileRef.current;
    if (file && canShareFiles([file])) {
      setIgState('loading');
      // Pre-copy URL so user can paste it as a story sticker right after sharing
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      try {
        await navigator.share({ files: [file] });
        setIgState('done');
        setTimeout(() => setIgState('idle'), 4000);
        return;
      } catch {
        // User cancelled or not supported
      }
      setIgState('idle');
      return;
    }
    // Fallback: copy URL + hint
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setIgState('done');
    setTimeout(() => setIgState('idle'), 4000);
  };

  const imageLoading = !fileReady && !fileRef.current;

  return (
    <div className="min-h-[100svh] bg-ink flex flex-col items-center px-6 py-10">

      {/* Logo */}
      <Logo width={110} />

      {/* Headline */}
      <div className="mt-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          ¡Listo, {firstName || 'amigo'}!
        </h1>
        <p className="mt-2 text-white/45 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          Comparte tu mundo — tu gente ya está esperándote.
        </p>
      </div>

      {/* Story card preview */}
      <div
        className="mt-8 shrink-0"
        style={{ width: 220, height: Math.round(220 * 16 / 9) }}
      >
        <StoryCard
          firstName={firstName}
          item1={item1}
          item2={item2}
          shareUrl={shareUrl}
        />
      </div>

      {/* URL strip */}
      <div className="mt-6 w-full max-w-sm flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-3">
        <p className="flex-1 min-w-0 text-sm text-white/50 truncate">{shareUrl}</p>
        <button
          onClick={copyLink}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 text-white/70 transition-colors"
          style={{ background: copied ? 'rgba(255,107,94,0.2)' : 'transparent' }}
        >
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>

      {/* Share buttons */}
      <div className="mt-4 w-full max-w-sm flex flex-col gap-3">

        {/* WhatsApp — native share with image, falls back to wa.me text */}
        <button
          onClick={handleWhatsApp}
          disabled={waState === 'loading'}
          className="flex items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-bold text-white transition-opacity active:opacity-75 disabled:opacity-60"
          style={{ backgroundColor: '#25D366' }}
        >
          {waState === 'loading'
            ? <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <IconWhatsApp />}
          {waState === 'done' ? 'Compartido ✓' : 'Compartir por WhatsApp'}
        </button>

        {/* Instagram — native share with image, falls back to URL copy */}
        <button
          onClick={handleInstagram}
          disabled={igState === 'loading'}
          className="flex items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-bold text-white border border-white/15 transition-colors disabled:opacity-60"
          style={{ background: igState === 'done' ? 'rgba(255,255,255,0.07)' : 'transparent' }}
        >
          {igState === 'loading'
            ? <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <IconInstagram />}
          {igState === 'done'
            ? 'Link copiado — pégalo como sticker ✓'
            : imageLoading
              ? 'Preparando imagen…'
              : 'Compartir en Instagram'}
        </button>

        {igState === 'done' && (
          <p className="text-center text-white/35 text-xs -mt-1">
            Abre Instagram Stories y pega tu link como sticker 👆
          </p>
        )}
      </div>

      {/* Footer */}
      <p className="mt-12 text-white/20 text-xs tracking-[0.3em] uppercase">
        Sero · {new Date().getFullYear()}
      </p>
    </div>
  );
}
