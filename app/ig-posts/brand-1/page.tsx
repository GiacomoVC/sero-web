'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { Confetti } from '@/components/ui/Confetti';
import { Logo } from '@/components/ui/Logo';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Brand · why</h1>
      <IgPostFrame fileName="ig-brand-1">
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#FAF8F5' }}>
          <Confetti density="dense" />

          {/* Big logo */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 280 }}>
            <Logo width={720} />
          </div>

          {/* Why / core belief */}
          <p
            className="absolute left-0 right-0 text-center font-black tracking-tight text-ink"
            style={{ top: 660, fontSize: 145, letterSpacing: -3, lineHeight: 1.1 }}
          >
            Lo que amas
          </p>
          <p
            className="absolute left-0 right-0 text-center font-black tracking-tight"
            style={{ top: 830, fontSize: 130, letterSpacing: -2, lineHeight: 1.1, color: '#5B2D82' }}
          >
            merece encontrarse
          </p>
          <p
            className="absolute left-0 right-0 text-center font-black tracking-tight text-ink"
            style={{ top: 985, fontSize: 145, letterSpacing: -3, lineHeight: 1.1 }}
          >
            con su gente.
          </p>

          {/* Tagline */}
          <p
            className="absolute left-0 right-0 text-center font-bold"
            style={{ bottom: 180, fontSize: 52, letterSpacing: '0.30em', color: '#FF6B5E' }}
          >
            MISMOS GUSTOS, MEJORES PLANES
          </p>

          {/* Link hint */}
          <p
            className="absolute left-0 right-0 text-center"
            style={{ bottom: 90, fontSize: 50, color: 'rgba(24,24,27,0.55)', fontWeight: 600 }}
          >
            mundosero.vercel.app
          </p>
        </div>
      </IgPostFrame>
    </div>
  );
}
