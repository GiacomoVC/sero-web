import { Confetti } from '@/components/ui/Confetti';
import { Highlight } from '@/components/ui/Highlight';

const STEPS = [
  {
    num:    '01',
    icon:   '✍️',
    title:  'Cuéntanos qué amas',
    body:   'Completa los mundos de tu perfil.',
    bubble: 'bg-peach',
    accent: 'text-[#B33E2E]',
  },
  {
    num:    '02',
    icon:   '📲',
    title:  'Mapea tu círculo',
    body:   'Envía tu link. Encontramos amigos de amigos que comparten tus mundos.',
    bubble: 'bg-lavender',
    accent: 'text-[#5B2D82]',
    highlighted: true,
  },
  {
    num:    '03',
    icon:   '🥂',
    title:  'Vive mejores planes',
    body:   'Sero se encarga de todo. Tú solo ven.',
    bubble: 'bg-butter',
    accent: 'text-[#8A6A1A]',
  },
];

export function SectionHow() {
  return (
    <section className="relative bg-cream py-24 sm:py-32 overflow-hidden">
      <Confetti density="light" />

      {/* Heading */}
      <div className="relative z-10 text-center mb-14 px-6">
        <p className="text-sm font-bold tracking-widest text-coral uppercase">
          El proceso
        </p>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-ink mt-3">
          Así de{' '}
          <Highlight variant="underline" color="coral">simple</Highlight>.
        </h2>
      </div>

      {/* Mobile — snap carousel */}
      <div className="sm:hidden relative z-10 px-6 overflow-x-auto snap-x snap-mandatory scroll-smooth flex gap-4 pb-4">
        {STEPS.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}
      </div>
      <p className="sm:hidden mt-3 text-center text-ink/25 text-xs tracking-wide">
        desliza →
      </p>

      {/* Desktop — 3 columns with hand-drawn arrows between */}
      <div className="hidden sm:block relative z-10 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-6 relative">
          {STEPS.map((step) => (
            <StepCard key={step.num} step={step} />
          ))}

          {/* Arrows 1→2 and 2→3 */}
          <ConnectorArrow side="left" />
          <ConnectorArrow side="right" />
        </div>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: typeof STEPS[number] }) {
  return (
    <div
      className={`snap-start shrink-0 w-[80vw] max-w-[300px] sm:w-auto sm:max-w-none rounded-3xl p-7 bg-white border border-ink/8 shadow-sm transition-transform hover:-translate-y-1`}
    >
      <span className={`text-5xl font-black block opacity-25 ${step.accent}`}>
        {step.num}
      </span>
      <div className={`mt-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl text-3xl ${step.bubble}`}>
        {step.icon}
      </div>
      <h3 className="text-xl font-bold mt-4 text-ink">
        {step.title}
      </h3>
      <p className="text-sm mt-2 leading-relaxed text-ink/55">
        {step.body}
      </p>
    </div>
  );
}

function ConnectorArrow({ side }: { side: 'left' | 'right' }) {
  // Positioned between columns 1↔2 (left) and 2↔3 (right)
  const pos = side === 'left'
    ? 'left-1/3 -translate-x-1/2'
    : 'left-2/3 -translate-x-1/2';

  return (
    <svg
      aria-hidden
      width="64"
      height="40"
      viewBox="0 0 64 40"
      fill="none"
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${pos} z-20`}
    >
      <path
        d="M4 28 Q 18 4, 38 18 T 58 14"
        stroke="#5B2D82"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-arrow-draw"
      />
      <path
        d="M52 8 L58 14 L52 20"
        stroke="#5B2D82"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-arrow-draw"
      />
    </svg>
  );
}
