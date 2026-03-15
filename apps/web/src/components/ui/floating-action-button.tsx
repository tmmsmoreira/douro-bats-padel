'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';

const fabVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium shadow-lg transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20',
        outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-14 w-14 [&_svg:not([class*="size-"])]:size-6',
        sm: 'h-12 w-12 [&_svg:not([class*="size-"])]:size-5',
        lg: 'h-16 w-16 [&_svg:not([class*="size-"])]:size-7',
        extended: 'h-14 px-6 gap-2 [&_svg:not([class*="size-"])]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof fabVariants> {
  /**
   * Position of the FAB on screen
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left';
  /**
   * Whether to enable haptic feedback on press
   * @default true
   */
  haptic?: boolean;
  /**
   * Whether to show the FAB
   * @default true
   */
  show?: boolean;
  /**
   * Label for extended FAB
   */
  label?: string;
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6 safe-bottom safe-right',
  'bottom-left': 'bottom-6 left-6 safe-bottom safe-left',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 safe-bottom',
  'top-right': 'top-6 right-6 safe-top safe-right',
  'top-left': 'top-6 left-6 safe-top safe-left',
};

/**
 * Floating Action Button (FAB) component
 * Material Design pattern for primary actions
 *
 * @example
 * ```tsx
 * <FloatingActionButton
 *   onClick={() => createNew()}
 *   position="bottom-right"
 * >
 *   <PlusIcon />
 * </FloatingActionButton>
 * ```
 *
 * @example Extended FAB
 * ```tsx
 * <FloatingActionButton
 *   onClick={() => createNew()}
 *   size="extended"
 *   label="Create New"
 * >
 *   <PlusIcon />
 * </FloatingActionButton>
 * ```
 */
export function FloatingActionButton({
  className,
  variant = 'default',
  size = 'default',
  position = 'bottom-right',
  haptic = true,
  show = true,
  label,
  children,
  onClick,
  ...props
}: FloatingActionButtonProps) {
  const hapticFeedback = useHaptic();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !props.disabled) {
        hapticFeedback.medium();
      }
      onClick?.(e);
    },
    [haptic, props.disabled, hapticFeedback, onClick]
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
          className={cn('fixed z-50', positionClasses[position])}
        >
          <button
            className={cn(
              'no-tap-highlight touch-target',
              fabVariants({ variant, size }),
              className
            )}
            onClick={handleClick}
            {...props}
          >
            {children}
            {label && size === 'extended' && <span className="font-semibold">{label}</span>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
