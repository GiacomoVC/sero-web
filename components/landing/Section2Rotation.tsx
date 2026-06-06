'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

const ROTATION = [
  { label: 'Una serie',  color: '#E06A5F' },
  { label: 'Un artista', color: '#4D314D' },
  { label: 'Un libro',   color: '#C0594F' },
  { label: 'Un deporte', color: '#6B4A6B' },
];

export function Section2Rotation() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % ROTATION.length), 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 bg-cream">
        <div
          className="blob animate-blob bg-coral/40"
          style={{ width: 520, height: 520, top: '-10%', left: '-12%' }}
        />
        <div
          className="blob animate-blob-slow bg-plum/30"
          style={{ width: 480, height: 480, bottom: '-15%', right: '-10%' }}
        />
        <div
          className="blob animate-blob bg-sand/60"
          style={{ width: 360, height: 360, top: '30%', right: '20%', animationDelay: '4s' }}
        />
      </div>

      {/* Logo */}
      <div className="fade-up flex flex-col items-center mb-14 sm:mb-16">
        <Logo width={220} priority />
        <p className="mt-2 text-ink/60 text-sm sm:text-base tracking-wide">
          Mismos gustos, mejores planes
        </p>
      </div>

      {/* Rotating word */}
      <h2 className="fade-up text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
        Piensa en algo que te encanta.
      </h2>

      <div className="mt-10 h-20 sm:h-24 flex items-center justify-center">
        <span
          key={i}
          className="inline-block text-4xl sm:text-6xl font-bold animate-slide-rotate"
          style={{ color: ROTATION[i].color }}
        >
          {ROTATION[i].label}
        </span>
      </div>

      <p className="mt-10 text-lg sm:text-2xl text-ink/80 max-w-2xl mx-auto leading-snug">
        ¿Cuándo fue la última vez que eso
        <br />
        <span className="underline decoration-coral decoration-[3px] underline-offset-4">
          se convirtió en un plan con amigos?
        </span>
      </p>

      {/* CTA */}
      <Link
        href="/quiz"
        className="fade-up mt-12 btn-primary text-lg animate-pulse-ring"
      >
        Cuéntanos qué amas →
      </Link>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink/40">
        <span className="animate-bounce-arrow">↓</span>
      </div>
    </section>
  );
}
