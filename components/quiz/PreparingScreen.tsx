'use client';

import { useEffect, useState } from 'react';

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
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-cream gap-10 px-6">
      {/* The O — spinning ring system element */}
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        {/* Static inner O */}
        <span className="text-4xl font-black text-coral leading-none select-none z-10">
          o
        </span>
        {/* Spinning ring */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden
          style={{ animation: 'spin 1.1s linear infinite' }}
        >
          <circle
            cx="40" cy="40" r="34"
            stroke="#B78BB8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="48 66"
          />
        </svg>
      </div>

      {/* Logo */}
      <div className="flex items-baseline gap-0 select-none -mt-4">
        <span className="text-3xl font-black tracking-[-2px] text-plum">ser</span>
        <span className="text-3xl font-black tracking-[-2px] text-coral">o</span>
      </div>

      {/* Rotating message */}
      <p
        key={idx}
        className="text-base font-semibold text-ink/50 animate-step-in text-center tracking-wide"
      >
        {MESSAGES[idx]}
      </p>
    </div>
  );
}
