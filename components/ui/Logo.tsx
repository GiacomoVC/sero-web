'use client';

/**
 * Sero wordmark — generated SVG, no external image.
 *
 * "ser"  →  Sora 600, plum #4D314D
 * "o"    →  open coral ring (#E06A5F) with a ~28° gap at top-right
 *
 * Pass `animKey` (e.g. animKey={i}) to trigger the O light-burst effect.
 * Each time animKey changes, the animation elements remount and replay.
 *
 * The <circle> id="o-ring" can be referenced as a standalone symbol anywhere.
 */

interface LogoProps {
  width?: number;
  className?: string;
  priority?: boolean; // kept for call-site compat — unused in SVG
  animKey?: number;   // triggers O animation on change
}

// ─── Geometry (all in SVG user units, viewBox 0 0 200 52) ───────────────────
const VW = 200;         // viewBox width
const VH = 52;          // viewBox height
const FONT  = 44;       // "ser" font-size
const BASE  = 42;       // text baseline y
const TX    = 50;       // "ser" start x  — shift left/right to re-center if needed
const CX    = 131;      // "o" center x   — adjust if "ser" is wider/narrower than estimated
const CY    = 30;       // "o" center y   — baseline − x-height/2
const R     = 12.5;     // "o" radius     ≈ Sora x-height / 2
const SW    = 3;        // stroke width
const CIRC  = 2 * Math.PI * R;
const DASH  = CIRC * 0.922;   // arc length  (360° − 28° gap)
const GAP   = CIRC * 0.078;   // gap length  (~28°, at top-right after rotate −100°)
// ────────────────────────────────────────────────────────────────────────────

export function Logo({
  width    = 220,
  className = '',
  priority : _p,   // unused
  animKey,
}: LogoProps) {
  const height = Math.round(width * VH / VW);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`block mx-auto ${className}`}
      aria-label="sero"
      role="img"
    >
      {/* ── "ser" letters ──────────────────────────────────────────────── */}
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

      {/* ── "o" — base open ring ────────────────────────────────────────── */}
      <circle
        id="o-ring"
        cx={CX}
        cy={CY}
        r={R}
        stroke="#E06A5F"
        strokeWidth={SW}
        strokeDasharray={`${DASH} ${GAP}`}
        strokeLinecap="round"
        transform={`rotate(-100, ${CX}, ${CY})`}
      />

      {/* ── Animation: ripple ring — remounts on each animKey change ───── */}
      {animKey !== undefined && (
        <circle
          key={`ring-${animKey}`}
          cx={CX}
          cy={CY}
          r={R}
          stroke="rgba(224,106,95,0.7)"
          strokeWidth={SW * 0.55}
          className="animate-o-ring-svg"
        />
      )}

      {/* ── Animation: white glint at 135° (top-left arc) ─────────────── */}
      {animKey !== undefined && (
        <circle
          key={`glint-${animKey}`}
          cx={CX - R * 0.7}
          cy={CY - R * 0.7}
          r={SW * 1.1}
          fill="white"
          className="animate-o-glint-svg"
        />
      )}
    </svg>
  );
}
