'use client';

/**
 * Sero wordmark — SVG, Opción A.
 *
 * "ser"  →  Sora 500, plum #4D314D, letter-spacing −1.5
 * "o"    →  open coral ring #E06A5F, gap ≈ 24° at 1 o'clock
 *
 * Mount animation: O spins from 7 o'clock → 1 o'clock (0.8 s),
 * then shines exactly 1 s and stops permanently.
 *
 * animKey: fires ripple+glint burst on each slot-machine tick.
 *
 * ── Tuning ──────────────────────────────────────────────────────────────────
 *  If "ser" renders wider → increase CX by 2–4 units (and vice-versa).
 *  If overall logo looks off-center → shift TX and CX together by same Δ.
 * ────────────────────────────────────────────────────────────────────────────
 */

interface LogoProps {
  width?: number;
  className?: string;
  priority?: boolean;
  animKey?: number;
}

// ─── Geometry (SVG user units — viewBox 0 0 180 50) ─────────────────────────
const VW   = 180;
const VH   = 50;

const FONT = 42;          // font-size
const BASE = 40;          // baseline y
const TX   = 10;          // "ser" start x

// At Sora 500 / 42 px, "ser" advance ≈ 58 px (with −1.5 letter-spacing)
// → "r" right edge ≈ TX + 58 = 68
// O left edge should be ~1 px after "r": 69
// O center: 69 + R = 69 + 12.5 = 81.5 → CX = 82
const CX   = 82;          // ← adjust here if gap looks wrong
const CY   = 27;          // baseline − x-height/2  (40 − 13 = 27)
const R    = 12.5;
const SW   = 3.0;         // stroke weight proportional to Sora 500

const CIRC = 2 * Math.PI * R;
const DASH = CIRC * 0.9333;   // 336° drawn
const GAP  = CIRC * 0.0667;   // 24° open
// ─────────────────────────────────────────────────────────────────────────────

export function Logo({
  width     = 220,
  className = '',
  priority  : _p,
  animKey,
}: LogoProps) {
  const height = Math.round(width * VH / VW);
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
      {/* "ser" */}
      <text
        x={TX}
        y={BASE}
        fontFamily="Sora, system-ui, sans-serif"
        fontWeight="500"
        fontSize={FONT}
        fill="#4D314D"
        letterSpacing="-1.5"
      >
        ser
      </text>

      {/* "o" — open ring, rotation fully via CSS animate-o-intro */}
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

      {/* slot-tick glint at gap (1 o'clock) */}
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
