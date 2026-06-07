'use client';

/**
 * LogoMark — the standalone "o" ring symbol.
 *
 * Use anywhere you need the brand icon without the full wordmark:
 *   <LogoMark size={40} />
 *   <LogoMark size={24} animKey={i} />  ← animated version
 */

interface LogoMarkProps {
  size?: number;
  className?: string;
  animKey?: number;
}

export function LogoMark({ size = 32, className = '', animKey }: LogoMarkProps) {
  const c   = size / 2;
  const r   = size * 0.36;
  const sw  = size * 0.068;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.922;
  const gap  = circ * 0.078;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base ring */}
      <circle
        cx={c}
        cy={c}
        r={r}
        stroke="#E06A5F"
        strokeWidth={sw}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-100, ${c}, ${c})`}
      />

      {/* Ripple */}
      {animKey !== undefined && (
        <circle
          key={`rm-${animKey}`}
          cx={c}
          cy={c}
          r={r}
          stroke="rgba(224,106,95,0.7)"
          strokeWidth={sw * 0.55}
          className="animate-o-ring-svg"
        />
      )}

      {/* Glint */}
      {animKey !== undefined && (
        <circle
          key={`gm-${animKey}`}
          cx={c - r * 0.7}
          cy={c - r * 0.7}
          r={sw * 1.1}
          fill="white"
          className="animate-o-glint-svg"
        />
      )}
    </svg>
  );
}
