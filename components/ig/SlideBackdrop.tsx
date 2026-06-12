'use client';

import { Confetti } from '@/components/ui/Confetti';
import { Logo } from '@/components/ui/Logo';

/**
 * Standard cream + confetti backdrop with the small "sero" wordmark in the
 * top-left, used as the base layer for most IG slides.
 */
export function SlideBackdrop({
  children,
  density = 'normal',
  showLogo = true,
}: {
  children: React.ReactNode;
  density?: 'light' | 'normal' | 'dense';
  showLogo?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#FAF8F5' }}>
      <Confetti density={density} />
      {showLogo && (
        <div className="absolute top-12 left-12 z-10">
          <Logo width={150} noAnim />
        </div>
      )}
      {children}
    </div>
  );
}
