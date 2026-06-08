import React from 'react';

type Variant = 'underline' | 'marker' | 'circle';
type Color = 'coral' | 'plum' | 'gold' | 'mint';

const STROKE: Record<Color, string> = {
  coral: '#FF6B5E',
  plum:  '#5B2D82',
  gold:  '#FFD166',
  mint:  '#7FCFA0',
};

/**
 * Inline highlight effect rendered as an SVG behind/under the wrapped text.
 * - "underline" — single hand-drawn line under the word
 * - "marker"    — wider semi-transparent brush stroke behind the word
 * - "circle"    — hand-drawn ellipse around the word
 */
export function Highlight({
  children,
  variant = 'underline',
  color = 'coral',
  thickness = 3,
}: {
  children: React.ReactNode;
  variant?: Variant;
  color?: Color;
  thickness?: number;
}) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <HighlightSvg variant={variant} color={STROKE[color]} thickness={thickness} />
    </span>
  );
}

function HighlightSvg({
  variant,
  color,
  thickness,
}: {
  variant: Variant;
  color: string;
  thickness: number;
}) {
  if (variant === 'underline') {
    return (
      <svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 -bottom-2 w-full h-3 pointer-events-none z-0"
        style={{ ['--hl-len' as string]: 420 }}
      >
        <path
          d="M3 8 Q 50 1, 100 7 T 197 8"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          className="animate-hl-draw"
        />
      </svg>
    );
  }
  if (variant === 'marker') {
    return (
      <svg
        aria-hidden
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ ['--hl-len' as string]: 460 }}
      >
        <path
          d="M5 30 Q 100 8, 195 25"
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
          className="animate-hl-draw"
        />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] pointer-events-none z-0"
      style={{ ['--hl-len' as string]: 520 }}
    >
      <path
        d="M100 6 C 175 6, 196 16, 196 30 C 196 50, 140 56, 100 54 C 40 54, 4 48, 4 30 C 4 12, 40 6, 100 6"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
        className="animate-hl-draw"
      />
    </svg>
  );
}
