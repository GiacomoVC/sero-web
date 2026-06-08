import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Confetti } from '@/components/ui/Confetti';
import { StickerNote } from '@/components/ui/StickerNote';
import { Highlight } from '@/components/ui/Highlight';
import { Quiz } from '@/components/quiz/Quiz';
import { ProcessSteps } from '@/components/landing/ProcessSteps';
import { firstNameFromSlug } from '@/lib/humanize';

export const dynamic = 'force-dynamic';

export default function ReferralPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const friendName = firstNameFromSlug(params.slug);
  const startQuiz = searchParams.start === '1';

  if (startQuiz) {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <Quiz referredBy={params.slug} />
      </Suspense>
    );
  }

  return (
    <main className="relative h-[100svh] flex flex-col items-center px-4 text-center bg-cream overflow-hidden">
      <Confetti density="dense" />

      {/* Floating sticker — desktop only */}
      <div className="hidden sm:block absolute top-24 right-[8%] z-10">
        <StickerNote color="butter" tilt={-6} arrow="down-left">
          te están<br />esperando →
        </StickerNote>
      </div>

      {/* Top: logo + intro */}
      <div className="relative z-10 flex flex-col items-center pt-6 sm:pt-16 fade-up">
        <Logo width={160} className="sm:!w-[220px]" priority />
        <p className="mt-5 sm:mt-8 text-ink/60 text-xs sm:text-sm uppercase tracking-[0.2em]">
          Te invitó
        </p>
        <h1 className="mt-1 sm:mt-2 text-3xl sm:text-5xl font-black tracking-tight">
          <Highlight variant="underline" color="coral">{friendName}</Highlight>
        </h1>
      </div>

      {/* Middle: process steps — auto-fills available vertical space */}
      <div className="relative z-10 w-full my-auto fade-up">
        <ProcessSteps />
      </div>

      {/* Bottom: CTAs */}
      <div className="relative z-10 flex flex-col items-center pb-6 sm:pb-12 fade-up">
        <Link
          href={`/${params.slug}?start=1`}
          className="btn-primary text-base sm:text-lg"
        >
          Empezar
        </Link>
        <Link
          href={`/?ref=${encodeURIComponent(params.slug)}`}
          className="btn-ghost mt-2 text-sm"
        >
          Conocer Sero
        </Link>
      </div>
    </main>
  );
}
