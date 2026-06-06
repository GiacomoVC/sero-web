'use client';

import { useEffect, useState } from 'react';

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
    <section className="relative px-6 py-32 sm:py-40 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream via-cream to-sand/40" />

      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
        Piensa en algo que te encanta.
      </h2>

      <div className="mt-12 h-20 sm:h-24 flex items-center justify-center perspective-[1000px]">
        <span
          key={i}
          className="inline-block text-4xl sm:text-6xl font-bold animate-slide-rotate"
          style={{ color: ROTATION[i].color }}
        >
          {ROTATION[i].label}
        </span>
      </div>

      <p className="mt-12 text-lg sm:text-2xl text-ink/80 max-w-2xl mx-auto leading-snug">
        ¿Cuándo fue la última vez que eso
        <br />
        <span className="underline decoration-coral decoration-[3px] underline-offset-4">
          se convirtió en un plan con amigos?
        </span>
      </p>
    </section>
  );
}
