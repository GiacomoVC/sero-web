'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

const ROTATION = [
  'Un artista',
  'Una serie',
  'Una película',
  'Un anime',
  'Un libro',
];

const TAGS = [
  { label: 'Taylor Swift',        dur: '6.8s', dx: '5px',  r: '-3deg'   },
  { label: 'House of the Dragon', dur: '8.2s', dx: '-4px', r: '2deg'    },
  { label: 'Barça',               dur: '7.5s', dx: '6px',  r: '-1deg'   },
  { label: 'One Piece',           dur: '9.1s', dx: '-5px', r: '3deg'    },
  { label: 'Succession',          dur: '6.4s', dx: '4px',  r: '-2deg'   },
  { label: 'Coldplay',            dur: '8.7s', dx: '-6px', r: '1.5deg'  },
  { label: 'Murakami',            dur: '7.2s', dx: '5px',  r: '-3.5deg' },
  { label: 'Fórmula 1',           dur: '9.4s', dx: '-3px', r: '2.5deg'  },
];

export function SectionHero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((prev) => (prev + 1) % ROTATION.length), 1250);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] bg-cream flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
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

        {/* Logo — extra top breathing room via pt-24 on section */}
        <Logo width={220} animKey={i} />

        {/* Tagline — smaller, subtler */}
        <p className="mt-3 text-xs tracking-widest uppercase text-ink/45 font-medium">
          Mismos gustos, mejores planes.
        </p>

        {/* Headline + slot machine */}
        <h1 className="mt-12">
          <span className="block text-5xl sm:text-7xl font-black tracking-tight text-ink leading-[1.05]">
            Piensa en algo que amas.
          </span>

          {/* Slot-machine rotating word */}
          <div className="mt-4 h-16 sm:h-24 flex items-center justify-center overflow-hidden">
            <span
              key={i}
              className="animate-slot-in text-4xl sm:text-6xl font-black tracking-tight text-coral"
            >
              {ROTATION[i]}
            </span>
          </div>
        </h1>

        {/* Sub */}
        <p className="mt-6 text-lg sm:text-xl text-ink/55 max-w-md mx-auto leading-relaxed">
          y conviértelo en experiencias con amigos.
        </p>

        {/* Floating interest tags */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              className="animate-float-tag rounded-full bg-white border border-ink/10 px-3 py-1.5 text-sm font-medium text-ink/65 shadow-sm"
              style={{ '--dur': tag.dur, '--dx': tag.dx, '--r': tag.r } as React.CSSProperties}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-arrow text-ink/35 text-xl select-none">
        ↓
      </div>
    </section>
  );
}
