'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// ─── Canvas resolution (displayed at 270×480, recorded at full res) ──────────
const CW = 1080;
const CH = 1920;

// ─── O ring parameters (full canvas scale) ───────────────────────────────────
const O_CX = CW / 2;
const O_CY = 830;
const O_R  = 210;
const O_SW = 30;
// Angles: 315° main arc | 18° gap1 | 15° detached | 12° gap2
// In canvas convention (0 = 3 o'clock, clockwise positive):
// Gap is at ~1 o'clock → rotation of -24° from start
const O_START_DEG    = -24;
const O_MAIN_DEG     = 315;
const O_GAP1_DEG     = 18;
const O_DETACH_DEG   = 15;

// ─── Easing & math helpers ───────────────────────────────────────────────────
const deg   = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const il    = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1); // invlerp
const eoc   = (t: number) => 1 - Math.pow(1 - t, 3);           // ease-out cubic
const eio   = (t: number) => t < 0.5 ? 2*t*t : 1-((-2*t+2)**2)/2; // ease-in-out

// ─── Rounded rect helper ─────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// ─── Fit text to a max pixel width (truncates with ellipsis) ─────────────────
function fitText(ctx: CanvasRenderingContext2D, text: string, maxPx: number): string {
  if (ctx.measureText(text).width <= maxPx) return text;
  let s = text;
  while (s.length > 0 && ctx.measureText(s + '…').width > maxPx) s = s.slice(0, -1);
  return s + '…';
}

// ─── Draw the Sero O ring ────────────────────────────────────────────────────
function drawO(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, sw: number,
  progress: number, // 0→1 draw-in
  alpha = 1,
  glow  = false,
) {
  if (alpha <= 0 || progress <= 0) return;

  const C    = 2 * Math.PI * r;
  const mainLen   = (O_MAIN_DEG   / 360) * C;
  const detachLen = (O_DETACH_DEG / 360) * C;
  const totalDraw = mainLen + detachLen;
  const drawn     = progress * totalDraw;

  const a0 = deg(O_START_DEG);
  const a1 = a0 + deg(O_MAIN_DEG);                    // end of main arc
  const a2 = a1 + deg(O_GAP1_DEG);                    // start of detached
  const a3 = a2 + deg(O_DETACH_DEG);                  // end of detached (unused but documented)
  void a3;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (glow) {
    ctx.shadowColor = 'rgba(255,107,94,0.45)';
    ctx.shadowBlur  = 40;
  }

  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, '#FF6B5E');
  grad.addColorStop(1, '#FF8A3D');
  ctx.strokeStyle = grad;
  ctx.lineWidth   = sw;
  ctx.lineCap     = 'round';

  // Main arc
  const mainDrawn = Math.min(drawn, mainLen);
  if (mainDrawn > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, a0, a0 + (mainDrawn / C) * 2 * Math.PI, false);
    ctx.stroke();
  }

  // Detached segment (only once main arc is fully drawn)
  if (drawn > mainLen) {
    const detachDrawn = Math.min(drawn - mainLen, detachLen);
    ctx.beginPath();
    ctx.arc(cx, cy, r, a2, a2 + (detachDrawn / C) * 2 * Math.PI, false);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Draw a text chip ────────────────────────────────────────────────────────
// align: 'left' → x is left edge; 'right' → x is right edge
function drawChip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string,
  alpha   = 1,
  align   : 'left' | 'right' = 'left',
  maxText = 420,
  fontSize = 40,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `600 ${fontSize}px Sora, sans-serif`;

  const fitted = fitText(ctx, text, maxText);
  const tw = ctx.measureText(fitted).width;
  const padX = 36, padY = 22;
  const chipW = tw + padX * 2;
  const chipH = fontSize + padY * 2;
  const r = chipH / 2;

  const lx = align === 'left' ? x : x - chipW;
  const ly = y - chipH / 2;

  // Shadow
  ctx.shadowColor  = 'rgba(0,0,0,0.07)';
  ctx.shadowBlur   = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'white';
  roundRect(ctx, lx, ly, chipW, chipH, r);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Border
  ctx.strokeStyle = 'rgba(24,24,27,0.09)';
  ctx.lineWidth = 2;
  roundRect(ctx, lx, ly, chipW, chipH, r);
  ctx.stroke();

  // Text
  ctx.fillStyle   = '#18181B';
  ctx.textBaseline = 'middle';
  ctx.textAlign   = 'left';
  ctx.fillText(fitted, lx + padX, y);

  ctx.restore();
}

// ─── Draw background + blobs ─────────────────────────────────────────────────
function drawBg(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, CW, CH);

  // Coral blob top-right
  const g1 = ctx.createRadialGradient(CW - 120, -120, 0, CW - 120, -120, 680);
  g1.addColorStop(0, 'rgba(255,107,94,0.24)');
  g1.addColorStop(1, 'rgba(255,107,94,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, CW, CH);

  // Plum blob bottom-left
  const g2 = ctx.createRadialGradient(0, CH, 0, 0, CH, 580);
  g2.addColorStop(0, 'rgba(91,45,130,0.15)');
  g2.addColorStop(1, 'rgba(91,45,130,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, CW, CH);
}

// ─── Chip tracks for the floating-chip phase ─────────────────────────────────
const TRACKS = [
  { startX: -460, yFrac: 0.24, dir:  1, delay: 0.00, dur: 2.8 },
  { startX: CW+60, yFrac: 0.37, dir: -1, delay: 0.30, dur: 2.7 },
  { startX: -460, yFrac: 0.52, dir:  1, delay: 0.60, dur: 3.0 },
  { startX: CW+60, yFrac: 0.64, dir: -1, delay: 0.15, dur: 2.9 },
  { startX: -460, yFrac: 0.76, dir:  1, delay: 0.45, dur: 2.6 },
  { startX: CW+60, yFrac: 0.43, dir: -1, delay: 0.75, dur: 3.1 },
];

// Fallback labels used if user didn't fill in a world
const FALLBACK = ['música', 'series', 'Fórmula 1', 'Murakami', 'películas', 'viajes'];

// ─── Sero wordmark at a given center-Y baseline ──────────────────────────────
function drawWordmark(
  ctx: CanvasRenderingContext2D,
  baselineY: number,
  alpha: number,
  oGlow = false,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  const fSize  = 168;
  ctx.font     = `500 ${fSize}px Sora, sans-serif`;
  ctx.fillStyle = '#18181B';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign    = 'left';

  const serW   = ctx.measureText('ser').width;
  const oR     = 40;
  const oSW    = 10;
  const gap    = 12;    // pixel gap between 'r' end and O left edge
  const totalW = serW + gap + oR * 2;
  const startX = (CW - totalW) / 2;

  ctx.fillText('ser', startX, baselineY);

  const oCX = startX + serW + gap + oR;
  // Cap-height midpoint ≈ 0.36 × fontSize above baseline for Sora
  const oCY = baselineY - fSize * 0.36;
  drawO(ctx, oCX, oCY, oR, oSW, 1, 1, oGlow);

  ctx.restore();
}

// ─── Public handle type ───────────────────────────────────────────────────────
export interface StoryCardHandle {
  captureVideo(): Promise<{ url: string; ext: string }>;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const StoryCard = forwardRef<
  StoryCardHandle,
  { firstName: string; tags: string[]; shareUrl: string }
>(function StoryCard({ firstName, tags, shareUrl }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>();
  const startRef  = useRef<number>(0);

  // Resolved chip labels (user tags + fallback)
  const labels = [
    ...tags.filter(Boolean).slice(0, 6),
    ...FALLBACK,
  ].slice(0, 6);

  // Constellation anchors — well outside the O ring (r=210 → spans x 330–750)
  // Left chips anchor at x=60 (left edge), right chips anchor at x=1020 (right edge)
  const constItems = [
    { label: labels[0], x: 60,   y: O_CY - 340, align: 'left'  as const },
    { label: labels[1], x: 1020, y: O_CY - 320, align: 'right' as const },
    { label: labels[2], x: 60,   y: O_CY + 320, align: 'left'  as const },
    { label: labels[3], x: 1020, y: O_CY + 340, align: 'right' as const },
  ];

  // ── Master drawFrame (all phases) ──────────────────────────────────────────
  const drawFrameRef = useRef<(ctx: CanvasRenderingContext2D, t: number) => void>(
    () => {}
  );

  useEffect(() => {
    drawFrameRef.current = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.clearRect(0, 0, CW, CH);
      drawBg(ctx);

      // ── PHASE 0 (0 – 1.0 s): title + floating chips ───────────────────────
      if (t < 1.0) {
        const ta = eoc(il(0, 0.4, t));
        ctx.save();
        ctx.globalAlpha = ta;
        ctx.textBaseline = 'top';

        // Overline "sero"
        ctx.font      = '700 48px Sora, sans-serif';
        ctx.fillStyle = '#8F8F98';
        ctx.textAlign = 'left';
        ctx.fillText('sero', 96, 180);

        // "Los planes que amaría [name] son…"
        const fSize = 96;
        ctx.font = `800 ${fSize}px Sora, sans-serif`;
        ctx.fillStyle = '#18181B';
        ctx.fillText('Los planes que', 96, 272);
        ctx.fillText('amaría', 96, 272 + 120);

        // name in coral — fitted
        const prefix   = 'amaría ';
        const prefixW  = ctx.measureText(prefix).width;
        const maxNameW = CW - 96 - prefixW - 96;
        const fittedName = fitText(ctx, firstName || 'tú', maxNameW);
        ctx.fillStyle = '#FF6B5E';
        ctx.fillText(fittedName, 96 + prefixW, 272 + 120);

        ctx.fillStyle = '#18181B';
        ctx.fillText('son…', 96, 272 + 120 * 2);
        ctx.restore();

        // Floating chips
        TRACKS.forEach((tr, i) => {
          const lbl  = labels[i % labels.length] ?? '';
          const lT   = t - tr.delay;
          if (lT <= 0 || lT >= tr.dur) return;
          const prog = lT / tr.dur;
          const fa   = prog < 0.1 ? prog / 0.1 : prog > 0.85 ? 1 - (prog - 0.85) / 0.15 : 1;
          const dist = CW + 520;
          const cx2  = tr.startX + tr.dir * dist * prog;
          drawChip(ctx, cx2, CH * tr.yFrac, lbl, fa * ta, 'left', 440, 44);
        });
      }

      // ── PHASE 1 (1.0 – 1.8 s): O draws in (title fades) ──────────────────
      if (t >= 1.0 && t < 1.8) {
        // Title fade-out
        const titleA = 1 - eoc(il(1.0, 1.35, t));
        if (titleA > 0.01) {
          ctx.save();
          ctx.globalAlpha = titleA;
          ctx.font = `800 96px Sora, sans-serif`;
          ctx.fillStyle = '#18181B';
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.fillText('Los planes que', 96, 272);
          ctx.fillText('amaría', 96, 272 + 120);
          const prefix  = 'amaría ';
          const pw      = ctx.measureText(prefix).width;
          const fn      = fitText(ctx, firstName || 'tú', CW - 96 - pw - 96);
          ctx.fillStyle = '#FF6B5E';
          ctx.fillText(fn, 96 + pw, 272 + 120);
          ctx.fillStyle = '#18181B';
          ctx.fillText('son…', 96, 272 + 120 * 2);
          ctx.restore();
        }
        // O drawing in
        const op = eio(il(1.0, 1.8, t));
        drawO(ctx, O_CX, O_CY, O_R, O_SW, op);
      }

      // ── PHASE 2 (1.8 – 4.2 s): O + constellation ─────────────────────────
      if (t >= 1.8 && t < 4.2) {
        drawO(ctx, O_CX, O_CY, O_R, O_SW, 1, 1, true);

        constItems.forEach((item, i) => {
          const enter = 1.8 + i * 0.28;
          const a = eoc(il(enter, enter + 0.5, t));
          const ox = (1 - eoc(il(enter, enter + 0.5, t))) * (item.align === 'left' ? -80 : 80);
          drawChip(
            ctx,
            item.x + ox,
            item.y,
            item.label,
            a,
            item.align,
            280,  // max text width — tight so chips stay outside the O ring
            40,
          );
        });
      }

      // ── PHASE 3a (4.2 – 5.0 s): constellation + O fade out ───────────────
      if (t >= 4.2 && t < 5.0) {
        const fadeOut = 1 - eoc(il(4.2, 5.0, t));

        // O ring fades
        drawO(ctx, O_CX, O_CY, O_R, O_SW, 1, fadeOut, t < 4.7);

        // Constellation chips fade with O
        constItems.forEach((item) => {
          drawChip(ctx, item.x, item.y, item.label, fadeOut, item.align, 280, 40);
        });
      }

      // ── PHASE 3b (5.0 – 6.0 s): sero wordmark emerges ───────────────────
      if (t >= 5.0 && t < 6.0) {
        const logoA = eoc(il(5.0, 5.6, t));
        const logoY = CH * 0.64 + (1 - eoc(il(5.0, 5.6, t))) * 100;
        drawWordmark(ctx, logoY, logoA);
      }

      // ── PHASE 4 (6.0 – 7.8 s): question text ─────────────────────────────
      if (t >= 6.0 && t < 7.8) {
        drawWordmark(ctx, CH * 0.64, 1);

        const qA = eoc(il(6.0, 6.5, t));
        if (qA > 0) {
          ctx.save();
          ctx.globalAlpha = qA;
          ctx.font = '800 80px Sora, sans-serif';
          ctx.fillStyle = '#18181B';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('¿Qué tendría', CW / 2, CH * 0.72);
          ctx.fillText('tu plan perfecto?', CW / 2, CH * 0.72 + 104);
          ctx.restore();
        }
      }

      // ── PHASE 5 (7.8 s +): final frame ────────────────────────────────────
      if (t >= 7.8) {
        // Wordmark slides up to center
        const slideP  = eio(il(7.8, 8.4, t));
        const logoY   = CH * 0.64 - slideP * (CH * 0.64 - CH * 0.44);
        const oGlow   = t > 8.2;
        drawWordmark(ctx, logoY, 1, oGlow);

        // Tagline fades in below logo
        const tagA = eoc(il(8.1, 8.6, t));
        if (tagA > 0) {
          ctx.save();
          ctx.globalAlpha = tagA;
          ctx.font = '700 60px Sora, sans-serif';
          ctx.fillStyle = '#18181B';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Mismos gustos, mejores planes', CW / 2, CH * 0.55);
          ctx.restore();
        }

        // URL pill
        const urlA = eoc(il(8.4, 8.9, t));
        if (urlA > 0) {
          ctx.save();
          ctx.globalAlpha = urlA;
          const short   = shareUrl.replace(/^https?:\/\//, '');
          const urlFont = '500 36px Sora, sans-serif';
          ctx.font      = urlFont;
          const maxUW   = CW - 200;
          const fitted  = fitText(ctx, short, maxUW);
          const tw      = ctx.measureText(fitted).width;
          const pH = 72, pPad = 60;
          const pW = tw + pPad * 2;
          const pX = (CW - pW) / 2;
          const pY = CH * 0.63;

          ctx.fillStyle = 'rgba(24,24,27,0.07)';
          roundRect(ctx, pX, pY, pW, pH, pH / 2);
          ctx.fill();

          ctx.fillStyle   = 'rgba(24,24,27,0.45)';
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fitted, CW / 2, pY + pH / 2);
          ctx.restore();
        }
      }
    };
  }, [firstName, tags, shareUrl, labels, constItems]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  function startAnim(canvas: HTMLCanvasElement) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const ctx = canvas.getContext('2d')!;
    startRef.current = performance.now();

    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000;
      drawFrameRef.current(ctx, Math.min(t, 10.5));
      if (t < 10.5) rafRef.current = requestAnimationFrame(loop);
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

  // ── Expose capture method ──────────────────────────────────────────────────
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

        // Re-run animation from scratch and record it
        startAnim(canvas);
        recorder.start(100);
        setTimeout(() => recorder.stop(), 10600);
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
