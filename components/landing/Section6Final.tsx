import Link from 'next/link';

export function Section6Final() {
  return (
    <section className="relative px-6 py-28 sm:py-40 text-center overflow-hidden bg-plum">
      {/* Subtle texture blobs on dark bg */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="blob animate-blob"
          style={{ width: 500, height: 500, top: '-15%', left: '-12%', background: 'rgba(183,139,184,0.18)' }}
        />
        <div
          className="blob animate-blob-slow"
          style={{ width: 420, height: 420, bottom: '-18%', right: '-10%', background: 'rgba(224,106,95,0.15)' }}
        />
      </div>

      {/* Decorative floating dots — hidden on mobile */}
      <span className="hidden sm:block absolute top-20 left-[12%] text-3xl animate-float" style={{ ['--rot' as string]: '-12deg' }}>✨</span>
      <span className="hidden sm:block absolute top-32 right-[14%] text-3xl animate-float" style={{ ['--rot' as string]: '10deg', animationDelay: '1.2s' }}>💜</span>
      <span className="hidden sm:block absolute bottom-32 left-[18%] text-2xl animate-float" style={{ ['--rot' as string]: '8deg', animationDelay: '0.6s' }}>🫶</span>

      <div className="relative max-w-3xl mx-auto">
        <p className="text-lg sm:text-xl text-cream/65 leading-relaxed">
          Creemos que muchas de las mejores experiencias de nuestra vida
          empiezan con algo muy simple:
        </p>

        <h2 className="mt-8 text-3xl sm:text-6xl font-bold tracking-tight leading-[1.05] text-cream">
          Algo que <span className="text-coral">amamos</span>.
          <br />
          Y <span style={{ color: '#B78BB8' }}>personas</span> con quienes
          compartirlo.
        </h2>

        <p className="mt-12 inline-block bg-coral/20 text-coral font-bold tracking-tight text-lg sm:text-xl rounded-full px-6 py-2">
          Mismos gustos, mejores planes.
        </p>

        <div className="mt-10">
          <Link href="/quiz" className="btn-primary text-lg animate-pulse-ring">
            Encontrar a mi gente →
          </Link>
        </div>

        <p className="mt-20 text-cream/30 text-xs tracking-[0.3em] uppercase">
          Sero · {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
