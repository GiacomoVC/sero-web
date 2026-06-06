'use client';

import { useEffect, useState } from 'react';
import { Logo } from '../ui/Logo';

const MESSAGES = [
  'Preparando todo…',
  'Últimos toques…',
  'Casi listo…',
  'Ya casi…',
];

export function PreparingScreen() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % MESSAGES.length),
      1600
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-cream gap-8 px-6">
      <Logo width={140} priority />

      {/* Spinner */}
      <div className="w-12 h-12 rounded-full border-4 border-plum/20 border-t-plum animate-spin" />

      {/* Rotating message */}
      <p
        key={idx}
        className="text-lg font-medium text-ink/60 animate-step-in text-center"
      >
        {MESSAGES[idx]}
      </p>
    </div>
  );
}
