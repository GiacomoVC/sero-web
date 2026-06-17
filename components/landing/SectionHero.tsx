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

export function SectionHero({ refSlug }: { refSlug?: string }) {
  const [i, setI] = useState(0);
  const quizHref = refSlug ? `/quiz?ref=${encodeURIComponent(refSlug)}` : '/quiz';

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
            <Highlight variant="underline" color="plum">amas</Highlight>
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
          ¿Hace cuánto que no se vuelve{' '}
          <Highlight variant="marker" color="coral">un plan</Highlight>?
        </p>
        <Link
          href={quizHref}
          className="btn-primary text-base mt-8 inline-flex"
        >
          Quiero mi plan
        </Link>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-arrow text-ink/35 text-xl select-none z-10">
        ↓
      </div>
    </section>
  );
}
