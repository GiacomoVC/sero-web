'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';

/**
 * Cena Sero · Slide 1 — Pizza photo, full bleed.
 *
 * Put your pizza photo at /public/ig-posts/pizza.jpg before exporting.
 * If the file isn't there, the slide shows a placeholder gradient.
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Cena Sero · 1/4</h1>
      <IgPostFrame fileName="ig-cena-sero-1" background="#18181B">
        {/* Photo full bleed with aesthetic color grade */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/ig-posts/pizza.jpg), linear-gradient(135deg, #FF8A3D 0%, #FF6B5E 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.12) saturate(1.22) brightness(1.04) sepia(0.06)',
          }}
        />

        {/* Vignette + warm overlay for aesthetic depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.32) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,107,94,0.06) 0%, transparent 30%, transparent 70%, rgba(91,45,130,0.10) 100%)',
          }}
        />

        {/* Sero corner badge — bigger */}
        <div
          className="absolute"
          style={{ top: 70, left: 70, padding: '18px 32px', background: 'rgba(250,248,245,0.94)', borderRadius: 999, display: 'inline-flex', alignItems: 'baseline' }}
        >
          <span style={{ color: '#FF6B5E', fontWeight: 800, fontSize: 42, letterSpacing: -0.5 }}>sero</span>
          <span style={{ color: 'rgba(24,24,27,0.55)', fontWeight: 700, fontSize: 36, marginLeft: 14 }}>· una cena</span>
        </div>
      </IgPostFrame>
    </div>
  );
}
