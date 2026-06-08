'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Confetti } from '@/components/ui/Confetti';
import { StickerNote } from '@/components/ui/StickerNote';
import { Highlight } from '@/components/ui/Highlight';

const ROTATION = [
  'Un artista',
  'Una serie',
  'Una película',
  'Un anime',
  'Un libro',
];

const TAGS = [
  { label: 'Taylor Swift',        emoji: '🎵', color: 'peach',    dur: '6.8s', dx: '5px',  r: '-3deg'   },
  { label: 'House of the Dragon', emoji: '🐉', color: 'lavender', dur: '8.2s', dx: '-4px', r: '2deg'    },
  { label: 'Barça',               emoji: '⚽', color: 'butter',   dur: '7.5s', dx: '6px',  r: '-1deg'   },
  { label: 'One Piece',           emoji: '🏴‍☠️', color: 'mint',     dur: '9.1s', dx: '-5px', r: '3deg'    },
  { label: 'Succession',          emoji: '📺', color: 'sky',      dur: '6.4s', dx: '4px',  r: '-2deg'   },
  { label: 'Coldplay',            emoji: '🎶', color: 'peach',    dur: '8.7s', dx: '-6px', r: '1.5deg'  },
  { label: 'Murakami',            emoji: '📚', color: 'lavender', dur: '7.2s', dx: '5px',  r: '-3.5deg' },
  { label: 'Fórmula 1',           emoji: '🏎️', color: 'butter',   dur: '9.4s', dx: '-3px', r: '2.5deg'  },
] as const;

const CHIP_BG: Record<typeof TAGS[number]['color'], string> = {
  peach:    'bg-peach text-[#B33E2E] border-[#FFB8A6]/60',
  lavender: 'bg-lavender text-[#5B2D82] border-[#C9B3E8]/60',
  butter:   'bg-butter text-[#8A6A1A] border-[#F2CF6A]/60',
  mint:     'bg-mint text-[#1F6E3C] border-[#A8D8B9]/60',
  sky:      'bg-sky text-[#2A5685] border-[#A8C8E8]/60',
};

export function SectionHero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((prev) => (prev + 1) % ROTATION.length), 1250);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] bg-cream flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Soft blobs (kept as backdrop, dimmer) */}
      <div
        className="blob animate-blob w-[500px] h-[500px] -top-20 -left-24"
        style={{ backgroundColor: 'rgba(255,107,94,0.10)' }}
      />
      <div
        className="blob animate-blob-slow w-[420px] h-[420px] bottom-0 -right-20"
        style={{ backgroundColor: 'rgba(91,45,130,0.08)' }}
      />

      {/* Confetti layer */}
      <Confetti density="dense" />

      {/* Floating sticker top-right (hidden on small) */}
      <div className="hidden sm:block absolute top-28 right-[7%] z-20">
        <StickerNote color="butter" tilt={-6} arrow="down-left">
          esto va<br />contigo →
        </StickerNote>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        <Logo width={220} animKey={i} />

        <p className="mt-3 text-xs tracking-widest uppercase text-ink/45 font-medium">
          Mismos gustos, mejores planes.
        </p>

        {/* Headline + slot machine */}
        <h1 className="mt-12">
          <span className="block text-4xl sm:text-6xl font-black tracking-tight text-ink leading-[1.05]">
            Piensa en algo que{' '}
            <Highlight variant="underline" color="plum">amas</Highlight>.
          </span>

          <div className="mt-4 h-16 sm:h-24 flex items-center justify-center overflow-hidden">
            <span
              key={i}
              className="animate-slot-in text-4xl sm:text-6xl font-black tracking-tight text-coral"
            >
              {ROTATION[i]}
            </span>
          </div>
        </h1>

        <p className="mt-6 text-lg sm:text-xl font-bold text-ink/70 max-w-md mx-auto leading-relaxed">
          ¿Cuándo fue la última vez que eso se convirtió en{' '}
          <Highlight variant="marker" color="coral">un plan</Highlight>?
        </p>
        <Link
          href="/quiz"
          className="btn-primary text-base mt-8 inline-flex"
        >
          Convertirlo en un plan →
        </Link>

        {/* Floating interest chips — colorful */}
        <div className="mt-14 flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              className={`animate-float-tag inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm ${CHIP_BG[tag.color]}`}
              style={{ ['--dur' as string]: tag.dur, ['--dx' as string]: tag.dx, ['--r' as string]: tag.r } as React.CSSProperties}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-arrow text-ink/35 text-xl select-none z-10">
        ↓
      </div>
    </section>
  );
}
