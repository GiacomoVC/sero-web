'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createAudioStreamForRecording } from '@/lib/audioContext';

// ─── Canvas resolution (1080×1920 portrait, IG story format) ─────────────────
const CW = 1080;
const CH = 1920;

// ─── Palette (mirrors the website) ───────────────────────────────────────────
const C = {
  cream:    '#FAF8F5',
  ink:      '#18181B',
  inkSoft:  'rgba(24,24,27,0.72)',
  coral:    '#FF6B5E',
  plum:     '#5B2D82',
  gold:     '#FFD166',
  orange:   '#FF8A3D',
  lilac:    '#B78BB8',
  mintDot:  '#7FCFA0',
  peach:    '#FFD9CF', peachTx: '#B33E2E', peachBd: 'rgba(179,62,46,0.20)',
  butter:   '#FFE9B0', butTx:   '#8A6A1A', butBd:   'rgba(138,106,26,0.20)',
  mint:     '#D4ECDD', minTx:   '#1F6E3C', minBd:   'rgba(31,110,60,0.20)',
  sky:      '#D7E8F7', skyTx:   '#2A5685', skyBd:   'rgba(42,86,133,0.20)',
  lavender: '#E9DCF6', lavTx:   '#5B2D82', lavBd:   'rgba(91,45,130,0.20)',
};

// ─── Easing ──────────────────────────────────────────────────────────────────
const clamp  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const il     = (a: number, b: number, t: number) => clamp((t - a) / (b - a), 0, 1);
const eOut   = (t: number) => 1 - (1 - t) ** 3;
const eInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
const eBack  = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

// ─── Rounded rect ────────────────────────────────────────────────────────────
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r); ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxPx: number): string {
  if (ctx.measureText(text).width <= maxPx) return text;
  let s = text;
  while (s.length > 0 && ctx.measureText(s + '…').width > maxPx) s = s.slice(0, -1);
  return s + '…';
}

// ─── Confetti backdrop ───────────────────────────────────────────────────────
type Shape = 'squiggle' | 'asterisk' | 'dot' | 'stick' | 'ring' | 'plus' | 'triangle';
interface Piece { shape: Shape; color: string; x: number; y: number; s: number; r: number; ph: number; }

const CONF: Piece[] = [
  { shape: 'squiggle', color: C.coral,  x: 110,  y: 240,  s: 64, r: -12, ph: 0.0 },
  { shape: 'asterisk', color: C.plum,   x: 950,  y: 320,  s: 54, r: 14,  ph: 0.8 },
  { shape: 'dot',      color: C.gold,   x: 540,  y: 160,  s: 26, r: 0,   ph: 1.6 },
  { shape: 'stick',    color: C.mintDot,x: 170,  y: 540,  s: 60, r: -28, ph: 0.3 },
  { shape: 'ring',     color: C.coral,  x: 930,  y: 700,  s: 46, r: 8,   ph: 1.1 },
  { shape: 'plus',     color: C.orange, x: 100,  y: 880,  s: 40, r: 16,  ph: 2.2 },
  { shape: 'squiggle', color: C.plum,   x: 970,  y: 1080, s: 60, r: 22,  ph: 0.6 },
  { shape: 'triangle', color: C.coral,  x: 80,   y: 1500, s: 36, r: -10, ph: 1.4 },
  { shape: 'asterisk', color: C.gold,   x: 220,  y: 1320, s: 50, r: 0,   ph: 0.2 },
  { shape: 'dot',      color: C.coral,  x: 820,  y: 1480, s: 22, r: 0,   ph: 1.8 },
  { shape: 'stick',    color: C.plum,   x: 940,  y: 1720, s: 56, r: 34,  ph: 0.9 },
  { shape: 'ring',     color: C.orange, x: 150,  y: 1760, s: 36, r: 0,   ph: 2.0 },
  { shape: 'squiggle', color: C.gold,   x: 700,  y: 80,   s: 56, r: 18,  ph: 1.3 },
  { shape: 'plus',     color: C.plum,   x: 60,   y: 1180, s: 36, r: -20, ph: 2.5 },
  { shape: 'dot',      color: C.orange, x: 360,  y: 700,  s: 22, r: 0,   ph: 0.5 },
  { shape: 'asterisk', color: C.coral,  x: 900,  y: 1320, s: 46, r: 8,   ph: 1.9 },
  { shape: 'triangle', color: C.mintDot,x: 1000, y: 1480, s: 30, r: 24,  ph: 2.3 },
  { shape: 'ring',     color: C.lilac,  x: 740,  y: 1640, s: 42, r: 0,   ph: 0.4 },
];

function drawShape(ctx: CanvasRenderingContext2D, p: Piece) {
  const s = p.s;
  ctx.strokeStyle = p.color;
  ctx.fillStyle   = p.color;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  switch (p.shape) {
    case 'squiggle':
      ctx.lineWidth = s * 0.16;
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, 0);
      ctx.quadraticCurveTo(-s * 0.27, -s * 0.36, 0, 0);
      ctx.quadraticCurveTo( s * 0.27,  s * 0.36, s * 0.5, 0);
      ctx.stroke();
      break;
    case 'asterisk':
      ctx.lineWidth = s * 0.14;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo( Math.cos(a) * s * 0.5,  Math.sin(a) * s * 0.5);
        ctx.lineTo(-Math.cos(a) * s * 0.5, -Math.sin(a) * s * 0.5);
        ctx.stroke();
      }
      break;
    case 'dot':
      ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2); ctx.fill();
      break;
    case 'stick': {
      const w = s * 0.24, h = s;
      rr(ctx, -w / 2, -h / 2, w, h, w / 2); ctx.fill();
      break;
    }
    case 'ring':
      ctx.lineWidth = s * 0.18;
      ctx.beginPath(); ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'plus':
      ctx.lineWidth = s * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5); ctx.lineTo(0, s * 0.5);
      ctx.moveTo(-s * 0.5, 0); ctx.lineTo(s * 0.5, 0);
      ctx.stroke();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo( s * 0.5, s * 0.4);
      ctx.lineTo(-s * 0.5, s * 0.4);
      ctx.closePath(); ctx.fill();
      break;
  }
}

function drawConfetti(ctx: CanvasRenderingContext2D, t: number, alpha: number) {
  if (alpha <= 0) return;
  for (const p of CONF) {
    const ph = t * 0.55 + p.ph;
    const ox = Math.sin(ph) * 12;
    const oy = Math.cos(ph * 0.78) * 14;
    const r  = p.r + Math.sin(ph * 0.6) * 6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x + ox, p.y + oy);
    ctx.rotate((r * Math.PI) / 180);
    drawShape(ctx, p);
    ctx.restore();
  }
}

// ─── Sparkles (chip arrival bursts) ──────────────────────────────────────────
const SPARK_COLORS = [C.coral, C.gold, C.plum, C.orange];

function drawSparkBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, age: number) {
  if (age < 0 || age > 0.55) return;
  const N = 6;
  for (let i = 0; i < N; i++) {
    const ang   = (i / N) * Math.PI * 2 + cy * 0.001;
    const dist  = age * 110 + 30;
    const px    = cx + Math.cos(ang) * dist;
    const py    = cy + Math.sin(ang) * dist;
    const alpha = 1 - age / 0.55;
    const rad   = 7 * (1 - age * 1.5);
    if (rad <= 0) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = SPARK_COLORS[i % SPARK_COLORS.length];
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ─── Chip ────────────────────────────────────────────────────────────────────
const CHIP_PALETTE = [
  { bg: C.peach,    fg: C.peachTx, bd: C.peachBd },
  { bg: C.butter,   fg: C.butTx,   bd: C.butBd   },
  { bg: C.mint,     fg: C.minTx,   bd: C.minBd   },
  { bg: C.sky,      fg: C.skyTx,   bd: C.skyBd   },
  { bg: C.lavender, fg: C.lavTx,   bd: C.lavBd   },
  { bg: C.peach,    fg: C.peachTx, bd: C.peachBd },
];

// Slots: organic scatter (varied x offset + rotation) below the small name.
// Bigger chips (80px font) need ~180px vertical spacing for clean separation.
const CHIP_SLOTS = [
  { x: CW / 2 - 70, y: 620,  rot: -5 },
  { x: CW / 2 + 90, y: 800,  rot:  4 },
  { x: CW / 2 - 90, y: 980,  rot: -3 },
  { x: CW / 2 + 70, y: 1160, rot:  6 },
  { x: CW / 2 - 60, y: 1340, rot: -4 },
  { x: CW / 2 + 80, y: 1520, rot:  5 },
];

function drawChip(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  text: string,
  pal: { bg: string; fg: string; bd: string },
  fontSize: number,
  alpha: number,
  scale: number,
  rotDeg: number,
) {
  if (alpha <= 0 || scale <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate((rotDeg * Math.PI) / 180);
  ctx.scale(scale, scale);

  ctx.font = `700 ${fontSize}px Sora, system-ui, sans-serif`;
  // IMPORTANT: ctx.letterSpacing is NOT included in canvas save/restore state,
  // so it bleeds across draw calls. Open the tracking slightly — Sora at large
  // weights is naturally tight and feels cramped at story-card scale.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `1.5px`;
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  const fitted = fitText(ctx, text, 760);
  const tw = ctx.measureText(fitted).width;
  const padX = 56, padY = 32;
  const cW = tw + padX * 2;
  const cH = fontSize + padY * 2;
  const cr = cH / 2;
  const lx = -cW / 2, ly = -cH / 2;

  ctx.shadowColor   = 'rgba(91,45,130,0.18)';
  ctx.shadowBlur    = 28;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle     = pal.bg;
  rr(ctx, lx, ly, cW, cH, cr);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = pal.bd;
  ctx.lineWidth = 3;
  rr(ctx, lx, ly, cW, cH, cr);
  ctx.stroke();

  ctx.fillStyle = pal.fg;
  ctx.fillText(fitted, lx + padX, 0);
  ctx.restore();
}

// ─── Highlight (hand-drawn coral underline) ──────────────────────────────────
function drawUnderline(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, width: number,
  progress: number, alpha: number,
) {
  if (progress <= 0 || alpha <= 0) return;
  const halfW = width / 2;
  const startX = cx - halfW;
  const endX   = cx + halfW;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = C.coral;
  ctx.lineWidth   = 14;
  ctx.lineCap     = 'round';

  // Approximate the bezier with a polyline so we can clip to `progress`
  const STEPS = 60;
  const target = Math.floor(STEPS * progress);
  ctx.beginPath();
  for (let i = 0; i <= target; i++) {
    const t = i / STEPS;
    // Quadratic bezier: P0 (startX, y+4), C (cx, y-12), P1 (endX, y+2)
    const x = (1 - t) ** 2 * startX + 2 * (1 - t) * t * cx + t ** 2 * endX;
    const yy = (1 - t) ** 2 * (y + 4) + 2 * (1 - t) * t * (y - 14) + t ** 2 * (y + 2);
    if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
  ctx.restore();
}

// ─── O ring (matches the new logo: solid coral, detached segment) ────────────
// Geometry (from Logo.tsx): R=11, SW=3.4, main 315°, gap1 20°, detached 14°, gap2 11°
const O_START_DEG  = -24;
const O_MAIN_DEG   = 315;
const O_GAP1_DEG   = 20;
const O_DETACH_DEG = 14;

function drawO(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, sw: number,
  drawProgress: number, alpha: number, glow = false,
) {
  if (alpha <= 0 || drawProgress <= 0) return;
  const TAU = Math.PI * 2;
  const Cc  = TAU * r;
  const mainLen = (O_MAIN_DEG   / 360) * Cc;
  const detLen  = (O_DETACH_DEG / 360) * Cc;
  const drawn   = drawProgress * (mainLen + detLen);
  const a0 = (O_START_DEG * Math.PI) / 180;
  const a1 = a0 + (O_MAIN_DEG * Math.PI) / 180;
  const a2 = a1 + (O_GAP1_DEG * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (glow) { ctx.shadowColor = 'rgba(255,107,94,0.55)'; ctx.shadowBlur = 52; }
  ctx.strokeStyle = C.coral;
  ctx.lineWidth   = sw;
  ctx.lineCap     = 'round';

  const md = Math.min(drawn, mainLen);
  if (md > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, a0, a0 + (md / Cc) * TAU, false);
    ctx.stroke();
  }
  if (drawn > mainLen) {
    const dd = Math.min(drawn - mainLen, detLen);
    ctx.beginPath();
    ctx.arc(cx, cy, r, a2, a2 + (dd / Cc) * TAU, false);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Final logo geometry (canvas scale) ──────────────────────────────────────
// Wordmark layout (matches the website SVG logo). The O sits to the right of
// 'ser' with a slight horizontal overlap. The O is drawn AFTER 'ser' so it
// renders as a z-layer above the 'r' (the 'r' never visually crosses the O).
const LOGO_FS  = 280;          // font size for "ser"
const LOGO_R   = 72;           // O radius
const LOGO_SW  = 22;           // O stroke
const LOGO_CY  = 1010;         // O center y (wordmark baseline = LOGO_CY + LOGO_R)
const LOGO_LSP = -8;           // letter-spacing for "ser"

// Horizontal offset from the visual end of 'ser' to the O center.
// Positive = gap, negative = overlap. Matches the SVG ratio: in the SVG, the O
// center sits ~6 viewBox units past the visual end of 'ser' (a small overlap).
const LOGO_SER_O_OFFSET = -10;

function logoLayout(ctx: CanvasRenderingContext2D) {
  ctx.font = `800 ${LOGO_FS}px Sora, system-ui, sans-serif`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${LOGO_LSP}px`;
  const serW   = ctx.measureText('ser').width;
  const totalW = serW + LOGO_SER_O_OFFSET + LOGO_R * 2;
  const serX   = (CW - totalW) / 2;
  const oCX    = serX + serW + LOGO_SER_O_OFFSET + LOGO_R;
  const baseline = LOGO_CY + LOGO_R;
  return { serX, oCX, oCY: LOGO_CY, baseline, serW };
}

function drawSer(ctx: CanvasRenderingContext2D, x: number, baseline: number, alpha: number, glow = false) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `800 ${LOGO_FS}px Sora, system-ui, sans-serif`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${LOGO_LSP}px`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';
  if (glow) { ctx.shadowColor = 'rgba(24,24,27,0.18)'; ctx.shadowBlur = 30; }
  ctx.fillStyle = C.ink;
  ctx.fillText('ser', x, baseline);
  ctx.restore();
}

// ─── Public handle ───────────────────────────────────────────────────────────
export interface StoryCardHandle {
  /** Returns the pre-recorded result, awaiting if it's still in flight. */
  captureVideo(): Promise<{ url: string; ext: string; blob: Blob }>;
  /** Synchronous accessor for the pre-recorded result (or null while recording). */
  getReadyVideo(): { url: string; ext: string; blob: Blob } | null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const StoryCard = forwardRef<
  StoryCardHandle,
  {
    firstName: string;
    tags: string[];
    shareUrl: string;
    /** Fires once the background recording is finalized & blob is ready. */
    onReady?: () => void;
  }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(function StoryCard({ firstName, tags, shareUrl: _shareUrl, onReady }, ref) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>();
  const startRef     = useRef<number>(0);
  const drawFnRef    = useRef<(ctx: CanvasRenderingContext2D, t: number) => void>(() => {});
  // Pre-recording infrastructure. We keep the Blob (not just URL) so the
  // share handler can construct a File synchronously inside the user gesture
  // — required for navigator.share() to work on iOS Safari.
  const recordingRef = useRef<Promise<{ url: string; ext: string; blob: Blob }> | null>(null);
  const resultRef    = useRef<{ url: string; ext: string; blob: Blob } | null>(null);
  const onReadyRef   = useRef<typeof onReady>(onReady);
  onReadyRef.current = onReady;

  // Up to 6 displayable tags. Fallback to generic worlds if user has fewer.
  const FALLBACK = ['música', 'series', 'películas', 'libros', 'deportes', 'anime'];
  const userLabels = [
    ...tags.filter(Boolean).slice(0, 6),
    ...FALLBACK,
  ].slice(0, 6);

  useEffect(() => {
    drawFnRef.current = (ctx: CanvasRenderingContext2D, t: number) => {
      // Reset sticky state that survives save/restore (ctx.letterSpacing
      // is not in the canvas spec's save/restore list and bleeds between frames).
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `0px`;

      // ── Background ──────────────────────────────────────────────────────
      ctx.fillStyle = C.cream;
      ctx.fillRect(0, 0, CW, CH);

      // Confetti always present, fades in over first 0.4s
      const confA = eOut(il(0, 0.4, t));
      drawConfetti(ctx, t, confA);

      // ── Phase 1: NAME REVEAL (0.0 – 1.4s) ───────────────────────────────
      // Phase 2: name shrinks to top (1.4 – 1.8s)
      // We compute name properties continuously:
      //   - 0.0-1.4: name large at center y=900, fontSize 220
      //   - 1.4-1.8: shrinks to fontSize 90, moves to y=410
      //   - 1.8+:   stays small at top through phase 2
      //   - 4.6-5.0: fades out during sweep
      const nameLargeY  = 920;
      const nameSmallY  = 380;
      // Fixed-target sizing so we never shrink the name below ~comfortable.
      // Names that exceed the canvas width are truncated character-by-character
      // and an ellipsis is rendered on a SECOND LINE BELOW the name (so the
      // dots never interfere with the wordmark).
      const NAME_TARGET_FS = 180;
      const NAME_SMALL_FS  = 72;
      const MAX_NAME_W     = CW - 200;
      const rawName        = firstName || 'amig@';
      ctx.save();
      ctx.font = `800 ${NAME_TARGET_FS}px Sora, system-ui, sans-serif`;
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
      let dispName    = rawName;
      let nameOverflow = false;
      if (ctx.measureText(dispName).width > MAX_NAME_W) {
        nameOverflow = true;
        while (dispName.length > 1 && ctx.measureText(dispName).width > MAX_NAME_W) {
          dispName = dispName.slice(0, -1);
        }
      }
      ctx.restore();
      const nameLargeFS = NAME_TARGET_FS;
      const nameSmallFS = NAME_SMALL_FS;

      const shrinkP = eInOut(il(1.4, 1.8, t));
      const nameY   = nameLargeY  + (nameSmallY  - nameLargeY)  * shrinkP;
      const nameFS  = nameLargeFS + (nameSmallFS - nameLargeFS) * shrinkP;
      const nameA   = eOut(il(0.30, 0.95, t)) * (1 - eOut(il(4.6, 5.0, t)));

      // Caveat heading "el plan ideal de" fades in early, fades out before phase 2
      const headA = eOut(il(0.20, 0.80, t)) * (1 - eOut(il(1.30, 1.70, t)));
      if (headA > 0.01) {
        ctx.save();
        ctx.globalAlpha = headA;
        ctx.font = `700 110px Caveat, "Caveat Brush", cursive`;
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `0px`;
        ctx.fillStyle = C.plum;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const headY = 700;
        // Tiny tilt for the handwritten feel
        ctx.translate(CW / 2, headY);
        ctx.rotate((-3 * Math.PI) / 180);
        ctx.fillText('el plan ideal de', 0, 0);
        ctx.restore();
      }

      // Name (always rendered while nameA > 0)
      if (nameA > 0.01) {
        ctx.save();
        ctx.globalAlpha = nameA;
        ctx.font = `800 ${nameFS}px Sora, system-ui, sans-serif`;
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
        ctx.fillStyle = C.ink;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dispName, CW / 2, nameY);
        // If the name had to be truncated, render an ellipsis on a second
        // line below — keeps it out of the name's typography.
        if (nameOverflow && shrinkP < 0.4) {
          ctx.font = `800 ${Math.floor(nameFS * 0.55)}px Sora, system-ui, sans-serif`;
          ctx.fillStyle = `rgba(24,24,27,${0.55 * nameA})`;
          ctx.globalAlpha = 1;
          ctx.fillText('…', CW / 2, nameY + nameFS * 0.62);
          ctx.globalAlpha = nameA;
        }

        // Underline only during phase 1 (large name)
        if (shrinkP < 0.4) {
          const tw   = ctx.measureText(dispName).width;
          const ulW  = Math.min(tw + 40, CW - 140);
          const ulP  = eOut(il(0.85, 1.30, t));
          const ulA  = (1 - shrinkP * 2.5);
          drawUnderline(ctx, CW / 2, nameY + nameFS * 0.42, ulW, ulP, Math.max(0, ulA));
        }
        ctx.restore();
      }

      // ── Phase 2: TASTES REVEAL (1.8 – 4.6s) ──────────────────────────────
      // Each chip enters at: chipStart = 1.85 + i * 0.40
      // Exits at: 4.60 + i * 0.05 (very slight stagger)
      const NUM = Math.min(userLabels.length, 6);
      for (let i = 0; i < NUM; i++) {
        const slot = CHIP_SLOTS[i];
        const pal  = CHIP_PALETTE[i % CHIP_PALETTE.length];
        const chipStart = 1.85 + i * 0.40;
        const chipExit  = 4.60 + i * 0.05;
        const chipExitEnd = chipExit + 0.30;

        const entryP = il(chipStart, chipStart + 0.50, t);
        const exitP  = il(chipExit, chipExitEnd, t);

        // Scale: 0 → 1.08 (back overshoot) → 1.0
        const scale = entryP < 0.001 ? 0 : eBack(entryP);
        // Alpha: in 0→1 by t=chipStart+0.25, out 1→0 by chipExitEnd
        const alpha = eOut(il(chipStart, chipStart + 0.25, t)) * (1 - eOut(exitP));

        if (alpha < 0.01) continue;

        // Idle wobble after entry settles
        const wobbleT = Math.max(0, t - chipStart - 0.5);
        const wobble  = Math.sin(wobbleT * 1.4 + i) * 1.2;
        const rotDeg  = slot.rot + wobble;

        // Slight downward drift while exiting (fall away)
        const exitDy = exitP * 60;
        const cy     = slot.y + exitDy;

        drawChip(ctx, slot.x, cy, userLabels[i], pal, 80, alpha, scale, rotDeg);

        // Sparkle burst on arrival
        const burstAge = t - (chipStart + 0.10);
        drawSparkBurst(ctx, slot.x, slot.y, burstAge);
      }

      // ── Phase 3: SWEEP + BIG O draws in (4.9 – 5.6s) ─────────────────────
      // Big O lives at (CW/2, 870), R=210, sw=22 (3.4× the final SW for impact)
      // Then in Phase 4 (5.6–6.5s) it scales+moves to the logo position.
      // Big O appears centered in upper-middle, then morphs to its accent
      // position above the 'r' of 'ser' in phase 4.
      const BIG_CX = CW / 2;
      const BIG_CY = 1000;
      const BIG_R  = 230;
      const BIG_SW = 34;

      // Big-O draw-in: 5.00 → 5.60 (0.60s)
      const bigDrawP = eOut(il(5.00, 5.60, t));
      // Big-O alone alpha (held 5.60 → 5.80 before the morph kicks in)
      const bigSoloA = bigDrawP * (t < 5.80 ? 1 : 1);

      // Morph progress: 5.80 → 6.30 — O scales/translates from BIG to logo
      const morphP = eInOut(il(5.80, 6.30, t));

      // 'ser' slides in from off-left: 5.90 → 6.40
      const serP   = eOut(il(5.90, 6.40, t));

      // Compute O current position+radius (interpolate from BIG to logo target)
      if (bigDrawP > 0.01) {
        const layout = logoLayout(ctx);
        const targetCX = layout.oCX;
        const targetCY = layout.oCY;
        const curCX = BIG_CX + (targetCX - BIG_CX) * morphP;
        const curCY = BIG_CY + (targetCY - BIG_CY) * morphP;
        const curR  = BIG_R  + (LOGO_R  - BIG_R)  * morphP;
        const curSW = BIG_SW + (LOGO_SW - BIG_SW) * morphP;

        // Glow only while big & during glow flash at end of morph
        const glowFlash = t >= 6.30 && t < 6.55;
        const glow      = (morphP < 0.2) || glowFlash;

        // Z-ORDER: draw 'ser' FIRST, then the O on top — so the O renders as
        // a layer above the 'r' and the 'r' never visually crosses into the
        // O ring. (User: "que la O esté un layer por encima de ser".)
        if (serP > 0) {
          const serX = -300 + (layout.serX - (-300)) * serP;
          drawSer(ctx, serX, layout.baseline, serP, glowFlash);
        }
        drawO(ctx, curCX, curCY, curR, curSW, bigDrawP, bigSoloA, glow);
      }

      // ── Phase 5: CTA HOLD (6.50 – 8.00s) ─────────────────────────────────
      // "¿y tú?" above logo, "mismos gustos, mejores planes" below
      // Plus a small "únete a" inline-prefix to the left of the logo… but per spec the
      // line is "únete a [sero]". We render "únete a" centered above the logo line.
      const ctaTopA = eOut(il(6.55, 6.85, t));
      const ctaBotA = eOut(il(6.65, 6.95, t));

      if (ctaTopA > 0.01) {
        ctx.save();
        ctx.globalAlpha = ctaTopA;
        // "¿y tú?" caveat, plum, slight tilt
        ctx.font = `700 170px Caveat, "Caveat Brush", cursive`;
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `0px`;
        ctx.fillStyle = C.plum;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(CW / 2, 660);
        ctx.rotate((-2 * Math.PI) / 180);
        ctx.fillText('¿y tú?', 0, 0);
        ctx.restore();

        // "únete a" small label above the logo
        ctx.save();
        ctx.globalAlpha = ctaTopA;
        ctx.font = `600 76px Sora, system-ui, sans-serif`;
        // Open letter-spacing so the small label reads cleanly at story scale
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `2px`;
        ctx.fillStyle = C.inkSoft;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('únete a', CW / 2, 830);
        ctx.restore();
      }

      if (ctaBotA > 0.01) {
        ctx.save();
        ctx.globalAlpha = ctaBotA;
        // Two lines for readability at IG story scale
        ctx.font = `700 76px Sora, system-ui, sans-serif`;
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `0px`;
        ctx.fillStyle = C.ink;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('mismos gustos,',           CW / 2, 1250);
        ctx.fillText('mejores planes',           CW / 2, 1345);
        ctx.restore();
      }

      // Subtle breathing on the O during the final hold (after assembly done)
      if (t >= 6.60) {
        const breathe = 1 + Math.sin((t - 6.60) * 1.3) * 0.015;
        const layout = logoLayout(ctx);
        const bR = LOGO_R * breathe;
        // Re-draw a glow halo behind the O (very faint)
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.shadowColor = 'rgba(255,107,94,0.40)';
        ctx.shadowBlur  = 36;
        drawO(ctx, layout.oCX, layout.oCY, bR, LOGO_SW, 1, 0.001, true);
        ctx.restore();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, tags]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  function startAnim(canvas: HTMLCanvasElement) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const ctx = canvas.getContext('2d')!;
    startRef.current = performance.now();
    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000;
      drawFnRef.current(ctx, Math.min(t, 12));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  // ── Recording (8s sequence + 0.4s tail = 8400ms) ───────────────────────────
  function recordVideo(canvas: HTMLCanvasElement): Promise<{ url: string; ext: string; blob: Blob }> {
    // Prefer H.264 mp4 (iOS Photos / IG Stories / WhatsApp friendly).
    // Try plain `video/mp4` first — iOS Safari MediaRecorder is happy without
    // an audio codec spec since we capture a video-only stream from canvas.
    const candidates = [
      'video/mp4',
      'video/mp4;codecs=avc1',
      'video/mp4;codecs=avc1.42E01F',
      'video/mp4;codecs=h264',
      'video/webm;codecs=h264',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    let mimeType = '';
    for (const m of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        mimeType = m; break;
      }
    }
    const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';

    return new Promise<{ url: string; ext: string; blob: Blob }>((resolve, reject) => {
      let videoStream: MediaStream;
      try { videoStream = canvas.captureStream(30); }
      catch (e) { reject(e); return; }

      // Try to combine soundtrack audio (if AudioContext was unlocked earlier
      // via the quiz "Terminar" click). Falls back to silent recording if the
      // mp3 isn't ready or the context never resumed.
      const audio = createAudioStreamForRecording();
      const recordStream = audio
        ? new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audio.stream.getAudioTracks(),
          ])
        : videoStream;

      const opts: MediaRecorderOptions = mimeType
        ? { mimeType, videoBitsPerSecond: 6_000_000 }
        : { videoBitsPerSecond: 6_000_000 };
      const recorder = new MediaRecorder(recordStream, opts);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        try { audio?.stop(); } catch {}
        const outType = (mimeType.split(';')[0]) || `video/${ext}`;
        const blob = new Blob(chunks, { type: outType });
        const result = { url: URL.createObjectURL(blob), ext, blob };
        resultRef.current = result;
        try { onReadyRef.current?.(); } catch {}
        resolve(result);
      };
      recorder.onerror = (e) => reject(e);

      // Restart animation from t=0 so the recording captures the full sequence,
      // then wait 2 paint frames so the first chunk isn't blank.
      startAnim(canvas);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        try {
          recorder.start(100);
          // Start audio AT THE SAME MOMENT recording starts so the speaker
          // (HTMLAudioElement) and the recording (AudioBufferSource) are in
          // sync.
          if (audio) {
            try { audio.start(); } catch {}
          }
          setTimeout(() => {
            if (recorder.state !== 'inactive') recorder.stop();
          }, 8400);
        } catch (e) { reject(e); }
      }));
    });
  }

  // ── Mount: load fonts, start the animation AND pre-record in background ────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fontsReady = (typeof document !== 'undefined' && document.fonts)
      ? Promise.all([
          document.fonts.load('800 240px Sora'),
          document.fonts.load('800 100px Sora'),
          document.fonts.load('700 80px  Sora'),
          document.fonts.load('600 76px  Sora'),
          document.fonts.load('700 170px Caveat'),
          document.fonts.load('700 110px Caveat'),
        ]).catch(() => undefined)
      : Promise.resolve();

    fontsReady.then(() => {
      if (!canvasRef.current) return;
      // Kick off the pre-recording. startAnim is called inside recordVideo.
      // The user watches the live preview WHILE the recording runs in parallel,
      // so by the time they click "share" the blob is already prepared and
      // navigator.share() runs inside the user-gesture context.
      if (!recordingRef.current) {
        recordingRef.current = recordVideo(canvas).catch(() => {
          // Recording failed — clear the ref so a manual captureVideo() can retry
          recordingRef.current = null;
          resultRef.current = null;
          throw new Error('recording-failed');
        });
      }
    });

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Imperative handle ──────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    captureVideo() {
      // If pre-recorded already, return synchronously (gesture-context safe)
      if (resultRef.current) return Promise.resolve(resultRef.current);
      // If a pre-recording is in flight, await it
      if (recordingRef.current) return recordingRef.current;
      // Otherwise (failure / never started), kick off a fresh recording
      const canvas = canvasRef.current;
      if (!canvas) return Promise.resolve({ url: '', ext: 'webm', blob: new Blob() });
      recordingRef.current = recordVideo(canvas);
      return recordingRef.current;
    },
    getReadyVideo() {
      return resultRef.current;
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={CW}
      height={CH}
      style={{ width: 300, height: 533, borderRadius: 24, display: 'block' }}
    />
  );
});
