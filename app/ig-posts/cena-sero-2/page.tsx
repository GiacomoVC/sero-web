'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';

/**
 * Cena Sero · Slide 2 — Title card. Photo from slide 1 carries over with a
 * SUBTLE blur (continuity, not a mood plate), aesthetic warm grade, and
 * dark overlay just enough for white type to read.
 *
 * Layout follows the website's hero/SectionFinal pattern:
 *   - Small tracked-out tag on top
 *   - "Cena Sero" headline with a hand-drawn underline under "Sero"
 *     (mirrors <Highlight variant="underline">)
 *   - Subtitle in Sora 600
 *   - Footer tagline pinned to the bottom with breathing room.
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cena Sero · 2/4</h1>
      <IgPostFrame fileName="ig-cena-sero-2" background="#18181B">
        {/* Photo — subtle blur so slide 1 → 2 reads as continuity. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url(/ig-posts/pizza.jpg), linear-gradient(135deg, #FF8A3D 0%, #FF6B5E 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px) saturate(1.20) contrast(1.10) brightness(0.86) sepia(0.05)',
            transform: 'scale(1.06)',
          }}
        />
        {/* Warm overlay — coral haze for brand mood */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(24,24,27,0.45) 0%, rgba(24,24,27,0.20) 35%, rgba(24,24,27,0.15) 65%, rgba(24,24,27,0.55) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.30) 100%)',
          }}
        />

        {/* Tag */}
        <p
          className="absolute left-0 right-0 text-center font-bold"
          style={{ top: 130, fontSize: 50, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.85)' }}
        >
          PRÓXIMAMENTE
        </p>

        {/* Headline — "Cena" then "Sero" with hand-drawn underline */}
        <p
          className="absolute left-0 right-0 text-center font-black"
          style={{
            top: 320,
            fontSize: 280,
            letterSpacing: -8,
            color: '#FAF8F5',
            lineHeight: 1,
          }}
        >
          Cena
        </p>

        {/* "Sero" with underline */}
        <div
          className="absolute left-0 right-0"
          style={{ top: 620, display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span
              className="font-black"
              style={{
                fontSize: 280,
                letterSpacing: -8,
                color: '#FF6B5E',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              Sero
            </span>
            {/* Hand-drawn coral underline — mirrors the website's <Highlight underline> */}
            <svg
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -16,
                width: '100%',
                height: 28,
              }}
              aria-hidden
            >
              <path
                d="M3 8 Q 50 1, 100 7 T 197 8"
                stroke="#FAF8F5"
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="absolute left-0 right-0 text-center"
          style={{
            top: 1010,
            fontSize: 66,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.28,
            fontWeight: 600,
          }}
        >
          Mesa puesta para gente
          <br />
          que ama lo mismo que tú.
        </p>

        {/* Footer tagline */}
        <p
          className="absolute left-0 right-0 text-center font-bold"
          style={{
            bottom: 80,
            fontSize: 38,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.60)',
          }}
        >
          MISMOS GUSTOS, MEJORES PLANES
        </p>
      </IgPostFrame>
    </div>
  );
}
