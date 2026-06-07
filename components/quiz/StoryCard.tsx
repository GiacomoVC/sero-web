'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import html2canvas from 'html2canvas';

// ─── Constants ──────────────────────────────────────────────────────────────

// Card renders at 270×480 in the browser.
// html2canvas scale=4 → 1080×1920 for download.
const CARD_W = 270;
const CARD_H = 480;

// The O — proportions match the Logo component exactly
const O_CX = CARD_W / 2;
const O_CY = 204;
const O_R  = 52;
const O_SW = 7;
const O_C  = 2 * Math.PI * O_R;
// 315° main | 18° gap1 | 15° detached | 12° gap2
const O_DA = [
  (315 / 360) * O_C,
  (18  / 360) * O_C,
  (15  / 360) * O_C,
  (12  / 360) * O_C,
].join(' ');

// Sample chips to supplement user tags
const SAMPLE_CHIPS: { emoji: string; label: string }[] = [
  { emoji: '🎸', label: 'Arctic Monkeys' },
  { emoji: '🏎', label: 'Fórmula 1' },
  { emoji: '🎬', label: 'Interstellar' },
  { emoji: '📚', label: 'Ciencia ficción' },
  { emoji: '⚽', label: 'Champions' },
  { emoji: '🍝', label: 'Italia' },
];

// Six chip tracks: y-% of card height, direction (+1 = L→R), delay, duration
const CHIP_TRACKS = [
  { y: 24,  dir:  1, delay: 0.00, dur: 3.0 },
  { y: 37,  dir: -1, delay: 0.35, dur: 2.7 },
  { y: 52,  dir:  1, delay: 0.65, dur: 3.2 },
  { y: 64,  dir: -1, delay: 0.15, dur: 2.9 },
  { y: 77,  dir:  1, delay: 0.50, dur: 2.6 },
  { y: 44,  dir: -1, delay: 0.80, dur: 3.1 },
];

// Constellation: four interest chips orbiting the O
const ORBIT_ANCHORS = [
  { x: 12,  y: 108, ix: -36, iy: -20 },  // top-left
  { x: 158, y:  96, ix:  36, iy: -20 },  // top-right
  { x: 10,  y: 286, ix: -36, iy:  20 },  // bottom-left
  { x: 154, y: 274, ix:  36, iy:  20 },  // bottom-right
];

// ─── Animation phases ────────────────────────────────────────────────────────
//
//  0 → intro title + floating chips (0 – 1.0 s)
//  1 → O draws in, chips clear         (1.0 – 1.8 s)
//  2 → O + constellation               (1.8 – 4.5 s)
//  3 → sero wordmark emerges           (4.5 – 6.0 s)
//  4 → question text                   (6.0 – 7.8 s)
//  5 → final frame (hold)              (7.8 s →)

type Phase = 0 | 1 | 2 | 3 | 4 | 5;

// ─── Public handle ───────────────────────────────────────────────────────────

export interface StoryCardHandle {
  /** Jump to final frame and return a PNG data-URL at 1080×1920. */
  capture(): Promise<string>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const StoryCard = forwardRef<
  StoryCardHandle,
  { firstName: string; tags: string[]; shareUrl: string }
>(function StoryCard({ firstName, tags, shareUrl }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(0);
  const [oDrawn, setODrawn] = useState(false); // keeps O visible after draw-in

  // ── Animation timeline ──
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => { setPhase(1); setODrawn(true); }, 1000),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 4500),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => setPhase(5), 7800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  // ── Expose capture() ──
  useImperativeHandle(ref, () => ({
    async capture() {
      setPhase(5); // jump to final frame
      await new Promise((r) => setTimeout(r, 120)); // let React paint
      const el = containerRef.current;
      if (!el) return '';
      const canvas = await html2canvas(el, {
        scale: 4,           // 270×4 = 1080, 480×4 = 1920
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF8F5',
        logging: false,
      });
      return canvas.toDataURL('image/png');
    },
  }));

  // ── Derived display values ──
  const chips = [
    ...tags.slice(0, 4).map((t, i) => ({
      emoji: SAMPLE_CHIPS[i]?.emoji ?? '✨',
      label: t,
    })),
    ...SAMPLE_CHIPS.slice(Math.min(tags.length, 4)),
  ].slice(0, 6);

  const constellation = ORBIT_ANCHORS.map((anchor, i) => ({
    ...anchor,
    label: tags[i] ?? SAMPLE_CHIPS[i]?.label ?? '…',
  }));

  const shortUrl = shareUrl.replace(/^https?:\/\//, '');

  // ── Helpers ──
  const vis = (...phases: Phase[]) =>
    ({ opacity: phases.includes(phase) ? 1 : 0 } as React.CSSProperties);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width:    CARD_W,
        height:   CARD_H,
        background: '#FAF8F5',
        borderRadius: 24,
        overflow: 'hidden',
        fontFamily: 'var(--font-sora, Sora, sans-serif)',
        WebkitFontSmoothing: 'antialiased',
        userSelect: 'none',
      }}
    >
      {/* ── Background blobs (always visible) ── */}
      <div style={{
        position: 'absolute', width: 200, height: 200,
        borderRadius: '50%', top: -60, right: -60,
        background: 'radial-gradient(circle, rgba(255,107,94,0.22), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 160, height: 160,
        borderRadius: '50%', bottom: -30, left: -40,
        background: 'radial-gradient(circle, rgba(91,45,130,0.14), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── PHASE 0–1: Intro title ── */}
      <div style={{
        position: 'absolute', top: 32, left: 24, right: 24,
        opacity: phase >= 2 ? 0 : 1,
        transform: phase >= 2 ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
          color: '#8F8F98', textTransform: 'uppercase', marginBottom: 12,
        }}>
          sero
        </p>
        <p style={{
          fontSize: 20, fontWeight: 800, color: '#18181B',
          lineHeight: 1.2, letterSpacing: '-0.025em',
        }}>
          Los planes que
        </p>
        <p style={{
          fontSize: 20, fontWeight: 800, lineHeight: 1.2,
          letterSpacing: '-0.025em',
        }}>
          amaría{' '}
          <span style={{ color: '#FF6B5E' }}>{firstName}</span>
        </p>
        <p style={{
          fontSize: 20, fontWeight: 800, color: '#18181B',
          lineHeight: 1.2, letterSpacing: '-0.025em',
        }}>
          son…
        </p>
      </div>

      {/* ── PHASE 0–1: Floating chips ── */}
      {phase <= 1 && CHIP_TRACKS.map((track, i) => {
        const chip = chips[i % chips.length];
        const startLeft = track.dir === 1 ? -130 : CARD_W + 10;
        const dx = track.dir === 1 ? CARD_W + 260 : -(CARD_W + 260);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: startLeft,
              top: `${track.y}%`,
              pointerEvents: 'none',
              animation: `scChipMove ${track.dur}s ${track.delay}s linear both`,
              '--chip-dx': `${dx}px`,
            } as React.CSSProperties}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'white', borderRadius: 100,
              padding: '4px 11px',
              border: '1px solid rgba(24,24,27,0.08)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              fontSize: 10, fontWeight: 600, color: '#18181B',
              whiteSpace: 'nowrap',
            }}>
              <span>{chip?.emoji}</span>
              <span>{chip?.label}</span>
            </div>
          </div>
        );
      })}

      {/* ── PHASE 1+: The O ── */}
      {(phase >= 1 || oDrawn) && (
        <div style={{
          position: 'absolute',
          left: O_CX - O_R - O_SW - 2,
          top:  O_CY - O_R - O_SW - 2,
          opacity: phase >= 3 && phase <= 5 ? 0 : 1, // hides during sero logo phase
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}>
          <svg
            width={(O_R + O_SW + 2) * 2}
            height={(O_R + O_SW + 2) * 2}
          >
            <defs>
              <linearGradient id="sc-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B5E" />
                <stop offset="100%" stopColor="#FF8A3D" />
              </linearGradient>
              <filter id="sc-ring-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle
              cx={O_R + O_SW + 2}
              cy={O_R + O_SW + 2}
              r={O_R}
              fill="none"
              stroke="url(#sc-ring-grad)"
              strokeWidth={O_SW}
              strokeDasharray={O_DA}
              strokeLinecap="round"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                // Phase 1: draw in. Phase 2+: hold drawn position with subtle breathe
                animation: phase === 1
                  ? `scDrawO 0.75s cubic-bezier(.4,0,.15,1) forwards`
                  : `scBreathe 3.5s ease-in-out infinite`,
                transform: 'rotate(-24deg)',
                filter: phase >= 2 ? 'drop-shadow(0 0 5px rgba(255,107,94,0.4))' : 'none',
                transition: 'filter 1s ease',
              }}
            />
          </svg>
        </div>
      )}

      {/* ── PHASE 2–3: Constellation ── */}
      {constellation.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: item.x,
            top:  item.y,
            opacity: phase === 2 || phase === 3 ? 1 : 0,
            transform: phase === 2 || phase === 3
              ? 'translate(0,0) scale(1)'
              : `translate(${item.ix}px,${item.iy}px) scale(0.82)`,
            transition: `opacity 0.45s ${i * 0.13}s ease, transform 0.45s ${i * 0.13}s cubic-bezier(.2,.9,.3,1)`,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'white', borderRadius: 100,
            padding: '5px 11px',
            border: '1px solid rgba(24,24,27,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: 10, fontWeight: 700, color: '#18181B',
            maxWidth: 104, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.label}
          </div>
        </div>
      ))}

      {/* ── PHASE 3+: Sero wordmark — slides up to center for final ── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: phase >= 5 ? 148 : 316,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: phase >= 3 ? 1 : 0,
        transition: 'opacity 0.4s ease, top 0.9s cubic-bezier(.4,0,.15,1)',
        pointerEvents: 'none',
      }}>
        <svg width={110} height={30} viewBox="0 0 170 46">
          <defs>
            <linearGradient id="sc-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B5E" />
              <stop offset="100%" stopColor="#FF8A3D" />
            </linearGradient>
          </defs>
          <text
            x="44" y="40"
            fontFamily="Sora, sans-serif"
            fontSize="42" fontWeight="500"
            fill="#18181B"
            textAnchor="end"
            letterSpacing="-1"
          >
            ser
          </text>
          <circle
            cx="114" cy="29" r="10.5"
            fill="none"
            stroke="url(#sc-logo-grad)"
            strokeWidth="2.6"
            strokeDasharray="57.72 3.30 2.75 2.20"
            strokeLinecap="round"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform: 'rotate(-24deg)',
              animation: phase >= 5 ? 'scBreathe 4s ease-in-out infinite' : 'none',
            }}
          />
        </svg>
      </div>

      {/* ── PHASE 4: Question text ── */}
      <div style={{
        position: 'absolute',
        bottom: 108,
        left: 24, right: 24,
        textAlign: 'center',
        opacity: phase === 4 ? 1 : 0,
        transform: phase === 4 ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: 'none',
      }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#18181B', lineHeight: 1.25, letterSpacing: '-0.025em' }}>
          ¿Qué tendría
        </p>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#18181B', lineHeight: 1.25, letterSpacing: '-0.025em' }}>
          tu plan perfecto?
        </p>
      </div>

      {/* ── PHASE 5: Final tagline ── */}
      <div style={{
        position: 'absolute',
        bottom: 62,
        left: 24, right: 24,
        textAlign: 'center',
        opacity: phase >= 5 ? 1 : 0,
        transform: phase >= 5 ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: 'none',
      }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#18181B', lineHeight: 1.3, letterSpacing: '-0.015em' }}>
          Mismos gustos, mejores planes
        </p>
      </div>

      {/* ── PHASE 5: Personal URL ── */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 24, right: 24,
        opacity: phase >= 5 ? 1 : 0,
        transition: 'opacity 0.6s 0.25s ease',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(24,24,27,0.06)',
          borderRadius: 10,
          padding: '4px 10px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(24,24,27,0.45)', letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shortUrl}
          </p>
        </div>
      </div>
    </div>
  );
});
