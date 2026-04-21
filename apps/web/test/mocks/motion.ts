/**
 * Stub the `motion` package in tests.
 *
 * Motion ships as ESM-only and its animation APIs add no test value — we want
 * to verify DOM structure and props, not transforms. Each animated element type
 * resolves to the native DOM element, and any motion-specific prop (animate,
 * initial, whileHover, etc.) is silently stripped so it doesn't show up as an
 * "unknown DOM prop" warning.
 */
import * as React from 'react';

const MOTION_PROPS = new Set([
  'animate',
  'initial',
  'exit',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'whileDrag',
  'variants',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'dragTransition',
  'custom',
  'onAnimationStart',
  'onAnimationComplete',
  'onUpdate',
  'onViewportEnter',
  'onViewportLeave',
]);

type AnyObj = Record<string, unknown>;

const stripMotionProps = (props: AnyObj): AnyObj => {
  const out: AnyObj = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROPS.has(key)) out[key] = value;
  }
  return out;
};

type IntrinsicTag = keyof JSX.IntrinsicElements;

const makeMotionComponent = (tag: IntrinsicTag) =>
  React.forwardRef<unknown, AnyObj>(({ children, ...rest }, ref) =>
    React.createElement(
      tag as string,
      { ...stripMotionProps(rest), ref },
      children as React.ReactNode
    )
  );

export const motion: Record<string, ReturnType<typeof makeMotionComponent>> = new Proxy(
  {},
  {
    get: (_target, tag: string) => makeMotionComponent(tag as IntrinsicTag),
  }
) as any;

export const AnimatePresence: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const useAnimationControls = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

export const useInView = () => true;
export const useReducedMotion = () => false;
export const useMotionValue = (initial: unknown) => ({ get: () => initial, set: jest.fn() });
export const useAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

// lucide-animated and other consumers import these easing helpers; return a
// no-op function so any call resolves without throwing in tests.
export const cubicBezier = () => (t: number) => t;
export const easeIn = (t: number) => t;
export const easeOut = (t: number) => t;
export const easeInOut = (t: number) => t;
export const circIn = (t: number) => t;
export const circOut = (t: number) => t;
export const linear = (t: number) => t;
export const spring = () => ({ stiffness: 1, damping: 1, mass: 1 });
