'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';

interface BottomSheetProps {
  /**
   * Whether the bottom sheet is open
   */
  isOpen: boolean;
  /**
   * Callback when the bottom sheet should close
   */
  onClose: () => void;
  /**
   * Content to display in the bottom sheet
   */
  children: React.ReactNode;
  /**
   * Optional title for the bottom sheet
   */
  title?: string;
  /**
   * Optional description for the bottom sheet
   */
  description?: string;
  /**
   * Whether to show the drag handle
   * @default true
   */
  showHandle?: boolean;
  /**
   * Whether the bottom sheet can be dismissed by swiping down
   * @default true
   */
  dismissible?: boolean;
  /**
   * Whether clicking the backdrop closes the sheet
   * @default true
   */
  closeOnBackdropClick?: boolean;
  /**
   * Custom className for the content container
   */
  className?: string;
  /**
   * Snap points as percentages of viewport height
   * @default [0.9]
   */
  snapPoints?: number[];
}

/**
 * Bottom Sheet component with swipe-to-dismiss functionality
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Settings"
 * >
 *   <div>Content here</div>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  description,
  showHandle = true,
  dismissible = true,
  closeOnBackdropClick = true,
  className,
  snapPoints = [0.9],
}: BottomSheetProps) {
  const haptic = useHaptic();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);
  const hasTriggeredHaptic = useRef(false);

  // Reset haptic trigger when sheet opens
  useEffect(() => {
    if (isOpen) {
      hasTriggeredHaptic.current = false;
      haptic.light();
    }
  }, [isOpen, haptic]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.velocity.y > 500 || info.offset.y > 150;

    if (shouldClose && dismissible) {
      haptic.medium();
      onClose();
    } else {
      // Snap back
      y.set(0);
    }
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only allow dragging down
    if (info.offset.y < 0) {
      y.set(0);
      return;
    }

    // Trigger haptic when user has dragged enough to dismiss
    if (info.offset.y > 150 && !hasTriggeredHaptic.current && dismissible) {
      haptic.light();
      hasTriggeredHaptic.current = true;
    }
  };

  const maxHeight = `${snapPoints[0] * 100}vh`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-100"
            onClick={closeOnBackdropClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag={dismissible ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ y, opacity }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-101',
              'bg-card rounded-t-3xl shadow-2xl',
              'safe-bottom',
              'flex flex-col'
            )}
          >
            {/* Drag Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || description) && (
              <div className="px-6 pb-4">
                {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
            )}

            {/* Content */}
            <div
              className={cn('overflow-y-auto px-6 pb-6', className)}
              style={{
                maxHeight,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
