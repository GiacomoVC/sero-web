import Link from 'next/link';

export function Section6Final() {
  return (
    <section className="relative px-6 py-28 sm:py-40 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sand/30 via-cream to-cream" />

      {/* Decorative floating dots — hidden on mobile to avoid overlapping text */}
      <span className="hidden sm:block absolute top-20 left-[12%] text-3xl animate-float" style={{ ['--rot' as string]: '-12deg' }}>✨</span>
      <span className="hidden sm:block absolute top-32 right-[14%] text-3xl animate-float" style={{ ['--rot' as string]: '10deg', animationDelay: '1.2s' }}>💜</span>
      <span className="hidden sm:block absolute bottom-32 left-[18%] text-2xl animate-float" style={{ ['--rot' as string]: '8deg', animationDelay: '0.6s' }}>🫶</span>

      <div className="relative max-w-3xl mx-auto">
        <p className="text-lg sm:text-xl text-ink/70 leading-relaxed">
          Creemos que muchas de las mejores experiencias de nuestra vida
          empiezan con algo muy simple:
        </p>

        <h2 className="mt-8 text-3xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
          Algo que <span className="text-coral">amamos</span>.
          <br />
          Y <span className="text-plum">personas</span> con quienes
          compartirlo.
        </h2>

        <p className="mt-12 inline-block bg-coral/15 text-coral font-bold tracking-tight text-lg sm:text-xl rounded-full px-6 py-2">
          Mismos gustos, mejores planes.
        </p>

        <div className="mt-10">
          <Link href="/quiz" className="btn-primary text-lg animate-pulse-ring">
            Vive nuevas experiencias →
          </Link>
        </div>

        <p className="mt-20 text-ink/40 text-xs tracking-[0.3em] uppercase">
          Sero · {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
