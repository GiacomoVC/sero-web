/**
 * Reusable "3-step process" cards. Used on the landing's SectionHow and on
 * the referral page (/[slug]/) so both stay visually in sync.
 */
import { Highlight } from '@/components/ui/Highlight';
import type { ReactNode } from 'react';

type Step = {
  num: string;
  icon: string;
  title: string;
  body: ReactNode;
  bubble: string;
  accent: string;
  highlighted?: boolean;
};

export const PROCESS_STEPS: Step[] = [
  {
    num:    '01',
    icon:   '✍️',
    title:  'Cuéntanos qué amas',
    body:   'En un quiz de 5 minutos.',
    bubble: 'bg-peach',
    accent: 'text-[#B33E2E]',
  },
  {
    num:    '02',
    icon:   '📲',
    title:  'Invita a tus amigos',
    body:   (
      <>
        Así encontramos{' '}
        <Highlight variant="underline" color="coral">gente que ama lo mismo</Highlight>{' '}
        que tú. Nada de extraños.
      </>
    ),
    bubble: 'bg-lavender',
    accent: 'text-[#5B2D82]',
    highlighted: true,
  },
  {
    num:    '03',
    icon:   '🥂',
    title:  'Vive mejores planes',
    body:   'Sero se encarga de todo, tú solo disfruta.',
    bubble: 'bg-butter',
    accent: 'text-[#8A6A1A]',
  },
];

export function StepCard({ step }: { step: Step }) {
  return (
    <div className="snap-start shrink-0 w-[80vw] max-w-[300px] sm:w-auto sm:max-w-none rounded-3xl p-7 bg-white border border-ink/8 shadow-sm transition-transform hover:-translate-y-1">
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

export function ConnectorArrow({ side }: { side: 'left' | 'right' }) {
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

/**
 * The full process grid (mobile carousel + desktop 3-column layout).
 * Self-contained — drop it anywhere with reasonable horizontal padding.
 */
export function ProcessSteps() {
  return (
    <>
      {/* Mobile: swipe-carousel */}
      <div className="sm:hidden px-6 overflow-x-auto snap-x snap-mandatory scroll-smooth flex gap-4 pb-4">
        {PROCESS_STEPS.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}
      </div>
      <p className="sm:hidden mt-3 text-center text-ink/25 text-xs tracking-wide">
        desliza →
      </p>

      {/* Desktop: 3 columns with hand-drawn arrows between */}
      <div className="hidden sm:block max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-6 relative">
          {PROCESS_STEPS.map((step) => (
            <StepCard key={step.num} step={step} />
          ))}
          <ConnectorArrow side="left" />
          <ConnectorArrow side="right" />
        </div>
      </div>
    </>
  );
}
