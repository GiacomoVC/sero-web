import Link from 'next/link';
import { Logo } from '../ui/Logo';

const FLOATING = [
  { e: '🎧', top: '14%', left: '8%',  rot: '-12deg', delay: '0s'   },
  { e: '📺', top: '22%', left: '85%', rot: '10deg',  delay: '0.6s' },
  { e: '🎮', top: '70%', left: '6%',  rot: '14deg',  delay: '1.2s' },
  { e: '⚽', top: '78%', left: '88%', rot: '-8deg',  delay: '0.3s' },
  { e: '📚', top: '46%', left: '92%', rot: '6deg',   delay: '0.9s' },
  { e: '🎬', top: '60%', left: '4%',  rot: '-6deg',  delay: '1.5s' },
];

export function Section1Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 bg-cream">
        <div
          className="blob animate-blob bg-coral/40"
          style={{ width: 520, height: 520, top: '-10%', left: '-12%' }}
        />
        <div
          className="blob animate-blob-slow bg-plum/30"
          style={{ width: 480, height: 480, bottom: '-15%', right: '-10%' }}
        />
        <div
          className="blob animate-blob bg-sand/60"
          style={{ width: 360, height: 360, top: '30%', right: '20%', animationDelay: '4s' }}
        />
      </div>

      {/* Floating emoji decorations — hidden on small screens */}
      <div className="absolute inset-0 -z-10 hidden sm:block">
        {FLOATING.map((f, i) => (
          <span
            key={i}
            className="absolute text-4xl animate-float select-none"
            style={{
              top: f.top,
              left: f.left,
              ['--rot' as string]: f.rot,
              animationDelay: f.delay,
            }}
          >
            {f.e}
          </span>
        ))}
      </div>

      <div className="fade-up flex flex-col items-center">
        <Logo width={260} priority />
        <p className="mt-2 text-ink/70 text-base sm:text-lg tracking-wide">
          Mismos gustos, mejores planes
        </p>
      </div>

      <h1 className="fade-up-d2 mt-10 sm:mt-12 max-w-2xl text-[2rem] sm:text-6xl font-bold tracking-tight leading-[1.05]">
        Todo lo que amas merece vivirse{' '}
        <span className="relative inline-block">
          <span className="relative z-10">con amigos</span>
          <span
            className="absolute inset-x-0 bottom-1 sm:bottom-2 h-3 sm:h-4 bg-coral/40 -z-0"
            aria-hidden
          />
        </span>
        .
        <br />
        <span className="text-plum">Convirtámoslo</span>
        <br />
        <span className="text-plum">en un plan.</span>
      </h1>

      <Link
        href="/quiz"
        className="fade-up-d3 mt-12 btn-primary text-lg animate-pulse-ring"
      >
        Empezar →
      </Link>

      <div className="fade-up-d4 absolute bottom-8 left-1/2 -translate-x-1/2 text-ink/40 flex flex-col items-center">
        <span className="animate-bounce-arrow">↓</span>
      </div>
    </section>
  );
}
