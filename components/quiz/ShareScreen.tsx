'use client';

import { useState } from 'react';
import { Confetti } from '../ui/Confetti';
import { Highlight } from '../ui/Highlight';
import type { SubmitResult } from '@/lib/types';

// Placeholder until we have the real IG video URL — swap before launch.
const URL_VIDEO_IG = 'https://www.instagram.com/reel/DZgDYizvuXr/?igsh=ZTNvOXZzMngyMDBs';

export function ShareScreen({
  result,
  firstName,
  initialBlob: _initialBlob,
}: {
  result: SubmitResult;
  firstName: string;
  initialBlob?: File | null;
}) {
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const shortUrl = shareUrl.replace(/^https?:\/\//, '');
  const _firstName = firstName; // referenced for parity / future use

  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp template — opens the share sheet pre-filled with the message.
  const waMessage =
  `${URL_VIDEO_IG}\n\n` +
  `¡Hola! 👀 Tenía que pasarte esto:\n` +
  `Sero, planes con gente que ama lo mismo que tú.\n` +
  `Solo entre amigos, nada de extraños. Acabo de unirme 🙌\n\n` +
  `Usa mi link 👇\n` +
  `${shareUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  // Instagram doesn't have a great share-to-stories URL scheme. Best UX:
  // copy the link to the clipboard, then deep-link into the Instagram app
  // (mobile) or the IG website (desktop). User pastes their link as a
  // sticker on the story.
  const openInstagram = () => {
  window.location.href = URL_VIDEO_IG;
};

  return (
    <div className="relative min-h-[100svh] bg-cream flex flex-col items-center px-6 py-10 overflow-hidden">
      <Confetti density="dense" />

      {/* Title */}
      <h1 className="relative z-10 mt-4 text-3xl sm:text-4xl font-black tracking-tight text-ink text-center">
        ¡Listo!{' '}
        <Highlight variant="underline" color="coral">Ya estás dentro</Highlight>.
      </h1>

      {/* Personal link block */}
      <div className="relative z-10 mt-10 w-full max-w-sm text-center">
        <p className="text-ink text-base font-bold flex items-center justify-center gap-2">
          <span aria-hidden>🎴</span>
          <span>Este es tu link</span>
        </p>

        <div className="mt-3 flex items-stretch gap-2">
          <div className="flex-1 min-w-0 rounded-2xl border-2 border-ink/10 bg-white/80 px-4 py-3.5 text-ink/85 text-base font-semibold truncate text-left">
            {shortUrl}
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 rounded-2xl bg-ink text-white px-4 py-3.5 font-bold text-sm hover:scale-[1.02] active:scale-[0.97] transition-transform"
            aria-label="Copiar link"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 mt-10 w-full max-w-sm inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] hover:bg-[#1FAB52] text-white px-6 py-4 font-bold text-base shadow-[0_6px_0_rgba(91,45,130,0.18)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        onClick={() => { navigator.clipboard.writeText(shareUrl).catch(() => {}); }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7 0-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.5-.3M12 21.5c-1.7 0-3.3-.5-4.7-1.3l-3.4 1 1-3.3c-1-1.5-1.5-3.2-1.5-5 0-5 4-9 9-9 2.4 0 4.6 1 6.3 2.6 1.7 1.7 2.6 3.9 2.6 6.3 0 5-4 8.9-8.9 8.9M21.6 5.4C19 2.9 15.6 1.5 12 1.5 4.6 1.5-1 7.1-1 14.5c0 2.4.6 4.7 1.8 6.7L0 28l6.9-1.8c2 1.1 4.2 1.6 6.4 1.6h.1c7.4 0 13.4-6 13.4-13.4 0-3.6-1.4-7-3.9-9.5"/>
        </svg>
        Invita a +10 amigos
      </a>

      <p className="relative z-10 mt-2 max-w-xs text-center text-ink/55 text-sm leading-snug">
        Así encontramos gente que ama lo mismo que tú. Nada de extraños.
      </p>

      {/* Instagram CTA */}
<button
  type="button"
  onClick={openInstagram}
  className="relative z-10 mt-7 w-full max-w-sm inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-95 text-white px-6 py-4 font-bold text-base shadow-[0_6px_0_rgba(91,45,130,0.18)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
>
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
    <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.62.07 4.85s-.01 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.25.06-1.62.07-4.85.07s-3.6-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.74 3.74 0 01-1.38-.9 3.74 3.74 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.22 2.2 12s.01-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.78 2.2 12 2.2M12 0C8.74 0 8.33 0 7.05.07 5.78.13 4.9.33 4.14.63a5.94 5.94 0 00-2.15 1.4 5.94 5.94 0 00-1.4 2.15C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.94 5.94 0 001.4 2.15c.62.62 1.34 1 2.15 1.4.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.94 5.94 0 002.15-1.4 5.94 5.94 0 001.4-2.15c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.94 5.94 0 00-1.4-2.15A5.94 5.94 0 0019.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84M12 16a4 4 0 114-4 4 4 0 01-4 4m6.4-11.85a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44"/>
  </svg>
  Compartir en stories
</button>

<p className="relative z-10 mt-2 max-w-xs text-center text-ink/55 text-sm leading-snug">
  Comparte con tu link como sticker.
</p>

      {/* Footer */}
      <p className="relative z-10 mt-12 text-ink/30 text-xs tracking-[0.3em] uppercase">
        Sero · {new Date().getFullYear()}
      </p>
    </div>
  );
}
