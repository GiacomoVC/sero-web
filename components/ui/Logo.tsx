'use client';

/**
 * Sero wordmark — SVG, three-part O.
 *
 * "ser"  →  Sora 800 black, ink #18181B
 * "o"    →  open coral ring (solid color) with detached segment
 *
 * Mount animation: O spins from 8 o'clock → 1 o'clock (0.8 s),
 * then shines exactly 1 s and stops.
 *
 * animKey: fires ripple + glint on each slot-machine tick.
 *
 * ── Geometry (R=11, SW=3.4) ────────────────────────────────────────────────
 *  C = 2π × 11 = 69.12
 *  Main arc: 315° → 60.48
 *  Gap 1:    20°  → 3.84
 *  Detached: 14°  → 2.69
 *  Gap 2:    11°  → 2.11
 *  strokeDasharray: "60.48 3.84 2.69 2.11"
 * ───────────────────────────────────────────────────────────────────────────
 */

interface LogoProps {
  width?: number;
  className?: string;
  priority?: boolean;
  animKey?: number;
  /**
   * Render the O in its final settled position with no intro animation.
   * Use this for static exports (e.g. IG post images) where the rotation
   * animation would get captured mid-frame by html2canvas.
   */
  noAnim?: boolean;
}

// ─── Geometry (viewBox 0 0 170 46) ─────────────────────────────────────────
const VW   = 170;
const VH   = 46;

const FONT = 42;       // font-size
const BASE = 40;       // baseline y
const TX   = 44;       // "ser" start x

const CX   = 116;      // circle center x (nudged right for heavier weight)
const CY   = 29;       // circle center y
const R    = 11;
const SW   = 3.4;      // stroke width — heavier to match Sora 800

// Three-part dasharray: main arc | gap1 | detached segment | gap2
const DASH_MAIN  = 60.48;
const GAP1       = 3.84;
const DASH_SEG   = 2.69;
const GAP2       = 2.11;
// ───────────────────────────────────────────────────────────────────────────

export function Logo({
  width     = 220,
  className = '',
  priority  : _p,
  animKey,
  noAnim    = false,
}: LogoProps) {
  const height = Math.round(width * VH / VW);

  // Glint at the gap opening (~1 o'clock = upper-right arc)
  const glintCx = CX + R * 0.72;
  const glintCy = CY - R * 0.72;

  const dashArr = `${DASH_MAIN} ${GAP1} ${DASH_SEG} ${GAP2}`;
  const coral   = '#FF6B5E';

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
      {/* "ser" — ink near-black, heavy weight */}
      <text
        x={TX}
        y={BASE}
        fontFamily="var(--font-sora), Sora, system-ui, sans-serif"
        fontWeight="800"
        fontSize={FONT}
        fill="#18181B"
        letterSpacing="-2.2"
      >
        ser
      </text>

      {/* "o" — solid coral open ring with detached segment */}
      <circle
        id="o-ring"
        cx={CX}
        cy={CY}
        r={R}
        stroke={coral}
        strokeWidth={SW}
        strokeDasharray={dashArr}
        strokeLinecap="round"
        className={noAnim ? '' : 'animate-o-intro'}
        style={noAnim ? {
          // Final settled state of the animate-o-intro keyframes:
          // O rotated -24deg around its own center → gap lands at ~1 o'clock.
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transform: 'rotate(-24deg)',
        } : undefined}
      />

      {/* slot-tick ripple */}
      {animKey !== undefined && (
        <circle
          key={`ring-${animKey}`}
          cx={CX} cy={CY} r={R}
          stroke={coral}
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
