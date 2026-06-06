'use client';

import { useMemo, useState } from 'react';
import { Logo } from '../ui/Logo';
import { buildWhatsAppMessage, whatsappShareUrl } from '@/lib/whatsapp';
import type { SubmitResult } from '@/lib/types';

// WhatsApp official green icon
function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Instagram gradient icon
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)" />
    </svg>
  );
}

export function ShareScreen({
  result,
  firstName,
}: {
  result: SubmitResult;
  firstName: string;
}) {
  const [copied, setCopied] = useState(false);

  // Use the current window origin to build URLs — avoids the server returning
  // localhost:3000 when accessed from a LAN IP during development.
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${result.slug}`
      : result.url;

  const storyUrl =
    typeof window !== 'undefined'
      ? result.igUrl.replace(/^https?:\/\/[^/]+/, window.location.origin)
      : result.igUrl;

  // Build the WhatsApp message client-side so the link points to the correct origin.
  const waMessage = useMemo(
    () =>
      buildWhatsAppMessage({
        url: shareUrl,
        loveExample: result.tags[0],
      }),
    [shareUrl, result.tags]
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  };

  const shareStory = async () => {
    try {
      const res = await fetch(storyUrl);
      const blob = await res.blob();
      const file = new File([blob], `sero-story-${result.slug}.png`, { type: 'image/png' });

      // Try native share with file (iOS 15+, Android Chrome)
      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: 'Mi perfil Sero' });
        return;
      }

      // Fallback: download the image (desktop) or open in new tab (iOS)
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sero-story-${result.slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Last resort: open image directly in new tab so user can save it
      window.open(storyUrl, '_blank');
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-cream">
      <header className="px-6 pt-10">
        <div className="flex flex-col items-center gap-2">
          <Logo width={180} priority />
        </div>
      </header>

      <main className="flex-1 px-6 py-12 max-w-2xl w-full mx-auto text-center">
        <div className="fade-up">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">
            ¡Listo, {firstName || 'amigo'}! <span aria-hidden>🎴</span>
            <br />
            Ya tenemos el mapa de lo que amas.
          </h1>
          <p className="mt-5 text-ink/70 text-lg leading-relaxed">
            Tu primera experiencia sale cuando tus amigos también cuentan lo
            suyo. Mientras más estén dentro, antes vivirán su plan 🫶
          </p>
        </div>

        <div className="mt-10 fade-up">
          <div className="rounded-2xl bg-white/70 border border-ink/10 p-4 flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="text-xs text-ink/50 uppercase tracking-widest">
                Tu link
              </p>
              <p className="font-medium truncate">{shareUrl}</p>
            </div>
            <button onClick={copyLink} className="btn-secondary !py-2 !px-4 text-sm">
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center fade-up">
          <a
            href={whatsappShareUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-2 bg-[#25D366] shadow-none hover:shadow-none"
            style={{ background: '#25D366' }}
          >
            <IconWhatsApp />
            Enviar a mis amigos
          </a>
          <button
            onClick={shareStory}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <IconInstagram />
            Compartir en mi historia
          </button>
        </div>

        {result.tags.length > 0 && (
          <div className="mt-12 fade-up">
            <p className="text-ink/60 text-sm uppercase tracking-widest mb-4">
              Lo que ya mapeamos de ti
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {result.tags.map((t) => (
                <span
                  key={t}
                  className="inline-block rounded-full bg-plum text-cream px-4 py-1.5 text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16">
          <p className="text-ink/40 text-xs tracking-widest uppercase">
            Sero · Mismos gustos, mejores planes.
          </p>
        </div>
      </main>
    </div>
  );
}
