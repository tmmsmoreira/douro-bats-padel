/**
 * Example demonstrating all advanced mobile features (Phase 2)
 *
 * Features shown:
 * - Pull-to-refresh with haptic feedback
 * - Bottom sheet with swipe-to-dismiss
 * - Swipe-to-go-back
 * - Skeleton loading states
 * - Native-style toasts
 * - Long-press gestures
 */

'use client';

import { useState } from 'react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useSwipeBack } from '@/hooks/use-swipe-back';
import { useToastNative } from '@/hooks/use-toast-native';
import { useLongPress } from '@/hooks/use-long-press';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ToastNative } from '@/components/ui/toast-native';
import { Button } from '@/components/ui/button';
import { SkeletonCard, SkeletonGameNightCard, SkeletonPlayerCard } from '@/components/ui/skeleton';

export function AdvancedMobileFeaturesDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  // Pull-to-refresh with haptic feedback
  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
  });

  // Swipe-to-go-back
  const { isSwiping, progress } = useSwipeBack({
    enabled: true,
  });

  // Native toasts
  const { toast, toastState, closeToast } = useToastNative();

  // Long press for context menu
  const { isLongPressing, handlers } = useLongPress({
    onLongPress: () => {
      setContextMenuOpen(true);
      toast.info('Context menu opened!');
    },
    onClick: () => {
      toast.info('Regular click!');
    },
  });

  const handleLoadData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success('Data loaded successfully!');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        opacity: isSwiping ? 1 - progress * 0.2 : 1,
        transform: isSwiping ? `translateX(${progress * 20}px)` : 'none',
        transition: isSwiping ? 'none' : 'all 0.2s',
      }}
    >
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 flex justify-center pt-4 safe-top z-50"
          style={{
            transform: `translateY(${pullDistance}px)`,
          }}
        >
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="safe-top bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">Advanced Mobile Features</h1>
        <p className="text-sm opacity-90 mt-1">Try all the gestures!</p>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Instructions */}
        <div className="card-native p-6 space-y-3">
          <h2 className="text-lg font-semibold">Try These Gestures:</h2>
          <ul className="space-y-2 text-sm">
            <li>• Pull down from top to refresh</li>
            <li>• Swipe from left edge to go back</li>
            <li>• Long press the card below for context menu</li>
            <li>• Tap buttons for haptic feedback</li>
            <li>• Swipe down the bottom sheet to dismiss</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button haptic animate onClick={handleLoadData} className="touch-target">
            Load Data
          </Button>

          <Button
            haptic
            animate
            variant="secondary"
            onClick={() => setShowBottomSheet(true)}
            className="touch-target"
          >
            Open Sheet
          </Button>

          <Button
            haptic
            animate
            variant="outline"
            onClick={() => toast.success('Success toast!')}
            className="touch-target"
          >
            Success Toast
          </Button>

          <Button
            haptic
            animate
            variant="destructive"
            onClick={() => toast.error('Error toast!')}
            className="touch-target"
          >
            Error Toast
          </Button>
        </div>

        {/* Long-press demo card */}
        <div
          {...handlers}
          className="card-native p-6 space-y-3 cursor-pointer select-none"
          style={{
            opacity: isLongPressing ? 0.7 : 1,
            transform: isLongPressing ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.1s',
          }}
        >
          <h3 className="text-lg font-semibold">Long Press Me!</h3>
          <p className="text-sm text-muted-foreground">
            Press and hold this card to see the context menu, or tap for a regular click.
          </p>
        </div>

        {/* Loading states demo */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Loading States:</h2>

          {isLoading ? (
            <>
              <SkeletonGameNightCard />
              <SkeletonPlayerCard />
              <SkeletonCard />
            </>
          ) : (
            <div className="card-native p-6">
              <p className="text-center text-muted-foreground">
                Click "Load Data" to see skeleton loaders
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Bottom Sheet"
        description="Swipe down to dismiss"
      >
        <div className="space-y-4 pb-8">
          <p>This is a bottom sheet with swipe-to-dismiss functionality.</p>
          <p>Try swiping down on the sheet or the drag handle to close it.</p>

          <div className="space-y-2 pt-4">
            <Button
              haptic
              animate
              onClick={() => {
                toast.info('Button clicked in bottom sheet!');
              }}
              className="w-full touch-target"
            >
              Action Button
            </Button>

            <Button
              haptic
              animate
              variant="outline"
              onClick={() => setShowBottomSheet(false)}
              className="w-full touch-target"
            >
              Close
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Toast */}
      <ToastNative
        isOpen={toastState.isOpen}
        onClose={closeToast}
        message={toastState.message}
        type={toastState.type}
      />
    </div>
  );
}
