import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Quiz } from '@/components/quiz/Quiz';
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
    <main className="min-h-[100svh] flex flex-col items-center justify-center px-6 text-center bg-cream">
      <div className="fade-up">
        <Logo width={220} priority />
      </div>

      <p className="mt-8 text-ink/60 text-sm uppercase tracking-[0.2em] fade-up">
        Te invitó
      </p>
      <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight fade-up">
        {friendName}
      </h1>

      <p className="mt-8 max-w-xl text-lg sm:text-xl text-ink/80 fade-up">
        Cuéntanos lo que amas y armemos planes con tus amigos —{' '}
        <span className="text-plum font-semibold">mismos gustos, mejores planes.</span>
      </p>

      <Link
        href={`/${params.slug}?start=1`}
        className="btn-primary mt-10 text-lg fade-up"
      >
        Empezar
      </Link>

      <Link
        href="/"
        className="btn-ghost mt-3 text-sm fade-up"
      >
        Conocer Sero
      </Link>
    </main>
  );
}
