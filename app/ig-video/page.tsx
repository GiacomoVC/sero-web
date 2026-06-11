'use client';

import { useRef, useState } from 'react';
import { GenericVideoCard, type GenericVideoCardHandle } from '@/components/video/GenericVideoCard';
import { unlockAndPreload } from '@/lib/audioContext';

/**
 * Generator page for the generic Instagram video. Internal tool: visit this
 * page on a laptop, tap "Generar y descargar", get a 10-second mp4 with the
 * soundtrack embedded, post it on IG and stick the link sticker manually.
 */
export default function IgVideoPage() {
  const cardRef = useRef<GenericVideoCardHandle>(null);
  const [stage, setStage] = useState<'idle' | 'preparing' | 'ready' | 'downloading' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const generate = () => {
    if (stage !== 'idle' && stage !== 'ready' && stage !== 'done') return;

    // Unlock audio synchronously inside the click handler so the recording
    // can mix in the soundtrack.
    unlockAndPreload();

    setStage('preparing');
    setProgress(0);

    // Simulated progress meter (recording runs ~10.4s)
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.min(Math.round((Date.now() - start) / 10400 * 100), 99));
    }, 200);

    cardRef.current!.captureVideo()
      .then(({ url, ext }) => {
        clearInterval(interval);
        setProgress(100);

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `sero-ig-video.${ext}`;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();

        setStage('done');
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
        setTimeout(() => setStage('ready'), 3000);
      })
      .catch(() => {
        clearInterval(interval);
        setStage('idle');
        setProgress(0);
      });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#18181B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
        gap: 16,
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>
        Generic IG video
      </h1>
      <p style={{ opacity: 0.7, fontSize: 13, maxWidth: 440, textAlign: 'center' }}>
        Preview corriendo abajo (sin sonido). Tap el botón para generar el mp4 con la música y
        descargarlo. Despúes subilo a IG Stories / Reels y agregale el sticker de link manualmente.
      </p>

      <div
        style={{
          marginTop: 12,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
        }}
      >
        <GenericVideoCard ref={cardRef} />
      </div>

      {stage === 'preparing' && (
        <div style={{ width: '100%', maxWidth: 360, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#FF6B5E',
              borderRadius: 999,
              transition: 'width 0.2s',
            }}
          />
        </div>
      )}

      <button
        onClick={generate}
        disabled={stage === 'preparing' || stage === 'downloading'}
        style={{
          marginTop: 8,
          padding: '14px 28px',
          borderRadius: 999,
          background: '#FF6B5E',
          color: 'white',
          border: 0,
          fontWeight: 700,
          fontSize: 16,
          cursor: stage === 'preparing' ? 'wait' : 'pointer',
          opacity: stage === 'preparing' ? 0.7 : 1,
          minWidth: 280,
        }}
      >
        {stage === 'preparing' ? `Grabando con música… ${progress}%` :
         stage === 'done'      ? 'Descargado ✓ · generar de nuevo' :
         stage === 'ready'     ? 'Generar y descargar de nuevo' :
                                 'Generar y descargar mp4 con música'}
      </button>

      <p style={{ marginTop: 28, opacity: 0.45, fontSize: 12, maxWidth: 440, textAlign: 'center' }}>
        Importante: tu iPhone tiene que estar con el switch lateral en audible (no en silencio) para
        que la música quede grabada bien. Si lo generás desde laptop, asegurate que el volumen del
        sistema esté arriba. La música se incrusta en el mp4 igual.
      </p>
    </div>
  );
}
