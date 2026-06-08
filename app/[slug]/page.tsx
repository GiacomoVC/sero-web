import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Confetti } from '@/components/ui/Confetti';
import { StickerNote } from '@/components/ui/StickerNote';
import { Highlight } from '@/components/ui/Highlight';
import { Quiz } from '@/components/quiz/Quiz';
import { ProcessSteps } from '@/components/landing/ProcessSteps';
import { humanizeSlug } from '@/lib/humanize';

export const dynamic = 'force-dynamic';

export default function ReferralPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const friendName = humanizeSlug(params.slug);
  const startQuiz = searchParams.start === '1';

  if (startQuiz) {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <Quiz referredBy={params.slug} />
      </Suspense>
    );
  }

  return (
    <main className="relative min-h-[100svh] flex flex-col items-center px-6 text-center bg-cream overflow-hidden py-16 sm:py-20">
      <Confetti density="dense" />

      {/* Floating sticker */}
      <div className="hidden sm:block absolute top-24 right-[8%] z-10">
        <StickerNote color="butter" tilt={-6} arrow="down-left">
          te están<br />esperando →
        </StickerNote>
      </div>

      <div className="relative z-10 fade-up">
        <Logo width={220} priority />
      </div>

      <p className="relative z-10 mt-8 text-ink/60 text-sm uppercase tracking-[0.2em] fade-up">
        Te invitó
      </p>
      <h1 className="relative z-10 mt-2 text-4xl sm:text-5xl font-black tracking-tight fade-up">
        <Highlight variant="underline" color="coral">{friendName}</Highlight>
      </h1>

      {/* Process steps (same as landing's section 3) */}
      <div className="relative z-10 w-full mt-12 fade-up">
        <ProcessSteps />
      </div>

      <Link
        href={`/${params.slug}?start=1`}
        className="relative z-10 btn-primary mt-10 text-lg fade-up"
      >
        Empezar
      </Link>

      <Link
        href={`/?ref=${encodeURIComponent(params.slug)}`}
        className="relative z-10 btn-ghost mt-3 text-sm fade-up"
      >
        Conocer Sero
      </Link>
    </main>
  );
}
