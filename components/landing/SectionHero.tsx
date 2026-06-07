'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

const ROTATION = [
  'música',
  'series',
  'películas',
  'deportes',
  'libros',
  'gaming',
];

const TAGS = [
  { label: 'Taylor Swift', dur: '6.8s', dx: '5px',  r: '-3deg'  },
  { label: 'House of the Dragon', dur: '8.2s', dx: '-4px', r: '2deg'   },
  { label: 'Barça',         dur: '7.5s', dx: '6px',  r: '-1deg'  },
  { label: 'One Piece',     dur: '9.1s', dx: '-5px', r: '3deg'   },
  { label: 'Succession',    dur: '6.4s', dx: '4px',  r: '-2deg'  },
  { label: 'Coldplay',      dur: '8.7s', dx: '-6px', r: '1.5deg' },
  { label: 'Murakami',      dur: '7.2s', dx: '5px',  r: '-3.5deg'},
  { label: 'Fórmula 1',     dur: '9.4s', dx: '-3px', r: '2.5deg' },
];

// Simulated live count
const BASE_COUNT = 847;

export function SectionHero() {
  const [i, setI] = useState(0);
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % ROTATION.length);
    }, 2100);
    return () => clearInterval(id);
  }, []);

  // Simulate slowly growing live count
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] bg-cream flex flex-col items-center justify-center overflow-hidden">
      {/* Background blobs */}
      <div
        className="blob animate-blob w-[500px] h-[500px] -top-20 -left-24"
        style={{ backgroundColor: 'rgba(255,107,94,0.15)' }}
      />
      <div
        className="blob animate-blob-slow w-[420px] h-[420px] bottom-0 -right-20"
        style={{ backgroundColor: 'rgba(91,45,130,0.10)' }}
      />
      <div
        className="blob animate-blob w-[320px] h-[320px] top-1/3 right-1/4"
        style={{ backgroundColor: 'rgba(255,138,61,0.10)', animationDelay: '4s' }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Logo */}
        <Logo width={220} animKey={i} />

        {/* Tagline */}
        <p className="mt-2 text-sm tracking-widest uppercase text-ink/60 font-medium">
          Mismos gustos, mejores planes.
        </p>

        {/* Headline */}
        <h1 className="mt-10">
          <span className="block text-5xl sm:text-7xl font-black tracking-tight text-ink leading-[1.05]">
            Lo que amas
          </span>
          <span className="block text-5xl sm:text-7xl font-black tracking-tight text-coral leading-[1.05] mt-1">
            te une a tu gente.
          </span>
        </h1>

        {/* Sub */}
        <p className="mt-6 text-lg sm:text-xl text-ink/60 max-w-xl mx-auto leading-relaxed">
          Descubre quién más está into lo tuyo y conviértelo en planes reales.
        </p>

        {/* CTA row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/quiz"
            className="btn-primary text-lg animate-pulse-ring"
          >
            Encontrar a mi gente →
          </Link>
          <span className="text-sm text-ink/50 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
            {count.toLocaleString('es-PE')} conectando ahora
          </span>
        </div>

        {/* Floating interest tags */}
        <div className="mt-14 flex flex-wrap gap-3 justify-center">
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              className="animate-float-tag rounded-full bg-white border border-ink/10 px-3 py-1.5 text-sm font-medium text-ink/70 shadow-sm"
              style={
                {
                  '--dur': tag.dur,
                  '--dx':  tag.dx,
                  '--r':   tag.r,
                } as React.CSSProperties
              }
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-arrow text-ink/40 text-xl select-none">
        ↓
      </div>
    </section>
  );
}
