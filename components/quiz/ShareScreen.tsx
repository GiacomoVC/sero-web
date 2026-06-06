'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '../ui/Logo';
import { buildWhatsAppMessage, whatsappShareUrl } from '@/lib/whatsapp';
import type { SubmitResult } from '@/lib/types';

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

export function ShareScreen({
  result,
  firstName,
}: {
  result: SubmitResult;
  firstName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const blobRef = useRef<File | null>(null);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const storyUrl =
    typeof window !== 'undefined'
      ? result.igUrl.replace(/^https?:\/\/[^/]+/, window.location.origin)
      : result.igUrl;

  // Preload blob for native share (so the button is instant)
  useEffect(() => {
    fetch(storyUrl)
      .then((r) => r.blob())
      .then((blob) => {
        blobRef.current = new File(
          [blob],
          `sero-story-${result.slug}.png`,
          { type: 'image/png' }
        );
      })
      .catch(() => {});
  }, [storyUrl, result.slug]);

  const waMessage = useMemo(
    () => buildWhatsAppMessage({ url: shareUrl, tags: result.tags }),
    [shareUrl, result.tags]
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const shareStory = async () => {
    // Copy URL to clipboard so user can paste it as a sticker in their story
    navigator.clipboard.writeText(shareUrl).catch(() => {});

    let file = blobRef.current;
    if (!file) {
      try {
        const res = await fetch(storyUrl);
        const blob = await res.blob();
        file = new File([blob], `sero-story-${result.slug}.png`, { type: 'image/png' });
        blobRef.current = file;
      } catch { /* noop */ }
    }

    if (
      file &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({ files: [file], title: 'Mi perfil Sero' });
      } catch { /* cancelled */ }
    } else if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      window.open(storyUrl, '_blank');
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col items-center bg-cream px-6 py-8">
      <Logo width={120} priority />

      <div className="mt-6 w-full max-w-sm text-center fade-up">
        <h1 className="text-2xl font-semibold tracking-tight leading-snug">
          ¡Listo, {firstName || 'amigo'}! 🎉
        </h1>
        <p className="mt-2 text-ink/60 text-sm leading-relaxed">
          Para crear tu primera experiencia, solo falta sumar los gustos de tus amigos.
        </p>
      </div>

      {/* Story image preview */}
      <div className="mt-6 fade-up">
        <div
          className="relative mx-auto rounded-2xl overflow-hidden shadow-xl bg-plum/10"
          style={{ width: 140, height: 249 }} /* 9:16 ratio */
        >
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-plum border-t-transparent animate-spin" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storyUrl}
            alt="Tu story de Sero"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 w-full max-w-sm flex flex-col gap-3 fade-up">

        {/* Step 1: copy link */}
        <div className="rounded-xl bg-white/70 border border-ink/10 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-ink/50 uppercase tracking-widest leading-none mb-1">
              1 · Copia tu link
            </p>
            <p className="text-sm font-medium truncate text-ink/80">{shareUrl}</p>
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 btn-secondary !py-1.5 !px-3 text-xs"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>

        {/* Step 2: share as story */}
        <button
          onClick={shareStory}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <IconInstagram />
          2 · Compartir como story
        </button>

        {/* Hint */}
        <p className="text-center text-ink/40 text-xs -mt-1">
          Pega tu link como sticker en la story 👆
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-ink/10" />
          <span className="text-ink/30 text-xs">o</span>
          <div className="flex-1 h-px bg-ink/10" />
        </div>

        {/* WhatsApp */}
        <a
          href={whatsappShareUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex items-center justify-center gap-2"
          style={{ color: '#128C7E' }}
        >
          <IconWhatsApp />
          Enviar por WhatsApp
        </a>
      </div>

      <p className="mt-8 text-ink/30 text-xs tracking-widest uppercase">
        Sero · Mismos gustos, mejores planes.
      </p>
    </div>
  );
}
