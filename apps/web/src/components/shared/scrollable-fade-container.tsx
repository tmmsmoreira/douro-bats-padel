'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollableFadeContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Width of the fade effect in pixels
   * @default 40
   */
  fadeWidth?: number;
  /**
   * Whether to show fade on the left edge
   * @default true
   */
  showLeftFade?: boolean;
  /**
   * Whether to show fade on the right edge
   * @default true
   */
  showRightFade?: boolean;
}

/**
 * A container that adds fade effects to the edges of horizontally scrollable content.
 * Automatically detects scroll position and shows/hides fades accordingly.
 *
 * @example
 * ```tsx
 * <ScrollableFadeContainer>
 *   <div className="flex gap-2">
 *     <Button>Filter 1</Button>
 *     <Button>Filter 2</Button>
 *     <Button>Filter 3</Button>
 *   </div>
 * </ScrollableFadeContainer>
 * ```
 */
export function ScrollableFadeContainer({
  children,
  className,
  fadeWidth = 40,
  showLeftFade = true,
  showRightFade = true,
}: ScrollableFadeContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [leftFadeProgress, setLeftFadeProgress] = useState(0);
  const [rightFadeProgress, setRightFadeProgress] = useState(1);

  const updateShadows = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const isScrollable = scrollWidth > clientWidth;

    // Add small threshold to account for rounding errors
    const threshold = 2;
    const isAtStart = scrollLeft <= threshold;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - threshold;

    // Calculate fade progress (0 to 1) based on scroll position
    const maxScroll = scrollWidth - clientWidth;
    const fadeDistance = fadeWidth; // Distance over which to fade

    // Left fade: 0 at start, 1 when scrolled fadeDistance pixels
    const leftProgress = isScrollable ? Math.min(scrollLeft / fadeDistance, 1) : 0;

    // Right fade: 1 at start, 0 when within fadeDistance of the end
    const distanceFromEnd = maxScroll - scrollLeft;
    const rightProgress = isScrollable ? Math.min(distanceFromEnd / fadeDistance, 1) : 0;

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('ScrollableFade:', {
        isScrollable,
        scrollLeft: Math.round(scrollLeft),
        scrollWidth,
        clientWidth,
        maxScroll,
        isAtStart,
        isAtEnd,
        leftProgress: leftProgress.toFixed(2),
        rightProgress: rightProgress.toFixed(2),
      });
    }

    // Update progress states
    setLeftFadeProgress(leftProgress);
    setRightFadeProgress(rightProgress);
  }, [fadeWidth]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Initial check with small delay to ensure DOM is ready
    const initialCheck = setTimeout(updateShadows, 0);

    // Handle horizontal scrolling with mouse wheel (only when hovering)
    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll if content is scrollable
      const { scrollWidth, clientWidth } = element;
      if (scrollWidth <= clientWidth) return;

      // Check if mouse is over the element
      const rect = element.getBoundingClientRect();
      const isMouseOver =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isMouseOver) return;

      // Prevent default vertical scroll
      e.preventDefault();

      // Scroll horizontally using deltaY (vertical wheel movement)
      element.scrollLeft += e.deltaY;

      // Manually trigger shadow update for immediate feedback
      updateShadows();
    };

    // Update on scroll
    element.addEventListener('scroll', updateShadows);
    element.addEventListener('wheel', handleWheel, { passive: false });

    // Update on resize
    const resizeObserver = new ResizeObserver(updateShadows);
    resizeObserver.observe(element);

    return () => {
      clearTimeout(initialCheck);
      element.removeEventListener('scroll', updateShadows);
      element.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
    };
  }, [updateShadows]);

  // Re-check when children change
  useEffect(() => {
    updateShadows();
  }, [children, updateShadows]);

  return (
    <div className="relative overflow-hidden">
      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn('overflow-x-auto scrollbar-hide', className)}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>

      {/* Left fade overlay - opacity follows scroll position */}
      {showLeftFade && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none bg-background"
          style={{
            left: '-1px',
            width: `${fadeWidth + 1}px`,
            opacity: leftFadeProgress,
            maskImage: `linear-gradient(to right, black 0%, black 5px, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to right, black 0%, black 5px, transparent 100%)`,
          }}
        />
      )}

      {/* Right fade overlay - opacity follows scroll position */}
      {showRightFade && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none bg-background"
          style={{
            right: '-1px',
            width: `${fadeWidth + 1}px`,
            opacity: rightFadeProgress,
            maskImage: `linear-gradient(to left, black 0%, black 5px, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to left, black 0%, black 5px, transparent 100%)`,
          }}
        />
      )}
    </div>
  );
}
