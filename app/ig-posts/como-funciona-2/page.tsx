'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cómo funciona · 2/3</h1>
      <IgPostFrame fileName="ig-como-funciona-2">
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

          {/* Card */}
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
            {/* "02" — fixed-height container for export accuracy */}
            <div style={{ height: 180, lineHeight: 1, overflow: 'visible' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 200,
                  fontWeight: 900,
                  opacity: 0.22,
                  color: '#5B2D82',
                  lineHeight: 1,
                  letterSpacing: -6,
                }}
              >
                02
              </span>
            </div>

            {/* Icon bubble — lavender */}
            <div
              style={{
                marginTop: 70,
                width: 196,
                height: 196,
                borderRadius: 44,
                background: '#E9DCF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 124,
                lineHeight: 1,
              }}
            >
              📲
            </div>

            {/* Title */}
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
              Invita
              <br />
              a tus amigos
            </h2>

            {/* Body — with inline coral highlight on "gente que ama lo mismo" */}
            <p
              style={{
                marginTop: 36,
                fontSize: 50,
                color: 'rgba(24,24,27,0.65)',
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              Así encontramos{' '}
              <span style={{ color: '#FF6B5E', fontWeight: 700 }}>
                gente que ama lo mismo
              </span>{' '}
              que tú. Nada de extraños.
            </p>
          </div>

          {/* Page indicator */}
          <p
            className="absolute left-0 right-0 text-center font-semibold"
            style={{
              bottom: 60,
              fontSize: 36,
              letterSpacing: '0.32em',
              color: 'rgba(24,24,27,0.40)',
            }}
          >
            2 / 3
          </p>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}
