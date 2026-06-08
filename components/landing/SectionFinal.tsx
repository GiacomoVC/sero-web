import Link from 'next/link';
import { Confetti } from '@/components/ui/Confetti';
import { StickerNote } from '@/components/ui/StickerNote';
import { Highlight } from '@/components/ui/Highlight';

export function SectionFinal() {
  return (
    <section className="relative bg-cream py-28 sm:py-36 px-6 text-center overflow-hidden">
      <Confetti density="dense" />

      {/* Soft blobs */}
      <div
        className="blob animate-blob w-[400px] h-[400px] -top-16 -left-20"
        style={{ backgroundColor: 'rgba(255,107,94,0.10)' }}
      />
      <div
        className="blob animate-blob-slow w-[360px] h-[360px] bottom-0 -right-16"
        style={{ backgroundColor: 'rgba(91,45,130,0.08)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-sm font-bold tracking-widest text-coral uppercase">
          ¿Listo?
        </p>
        <h2 className="text-4xl sm:text-6xl font-black text-ink tracking-tight leading-[1.05] mt-4">
          La gente que buscas{' '}
          <Highlight variant="underline" color="plum">ya está buscándote</Highlight>.
        </h2>
        <p className="text-ink/60 text-lg mt-6 leading-relaxed">
          Sero conecta personas a través de amigos y mundos compartidos.
        </p>

        {/* Polaroid + sticker cluster */}
        <div className="relative mt-12 mb-4 inline-block">
          <Polaroid />
          <div className="absolute -top-6 -right-10 sm:-right-16 hidden sm:block">
            <StickerNote color="lavender" tilt={8} arrow="down-left">
              tu gente<br />ya está aquí ♡
            </StickerNote>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/quiz"
            className="btn-primary text-lg animate-pulse-ring inline-flex"
          >
            Encontrar a mi gente →
          </Link>
        </div>

        <p className="mt-20 text-ink/35 text-xs tracking-[0.3em] uppercase">
          Sero · {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}

/**
 * Stylized polaroid card. Uses a soft gradient placeholder so we don't ship
 * a stock photo — replace the inner div with an <Image /> when the team has
 * artwork ready.
 */
function Polaroid() {
  return (
    <div
      className="animate-polaroid relative bg-white p-3 pb-10 shadow-[0_18px_40px_-12px_rgba(91,45,130,0.25)] rounded-sm"
      style={{ ['--tilt' as string]: '-4deg' }}
    >
      {/* Washi tape */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-[-6deg] w-20 h-6 bg-lavender/80 border border-white/60 shadow-sm"
      />
      <div
        className="w-56 h-56 sm:w-64 sm:h-64 rounded-sm overflow-hidden relative"
        style={{
          background:
            'linear-gradient(135deg, #FFD9CF 0%, #FFE9B0 35%, #D4ECDD 70%, #E9DCF6 100%)',
        }}
      >
        {/* faux scene: dots + text */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl gap-2 opacity-90">
          <span>👯</span><span>🥂</span><span>🎶</span>
        </div>
      </div>
      <p className="mt-3 font-hand text-2xl text-plum/80">
        amigos de amigos ♡
      </p>
    </div>
  );
}
