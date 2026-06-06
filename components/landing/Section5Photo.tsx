import Image from 'next/image';

// Stock placeholder — replace /public/section5.jpg with the real photo and
// update the `src` below to "/section5.jpg".
const STOCK_URL =
  'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=1600&q=80';

export function Section5Photo() {
  return (
    <section className="relative px-6 py-28 sm:py-36 bg-cream overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-coral/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <p className="text-ink/50 text-xs sm:text-sm uppercase tracking-[0.3em] mb-6 text-center">
          ¿Qué te podemos dar hoy?
        </p>

        <div
          className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-sand/40 shadow-[0_30px_70px_-30px_rgba(77,49,77,0.45)]"
          style={{ transform: 'rotate(-0.6deg)' }}
        >
          <Image
            src={STOCK_URL}
            alt="Amigos compartiendo una cena, riendo."
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 bg-cream/95 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest text-plum">
            Sero · vida real
          </div>
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
            Una noche que probablemente{' '}
            <span className="text-coral">no hubiese existido jamás</span>.
          </p>
          <p className="mt-5 text-ink/70 text-lg sm:text-xl">
            Todo porque alguien decidió compartir lo que ama.
          </p>
        </div>
      </div>
    </section>
  );
}
