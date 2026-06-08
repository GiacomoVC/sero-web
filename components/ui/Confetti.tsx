/* eslint-disable @next/next/no-img-element */
import React from 'react';

type Shape = 'squiggle' | 'asterisk' | 'dot' | 'stick' | 'ring' | 'plus' | 'triangle';
type Color = 'coral' | 'plum' | 'lilac' | 'gold' | 'orange' | 'mint';

const COLOR: Record<Color, string> = {
  coral:  '#FF6B5E',
  plum:   '#5B2D82',
  lilac:  '#B78BB8',
  gold:   '#FFD166',
  orange: '#FF8A3D',
  mint:   '#7FCFA0',
};

type Piece = {
  shape: Shape;
  color: Color;
  top: string;
  left: string;
  size: number;
  rotate: number;
  dur: string;
  delay: string;
  cx: string;
};

// Deterministic preset (no Math.random — avoids SSR hydration mismatch)
const PRESETS: Piece[] = [
  { shape: 'squiggle', color: 'coral',  top: '6%',  left: '8%',  size: 28, rotate: -12, dur: '8s',   delay: '0s',   cx: '6px' },
  { shape: 'asterisk', color: 'plum',   top: '14%', left: '88%', size: 22, rotate: 14,  dur: '7s',   delay: '0.8s', cx: '-5px' },
  { shape: 'dot',      color: 'gold',   top: '22%', left: '46%', size: 10, rotate: 0,   dur: '6.5s', delay: '1.6s', cx: '4px'  },
  { shape: 'stick',    color: 'mint',   top: '32%', left: '12%', size: 24, rotate: -28, dur: '9s',   delay: '0.3s', cx: '5px'  },
  { shape: 'ring',     color: 'coral',  top: '40%', left: '78%', size: 18, rotate: 8,   dur: '8.5s', delay: '1.1s', cx: '-6px' },
  { shape: 'plus',     color: 'orange', top: '52%', left: '6%',  size: 16, rotate: 16,  dur: '7.5s', delay: '2.2s', cx: '5px'  },
  { shape: 'squiggle', color: 'plum',   top: '58%', left: '92%', size: 26, rotate: 22,  dur: '8s',   delay: '0.6s', cx: '-4px' },
  { shape: 'triangle', color: 'coral',  top: '66%', left: '38%', size: 14, rotate: -10, dur: '7s',   delay: '1.4s', cx: '5px'  },
  { shape: 'asterisk', color: 'gold',   top: '74%', left: '20%', size: 20, rotate: 0,   dur: '9.5s', delay: '0.2s', cx: '6px'  },
  { shape: 'dot',      color: 'coral',  top: '82%', left: '70%', size: 8,  rotate: 0,   dur: '6s',   delay: '1.8s', cx: '-5px' },
  { shape: 'stick',    color: 'plum',   top: '88%', left: '50%', size: 22, rotate: 34,  dur: '8s',   delay: '0.9s', cx: '4px'  },
  { shape: 'ring',     color: 'orange', top: '92%', left: '15%', size: 14, rotate: 0,   dur: '7.5s', delay: '2s',   cx: '-4px' },
  { shape: 'squiggle', color: 'gold',   top: '4%',  left: '60%', size: 24, rotate: 18,  dur: '8.5s', delay: '1.3s', cx: '5px'  },
  { shape: 'plus',     color: 'plum',   top: '46%', left: '54%', size: 14, rotate: -20, dur: '7s',   delay: '2.5s', cx: '-5px' },
  { shape: 'dot',      color: 'orange', top: '28%', left: '28%', size: 8,  rotate: 0,   dur: '6.5s', delay: '0.5s', cx: '4px'  },
  { shape: 'asterisk', color: 'coral',  top: '70%', left: '86%', size: 18, rotate: 8,   dur: '8s',   delay: '1.9s', cx: '-6px' },
];

function ShapeSVG({ shape, color, size }: { shape: Shape; color: Color; size: number }) {
  const c = COLOR[color];
  const s = size;
  switch (shape) {
    case 'squiggle':
      return (
        <svg width={s} height={s * 0.55} viewBox="0 0 32 18" fill="none" aria-hidden>
          <path d="M2 9 Q 7 1, 12 9 T 22 9 T 30 9" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'asterisk':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M10 2v16M3 10h14M4 4l12 12M16 4 4 16" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'dot':
      return (
        <svg width={s} height={s} viewBox="0 0 10 10" aria-hidden>
          <circle cx="5" cy="5" r="5" fill={c} />
        </svg>
      );
    case 'stick':
      return (
        <svg width={s * 0.35} height={s} viewBox="0 0 6 24" aria-hidden>
          <rect x="0" y="0" width="6" height="24" rx="3" fill={c} />
        </svg>
      );
    case 'ring':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="2.5" />
        </svg>
      );
    case 'plus':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 2v12M2 8h12" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 14 14" aria-hidden>
          <polygon points="7,1 13,12 1,12" fill={c} />
        </svg>
      );
  }
}

export function Confetti({
  density = 'normal',
  className = '',
}: {
  density?: 'light' | 'normal' | 'dense';
  className?: string;
}) {
  const slice =
    density === 'light' ? PRESETS.slice(0, 9) :
    density === 'dense' ? PRESETS                :
    PRESETS.slice(0, 13);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {slice.map((p, i) => (
        <span
          key={i}
          className="absolute animate-confetti"
          style={{
            top: p.top,
            left: p.left,
            ['--cr' as string]: `${p.rotate}deg`,
            ['--cdur' as string]: p.dur,
            ['--cdelay' as string]: p.delay,
            ['--cx' as string]: p.cx,
          }}
        >
          <ShapeSVG shape={p.shape} color={p.color} size={p.size} />
        </span>
      ))}
    </div>
  );
}
