'use client';

const STEPS = [
  {
    n: '01',
    emoji: '✍️',
    title: 'Cuéntanos lo que amas',
    sub: 'Mientras más detallado, mejor.',
    bg: 'bg-coral/10',
    accent: 'text-coral',
  },
  {
    n: '02',
    emoji: '📲',
    title: 'Comparte tu link a tus amigos',
    sub: 'Tus amigos lo comparten con los suyos, y así crece el grupo de los que aman lo mismo que tú.',
    bg: 'bg-plum/10',
    accent: 'text-plum',
  },
  {
    n: '03',
    emoji: '🥂',
    title: 'Vive nuevas experiencias',
    sub: 'Sero se encarga del plan y todo lo demás.',
    bg: 'bg-sand/50',
    accent: 'text-ink',
  },
];

export function Section3HowItWorks() {
  return (
    <section className="relative px-6 py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-sand/30" />

      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-10 sm:mb-16">
          Cómo funciona
        </h2>

        {/* Mobile: horizontal swipe carousel */}
        <div className="sm:hidden -mx-6 px-6 overflow-x-auto snap-x snap-mandatory scroll-smooth flex gap-4 pb-4">
          {STEPS.map((s, idx) => (
            <div
              key={s.n}
              className={`snap-start shrink-0 w-[80vw] max-w-[300px] rounded-3xl ${s.bg} p-7 border border-ink/10`}
            >
              <div className="text-5xl mb-5 inline-block">{s.emoji}</div>
              <div className={`text-xs font-bold tracking-[0.25em] ${s.accent}`}>{s.n}</div>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-ink/70 leading-relaxed text-sm">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden sm:grid md:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((s, idx) => (
            <div
              key={s.n}
              className={`group relative rounded-3xl ${s.bg} p-8 border border-ink/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_-15px_rgba(77,49,77,0.25)]`}
            >
              <div className="text-5xl mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 inline-block">
                {s.emoji}
              </div>
              <div className={`text-xs font-bold tracking-[0.25em] ${s.accent}`}>{s.n}</div>
              <h3 className="mt-2 text-2xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-ink/70 leading-relaxed">{s.sub}</p>

              {idx < STEPS.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-5 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-cream border border-ink/10 items-center justify-center text-ink/60 text-lg shadow-sm">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Swipe hint — mobile only */}
        <p className="sm:hidden mt-3 text-center text-ink/35 text-xs tracking-wide">
          desliza para ver más →
        </p>
      </div>
    </section>
  );
}
