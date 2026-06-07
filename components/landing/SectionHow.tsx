interface Step {
  num:   string;
  icon:  string;
  title: string;
  body:  string;
  highlighted: boolean;
}

const STEPS: Step[] = [
  {
    num:   '01',
    icon:  '✍️',
    title: 'Cuéntanos qué amas',
    body:  'Completa tu perfil de gustos. Música, series, deportes — todo cuenta.',
    highlighted: false,
  },
  {
    num:   '02',
    icon:  '📲',
    title: 'Comparte con tu círculo',
    body:  'Envía tu link. Tus amigos lo completan y así el grupo crece solo.',
    highlighted: true,
  },
  {
    num:   '03',
    icon:  '🥂',
    title: 'Haz los planes',
    body:  'Sero conecta a las personas con gustos afines. Tú solo tienes que aparecer.',
    highlighted: false,
  },
];

export function SectionHow() {
  return (
    <section className="bg-ink py-24 sm:py-32 px-6 text-white">
      {/* Heading */}
      <div className="text-center mb-16">
        <p className="text-sm font-bold tracking-widest text-coral uppercase">
          El proceso
        </p>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight mt-3">
          Así de simple.
        </h2>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
        {STEPS.map((step) =>
          step.highlighted ? (
            <div key={step.num} className="bg-coral rounded-3xl p-8">
              <span className="text-5xl font-black text-white/30 block">
                {step.num}
              </span>
              <span className="text-3xl block mt-4">{step.icon}</span>
              <h3 className="text-xl font-bold mt-3">{step.title}</h3>
              <p className="text-white/80 text-sm mt-2 leading-relaxed">
                {step.body}
              </p>
            </div>
          ) : (
            <div
              key={step.num}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <span className="text-5xl font-black text-coral/30 block">
                {step.num}
              </span>
              <span className="text-3xl block mt-4">{step.icon}</span>
              <h3 className="text-xl font-bold mt-3">{step.title}</h3>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                {step.body}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
