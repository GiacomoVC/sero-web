import { SectionHero }    from '@/components/landing/SectionHero';
import { SectionMarquee } from '@/components/landing/SectionMarquee';
import { SectionHow }     from '@/components/landing/SectionHow';
import { SectionFinal }   from '@/components/landing/SectionFinal';

export default function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Referral slug propagated from /[slug]/ → "Conocer Sero" → /?ref=<slug>
  const refRaw = searchParams.ref;
  const refSlug = Array.isArray(refRaw) ? refRaw[0] : refRaw;

  return (
    <main className="min-h-screen">
      <SectionHero refSlug={refSlug} />
      <SectionMarquee />
      <SectionHow />
      <SectionFinal refSlug={refSlug} />
    </main>
  );
}
