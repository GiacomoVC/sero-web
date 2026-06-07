'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// ─── Canvas resolution ────────────────────────────────────────────────────────
const CW = 1080;
const CH = 1920;

// ─── O ring — phase 2-4 (70% of original r=210) ──────────────────────────────
const O_CX = CW / 2;   // horizontally centered
const O_CY = 730;      // upper area — where the title text was
const O_R  = 147;      // 210 × 0.70
const O_SW = 21;       // 30  × 0.70
// Gap at 1 o'clock; 315° main | 18° gap1 | 15° detached | 12° gap2
const O_START_DEG  = -24;
const O_MAIN_DEG   = 315;
const O_GAP1_DEG   = 18;
const O_DETACH_DEG = 15;

// ─── O ring — final position (phase 5, slides down to screen center) ─────────
const O_CY_FINAL = 880;

// ─── Phase-0 chip labels (pre-made content, not user data) ────────────────────
const P0_LABELS = ['🎶 música', '📺 series', 'deporte', '🎬 películas', '💥 anime', '📚 libros'];

// Tracks: startX (neg = left edge, >CW = right edge), yFrac, dir (+1=L→R / -1=R→L), delay, dur
const P0_TRACKS = [
  { sX: -460, yF: 0.24, d:  1, dl: 0.00, dr: 5.2 },
  { sX: CW+60, yF: 0.37, d: -1, dl: 0.28, dr: 5.0 },
  { sX: -460, yF: 0.52, d:  1, dl: 0.55, dr: 5.4 },
  { sX: CW+60, yF: 0.64, d: -1, dl: 0.12, dr: 5.1 },
  { sX: -460, yF: 0.76, d:  1, dl: 0.42, dr: 4.8 },
  { sX: CW+60, yF: 0.43, d: -1, dl: 0.70, dr: 5.3 },
];

// ─── User interest chips — below O ring (4 chips, 2 col × 2 row) ─────────────
// ax = anchor x (right-edge for align:'right', left-edge for align:'left')
const P2_LAYOUT = [
  { align: 'right' as const, ax: 520, y: O_CY + O_R + 130, from: 'left'  },
  { align: 'left'  as const, ax: 560, y: O_CY + O_R + 130, from: 'right' },
  { align: 'right' as const, ax: 520, y: O_CY + O_R + 295, from: 'left'  },
  { align: 'left'  as const, ax: 560, y: O_CY + O_R + 295, from: 'right' },
];

// ─── Spark colors ─────────────────────────────────────────────────────────────
const SPARK_COLS = ['#FF6B5E', '#FF8A3D', '#FFD166', '#FF6B5E', '#FF8A3D'];

// ─── Math helpers ─────────────────────────────────────────────────────────────
const deg   = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const il    = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const eoc   = (t: number) => 1 - (1 - t) ** 3;
const eio   = (t: number) => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;

// ─── Rounded rect ─────────────────────────────────────────────────────────────
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);                    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);                        ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);                        ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxPx: number): string {
  if (ctx.measureText(text).width <= maxPx) return text;
  let s = text;
  while (s.length > 0 && ctx.measureText(s + '…').width > maxPx) s = s.slice(0, -1);
  return s + '…';
}

// ─── Background + blobs ───────────────────────────────────────────────────────
// Blobs are static in phases 0-4, then gently animate from t=6.5 onward
function drawBg(ctx: CanvasRenderingContext2D, t = 0) {
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, CW, CH);

  const bt  = Math.max(0, t - 6.5);  // blob-time: starts moving at phase 5
  const amp = Math.min(bt / 1.0, 1); // smooth ramp-in so blobs don't jump

  const b1x = (CW - 120) + Math.sin(bt * 1.4) * 120 * amp;
  const b1y = -100        + Math.cos(bt * 1.0) *  80 * amp;
  const g1  = ctx.createRadialGradient(b1x, b1y, 0, b1x, b1y, 720);
  g1.addColorStop(0, 'rgba(255,107,94,0.26)'); g1.addColorStop(1, 'rgba(255,107,94,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, CW, CH);

  const b2x = -80 + Math.sin(bt * 0.9 + 1.0) *  80 * amp;
  const b2y = CH  + Math.cos(bt * 1.2 + 0.5) * 100 * amp;
  const g2  = ctx.createRadialGradient(b2x, b2y, 0, b2x, b2y, 620);
  g2.addColorStop(0, 'rgba(91,45,130,0.16)'); g2.addColorStop(1, 'rgba(91,45,130,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, CW, CH);
}

// ─── O ring ───────────────────────────────────────────────────────────────────
function drawOring(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, sw: number,
  progress: number,         // 0→1 draw-in fraction
  alpha = 1, glow = false,
) {
  if (alpha <= 0 || progress <= 0) return;
  const C       = 2 * Math.PI * r;
  const mainLen = (O_MAIN_DEG   / 360) * C;
  const detLen  = (O_DETACH_DEG / 360) * C;
  const drawn   = progress * (mainLen + detLen);
  const a0 = deg(O_START_DEG);
  const a1 = a0 + deg(O_MAIN_DEG);
  const a2 = a1 + deg(O_GAP1_DEG);

  ctx.save();
  ctx.globalAlpha = alpha;
  if (glow) { ctx.shadowColor = 'rgba(255,107,94,0.55)'; ctx.shadowBlur = 52; }
  const gr = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  gr.addColorStop(0, '#FF6B5E'); gr.addColorStop(1, '#FF8A3D');
  ctx.strokeStyle = gr; ctx.lineWidth = sw; ctx.lineCap = 'round';

  const md = Math.min(drawn, mainLen);
  if (md > 0) { ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + (md / C) * 2 * Math.PI, false); ctx.stroke(); }
  if (drawn > mainLen) {
    const dd = Math.min(drawn - mainLen, detLen);
    ctx.beginPath(); ctx.arc(cx, cy, r, a2, a2 + (dd / C) * 2 * Math.PI, false); ctx.stroke();
  }
  ctx.restore();
}

// ─── Pill chip ────────────────────────────────────────────────────────────────
function drawChip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, text: string,
  alpha = 1, align: 'left' | 'right' = 'left',
  maxText = 400, fontSize = 44, glowColor?: string,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `600 ${fontSize}px Sora, sans-serif`;
  const fitted = fitText(ctx, text, maxText);
  const tw = ctx.measureText(fitted).width;
  const pX = 36, pY = 24, cW = tw + pX * 2, cH = fontSize + pY * 2, cr = cH / 2;
  const lx = align === 'left' ? x : x - cW;
  const ly = y - cH / 2;

  if (glowColor) { ctx.shadowColor = glowColor; ctx.shadowBlur = 52; }
  ctx.fillStyle = 'white'; rr(ctx, lx, ly, cW, cH, cr); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(24,24,27,0.09)'; ctx.lineWidth = 2; rr(ctx, lx, ly, cW, cH, cr); ctx.stroke();
  ctx.fillStyle = '#18181B'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(fitted, lx + pX, y);
  ctx.restore();
}

// ─── Wordmark: "ser" slides in from left to align with the O ring ─────────────
// oCX/oCY: current O center (the O is drawn separately; this just draws "ser")
// serProg: 0 = "ser" off left edge, 1 = in position
function drawSer(
  ctx: CanvasRenderingContext2D,
  oCX: number, oCY: number, oR: number,
  serProg: number, alpha = 1, glow = false,
) {
  if (alpha <= 0) return;
  // Font size derived so that the O radius looks proportional to the logo
  // In the logo: r/fontSize ≈ 10.5/42 = 0.25. So fontSize = oR / 0.25
  const fSize   = Math.round(oR / 0.25);      // e.g. r=147 → 588 … too big
  // Actually use the same ratio as the SVG logo (VH=46, r=10.5 → r is ~0.23×VH, text 42px)
  // For a clean proportional match: fontSize = oR * (42 / 10.5) = oR * 4
  const fs = Math.round(oR * 4);              // 147 × 4 = 588 — also huge for the card
  // Let's cap it. The original logo at display size: font=42, r=10.5. Scale by oR/10.5:
  const scale   = oR / 10.5;
  const fSizePx = Math.round(42 * scale);     // 42 × 14 = 588 — still big
  // That's 1080-canvas scale. The "ser" text in the logo is 42px at display = 168px at 4× canvas.
  // At canvas scale the O is r=147 = 10.5 × 14. So fontSize should be 42 × 14 = 588? No...
  // Original logo: viewBox 170×46, r=10.5, fontSize=42 → displayed at ~110px wide = 440px canvas
  // At 440px canvas width, scale = 440/170 = 2.59 → fontSize = 42×2.59 = 109 canvas px, r=10.5×2.59=27
  // But O_R=147 here. Scale relative to r: 147/27 = 5.44 → fontSize = 109×5.44 = 593. Still big.
  // Actually, we do NOT want the logo-sized "ser" to match a 147px-radius O.
  // The O here is MUCH larger than a logo O. "ser" should visually form a LOGO, not a giant display.
  // The user said the O ring is 70% of the original card size, but the LOGO version should still
  // have the correct logo proportions. Let's draw the complete logo at a fixed sensible size centered
  // where the O is — same as what we had before: fSize=168 canvas px.
  const lFSize  = 168;
  const baseline = oCY + lFSize * 0.365; // O center aligns with cap-height midpoint

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `500 ${lFSize}px Sora, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';

  const serW  = ctx.measureText('ser').width;
  const oGap  = 12;
  const logoR = lFSize * 0.25;                // logo-O radius at this font size ≈ 42px
  const logoSW = lFSize * 0.062;              // proportional stroke width
  const totalW = serW + oGap + logoR * 2;
  const logoX  = (CW - totalW) / 2;

  // Slide "ser" from left
  const offX = (1 - eoc(serProg)) * -(logoX + serW + 300);

  if (glow) { ctx.shadowColor = 'rgba(255,107,94,0.55)'; ctx.shadowBlur = 50; }
  ctx.fillStyle = 'rgba(24,24,27,1)';
  ctx.fillText('ser', logoX + offX, baseline);
  ctx.restore();

  // Logo-sized O ring (replaces the big canvas O once fully assembled)
  const logoCX = logoX + serW + oGap + logoR;
  const logoCY = baseline - lFSize * 0.365;
  drawOring(ctx, logoCX, logoCY, logoR, logoSW, 1, alpha, glow);
}

// ─── Spark particles ──────────────────────────────────────────────────────────
interface Particle { x: number; y: number; vx: number; vy: number; r: number; color: string; dl: number; life: number; }

function seedParticles(cx: number, cy: number): Particle[] {
  // Deterministic-ish but visually random
  return Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2 + (i % 3) * 0.4;
    const speed = 500 + (i % 5) * 180;
    return {
      x: cx + Math.cos(angle + 0.7) * 140,
      y: cy + Math.sin(angle + 0.3) * 80,
      vx: Math.cos(angle) * speed * (0.7 + (i % 4) * 0.15),
      vy: Math.sin(angle) * speed * (0.7 + (i % 4) * 0.15) - 200,
      r:  8 + (i % 5) * 5,
      color: SPARK_COLS[i % SPARK_COLS.length],
      dl:   (i % 6) * 0.06,
      life: 0.5 + (i % 4) * 0.22,
    };
  });
}

function drawSparks(ctx: CanvasRenderingContext2D, particles: Particle[], age: number) {
  for (const p of particles) {
    const a = age - p.dl;
    if (a < 0 || a > p.life) continue;
    const frac  = a / p.life;
    const alpha = 1 - frac;
    const px    = p.x + p.vx * a;
    const py    = p.y + p.vy * a + 280 * a * a;  // gentle gravity
    const radius = p.r * (1 - frac * 0.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Public handle ─────────────────────────────────────────────────────────────
export interface StoryCardHandle {
  captureVideo(): Promise<{ url: string; ext: string }>;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const StoryCard = forwardRef<
  StoryCardHandle,
  { firstName: string; tags: string[]; shareUrl: string }
>(function StoryCard({ firstName, tags, shareUrl }, ref) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>();
  const startRef    = useRef<number>(0);
  const drawFnRef   = useRef<(ctx: CanvasRenderingContext2D, t: number) => void>(() => {});
  const sparksRef   = useRef<Particle[]>([]);

  // Prepare resolved labels (user tags + fallback)
  const FALLBACK = ['música', 'series', 'películas', 'algo que amas'];
  const userLabels = [
    ...tags.filter(Boolean).slice(0, 4),
    ...FALLBACK,
  ].slice(0, 4);

  // Seed sparks once (not in render path — deterministic)
  if (sparksRef.current.length === 0) {
    sparksRef.current = seedParticles(CW / 2, CH * 0.48);
  }

  // ── Update drawFn whenever props change ──────────────────────────────────────
  useEffect(() => {
    drawFnRef.current = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.clearRect(0, 0, CW, CH);
      drawBg(ctx, t);

      // ── Phase 0 (0 – 3.0 s): title text + floating pre-made chips ─────────
      if (t < 3.0) {
        const titleA = eoc(il(0, 0.5, t));

        // Title — 3 lines, centered, rgba(24,24,27,0.7)
        ctx.save();
        ctx.globalAlpha = titleA;
        ctx.textAlign   = 'center';
        ctx.font = `800 96px Sora, sans-serif`;
        ctx.fillStyle   = 'rgba(24,24,27,0.7)';
        ctx.textBaseline = 'middle';
        const ly = O_CY;  // same vertical area as the O will be
        ctx.fillText('Los planes que', CW / 2, ly - 130);

        // "amaría [name]" — name in coral
        const prefix   = 'amaría ';
        const prefixW  = ctx.measureText(prefix).width;
        const nameMax  = CW - 96 * 2 - prefixW;
        const fname    = fitText(ctx, firstName || 'tú', nameMax);
        const nameW    = ctx.measureText(fname).width;
        const lineW    = prefixW + nameW;
        const lineX    = CW / 2 - lineW / 2;
        ctx.textAlign  = 'left';
        ctx.fillStyle  = 'rgba(24,24,27,0.7)';
        ctx.fillText(prefix, lineX, ly);
        ctx.fillStyle  = '#FF6B5E';
        ctx.fillText(fname, lineX + prefixW, ly);

        ctx.textAlign  = 'center';
        ctx.fillStyle  = 'rgba(24,24,27,0.7)';
        ctx.fillText('son…', CW / 2, ly + 130);
        ctx.restore();

        // Floating chips — run throughout phase 0, fade in/out at edges
        P0_TRACKS.forEach((tr, i) => {
          const label = P0_LABELS[i % P0_LABELS.length];
          const lt    = t - tr.dl;
          if (lt <= 0 || lt >= tr.dr) return;
          const prog  = lt / tr.dr;
          const edgeA = prog < 0.08 ? prog / 0.08 : prog > 0.88 ? (1 - prog) / 0.12 : 1;
          const cx2   = tr.sX + tr.d * (CW + 520) * prog;
          drawChip(ctx, cx2, CH * tr.yF, label, edgeA * titleA, 'left', 460, 44);
        });
      }

      // ── Phase 1 (3.0 – 3.5 s): everything fades out ──────────────────────
      if (t >= 3.0 && t < 3.5) {
        const fadeA = 1 - eoc(il(3.0, 3.5, t));

        ctx.save();
        ctx.globalAlpha = fadeA;
        ctx.textAlign   = 'center';
        ctx.font = `800 96px Sora, sans-serif`;
        ctx.fillStyle   = 'rgba(24,24,27,0.7)';
        ctx.textBaseline = 'middle';
        const ly = O_CY;
        ctx.fillText('Los planes que', CW / 2, ly - 130);
        const prefix  = 'amaría ';
        const pw      = ctx.measureText(prefix).width;
        const fn      = fitText(ctx, firstName || 'tú', CW - 192 - pw);
        const lw      = pw + ctx.measureText(fn).width;
        const lx2     = CW / 2 - lw / 2;
        ctx.textAlign = 'left';
        ctx.fillText(prefix, lx2, ly);
        ctx.fillStyle = '#FF6B5E';
        ctx.fillText(fn, lx2 + pw, ly);
        ctx.fillStyle = 'rgba(24,24,27,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('son…', CW / 2, ly + 130);
        ctx.restore();

        // Chips also fade
        P0_TRACKS.forEach((tr, i) => {
          const lt   = t - tr.dl;
          if (lt <= 0 || lt >= tr.dr) return;
          const prog = lt / tr.dr;
          const cx2  = tr.sX + tr.d * (CW + 520) * prog;
          drawChip(ctx, cx2, CH * tr.yF, P0_LABELS[i % P0_LABELS.length], fadeA, 'left', 460, 44);
        });
      }

      // ── Phase 2 (3.5 – 4.5 s): O draws in + user chips appear below ──────
      if (t >= 3.5 && t < 4.5) {
        // O draw-in over 0.8 s
        const oP = eio(il(3.5, 4.3, t));
        drawOring(ctx, O_CX, O_CY, O_R, O_SW, oP);

        // User chips stagger in from t=3.5, one every 0.25 s
        P2_LAYOUT.forEach((slot, i) => {
          const entryT = 3.5 + i * 0.25;
          const entA   = eoc(il(entryT, entryT + 0.35, t));
          if (entA <= 0) return;
          const label  = userLabels[i] ?? '';
          const inward = slot.from === 'left' ? -1 : 1;
          const offX   = (1 - eoc(il(entryT, entryT + 0.4, t))) * inward * 320;
          drawChip(ctx, slot.ax + offX, slot.y, label, entA, slot.align, 270, 44);
        });
      }

      // ── Phase 3 (4.5 – 5.0 s): chips glow → "ser" slides in → logo glow ──
      if (t >= 4.5 && t < 5.0) {
        // Big O stays (fully drawn)
        const oGlow = t < 4.8;
        drawOring(ctx, O_CX, O_CY, O_R, O_SW, 1, 1, oGlow);

        // User chips: hold position, with glow fading out
        const chipGlowA = 1 - il(4.5, 4.8, t);
        P2_LAYOUT.forEach((slot, i) => {
          const label = userLabels[i] ?? '';
          const glow  = chipGlowA > 0.02 ? 'rgba(255,107,94,0.5)' : undefined;
          drawChip(ctx, slot.ax, slot.y, label, 1, slot.align, 270, 44, glow);
        });

        // "ser" slides in from t=4.75
        const serP    = eoc(il(4.75, 5.0, t));
        const logoGlow = serP > 0.9;
        if (serP > 0) {
          // Hide the big O ring as the logo O takes over
          // (drawSer draws a logo-sized O aligned to serW + gap)
          drawSer(ctx, O_CX, O_CY, O_R, serP, 1, logoGlow);
        } else {
          drawOring(ctx, O_CX, O_CY, O_R, O_SW, 1, 1, oGlow);
        }
      }

      // ── Phase 4 (5.0 – 6.5 s): chips exit → question text + sparks ────────
      if (t >= 5.0 && t < 6.5) {
        // Logo stays (ser + O)
        const logoGlow = t < 5.3;
        drawSer(ctx, O_CX, O_CY, O_R, 1, 1, logoGlow);

        // User chips exit (5.0 – 5.5 s) back toward their entry side
        const exitP = eoc(il(5.0, 5.5, t));
        if (exitP < 1) {
          P2_LAYOUT.forEach((slot, i) => {
            const label  = userLabels[i] ?? '';
            const exitDir = slot.from === 'left' ? -1 : 1;  // reverse to entry side
            const offX   = exitP * exitDir * (CW + 300);
            drawChip(ctx, slot.ax + offX, slot.y, label, 1 - exitP, slot.align, 270, 44);
          });
        }

        // Question text rises from bottom (5.5 – 6.5 s, 1 s)
        if (t >= 5.5) {
          const qP    = il(5.5, 6.5, t);
          const qEase = eoc(qP);
          const yOff  = (1 - qEase) * CH * 0.42;   // starts 42% of height below target
          const qA    = eoc(il(5.5, 5.9, t));
          const qCY   = CH * 0.47;

          ctx.save();
          ctx.globalAlpha = qA;
          ctx.font = `800 80px Sora, sans-serif`;
          ctx.fillStyle   = 'rgba(24,24,27,0.7)';
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('¿Qué tendría',     CW / 2, qCY - 55 + yOff);
          ctx.fillText('tu plan perfecto?', CW / 2, qCY + 55 + yOff);
          ctx.restore();

          // Sparks burst when text first appears
          const sparkAge = t - 5.5;
          if (sparkAge < 1.4) drawSparks(ctx, sparksRef.current, sparkAge);
        }
      }

      // ── Phase 5 (6.5 – 7.5 s): text fades, logo slides to center, tagline ─
      if (t >= 6.5 && t < 7.5) {
        // Question text fades out (6.5 – 7.0 s)
        const qFadeA = 1 - eoc(il(6.5, 7.0, t));
        if (qFadeA > 0.01) {
          ctx.save();
          ctx.globalAlpha = qFadeA;
          ctx.font = `800 80px Sora, sans-serif`;
          ctx.fillStyle   = 'rgba(24,24,27,0.7)';
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'middle';
          const qCY = CH * 0.47;
          ctx.fillText('¿Qué tendría',     CW / 2, qCY - 55);
          ctx.fillText('tu plan perfecto?', CW / 2, qCY + 55);
          ctx.restore();
        }

        // Logo slides down from O_CY to O_CY_FINAL (7.0 – 7.5 s)
        const slideP   = eio(il(7.0, 7.5, t));
        const curOCY   = O_CY + slideP * (O_CY_FINAL - O_CY);
        const logoInA  = eoc(il(6.8, 7.2, t));
        drawSer(ctx, O_CX, curOCY, O_R, 1, logoInA, true);

        // Tagline appears as logo reaches final position
        const tagA = eoc(il(7.2, 7.5, t));
        if (tagA > 0) {
          const lFSize   = 168;
          const baseline = O_CY_FINAL + lFSize * 0.365;
          ctx.save();
          ctx.globalAlpha = tagA;
          ctx.font = `700 60px Sora, sans-serif`;
          ctx.fillStyle   = '#18181B';
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Mismos gustos, mejores planes', CW / 2, baseline + 40);
          ctx.restore();
        }
      }

      // ── Final frame (7.5 s +) — held ─────────────────────────────────────
      if (t >= 7.5) {
        const lFSize   = 168;
        const baseline = O_CY_FINAL + lFSize * 0.365;

        // Logo (ser + O, with breathing O)
        // Breathing: subtle scale on O in final frame
        const breathe = 1 + Math.sin((t - 7.5) * 1.4) * 0.015;
        const bR = O_R * breathe;

        drawSer(ctx, O_CX, O_CY_FINAL, bR, 1, 1, false);

        // Tagline
        ctx.save();
        ctx.font = `700 60px Sora, sans-serif`;
        ctx.fillStyle   = '#18181B';
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Mismos gustos, mejores planes', CW / 2, baseline + 40);
        ctx.restore();

        // URL pill
        const short = shareUrl.replace(/^https?:\/\//, '');
        ctx.save();
        ctx.font = `500 38px Sora, sans-serif`;
        const fitted = fitText(ctx, short, CW - 200);
        const tw     = ctx.measureText(fitted).width;
        const pH = 76, pPad = 64, pW = tw + pPad * 2;
        const pX = (CW - pW) / 2, pY = baseline + 40 + 90;
        ctx.fillStyle = 'rgba(24,24,27,0.07)';
        rr(ctx, pX, pY, pW, pH, pH / 2); ctx.fill();
        ctx.fillStyle   = 'rgba(24,24,27,0.4)';
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fitted, CW / 2, pY + pH / 2);
        ctx.restore();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, tags, shareUrl]);

  // ── Animation loop ───────────────────────────────────────────────────────────
  function startAnim(canvas: HTMLCanvasElement) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const ctx = canvas.getContext('2d')!;
    startRef.current = performance.now();
    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000;
      drawFnRef.current(ctx, Math.min(t, 15));
      rafRef.current = requestAnimationFrame(loop);  // keep running for final-frame breathe
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    document.fonts.ready.then(() => startAnim(canvas));
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Video capture ─────────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    captureVideo() {
      const canvas = canvasRef.current;
      if (!canvas) return Promise.resolve({ url: '', ext: 'webm' });

      const mimeType = MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
      const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';

      return new Promise<{ url: string; ext: string }>((resolve) => {
        const stream   = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
          resolve({ url: URL.createObjectURL(blob), ext });
        };
        startAnim(canvas);       // restart animation from t=0
        recorder.start(100);
        setTimeout(() => recorder.stop(), 8200);  // record 8 s + buffer
      });
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={CW}
      height={CH}
      style={{ width: 270, height: 480, borderRadius: 24, display: 'block' }}
    />
  );
});
