'use client';

/**
 * Sero wordmark — SVG, Opción A.
 *
 * "ser"  →  Sora 500, near-black #1A1A1A
 * "o"    →  open coral ring #E06A5F, diameter = x-height of "ser"
 *
 * Mount animation: O spins from 7 o'clock → 1 o'clock (0.8 s),
 * then shines exactly 1 s and stops.
 *
 * animKey: fires ripple + glint on each slot-machine tick.
 *
 * ── Tuning ─────────────────────────────────────────────────────────────────
 *  "ser" too far from O  →  lower CX by 2–4
 *  "ser" overlaps O      →  raise CX by 2–4
 *  logo off-center       →  shift TX and CX by the same Δ
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
const TX   = 44;       // "ser" start x  (centers the word inside the viewBox)

// Sora 500 / 42 px x-height ≈ 22 px  →  target O outer ⌀ = 22 px
// outer radius = R + SW/2  →  R = 11 - 1.3 = 9.7 → round to 10.5 for stroke center
// "ser" advance ≈ 58 px (with −1.5 letter-spacing)  →  ends at TX + 58 = 102
// O left edge 1 px after "r": 103  →  CX = 103 + R = 114
const CX   = 114;      // ← adjust ±2–4 if gap looks wrong
const CY   = 29;       // baseline − (R + SW/2)  →  40 − 11 = 29
const R    = 10.5;
const SW   = 2.6;      // stroke proportional to Sora 500 weight

const CIRC = 2 * Math.PI * R;
const DASH = CIRC * 0.9333;   // 336° drawn
const GAP  = CIRC * 0.0667;   // 24° open → gap at 1 o'clock via CSS rotation
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
      {/* "ser" — near-black, clean */}
      <text
        x={TX}
        y={BASE}
        fontFamily="Sora, system-ui, sans-serif"
        fontWeight="500"
        fontSize={FONT}
        fill="#1A1A1A"
        letterSpacing="-1.5"
      >
        ser
      </text>

      {/* "o" — coral open ring, diameter matches x-height */}
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

      {/* slot-tick ripple */}
      {animKey !== undefined && (
        <circle
          key={`ring-${animKey}`}
          cx={CX} cy={CY} r={R}
          stroke="rgba(224,106,95,0.65)"
          strokeWidth={SW * 0.45}
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
