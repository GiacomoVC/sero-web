'use client';

/**
 * Sero wordmark — SVG, three-part O.
 *
 * "ser"  →  Sora 500, near-black #18181B (ink)
 * "o"    →  open coral ring with gradient and detached segment
 *
 * Mount animation: O spins from 8 o'clock → 1 o'clock (0.8 s),
 * then shines exactly 1 s and stops.
 *
 * animKey: fires ripple + glint on each slot-machine tick.
 *
 * ── Geometry (R=10.5, SW=2.6) ──────────────────────────────────────────────
 *  C = 2π × 10.5 = 65.97
 *  Main arc: 315° → 57.72
 *  Gap 1:    18°  → 3.30
 *  Detached: 15°  → 2.75
 *  Gap 2:    12°  → 2.20
 *  strokeDasharray: "57.72 3.30 2.75 2.20"
 * ───────────────────────────────────────────────────────────────────────────
 */

interface LogoProps {
  width?: number;
  className?: string;
  priority?: boolean;
  animKey?: number;
}

// ─── Geometry (viewBox 0 0 170 46) ─────────────────────────────────────────
const VW   = 170;
const VH   = 46;

const FONT = 42;       // font-size
const BASE = 40;       // baseline y
const TX   = 44;       // "ser" start x

const CX   = 114;      // circle center x
const CY   = 29;       // circle center y
const R    = 10.5;
const SW   = 2.6;      // stroke width

// Three-part dasharray: main arc | gap1 | detached segment | gap2
const DASH_MAIN  = 57.72;
const GAP1       = 3.30;
const DASH_SEG   = 2.75;
const GAP2       = 2.20;
// ───────────────────────────────────────────────────────────────────────────

export function Logo({
  width     = 220,
  className = '',
  priority  : _p,
  animKey,
}: LogoProps) {
  const height = Math.round(width * VH / VW);

  // Glint at the gap opening (~1 o'clock = upper-right arc)
  const glintCx = CX + R * 0.72;
  const glintCy = CY - R * 0.72;

  const gradId  = 'sero-o-grad';
  const dashArr = `${DASH_MAIN} ${GAP1} ${DASH_SEG} ${GAP2}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={`block mx-auto ${className}`}
      aria-label="sero"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FF6B5E" />
          <stop offset="100%" stopColor="#FF8A3D" />
        </linearGradient>
      </defs>

      {/* "ser" — ink near-black */}
      <text
        x={TX}
        y={BASE}
        fontFamily="Sora, system-ui, sans-serif"
        fontWeight="500"
        fontSize={FONT}
        fill="#18181B"
        letterSpacing="-1.5"
      >
        ser
      </text>

      {/* "o" — gradient open ring with detached segment, three-part dasharray */}
      <circle
        id="o-ring"
        cx={CX}
        cy={CY}
        r={R}
        stroke={`url(#${gradId})`}
        strokeWidth={SW}
        strokeDasharray={dashArr}
        strokeLinecap="round"
        className="animate-o-intro"
      />

      {/* slot-tick ripple */}
      {animKey !== undefined && (
        <circle
          key={`ring-${animKey}`}
          cx={CX} cy={CY} r={R}
          stroke={`url(#${gradId})`}
          strokeWidth={SW * 0.45}
          strokeDasharray={dashArr}
          className="animate-o-ring-svg"
        />
      )}

      {/* slot-tick glint at gap */}
      {animKey !== undefined && (
        <circle
          key={`glint-${animKey}`}
          cx={glintCx} cy={glintCy}
          r={SW * 1.05}
          fill="white"
          className="animate-o-glint-svg"
        />
      )}
    </svg>
  );
}
