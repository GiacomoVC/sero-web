'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';

/**
 * Cena Sero · Slide 4 — Closing CTA. Same continuity logic as slide 2:
 * the terraza photo carries over softly blurred, and the type uses the
 * website's hero pattern (Sora 800 + hand-drawn underline on the keyword).
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cena Sero · 4/4</h1>
      <IgPostFrame fileName="ig-cena-sero-4" background="#18181B">
        {/* Photo — subtle blur for slide-3-to-4 continuity */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url(/ig-posts/terraza.jpg), linear-gradient(135deg, #5B2D82 0%, #B78BB8 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px) saturate(1.20) contrast(1.10) brightness(0.82) sepia(0.05)',
            transform: 'scale(1.06)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(24,24,27,0.55) 0%, rgba(24,24,27,0.30) 35%, rgba(24,24,27,0.30) 65%, rgba(24,24,27,0.65) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.32) 100%)',
          }}
        />

        {/* Tag */}
        <p
          className="absolute left-0 right-0 text-center font-bold"
          style={{ top: 130, fontSize: 44, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.80)' }}
        >
          UNA CENA SERO
        </p>

        {/* Top stack — "Reservas. Menú. / Lugar. Gente." */}
        <p
          className="absolute left-0 right-0 text-center font-black"
          style={{ top: 270, fontSize: 130, letterSpacing: -2, color: '#FAF8F5', lineHeight: 1.05 }}
        >
          Reservas. Menú.
        </p>
        <p
          className="absolute left-0 right-0 text-center font-black"
          style={{ top: 420, fontSize: 130, letterSpacing: -2, color: '#FAF8F5', lineHeight: 1.05 }}
        >
          Lugar. Gente.
        </p>

        {/* Punchline — "Eso es Sero." with hand-drawn coral underline on "Sero" */}
        <div className="absolute left-0 right-0" style={{ top: 680, display: 'flex', justifyContent: 'center', gap: 28, alignItems: 'baseline' }}>
          <span className="font-black" style={{ fontSize: 175, letterSpacing: -3, color: '#FAF8F5', lineHeight: 1 }}>
            Eso es
          </span>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span className="font-black" style={{ fontSize: 175, letterSpacing: -3, color: '#FF6B5E', lineHeight: 1, display: 'inline-block' }}>
              Sero.
            </span>
            <svg
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              style={{ position: 'absolute', left: 0, right: 0, bottom: -8, width: '100%', height: 22 }}
              aria-hidden
            >
              <path d="M3 8 Q 50 1, 100 7 T 197 8" stroke="#FAF8F5" strokeWidth={3.5} strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Closing line */}
        <p
          className="absolute left-0 right-0 text-center font-bold"
          style={{ top: 970, fontSize: 80, color: 'rgba(255,255,255,0.95)', lineHeight: 1.2 }}
        >
          Tú solo trae el hambre.
        </p>

        {/* Wine emoji as small accent */}
        <p
          className="absolute left-0 right-0 text-center"
          style={{ top: 1085, fontSize: 88, lineHeight: 1 }}
        >
          🥂
        </p>

        {/* Footer */}
        <p
          className="absolute left-0 right-0 text-center font-bold"
          style={{ bottom: 80, fontSize: 38, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)' }}
        >
          MISMOS GUSTOS, MEJORES PLANES
        </p>
      </IgPostFrame>
    </div>
  );
}
