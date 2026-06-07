'use client';

/**
 * Sero wordmark — SVG, Opción A.
 *
 * "ser"  →  Sora 700, plum #4D314D, letter-spacing −1
 * "o"    →  open coral ring (#E06A5F), gap ≈ 24° at 1 o'clock
 *
 * Mount animation: O rotates from 7 o'clock → 1 o'clock (0.8 s),
 * then glows for exactly 1 s and stops permanently.
 *
 * animKey prop: fires the slot-tick ripple + glint burst.
 *
 * ── Geometry notes ──────────────────────────────────────────────────────────
 *  If "ser" renders wider/narrower than expected (font metric variance),
 *  adjust CX by ±2–4 units. All other values are derived from R and SW.
 * ────────────────────────────────────────────────────────────────────────────
 */

interface LogoProps {
  width?: number;
  className?: string;
  priority?: boolean; // API compat — unused
  animKey?: number;   // changes each slot tick → restarts burst animation
}

// ─── Geometry (SVG user units — viewBox 0 0 200 52) ─────────────────────────
const VW   = 200;
const VH   = 52;

// Text — Sora 700 at 44 px is slightly wider than 600; TX nudged left
const FONT = 44;
const BASE = 42;   // baseline y
const TX   = 44;   // "ser" start x  ← adjust here if O drifts from text

// "o" circle — sized to match Sora's x-height; positioned after "ser"
// At Sora 700 / 44 px, "ser" advance ≈ 72 px → ends at TX+72 = 116
// Gap before O: ~4 px; O center: 116 + 4 + R = 134
const CX   = 134;  // "o" center x  ← adjust if "ser" is wider/narrower
const CY   = 29;   // "o" center y  (baseline − x-height/2 ≈ 42 − 13 = 29)
const R    = 13.5; // radius        (x-height/2 ≈ 22.8/2 × slight scale-up)
const SW   = 3.8;  // stroke width  (~14 % of R — prominent but not heavy)

// Arc: 336° drawn, 24° gap
const CIRC = 2 * Math.PI * R;
const DASH = CIRC * 0.9333;  // 336 / 360
const GAP  = CIRC * 0.0667;  // 24  / 360
// ─────────────────────────────────────────────────────────────────────────────

export function Logo({
  width     = 220,
  className = '',
  priority  : _p,
  animKey,
}: LogoProps) {
  const height = Math.round(width * VH / VW);

  // Glint spot: sits at the gap opening (~1 o'clock = upper-right arc)
  const glintCx = CX + R * 0.72;
  const glintCy = CY - R * 0.72;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      overflow="visible"   // lets shine drop-shadow extend beyond viewBox
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
        fontWeight="700"
        fontSize={FONT}
        fill="#4D314D"
        letterSpacing="-1"
      >
        ser
      </text>

      {/* ── "o" — base open ring ──────────────────────────────────────────── */}
      {/* Rotation is 100 % CSS (animate-o-intro). No SVG transform attribute. */}
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

      {/* ── Slot-tick: ripple ring ──────────────────────────────────────────── */}
      {animKey !== undefined && (
        <circle
          key={`ring-${animKey}`}
          cx={CX}
          cy={CY}
          r={R}
          stroke="rgba(224,106,95,0.68)"
          strokeWidth={SW * 0.45}
          className="animate-o-ring-svg"
        />
      )}

      {/* ── Slot-tick: white glint at gap (1 o'clock) ─────────────────────── */}
      {animKey !== undefined && (
        <circle
          key={`glint-${animKey}`}
          cx={glintCx}
          cy={glintCy}
          r={SW * 1.05}
          fill="white"
          className="animate-o-glint-svg"
        />
      )}
    </svg>
  );
}
