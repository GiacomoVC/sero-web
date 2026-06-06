import { ImageResponse } from 'next/og';
import { humanizeSlug } from '@/lib/humanize';

export const runtime = 'edge';

const CREAM = '#F6F1E8';
const PLUM  = '#4D314D';
const CORAL = '#E06A5F';
const INK   = '#292726';

// Deterministic varied styling per tag (no Math.random — caches stably).
const TAG_STYLES = [
  { bg: PLUM,  fg: CREAM, size: 50, rot: -3 },
  { bg: CORAL, fg: CREAM, size: 56, rot:  2 },
  { bg: INK,   fg: CREAM, size: 44, rot: -2 },
  { bg: CORAL, fg: CREAM, size: 48, rot:  3 },
  { bg: PLUM,  fg: CREAM, size: 52, rot: -4 },
  { bg: INK,   fg: CREAM, size: 46, rot:  2 },
];

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const name    = searchParams.get('n') || humanizeSlug(params.slug).split(' ')[0];
  const tagsRaw = searchParams.get('t') || '';
  const tags    = tagsRaw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);


  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1920px',
          background: PLUM,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Decorative discs */}
        <div style={{ position: 'absolute', top: -180, right: -180, width: 560, height: 560, borderRadius: 9999, background: CORAL, opacity: 0.35, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -200, left: -160, width: 520, height: 520, borderRadius: 9999, background: CREAM, opacity: 0.08, display: 'flex' }} />

        {/* ── LOGO + SLOGAN ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 100,
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              letterSpacing: '-3px',
              color: CREAM,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <span>ser</span>
            <span style={{ color: CORAL }}>o</span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: CREAM,
              opacity: 0.65,
              letterSpacing: '7px',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            mismos gustos, mejores planes
          </div>
        </div>

        {/* ── CARD: "Los mundos que amo" + tags ── */}
        <div
          style={{
            position: 'relative',
            margin: '60px 70px 0 70px',
            background: CREAM,
            borderRadius: 60,
            padding: '64px 60px 72px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 44,
            transform: 'rotate(-1.2deg)',
            boxShadow: '0 30px 0 rgba(0,0,0,0.18)',
          }}
        >
          {/* Card heading */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: INK,
              letterSpacing: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <span>Los mundos que amo</span>
            <span style={{ fontSize: 54 }}>💜</span>
          </div>

          {/* Tag pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 22,
              maxWidth: 860,
            }}
          >
            {tags.length === 0 ? (
              <div
                style={{
                  background: PLUM,
                  color: CREAM,
                  borderRadius: 999,
                  padding: '20px 38px',
                  fontSize: 42,
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                lo que más amo
              </div>
            ) : (
              tags.map((tag, idx) => {
                const s = TAG_STYLES[idx % TAG_STYLES.length];
                return (
                  <div
                    key={idx}
                    style={{
                      background: s.bg,
                      color: s.fg,
                      borderRadius: 999,
                      padding: '18px 34px',
                      fontSize: s.size,
                      fontWeight: 800,
                      letterSpacing: '-1px',
                      transform: `rotate(${s.rot}deg)`,
                      display: 'flex',
                      maxWidth: 700,
                      boxShadow: '0 6px 0 rgba(0,0,0,0.15)',
                    }}
                  >
                    {tag}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginTop: 'auto',
            paddingBottom: 110,
            gap: 36,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: CREAM,
              lineHeight: 1.25,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>¿Y tú? Tu gente está</span>
            <span>a un amigo de distancia.</span>
            <span>Encuéntralos aquí 👇</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
