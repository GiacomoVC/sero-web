import { ImageResponse } from 'next/og';
import { getBaseUrl } from '@/lib/baseUrl';
import { humanizeSlug } from '@/lib/humanize';

export const runtime = 'edge';

const CREAM = '#F6F1E8';
const PLUM = '#4D314D';
const CORAL = '#E06A5F';
const INK = '#292726';
const SAND = '#D9CFC2';

// Deterministic varied styling per tag (no Math.random — caches stably).
const TAG_STYLES = [
  { bg: PLUM,  fg: CREAM, size: 50, rot: -3 },
  { bg: CORAL, fg: CREAM, size: 56, rot: 2  },
  { bg: INK,   fg: CREAM, size: 44, rot: -2 },
  { bg: CORAL, fg: CREAM, size: 48, rot: 3  },
  { bg: PLUM,  fg: CREAM, size: 52, rot: -4 },
  { bg: INK,   fg: CREAM, size: 46, rot: 2  },
];

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('n') || humanizeSlug(params.slug).split(' ')[0];
  const tagsRaw = searchParams.get('t') || '';
  const tags = tagsRaw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const base = getBaseUrl(req);
  const shareUrl = `${base.replace(/^https?:\/\//, '')}/${params.slug}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1920px',
          background: PLUM,
          color: INK,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Decorative giant coral disc — top-right */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -180,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: CORAL,
            opacity: 0.45,
            display: 'flex',
          }}
        />
        {/* Decorative cream disc — bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: CREAM,
            opacity: 0.1,
            display: 'flex',
          }}
        />

        {/* Wordmark + tagline (on plum) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 90,
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 96,
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
              fontSize: 28,
              color: CREAM,
              opacity: 0.7,
              letterSpacing: '6px',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            mismos gustos, mejores planes
          </div>
        </div>

        {/* Main card — cream, tilted slightly */}
        <div
          style={{
            position: 'relative',
            margin: '50px 70px 0 70px',
            background: CREAM,
            borderRadius: 60,
            padding: '70px 60px 70px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 50,
            transform: 'rotate(-1.2deg)',
            boxShadow: '0 30px 0 rgba(0,0,0,0.18)',
          }}
        >
          {/* Sticker badge */}
          <div
            style={{
              position: 'absolute',
              top: -36,
              right: 70,
              background: CORAL,
              color: CREAM,
              padding: '14px 28px',
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transform: 'rotate(6deg)',
              display: 'flex',
              boxShadow: '0 6px 0 rgba(0,0,0,0.15)',
            }}
          >
            mi mapa
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              letterSpacing: '-3px',
              lineHeight: 1.02,
            }}
          >
            <div
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: INK,
                display: 'flex',
              }}
            >
              Acabo de mapear
            </div>
            <div
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: INK,
                display: 'flex',
                alignItems: 'baseline',
                gap: 18,
              }}
            >
              <span>todo lo que</span>
              <span
                style={{
                  color: CORAL,
                  fontStyle: 'italic',
                  display: 'flex',
                }}
              >
                amo
              </span>
            </div>
            <div
              style={{
                fontSize: 56,
                marginTop: 14,
                display: 'flex',
              }}
            >
              🤓 💜
            </div>
          </div>

          {/* Tag pills — varied size, color, rotation */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 22,
              maxWidth: 820,
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
              tags.map((tag, i) => {
                const s = TAG_STYLES[i % TAG_STYLES.length];
                return (
                  <div
                    key={i}
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

        {/* Bottom: CTA + URL */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            marginTop: 'auto',
            paddingBottom: 90,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 600,
              textAlign: 'center',
              maxWidth: 880,
              lineHeight: 1.2,
              color: CREAM,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>¿Tú qué amas?</span>
            <span>Cuéntalo y armemos planes 👇</span>
          </div>

          <div
            style={{
              fontSize: 24,
              color: CREAM,
              opacity: 0.55,
              marginTop: 18,
              letterSpacing: '6px',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {name} · Sero
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
