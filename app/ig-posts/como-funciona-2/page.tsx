'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cómo funciona · 2/3</h1>
      <IgPostFrame fileName="ig-como-funciona-2">
        <SlideBackdrop>
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 170 }}>
            <span
              className="font-black"
              style={{ fontSize: 420, color: '#5B2D82', opacity: 0.16, letterSpacing: -12 }}
            >
              02
            </span>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[80px]"
            style={{ top: 450, width: 300, height: 300, background: '#E9DCF6', fontSize: 180 }}
          >
            📲
          </div>

          <div className="absolute left-0 right-0 text-center" style={{ top: 830 }}>
            <p className="font-black tracking-tight text-ink" style={{ fontSize: 160, letterSpacing: -2 }}>
              Invita
            </p>
            <p className="font-black tracking-tight text-ink" style={{ fontSize: 160, letterSpacing: -2, marginTop: 8 }}>
              a tus amigos
            </p>
          </div>

          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: 1220 }}
          >
            <p
              className="font-semibold"
              style={{ fontSize: 72, color: 'rgba(24,24,27,0.65)', lineHeight: 1.2 }}
            >
              Gente que ama lo mismo
              <br />
              que tú.
            </p>
            <p
              className="font-bold mt-3"
              style={{ fontSize: 78, color: '#FF6B5E' }}
            >
              Nada de extraños.
            </p>
          </div>

          <div
            className="absolute left-0 right-0 text-center"
            style={{ bottom: 70, fontSize: 42, letterSpacing: '0.3em', color: 'rgba(24,24,27,0.35)' }}
          >
            2 / 3
          </div>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}
