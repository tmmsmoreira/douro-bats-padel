/**
 * Standard animation variants for consistent motion across the application.
 * All animations use Framer Motion (motion/react).
 *
 * @example
 * ```tsx
 * import { ANIMATION_VARIANTS } from '@/lib/animations';
 *
 * <motion.div {...ANIMATION_VARIANTS.fadeIn}>
 *   Content
 * </motion.div>
 * ```
 */

import type { Variants } from 'motion/react';

/**
 * Simple fade in/out animation
 * Duration: 300ms
 * Use for: Page transitions, simple content reveals
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1] as const },
};

/**
 * Fade in/out with scale effect
 * Duration: 300ms
 * Use for: Loading states, empty states, modals
 */
export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1] as const },
};

/**
 * Slide up with fade in
 * Duration: 400ms
 * Use for: Individual cards, form fields
 */
export const slideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1] as const },
};

/**
 * Slide down with fade in
 * Duration: 400ms
 * Use for: Dropdowns, notifications from top
 */
export const slideDown = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1] as const },
};

/**
 * Container variant for staggered children animations
 * Use with staggerItem variant
 * Stagger delay: 100ms between children
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * Item variant for staggered animations
 * Use with staggerContainer variant
 * Duration: 300ms per item
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1] },
  },
};

/**
 * Hover effect for interactive cards
 * Slightly lifts the card
 */
export const cardHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.2 },
};

/**
 * Page wrapper animation
 * Fades in the entire page content
 * Duration: 400ms with slight delay
 */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.165, 0.84, 0.44, 1] as const },
};

/**
 * Modal/Dialog animation
 * Backdrop fades in, content slides up
 */
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalContent = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.95 },
  transition: { duration: 0.25, ease: [0.165, 0.84, 0.44, 1] as const },
};

/**
 * Combined animation variants object for easy access
 */
export const ANIMATION_VARIANTS = {
  fadeIn,
  fadeInScale,
  slideUp,
  slideDown,
  staggerContainer,
  staggerItem,
  cardHover,
  pageTransition,
  modalBackdrop,
  modalContent,
} as const;
