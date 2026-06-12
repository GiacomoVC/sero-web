'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

/**
 * Cómo funciona · 1/3 — Direct port of the website's SectionHow StepCard,
 * scaled to fill a 1080×1440 IG canvas.
 *
 * Layout mirrors the website exactly:
 *   - cream + confetti backdrop
 *   - white rounded card with subtle border + shadow
 *   - "01" big and faded at the top
 *   - small pastel icon bubble below
 *   - title in Sora 800
 *   - body in soft ink
 *   - "1 / 3" page indicator outside the card
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cómo funciona · 1/3</h1>
      <IgPostFrame fileName="ig-como-funciona-1">
        <SlideBackdrop density="normal" showLogo={false}>
          {/* Header */}
          <p
            className="absolute left-0 right-0 text-center font-bold"
            style={{
              top: 100,
              fontSize: 36,
              letterSpacing: '0.32em',
              color: '#FF6B5E',
            }}
          >
            CÓMO FUNCIONA
          </p>

          {/* The card — same proportions as the website StepCard */}
          <div
            className="absolute"
            style={{
              left: 100,
              top: 220,
              width: 880,
              height: 1060,
              background: '#FFFFFF',
              border: '1px solid rgba(24,24,27,0.08)',
              borderRadius: 56,
              boxShadow: '0 22px 50px -15px rgba(91,45,130,0.22)',
              padding: 80,
              boxSizing: 'border-box',
            }}
          >
            {/* "01" — fixed-height container so layout doesn't depend on
                line-height (html-to-image computes it differently than the
                browser otherwise, leading to overlap on export). */}
            <div style={{ height: 180, lineHeight: 1, overflow: 'visible' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 200,
                  fontWeight: 900,
                  opacity: 0.22,
                  color: '#B33E2E',
                  lineHeight: 1,
                  letterSpacing: -6,
                }}
              >
                01
              </span>
            </div>

            {/* Icon bubble — w-14 h-14 on website */}
            <div
              style={{
                marginTop: 70,
                width: 196,
                height: 196,
                borderRadius: 44,
                background: '#FFD9CF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 124,
                lineHeight: 1,
              }}
            >
              ✍️
            </div>

            {/* Title — text-xl on website */}
            <h2
              style={{
                marginTop: 56,
                fontSize: 92,
                fontWeight: 800,
                color: '#18181B',
                lineHeight: 1.05,
                letterSpacing: -2,
              }}
            >
              Cuéntanos
              <br />
              qué amas
            </h2>

            {/* Body — text-sm on website */}
            <p
              style={{
                marginTop: 36,
                fontSize: 54,
                color: 'rgba(24,24,27,0.55)',
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              En un quiz de 5 minutos.
            </p>
          </div>

          {/* Page indicator below card */}
          <p
            className="absolute left-0 right-0 text-center font-semibold"
            style={{
              bottom: 60,
              fontSize: 36,
              letterSpacing: '0.32em',
              color: 'rgba(24,24,27,0.40)',
            }}
          >
            1 / 3
          </p>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}
