import { SectionHero }    from '@/components/landing/SectionHero';
import { SectionMarquee } from '@/components/landing/SectionMarquee';
import { SectionHow }     from '@/components/landing/SectionHow';
import { SectionFinal }   from '@/components/landing/SectionFinal';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SectionHero />
      <SectionMarquee />
      <SectionHow />
      <SectionFinal />
    </main>
  );
}
