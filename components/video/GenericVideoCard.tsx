'use client';

/**
 * Generic Instagram video card. Same visual language as the per-user
 * StoryCard (cream + confetti + Sora/Caveat + coral O), but the content is
 * a fixed 10-second narrative that sells Sero itself, not the user's tags.
 *
 * Script:
 *   Beat 1 (0.3–3.0)  "Piensa en algo que amas" + rotation (5 items)
 *   Beat 2 (3.0–4.8)  "¿Cuándo fue la última vez que se volvió un plan?"
 *   Beat 3 (4.8–6.0)  "con gente que ama lo mismo que tú"
 *   Beat 4 (6.0–7.5)  Logo "sero · lo hace realidad" assembles
 *   Beat 5 (7.5–10.0) Final hold: "tu plan, tu gente, listo 👇"
 *                     Bottom third stays clean for the IG link sticker.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createAudioStreamForRecording } from '@/lib/audioContext';

// ─── Canvas resolution ───────────────────────────────────────────────────────
const CW = 1080;
const CH = 1920;

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  cream:    '#FAF8F5',
  ink:      '#18181B',
  inkSoft:  'rgba(24,24,27,0.72)',
  coral:    '#FF6B5E',
  plum:     '#5B2D82',
  plumSoft: 'rgba(91,45,130,0.85)',
  gold:     '#FFD166',
  orange:   '#FF8A3D',
  lilac:    '#B78BB8',
  mintDot:  '#7FCFA0',
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

// ─── Hand-drawn coral underline ──────────────────────────────────────────────
function drawUnderline(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, width: number,
  color: string,
  progress: number, alpha: number,
) {
  if (progress <= 0 || alpha <= 0) return;
  const halfW = width / 2;
  const startX = cx - halfW;
  const endX   = cx + halfW;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 14;
  ctx.lineCap     = 'round';
  const STEPS = 60;
  const target = Math.floor(STEPS * progress);
  ctx.beginPath();
  for (let i = 0; i <= target; i++) {
    const tt = i / STEPS;
    const x  = (1 - tt) ** 2 * startX + 2 * (1 - tt) * tt * cx + tt ** 2 * endX;
    const yy = (1 - tt) ** 2 * (y + 4) + 2 * (1 - tt) * tt * (y - 14) + tt ** 2 * (y + 2);
    if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
  ctx.restore();
}

// ─── Coral marker highlight (brush stroke behind text) ───────────────────────
function drawMarker(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, width: number, height: number,
  color: string, alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth   = height;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - width / 2 + 10, y);
  ctx.quadraticCurveTo(cx, y - 6, cx + width / 2 - 10, y + 4);
  ctx.stroke();
  ctx.restore();
}

// ─── O ring ──────────────────────────────────────────────────────────────────
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

// ─── Logo geometry (wordmark "sero") ─────────────────────────────────────────
const LOGO_FS  = 280;
const LOGO_R   = 72;
const LOGO_SW  = 22;
const LOGO_LSP = -8;
const LOGO_SER_O_OFFSET = -10;

function logoLayout(ctx: CanvasRenderingContext2D, cy: number, fontSize = LOGO_FS, r = LOGO_R) {
  ctx.font = `800 ${fontSize}px Sora, system-ui, sans-serif`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${LOGO_LSP}px`;
  const serW   = ctx.measureText('ser').width;
  const totalW = serW + LOGO_SER_O_OFFSET + r * 2;
  const serX   = (CW - totalW) / 2;
  const oCX    = serX + serW + LOGO_SER_O_OFFSET + r;
  const baseline = cy + r;
  return { serX, oCX, oCY: cy, baseline, serW, fontSize: fontSize, r };
}

function drawSer(
  ctx: CanvasRenderingContext2D, x: number, baseline: number, fontSize: number, alpha: number, glow = false,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `800 ${fontSize}px Sora, system-ui, sans-serif`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${LOGO_LSP}px`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';
  if (glow) { ctx.shadowColor = 'rgba(24,24,27,0.18)'; ctx.shadowBlur = 30; }
  ctx.fillStyle = C.ink;
  ctx.fillText('ser', x, baseline);
  ctx.restore();
}

// ─── Rotation slot machine items ─────────────────────────────────────────────
const ROTATION = ['Un artista', 'Una serie', 'Un libro'];

// ─── Timeline (12s total) ────────────────────────────────────────────────────
// Reading-time budget: ~0.4s per word, min 0.8s hold per short phrase.
// Each beat has internal staggered entries (no walls of text drop at once).
const T = {
  bgIn:     { s: 0.0,  e: 0.3 },
  beat1:    { s: 0.3,  e: 3.4 },    // "Piensa en algo que amas" + 3-item rotation
  rotStart: 1.4,
  rotEnd:   3.4,                     // 2.0s for 3 items = 0.67s each
  beat2:    { s: 3.3,  e: 6.0 },    // "¿Cuándo fue la última vez que se volvió un plan?"
  beat3:    { s: 5.9,  e: 8.1 },    // "con gente que ama lo mismo que tú"
  beat4:    { s: 8.0,  e: 9.9 },    // logo assembly + "lo hace realidad" hold
  beat5:    { s: 9.85, e: 12.0 },   // "tu plan, tu gente, listo 👇" + clean sticker zone
};

const RECORDING_MS = 12400;        // 12s sequence + 0.4s tail

// ─── Public handle ───────────────────────────────────────────────────────────
export interface GenericVideoCardHandle {
  captureVideo(): Promise<{ url: string; ext: string; blob: Blob }>;
  getReadyVideo(): { url: string; ext: string; blob: Blob } | null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const GenericVideoCard = forwardRef<
  GenericVideoCardHandle,
  { onReady?: () => void }
>(function GenericVideoCard({ onReady }, ref) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>();
  const startRef     = useRef<number>(0);
  const drawFnRef    = useRef<(ctx: CanvasRenderingContext2D, t: number) => void>(() => {});
  const recordingRef = useRef<Promise<{ url: string; ext: string; blob: Blob }> | null>(null);
  const resultRef    = useRef<{ url: string; ext: string; blob: Blob } | null>(null);
  const onReadyRef   = useRef<typeof onReady>(onReady);
  onReadyRef.current = onReady;

  // ── Draw function ────────────────────────────────────────────────────────
  useEffect(() => {
    drawFnRef.current = (ctx: CanvasRenderingContext2D, t: number) => {
      // Reset sticky letterSpacing
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `0px`;

      // ── Background ──────────────────────────────────────────────────────
      ctx.fillStyle = C.cream;
      ctx.fillRect(0, 0, CW, CH);
      const confA = eOut(il(T.bgIn.s, T.bgIn.e + 0.1, t));
      drawConfetti(ctx, t, confA);

      // ─────────────────────────────────────────────────────────────────────
      // BEAT 1 (0.3 – 2.5): mirror of the landing hero.
      //   - "Piensa en algo que amas" — Sora 800 ink, "amas" plum-underlined
      //   - Rotating slot machine coral text (matches the landing exactly)
      //   - Equal sizing line-to-line; underline is the emphasis (not font size)
      // ─────────────────────────────────────────────────────────────────────
      if (t < T.beat1.e + 0.2) {
        const inA  = eOut(il(T.beat1.s, T.beat1.s + 0.4, t));
        const outA = 1 - eOut(il(T.beat1.e, T.beat1.e + 0.2, t));
        const beatA = inA * outA;

        if (beatA > 0.01) {
          ctx.save();
          ctx.globalAlpha = beatA;
          ctx.font = `800 100px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Piensa en algo que', CW / 2, 660);
          ctx.fillText('amas',               CW / 2, 800);
          // Plum underline under "amas" (matches <Highlight color="plum">),
          // draws AFTER both lines are settled so the user reads first.
          const amasW = ctx.measureText('amas').width;
          const ulP = eOut(il(1.0, 1.40, t));
          if (ulP > 0) {
            drawUnderline(ctx, CW / 2, 875, amasW + 50, C.plum, ulP, beatA);
          }
          ctx.restore();
        }

        // Rotation slot machine — Sora 800 coral, same size as the headline.
        // Each item: ~0.67s total (scale in / hold / fade out).
        if (t >= T.rotStart && t < T.rotEnd + 0.4) {
          const rotT = (t - T.rotStart) / (T.rotEnd - T.rotStart);
          const idx = Math.min(Math.floor(rotT * ROTATION.length), ROTATION.length - 1);
          const itemT = rotT * ROTATION.length - idx;
          const itemA = beatA * (
            itemT < 0.18 ? eOut(itemT / 0.18) :
            itemT > 0.83 ? 1 - eOut((itemT - 0.83) / 0.17) :
            1
          );
          if (itemA > 0.01) {
            ctx.save();
            ctx.globalAlpha = itemA;
            ctx.font = `800 100px Sora, system-ui, sans-serif`;
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
            ctx.fillStyle = C.coral;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const slideY = (1 - eOut(Math.min(itemT * 5, 1))) * 36;
            ctx.fillText(ROTATION[idx], CW / 2, 1060 + slideY);
            ctx.restore();
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // BEAT 2 (2.4 – 4.3): mirror of the landing hero SUBTITLE.
      //   - All lines same Sora 700/800 ink (no Caveat, no size jumps)
      //   - Coral marker behind "se volvió un plan?" — matches
      //     <Highlight variant="marker" color="coral"> on the landing
      //   - Lines stagger in (0.2s apart), shared fade-out.
      // ─────────────────────────────────────────────────────────────────────
      if (t >= T.beat2.s && t < T.beat2.e + 0.3) {
        const outA = 1 - eOut(il(T.beat2.e - 0.3, T.beat2.e, t));
        const l1A = eOut(il(T.beat2.s,         T.beat2.s + 0.30, t)) * outA;
        const l2A = eOut(il(T.beat2.s + 0.20,  T.beat2.s + 0.50, t)) * outA;
        const l3A = eOut(il(T.beat2.s + 0.45,  T.beat2.s + 0.80, t)) * outA;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Line 1: "¿Cuándo fue" — Sora 700, ink
        if (l1A > 0.01) {
          ctx.globalAlpha = l1A;
          ctx.font = `700 95px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l1A) * 24;
          ctx.fillText('¿Cuándo fue', CW / 2, 700 + slide);
        }

        // Line 2: "la última vez que" — same weight, slightly softer
        if (l2A > 0.01) {
          ctx.globalAlpha = l2A;
          ctx.font = `700 95px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l2A) * 24;
          ctx.fillText('la última vez que', CW / 2, 840 + slide);
        }

        // Line 3: "se volvió un plan?" — coral marker behind (same color/role
        // as the landing hero subtitle's <Highlight variant="marker">).
        if (l3A > 0.01) {
          ctx.globalAlpha = l3A;
          ctx.font = `800 100px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1.5px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l3A) * 24;
          const lineY = 1000 + slide;
          const lineW = ctx.measureText('se volvió un plan?').width;
          drawMarker(ctx, CW / 2, lineY + 8, lineW + 30, 76, C.coral, l3A);
          ctx.fillText('se volvió un plan?', CW / 2, lineY);
        }
        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────────────
      // BEAT 3 (4.3 – 5.6): mirror of SectionFinal.
      //   "La gente que buscas / ya está buscándote" on the landing →
      //   "con gente que ama / lo mismo que tú" here.
      //   Same Sora 800 ink for both lines, plum UNDERLINE drawing under
      //   line 2 (matches <Highlight variant="underline" color="plum">).
      // ─────────────────────────────────────────────────────────────────────
      if (t >= T.beat3.s && t < T.beat3.e + 0.3) {
        const outA = 1 - eOut(il(T.beat3.e - 0.3, T.beat3.e, t));
        const l1A = eOut(il(T.beat3.s,         T.beat3.s + 0.30, t)) * outA;
        const l2A = eOut(il(T.beat3.s + 0.30,  T.beat3.s + 0.60, t)) * outA;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Line 1: "con gente que ama" — Sora 800 ink
        if (l1A > 0.01) {
          ctx.globalAlpha = l1A;
          ctx.font = `800 100px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l1A) * 24;
          ctx.fillText('con gente que ama', CW / 2, 840 + slide);
        }

        // Line 2: "lo mismo que tú" — Sora 800 ink + plum underline drawing in
        if (l2A > 0.01) {
          ctx.globalAlpha = l2A;
          ctx.font = `800 100px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l2A) * 24;
          const lineY = 990 + slide;
          ctx.fillText('lo mismo que tú', CW / 2, lineY);
          // Underline draws shortly after the text settles
          const ulP = eOut(il(T.beat3.s + 0.60, T.beat3.s + 1.00, t));
          if (ulP > 0) {
            const lineW = ctx.measureText('lo mismo que tú').width;
            drawUnderline(ctx, CW / 2, lineY + 70, lineW + 50, C.plum, ulP, l2A);
          }
        }
        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────────────
      // BEAT 4 (8.0 – 9.9): Logo "sero" assembles + "lo hace realidad"
      // ≈0.6s hold on "lo hace realidad" before beat 5 takes over.
      // ─────────────────────────────────────────────────────────────────────
      const BIG_CX = CW / 2;
      const BIG_CY = 940;
      const BIG_R  = 230;
      const BIG_SW = 34;

      const bigDrawP = eOut(il(8.00, 8.50, t));
      const morphP   = eInOut(il(8.50, 8.90, t));
      const serP     = eOut(il(8.55, 8.95, t));
      const taglineP = eOut(il(8.95, 9.25, t));
      // "lo hace realidad" then holds 9.25 → 9.85 before beat 5 begins.

      // ── BEAT 5 transform: the whole logo cluster shrinks + slides up at 7.85+
      // so we keep room for "tu plan, tu gente, listo 👇" below it.
      const beat5P = eInOut(il(T.beat5.s, T.beat5.s + 0.5, t));
      const logoFinalCY = BIG_CY * (1 - beat5P) + 350 * beat5P;
      const logoFinalScale = 1 * (1 - beat5P) + 0.6 * beat5P;

      if (bigDrawP > 0.01) {
        const layoutR   = LOGO_R * logoFinalScale;
        const layoutFS  = LOGO_FS * logoFinalScale;
        const layout    = logoLayout(ctx, logoFinalCY, layoutFS, layoutR);
        const targetCX  = layout.oCX;
        const targetCY  = layout.oCY;
        const curCX     = BIG_CX + (targetCX - BIG_CX) * morphP;
        const curCY     = BIG_CY + (targetCY - BIG_CY) * morphP;
        const curR      = BIG_R  + (layoutR  - BIG_R)  * morphP;
        const curSW     = BIG_SW + (LOGO_SW * logoFinalScale - BIG_SW) * morphP;

        const glowFlash = t >= 8.95 && t < 9.15;
        const glow      = (morphP < 0.2) || glowFlash;

        // Draw 'ser' first, then O on top (matches StoryCard z-order)
        if (serP > 0) {
          const serX = -300 + (layout.serX - (-300)) * serP;
          drawSer(ctx, serX, layout.baseline, layout.fontSize, serP, glowFlash);
        }
        drawO(ctx, curCX, curCY, curR, curSW, bigDrawP, 1, glow);

        // "lo hace realidad" subtitle (appears at 7.3+)
        if (taglineP > 0.01) {
          ctx.save();
          ctx.globalAlpha = taglineP;
          ctx.font = `600 ${Math.round(64 * (0.85 + 0.15 * (1 - beat5P)))}px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `1px`;
          ctx.fillStyle = C.plum;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('lo hace realidad', CW / 2, layout.baseline + 100);
          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // BEAT 5 (7.85 – 10.0): final hold — "tu plan, tu gente, listo 👇"
      // Lines stagger in. Smaller fonts + smaller emoji push the clean zone
      // (y > 1200) to ≈700px tall so the user can drop the IG link sticker
      // below without overlapping anything.
      // ─────────────────────────────────────────────────────────────────────
      if (t >= T.beat5.s) {
        const l1A = eOut(il(T.beat5.s + 0.10, T.beat5.s + 0.40, t));
        const l2A = eOut(il(T.beat5.s + 0.25, T.beat5.s + 0.55, t));
        const l3A = eOut(il(T.beat5.s + 0.40, T.beat5.s + 0.70, t));

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // "tu plan," — Sora 800 90px ink
        if (l1A > 0.01) {
          ctx.globalAlpha = l1A;
          ctx.font = `800 90px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l1A) * 22;
          ctx.fillText('tu plan,', CW / 2, 700 + slide);
        }

        // "tu gente," — Sora 800 90px ink
        if (l2A > 0.01) {
          ctx.globalAlpha = l2A;
          ctx.font = `800 90px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-1px`;
          ctx.fillStyle = C.ink;
          const slide = (1 - l2A) * 22;
          ctx.fillText('tu gente,', CW / 2, 830 + slide);
        }

        // "listo" — Sora 800 110px coral with subtle marker
        if (l3A > 0.01) {
          ctx.globalAlpha = l3A;
          ctx.font = `800 110px Sora, system-ui, sans-serif`;
          (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `-2px`;
          ctx.fillStyle = C.coral;
          const slide = (1 - l3A) * 22;
          const lineY = 980 + slide;
          ctx.fillText('listo', CW / 2, lineY);
        }
        ctx.restore();

        // 👇 emoji — bounces in 0.6s after beat 5 starts; smaller (190px)
        const emojiP = eBack(il(T.beat5.s + 0.60, T.beat5.s + 1.00, t));
        const emojiA = eOut(il(T.beat5.s + 0.60, T.beat5.s + 0.90, t));
        if (emojiA > 0.01 && emojiP > 0.01) {
          ctx.save();
          ctx.globalAlpha = emojiA;
          ctx.translate(CW / 2, 1140);
          ctx.scale(emojiP, emojiP);
          ctx.font = `190px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👇', 0, 0);
          ctx.restore();
        }

        // (Bottom area y > 1240 stays clean — ~680px tall — for the IG link
        // sticker the user adds after posting.)
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animation loop ─────────────────────────────────────────────────────────
  function startAnim(canvas: HTMLCanvasElement) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const ctx = canvas.getContext('2d')!;
    startRef.current = performance.now();
    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000;
      drawFnRef.current(ctx, Math.min(t, 14));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  // ── Recording ──────────────────────────────────────────────────────────────
  function recordVideo(canvas: HTMLCanvasElement): Promise<{ url: string; ext: string; blob: Blob }> {
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

      startAnim(canvas);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        try {
          recorder.start(100);
          if (audio) { try { audio.start(); } catch {} }
          setTimeout(() => {
            if (recorder.state !== 'inactive') recorder.stop();
          }, RECORDING_MS);
        } catch (e) { reject(e); }
      }));
    });
  }

  // ── Mount: load fonts, then start the silent preview loop ──────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fontsReady = (typeof document !== 'undefined' && document.fonts)
      ? Promise.all([
          document.fonts.load('800 200px Sora'),
          document.fonts.load('800 130px Sora'),
          document.fonts.load('700 130px Sora'),
          document.fonts.load('600 100px Sora'),
          document.fonts.load('700 170px Caveat'),
        ]).catch(() => undefined)
      : Promise.resolve();
    fontsReady.then(() => {
      if (!canvasRef.current) return;
      startAnim(canvas);
    });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Imperative handle ──────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    captureVideo() {
      if (resultRef.current) return Promise.resolve(resultRef.current);
      if (recordingRef.current) return recordingRef.current;
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
