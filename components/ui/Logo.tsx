'use client';

/**
 * Sero wordmark — SVG, Opción A style.
 * "ser" → Sora 600, plum #4D314D
 * "o"  → open coral ring, gap at 1 o'clock
 *
 * On mount the O rotates in from 7 o'clock → 1 o'clock (0.8 s),
 * then shines for exactly 1 s and stays.
 *
 * Pass `animKey` (changes each slot tick) to fire the ripple+glint burst.
 */

interface LogoProps {
  width?: number;
  className?: string;
  priority?: boolean; // kept for call-site compat — unused in SVG
  animKey?: number;   // triggers slot-tick burst on change
}

// ─── Geometry (SVG user units, viewBox 0 0 200 52) ───────────────────────────
const VW   = 200;
const VH   = 52;
const FONT = 44;        // "ser" font-size
const BASE = 42;        // text baseline y
const TX   = 50;        // "ser" start x
const CX   = 131;       // "o" center x
const CY   = 30;        // "o" center y  (baseline − x-height/2)
const R    = 12.5;      // radius
const SW   = 3.2;       // stroke width (slightly bolder than before)
const CIRC = 2 * Math.PI * R;
const DASH = CIRC * 0.922;   // arc  (≈ 332° drawn)
const GAP  = CIRC * 0.078;   // gap  (≈  28° open, lands at 1 o'clock via CSS)
// ─────────────────────────────────────────────────────────────────────────────

export function Logo({
  width     = 220,
  className = '',
  priority  : _p,
  animKey,
}: LogoProps) {
  const height = Math.round(width * VH / VW);

  // Glint lives near the gap — upper-right at ~1 o'clock
  const glintCx = CX + R * 0.72;
  const glintCy = CY - R * 0.72;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      overflow="visible"          // lets the shine drop-shadow breathe
      xmlns="http://www.w3.org/2000/svg"
      className={`block mx-auto ${className}`}
      aria-label="sero"
      role="img"
    >
      {/* ── "ser" ─────────────────────────────────────────────────────────── */}
      <text
        x={TX}
        y={BASE}
        fontFamily="Sora, system-ui, sans-serif"
        fontWeight="600"
        fontSize={FONT}
        fill="#4D314D"
        letterSpacing="-1"
      >
        ser
      </text>

      {/* ── "o" base ring ─────────────────────────────────────────────────── */}
      {/*   No SVG transform here — rotation is fully driven by CSS.          */}
      {/*   animate-o-intro: rotates from 7 o'clock → 1 o'clock, then shines. */}
      <circle
        id="o-ring"
        cx={CX}
        cy={CY}
        r={R}
        stroke="#E06A5F"
        strokeWidth={SW}
        strokeDasharray={`${DASH} ${GAP}`}
        strokeLinecap="round"
        className="animate-o-intro"
      />

      {/* ── Slot-tick ripple (remounts on each animKey change) ─────────────── */}
      {animKey !== undefined && (
        <circle
          key={`ring-${animKey}`}
          cx={CX}
          cy={CY}
          r={R}
          stroke="rgba(224,106,95,0.7)"
          strokeWidth={SW * 0.5}
          className="animate-o-ring-svg"
        />
      )}

      {/* ── Slot-tick glint at the gap (1 o'clock area) ────────────────────── */}
      {animKey !== undefined && (
        <circle
          key={`glint-${animKey}`}
          cx={glintCx}
          cy={glintCy}
          r={SW * 1.1}
          fill="white"
          className="animate-o-glint-svg"
        />
      )}
    </svg>
  );
}
