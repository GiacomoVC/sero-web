import { ImageResponse } from 'next/og';
import { humanizeSlug } from '@/lib/humanize';

export const runtime = 'edge';

const CREAM = '#F6F1E8';
const PLUM  = '#4D314D';
const CORAL = '#E06A5F';
const INK   = '#292726';
const GOLD  = '#D4A84B';

const TAG_STYLES = [
  { bg: CORAL, fg: CREAM  },
  { bg: CREAM, fg: PLUM   },
  { bg: PLUM,  fg: CREAM  },
  { bg: GOLD,  fg: INK    },
  { bg: INK,   fg: CREAM  },
  { bg: CREAM, fg: CORAL  },
];

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const firstName = searchParams.get('n') || humanizeSlug(params.slug).split(' ')[0];
  const tagsRaw   = searchParams.get('t') || '';
  const tags = tagsRaw.split('|').map((s) => s.trim()).filter(Boolean).slice(0, 6);

  /* ── Layout constants ── */
  const W       = 1080;
  const H       = 1920;
  const SPLIT   = 820;   // plum section height
  const RADIUS  = 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: W, height: H,
          background: CREAM,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── PLUM TOP SECTION ── */}
        <div
          style={{
            width: W,
            height: SPLIT,
            background: PLUM,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Decorative coral disc — top right */}
          <div style={{
            position: 'absolute', top: -140, right: -140,
            width: 480, height: 480, borderRadius: 9999,
            background: CORAL, opacity: 0.5, display: 'flex',
          }} />
          {/* Decorative cream disc — bottom left */}
          <div style={{
            position: 'absolute', bottom: -80, left: -80,
            width: 300, height: 300, borderRadius: 9999,
            background: CREAM, opacity: 0.07, display: 'flex',
          }} />

          {/* Wordmark */}
          <div style={{
            position: 'absolute', top: 72, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 2,
          }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: CREAM, letterSpacing: '-2px', display: 'flex' }}>ser</span>
            <span style={{ fontSize: 56, fontWeight: 800, color: CORAL, letterSpacing: '-2px', display: 'flex' }}>o</span>
          </div>

          {/* First name */}
          <div style={{
            fontSize: 164,
            fontWeight: 800,
            color: CREAM,
            letterSpacing: '-6px',
            lineHeight: 0.92,
            textAlign: 'center',
            maxWidth: 940,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 40,
          }}>
            {firstName}
          </div>

          {/* Subtitle */}
          <div style={{
            marginTop: 28,
            fontSize: 46,
            fontWeight: 600,
            color: CREAM,
            opacity: 0.75,
            letterSpacing: '-1px',
            display: 'flex',
          }}>
            tiene muy buen gusto.
          </div>
        </div>

        {/* ── CREAM BOTTOM SECTION ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 64,
            paddingBottom: 80,
            paddingLeft: 72,
            paddingRight: 72,
            gap: 0,
          }}
        >
          {/* Section label */}
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: PLUM,
            opacity: 0.5,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            marginBottom: 44,
            display: 'flex',
          }}>
            Sus mundos
          </div>

          {/* Tag cloud */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 20,
            maxWidth: 920,
          }}>
            {(tags.length ? tags : ['Mis gustos']).map((tag, i) => {
              const s = TAG_STYLES[i % TAG_STYLES.length];
              return (
                <div
                  key={i}
                  style={{
                    background: s.bg,
                    color: s.fg,
                    borderRadius: RADIUS,
                    paddingTop: 22,
                    paddingBottom: 22,
                    paddingLeft: 40,
                    paddingRight: 40,
                    fontSize: 52,
                    fontWeight: 800,
                    letterSpacing: '-1.5px',
                    display: 'flex',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.10)',
                    transform: i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)',
                  }}
                >
                  {tag}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{
            width: 80, height: 4, borderRadius: 99,
            background: PLUM, opacity: 0.15,
            marginTop: 'auto', marginBottom: 36,
            display: 'flex',
          }} />

          {/* CTA */}
          <div style={{
            fontSize: 40,
            fontWeight: 700,
            color: PLUM,
            lineHeight: 1.3,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>¿Y tú? Tu gente está</span>
            <span>a un amigo de distancia.</span>
            <span>Encuéntralos aquí 👆</span>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
