const STEPS = [
  {
    num:         '01',
    icon:        '✍️',
    title:       'Cuéntanos qué amas',
    body:        'Completa los mundos de tu perfil.',
    highlighted: false,
  },
  {
    num:         '02',
    icon:        '📲',
    title:       'Mapea tu círculo',
    body:        'Envía tu link. Encontramos amigos de amigos que comparten tus mundos.',
    highlighted: true,
  },
  {
    num:         '03',
    icon:        '🥂',
    title:       'Vive mejores planes',
    body:        'Sero se encarga de todo. Tú solo ven.',
    highlighted: false,
  },
];

export function SectionHow() {
  return (
    <section className="bg-cream py-24 sm:py-32 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-12 px-6">
        <p className="text-sm font-bold tracking-widest text-coral uppercase">
          El proceso
        </p>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-ink mt-3">
          Así de simple.
        </h2>
      </div>

      {/* Swipe carousel — snaps on mobile */}
      <div className="sm:hidden px-6 overflow-x-auto snap-x snap-mandatory scroll-smooth flex gap-4 pb-4">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={`snap-start shrink-0 w-[80vw] max-w-[300px] rounded-3xl p-8 ${
              step.highlighted
                ? 'bg-coral'
                : 'bg-white border border-ink/8 shadow-sm'
            }`}
          >
            <span className={`text-5xl font-black block ${step.highlighted ? 'text-white/30' : 'text-coral/25'}`}>
              {step.num}
            </span>
            <span className="text-3xl block mt-4">{step.icon}</span>
            <h3 className={`text-xl font-bold mt-3 ${step.highlighted ? 'text-white' : 'text-ink'}`}>
              {step.title}
            </h3>
            <p className={`text-sm mt-2 leading-relaxed ${step.highlighted ? 'text-white/80' : 'text-ink/50'}`}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
      <p className="sm:hidden mt-3 text-center text-ink/25 text-xs tracking-wide">
        desliza →
      </p>

      {/* Desktop: 3-column grid */}
      <div className="hidden sm:grid grid-cols-3 gap-6 max-w-4xl mx-auto px-6">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={`rounded-3xl p-8 ${
              step.highlighted
                ? 'bg-coral'
                : 'bg-white border border-ink/8 shadow-sm'
            }`}
          >
            <span className={`text-5xl font-black block ${step.highlighted ? 'text-white/30' : 'text-coral/25'}`}>
              {step.num}
            </span>
            <span className="text-3xl block mt-4">{step.icon}</span>
            <h3 className={`text-xl font-bold mt-3 ${step.highlighted ? 'text-white' : 'text-ink'}`}>
              {step.title}
            </h3>
            <p className={`text-sm mt-2 leading-relaxed ${step.highlighted ? 'text-white/80' : 'text-ink/50'}`}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
