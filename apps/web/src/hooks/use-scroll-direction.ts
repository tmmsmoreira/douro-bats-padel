'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll direction and hide/show navbar accordingly
 *
 * @param threshold - Minimum scroll distance to trigger hide/show (default: 10px)
 * @returns boolean - true if navbar should be visible, false if hidden
 */
export function useScrollDirection(threshold = 10) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show navbar at the top of the page
      if (scrollY < 10) {
        setIsVisible(true);
        setLastScrollY(scrollY);
        ticking = false;
        return;
      }

      // Only update if scroll distance exceeds threshold
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      // Show navbar when scrolling up, hide when scrolling down
      setIsVisible(scrollY < lastScrollY);
      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [lastScrollY, threshold]);

  return isVisible;
}
