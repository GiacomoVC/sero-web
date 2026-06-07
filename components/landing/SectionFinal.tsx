import Link from 'next/link';

export function SectionFinal() {
  return (
    <section className="relative bg-plum py-28 sm:py-40 px-6 text-center overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="blob animate-blob w-[400px] h-[400px] -top-16 -left-20"
        style={{ backgroundColor: 'rgba(255,107,94,0.20)' }}
      />
      <div
        className="blob animate-blob-slow w-[360px] h-[360px] bottom-0 -right-16"
        style={{ backgroundColor: 'rgba(255,138,61,0.20)' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-sm font-bold tracking-widest text-white/40 uppercase">
          ¿Listo?
        </p>
        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] mt-4">
          La gente que buscas ya está buscándote.
        </h2>
        <p className="text-white/60 text-lg mt-6 leading-relaxed">
          Sero conecta personas reales a través de lo que genuinamente aman.
        </p>
        <Link
          href="/quiz"
          className="btn-primary text-lg animate-pulse-ring mt-10 inline-flex"
        >
          Encontrar a mi gente →
        </Link>

        <p className="mt-20 text-white/25 text-xs tracking-[0.3em] uppercase">
          Sero · {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
