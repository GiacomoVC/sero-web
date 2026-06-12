'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { Confetti } from '@/components/ui/Confetti';
import { Logo } from '@/components/ui/Logo';

/**
 * Brand · why — a clean, logo-first post. The why / core belief copy lives
 * in the IG caption, not on the image. Image = pure brand identity.
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Brand · logo</h1>
      <IgPostFrame fileName="ig-brand-1">
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#FAF8F5' }}>
          <Confetti density="dense" />

          {/* Centered logo */}
          <div
            className="absolute left-1/2"
            style={{ top: '50%', transform: 'translate(-50%, -65%)' }}
          >
            <Logo width={820} noAnim />
          </div>

          {/* Tagline — discreet, just enough so the brand reads instantly */}
          <p
            className="absolute left-0 right-0 text-center font-bold"
            style={{
              bottom: 160,
              fontSize: 52,
              letterSpacing: '0.30em',
              color: '#5B2D82',
            }}
          >
            MISMOS GUSTOS, MEJORES PLANES
          </p>
        </div>
      </IgPostFrame>
    </div>
  );
}
