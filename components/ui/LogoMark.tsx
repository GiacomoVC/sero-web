'use client';

/**
 * LogoMark — standalone "o" ring symbol.
 * Gap at 1 o'clock, same CSS intro animation as the full Logo.
 *
 * <LogoMark size={40} />              — static with intro animation
 * <LogoMark size={32} animKey={i} />  — also fires slot-tick burst
 */

interface LogoMarkProps {
  size?: number;
  className?: string;
  animKey?: number;
}

export function LogoMark({ size = 32, className = '', animKey }: LogoMarkProps) {
  const c    = size / 2;
  const r    = size * 0.34;   // proportional to x-height match in Logo
  const sw   = size * 0.065;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.922;
  const gap  = circ * 0.078;

  const glintCx = c + r * 0.72;
  const glintCy = c - r * 0.72;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx={c}
        cy={c}
        r={r}
        stroke="#E06A5F"
        strokeWidth={sw}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        className="animate-o-intro"
      />
      {animKey !== undefined && (
        <circle
          key={`rm-${animKey}`}
          cx={c} cy={c} r={r}
          stroke="rgba(224,106,95,0.7)"
          strokeWidth={sw * 0.5}
          className="animate-o-ring-svg"
        />
      )}
      {animKey !== undefined && (
        <circle
          key={`gm-${animKey}`}
          cx={glintCx} cy={glintCy}
          r={sw * 1.1}
          fill="white"
          className="animate-o-glint-svg"
        />
      )}
    </svg>
  );
}
