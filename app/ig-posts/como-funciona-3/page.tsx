'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cómo funciona · 3/3</h1>
      <IgPostFrame fileName="ig-como-funciona-3">
        <SlideBackdrop>
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 170 }}>
            <span
              className="font-black"
              style={{ fontSize: 420, color: '#8A6A1A', opacity: 0.16, letterSpacing: -12 }}
            >
              03
            </span>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[80px]"
            style={{ top: 450, width: 300, height: 300, background: '#FFE9B0', fontSize: 180 }}
          >
            🥂
          </div>

          <div className="absolute left-0 right-0 text-center" style={{ top: 830 }}>
            <p className="font-black tracking-tight text-ink" style={{ fontSize: 160, letterSpacing: -2 }}>
              Vive
            </p>
            <p className="font-black tracking-tight text-ink" style={{ fontSize: 140, letterSpacing: -2, marginTop: 8 }}>
              mejores planes
            </p>
          </div>

          <div className="absolute left-0 right-0 text-center" style={{ top: 1230 }}>
            <p
              className="font-semibold"
              style={{ fontSize: 72, color: 'rgba(24,24,27,0.65)', lineHeight: 1.2 }}
            >
              Sero se encarga de todo,
              <br />
              tú solo disfruta.
            </p>
          </div>

          <div
            className="absolute left-0 right-0 text-center"
            style={{ bottom: 70, fontSize: 42, letterSpacing: '0.3em', color: 'rgba(24,24,27,0.35)' }}
          >
            3 / 3
          </div>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}
