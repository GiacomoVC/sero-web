'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cómo funciona · 1/3</h1>
      <IgPostFrame fileName="ig-como-funciona-1">
        <SlideBackdrop>
          {/* Big number */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 170 }}>
            <span
              className="font-black"
              style={{ fontSize: 420, color: '#B33E2E', opacity: 0.16, letterSpacing: -12 }}
            >
              01
            </span>
          </div>

          {/* Icon bubble — peach */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[80px]"
            style={{ top: 450, width: 300, height: 300, background: '#FFD9CF', fontSize: 180 }}
          >
            ✍️
          </div>

          {/* Title */}
          <div className="absolute left-0 right-0 text-center" style={{ top: 830 }}>
            <p className="font-black tracking-tight text-ink" style={{ fontSize: 160, letterSpacing: -2 }}>
              Cuéntanos
            </p>
            <p className="font-black tracking-tight text-ink" style={{ fontSize: 160, letterSpacing: -2, marginTop: 8 }}>
              qué amas
            </p>
          </div>

          {/* Body */}
          <p
            className="absolute left-0 right-0 text-center font-semibold"
            style={{ top: 1240, fontSize: 80, color: 'rgba(24,24,27,0.6)' }}
          >
            En un quiz de 5 minutos
          </p>

          {/* Page indicator */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ bottom: 70, fontSize: 42, letterSpacing: '0.3em', color: 'rgba(24,24,27,0.35)' }}
          >
            1 / 3
          </div>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}
