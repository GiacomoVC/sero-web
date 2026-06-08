import { Confetti } from '@/components/ui/Confetti';
import { Highlight } from '@/components/ui/Highlight';
import { ProcessSteps } from './ProcessSteps';

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

      <div className="relative z-10">
        <ProcessSteps />
      </div>
    </section>
  );
}
