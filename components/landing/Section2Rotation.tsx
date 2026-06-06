'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ROTATION = [
  { label: 'Un libro',     color: '#4D314D' },
  { label: 'Un artista',   color: '#E06A5F' },
  { label: 'Una película', color: '#4D314D' },
  { label: 'Un ánime',     color: '#B78BB8' },
  { label: 'Una pasión',   color: '#E06A5F' },
];

export function Section2Rotation() {
  const [i, setI] = useState(0);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setI((x) => (x + 1) % ROTATION.length);
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 700);
      return () => clearTimeout(t);
    }, 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden bg-cream">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="blob animate-blob bg-coral/30"   style={{ width: 560, height: 560, top: '-8%',  left: '-14%' }} />
        <div className="blob animate-blob-slow bg-lilac/40" style={{ width: 500, height: 500, bottom: '-12%', right: '-10%' }} />
        <div className="blob animate-blob bg-gold/20"   style={{ width: 340, height: 340, top: '35%',  right: '18%', animationDelay: '4s' }} />
      </div>

      {/* ── Logo ── */}
      <div className="fade-up flex items-baseline justify-center select-none mb-3">
        <span className="text-5xl sm:text-[4rem] font-black tracking-[-3px] text-plum leading-none">
          ser
        </span>
        {/* The O — system element */}
        <span className="relative inline-flex items-center justify-center">
          <span className="text-5xl sm:text-[4rem] font-black tracking-[-3px] text-coral leading-none relative z-10">
            o
          </span>
          {pulsing && (
            <span
              className="absolute inset-0 rounded-full border-[3px] border-coral animate-o-ring"
              aria-hidden
            />
          )}
        </span>
      </div>

      <p className="fade-up text-ink/50 text-sm sm:text-base tracking-[0.12em] uppercase mb-12 sm:mb-16">
        Mismos gustos, mejores planes
      </p>

      {/* ── Main headline ── */}
      <h1 className="fade-up text-[2.1rem] sm:text-5xl font-black tracking-[-1.5px] leading-tight max-w-xl mx-auto text-ink">
        Piensa en algo que te encanta.
      </h1>

      {/* ── Slot machine ── */}
      <div
        className="mt-8 sm:mt-10 overflow-hidden"
        style={{ height: '4.5rem' }}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          key={i}
          className="flex items-center justify-center h-full text-[2.4rem] sm:text-5xl font-black tracking-[-1.5px] animate-slot-in"
          style={{ color: ROTATION[i].color }}
        >
          {ROTATION[i].label}
        </span>
      </div>

      {/* ── Sub question ── */}
      <p className="fade-up mt-10 text-lg sm:text-2xl text-ink/75 max-w-2xl mx-auto leading-snug font-semibold">
        ¿Cuándo fue la última vez que eso
        <br />
        <span className="underline decoration-coral decoration-[3px] underline-offset-4">
          se convirtió en un plan con amigos?
        </span>
      </p>

      {/* ── CTA ── */}
      <Link
        href="/quiz"
        className="fade-up mt-12 btn-primary text-base sm:text-lg animate-pulse-ring"
      >
        Encontrar a mi gente →
      </Link>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink/30">
        <span className="animate-bounce-arrow text-xl">↓</span>
      </div>
    </section>
  );
}
