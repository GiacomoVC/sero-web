import React from 'react';

type Color = 'lavender' | 'peach' | 'butter' | 'mint' | 'sky';

const BG: Record<Color, string> = {
  lavender: '#E9DCF6',
  peach:    '#FFD9CF',
  butter:   '#FFE9B0',
  mint:     '#D4ECDD',
  sky:      '#D7E8F7',
};

const INK: Record<Color, string> = {
  lavender: '#5B2D82',
  peach:    '#B33E2E',
  butter:   '#8A6A1A',
  mint:     '#1F6E3C',
  sky:      '#2A5685',
};

type ArrowDir = 'down-left' | 'down-right' | 'up-left' | 'up-right' | 'none';

export function StickerNote({
  children,
  color = 'lavender',
  tilt = -4,
  arrow = 'none',
  className = '',
}: {
  children: React.ReactNode;
  color?: Color;
  tilt?: number;
  arrow?: ArrowDir;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ ['--tilt' as string]: `${tilt}deg` }}
    >
      <div
        className="relative animate-sticker px-4 py-3 rounded-[14px] font-hand text-xl leading-tight shadow-[0_6px_14px_-6px_rgba(91,45,130,0.35)]"
        style={{
          backgroundColor: BG[color],
          color: INK[color],
          transform: `rotate(${tilt}deg)`,
        }}
      >
        {children}
      </div>

      {arrow !== 'none' && (
        <ArrowSvg dir={arrow} color={INK[color]} />
      )}
    </div>
  );
}

function ArrowSvg({ dir, color }: { dir: Exclude<ArrowDir, 'none'>; color: string }) {
  // Position + curve per direction
  const pos: Record<Exclude<ArrowDir, 'none'>, string> = {
    'down-left':  'absolute -bottom-12 -left-6',
    'down-right': 'absolute -bottom-12 -right-6',
    'up-left':    'absolute -top-12 -left-6',
    'up-right':   'absolute -top-12 -right-6',
  };

  // Curves drawn in a 60x60 box
  const paths: Record<Exclude<ArrowDir, 'none'>, { d: string; tip: string }> = {
    'down-left':  { d: 'M50 4 Q 46 32, 18 50',    tip: 'M14 46 L18 50 L24 46' },
    'down-right': { d: 'M10 4 Q 14 32, 44 50',    tip: 'M50 46 L46 50 L40 46' },
    'up-left':    { d: 'M50 56 Q 46 28, 18 10',   tip: 'M14 14 L18 10 L24 14' },
    'up-right':   { d: 'M10 56 Q 14 28, 44 10',   tip: 'M50 14 L46 10 L40 14' },
  };

  const { d, tip } = paths[dir];

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden
      className={pos[dir]}
    >
      <path d={d} stroke={color} strokeWidth="2.2" strokeLinecap="round" className="animate-arrow-draw" />
      <path d={tip} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-arrow-draw" />
    </svg>
  );
}
