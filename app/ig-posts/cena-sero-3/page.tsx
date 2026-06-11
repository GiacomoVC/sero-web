'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

/**
 * Cena Sero · Slide 3 — Stylized "mesa de 5" illustration.
 *
 * This is a brand-style illustration (NOT an AI photo). It evokes the
 * terraza vibe (coral awning, hanging plants, string lights, wood floor)
 * but uses the sero design vocabulary: cream + confetti backdrop, pastel
 * chips representing the 5 mundos of a person, Sora/Caveat type.
 *
 * If you want a photo here, drop one at /public/ig-posts/mesa-cinco.jpg
 * and swap the design.
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cena Sero · 3/4</h1>
      <IgPostFrame fileName="ig-cena-sero-3">
        <SlideBackdrop density="light" showLogo={false}>
          {/* ── Coral awning bar at the top ─────────────────────────────── */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: 0,
              height: 220,
              background:
                'linear-gradient(180deg, #FF6B5E 0%, #FF8A3D 60%, rgba(255,138,61,0) 100%)',
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
            }}
          />

          {/* Hanging plants */}
          <div
            className="absolute"
            style={{ top: 160, left: 110, fontSize: 130, transform: 'rotate(-6deg)' }}
          >
            🪴
          </div>
          <div
            className="absolute"
            style={{ top: 170, right: 130, fontSize: 130, transform: 'rotate(8deg)' }}
          >
            🪴
          </div>

          {/* String lights — small yellow circles in a chain */}
          <StringLights top={250} />

          {/* ── Caveat header ──────────────────────────────────────────── */}
          <p
            className="absolute left-0 right-0 text-center"
            style={{
              top: 380,
              fontSize: 110,
              fontFamily: 'Caveat, "Caveat Brush", cursive',
              fontWeight: 700,
              color: '#5B2D82',
              transform: 'rotate(-2deg)',
            }}
          >
            una mesa
          </p>

          {/* ── Central table illustration ─────────────────────────────── */}
          <Table cx={540} cy={830} />

          {/* ── Bottom text — website Highlight pattern ────────────────── */}
          <div className="absolute left-0 right-0" style={{ top: 1150 }}>
            <p
              className="text-center font-black tracking-tight"
              style={{ fontSize: 120, letterSpacing: -2, color: '#18181B', lineHeight: 1.05 }}
            >
              5 personas.
            </p>
            <div className="flex items-baseline justify-center gap-4 mt-1">
              <span
                className="font-black tracking-tight"
                style={{ fontSize: 120, letterSpacing: -2, color: '#18181B', lineHeight: 1.05 }}
              >
                Mismos
              </span>
              <div style={{ position: 'relative' }}>
                <span
                  className="font-black tracking-tight"
                  style={{ fontSize: 120, letterSpacing: -2, color: '#18181B', lineHeight: 1.05 }}
                >
                  gustos.
                </span>
                {/* Plum underline on "gustos" — mirrors website Highlight */}
                <svg
                  viewBox="0 0 200 14"
                  preserveAspectRatio="none"
                  style={{ position: 'absolute', left: 0, right: 0, bottom: -8, width: '100%', height: 18 }}
                  aria-hidden
                >
                  <path d="M3 8 Q 50 1, 100 7 T 197 8" stroke="#5B2D82" strokeWidth={3.5} strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p
            className="absolute left-0 right-0 text-center font-bold"
            style={{
              bottom: 70,
              fontSize: 38,
              letterSpacing: '0.3em',
              color: '#FF6B5E',
            }}
          >
            SERO · CENA SERO
          </p>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}

/** Round table with 5 person-chips arranged around it. */
function Table({ cx, cy }: { cx: number; cy: number }) {
  // Each chip represents a person + their dominant world.
  const PEOPLE = [
    { emoji: '🎵', bg: '#FFD9CF', fg: '#B33E2E', label: 'pop'    }, // top
    { emoji: '📺', bg: '#D7E8F7', fg: '#2A5685', label: 'series' }, // top-right
    { emoji: '📚', bg: '#D4ECDD', fg: '#1F6E3C', label: 'libros' }, // bottom-right
    { emoji: '🎬', bg: '#FFE9B0', fg: '#8A6A1A', label: 'cine'   }, // bottom-left
    { emoji: '🏎️', bg: '#E9DCF6', fg: '#5B2D82', label: 'F1'     }, // top-left
  ];
  const radius = 310;

  return (
    <div className="absolute" style={{ left: cx, top: cy }}>
      {/* Table top — ellipse for slight 3/4 perspective */}
      <div
        className="absolute"
        style={{
          left: -240,
          top: -150,
          width: 480,
          height: 300,
          background: 'linear-gradient(160deg, #FFE9B0 0%, #FFD9CF 100%)',
          borderRadius: '50%',
          border: '4px solid rgba(91,45,130,0.18)',
          boxShadow: '0 18px 30px -10px rgba(91,45,130,0.22)',
        }}
      />

      {/* Center scene on the table */}
      <div
        className="absolute"
        style={{ left: -100, top: -60, width: 200, fontSize: 80, textAlign: 'center', lineHeight: 1 }}
      >
        <div>🍕 🥂</div>
      </div>

      {/* 5 person chips */}
      {PEOPLE.map((p, i) => {
        // 5 slots around the table: angles in radians
        // 0 = top (12 o'clock)
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        // Squash y for elliptical layout
        const y = Math.sin(angle) * (radius * 0.72);
        return (
          <Chip
            key={p.label}
            dx={x}
            dy={y}
            emoji={p.emoji}
            bg={p.bg}
            fg={p.fg}
            label={p.label}
          />
        );
      })}
    </div>
  );
}

function Chip({
  dx, dy, emoji, bg, fg, label,
}: { dx: number; dy: number; emoji: string; bg: string; fg: string; label: string }) {
  return (
    <div
      className="absolute"
      style={{
        left: dx,
        top: dy,
        transform: 'translate(-50%, -50%)',
        background: bg,
        borderRadius: 999,
        padding: '20px 38px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        border: '3px solid rgba(24,24,27,0.12)',
        boxShadow: '0 12px 22px -10px rgba(91,45,130,0.30)',
      }}
    >
      <span style={{ fontSize: 70, lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: 50, fontWeight: 800, color: fg, letterSpacing: -0.5 }}>{label}</span>
    </div>
  );
}

function StringLights({ top }: { top: number }) {
  const lights = Array.from({ length: 11 }, (_, i) => i);
  return (
    <div className="absolute left-0 right-0" style={{ top, height: 70, pointerEvents: 'none' }}>
      <svg viewBox="0 0 1080 70" preserveAspectRatio="none" width="100%" height="70">
        <path
          d="M0 14 Q 270 60, 540 30 T 1080 14"
          stroke="#18181B"
          strokeOpacity={0.25}
          strokeWidth={3}
          fill="none"
        />
        {lights.map((i) => {
          const t = i / (lights.length - 1);
          const x = 1080 * t;
          // Same Q curve as above — sample for y
          const y =
            (1 - t) * (1 - t) * 14 +
            2 * (1 - t) * t * 60 +
            t * t * (1 - t) * 30 +
            t * t * 14;
          return (
            <g key={i}>
              <line x1={x} y1={Math.max(0, y - 12)} x2={x} y2={y + 8} stroke="rgba(24,24,27,0.3)" strokeWidth={2} />
              <circle cx={x} cy={y + 18} r={14} fill="#FFD166" />
              <circle cx={x} cy={y + 18} r={6} fill="#FAF8F5" opacity={0.6} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
