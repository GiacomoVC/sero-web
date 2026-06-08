/**
 * Temporary preview route for iterating on the StoryCard video.
 * Open at /preview-story?name=Ariadna&tags=Taylor%20Swift,Tarantino,F%C3%B3rmula%201
 *
 * DELETE THIS FILE BEFORE DEPLOYING.
 */
'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { StoryCard, type StoryCardHandle } from '@/components/quiz/StoryCard';

function Inner() {
  const params = useSearchParams();
  const name   = params.get('name') ?? 'Ariadna';
  const tags   = (params.get('tags') ?? 'Taylor Swift,Tarantino,Fórmula 1,Murakami,Bad Bunny,The Bear')
    .split(',').map((s) => s.trim()).filter(Boolean);

  const cardRef = useRef<StoryCardHandle>(null);
  const [state, setState] = useState<'idle' | 'recording' | 'done'>('idle');
  const [tick, setTick] = useState(0);

  const restart = () => setTick((x) => x + 1);

  const record = async () => {
    if (!cardRef.current) return;
    setState('recording');
    const { url, ext } = await cardRef.current.captureVideo();
    const a = document.createElement('a');
    a.href = url;
    a.download = `sero-preview.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setState('done');
    setTimeout(() => setState('idle'), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#18181B', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, gap: 16, color: 'white', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>StoryCard preview</h1>
      <p style={{ opacity: 0.7, fontSize: 13 }}>name: <code>{name}</code> · tags: <code>{tags.join(' · ')}</code></p>

      <div key={tick} style={{ marginTop: 8, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)' }}>
        <StoryCard ref={cardRef} firstName={name} tags={tags} shareUrl="" />
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <button onClick={restart} style={{ padding: '10px 18px', borderRadius: 999, background: '#FF6B5E', color: 'white', border: 0, fontWeight: 600, cursor: 'pointer' }}>
          ↻ Reproducir de nuevo
        </button>
        <button onClick={record} disabled={state === 'recording'} style={{ padding: '10px 18px', borderRadius: 999, background: 'white', color: '#18181B', border: 0, fontWeight: 600, cursor: 'pointer', opacity: state === 'recording' ? 0.5 : 1 }}>
          {state === 'recording' ? 'Grabando…' : state === 'done' ? 'Descargado ✓' : 'Descargar video'}
        </button>
      </div>

      <p style={{ marginTop: 24, opacity: 0.4, fontSize: 12, maxWidth: 380, textAlign: 'center' }}>
        Cambia <code>?name=</code> y <code>?tags=</code> (coma-separados) en la URL para probar con otros datos.
        Borra <code>app/preview-story/</code> antes de deployar.
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#18181B' }} />}>
      <Inner />
    </Suspense>
  );
}
