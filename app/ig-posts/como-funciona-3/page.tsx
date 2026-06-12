'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cómo funciona · 3/3</h1>
      <IgPostFrame fileName="ig-como-funciona-3">
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
            {/* "03" — fixed-height container for export accuracy */}
            <div style={{ height: 180, lineHeight: 1, overflow: 'visible' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 200,
                  fontWeight: 900,
                  opacity: 0.22,
                  color: '#8A6A1A',
                  lineHeight: 1,
                  letterSpacing: -6,
                }}
              >
                03
              </span>
            </div>

            {/* Icon bubble — butter */}
            <div
              style={{
                marginTop: 70,
                width: 196,
                height: 196,
                borderRadius: 44,
                background: '#FFE9B0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 124,
                lineHeight: 1,
              }}
            >
              🥂
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
              Vive
              <br />
              mejores planes
            </h2>

            {/* Body */}
            <p
              style={{
                marginTop: 36,
                fontSize: 54,
                color: 'rgba(24,24,27,0.55)',
                lineHeight: 1.35,
                fontWeight: 500,
              }}
            >
              Sero se encarga de todo,
              <br />
              tú solo disfruta.
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
            3 / 3
          </p>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}
