import { Suspense } from 'react';
import { Quiz } from '@/components/quiz/Quiz';

export const dynamic = 'force-dynamic';

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Quiz />
    </Suspense>
  );
}
