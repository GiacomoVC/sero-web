'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

const ROTATION = [
  { label: 'Una serie',    color: '#E06A5F' },
  { label: 'Un artista',   color: '#4D314D' },
  { label: 'Un libro',     color: '#B78BB8' },
  { label: 'Una película', color: '#6B4A6B' },
  { label: 'Un ánime',     color: '#E06A5F' },
  { label: 'Una pasión',   color: '#4D314D' },
];

export function Section2Rotation() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % ROTATION.length), 2100);
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
        <div
          className="blob animate-blob-slow"
          style={{ width: 300, height: 300, top: '15%', right: '-8%', background: 'rgba(183,139,184,0.28)', animationDelay: '2s' }}
        />
        <div
          className="blob animate-blob"
          style={{ width: 220, height: 220, bottom: '20%', left: '5%', background: 'rgba(255,209,102,0.25)', animationDelay: '6s' }}
        />
      </div>

      {/* Logo — SVG wordmark; animKey triggers O burst on each slot tick */}
      <div className="fade-up flex flex-col items-center mb-14 sm:mb-16">
        <Logo width={220} animKey={i} />
        <p className="mt-3 text-ink/60 text-sm sm:text-base tracking-wide">
          Mismos gustos, mejores planes
        </p>
      </div>

      {/* Heading */}
      <h2 className="fade-up text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
        Piensa en algo que te encanta.
      </h2>

      {/* Slot-machine word — overflow hidden clips the slide */}
      <div className="mt-10 h-20 sm:h-28 flex items-center justify-center overflow-hidden">
        <span
          key={i}
          className="animate-slot-in text-4xl sm:text-6xl font-black tracking-tight"
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
        Encontrar a mi gente →
      </Link>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink/40">
        <span className="animate-bounce-arrow">↓</span>
      </div>
    </section>
  );
}
