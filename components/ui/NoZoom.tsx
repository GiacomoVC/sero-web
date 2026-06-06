'use client';

import { useEffect } from 'react';

/**
 * iOS Safari ignores `user-scalable=no` since iOS 10.
 * This component blocks pinch-zoom and double-tap-zoom via JS events.
 * Must be rendered inside <body> (i.e. in a layout or page).
 */
export function NoZoom() {
  useEffect(() => {
    // Block pinch-zoom (two-finger spread)
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    // Block gesture events (Safari-specific API for pinch/rotate)
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    // Block double-tap zoom
    let lastTap = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTap < 300) e.preventDefault();
      lastTap = now;
    };

    document.addEventListener('touchmove', preventMultiTouch, { passive: false });
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('touchend', preventDoubleTap, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventMultiTouch);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('touchend', preventDoubleTap);
    };
  }, []);

  return null;
}
