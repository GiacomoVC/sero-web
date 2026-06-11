'use client';

import { IgPostFrame } from '@/components/ig/IgPostFrame';
import { SlideBackdrop } from '@/components/ig/SlideBackdrop';

export default function Page() {
  return (
    <div className="min-h-screen bg-ink py-10 px-4 flex flex-col items-center">
      <h1 className="text-white text-xl font-bold mb-6">Principios</h1>
      <IgPostFrame fileName="ig-principios">
        <SlideBackdrop>
          {/* Tag */}
          <p
            className="absolute left-0 right-0 text-center font-bold"
            style={{ top: 230, fontSize: 46, letterSpacing: '0.32em', color: '#FF6B5E' }}
          >
            PRINCIPIOS
          </p>

          {/* H1 */}
          <p
            className="absolute left-0 right-0 text-center font-black tracking-tight text-ink"
            style={{ top: 330, fontSize: 190, letterSpacing: -3 }}
          >
            Sero es
          </p>

          {/* Bullets */}
          <div className="absolute left-0 right-0" style={{ top: 620, padding: '0 90px' }}>
            <Row mark="✗" markColor="rgba(24,24,27,0.4)" text="No es para conocer parejas" lineColor="rgba(24,24,27,0.4)" strike />
            <Row mark="✗" markColor="rgba(24,24,27,0.4)" text="No es para ligar" lineColor="rgba(24,24,27,0.4)" strike />
            <Row mark="✓" markColor="#FF6B5E" text="Solo amistad" />
            <Row mark="✓" markColor="#FF6B5E" text="Planes con gente que ama lo mismo que tú" small />
          </div>

          {/* Tagline at bottom */}
          <p
            className="absolute left-0 right-0 text-center font-bold"
            style={{ bottom: 130, fontSize: 50, letterSpacing: '0.18em', color: '#5B2D82' }}
          >
            MISMOS GUSTOS, MEJORES PLANES
          </p>
        </SlideBackdrop>
      </IgPostFrame>
    </div>
  );
}

function Row({
  mark,
  markColor,
  text,
  lineColor,
  strike,
  small,
}: {
  mark: string;
  markColor: string;
  text: string;
  lineColor?: string;
  strike?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-center gap-7 mb-9">
      <span style={{ fontSize: 130, color: markColor, fontWeight: 800, width: 110, textAlign: 'center' }}>
        {mark}
      </span>
      <span
        className="font-bold flex-1"
        style={{
          fontSize: small ? 68 : 86,
          color: strike ? (lineColor ?? 'rgba(24,24,27,0.4)') : '#18181B',
          textDecoration: strike ? 'line-through' : 'none',
          textDecorationThickness: strike ? 6 : undefined,
          lineHeight: 1.15,
        }}
      >
        {text}
      </span>
    </div>
  );
}
