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
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setI((x) => (x + 1) % ROTATION.length);
      // Trigger glow then remove class so it can fire again next tick
      setGlowing(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setGlowing(true));
      });
    }, 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden bg-cream">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="blob animate-blob bg-coral/30"      style={{ width: 560, height: 560, top: '-8%',   left: '-14%' }} />
        <div className="blob animate-blob-slow bg-lilac/35" style={{ width: 500, height: 500, bottom: '-12%', right: '-10%' }} />
        <div className="blob animate-blob bg-gold/20"       style={{ width: 340, height: 340, top: '35%',  right: '18%', animationDelay: '4s' }} />
      </div>

      {/* ── Wordmark — text only in hero so the O is animatable ── */}
      <div className="fade-up flex flex-col items-center mb-3 select-none">
        <div className="flex items-baseline leading-none" style={{ letterSpacing: '-3px' }}>
          <span className="text-[3.2rem] sm:text-[4rem] font-black text-plum">ser</span>
          {/* The O — coral, glows on each slot tick */}
          <span className={glowing ? 'animate-o-glow text-[3.2rem] sm:text-[4rem] font-black text-coral' : 'text-[3.2rem] sm:text-[4rem] font-black text-coral'}>
            o
          </span>
        </div>
        <p className="mt-1.5 text-ink/45 text-xs sm:text-sm tracking-[0.14em] uppercase">
          Mismos gustos, mejores planes
        </p>
      </div>

      {/* ── Headline ── */}
      <h1 className="fade-up mt-10 text-[2rem] sm:text-5xl font-black tracking-[-1.5px] leading-tight max-w-xl mx-auto text-ink">
        Piensa en algo que te encanta.
      </h1>

      {/* ── Slot machine ── */}
      <div
        className="mt-7 sm:mt-8 overflow-hidden flex items-center justify-center"
        style={{ height: '4rem' }}
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          key={i}
          className="block text-[2.2rem] sm:text-5xl font-black tracking-[-1.5px] animate-slot-in"
          style={{ color: ROTATION[i].color }}
        >
          {ROTATION[i].label}
        </span>
      </div>

      {/* ── Sub-question ── */}
      <p className="fade-up mt-10 text-lg sm:text-2xl text-ink/70 max-w-2xl mx-auto leading-snug font-semibold">
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
