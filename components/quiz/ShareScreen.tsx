'use client';

import { useState } from 'react';
import { Confetti } from '../ui/Confetti';
import type { SubmitResult } from '@/lib/types';

const URL_VIDEO_IG = 'https://www.instagram.com/reel/DZgDYizvuXr/?igsh=ZTNvOXZzMngyMDBs';

const AVATAR_COLORS = [
  'bg-peach text-[#B33E2E]',
  'bg-lavender text-[#5B2D82]',
  'bg-butter text-[#8A6A1A]',
];

const WA_ICON = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7 0-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.5-.3M12 21.5c-1.7 0-3.3-.5-4.7-1.3l-3.4 1 1-3.3c-1-1.5-1.5-3.2-1.5-5 0-5 4-9 9-9 2.4 0 4.6 1 6.3 2.6 1.7 1.7 2.6 3.9 2.6 6.3 0 5-4 8.9-8.9 8.9M21.6 5.4C19 2.9 15.6 1.5 12 1.5 4.6 1.5-1 7.1-1 14.5c0 2.4.6 4.7 1.8 6.7L0 28l6.9-1.8c2 1.1 4.2 1.6 6.4 1.6h.1c7.4 0 13.4-6 13.4-13.4 0-3.6-1.4-7-3.9-9.5"/>
  </svg>
);

const IG_ICON = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
    <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.25.07 1.62.07 4.85s-.01 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.25.06-1.62.07-4.85.07s-3.6-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.74 3.74 0 01-1.38-.9 3.74 3.74 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.22 2.2 12s.01-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.78 2.2 12 2.2M12 0C8.74 0 8.33 0 7.05.07 5.78.13 4.9.33 4.14.63a5.94 5.94 0 00-2.15 1.4 5.94 5.94 0 00-1.4 2.15C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.94 5.94 0 001.4 2.15c.62.62 1.34 1 2.15 1.4.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.94 5.94 0 002.15-1.4 5.94 5.94 0 001.4-2.15c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.94 5.94 0 00-1.4-2.15A5.94 5.94 0 0019.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84M12 16a4 4 0 114-4 4 4 0 01-4 4m6.4-11.85a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44"/>
  </svg>
);

export function ShareScreen({
  result,
  firstName: _firstName,
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

  const matches = result.matches || [];

  const [igCopied, setIgCopied] = useState(false);
  const [confirmedFriends, setConfirmedFriends] = useState<Set<number>>(new Set());

  const waMessage = [
    URL_VIDEO_IG,
    '',
    'Mira esto 👀 Es Sero 🎴',
    'Arma planes con gente que ama lo mismo que tú.',
    'Acabo de unirme, entra tú también con mi link 👇',
    shareUrl,
  ].join('\n');
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  const igDmMessage = [
    'Me acabo de unir a @mundo.sero',
    'Arma planes con gente que ama lo mismo que tú.',
    `Entra tú también con mi link 👇 ${shareUrl}`,
  ].join('\n');

  const openInstagramDM = () => {
    navigator.clipboard.writeText(igDmMessage).catch(() => {});
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 3500);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://direct';
      setTimeout(() => {
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
      }, 1500);
    } else {
      window.open('https://www.instagram.com/direct/inbox/', '_blank');
    }
  };

  const toggleFriend = (idx: number, m: typeof matches[number]) => {
    const isConfirming = !confirmedFriends.has(idx);
    setConfirmedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
    if (isConfirming) {
      fetch('/api/confirm-friend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fromSlug: result.slug,
          toSlug: m.slug,
          toName: m.name,
          mutualFriend: m.mutualFriend || '',
          commonCount: m.commonCount,
        }),
      }).catch(() => {});
    }
  };

  return (
    <div className="relative min-h-[100svh] bg-cream flex flex-col items-center px-6 py-12 overflow-hidden">
      <Confetti density="dense" />

      {/* ── Header ── */}
      <div className="relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
          ¡Estás dentro! 🎴
        </h1>
      </div>

      {/* ── ¿Qué sigue? ── */}
      <div className="relative z-10 mt-8 w-full max-w-sm bg-white/70 rounded-3xl px-6 py-5 border border-ink/8 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-ink/35 mb-3">¿Qué sigue?</p>
        <div className="space-y-2.5 text-sm text-ink/70 leading-snug">
          <p>📝 Tus amigos llenan su quiz</p>
          <p>👀 Cada semana armamos matches</p>
          <p>🎴 Si varios coinciden, sale el plan</p>
        </div>
        <p className="mt-4 text-sm font-semibold text-ink/80">Todo por WhatsApp 💬</p>
      </div>

      {/* ── Invita a tus amigos ── */}
      <div className="relative z-10 mt-8 w-full max-w-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-ink/35 mb-4 text-center">
          Invita a tus amigos
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-2xl bg-[#25D366] text-white flex items-center justify-center hover:scale-[1.05] active:scale-[0.96] transition-transform shadow-sm"
            aria-label="Compartir por WhatsApp"
          >
            {WA_ICON}
          </a>
          <button
            type="button"
            onClick={openInstagramDM}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:scale-[1.05] active:scale-[0.96] transition-transform shadow-sm"
            aria-label="Compartir por Instagram DM"
          >
            {IG_ICON}
          </button>
        </div>
        {igCopied && (
          <p className="mt-3 text-center text-ink/45 text-xs animate-step-in">
            Texto copiado — pégalo en tu DM de IG 📋
          </p>
        )}
      </div>

      {/* ── ¿Son amigos tuyos? carousel ── */}
      <div className="relative z-10 mt-8 w-full">
        <p className="text-xs font-bold tracking-widest uppercase text-ink/35 mb-3 px-6">
          ¿Son amigos tuyos?
        </p>

        <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar flex gap-3 px-6">
          {matches.length > 0 ? matches.map((m, idx) => (
            <div
              key={idx}
              className="snap-start shrink-0 w-44 bg-white/80 rounded-3xl border border-ink/8 shadow-sm p-5 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                {m.name.charAt(0).toUpperCase()}
              </div>

              <p className="mt-3 font-bold text-ink text-sm leading-tight">{m.name}</p>

              {m.mutualFriend && (
                <p className="mt-1.5 text-ink/40 text-xs leading-snug">
                  Amigo en común:<br />{m.mutualFriend}
                </p>
              )}

              <div className="flex-1 min-h-[12px]" />

              <button
                type="button"
                onClick={() => toggleFriend(idx, m)}
                className={`mt-4 w-full rounded-full py-2.5 text-xs font-bold transition-all active:scale-95 ${
                  confirmedFriends.has(idx)
                    ? 'bg-plum text-white shadow-sm'
                    : 'bg-ink/8 text-ink hover:bg-ink/14'
                }`}
              >
                {confirmedFriends.has(idx) ? '¡Sí! ✓' : 'Confirmar'}
              </button>
            </div>
          )) : (
            <div className="snap-start shrink-0 w-44 rounded-3xl border-2 border-dashed border-ink/12 p-5 flex flex-col items-center justify-center text-center min-h-[196px]">
              <span className="text-3xl opacity-30">👥</span>
              <p className="mt-3 text-ink/35 text-xs leading-snug">
                Tus amigos aparecerán aquí cuando entren con tu link
              </p>
            </div>
          )}

          <div className="shrink-0 w-3" aria-hidden />
        </div>

        {matches.length > 0 && (
          <p className="mt-2 text-center text-ink/25 text-xs tracking-wide">desliza →</p>
        )}
      </div>

      <p className="relative z-10 mt-14 text-ink/25 text-xs tracking-[0.3em] uppercase">
        Sero · {new Date().getFullYear()}
      </p>
    </div>
  );
}
