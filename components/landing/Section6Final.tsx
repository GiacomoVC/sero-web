import Link from 'next/link';

export function Section6Final() {
  return (
    <section className="relative px-6 py-28 sm:py-40 text-center overflow-hidden bg-plum">
      {/* Decorative blobs on plum */}
      <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
        <div className="blob animate-blob bg-coral/25"    style={{ width: 480, height: 480, top: '-10%', right: '-8%' }} />
        <div className="blob animate-blob-slow bg-lilac/20" style={{ width: 400, height: 400, bottom: '-10%', left: '-8%' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-lilac/80 text-base sm:text-lg leading-relaxed tracking-wide">
          Creemos que muchas de las mejores experiencias de nuestra vida
          empiezan con algo muy simple:
        </p>

        <h2 className="mt-8 text-3xl sm:text-6xl font-black tracking-tight leading-[1.05] text-cream">
          Algo que <span className="text-coral">amamos</span>.
          <br />
          Y <span className="text-lilac">personas</span> con quienes
          compartirlo.
        </h2>

        <p className="mt-10 inline-block bg-gold/20 text-gold font-bold tracking-tight text-base sm:text-lg rounded-full px-6 py-2">
          Mismos gustos, mejores planes.
        </p>

        <div className="mt-10">
          <Link href="/quiz" className="btn-primary text-lg animate-pulse-ring">
            Encontrar a mi gente →
          </Link>
        </div>

        <p className="mt-16 text-cream/25 text-xs tracking-[0.3em] uppercase">
          Sero · {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
