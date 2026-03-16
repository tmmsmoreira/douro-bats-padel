'use client';

import * as React from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook to detect if the user is on a mobile device.
 * Checks both viewport width AND device type (via User Agent and touch capability).
 *
 * Detection criteria:
 * - Viewport width < 768px (Tailwind's `md` breakpoint), OR
 * - Device is a mobile/tablet device (detected via User Agent), OR
 * - Device has touch capability with small screen
 *
 * @returns true if on a mobile device, false otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileView /> : <DesktopView />}
 *   </div>
 * );
 * ```
 */
export function useIsMobile() {
  const isNarrowViewport = useMediaQuery('(max-width: 767px)');
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);

  React.useEffect(() => {
    // Check if the device is a mobile/tablet device
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
        userAgent
      );

    // Check if device has touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Consider it mobile if:
    // 1. User agent indicates mobile/tablet device, OR
    // 2. Has touch capability AND narrow viewport
    setIsMobileDevice(isMobileUA || (hasTouch && isNarrowViewport));
  }, [isNarrowViewport]);

  // Return true if either narrow viewport OR mobile device
  return isNarrowViewport || isMobileDevice;
}
